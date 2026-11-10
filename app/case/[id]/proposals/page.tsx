import { redirect } from "next/navigation";
import { getCase } from "../../../../lib/case-store";
import { OptionForm } from "./option-form";

export default async function ProposalsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getCase(id);
  const approvalPath = `/case/${id}/approve`;

  if (record.approvalPacket) redirect(approvalPath);

  async function selectOption(formData: FormData) {
    "use server";

    const current = await getCase(id);
    if (current.approvalPacket) redirect(approvalPath);
    if (current.status !== "proposed") redirect("/");

    const option = current.proposedOptions.find(({ id }) => id === formData.get("optionId"));
    if (!option) redirect(`/case/${id}/proposals`);

    const facts = current.extractedFacts;
    current.selectedOptionId = option.id;
    current.approvalPacket = {
      caseId: current.id,
      customerName: facts.customerName ?? "",
      amount: option.amount,
      currency: facts.currency ?? "",
      reason: facts.reason ?? "",
      chosenOption: { label: option.label, amount: option.amount },
      evidenceSummary: facts.evidence?.join(" ") ?? "",
      status: "pending",
    };

    redirect(approvalPath);
  }

  const { customerName, orderId, amount, currency, reason, evidence } = record.extractedFacts;

  return (
    <>
      <p className="step">2 / 4 · Proposals</p>
      <h1>Review the facts</h1>
      <h2>Extracted facts</h2>
      <dl className="facts panel">
        <div><dt>Customer</dt><dd>{customerName ?? "Not provided"}</dd></div>
        <div><dt>Order ID</dt><dd>{orderId ?? "Not provided"}</dd></div>
        <div><dt>Disputed amount</dt><dd>{amount ?? "Not provided"}</dd></div>
        <div><dt>Currency</dt><dd>{currency ?? "Not provided"}</dd></div>
        <div><dt>Reason</dt><dd>{reason ?? "Not provided"}</dd></div>
        <div><dt>Evidence</dt><dd>{evidence?.join(" ") || "None provided"}</dd></div>
      </dl>
      <OptionForm options={record.proposedOptions} currency={currency} action={selectOption} />
    </>
  );
}
