/**
 * API Route: /api/upload-persona
 * NOTE: File system writes are disabled for Vercel deployment compatibility.
 * User-created personas are stored in localStorage on the client side.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const transcript = formData.get('transcript') as string;
    const personaName = formData.get('name') as string;
    const description = formData.get('description') as string || '';

    if (!transcript || !personaName) {
      return NextResponse.json(
        { error: 'Transcript and persona name are required' },
        { status: 400 }
      );
    }

    // Sanitize persona name for ID
    const sanitizedName = personaName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (!sanitizedName) {
      return NextResponse.json(
        { error: 'Invalid persona name' },
        { status: 400 }
      );
    }

    // File system writes are disabled for Vercel/serverless compatibility
    // User-created personas should be stored in localStorage on the client side
    return NextResponse.json({
      success: false,
      error: 'Server-side persona creation is disabled for deployment compatibility. Please use localStorage on the client side.',
      useLocalStorage: true,
      personaId: sanitizedName,
      message: 'This feature requires client-side storage (localStorage) for deployment compatibility.',
    }, { status: 501 }); // 501 Not Implemented
  } catch (error) {
    console.error('[API /upload-persona] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process persona creation request' },
      { status: 500 }
    );
  }
}

