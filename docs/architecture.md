# KOEN Architecture

## Overview

KOEN is a TypeScript monorepo with:

- `apps/api`: NestJS backend
- `apps/web`: Next.js frontend

The system is designed around a voice-to-structured-data workflow for construction site reporting.

## Backend Responsibilities

- Store projects and records
- Accept audio uploads for temporary processing
- Run transcription with Whisper
- Run structured extraction with Groq
- Save extracted items for later confirmation

## Frontend Responsibilities

- Show project list and project detail screens
- Capture audio with a push-to-talk interface
- Upload audio to the backend
- Keep an IndexedDB queue for offline-first behavior

## Stage 1 Data Flow

1. Audio is captured in the web app.
2. The frontend uploads the recording to `POST /api/records/upload`.
3. The backend creates a `VoiceRecord`.
4. The backend processes that record asynchronously.
5. Whisper generates the transcript.
6. Groq extracts structured entities from the transcript.
7. Extracted items are stored as `ExtractedData`.

## Design Principles

- Walkie-talkie interaction over form-heavy data entry
- Simple project-centric workflow
- Offline-friendly recording
- Stage 1 keeps transcripts and extracted data, not durable raw audio storage

## Repo Notes

- Prisma schema lives in `apps/api/prisma/schema.prisma`.
- TypeScript types are local to each app.
- The repo does not currently use shared workspace packages such as `packages/types` or `packages/database`.
