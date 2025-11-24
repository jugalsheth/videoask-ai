'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import ModelCostComparison from './ModelCostComparison';

/**
 * Learning Lab Component
 * Right sidebar panel showing live stats, embedding info, and learning resources
 */

interface LearningLabProps {
  embeddingDimension?: number;
  chunksSearched?: number;
  showTechnicalDetails?: boolean;
  onToggleTechnical?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  inputTokens?: number;
  outputTokens?: number;
}

export default function LearningLab({
  embeddingDimension = 384,
  chunksSearched,
  showTechnicalDetails = false,
  onToggleTechnical,
  isCollapsed = false,
  onToggleCollapse,
  inputTokens,
  outputTokens,
}: LearningLabProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'glossary' | 'quiz' | 'cost'>('stats');

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="fixed right-0 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 rounded-l-lg hover:bg-indigo-600 transition-colors z-40"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      className="w-64 xl:w-80 glass rounded-xl p-4 xl:p-6 h-fit sticky top-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-black dark:text-white">Learning Lab</h2>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['stats', 'glossary', 'quiz', 'cost'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors font-medium tracking-tight ${
              activeTab === tab
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1 font-medium tracking-tight">Embedding Dimension</div>
              <div className="text-2xl font-bold text-black dark:text-white tracking-tight">{embeddingDimension}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-relaxed">
                Each text is converted into {embeddingDimension} numbers
              </div>
            </div>

            {chunksSearched !== undefined && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1 font-medium tracking-tight">Chunks Searched</div>
                <div className="text-2xl font-bold text-black dark:text-white tracking-tight">{chunksSearched}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-relaxed">
                  Transcript chunks compared
                </div>
              </div>
            )}

            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-2 font-medium tracking-tight">Technical Details</div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTechnicalDetails}
                  onChange={onToggleTechnical}
                  className="w-4 h-4 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Show technical details</span>
              </label>
            </div>
          </motion.div>
        )}

        {activeTab === 'glossary' && (
          <motion.div
            key="glossary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3 text-sm"
          >
            {glossaryTerms.map((term) => (
              <div
                key={term.term}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{term.term}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">{term.definition}</div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <MiniQuiz />
          </motion.div>
        )}

        {activeTab === 'cost' && inputTokens && outputTokens && (
          <motion.div
            key="cost"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <ModelCostComparison
              inputTokens={inputTokens}
              outputTokens={outputTokens}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const glossaryTerms = [
  {
    term: 'Embedding',
    definition: 'A list of numbers that represents the meaning of text. Similar texts have similar numbers.',
  },
  {
    term: 'Vector',
    definition: 'Same as embedding - think of it as coordinates in meaning-space.',
  },
  {
    term: 'RAG',
    definition: 'Retrieval-Augmented Generation - giving AI your own data to work with.',
  },
  {
    term: 'Cosine Similarity',
    definition: 'How similar two embeddings are (0 = different, 1 = identical).',
  },
  {
    term: 'Chunk',
    definition: 'A piece of text, usually a few sentences or paragraphs.',
  },
  {
    term: 'Token',
    definition: 'A piece of a word that AI reads (roughly 0.75 words = 1 token).',
  },
  {
    term: 'LLM',
    definition: 'Large Language Model - the AI that writes responses (like GPT).',
  },
  {
    term: 'Groq',
    definition: 'Super-fast AI inference engine - answers in seconds not minutes.',
  },
];

function MiniQuiz() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const question = {
    question: 'What is an embedding?',
    answers: [
      'A text file',
      'A list of numbers that represents the meaning of text',
      'A type of database',
      'A programming language',
    ],
    correct: 1,
  };

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowFeedback(true);
  };

  return (
    <div className="space-y-3">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm font-semibold text-black dark:text-white mb-3">
          {question.question}
        </div>
        <div className="space-y-2">
          {question.answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showFeedback}
              className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                showFeedback && index === question.correct
                  ? 'bg-green-500 text-white'
                  : showFeedback && index === selectedAnswer && index !== question.correct
                  ? 'bg-red-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              {answer}
            </button>
          ))}
        </div>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-2 rounded bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-600 dark:text-indigo-400"
          >
            {selectedAnswer === question.correct
              ? '✓ Correct! Embeddings capture meaning as numbers.'
              : '✗ Not quite. Try again - embeddings are numbers that represent meaning!'}
          </motion.div>
        )}
      </div>
    </div>
  );
}

