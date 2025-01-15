const express = require('express')
const router = express.Router()

const { createFarm, getFarms, removeFarm, updateBudget } = require('../controllers/farmcontroller')
const {  verifyToken } = require('../middleware/auth')  

router.get('/farms/', verifyToken, getFarms)
router.post('/farm/', verifyToken, createFarm)
router.delete('/farm/:id', verifyToken, removeFarm)
router.put('/farm/budget', verifyToken, updateBudget);


module.exports = router