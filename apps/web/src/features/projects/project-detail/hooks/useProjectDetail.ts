'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ExtractedData, Language, Project, VoiceRecord } from '@/types';

import { useHaptics } from '@/hooks/useHaptics';
import { api } from '@/services/api';
import { offlineService } from '@/services/offline';

import {
  EMPTY_DRAFT,
  CaptureFlow,
  EditableDraft,
  PendingConfirmation,
  ProjectWithRecords,
  StatusNotice,
} from '../project-detail.types';
import {
  MAX_POLL_ATTEMPTS,
  POLL_INTERVAL_MS,
  buildUpdatedContent,
  getEditableDraft,
  hasFinishedProcessing,
  isNetworkUploadError,
  sleep,
  updateExtractedItem,
} from '../project-detail.utils';

export function useProjectDetail(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [projectLoadError, setProjectLoadError] = useState<string | null>(null);
  const [records, setRecords] = useState<VoiceRecord[]>([]);
  const [pendingRecordIds, setPendingRecordIds] = useState<string[]>([]);
  const [queuedCount, setQueuedCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncingQueue, setIsSyncingQueue] = useState(false);
  const [statusNotice, setStatusNotice] = useState<StatusNotice | null>(null);
  const [latestCapture, setLatestCapture] = useState<CaptureFlow | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [expandedHistoryRecordIds, setExpandedHistoryRecordIds] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, EditableDraft>>({});
  const [savingItemIds, setSavingItemIds] = useState<string[]>([]);
  const isSyncingQueueRef = useRef(false);
  const { vibrateConfirm } = useHaptics();

  const refreshQueuedCount = useCallback(async () => {
    try {
      const queue = await offlineService.getQueue();
      setQueuedCount(queue.length);
      return queue;
    } catch (err) {
      console.error('Failed to read offline queue', err);
      return [];
    }
  }, []);

  const loadProject = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setProjectLoadError(null);
    }

    try {
      const nextProject = await api.fetch<ProjectWithRecords>(`/projects/${projectId}`);
      setProject(nextProject);
      setRecords(nextProject.records || []);
      setProjectLoadError(null);
      return nextProject;
    } catch (err) {
      console.error(err);
      if (!options?.silent) {
        setProjectLoadError(err instanceof Error ? err.message : 'Could not load this site right now.');
      }
      return null;
    } finally {
      if (!options?.silent) {
        setIsLoadingProject(false);
      }
    }
  }, [projectId]);

  useEffect(() => {
    setIsOffline(typeof navigator !== 'undefined' ? !navigator.onLine : false);
    setIsLoadingProject(true);
    void loadProject();
    void refreshQueuedCount();
  }, [loadProject, refreshQueuedCount]);

  const pollForProcessedRecord = useCallback(async (recordId: string) => {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
      await sleep(POLL_INTERVAL_MS);

      const nextProject = await loadProject({ silent: true });
      const nextRecord = nextProject?.records?.find((record) => record.id === recordId);

      if (hasFinishedProcessing(nextRecord)) {
        setPendingRecordIds((current) => current.filter((currentId) => currentId !== recordId));
        setLatestCapture((current) => (
          current?.recordId === recordId
            ? {
                phase: 'processed',
                startedAt: current.startedAt,
                recordId,
              }
            : current
        ));
        return;
      }
    }

    setPendingRecordIds((current) => current.filter((currentId) => currentId !== recordId));
    setLatestCapture((current) => (
      current?.recordId === recordId
        ? {
            ...current,
            phase: 'processing',
          }
        : current
    ));
    setStatusNotice({
      tone: 'info',
      message: 'The latest recording is still processing in the background. It should appear shortly.',
    });
  }, [loadProject]);

  const uploadRecord = useCallback(async (targetProjectId: string, blob: Blob, language: Language = 'en') => {
    const record = await api.uploadAudio<VoiceRecord>(targetProjectId, blob, language);

    if (targetProjectId === projectId) {
      setRecords((current) => [record, ...current.filter((currentRecord) => currentRecord.id !== record.id)]);
      setPendingRecordIds((current) => [record.id, ...current.filter((currentId) => currentId !== record.id)]);
      void pollForProcessedRecord(record.id);
    }

    return record;
  }, [pollForProcessedRecord, projectId]);

  const queueRecordLocally = useCallback(async (targetProjectId: string, blob: Blob, language: Language = 'en') => {
    await offlineService.queueRecord(targetProjectId, blob, language);
    const queue = await refreshQueuedCount();
    setStatusNotice({
      tone: 'warning',
      message: queue.length === 1
        ? 'Recording saved offline. It will sync when the connection returns.'
        : `Recording saved offline. ${queue.length} items are waiting to sync.`,
    });
  }, [refreshQueuedCount]);

  const syncQueuedRecords = useCallback(async () => {
    if (isSyncingQueueRef.current || typeof navigator === 'undefined' || !navigator.onLine) {
      return;
    }

    isSyncingQueueRef.current = true;
    setIsSyncingQueue(true);

    try {
      const queuedItems = (await offlineService.getQueue())
        .slice()
        .sort((left, right) => left.timestamp.localeCompare(right.timestamp));

      if (queuedItems.length === 0) {
        setQueuedCount(0);
        return;
      }

      let syncedCount = 0;
      let syncedForCurrentProject = 0;

      for (const queuedItem of queuedItems) {
        try {
          await uploadRecord(
            queuedItem.projectId,
            queuedItem.blob,
            queuedItem.language || 'en',
          );

          if (typeof queuedItem.id === 'number') {
            await offlineService.clearItem(queuedItem.id);
          }

          syncedCount += 1;
          if (queuedItem.projectId === projectId) {
            syncedForCurrentProject += 1;
          }
        } catch (err) {
          console.error('Failed to sync offline note', err);
          setStatusNotice({
            tone: 'error',
            message: 'Some saved notes could not sync yet. KOEN will keep trying when the connection improves.',
          });
          break;
        }
      }

      await refreshQueuedCount();

      if (syncedCount > 0) {
        setStatusNotice({
          tone: 'success',
          message: syncedForCurrentProject > 0
            ? `Synced ${syncedForCurrentProject} saved note${syncedForCurrentProject === 1 ? '' : 's'} for this site.`
            : `Synced ${syncedCount} offline note${syncedCount === 1 ? '' : 's'}.`,
        });
      }
    } finally {
      isSyncingQueueRef.current = false;
      setIsSyncingQueue(false);
    }
  }, [projectId, refreshQueuedCount, uploadRecord]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      void syncQueuedRecords();
    };

    const handleOffline = () => {
      setIsOffline(true);
      setStatusNotice({
        tone: 'warning',
        message: 'Connection lost. New notes will be saved offline.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueuedRecords]);

  useEffect(() => {
    if (!isOffline) {
      void syncQueuedRecords();
    }
  }, [isOffline, syncQueuedRecords]);

  const handleVoiceFinish = useCallback(async (blob: Blob) => {
    const startedAt = new Date().toISOString();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setLatestCapture({
        phase: 'queued_offline',
        startedAt,
      });
      await queueRecordLocally(projectId, blob);
      return;
    }

    try {
      setLatestCapture({
        phase: 'uploading',
        startedAt,
      });

      const record = await uploadRecord(projectId, blob);
      setLatestCapture({
        phase: 'processing',
        startedAt,
        recordId: record.id,
      });
      setStatusNotice({
        tone: 'info',
        message: 'Recording sent. KOEN is turning it into site notes now.',
      });
    } catch (err) {
      console.error('Audio upload failed', err);

      if (isNetworkUploadError(err)) {
        setLatestCapture({
          phase: 'queued_offline',
          startedAt,
        });
        await queueRecordLocally(projectId, blob);
        return;
      }

      setLatestCapture({
        phase: 'error',
        startedAt,
        errorMessage: err instanceof Error ? err.message : 'Recording could not be uploaded right now.',
      });
      setStatusNotice({
        tone: 'error',
        message: 'Recording could not be uploaded right now. Please try again.',
      });
    }
  }, [projectId, queueRecordLocally, uploadRecord]);

  const sortedRecords = records
    .slice()
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  const pendingConfirmations = sortedRecords.flatMap<PendingConfirmation>((record) =>
    (record.extracted || [])
      .filter((item) => !item.confirmed)
      .map((item) => ({
        recordId: record.id,
        transcript: record.transcript,
        item,
      })),
  );

  const latestCaptureRecord = latestCapture?.recordId
    ? records.find((record) => record.id === latestCapture.recordId) ?? null
    : null;
  const latestStoredRecord = sortedRecords[0] ?? null;
  const primaryRecord = latestCapture ? latestCaptureRecord : latestStoredRecord;
  const primaryRecordConfirmations = primaryRecord
    ? pendingConfirmations.filter(({ recordId }) => recordId === primaryRecord.id)
    : [];
  const secondaryPendingConfirmations = primaryRecord
    ? pendingConfirmations.filter(({ recordId }) => recordId !== primaryRecord.id)
    : pendingConfirmations;
  const historyRecords = primaryRecord
    ? sortedRecords.filter((record) => record.id !== primaryRecord.id)
    : sortedRecords;
  const shouldShowStatusNotice = Boolean(
    statusNotice && (
      statusNotice.tone === 'success'
      || statusNotice.tone === 'error'
      || (!latestCapture && !(statusNotice.tone === 'warning' && (isOffline || isSyncingQueue || queuedCount > 0)))
    ),
  );

  const updateDraftValue = useCallback((itemId: string, field: keyof EditableDraft, value: string) => {
    setDrafts((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] || EMPTY_DRAFT),
        [field]: value,
      },
    }));
  }, []);

  const startEditing = useCallback((item: ExtractedData) => {
    setDrafts((current) => ({
      ...current,
      [item.id]: current[item.id] || getEditableDraft(item),
    }));
    setEditingItemId(item.id);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingItemId(null);
  }, []);

  const toggleHistoryRecord = useCallback((recordId: string) => {
    setExpandedHistoryRecordIds((current) => (
      current.includes(recordId)
        ? current.filter((currentId) => currentId !== recordId)
        : [...current, recordId]
    ));
  }, []);

  const saveConfirmation = useCallback(async (item: ExtractedData, options?: { useDraft?: boolean }) => {
    const payload = options?.useDraft
      ? { confirmed: true, content: buildUpdatedContent(item, drafts[item.id] || getEditableDraft(item)) }
      : { confirmed: true };

    setSavingItemIds((current) => [...current, item.id]);

    try {
      const updatedItem = await api.confirmExtractedItem<ExtractedData>(item.id, payload);
      setRecords((current) => updateExtractedItem(current, updatedItem));
      setEditingItemId((current) => (current === item.id ? null : current));
      vibrateConfirm();
    } catch (err) {
      console.error('Failed to confirm extracted item', err);
      setStatusNotice({
        tone: 'error',
        message: err instanceof Error ? err.message : 'Could not save this confirmation. Please try again.',
      });
    } finally {
      setSavingItemIds((current) => current.filter((currentId) => currentId !== item.id));
    }
  }, [drafts, vibrateConfirm]);

  const retryProjectLoad = useCallback(() => {
    setIsLoadingProject(true);
    void loadProject();
  }, [loadProject]);

  return {
    cancelEditing,
    categoryRecords: sortedRecords,
    drafts,
    editingItemId,
    expandedHistoryRecordIds,
    handleVoiceFinish,
    historyRecords,
    isLoadingProject,
    isOffline,
    isSyncingQueue,
    latestCapture,
    latestCaptureRecord,
    pendingRecordIds,
    primaryRecord,
    primaryRecordConfirmations,
    project,
    projectLoadError,
    queuedCount,
    retryProjectLoad,
    saveConfirmation,
    savingItemIds,
    secondaryPendingConfirmations,
    shouldShowStatusNotice,
    sortedRecords,
    startEditing,
    statusNotice,
    toggleHistoryRecord,
    updateDraftValue,
  };
}
