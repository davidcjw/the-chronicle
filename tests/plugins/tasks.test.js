import { describe, it, expect } from "vitest";
import { encodeId, decodeId } from "../../plugins/google-tasks/index.js";

describe("encodeId / decodeId", () => {
  it("roundtrips a tasklist + task id pair", () => {
    const encoded = encodeId("MTIzNDU2Nzg", "ODk4NzY1NDM");
    expect(decodeId(encoded)).toEqual({ tasklistId: "MTIzNDU2Nzg", taskId: "ODk4NzY1NDM" });
  });

  it("produces URL-safe output (no raw slashes or plus signs)", () => {
    const encoded = encodeId("abc/def+ghi", "xyz/123+456");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("+");
  });

  it("handles typical Google Tasks ID format without colons", () => {
    const encoded = encodeId("AaBbCcDd1234", "XxYyZz5678");
    expect(decodeId(encoded)).toEqual({ tasklistId: "AaBbCcDd1234", taskId: "XxYyZz5678" });
  });

  it("handles real-world Google Tasks ID format", () => {
    const encoded = encodeId("MDEyMzQ1Njc4OTAxMjM0NQ", "MTIzNDU2Nzg5MDEyMzQ1Ng");
    expect(decodeId(encoded)).toEqual({
      tasklistId: "MDEyMzQ1Njc4OTAxMjM0NQ",
      taskId: "MTIzNDU2Nzg5MDEyMzQ1Ng",
    });
  });
});
