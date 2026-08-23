const express = require("express");
const router = express.Router();
const pool = require("../database/db");

/*
  Helper: retrieve the authenticated user's
  primary Cognito role.

  req.user is populated by the authentication
  middleware before these routes are reached.
*/
const getUserRole = (req) => {
  const groups = req.user?.groups || [];

  if (groups.includes("Admin")) {
    return "Admin";
  }

  if (groups.includes("Developer")) {
    return "Developer";
  }

  if (groups.includes("Reviewer")) {
    return "Reviewer";
  }

  return "Authenticated User";
};

/*
  Helper: retrieve authenticated username.
*/
const getUsername = (req) => {
  return (
    req.user?.username ||
    req.user?.email ||
    "Unknown User"
  );
};

/*
  GET ALL TICKETS

  GET /api/tickets
*/
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM tickets
      ORDER BY created_at DESC
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error(
      "Error retrieving tickets:",
      error
    );

    res.status(500).json({
      error: "Failed to retrieve tickets"
    });
  }
});

/*
  GET SINGLE TICKET

  GET /api/tickets/:id
*/
router.get("/:id", async (req, res) => {
  try {
    const ticketId = Number(req.params.id);

    if (!Number.isInteger(ticketId)) {
      return res.status(400).json({
        error: "Invalid ticket ID"
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM tickets
      WHERE id = $1
      `,
      [ticketId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Ticket not found"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(
      "Error retrieving ticket:",
      error
    );

    res.status(500).json({
      error: "Failed to retrieve ticket"
    });
  }
});

/*
  CREATE NEW TICKET

  POST /api/tickets

  Automatically generates references such as:

  TRCI-0001
  TRCI-0002
  TRCI-0003
*/
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      title,
      ticket_type,
      priority,
      description
    } = req.body;

    if (
      !title?.trim() ||
      !ticket_type ||
      !priority
    ) {
      return res.status(400).json({
        error:
          "Title, ticket type and priority are required"
      });
    }
const username = getUsername(req);
const userRole = getUserRole(req);

/*
  Only Developers and Admins may create tickets.
  This is enforced server-side even if someone
  bypasses the React user interface.
*/
if (
  userRole !== "Developer" &&
  userRole !== "Admin"
) {
  return res.status(403).json({
    error:
      "Developer or Admin role required to create tickets"
  });
}

await client.query("BEGIN");

    /*
      Get the next SERIAL value and use the same
      value for both the database ID and the
      human-readable TRCI reference.
    */
    const result = await client.query(
      `
      WITH next_ticket AS (
        SELECT nextval(
          pg_get_serial_sequence(
            'tickets',
            'id'
          )
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
        'TRCI-' ||
          LPAD(id::text, 4, '0'),
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

    const ticket = result.rows[0];

    /*
      Record ticket creation in the audit log.
    */
    await client.query(
      `
      INSERT INTO ticket_audit_log (
        ticket_id,
        username,
        user_role,
        action,
        field_name,
        old_value,
        new_value
      )
      VALUES (
        $1,
        $2,
        $3,
        'CREATED',
        NULL,
        NULL,
        $4
      )
      `,
      [
        ticket.id,
        username,
        userRole,
        ticket.jira_reference
      ]
    );

    await client.query("COMMIT");

    res.status(201).json(ticket);
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Error creating ticket:",
      error
    );

    res.status(500).json({
      error: "Failed to create ticket",

      details:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined
    });
  } finally {
    client.release();
  }
});

/*
  UPDATE EXISTING TICKET

  PUT /api/tickets/:id

  Developer and Admin permissions should also
  be enforced by the server's RBAC middleware.

  This route additionally checks the role so
  an accidental route configuration cannot
  allow a Reviewer to edit a ticket.
*/
router.put("/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const ticketId = Number(req.params.id);

    if (!Number.isInteger(ticketId)) {
      return res.status(400).json({
        error: "Invalid ticket ID"
      });
    }

    const username = getUsername(req);
    const userRole = getUserRole(req);

    if (
      userRole !== "Developer" &&
      userRole !== "Admin"
    ) {
      return res.status(403).json({
        error:
          "Developer or Admin role required to edit tickets"
      });
    }

    const {
      title,
      ticket_type,
      priority,
      description
    } = req.body;

    if (
      !title?.trim() ||
      !ticket_type ||
      !priority
    ) {
      return res.status(400).json({
        error:
          "Title, ticket type and priority are required"
      });
    }

    await client.query("BEGIN");

    /*
      Lock the ticket while comparing/updating it.
      This prevents two simultaneous edits from
      producing an incorrect audit history.
    */
    const existingResult =
      await client.query(
        `
        SELECT *
        FROM tickets
        WHERE id = $1
        FOR UPDATE
        `,
        [ticketId]
      );

    if (
      existingResult.rows.length === 0
    ) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Ticket not found"
      });
    }

    const existing =
      existingResult.rows[0];

    const updatedValues = {
      title: title.trim(),

      ticket_type,

      priority,

      description:
        description?.trim() || null
    };

    /*
      Fields we allow users to edit.
    */
    const editableFields = [
      "title",
      "ticket_type",
      "priority",
      "description"
    ];

    /*
      Determine exactly what changed.
    */
    const changes = [];

    for (const field of editableFields) {
      const oldValue =
        existing[field] ?? null;

      const newValue =
        updatedValues[field] ?? null;

      if (
        String(oldValue ?? "") !==
        String(newValue ?? "")
      ) {
        changes.push({
          field,
          oldValue,
          newValue
        });
      }
    }

    /*
      If nothing changed, simply return the
      existing ticket without generating fake
      audit records.
    */
    if (changes.length === 0) {
      await client.query("COMMIT");

      return res.json({
        ticket: existing,
        changes: [],
        message:
          "No ticket changes were detected"
      });
    }

    const updateResult =
      await client.query(
        `
        UPDATE tickets
        SET
          title = $1,
          ticket_type = $2,
          priority = $3,
          description = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
        `,
        [
          updatedValues.title,
          updatedValues.ticket_type,
          updatedValues.priority,
          updatedValues.description,
          ticketId
        ]
      );

    /*
      Create one audit record for every field
      that changed.
    */
    for (const change of changes) {
      await client.query(
        `
        INSERT INTO ticket_audit_log (
          ticket_id,
          username,
          user_role,
          action,
          field_name,
          old_value,
          new_value
        )
        VALUES (
          $1,
          $2,
          $3,
          'UPDATED',
          $4,
          $5,
          $6
        )
        `,
        [
          ticketId,
          username,
          userRole,
          change.field,
          change.oldValue === null
            ? null
            : String(
                change.oldValue
              ),
          change.newValue === null
            ? null
            : String(
                change.newValue
              )
        ]
      );
    }

    await client.query("COMMIT");

    res.json({
      ticket: updateResult.rows[0],
      changes,
      message:
        "Ticket updated successfully"
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Error updating ticket:",
      error
    );

    res.status(500).json({
      error: "Failed to update ticket",

      details:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined
    });
  } finally {
    client.release();
  }
});

