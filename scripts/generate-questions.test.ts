import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../", import.meta.url));
const generator = fileURLToPath(new URL("./generate-questions.mjs", import.meta.url));
const output = fileURLToPath(new URL("../src/data/questions.json", import.meta.url));

describe("question generator", () => {
  it("writes the exact balanced offline catalog deterministically", () => {
    execFileSync(process.execPath, [generator], { cwd: root });
    const first = readFileSync(output, "utf8");
    execFileSync(process.execPath, [generator], { cwd: root });
    const second = readFileSync(output, "utf8");
    const records = JSON.parse(second) as Array<Record<string, unknown>>;

    expect(second).toBe(first);
    expect(records).toHaveLength(300);
    expect(records.filter((record) => record.category === "General")).toHaveLength(75);
    expect(records.filter((record) => record.category === "Science")).toHaveLength(75);
    expect(records.filter((record) => record.category === "Geography")).toHaveLength(75);
    expect(records.filter((record) => record.category === "History")).toHaveLength(75);
    expect(new Set(records.map((record) => record.id)).size).toBe(300);
    expect(new Set(records.map((record) => record.prompt)).size).toBe(300);
  });
});
