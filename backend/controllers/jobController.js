const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');

// Configure Multer for file uploads with validation
const uploadsDir = 'uploads/';
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = /pdf|doc|docx/;
    const isValid = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    isValid ? cb(null, true) : cb(new Error('Only .pdf, .doc, and .docx files are allowed!'));
  },
});

// GET: Fetch job listings with optional filters and pagination
exports.getJobs = async (req, res) => {
  const { jobTitle, location, jobType, page = 1, limit = 9 } = req.query;

  const filter = {};
  if (jobTitle) filter.title = { $regex: jobTitle, $options: 'i' };
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (jobType) filter.type = { $regex: `^${jobType}$`, $options: 'i' };

  // const skip = (page - 1) * limit;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const jobs = await Job.find(filter).skip(skip).limit(parseInt(limit));
    const totalJobs = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      jobs,
      pagination: {
        totalJobs,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalJobs / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch jobs. Please try again later.' });
  }
};


// POST: Apply for a job (with resume upload)
// exports.applyForJob = [
//   upload.single('resume'), // Middleware to handle single file upload
//   async (req, res) => {
//     const { coverLetter } = req.body;
//     const resume = req.file;

//     if (!coverLetter || !resume) {
//       return res.status(400).json({ success: false, message: 'Cover letter and resume are required.' });
//     }

//     // Validate file type
//     const allowedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
//     if (!allowedFileTypes.includes(resume.mimetype)) {
//       return res.status(400).json({ success: false, message: 'Only PDF, DOC, and DOCX files are allowed.' });
//     }

//     // Validate file size (5MB limit)
//     const maxFileSize = 5 * 1024 * 1024; // 5MB
//     if (resume.size > maxFileSize) {
//       return res.status(400).json({ success: false, message: 'Resume file size must not exceed 5MB.' });
//     }

//     try {
//       const newApplication = new Application({
//         coverLetter,
//         resumeFilename: resume.filename, // Save the file's name for future reference
//         resumePath: resume.path, // Optionally, save the file path if needed
//       });
      
//       await newApplication.save();
//       res.status(201).json({ success: true, message: 'Application submitted successfully!' });
//     } catch (error) {
//       console.error('Error saving application:', error.message);
//       res.status(500).json({ success: false, message: 'Failed to save application. Please try again later.' });
//     }
//   },
// ];


// POST: Apply for a job (with resume upload)
exports.applyForJob = async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const resume = req.file;
    const jobId = req.params.jobId; // Get Job ID from URL

    // Validate required fields
    if (!coverLetter || !resume || !jobId) {
      return res.status(400).json({
        success: false,
        message: "Cover letter, resume, and jobId are required.",
      });
    }

    // Check if the job exists
    const jobExists = await Job.findById(jobId);
    if (!jobExists) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    // Validate file type for resume
    const allowedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedFileTypes.includes(resume.mimetype)) {
      return res.status(400).json({ success: false, message: 'Only PDF, DOC, and DOCX files are allowed.' });
    }

    // Validate file size (5MB limit)
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (resume.size > maxFileSize) {
      return res.status(400).json({ success: false, message: 'Resume file size must not exceed 5MB.' });
    }

    // Create and save application
    const newApplication = new Application({
      coverLetter,
      resumeFilename: resume.filename,
      jobId, // Save the associated Job ID
    });
    await newApplication.save();

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save application. Please try again later.",
    });
  }
};

