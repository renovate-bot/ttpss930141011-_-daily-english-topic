import { NextRequest, NextResponse } from 'next/server'
import { DictionaryEntry } from '@/stores/useWordLookupStore'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface FreeDictionaryResponse {
  word: string
  phonetics: Array<{
    text?: string
    audio?: string
  }>
  meanings: Array<{
    partOfSpeech: string
    definitions: Array<{
      definition: string
      example?: string
    }>
  }>
}

// Initialize Gemini AI if API key is available
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

import { getLanguageName } from '@/lib/language-utils'

async function translateDefinitionWithGemini(definition: string, targetLanguage: string): Promise<string> {
  if (!genAI) {
    return definition // Return original if Gemini not available
  }

  const targetLangName = getLanguageName(targetLanguage)
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `Translate this English dictionary definition to ${targetLangName}. Keep it concise and clear:
"${definition}"

Just provide the translation, no extra text.`

    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch (error) {
    console.error('Gemini translation error:', error)
    return definition // Return original on error
  }
}

async function fetchDictionaryData(word: string): Promise<FreeDictionaryResponse | null> {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      {
        headers: {
          'User-Agent': 'daily-english-topic/1.0'
        }
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return Array.isArray(data) ? data[0] : data
  } catch (error) {
    console.error('Dictionary API error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { word, userLanguage = 'zh-TW' } = body

    if (!word || typeof word !== 'string') {
      return NextResponse.json(
        { error: 'Word parameter is required' },
        { status: 400 }
      )
    }

    const cleanWord = word.trim().toLowerCase()

    // Fetch dictionary data
    const dictionaryData = await fetchDictionaryData(cleanWord)

    if (!dictionaryData) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      )
    }

    // Process phonetics
    let phonetic = ''
    let audioUrl = ''
    if (dictionaryData.phonetics && dictionaryData.phonetics.length > 0) {
      const phoneticWithText = dictionaryData.phonetics.find(p => p.text)
      const phoneticWithAudio = dictionaryData.phonetics.find(p => p.audio)
      
      phonetic = phoneticWithText?.text || ''
      audioUrl = phoneticWithAudio?.audio || ''
    }

    // Process definitions with translation
    const definitions = []
    
    for (const meaning of dictionaryData.meanings.slice(0, 3)) {
      for (const definition of meaning.definitions.slice(0, 2)) {
        // Translate definition if user language is not English
        const translation = userLanguage !== 'en' 
          ? await translateDefinitionWithGemini(definition.definition, userLanguage)
          : definition.definition
        
        definitions.push({
          partOfSpeech: meaning.partOfSpeech,
          definition: definition.definition,
          translation,
          example: definition.example
        })
      }
    }

    const result: DictionaryEntry = {
      word: dictionaryData.word,
      phonetic,
      audioUrl: audioUrl || undefined,
      definitions
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Dictionary route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}