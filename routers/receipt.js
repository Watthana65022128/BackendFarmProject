const express = require('express')
const router = express.Router()
const { createReceipt , deleteReceipt} = require('../controllers/receiptcontroller')
const { verifyToken } = require('../middleware/auth')
const { validateImage } = require('../middleware/receipt')

router.post('/receipts', verifyToken, validateImage, createReceipt)
router.delete('/receipts/:id', verifyToken, deleteReceipt)

module.exports = router