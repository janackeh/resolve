import type { ApprovalPacket } from "../types/case";

function isValidIsoDate(value: string | undefined): boolean {
  // Accept YYYY-MM-DD or a timestamp with seconds and an explicit timezone.
  const isoDate = /^\d{4}-\d{2}-\d{2}(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d))?$/;
  if (typeof value !== "string" || !isoDate.test(value) || !Number.isFinite(Date.parse(value))) {
    return false;
  }

  // Date.parse can roll an impossible calendar date into the next month.
  const calendarDate = value.slice(0, 10);
  return new Date(calendarDate).toISOString().slice(0, 10) === calendarDate;
}

export function canExecuteRefund(packet: ApprovalPacket | undefined): boolean {
  return (
    packet?.status === "approved" &&
    isValidIsoDate(packet.approvedAt) &&
    Number.isFinite(packet.amount) &&
    packet.amount > 0 &&
    packet.chosenOption?.amount === packet.amount
  );
}

/*
const approved: ApprovalPacket = {
  caseId: "case-1",
  customerName: "Jordan Lee",
  amount: 25,
  currency: "USD",
  reason: "Duplicate charge",
  chosenOption: { label: "Full refund", amount: 25 },
  evidenceSummary: "Two receipts for the same order.",
  approvedAt: "2026-11-09T18:00:00Z",
  status: "approved",
};

canExecuteRefund(approved); // true
canExecuteRefund({ ...approved, status: "pending" }); // false
*/
