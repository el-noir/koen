import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Groq } from 'groq-sdk';
import { EXTRACT_PROMPT_EN } from './prompts/extract_en.prompt';
import { EXTRACT_PROMPT_ES } from './prompts/extract_es.prompt';

@Injectable()
export class ExtractorService {
  private groq: Groq;
  private readonly logger = new Logger(ExtractorService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('groq.apiKey');
    if (apiKey && apiKey !== 'gsk_...') {
      this.groq = new Groq({ apiKey });
    } else {
      console.warn('⚠️ Groq API Key is missing or placeholder. Extraction will be disabled.');
    }
  }

  async extract(transcript: string, language: string): Promise<any[]> {
    const promptTemplate = language === 'es' ? EXTRACT_PROMPT_ES : EXTRACT_PROMPT_EN;
    const prompt = promptTemplate.replace('{{transcript}}', transcript);

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile', // High-performance model on Groq
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0].message.content || '[]');
      // The LLM might wrap the array in an object like { "data": [...] }
      return Array.isArray(result) ? result : (result.data || []);
    } catch (err) {
      this.logger.error('Groq extraction failed', err);
      return [];
    }
  }
}
