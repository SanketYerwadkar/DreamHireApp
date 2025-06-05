require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors'); // CORS middleware
const mongoose = require('mongoose'); 
const connectDB = require('./config/db'); // MongoDB connection logic
const jobRoutes = require('./routes/jobRoutes'); // Job-related routes
const authRoutes = require('./routes/authRoutes'); // Authentication routes
const profileRoutes = require('./routes/profileRoutes'); // Profile-related routes
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Enable CORS for all origins
app.use(cors({
  origin: (origin, callback) => {
    console.log('Request Origin:', origin);  // Log the origin to ensure it's being captured correctly
    const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:5500'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Add PATCH here
  allowedHeaders: ['Content-Type', 'Authorization'], // Ensure allowed headers are specified
  credentials: true, // Allow credentials (if needed)
}));

// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Static file serving for uploaded files
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/profile', profileRoutes); // Profile-related routes

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to DreamHire API');
});

// global error-handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    route: req.originalUrl,
  });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong on the server.',
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit();
});

