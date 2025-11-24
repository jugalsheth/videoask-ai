/**
 * In-memory vector store implementation
 * Stores embeddings and their associated chunks for fast similarity search
 * 
 * Why in-memory?
 * - No external database needed (stays within free tier)
 * - Fast lookups (O(n) search, but acceptable for <1000 chunks)
 * - Simple implementation for learning purposes
 * 
 * In production, you'd use:
 * - Pinecone, Weaviate, or Qdrant (cloud vector DBs)
 * - pgvector (PostgreSQL extension)
 * - ChromaDB (open-source)
 */

import { cosineSimilarity, findSimilarEmbeddings } from './embeddings';

export interface VectorChunk {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    videoId: string;
    chunkIndex: number;
    timestamp?: number;
    endTimestamp?: number;
    wordCount: number;
    framePath?: string; // Path to extracted frame
    thumbnailPath?: string; // Path to thumbnail
  };
}

/**
 * In-memory store: videoId -> chunks
 */
const vectorStore = new Map<string, VectorChunk[]>();

/**
 * Stores chunks with their embeddings for a video
 * 
 * @param videoId - YouTube video ID
 * @param chunks - Array of chunks with text
 * @param embeddings - Array of embeddings (one per chunk)
 * @param metadata - Additional metadata (timestamps, etc.)
 */
export function storeChunks(
  videoId: string,
  chunks: Array<{ text: string; timestamp?: number; endTimestamp?: number; wordCount: number; index: number; framePath?: string; thumbnailPath?: string }>,
  embeddings: number[][],
  metadata?: Record<string, unknown>
): void {
  console.log(`[VectorStore] Storing ${chunks.length} chunks for video: ${videoId}`);
  
  if (chunks.length !== embeddings.length) {
    throw new Error(`Chunk count (${chunks.length}) doesn't match embedding count (${embeddings.length})`);
  }
  
  const vectorChunks: VectorChunk[] = chunks.map((chunk, index) => ({
    id: `${videoId}-${chunk.index}`,
    text: chunk.text,
    embedding: embeddings[index],
    metadata: {
      videoId,
      chunkIndex: chunk.index,
      timestamp: chunk.timestamp,
      endTimestamp: chunk.endTimestamp,
      wordCount: chunk.wordCount,
      framePath: chunk.framePath,
      thumbnailPath: chunk.thumbnailPath,
      ...metadata,
    },
  }));
  
  vectorStore.set(videoId, vectorChunks);
  
  console.log(`[VectorStore] Successfully stored ${vectorChunks.length} chunks`);
}

/**
 * Retrieves stored chunks for a video
 */
export function getChunks(videoId: string): VectorChunk[] {
  return vectorStore.get(videoId) || [];
}

/**
 * Searches for similar chunks using a query embedding
 * 
 * How it works:
 * 1. Calculate cosine similarity between query and all chunks
 * 2. Sort by similarity (highest first)
 * 3. Return top K results
 * 
 * @param videoId - Video to search within
 * @param queryEmbedding - Embedding of the search query
 * @param topK - Number of results to return (default: 3)
 * @returns Array of matching chunks with similarity scores
 */
export function searchSimilar(
  videoId: string,
  queryEmbedding: number[],
  topK: number = 3
): Array<VectorChunk & { similarity: number }> {
  const chunks = getChunks(videoId);
  
  if (chunks.length === 0) {
    console.warn(`[VectorStore] No chunks found for video: ${videoId}`);
    return [];
  }
  
  console.log(`[VectorStore] Searching ${chunks.length} chunks for video: ${videoId}`);
  
  // Find similar embeddings
  const candidateEmbeddings = chunks.map((chunk) => chunk.embedding);
  const matches = findSimilarEmbeddings(queryEmbedding, candidateEmbeddings, topK);
  
  // Return chunks with similarity scores
  const results = matches.map((match) => ({
    ...chunks[match.index],
    similarity: match.similarity,
  }));
  
  console.log(
    `[VectorStore] Found ${results.length} matches (top similarity: ${results[0]?.similarity.toFixed(3)})`
  );
  
  return results;
}

/**
 * Checks if a video has been processed and stored
 */
export function hasVideo(videoId: string): boolean {
  return vectorStore.has(videoId) && (vectorStore.get(videoId)?.length || 0) > 0;
}

/**
 * Gets statistics about stored data
 */
export function getStoreStats(): {
  videoCount: number;
  totalChunks: number;
  videos: Array<{ videoId: string; chunkCount: number }>;
} {
  const videos: Array<{ videoId: string; chunkCount: number }> = [];
  let totalChunks = 0;
  
  for (const [videoId, chunks] of vectorStore.entries()) {
    const chunkCount = chunks.length;
    videos.push({ videoId, chunkCount });
    totalChunks += chunkCount;
  }
  
  return {
    videoCount: videos.length,
    totalChunks,
    videos,
  };
}

/**
 * Clears all stored data (useful for testing or reset)
 */
export function clearStore(): void {
  vectorStore.clear();
  console.log('[VectorStore] Store cleared');
}

