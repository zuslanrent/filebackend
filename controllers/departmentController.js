const { pool } = require('../config/db')
const axios = require('axios') // ← Гадаад API-руу хүсэлт явуулахад хэрэгтэй тул нэмэв

// GET /api/departments/external (Боди Группийн API-г дамжуулан дуудах шинэ функц)
const getExternalDepartments = async (req, res) => {
  try {
    const bodiUrl = 'http://intranet.bodigroup.mn/intranet/api/departments?api_key=int_api_7f766e223f04c1638db65580fcb356be2aeb3e79'
    
    // Сервер өөрөө Боди-гийн http хаяг руу хандаж өгөгдлийг татна (Mixed Content алдаа гарахгүй)
    const response = await axios.get(bodiUrl)
    
    // Боди-гийн API-аас ирсэн датаг шууд буцаана
    return res.status(200).json(response.data)
  } catch (error) {
    console.error('Боди API дуудахад алдаа гарлаа:', error.message)
    return res.status(500).json({ 
      success: false, 
      message: 'Боди Группийн системээс өгөгдөл татахад алдаа гарлаа.', 
      error: error.message 
    })
  }
}

// GET /api/departments
const getDepartments = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments ORDER BY created_at DESC')
    return res.status(200).json({ success: true, data: result.rows })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Алдаа гарлаа.', error: error.message })
  }
}

// GET /api/departments/:uuid
const getDepartmentById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments WHERE uuid = $1', [req.params.uuid])
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Хэлтэс олдсонгүй.' })
    return res.status(200).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Алдаа гарлаа.', error: error.message })
  }
}

// POST /api/departments
const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name)
      return res.status(400).json({ success: false, message: 'Хэлтсийн нэр оруулна уу.' })

    const result = await pool.query(
      'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    )
    return res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Алдаа гарлаа.', error: error.message })
  }
}

// PUT /api/departments/:uuid
const updateDepartment = async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name)
      return res.status(400).json({ success: false, message: 'Хэлтсийн нэр оруулна уу.' })

    const result = await pool.query(
      'UPDATE departments SET name = $1, description = $2 WHERE uuid = $3 RETURNING *',
      [name, description || null, req.params.uuid]
    )
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Хэлтэс олдсонгүй.' })
    return res.status(200).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Алдаа гарлаа.', error: error.message })
  }
}

// DELETE /api/departments/:uuid
const deleteDepartment = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM departments WHERE uuid = $1 RETURNING *', [req.params.uuid])
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Хэлтэс олдсонгүй.' })
    return res.status(200).json({ success: true, message: 'Хэлтэс амжилттай устгагдлаа.' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Алдаа гарлаа.', error: error.message })
  }
}

module.exports = { 
  getDepartments, 
  getDepartmentById, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment, 
  getExternalDepartments // ← Одоо яг зөв экспортлогдож байна
}