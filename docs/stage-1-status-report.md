# KOEN Stage 1 Status Report

Date: 2026-04-05

## Inputs Reviewed

- `koen-build-plan.docx`
- `KOEN Engineering Constraints (v6).pdf`
- `README.md`
- `docs/architecture.md`
- `docs/voice-pipeline.md`
- `apps/api`
- `apps/web`

## Current State Analysis

Stage 1 is partially implemented. The backend core is more complete than the frontend product loop.

### Implemented

- Project CRUD exists in `apps/api/src/modules/projects`.
- Audio upload exists in `apps/api/src/modules/records`.
- The Whisper -> extraction -> database pipeline exists in `apps/api/src/modules/ai-extract`.
- The Prisma schema matches the Stage 1 data model well in `apps/api/prisma/schema.prisma`.
- The web app has a project list, project detail screen, push-to-talk button, recorder hook, and local IndexedDB queue in `apps/web/src`.

### Partially Implemented

- Upload creates a record immediately and processes extraction in the background, but the UI does not finish the loop by refreshing until extracted data is available.
- Confidence confirmation exists on the backend but there is no confirmation UI on the frontend.
- English and Spanish prompts exist, but Whisper language handling is still incomplete.

### Missing For A Real Stage 1 MVP

- Functional offline sync loop
- Service worker based PWA behavior
- One-tap confidence confirmation UI
- Smooth processing state after voice upload
- KOEN-specific entry experience on the root route

## Constraint Check

### Compliant

- Mobile-first direction is preserved.
- No chat or messaging interface has been introduced.
- No notifications or sounds are implemented.
- User-initiated haptic feedback is present.

### Violations Or Immediate Attention

- Category rendering is currently inconsistent with the data model. The project detail UI uses plural tab ids while extracted data uses singular category ids.
- Offline tolerance is not actually delivered yet. IndexedDB queueing exists, but sync and service worker behavior are not wired.
- The confidence check requirement is not met on the frontend.
- Multilingual support is only partial because detected Whisper language is not being used fully.
- Deployment config is out of sync with the actual scripts and health endpoint.
- Seed data and hardcoded Stage 1 user identity do not match.

## Remaining Stage 1 Tasks

### Backend

1. Align Stage 1 user identity between controllers and seed data.
2. Add a real health endpoint for deployment readiness.
3. Use the configured confidence threshold instead of a hardcoded value.
4. Expose record-processing status cleanly to the frontend.
5. Finish multilingual handling using detected language.
6. Add tests for project CRUD, upload, extraction, and confirmation flow.

### Frontend

1. Fix category rendering so records appear in the correct tabs.
2. Show a quiet processing state after release.
3. Refresh or poll until extracted data is available after upload.
4. Implement the one-tap confirmation and edit flow.
5. Wire offline queueing into the actual upload path.
6. Sync queued recordings on reconnect.
7. Replace the starter homepage with a KOEN entry screen or redirect.
8. Finish manifest and installability wiring for the PWA.

### Infrastructure

1. Fix Railway build and start command alignment.
2. Add `/api/health` for health checks.
3. Decide how uploaded files are handled in deployment.
4. Clean up lockfile and workspace-root ambiguity.
5. Add minimal CI build and test verification.

## Priority Recommendation

The most important next task is to close the visible core loop on the project detail screen.

That means:

1. Fix the category mismatch.
2. Upload a voice note.
3. Show a quiet processing state.
4. Automatically refresh until extracted records appear in the correct tabs.

This is the shortest path to validating the Stage 1 promise:

`press -> speak -> release -> done -> see structured result`

## Verification Notes

- `apps/api` build passes
- `apps/web` build passes
- Current API tests pass, but coverage is still only the default hello-world path
