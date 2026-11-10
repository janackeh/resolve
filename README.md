# Resolve

**From messy customer complaint to clear PayPal resolution.**

Resolve reads a messy customer complaint, extracts the key facts, proposes 2-3 resolution options, and shows a short approval packet. A PayPal sandbox refund is sent only after a human explicitly approves it.

## How the approval safeguard works

Refunds are money movement, so Resolve treats the AI as a drafter and never as a decider.

1. **Approval packet + hard stop.** Every proposed resolution becomes a short packet: the facts, the chosen option, and the exact refund amount. No PayPal call can run until a human approves that packet.
2. **Fail-closed gate.** Before calling PayPal, the executor checks the packet again. If anything is missing or doesn't match, it refuses and nothing is sent.

If the extraction is wrong, the person approving sees it in the packet before any money moves.

## Flow

Paste complaint -> extract facts -> choose a resolution option -> review approval packet -> approve -> executor re-checks packet -> sandbox refund -> status shown.

## Tech

- Next.js, TypeScript
- PayPal Orders v2 + Payments v2 (sandbox only)
- Structured extraction: currently **mocked** for demo reliability; the extraction interface is built so a real LLM can be swapped in

## Run locally

Requirements: Node 18+, a PayPal developer account with a sandbox app.

```bash
git clone https://github.com/janackeh/resolve
cd resolve
npm install
cp .env.example .env.local
npm run dev
```

Environment variables (`.env.local`):
