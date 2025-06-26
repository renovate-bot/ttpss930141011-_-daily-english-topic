import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { HeaderSection } from "@/components/shared/header-section";

const pricingFaqData = [
  {
    id: "item-1",
    question: "What's included in the Free plan?",
    answer:
      "The Free plan includes quick double-click translation, bookmarking features, and access to 3 daily English learning topics. It's perfect for casual learners who want to explore our platform.",
  },
  {
    id: "item-2",
    question: "How much does the Pro plan cost?",
    answer:
      "The Pro plan is CAD $9.99 per month or CAD $99.99 per year (save 17%). It includes 45 minutes daily of REAL human-like voice conversations with AI teacher Emma - not robotic text-to-speech like other apps!",
  },
  {
    id: "item-3",
    question: "What makes Emma different from other AI tutors?",
    answer:
      "Unlike other apps that use robotic text-to-speech, Emma uses OpenAI's Realtime API for truly natural conversations. She sounds human, understands context, laughs at jokes, and responds instantly - just like talking to a real person! No more awkward pauses or mechanical voices.",
  },
  {
    id: "item-4",
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes! You can cancel your Pro subscription anytime. You'll continue to have access to Pro features until the end of your billing period, then your account will revert to the Free plan.",
  },
  {
    id: "item-5",
    question: "How does deep translation analysis work?",
    answer:
      "Deep translation goes beyond simple word meanings. It provides detailed explanations, usage examples, synonyms, antonyms, etymology, and related words. It's like having a comprehensive dictionary and language tutor combined.",
  },
];

export function PricingFaq() {
  return (
    <section className="container max-w-4xl mx-auto py-2">
      <HeaderSection
        label="FAQ"
        title="Frequently Asked Questions"
        subtitle="Explore our comprehensive FAQ to find quick answers to common
          inquiries. If you need further assistance, don't hesitate to
          contact us for personalized help."
      />

      <Accordion type="single" collapsible className="my-12 w-full">
        {pricingFaqData.map((faqItem) => (
          <AccordionItem 
            key={faqItem.id} 
            value={faqItem.id}
            className="border-white/20 bg-white/5 backdrop-blur-sm rounded-lg mb-4 px-6 hover:bg-white/10 transition-colors"
          >
            <AccordionTrigger className="text-gray-100 hover:text-white">
              {faqItem.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-gray-300 sm:text-[15px]">
              {faqItem.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
