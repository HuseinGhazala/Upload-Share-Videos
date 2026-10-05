import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

ffmpeg.setFfmpegPath(ffmpegStatic);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const text = formData.get('text') || '@ThemiifyMedia';
    const pos = formData.get('position') || 'bottom-left';
    const opacity = formData.get('opacity') || '80';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir();
    const uniqueId = Date.now() + Math.round(Math.random() * 1000);
    
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
    const ext = path.extname(safeName).toLowerCase();
    const isVideo = ['.mp4', '.webm', '.mov', '.mkv'].includes(ext);
    
    const inputPath = path.join(tempDir, `in_${uniqueId}_${safeName}`);
    const outputPath = path.join(tempDir, `out_${uniqueId}${ext}`);
    
    fs.writeFileSync(inputPath, buffer);
    
    const alpha = (parseInt(opacity) / 100).toFixed(2);
    const fontSize = isVideo ? 'h/20' : 'h/20'; // scale relative to height
    
    let x, y;
    switch(pos) {
      case 'top-left': x = '10'; y = '10'; break;
      case 'top-right': x = 'w-tw-10'; y = '10'; break;
      case 'bottom-left': x = '10'; y = 'h-th-10'; break;
      case 'bottom-right': x = 'w-tw-10'; y = 'h-th-10'; break;
      case 'center': x = '(w-tw)/2'; y = '(h-th)/2'; break;
      case 'tiled': 
         x = '0'; y = '0'; // placeholder for tiled, usually complex, let's just do center for now or fallback
         break;
      default: x = '10'; y = 'h-th-10';
    }

    await new Promise((resolve, reject) => {
      let cmd = ffmpeg(inputPath);
      
      const fontPath = process.platform === 'win32' ? "C\\\\:/Windows/Fonts/arial.ttf" : "";
      const fontParam = fontPath ? `:fontfile='${fontPath}'` : "";
      const drawtext = `drawtext=text='${text.replace(/'/g, "")}'${fontParam}:fontcolor=white@${alpha}:fontsize=${fontSize}:x=${x}:y=${y}:shadowcolor=black@${(parseFloat(alpha)*0.5).toFixed(2)}:shadowx=2:shadowy=2`;
      
      if (!isVideo) {
         cmd = cmd.videoFilters(drawtext).outputOptions(['-vframes 1']);
      } else {
         // for video, we must re-encode video to apply filter. Cannot use copy for video codec.
         cmd = cmd.videoFilters(drawtext).videoCodec('libx264').audioCodec('copy'); 
      }
      
      cmd.on('end', resolve)
         .on('error', (err) => {
           console.error('Watermark error:', err);
           reject(err);
         })
         .save(outputPath);
    });

    const outputBuffer = fs.readFileSync(outputPath);

    // Clean up
    try { fs.unlinkSync(inputPath); } catch(e) {}
    try { fs.unlinkSync(outputPath); } catch(e) {}

    let contentType = 'application/octet-stream';
    if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.webm') contentType = 'video/webm';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="watermarked_${safeName}"`
      }
    });

  } catch (error) {
    console.error('Watermark error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
