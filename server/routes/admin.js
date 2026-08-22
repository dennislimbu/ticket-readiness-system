const express = require("express");
const router = express.Router();
const pool = require("../database/db");

router.get("/summary", async (req, res) => {
  try {
    const ticketResult = await pool.query(
      "SELECT COUNT(*) AS total FROM tickets"
    );

    const readinessResult = await pool.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE readiness_status = 'READY') AS ready,
        COUNT(*) FILTER (WHERE readiness_status = 'NOT READY') AS not_ready,
        COUNT(*) FILTER (WHERE readiness_status = 'NOT ASSESSED') AS pending
      FROM tickets
      `
    );

    const impactResult = await pool.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE impact_level = 'LOW') AS low,
        COUNT(*) FILTER (WHERE impact_level = 'MEDIUM') AS medium,
        COUNT(*) FILTER (WHERE impact_level = 'HIGH') AS high,
        COUNT(*) FILTER (WHERE impact_level = 'CRITICAL') AS critical
      FROM impact_assessments
      `
    );

    res.json({
      message: "Admin access confirmed",
      user: req.user,
      statistics: {
        tickets: Number(ticketResult.rows[0].total),
        readiness: readinessResult.rows[0],
        impact: impactResult.rows[0]
      }
    });
  } catch (error) {
    console.error("Admin summary error:", error);

    res.status(500).json({
      error: "Unable to retrieve admin summary"
    });
  }
});

module.exports = router;