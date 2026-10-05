import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

const ffmpegExe = os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
const ffmpegPath = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', ffmpegExe);
ffmpeg.setFfmpegPath(ffmpegPath);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const quality = formData.get('quality') || '192';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir();
    const uniqueId = Date.now() + Math.round(Math.random() * 1000);
    
    // Clean filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
    
    const inputPath = path.join(tempDir, `in_${uniqueId}_${safeName}`);
    const outputPath = path.join(tempDir, `out_${uniqueId}.mp3`);
    
    fs.writeFileSync(inputPath, buffer);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate(parseInt(quality))
        .on('end', resolve)
        .on('error', (err) => {
          console.error('ffmpeg error:', err);
          reject(err);
        })
        .save(outputPath);
    });

    const outputBuffer = fs.readFileSync(outputPath);

    // Clean up
    try { fs.unlinkSync(inputPath); } catch(e) {}
    try { fs.unlinkSync(outputPath); } catch(e) {}

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="extracted_${safeName.split('.')[0]}.mp3"`
      }
    });

  } catch (error) {
    console.error('Audio extraction error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
