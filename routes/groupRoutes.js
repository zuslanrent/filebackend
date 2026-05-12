const express = require('express')
const { getGroups, getGroupById, createGroup, updateGroup, deleteGroup } = require('../controllers/groupController')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// GET — token шаардахгүй (public)
router.get('/',        getGroups)
router.get('/:uuid',   getGroupById)

// POST, PUT, DELETE — token шаардана
router.post('/',       authMiddleware, createGroup)
router.put('/:uuid',   authMiddleware, updateGroup)
router.delete('/:uuid',authMiddleware, deleteGroup)

module.exports = router