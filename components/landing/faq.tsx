"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is an HWID license?",
    answer:
      "An HWID (Hardware ID) license ties your subscription to a specific device. This ensures that only authorized hardware can use the client, providing an extra layer of security.",
  },
  {
    question: "How do I get my HWID?",
    answer:
      "Your HWID is automatically detected when you first run the client. You can also find it in the dashboard after logging in. If you need help, our Discord support team can assist you.",
  },
  {
    question: "Can I change my HWID?",
    answer:
      "Yes, you can change your HWID up to 3 times with a 7-day cooldown between changes. If you need additional changes, please contact our support team on Discord.",
  },
  {
    question: "What happens when my subscription expires?",
    answer:
      "When your subscription expires, you will lose access to the client. Your account and HWID data are preserved, so you can renew at any time to regain access.",
  },
  {
    question: "How do I purchase a license?",
    answer:
      "Join our Discord server and follow the purchase instructions there. Our team will guide you through the process and activate your license promptly.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "Refund policies are handled on a case-by-case basis. Please reach out to our support team on Discord for assistance with refund requests.",
  },
];

export function LandingFaq() {
  return (
    <section id="faq" className="relative py-24 px-4 lg:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground text-balance sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-pretty leading-relaxed">
            Everything you need to know about Hernia Client.
          </p>
        </div>

        <Accordion type="single" collapsible className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="glass rounded-xl border-0 px-6 overflow-hidden"
            >
              <AccordionTrigger className="py-4 text-left text-sm font-medium text-foreground hover:no-underline hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
