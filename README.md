# Resolve

From messy customer complaint to clear PayPal resolution.

Support teams get walls of text. Customers paste entire email threads, half-remembered order numbers, and three different reasons they want their money back. Sorting that out takes time. Rushing a refund risks the wrong amount or the wrong person. Doing nothing kills trust.

Resolve turns that mess into a structured case, proposes clear options, and stops before any money moves. A human reviews an Approval Packet. Only then does the sandbox refund run.

## What it does

Paste a messy complaint. The AI extracts the facts (order, amount, reason, evidence) and proposes resolution options. You see a clean Approval Packet with everything needed to decide. Approve it and the system executes a real PayPal sandbox refund. Reject it and nothing moves. The gate is fail-closed.

The flow is typed handoffs: Intake → Policy/Proposal → Approver → Executor. Money only moves after explicit human approval.

## Built with

- PayPal Orders v2 and Payments v2 (sandbox) for create → capture → refund
- AI for structured extraction of facts and generation of proposed options from unstructured complaint text
- Next.js for the frontend and backend
- Simple storage for the case and approval packet

## Try the demo

The end-to-end flow is shown in the demo video (messy input → structured facts and options → Approval Packet → approve → sandbox refund confirmation).

To run it yourself:

1. Clone the repo.
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in your PayPal sandbox Client ID and Secret (and AI key if required).
4. `npm run dev`
5. Open the intake screen, paste a messy complaint (sample below), and walk through to the approval packet.

Sample messy complaint you can paste:

```
Hi, I ordered the blue sneakers on the 3rd, order number was something like 3S9425... I think. They never arrived and the tracking just stopped. I already emailed twice. Can you refund the $47.50? My card ends in 4242. Thanks.
```

## Why the hard stop

AI is good at pulling structure out of messy text. It is not good at deciding when money should move. The Approval Packet and fail-closed gate keep a human in the loop for the only step that actually matters. That is the part that makes this more than another suggestion bot.

## License

MIT
