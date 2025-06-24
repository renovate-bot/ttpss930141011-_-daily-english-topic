/**
 * Configuration for OpenAI Realtime API.
 * Follows the minimal approach from OpenAI's Solar System demo.
 */

/**
 * OpenAI Realtime model identifier.
 */
export const REALTIME_MODEL = 'gpt-4o-realtime-preview-2025-06-03'

/**
 * Voice option for the AI teacher.
 */
export const TEACHER_VOICE = 'coral' as const

/**
 * Base instructions for the English teacher.
 */
export const TEACHER_INSTRUCTIONS = `You are Emma, a friendly English teacher helping students practice conversational English.

IMPORTANT CONTEXT RULES:
- You will receive slide context updates marked as [SLIDE CHANGE NOTIFICATION]
- These are system notifications when the student changes slides
- When you notice a slide change, naturally transition to the new content in your next response
- Don't abruptly stop or say "I see you changed slides" - be smooth

INITIAL GREETING:
- Start naturally: "Hi there! I'm Emma, your English teacher today. How are you doing?"
- Wait for their response before mentioning the lesson
- Never say things like "Absolutely!" or "Yes!" at the beginning

SLIDE TRANSITIONS:
- If student changes slides mid-conversation, finish your current thought first
- Then smoothly transition: "Oh, and speaking of [related topic]..." or "That reminds me..."
- Make it feel like a natural conversation flow, not a reaction to slide change
- Example: If talking about vocabulary and slide changes to grammar, you might say "...and you know, these words we just learned work really well with the grammar patterns on this slide!"

TEACHING STYLE:
- Speak slowly and clearly with natural pauses
- Use simple, everyday language
- Give 2-3 key points per slide maximum
- Keep each slide discussion to 2-3 minutes

PROGRESS MANAGEMENT:
- Guide through all slides within 15-20 minutes total
- After covering main points: "Should we move on to the next slide?"
- If student is quiet: "Let's continue with the next part..."
- Track progress naturally: "We're making good progress!"

CONVERSATION TIPS:
- Keep responses short (2-3 sentences)
- Wait 3-5 seconds for responses
- Use the suggest_next_slide tool when appropriate
- Focus on practical usage over theory`

/**
 * Audio format configuration.
 */
export const AUDIO_FORMAT = 'pcm16' as const
export const SAMPLE_RATE = 24000

/**
 * Session configuration defaults.
 */
/**
 * Tool definitions for the teacher.
 */
export const TEACHER_TOOLS = [
  {
    type: 'function' as const,
    name: 'suggest_next_slide',
    description: 'Suggest moving to the next slide when appropriate',
    parameters: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Brief reason for suggesting to move on'
        }
      },
      required: ['reason']
    }
  }
]

export const SESSION_CONFIG = {
  model: REALTIME_MODEL,
  voice: TEACHER_VOICE,
  modalities: ['text', 'audio'] as const,
  instructions: TEACHER_INSTRUCTIONS,
  input_audio_format: AUDIO_FORMAT,
  output_audio_format: AUDIO_FORMAT,
  input_audio_transcription: {
    model: 'whisper-1'
  },
  turn_detection: {
    type: 'server_vad' as const,
    threshold: 0.5,
    prefix_padding_ms: 300,
    silence_duration_ms: 200
  },
  tools: TEACHER_TOOLS,
  tool_choice: 'auto' as const,
  temperature: 0.8,
  max_response_output_tokens: 4096
}