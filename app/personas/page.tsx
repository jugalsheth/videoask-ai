'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Sparkles, Database, Search, MessageSquare, Play, Plus, CheckCircle2, ArrowLeft, ChevronRight } from 'lucide-react';
import ProcessingModal from '@/components/ProcessingModal';

interface Persona {
  id: string;
  name: string;
  description: string;
  processed: boolean;
}

export default function PersonasPage() {
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [processingPersona, setProcessingPersona] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadPersonas();
    
    // Check if redirected from persona creation
    const urlParams = new URLSearchParams(window.location.search);
    const createdId = urlParams.get('created');
    const isLocalStorage = urlParams.get('localStorage');
    
    if (createdId && isLocalStorage) {
      // Show success message for localStorage-created persona
      setTimeout(() => {
        // Reload personas to include the new one
        loadPersonas();
      }, 500);
      // Clean up URL params
      window.history.replaceState({}, '', '/personas');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPersonas = async () => {
    try {
      const response = await fetch('/api/personas');
      
      // Check if response is OK, but still try to parse JSON
      let serverPersonas: Persona[] = [];
      try {
        const data = await response.json();
        serverPersonas = data.personas || [];
      } catch (parseError) {
        // If JSON parsing fails, just use empty array
        console.warn('Could not parse personas response (this is OK on serverless platforms)');
        serverPersonas = [];
      }
      
      // Load user-created personas from localStorage
      let userPersonas: Persona[] = [];
      try {
        const userPersonasStr = localStorage.getItem('userPersonas');
        userPersonas = userPersonasStr 
          ? JSON.parse(userPersonasStr).map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description || `AI persona based on ${p.name} transcript`,
              processed: false, // User personas need to be processed
            }))
          : [];
      } catch (localStorageError) {
        console.warn('Could not load localStorage personas:', localStorageError);
        userPersonas = [];
      }
      
      // Combine server and user personas
      setPersonas([...serverPersonas, ...userPersonas]);
    } catch (error) {
      console.error('Error loading personas:', error);
      // Even on error, try to load localStorage personas
      try {
        const userPersonasStr = localStorage.getItem('userPersonas');
        const userPersonas: Persona[] = userPersonasStr 
          ? JSON.parse(userPersonasStr).map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description || `AI persona based on ${p.name} transcript`,
              processed: false,
            }))
          : [];
        setPersonas(userPersonas);
      } catch (e) {
        // Last resort - just set empty array
        setPersonas([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (personaId: string) => {
    const persona = personas.find(p => p.id === personaId);
    if (!persona) return;

    setProcessing(personaId);
    setProcessingPersona({ id: personaId, name: persona.name });

    try {
      // Check if this is a user-created persona (stored in localStorage)
      const userPersonasStr = localStorage.getItem('userPersonas');
      const userPersonas = userPersonasStr ? JSON.parse(userPersonasStr) : [];
      const userPersona = userPersonas.find((p: any) => p.id === personaId);
      
      let transcript: string;
      
      if (userPersona) {
        // Load from localStorage
        transcript = userPersona.transcript || localStorage.getItem(`persona_transcript_${personaId}`) || '';
        if (!transcript) {
          throw new Error('Transcript not found in localStorage');
        }
      } else {
        // Load from server
        const transcriptResponse = await fetch(`/api/personas/transcript?id=${personaId}`);
        if (!transcriptResponse.ok) {
          throw new Error('Failed to load transcript');
        }
        transcript = await transcriptResponse.text();
      }

      // Process via API with streaming
      const processResponse = await fetch('/api/process-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId, transcript }),
      });

      if (!processResponse.ok) {
        throw new Error('Processing failed');
      }

      // Read stream and update modal
      const reader = processResponse.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                // Check for errors first
                if (data.error) {
                  console.error('[Process] Error from stream:', data.error);
                  throw new Error(data.error);
                }
                
                // Update modal progress
                if ((window as any).__updateProcessingProgress) {
                  (window as any).__updateProcessingProgress(data);
                }
                
                if (data.complete) {
                  // Reload personas to update status
                  await loadPersonas();
                  // Modal will close itself after showing completion
                  return;
                }
              } catch (e) {
                // If it's a real error, throw it; otherwise ignore parse errors
                if (e instanceof Error && e.message && !e.message.includes('Unexpected token')) {
                  throw e;
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing persona:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to process persona'}`);
      setProcessingPersona(null);
    } finally {
      setProcessing(null);
    }
  };

  const handleProcessingComplete = async () => {
    setProcessingPersona(null);
    // Reload personas to update processed status
    await loadPersonas();
  };

  const handleChat = (personaId: string) => {
    console.log('[Personas] Navigating to chat for persona:', personaId);
    router.push(`/chat/${personaId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-black dark:text-white text-xl">Loading personas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 mb-8"
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-400 mb-4">
            <button
              onClick={() => router.push('/')}
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-black dark:text-white">Personas</span>
          </div>
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => router.push('/')}
                  className="p-2 hover:bg-white/10 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                  title="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-bold text-black dark:text-white">
                  AI Personas
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Chat with AI personas created from transcripts. Each persona uses RAG (Retrieval-Augmented Generation) 
                to answer questions based on their knowledge base.
              </p>
            </div>
            <motion.a
              href="/create-persona"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <User className="w-5 h-5" />
              Create Persona
            </motion.a>
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 mb-6 border border-yellow-200 dark:border-yellow-500/30 bg-yellow-50 dark:bg-yellow-900/20"
        >
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>ℹ️ Note:</strong> Processed personas reset when the server restarts (common on free hosting). Reprocessing is fast (2-3 minutes). User-created personas are stored in your browser's localStorage and are private to your device.
          </p>
        </motion.div>

        {/* Quick Start Instructions */}
        {personas.some(p => !p.processed) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 mb-6 border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-900/20"
          >
            <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Quick Start: How to Chat
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Click <span className="text-purple-600 dark:text-purple-300 font-semibold">"Process"</span> on any persona below</li>
              <li>Wait for processing to complete (2-3 minutes for large transcripts)</li>
              <li>Once you see <span className="text-green-600 dark:text-green-300 font-semibold">"Ready to Chat"</span> badge, click <span className="text-blue-600 dark:text-blue-300 font-semibold">"Start Chatting →"</span></li>
              <li>Ask questions and see RAG in action!</li>
            </ol>
          </motion.div>
        )}

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-xl p-6 mb-8 border border-purple-200 dark:border-purple-500/30"
        >
          <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-100 dark:bg-black/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <User className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">1. Transcript</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Save transcript in data/transcripts/</p>
            </div>
            <div className="bg-gray-100 dark:bg-black/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <Database className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">2. Process</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Chunk & create embeddings</p>
            </div>
            <div className="bg-gray-100 dark:bg-black/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <Search className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">3. Vector Search</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Find relevant chunks</p>
            </div>
            <div className="bg-gray-100 dark:bg-black/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <MessageSquare className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">4. RAG Answer</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Groq generates answer</p>
            </div>
          </div>
        </motion.div>

        {/* Personas List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.length === 0 ? (
            <div className="col-span-full glass rounded-xl p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No personas found</p>
              <p className="text-sm text-gray-600 dark:text-gray-500">
                Add transcript files to <code className="bg-gray-100 dark:bg-black/30 px-2 py-1 rounded text-gray-800 dark:text-gray-300">data/transcripts/</code>
              </p>
            </div>
          ) : (
            personas.map((persona) => (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-xl p-6 border border-gray-200 dark:border-white/10 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-black dark:text-white mb-1">
                      {persona.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {persona.description}
                    </p>
                  </div>
                  {persona.processed && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 text-xs rounded-full border border-green-300 dark:border-green-500/30 font-semibold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Ready to Chat
                    </motion.span>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  {!persona.processed ? (
                    <button
                      onClick={() => handleProcess(persona.id)}
                      disabled={processing === persona.id}
                      className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {processing === persona.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Process
                        </>
                      )}
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        console.log('Chat button clicked for persona:', persona.id);
                        handleChat(persona.id);
                      }}
                      className="flex-1 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-semibold shadow-sm text-lg"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Start Chatting →
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Processing Modal */}
      {processingPersona && (
        <ProcessingModal
          isOpen={true}
          onClose={() => {
            if (processing === null) {
              setProcessingPersona(null);
            }
          }}
          personaName={processingPersona.name}
          onComplete={handleProcessingComplete}
        />
      )}
    </div>
  );
}

