import "server-only";
import type { ApprovalPacket } from "../types/case";
import { canExecuteRefund } from "./approval-gate";

function sandboxBase() {
  const base = process.env.PAYPAL_API_BASE;
  if (base !== "https://api-m.sandbox.paypal.com") {
    throw new Error("Configure PAYPAL_API_BASE with the PayPal sandbox URL.");
  }
  return base;
}

export async function getPayPalAccessToken(): Promise<string> {
  const base = sandboxBase();
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret || clientId === "your_client_id" || secret === "your_secret") {
    throw new Error("Configure your PayPal sandbox credentials in .env.local.");
  }

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`PayPal sandbox authentication failed (HTTP ${response.status}).`);

  const { access_token } = await response.json();
  if (typeof access_token !== "string" || !access_token) {
    throw new Error("PayPal sandbox returned no access token.");
  }
  return access_token;
}

export async function refundCapture(
  captureId: string,
  amount?: number,
  packet?: ApprovalPacket,
): Promise<{ id: string; status: string }> {
  if (!packet || !canExecuteRefund(packet) || (amount !== undefined && amount !== packet.amount)) {
    throw new Error("Refund blocked. A matching approved packet is required.");
  }
  if (!/^[A-Za-z0-9]+$/.test(captureId)) {
    throw new Error("Configure a valid PayPal sandbox capture ID.");
  }

  const base = sandboxBase();
  const currency = packet.currency;
  const value = String(packet.amount);
  const zeroDecimal = ["HUF", "JPY", "TWD"].includes(currency);
  const validAmount = zeroDecimal ? /^\d+$/.test(value) : /^\d+(\.\d{1,2})?$/.test(value);
  if (!/^[A-Z]{3}$/.test(currency) || !validAmount) {
    throw new Error("The approved amount or currency cannot be sent to PayPal.");
  }

  const token = await getPayPalAccessToken();
  if (!canExecuteRefund(packet) || packet.currency !== currency || String(packet.amount) !== value) {
    throw new Error("Refund blocked. The approved packet changed.");
  }
  const response = await fetch(`${base}/v2/payments/captures/${captureId}/refund`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": packet.caseId,
    },
    body: JSON.stringify({ amount: { value, currency_code: currency } }),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`PayPal sandbox returned HTTP ${response.status} for the refund.`);

  const { id, status } = await response.json();
  if (typeof id !== "string" || !id || typeof status !== "string" || !status) {
    throw new Error("PayPal sandbox returned an incomplete refund response.");
  }
  return { id, status };
}
