import { getDictionary } from "@/lib/dictionaries";
import { AppHeader } from "@/components/AppHeader";
import { i18n, type Locale } from "@/i18n-config";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <AppHeader dictionary={dictionary} locale={lang} />
      <main>
        {children}
      </main>
    </>
  );
}