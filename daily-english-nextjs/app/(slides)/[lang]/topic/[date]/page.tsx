import { getAllTopics, getTopicByDate } from '@/lib/topics'
import SlideViewer from '@/components/SlideViewer'
import { WordLookupProvider } from '@/components/word-lookup/WordLookupProvider'
import { notFound } from 'next/navigation'
import { type Locale } from '@/i18n-config'
import { getDictionary } from '@/lib/dictionaries'

interface TopicPageProps {
  params: Promise<{ lang: Locale; date: string }>
}

export async function generateStaticParams() {
  return getAllTopics().map((topic) => ({ date: topic.date }))
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { lang, date } = await params
  const topic = getTopicByDate(date)
  const dictionary = await getDictionary(lang)

  if (!topic) {
    notFound()
  }

  return (
    <WordLookupProvider defaultLanguage={lang}>
      <SlideViewer topic={topic} interactive dictionary={dictionary} />
    </WordLookupProvider>
  )
}