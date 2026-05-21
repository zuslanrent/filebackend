const express = require('express')
const {
  getCategories, createCategory, updateCategory, deleteCategory,
  createSubcategory, updateSubcategory, deleteSubcategory,
  getErrors, createError, updateError, deleteError, toggleErrorStatus,
} = require('../controllers/itSupportController')

const router = express.Router()

router.get('/categories',                                    getCategories)
router.post('/categories',                                   createCategory)
router.put('/categories/:uuid',                              updateCategory)
router.delete('/categories/:uuid',                           deleteCategory)
router.post('/categories/:uuid/subcategories',               createSubcategory)
router.put('/categories/:uuid/subcategories/:subUuid',       updateSubcategory)
router.delete('/categories/:uuid/subcategories/:subUuid',    deleteSubcategory)
router.get('/errors',                getErrors)
router.post('/errors',               createError)
router.put('/errors/:uuid',          updateError)
router.delete('/errors/:uuid',       deleteError)
router.patch('/errors/:uuid/toggle', toggleErrorStatus)

module.exports = router