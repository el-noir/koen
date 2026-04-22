import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Groq } from 'groq-sdk';
import { EXTRACT_PROMPT_EN } from './prompts/extract_en.prompt';
import { EXTRACT_PROMPT_ES } from './prompts/extract_es.prompt';

@Injectable()
export class ExtractorService {
  private readonly groq: Groq;
  private readonly logger = new Logger(ExtractorService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('groq.apiKey');
    this.groq = new Groq({ apiKey });
  }

  async extract(transcript: string, language: string, context?: string): Promise<any[]> {
    const promptTemplate = language === 'es' ? EXTRACT_PROMPT_ES : EXTRACT_PROMPT_EN;
    const finalContext = context || 'No context available.';
    const prompt = promptTemplate
      .replace('{{transcript}}', transcript)
      .replace('{{context}}', finalContext);

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
      });

      const rawContent = completion.choices[0].message.content || '{}';
      const normalizedContent = rawContent
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '');
      const result = JSON.parse(normalizedContent);

      if (Array.isArray(result)) {
        return result;
      }

      if (Array.isArray(result.data)) {
        return result.data;
      }

      if (Array.isArray(result.items)) {
        return result.items;
      }

      if (Array.isArray(result.extracted)) {
        return result.extracted;
      }

      this.logger.warn(`Groq extraction returned no array payload: ${normalizedContent}`);
      return [];
    } catch (err) {
      this.logger.error('Groq extraction failed', err);
      return [];
    }
  }
}
