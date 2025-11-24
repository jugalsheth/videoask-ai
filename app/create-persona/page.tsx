'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, FileText, Sparkles, X, ArrowLeft, ChevronRight } from 'lucide-react';

export default function CreatePersonaPage() {
  const router = useRouter();
  const [personaName, setPersonaName] = useState('');
  const [description, setDescription] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personaName.trim() || !transcript.trim()) {
      setError('Persona name and transcript are required');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Sanitize persona name for localStorage key
      const sanitizedName = personaName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      if (!sanitizedName) {
        throw new Error('Invalid persona name');
      }

      // Store persona in localStorage (client-side only)
      const personaData = {
        id: sanitizedName,
        name: personaName.trim(),
        description: description.trim() || `AI persona based on ${personaName.trim()} transcript`,
        transcript: transcript.trim(),
        createdAt: new Date().toISOString(),
        isUserCreated: true,
      };

      // Get existing user personas from localStorage
      const existingPersonas = JSON.parse(
        localStorage.getItem('userPersonas') || '[]'
      );

      // Check if persona with same ID already exists
      const existingIndex = existingPersonas.findIndex((p: any) => p.id === sanitizedName);
      if (existingIndex >= 0) {
        existingPersonas[existingIndex] = personaData;
      } else {
        existingPersonas.push(personaData);
      }

      // Save to localStorage
      localStorage.setItem('userPersonas', JSON.stringify(existingPersonas));

      // Also save transcript separately for easy access
      localStorage.setItem(`persona_transcript_${sanitizedName}`, transcript.trim());

      // Show success and redirect
      router.push(`/personas?created=${sanitizedName}&localStorage=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create persona');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
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
            <button
              onClick={() => router.push('/personas')}
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              Personas
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-black dark:text-white">Create Persona</span>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.push('/personas')}
              className="p-2 hover:bg-white/10 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Create Your AI Persona
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Upload a transcript to create a custom AI persona. The persona will use RAG to answer questions based on the transcript.
          </p>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Note:</strong> User-created personas are stored in your browser's localStorage. They are private to your device and will be lost if you clear your browser data.
            </p>
          </div>
        </motion.div>

        {/* How to Get Transcripts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-xl p-6 mb-8 border border-blue-200 dark:border-blue-500/30"
        >
          <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            How to Get Transcripts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-black dark:text-white mb-2">1. YouTube</h3>
              <p>Click three dots → "Show transcript" → Copy all text</p>
            </div>
            <div>
              <h3 className="font-semibold text-black dark:text-white mb-2">2. Podcasts</h3>
              <p>Check show notes or transcript pages on podcast websites</p>
            </div>
            <div>
              <h3 className="font-semibold text-black dark:text-white mb-2">3. TED Talks</h3>
              <p>Full transcripts available on TED.com for every talk</p>
            </div>
            <div>
              <h3 className="font-semibold text-black dark:text-white mb-2">4. AI Services</h3>
              <p>Use Otter.ai, Rev.com, or Descript for transcription</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass rounded-xl p-6 space-y-6"
        >
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 rounded-lg p-4 text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Persona Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Persona Name *
            </label>
            <input
              type="text"
              value={personaName}
              onChange={(e) => setPersonaName(e.target.value)}
              placeholder="e.g., Elon Musk Interview, Sam Altman Podcast"
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-black/30 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this persona"
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-black/30 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Transcript */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transcript *
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your transcript here..."
              rows={15}
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-black/30 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
              required
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Tip: Longer transcripts create better personas. Minimum 500 words recommended.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isUploading || !personaName.trim() || !transcript.trim()}
              className="flex-1 px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  Creating...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Create Persona
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/personas')}
              className="px-6 py-3 rounded-lg glass border border-gray-300 dark:border-white/20 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

