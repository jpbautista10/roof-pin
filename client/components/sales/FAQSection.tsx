import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "Is this really a one-time payment?",
    a: "Yes. $497 once. No monthly fees, no annual renewals, no per-lead charges. You own it forever.",
  },
  {
    q: "Do I need a developer to set it up?",
    a: "No. Upload your logo, pick your colors, import your jobs via CSV, and you're live. We also include personal onboarding if you need help.",
  },
  {
    q: "Can I import my past projects?",
    a: "Yes. Our CSV import handles hundreds of jobs at once. Export from your CRM or spreadsheet, upload, and all your pins appear on the map instantly.",
  },
  {
    q: "What if I'm not tech savvy?",
    a: "We help you set up. Every new customer gets personal onboarding support. We'll walk you through importing your jobs and configuring everything.",
  },
  {
    q: "Can I also put it on my website?",
    a: "Yes. A one-line embed (iframe) is included. Copy and paste it onto any website — WordPress, Wix, Squarespace, or custom sites.",
  },
  {
    q: "Can I customize the look?",
    a: "Absolutely. Your company logo, your brand colors, your company name. It looks like your own custom-built tool.",
  },
  {
    q: "What about ongoing support?",
    a: "Included forever. Email us anytime. We're contractors too — we understand your business and we're here to help.",
  },
  {
    q: "What's the refund policy?",
    a: "30 days, no questions asked. If it doesn't help your team close more deals, we'll refund every penny. Just email us.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-base font-semibold text-slate-900 pr-4">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="pb-5 text-sm text-slate-600 leading-relaxed pr-8">{a}</p>
      )}
    </div>
  );
}

export default function FAQSection() {
  return (
    <section id="faq" className="py-16 sm:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Questions? We've got answers.
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white px-6 sm:px-8 divide-y-0">
          {faqs.map((faq) => (
            <FAQItem key={faq.q} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
}
