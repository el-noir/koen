# KOEN Stage 1 Subtasks

Date: 2026-04-05

This checklist breaks the remaining Stage 1 MVP work into small, execution-ready subtasks.

## Goal

Validate the full Stage 1 loop:

`press -> speak -> release -> done -> see structured result`

## Current Focus

- The project detail page now shows a quieter processing loop after upload.
- The next work should complete the confirmation, offline, and deployment parts of Stage 1.

## Backend

### B1. Align Stage 1 Identity

- Update the hardcoded Stage 1 user id to match seeded data.
- Verify project listing, project lookup, record upload, and confirmation all use the same user id.
- Confirm seeded sample data loads correctly after migration and seed.

### B2. Health And Deployment Readiness

- Add a dedicated `/api/health` endpoint.
- Return a simple success payload for Railway health checks.
- Make sure the endpoint does not depend on auth.

### B3. Extraction Threshold Consistency

- Stop hardcoding the auto-confirm threshold in the extraction pipeline.
- Read the threshold from configuration.
- Keep the backend and docs aligned on the chosen threshold.

### B4. Record Processing Visibility

- Decide how the frontend should detect “processing”, “processed”, and “failed”.
- Add a field or predictable signal the UI can use safely.
- Make sure record fetches always include extracted items.

### B5. Whisper Language Handling

- Stop forcing `language: 'en'` after transcription.
- Preserve the detected language from Whisper when available.
- Confirm extraction prompt selection follows the correct language.

### B6. Confirmation API Hardening

- Verify confirm/update payload validation is strict enough.
- Confirm edits to extracted content preserve valid shape.
- Return updated confirmation state cleanly for the frontend.

### B7. Backend Test Coverage

- Add tests for project CRUD.
- Add tests for record upload service behavior.
- Add tests for extraction persistence behavior.
- Add tests for confirm/update behavior.
- Replace remaining default Hello World test assumptions.

## Frontend

### F1. Complete The Core Loop

- Verify uploaded records always appear in the correct tab.
- Improve the “processing” banner if needed.
- Handle the case where processing times out or fails.
- Make sure repeated uploads do not create confusing duplicate states.

### F2. Confirmation UI

- Add a low-friction confirmation card for uncertain extractions.
- Support one-tap confirm.
- Support lightweight edit before confirm.
- Trigger user-initiated haptic confirmation only when the worker confirms or saves.
- Keep the interaction out of chat territory.

### F3. Offline Queue Integration

- Detect upload failure or offline state before attempting upload.
- Queue the audio blob in IndexedDB instead of dropping it.
- Keep enough metadata with the queued item to retry safely.
- Show a quiet local status when a recording has been saved offline.

### F4. Offline Sync On Reconnect

- Detect reconnect or app resume.
- Read queued records from IndexedDB.
- Upload them in order.
- Remove each item from the queue only after successful upload.
- Refresh project data after successful sync.

### F5. Root Experience

- Replace the default Next.js landing page.
- Redirect to `/projects` or add a KOEN landing shell.
- Update app metadata to reflect KOEN instead of starter text.

### F6. PWA Completion

- Wire manifest metadata into the app layout.
- Add missing app icons referenced by the manifest.
- Decide whether a service worker will be custom or framework/plugin based.
- Register the service worker.
- Verify installability on mobile.

### F7. Project Creation UX

- Decide whether the Stage 1 MVP needs working “New Project” creation from the UI.
- If yes, add a simple create flow.
- If not, remove or clearly disable misleading create buttons until implemented.

### F8. Frontend Cleanup

- Remove stale shared-type comments that still mention `@koen/types`.
- Normalize local type imports if needed.
- Keep the UI copy aligned with the walkie-talkie interaction model.

## Infrastructure

### I1. Railway Script Alignment

- Align Railway build command with actual repo scripts.
- Align Railway start command with the deployed app target.
- Decide whether Railway deploys the API only or the full monorepo.

### I2. Upload Storage Strategy

- Confirm where uploaded audio files live in Stage 1.
- Verify the runtime has write access to that location.
- Decide whether local disk is acceptable for current testing or if object storage is needed sooner.

### I3. Environment Validation

- Verify required env vars exist for local and deployed environments.
- Fail fast when API keys are missing.
- Make error output clearer for missing transcription or extraction configuration.

### I4. Workspace Hygiene

- Resolve the duplicated lockfile/root warning for Next.js.
- Decide which lockfile is authoritative.
- Keep build behavior predictable across local and deploy environments.

### I5. CI Safety Net

- Add a minimal CI check for backend build.
- Add a minimal CI check for frontend build.
- Add tests once backend test coverage expands.

## Recommended Execution Order

1. `F2` Confirmation UI
2. `B4` Record processing visibility
3. `B5` Whisper language handling
4. `F3` Offline queue integration
5. `F4` Offline sync on reconnect
6. `I1` Railway script alignment
7. `B2` Health endpoint
8. `F6` PWA completion
9. `B7` Backend tests
10. `I5` CI safety net

## Next Suggested Task

The next highest-value task is `F2` Confirmation UI.

Reason:

- It is a direct Stage 1 requirement.
- The backend confirm endpoint already exists.
- It completes the “uncertain extraction” part of the user experience without adding major new infrastructure.
