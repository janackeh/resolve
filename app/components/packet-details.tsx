import type { ApprovalPacket } from "../../types/case";

export function PacketDetails({ packet }: { packet: ApprovalPacket }) {
  return (
    <dl className="facts panel">
      <div><dt>Customer</dt><dd>{packet.customerName || "Not provided"}</dd></div>
      <div><dt>Amount</dt><dd>{packet.amount} {packet.currency || (packet.amount === 0 ? "(no payout)" : "(currency missing)")}</dd></div>
      <div><dt>Reason</dt><dd>{packet.reason || "Not provided"}</dd></div>
      <div><dt>Chosen option</dt><dd>{packet.chosenOption.label}</dd></div>
      <div><dt>Evidence summary</dt><dd>{packet.evidenceSummary || "No evidence provided"}</dd></div>
    </dl>
  );
}
