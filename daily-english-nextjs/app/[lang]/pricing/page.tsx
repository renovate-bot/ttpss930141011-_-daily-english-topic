import { auth } from "@/auth";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const session = await auth();
  let subscriptionPlan = undefined;

  if (session?.user?.id) {
    subscriptionPlan = await getUserSubscriptionPlan(session.user.id);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="pt-24 pb-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {dict.pricing.title}
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              {dict.pricing.subtitle}
            </p>
          </div>
        </section>

        <section className="pb-24">
          <PricingCards
            userId={session?.user?.id}
            subscriptionPlan={subscriptionPlan}
            dict={dict}
          />
        </section>
      </main>
    </div>
  );
}