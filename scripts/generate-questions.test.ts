import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { answerKeys } from "../src/lib/questions/normalize";

const root = fileURLToPath(new URL("../", import.meta.url));
const generator = fileURLToPath(new URL("./generate-questions.mjs", import.meta.url));
const output = fileURLToPath(new URL("../src/data/questions.json", import.meta.url));

describe("crowd atlas generator", () => {
  it("writes the deterministic broad-prompt catalog", () => {
    execFileSync(process.execPath, [generator], { cwd: root });
    const first = readFileSync(output, "utf8");
    execFileSync(process.execPath, [generator], { cwd: root });
    const second = readFileSync(output, "utf8");
    const records = JSON.parse(second) as Array<Record<string, unknown>>;

    expect(second).toBe(first);
    expect(records.length).toBeGreaterThanOrEqual(120);
    expect(records.every((record) => Array.isArray(record.answers))).toBe(true);
    expect(records.every((record) => (record.answers as unknown[]).length >= 16)).toBe(true);
    expect(new Set(records.map((record) => record.id)).size).toBe(records.length);
    expect(new Set(records.map((record) => record.prompt)).size).toBe(records.length);

    for (const category of ["General", "Science", "Geography", "History"]) {
      expect(records.filter((record) => record.category === category)).toHaveLength(30);
    }

    for (const record of records as Array<{
      answers: Array<{ label: string; aliases: string[] }>;
    }>) {
      for (const answer of record.answers) {
        expect(answer.aliases.length).toBeGreaterThanOrEqual(2);
        expect(new Set([answer.label, ...answer.aliases].flatMap((surface) => answerKeys(surface))).size).toBeGreaterThanOrEqual(4);
        expect(answer.aliases.every((alias) => !/(?:choice|response)$/i.test(alias.trim()))).toBe(true);
      }
    }

    const morning = records.find((record) => record.id === "general-001") as {
      answers: Array<{ label: string; aliases: string[] }>;
    };
    const shower = morning.answers.find((answer) => answer.label === "A shower");
    expect(shower?.aliases).toContain("shower");

    const queue = records.find((record) => record.id === "general-005") as {
      answers: Array<{ label: string; aliases: string[] }>;
    };
    const scrolling = queue.answers.find((answer) => answer.label === "Scroll on the phone");
    expect(scrolling?.aliases).toContain("Scroll phone");

    const rocket = records.find((record) => record.id === "history-014") as {
      answers: Array<{ label: string; aliases: string[] }>;
    };
    const rocketFamily = rocket.answers.find((answer) => answer.label === "A rocket");
    expect(rocketFamily?.aliases).toContain("launch vehicle");
    expect(rocketFamily?.aliases).not.toContain("rock");
  });
});
