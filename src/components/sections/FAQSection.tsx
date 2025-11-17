"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What does Maarty actually do?",
    answer:
      "Maarty checks in with you every day through short, friendly messages. He helps you reflect, stay aligned with your goal, and keep moving without pressure or complicated systems.",
  },
  {
    question: "Is Maarty a coach?",
    answer:
      "Not really. Maarty is more like a tiny mentor or accountability buddy. He won’t give you tasks or plans. He simply helps you stay consistent and honest with yourself.",
  },
  {
    question: "Do I need to install an app?",
    answer:
      "No. Everything happens through a simple web interface and optional Telegram check-ins.",
  },
  {
    question: "How do Telegram messages work?",
    answer:
      "Maarty sends you a small check-in each day. You answer in a few seconds. It’s smooth, light, and feels more like talking to a friend than tracking habits.",
  },
  {
    question: "What kinds of goals can I set?",
    answer:
      "Anything you want to stay committed to: fitness, routines, habits, creativity, learning, side projects… If it matters to you, it matters to Maarty.",
  },
  {
    question: "Is my data private?",
    answer:
      "Absolutely. Your messages and reflections are private and never shared. Maarty exists to support you, not store or use your data.",
  },
  {
    question: "Can I track multiple goals?",
    answer:
      "For now, Maarty focuses on one goal at a time. Multi-goal support may come later.",
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
          <span
            className="inline-block px-4 py-2 text-sm font-bold text-white rounded-full mb-4 uppercase tracking-wide"
            style={{ backgroundColor: "#F4B953" }}
          >
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
                  {openIndex === index ? "-" : "+"}
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
