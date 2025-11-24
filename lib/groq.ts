/**
 * Groq API integration
 * Provides fast LLM inference for answering questions using RAG
 * 
 * Why Groq?
 * - Super fast (GPU-accelerated inference)
 * - Free tier: 14,400 requests/day
 * - Streaming support (shows answers in real-time)
 * - Low latency (<2 seconds typical)
 * - Model: llama-3.3-70b-versatile (free tier, high quality, supports RAG)
 */

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

/**
 * Generates an agentic, conversational answer using RAG (Retrieval-Augmented Generation)
 * 
 * The persona responds naturally to greetings and casual conversation,
 * while using RAG to answer questions about their knowledge base.
 * 
 * @param question - User's message/question
 * @param contextChunks - Relevant chunks from knowledge base
 * @param conversationHistory - Previous messages for context
 * @param personaName - Name of the persona (optional)
 * @param stream - Whether to stream the response (default: true)
 * @returns Answer from Groq (streaming or complete)
 */
export async function generateAnswer(
  question: string,
  contextChunks: Array<{ text: string; similarity: number; timestamp?: number }>,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  personaName?: string,
  stream: boolean = true
): Promise<AsyncIterable<string> | string> {
  console.log(`[Groq] Generating ${personaName ? 'agentic' : 'answer'} for: "${question.substring(0, 50)}..."`);
  console.log(`[Groq] Using ${contextChunks.length} context chunks, ${conversationHistory.length} previous messages`);
  
  // Check if this is a greeting or casual conversation
  const isGreeting = /^(hi|hello|hey|greetings|what's up|how are you|how's it going)/i.test(question.trim());
  
  // Build context from chunks (only if we have relevant chunks)
  const context = contextChunks.length > 0
    ? contextChunks
        .map(
          (chunk, index) =>
            `[Segment ${index + 1}${chunk.timestamp ? ` (${formatTimestamp(chunk.timestamp)})` : ''}]:\n${chunk.text}`
        )
        .join('\n\n')
    : '';
  
  // Build agentic system prompt
  const personaContext = personaName 
    ? `You are ${personaName}, an AI persona created from a transcript. You have knowledge from that transcript and can discuss it naturally.`
    : 'You are a helpful AI assistant with knowledge from a transcript.';
  
  const systemPrompt = `${personaContext}

You are conversational and agentic - respond naturally to greetings, casual conversation, and questions.

Guidelines:
- Be friendly, natural, and conversational
- Respond to greetings warmly (e.g., "Hi! Great to chat with you. What would you like to know?")
- For questions about your knowledge base, use the provided context chunks
- If context is provided, use it to answer questions accurately
- If no relevant context is found, respond conversationally but mention you don't have that information
- Maintain conversation flow and context from previous messages
- Be concise but engaging
${context ? `\nYour knowledge base (use this when relevant):\n${context}` : '\nNote: No specific context found for this message - respond conversationally.'}`;

  // Build conversation messages
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];
  
  // Add conversation history (last 5 messages to keep context manageable)
  const recentHistory = conversationHistory.slice(-5);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }
  
  // Add current message
  messages.push({ role: 'user', content: question });

  const startTime = Date.now();
  
  try {
    if (stream) {
      // Stream the response
      const completion = await groq.chat.completions.create({
        messages: messages,
        model: 'llama-3.3-70b-versatile',
        temperature: isGreeting ? 0.7 : 0.5, // More creative for greetings, balanced for questions
        max_tokens: 1000,
        stream: true,
      });
      
      // Return async generator
      return (async function* () {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            yield content;
          }
        }
        const duration = Date.now() - startTime;
        console.log(`[Groq] Answer generated in ${duration}ms (streaming)`);
      })();
    } else {
      // Non-streaming response
      const completion = await groq.chat.completions.create({
        messages: messages,
        model: 'llama-3.3-70b-versatile',
        temperature: isGreeting ? 0.7 : 0.5,
        max_tokens: 1000,
      });
      
      const answer = completion.choices[0]?.message?.content || '';
      const duration = Date.now() - startTime;
      const tokenCount = completion.usage?.total_tokens || 0;
      const tokensPerSecond = tokenCount / (duration / 1000);
      
      console.log(
        `[Groq] Answer generated in ${duration}ms (${tokenCount} tokens, ${tokensPerSecond.toFixed(0)} tokens/sec)`
      );
      
      return answer;
    }
  } catch (error) {
    console.error('[Groq] Error generating answer:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Groq API key not configured. Please set GROQ_API_KEY environment variable.');
      }
      throw new Error(`Failed to generate answer: ${error.message}`);
    }
    
    throw new Error('Failed to generate answer. Please try again.');
  }
}

/**
 * Formats timestamp (seconds) to MM:SS format
 */
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Gets Groq API status and rate limit info
 */
export async function getGroqInfo(): Promise<{
  model: string;
  status: 'available' | 'error';
  message?: string;
}> {
  try {
    // Test API with minimal request
    await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'test' }],
        model: 'llama-3.3-70b-versatile',
      max_tokens: 5,
    });
    
    return {
        model: 'llama-3.3-70b-versatile',
      status: 'available',
    };
  } catch (error) {
    return {
        model: 'llama-3.3-70b-versatile',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

