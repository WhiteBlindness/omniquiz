import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { statsStorageKey } from "../../components/game/storage";
import { PACK_IDS } from "../packs/meta";
import { STORAGE_REGISTRY } from "./registry";

const sourceFilesUnder = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFilesUnder(path);
    return /\.(?:ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });

const sourceFiles = () =>
  sourceFilesUnder(resolve(process.cwd(), "src")).filter((file) => !file.endsWith("registry.ts"));

const documented = new Set(
  STORAGE_REGISTRY.map((entry) => entry.key.replace(/:<pack>$/, "")),
);

describe("storage registry", () => {
  it("documents every omniquiz- key the source code uses", () => {
    const used = new Set<string>();
    for (const file of sourceFiles()) {
      for (const match of readFileSync(file, "utf8").matchAll(/["'`](omniquiz-[a-z0-9-]+)/g)) {
        used.add(match[1]);
      }
    }

    expect(used.size).toBeGreaterThan(0);
    for (const key of used) expect(documented, key).toContain(key);
  });

  it("lists nothing the code no longer writes", () => {
    const corpus = sourceFiles().map((file) => readFileSync(file, "utf8")).join("\n");
    for (const key of documented) expect(corpus, key).toContain(key);
  });

  it("documents the per-pack statistics key pattern", () => {
    for (const pack of PACK_IDS) {
      expect(documented).toContain(statsStorageKey(pack).split(":")[0]);
    }
  });
});
