export type ProjectStage = 'foundations' | 'framing' | 'cladding' | 'finishing';
export type DataCategory = 'task' | 'material' | 'hours' | 'event' | 'note';
export type Language = 'en' | 'es';
export type VoiceRecordProcessingStatus = 'processing' | 'needs_confirmation' | 'processed';

export enum UserRole {
  ADMIN = 'ADMIN',
  WORKER = 'WORKER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  language: Language;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  client: string;
  startDate: string;
  stage: ProjectStage;
  createdAt: string;
  members?: ProjectMember[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user?: User;
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
  start: string;
  end: string;
  workers?: number;
  notes?: string;
}

export interface EventContent {
  description: string;
  date?: string;
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
  needsConfirmation: boolean;
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
}

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  token: string;
  projectId?: string;
  invitedById: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  invitedBy?: {
    name: string;
    email: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
