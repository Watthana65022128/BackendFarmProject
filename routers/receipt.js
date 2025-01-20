const express = require('express')
const router = express.Router()
const { createReceipt , scanReceipt, deleteReceipt, getReceipts } = require('../controllers/receiptcontroller')
const { verifyToken } = require('../middleware/auth')
const { validateImage } = require('../middleware/receipt')

router.post('/receipts/scan', validateImage, verifyToken, scanReceipt)
router.post('/receipts',  verifyToken,  createReceipt)
router.delete('/receipts/:id', verifyToken, deleteReceipt)
router.get('/receipts', verifyToken, getReceipts)

module.exports = router