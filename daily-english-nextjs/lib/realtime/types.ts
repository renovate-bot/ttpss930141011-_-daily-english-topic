/**
 * Type definitions for OpenAI Realtime API
 * Following Google Style docstring conventions
 */

/**
 * Connection state for the realtime session
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
export type ConnectionStatus = ConnectionState | 'reconnecting';

/**
 * Audio format configuration
 */
export type AudioFormat = 'pcm16' | 'g711_ulaw' | 'g711_alaw';

/**
 * Turn detection configuration for voice activity detection
 */
export interface TurnDetection {
  type: 'server_vad';
  threshold?: number;
  prefix_padding_ms?: number;
  silence_duration_ms?: number;
}

/**
 * Session configuration for OpenAI Realtime API
 */
export interface SessionConfig {
  modalities: ('text' | 'audio')[];
  instructions: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  input_audio_format?: AudioFormat;
  output_audio_format?: AudioFormat;
  input_audio_transcription?: {
    model: 'whisper-1';
  };
  turn_detection?: TurnDetection;
  tools?: Tool[];
  tool_choice?: 'auto' | 'none' | 'required';
  temperature?: number;
  max_response_output_tokens?: number;
}

/**
 * Tool definition for function calling
 */
export interface Tool {
  type: 'function';
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * Message types in the conversation
 */
export interface ConversationItem {
  id: string;
  type: 'message' | 'function_call' | 'function_call_output';
  status?: 'completed' | 'in_progress' | 'incomplete';
  role?: 'user' | 'assistant' | 'system';
  content?: Array<{
    type: 'input_text' | 'input_audio' | 'text' | 'audio';
    text?: string;
    audio?: string;
    transcript?: string;
  }>;
  name?: string;
  call_id?: string;
  arguments?: string;
  output?: string;
}


/**
 * Base event structure
 */
interface BaseEvent {
  event_id: string;
  type: string;
}

/**
 * Session created event
 */
export interface SessionCreatedEvent extends BaseEvent {
  type: 'session.created';
  session: {
    id: string;
    object: 'realtime.session';
    model: string;
    modalities: string[];
    instructions: string;
    voice: string;
    input_audio_format: AudioFormat;
    output_audio_format: AudioFormat;
    input_audio_transcription: { model: string } | null;
    turn_detection: TurnDetection | null;
    tools: Tool[];
    tool_choice: string;
    temperature: number;
    max_response_output_tokens: number | 'inf';
  };
}

/**
 * Session updated event
 */
export interface SessionUpdatedEvent extends BaseEvent {
  type: 'session.updated';
  session: SessionCreatedEvent['session'];
}

/**
 * Conversation item created event
 */
export interface ConversationItemCreatedEvent extends BaseEvent {
  type: 'conversation.item.created';
  previous_item_id: string | null;
  item: ConversationItem;
}

/**
 * Conversation item truncated event
 */
export interface ConversationItemTruncatedEvent extends BaseEvent {
  type: 'conversation.item.truncated';
  item_id: string;
  content_index: number;
  audio_end_ms: number;
}

/**
 * Conversation item deleted event
 */
export interface ConversationItemDeletedEvent extends BaseEvent {
  type: 'conversation.item.deleted';
  item_id: string;
}

/**
 * Response created event
 */
export interface ResponseCreatedEvent extends BaseEvent {
  type: 'response.created';
  response: {
    id: string;
    object: 'realtime.response';
    status: 'in_progress';
    status_details: null;
    output: unknown[];
    usage: null;
  };
}

/**
 * Response done event
 */
export interface ResponseDoneEvent extends BaseEvent {
  type: 'response.done';
  response: {
    id: string;
    object: 'realtime.response';
    status: 'completed';
    status_details: null;
    output: ConversationItem[];
    usage: {
      total_tokens: number;
      input_tokens: number;
      output_tokens: number;
      input_token_details: {
        cached_tokens: number;
        text_tokens: number;
        audio_tokens: number;
      };
      output_token_details: {
        text_tokens: number;
        audio_tokens: number;
      };
    };
  };
}

/**
 * Response output item added event
 */
export interface ResponseOutputItemAddedEvent extends BaseEvent {
  type: 'response.output_item.added';
  response_id: string;
  output_index: number;
  item: ConversationItem;
}

/**
 * Response output item done event
 */
export interface ResponseOutputItemDoneEvent extends BaseEvent {
  type: 'response.output_item.done';
  response_id: string;
  output_index: number;
  item: ConversationItem;
}

/**
 * Response audio transcript delta event
 */
export interface ResponseAudioTranscriptDeltaEvent extends BaseEvent {
  type: 'response.audio_transcript.delta';
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
}

/**
 * Response audio delta event
 */
export interface ResponseAudioDeltaEvent extends BaseEvent {
  type: 'response.audio.delta';
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
}

/**
 * Response text delta event
 */
export interface ResponseTextDeltaEvent extends BaseEvent {
  type: 'response.text.delta';
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
}

/**
 * Response function call arguments delta event
 */
export interface ResponseFunctionCallArgumentsDeltaEvent extends BaseEvent {
  type: 'response.function_call_arguments.delta';
  response_id: string;
  item_id: string;
  output_index: number;
  call_id: string;
  delta: string;
}

/**
 * Input audio buffer committed event
 */
export interface InputAudioBufferCommittedEvent extends BaseEvent {
  type: 'input_audio_buffer.committed';
  previous_item_id: string;
  item_id: string;
}

/**
 * Input audio buffer cleared event
 */
export interface InputAudioBufferClearedEvent extends BaseEvent {
  type: 'input_audio_buffer.cleared';
}

/**
 * Input audio buffer speech started event
 */
export interface InputAudioBufferSpeechStartedEvent extends BaseEvent {
  type: 'input_audio_buffer.speech_started';
  audio_start_ms: number;
  item_id: string;
}

/**
 * Input audio buffer speech stopped event
 */
export interface InputAudioBufferSpeechStoppedEvent extends BaseEvent {
  type: 'input_audio_buffer.speech_stopped';
  audio_end_ms: number;
  item_id: string;
}

/**
 * Error event
 */
export interface ErrorEvent extends BaseEvent {
  type: 'error';
  error: {
    type: string;
    code?: string;
    message: string;
    param?: string;
    event_id?: string;
  };
}

/**
 * Conversation item input audio transcription completed event
 */
export interface ConversationItemInputAudioTranscriptionCompletedEvent extends BaseEvent {
  type: 'conversation.item.input_audio_transcription.completed';
  item_id: string;
  content_index: number;
  transcript: string;
}

/**
 * Conversation item input audio transcription in progress event
 */
export interface ConversationItemInputAudioTranscriptionInProgressEvent extends BaseEvent {
  type: 'conversation.item.input_audio_transcription.in_progress';
  item_id: string;
  content_index: number;
  transcript: string;
}

/**
 * Response audio started event
 */
export interface ResponseAudioStartedEvent extends BaseEvent {
  type: 'response.audio.started';
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
}

/**
 * Response audio done event
 */
export interface ResponseAudioDoneEvent extends BaseEvent {
  type: 'response.audio.done';
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
}

/**
 * Client-to-server event types
 */
export type ClientEvent =
  | SessionUpdateEvent
  | InputAudioBufferAppendEvent
  | InputAudioBufferCommitEvent
  | InputAudioBufferClearEvent
  | ConversationItemCreateEvent
  | ConversationItemTruncateEvent
  | ConversationItemDeleteEvent
  | ResponseCreateEvent
  | ResponseCancelEvent;

/**
 * Server-to-client event types
 */
export type ServerEvent = 
  | SessionCreatedEvent
  | SessionUpdatedEvent
  | ConversationItemCreatedEvent
  | ConversationItemTruncatedEvent
  | ConversationItemDeletedEvent
  | ConversationItemInputAudioTranscriptionCompletedEvent
  | ConversationItemInputAudioTranscriptionInProgressEvent
  | ResponseCreatedEvent
  | ResponseDoneEvent
  | ResponseOutputItemAddedEvent
  | ResponseOutputItemDoneEvent
  | ResponseAudioTranscriptDeltaEvent
  | ResponseAudioDeltaEvent
  | ResponseAudioStartedEvent
  | ResponseAudioDoneEvent
  | ResponseTextDeltaEvent
  | ResponseFunctionCallArgumentsDeltaEvent
  | InputAudioBufferCommittedEvent
  | InputAudioBufferClearedEvent
  | InputAudioBufferSpeechStartedEvent
  | InputAudioBufferSpeechStoppedEvent
  | ErrorEvent;

/**
 * Session update event (client to server)
 */
export interface SessionUpdateEvent {
  type: 'session.update';
  session: Partial<SessionConfig>;
}

/**
 * Input audio buffer append event (client to server)
 */
export interface InputAudioBufferAppendEvent {
  type: 'input_audio_buffer.append';
  audio: string;
}

/**
 * Input audio buffer commit event (client to server)
 */
export interface InputAudioBufferCommitEvent {
  type: 'input_audio_buffer.commit';
}

/**
 * Input audio buffer clear event (client to server)
 */
export interface InputAudioBufferClearEvent {
  type: 'input_audio_buffer.clear';
}

/**
 * Conversation item create event (client to server)
 */
export interface ConversationItemCreateEvent {
  type: 'conversation.item.create';
  previous_item_id?: string;
  item: {
    type: 'message' | 'function_call' | 'function_call_output';
    role?: 'user' | 'assistant' | 'system';
    content?: Array<{
      type: 'input_text' | 'input_audio';
      text?: string;
      audio?: string;
    }>;
    call_id?: string;
    output?: string;
  };
}

/**
 * Conversation item truncate event (client to server)
 */
export interface ConversationItemTruncateEvent {
  type: 'conversation.item.truncate';
  item_id: string;
  content_index: number;
  audio_end_ms: number;
}

/**
 * Conversation item delete event (client to server)
 */
export interface ConversationItemDeleteEvent {
  type: 'conversation.item.delete';
  item_id: string;
}

/**
 * Response create event (client to server)
 */
export interface ResponseCreateEvent {
  type: 'response.create';
  response?: {
    modalities?: ('text' | 'audio')[];
    instructions?: string;
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    output_audio_format?: AudioFormat;
    tools?: Tool[];
    tool_choice?: 'auto' | 'none' | 'required' | { type: 'function'; name: string };
    temperature?: number;
    max_output_tokens?: number | 'inf';
  };
}

/**
 * Response cancel event (client to server)
 */
export interface ResponseCancelEvent {
  type: 'response.cancel';
}