import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { BillingInfo } from "@/components/billing/billing-info";
import { BillingFormButton } from "@/components/billing/billing-form-button";

export default async function BillingPage({
  params,
}: {
  params: { lang: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${params.lang}`);
  }

  const subscriptionPlan = await getUserSubscriptionPlan(session.user.id);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tight mb-8">
                帳單管理
              </h1>
              
              <div className="space-y-8">
                <BillingInfo subscriptionPlan={subscriptionPlan} />
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <BillingFormButton subscriptionPlan={subscriptionPlan} />
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium mb-2">需要協助？</h3>
                  <p className="text-sm text-muted-foreground">
                    如果您有任何關於訂閱或帳單的問題，請聯繫我們的客服團隊。
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