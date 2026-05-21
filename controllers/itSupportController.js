const { pool } = require('../config/db')

// ─── CATEGORIES ──────────────────────────────────────────

const getCategories = async (req, res) => {
  try {
    const cats = await pool.query('SELECT * FROM it_categories ORDER BY name')
    const subs = await pool.query('SELECT * FROM it_subcategories ORDER BY name')

    const data = cats.rows.map(cat => ({
      id:            cat.uuid,
      name:          cat.name,
      description:   cat.description,
      created_at:    cat.created_at,
      subCategories: subs.rows
        .filter(s => s.category_uuid === cat.uuid)
        .map(s => ({ id: s.uuid, name: s.name, parentId: cat.uuid })),
    }))

    return res.status(200).json({ success: true, data })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'Нэр оруулна уу.' })

    const result = await pool.query(
      'INSERT INTO it_categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    )
    const cat = result.rows[0]
    return res.status(201).json({
      success: true,
      data: { id: cat.uuid, name: cat.name, description: cat.description, subCategories: [] }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body
    const result = await pool.query(
      'UPDATE it_categories SET name=$1, description=$2 WHERE uuid=$3 RETURNING *',
      [name, description || null, req.params.uuid]
    )
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Олдсонгүй.' })
    return res.status(200).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

const deleteCategory = async (req, res) => {
  try {
    await pool.query('DELETE FROM it_categories WHERE uuid=$1', [req.params.uuid])
    return res.status(200).json({ success: true, message: 'Устгагдлаа.' })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── SUBCATEGORIES ───────────────────────────────────────

const createSubcategory = async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'Нэр оруулна уу.' })

    const result = await pool.query(
      'INSERT INTO it_subcategories (category_uuid, name) VALUES ($1, $2) RETURNING *',
      [req.params.uuid, name]
    )
    const sub = result.rows[0]
    return res.status(201).json({
      success: true,
      data: { id: sub.uuid, name: sub.name, parentId: sub.category_uuid }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

const updateSubcategory = async (req, res) => {
  try {
    const { name } = req.body
    const result = await pool.query(
      'UPDATE it_subcategories SET name=$1 WHERE uuid=$2 RETURNING *',
      [name, req.params.subUuid]
    )
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Олдсонгүй.' })
    return res.status(200).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

const deleteSubcategory = async (req, res) => {
  try {
    await pool.query('DELETE FROM it_subcategories WHERE uuid=$1', [req.params.subUuid])
    return res.status(200).json({ success: true, message: 'Устгагдлаа.' })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── ERRORS ──────────────────────────────────────────────

const getErrors = async (req, res) => {
  try {
    const { search, category_uuid, department, status } = req.query

    let query = `
      SELECT 
        uuid as id, keyword, description, solution,
        category_uuid   as "categoryId",
        subcategory_uuid as "subCategoryId",
        department, status, images,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM it_errors WHERE 1=1
    `
    const params = []
    let idx = 1

    if (search) {
      query += ` AND (keyword ILIKE $${idx} OR description ILIKE $${idx} OR solution ILIKE $${idx})`
      params.push(`%${search}%`)
      idx++
    }
    if (category_uuid) {
      query += ` AND category_uuid = $${idx++}`
      params.push(category_uuid)
    }
    if (department && department !== 'all') {
      query += ` AND department = $${idx++}`
      params.push(department)
    }
    if (status && status !== 'all') {
      query += ` AND status = $${idx++}`
      params.push(status)
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    return res.status(200).json({ success: true, data: result.rows })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

const createError = async (req, res) => {
  try {
    const { keyword, description, solution, categoryId, subCategoryId, department, status, images } = req.body
    if (!keyword || !description || !categoryId)
      return res.status(400).json({ success: false, message: 'Заавал талбарыг бөглөнө үү.' })

    const result = await pool.query(
      `INSERT INTO it_errors 
        (keyword, description, solution, category_uuid, subcategory_uuid, department, status, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING uuid as id, keyword, description, solution,
         category_uuid as "categoryId", subcategory_uuid as "subCategoryId",
         department, status, images, created_at as "createdAt", updated_at as "updatedAt"`,
      [
        keyword, description, solution || null,
        categoryId, subCategoryId || null,
        department || null, status || 'active',
        images || [],
      ]
    )
    return res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

const updateError = async (req, res) => {
  try {
    const { keyword, description, solution, categoryId, subCategoryId, department, status, images } = req.body

    const result = await pool.query(
      `UPDATE it_errors SET
        keyword=$1, description=$2, solution=$3,
        category_uuid=$4, subcategory_uuid=$5,
        department=$6, status=$7, images=$8, updated_at=NOW()
       WHERE uuid=$9
       RETURNING uuid as id, keyword, description, solution,
         category_uuid as "categoryId", subcategory_uuid as "subCategoryId",
         department, status, images, created_at as "createdAt", updated_at as "updatedAt"`,
      [
        keyword, description, solution || null,
        categoryId, subCategoryId || null,
        department || null, status || 'active',
        images || [], req.params.uuid,
      ]
    )
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Олдсонгүй.' })
    return res.status(200).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

const deleteError = async (req, res) => {
  try {
    await pool.query('DELETE FROM it_errors WHERE uuid=$1', [req.params.uuid])
    return res.status(200).json({ success: true, message: 'Устгагдлаа.' })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

const toggleErrorStatus = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE it_errors SET 
        status = CASE WHEN status='active' THEN 'inactive' ELSE 'active' END,
        updated_at = NOW()
       WHERE uuid=$1
       RETURNING status`,
      [req.params.uuid]
    )
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Олдсонгүй.' })
    return res.status(200).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = {
  getCategories, createCategory, updateCategory, deleteCategory,
  createSubcategory, updateSubcategory, deleteSubcategory,
  getErrors, createError, updateError, deleteError, toggleErrorStatus,
}