import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as fs from 'fs';

@Injectable()
export class WhisperService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    if (apiKey && apiKey !== 'sk-...') {
      this.openai = new OpenAI({ apiKey });
    } else {
      console.warn('⚠️ OpenAI API Key is missing or placeholder. Whisper transcription will be disabled.');
    }
  }

  async transcribe(filePath: string): Promise<{ text: string; language: string }> {
    const response = await this.openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
    });

    return {
      text: response.text,
      language: 'en', // Whisper detects this, but let's assume 'en' for now
    };
  }
}
