import type { Request, Response } from "express";
import { getSupabaseAdmin } from "./supabase-admin";

export async function getAuthenticatedUser(req: Request, res: Response) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required." });
    return null;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ message: "Authentication required." });
    return null;
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ message: "Invalid session." });
    return null;
  }

  return data.user;
}
