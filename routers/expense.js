const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { 
    getManagementExpenses,
    getProductionExpenses,
    getTotalExpenses 
} = require('../controllers/expenseController');

router.get('/farms/:farmId/management-expenses', verifyToken, getManagementExpenses);
router.get('/farms/:farmId/production-expenses', verifyToken, getProductionExpenses);
router.get('/farms/:farmId/expenses', verifyToken, getTotalExpenses);

module.exports = router;  