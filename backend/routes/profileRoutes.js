const express = require('express');
const { updateProfile, deleteAccount } = require('../controllers/profileController');
const { getProfile } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Route for updating user profile
router.put('/update-profile', authMiddleware(), updateProfile);

// Route for deleting user account
router.delete('/delete-account', authMiddleware(), deleteAccount);

router.get('/', authMiddleware(), getProfile);

module.exports = router;







