import path from 'path';
import { VIDEO_UPLOAD_CHUNK_BYTES } from './uploadChunkSize';

export { VIDEO_UPLOAD_CHUNK_BYTES as CHUNK_SIZE_BYTES };

export const SESSION_TTL_MS = 30 * 60 * 1000;

export function chunkTempRoot() {
  return path.join(process.cwd(), '.tmp-chunk-uploads');
}
