/**
 * Teaching context system for English learning sessions
 * Manages the AI teacher's personality, teaching strategies, and slide context
 */

import { Topic, Slide } from '@/lib/topics'
import { ConversationItem } from './types'

/**
 * Teaching style configuration
 */
export interface TeachingStyle {
  personality: 'friendly' | 'professional' | 'encouraging' | 'casual';
  speakingPace: 'slow' | 'normal' | 'dynamic';
  correctionStyle: 'gentle' | 'direct' | 'detailed';
  encouragementLevel: 'high' | 'moderate' | 'minimal';
}

/**
 * Student profile for personalized teaching
 */
export interface StudentProfile {
  level: 'beginner' | 'intermediate' | 'advanced';
  nativeLanguage: string;
  learningGoals: string[];
  weakPoints?: string[];
  strengths?: string[];
}

/**
 * Slide transition strategy
 */
export interface SlideTransition {
  type: 'introduction' | 'continuation' | 'summary' | 'practice';
  previousSlide?: number;
  nextSlide?: number;
  transitionPhrase?: string;
}

/**
 * Teaching focus for the current slide
 */
export interface TeachingFocus {
  primaryGoal: string;
  vocabularyFocus: string[];
  grammarPoints: string[];
  pronunciationTargets: string[];
  culturalNotes?: string[];
}

/**
 * Complete teaching context for a session
 */
export interface TeachingContext {
  topic: Topic;
  currentSlide: Slide;
  slideIndex: number;
  teachingStyle: TeachingStyle;
  studentProfile: StudentProfile;
  slideTransition: SlideTransition;
  teachingFocus: TeachingFocus;
  sessionGoals: string[];
  conversationHistory: ConversationMemory[];
}

/**
 * Conversation memory for context awareness
 */
export interface ConversationMemory {
  timestamp: number;
  speaker: 'student' | 'teacher';
  content: string;
  corrections?: GrammarCorrection[];
  teachingPoints?: string[];
}

/**
 * Grammar correction record
 */
export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
  type: 'grammar' | 'pronunciation' | 'vocabulary' | 'expression';
}

/**
 * Teaching context builder following Builder pattern
 */
export class TeachingContextBuilder {
  private context: Partial<TeachingContext> = {};

  /**
   * Set the topic and current slide
   */
  withTopic(topic: Topic, slideIndex: number): this {
    this.context.topic = topic;
    this.context.slideIndex = slideIndex;
    this.context.currentSlide = topic.slides[slideIndex];
    return this;
  }

  /**
   * Set teaching style
   */
  withTeachingStyle(style: Partial<TeachingStyle>): this {
    this.context.teachingStyle = {
      personality: style.personality || 'friendly',
      speakingPace: style.speakingPace || 'normal',
      correctionStyle: style.correctionStyle || 'gentle',
      encouragementLevel: style.encouragementLevel || 'high',
    };
    return this;
  }

  /**
   * Set student profile
   */
  withStudentProfile(profile: StudentProfile): this {
    this.context.studentProfile = profile;
    return this;
  }

  /**
   * Set slide transition context
   */
  withSlideTransition(previousIndex?: number, nextIndex?: number): this {
    const slideCount = this.context.topic?.slides.length || 0;
    const currentIndex = this.context.slideIndex || 0;

    let type: SlideTransition['type'] = 'continuation';
    if (currentIndex === 0) type = 'introduction';
    else if (currentIndex === slideCount - 1) type = 'summary';
    else if (this.context.currentSlide?.content.includes('practice')) type = 'practice';

    this.context.slideTransition = {
      type,
      previousSlide: previousIndex,
      nextSlide: nextIndex,
      transitionPhrase: this.generateTransitionPhrase(type, currentIndex, slideCount),
    };
    return this;
  }

