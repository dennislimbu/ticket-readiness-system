const express = require("express");
const cors = require("cors");
const pool = require("./database/db");

const ticketRoutes = require("./routes/tickets");
const readinessRoutes = require("./routes/readiness");
const impactRoutes = require("./routes/impact");
const adminRoutes = require("./routes/admin");

const {
  authenticate,
  requireRole,
  requireAnyRole
} = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

/*
  Public health endpoint.
  This can later be used by AWS monitoring
  and load balancer health checks.
*/
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "OK",
      application: "Ticket Readiness and Change Impact System",
      database: "Connected",
      databaseTime: result.rows[0].now
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      status: "ERROR",
      database: "Not connected"
    });
  }
});

/*
  Developer and Admin users may access
  the normal application functionality.
*/
app.use(
  "/api/tickets",
  authenticate,
  requireAnyRole("Developer", "Admin"),
  ticketRoutes
);

app.use(
  "/api/readiness",
  authenticate,
  requireAnyRole("Developer", "Admin"),
  readinessRoutes
);

app.use(
  "/api/impact",
  authenticate,
  requireAnyRole("Developer", "Admin"),
  impactRoutes
);

/*
  Admin-only functionality.
*/
app.use(
  "/api/admin",
  authenticate,
  requireRole("Admin"),
  adminRoutes
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});