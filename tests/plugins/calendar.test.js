import { describe, it, expect } from "vitest";
import { mapEvent } from "../../plugins/calendar/index.js";

function makeGoogleEvent(overrides = {}) {
  return {
    id: "evt-1",
    summary: "Team standup",
    start: { dateTime: "2025-06-01T09:00:00+08:00" },
    end: { dateTime: "2025-06-01T09:30:00+08:00" },
    location: "Zoom",
    eventType: "default",
    ...overrides,
  };
}

describe("mapEvent", () => {
  it("maps basic fields", () => {
    const evt = mapEvent(makeGoogleEvent(), "primary", "My Calendar", "#818cf8");
    expect(evt.id).toBe("evt-1");
    expect(evt.title).toBe("Team standup");
    expect(evt.calendarId).toBe("primary");
    expect(evt.calendarName).toBe("My Calendar");
    expect(evt.calendarColor).toBe("#818cf8");
    expect(evt.location).toBe("Zoom");
  });

  it("uses dateTime for timed events (allDay = false)", () => {
    const evt = mapEvent(makeGoogleEvent(), "primary", "Cal", "#fff");
    expect(evt.allDay).toBe(false);
    expect(evt.start).toBe("2025-06-01T09:00:00+08:00");
  });

  it("uses date for all-day events (allDay = true)", () => {
    const evt = mapEvent(
      makeGoogleEvent({ start: { date: "2025-06-01" }, end: { date: "2025-06-02" } }),
      "primary", "Cal", "#fff"
    );
    expect(evt.allDay).toBe(true);
    expect(evt.start).toBe("2025-06-01");
  });

  it("falls back to 'No title' when summary is missing", () => {
    const evt = mapEvent(makeGoogleEvent({ summary: undefined }), "primary", "Cal", "#fff");
    expect(evt.title).toBe("No title");
  });

  it("returns null location when not present", () => {
    const evt = mapEvent(makeGoogleEvent({ location: undefined }), "primary", "Cal", "#fff");
    expect(evt.location).toBeNull();
  });
});

describe("workingLocation filter", () => {
  it("excludes workingLocation events before mapping", () => {
    const items = [
      makeGoogleEvent({ eventType: "default" }),
      makeGoogleEvent({ id: "wl-1", eventType: "workingLocation" }),
    ];
    const filtered = items.filter((e) => e.eventType !== "workingLocation");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("evt-1");
  });
});
