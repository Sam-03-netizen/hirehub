import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: [6, 'Password must be at least 6 characters'], select: false },
    role: { type: String, enum: ['candidate', 'recruiter'], default: 'candidate' },
    headline: { type: String, trim: true, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },
    skills: [String],
    avatar: { type: String, default: '' },
    resume: { url: String, name: String },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);
