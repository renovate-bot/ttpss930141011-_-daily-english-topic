import { auth } from "@/auth";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { PricingCards } from "@/components/pricing/pricing-cards";

export default async function PricingPage({
  params,
}: {
  params: { lang: string };
}) {
  const session = await auth();
  let subscriptionPlan = null;

  if (session?.user?.id) {
    subscriptionPlan = await getUserSubscriptionPlan(session.user.id);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="pt-24 pb-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              選擇最適合您的學習方案
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              無論您是英文初學者還是進階學習者，我們都有適合您的學習方案
            </p>
          </div>
        </section>

        <section className="pb-24">
          <PricingCards
            userId={session?.user?.id}
            subscriptionPlan={subscriptionPlan}
          />
        </section>
      </main>
    </div>
  );
}