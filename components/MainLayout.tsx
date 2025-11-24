"use client";

import LandingPage from "@/components/LandingPage";
import { motion } from "framer-motion";

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 relative">
            {/* Content */}
            <main className="relative z-0">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <LandingPage />
                </motion.div>
            </main>
        </div>
    );
}
