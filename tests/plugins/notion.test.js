import { describe, it, expect } from "vitest";
import { mapPage } from "../../plugins/notion/index.js";

function makePage(overrides = {}) {
  return {
    id: "page-id-1",
    url: "https://notion.so/page-id-1",
    properties: {
      Name: { title: [{ plain_text: "Buy groceries" }] },
      Status: { status: { name: "In Progress" } },
      Category: { select: { name: "Personal", color: "blue" } },
      "Due Date": { date: { start: "2025-12-01" } },
      ...overrides,
    },
  };
}

describe("mapPage", () => {
  it("extracts title from Name property", () => {
    expect(mapPage(makePage()).title).toBe("Buy groceries");
  });

  it("falls back to 'Untitled' when title is empty", () => {
    const page = makePage({ Name: { title: [] } });
    expect(mapPage(page).title).toBe("Untitled");
  });

  it("extracts status name", () => {
    expect(mapPage(makePage()).status).toBe("In Progress");
  });

  it("extracts select category", () => {
    const { category } = mapPage(makePage());
    expect(category).toEqual({ name: "Personal", color: "blue" });
  });

  it("extracts multi_select category (first item)", () => {
    const page = makePage({
      Category: { multi_select: [{ name: "Work", color: "green" }] },
    });
    expect(mapPage(page).category).toEqual({ name: "Work", color: "green" });
  });

  it("returns null category when property is absent", () => {
    const page = makePage({ Category: {} });
    expect(mapPage(page).category).toBeNull();
  });

  it("extracts due date", () => {
    expect(mapPage(makePage()).dueDate).toBe("2025-12-01");
  });

  it("returns null due date when property has no date", () => {
    const page = makePage({ "Due Date": { date: null } });
    expect(mapPage(page).dueDate).toBeNull();
  });

  it("preserves page id and url", () => {
    const { id, url } = mapPage(makePage());
    expect(id).toBe("page-id-1");
    expect(url).toBe("https://notion.so/page-id-1");
  });
});
