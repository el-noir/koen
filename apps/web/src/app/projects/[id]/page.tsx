'use client';

import React, { use, useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, MessageSquare, Briefcase, Package, Clock, Star, Info, ChevronLeft, LoaderCircle, Check, Pencil, Save, CloudOff, Wifi } from 'lucide-react';
import Link from 'next/link';
import { api } from '../../../services/api';
import { ExtractedData, Language, Project, VoiceRecord } from '@/types';
import { PushToTalkButton } from '../../../components/PushToTalkButton/PushToTalkButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useHaptics } from '../../../hooks/useHaptics';
import { offlineService } from '../../../services/offline';

type ProjectWithRecords = Project & { records?: VoiceRecord[] };
type PendingConfirmation = { recordId: string; transcript: string; item: ExtractedData };
type StatusNotice = {
  tone: 'info' | 'success' | 'warning' | 'error';
  message: string;
};
type EditableDraft = {
  description: string;
  text: string;
  location: string;
  quantity: string;
  unit: string;
  supplier: string;
  date: string;
  start: string;
  end: string;
  workers: string;
  notes: string;
};

const EMPTY_DRAFT: EditableDraft = {
  description: '',
  text: '',
  location: '',
  quantity: '',
  unit: '',
  supplier: '',
  date: '',
  start: '',
  end: '',
  workers: '',
  notes: '',
};

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 10;

const tabs = [
  { id: 'task', label: 'Tasks', icon: Briefcase },
  { id: 'material', label: 'Materials', icon: Package },
  { id: 'hours', label: 'Hours', icon: Clock },
  { id: 'event', label: 'Events', icon: Star },
  { id: 'note', label: 'Notes', icon: Info },
] as const;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasFinishedProcessing(record?: VoiceRecord | null) {
  if (!record) {
    return false;
  }

  if (record.processingStatus) {
    return record.processingStatus !== 'processing';
  }

  return record.transcript.trim().length > 0 || Boolean(record.extracted);
}

function formatExtractedContent(item: ExtractedData) {
  if (item.category === 'hours') {
    const content = item.content as {
      start?: string;
      end?: string;
      workers?: number;
      notes?: string;
    };

    const parts = [
      content.start && content.end ? `${content.start} -> ${content.end}` : '',
      typeof content.workers === 'number' ? `${content.workers} worker${content.workers === 1 ? '' : 's'}` : '',
      content.notes || '',
    ].filter(Boolean);

    return parts.join(' | ') || 'Hours recorded';
  }

  const content = item.content as {
    description?: string;
    text?: string;
  };

  return content.description || content.text || 'Recorded update';
}

function formatCategoryLabel(category: ExtractedData['category']) {
  switch (category) {
    case 'task':
      return 'Task';
    case 'material':
      return 'Material';
    case 'hours':
      return 'Hours';
    case 'event':
      return 'Event';
    case 'note':
      return 'Note';
    default:
      return category;
  }
}

function getProcessingLabel(record: VoiceRecord) {
  switch (record.processingStatus) {
    case 'needs_confirmation':
      return 'Needs Confirmation';
    case 'processed':
      return 'Processed';
    case 'processing':
    default:
      return 'Processing';
  }
}

function getProcessingBadgeClass(record: VoiceRecord) {
  switch (record.processingStatus) {
    case 'needs_confirmation':
      return 'border-yellow-500/40 bg-yellow-500/5 text-yellow-600';
    case 'processed':
      return 'border-emerald-500/40 bg-emerald-500/5 text-emerald-600';
    case 'processing':
    default:
      return 'border-blue-500/40 bg-blue-500/5 text-blue-600';
  }
}

