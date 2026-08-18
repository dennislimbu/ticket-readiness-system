const express = require("express");
const router = express.Router();
const pool = require("../database/db");
const {
  calculateImpact
} = require("../services/impactService");

// GET impact history for a ticket
router.get("/:ticketId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM impact_assessments
       WHERE ticket_id = $1
       ORDER BY created_at DESC`,
      [req.params.ticketId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Impact history error:", error);

    res.status(500).json({
      error: "Failed to retrieve impact history"
    });
  }
});

// CREATE impact assessment
router.post("/:ticketId", async (req, res) => {
  try {
    const ticketId = req.params.ticketId;

    const ticketResult = await pool.query(
      "SELECT * FROM tickets WHERE id = $1",
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        error: "Ticket not found"
      });
    }

    const ticket = ticketResult.rows[0];

    if (ticket.readiness_status !== "READY") {
      return res.status(400).json({
        error: "Ticket must be READY before impact assessment"
      });
    }

    const result = calculateImpact(req.body);

    const assessmentResult = await pool.query(
      `INSERT INTO impact_assessments (
        ticket_id,
        ui_impact,
        api_impact,
        database_impact,
        authentication_impact,
        security_impact,
        integration_impact,
        infrastructure_impact,
        deployment_impact,
        rollback_complexity,
        impact_score,
        impact_level
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
      )
      RETURNING *`,
      [
        ticketId,
        req.body.ui_impact,
        req.body.api_impact,
        req.body.database_impact,
        req.body.authentication_impact,
        req.body.security_impact,
        req.body.integration_impact,
        req.body.infrastructure_impact,
        req.body.deployment_impact,
        req.body.rollback_complexity || "LOW",
        result.score,
        result.impactLevel
      ]
    );

    res.status(201).json({
      assessment: assessmentResult.rows[0],
      result
    });

  } catch (error) {
    console.error("Impact assessment error:", error);

    res.status(500).json({
      error: "Failed to perform impact assessment"
    });
  }
});

module.exports = router;