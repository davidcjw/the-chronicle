import { describe, it, expect } from "vitest";
import { isEligible } from "../../lib/pluginUtils.js";

const disabled = new Set(["gitlab"]);

describe("isEligible", () => {
  it("returns ok for a plugin with no env requirements", () => {
    expect(isEligible({ id: "news", env: [] }, disabled)).toEqual({ ok: true });
  });

  it("skips a disabled plugin", () => {
    const result = isEligible({ id: "gitlab", env: [] }, disabled);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("disabled");
  });

  it("skips when a required env var is missing", () => {
    const result = isEligible({ id: "notion", env: ["NOTION_TOKEN"] }, disabled, {});
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("NOTION_TOKEN");
  });

  it("skips when multiple env vars are missing", () => {
    const result = isEligible(
      { id: "calendar", env: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] },
      disabled,
      { GOOGLE_CLIENT_ID: "set" }
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("GOOGLE_CLIENT_SECRET");
  });

  it("passes when all required env vars are present", () => {
    const env = { NOTION_TOKEN: "abc", NOTION_DATABASE_ID: "xyz" };
    const result = isEligible({ id: "notion", env: ["NOTION_TOKEN", "NOTION_DATABASE_ID"] }, disabled, env);
    expect(result.ok).toBe(true);
  });
});
