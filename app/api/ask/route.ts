/**
 * API Route: /api/ask
 * Answers questions about a processed video using RAG
 * 
 * Process:
 * 1. Generate question embedding
 * 2. Search for similar chunks
 * 3. Generate answer using Groq with context
 * 
 * Returns streaming response with answer and metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/embeddings';
import { searchSimilar, VectorChunk } from '@/lib/vectorStore';
import { generateAnswer } from '@/lib/groq';
import { getImportantTerms } from '@/lib/keywordExtraction';

// Use Node.js runtime for embeddings
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, question, conversationHistory, personaName } = body;

    if (!videoId || !question) {
      return NextResponse.json(
        { error: 'Video ID and question are required' },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const startTime = Date.now();

          // Step 1: Generate question embedding
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ step: 1, status: 'processing', message: 'Converting your question to embedding...' })}\n\n`)
          );

          const questionEmbedding = await generateEmbedding(question);
          const embeddingPreview = questionEmbedding.slice(0, 10);

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ step: 1, status: 'complete', message: 'Question embedded (384 dimensions)', embeddingPreview })}\n\n`)
          );

          // Check if this is a greeting or casual conversation
          const isGreeting = /^(hi|hello|hey|greetings|what's up|how are you|how's it going)/i.test(question.trim());

          let similarChunks: Array<{ text: string; similarity: number; timestamp?: number; embedding?: number[] }> = [];
          let foundChunks: Array<VectorChunk & { similarity: number }> = [];
          let totalChunkCount = 0;

          // For greetings, skip vector search and go straight to conversational response
          if (!isGreeting) {
            // Step 2: Search for similar chunks (MemVid)
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ step: 2, status: 'processing', message: 'Scanning MemVid Vector Space...' })}\n\n`)
            );

            // Artificial delay to show the "Scanning" animation
            await new Promise(resolve => setTimeout(resolve, 800));

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ step: 2, status: 'processing', message: 'Calculating Cosine Similarity...' })}\n\n`)
            );

            // Another small delay for the formula animation
            await new Promise(resolve => setTimeout(resolve, 800));

            foundChunks = searchSimilar(videoId, questionEmbedding, 3);
            totalChunkCount = foundChunks.length;

            // Only use chunks with good similarity scores
            similarChunks = foundChunks
              .filter(c => c.similarity > 0.3)
              .map((c) => ({
                text: c.text,
                similarity: c.similarity,
                timestamp: c.metadata?.timestamp,
                embedding: c.embedding, // Include embedding for visualization
              }));

            // Log similarity scores for debugging
            console.log(`[Ask] Found ${similarChunks.length} relevant chunks:`);
            similarChunks.forEach((c, i) => {
              console.log(`  ${i + 1}. Score: ${c.similarity.toFixed(3)} | "${c.text.substring(0, 60)}..."`);
            });

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                step: 2,
                status: 'complete',
                message: similarChunks.length > 0
                  ? `Found ${similarChunks.length} relevant segments via MemVid!`
                  : 'No specific matches found - responding conversationally',
                chunkCount: totalChunkCount,
                similarities: similarChunks.map(c => c.similarity)
              })}\n\n`)
            );
          } else {
            // Skip search for greetings
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                step: 2,
                status: 'skipped',
                message: 'Greeting detected - responding conversationally',
                chunkCount: 0
              })}\n\n`)
            );
          }

          // Step 3: Generate answer
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ step: 3, status: 'processing', message: isGreeting ? 'Generating response...' : 'Asking Groq to answer...' })}\n\n`)
          );

          const answerStream = await generateAnswer(
            question,
            similarChunks,
            conversationHistory || [],
            personaName,
            true
          );

          // Stream the answer
          let answerText = '';
          let outputTokenCount = 0;
          
          // Estimate input tokens (question + context chunks)
          const contextText = similarChunks.map(c => c.text).join(' ');
          const inputText = question + (contextText ? '\n\n' + contextText : '');
          // Rough estimate: 1 token ≈ 4 characters
          const inputTokenCount = Math.ceil(inputText.length / 4);

          if (answerStream && typeof answerStream === 'object' && Symbol.asyncIterator in answerStream) {
            for await (const chunk of answerStream) {
              answerText += chunk;
              // Rough estimate: 1 token ≈ 4 characters
              outputTokenCount += Math.ceil(chunk.length / 4);

              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ step: 3, status: 'streaming', chunk, message: 'Streaming answer...' })}\n\n`)
              );
            }
          } else if (typeof answerStream === 'string') {
            answerText = answerStream;
            outputTokenCount = Math.ceil(answerText.length / 4);
          }

          const duration = Date.now() - startTime;
          const totalTokens = inputTokenCount + outputTokenCount;
          const tokensPerSecond = (outputTokenCount / (duration / 1000)).toFixed(0);

          // Extract keywords from question
          const keywords = getImportantTerms(question);

          // Send completion with metadata
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              step: 3,
              status: 'complete',
              message: 'Answer complete!',
              complete: true,
              answer: answerText,
              question: question, // Include question for display
              keywords: keywords, // Include extracted keywords
              chunkCount: totalChunkCount, // Total chunks searched
              sources: similarChunks.map((c, i) => ({
                segment: i + 1,
                text: c.text.substring(0, 200) + (c.text.length > 200 ? '...' : ''),
                similarity: parseFloat(c.similarity.toFixed(3)),
                relevance: c.similarity.toFixed(3), // For display
                timestamp: c.timestamp,
                endTimestamp: undefined, // Not available in simplified structure
              })),
              performance: {
                duration: duration / 1000,
                tokens: totalTokens,
                inputTokens: inputTokenCount,
                outputTokens: outputTokenCount,
                tokensPerSecond: parseInt(tokensPerSecond),
              },
              explanation: {
                questionEmbedding: questionEmbedding.slice(0, 10), // Preview of first 10 dimensions
                matchedChunks: similarChunks.length > 0 ? similarChunks.map(c => ({
                  embedding: c.embedding?.slice(0, 10), // Preview of first 10 dimensions
                  similarity: c.similarity,
                })) : [],
                similarities: similarChunks.map(c => c.similarity),
              }
            })}\n\n`)
          );

          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('[API /ask] Error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMessage, step: 0, status: 'error' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[API /ask] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}

