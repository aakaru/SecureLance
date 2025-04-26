import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contractGigId: { type: String, required: true },
  milestone: { type: String },
  notes: { type: String },
  ipfsUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Submission = mongoose.model('Submission', SubmissionSchema);
export default Submission;
