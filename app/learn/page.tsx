'use client';

import { motion } from 'framer-motion';
import { BookOpen, Code, Database, Brain, Search, MessageSquare, Zap, Layers } from 'lucide-react';
import Link from 'next/link';

const learningPaths = [
  {
    id: 'rag',
    title: 'RAG (Retrieval-Augmented Generation)',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    description: 'Learn how RAG combines information retrieval with language models',
    topics: [
      'What is RAG and why it matters',
      'How RAG prevents hallucinations',
      'RAG architecture and components',
      'Implementing RAG in production',
      'RAG vs fine-tuning vs prompt engineering',
    ],
  },
  {
    id: 'vector-search',
    title: 'Vector Search & Embeddings',
    icon: Search,
    color: 'from-blue-500 to-cyan-500',
    description: 'Master semantic search using vector embeddings',
    topics: [
      'What are embeddings?',
      'Cosine similarity and distance metrics',
      'Vector databases (Pinecone, Weaviate, Qdrant)',
      'Embedding models comparison',
      'Optimizing vector search performance',
    ],
  },
  {
    id: 'chunking',
    title: 'Text Chunking Strategies',
    icon: Layers,
    color: 'from-green-500 to-emerald-500',
    description: 'Learn how to split documents for optimal retrieval',
    topics: [
      'Why chunking matters',
      'Chunk size optimization',
      'Overlap strategies',
      'Semantic vs syntactic chunking',
      'Chunking for different document types',
      'MemVid Technology: Optimized intermediate representation',
    ],
  },
  {
    id: 'llms',
    title: 'Large Language Models',
    icon: MessageSquare,
    color: 'from-yellow-500 to-orange-500',
    description: 'Understand LLMs, their architecture, and usage',
    topics: [
      'Transformer architecture',
      'Attention mechanisms',
      'Prompt engineering',
      'Temperature and sampling',
      'Model selection guide',
    ],
  },
  {
    id: 'production',
    title: 'Production AI Systems',
    icon: Code,
    color: 'from-red-500 to-pink-500',
    description: 'Build production-ready AI applications',
    topics: [
      'System architecture',
      'Caching and optimization',
      'Error handling',
      'Monitoring and observability',
      'Cost optimization',
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Techniques',
    icon: Zap,
    color: 'from-indigo-500 to-purple-500',
    description: 'Advanced AI engineering concepts',
    topics: [
      'Multi-agent systems',
      'Fine-tuning strategies',
      'Evaluation metrics',
      'A/B testing AI systems',
      'Future of AI engineering',
    ],
  },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-8 mb-12 text-center"
        >
          <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Engineering Mastery
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive learning paths to become a world-class AI engineer.
            Learn by doing, understand every concept deeply.
          </p>
        </motion.div>

        {/* Learning Paths */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {learningPaths.map((path, index) => {
            const Icon = path.icon;
            return (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6 border border-black/5 dark:border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${path.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {path.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {path.description}
                </p>
                <ul className="space-y-2">
                  {path.topics.map((topic, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-purple-500 dark:text-purple-300 mt-1">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* How to Use */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-xl p-8 border border-purple-500/30"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How to Use This Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-300 mb-3">1. Create a Persona</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Upload a transcript to create an AI persona. Watch as the system:
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Parses and chunks the transcript</li>
                <li>• Generates embeddings (384-dimensional vectors)</li>
                <li>• Stores in vector database</li>
                <li>• Makes it ready for RAG queries</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-300 mb-3">2. Chat & Learn</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Ask questions and see exactly how AI works:
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Watch vector search in action</li>
                <li>• See similarity scores</li>
                <li>• Understand RAG pipeline</li>
                <li>• Learn embeddings and chunking</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 text-center"
        >
          <Link
            href="/personas"
            className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Start Learning Now
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

