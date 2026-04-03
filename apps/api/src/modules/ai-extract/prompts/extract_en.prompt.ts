export const EXTRACT_PROMPT_EN = `
You are an expert construction site assistant. Your task is to extract structured project data from the following voice transcript.

TRANSCRIPT:
"{{transcript}}"

RULES:
- Distinguish between 5 categories: task, material, hours, event, note.
- Output ONLY valid JSON.
- For 'hours', use 24h format (e.g., "08:00").
- If confidence for an item is low, indicate it in the 'confidence' field (0.0 to 1.0).
- Handle informal speech, slang, and incomplete sentences common on job sites.

OUTPUT FORMAT:
[
  {
    "category": "task",
    "content": { "description": "staircase framing", "location": "second floor" },
    "confidence": 0.98
  },
  {
    "category": "material",
    "content": { "description": "structural timber", "quantity": 20, "unit": "meters" },
    "confidence": 0.95
  },
  {
    "category": "hours",
    "content": { "start": "07:30", "end": "16:00", "workers": 2 },
    "confidence": 1.0
  },
  {
    "category": "event",
    "content": { "description": "drainage inspection", "date": "next Tuesday" },
    "confidence": 0.9
  },
  {
    "category": "note",
    "content": { "text": "Reminder to check the site gate lock tonight." },
    "confidence": 0.95
  }
]
`;