  /**
   * Extract teaching focus from slide content
   */
  withTeachingFocus(): this {
    if (!this.context.currentSlide) return this;

    const content = this.context.currentSlide.content;
    
    // Extract vocabulary (words in bold or quotes)
    const vocabularyMatches = content.match(/\*\*(.*?)\*\*|"(.*?)"/g) || [];
    const vocabulary = vocabularyMatches.map(match => 
      match.replace(/\*\*|"/g, '')
    ).filter(word => word.length > 2);

    // Extract grammar points (common patterns)
    const grammarPatterns = [
      /\b(present perfect|past tense|future tense|conditional)\b/gi,
      /\b(would|could|should|might)\b/gi,
      /\b(have been|has been|had been)\b/gi,
    ];
    const grammarPoints: string[] = [];
    grammarPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) grammarPoints.push(...matches);
    });

    // Determine primary goal based on slide type
    let primaryGoal = 'Practice conversational English';
    if (content.includes('pronunciation')) {
      primaryGoal = 'Master pronunciation techniques';
    } else if (content.includes('vocabulary')) {
      primaryGoal = 'Expand vocabulary knowledge';
    } else if (content.includes('grammar')) {
      primaryGoal = 'Understand grammar structures';
    } else if (content.includes('culture')) {
      primaryGoal = 'Learn cultural context';
    }

    this.context.teachingFocus = {
      primaryGoal,
      vocabularyFocus: [...new Set(vocabulary)].slice(0, 5),
      grammarPoints: [...new Set(grammarPoints)].slice(0, 3),
      pronunciationTargets: this.extractPronunciationTargets(content),
      culturalNotes: this.extractCulturalNotes(content),
    };
    return this;
  }

  /**
   * Set session goals based on topic
   */
  withSessionGoals(): this {
    const topic = this.context.topic;
    if (!topic) return this;

    const goals = [
      `Understand and discuss "${topic.title}"`,
      'Practice natural English conversation',
      'Learn relevant vocabulary and expressions',
      'Improve pronunciation and fluency',
    ];

    if (this.context.studentProfile?.learningGoals) {
      goals.push(...this.context.studentProfile.learningGoals);
    }

    this.context.sessionGoals = goals;
    return this;
  }

  /**
   * Build the complete teaching context
   */
  build(): TeachingContext {
    if (!this.context.topic || this.context.slideIndex === undefined) {
      throw new Error('Topic and slide index are required');
    }

    return {
      topic: this.context.topic,
      currentSlide: this.context.currentSlide!,
      slideIndex: this.context.slideIndex,
      teachingStyle: this.context.teachingStyle || this.getDefaultTeachingStyle(),
      studentProfile: this.context.studentProfile || this.getDefaultStudentProfile(),
      slideTransition: this.context.slideTransition || { type: 'introduction' },
      teachingFocus: this.context.teachingFocus || this.getDefaultTeachingFocus(),
      sessionGoals: this.context.sessionGoals || [],
      conversationHistory: [],
    };
  }

  /**
   * Generate appropriate transition phrase
   */
  private generateTransitionPhrase(
    type: SlideTransition['type'],
    current: number,
    total: number
  ): string {
    switch (type) {
      case 'introduction':
        return "Welcome! Let's explore today's topic together.";
      case 'continuation':
        return `Great progress! Now let's look at slide ${current + 1} of ${total}.`;
      case 'summary':
        return "Let's review what we've learned today.";
      case 'practice':
        return "Time to practice! Let's apply what we've learned.";
      default:
        return "Let's continue with the next part.";
    }
  }

  /**
   * Extract pronunciation targets from content
   */
  private extractPronunciationTargets(content: string): string[] {
    const targets: string[] = [];
    
    // Look for IPA notations or pronunciation guides
    const ipaMatches = content.match(/\/[^/]+\//g) || [];
    targets.push(...ipaMatches.map(m => m.replace(/\//g, '')));

    // Common pronunciation challenges
    const challengeWords = ['th', 'r', 'l', 'v', 'w'];
    challengeWords.forEach(sound => {
      if (content.toLowerCase().includes(sound)) {
        targets.push(`${sound} sound`);
      }
    });

    return [...new Set(targets)].slice(0, 3);
  }

  /**
   * Extract cultural notes from content
   */
  private extractCulturalNotes(content: string): string[] {
    const notes: string[] = [];
    
    const culturalKeywords = [
      'culture', 'tradition', 'custom', 'etiquette',
      'polite', 'formal', 'informal', 'context'
    ];

    culturalKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        const sentences = content.split('.');
        const relevant = sentences.filter(s => 
          s.toLowerCase().includes(keyword)
        );
        notes.push(...relevant.map(s => s.trim()).filter(s => s.length > 10));
      }
    });

    return notes.slice(0, 2);
  }

  /**
   * Get default teaching style
   */
  private getDefaultTeachingStyle(): TeachingStyle {
    return {
      personality: 'friendly',
      speakingPace: 'normal',
      correctionStyle: 'gentle',
      encouragementLevel: 'high',
    };
  }

  /**
   * Get default student profile
   */
  private getDefaultStudentProfile(): StudentProfile {
    return {
      level: 'intermediate',
      nativeLanguage: 'zh-TW',
      learningGoals: [
        'Improve conversational fluency',
        'Expand vocabulary',
        'Better pronunciation',
      ],
    };
  }

  /**
   * Get default teaching focus
   */
  private getDefaultTeachingFocus(): TeachingFocus {
    return {
      primaryGoal: 'Practice conversational English',
      vocabularyFocus: [],
      grammarPoints: [],
      pronunciationTargets: [],
    };
  }
}

