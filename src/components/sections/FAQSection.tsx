"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does Maarty work?",
    answer: "You set one goal. Maarty creates a simple plan, sends you a daily priority, and reviews your progress every week.",
  },
  {
    question: "Do I need to install an app?",
    answer: "No. Everything works through a clean web interface and WhatsApp notifications.",
  },
  {
    question: "What kinds of goals can I set?",
    answer: "Anything related to personal growth: fitness, productivity, habits, learning, creativity, routines, and more.",
  },
  {
    question: "How do WhatsApp notifications work?",
    answer: "Each morning, you receive your priority of the day. Each evening, you get a quick check-in message. It's simple and frictionless.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. You can stop your subscription whenever you want.",
  },
  {
    question: "What happens after the 14-day trial?",
    answer: "You'll be billed monthly at 9,99€. You can cancel before the trial ends if you don't wish to continue.",
  },
  {
    question: "Is my data private?",
    answer: "Absolutely. Your check-ins, goals, and progress are private and never shared.",
  },
  {
    question: "Can I track multiple goals?",
    answer: "Not yet. The MVP focuses on one goal at a time to maximize results. Multi-goal support is coming soon.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="container mx-auto px-4 py-20 bg-primary/30">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 text-sm font-bold text-white rounded-full mb-4 uppercase tracking-wide" style={{ backgroundColor: '#F4B953' }}>
            faq
          </span>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-lg bg-white overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <span className="font-semibold text-text pr-4">
                  {faq.question}
                </span>
                <span className="text-text/60 shrink-0">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-text/80">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

