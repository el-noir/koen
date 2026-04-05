# KOEN API

NestJS backend for the KOEN voice-first job site assistant.

## What It Does

- Exposes project, record, and confirmation endpoints under `/api`
- Accepts audio uploads from the web app
- Transcribes recordings with OpenAI Whisper
- Extracts structured construction data with Groq
- Stores projects, voice records, and extracted items in PostgreSQL via Prisma

## Main Folders

- `src/modules/projects`: Project CRUD
- `src/modules/records`: Audio upload and record listing
- `src/modules/ai-extract`: Whisper and extraction pipeline
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
- `OPENAI_API_KEY`
- `GROQ_API_KEY`
- `FRONTEND_URL` (optional)

## Notes

- Stage 1 currently uses a hardcoded user id in the controllers.
- Prisma schema lives at `prisma/schema.prisma`.
- Types are maintained locally in this app and in the web app. There is no shared types package in the current repo structure.