/**
 * Generate system instructions for OpenAI based on teaching context
 */
export function generateSystemInstructions(context: TeachingContext): string {
  const { teachingStyle, studentProfile, currentSlide, teachingFocus, slideTransition } = context;
  
  return `You are an experienced English teacher having a voice conversation with your student.

## Your Personality and Teaching Style
- Personality: ${teachingStyle.personality} and ${teachingStyle.encouragementLevel} encouragement
- Speaking pace: ${teachingStyle.speakingPace}
- Correction style: ${teachingStyle.correctionStyle} corrections
- Always maintain natural conversation flow

## Student Profile
- Level: ${studentProfile.level}
- Native language: ${studentProfile.nativeLanguage}
- Learning goals: ${studentProfile.learningGoals.join(', ')}

## Current Lesson Context
- Topic: "${context.topic.title}"
- Current slide (${context.slideIndex + 1}/${context.topic.slides.length}): ${slideTransition.type}
- Slide content for reference: """
${currentSlide.content}
"""

## Teaching Focus for This Slide
- Primary goal: ${teachingFocus.primaryGoal}
- Key vocabulary: ${teachingFocus.vocabularyFocus.join(', ') || 'As appears in content'}
- Grammar focus: ${teachingFocus.grammarPoints.join(', ') || 'Natural usage'}
- Pronunciation: ${teachingFocus.pronunciationTargets.join(', ') || 'Clear articulation'}

## Conversation Guidelines
1. Start with: "${slideTransition.transitionPhrase}"
2. Guide the conversation naturally around the slide content
3. Ask engaging questions to encourage speaking
4. Provide ${teachingStyle.correctionStyle} corrections by naturally rephrasing
5. Use ${studentProfile.level}-appropriate language
6. Give examples from daily life
7. Praise effort and progress with ${teachingStyle.encouragementLevel} encouragement

## Important Rules
- Keep responses concise (2-3 sentences max)
- Speak naturally, not like reading from a textbook
- React genuinely to what students say
- If student struggles, offer simpler alternatives
- Focus on communication over perfection
- Use the slide content as a conversation starter, not a script

Remember: You're having a friendly conversation to help the student practice English, not giving a lecture.`;
}

/**
 * Update teaching context based on conversation
 */
export function updateContextWithConversation(
  context: TeachingContext,
  message: string,
  speaker: 'student' | 'teacher',
  corrections?: GrammarCorrection[]
): TeachingContext {
  const memory: ConversationMemory = {
    timestamp: Date.now(),
    speaker,
    content: message,
    corrections,
  };

  return {
    ...context,
    conversationHistory: [...context.conversationHistory, memory],
  };
}

/**
 * Teaching Context Manager for handling slide content and teaching flow.
 * Follows Single Responsibility Principle by managing only teaching context.
 */
export class TeachingContextManager {
  private currentContext: TeachingContext | null = null
  private builder = new TeachingContextBuilder()

