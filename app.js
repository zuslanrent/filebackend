const express = require('express')
const cors = require('cors')

const userRoutes       = require('./routes/userRoutes')
const groupRoutes      = require('./routes/groupRoutes')
const departmentRoutes = require('./routes/departmentRoutes')
const regulationRoutes = require('./routes/regulationRoutes')

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

app.use(express.json())

app.get('/', (req, res) => res.send('Backend is running ✅'))

app.use('/api/users',       userRoutes)
app.use('/api/groups',      groupRoutes)
app.use('/api/departments', departmentRoutes)
app.use('/api/regulations', regulationRoutes)

module.exports = app
