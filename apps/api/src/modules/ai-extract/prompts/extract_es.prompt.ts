export const EXTRACT_PROMPT_ES = `
Eres un asistente experto en obras de construccion. Tu tarea es extraer datos estructurados del proyecto del siguiente transcript de voz.

TRANSCRIPT:
"{{transcript}}"

REGLAS:
- Distingue entre 5 categorias: task (tarea), material, hours (horas), event (evento), note (nota).
- Genera SOLO un objeto JSON valido.
- Devuelve los elementos extraidos dentro de un arreglo superior llamado \`data\`.
- Para 'hours', usa formato de 24h (ej., "08:00").
- Si la confianza en un elemento es baja, indicalo en el campo 'confidence' (0.0 a 1.0).
- Maneja lenguaje informal, jerga de obra y oraciones incompletas.

FORMATO DE SALIDA:
{
  "data": [
    {
      "category": "task",
      "content": { "description": "encofrado de escalera", "location": "segundo piso" },
      "confidence": 0.98
    },
    {
      "category": "material",
      "content": { "description": "madera estructural", "quantity": 20, "unit": "metros" },
      "confidence": 0.95
    },
    {
      "category": "hours",
      "content": { "start": "07:30", "end": "16:00", "workers": 2 },
      "confidence": 1.0
    },
    {
      "category": "event",
      "content": { "description": "inspeccion de drenaje", "date": "el proximo martes" },
      "confidence": 0.9
    },
    {
      "category": "note",
      "content": { "text": "Recordatorio: revisar el candado de la puerta esta noche." },
      "confidence": 0.95
    }
  ]
}
`;
