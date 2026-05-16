const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Product images — up to 1200px wide, high quality
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: '-/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, quality: 'auto' }],
  },
})

// Category images — square 600px, used on homepage cards
const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: '-/categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 600, height: 600, crop: 'fill', quality: 'auto' }],
  },
})

// Brand logos — small, keep aspect ratio
const brandStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: '-/brands',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    transformation: [{ width: 400, quality: 'auto' }],
  },
})

const uploadProducts  = multer({ storage: productStorage,  limits: { fileSize: 8 * 1024 * 1024 } })
const uploadCategory  = multer({ storage: categoryStorage, limits: { fileSize: 5 * 1024 * 1024 } })
const uploadBrand     = multer({ storage: brandStorage,    limits: { fileSize: 3 * 1024 * 1024 } })

module.exports = { cloudinary, uploadProducts, uploadCategory, uploadBrand }
