'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, FileText, Scissors, Sparkles, Database, Rocket, Zap } from 'lucide-react';

/**
 * Processing Pipeline Component
 * Shows 5 animated steps with progress indicators and educational content
 */

interface ProcessingStep {
  step: number;
  status: 'pending' | 'processing' | 'complete' | 'skipped';
  message: string;
  education?: string;
  metadata?: Record<string, unknown>;
}

interface ProcessingPipelineProps {
  steps: ProcessingStep[];
  currentStep: number;
}

const stepConfig = [
  {
    icon: FileText,
    title: 'Extracting Transcript',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Scissors,
    title: 'Chunking Text',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Converting to MemVid',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    icon: Sparkles,
    title: 'Creating Embeddings',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Database,
    title: 'Building Vector Database',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Rocket,
    title: 'Ready for Questions!',
    color: 'from-purple-600 to-blue-600',
  },
];

export default function ProcessingPipeline({ steps, currentStep }: ProcessingPipelineProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {stepConfig.map((config, index) => {
        const step = steps[index];
        const stepNumber = index + 1;
        const Icon = config.icon;
        const isActive = currentStep === stepNumber;
        const isComplete = step?.status === 'complete' || step?.status === 'skipped';
        const isProcessing = step?.status === 'processing';
        const isPending = !step || step.status === 'pending';

        return (
          <motion.div
            key={stepNumber}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: isActive ? 1.02 : 1,
            }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="glass rounded-xl p-6"
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
                className={`relative flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center`}
              >
                {isComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 rounded-full bg-green-500"
                  >
                    <CheckCircle2 className="w-full h-full p-2 text-white" />
                  </motion.div>
                )}
                {isProcessing && (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                )}
                {isPending && (
                  <Icon className="w-8 h-8 text-white opacity-50" />
                )}
                {isComplete && !isProcessing && (
                  <Icon className="w-8 h-8 text-white" />
                )}
              </motion.div>

              {/* Step Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-white">
                    Step {stepNumber}: {config.title}
                  </h3>
                  {isProcessing && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-purple-400"
                    />
                  )}
                </div>

                <p className="text-gray-300 mb-3">{step?.message || 'Waiting...'}</p>

                {/* Educational Box */}
                {step?.education && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 rounded-lg bg-purple-900/30 border border-purple-500/30"
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-purple-300 mb-1">
                          💡 What's happening:
                        </p>
                        <p className="text-sm text-gray-200">
                          {step.education}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Progress Bar */}
                {isProcessing && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mt-4 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  />
                )}

                {/* Metadata */}
                {step?.metadata && Object.keys(step.metadata).length > 0 && (
                  <div className="mt-3 text-xs text-gray-400">
                    {step.status === 'skipped' ? (
                      <span className="text-yellow-400">⚡ Using cached data</span>
                    ) : (
                      Object.entries(step.metadata).map(([key, value]) => (
                        <div key={key}>
                          {key}: <span className="text-purple-300">{String(value)}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

