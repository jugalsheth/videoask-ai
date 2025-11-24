'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, Sparkles, Zap, User, Plus, BookOpen } from 'lucide-react';
import ConceptTooltip from '@/components/ConceptTooltip';

/**
 * VideoAsk App Component - The main functionality
 * Educational focus: Introduces users to RAG concept
 */
export default function VideoAskApp() {
    const router = useRouter();
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [stats, setStats] = useState({ videos: 0, questions: 0 });

    useEffect(() => {
        // Load stats from localStorage
        const videos = parseInt(localStorage.getItem('videosProcessed') || '0', 10);
        const questions = parseInt(localStorage.getItem('questionsAnswered') || '0', 10);
        setStats({ videos, questions });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!youtubeUrl || isProcessing) return;

        // Validate YouTube URL
        const videoId = extractVideoId(youtubeUrl);
        if (!videoId) {
            alert('Please enter a valid YouTube URL');
            return;
        }

        setIsProcessing(true);

        // Navigate to processing page
        router.push(`/process/${videoId}?url=${encodeURIComponent(youtubeUrl)}`);
    };

    const extractVideoId = (url: string): string | null => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return null;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl w-full text-center"
            >
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="inline-block mb-6"
                    >
                        <Sparkles className="w-16 h-16 text-purple-400" />
                    </motion.div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 text-black dark:text-white">
                        Learn AI by Using AI
                    </h1>

                    <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
                        Master AI Engineering Through Hands-On Learning
                    </p>

                    <div className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
                        Create AI personas, chat with them, and learn <ConceptTooltip term="RAG">RAG</ConceptTooltip>,
                        <ConceptTooltip term="Vector Search">Vector Search</ConceptTooltip>,
                        <ConceptTooltip term="Embeddings">Embeddings</ConceptTooltip>, and more in real-time
                    </div>
                </motion.div>

                {/* Navigation Options */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-8 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
                >
                    <motion.a
                        href="/personas"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-8 py-4 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-center transition-all flex items-center justify-center gap-2"
                    >
                        <User className="w-5 h-5" />
                        Browse Personas
                    </motion.a>
                    <motion.a
                        href="/create-persona"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-8 py-4 rounded-lg glass border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Persona
                    </motion.a>
                </motion.div>

                {/* Learn Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mb-8 text-center"
                >
                    <motion.a
                        href="/learn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg glass border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        <BookOpen className="w-5 h-5" />
                        Comprehensive AI Engineering Guide
                    </motion.a>
                </motion.div>

                {/* Stats Counter */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="glass rounded-xl p-6 max-w-md mx-auto"
                >
                    <div className="flex justify-around text-center">
                        <div>
                            <div className="text-3xl font-bold text-indigo-500 dark:text-indigo-400 mb-1">
                                {stats.videos}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Videos processed</div>
                        </div>
                        <div className="w-px bg-gray-200 dark:bg-gray-700" />
                        <div>
                            <div className="text-3xl font-bold text-indigo-500 dark:text-indigo-400 mb-1">
                                {stats.questions}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Questions answered</div>
                        </div>
                    </div>
                </motion.div>

                {/* Educational Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-12 max-w-2xl mx-auto"
                >
                    <div className="glass rounded-xl p-6 text-left">
                        <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                            What is RAG?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            <strong><ConceptTooltip term="RAG">Retrieval-Augmented Generation</ConceptTooltip></strong> is a technique that combines
                            information retrieval with AI language models. Instead of relying only on
                            what the AI was trained on, RAG lets the AI search through your data (like
                            video transcripts) to find relevant information and answer questions
                            accurately. You'll see exactly how this works as you use the app!
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
