'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, Calculator, Zap, Database, ArrowRight, Binary } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RAGProcessVisualizerProps {
    step: number;
    message: string;
    metadata?: {
        embeddingPreview?: number[];
        chunkCount?: number;
        similarities?: number[];
        tokensPerSecond?: number;
    };
}

export default function RAGProcessVisualizer({ step, message, metadata }: RAGProcessVisualizerProps) {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    return (
        <div className="w-full max-w-3xl mx-auto my-6">
            <AnimatePresence mode="wait">
                {/* Step 1: Vectorization */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="glass p-6 rounded-xl border border-purple-500/30 bg-purple-900/10"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-purple-500/20">
                                <Binary className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Vectorization</h3>
                                <p className="text-sm text-gray-300">Converting your question into 384-dimensional coordinates</p>
                            </div>
                        </div>

                        {/* Visualizing Text to Numbers */}
                        <div className="relative h-24 bg-black/30 rounded-lg overflow-hidden flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 1, y: 0 }}
                                animate={{ opacity: 0, y: -20 }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="absolute text-xl font-mono text-white"
                            >
                                "Your Question"
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 1.2 }}
                                className="flex flex-wrap gap-2 justify-center px-4"
                            >
                                {(metadata?.embeddingPreview || [0.12, -0.45, 0.88, 0.03, -0.15]).slice(0, 8).map((num, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.5 + (i * 0.1) }}
                                        className="font-mono text-xs text-green-400 bg-green-900/20 px-1 rounded"
                                    >
                                        {num.toFixed(3)}
                                    </motion.span>
                                ))}
                                <span className="text-gray-500 text-xs">...376 more</span>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: MemVid Search */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="glass p-6 rounded-xl border border-blue-500/30 bg-blue-900/10"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-blue-500/20">
                                <Zap className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">MemVid Search</h3>
                                <p className="text-sm text-gray-300">Scanning optimized vector space for matches</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Database Scan Animation */}
                            <div className="bg-black/30 p-4 rounded-lg relative overflow-hidden h-32 flex items-center justify-center">
                                <Database className="w-16 h-16 text-gray-600" />
                                <motion.div
                                    animate={{ top: ['0%', '100%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                                />
                                <div className="absolute bottom-2 right-2 text-xs text-blue-300">
                                    {metadata?.chunkCount ? `${metadata.chunkCount} chunks` : 'Scanning...'}
                                </div>
                            </div>

                            {/* Cosine Similarity Formula */}
                            <div className="bg-black/30 p-4 rounded-lg flex flex-col items-center justify-center">
                                <div className="text-xs text-gray-400 mb-2">Cosine Similarity</div>
                                <div className="font-serif text-lg text-white italic">
                                    A · B
                                    <div className="h-px bg-white w-full my-1"></div>
                                    ||A|| ||B||
                                </div>
                                <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    className="h-1 bg-green-500 mt-3 rounded-full w-full"
                                />
                                <div className="text-xs text-green-400 mt-1">Finding closest match...</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Groq Inference */}
                {step === 3 && (
                    <motion.div
                        key="step3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="glass p-6 rounded-xl border border-orange-500/30 bg-orange-900/10"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-orange-500/20">
                                <Brain className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Groq Inference</h3>
                                <p className="text-sm text-gray-300">Generating response with LPU speed</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-black/30 p-4 rounded-lg">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400">Model</span>
                                <span className="text-white font-semibold">Llama 3 70B</span>
                            </div>
                            <ArrowRight className="text-gray-600" />
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-400">Speed</span>
                                <div className="flex items-end gap-1">
                                    <motion.span
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 0.5 }}
                                        className="text-2xl font-bold text-orange-400"
                                    >
                                        ~300
                                    </motion.span>
                                    <span className="text-xs text-orange-300 mb-1">tok/s</span>
                                </div>
                            </div>
                            <ArrowRight className="text-gray-600" />
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-gray-400">Latency</span>
                                <span className="text-green-400 font-semibold">&lt; 0.5s</span>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 text-xs text-center text-gray-500"
                        >
                            Streaming response...
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
