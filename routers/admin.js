const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const { getAllUsers, banUser, unbanUser } = require('../controllers/admincontroller');

router.get('/admin/users', verifyToken, isAdmin, getAllUsers);
router.post('/admin/users/ban', verifyToken, isAdmin, banUser);
router.post('/admin/users/unban', verifyToken, isAdmin, unbanUser);

module.exports = router;