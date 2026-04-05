const PLACEHOLDER_VALUES = new Set(['', 'gsk_...', 'postgresql://postgres:password@localhost:5432/koen']);

function isMissing(value?: string) {
  return !value || PLACEHOLDER_VALUES.has(value.trim());
}

export function validateEnvironment() {
  const missingVariables: string[] = [];

  if (isMissing(process.env.DATABASE_URL)) {
    missingVariables.push('DATABASE_URL');
  }

  if (isMissing(process.env.GROQ_API_KEY)) {
    missingVariables.push('GROQ_API_KEY');
  }

  const confidenceThreshold = process.env.CONFIDENCE_THRESHOLD;
  if (
    confidenceThreshold
    && (Number.isNaN(Number(confidenceThreshold))
      || Number(confidenceThreshold) < 0
      || Number(confidenceThreshold) > 1)
  ) {
    throw new Error(
      'Invalid environment configuration: CONFIDENCE_THRESHOLD must be a number between 0 and 1.',
    );
  }

  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    try {
      new URL(frontendUrl);
    } catch {
      throw new Error(
        'Invalid environment configuration: FRONTEND_URL must be a valid absolute URL.',
      );
    }
  }

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment configuration: ${missingVariables.join(', ')}.`,
    );
  }
}
