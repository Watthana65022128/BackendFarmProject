const express = require('express')
const router = express.Router()

const { createFarm, getFarms, getFarmId, removeFarm, deleteFarmAll } = require('../controllers/farmcontroller')

router.get('/farms/', getFarms)
router.get('/farm/:id', getFarmId)
router.post('/farm/', createFarm)
router.delete('/farm/:id', removeFarm)
router.delete('/farms/', deleteFarmAll);


module.exports = router