const express = require("express");
const router = express.Router();
const pool = require("../database/db");

// GET all tickets
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tickets ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error retrieving tickets:", error);
    res.status(500).json({
      error: "Failed to retrieve tickets"
    });
  }
});

// CREATE new ticket
router.post("/", async (req, res) => {
  try {
    const {
      jira_reference,
      title,
      ticket_type,
      priority,
      description
    } = req.body;

    const result = await pool.query(
      `INSERT INTO tickets
       (jira_reference, title, ticket_type, priority, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        jira_reference,
        title,
        ticket_type,
        priority,
        description
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("Error creating ticket:", error);

    res.status(500).json({
      error: "Failed to create ticket"
    });
  }
});

module.exports = router;