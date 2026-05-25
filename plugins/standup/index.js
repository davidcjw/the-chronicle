import { Client } from "@notionhq/client";
import config from "../../dashboard.config.js";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const pageId = config.standup?.pageId;

export function todayKey() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export function findToggleForDate(blocks, dateKey) {
  return (
    blocks.find(
      (b) =>
        b.type === "toggle" &&
        b.toggle?.rich_text?.[0]?.plain_text === `[${dateKey}]`
    ) ?? null
  );
}

export function extractBullets(children) {
  return children
    .filter((b) => b.type === "bulleted_list_item")
    .map((b) =>
      b.bulleted_list_item.rich_text.map((t) => t.plain_text).join("")
    );
}

async function fetchAllChildren(blockId) {
  const blocks = [];
  let cursor;
  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    blocks.push(...res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return blocks;
}

export default {
  id: "standup",
  label: "Standup",
  env: ["NOTION_TOKEN"],
  routes: [],
};
