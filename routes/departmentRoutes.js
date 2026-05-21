const express = require('express')
const { 
  getDepartments, 
  getDepartmentById, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment,
  getExternalDepartments // ← Шинээр нэмсэн controller функц
} = require('../controllers/departmentController')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// 1. Боди Группийн API-г дамжуулан дуудах шинэ route (Эхэнд нь байх ёстой)
router.get('/external', getExternalDepartments)

// 2. Бусад үндсэн замууд
router.get('/',         getDepartments)      // ← authMiddleware хасав
router.get('/:uuid',    getDepartmentById)   // ← authMiddleware хасав (Заавал /external-ийн доор байна)
router.post('/',        authMiddleware, createDepartment)
router.put('/:uuid',    authMiddleware, updateDepartment)
router.delete('/:uuid', authMiddleware, deleteDepartment)

module.exports = router