/**
 * Text chunking utilities
 * Splits long texts into smaller chunks for efficient embedding and retrieval
 * 
 * Why chunking?
 * - Embeddings work best with 100-500 word chunks
 * - Makes search faster (search through chunks, not entire document)
 * - Allows retrieving specific relevant sections
 * - Like indexing a book - easier to find specific pages!
 */

export interface Chunk {
  text: string;
  index: number;
  startOffset: number;
  endOffset: number;
  wordCount: number;
}

/**
 * Chunks text into pieces of approximately targetWords words
 * 
 * Strategy:
 * - Split by sentences (preserves meaning)
 * - Combine sentences until reaching target size
 * - Keep sentences intact (don't split mid-sentence)
 * 
 * @param text - Text to chunk
 * @param targetWords - Target number of words per chunk (default: 500)
 * @returns Array of chunks with metadata
 */
export function chunkText(text: string, targetWords: number = 500): Chunk[] {
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  console.log(`[Chunking] Chunking text (${text.length} chars, ~${wordCount} words)...`);
  
  // Check if text is empty
  if (!text || text.trim().length === 0 || wordCount === 0) {
    console.warn('[Chunking] Warning: Empty text provided, returning empty chunks');
    return [];
  }
  
  // Split into sentences (preserving punctuation)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  const chunks: Chunk[] = [];
  let currentChunk: string[] = [];
  let currentWordCount = 0;
  let chunkIndex = 0;
  let startOffset = 0;
  
  for (const sentence of sentences) {
    const sentenceWords = sentence.trim().split(/\s+/).filter((w) => w.length > 0);
    const sentenceWordCount = sentenceWords.length;
    
    // If single sentence exceeds target, we have to include it anyway
    if (sentenceWordCount > targetWords) {
      // If current chunk has content, save it first
      if (currentChunk.length > 0) {
        const chunkText = currentChunk.join(' ');
        chunks.push({
          text: chunkText,
          index: chunkIndex++,
          startOffset,
          endOffset: startOffset + chunkText.length,
          wordCount: currentWordCount,
        });
        startOffset += chunkText.length + 1;
        currentChunk = [];
        currentWordCount = 0;
      }
      
      // Add oversized sentence as its own chunk
      chunks.push({
        text: sentence.trim(),
        index: chunkIndex++,
        startOffset,
        endOffset: startOffset + sentence.length,
        wordCount: sentenceWordCount,
      });
      startOffset += sentence.length + 1;
    } else if (currentWordCount + sentenceWordCount <= targetWords) {
      // Add sentence to current chunk
      currentChunk.push(sentence.trim());
      currentWordCount += sentenceWordCount;
    } else {
      // Current chunk is full, save it and start new one
      if (currentChunk.length > 0) {
        const chunkText = currentChunk.join(' ');
        chunks.push({
          text: chunkText,
          index: chunkIndex++,
          startOffset,
          endOffset: startOffset + chunkText.length,
          wordCount: currentWordCount,
        });
        startOffset += chunkText.length + 1;
      }
      
      // Start new chunk with current sentence
      currentChunk = [sentence.trim()];
      currentWordCount = sentenceWordCount;
    }
  }
  
  // Add remaining chunk if any
  if (currentChunk.length > 0) {
    const chunkText = currentChunk.join(' ');
    chunks.push({
      text: chunkText,
      index: chunkIndex++,
      startOffset,
      endOffset: startOffset + chunkText.length,
      wordCount: currentWordCount,
    });
  }
  
  // Check if chunks are empty
  if (chunks.length === 0 || chunks.every(c => c.wordCount === 0)) {
    console.warn('[Chunking] Warning: Created empty chunks - transcript may be empty');
    return [];
  }
  
  const avgWords = Math.round(chunks.reduce((sum, c) => sum + c.wordCount, 0) / chunks.length);
  console.log(
    `[Chunking] Created ${chunks.length} chunks (avg: ${avgWords} words/chunk)`
  );
  
  return chunks;
}

/**
 * Chunks transcript with timing information preserved and overlap support
 * Maps chunks back to video timestamps
 * @param transcript - Transcript segments
 * @param targetWords - Target words per chunk (default: 500)
 * @param overlapSegments - Number of segments to overlap between chunks (default: 1)
 */
