'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';
import { motion } from 'framer-motion';
import ProcessingPipeline from '@/components/ProcessingPipeline';
import EmbeddingVisualizer from '@/components/EmbeddingVisualizer';
import confetti from 'canvas-confetti';
import { Upload, FileText, AlertCircle, ArrowLeft, ChevronRight } from 'lucide-react';

/**
 * Processing Page
 * Shows the video processing pipeline with educational content
 * Includes fallback for manual transcript input
 */

interface ProcessingStep {
  step: number;
  status: 'pending' | 'processing' | 'complete' | 'skipped';
  message: string;
  education?: string;
  metadata?: Record<string, unknown>;
}

export default function ProcessPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const youtubeUrl = searchParams.get('url') || '';

  const [steps, setSteps] = useState<ProcessingStep[]>([
    { step: 1, status: 'pending', message: 'Waiting to start...' },
    { step: 2, status: 'pending', message: 'Waiting...' },
    { step: 3, status: 'pending', message: 'Waiting...' },
    { step: 4, status: 'pending', message: 'Waiting...' },
    { step: 5, status: 'pending', message: 'Waiting...' },
    { step: 6, status: 'pending', message: 'Waiting...' },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [embeddingPreview, setEmbeddingPreview] = useState<number[] | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [showManualTranscript, setShowManualTranscript] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');

  useEffect(() => {
    if (!showManualTranscript) {
      processVideo();
    }
  }, [showManualTranscript]);

  const processVideo = async () => {
    try {
      setError(null);

      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to process video');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

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
                // Check if it's a NO_TRANSCRIPT error
                if (data.error.includes('NO_TRANSCRIPT:')) {
                  setError(data.error);
                  setShowManualTranscript(true);
                  return;
                }
                setError(data.error);
                return;
              }

              if (data.step) {
                // Update step
                setSteps((prev) => {
                  const newSteps = [...prev];
                  newSteps[data.step - 1] = {
                    step: data.step,
                    status: data.status || 'processing',
                    message: data.message || '',
                    education: data.education,
                    metadata: data.metadata || {},
                  };
                  return newSteps;
                });

                setCurrentStep(data.step);

                // Show embedding preview for step 5
                if (data.step === 5 && data.embeddingPreview) {
                  setEmbeddingPreview(data.embeddingPreview);
                }

                // Handle completion
                if (data.complete) {
                  setIsComplete(true);
                  setCurrentStep(6);

                  // Confetti animation
                  confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                  });

                  // Update stats
                  const videos = parseInt(localStorage.getItem('videosProcessed') || '0', 10);
                  localStorage.setItem('videosProcessed', String(videos + 1));

                  // Navigate to chat after 2 seconds
                  setTimeout(() => {
                    router.push(`/chat/${videoId}`);
                  }, 2000);
                }
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error processing video:', err);
      setError(err instanceof Error ? err.message : 'Failed to process video');
    }
  };

  const handleManualTranscript = async () => {
    if (!manualTranscript.trim()) {
      setError('Please enter a transcript');
      return;
    }

    try {
      setError(null);
      setShowManualTranscript(false);

      // Process manual transcript
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl,
          manualTranscript: manualTranscript.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process manual transcript');
      }

      // Continue with the same stream processing logic
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

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
                setError(data.error);
                return;
              }

              if (data.step) {
                setSteps((prev) => {
                  const newSteps = [...prev];
                  newSteps[data.step - 1] = {
                    step: data.step,
                    status: data.status || 'processing',
                    message: data.message || '',
                    education: data.education,
                    metadata: data.metadata || {},
                  };
                  return newSteps;
                });

                setCurrentStep(data.step);

                if (data.step === 4 && data.embeddingPreview) {
                  setEmbeddingPreview(data.embeddingPreview);
                }

                if (data.complete) {
                  setIsComplete(true);
                  setCurrentStep(6);

                  confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                  });

                  const videos = parseInt(localStorage.getItem('videosProcessed') || '0', 10);
                  localStorage.setItem('videosProcessed', String(videos + 1));

                  setTimeout(() => {
                    router.push(`/chat/${videoId}`);
                  }, 2000);
                }
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error processing manual transcript:', err);
      setError(err instanceof Error ? err.message : 'Failed to process manual transcript');
    }
  };

  const handleGoBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <button
            onClick={handleGoBack}
            className="hover:text-black dark:hover:text-white transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-black dark:text-white">Processing</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Left: Processing Pipeline */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={handleGoBack}
                  className="p-2 hover:bg-white/10 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                  title="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-black dark:text-white">
                  Processing Video...
                </h1>
              </div>
              <p className="text-gray-300">
                Watch as we extract, chunk, and embed the video transcript
              </p>
            </motion.div>

            {/* Manual Transcript Fallback */}
            {showManualTranscript && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-xl p-6 border border-yellow-500/30 bg-yellow-900/20"
              >
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                      No Transcript Available
                    </h3>
                    <div className="text-sm text-gray-300 mb-4 space-y-2">
                      {error && (
                        <div className="bg-black/30 rounded p-3 mb-3">
                          <p className="text-yellow-200 font-medium mb-1">Error Details:</p>
                          <p className="text-xs text-gray-400">
                            {error.replace('NO_TRANSCRIPT:', '').trim()}
                          </p>
                        </div>
                      )}
                      <p>
                        This video cannot be processed automatically. You can paste a transcript manually below,
                        or try a different public video with the "CC" button enabled.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Paste Transcript Here:
                    </label>
                    <textarea
                      value={manualTranscript}
                      onChange={(e) => setManualTranscript(e.target.value)}
                      placeholder="Paste the video transcript or transcript text here..."
                      className="w-full h-48 px-4 py-3 rounded-lg bg-black/30 dark:bg-black/30 border border-gray-300 dark:border-white/20 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Tip: You can copy transcript from YouTube by clicking the three dots → Show transcript
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleManualTranscript}
                      disabled={!manualTranscript.trim()}
                      className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Process Manual Transcript
                    </button>
                    <button
                      onClick={() => router.push('/')}
                      className="px-6 py-3 rounded-lg glass border border-gray-300 dark:border-white/20 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                      Try Different Video
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {!showManualTranscript && (
              <ProcessingPipeline steps={steps} currentStep={currentStep} />
            )}

            {error && !error.includes('NO_TRANSCRIPT') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-xl p-6 bg-red-900/30 border border-red-500/30"
              >
                <p className="text-red-300">{error}</p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Go Back
                </button>
              </motion.div>
            )}

            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-xl p-6 bg-green-900/30 border border-green-500/30"
              >
                <p className="text-green-300 font-semibold mb-2">
                  ✓ Processing complete! Redirecting to chat...
                </p>
              </motion.div>
            )}
          </div>

          {/* Right: Educational Panel with Embedding Visualizer */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl p-6 sticky top-4"
            >
              <h2 className="text-xl font-bold text-purple-300 mb-4">
                📚 Learning Panel
              </h2>

              {currentStep === 5 && embeddingPreview && (
                <EmbeddingVisualizer
                  embedding={embeddingPreview}
                  showFull={false}
                />
              )}

              {currentStep < 5 && !showManualTranscript && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/20">
                    <h3 className="text-sm font-semibold text-purple-300 mb-2">
                      What's happening?
                    </h3>
                    <p className="text-sm text-gray-300">
                      We're processing your video step by step. Each step transforms the
                      video content into a format that AI can search and understand.
                    </p>
                  </div>
                </div>
              )}

              {showManualTranscript && (
                <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/20">
                  <h3 className="text-sm font-semibold text-blue-300 mb-2">
                    💡 Manual Transcript Option
                  </h3>
                  <p className="text-sm text-gray-300">
                    If a video doesn't have captions, you can:
                    <br />1. Copy the transcript from YouTube (three dots → Show transcript)
                    <br />2. Or paste any text content you want to ask questions about
                  </p>
                </div>
              )}

              {currentStep === 6 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-green-900/20 border border-green-500/20"
                >
                  <h3 className="text-sm font-semibold text-green-300 mb-2">
                    🎉 Ready to ask questions!
                  </h3>
                  <p className="text-sm text-gray-300">
                    Your video has been processed. You can now ask questions about it,
                    and we'll show you exactly how RAG finds the answers!
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
