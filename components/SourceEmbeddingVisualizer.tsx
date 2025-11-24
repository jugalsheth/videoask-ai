'use client';

import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Database } from 'lucide-react';

/**
 * Source Embedding Visualizer
 * Shows how sources were matched using cosine similarity
 * Displays similarity calculations and embedding comparisons
 */

interface SourceEmbeddingVisualizerProps {
  sources: Array<{
    segment: number;
    text: string;
    similarity: number;
    timestamp?: number;
  }>;
  questionEmbedding?: number[];
  matchedChunks?: Array<{
    embedding?: number[];
    similarity: number;
  }>;
}

export default function SourceEmbeddingVisualizer({
  sources,
  questionEmbedding,
  matchedChunks,
}: SourceEmbeddingVisualizerProps) {
  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        <h4 className="font-semibold text-black dark:text-white text-base tracking-tight">How Sources Were Matched</h4>
      </div>

      {/* Cosine Similarity Explanation */}
      <div className="glass rounded-lg p-4 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900">
            <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1 text-sm tracking-tight">
              Cosine Similarity Calculation
            </h5>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-2 leading-relaxed font-normal tracking-normal">
              Each source was matched by calculating the angle between the question embedding and chunk embeddings.
            </p>
            <div className="bg-white dark:bg-gray-900 rounded p-2 text-center font-serif italic text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">
              similarity = (A · B) / (||A|| × ||B||)
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 leading-relaxed font-normal tracking-normal">
              Values range from -1 (opposite) to 1 (identical). Higher scores = more relevant.
            </p>
          </div>
        </div>
      </div>

      {/* Source Similarity Breakdown */}
      <div className="space-y-3">
        {sources.map((source, index) => {
          const similarityPercent = (source.similarity * 100).toFixed(1);
          const matchedChunk = matchedChunks?.[index];
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  <span className="font-semibold text-black dark:text-white">
                    Segment {source.segment}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400" />
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {similarityPercent}%
                  </span>
                </div>
              </div>

              {/* Similarity Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Similarity Score</span>
                  <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
                    {source.similarity.toFixed(4)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${source.similarity * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  />
                </div>
              </div>

              {/* Embedding Preview */}
              {matchedChunk && questionEmbedding && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Embedding Preview (first 5 dimensions):
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-purple-600 dark:text-purple-400 font-semibold mb-1">
                        Question:
                      </div>
                      <div className="font-mono text-gray-700 dark:text-gray-300 space-y-0.5">
                        {questionEmbedding.slice(0, 5).map((val, i) => (
                          <div key={i} className="text-[10px]">
                            [{i}]: {val.toFixed(3)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                        Chunk {index + 1}:
                      </div>
                      <div className="font-mono text-gray-700 dark:text-gray-300 space-y-0.5">
                        {matchedChunk.embedding?.slice(0, 5).map((val, i) => (
                          <div key={i} className="text-[10px]">
                            [{i}]: {val.toFixed(3)}
                          </div>
                        )) || (
                          <div className="text-gray-500 dark:text-gray-500">
                            Embedding not available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Source Text Preview */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Matched Text:</p>
                <p className="text-xs text-gray-700 dark:text-gray-300 italic line-clamp-2">
                  "{source.text.substring(0, 150)}{source.text.length > 150 ? '...' : ''}"
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

