import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Case } from "../types/case";

const SESSION_COOKIE = "resolve-session";
const runtime = globalThis as typeof globalThis & {
  resolveCases?: Map<string, { owner: string; record: Case }>;
};
// Demo storage stays on the server and lasts for the lifetime of this process.
const cases = (runtime.resolveCases ??= new Map());

export async function saveNewCase(record: Case) {
  const cookieStore = await cookies();
  let owner = cookieStore.get(SESSION_COOKIE)?.value;

  if (!owner) {
    owner = randomUUID();
    cookieStore.set(SESSION_COOKIE, owner, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  cases.set(record.id, { owner, record });
}

export async function getCase(id: string): Promise<Case> {
  const owner = (await cookies()).get(SESSION_COOKIE)?.value;
  const entry = cases.get(id);

  if (!owner || !entry || entry.owner !== owner) {
    notFound();
  }

  return entry.record;
}
