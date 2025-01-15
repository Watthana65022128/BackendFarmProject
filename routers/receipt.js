const express = require('express')
const router = express.Router()
const { createReceipt , scanReceipt, deleteReceipt} = require('../controllers/receiptcontroller')
const { verifyToken } = require('../middleware/auth')
const { validateImage } = require('../middleware/receipt')

router.post('/receipts/scan', validateImage, verifyToken, scanReceipt)
router.post('/receipts',  verifyToken,  createReceipt)
router.delete('/receipts/:id', verifyToken, deleteReceipt)

module.exports = router