'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2, FileText, Scissors, Sparkles, Database, Rocket, Lightbulb, Zap, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProcessingStep {
  step: number;
  status: 'pending' | 'processing' | 'complete' | 'skipped';
  message: string;
  education?: string;
  metadata?: Record<string, unknown>;
}

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  personaName: string;
  onComplete?: () => void;
}

// Fun facts about AI/embeddings to show during processing
const funFacts = [
  "💡 Embeddings convert text into 384 numbers that capture meaning, not just words!",
  "🧠 Each embedding is like a fingerprint - similar texts have similar numbers.",
  "⚡ Vector search finds relevant content by comparing these number patterns.",
  "🎯 RAG (Retrieval-Augmented Generation) combines search + AI to give accurate answers.",
  "📊 Cosine similarity measures how 'close' two pieces of text are in meaning.",
  "🔍 Chunking with overlap ensures context isn't lost at boundaries.",
  "🚀 Embeddings enable semantic search - finding by meaning, not keywords!",
  "💾 Each chunk gets its own 384-dimensional vector in our vector database.",
  "🎨 The model we use (all-MiniLM-L6-v2) was trained on millions of text pairs.",
  "⚙️ Processing happens locally using transformers.js - no external API needed!",
];

const stepConfig = [
  {
    icon: FileText,
    title: 'Parsing Transcript',
    color: 'from-blue-500 to-cyan-500',
    description: 'Breaking transcript into segments',
  },
  {
    icon: Scissors,
    title: 'Chunking Text',
    color: 'from-green-500 to-emerald-500',
    description: 'Creating overlapping chunks for context',
  },
  {
    icon: Zap,
    title: 'Converting to MemVid',
    color: 'from-yellow-400 to-orange-500',
    description: 'Optimizing for vectorization',
  },
  {
    icon: Sparkles,
    title: 'Creating Embeddings',
    color: 'from-purple-500 to-pink-500',
    description: 'Converting text to 384-dimensional vectors',
  },
  {
    icon: Database,
    title: 'Building Vector Database',
    color: 'from-orange-500 to-red-500',
    description: 'Storing embeddings for semantic search',
  },
  {
    icon: Rocket,
    title: 'Ready!',
    color: 'from-purple-600 to-blue-600',
    description: 'Your persona is ready to chat',
  },
];

