const express = require('express')
const { getRegulations, getRegulationById, createRegulation, updateRegulation, deleteRegulation } = require('../controllers/regulationController')
const { authMiddleware } = require('../middleware/auth')
const { upload } = require('../config/cloudinary')

const router = express.Router()

router.get('/',        getRegulations)
router.get('/:uuid',   getRegulationById)
router.post('/',       createRegulation)
router.put('/:uuid',   authMiddleware, updateRegulation)
router.delete('/:uuid',authMiddleware, deleteRegulation)

router.post('/upload', upload.single('file'), (req, res) => {
  try {
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
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ success: false, message: error.message })
  }
})

// ← Энд нэмнэ
router.use((err, req, res, next) => {
  console.error('Multer/Cloudinary error:', err)
  return res.status(500).json({ success: false, message: err.message || 'Upload failed' })
})

module.exports = router