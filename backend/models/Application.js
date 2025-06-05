const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  coverLetter: { type: String, required: true },
  resumeFilename: { type: String, required: true },
  appliedAt: { type: Date, default: Date.now },
  reviewed: { type: Boolean, default: false },
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to the user who applied
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }, // Link to the job being applied for
});

module.exports = mongoose.model('Application', applicationSchema);
