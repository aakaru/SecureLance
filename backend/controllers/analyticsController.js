import User from '../models/User.js';

export async function getLeaderboard(req, res) {
  try {
    const topFreelancers = await User.find()
      .sort({ completedGigs: -1, totalEarned: -1 })
      .limit(5)
      .select('username walletAddress completedGigs totalEarned');

    res.json({ success: true, data: topFreelancers });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}