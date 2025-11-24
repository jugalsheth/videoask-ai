'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Binary, Zap, Calculator, Brain, ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { getImportantTerms } from '@/lib/keywordExtraction';
import SourceEmbeddingVisualizer from './SourceEmbeddingVisualizer';
import MemVidExplanation from './MemVidExplanation';

/**
 * Dynamic RAG Explainer Component
 * Shows question-specific RAG flow visualization
 * Displays: Question → Keywords → Embedding → MemVid → Similarity → Groq
 */

interface DynamicRAGExplainerProps {
  question: string;
  keywords?: string[];
  explanation?: {
    questionEmbedding?: number[];
    matchedChunks?: Array<{
      embedding?: number[];
      similarity: number;
    }>;
    similarities?: number[];
  };
  sources?: Array<{
    segment: number;
    text: string;
    similarity: number;
    timestamp?: number;
  }>;
  performance?: {
    duration: number;
    tokens: number;
    inputTokens?: number;
    outputTokens?: number;
    tokensPerSecond: number;
  };
  chunkCount?: number;
}

export default function DynamicRAGExplainer({
  question,
  keywords: providedKeywords,
  explanation,
  sources,
  performance,
  chunkCount,
}: DynamicRAGExplainerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // Extract keywords if not provided
  const keywords = providedKeywords || getImportantTerms(question);

  // Color class mappings for Tailwind
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; bgDark: string; text: string; textDark: string }> = {
      purple: {
        bg: 'bg-purple-100',
        bgDark: 'dark:bg-purple-900',
        text: 'text-purple-600',
        textDark: 'dark:text-purple-400',
      },
      indigo: {
        bg: 'bg-indigo-100',
        bgDark: 'dark:bg-indigo-900',
        text: 'text-indigo-600',
        textDark: 'dark:text-indigo-400',
      },
      blue: {
        bg: 'bg-blue-100',
        bgDark: 'dark:bg-blue-900',
        text: 'text-blue-600',
        textDark: 'dark:text-blue-400',
      },
      green: {
        bg: 'bg-green-100',
        bgDark: 'dark:bg-green-900',
        text: 'text-green-600',
        textDark: 'dark:text-green-400',
      },
      orange: {
        bg: 'bg-orange-100',
        bgDark: 'dark:bg-orange-900',
        text: 'text-orange-600',
        textDark: 'dark:text-orange-400',
      },
    };
    return colors[color] || colors.indigo;
  };

  const steps = [
    {
      id: 1,
      title: 'Question Analysis',
      icon: Sparkles,
      color: 'purple',
      description: 'Your question was analyzed and key terms were extracted.',
    },
    {
      id: 2,
      title: 'Vectorization',
      icon: Binary,
      color: 'indigo',
      description: 'Question converted to 384-dimensional embedding vector.',
    },
    {
      id: 3,
      title: 'MemVid Search',
      icon: Zap,
      color: 'blue',
      description: 'Searched optimized MemVid vector space for matches.',
    },
    {
      id: 4,
      title: 'Cosine Similarity',
      icon: Calculator,
      color: 'green',
      description: 'Calculated similarity scores between question and chunks.',
    },
    {
      id: 5,
      title: 'Groq Inference',
      icon: Brain,
      color: 'orange',
      description: 'Generated answer using Groq LPU at ~300 tokens/sec.',
    },
  ];

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 rounded-lg border border-indigo-300 dark:border-indigo-700 transition-all"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <span className="font-semibold text-black dark:text-white text-base tracking-tight">
            How This Answer Was Generated
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              {/* Original Question */}
              <div className="glass rounded-lg p-4 border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2 text-base tracking-tight">
                      Your Question
                    </h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200 italic mb-3 leading-relaxed font-normal tracking-normal">
                      "{question}"
                    </p>
                    
                    {/* Keywords */}
                    {keywords.length > 0 && (
                      <div>
                        <p className="text-xs text-purple-700 dark:text-purple-300 mb-2 font-medium tracking-tight">
                          Extracted Keywords:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((keyword, index) => (
                            <motion.span
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded text-xs font-medium tracking-tight"
                            >
                              {keyword}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RAG Flow Steps */}
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isStepExpanded = expandedStep === step.id;
                  
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedStep(isStepExpanded ? null : step.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {(() => {
                            const colorClasses = getColorClasses(step.color);
                            return (
                              <div className={`p-2 rounded-full ${colorClasses.bg} ${colorClasses.bgDark}`}>
                                <Icon className={`w-5 h-5 ${colorClasses.text} ${colorClasses.textDark}`} />
                              </div>
                            );
                          })()}
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-black dark:text-white text-sm tracking-tight">
                                Step {step.id}: {step.title}
                              </span>
                              {index < steps.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed font-normal tracking-normal">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        {isStepExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isStepExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                              {step.id === 1 && (
                                <div className="pt-4">
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed font-normal tracking-normal">
                                    The system analyzed your question and identified these key terms:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {keywords.map((keyword, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium tracking-tight"
                                      >
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {step.id === 2 && explanation?.questionEmbedding && (
                                <div className="pt-4">
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed font-normal tracking-normal">
                                    Your question was converted into a 384-dimensional vector:
                                  </p>
                                  <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 font-mono text-xs overflow-x-auto leading-relaxed">
                                    [{explanation.questionEmbedding.slice(0, 10).map((v, i) => (
                                      <span key={i} className="text-indigo-600 dark:text-indigo-400">
                                        {v.toFixed(3)}
                                        {i < 9 && ', '}
                                      </span>
                                    ))}
                                    ... {explanation.questionEmbedding.length - 10} more dimensions]
                                  </div>
                                </div>
                              )}
                              
                              {step.id === 3 && (
                                <div className="pt-4">
                                  <MemVidExplanation chunkCount={chunkCount} />
                                </div>
                              )}
                              
                              {step.id === 4 && sources && sources.length > 0 && (
                                <div className="pt-4">
                                  <SourceEmbeddingVisualizer
                                    sources={sources}
                                    questionEmbedding={explanation?.questionEmbedding}
                                    matchedChunks={explanation?.matchedChunks}
                                  />
                                </div>
                              )}
                              
                              {step.id === 5 && performance && (
                                <div className="pt-4">
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-gray-100 dark:bg-gray-800 rounded p-3">
                                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Speed
                                      </div>
                                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        ~{performance.tokensPerSecond}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-500">
                                        tokens/sec
                                      </div>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-800 rounded p-3">
                                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Latency
                                      </div>
                                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        &lt;0.5s
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-500">
                                        first token
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-orange-50 dark:bg-orange-950 rounded p-3 border border-orange-200 dark:border-orange-800">
                                    <p className="text-xs text-orange-800 dark:text-orange-200 mb-2">
                                      <strong>Groq LPU Advantage:</strong> Groq's Language Processing Unit (LPU) provides
                                      GPU-accelerated inference that's 3-5x faster than standard text processing.
                                      This enables real-time streaming responses at ~300 tokens/second.
                                    </p>
                                    <div className="grid grid-cols-3 gap-2 text-center mt-3">
                                      <div>
                                        <div className="text-sm font-bold text-orange-700 dark:text-orange-300">
                                          {performance.inputTokens || 0}
                                        </div>
                                        <div className="text-[10px] text-orange-600 dark:text-orange-400">
                                          Input
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-sm font-bold text-orange-700 dark:text-orange-300">
                                          {performance.outputTokens || 0}
                                        </div>
                                        <div className="text-[10px] text-orange-600 dark:text-orange-400">
                                          Output
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-sm font-bold text-orange-700 dark:text-orange-300">
                                          {performance.duration.toFixed(2)}s
                                        </div>
                                        <div className="text-[10px] text-orange-600 dark:text-orange-400">
                                          Total
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

