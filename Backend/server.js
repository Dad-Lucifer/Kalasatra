"use strict";

const app = require("./src/app");

const PORT = process.env.PORT || 5000;
const ENV  = process.env.NODE_ENV || "development";

const server = app.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT} in ${ENV} mode`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n[SERVER] ${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("[SERVER] HTTP server closed.");
    process.exit(0);
  });

  // Force exit if server hasn't closed in 10s
  setTimeout(() => {
    console.error("[SERVER] Forced exit after timeout.");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// ─── Unhandled Rejections & Exceptions ───────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  console.error("[SERVER] Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[SERVER] Uncaught Exception:", err);
  process.exit(1);
});