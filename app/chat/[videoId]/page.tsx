'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Send, User, ChevronDown, Menu, BookOpen, ArrowLeft, ChevronRight } from 'lucide-react';
import ChatMessage from '@/components/ChatMessage';
import HowItWorksModal from '@/components/HowItWorksModal';
import LearningLab from '@/components/LearningLab';
import EducationalOverlay from '@/components/EducationalOverlay';
import RAGProcessVisualizer from '@/components/RAGProcessVisualizer';

/**
 * Chat Page
 * Main chat interface for asking questions about processed personas
 * Shows RAG process in action with educational features
 */

interface Message {
  role: 'user' | 'assistant';
  content: string;
  question?: string;
  keywords?: string[];
  chunkCount?: number;
  sources?: Array<{
    segment: number;
    text: string;
    similarity: number;
    timestamp?: number;
    endTimestamp?: number;
  }>;
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

export default function ChatPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = use(params);
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState<Message['explanation']>(undefined);
  const [currentPerformance, setCurrentPerformance] = useState<Message['performance']>(undefined);
  const [chunksSearched, setChunksSearched] = useState<number | undefined>(undefined);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [isLabCollapsed, setIsLabCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showEducationalOverlay, setShowEducationalOverlay] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<string | undefined>();
  // Visualization State
  const [vizStep, setVizStep] = useState(0);
  const [vizMessage, setVizMessage] = useState('');
  const [vizMetadata, setVizMetadata] = useState<any>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Update stats
    const questions = parseInt(localStorage.getItem('questionsAnswered') || '0', 10);
    localStorage.setItem('questionsAnswered', String(questions + messages.filter(m => m.role === 'assistant').length));
  }, [messages]);

  // Keyboard shortcut: Esc to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleGoBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGoBack = () => {
    // Navigate back to personas page
    router.push('/personas');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isStreaming) return;

    const userQuestion = question.trim();
    setQuestion('');

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: userQuestion,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setVizStep(1); // Start visualization
    setVizMessage('Initializing...');
    setVizMetadata({});

    // Start assistant message (streaming)
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      sources: [],
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Build conversation history (last 10 messages for context)
      const recentMessages = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Extract persona name from videoId (which is actually personaId)
      const personaName = videoId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: videoId,
          question: userQuestion,
          conversationHistory: recentMessages,
          personaName: personaName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let answerText = '';
      let currentStep = 0;
      let currentMetadata = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.step) {
                currentStep = data.step;
                setVizStep(data.step);
                if (data.message) setVizMessage(data.message);

                // Update metadata for visualizer
                if (data.embeddingPreview) {
                  currentMetadata = { ...currentMetadata, embeddingPreview: data.embeddingPreview };
                  setVizMetadata((prev: any) => ({ ...prev, embeddingPreview: data.embeddingPreview }));
                }
                if (data.chunkCount) {
                  currentMetadata = { ...currentMetadata, chunkCount: data.chunkCount };
                  setVizMetadata((prev: any) => ({ ...prev, chunkCount: data.chunkCount }));
                }
                if (data.similarities) {
                  currentMetadata = { ...currentMetadata, similarities: data.similarities };
                  setVizMetadata((prev: any) => ({ ...prev, similarities: data.similarities }));
                }

                // Update chunks searched
                if (data.chunkCount) {
                  setChunksSearched(data.chunkCount);
                }
              }

              if (data.complete) {
                // Update message with complete data
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = data.answer || answerText;
                    lastMessage.question = data.question || userQuestion;
                    lastMessage.keywords = data.keywords || [];
                    lastMessage.chunkCount = data.chunkCount;
                    lastMessage.sources = data.sources || [];
                    lastMessage.explanation = data.explanation;
                    lastMessage.performance = data.performance;
                  }
                  return newMessages;
                });

                if (data.explanation) {
                  setCurrentExplanation(data.explanation);
                }
                if (data.performance) {
                  setCurrentPerformance(data.performance);
                }

                setIsStreaming(false);
              } else if (data.chunk) {
                // Stream chunk
                answerText += data.chunk;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = answerText;
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error asking question:', error);
      setIsStreaming(false);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content = `Error: ${error instanceof Error ? error.message : 'Failed to get answer'}`;
        }
        return newMessages;
      });
    }
  };

  const handleShowExplanation = (message: Message) => {
    setCurrentExplanation(message.explanation);
    setCurrentPerformance(message.performance);
    setShowHowItWorks(true);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Sidebar */}
      {!isSidebarCollapsed && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-full lg:w-64 glass border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/10 p-4 lg:p-6 flex flex-col max-h-64 lg:max-h-none overflow-y-auto lg:overflow-y-visible"
        >
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-black dark:text-white">Persona</h2>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Persona ID: <span className="text-indigo-500 dark:text-indigo-400 font-mono">{videoId}</span>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {/* How RAG Works Accordion */}
            <div className="glass rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-3 tracking-tight">
                How RAG Works
              </h3>
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 dark:text-indigo-400 font-bold">1.</span>
                  <span className="font-medium">Question Vectorization</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 dark:text-indigo-400 font-bold">2.</span>
                  <span className="font-medium">MemVid Search</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 dark:text-indigo-400 font-bold">3.</span>
                  <span className="font-medium">Cosine Similarity</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 dark:text-indigo-400 font-bold">4.</span>
                  <span className="font-medium">Groq Inference</span>
                </div>
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="glass rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-3 tracking-tight">
                Suggested Questions
              </h3>
              <div className="space-y-2">
                {[
                  'What is the main topic?',
                  'Summarize the key points',
                  'What are the most important insights?',
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuestion(suggestion);
                      handleSubmit(new Event('submit') as any);
                    }}
                    className="w-full text-left px-3 py-2 text-xs bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium leading-relaxed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Collapse Sidebar Button */}
      {!isSidebarCollapsed && (
        <button
          onClick={() => setIsSidebarCollapsed(true)}
          className="absolute left-full top-1/2 -translate-y-1/2 p-1 bg-indigo-500 rounded-r-lg hover:bg-indigo-600 transition-colors z-40 hidden lg:block"
        >
          <ChevronDown className="w-4 h-4 text-white rotate-90" />
        </button>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="glass border-b border-gray-200 dark:border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-white/10 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
              title="Go back (Esc)"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <button
                onClick={() => router.push('/')}
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                Home
              </button>
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={() => router.push('/personas')}
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                Personas
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-black dark:text-white">Chat</span>
            </div>
            
            <h1 className="text-xl font-bold text-black dark:text-white ml-4">Chat with Persona</h1>
            <button
              onClick={() => {
                setShowEducationalOverlay(true);
                setSelectedConcept(undefined);
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Learn AI Concepts
            </button>
          </div>
          {isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-600 dark:text-gray-400 mt-20"
            >
              <p className="text-lg mb-2">Ask a question about this persona!</p>
              <p className="text-sm">Watch how RAG finds the answer in real-time.</p>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              question={message.question}
              keywords={message.keywords}
              chunkCount={message.chunkCount}
              sources={message.sources}
              explanation={message.explanation}
              performance={message.performance}
              onShowExplanation={() => handleShowExplanation(message)}
              isStreaming={isStreaming && index === messages.length - 1}
            />
          ))}
          <div ref={messagesEndRef} />

          {/* RAG Process Visualizer */}
          {isStreaming && (
            <RAGProcessVisualizer
              step={vizStep}
              message={vizMessage}
              metadata={vizMetadata}
            />
          )}
        </div>

        {/* Input Form */}
        <div className="glass border-t border-gray-200 dark:border-white/10 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about this persona..."
              className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isStreaming}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isStreaming || !question.trim()}
              className="px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
              Send
            </motion.button>
          </form>
        </div>
      </div>

      {/* Right Sidebar - Learning Lab */}
      <div className="hidden lg:block">
        <LearningLab
          embeddingDimension={384}
          chunksSearched={chunksSearched}
          showTechnicalDetails={showTechnicalDetails}
          onToggleTechnical={() => setShowTechnicalDetails(!showTechnicalDetails)}
          isCollapsed={isLabCollapsed}
          onToggleCollapse={() => setIsLabCollapsed(!isLabCollapsed)}
          inputTokens={currentPerformance?.inputTokens}
          outputTokens={currentPerformance?.outputTokens}
        />
      </div>

      {/* How It Works Modal */}
      <HowItWorksModal
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        explanation={currentExplanation || undefined}
        performance={currentPerformance || undefined}
      />

      {/* Educational Overlay */}
      <EducationalOverlay
        isOpen={showEducationalOverlay}
        onClose={() => setShowEducationalOverlay(false)}
        conceptId={selectedConcept}
      />
    </div>
  );
}

