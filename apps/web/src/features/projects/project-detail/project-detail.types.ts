import { ExtractedData, Project, VoiceRecord } from '@/types';

export type ProjectWithRecords = Project & { records?: VoiceRecord[] };

export type PendingConfirmation = {
  recordId: string;
  transcript: string;
  item: ExtractedData;
};

export type StatusNotice = {
  tone: 'info' | 'success' | 'warning' | 'error';
  message: string;
};

export type CaptureFlow = {
  phase: 'uploading' | 'queued_offline' | 'processing' | 'processed' | 'error';
  startedAt: string;
  recordId?: string;
  errorMessage?: string;
};

export type EditableDraft = {
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

export const EMPTY_DRAFT: EditableDraft = {
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
