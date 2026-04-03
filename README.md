# KOEN — Voice-first Job Site Assistant

> **Stage 1 MVP** · Voice-to-structured-data loop · April 2026  
> Developer: Mudasir Shah · Client: Alonso Avalos

---

## What is KOEN?

KOEN acts as external memory for daily job site work. Workers record short voice notes during the day. The system converts those notes into structured data automatically — no typing, no forms, no friction.

**The interaction must feel like a walkie-talkie**: press → speak → release → done.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, PWA) |
| Backend | NestJS 11 |
| Database | PostgreSQL + Prisma |
| Transcription | OpenAI Whisper |
| AI Extraction | Groq API (Stage 1) |
| Deployment | Railway |

---

## Monorepo Structure

```
koen/
├── apps/
│   ├── api/        # NestJS backend
│   └── web/        # Next.js PWA
├── packages/
│   ├── database/   # Prisma schema + client
│   └── types/      # Shared TypeScript interfaces
├── infrastructure/ # Docker, Railway config
└── docs/           # Architecture, API reference
```

---

## Setup

### Prerequisites
- Node.js 20+
- PostgreSQL running locally (or use Docker)
- Groq API key (free at console.groq.com)
- OpenAI API key (for Whisper)

### 1. Clone & install
```bash
git clone https://github.com/your-username/koen.git
cd koen
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in DATABASE_URL, OPENAI_API_KEY, GROQ_API_KEY
```

### 3. Run the database
```bash
# With Docker (easiest):
docker-compose -f infrastructure/docker-compose.yml up -d

# Or point DATABASE_URL to your local PostgreSQL
```

### 4. Run migrations
```bash
npm run db:migrate
```

### 5. Start development servers
```bash
# API (http://localhost:4000)
npm run dev:api

# Web PWA (http://localhost:3000)
npm run dev:web
```

### API Docs (Swagger)
Visit `http://localhost:4000/api/docs` when the API is running.

---

## Stage Roadmap

| Stage | Purpose | Status |
|---|---|---|
| Stage 1 | Voice capture MVP — one real user | 🔨 In progress |
| Stage 2 | AI agent layer — photo uploads, building code lookups | ⏳ Planned |
| Stage 3 | Multi-user — teams, RBAC, shared projects | ⏳ Planned |
| Stage 4 | Business integrations — Xero, Procore, payroll | ⏳ Planned |
