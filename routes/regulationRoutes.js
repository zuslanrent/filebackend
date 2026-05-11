const express = require('express')
const { getRegulations, getRegulationById, createRegulation, updateRegulation, deleteRegulation } = require('../controllers/regulationController')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/',        authMiddleware, getRegulations)
router.get('/:uuid',   authMiddleware, getRegulationById)
router.post('/',       authMiddleware, createRegulation)
router.put('/:uuid',   authMiddleware, updateRegulation)
router.delete('/:uuid',authMiddleware, deleteRegulation)

const { upload } = require('../config/cloudinary')

// File upload endpoint
router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: 'Файл байхгүй байна.' })

  res.json({
    success: true,
    data: {
      url:       req.file.path,
      file_name: req.file.originalname,
      file_size: req.file.size,
    },
  })
})

module.exports = router
