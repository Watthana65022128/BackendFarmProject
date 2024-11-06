const express = require('express')
const router = express.Router()

const { createFarm, getFarm, listFarm, removeFarm } = require('../controllers/farmcontroller')

router.get('/farm/', getFarm)
router.get('/farm/:id', listFarm)
router.post('/farm/', createFarm)
router.delete('/farm/:id', removeFarm)


module.exports = router