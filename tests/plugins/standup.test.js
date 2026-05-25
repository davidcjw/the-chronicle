import { describe, it, expect } from "vitest";
import { todayKey, findToggleForDate, extractBullets } from "../../plugins/standup/index.js";

describe("todayKey", () => {
  it("returns YYYY-MM-DD format", () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("matches the current local date", () => {
    const d = new Date();
    const expected = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
    expect(todayKey()).toBe(expected);
  });
});

describe("findToggleForDate", () => {
  const blocks = [
    {
      type: "toggle",
      id: "block-1",
      toggle: { rich_text: [{ plain_text: "[2026-05-25]" }] },
    },
    {
      type: "paragraph",
      id: "block-2",
      paragraph: { rich_text: [{ plain_text: "some text" }] },
    },
    {
      type: "toggle",
      id: "block-3",
      toggle: { rich_text: [{ plain_text: "[2026-05-24]" }] },
    },
  ];

  it("returns the toggle matching the given date", () => {
    expect(findToggleForDate(blocks, "2026-05-25").id).toBe("block-1");
  });

  it("returns null when no toggle matches", () => {
    expect(findToggleForDate(blocks, "2026-05-20")).toBeNull();
  });

  it("ignores non-toggle blocks", () => {
    expect(findToggleForDate(blocks, "some text")).toBeNull();
  });

  it("returns null for empty array", () => {
    expect(findToggleForDate([], "2026-05-25")).toBeNull();
  });
});

describe("extractBullets", () => {
  const children = [
    {
      type: "bulleted_list_item",
      bulleted_list_item: { rich_text: [{ plain_text: "first note" }] },
    },
    {
      type: "paragraph",
      paragraph: { rich_text: [{ plain_text: "ignored" }] },
    },
    {
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [{ plain_text: "second " }, { plain_text: "note" }],
      },
    },
  ];

  it("extracts text from bulleted_list_item blocks", () => {
    expect(extractBullets(children)).toEqual(["first note", "second note"]);
  });

  it("ignores non-bullet blocks", () => {
    expect(extractBullets(children)).not.toContain("ignored");
  });

  it("returns empty array when no bullet blocks present", () => {
    expect(extractBullets([children[1]])).toEqual([]);
  });

  it("concatenates multiple rich_text segments", () => {
    expect(extractBullets([children[2]])[0]).toBe("second note");
  });
});
