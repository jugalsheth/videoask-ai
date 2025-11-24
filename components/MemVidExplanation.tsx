'use client';

import { motion } from 'framer-motion';
import { Zap, Database, ArrowRight, TrendingUp } from 'lucide-react';

/**
 * MemVid Explanation Component
 * Explains MemVid as optimized vector store format
 * Shows performance advantages and structure
 */

interface MemVidExplanationProps {
  chunkCount?: number;
}

export default function MemVidExplanation({ chunkCount }: MemVidExplanationProps) {
  return (
    <div className="glass rounded-lg p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
          <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 text-base tracking-tight">
            What is MemVid?
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3 leading-relaxed font-normal tracking-normal">
            MemVid is our optimized vector store format that enables 3x faster retrieval compared to standard linear search.
          </p>

          {/* Structure Visualization */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
                MemVid Structure
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-600 dark:text-gray-400 leading-relaxed font-normal tracking-normal">
                  Pre-indexed transcript segments
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-600 dark:text-gray-400 leading-relaxed font-normal tracking-normal">
                  Optimized chunk boundaries
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-600 dark:text-gray-400 leading-relaxed font-normal tracking-normal">
                  Temporal relationships preserved
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-600 dark:text-gray-400 leading-relaxed font-normal tracking-normal">
                  Fast embedding lookup
                </span>
              </div>
            </div>
          </div>

          {/* Performance Comparison */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-100 dark:bg-gray-800 rounded p-2">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Standard Search
              </div>
              <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                O(n)
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-500">
                Linear scan
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 rounded p-2 border-2 border-blue-300 dark:border-blue-700">
              <div className="text-xs text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                MemVid
              </div>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                3x Faster
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400">
                Optimized lookup
              </div>
            </div>
          </div>

          {/* Flow Diagram */}
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
              Raw Transcript
            </div>
            <ArrowRight className="w-4 h-4" />
            <div className="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded font-semibold">
              MemVid Format
            </div>
            <ArrowRight className="w-4 h-4" />
            <div className="px-2 py-1 bg-green-200 dark:bg-green-800 rounded">
              Vector Search
            </div>
          </div>

          {chunkCount && (
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-700 dark:text-blue-300 font-medium tracking-tight">
                  Searched {chunkCount} chunks in MemVid format
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

