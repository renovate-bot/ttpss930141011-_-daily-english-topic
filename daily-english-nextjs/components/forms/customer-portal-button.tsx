"use client";

import { useTransition } from "react";
import { openCustomerPortal } from "@/actions/open-customer-portal";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CustomerPortalButtonProps {
  userStripeId: string;
}

export function CustomerPortalButton({
  userStripeId,
}: CustomerPortalButtonProps) {
  const [isPending, startTransition] = useTransition();
  const generateUserStripeSession = openCustomerPortal.bind(null, userStripeId);

  const stripeSessionAction = () =>
    startTransition(async () => {
      await generateUserStripeSession();
    });

  return (
    <Button disabled={isPending} onClick={stripeSessionAction}>
      {isPending ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : null}
      Open Customer Portal
    </Button>
  );
}
