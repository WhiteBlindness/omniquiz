import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { PACKS } from "../src/lib/packs/meta";
import { answerKeys } from "../src/lib/questions/normalize";

const root = fileURLToPath(new URL("../", import.meta.url));
const generator = fileURLToPath(new URL("./generate-questions.mjs", import.meta.url));
const output = fileURLToPath(new URL("../src/data/questions.json", import.meta.url));
const moviesOutput = fileURLToPath(new URL("../src/data/packs/movies.json", import.meta.url));

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

  it("writes a deterministic movies atlas that matches the pack topics", () => {
    execFileSync(process.execPath, [generator], { cwd: root });
    const first = readFileSync(moviesOutput, "utf8");
    execFileSync(process.execPath, [generator], { cwd: root });
    const second = readFileSync(moviesOutput, "utf8");
    const records = JSON.parse(second) as Array<{
      id: string;
      category: string;
      prompt: string;
      answers: Array<{ label: string; aliases: string[]; share: number }>;
    }>;

    expect(second).toBe(first);
    expect(records.length).toBeGreaterThanOrEqual(36);
    expect(records.map((record) => record.id)).toEqual(
      records.map((_, index) => `movies-${String(index + 1).padStart(3, "0")}`),
    );
    expect(new Set(records.map((record) => record.prompt)).size).toBe(records.length);

    for (const topic of PACKS.movies.topics) {
      expect(records.filter((record) => record.category === topic).length).toBeGreaterThanOrEqual(6);
    }
    expect(records.every((record) => PACKS.movies.topics.includes(record.category))).toBe(true);

    for (const record of records) {
      expect(record.answers.length).toBeGreaterThanOrEqual(16);
      const total = record.answers.reduce((sum, answer) => sum + answer.share, 0);
      expect(Math.abs(total - 100)).toBeLessThan(0.000_001);
      const shares = record.answers.map((answer) => answer.share);
      expect([...shares].sort((left, right) => right - left)).toEqual(shares);
    }
  });
});

