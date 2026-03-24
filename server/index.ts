import "dotenv/config";
import cors from "cors";
import express from "express";
import {
  handleBillingStatus,
  handleCreatePaymentIntent,
  handleStripeWebhook,
} from "./routes/billing";
import { handleDemo } from "./routes/demo";
import { handleGeocodeSuggest } from "./routes/geocode";
import { handleBatchGeocode } from "./routes/import";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.post(
    "/api/billing/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook,
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/billing/create-payment-intent", handleCreatePaymentIntent);
  app.get("/api/billing/payment-status", handleBillingStatus);
  app.get("/api/geocode/suggest", handleGeocodeSuggest);
  app.post("/api/import/geocode", handleBatchGeocode);

  return app;
}