/*
  GET COMMENTS FOR A TICKET

  GET /api/tickets/:id/comments
*/
router.get(
  "/:id/comments",
  async (req, res) => {
    try {
      const ticketId =
        Number(req.params.id);

      if (
        !Number.isInteger(ticketId)
      ) {
        return res.status(400).json({
          error: "Invalid ticket ID"
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            id,
            ticket_id,
            username,
            user_role,
            comment,
            created_at,
            updated_at
          FROM ticket_comments
          WHERE ticket_id = $1
          ORDER BY created_at ASC
          `,
          [ticketId]
        );

      res.json(result.rows);
    } catch (error) {
      console.error(
        "Error retrieving comments:",
        error
      );

      res.status(500).json({
        error:
          "Failed to retrieve comments"
      });
    }
  }
);

/*
  ADD COMMENT

  POST /api/tickets/:id/comments

  The username and role are NEVER accepted
  from the browser. They come from the
  authenticated Cognito token.
*/
router.post(
  "/:id/comments",
  async (req, res) => {
    const client =
      await pool.connect();

    try {
      const ticketId =
        Number(req.params.id);

      if (
        !Number.isInteger(ticketId)
      ) {
        return res.status(400).json({
          error: "Invalid ticket ID"
        });
      }

      const {
        comment
      } = req.body;

      if (!comment?.trim()) {
        return res.status(400).json({
          error:
            "Comment cannot be empty"
        });
      }

      const username =
        getUsername(req);

      const userRole =
        getUserRole(req);

      await client.query("BEGIN");

      /*
        Confirm the ticket exists.
      */
      const ticketResult =
        await client.query(
          `
          SELECT id
          FROM tickets
          WHERE id = $1
          `,
          [ticketId]
        );

      if (
        ticketResult.rows.length === 0
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(404).json({
          error: "Ticket not found"
        });
      }

      const commentResult =
        await client.query(
          `
          INSERT INTO ticket_comments (
            ticket_id,
            username,
            user_role,
            comment
          )
          VALUES (
            $1,
            $2,
            $3,
            $4
          )
          RETURNING *
          `,
          [
            ticketId,
            username,
            userRole,
            comment.trim()
          ]
        );

      /*
        Also record the comment action in the
        ticket's activity history.

        We don't duplicate the complete comment
        text into the audit table. The actual
        comment remains in ticket_comments.
      */
      await client.query(
        `
        INSERT INTO ticket_audit_log (
          ticket_id,
          username,
          user_role,
          action,
          field_name,
          old_value,
          new_value
        )
        VALUES (
          $1,
          $2,
          $3,
          'COMMENT_ADDED',
          'comment',
          NULL,
          $4
        )
        `,
        [
          ticketId,
          username,
          userRole,
          `Comment #${commentResult.rows[0].id}`
        ]
      );

      await client.query("COMMIT");

      res
        .status(201)
        .json(
          commentResult.rows[0]
        );
    } catch (error) {
      await client.query(
        "ROLLBACK"
      );

      console.error(
        "Error adding comment:",
        error
      );

      res.status(500).json({
        error:
          "Failed to add comment",

        details:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined
      });
    } finally {
      client.release();
    }
  }
);

/*
  GET AUDIT HISTORY

  GET /api/tickets/:id/audit
*/
router.get(
  "/:id/audit",
  async (req, res) => {
    try {
      const ticketId =
        Number(req.params.id);

      if (
        !Number.isInteger(ticketId)
      ) {
        return res.status(400).json({
          error: "Invalid ticket ID"
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            id,
            ticket_id,
            username,
            user_role,
            action,
            field_name,
            old_value,
            new_value,
            created_at
          FROM ticket_audit_log
          WHERE ticket_id = $1
          ORDER BY created_at DESC, id DESC
          `,
          [ticketId]
        );

      res.json(result.rows);
    } catch (error) {
      console.error(
        "Error retrieving audit history:",
        error
      );

      res.status(500).json({
        error:
          "Failed to retrieve audit history"
      });
    }
  }
);

module.exports = router;