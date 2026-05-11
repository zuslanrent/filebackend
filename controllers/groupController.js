const { pool } = require('../config/db')

// GET /api/groups
const getGroups = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM groups ORDER BY created_at DESC')
    return res.status(200).json({ success: true, data: result.rows })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Алдаа гарлаа.', error: error.message })
  }
}

// GET /api/groups/:uuid
const getGroupById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM groups WHERE uuid = $1', [req.params.uuid])
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Бүлэг олдсонгүй.' })
    return res.status(200).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Алдаа гарлаа.', error: error.message })
  }
}

// POST /api/groups
const createGroup = async (req, res) => {
  try {
    const { group_name, description } = req.body
    if (!group_name)
      return res.status(400).json({ success: false, message: 'Бүлгийн нэр оруулна уу.' })

    const result = await pool.query(
      'INSERT INTO groups (group_name, description) VALUES ($1, $2) RETURNING *',
      [group_name, description || null]
    )
    return res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Алдаа гарлаа.', error: error.message })
  }
}

// PUT /api/groups/:uuid
const updateGroup = async (req, res) => {
  try {
    const { group_name, description } = req.body
    if (!group_name)
      return res.status(400).json({ success: false, message: 'Бүлгийн нэр оруулна уу.' })

    const result = await pool.query(
      'UPDATE groups SET group_name = $1, description = $2 WHERE uuid = $3 RETURNING *',
      [group_name, description || null, req.params.uuid]
    )
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Бүлэг олдсонгүй.' })
    return res.status(200).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Алдаа гарлаа.', error: error.message })
  }
}

// DELETE /api/groups/:uuid
const deleteGroup = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM groups WHERE uuid = $1 RETURNING *', [req.params.uuid])
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Бүлэг олдсонгүй.' })
    return res.status(200).json({ success: true, message: 'Бүлэг амжилттай устгагдлаа.' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Алдаа гарлаа.', error: error.message })
  }
}

module.exports = { getGroups, getGroupById, createGroup, updateGroup, deleteGroup }
