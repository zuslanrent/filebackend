const express = require('express')
const { getRegulations, getRegulationById, createRegulation, updateRegulation, deleteRegulation } = require('../controllers/regulationController')
const { authMiddleware } = require('../middleware/auth')
const { upload } = require('../config/cloudinary')

const router = express.Router()

router.get('/',        getRegulations)
router.get('/:uuid',   getRegulationById)
router.post('/',       createRegulation)        // ← authMiddleware хасав
router.put('/:uuid',   authMiddleware, updateRegulation)
router.delete('/:uuid',authMiddleware, deleteRegulation)

// File upload — authMiddleware хасав
router.post('/upload', upload.single('file'), (req, res) => {
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