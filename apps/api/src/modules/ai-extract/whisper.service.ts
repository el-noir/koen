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
    let fileSource: any;

    if (filePath.startsWith('http')) {
      const response = await fetch(filePath);
      const buffer = await response.arrayBuffer();
      // Groq SDK can take a File or a Stream. 
      // In Node 20+, we can use a Blob-like object or a Buffer wrapped in a File.
      const filename = filePath.split('/').pop() || 'audio.webm';
      fileSource = new File([buffer], filename, { type: 'audio/webm' });
    } else {
      fileSource = fs.createReadStream(filePath);
    }

    const response = await this.groq.audio.transcriptions.create({
      file: fileSource as any,
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
