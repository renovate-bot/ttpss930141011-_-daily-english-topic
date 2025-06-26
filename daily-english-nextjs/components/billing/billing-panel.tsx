"use client";

import { useState } from "react";
import { generateUserStripe } from "@/actions/generate-user-stripe";
import { openCustomerPortal } from "@/actions/open-customer-portal";
import { UserSubscriptionPlan } from "@/types/subscription";
import { pricingData } from "@/config/subscriptions";
import { Dictionary } from "@/types/dictionary";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertCircle, 
  CheckCircle, 
  CreditCard, 
  Download, 
  FileText,
  Loader2,
  MessageSquare,
  Calendar,
  Zap,
  Globe,
} from "lucide-react";
import { format } from "date-fns";

interface BillingPanelProps {
  userSubscriptionPlan: UserSubscriptionPlan;
  dictionary: Dictionary;
}

export default function BillingPanel({
  userSubscriptionPlan,
  dictionary,
}: BillingPanelProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  // Mock usage data - in production, this would come from your database
  const usage = {
    topics: { 
      used: userSubscriptionPlan.isPaid ? 45 : 3, 
      limit: userSubscriptionPlan.isPaid ? 100 : 5 
    },
    translations: { 
      used: userSubscriptionPlan.isPaid ? 230 : 25, 
      limit: userSubscriptionPlan.isPaid ? 1000 : 50 
    },
    apiCalls: { 
      used: userSubscriptionPlan.isPaid ? 4500 : 450, 
      limit: userSubscriptionPlan.isPaid ? 10000 : 500 
    }
  };

  // Mock invoice data
  const mockInvoices = [
    {
      id: "INV-2024-012",
      date: new Date(2024, 11, 15),
      amount: userSubscriptionPlan.isPaid ? 29 : 0,
      status: "paid",
      description: userSubscriptionPlan.title + dictionary.billing.invoices.planMonthly
    },
    {
      id: "INV-2024-011",
      date: new Date(2024, 10, 15),
      amount: userSubscriptionPlan.isPaid ? 29 : 0,
      status: "paid",
      description: userSubscriptionPlan.title + dictionary.billing.invoices.planMonthly
    },
    {
      id: "INV-2024-010",
      date: new Date(2024, 9, 15),
      amount: userSubscriptionPlan.isPaid ? 29 : 0,
      status: "paid",
      description: userSubscriptionPlan.title + dictionary.billing.invoices.planMonthly
    }
  ];

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      if (!userSubscriptionPlan.stripeCustomerId) {
        throw new Error("No customer ID found");
      }
      await openCustomerPortal(userSubscriptionPlan.stripeCustomerId);
    } catch (error) {
      console.error("Error opening customer portal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const proPlan = pricingData.find(plan => plan.title.toLowerCase() === "pro");
      if (!proPlan) throw new Error("Pro plan not found");
      
      const priceId = proPlan.stripeIds.monthly;
      if (!priceId) throw new Error("Price ID not found");
      
      await generateUserStripe(priceId);
    } catch (error) {
      console.error("Error upgrading subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-8">
      {/* Demo Alert */}
      <Alert className="border-primary/20 bg-primary/5">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertTitle>{dictionary.billing.demo.title}</AlertTitle>
        <AlertDescription>
          {dictionary.billing.demo.description}{" "}
          <a
            href="https://stripe.com/docs/testing#cards"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline underline-offset-4"
          >
            {dictionary.billing.demo.testCardsLink}
          </a>
          {" "}{dictionary.billing.demo.forPayments}
        </AlertDescription>
      </Alert>

      {/* Current Plan Overview with Enhanced Design */}
      <Card className="overflow-hidden border-2">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{dictionary.billing.currentPlan.title}</CardTitle>
                <CardDescription>
                  {dictionary.billing.currentPlan.description}
                </CardDescription>
              </div>
              <Badge 
                variant={userSubscriptionPlan.isPaid ? "default" : "secondary"} 
                className="text-sm px-3 py-1"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {userSubscriptionPlan.title || dictionary.pricing.planFree.name} Plan
              </Badge>
            </div>
          </CardHeader>
        </div>
        
        <CardContent className="p-6 pt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <CreditCard className="w-4 h-4" />
                {dictionary.billing.currentPlan.monthlyCost}
              </p>
              <p className="text-2xl font-bold">
                ${userSubscriptionPlan.isPaid ? "29" : "0"}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {dictionary.billing.currentPlan.billingCycle}
              </p>
              <p className="text-2xl font-bold capitalize">
                {userSubscriptionPlan.interval || dictionary.billing.currentPlan.monthly}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Zap className="w-4 h-4" />
                {dictionary.billing.currentPlan.status}
              </p>
              <p className="text-2xl font-bold">
                {userSubscriptionPlan.isCanceled ? (
                  <span className="text-destructive">{dictionary.billing.currentPlan.canceled}</span>
                ) : (
                  <span className="text-green-600 dark:text-green-400">{dictionary.billing.currentPlan.active}</span>
                )}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {userSubscriptionPlan.isCanceled ? dictionary.billing.currentPlan.expiresOn : dictionary.billing.currentPlan.nextBilling}
              </p>
              <p className="text-lg font-semibold">
                {userSubscriptionPlan.stripeCurrentPeriodEnd
                  ? format(new Date(userSubscriptionPlan.stripeCurrentPeriodEnd), "MMM d, yyyy")
                  : dictionary.billing.currentPlan.na}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            {!userSubscriptionPlan.isPaid ? (
              <Button 
                onClick={handleUpgrade} 
                className="bg-gradient-to-r from-primary to-primary/80"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {dictionary.billing.currentPlan.upgradeButton}
              </Button>
            ) : (
              <Button 
                onClick={handleManageSubscription}
                variant="outline"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {dictionary.billing.currentPlan.manageButton}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.billing.usage.title}</CardTitle>
          <CardDescription>
            {dictionary.billing.usage.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">{dictionary.billing.usage.topicsGenerated}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.topics.used} / {usage.topics.limit}
                </span>
              </div>
              <Progress 
                value={(usage.topics.used / usage.topics.limit) * 100} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">{dictionary.billing.usage.translations}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.translations.used} / {usage.translations.limit}
                </span>
              </div>
              <Progress 
                value={(usage.translations.used / usage.translations.limit) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">{dictionary.billing.usage.apiCalls}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.apiCalls.used.toLocaleString()} / {usage.apiCalls.limit.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={(usage.apiCalls.used / usage.apiCalls.limit) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Payment Methods and Invoices */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">{dictionary.billing.tabs.paymentBilling}</TabsTrigger>
          <TabsTrigger value="invoices">{dictionary.billing.tabs.invoiceHistory}</TabsTrigger>
        </TabsList>

        {/* Payment Methods */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{dictionary.billing.payment.title}</CardTitle>
                  <CardDescription>
                    {dictionary.billing.payment.description}
                  </CardDescription>
                </div>
                <Button 
                  size="sm"
                  onClick={handleManageSubscription}
                  disabled={!userSubscriptionPlan.stripeCustomerId || isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <CreditCard className="w-4 h-4 mr-2" />
                  {dictionary.billing.payment.manageInStripe}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <div className="text-center space-y-2">
                  <CreditCard className="w-12 h-12 mx-auto opacity-50" />
                  <p>{dictionary.billing.payment.secureMessage}</p>
                  <p className="text-sm">{dictionary.billing.payment.clickToView}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {dictionary.billing.security.message}
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Invoices */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{dictionary.billing.invoices.title}</CardTitle>
                  <CardDescription>
                    {dictionary.billing.invoices.description}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleManageSubscription}
                  disabled={!userSubscriptionPlan.stripeCustomerId || isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Download className="w-4 h-4 mr-2" />
                  {dictionary.billing.invoices.viewInStripe}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {userSubscriptionPlan.isPaid ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{dictionary.billing.invoices.tableHeaders.invoice}</TableHead>
                      <TableHead>{dictionary.billing.invoices.tableHeaders.date}</TableHead>
                      <TableHead>{dictionary.billing.invoices.tableHeaders.description}</TableHead>
                      <TableHead>{dictionary.billing.invoices.tableHeaders.amount}</TableHead>
                      <TableHead>{dictionary.billing.invoices.tableHeaders.status}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{format(invoice.date, "MMM d, yyyy")}</TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell>${invoice.amount}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {dictionary.billing.invoices.paid}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <div className="text-center space-y-2">
                    <FileText className="w-12 h-12 mx-auto opacity-50" />
                    <p>{dictionary.billing.invoices.noInvoices}</p>
                    <p className="text-sm">{dictionary.billing.invoices.upgradeToSee}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}