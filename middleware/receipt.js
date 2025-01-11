const multer = require('multer')
const path = require('path')
const fs = require('fs')

const upload = multer({
    storage: multer.diskStorage({
        destination: './uploads/',
        filename: (req, file, cb) => {
            cb(null, `receipt-${Date.now()}${path.extname(file.originalname)}`)
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(null, false)
        }
    }
}).single('receipt')

exports.validateImage = (req, res, next) => {
    upload(req, res, function(err) {
        console.log('Request files:', req.files)
        console.log('Request file:', req.file)
        console.log('Request body:', req.body)

        if (err) {
            return res.status(400).json({
                error: err.message
            })
        }

        if (!req.file) {
            return res.status(400).json({
                error: 'กรุณาอัพโหลดรูปใบเสร็จ'
            })
        }

        next()
    })
}