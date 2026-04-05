// @koen/types — Shared TypeScript interfaces
// Imported by both apps/api and apps/web for end-to-end type safety.

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export type ProjectStage = 'foundations' | 'framing' | 'cladding' | 'finishing';

export type DataCategory = 'task' | 'material' | 'hours' | 'event' | 'note';

export type Language = 'en' | 'es';

export type VoiceRecordProcessingStatus = 'processing' | 'needs_confirmation' | 'processed';

// ─────────────────────────────────────────────────────────────────────────────
// Core Entities
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  language: Language;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  client: string;
  startDate: string;
  stage: ProjectStage;
  createdAt: string;
}

export interface VoiceRecord {
  id: string;
  projectId: string;
  userId: string;
  audioUrl: string;
  transcript: string;
  language: Language;
  confidenceScore: number;
  createdAt: string;
  processingStatus?: VoiceRecordProcessingStatus;
  extracted?: ExtractedData[];
}

export interface ExtractedData {
  id: string;
  voiceRecordId: string;
  projectId: string;
  userId: string;
  category: DataCategory;
  content: ExtractedContent;
  confidence: number;
  confirmed: boolean;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Extraction Content Shapes (per category)
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskContent {
  description: string;
  location?: string;
}

export interface MaterialContent {
  description: string;
  quantity?: number;
  unit?: string;
  supplier?: string;
}

export interface HoursContent {
  start: string;   // "08:00"
  end: string;     // "17:00"
  workers?: number;
  notes?: string;
}

export interface EventContent {
  description: string;
  date?: string;   // "tomorrow", "2026-04-15", etc.
}

export interface NoteContent {
  text: string;
}

export type ExtractedContent =
  | TaskContent
  | MaterialContent
  | HoursContent
  | EventContent
  | NoteContent;

// ─────────────────────────────────────────────────────────────────────────────
// API Request / Response shapes
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateProjectDto {
  name: string;
  client: string;
  startDate: string;
  stage: ProjectStage;
}

export interface ExtractionResult {
  voiceRecordId: string;
  transcript: string;
  language: Language;
  extracted: ExtractedData[];
  needsConfirmation: boolean; // true if any item has confidence < threshold
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
