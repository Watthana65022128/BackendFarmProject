const express = require('express')
const router = express.Router()
const { createReceipt } = require('../controllers/receiptcontroller')
const { verifyToken } = require('../middleware/auth')
const { validateImage } = require('../middleware/receipt')

router.post('/receipts', verifyToken, validateImage, createReceipt)

module.exports = router