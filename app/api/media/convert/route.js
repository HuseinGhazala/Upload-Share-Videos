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
    const targetFormat = formData.get('format') || 'mp4'; // e.g. mp4, webm, gif
    const convertMode = formData.get('mode') || 'video'; // video or image

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir();
    const uniqueId = Date.now() + Math.round(Math.random() * 1000);
    
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
    const ext = path.extname(safeName);
    const basename = path.basename(safeName, ext);
    
    let outputExt = targetFormat.toLowerCase().split(' ')[0]; // e.g. 'mp4' from 'MP4 - H.264 عالمي'
    if (outputExt === 'jpg') outputExt = 'jpg';
    
    const inputPath = path.join(tempDir, `in_${uniqueId}_${safeName}`);
    const outputPath = path.join(tempDir, `out_${uniqueId}.${outputExt}`);
    
    fs.writeFileSync(inputPath, buffer);

    await new Promise((resolve, reject) => {
      let cmd = ffmpeg(inputPath);
      
      if (convertMode === 'video') {
         if (outputExt === 'mp4') {
            cmd = cmd.videoCodec('libx264').audioCodec('aac');
         } else if (outputExt === 'webm') {
            cmd = cmd.videoCodec('libvpx-vp9').audioCodec('libopus');
         } else if (outputExt === 'gif') {
            cmd = cmd.fps(10).size('480x?');
         } else if (outputExt === 'mp3') {
            cmd = cmd.noVideo().audioCodec('libmp3lame');
         }
      } else {
         // Image conversion
         cmd = cmd.outputOptions(['-vframes 1']);
      }
      
      cmd.on('end', resolve)
         .on('error', (err) => {
           console.error('ffmpeg convert error:', err);
           reject(err);
         })
         .save(outputPath);
    });

    const outputBuffer = fs.readFileSync(outputPath);

    // Clean up
    try { fs.unlinkSync(inputPath); } catch(e) {}
    try { fs.unlinkSync(outputPath); } catch(e) {}

    let contentType = 'application/octet-stream';
    if (convertMode === 'video') {
       if (outputExt === 'mp4') contentType = 'video/mp4';
       else if (outputExt === 'webm') contentType = 'video/webm';
       else if (outputExt === 'gif') contentType = 'image/gif';
       else if (outputExt === 'mp3') contentType = 'audio/mpeg';
    } else {
       if (outputExt === 'webp') contentType = 'image/webp';
       else if (outputExt === 'jpg') contentType = 'image/jpeg';
       else if (outputExt === 'png') contentType = 'image/png';
    }

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="converted_${basename}.${outputExt}"`
      }
    });

  } catch (error) {
    console.error('Format conversion error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
