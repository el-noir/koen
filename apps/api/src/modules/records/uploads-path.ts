import { mkdirSync } from 'fs';
import { join } from 'path';

export const TEMP_UPLOADS_DIR = join(process.cwd(), 'uploads');

export function ensureTempUploadsDir() {
  mkdirSync(TEMP_UPLOADS_DIR, { recursive: true });
  return TEMP_UPLOADS_DIR;
}
