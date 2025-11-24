"use client";

import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import VideoAskApp from "@/components/VideoAskApp";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Home as HomeIcon } from "lucide-react";

export default function MainLayout() {
    const [activeTab, setActiveTab] = useState<"home" | "app">("home");

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 relative">
            {/* Navigation / Tabs */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 pointer-events-none">
                <div className="pointer-events-auto">
                    {/* Logo or Brand could go here */}
                </div>

                <div className="flex items-center gap-4 pointer-events-auto bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                    <button
                        onClick={() => setActiveTab("home")}
                        className={`p-2 rounded-lg transition-all ${activeTab === "home"
                                ? "bg-indigo-500 text-white"
                                : "text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                            }`}
                        title="Home"
                    >
                        <HomeIcon size={20} />
                    </button>
                    <button
                        onClick={() => setActiveTab("app")}
                        className={`p-2 rounded-lg transition-all ${activeTab === "app"
                                ? "bg-indigo-500 text-white"
                                : "text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                            }`}
                        title="App"
                    >
                        <LayoutGrid size={20} />
                    </button>
                </div>
            </nav>

                {/* Content */}
                <main className="relative z-0">
                    <AnimatePresence mode="wait">
                        {activeTab === "home" ? (
                            <motion.div
                                key="home"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <LandingPage />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="app"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <VideoAskApp />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
        </div>
    );
}
