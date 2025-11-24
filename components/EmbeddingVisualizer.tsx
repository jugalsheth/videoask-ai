'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * Embedding Visualizer Component
 * Shows embeddings as floating number arrays with animations
 * Educational purpose: Visualizes how text becomes numbers
 */

interface EmbeddingVisualizerProps {
  embedding?: number[];
  dimension?: number;
  showFull?: boolean;
}

export default function EmbeddingVisualizer({ 
  embedding, 
  dimension = 384,
  showFull = false 
}: EmbeddingVisualizerProps) {
  const [displayedEmbedding, setDisplayedEmbedding] = useState<number[]>([]);

  useEffect(() => {
    if (embedding) {
      // Animate showing the embedding values
      const preview = embedding.slice(0, showFull ? embedding.length : 10);
      setDisplayedEmbedding(preview);
    } else {
      // Generate sample embedding for demo
      const sample = Array.from({ length: showFull ? dimension : 10 }, () => 
        (Math.random() - 0.5) * 2
      );
      setDisplayedEmbedding(sample);
    }
  }, [embedding, dimension, showFull]);

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-6">
        <h4 className="text-lg font-semibold text-purple-300 mb-4">
          Embedding Visualization
        </h4>
        
        <p className="text-sm text-gray-300 mb-4">
          Each number captures part of the text's meaning. Similar texts have similar numbers!
        </p>

        <div className="relative">
          {/* Floating particles background */}
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-30"
                initial={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                }}
                animate={{
                  y: [null, Math.random() * 50 - 25],
                  x: [null, Math.random() * 50 - 25],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
            ))}
          </div>

          {/* Embedding array */}
          <div className="relative bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
            <div className="flex flex-wrap gap-2">
              {displayedEmbedding.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.3,
                  }}
                  className="px-2 py-1 bg-gradient-to-br from-purple-600/50 to-blue-600/50 rounded text-xs font-mono text-white border border-purple-400/30"
                >
                  {value.toFixed(3)}
                </motion.div>
              ))}
              {!showFull && embedding && embedding.length > 10 && (
                <div className="px-2 py-1 text-xs text-gray-400">
                  ... ({embedding.length - 10} more)
                </div>
              )}
            </div>

            {embedding && (
              <div className="mt-3 text-xs text-gray-400 text-center">
                Dimension: <span className="text-purple-300">{embedding.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Educational note */}
        <div className="mt-4 p-3 rounded-lg bg-blue-900/20 border border-blue-500/30">
          <p className="text-xs text-blue-300">
            <strong>Key insight:</strong> Two texts with similar meanings will have similar
            embedding arrays. That's how we can search by meaning, not just keywords!
          </p>
        </div>
      </div>
    </div>
  );
}

