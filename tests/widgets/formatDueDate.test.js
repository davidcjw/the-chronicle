import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatDueDate } from "../../public/widgets/notion/widget.js";

// Pin "today" to a fixed date so tests don't drift
const TODAY = new Date("2025-06-01T12:00:00");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(TODAY);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("formatDueDate", () => {
  it("returns null for a null/missing date", () => {
    expect(formatDueDate(null)).toBeNull();
    expect(formatDueDate(undefined)).toBeNull();
  });

  it("labels a past date as Overdue in red", () => {
    const result = formatDueDate("2025-05-31");
    expect(result.label).toBe("Overdue");
    expect(result.color).toBe("#ef4444");
  });

  it("labels today's date as Today in amber", () => {
    const result = formatDueDate("2025-06-01");
    expect(result.label).toBe("Today");
    expect(result.color).toBe("#f59e0b");
  });

  it("labels tomorrow as Tomorrow in amber", () => {
    const result = formatDueDate("2025-06-02");
    expect(result.label).toBe("Tomorrow");
    expect(result.color).toBe("#f59e0b");
  });

  it("formats future dates as a readable date in grey", () => {
    const result = formatDueDate("2025-06-15");
    expect(result.label).toMatch(/15/);
    expect(result.color).toBe("#6b7280");
  });
});
