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

// CREATE new ticket with automatic TRCI reference
router.post("/", async (req, res) => {
  try {
    const {
      title,
      ticket_type,
      priority,
      description
    } = req.body;

    // Basic validation
    if (!title || !ticket_type || !priority) {
      return res.status(400).json({
        error: "Title, ticket type and priority are required"
      });
    }

    /*
      Get the next value from the SERIAL sequence and use
      the SAME number for both:
        database id
        human-readable TRCI ticket reference

      Example:
        id 7 -> TRCI-0007
    */
    const result = await pool.query(
      `
      WITH next_ticket AS (
        SELECT nextval(
          pg_get_serial_sequence('tickets', 'id')
        ) AS id
      )
      INSERT INTO tickets (
        id,
        jira_reference,
        title,
        ticket_type,
        priority,
        description
      )
      SELECT
        id,
        'TRCI-' || LPAD(id::text, 4, '0'),
        $1,
        $2,
        $3,
        $4
      FROM next_ticket
      RETURNING *
      `,
      [
        title.trim(),
        ticket_type,
        priority,
        description?.trim() || null
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("Error creating ticket:", error);

    res.status(500).json({
      error: "Failed to create ticket",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined
    });
  }
});

module.exports = router;