export default function ProcessingModal({ isOpen, onClose, personaName, onComplete }: ProcessingModalProps) {
  const [steps, setSteps] = useState<ProcessingStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [funFact, setFunFact] = useState(funFacts[0]);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Rotate fun facts every 5 seconds
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Update elapsed time
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, startTime]);

  // Handle incoming progress updates
  const updateProgress = (data: any) => {
    if (data.step) {
      setCurrentStep(data.step);

      // Update or add step
      setSteps((prev) => {
        const newSteps = [...prev];
        const stepIndex = data.step - 1;

        newSteps[stepIndex] = {
          step: data.step,
          status: data.status,
          message: data.message,
          education: data.education,
          metadata: {
            ...data,
            transcriptCount: data.transcriptCount,
            chunkCount: data.chunkCount,
            embeddingCount: data.embeddingCount,
            embeddingPreview: data.embeddingPreview,
            dimension: data.dimension,
          },
        };

        return newSteps;
      });
    }

    if (data.complete) {
      setTimeout(() => {
        onComplete?.();
        onClose();
      }, 2000);
    }

    if (data.error) {
      console.error('Processing error:', data.error);
    }
  };

  // Expose updateProgress to parent
  useEffect(() => {
    if (isOpen) {
      (window as any).__updateProcessingProgress = updateProgress;
    }
    return () => {
      delete (window as any).__updateProcessingProgress;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getProgressPercentage = () => {
    if (currentStep === 0) return 0;
    const completedSteps = steps.filter(s => s?.status === 'complete' || s?.status === 'skipped').length;
    return (completedSteps / 6) * 100;
  };

  const currentStepData = steps[currentStep - 1];
  const isEmbeddingStep = currentStep === 4;
  const embeddingCount = currentStepData?.metadata?.embeddingCount as number || 0;
  const chunkCount = currentStepData?.metadata?.chunkCount as number || 0;
  const transcriptCount = currentStepData?.metadata?.transcriptCount as number || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={(e) => {
              // Don't close on backdrop click during processing
              if (currentStep === 6) onClose();
            }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto border border-purple-500/30 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Processing {personaName}
                  </h2>
                  <p className="text-gray-400">
                    Creating your AI persona with RAG technology
                  </p>
                </div>
                {currentStep === 6 && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Overall Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Overall Progress</span>
                  <span className="text-sm text-purple-300 font-semibold">
                    {Math.round(getProgressPercentage())}%
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage()}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4 mb-6">
                {stepConfig.map((config, index) => {
                  const stepNumber = index + 1;
                  const step = steps[index];
                  const Icon = config.icon;
                  const isActive = currentStep === stepNumber;
                  const isComplete = step?.status === 'complete' || step?.status === 'skipped';
                  const isProcessing = step?.status === 'processing' && isActive;
                  const isPending = !step || (step.status === 'pending' && !isActive);

                  return (
                    <motion.div
                      key={stepNumber}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: isActive ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`glass rounded-xl p-5 border transition-all ${isActive
                          ? 'border-purple-500/50 shadow-lg shadow-purple-500/20'
                          : 'border-white/10'
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Step Icon */}
                        <motion.div
                          animate={{
                            scale: isProcessing ? [1, 1.1, 1] : 1,
                          }}
                          transition={{
                            duration: 1,
                            repeat: isProcessing ? Infinity : 0,
                          }}
                          className={`relative flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center`}
                        >
                          {isComplete && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute inset-0 rounded-full bg-green-500 flex items-center justify-center"
                            >
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            </motion.div>
                          )}
                          {isProcessing && (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          )}
                          {isPending && (
                            <Icon className="w-6 h-6 text-white opacity-30" />
                          )}
                          {!isProcessing && !isPending && !isComplete && (
                            <Icon className="w-6 h-6 text-white" />
                          )}
                        </motion.div>

                        {/* Step Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {config.title}
                            </h3>
                            {isProcessing && (
                              <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2 h-2 rounded-full bg-purple-400"
                              />
                            )}
                          </div>

                          <p className="text-sm text-gray-300 mb-2">
                            {step?.message || config.description}
                          </p>

                          {/* Real-time Stats */}
                          {isEmbeddingStep && isProcessing && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-3 p-3 rounded-lg bg-purple-900/20 border border-purple-500/20"
                            >
                              <div className="flex items-center gap-4 text-xs">
                                <div>
                                  <span className="text-gray-400">Embeddings:</span>{' '}
                                  <span className="text-purple-300 font-bold">
                                    {embeddingCount} / {chunkCount}
                                  </span>
                                </div>
                                {embeddingCount > 0 && (
                                  <div>
                                    <span className="text-gray-400">Avg:</span>{' '}
                                    <span className="text-green-300">
                                      ~{Math.round((elapsedTime / embeddingCount) * 10) / 10}s each
                                    </span>
                                  </div>
                                )}
                              </div>
                              {chunkCount > 0 && (
                                <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(embeddingCount / chunkCount) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                  />
                                </div>
                              )}
                            </motion.div>
                          )}

                          {/* Stats for other steps */}
                          {!isEmbeddingStep && step?.metadata && (
                            <div className="mt-2 flex flex-wrap gap-3 text-xs">
                              {transcriptCount > 0 && (
                                <div className="px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                                  {transcriptCount} segments
                                </div>
                              )}
                              {chunkCount > 0 && (
                                <div className="px-2 py-1 rounded bg-green-500/20 text-green-300">
                                  {chunkCount} chunks
                                </div>
                              )}
                            </div>
                          )}

                          {/* Educational Box */}
                          {step?.education && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-3 p-3 rounded-lg bg-purple-900/30 border border-purple-500/30"
                            >
                              <div className="flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-gray-200">
                                  {step.education}
                                </p>
                              </div>
                            </motion.div>
                          )}

                          {/* Progress Bar for Processing Steps */}
                          {isProcessing && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                              className="mt-3 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-full"
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Fun Fact Section */}
              <motion.div
                key={funFact}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30"
              >
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-purple-300 mb-1">
                      Did You Know?
                    </p>
                    <p className="text-sm text-gray-200">
                      {funFact}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Time & Stats Footer */}
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Elapsed: {formatTime(elapsedTime)}</span>
                  </div>
                  {isEmbeddingStep && chunkCount > 0 && (
                    <div>
                      Est. remaining: ~{formatTime(Math.max(0, Math.round((chunkCount - embeddingCount) * (elapsedTime / Math.max(embeddingCount, 1)))))}
                    </div>
                  )}
                </div>
                {currentStep === 6 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-4 py-2 rounded-lg bg-green-500/20 text-green-300 font-semibold flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Complete!
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