function getEditableDraft(item: ExtractedData): EditableDraft {
  const content = item.content as unknown as Record<string, unknown>;

  return {
    description: typeof content.description === 'string' ? content.description : '',
    text: typeof content.text === 'string' ? content.text : '',
    location: typeof content.location === 'string' ? content.location : '',
    quantity: typeof content.quantity === 'number' ? String(content.quantity) : '',
    unit: typeof content.unit === 'string' ? content.unit : '',
    supplier: typeof content.supplier === 'string' ? content.supplier : '',
    date: typeof content.date === 'string' ? content.date : '',
    start: typeof content.start === 'string' ? content.start : '',
    end: typeof content.end === 'string' ? content.end : '',
    workers: typeof content.workers === 'number' ? String(content.workers) : '',
    notes: typeof content.notes === 'string' ? content.notes : '',
  };
}

function withOptionalString(value: string) {
  const nextValue = value.trim();
  return nextValue ? nextValue : undefined;
}

function buildUpdatedContent(item: ExtractedData, draft: EditableDraft) {
  switch (item.category) {
    case 'task':
      return {
        description: draft.description.trim(),
        location: withOptionalString(draft.location),
      };
    case 'material':
      return {
        description: draft.description.trim(),
        quantity: draft.quantity.trim() ? Number(draft.quantity) : undefined,
        unit: withOptionalString(draft.unit),
        supplier: withOptionalString(draft.supplier),
      };
    case 'hours':
      return {
        start: draft.start.trim(),
        end: draft.end.trim(),
        workers: draft.workers.trim() ? Number(draft.workers) : undefined,
        notes: withOptionalString(draft.notes),
      };
    case 'event':
      return {
        description: draft.description.trim(),
        date: withOptionalString(draft.date),
      };
    case 'note':
      return {
        text: draft.text.trim(),
      };
    default:
      return item.content;
  }
}

function updateExtractedItem(records: VoiceRecord[], nextItem: ExtractedData) {
  return records.map((record) => ({
    ...record,
    extracted: record.extracted?.map((item) => (
      item.id === nextItem.id ? nextItem : item
    )),
  }));
}

