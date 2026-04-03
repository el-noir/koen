# KOEN Data Model — Stage 1

The data model is designed to be simple for the MVP but extensible for the "Operating System for Construction" goal (Stage 4).

## Global Schema (Prisma)
The source of truth is in `packages/database/schema.prisma`.

### Users (`users`)
Base entity for authentication. Stage 1 uses a placeholder `stage1-user`.
- `name`, `email`, `language` (default: `en`)

### Projects (`projects`)
The top-level container for all site work.
- `name`, `client`, `startDate`, `stage` (foundations, framing, cladding, finishing)

### VoiceRecords (`voice_records`)
Stores the raw audio input and its transcript.
- `audioUrl`: Path to the file.
- `transcript`: Natural language text from Whisper.
- `confidenceScore`: Overall transcription quality (0-1).

### ExtractedData (`extracted_data`)
The structured output derived from a `VoiceRecord`. One record can have multiple items (e.g. one voice note describing hours *and* a task).
- `category`: task, material, hours, event, note
- `content`: JSON blob (flexible structure per category)
- `confidence`: Confidence of the LLM extraction (0-1)
- `confirmed`: Toggled by the worker via UI or auto-confirmed if high confidence.

## Relationships
- `User` 1:N `Project`
- `Project` 1:N `VoiceRecord`
- `VoiceRecord` 1:N `ExtractedData`
