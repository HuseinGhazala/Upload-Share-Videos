import { isImageMedia } from './mediaTypes';

/**
 * يطبّق علامة مائية نصية على الصور قبل الرفع (الفيديو: ضغط منفصل).
 */
export async function applyWatermarkToFile(file, { text = '', opacity = 0.45 } = {}) {
  const trimmed = text?.trim();
  if (!trimmed) return file;

  const mime = file.type || '';
  if (!mime.startsWith('image/') || mime === 'image/svg+xml') {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0);
  const fontSize = Math.max(16, Math.round(Math.min(bitmap.width, bitmap.height) * 0.06));
  ctx.font = `600 ${fontSize}px sans-serif`;
  ctx.fillStyle = `rgba(255,255,255,${opacity})`;
  ctx.strokeStyle = `rgba(0,0,0,${opacity * 0.6})`;
  ctx.lineWidth = Math.max(1, fontSize * 0.08);
  ctx.textAlign = 'end';
  ctx.textBaseline = 'bottom';
  const pad = fontSize * 0.5;
  ctx.strokeText(trimmed, bitmap.width - pad, bitmap.height - pad);
  ctx.fillText(trimmed, bitmap.width - pad, bitmap.height - pad);

  const outType = mime === 'image/png' ? 'image/png' : mime === 'image/webp' ? 'image/webp' : 'image/jpeg';
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, outType, 0.92));
  if (!blob) return file;

  const ext = outType === 'image/png' ? 'png' : outType === 'image/webp' ? 'webp' : 'jpg';
  const base = file.name.replace(/\.[^/.]+$/, '');
  return new File([blob], `${base}-wm.${ext}`, { type: outType });
}

export function supportsWatermark(file) {
  return isImageMedia({ mimeType: file.type, mediaKind: file.type?.startsWith('image/') ? 'image' : null })
    && file.type !== 'image/svg+xml';
}
