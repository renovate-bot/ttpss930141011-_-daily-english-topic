import { TranslationResult } from '@/stores/useWordLookupStore'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getLanguageName } from './language-utils'

// Google Translate API 配置
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY
const GOOGLE_TRANSLATE_ENDPOINT = 'https://translation.googleapis.com/language/translate/v2'

// Gemini AI 配置
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

// 翻譯策略枚舉
export enum TranslationStrategy {
  QUICK = 'quick',        // Google Translate - 快速翻譯
  EDUCATIONAL = 'educational'  // Gemini - 教育性翻譯
}

// 快取介面
interface CacheEntry {
  result: TranslationResult
  timestamp: number
  strategy: TranslationStrategy
}

// 簡單的記憶體快取 (生產環境應使用 Redis 或其他持久化方案)
const translationCache = new Map<string, CacheEntry>()
const CACHE_DURATION = 1000 * 60 * 30 // 30 分鐘

// 清理過期快取
function cleanExpiredCache() {
  const now = Date.now()
  for (const [key, entry] of translationCache.entries()) {
    if (now - entry.timestamp > CACHE_DURATION) {
      translationCache.delete(key)
    }
  }
}

// 生成快取鍵
function getCacheKey(text: string, targetLanguage: string, strategy: TranslationStrategy): string {
  return `${strategy}:${targetLanguage}:${text.toLowerCase()}`
}

