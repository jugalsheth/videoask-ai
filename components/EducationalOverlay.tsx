'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Sparkles, Database, Search, MessageSquare, Brain, Zap, Play, Video, GraduationCap, Calculator, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface Concept {
  id: string;
  term: string;
  title: string;
  description: string;
  howItWorks: string;
  example: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string; // Unique color for each concept
}

const concepts: Concept[] = [
  {
    id: 'rag',
    term: 'RAG',
    title: 'Retrieval-Augmented Generation',
    description: 'RAG combines information retrieval with language generation to provide accurate, context-aware answers. It prevents hallucinations by grounding responses in actual data.',
    howItWorks: '1. Your question is converted to an embedding (vector). 2. We search our knowledge base for similar content using cosine similarity. 3. Relevant chunks are retrieved (top 3 matches). 4. The LLM generates an answer using that context, preventing hallucinations.',
    example: 'Instead of the AI guessing, it finds actual relevant information from the transcript and uses it to answer. This is why RAG is preferred over fine-tuning for knowledge bases.',
    icon: Brain,
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'vector-search',
    term: 'Vector Search',
    title: 'Semantic Vector Search',
    description: 'Vector search finds content by meaning, not just keywords. Similar concepts are close together in vector space. This enables semantic understanding beyond keyword matching.',
    howItWorks: '1. Text is converted to high-dimensional vectors (embeddings) using transformer models. 2. Similar vectors are close in space (high-dimensional geometry). 3. We calculate cosine similarity: cos(θ) = (A·B)/(||A||×||B||). 4. Top results are retrieved based on similarity scores (threshold: 0.3).',
    example: 'Searching for "machine learning" will also find chunks about "AI", "neural networks", and "deep learning" because they\'re semantically similar in vector space, even without exact keyword matches.',
    icon: Search,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'embeddings',
    term: 'Embeddings',
    title: 'Text Embeddings',
    description: 'Embeddings convert text into numerical vectors that capture semantic meaning. Similar texts have similar vectors. Each dimension represents a learned feature of language.',
    howItWorks: '1. Text is tokenized (split into words/subwords using tokenizer). 2. Passed through a transformer model (all-MiniLM-L6-v2, 384 dimensions). 3. Model outputs a dense vector representation. 4. Vectors are L2-normalized (unit length) for cosine similarity calculations.',
    example: 'The sentence "I love AI" and "I adore artificial intelligence" will have very similar embedding vectors (cosine similarity ~0.9), even though the words are different. This is the power of semantic embeddings.',
    icon: Database,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'chunking',
    term: 'Chunking',
    title: 'Text Chunking',
    description: 'Breaking long documents into smaller, manageable pieces for better retrieval and processing.',
    howItWorks: '1. Transcript is split into ~500 word chunks. 2. Overlap between chunks preserves context. 3. Each chunk gets its own embedding. 4. Chunks are stored with timestamps.',
    example: 'A 1-hour video transcript becomes 50-100 chunks. When you ask a question, we search through these chunks to find the most relevant ones.',
    icon: BookOpen,
    color: 'from-orange-500 to-amber-600',
  },
  {
    id: 'llm',
    term: 'LLM',
    title: 'Large Language Model (Groq)',
    description: 'The AI model that generates answers. We use Groq for fast, free inference with llama-3.3-70b-versatile. LLMs use transformer architecture with attention mechanisms.',
    howItWorks: '1. Receives your question + retrieved context chunks as input. 2. Processes through transformer architecture (self-attention, feed-forward layers). 3. Generates answer token by token (streaming) using autoregressive generation. 4. Only uses information from provided context (RAG prevents hallucinations). 5. Temperature controls randomness (0.5 for balanced, 0.7 for creative).',
    example: 'The LLM acts like a smart assistant that can only answer based on what you tell it, preventing hallucinations. Without RAG, it might make up facts. With RAG, it grounds answers in actual data.',
    icon: MessageSquare,
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 'memvid',
    term: 'MemVid',
    title: 'MemVid Technology',
    description: 'An optimized intermediate representation of video transcripts designed for high-speed vectorization and retrieval. Reduces processing time by 3x compared to standard methods.',
    howItWorks: '1. Raw transcript is parsed into segments with timestamps. 2. Segments are structured into a "MemVid" format (optimized data structure). 3. This format allows for 3x faster chunking and embedding generation. 4. Enables real-time processing of long videos (1+ hours). 5. Maintains temporal relationships between segments.',
    example: 'Think of MemVid as a pre-indexed version of a book. Instead of reading every page to find a topic, we can instantly jump to the right chapter. This optimization makes real-time RAG possible.',
    icon: Zap,
    color: 'from-yellow-500 to-orange-600',
  },
  {
    id: 'cosine-similarity',
    term: 'Cosine Similarity',
    title: 'Cosine Similarity',
    description: 'A mathematical measure of similarity between two vectors. Measures the angle between vectors, not their magnitude. Range: -1 (opposite) to 1 (identical).',
    howItWorks: '1. Formula: cos(θ) = (A·B) / (||A|| × ||B||). 2. Dot product (A·B) measures alignment. 3. Magnitudes (||A||, ||B||) normalize the result. 4. Result is between -1 and 1. 5. Higher score = more similar meaning. We use threshold of 0.3 for relevance.',
    example: 'Two vectors pointing in the same direction have cosine similarity = 1. Perpendicular vectors = 0. Opposite directions = -1. For embeddings, we typically see 0.3-0.9 for similar content.',
    icon: Calculator,
    color: 'from-indigo-500 to-blue-600',
  },
  {
    id: 'chain-of-thought',
    term: 'Chain of Thought',
    title: 'Chain of Thought Reasoning',
    description: 'A technique where LLMs break down complex problems into intermediate reasoning steps. Improves accuracy for multi-step reasoning tasks.',
    howItWorks: '1. Problem is decomposed into smaller steps. 2. Each step is reasoned through explicitly. 3. Intermediate conclusions are generated. 4. Final answer is derived from the chain. 5. This mimics human step-by-step thinking.',
    example: 'Instead of directly answering "What is 15% of 240?", the model might think: "First, 10% of 240 is 24. Then, 5% is half of that, which is 12. So 15% is 24 + 12 = 36."',
    icon: Brain,
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'token-economics',
    term: 'Token Economics',
    title: 'Token Economics & Cost Optimization',
    description: 'Understanding how tokens are counted, priced, and optimized. Different models have different pricing structures. Token count affects both cost and latency.',
    howItWorks: '1. Tokens are subword units (roughly 0.75 words = 1 token). 2. Input tokens: question + context chunks. 3. Output tokens: generated answer. 4. Cost = (input_tokens/1000 × input_price) + (output_tokens/1000 × output_price). 5. Optimization: reduce context size, use cheaper models, cache embeddings.',
    example: 'A 1000-word question + 3000-word context = ~3000 input tokens. If GPT-4 costs $0.03/1K input, that\'s $0.09 just for input. Groq is free, saving you money!',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
  },
];

