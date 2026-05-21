const express = require('express')
const cors = require('cors')

const userRoutes       = require('./routes/userRoutes')
const groupRoutes      = require('./routes/groupRoutes')
const departmentRoutes = require('./routes/departmentRoutes')
const regulationRoutes = require('./routes/regulationRoutes')
const auditRoutes = require('./routes/auditRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const itSupportRoutes = require('./routes/itSupportRoutes')
const errorRoutes = require('./routes/errorRoutes');

const app = express()

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002', // ← нэмэх
    'https://fund-ecru.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

// Эхлээд OPTIONS
app.options('*', cors(corsOptions))

// Дараа нь cors middleware
app.use(cors(corsOptions))
app.use(express.json())

app.get('/', (req, res) => res.send('Backend is running ✅'))

app.use('/api/users',       userRoutes)
app.use('/api/groups',      groupRoutes)
app.use('/api/departments', departmentRoutes)
app.use('/api/regulations', regulationRoutes)
app.use('/api/audit-logs', auditRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/itsupport', itSupportRoutes)
app.use('/api/itsupport/errors', errorRoutes);

module.exports = app