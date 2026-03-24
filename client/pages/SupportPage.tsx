import type { SupportContactResponse } from "@shared/api";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import LegalPageHeader, {
  LEGAL_PAGE_HEADER_OFFSET_CLASS,
  LEGAL_PAGE_HEADLINE_TOP_CLASS,
} from "@/components/legal/LegalPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  /** Honeypot — must stay empty */
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (website !== "") return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          website,
        }),
      });

      let data: SupportContactResponse | null = null;
      try {
        data = (await res.json()) as SupportContactResponse;
      } catch {
        toast.error(
          "Something went wrong. Please try again or email us directly.",
        );
        return;
      }

      if (!res.ok) {
        if (res.status === 503) {
          toast.error(
            "We can’t send messages from this form right now. Please email support@roofwisepro.com directly.",
          );
          return;
        }
        if (res.status === 429) {
          toast.error(
            data?.error ??
              "Too many attempts. Please try again in a few minutes.",
          );
          return;
        }
        toast.error(data?.error ?? "Could not send message. Please try again.");
        return;
      }

      toast.success(
        data.message ?? "Message sent. We’ll get back to you soon.",
      );
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <LegalPageHeader containerClassName="max-w-lg" />

      <main
        className={cn(
          "mx-auto max-w-lg px-4 py-10 sm:px-6",
          LEGAL_PAGE_HEADER_OFFSET_CLASS,
        )}
      >
        <h1
          className={cn(
            LEGAL_PAGE_HEADLINE_TOP_CLASS,
            "text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl",
          )}
        >
          Support
        </h1>
        <p className="mt-2 text-base leading-relaxed text-slate-600 sm:text-lg">
          Questions about Roof Wise Pro? Send us a message and we’ll reply by
          email. You can also reach us at{" "}
          <a
            href="mailto:support@roofwisepro.com"
            className="font-medium text-primary underline underline-offset-2"
          >
            support@roofwisepro.com
          </a>
          .
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Honeypot */}
          <div
            className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
            aria-hidden
          >
            <label htmlFor="support-website">Website</label>
            <input
              id="support-website"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-name">Name</Label>
            <Input
              id="support-name"
              name="name"
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-email">Email</Label>
            <Input
              id="support-email"
              name="email"
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-subject">Subject</Label>
            <Input
              id="support-subject"
              name="subject"
              required
              maxLength={200}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-message">Message</Label>
            <Textarea
              id="support-message"
              name="message"
              required
              rows={6}
              maxLength={8000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-y min-h-[140px]"
            />
            <p className="text-xs text-slate-500">{message.length} / 8000</p>
          </div>

          <Button
            type="submit"
            className="w-full gap-2"
            size="lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send message
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
