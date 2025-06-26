import { getAllTopics, Topic } from '@/lib/topics'
import TopicGrid from '@/components/TopicGrid'
import BuyMeACoffeeButton from '@/components/BuyMeACoffeeButton'
import { getDictionary } from '@/lib/dictionaries'
import { type Locale } from '@/i18n-config'
import PageLayout from '@/components/layouts/PageLayout'
import Footer from '@/components/layouts/Footer'

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const topics: Topic[] = getAllTopics()

  return (
    <PageLayout>
      {/* Main Content */}
      <main>
        <TopicGrid topics={topics} lang={lang} dictionary={dictionary} />
        
        {/* Buy Me a Coffee Section */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <BuyMeACoffeeButton />
        </div>
      </main>

      <Footer lang={lang} />
    </PageLayout>
  )
}