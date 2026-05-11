const express = require('express')
const { getGroups, getGroupById, createGroup, updateGroup, deleteGroup } = require('../controllers/groupController')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/',        authMiddleware, getGroups)
router.get('/:uuid',   authMiddleware, getGroupById)
router.post('/',       authMiddleware, createGroup)
router.put('/:uuid',   authMiddleware, updateGroup)
router.delete('/:uuid',authMiddleware, deleteGroup)

module.exports = router
