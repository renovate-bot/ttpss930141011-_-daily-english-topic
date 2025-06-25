import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { BillingInfo } from "@/components/billing/billing-info";
import { BillingFormButton } from "@/components/billing/billing-form-button";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${lang}`);
  }

  const subscriptionPlan = await getUserSubscriptionPlan(session.user.id);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tight mb-8">
                {dict.billing.title}
              </h1>
              
              <div className="space-y-8">
                <BillingInfo subscriptionPlan={subscriptionPlan} dict={dict} />
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <BillingFormButton subscriptionPlan={subscriptionPlan} dict={dict} />
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium mb-2">{dict.billing.needHelp}</h3>
                  <p className="text-sm text-muted-foreground">
                    {dict.billing.contactSupport}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}