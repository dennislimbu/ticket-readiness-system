const express = require("express");
const router = express.Router();
const pool = require("../database/db");
const {
  calculateReadiness
} = require("../services/readinessService");

// GET readiness history for a ticket
router.get("/:ticketId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM readiness_assessments
       WHERE ticket_id = $1
       ORDER BY created_at DESC`,
      [req.params.ticketId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Readiness history error:", error);

    res.status(500).json({
      error: "Failed to retrieve readiness history"
    });
  }
});

// CREATE readiness assessment
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

    const result = calculateReadiness(req.body);

    const assessmentResult = await pool.query(
      `INSERT INTO readiness_assessments (
          ticket_id,
          has_description,
          has_steps_to_reproduce,
          has_expected_behaviour,
          has_actual_behaviour,
          has_environment,
          has_acceptance_criteria,
          has_priority,
          score,
          status,
          missing_requirements
       )
       VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
       )
       RETURNING *`,
      [
        ticketId,
        req.body.has_description,
        req.body.has_steps_to_reproduce,
        req.body.has_expected_behaviour,
        req.body.has_actual_behaviour,
        req.body.has_environment,
        req.body.has_acceptance_criteria,
        req.body.has_priority,
        result.score,
        result.status,
        result.missingRequirements.join(", ")
      ]
    );

    await pool.query(
      `UPDATE tickets
       SET readiness_score = $1,
           readiness_status = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [
        result.score,
        result.status,
        ticketId
      ]
    );

    res.status(201).json({
      assessment: assessmentResult.rows[0],
      result
    });

  } catch (error) {
    console.error("Readiness assessment error:", error);

    res.status(500).json({
      error: "Failed to perform readiness assessment"
    });
  }
});

module.exports = router;