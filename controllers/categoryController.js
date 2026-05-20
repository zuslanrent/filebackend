const { pool } = require('../config/db')

// GET /api/categories — бүх ангилал + дэд ангилал
const getCategories = async (req, res) => {
  try {
    const cats = await pool.query('SELECT * FROM categories ORDER BY name')
    const subs = await pool.query('SELECT * FROM subcategories ORDER BY name')

    const data = cats.rows.map(cat => ({
      ...cat,
      subcategories: subs.rows.filter(s => s.category_uuid === cat.uuid),
    }))

    return res.status(200).json({ success: true, data })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/categories/:uuid/subcategories — тодорхой ангилалын дэд ангилалууд
const getSubcategories = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM subcategories WHERE category_uuid = $1 ORDER BY name',
      [req.params.uuid]
    )
    return res.status(200).json({ success: true, data: result.rows })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'Нэр оруулна уу.' })

    const result = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    )
    return res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/categories/:uuid/subcategories
const createSubcategory = async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'Нэр оруулна уу.' })

    const result = await pool.query(
      'INSERT INTO subcategories (category_uuid, name, description) VALUES ($1, $2, $3) RETURNING *',
      [req.params.uuid, name, description || null]
    )
    return res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE /api/categories/:uuid
const deleteCategory = async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE uuid = $1', [req.params.uuid])
    return res.status(200).json({ success: true, message: 'Ангилал устгагдлаа.' })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE /api/subcategories/:uuid
const deleteSubcategory = async (req, res) => {
  try {
    await pool.query('DELETE FROM subcategories WHERE uuid = $1', [req.params.uuid])
    return res.status(200).json({ success: true, message: 'Дэд ангилал устгагдлаа.' })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getCategories, getSubcategories, createCategory, createSubcategory, deleteCategory, deleteSubcategory }