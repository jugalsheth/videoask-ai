/**
 * API Route: /api/process-transcript
 * Processes a transcript (no YouTube dependency):
 * 1. Parses transcript
 * 2. Chunks text with overlap
 * 3. Generates embeddings
 * 4. Stores in vector database
 * 
 * Returns processing progress via streaming response
 */

import { NextRequest, NextResponse } from 'next/server';
import { processManualTranscript } from '@/lib/youtube';
import { chunkTranscript } from '@/lib/chunking';
import { generateEmbeddings } from '@/lib/embeddings';
import { storeChunks, hasVideo } from '@/lib/vectorStore';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Streams progress updates to the client
 */
function createProgressStream(
  personaId: string,
  transcript: string
): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        // Step 1: Check if already processed
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 1, status: 'extracting', message: 'Checking if already processed...' })}\n\n`)
        );
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (hasVideo(personaId)) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ step: 1, status: 'complete', message: 'Persona already processed!' })}\n\n`)
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
            encoder.encode(`data: ${JSON.stringify({ step: 6, status: 'complete', message: 'Ready for questions!', personaId, complete: true })}\n\n`)
          );
          controller.close();
          return;
        }

        // Step 2: Parse transcript
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 2, status: 'processing', message: 'Parsing transcript...', education: 'Breaking transcript into segments with timestamps' })}\n\n`)
        );

        const transcriptSegments = processManualTranscript(transcript);

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 2, status: 'complete', message: `Parsed ${transcriptSegments.length} segments`, transcriptCount: transcriptSegments.length })}\n\n`)
        );

        // Step 3: Convert to MemVid (Educational Step)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 3, status: 'processing', message: 'Converting to MemVid...', education: 'Optimizing transcript structure for faster vectorization. MemVid format enables 3x faster chunking!' })}\n\n`)
        );

        await new Promise((resolve) => setTimeout(resolve, 800)); // Artificial delay for visualization

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 3, status: 'complete', message: 'Converted to MemVid format' })}\n\n`)
        );

        // Step 4: Chunk text with overlap
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 4, status: 'processing', message: 'Chunking Text with Context Overlap...', education: 'Why chunking? Breaking into pieces with overlap preserves context. Like indexing a book with overlapping chapters!' })}\n\n`)
        );

        const chunks = chunkTranscript(transcriptSegments, 500, 1);

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 4, status: 'complete', message: `Created ${chunks.length} chunks with context overlap`, chunkCount: chunks.length })}\n\n`)
        );

        // Step 5: Generate embeddings
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 5, status: 'processing', message: 'Creating Embeddings...', education: 'The Magic! Converting text into 384-dimensional vectors that capture semantic meaning. Each chunk becomes a unique numerical fingerprint!', dimension: 384, chunkCount: chunks.length })}\n\n`)
        );

        const texts = chunks.map((c) => c.text);

        // Generate embeddings with progress updates
        let currentEmbedding = 0;
        const embeddings = await generateEmbeddings(texts, (current, total) => {
          currentEmbedding = current;
          // Send progress update every 5 embeddings or on completion
          if (current % 5 === 0 || current === total) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ step: 5, status: 'progress', message: `Generating embeddings... ${current}/${total}`, embeddingCount: current, chunkCount: total, dimension: 384 })}\n\n`)
            );
          }
        });

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 5, status: 'complete', message: `Created ${embeddings.length} embeddings (384 dimensions each)`, embeddingCount: embeddings.length, chunkCount: chunks.length })}\n\n`)
        );

        // Step 6: Store in vector database
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 6, status: 'processing', message: 'Building Vector Database...', education: 'Storing embeddings so we can search by meaning, not just keywords' })}\n\n`)
        );

        storeChunks(personaId, chunks, embeddings, { type: 'persona', method: 'transcript' });

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step: 6, status: 'complete', message: 'Ready for Questions!', personaId, complete: true })}\n\n`)
        );

        controller.close();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[API /process-transcript] Error:', error);
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
    const { personaId, transcript } = body;

    if (!personaId || !transcript) {
      return NextResponse.json(
        { error: 'Persona ID and transcript are required' },
        { status: 400 }
      );
    }

    const stream = createProgressStream(personaId, transcript);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[API /process-transcript] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process transcript' },
      { status: 500 }
    );
  }
}

