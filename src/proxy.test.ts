import { afterEach, describe, expect, it, vi } from "vitest";

import { config, proxy } from "./proxy";
import { SECURITY_HEADERS } from "./lib/security/headers";

describe("proxy", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("applies every security header in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = proxy();

    for (const { key, value } of SECURITY_HEADERS) {
      expect(response.headers.get(key), key).toBe(value);
    }
  });

  it("leaves development responses alone so hot reload keeps working", () => {
    vi.stubEnv("NODE_ENV", "development");
    const response = proxy();

    expect(response.headers.get("Content-Security-Policy")).toBeNull();
  });

  it("covers pages and the API but skips immutable framework assets", () => {
    const matcher = new RegExp(`^${config.matcher[0]}$`);
    expect(matcher.test("/")).toBe(true);
    expect(matcher.test("/packs/movies")).toBe(true);
    expect(matcher.test("/api/submit")).toBe(true);
    expect(matcher.test("/_next/static/chunks/app.js")).toBe(false);
  });
});
