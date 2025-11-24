/**
 * Embeddings utilities
 * Converts text into 384-dimensional vectors that capture semantic meaning
 * 
 * Why embeddings?
 * - Transform text into numbers that capture meaning
 * - Similar texts have similar numbers
 * - Enables semantic search (finding by meaning, not just keywords)
 * 
 * Supports two modes:
 * 1. Local: @xenova/transformers (slow on serverless, can timeout)
 * 2. API: Hugging Face Inference API (fast, works on Vercel Hobby)
 */

import { pipeline } from '@xenova/transformers';

// Model configuration
const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
const EMBEDDING_DIMENSION = 384;

// Use Hugging Face API for production (faster, no timeout issues)
const USE_HUGGINGFACE_API = process.env.USE_HUGGINGFACE_API === 'true';
const HUGGINGFACE_API_URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${EMBEDDING_MODEL}`;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || ''; // Optional, increases rate limit

let embeddingPipeline: any = null;

/**
 * Initializes the embedding pipeline (lazy loading)
 * Caches the model after first load for faster subsequent calls
 */
async function getEmbeddingPipeline(): Promise<any> {
  if (!embeddingPipeline) {
    console.log('[Embeddings] Loading model...');
    const startTime = Date.now();
    
    try {
      // Disable local files, use CDN
      // Set longer timeout for serverless environments
      embeddingPipeline = await pipeline('feature-extraction', EMBEDDING_MODEL, {
        quantized: true,
        revision: 'main',
        // Add progress callback to help debug loading issues
        progress_callback: (progress: any) => {
          if (progress.status === 'downloading') {
            console.log(`[Embeddings] Downloading model: ${progress.name} - ${(progress.progress || 0) * 100}%`);
          } else if (progress.status === 'loading') {
            console.log(`[Embeddings] Loading model: ${progress.status}`);
          }
        },
      });
      
      const loadTime = Date.now() - startTime;
      console.log(`[Embeddings] Model loaded in ${loadTime}ms`);
    } catch (error) {
      console.error('[Embeddings] Failed to load model:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to load embeddings model: ${errorMessage}. This might be due to network issues or timeout on serverless platforms.`);
    }
  }
  
  return embeddingPipeline;
}

/**
 * Generates an embedding vector for a given text using Hugging Face API
 * Fast and works on serverless platforms with timeout limits
 */
async function generateEmbeddingAPI(text: string): Promise<number[]> {
  const startTime = Date.now();
  console.log(`[Embeddings] Generating embedding via API for text (${text.length} chars)...`);
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (HUGGINGFACE_API_KEY) {
      headers['Authorization'] = `Bearer ${HUGGINGFACE_API_KEY}`;
    }
    
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ inputs: text }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    
    // Handle API response format
    let embedding: number[];
    if (Array.isArray(result) && Array.isArray(result[0])) {
      // If result is nested array, flatten
      embedding = result[0];
    } else if (Array.isArray(result)) {
      embedding = result;
    } else {
      throw new Error('Unexpected API response format');
    }
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      embedding = embedding.map(val => val / magnitude);
    }
    
    const duration = Date.now() - startTime;
    console.log(`[Embeddings] Generated embedding via API in ${duration}ms (${embedding.length} dimensions)`);
    
    return embedding;
  } catch (error) {
    console.error('[Embeddings] Error generating embedding via API:', error);
    throw new Error(`Failed to generate embedding via API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
  // Use API on serverless platforms to avoid timeout issues
  if (USE_HUGGINGFACE_API) {
    return generateEmbeddingAPI(text);
  }
  
  const startTime = Date.now();
  console.log(`[Embeddings] Generating embedding locally for text (${text.length} chars)...`);
  
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
    console.log(`[Embeddings] Generated embedding locally in ${duration}ms (${embedding.length} dimensions)`);
    
    return embedding;
  } catch (error) {
    console.error('[Embeddings] Error generating embedding locally:', error);
    
    // Fallback to API if local generation fails
    if (!USE_HUGGINGFACE_API) {
      console.warn('[Embeddings] Local embedding failed, falling back to API...');
      try {
        return await generateEmbeddingAPI(text);
      } catch (apiError) {
        console.error('[Embeddings] API fallback also failed:', apiError);
      }
    }
    
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

