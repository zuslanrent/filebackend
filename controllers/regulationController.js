const { pool } = require('../config/db')

// GET /api/regulations
const getRegulations = async (req, res) => {
  try {
    const { status, group_name, division_name, search } = req.query

    let query = 'SELECT * FROM regulations WHERE 1=1'
    const params = []
    let idx = 1

    if (status) {
      query += ` AND status = $${idx++}`
      params.push(status)
    }
    if (group_name) {
      query += ` AND group_name ILIKE $${idx++}`
      params.push(`%${group_name}%`)
    }
    if (division_name) {
      query += ` AND division_name ILIKE $${idx++}`
      params.push(`%${division_name}%`)
    }
    if (search) {
      query += ` AND file_name ILIKE $${idx++}`
      params.push(`%${search}%`)
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    return res.status(200).json({ success: true, data: result.rows })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Алдаа гарлаа.', error: error.message })
  }
}

// GET /api/regulations/:uuid
const getRegulationById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM regulations WHERE uuid = $1', [req.params.uuid])
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Журам олдсонгүй.' })
    return res.status(200).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Алдаа гарлаа.', error: error.message })
  }
}

// POST /api/regulations
const createRegulation = async (req, res) => {
  try {
    const { file_name, group_name, division_name, approved_date, decline_date, status, file_size } = req.body
    if (!file_name)
      return res.status(400).json({ success: false, message: 'Файлын нэр оруулна уу.' })

    const result = await pool.query(
      `INSERT INTO regulations 
        (file_name, group_name, division_name, approved_date, decline_date, status, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        file_name,
        group_name || null,
        division_name || null,
        approved_date || null,
        decline_date || null,
        status || 'active',
        file_size || null,
      ]
    )
    return res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Алдаа гарлаа.', error: error.message })
  }
}

// PUT /api/regulations/:uuid
const updateRegulation = async (req, res) => {
  try {
    const { file_name, group_name, division_name, approved_date, decline_date, status, file_size } = req.body
    if (!file_name)
      return res.status(400).json({ success: false, message: 'Файлын нэр оруулна уу.' })

    const result = await pool.query(
      `UPDATE regulations SET
        file_name = $1, group_name = $2, division_name = $3,
        approved_date = $4, decline_date = $5, status = $6, file_size = $7
       WHERE uuid = $8
       RETURNING *`,
      [
        file_name,
        group_name || null,
        division_name || null,
        approved_date || null,
        decline_date || null,
        status || 'active',
        file_size || null,
        req.params.uuid,
      ]
    )
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Журам олдсонгүй.' })
    return res.status(200).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Алдаа гарлаа.', error: error.message })
  }
}

// DELETE /api/regulations/:uuid
const deleteRegulation = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM regulations WHERE uuid = $1 RETURNING *', [req.params.uuid])
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Журам олдсонгүй.' })
    return res.status(200).json({ success: true, message: 'Журам амжилттай устгагдлаа.' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Алдаа гарлаа.', error: error.message })
  }
}

module.exports = { getRegulations, getRegulationById, createRegulation, updateRegulation, deleteRegulation }
