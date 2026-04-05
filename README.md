# KOEN

Voice-first job site assistant for construction teams.

Workers record short voice notes during the day. KOEN transcribes them, extracts structured data, and shows the result back in a simple project workflow.

## Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: NestJS
- Database: PostgreSQL + Prisma
- Transcription: Groq Whisper
- AI extraction: Groq
- Deployment: Railway

## Repo Structure

```text
koen/
+-- apps/
¦   +-- api/            # NestJS backend and Prisma schema
¦   +-- web/            # Next.js frontend
+-- docs/               # Architecture and product notes
+-- infrastructure/     # Deployment and local infra config
+-- docker-compose.yml
+-- .env.example
+-- package.json
```

## Important Repo Notes

- The Prisma schema lives in `apps/api/prisma/schema.prisma`.
- The repo does not currently use shared workspace packages for database or types.
- TypeScript types are maintained locally inside each app.

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL locally, or Docker
- `GROQ_API_KEY`

### Install

```bash
npm install
```

### Configure Environment

```bash
cp .env.example .env
```

Fill in:

- `DATABASE_URL`
- `GROQ_API_KEY`
- `FRONTEND_URL` if your web app does not run at `http://localhost:3000`

The API validates required environment variables at startup and exits early when configuration is missing or still using placeholders.

### Start Database

```bash
docker-compose up -d
```

Or point `DATABASE_URL` to an existing PostgreSQL instance.

### Run Prisma Migration

```bash
npm run db:migrate
```

### Start Apps

```bash
npm run dev:api
npm run dev:web
```

API docs are available at `http://localhost:4000/api/docs`.

## Current Product Flow

1. The web app records audio from a push-to-talk button.
2. Audio is uploaded to the API as a temporary processing file and linked to a `VoiceRecord`.
3. The API transcribes the file with Groq Whisper.
4. The transcript is sent to Groq for structured extraction.
5. Extracted items are stored in PostgreSQL and can be confirmed later.
6. The temporary audio file is deleted after processing in Stage 1.
