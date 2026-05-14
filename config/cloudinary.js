const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Файлын төрлөөс хамааран resource_type-г динамик сонгох
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isPdf = file.mimetype === 'application/pdf'
    const isImage = file.mimetype.startsWith('image/')
    const isDocument = file.mimetype.includes('word') || 
                       file.mimetype.includes('excel') ||
                       file.mimetype.includes('powerpoint')
    
    return {
      folder: 'regulations',
      allowed_formats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'jpeg'],
      // PDF бол 'image' (хөтөч дээр харагдуулах), бусад бол 'raw'
      resource_type: isPdf ? 'image' : (isImage ? 'image' : 'raw'),
      // PDF-г inline харуулах (attachment биш)
      flags: isPdf ? 'attachment' : undefined,
      // PDF-г өндөр чанартай харуулах
      transformation: isPdf ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined,
    }
  },
})

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ]
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Файлын төрөл дэмжигдэхгүй байна'), false)
    }
  }
})

module.exports = { cloudinary, upload }