'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

/**
 * Concept Tooltip Component
 * Hover over any technical term to learn about it
 */

interface ConceptTooltipProps {
  term: string;
  definition?: string;
  children: React.ReactNode;
  className?: string;
}

const glossary: Record<string, string> = {
  RAG: 'Retrieval-Augmented Generation - giving AI your own data to work with, combining search with generation',
  embedding: 'A list of numbers that represents the meaning of text. Similar texts have similar numbers.',
  vector: 'Same as embedding - think of it as coordinates in meaning-space.',
  'cosine similarity': 'How similar two embeddings are (0 = different, 1 = identical). Formula: cos(θ) = (A · B) / (||A|| × ||B||)',
  chunk: 'A piece of text, usually a few sentences or paragraphs, used for efficient searching.',
  token: 'A piece of a word that AI reads. Roughly 0.75 words = 1 token.',
  LLM: 'Large Language Model - the AI that writes responses (like GPT or Mixtral).',
  Groq: 'Super-fast AI inference engine - answers in seconds not minutes using GPU acceleration.',
  dimension: 'The number of values in an embedding vector (e.g., 384 dimensions = 384 numbers).',
  semantic: 'Relating to meaning rather than just keywords. Semantic search finds by meaning.',
};

export default function ConceptTooltip({ 
  term, 
  definition, 
  children, 
  className = '' 
}: ConceptTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const tooltipDefinition = definition || glossary[term] || 'Definition not available';

  return (
    <span
      className={`inline-flex items-center gap-1 relative cursor-help ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <Info className="w-3 h-3 text-purple-400 opacity-60" />
      
      <AnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 glass rounded-lg border border-purple-500/30 bg-purple-900/90 backdrop-blur-md z-50 pointer-events-none block"
            style={{ display: 'block' }}
          >
            <span className="text-xs font-semibold text-purple-300 mb-1 block">{term}</span>
            <span className="text-xs text-gray-200 block">{tooltipDefinition}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

