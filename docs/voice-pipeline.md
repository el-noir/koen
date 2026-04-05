# KOEN Voice Pipeline - Phase 1

The KOEN voice pipeline is a 4-step sequence designed for speed and accuracy in construction site conditions.

## Step 1: Capture (Frontend)
- **Component**: `PushToTalkButton.tsx`
- **Hook**: `useAudioRecorder.ts`
- **Output**: `audio/webm` Blob
- **Logic**: Continuous recording while the button is held. Triggers haptic feedback (`useHaptics.ts`) on start and stop.

## Step 2: Transcription (Whisper)
- **Service**: `WhisperService.ts`
- **Provider**: Groq Whisper (`whisper-large-v3-turbo`)
- **API**: `POST /audio/transcriptions`
- **Output**: JSON string (transcript)
- **Logic**: The raw audio file is sent to Groq Whisper. Transcription happens in the original language (en/es).

## Step 3: Intent Extraction (LLM)
- **Service**: `ExtractorService.ts`
- **Provider**: Groq (Llama-3-70b-versatile)
- **Input**: Transcript + Template Prompt (`prompts/`)
- **Output**: Array of Structured JSON objects
- **Logic**: The LLM splits the transcript into discrete entities (task, material, etc.) and assigns a confidence score to each.

## Step 4: Storage & Update (API)
- **Service**: `AiExtractService.ts`
- **Database**: PostgreSQL (Prisma)
- **Logic**:
  1. Record is updated with transcript text.
  2. One entry is created in `ExtractedData` table for each entity.
  3. Items with `confidence >= threshold` are marked as `confirmed = true` automatically.
  4. Frontend polls or refreshes to display the new items.
