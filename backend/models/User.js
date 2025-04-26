import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  walletAddress: {
    type: String,
    required: [true, 'Please provide a wallet address'],
    unique: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Please provide a valid Ethereum wallet address']
  },
  nonce: {
    type: String, 
    required: true,
    default: () => Math.floor(Math.random() * 1000000).toString()
  },
  photoUrl: {
    type: String,
    default: '' 
  },
  aboutMe: {
    type: String,
    default: ''
  },
  skills: {
    type: [String], 
    default: []
  },
  portfolio: {
    type: [{ 
      title: { type: String, required: true },
      description: { type: String },
      url: { type: String }
    }],
    default: []
  },
  completedGigs: {
    type: Number,
    default: 0
  },
  totalEarned: {
    type: String,
    default: '0'
  },
}, {
  timestamps: true 
});
const User = mongoose.model('User', userSchema);
export default User;
