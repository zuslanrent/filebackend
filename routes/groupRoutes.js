const express = require('express')
const { getGroups, getGroupById, createGroup, updateGroup, deleteGroup } = require('../controllers/groupController')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/',         getGroups)
router.get('/:uuid',    getGroupById)
router.post('/',        createGroup)        // ← authMiddleware хасав
router.put('/:uuid',    authMiddleware, updateGroup)
router.delete('/:uuid', authMiddleware, deleteGroup)

module.exports = router