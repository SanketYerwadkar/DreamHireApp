const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController'); // Import jobController
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require("../middlewares/upload");

// Application-related routes
router.get('/applications', jobController.getApplications); // Get all applications
router.patch('/applications/:id', jobController.updateApplicationStatus); // Update application status

// Job-related routes
router.get('/', jobController.getJobs); // Fetch all jobs
router.post('/:jobId/apply',upload.single("resume"), jobController.applyForJob); // Apply for a job
router.post('/post',authMiddleware(['employer']),jobController.postJob); // Post a new job
router.get('/:id', jobController.getJobById); // Get a job by ID

module.exports = router;