function isNetworkUploadError(error: unknown) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }

  if (error instanceof TypeError) {
    return true;
  }

  return error instanceof Error && /failed to fetch|network/i.test(error.message);
}

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [records, setRecords] = useState<VoiceRecord[]>([]);
  const [pendingRecordIds, setPendingRecordIds] = useState<string[]>([]);
  const [queuedCount, setQueuedCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncingQueue, setIsSyncingQueue] = useState(false);
  const [statusNotice, setStatusNotice] = useState<StatusNotice | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
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

  const loadProject = useCallback(async () => {
    try {
      const nextProject = await api.fetch<ProjectWithRecords>(`/projects/${id}`);
      setProject(nextProject);
      setRecords(nextProject.records || []);
      return nextProject;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [id]);

  useEffect(() => {
    setIsOffline(typeof navigator !== 'undefined' ? !navigator.onLine : false);
    void loadProject();
    void refreshQueuedCount();
  }, [loadProject, refreshQueuedCount]);

  const pollForProcessedRecord = useCallback(
    async (recordId: string) => {
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
        await sleep(POLL_INTERVAL_MS);

        const nextProject = await loadProject();
        const nextRecord = nextProject?.records?.find((record) => record.id === recordId);

        if (hasFinishedProcessing(nextRecord)) {
          setPendingRecordIds((current) => current.filter((currentId) => currentId !== recordId));
          return;
        }
      }

      setPendingRecordIds((current) => current.filter((currentId) => currentId !== recordId));
      setStatusNotice({
        tone: 'info',
        message: 'The latest recording is still processing in the background. It should appear shortly.',
      });
    },
    [loadProject],
  );

  const uploadRecord = useCallback(
    async (projectId: string, blob: Blob, language: Language = 'en') => {
      const record = await api.uploadAudio<VoiceRecord>(projectId, blob, language);

      if (projectId === id) {
        setRecords((current) => [record, ...current.filter((currentRecord) => currentRecord.id !== record.id)]);
        setPendingRecordIds((current) => [record.id, ...current.filter((currentId) => currentId !== record.id)]);
        void pollForProcessedRecord(record.id);
      }

      return record;
    },
    [id, pollForProcessedRecord],
  );

  const queueRecordLocally = useCallback(
    async (projectId: string, blob: Blob, language: Language = 'en') => {
      await offlineService.queueRecord(projectId, blob, language);
      const queue = await refreshQueuedCount();
      setStatusNotice({
        tone: 'warning',
        message: queue.length === 1
          ? 'Recording saved offline. It will sync when the connection returns.'
          : `Recording saved offline. ${queue.length} items are waiting to sync.`,
      });
    },
    [refreshQueuedCount],
  );

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
          if (queuedItem.projectId === id) {
            syncedForCurrentProject += 1;
          }
        } catch (err) {
          console.error('Failed to sync offline note', err);
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
  }, [id, refreshQueuedCount, uploadRecord]);

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

  const handleVoiceFinish = async (blob: Blob) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await queueRecordLocally(id, blob);
      return;
    }

    try {
      await uploadRecord(id, blob);
      setStatusNotice({
        tone: 'info',
        message: 'Recording sent. KOEN is turning it into site notes now.',
      });
    } catch (err) {
      console.error('Audio upload failed', err);

      if (isNetworkUploadError(err)) {
        await queueRecordLocally(id, blob);
        return;
      }

      setStatusNotice({
        tone: 'error',
        message: 'Recording could not be uploaded right now. Please try again.',
      });
    }
  };

  const pendingConfirmations = records.flatMap<PendingConfirmation>((record) =>
    (record.extracted || [])
      .filter((item) => !item.confirmed)
      .map((item) => ({
        recordId: record.id,
        transcript: record.transcript,
        item,
      })),
  );
  const recentRecords = records;

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

  const saveConfirmation = useCallback(
    async (item: ExtractedData, options?: { useDraft?: boolean }) => {
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
      } finally {
        setSavingItemIds((current) => current.filter((currentId) => currentId !== item.id));
      }
    },
    [drafts, vibrateConfirm],
  );

  if (!project) return (
    <div className="h-screen bg-background flex items-center justify-center font-mono text-muted-foreground animate-pulse">
      LOADING_PROJECT...
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <header className="p-6 pb-4 border-b border-border/40 shrink-0 bg-card/30 backdrop-blur-md">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Sites
          </Button>
        </Link>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] uppercase font-black border-yellow-500/50 text-yellow-600 bg-yellow-500/5">
                {project.stage}
              </Badge>
              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">{project.client}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1">Started</div>
            <div className="text-sm font-medium flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              {new Date(project.startDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </header>

      <Tabs defaultValue="task" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-4 shrink-0 bg-card/20">
          <TabsList className="bg-muted/50 p-1">
            {tabs.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="text-[10px] uppercase font-bold tracking-wider px-4">
                <t.icon className="mr-2 h-3 w-3" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <main className="flex-1 overflow-y-auto no-scrollbar p-6">
          {statusNotice && (
            <Card
              className={`mb-4 ${
                statusNotice.tone === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : statusNotice.tone === 'warning'
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : statusNotice.tone === 'error'
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-blue-500/30 bg-blue-500/5'
              }`}
            >
              <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
                {statusNotice.tone === 'warning' ? (
                  <CloudOff className="h-4 w-4 text-yellow-600" />
                ) : statusNotice.tone === 'success' ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : statusNotice.tone === 'error' ? (
                  <Info className="h-4 w-4 text-red-600" />
                ) : (
                  <Info className="h-4 w-4 text-blue-600" />
                )}
                <span>{statusNotice.message}</span>
              </CardContent>
            </Card>
          )}

          {(isOffline || isSyncingQueue || queuedCount > 0) && (
            <Card className="mb-4 border-border/50 bg-card/70">
              <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
                {isOffline ? (
                  <CloudOff className="h-4 w-4 text-yellow-600" />
                ) : isSyncingQueue ? (
                  <LoaderCircle className="h-4 w-4 animate-spin text-yellow-600" />
                ) : (
                  <Wifi className="h-4 w-4 text-emerald-600" />
                )}
                <span>
                  {isOffline
                    ? 'Offline mode active. New notes will be saved locally.'
                    : isSyncingQueue
                      ? 'Syncing saved notes...'
                      : `${queuedCount} saved note${queuedCount === 1 ? '' : 's'} waiting to sync.`}
                </span>
              </CardContent>
            </Card>
          )}

          {pendingRecordIds.length > 0 && (
            <Card className="mb-4 border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin text-yellow-600" />
                <span>
                  {pendingRecordIds.length === 1
                    ? 'Processing latest note...'
                    : `Processing ${pendingRecordIds.length} notes...`}
                </span>
              </CardContent>
            </Card>
          )}

          {pendingConfirmations.length > 0 && (
            <div className="mb-6 space-y-4">
              {pendingConfirmations.map(({ item, transcript }) => {
                const isEditing = editingItemId === item.id;
                const isSaving = savingItemIds.includes(item.id);
                const draft = drafts[item.id] || getEditableDraft(item);

                return (
                  <Card key={item.id} className="border-yellow-500/40 bg-card/80 shadow-sm">
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/5 text-[10px] uppercase tracking-widest text-yellow-600">
                            Confirm {item.category}
                          </Badge>
                          <div className="text-sm font-medium text-foreground">
                            {formatExtractedContent(item)}
                          </div>
                          {transcript && (
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              Heard in recording: "{transcript}"
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            size="sm"
                            className="bg-yellow-400 font-semibold text-black hover:bg-yellow-500"
                            disabled={isSaving}
                            onClick={() => void saveConfirmation(item)}
                          >
                            {isSaving ? <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-2 h-3.5 w-3.5" />}
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isSaving}
                            onClick={() => startEditing(item)}
                          >
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="space-y-3 rounded-2xl border border-border/60 bg-background/60 p-3">
                          {(item.category === 'task' || item.category === 'material' || item.category === 'event') && (
                            <input
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                              placeholder="Description"
                              value={draft.description}
                              onChange={(event) => updateDraftValue(item.id, 'description', event.target.value)}
                            />
                          )}

                          {item.category === 'note' && (
                            <textarea
                              className="min-h-20 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                              placeholder="Note"
                              value={draft.text}
                              onChange={(event) => updateDraftValue(item.id, 'text', event.target.value)}
                            />
                          )}

                          {item.category === 'task' && (
                            <input
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                              placeholder="Location"
                              value={draft.location}
                              onChange={(event) => updateDraftValue(item.id, 'location', event.target.value)}
                            />
                          )}

                          {item.category === 'material' && (
                            <div className="grid gap-3 md:grid-cols-3">
                              <input
                                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                                placeholder="Quantity"
                                value={draft.quantity}
                                onChange={(event) => updateDraftValue(item.id, 'quantity', event.target.value)}
                              />
                              <input
                                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                                placeholder="Unit"
                                value={draft.unit}
                                onChange={(event) => updateDraftValue(item.id, 'unit', event.target.value)}
                              />
                              <input
                                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                                placeholder="Supplier"
                                value={draft.supplier}
                                onChange={(event) => updateDraftValue(item.id, 'supplier', event.target.value)}
                              />
                            </div>
                          )}

                          {item.category === 'event' && (
                            <input
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                              placeholder="Date or timing"
                              value={draft.date}
                              onChange={(event) => updateDraftValue(item.id, 'date', event.target.value)}
                            />
                          )}

                          {item.category === 'hours' && (
                            <>
                              <div className="grid gap-3 md:grid-cols-3">
                                <input
                                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                                  placeholder="Start"
                                  value={draft.start}
                                  onChange={(event) => updateDraftValue(item.id, 'start', event.target.value)}
                                />
                                <input
                                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                                  placeholder="End"
                                  value={draft.end}
                                  onChange={(event) => updateDraftValue(item.id, 'end', event.target.value)}
                                />
                                <input
                                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                                  placeholder="Workers"
                                  value={draft.workers}
                                  onChange={(event) => updateDraftValue(item.id, 'workers', event.target.value)}
                                />
                              </div>
                              <input
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                                placeholder="Notes"
                                value={draft.notes}
                                onChange={(event) => updateDraftValue(item.id, 'notes', event.target.value)}
                              />
                            </>
                          )}

                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isSaving}
                              onClick={() => setEditingItemId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="bg-yellow-400 font-semibold text-black hover:bg-yellow-500"
                              disabled={isSaving}
                              onClick={() => void saveConfirmation(item, { useDraft: true })}
                            >
                              {isSaving ? <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
                              Save
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {recentRecords.length > 0 && (
            <div className="mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  Recent Notes
                </h2>
                <span className="text-xs text-muted-foreground">
                  {records.length} total
                </span>
              </div>

              {recentRecords.map((record) => (
                <Card key={record.id} className="border-border/40 bg-card/60">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center text-[10px] text-muted-foreground font-mono uppercase">
                        <MessageSquare className="mr-2 h-3 w-3" />
                        Voice Note
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono uppercase ${getProcessingBadgeClass(record)}`}
                        >
                          {getProcessingLabel(record)}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px] font-mono opacity-70">
                          {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Badge>
                      </div>
                    </div>

                    <Separator className="mb-3 opacity-20" />

                    <div className="space-y-2">
                      <div className="rounded-2xl border border-border/40 bg-background/40 p-3">
                        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          Transcript
                        </div>
                        <p className="text-sm leading-relaxed text-foreground/90">
                          {record.transcript.trim() || 'Transcript not available yet.'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border/40 bg-background/40 p-3">
                        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          AI Extracted Data
                        </div>
                        {record.extracted && record.extracted.length > 0 ? (
                          <div className="space-y-2">
                            {record.extracted.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-start gap-3 rounded-xl border border-border/30 bg-card/40 px-3 py-2"
                              >
                                <Badge
                                  variant="outline"
                                  className="min-w-20 justify-center border-yellow-500/40 bg-yellow-500/5 text-[10px] uppercase text-yellow-600"
                                >
                                  {formatCategoryLabel(item.category)}
                                </Badge>
                                <div className="flex-1 text-sm leading-relaxed text-foreground/90">
                                  {formatExtractedContent(item)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {record.processingStatus === 'processing'
                              ? 'KOEN is still processing this note.'
                              : 'No extracted items were produced yet.'}
                          </p>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {record.extracted && record.extracted.length > 0
                          ? `${record.extracted.length} extracted item${record.extracted.length === 1 ? '' : 's'}`
                          : 'No extracted items yet'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {tabs.map((t) => (
            <TabsContent key={t.id} value={t.id} className="m-0 focus-visible:ring-0">
              <div className="grid gap-4 pb-32">
                {records
                  .filter((r) => r.extracted?.some((e) => e.category === t.id))
                  .map((r) => (
                    <Card key={r.id} className="border-border/40 bg-card/50 hover:bg-accent/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center text-[10px] text-muted-foreground font-mono uppercase">
                            <MessageSquare className="mr-2 h-3 w-3" />
                            SITE NOTE
                          </div>
                          <Badge variant="secondary" className="text-[9px] font-mono opacity-70">
                            {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Badge>
                        </div>
                        <Separator className="mb-3 opacity-20" />
                        <div className="space-y-3">
                          {r.extracted
                            ?.filter((e) => e.category === t.id)
                            .map((e) => (
                              <div key={e.id} className="flex items-start gap-3">
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-500 shrink-0 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                                <div className="text-sm font-medium leading-relaxed italic text-foreground/90">
                                  "{formatExtractedContent(e)}"
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                {records.filter((r) => r.extracted?.some((e) => e.category === t.id)).length === 0 && (
                  <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-3xl text-center px-6">
                    <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <t.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                      No {t.label} recorded
                    </h3>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </main>
      </Tabs>

      <section className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <PushToTalkButton onFinish={handleVoiceFinish} />
        </div>
      </section>
    </div>
  );
}
