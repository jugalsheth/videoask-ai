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
      try {
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
      } catch (error) {
        // If persona not found, return 404 with JSON
        return NextResponse.json(
          { error: `Persona "${personaId}" not found` },
          { status: 404 }
        );
      }
    }
    
    // List all personas - gracefully handle filesystem errors on serverless
    let personas: any[] = [];
    try {
      personas = await getAvailablePersonas();
    } catch (error) {
      // On serverless platforms (like Vercel), filesystem may not be available
      // This is expected - just return empty array
      console.warn('[API /personas] Could not load server-side personas (expected on serverless):', error);
      personas = [];
    }
    
    // Check which ones are processed
    const personasWithStatus = personas.map((persona) => ({
      ...persona,
      processed: hasVideo(persona.id),
    }));
    
    // Always return valid JSON with personas array (even if empty)
    return NextResponse.json({ personas: personasWithStatus });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API /personas] Unexpected error:', errorMessage, error);
    
    // Always return valid JSON, never HTML
    return NextResponse.json(
      { 
        personas: [], // Return empty array so frontend doesn't break
        error: 'Failed to load server-side personas (expected on serverless platforms). Use "Create Persona" to create personas via localStorage.' 
      },
      { status: 200 } // Return 200 so frontend can still show localStorage personas
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

