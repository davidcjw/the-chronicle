/**
 * Dashboard configuration.
 * Edit this file to customize widgets without touching plugin code.
 */
export default {
  news: {
    // Google News RSS — one feed per topic, no API key needed
    topics: ["artificial intelligence", "machine learning", "LLM", "OpenAI"],
    // Optional: add any custom RSS feed URLs here
    feeds: [
      // "https://techcrunch.com/category/artificial-intelligence/feed/",
      // "https://www.technologyreview.com/feed/",
    ],
    maxArticles: 10,
  },

  calendar: {
    // "primary" = your main Google calendar.
    // Add more by going to Google Calendar → Settings → click a calendar → copy "Calendar ID".
    calendarIds: ["primary"],
  },

  notion: {
    excludeStatuses: ["Done", "Complete"],
    maxTasks: 20,
    // Map these to the exact property names in your Notion database
    properties: {
      dueDate: "Due Date",
    },
  },

  gitlab: {
    // Max open MRs to fetch
    maxMRs: 20,
  },

  "apple-reminders": {
    lists: [],
    defaultList: null,
    maxItems: 20,
  },

  // Plugin IDs listed here are skipped at startup even if their env vars are set.
  // e.g. disabled: ["gitlab", "news"]
  disabled: ["google-tasks"],
};
