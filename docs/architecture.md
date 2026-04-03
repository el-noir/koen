# KOEN Architecture — Stage 1

## Overview
KOEN is built as a **TypeScript Monorepo** using **Next.js 15 (App Router)** and **NestJS 11**.

## Tech Stack
- **Frontend**: Next.js 15, Tailwind CSS, PWA (Service Workers, IndexedDB)
- **Backend**: NestJS 11, Prisma ORM, Multer (Local Storage)
- **AI/ML**: OpenAI Whisper (Audio), Groq/Llama-3 (Extraction)
- **Infrastructure**: PostgreSQL, Railway, GitHub Actions

## Data Flow (Stage 1)
1. **Capture**: Audio recorded in `useAudioRecorder` hook.
2. **Persistence**: Blob saved to `IndexedDB` if offline, or sent to `POST /api/records/upload`.
3. **Transcription**: API calls `WhisperService` with local `uploads/` file.
4. **Extraction**: `ExtractorService` sends prompt to `Groq API`.
5. **Storage**: `ExtractedData` rows created in PostgreSQL.
6. **Sync**: Frontend polls or receives updated `VoiceRecord` list with extracted items.

## Key Design Principles
- **Walkie-Talkie UI**: Simple large PTT button. No complex navigation.
- **Offline First**: All voice captures are queued locally in `offline.ts`.
- **Stateless API**: Each record is an independent unit of extraction.
