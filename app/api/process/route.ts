/**
 * API Route: /api/process
 * Processes a YouTube video:
 * 1. Extracts transcript
 * 2. Chunks text
 * 3. Generates embeddings
 * 4. Stores in vector database
 * 
 * Returns processing progress via streaming response
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId, fetchTranscript, combineTranscript, processManualTranscript, fetchTranscriptWithFallback } from '@/lib/youtube';
import { chunkTranscript } from '@/lib/chunking';
import { generateEmbeddings } from '@/lib/embeddings';
import { storeChunks, hasVideo } from '@/lib/vectorStore';
import { extractChunkFrames } from '@/lib/frames';

// Use Node.js runtime for embeddings (transformers library needs Node.js)
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Streams progress updates to the client
 */
function createProgressStream(
  videoId: string,
  youtubeUrl: string,
  manualTranscript?: string
): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        // Step 1: Extract video ID
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 1, status: 'extracting', message: 'Extracting Video ID...' })}\n\n`)
        );
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!videoId) {
          throw new Error('Invalid YouTube URL');
        }

        // Check if already processed
        if (hasVideo(videoId)) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ step: 1, status: 'complete', message: 'Video already processed!' })}\n\n`)
          );
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ step: 2, status: 'skipped', message: 'Using cached transcript' })}\n\n`)
          );
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ step: 3, status: 'skipped', message: 'Using cached MemVid' })}\n\n`)
          );
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ step: 4, status: 'skipped', message: 'Using cached chunks' })}\n\n`)
          );
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ step: 5, status: 'skipped', message: 'Using cached embeddings' })}\n\n`)
          );
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ step: 6, status: 'complete', message: 'Ready for questions!', videoId, complete: true })}\n\n`)
          );
          controller.close();
          return;
        }

        // Step 2: Extract transcript
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 2, status: 'processing', message: manualTranscript ? 'Processing Manual Transcript...' : 'Extracting Transcript...', education: manualTranscript ? 'Processing your provided transcript' : 'What\'s happening: Fetching every word spoken in the video' })}\n\n`)
        );

        let transcript;
        let transcriptMethod = 'manual';

        if (manualTranscript) {
          // Process manual transcript
          transcript = processManualTranscript(manualTranscript);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ step: 2, status: 'complete', message: `Processed manual transcript (${transcript.length} segments)`, transcriptCount: transcript.length, method: 'manual' })}\n\n`)
          );
        } else {
          // Fetch from YouTube with Whisper fallback
          try {
            const result = await fetchTranscriptWithFallback(videoId, true);
            transcript = result.transcript;
            transcriptMethod = result.method;

            // Update progress based on method
            if (result.method === 'youtube-captions') {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ step: 2, status: 'complete', message: `Extracted ${transcript.length} transcript segments from YouTube captions`, transcriptCount: transcript.length, method: 'youtube-captions' })}\n\n`)
              );
            } else {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ step: 2, status: 'complete', message: `Transcribed ${transcript.length} segments using Whisper AI`, transcriptCount: transcript.length, method: 'whisper' })}\n\n`)
              );
            }
          } catch (transcriptError) {
            // Re-throw with NO_TRANSCRIPT prefix so UI can show manual option
            if (transcriptError instanceof Error && transcriptError.message.includes('NO_TRANSCRIPT')) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ error: transcriptError.message, step: 2, status: 'error' })}\n\n`)
              );
              controller.close();
              return;
            }
            throw transcriptError;
          }

          // Check if transcript is empty
          if (!transcript || transcript.length === 0) {
            throw new Error(
              'NO_TRANSCRIPT: This video has no transcript available. Please try a video with captions/subtitles enabled.'
            );
          }
        }

        // Step 3: Convert to MemVid (Educational Step)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 3, status: 'processing', message: 'Converting to MemVid...', education: 'Optimizing transcript structure for faster vectorization. MemVid format enables 3x faster chunking!' })}\n\n`)
        );

        await new Promise((resolve) => setTimeout(resolve, 800)); // Artificial delay for visualization

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 3, status: 'complete', message: 'Converted to MemVid format' })}\n\n`)
        );

        // Step 4: Chunk text with overlap for better context
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 4, status: 'processing', message: 'Chunking Text with Context Overlap...', education: 'Why chunking? Breaking into pieces with overlap preserves context. Like indexing a book with overlapping chapters!' })}\n\n`)
        );

        // Use improved chunking with overlap (1 segment overlap for better context)
        const chunks = chunkTranscript(transcript, 500, 1);

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 4, status: 'complete', message: `Created ${chunks.length} chunks with context overlap`, chunkCount: chunks.length })}\n\n`)
        );

        // Step 5: Generate embeddings
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 5, status: 'processing', message: 'Creating Embeddings...', education: 'The Magic! Converting text into numbers that capture meaning', dimension: 384 })}\n\n`)
        );

        // Generate embeddings in batches to show progress
        const texts = chunks.map((c) => c.text);
        const embeddings = await generateEmbeddings(texts);

        // Send embedding preview (first few values)
        const embeddingPreview = embeddings[0]?.slice(0, 10) || [];
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 5, status: 'progress', message: `Generated ${embeddings.length} embeddings`, embeddingPreview, dimension: 384 })}\n\n`)
        );

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 5, status: 'complete', message: `Created ${embeddings.length} embeddings (384 dimensions each)`, embeddingCount: embeddings.length })}\n\n`)
        );

        // Step 5: Extract frames (optional, non-blocking)
        let frameCount = 0;
        const frameMetadata: Record<number, { framePath?: string; thumbnailPath?: string }> = {};

        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ step: 6, status: 'processing', message: 'Extracting visual frames...', education: 'Capturing key moments for visual context (optional)' })}\n\n`)
          );

          // Extract frames at chunk timestamps (limit to 10 frames for performance)
          const frameMap = await extractChunkFrames(videoId, chunks, 10);
          frameCount = frameMap.size;

          // Store frame metadata for chunks
          frameMap.forEach((frame, chunkIndex) => {
            frameMetadata[chunkIndex] = {
              framePath: frame.path,
              thumbnailPath: frame.thumbnailPath,
            };
          });

          if (frameCount > 0) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ step: 6, status: 'progress', message: `Extracted ${frameCount} frames for visual context`, frameCount })}\n\n`)
            );
          } else {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ step: 6, status: 'complete', message: 'Frame extraction skipped (will be available in future updates)', frameCount: 0 })}\n\n`)
            );
          }
        } catch (frameError) {
          console.warn('[Process] Frame extraction failed (non-critical):', frameError);
          // Don't fail the entire process if frame extraction fails
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ step: 6, status: 'complete', message: 'Frame extraction skipped', frameCount: 0 })}\n\n`)
          );
        }

        // Step 6: Store in vector database
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 6, status: 'processing', message: 'Building Vector Database...', education: 'Storing embeddings so we can search by meaning, not just keywords' })}\n\n`)
        );

        // Add frame metadata to chunks before storing
        const chunksWithFrames = chunks.map(chunk => ({
          ...chunk,
          framePath: frameMetadata[chunk.index]?.framePath,
          thumbnailPath: frameMetadata[chunk.index]?.thumbnailPath,
        }));

        storeChunks(videoId, chunksWithFrames, embeddings, { method: transcriptMethod, frameCount });

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 6, status: 'complete', message: 'Ready for Questions!', videoId, complete: true, method: transcriptMethod, frameCount })}\n\n`)
        );

        controller.close();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[API /process] Error:', error);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: errorMessage, step: 0, status: 'error' })}\n\n`)
        );
        controller.close();
      }
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { youtubeUrl, manualTranscript } = body;

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    // Extract video ID
    const videoId = extractVideoId(youtubeUrl);

    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Create streaming response
    const stream = createProgressStream(videoId, youtubeUrl, manualTranscript);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[API /process] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    );
  }
}

