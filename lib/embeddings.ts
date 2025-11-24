/**
 * Embeddings utilities using @xenova/transformers
 * Converts text into 384-dimensional vectors that capture semantic meaning
 * 
 * Why embeddings?
 * - Transform text into numbers that capture meaning
 * - Similar texts have similar numbers
 * - Enables semantic search (finding by meaning, not just keywords)
 */

import { pipeline } from '@xenova/transformers';

// Model configuration
const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
const EMBEDDING_DIMENSION = 384;

let embeddingPipeline: any = null;

/**
 * Initializes the embedding pipeline (lazy loading)
 * Caches the model after first load for faster subsequent calls
 */
async function getEmbeddingPipeline(): Promise<any> {
  if (!embeddingPipeline) {
    console.log('[Embeddings] Loading model...');
    const startTime = Date.now();
    
    // Disable local files, use CDN
    embeddingPipeline = await pipeline('feature-extraction', EMBEDDING_MODEL, {
      quantized: true,
      revision: 'main',
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`[Embeddings] Model loaded in ${loadTime}ms`);
  }
  
  return embeddingPipeline;
}

/**
 * Generates an embedding vector for a given text
 * 
 * How it works:
 * 1. Tokenizes the text
 * 2. Passes through transformer model
 * 3. Extracts feature vector (384 dimensions)
 * 4. Normalizes the vector
 * 
 * @param text - Input text to embed
 * @returns Array of 384 numbers representing the text's meaning
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const startTime = Date.now();
  console.log(`[Embeddings] Generating embedding for text (${text.length} chars)...`);
  
  try {
    const pipeline = await getEmbeddingPipeline();
    
    // Generate embedding
    const output = await pipeline(text, {
      pooling: 'mean',
      normalize: true,
    });
    
    // Convert to regular array of numbers
    const embedding = Array.from(output.data as Float32Array);
    
    const duration = Date.now() - startTime;
    console.log(`[Embeddings] Generated embedding in ${duration}ms (${embedding.length} dimensions)`);
    
    return embedding;
  } catch (error) {
    console.error('[Embeddings] Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates embeddings for multiple texts in batch
 * More efficient than calling generateEmbedding multiple times
 * 
 * @param texts - Array of texts to embed
 * @param onProgress - Optional callback for progress updates (embeddingIndex, total)
 */
export async function generateEmbeddings(
  texts: string[],
  onProgress?: (current: number, total: number) => void
): Promise<number[][]> {
  console.log(`[Embeddings] Generating embeddings for ${texts.length} texts...`);
  const startTime = Date.now();
  
  const embeddings: number[][] = [];
  
  // Generate embeddings sequentially to allow progress updates
  for (let i = 0; i < texts.length; i++) {
    const embedding = await generateEmbedding(texts[i]);
    embeddings.push(embedding);
    
    // Call progress callback if provided
    if (onProgress) {
      onProgress(i + 1, texts.length);
    }
  }
  
  const duration = Date.now() - startTime;
  console.log(
    `[Embeddings] Generated ${embeddings.length} embeddings in ${duration}ms (avg: ${(duration / embeddings.length).toFixed(0)}ms each)`
  );
  
  return embeddings;
}

/**
 * Calculates cosine similarity between two embeddings
 * 
 * Formula: cos(θ) = (A · B) / (||A|| × ||B||)
 * 
 * Returns value between -1 and 1:
 * - 1 = identical meaning
 * - 0 = no relationship
 * - -1 = opposite meaning
 * 
 * @param a - First embedding vector
 * @param b - Second embedding vector
 * @returns Similarity score between -1 and 1
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Embedding dimensions don't match: ${a.length} vs ${b.length}`);
  }
  
  // Calculate dot product: A · B
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  
  // Calculate magnitudes: ||A|| and ||B||
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  
  // Avoid division by zero
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  // Cosine similarity: (A · B) / (||A|| × ||B||)
  const similarity = dotProduct / (magnitudeA * magnitudeB);
  
  return similarity;
}

/**
 * Finds the most similar embeddings to a query embedding
 * 
 * @param queryEmbedding - The embedding to search for
 * @param candidateEmbeddings - Array of embeddings to search through
 * @param topK - Number of top results to return
 * @returns Array of {index, similarity} sorted by similarity (highest first)
 */
export function findSimilarEmbeddings(
  queryEmbedding: number[],
  candidateEmbeddings: number[][],
  topK: number = 3
): Array<{ index: number; similarity: number }> {
  const similarities = candidateEmbeddings.map((embedding, index) => ({
    index,
    similarity: cosineSimilarity(queryEmbedding, embedding),
  }));
  
  // Sort by similarity (highest first) and return top K
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Gets the embedding model information
 */
export function getEmbeddingInfo(): {
  model: string;
  dimension: number;
} {
  return {
    model: EMBEDDING_MODEL,
    dimension: EMBEDDING_DIMENSION,
  };
}

