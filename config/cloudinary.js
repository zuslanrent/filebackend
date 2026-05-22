const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isImage = file.mimetype.startsWith('image/')
    
    const config = {
      folder: 'regulations',
      resource_type: isImage ? 'image' : 'raw', // PDF, Word зэрэг нь 'raw' болно
    }

    // Зөвхөн зураг хуулж байвал форматын хязгаарлалтыг Cloudinary-д өгнө
    if (isImage) {
      config.allowed_formats = ['jpg', 'png', 'jpeg']
    }
    // PDF, DOC-д allowed_formats өгөхгүй, шууд түүхийгээр (raw) хуулна

    return config
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