// POST: Create a new job posting (employer only)
exports.postJob = async (req, res) => {
  console.log("Decoded User Role:", req.user?.role); // Debugging user role
  console.log("User Data:", req.user); // Debugging full user object

  if (!req.user || req.user.role !== "employer") {
      return res.status(403).json({ success: false, message: "You must be an employer to post a job." });
  }

  // Validate input fields before saving
  const { title, company, location, salary, description, type } = req.body;
  if (!title || !company || !location || !salary || !type || !description) {
      return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
      const job = new Job({
          title,
          company,
          location,
          salary,
          type,
          description,
          employerId: req.user.id, // Ensure employerId is stored
      });

      await job.save();
      res.status(201).json({ success: true, message: "Job posted successfully!", job });
  } catch (error) {
      console.error("Error posting job:", error); // Log full error
      res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};



// Seed sample job data for testing
exports.seedJobs = async () => {
  try {
    const existingJobs = await Job.countDocuments();
    if (existingJobs > 0) {
      return console.log('Jobs already exist in the database.');
    }

    const sampleJobs = [
      {
        title: 'Software Developer',
        company: 'XYZ Ltd.',
        location: 'Remote',
        salary: '$70,000 - $90,000',
        type: 'Full-Time',
        description: 'Develop software solutions and build scalable systems.',
      },
      { 
        title: "Data Scientist", 
        company: "ABC Inc.", 
        location: "New York", 
        salary: "$100,000 - $120,000", 
        description: "Analyze and interpret complex data to help companies make informed decisions.", 
        type: "Remote" 
      },
      { 
        title: "Product Manager", 
        company: "TechSolutions", 
        location: "San Francisco", 
        salary: "$90,000 - $110,000", 
        description: "Manage product lifecycle and collaborate with cross-functional teams to define product vision.", 
        type: "Full-Time" 
      },
      { 
        title: "Backend Developer", 
        company: "CodeCraft Solutions", 
        location: "Boston", 
        salary: "$90,000 - $110,000", 
        description: "Develop and maintain server-side logic, APIs, and databases for scalable web applications.", 
        type: "Full-Time" 
      },
      { 
        title: "Data Analyst", 
        company: "Analytics Hub", 
        location: "New York City", 
        salary: "$70,000 - $90,000", 
        description: "Analyze data trends to provide actionable insights for business decision-making.", 
        type: "Full-Time" 
      },
      { 
        title: "UX/UI Designer", 
        company: "Creative Studio", 
        location: "Los Angeles", 
        salary: "$80,000 - $100,000", 
        description: "Design user-friendly interfaces and ensure a seamless user experience.", 
        type: "Full-Time" 
      },
      { 
        title: "Marketing Manager", 
        company: "Global Brand", 
        location: "Chicago", 
        salary: "$75,000 - $95,000", 
        description: "Develop and implement marketing strategies to drive brand growth and engagement.", 
        type: "Full-Time" 
      },
      { 
        title: "Sales Engineer", 
        company: "Innovative Solutions", 
        location: "Remote", 
        salary: "$85,000 - $105,000", 
        description: "Collaborate with the sales team to provide technical expertise during the sales process.", 
        type: "Full-Time" 
      },
      { 
        title: "Machine Learning Engineer", 
        company: "Future Tech", 
        location: "Austin", 
        salary: "$95,000 - $115,000", 
        description: "Design and develop machine learning models to solve real-world problems.", 
        type: "Remote" 
      },
      { 
        title: "DevOps Engineer", 
        company: "CloudTech", 
        location: "Seattle", 
        salary: "$85,000 - $105,000", 
        description: "Build and maintain the infrastructure for smooth deployment and operation of applications.", 
        type: "Full-Time" 
      },
      { 
        title: "Financial Analyst", 
        company: "FinCorp", 
        location: "Boston", 
        salary: "$70,000 - $90,000", 
        description: "Analyze financial data and provide insights for investment and budgeting decisions.", 
        type: "Full-Time" 
      },
      { 
        title: "Customer Support Specialist", 
        company: "HelpDesk Pro", 
        location: "Remote", 
        salary: "$40,000 - $60,000", 
        description: "Provide excellent customer service by resolving issues and ensuring customer satisfaction.", 
        type: "Full-Time" 
      }
      // Add more sample jobs here...
    ];

    const result = await Job.insertMany(sampleJobs);
    console.log(`Sample jobs inserted: ${result.length}`);
  } catch (error) {
    console.error('Error seeding jobs:', error.message);
  }
};

// GET: Fetch a specific job by ID
exports.getJobById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid job ID format.' });
  }

  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'No job found with the provided ID.' });
    }
    res.status(200).json({ success: true, job });
  } catch (error) {
    console.error('Error fetching job by ID:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch job. Please try again later.' });
  }
};

// GET: Fetch job applications
// Fetch all applications for a job
exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find(); // Make sure you're fetching from the Application model
    if (!applications.length) {
      return res.status(404).json({ success: false, message: 'No applications found.' });
    }
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching applications:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch applications. Please try again later.' });
  }
};


// PATCH: Mark a job application as reviewed
exports.updateApplicationStatus = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid application ID.' });
  }

  try {
    const application = await Application.findByIdAndUpdate(id, { reviewed: true }, { new: true });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.status(200).json({ success: true, message: 'Application marked as reviewed', data: application });
  } catch (error) {
    console.error('Error updating application:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update application. Please try again later.' });
  }
};
