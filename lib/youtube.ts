/**
 * YouTube utility functions
 * Handles YouTube URL parsing and transcript fetching
 * Now includes Whisper transcription fallback for videos without captions
 */

import { YoutubeTranscript } from 'youtube-transcript';
import Groq from 'groq-sdk';
import ytdl from '@distube/ytdl-core';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { createReadStream } from 'fs';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export interface VideoMetadata {
  videoId: string;
  title: string;
  duration?: number;
}

/**
 * Extracts YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validates if a string is a valid YouTube URL or video ID
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}

/**
 * Fetches transcript for a YouTube video
 * Tries multiple approaches:
 * 1. Default transcript (auto-generated or manual)
 * 2. Try different languages if available
 * 
 * Returns array of transcript items with text and timing information
 * Limits to first 30 minutes of video to stay within free tier limits
 */
export async function fetchTranscript(videoId: string): Promise<
  Array<{ text: string; offset: number; duration?: number }>
> {
  try {
    console.log(`[YouTube] Fetching transcript for video: ${videoId}`);
    
    // Try to fetch transcript - the library automatically tries auto-generated if available
    let transcriptItems;
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (firstError) {
      // If default fails, try common languages that often have auto-generated captions
      const languagesToTry = ['en', 'en-US', 'en-GB'];
      
      for (const lang of languagesToTry) {
        try {
          console.log(`[YouTube] Trying transcript in language: ${lang}`);
          transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
            lang: lang,
          });
          console.log(`[YouTube] Successfully fetched transcript in ${lang}`);
          break;
        } catch (langError) {
          // Continue to next language
          continue;
        }
      }
      
      // If all languages failed, re-throw original error
      if (!transcriptItems) {
        throw firstError;
      }
    }
    
    // Check if transcript is empty
    if (!transcriptItems || transcriptItems.length === 0) {
      throw new Error(
        'NO_TRANSCRIPT: This video has no transcript available. Many videos don\'t have captions by default. ' +
        'You can either: 1) Try a video with the "CC" button enabled, 2) Use the manual transcript option below, ' +
        'or 3) Enable auto-generated captions on the video if you own it.'
      );
    }
    
    // Limit to first 30 minutes (1800 seconds = 1,800,000 ms)
    const maxTime = 30 * 60 * 1000;
    const limitedItems = transcriptItems.filter(
      (item) => (item.offset || 0) < maxTime
    );

    if (limitedItems.length < transcriptItems.length) {
      console.log(
        `[YouTube] Limited transcript to first 30 minutes: ${limitedItems.length}/${transcriptItems.length} items`
      );
    }

    console.log(`[YouTube] Successfully fetched ${limitedItems.length} transcript items`);
    
    if (limitedItems.length === 0) {
      throw new Error(
        'NO_TRANSCRIPT: Transcript is empty. This video may not have captions enabled.'
      );
    }
    
    return limitedItems.map((item) => ({
      text: item.text,
      offset: item.offset,
      duration: item.duration,
    }));
  } catch (error) {
    console.error('[YouTube] Error fetching transcript:', error);
    
    if (error instanceof Error) {
      // Check if it's our custom NO_TRANSCRIPT error
      if (error.message.startsWith('NO_TRANSCRIPT:')) {
        throw error;
      }
      
      // Check for common YouTube transcript errors
      if (error.message.includes('Could not retrieve a transcript') || 
          error.message.includes('transcript is disabled') ||
          error.message.includes('no transcript')) {
        throw new Error(
          'NO_TRANSCRIPT: This video doesn\'t have transcripts available. ' +
          'Try another video with captions enabled, or use the manual transcript option.'
        );
      }
      
      throw new Error(`Failed to fetch transcript: ${error.message}`);
    }
    
    throw new Error('Failed to fetch transcript. Please try again.');
  }
}

/**
 * Combines transcript items into a single text string
 * Useful for chunking operations
 */
export function combineTranscript(
  transcript: Array<{ text: string; offset: number; duration?: number }>
): string {
  return transcript.map((item) => item.text).join(' ');
}

/**
 * Estimates video duration from transcript (if not provided by API)
 * Uses the last transcript item's offset + duration
 */
export function estimateDuration(
  transcript: Array<{ text: string; offset: number; duration?: number }>
): number {
  if (transcript.length === 0) return 0;
  
  const lastItem = transcript[transcript.length - 1];
  return (lastItem.offset || 0) + (lastItem.duration || 0);
}

/**
 * Processes a manual transcript (user-provided text)
 * Converts plain text into transcript format with estimated timestamps
 */
