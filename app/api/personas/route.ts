/**
 * API Route: /api/personas
 * Manages AI personas from transcripts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAvailablePersonas, processPersona, getPersona } from '@/lib/personas';
import { hasVideo } from '@/lib/vectorStore';

export const runtime = 'nodejs';

/**
 * GET: List all available personas
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personaId = searchParams.get('id');
    
    if (personaId) {
      // Get specific persona
      const persona = await getPersona(personaId);
      if (!persona) {
        return NextResponse.json(
          { error: `Persona "${personaId}" not found. Make sure the transcript file exists in data/transcripts/` },
          { status: 404 }
        );
      }
      
      // Check if processed
      persona.processed = hasVideo(personaId);
      
      return NextResponse.json({ persona });
    }
    
    // List all personas
    const personas = await getAvailablePersonas();
    
    // Check which ones are processed
    const personasWithStatus = await Promise.all(
      personas.map(async (persona) => ({
        ...persona,
        processed: hasVideo(persona.id),
      }))
    );
    
    return NextResponse.json({ personas: personasWithStatus });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API /personas] Error:', errorMessage, error);
    
    // Provide more helpful error messages
    if (errorMessage.includes('ENOENT') || errorMessage.includes('no such file')) {
      return NextResponse.json(
        { error: 'Transcripts directory not found. Ensure data/transcripts/ folder exists in your repository.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to load personas: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * POST: Process a persona
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personaId } = body;
    
    if (!personaId) {
      return NextResponse.json(
        { error: 'Persona ID is required' },
        { status: 400 }
      );
    }
    
    const result = await processPersona(personaId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to process persona' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      personaId,
      chunks: result.chunks,
      embeddings: result.embeddings,
      message: `Persona processed successfully! Created ${result.chunks} chunks with ${result.embeddings} embeddings.`,
    });
  } catch (error) {
    console.error('[API /personas] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process persona' },
      { status: 500 }
    );
  }
}

