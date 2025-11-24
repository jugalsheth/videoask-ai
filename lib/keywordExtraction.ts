/**
 * Keyword Extraction Utility
 * Extracts important terms and keywords from user questions
 * Simple NLP approach focusing on nouns and important phrases
 */

/**
 * Extracts keywords from a question
 * Focuses on nouns, important verbs, and meaningful phrases
 * 
 * @param question - The user's question
 * @returns Array of extracted keywords
 */
export function extractKeywords(question: string): string[] {
  // Remove common stop words and question words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'whose',
    'where', 'when', 'why', 'how', 'about', 'into', 'onto', 'upon'
  ]);

  // Split into words and clean
  const words = question
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2) // Filter short words
    .filter(word => !stopWords.has(word)); // Remove stop words

  // Remove duplicates and return
  return Array.from(new Set(words));
}

/**
 * Extracts important phrases (2-3 word combinations)
 * 
 * @param question - The user's question
 * @returns Array of extracted phrases
 */
export function extractPhrases(question: string): string[] {
  const keywords = extractKeywords(question);
  const phrases: string[] = [];
  
  // Create 2-word phrases
  for (let i = 0; i < keywords.length - 1; i++) {
    phrases.push(`${keywords[i]} ${keywords[i + 1]}`);
  }
  
  return phrases.slice(0, 5); // Limit to top 5 phrases
}

/**
 * Gets the most important terms from a question
 * Combines keywords and phrases, prioritizing longer terms
 * 
 * @param question - The user's question
 * @returns Array of important terms sorted by importance
 */
export function getImportantTerms(question: string): string[] {
  const keywords = extractKeywords(question);
  const phrases = extractPhrases(question);
  
  // Combine and prioritize phrases (they're more specific)
  const allTerms = [...phrases, ...keywords];
  
  // Sort by length (longer = more specific = more important)
  return allTerms
    .sort((a, b) => b.length - a.length)
    .slice(0, 8); // Return top 8 terms
}

