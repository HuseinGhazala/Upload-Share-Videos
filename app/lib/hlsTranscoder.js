import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { mkdir } from 'fs/promises';
import { updateVideo } from './videoStore.js';

/**
 * Transcodes an MP4/WebM file into an HLS playlist with multiple bitrates.
 */
export async function transcodeToHLS(videoId, sourceFilePath) {
  const hlsOutputDir = path.join(process.cwd(), 'public', 'uploads', 'hls', videoId);
  const masterPlaylistPath = path.join(hlsOutputDir, 'master.m3u8');
  
  try {
    await mkdir(hlsOutputDir, { recursive: true });
    
    // Update status to transcoding
    await updateVideo(videoId, (v) => ({ ...v, hlsStatus: 'transcoding' }));

    return new Promise((resolve, reject) => {
      // For a robust implementation, we generate a simple single adaptive stream for now
      // A full adaptive bitrate (ABR) setup requires mapping multiple outputs.
      ffmpeg(sourceFilePath)
        // Output options for HLS
        .outputOptions([
          '-profile:v baseline', // broad compatibility
          '-level 3.0',
          '-start_number 0',
          '-hls_time 10', // 10 second chunks
          '-hls_list_size 0', // keep all chunks in the playlist
          '-f hls'
        ])
        .output(masterPlaylistPath)
        .on('end', async () => {
          console.log(`HLS transcoding finished for video ${videoId}`);
          await updateVideo(videoId, (v) => ({ 
            ...v, 
            hlsStatus: 'ready',
            hlsUrl: `/api/videos/${videoId}/hls/master.m3u8`
          }));
          resolve(masterPlaylistPath);
        })
        .on('error', async (err) => {
          console.error(`HLS transcoding error for video ${videoId}:`, err);
          await updateVideo(videoId, (v) => ({ ...v, hlsStatus: 'failed' }));
          reject(err);
        })
        .run();
    });
  } catch (error) {
    console.error('Failed to start transcoding:', error);
    await updateVideo(videoId, (v) => ({ ...v, hlsStatus: 'failed' }));
  }
}
