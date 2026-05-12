const express = require('express')
const { getAuditLogs, createAuditLog } = require('../controllers/auditController')

const router = express.Router()

router.get('/',  getAuditLogs)
router.post('/', createAuditLog)

module.exports = router