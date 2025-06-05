const jobController = require('../controllers/jobController');
const express = require('express');
const { registerUser, loginUser, getProfile, updateProfile, deleteAccount } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Profile routes (protected)
router.get('/profile', authMiddleware, getProfile);
router.put('/update-profile', authMiddleware, updateProfile);
router.delete('/delete-account', authMiddleware, deleteAccount);

// router.post('/apply', authMiddleware, jobController.applyForJob);

module.exports = router;
