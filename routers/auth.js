const express = require('express')
const router = express.Router()
const { register, login, getUserId, updateUser } = require('../controllers/authcontroller')
const { validateRegister } = require('../middleware/auth')

router.post('/register', validateRegister, register)
router.post('/login', login)
router.get('/user/:id', getUserId)
router.put('/user/:id', updateUser)


module.exports = router