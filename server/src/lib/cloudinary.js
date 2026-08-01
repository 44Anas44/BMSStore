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

// Team member photos — square 500px
const teamStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: '-/team',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill', quality: 'auto' }],
  },
})

// Achievement / blog post images — wide 1200px
const achievementStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: '-/achievements',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, quality: 'auto' }],
  },
})

// About page hero/cover image — wide 1600px
const aboutStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: '-/about',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, quality: 'auto' }],
  },
})

const uploadProducts    = multer({ storage: productStorage,     limits: { fileSize: 8 * 1024 * 1024 } })
const uploadCategory    = multer({ storage: categoryStorage,    limits: { fileSize: 5 * 1024 * 1024 } })
const uploadBrand       = multer({ storage: brandStorage,       limits: { fileSize: 3 * 1024 * 1024 } })
const uploadTeam        = multer({ storage: teamStorage,        limits: { fileSize: 5 * 1024 * 1024 } })
const uploadAchievement = multer({ storage: achievementStorage, limits: { fileSize: 8 * 1024 * 1024 } })
const uploadAbout       = multer({ storage: aboutStorage,       limits: { fileSize: 8 * 1024 * 1024 } })

module.exports = { cloudinary, uploadProducts, uploadCategory, uploadBrand, uploadTeam, uploadAchievement, uploadAbout }
