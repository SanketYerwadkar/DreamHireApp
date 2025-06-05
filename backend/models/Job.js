const mongoose = require('mongoose');

// Define Job Schema
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  type: { type: String, required: true },  // Full-Time, Part-Time, Remote, etc.
  description: { type: String, required: true },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Ensure employerId is defined
  postedAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
