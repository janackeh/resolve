import { redirect } from "next/navigation";
import { canExecuteRefund } from "../../../../lib/approval-gate";
import { getCase } from "../../../../lib/case-store";
import { refundCapture } from "../../../../lib/paypal";
import { PacketDetails } from "../../../components/packet-details";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { approvalPacket, status, refund } = await getCase(id);
  const approvePath = `/case/${id}/approve`;
  const receiptPath = `/case/${id}/receipt`;

  if (
    (status !== "approved" && status !== "executed") ||
    !approvalPacket ||
    !canExecuteRefund(approvalPacket)
  ) {
    redirect(approvePath);
  }

  async function submitRefund() {
    "use server";

    const record = await getCase(id);
    if (record.refund) redirect(receiptPath);

    const captureId = process.env.PAYPAL_CAPTURE_ID?.trim();
    if (!captureId) redirect(receiptPath);

    const packet = record.approvalPacket;
    if (record.status !== "approved" || !packet || packet.caseId !== id) {
      redirect(`${approvePath}?refundBlocked=1`);
    }

    // Claim the case synchronously before any outbound request.
    record.refund = { state: "submitting" };
    if (!canExecuteRefund(packet)) {
      delete record.refund;
      redirect(`${approvePath}?refundBlocked=1`);
    }
    try {
      const result = await refundCapture(captureId, packet.amount, packet);
      record.refund = { state: "received", ...result };
      if (result.status === "COMPLETED") record.status = "executed";
    } catch (error) {
      const detail = error instanceof Error && error.message.startsWith("Configure ")
        ? error.message
        : "Check your sandbox activity before attempting another refund.";
      record.refund = { state: "error", message: `Refund could not be confirmed. ${detail}` };
    }

    redirect(receiptPath);
  }

  const hasCapture = Boolean(process.env.PAYPAL_CAPTURE_ID?.trim());

  return (
    <>
      <p className="step">4 / 4 · Receipt</p>
      <h1>{refund?.state === "received" ? "Sandbox refund receipt" : "Refund approved and ready"}</h1>
      <p className="intro">Approved at {approvalPacket.approvedAt}</p>
      <PacketDetails packet={approvalPacket} />
      {!refund && (hasCapture ? (
        <form action={submitRefund}>
          <button type="submit">Send sandbox refund</button>
        </form>
      ) : (
        <p role="alert">Set PAYPAL_CAPTURE_ID to an existing sandbox capture in .env.local.</p>
      ))}
      {refund?.state === "submitting" && <p role="status">Submitting the sandbox refund. Refresh to check the result.</p>}
      {refund?.state === "error" && <p role="alert">{refund.message}</p>}
      {refund?.state === "received" && (
        <p role={refund.status === "COMPLETED" || refund.status === "PENDING" ? "status" : "alert"}>
          Sandbox refund {refund.id} · Status: {refund.status}
        </p>
      )}
    </>
  );
}
