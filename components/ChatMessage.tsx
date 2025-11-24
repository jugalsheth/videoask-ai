'use client';

import { motion } from 'framer-motion';
import { User, Bot, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useState } from 'react';
import DynamicRAGExplainer from './DynamicRAGExplainer';

/**
 * Chat Message Component
 * Displays a chat message with sources and "how it works" button
 */

interface Source {
  segment: number;
  text: string;
  similarity: number;
  timestamp?: number;
  endTimestamp?: number;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  question?: string;
  keywords?: string[];
  sources?: Source[];
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
  chunkCount?: number;
  onShowExplanation?: () => void;
  isStreaming?: boolean;
}

export default function ChatMessage({
  role,
  content,
  question,
  keywords,
  sources,
  explanation,
  performance,
  chunkCount,
  onShowExplanation,
  isStreaming = false,
}: ChatMessageProps) {
  const [showSources, setShowSources] = useState(false);

  const formatTimestamp = (seconds?: number): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 mb-6 ${role === 'user' ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${role === 'user'
            ? 'bg-gradient-to-br from-purple-600 to-blue-600'
            : 'bg-gradient-to-br from-green-600 to-emerald-600'
          }`}
      >
        {role === 'user' ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-black dark:text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${role === 'user' ? 'text-right' : ''}`}>
        <div
          className={`inline-block max-w-[80%] glass rounded-xl p-4 ${
            role === 'user'
              ? 'bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-500/30'
              : 'bg-emerald-50 dark:bg-green-900/30 border border-emerald-200 dark:border-green-500/30'
          }`}
        >
          {/* Message Text */}
          <div className="text-black dark:text-white whitespace-pre-wrap mb-2 text-base leading-relaxed font-normal tracking-normal">
            {content}
            {isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-purple-400 ml-1"
              />
            )}
          </div>

          {/* Sources (Assistant only) */}
          {role === 'assistant' && sources && sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium tracking-tight"
              >
                <BookOpen className="w-4 h-4" />
                <span>{sources.length} source{sources.length > 1 ? 's' : ''}</span>
                {showSources ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showSources && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-3 space-y-2"
                >
                  {sources.map((source, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg text-sm bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-700 dark:text-purple-300 font-semibold text-sm tracking-tight">
                          Segment {source.segment}
                        </span>
                        {source.timestamp && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tracking-normal">
                            {formatTimestamp(source.timestamp)}
                            {source.endTimestamp &&
                              ` - ${formatTimestamp(source.endTimestamp)}`}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-normal tracking-normal">{source.text}</p>
                      <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium tracking-tight">
                        Similarity: {(source.similarity * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* Dynamic RAG Explainer (Assistant only) */}
          {role === 'assistant' && question && (
            <div className="mt-4">
              <DynamicRAGExplainer
                question={question}
                keywords={keywords}
                explanation={explanation}
                sources={sources}
                performance={performance}
                chunkCount={chunkCount}
              />
            </div>
          )}

          {/* Legacy How It Works Button (Assistant only) - Keep for modal option */}
          {role === 'assistant' && explanation && onShowExplanation && (
            <button
              onClick={onShowExplanation}
              className="mt-3 px-4 py-2 bg-purple-100 dark:bg-purple-600/50 hover:bg-purple-200 dark:hover:bg-purple-600 rounded-lg text-sm text-purple-700 dark:text-purple-200 transition-colors flex items-center gap-2 font-medium tracking-tight"
            >
              <BookOpen className="w-4 h-4" />
              Detailed Technical View
            </button>
          )}

          {/* Performance Stats (Assistant only) */}
          {role === 'assistant' && performance && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-mono tracking-normal">
              Generated in {performance.duration.toFixed(2)}s ({performance.tokensPerSecond} tokens/sec)
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

