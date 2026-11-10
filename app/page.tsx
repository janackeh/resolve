import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { saveNewCase } from "../lib/case-store";
import { extractAndPropose } from "../lib/extract-propose";

async function analyze(formData: FormData) {
  "use server";

  const input = formData.get("complaint");
  if (typeof input !== "string" || !input.trim() || input.length > 5000) {
    redirect("/?invalid=1");
  }

  const rawComplaint = input.trim();
  const result = await extractAndPropose(rawComplaint);
  const id = randomUUID();

  await saveNewCase({
    id,
    createdAt: new Date().toISOString(),
    rawComplaint,
    ...result,
    status: "proposed",
  });

  redirect(`/case/${id}/proposals`);
}

export default async function IntakePage({
  searchParams,
}: {
  searchParams: Promise<{ invalid?: string }>;
}) {
  const { invalid } = await searchParams;

  return (
    <>
      <p className="step">1 / 4 · Intake</p>
      <h1>Review a complaint</h1>
      <p className="intro">Paste the customer’s message to pull out the facts and review possible resolutions.</p>
      <form action={analyze} className="stack">
        <label htmlFor="complaint">Customer complaint</label>
        <textarea id="complaint" name="complaint" rows={7} required maxLength={5000} />
        {invalid && <p role="alert">Enter a complaint of up to 5,000 characters.</p>}
        <div><button type="submit">Analyze</button></div>
      </form>
    </>
  );
}
