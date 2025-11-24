/**
 * API Route: /api/personas/transcript
 * Returns transcript content for a persona
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadPersonaTranscript } from '@/lib/personas';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personaId = searchParams.get('id');
    
    if (!personaId) {
      return NextResponse.json(
        { error: 'Persona ID is required. Provide ?id=<persona-id> in the URL.' },
        { status: 400 }
      );
    }
    
    const transcript = await loadPersonaTranscript(personaId);
    
    if (!transcript) {
      return NextResponse.json(
        { error: `Transcript not found for persona "${personaId}". Make sure the transcript file exists in data/transcripts/${personaId}.txt` },
        { status: 404 }
      );
    }
    
    return new Response(transcript, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API /personas/transcript] Error:', errorMessage, error);
    
    // Provide more helpful error messages
    if (errorMessage.includes('ENOENT') || errorMessage.includes('no such file')) {
      return NextResponse.json(
        { error: `Transcript file not found. Ensure data/transcripts/ folder exists and contains the transcript file.` },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes('EACCES') || errorMessage.includes('permission denied')) {
      return NextResponse.json(
        { error: 'Permission denied reading transcript file. Check file permissions.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to load transcript: ${errorMessage}` },
      { status: 500 }
    );
  }
}

