import { describe, expect, it } from "vitest";

import { CONTENT_SECURITY_POLICY, SECURITY_HEADERS } from "./headers";

describe("security headers", () => {
  const directives = new Map(
    CONTENT_SECURITY_POLICY.split(";").map((part) => {
      const [name, ...values] = part.trim().split(/\s+/);
      return [name, values] as const;
    }),
  );

  it("keeps every fetch directive same-origin", () => {
    for (const name of ["default-src", "script-src", "style-src", "img-src", "font-src", "connect-src"]) {
      const values = directives.get(name) ?? [];
      expect(values, name).toContain("'self'");
      expect(values.some((value) => /^(https?:|\*|wss?:)/.test(value)), name).toBe(false);
    }
  });

  it("forbids framing, plugins and base-tag rewrites", () => {
    expect(directives.get("frame-ancestors")).toEqual(["'none'"]);
    expect(directives.get("object-src")).toEqual(["'none'"]);
    expect(directives.get("base-uri")).toEqual(["'self'"]);
    expect(directives.get("form-action")).toEqual(["'self'"]);
  });

  it("never allows eval", () => {
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/unsafe-eval/);
  });

  it("ships the baseline hardening headers exactly once", () => {
    const keys = SECURITY_HEADERS.map((header) => header.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toEqual(
      expect.arrayContaining([
        "Content-Security-Policy",
        "X-Content-Type-Options",
        "X-Frame-Options",
        "Referrer-Policy",
        "Permissions-Policy",
      ]),
    );
  });
});