// Google Translate API 實作 (使用 REST API)
async function translateWithGoogle(text: string, targetLanguage: string): Promise<TranslationResult> {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    throw new Error('Google Translate API key not configured')
  }

  try {
    const response = await fetch(`${GOOGLE_TRANSLATE_ENDPOINT}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage === 'zh-TW' ? 'zh-TW' : targetLanguage,
        format: 'text',
        source: 'en'
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Google Translate API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    
    if (!data.data || !data.data.translations || data.data.translations.length === 0) {
      throw new Error('Invalid response from Google Translate API')
    }

    const translatedText = data.data.translations[0].translatedText

    return {
      originalText: text,
      translation: translatedText,
      confidence: 0.95,
      alternatives: [],
      service: 'google-translate'
    }
  } catch (error) {
    console.error('Google Translate error:', error)
    throw error
  }
}

// Gemini AI 教育性翻譯實作
async function translateWithGemini(text: string, targetLanguage: string): Promise<TranslationResult> {
  if (!genAI) {
    throw new Error('Gemini API not configured')
  }

  const targetLangName = getLanguageName(targetLanguage)
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `As a professional language teacher, translate the following English text to ${targetLangName}.

Text to translate: "${text}"

Requirements:
1. Provide a natural, fluent translation suitable for language learners
2. Include 2-3 alternative translations if applicable
3. Add a brief educational note about usage, culture, or context if relevant
4. Focus on accuracy and educational value

Response format (JSON):
{
  "translation": "main translation here",
  "alternatives": ["alternative 1", "alternative 2"],
  "note": "optional learning note about usage, culture, or context"
}`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    // 處理 Gemini 的 markdown 格式回應
    let jsonStr = response.trim()
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\s*/, '').replace(/\s*```$/, '')
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\s*/, '').replace(/\s*```$/, '')
    }
    
    try {
      const parsed = JSON.parse(jsonStr.trim())
      return {
        originalText: text,
        translation: parsed.translation || text,
        confidence: 0.90, // 稍低於 Google Translate，因為更注重教育性
        alternatives: parsed.alternatives || [],
        note: parsed.note,
        service: 'gemini-ai'
      }
    } catch {
      // JSON 解析失敗時，使用原始回應
      return {
        originalText: text,
        translation: response.trim(),
        confidence: 0.80,
        alternatives: [],
        service: 'gemini-ai'
      }
    }
  } catch (error) {
    console.error('Gemini translation error:', error)
    throw error
  }
}

// 常用詞彙的離線翻譯
const COMMON_TRANSLATIONS: Record<string, Record<string, string>> = {
  'hello': { 'zh-TW': '你好', 'zh-CN': '你好', 'ja': 'こんにちは', 'ko': '안녕하세요' },
  'thank you': { 'zh-TW': '謝謝', 'zh-CN': '谢谢', 'ja': 'ありがとう', 'ko': '감사합니다' },
  'goodbye': { 'zh-TW': '再見', 'zh-CN': '再见', 'ja': 'さようなら', 'ko': '안녕히 가세요' },
  'please': { 'zh-TW': '請', 'zh-CN': '请', 'ja': 'お願いします', 'ko': '제발' },
  'yes': { 'zh-TW': '是', 'zh-CN': '是', 'ja': 'はい', 'ko': '네' },
  'no': { 'zh-TW': '不', 'zh-CN': '不', 'ja': 'いいえ', 'ko': '아니오' }
}

function getOfflineTranslation(text: string, targetLanguage: string): TranslationResult | null {
  const lowerText = text.toLowerCase().trim()
  if (COMMON_TRANSLATIONS[lowerText] && COMMON_TRANSLATIONS[lowerText][targetLanguage]) {
    return {
      originalText: text,
      translation: COMMON_TRANSLATIONS[lowerText][targetLanguage],
      confidence: 1.0,
      alternatives: [],
      service: 'offline'
    }
  }
  return null
}

// 主要翻譯函數
export async function translateText(
  text: string, 
  targetLanguage: string, 
  strategy: TranslationStrategy = TranslationStrategy.QUICK
): Promise<TranslationResult> {
  // 清理過期快取
  cleanExpiredCache()
  
  // 檢查快取
  const cacheKey = getCacheKey(text, targetLanguage, strategy)
  const cached = translationCache.get(cacheKey)
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return { ...cached.result, fromCache: true }
  }

  // 檢查離線翻譯
  const offlineResult = getOfflineTranslation(text, targetLanguage)
  if (offlineResult) {
    return offlineResult
  }

  let result: TranslationResult

  try {
    // 根據策略選擇翻譯服務
    switch (strategy) {
      case TranslationStrategy.QUICK:
        // 優先使用 Google Translate，失敗時降級到 Gemini
        try {
          result = await translateWithGoogle(text, targetLanguage)
        } catch (googleError) {
          console.warn('Google Translate failed, falling back to Gemini:', googleError)
          if (genAI) {
            result = await translateWithGemini(text, targetLanguage)
            result.fallbackService = 'gemini-ai'
          } else {
            throw googleError
          }
        }
        break

      case TranslationStrategy.EDUCATIONAL:
        // 優先使用 Gemini，失敗時降級到 Google Translate
        try {
          result = await translateWithGemini(text, targetLanguage)
        } catch (geminiError) {
          console.warn('Gemini failed, falling back to Google Translate:', geminiError)
          if (GOOGLE_TRANSLATE_API_KEY) {
            result = await translateWithGoogle(text, targetLanguage)
            result.fallbackService = 'google-translate'
          } else {
            throw geminiError
          }
        }
        break

      default:
        throw new Error(`Unknown translation strategy: ${strategy}`)
    }

    // 存入快取
    translationCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      strategy
    })

    return result

  } catch (error) {
    // 最終錯誤處理：返回原文
    console.error('All translation services failed:', error)
    return {
      originalText: text,
      translation: text,
      confidence: 0.0,
      alternatives: [],
      error: 'Translation service unavailable',
      service: 'none'
    }
  }
}

// 批量翻譯（用於成本優化）
export async function translateBatch(
  texts: string[], 
  targetLanguage: string, 
  strategy: TranslationStrategy = TranslationStrategy.QUICK
): Promise<TranslationResult[]> {
  // 對於小批量，並行處理
  if (texts.length <= 5) {
    return Promise.all(texts.map(text => translateText(text, targetLanguage, strategy)))
  }

  // 對於大批量，分批處理以避免 API 限制
  const results: TranslationResult[] = []
  const batchSize = 5
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(text => translateText(text, targetLanguage, strategy))
    )
    results.push(...batchResults)
    
    // 在批次間添加小延遲，避免超過 API 限制
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return results
}

// 快取管理
export function getCacheStats() {
  cleanExpiredCache()
  return {
    entries: translationCache.size,
    memoryUsage: JSON.stringify([...translationCache.entries()]).length
  }
}

export function clearCache() {
  translationCache.clear()
}