import { useWordLookupStore } from '@/stores/useWordLookupStore'

// Export the hook for backward compatibility
export const useWordLookup = useWordLookupStore

// Export types from the store
export type { DictionaryEntry, TranslationResult, DeepExplanationTab } from '@/stores/useWordLookupStore'