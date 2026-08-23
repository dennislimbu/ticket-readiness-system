require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./database/db");

const ticketRoutes = require("./routes/tickets");
const readinessRoutes = require("./routes/readiness");
const impactRoutes = require("./routes/impact");
const adminRoutes = require("./routes/admin");

const {
  authenticateToken,
  requireRole,
  requireAnyRole
} = require("./middleware/auth");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    credentials: false,
    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ],
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ]
  })
);

app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT NOW() AS database_time"
    );

    res.status(200).json({
      status: "OK",
      application:
        "Ticket Readiness and Change Impact System",
      database: "Connected",
      databaseTime: result.rows[0].database_time
    });
  } catch (error) {
    console.error("Health check error:", error);

    res.status(500).json({
      status: "ERROR",
      database: "Not connected"
    });
  }
});

app.get(
  "/api/me",
  authenticateToken,
  (req, res) => {
    res.status(200).json({
      username: req.user.username,
      groups: req.user.groups
    });
  }
);

app.use(
  "/api/tickets",
  authenticateToken,
  requireAnyRole(
    "Developer",
    "Reviewer",
    "Admin"
  ),
  ticketRoutes
);

app.use(
  "/api/readiness",
  authenticateToken,
  requireAnyRole(
    "Developer",
    "Reviewer",
    "Admin"
  ),
  readinessRoutes
);


app.use(
  "/api/impact",
  authenticateToken,
  requireAnyRole(
    "Developer",
    "Reviewer",
    "Admin"
  ),
  impactRoutes
);

app.use(
  "/api/admin",
  authenticateToken,
  requireRole("Admin"),
  adminRoutes
);

app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found"
  });
});

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  res.status(500).json({
    error: "Internal server error"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});