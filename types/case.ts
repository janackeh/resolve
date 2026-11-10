export type Case = {
  id: string;
  createdAt: string;
  rawComplaint: string;
  extractedFacts: {
    customerName?: string;
    orderId?: string;
    amount?: number;
    currency?: string;
    reason?: string;
    evidence?: string[];
  };
  proposedOptions: Array<{
    id: string;
    label: string;
    amount: number;
    rationale: string;
  }>;
  selectedOptionId?: string;
  approvalPacket?: ApprovalPacket;
  refund?:
    | { state: "submitting" }
    | { state: "received"; id: string; status: string }
    | { state: "error"; message: string };
  status: "intake" | "proposed" | "approved" | "executed" | "rejected";
};

export type ApprovalPacket = {
  caseId: string;
  customerName: string;
  amount: number;
  currency: string;
  reason: string;
  chosenOption: {
    label: string;
    amount: number;
  };
  evidenceSummary: string;
  approvedBy?: string;
  approvedAt?: string;
  status: "pending" | "approved" | "rejected";
};
