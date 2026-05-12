const express = require('express')
const { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/',         getDepartments)      // ← authMiddleware хасав
router.get('/:uuid',    getDepartmentById)   // ← authMiddleware хасав
router.post('/',        authMiddleware, createDepartment)
router.put('/:uuid',    authMiddleware, updateDepartment)
router.delete('/:uuid', authMiddleware, deleteDepartment)

module.exports = router