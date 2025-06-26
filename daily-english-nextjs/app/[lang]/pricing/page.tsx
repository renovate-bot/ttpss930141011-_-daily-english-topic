import { auth } from "@/auth";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import callWaiting from "@/public/illustrations/call-waiting.svg";
import { ComparePlans } from "@/components/pricing/compare-plans";
import { PricingFaq } from "@/components/pricing/pricing-faq";
import PageLayout from "@/components/layouts/PageLayout";
import Footer from "@/components/layouts/Footer";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const session = await auth();

  if (session?.user?.role === UserRole.ADMIN) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-5xl font-bold">Seriously?</h1>
        <Image
          src={callWaiting}
          alt="403"
          width={560}
          height={560}
          className="pointer-events-none -my-20 dark:invert"
        />
        <p className="text-balance px-4 text-center text-2xl font-medium">
          You are an {session?.user?.role}. Back to{" "}
          <Link
            href="/"
            className="text-muted-foreground underline underline-offset-4 hover:text-purple-500"
          >
            Home
          </Link>
          .
        </p>
      </div>
    );
  }

  let subscriptionPlan;
  if (session?.user?.id) {
    subscriptionPlan = await getUserSubscriptionPlan(session.user.id);
  }

  return (
    <PageLayout>
      <div className="flex w-full flex-col gap-16 py-8 md:py-8">
        <PricingCards userId={session?.user?.id} subscriptionPlan={subscriptionPlan} dict={dict} />
        <hr className="container border-white/20" />
        <ComparePlans />
        <PricingFaq />
      </div>
      <Footer lang={lang} />
    </PageLayout>
  );
}