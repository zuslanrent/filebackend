const { pool } = require("../config/db");

const getAuditLogs = async (req, res) => {
  try {
    const { search, department, action, file_id } = req.query;

    let query = "SELECT * FROM audit_logs WHERE 1=1";
    const params = [];
    let idx = 1;

    if (file_id) {
      query += ` AND file_id = $${idx++}`;
      params.push(file_id);
    }
    if (search) {
      query += ` AND (file_name ILIKE $${idx} OR user_name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (department && department !== "all") {
      query += ` AND user_department = $${idx++}`;
      params.push(department);
    }
    if (action && action !== "all") {
      query += ` AND action = $${idx++}`;
      params.push(action);
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Алдаа гарлаа.", error: error.message });
  }
};
// POST /api/audit-logs
const createAuditLog = async (req, res) => {
  try {
    const {
      file_id,
      file_name,
      user_id,
      user_name,
      user_department,
      action,
      details,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO audit_logs (file_id, file_name, user_id, user_name, user_department, action, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        file_id,
        file_name,
        user_id,
        user_name,
        user_department,
        action,
        details || null,
      ],
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Алдаа гарлаа.", error: error.message });
  }
};

module.exports = { getAuditLogs, createAuditLog };
