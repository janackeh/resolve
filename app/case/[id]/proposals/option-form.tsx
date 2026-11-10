"use client";

import { useState } from "react";
import type { Case } from "../../../../types/case";

export function OptionForm({ options, currency, action }: {
  options: Case["proposedOptions"];
  currency?: string;
  action: (data: FormData) => Promise<void>;
}) {
  const [selected, setSelected] = useState("");

  return (
    <form action={action} className="stack">
      <fieldset className="stack">
        <legend>Choose a resolution</legend>
        {options.map((option) => (
          <label key={option.id} className="option panel">
            <input
              type="radio"
              name="optionId"
              value={option.id}
              checked={selected === option.id}
              onChange={() => setSelected(option.id)}
              required
            />
            <span>
              <strong>{option.label}</strong>
              <span className="option-amount">
                {option.amount === 0 ? "No payout" : [option.amount, currency].join(" ").trim()}
              </span>
              <span className="rationale">{option.rationale}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <div><button type="submit" disabled={!selected}>Continue to Approval</button></div>
    </form>
  );
}
