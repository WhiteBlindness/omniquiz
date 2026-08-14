import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const clientRoots = [
  resolve(process.cwd(), "src/components"),
  resolve(process.cwd(), "src/hooks"),
  resolve(process.cwd(), "src/state"),
];

const sourceFilesUnder = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFilesUnder(path);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  });

describe("client atlas secrecy", () => {
  it("keeps the answer database out of client-facing source modules", () => {
    const clientSources = clientRoots.flatMap(sourceFilesUnder);

    for (const file of clientSources) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/questions\.json|QUESTION_BANK|findQuestionById/);
    }
  });
});
