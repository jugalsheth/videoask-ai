/**
 * Persona Management System
 * Manages AI personas created from transcripts
 * Each persona is a processed transcript with embeddings
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { processManualTranscript } from './youtube';
import { chunkTranscript } from './chunking';
import { generateEmbeddings } from './embeddings';
import { storeChunks } from './vectorStore';

export interface Persona {
  id: string;
  name: string;
  description: string;
  transcriptPath: string;
  transcript?: string;
  processed: boolean;
  chunkCount?: number;
  metadata?: {
    source?: string;
    date?: string;
    duration?: number;
  };
}

/**
 * Get all available personas from transcripts directory
 */
export async function getAvailablePersonas(): Promise<Persona[]> {
  try {
    const transcriptsDir = join(process.cwd(), 'data', 'transcripts');
    
    // Check if directory exists (important for Vercel/serverless)
    try {
      await readdir(transcriptsDir);
    } catch (dirError) {
      // Directory doesn't exist or can't be read - return empty array
      console.warn('[Personas] Transcripts directory not found or not accessible:', transcriptsDir);
      return [];
    }
    
    const files = await readdir(transcriptsDir);
    const personas: Persona[] = [];
    
    for (const file of files) {
      if (file.endsWith('.txt') && file !== 'README.md') {
        const personaId = file.replace('.txt', '').toLowerCase().replace(/\s+/g, '-');
        const name = file.replace('.txt', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        personas.push({
          id: personaId,
          name,
          description: `AI persona based on ${name} transcript`,
          transcriptPath: join(transcriptsDir, file),
          processed: false,
        });
      }
    }
    
    return personas;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Personas] Error loading personas:', errorMessage, error);
    
    // Return empty array on error (graceful degradation)
    // This allows the app to continue working even if transcripts directory has issues
    return [];
  }
}

/**
 * Load transcript content for a persona
 */
export async function loadPersonaTranscript(personaId: string): Promise<string | null> {
  try {
    const personas = await getAvailablePersonas();
    const persona = personas.find(p => p.id === personaId);
    
    if (!persona) {
      console.warn(`[Personas] Persona "${personaId}" not found in available personas`);
      return null;
    }
    
    try {
      const content = await readFile(persona.transcriptPath, 'utf-8');
      return content.trim();
    } catch (fileError) {
      const errorMessage = fileError instanceof Error ? fileError.message : 'Unknown error';
      console.error(`[Personas] Error reading transcript file for ${personaId}:`, errorMessage, fileError);
      
      if (errorMessage.includes('ENOENT') || errorMessage.includes('no such file')) {
        console.error(`[Personas] File not found: ${persona.transcriptPath}`);
      }
      
      return null;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Personas] Error loading transcript for ${personaId}:`, errorMessage, error);
    return null;
  }
}

/**
 * Process a persona transcript through the RAG pipeline
 * Now uses the API endpoint for consistent processing
 */
export async function processPersona(personaId: string): Promise<{
  success: boolean;
  chunks: number;
  embeddings: number;
  error?: string;
}> {
  try {
    const transcript = await loadPersonaTranscript(personaId);
    
    if (!transcript) {
      return {
        success: false,
        chunks: 0,
        embeddings: 0,
        error: 'Transcript not found',
      };
    }
    
    // Use the API endpoint for processing (consistent with frontend)
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/process-transcript`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personaId, transcript }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Processing failed');
    }

    // Read the stream to completion
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result: any = {};

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.complete) {
                result = data;
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    }

    return {
      success: true,
      chunks: result.chunkCount || 0,
      embeddings: result.embeddingCount || 0,
    };
  } catch (error) {
    console.error(`[Personas] Error processing persona ${personaId}:`, error);
    return {
      success: false,
      chunks: 0,
      embeddings: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get persona metadata
 */
export async function getPersona(personaId: string): Promise<Persona | null> {
  const personas = await getAvailablePersonas();
  return personas.find(p => p.id === personaId) || null;
}

