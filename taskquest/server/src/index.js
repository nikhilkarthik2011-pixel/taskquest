require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { init } = require("./db");
const { router: authRouter } = require("./routes/auth");
const tasksRouter = require("./routes/tasks");
const listsRouter = require("./routes/lists");
const recurringRouter = require("./routes/recurring");
const badgesRouter = require("./routes/badges");
const dashboardStatsRouter = require("./routes/dashboard");
const devRouter = require("./routes/dev");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, name: "TaskQuest API" });
});

app.use("/api/auth", authRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/lists", listsRouter);
app.use("/api/recurring-tasks", recurringRouter);
app.use("/api/badges", badgesRouter);
app.use("/api/dashboard-stats", dashboardStatsRouter);
app.use("/api/dev", devRouter);

// Fallback error handler so unexpected errors return JSON, not an HTML stack trace.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`TaskQuest API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to set up the database:", err.message);
    process.exit(1);
  });
