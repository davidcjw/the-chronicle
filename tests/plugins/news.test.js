import { describe, it, expect } from "vitest";
import { parseItem, mergeArticles } from "../../plugins/news/index.js";

describe("parseItem", () => {
  it("splits Google News title into title and source", () => {
    const item = { title: "AI takes over - TechCrunch", link: "https://example.com/1", isoDate: "2024-01-01" };
    const result = parseItem(item, null);
    expect(result.title).toBe("AI takes over");
    expect(result.source).toBe("TechCrunch");
  });

  it("handles titles with multiple dashes (only last part is source)", () => {
    const item = { title: "GPT-4 beats GPT-3 - OpenAI Blog", link: "https://example.com/2", isoDate: "2024-01-01" };
    const result = parseItem(item, null);
    expect(result.title).toBe("GPT-4 beats GPT-3");
    expect(result.source).toBe("OpenAI Blog");
  });

  it("uses fallback source when title has no separator", () => {
    const item = { title: "Plain title", link: "https://example.com/3", isoDate: "2024-01-01" };
    const result = parseItem(item, "My Feed");
    expect(result.source).toBe("My Feed");
  });

  it("maps url and publishedAt", () => {
    const item = { title: "Test - Src", link: "https://example.com/4", isoDate: "2024-06-15T10:00:00Z" };
    const result = parseItem(item, null);
    expect(result.url).toBe("https://example.com/4");
    expect(result.publishedAt).toBe("2024-06-15T10:00:00Z");
  });
});

describe("mergeArticles", () => {
  const fulfilled = (value) => ({ status: "fulfilled", value });
  const rejected = () => ({ status: "rejected", reason: new Error("network error") });

  const a1 = { url: "https://a.com/1", publishedAt: "2024-01-03T00:00:00Z" };
  const a2 = { url: "https://a.com/2", publishedAt: "2024-01-01T00:00:00Z" };
  const a3 = { url: "https://a.com/3", publishedAt: "2024-01-02T00:00:00Z" };

  it("merges articles from multiple feeds", () => {
    const results = [fulfilled([a1]), fulfilled([a2])];
    expect(mergeArticles(results, 10)).toHaveLength(2);
  });

  it("deduplicates by URL", () => {
    const results = [fulfilled([a1, a2]), fulfilled([a1])];
    expect(mergeArticles(results, 10)).toHaveLength(2);
  });

  it("sorts newest first", () => {
    const results = [fulfilled([a2, a3, a1])];
    const merged = mergeArticles(results, 10);
    expect(merged.map((a) => a.url)).toEqual(["https://a.com/1", "https://a.com/3", "https://a.com/2"]);
  });

  it("respects max limit", () => {
    const results = [fulfilled([a1, a2, a3])];
    expect(mergeArticles(results, 2)).toHaveLength(2);
  });

  it("skips rejected feeds without throwing", () => {
    const results = [fulfilled([a1]), rejected(), fulfilled([a2])];
    expect(mergeArticles(results, 10)).toHaveLength(2);
  });

  it("drops articles without a URL", () => {
    const noUrl = { url: null, publishedAt: "2024-01-01T00:00:00Z" };
    const results = [fulfilled([noUrl, a1])];
    expect(mergeArticles(results, 10)).toHaveLength(1);
  });
});
