import "dotenv/config";
import express from "express";
import { readdir } from "fs/promises";
import path from "path";
import config from "./dashboard.config.js";
import { isEligible } from "./lib/pluginUtils.js";

const disabledPlugins = new Set(config.disabled || []);

const app = express();
const PORT = process.env.PORT || 3737;

app.use(express.json());
app.use(express.static("public"));

const activePlugins = [];

async function loadPlugins() {
  const pluginsDir = path.resolve("plugins");
  const entries = await readdir(pluginsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pluginPath = `./plugins/${entry.name}/index.js`;
    try {
      const { default: plugin } = await import(pluginPath);

      const { ok, reason } = isEligible(plugin, disabledPlugins);
      if (!ok) {
        console.log(`[${plugin.id}] Skipped — ${reason}`);
        continue;
      }

      for (const route of plugin.routes || []) {
        app[route.method.toLowerCase()](route.path, route.handler);
      }

      if (typeof plugin.onLoad === "function") {
        await plugin.onLoad();
      }

      activePlugins.push({ id: plugin.id, label: plugin.label });
      console.log(`[${plugin.id}] Loaded ✓`);
    } catch (err) {
      console.error(`Failed to load plugin ${entry.name}:`, err.message);
    }
  }
}

// Tells the frontend which plugins are active so it knows which widgets to load
app.get("/api/plugins", (req, res) => {
  res.json(activePlugins);
});

await loadPlugins();

app.listen(PORT, () => {
  console.log(`\nDashboard → http://localhost:${PORT}\n`);
});
