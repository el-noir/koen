import { Briefcase, Clock, Info, Package, Star, type LucideIcon } from 'lucide-react';

import { ExtractedData, VoiceRecord } from '@/types';

import { CaptureFlow, EditableDraft, StatusNotice } from './project-detail.types';

export const POLL_INTERVAL_MS = 2000;
export const MAX_POLL_ATTEMPTS = 10;

export const PROJECT_DETAIL_TABS: Array<{
  id: ExtractedData['category'];
  label: string;
  icon: LucideIcon;
}> = [
  { id: 'task', label: 'Tasks', icon: Briefcase },
  { id: 'material', label: 'Materials', icon: Package },
  { id: 'hours', label: 'Hours', icon: Clock },
  { id: 'event', label: 'Events', icon: Star },
  { id: 'note', label: 'Notes', icon: Info },
];

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function hasFinishedProcessing(record?: VoiceRecord | null) {
  if (!record) {
    return false;
  }

  if (record.processingStatus) {
    return record.processingStatus !== 'processing';
  }

  return record.transcript.trim().length > 0 || Boolean(record.extracted);
}

export function formatExtractedContent(item: ExtractedData) {
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

export function formatCategoryLabel(category: ExtractedData['category']) {
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

export function getProcessingLabel(record: VoiceRecord) {
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

export function getProcessingBadgeClass(record: VoiceRecord) {
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

export function formatLatestCaptureTitle(capture: CaptureFlow, record?: VoiceRecord | null) {
  switch (capture.phase) {
    case 'uploading':
      return 'Sending note to KOEN';
    case 'queued_offline':
      return 'Note saved offline';
    case 'processing':
      return 'Turning note into site updates';
    case 'processed':
      return record?.processingStatus === 'needs_confirmation'
        ? 'Latest note needs a quick review'
        : 'Latest note is ready';
    case 'error':
    default:
      return 'Latest note could not be sent';
  }
}

export function formatLatestCaptureDetail(capture: CaptureFlow, record?: VoiceRecord | null) {
  switch (capture.phase) {
    case 'uploading':
      return 'Uploading the recording now. Keep working while KOEN takes it from here.';
    case 'queued_offline':
      return 'The note is safe on this device and will sync automatically when the connection returns.';
    case 'processing':
      return record?.transcript?.trim()
        ? 'KOEN heard the note. Structured data will appear as soon as extraction finishes.'
        : 'KOEN is transcribing the note first, then it will extract the site updates.';
    case 'processed':
      if (record?.processingStatus === 'needs_confirmation') {
        return 'KOEN extracted the note, but some items need a quick confirm before you move on.';
      }

      return 'Transcript and extracted data are ready below.';
    case 'error':
    default:
      return capture.errorMessage || 'The note could not be uploaded right now. Try again in a moment.';
  }
}

export function getLatestCaptureCardClass(capture: CaptureFlow) {
  switch (capture.phase) {
    case 'processed':
      return 'border-emerald-500/30 bg-emerald-500/5';
    case 'queued_offline':
      return 'border-yellow-500/30 bg-yellow-500/5';
    case 'error':
      return 'border-red-500/30 bg-red-500/5';
    case 'uploading':
    case 'processing':
    default:
      return 'border-blue-500/30 bg-blue-500/5';
  }
}

export function formatPrimaryRecordTitle(record: VoiceRecord) {
  switch (record.processingStatus) {
    case 'needs_confirmation':
      return 'Latest note needs a quick review';
    case 'processing':
      return 'Latest note is still processing';
    case 'processed':
    default:
      return 'Latest note is ready';
  }
}

export function formatPrimaryRecordDetail(record: VoiceRecord) {
  switch (record.processingStatus) {
    case 'needs_confirmation':
      return 'KOEN extracted the note, but a few items still need a quick confirmation.';
    case 'processing':
      return record.transcript.trim()
        ? 'KOEN heard the note and is still building the structured result.'
        : 'KOEN is still transcribing and extracting this note.';
    case 'processed':
    default:
      return 'Transcript and structured data are ready below.';
  }
}

export function getPrimaryRecordCardClass(record: VoiceRecord) {
  switch (record.processingStatus) {
    case 'needs_confirmation':
      return 'border-yellow-500/30 bg-yellow-500/5';
    case 'processing':
      return 'border-blue-500/30 bg-blue-500/5';
    case 'processed':
    default:
      return 'border-emerald-500/30 bg-emerald-500/5';
  }
}

export function formatShortTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getStatusNoticeCardClass(notice: StatusNotice) {
  switch (notice.tone) {
    case 'success':
      return 'border-emerald-500/30 bg-emerald-500/5';
    case 'warning':
      return 'border-yellow-500/30 bg-yellow-500/5';
    case 'error':
      return 'border-red-500/30 bg-red-500/5';
    case 'info':
    default:
      return 'border-blue-500/30 bg-blue-500/5';
  }
}

export function getEditableDraft(item: ExtractedData): EditableDraft {
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

export function buildUpdatedContent(item: ExtractedData, draft: EditableDraft) {
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

export function updateExtractedItem(records: VoiceRecord[], nextItem: ExtractedData) {
  return records.map((record) => ({
    ...record,
    extracted: record.extracted?.map((item) => (
      item.id === nextItem.id ? nextItem : item
    )),
  }));
}

export function isNetworkUploadError(error: unknown) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }

  if (error instanceof TypeError) {
    return true;
  }

  return error instanceof Error && /failed to fetch|network/i.test(error.message);
}
