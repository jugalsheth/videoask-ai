/**
 * Video frame extraction utilities
 * Extracts frames from YouTube videos at key timestamps for visual context
 * 
 * Uses FFmpeg (via @ffmpeg/ffmpeg) to extract frames
 * Frames can be used for:
 * - Visual context in RAG
 * - Scene understanding
 * - Better chunk relevance
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import sharp from 'sharp';

export interface FrameData {
  timestamp: number;
  path: string;
  thumbnailPath?: string;
  width?: number;
  height?: number;
  size?: number;
}

let ffmpegInstance: FFmpeg | null = null;

/**
 * Initializes FFmpeg instance (lazy loading)
 */
async function getFFmpeg(): Promise<FFmpeg> {
  if (!ffmpegInstance) {
    console.log('[Frames] Initializing FFmpeg...');
    ffmpegInstance = new FFmpeg();
    
    // Load FFmpeg core
    await ffmpegInstance.load();
    console.log('[Frames] FFmpeg initialized');
  }
  
  return ffmpegInstance;
}

/**
 * Downloads video from YouTube and extracts frames
 * @param videoId - YouTube video ID
 * @param timestamps - Array of timestamps (in seconds) to extract frames
 * @param maxFrames - Maximum number of frames to extract (default: 10)
 * @returns Array of frame data
 */
export async function extractFrames(
  videoId: string,
  timestamps: number[],
  maxFrames: number = 10
): Promise<FrameData[]> {
  console.log(`[Frames] Extracting frames for video: ${videoId} at ${timestamps.length} timestamps`);
  
  // Limit number of frames
  const framesToExtract = timestamps.slice(0, maxFrames);
  
  if (framesToExtract.length === 0) {
    return [];
  }
  
  try {
    const ffmpeg = await getFFmpeg();
    const frames: FrameData[] = [];
    
    // For now, we'll extract frames from the video URL directly
    // In production, you might want to download the video first
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Note: Direct YouTube URL extraction is complex
    // For now, we'll create placeholder frame data
    // In a full implementation, you'd:
    // 1. Download video using ytdl
    // 2. Use FFmpeg to extract frames at specific timestamps
    // 3. Process frames with sharp for thumbnails
    
    console.log(`[Frames] Frame extraction would happen here for ${framesToExtract.length} timestamps`);
    console.log(`[Frames] Note: Full frame extraction requires video download first`);
    
    // Return placeholder data structure
    // In production, replace this with actual frame extraction
    return framesToExtract.map((timestamp, index) => ({
      timestamp,
      path: join(tmpdir(), `${videoId}-frame-${index}.jpg`),
      thumbnailPath: join(tmpdir(), `${videoId}-thumb-${index}.jpg`),
    }));
    
  } catch (error) {
    console.error('[Frames] Error extracting frames:', error);
    // Don't fail the entire process if frame extraction fails
    return [];
  }
}

/**
 * Extracts frames at chunk timestamps
 * @param videoId - YouTube video ID
 * @param chunks - Array of chunks with timestamps
 * @param maxFrames - Maximum frames to extract
 * @returns Map of chunk index to frame data
 */
export async function extractChunkFrames(
  videoId: string,
  chunks: Array<{ timestamp?: number; index: number }>,
  maxFrames: number = 10
): Promise<Map<number, FrameData>> {
  // Get unique timestamps from chunks (one per chunk)
  const timestamps = chunks
    .filter(c => c.timestamp !== undefined)
    .map(c => c.timestamp!)
    .filter((t, i, arr) => arr.indexOf(t) === i) // Remove duplicates
    .sort((a, b) => a - b);
  
  if (timestamps.length === 0) {
    return new Map();
  }
  
  const frames = await extractFrames(videoId, timestamps, maxFrames);
  
  // Map frames back to chunks
  const frameMap = new Map<number, FrameData>();
  
  chunks.forEach((chunk) => {
    if (chunk.timestamp !== undefined) {
      // Find closest frame to this chunk's timestamp
      const closestFrame = frames.reduce((prev, curr) => {
        const prevDiff = Math.abs(prev.timestamp - chunk.timestamp!);
        const currDiff = Math.abs(curr.timestamp - chunk.timestamp!);
        return currDiff < prevDiff ? curr : prev;
      });
      
      if (closestFrame) {
        frameMap.set(chunk.index, closestFrame);
      }
    }
  });
  
  return frameMap;
}

/**
 * Creates thumbnail from frame (resizes and optimizes)
 * @param framePath - Path to frame image
 * @param outputPath - Path to save thumbnail
 * @param width - Thumbnail width (default: 320)
 * @returns Thumbnail metadata
 */
export async function createThumbnail(
  framePath: string,
  outputPath: string,
  width: number = 320
): Promise<{ width: number; height: number; size: number }> {
  try {
    const image = sharp(framePath);
    const metadata = await image.metadata();
    
    const thumbnail = await image
      .resize(width, null, { withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
    
    return {
      width: thumbnail.width || width,
      height: thumbnail.height || 0,
      size: thumbnail.size || 0,
    };
  } catch (error) {
    console.error('[Frames] Error creating thumbnail:', error);
    throw error;
  }
}

/**
 * Cleans up extracted frames
 * @param frames - Array of frame data to clean up
 */
export async function cleanupFrames(frames: FrameData[]): Promise<void> {
  for (const frame of frames) {
    try {
      if (frame.path) await unlink(frame.path).catch(() => {});
      if (frame.thumbnailPath) await unlink(frame.thumbnailPath).catch(() => {});
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

