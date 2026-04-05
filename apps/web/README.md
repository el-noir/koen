# KOEN Web

Next.js frontend for the KOEN voice-first job site assistant.

## What It Does

- Shows the project list and project detail screens
- Provides the push-to-talk voice capture UI
- Uploads recorded audio to the API
- Stores pending recordings locally with IndexedDB for offline-first behavior

## Main Folders

- `src/app/projects`: Project list and detail routes
- `src/components/PushToTalkButton`: Hold-to-record UI
- `src/hooks/useAudioRecorder.ts`: MediaRecorder wrapper
- `src/services/api.ts`: Frontend API client
- `src/services/offline.ts`: IndexedDB queue
- `src/components/ui`: Local shared UI primitives

## Run Locally

```bash
npm install
npm run dev
```

The web app runs on `http://localhost:3000` by default.

## Environment

Set `NEXT_PUBLIC_API_URL` if the API is not running at `http://localhost:4000/api`.

## Notes

- The current product UI lives mainly under `/projects`.
- Types are maintained locally in `src/types`. There is no shared `@koen/types` package in the current repo structure.
