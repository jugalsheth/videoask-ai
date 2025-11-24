'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, Zap, Info } from 'lucide-react';
import { CostEstimate, formatCost, estimateCosts } from '@/lib/modelPricing';

interface ModelCostComparisonProps {
  inputTokens: number;
  outputTokens: number;
  currentModelId?: string;
}

export default function ModelCostComparison({
  inputTokens,
  outputTokens,
  currentModelId = 'groq-llama-3.3-70b',
}: ModelCostComparisonProps) {
  const estimates = estimateCosts(inputTokens, outputTokens, currentModelId);
  const currentEstimate = estimates.find(e => e.modelId === currentModelId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-lg font-semibold text-black dark:text-white">
          Cost Comparison
        </h3>
      </div>

      {/* Current Model Highlight */}
      {currentEstimate && (
        <div className="glass rounded-lg p-4 border-2 border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                Current Model: {currentEstimate.model.name}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {currentEstimate.model.description}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatCost(currentEstimate.totalCost)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {inputTokens.toLocaleString()} in + {outputTokens.toLocaleString()} out tokens
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Compare with other models:
        </div>
        {estimates.map((estimate, index) => {
          const isCurrent = estimate.modelId === currentModelId;
          const isCheapest = index === 0;
          
          return (
            <motion.div
              key={estimate.modelId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass rounded-lg p-3 border ${
                isCurrent
                  ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950'
                  : isCheapest
                  ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-950'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-black dark:text-white">
                      {estimate.model.name}
                    </span>
                    {isCurrent && (
                      <span className="text-xs px-2 py-0.5 bg-indigo-500 text-white rounded">
                        Current
                      </span>
                    )}
                    {isCheapest && !isCurrent && (
                      <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Cheapest
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {estimate.model.provider}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-black dark:text-white">
                    {formatCost(estimate.totalCost)}
                  </div>
                  {estimate.savings && estimate.savings > 0 && (
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Save {formatCost(estimate.savings)}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Breakdown */}
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Input: {formatCost(estimate.inputCost)}</span>
                  <span>Output: {formatCost(estimate.outputCost)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="glass rounded-lg p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Note:</strong> These are estimated costs based on token counts. Actual costs may vary.
            Groq offers free tier with 14,400 requests/day. Other models require paid API access.
          </div>
        </div>
      </div>
    </div>
  );
}

