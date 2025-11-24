"use client";

import { motion } from "framer-motion";
import { Play, Brain, Sparkles, Video, MessageSquare, Zap, ArrowRight, GraduationCap } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 overflow-hidden">

            <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left side - Hero content */}
                    <div className="md:order-1 flex flex-col justify-center space-y-8">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg px-4 py-2 w-fit"
                        >
                            <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Learn AI by Using AI</span>
                        </motion.div>

                        {/* Main heading */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <h1 className="text-6xl md:text-7xl font-bold text-black dark:text-white leading-tight tracking-tight">
                                VideoAsk
                                <span className="text-indigo-500 dark:text-indigo-400"> AI</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
                                Ask questions about any YouTube video and discover how AI finds the answers.
                            </p>
                        </motion.div>

                        {/* Feature list */}
                        <motion.ul
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="space-y-4"
                        >
                            {[
                                { icon: Video, text: "Process YouTube videos instantly" },
                                { icon: Brain, text: "Learn RAG & vector search" },
                                { icon: MessageSquare, text: "Interactive Q&A with AI" },
                                { icon: Zap, text: "Real-time embeddings visualization" },
                                { icon: GraduationCap, text: "Educational explanations" },
                            ].map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.li
                                        key={item.text}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                        className="flex items-center gap-3 text-gray-700 dark:text-gray-300 group cursor-default"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:border-indigo-500 dark:group-hover:border-indigo-400 transition-all">
                                            <Icon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <span className="text-lg group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{item.text}</span>
                                    </motion.li>
                                );
                            })}
                        </motion.ul>

                        {/* CTA Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                            className="flex gap-4"
                        >
                            <button className="group bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-sm hover:shadow transition-all flex items-center gap-2">
                                Get Started
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center gap-2">
                                <Play className="w-5 h-5" />
                                Watch Demo
                            </button>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="flex gap-8 pt-4"
                        >
                            <div>
                                <div className="text-3xl font-bold text-black dark:text-white">100%</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Free & Open</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-black dark:text-white">Fast</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Groq Powered</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-black dark:text-white">Real</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">AI Learning</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right side - Visual showcase */}
                    <motion.div
                        className="md:order-2 relative"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        {/* Main visual card */}
                        <div className="relative bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
                            {/* Video player mockup */}
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
                                <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
                                    <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center">
                                        <Play className="w-10 h-10 text-white ml-1" />
                                    </div>
                                </div>
                            </div>

                            {/* AI Concepts cards */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { icon: Brain, label: "RAG" },
                                    { icon: Sparkles, label: "Vectors" },
                                    { icon: Zap, label: "MemVid" },
                                ].map((concept, index) => {
                                    const Icon = concept.icon;
                                    return (
                                        <motion.div
                                            key={concept.label}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                            className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 p-4 rounded-lg flex flex-col items-center gap-2 cursor-default"
                                        >
                                            <Icon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                                            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{concept.label}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
