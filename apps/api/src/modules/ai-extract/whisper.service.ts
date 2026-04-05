import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Groq } from 'groq-sdk';
import * as fs from 'fs';

@Injectable()
export class WhisperService {
  private readonly groq: Groq;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('groq.apiKey');
    this.groq = new Groq({ apiKey });
  }

  async transcribe(filePath: string): Promise<{ text: string; language: string }> {
    const response = await this.groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3-turbo',
      response_format: 'verbose_json',
    });
    const verboseResponse = response as typeof response & { language?: string };

    return {
      text: response.text,
      language: verboseResponse.language === 'es' ? 'es' : 'en',
    };
  }
}