interface EducationalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  conceptId?: string;
}

export default function EducationalOverlay({ isOpen, onClose, conceptId }: EducationalOverlayProps) {
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(
    conceptId ? concepts.find(c => c.id === conceptId) || null : null
  );

  const concept = selectedConcept || concepts[0];
  const Icon = concept.icon;

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
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40"
          />

          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-24 z-50 overflow-hidden"
          >
            <div className="glass rounded-3xl h-full flex flex-col border border-white/10 shadow-2xl overflow-hidden">
              {/* Header with VideoAsk Branding */}
              <div className="relative bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-violet-600/20 border-b border-white/10 p-6 sm:p-8">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
                </div>

                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* VideoAsk Logo/Icon */}
                    <motion.div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${concept.color} flex items-center justify-center shadow-lg`}
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(147, 51, 234, 0.3)',
                          '0 0 40px rgba(147, 51, 234, 0.5)',
                          '0 0 20px rgba(147, 51, 234, 0.3)',
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Video className="w-5 h-5 text-purple-400" />
                        <span className="text-sm font-semibold text-purple-300 tracking-wide">VideoAsk AI</span>
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-1">{concept.title}</h2>
                      <p className="text-sm text-gray-300 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Learn AI by using AI on real videos
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all hover:rotate-90 duration-300"
                  >
                    <X className="w-6 h-6 text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {/* Concept Selector - Enhanced with colors */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Concepts
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {concepts.map((c) => {
                      const CIcon = c.icon;
                      const isSelected = selectedConcept?.id === c.id;
                      return (
                        <motion.button
                          key={c.id}
                          onClick={() => setSelectedConcept(c)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative p-4 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-2 ${isSelected
                              ? `bg-gradient-to-br ${c.color} text-white shadow-lg`
                              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                            }`}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="selectedConcept"
                              className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"
                              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            />
                          )}
                          <CIcon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                          <span className="relative z-10">{c.term}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Content Cards */}
                <motion.div
                  key={concept.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* What is it? */}
                  <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${concept.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">What is it?</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{concept.description}</p>
                  </div>

                  {/* How It Works in VideoAsk */}
                  <div className={`bg-gradient-to-br ${concept.color} bg-opacity-10 rounded-2xl p-6 border border-white/20 relative overflow-hidden`}>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />

                    <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          How It Works in VideoAsk
                          <Play className="w-4 h-4" />
                        </h3>
                      </div>
                      <div className="text-gray-100 leading-relaxed whitespace-pre-line bg-black/20 rounded-xl p-4 backdrop-blur-sm">
                        {concept.howItWorks}
                      </div>
                    </div>
                  </div>

                  {/* Real Example */}
                  <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-2xl p-6 border-l-4 border-yellow-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10">
                      <Video className="w-32 h-32 text-yellow-500" />
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                          <Play className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold text-yellow-300">Real Example</h3>
                      </div>
                      <p className="text-gray-200 leading-relaxed">{concept.example}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 p-4 bg-black/20">
                <p className="text-center text-sm text-gray-400">
                  💡 <span className="text-purple-400 font-medium">Pro tip:</span> Try asking questions about any YouTube video to see these concepts in action!
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

