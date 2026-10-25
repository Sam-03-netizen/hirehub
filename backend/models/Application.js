import mongoose from 'mongoose';

export const STATUSES = ['Applied', 'Shortlisted', 'Rejected', 'Hired'];

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coverLetter: { type: String, default: '' },
    resume: { type: String, required: true },
    status: { type: String, enum: STATUSES, default: 'Applied' },
  },
  { timestamps: true }
);

// A candidate can apply to a job only once
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
