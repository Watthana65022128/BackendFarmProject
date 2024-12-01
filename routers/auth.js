const express = require('express')
const router = express.Router()
const { register, login, updateUserProfile, getAllUsers, getUserProfile } = require('../controllers/authcontroller')
const { validateRegister, verifyToken} = require('../middleware/auth')  

router.post('/register', validateRegister, register)
router.post('/login', login)
router.get('/user/', getAllUsers)
router.put('/user/profile', verifyToken, updateUserProfile)
router.get('/user/profile', verifyToken, getUserProfile)

module.exports = router