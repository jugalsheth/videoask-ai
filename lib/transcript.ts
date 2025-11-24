/**
 * Transcript processing utilities
 * Handles manual transcript processing for personas
 */

/**
 * Processes a manual transcript (user-provided text)
 * Converts plain text into transcript format with estimated timestamps
 * 
 * @param text - The transcript text to process
 * @param durationSeconds - Optional duration in seconds (estimated if not provided)
 * @returns Array of transcript segments with text and timing information
 */
export function processManualTranscript(
  text: string,
  durationSeconds?: number
): Array<{ text: string; offset: number; duration?: number }> {
  if (!text || text.trim().length === 0) {
    throw new Error('Transcript text cannot be empty');
  }

  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  // Estimate duration if not provided (assume ~150 words per minute)
  const wordCount = text.split(/\s+/).length;
  const estimatedDuration =
    durationSeconds || Math.max((wordCount / 150) * 60, 60); // At least 60 seconds

  // Calculate approximate offset per sentence
  const durationPerSentence = (estimatedDuration * 1000) / sentences.length;

  return sentences.map((sentence, index) => ({
    text: sentence.trim(),
    offset: Math.round(index * durationPerSentence),
    duration: Math.round(durationPerSentence),
  }));
}

