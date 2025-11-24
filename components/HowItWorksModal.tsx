'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Binary, Zap, Calculator, Brain, Database, ArrowRight } from 'lucide-react';
import RAGProcessVisualizer from './RAGProcessVisualizer';
import ModelCostComparison from './ModelCostComparison';

/**
 * How It Works Modal
 * Explains how RAG answered the question with technical details
 * Educational purpose: Shows embeddings, similarity scores, and the RAG process
 */

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation?: {
    questionEmbedding?: number[];
    matchedChunks?: Array<{
      embedding?: number[];
      similarity: number;
    }>;
    similarities?: number[];
  };
  performance?: {
    duration: number;
    tokens: number;
    inputTokens?: number;
    outputTokens?: number;
    tokensPerSecond: number;
  };
}

export default function HowItWorksModal({
  isOpen,
  onClose,
  explanation,
  performance,
}: HowItWorksModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[90vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto glass rounded-xl p-6 z-50"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black dark:text-white">
                🔍 How This Worked
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            <div className="space-y-6">
              {/* RAG Flow Diagram */}
              {/* Detailed Process Breakdown */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Technical Process Breakdown
                </h3>

                {/* Live Replay */}
                <div className="glass p-4 rounded-lg border border-purple-500/30 bg-purple-900/10 mb-4">
                  <h4 className="font-bold text-white mb-2">Live Replay</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="scale-75 origin-top-left">
                      <RAGProcessVisualizer step={1} message="Vectorization" metadata={{ embeddingPreview: explanation?.questionEmbedding }} />
                    </div>
                    <div className="scale-75 origin-top-left">
                      <RAGProcessVisualizer step={2} message="MemVid Search" metadata={{ chunkCount: explanation?.matchedChunks?.length }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Step 1: Vectorization */}
                  <div className="glass p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900">
                        <Binary className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                      </div>
                      <h4 className="font-bold text-black dark:text-white">1. Vectorization</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Your text is converted into a 384-dimensional vector using the <span className="text-indigo-600 dark:text-indigo-400 font-mono">all-MiniLM-L6-v2</span> model.
                    </p>
                    <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      [0.012, -0.45, 0.88, ... 381 more]
                    </div>
                  </div>

                  {/* Step 2: MemVid Search */}
                  <div className="glass p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900">
                        <Zap className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                      </div>
                      <h4 className="font-bold text-black dark:text-white">2. MemVid Search</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      We scan the optimized <strong>MemVid</strong> vector database. This structure allows for 3x faster retrieval than standard linear search.
                    </p>
                  </div>

                  {/* Step 3: Cosine Similarity */}
                  <div className="glass p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900">
                        <Calculator className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                      </div>
                      <h4 className="font-bold text-black dark:text-white">3. Cosine Similarity</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      We calculate the angle between vectors to find the best match.
                    </p>
                    <div className="text-xs text-center bg-gray-100 dark:bg-gray-800 p-2 rounded font-serif italic text-gray-600 dark:text-gray-300">
                      similarity = (A · B) / (||A|| ||B||)
                    </div>
                  </div>

                  {/* Step 4: Groq Inference */}
                  <div className="glass p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900">
                        <Brain className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                      </div>
                      <h4 className="font-bold text-black dark:text-white">4. Groq Inference</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      The retrieved context is sent to <strong>Llama 3 70B</strong> running on Groq's LPU, generating tokens at ~300/sec.
                    </p>
                  </div>
                </div>
              </div>

              {/* Question Embedding */}
              {explanation?.questionEmbedding && (
                <div className="glass rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                    Your Question Embedding
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Your question was converted into a 384-dimensional vector:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 font-mono text-xs overflow-x-auto">
                    [{explanation?.questionEmbedding?.slice(0, 10).map((v, i) => (
                      <span key={i} className="text-indigo-600 dark:text-indigo-400">
                        {v.toFixed(3)}
                        {i < 9 && ', '}
                      </span>
                    ))}
                    ... ({explanation?.questionEmbedding ? explanation.questionEmbedding.length - 10 : 0} more)]
                  </div>
                </div>
              )}

              {/* Similarity Scores */}
              {explanation?.matchedChunks && explanation.matchedChunks.length > 0 && (
                <div className="glass rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                    Similarity Scores
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    We compared your question embedding with all transcript chunks using
                    cosine similarity:
                  </p>
                  <div className="space-y-2">
                    {explanation.matchedChunks.map((chunk, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 dark:bg-gray-800 rounded p-3 flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Chunk {index + 1}
                        </span>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${chunk.similarity * 100}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className="h-full bg-indigo-500"
                            />
                          </div>
                          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 w-16 text-right">
                            {(chunk.similarity * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-950 rounded border border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">
                      <strong>Cosine Similarity Formula:</strong> cos(θ) = (A · B) / (||A|| × ||B||)
                      <br />
                      Higher score = more similar meaning (0 = different, 1 = identical)
                    </p>
                  </div>
                </div>
              )}

              {/* Performance Stats */}
              {performance && (
                <div className="glass rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div>
                      <div className="text-2xl font-bold text-indigo-500 dark:text-indigo-400">
                        {performance.duration.toFixed(2)}s
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Duration</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-indigo-500 dark:text-indigo-400">
                        {performance.tokens}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Total Tokens</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-indigo-500 dark:text-indigo-400">
                        {performance.tokensPerSecond}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Tokens/sec</div>
                    </div>
                  </div>
                  
                  {/* Cost Comparison */}
                  {performance.inputTokens && performance.outputTokens && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <ModelCostComparison
                        inputTokens={performance.inputTokens}
                        outputTokens={performance.outputTokens}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Educational Note */}
              <div className="glass rounded-lg p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                  💡 Key Insight
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  RAG (Retrieval-Augmented Generation) combines information retrieval
                  with AI generation. By searching the video transcript using semantic
                  similarity (not just keywords), we find the most relevant context
                  and provide accurate, grounded answers!
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )
      }
    </AnimatePresence >
  );
}


