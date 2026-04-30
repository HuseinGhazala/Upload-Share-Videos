import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'videos.json');

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, 'utf8');
  } catch {
    await writeFile(DATA_FILE, '[]', 'utf8');
  }
}

export async function getAllVideos() {
  await ensureStore();
  const content = await readFile(DATA_FILE, 'utf8');
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveAllVideos(videos) {
  await ensureStore();
  await writeFile(DATA_FILE, JSON.stringify(videos, null, 2), 'utf8');
}

export async function addVideo(video) {
  const videos = await getAllVideos();
  videos.unshift(video);
  await saveAllVideos(videos);
  return video;
}

export async function updateVideo(videoId, updater) {
  const videos = await getAllVideos();
  const index = videos.findIndex((v) => v.id === videoId);
  if (index === -1) return null;

  const updated = updater(videos[index]);
  videos[index] = updated;
  await saveAllVideos(videos);
  return updated;
}

export async function getVideoById(videoId) {
  const videos = await getAllVideos();
  return videos.find((v) => v.id === videoId) || null;
}
