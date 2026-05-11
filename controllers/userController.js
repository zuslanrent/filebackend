const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../config/db')

// POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Нэвтрэх нэр болон нууц үг оруулна уу.' })

    const existing = await pool.query('SELECT uuid FROM users WHERE username = $1', [username])
    if (existing.rowCount > 0)
      return res.status(409).json({ success: false, message: 'Нэвтрэх нэр аль хэдийн бүртгэлтэй байна.' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const inserted = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING uuid, username, created_at',
      [username, hashedPassword]
    )

    return res.status(201).json({ success: true, data: inserted.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Бүртгэлд алдаа гарлаа.', error: error.message })
  }
}

// POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Нэвтрэх нэр болон нууц үг оруулна уу.' })

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username])
    if (result.rowCount === 0)
      return res.status(401).json({ success: false, message: 'Нэвтрэх нэр эсвэл нууц үг буруу байна.' })

    const user = result.rows[0]
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Нэвтрэх нэр эсвэл нууц үг буруу байна.' })

    const token = jwt.sign(
      { uuid: user.uuid, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    return res.status(200).json({
      success: true,
      token,
      user: { uuid: user.uuid, username: user.username, created_at: user.created_at },
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Нэвтрэхэд алдаа гарлаа.', error: error.message })
  }
}

// GET /api/users/me
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT uuid, username, created_at FROM users WHERE uuid = $1',
      [req.user.uuid]
    )
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Хэрэглэгч олдсонгүй.' })

    return res.status(200).json({ success: true, data: result.rows[0] })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Алдаа гарлаа.', error: error.message })
  }
}

module.exports = { registerUser, loginUser, getMe }
