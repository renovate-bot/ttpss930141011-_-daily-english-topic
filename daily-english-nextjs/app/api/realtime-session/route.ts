/**
 * API endpoint for ephemeral token generation.
 * Minimal implementation following Solar System demo pattern.
 */

import { REALTIME_MODEL, TEACHER_VOICE } from '@/lib/realtime-config'

/**
 * GET /api/realtime-session
 * Returns ephemeral token for WebRTC connection.
 */
export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: REALTIME_MODEL,
        voice: TEACHER_VOICE,
      })
    })

    return new Response(response.body, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500
    })
  }
}