  constructor(private options: { style?: 'beginner' | 'intermediate' | 'advanced' }) {}

  /**
   * Sets the slide content and builds initial context.
   */
  setSlideContent(slideContent: string, topic?: Topic, slideIndex?: number): void {
    // Parse slide content to extract topic if not provided
    const parsedTopic = topic || this.parseTopicFromContent(slideContent)
    const index = slideIndex ?? 0

    this.currentContext = this.builder
      .withTopic(parsedTopic, index)
      .withTeachingStyle(this.getStyleForLevel(this.options.style || 'intermediate'))
      .withStudentProfile({
        level: this.options.style || 'intermediate',
        nativeLanguage: 'zh-TW',
        learningGoals: [
          'Improve conversational fluency',
          'Expand vocabulary',
          'Better pronunciation'
        ]
      })
      .withSlideTransition()
      .withTeachingFocus()
      .withSessionGoals()
      .build()
  }

  /**
   * Generates system instructions for the AI teacher.
   */
  generateSystemInstructions(): string {
    if (!this.currentContext) {
      throw new Error('Context not initialized. Call setSlideContent first.')
    }
    return generateSystemInstructions(this.currentContext)
  }

  /**
   * Adds conversation item to memory.
   */
  addToMemory(item: ConversationItem): void {
    if (!this.currentContext) return

    const speaker = item.role === 'user' ? 'student' : 'teacher'
    const content = item.content?.find(c => c.type === 'text')?.text || ''
    
    this.currentContext = updateContextWithConversation(
      this.currentContext,
      content,
      speaker
    )
  }

  /**
   * Updates teaching style dynamically.
   */
  updateStyle(style: 'beginner' | 'intermediate' | 'advanced'): void {
    if (!this.currentContext) return

    this.currentContext = {
      ...this.currentContext,
      teachingStyle: this.getStyleForLevel(style),
      studentProfile: {
        ...this.currentContext.studentProfile,
        level: style
      }
    }
  }

  /**
   * Gets the current teaching context.
   */
  getContext(): TeachingContext | null {
    return this.currentContext
  }

  /**
   * Checks if slide transition is needed.
   */
  shouldTransitionSlide(): boolean {
    return this.currentContext ? shouldTransitionSlide(this.currentContext) : false
  }

  private getStyleForLevel(level: 'beginner' | 'intermediate' | 'advanced'): TeachingStyle {
    switch (level) {
      case 'beginner':
        return {
          personality: 'encouraging',
          speakingPace: 'slow',
          correctionStyle: 'gentle',
          encouragementLevel: 'high'
        }
      case 'advanced':
        return {
          personality: 'professional',
          speakingPace: 'dynamic',
          correctionStyle: 'detailed',
          encouragementLevel: 'moderate'
        }
      default:
        return {
          personality: 'friendly',
          speakingPace: 'normal',
          correctionStyle: 'gentle',
          encouragementLevel: 'high'
        }
    }
  }

  private parseTopicFromContent(content: string): Topic {
    // Simple parsing for demo - in real app this would be more sophisticated
    const lines = content.split('\n')
    const title = lines[0]?.replace(/^#\s*/, '') || 'English Practice'
    
    return {
      title,
      date: new Date().toISOString().split('T')[0],
      slides: [{ content, type: 'content' }],
      tags: [],
      description: 'Voice conversation practice'
    } as Topic
  }
}

/**
 * Analyze if slide transition is needed based on conversation
 */
export function shouldTransitionSlide(context: TeachingContext): boolean {
  const recentHistory = context.conversationHistory.slice(-10);
  
  // Check if current topic has been adequately discussed
  const topicCoverage = recentHistory.filter(m => 
    m.speaker === 'student' && m.content.length > 20
  ).length;
  
  // Check if key vocabulary has been used
  const vocabUsed = context.teachingFocus.vocabularyFocus.filter(word =>
    recentHistory.some(m => m.content.toLowerCase().includes(word.toLowerCase()))
  ).length;

  // Transition if good coverage and practice
  return topicCoverage >= 3 && vocabUsed >= context.teachingFocus.vocabularyFocus.length * 0.6;
}