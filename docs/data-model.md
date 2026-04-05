# KOEN Data Model

The data model is intentionally small for the Stage 1 MVP, but it is already structured to support future multi-project and multi-user expansion.

## Prisma Schema

The source of truth is:

`apps/api/prisma/schema.prisma`

## Core Models

### User

Base identity for ownership of projects and records.

Fields:

- `name`
- `email`
- `language`

### Project

Top-level container for job-site work.

Fields:

- `name`
- `client`
- `startDate`
- `stage`

### VoiceRecord

Stores the raw uploaded audio and its transcript.

Fields:

- `audioUrl`
- `transcript`
- `language`
- `confidenceScore`

### ExtractedData

Stores structured output derived from a voice record.

Fields:

- `category`
- `content`
- `confidence`
- `confirmed`

## Relationships

- `User` 1:N `Project`
- `User` 1:N `VoiceRecord`
- `Project` 1:N `VoiceRecord`
- `VoiceRecord` 1:N `ExtractedData`

## Categories

Current extraction categories:

- `task`
- `material`
- `hours`
- `event`
- `note`

## Repo Note

The current repo does not use a separate shared database package or shared types package. Prisma lives inside `apps/api`, and app-level TypeScript types are maintained locally in each app.
