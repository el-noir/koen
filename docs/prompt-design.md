# KOEN AI Prompts — Stage 1

The quality of extraction depends entirely on these prompts. They are located in `apps/api/src/modules/ai-extract/prompts/`.

## Principle: Construction-First context
The LLM is instructed to act as a "construction site assistant". This allows it to interpret site slang and informal speech (e.g., "Pouring the slab" → category: task, description: "Pouring concrete slab").

## English Prompt (`extract_en.prompt.ts`)
- Primary extraction for Phase 1.
- Focuses on 5 categories with specific JSON output structures.
- Handles relative dates (e.g., "tomorrow" → event date).

## Spanish Prompt (`extract_es.prompt.ts`)
- Added for Phase 1B validation.
- Instructs the model to output the EXACT SAME key names as the English version.
- Ensures the `DataCategory` enum in the database remains consistent regardless of input language.

## Updating Prompts
If the LLM makes consistent errors (e.g., missing worker counts in hours), update the prompt template with explicit examples in the `OUTPUT FORMAT` section.
