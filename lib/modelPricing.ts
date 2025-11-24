/**
 * Model Pricing Data and Cost Calculations
 * Provides pricing information for various LLM models and cost estimation
 */

export interface ModelPricing {
  name: string;
  provider: string;
  inputPricePer1K: number; // Price per 1K input tokens
  outputPricePer1K: number; // Price per 1K output tokens
  isFree: boolean;
  description: string;
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  'groq-llama-3.3-70b': {
    name: 'Llama 3.3 70B (Groq)',
    provider: 'Groq',
    inputPricePer1K: 0,
    outputPricePer1K: 0,
    isFree: true,
    description: 'Free tier: 14,400 requests/day. Ultra-fast GPU-accelerated inference.',
  },
  'openai-gpt-4': {
    name: 'GPT-4',
    provider: 'OpenAI',
    inputPricePer1K: 0.03,
    outputPricePer1K: 0.06,
    isFree: false,
    description: 'Most capable model, best for complex reasoning tasks.',
  },
  'openai-gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    inputPricePer1K: 0.0015,
    outputPricePer1K: 0.002,
    isFree: false,
    description: 'Fast and cost-effective, good for most use cases.',
  },
  'anthropic-claude-3-opus': {
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    inputPricePer1K: 0.015,
    outputPricePer1K: 0.075,
    isFree: false,
    description: 'High-quality responses, excellent for long-form content.',
  },
  'anthropic-claude-3-sonnet': {
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    inputPricePer1K: 0.003,
    outputPricePer1K: 0.015,
    isFree: false,
    description: 'Balanced performance and cost, great for general use.',
  },
  'google-gemini-pro': {
    name: 'Gemini Pro',
    provider: 'Google',
    inputPricePer1K: 0.0005,
    outputPricePer1K: 0.0015,
    isFree: false,
    description: 'Cost-effective option with good performance.',
  },
};

export interface CostEstimate {
  modelId: string;
  model: ModelPricing;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  savings?: number; // Savings compared to most expensive option
}

/**
 * Estimate cost for a given number of input and output tokens across all models
 */
export function estimateCosts(
  inputTokens: number,
  outputTokens: number,
  currentModelId: string = 'groq-llama-3.3-70b'
): CostEstimate[] {
  const estimates: CostEstimate[] = [];

  for (const [modelId, pricing] of Object.entries(MODEL_PRICING)) {
    const inputCost = (inputTokens / 1000) * pricing.inputPricePer1K;
    const outputCost = (outputTokens / 1000) * pricing.outputPricePer1K;
    const totalCost = inputCost + outputCost;

    estimates.push({
      modelId,
      model: pricing,
      inputTokens,
      outputTokens,
      inputCost,
      outputCost,
      totalCost,
    });
  }

  // Calculate savings compared to most expensive option
  const maxCost = Math.max(...estimates.map(e => e.totalCost));
  estimates.forEach(estimate => {
    if (estimate.totalCost < maxCost) {
      estimate.savings = maxCost - estimate.totalCost;
    }
  });

  // Sort by total cost
  estimates.sort((a, b) => a.totalCost - b.totalCost);

  return estimates;
}

/**
 * Format cost as currency string
 */
export function formatCost(cost: number): string {
  if (cost === 0) return 'Free';
  if (cost < 0.001) return `$${(cost * 1000).toFixed(3)}m`; // millicents
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(4)}`;
}

/**
 * Get the current model being used
 */
export function getCurrentModel(): ModelPricing {
  return MODEL_PRICING['groq-llama-3.3-70b'];
}

