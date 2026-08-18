const express = require("express");
const cors = require("cors");
const pool = require("./database/db");
const ticketRoutes = require("./routes/tickets");
const readinessRoutes = require("./routes/readiness");
const impactRoutes = require("./routes/impact");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/tickets", ticketRoutes);
app.use("/api/impact", impactRoutes);
app.use("/api/readiness", readinessRoutes);

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});