export function processManualTranscript(text: string, durationSeconds?: number): Array<{ text: string; offset: number; duration?: number }> {
  if (!text || text.trim().length === 0) {
    throw new Error('Transcript text cannot be empty');
  }
  
  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  // Estimate duration if not provided (assume ~150 words per minute)
  const wordCount = text.split(/\s+/).length;
  const estimatedDuration = durationSeconds || Math.max(wordCount / 150 * 60, 60); // At least 60 seconds
  
  // Calculate approximate offset per sentence
  const durationPerSentence = (estimatedDuration * 1000) / sentences.length;
  
  return sentences.map((sentence, index) => ({
    text: sentence.trim(),
    offset: Math.round(index * durationPerSentence),
    duration: Math.round(durationPerSentence),
  }));
}

/**
 * Downloads audio from YouTube video
 * @param videoId - YouTube video ID
 * @returns Path to downloaded audio file
 */
export async function downloadAudio(videoId: string): Promise<string> {
  console.log(`[YouTube] Downloading audio for video: ${videoId}`);
  
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const audioPath = join(tmpdir(), `${videoId}.mp3`);
  
  try {
    // First, get video info to validate the video is accessible
    console.log(`[YouTube] Getting video info...`);
    const info = await ytdl.getInfo(url);
    console.log(`[YouTube] Video info retrieved: ${info.videoDetails.title}`);
    
    // Check if video is age-restricted or unavailable
    if (info.videoDetails.isLiveContent) {
      throw new Error('Live streams are not supported');
    }
  } catch (infoError) {
    console.error(`[YouTube] Failed to get video info:`, infoError);
    const errorMsg = infoError instanceof Error ? infoError.message : 'Unknown error';
    
    // Check for specific error types
    if (errorMsg.includes('403') || errorMsg.includes('Status code: 403')) {
      throw new Error(
        `NO_TRANSCRIPT: YouTube is blocking access to this video (403 Forbidden). ` +
        `The video may be age-restricted, region-locked, or YouTube is preventing downloads. ` +
        `Please try a different public video or use the manual transcript option.`
      );
    }
    
    throw new Error(
      `NO_TRANSCRIPT: Failed to access video: ${errorMsg}. ` +
      `The video may be private, age-restricted, or unavailable. ` +
      `Please try a different video or use the manual transcript option.`
    );
  }
  
  return new Promise((resolve, reject) => {
    try {
      // Try with more permissive options
      const stream = ytdl(url, {
        quality: 'lowestaudio',
        filter: 'audioonly',
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        },
      });
      
      const chunks: Buffer[] = [];
      let hasError = false;
      
      stream.on('data', (chunk) => {
        if (!hasError) {
          chunks.push(chunk);
        }
      });
      
      stream.on('end', async () => {
        if (hasError) return;
        
        try {
          if (chunks.length === 0) {
            reject(new Error('No audio data received from YouTube'));
            return;
          }
          
          await writeFile(audioPath, Buffer.concat(chunks));
          console.log(`[YouTube] Audio downloaded to: ${audioPath} (${(Buffer.concat(chunks).length / 1024 / 1024).toFixed(2)} MB)`);
          resolve(audioPath);
        } catch (writeError) {
          reject(new Error(`Failed to save audio file: ${writeError instanceof Error ? writeError.message : 'Unknown error'}`));
        }
      });
      
      stream.on('error', (error) => {
        hasError = true;
        console.error(`[YouTube] Download error:`, error);
        const errorMsg = error.message || 'Unknown error';
        
        // Provide specific error messages
        if (errorMsg.includes('403') || errorMsg.includes('Status code: 403')) {
          reject(new Error(
            `NO_TRANSCRIPT: Failed to download audio: YouTube returned 403 Forbidden. ` +
            `This video may be age-restricted, region-locked, or YouTube is blocking downloads. ` +
            `Please try a different public video or use the manual transcript option.`
          ));
        } else {
          reject(new Error(
            `NO_TRANSCRIPT: Failed to download audio: ${errorMsg}. ` +
            `This video may be age-restricted, private, or unavailable. ` +
            `Please try a different video or use the manual transcript option.`
          ));
        }
      });
      
      // Timeout after 5 minutes
      setTimeout(() => {
        if (!hasError) {
          hasError = true;
          reject(new Error('Audio download timed out after 5 minutes'));
        }
      }, 5 * 60 * 1000);
      
    } catch (error) {
      reject(new Error(`Failed to create download stream: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}

/**
 * Transcribes audio using Groq Whisper API
 * @param audioPath - Path to audio file
 * @returns Transcript segments with timing information
 */
export async function transcribeWithWhisper(audioPath: string): Promise<
  Array<{ text: string; offset: number; duration?: number }>
> {
  console.log(`[Whisper] Transcribing audio: ${audioPath}`);
  
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    
    const audioFile = createReadStream(audioPath);
    
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      response_format: 'verbose_json',
      temperature: 0.0,
    }) as any; // Groq SDK types may not include segments in verbose_json format
    
    console.log(`[Whisper] Transcription complete`);
    
    // Clean up audio file
    try {
      await unlink(audioPath);
      console.log(`[Whisper] Cleaned up audio file`);
    } catch (cleanupError) {
      console.warn(`[Whisper] Failed to clean up audio file: ${cleanupError}`);
    }
    
    // Convert Whisper format to our transcript format
    // verbose_json format includes segments array
    if (transcription.segments && Array.isArray(transcription.segments)) {
      return transcription.segments.map((seg: any) => ({
        text: seg.text || '',
        offset: Math.round(seg.start * 1000), // Convert seconds to milliseconds
        duration: Math.round((seg.end - seg.start) * 1000), // Convert to milliseconds
      }));
    } else if (transcription.text) {
      // Fallback if no segments provided
      return [{
        text: transcription.text,
        offset: 0,
        duration: 0,
      }];
    } else {
      throw new Error('Whisper transcription returned no text or segments');
    }
  } catch (error) {
    // Clean up audio file on error
    try {
      await unlink(audioPath);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('GROQ_API_KEY not configured. Please set it in your environment variables.');
      }
      throw new Error(`Whisper transcription failed: ${error.message}`);
    }
    
    throw new Error('Whisper transcription failed: Unknown error');
  }
}

/**
 * Fetches transcript with automatic fallback to Whisper
 * Tries YouTube captions first, then falls back to Whisper transcription
 * @param videoId - YouTube video ID
 * @param useWhisperFallback - Whether to use Whisper if captions fail (default: true)
 * @returns Transcript segments with timing information
 */
export async function fetchTranscriptWithFallback(
  videoId: string,
  useWhisperFallback: boolean = true
): Promise<{
  transcript: Array<{ text: string; offset: number; duration?: number }>;
  method: 'youtube-captions' | 'whisper';
}> {
  // Try YouTube captions first (fast and free)
  try {
    console.log(`[YouTube] Attempting to fetch YouTube captions...`);
    const transcript = await fetchTranscript(videoId);
    return {
      transcript,
      method: 'youtube-captions',
    };
  } catch (error) {
    // If YouTube captions fail and Whisper fallback is enabled
    if (useWhisperFallback && error instanceof Error && error.message.includes('NO_TRANSCRIPT')) {
      console.log(`[YouTube] No captions available, falling back to Whisper transcription...`);
      
      try {
        // Download audio
        const audioPath = await downloadAudio(videoId);
        
        // Transcribe with Whisper
        const transcript = await transcribeWithWhisper(audioPath);
        
        // Limit to first 30 minutes (same as YouTube captions)
        const maxTime = 30 * 60 * 1000;
        const limitedTranscript = transcript.filter(
          (item) => (item.offset || 0) < maxTime
        );
        
        if (limitedTranscript.length < transcript.length) {
          console.log(
            `[Whisper] Limited transcript to first 30 minutes: ${limitedTranscript.length}/${transcript.length} segments`
          );
        }
        
        if (limitedTranscript.length === 0) {
          throw new Error('Whisper transcription returned empty result');
        }
        
        return {
          transcript: limitedTranscript,
          method: 'whisper',
        };
      } catch (whisperError) {
        console.error('[Whisper] Transcription failed:', whisperError);
        
        // Provide helpful error message based on error type
        let errorMessage = 'Failed to get transcript: YouTube captions unavailable and Whisper transcription failed.';
        
        if (whisperError instanceof Error) {
          if (whisperError.message.includes('403') || whisperError.message.includes('Status code: 403')) {
            errorMessage = `NO_TRANSCRIPT: This video cannot be processed automatically. ` +
              `The video may be age-restricted, private, region-locked, or YouTube is blocking downloads. ` +
              `Please try: 1) A different public video, 2) Use the manual transcript option below, or 3) Ensure the video is publicly accessible.`;
          } else if (whisperError.message.includes('age-restricted')) {
            errorMessage = `NO_TRANSCRIPT: This video is age-restricted and cannot be downloaded automatically. ` +
              `Please use the manual transcript option below or try a different video.`;
          } else if (whisperError.message.includes('private')) {
            errorMessage = `NO_TRANSCRIPT: This video is private and cannot be accessed. ` +
              `Please use a public video or provide a manual transcript.`;
          } else {
            errorMessage = `NO_TRANSCRIPT: ${whisperError.message}. ` +
              `Please try a different video or use the manual transcript option below.`;
          }
        }
        
        throw new Error(errorMessage);
      }
    } else {
      // Re-throw original error if Whisper fallback is disabled
      throw error;
    }
  }
}
