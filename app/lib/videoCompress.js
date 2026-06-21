/**
 * ضغط فيديو تقريبي عبر إعادة الترميز في المتصفّح (WebM).
 * يُستخدم اختيارياً قبل الرفع لتقليل الحجم على الموبايل.
 */
export async function compressVideoFile(
  file,
  { maxWidth = 960, videoBitsPerSecond = 900_000, onProgress } = {}
) {
  if (!file.type.startsWith('video/')) return file;

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    video.onloadedmetadata = async () => {
      try {
        const ratio = video.videoWidth > maxWidth ? maxWidth / video.videoWidth : 1;
        const width = Math.max(2, Math.round(video.videoWidth * ratio));
        const height = Math.max(2, Math.round(video.videoHeight * ratio));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve(file);
          return;
        }

        const stream = canvas.captureStream(24);
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : MediaRecorder.isTypeSupported('video/webm')
            ? 'video/webm'
            : '';
        if (!mimeType) {
          URL.revokeObjectURL(objectUrl);
          resolve(file);
          return;
        }

        const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond });
        const chunks = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          URL.revokeObjectURL(objectUrl);
          if (!chunks.length) {
            resolve(file);
            return;
          }
          const blob = new Blob(chunks, { type: mimeType.split(';')[0] });
          const base = file.name.replace(/\.[^/.]+$/, '');
          resolve(new File([blob], `${base}-compressed.webm`, { type: mimeType.split(';')[0] }));
        };

        recorder.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(file);
        };

        await video.play();
        recorder.start(250);

        const draw = () => {
          if (video.ended || video.paused) return;
          ctx.drawImage(video, 0, 0, width, height);
          if (onProgress && video.duration) {
            onProgress(Math.min(95, Math.round((video.currentTime / video.duration) * 95)));
          }
          requestAnimationFrame(draw);
        };
        draw();

        video.onended = () => {
          recorder.stop();
          onProgress?.(100);
        };
      } catch {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      }
    };
  });
}