export function chunkTranscript(
  transcript: Array<{ text: string; offset: number; duration?: number }>,
  targetWords: number = 500,
  overlapSegments: number = 1
): Array<Chunk & { timestamp?: number; endTimestamp?: number }> {
  // If overlap is disabled or transcript is small, use simple chunking
  if (overlapSegments <= 0 || transcript.length < 10) {
    return chunkTranscriptSimple(transcript, targetWords);
  }
  
  console.log(`[Chunking] Creating chunks with ${overlapSegments} segment overlap...`);
  
  // Smart chunking with overlap: group segments into chunks
  const chunks: Array<Chunk & { timestamp?: number; endTimestamp?: number }> = [];
  const SEGMENTS_PER_CHUNK = 5; // Number of segments per chunk
  const OVERLAP = overlapSegments; // Segments to overlap
  
  for (let i = 0; i < transcript.length; i += SEGMENTS_PER_CHUNK - OVERLAP) {
    const chunkSegments = transcript.slice(i, i + SEGMENTS_PER_CHUNK);
    
    if (chunkSegments.length === 0) continue;
    
    // Combine segment texts
    const text = chunkSegments.map(s => s.text).join(' ').trim();
    
    if (text.length < 10) continue; // Skip tiny chunks
    
    // Calculate word count
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    
    // Get timestamps
    const startSegment = chunkSegments[0];
    const endSegment = chunkSegments[chunkSegments.length - 1];
    const timestamp = startSegment.offset / 1000; // Convert ms to seconds
    const endTimestamp = ((endSegment.offset + (endSegment.duration || 0)) / 1000);
    
    chunks.push({
      text,
      index: chunks.length,
      startOffset: 0, // Not used in this mode
      endOffset: 0, // Not used in this mode
      wordCount,
      timestamp,
      endTimestamp,
    });
  }
  
  console.log(`[Chunking] Created ${chunks.length} chunks with overlap (avg: ${Math.round(chunks.reduce((sum, c) => sum + c.wordCount, 0) / chunks.length)} words/chunk)`);
  
  return chunks;
}

/**
 * Simple chunking without overlap (original method)
 */
function chunkTranscriptSimple(
  transcript: Array<{ text: string; offset: number; duration?: number }>,
  targetWords: number = 500
): Array<Chunk & { timestamp?: number; endTimestamp?: number }> {
  // Combine transcript into text
  const fullText = combineTranscript(transcript);
  
  // Chunk the text
  const textChunks = chunkText(fullText, targetWords);
  
  // Map chunks back to timestamps
  let currentTextPosition = 0;
  let transcriptIndex = 0;
  
  return textChunks.map((chunk) => {
    // Find the timestamp for the start of this chunk
    let chunkStartOffset = chunk.startOffset;
    let chunkTimestamp: number | undefined;
    let chunkEndTimestamp: number | undefined;
    
    // Find which transcript item contains the start of this chunk
    let textPos = 0;
    for (let i = 0; i < transcript.length; i++) {
      const item = transcript[i];
      const itemLength = item.text.length;
      
      if (textPos <= chunkStartOffset && chunkStartOffset < textPos + itemLength) {
        // This chunk starts in this transcript item
        chunkTimestamp = item.offset / 1000; // Convert ms to seconds
        break;
      }
      
      textPos += itemLength + 1; // +1 for space
    }
    
    // Find end timestamp
    const chunkEndOffset = chunk.endOffset;
    textPos = 0;
    for (let i = 0; i < transcript.length; i++) {
      const item = transcript[i];
      const itemLength = item.text.length;
      
      if (textPos <= chunkEndOffset && chunkEndOffset < textPos + itemLength) {
        chunkEndTimestamp = (item.offset + (item.duration || 0)) / 1000;
        break;
      }
      
      textPos += itemLength + 1;
    }
    
    return {
      ...chunk,
      timestamp: chunkTimestamp,
      endTimestamp: chunkEndTimestamp,
    };
  });
}

/**
 * Helper to combine transcript items
 */
function combineTranscript(
  transcript: Array<{ text: string; offset: number; duration?: number }>
): string {
  return transcript.map((item) => item.text).join(' ');
}

