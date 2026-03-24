/**
 * POST /api/support — contact form email via Resend.
 *
 * Env (set in production; see .env.example):
 * - RESEND_API_KEY — Resend API key (required to send)
 * - RESEND_FROM or SUPPORT_FROM_EMAIL — verified sender (required to send)
 * - SUPPORT_TO_EMAIL — inbox (default: support@roofwisepro.com)
 */

import type { SupportContactResponse } from "@shared/api";
import type { Request, RequestHandler } from "express";
import { z } from "zod";

const supportBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    companyName: z.string().trim().max(200).optional(),
    email: z.string().trim().email().max(254),
    subject: z.string().trim().min(1).max(200),
    message: z.string().trim().min(1).max(8000),
    /** Honeypot — must be empty */
    website: z.string().optional(),
  })
  .refine((d) => !d.website?.trim(), { message: "Invalid request" });

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hitTimestamps = new Map<string, number[]>();

function getClientIp(req: Request): string {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string") {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  if (Array.isArray(xff) && xff[0]) {
    return xff[0].split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

function rateLimitAllow(ip: string): boolean {
  const now = Date.now();
  const arr = hitTimestamps.get(ip) ?? [];
  const recent = arr.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return false;
  recent.push(now);
  hitTimestamps.set(ip, recent);
  return true;
}

export const handleSupport: RequestHandler = async (req, res) => {
  const ip = getClientIp(req);
  if (!rateLimitAllow(ip)) {
    const body: SupportContactResponse = {
      ok: false,
      error: "Too many requests. Please try again later.",
    };
    res.status(429).json(body);
    return;
  }

  const parsed = supportBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const body: SupportContactResponse = {
      ok: false,
      error: "Please check your entries and try again.",
    };
    res.status(400).json(body);
    return;
  }

  const { name, companyName, email, subject, message } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.SUPPORT_TO_EMAIL ?? "support@roofwisepro.com";
  const fromEmail = process.env.RESEND_FROM ?? process.env.SUPPORT_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    const body: SupportContactResponse = {
      ok: false,
      error: "Email not configured",
    };
    res.status(503).json(body);
    return;
  }

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `[Support] ${subject}`,
        text: [
          `From: ${name} <${email}>`,
          companyName?.trim()
            ? `Company: ${companyName.trim()}`
            : "Company: (not provided)",
          "",
          message,
        ].join("\n"),
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("[support] Resend error:", resendRes.status, errText);
      const body: SupportContactResponse = {
        ok: false,
        error:
          "Could not send message. Please try again later or email us directly.",
      };
      res.status(502).json(body);
      return;
    }

    const body: SupportContactResponse = {
      ok: true,
      message: "Thanks — your message was sent.",
    };
    res.status(200).json(body);
  } catch (e) {
    console.error("[support] send failed:", e);
    const body: SupportContactResponse = {
      ok: false,
      error:
        "Could not send message. Please try again later or email us directly.",
    };
    res.status(502).json(body);
  }
};
