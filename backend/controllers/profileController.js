const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const bcrypt = require('bcryptjs');

// Update User Profile
exports.updateProfile = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    if (password) {
      // Hash the new password if provided
      updates.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, // User ID from JWT
      updates,
      { new: true } // Return the updated user
    ).select('-password'); // Exclude password from response

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete User Account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Optionally, delete related data (e.g., jobs, applications)
    await Job.deleteMany({ employerId: userId }); // Delete jobs posted by the user
    await Application.deleteMany({ userId });    // Delete applications by the user

    // Delete the user account
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'Account and related data deleted successfully!' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
