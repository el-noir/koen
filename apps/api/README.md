# KOEN API

NestJS backend for the KOEN voice-first job site assistant.

## What It Does

- Exposes project, record, and confirmation endpoints under `/api`
- Accepts audio uploads from the web app
- Transcribes recordings with Groq Whisper
- Extracts structured construction data with Groq
- Stores projects, voice records, and extracted items in PostgreSQL via Prisma

## Main Folders

- `src/modules/projects`: Project CRUD
- `src/modules/records`: Audio upload and record listing
- `src/modules/ai-extract`: transcription and extraction pipeline
- `src/modules/confirm`: Confirm or edit extracted data
- `src/database`: Prisma service and module
- `prisma`: Prisma schema and seed script

## Run Locally

```bash
npm install
npm run start:dev
```

The API runs on `http://localhost:4000` by default.

Swagger docs are available at `http://localhost:4000/api/docs`.

## Environment

The API expects the root `.env` file to provide:

- `DATABASE_URL`
- `GROQ_API_KEY`
- `FRONTEND_URL` (optional)

The API now fails fast during startup if:

- `DATABASE_URL` is missing or still using the example value
- `GROQ_API_KEY` is missing or still using the placeholder
- `CONFIDENCE_THRESHOLD` is outside the `0` to `1` range
- `FRONTEND_URL` is present but not a valid absolute URL

## Notes

- Stage 1 currently uses a hardcoded user id in the controllers.
- Prisma schema lives at `prisma/schema.prisma`.
- Types are maintained locally in this app and in the web app. There is no shared types package in the current repo structure.
