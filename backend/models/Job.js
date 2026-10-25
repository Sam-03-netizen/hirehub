import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Job title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    company: { type: String, required: [true, 'Company is required'], trim: true },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    type: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'], default: 'Full-time' },
    salary: { type: String, default: '' },
    skills: [String],
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Job', jobSchema);
