import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const clientRoots = [
  resolve(process.cwd(), "src/components"),
  resolve(process.cwd(), "src/hooks"),
  resolve(process.cwd(), "src/state"),
];

const clientImportedFiles = [
  resolve(process.cwd(), "src/lib/packs/meta.ts"),
  resolve(process.cwd(), "src/lib/packs/environment.ts"),
];

const ATLAS_REFERENCE =
  /questions\.json|packs\/movies\.json|src\/data|\/data\/|questions\/catalog|QUESTION_BANK|PACK_QUESTION_BANKS|questionsForPack|findQuestionById/;

const sourceFilesUnder = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFilesUnder(path);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  });

describe("client atlas secrecy", () => {
  it("keeps the answer database out of client-facing source modules", () => {
    const clientSources = [...clientRoots.flatMap(sourceFilesUnder), ...clientImportedFiles];

    for (const file of clientSources) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(ATLAS_REFERENCE);
    }
  });

  it("keeps route pages that render the game away from the server catalog", () => {
    const pages = [
      "src/app/packs/[pack]/page.tsx",
      "src/app/packs/page.tsx",
      "src/app/speed-run/page.tsx",
      "src/app/survival/page.tsx",
      "src/app/unlimited/classic/page.tsx",
      "src/app/page.tsx",
    ];
    for (const page of pages) {
      const source = readFileSync(resolve(process.cwd(), page), "utf8");
      expect(source, page).not.toMatch(ATLAS_REFERENCE);
    }
  });
});
