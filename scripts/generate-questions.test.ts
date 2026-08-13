import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

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
    expect(records.length).toBeGreaterThanOrEqual(30);
    expect(records.every((record) => Array.isArray(record.answers))).toBe(true);
    expect(records.every((record) => (record.answers as unknown[]).length >= 8)).toBe(true);
    expect(new Set(records.map((record) => record.id)).size).toBe(records.length);
    expect(new Set(records.map((record) => record.prompt)).size).toBe(records.length);

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
  });
});
