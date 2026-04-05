export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL,
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
  },
  confidenceThreshold: parseFloat(
    process.env.CONFIDENCE_THRESHOLD || '0.80',
  ),
});
