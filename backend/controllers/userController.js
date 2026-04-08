const User = require('../models/User');
const Trip = require('../models/Trip');
const JoinRequest = require('../models/JoinRequest');

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('createdTrips', 'destination travelDate status')
      .populate('joinedTrips', 'destination travelDate status');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile.' });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ message: 'Profile updated.', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile.' });
  }
};

// GET /api/users/history - Travel history
const getTravelHistory = async (req, res) => {
  try {
    const organized = await Trip.find({ organizerId: req.user._id, status: 'completed' })
      .select('destination travelDate transportSteps');
    const joinedRequests = await JoinRequest.find({ userId: req.user._id, status: 'approved' })
      .populate({ path: 'tripId', match: { status: 'completed' }, select: 'destination travelDate transportSteps' });
    const joined = joinedRequests.filter((r) => r.tripId).map((r) => r.tripId);

    res.json({ organized, joined });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching travel history.' });
  }
};

module.exports = { getProfile, updateProfile, getTravelHistory };
