import { redirect } from "next/navigation";
import { canExecuteRefund } from "../../../../lib/approval-gate";
import { getCase } from "../../../../lib/case-store";
import { PacketDetails } from "../../../components/packet-details";

export default async function ApprovalPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ refundBlocked?: string }>;
}) {
  const { id } = await params;
  const record = await getCase(id);
  const packet = record.approvalPacket;
  const approvalPath = `/case/${id}/approve`;
  const receiptPath = `/case/${id}/receipt`;

  if (!packet) redirect(`/case/${id}/proposals`);
  if ((record.status === "approved" || record.status === "executed") && canExecuteRefund(packet)) {
    redirect(receiptPath);
  }
  const { refundBlocked } = await searchParams;

  async function decide(formData: FormData) {
    "use server";

    const current = await getCase(id);
    const pending = current.approvalPacket;
    const decision = formData.get("decision");

    if (current.status !== "proposed" || pending?.status !== "pending") {
      redirect(approvalPath);
    }

    if (decision === "reject") {
      pending.status = "rejected";
      current.status = "rejected";
      redirect(approvalPath);
    }

    if (decision === "approve") {
      pending.approvedAt = new Date().toISOString();
      pending.status = "approved";
      current.status = "approved";
      if (canExecuteRefund(pending)) redirect(receiptPath);
    }

    redirect(approvalPath);
  }

  return (
    <>
      <p className="step">3 / 4 · Approval</p>
      <h1>Approval packet</h1>
      <PacketDetails packet={packet} />
      {refundBlocked && <p role="alert">Refund blocked. A valid approval is required.</p>}
      {packet.status === "pending" && (
        <form action={decide} className="actions">
          <button type="submit" name="decision" value="approve">Approve</button>
          <button type="submit" name="decision" value="reject" className="secondary">Reject</button>
        </form>
      )}
      {packet.status === "rejected" && <p role="status">Case rejected.</p>}
      {packet.status === "approved" && <p role="status">Resolution approved. No refund is ready.</p>}
    </>
  );
}
