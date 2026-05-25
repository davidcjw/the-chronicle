import { describe, it, expect } from "vitest";
import { encodeId, decodeId } from "../../plugins/apple-reminders/index.js";

describe("encodeId / decodeId", () => {
  it("roundtrips an EventKit calendarItemIdentifier", () => {
    const id = "p64AP/eN3GCQE7KZFHtBJw==";
    expect(decodeId(encodeId(id))).toBe(id);
  });

  it("produces URL-safe output (no slashes, plus signs, or equals)", () => {
    const encoded = encodeId("p64AP/eN3GCQE7KZFHtBJw==");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("=");
  });

  it("roundtrips an ID with special characters", () => {
    const id = "abc+def/ghi==";
    expect(decodeId(encodeId(id))).toBe(id);
  });

  it("roundtrips a plain UUID-style ID", () => {
    const id = "8F9B4B4A-1234-5678-9012-ABCDEF012345";
    expect(decodeId(encodeId(id))).toBe(id);
  });
});
