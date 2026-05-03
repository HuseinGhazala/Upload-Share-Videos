import path from 'path';
import { readdir, readFile, rm } from 'fs/promises';
import { SESSION_TTL_MS, chunkTempRoot } from './chunkedUploadConfig';

export async function cleanupExpiredChunkSessions() {
  const root = chunkTempRoot();
  let entries = [];
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return;
  }
  const now = Date.now();
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const dir = path.join(root, e.name);
    try {
      const manifestPath = path.join(dir, 'manifest.json');
      const raw = await readFile(manifestPath, 'utf8');
      const m = JSON.parse(raw);
      if (now - (m.createdAt || 0) > SESSION_TTL_MS) {
        await rm(dir, { recursive: true, force: true });
      }
    } catch {
      await rm(dir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
