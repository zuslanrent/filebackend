const express = require('express')
const {
  getCategories, getSubcategories,
  createCategory, createSubcategory,
  deleteCategory, deleteSubcategory,
} = require('../controllers/categoryController')

const router = express.Router()

router.get('/',                          getCategories)
router.get('/:uuid/subcategories',       getSubcategories)
router.post('/',                         createCategory)
router.post('/:uuid/subcategories',      createSubcategory)
router.delete('/:uuid',                  deleteCategory)
router.delete('/subcategories/:uuid',    deleteSubcategory)

module.exports = router