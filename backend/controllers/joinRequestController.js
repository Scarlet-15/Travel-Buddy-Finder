const JoinRequest = require('../models/JoinRequest');
const Trip = require('../models/Trip');
const User = require('../models/User');

// POST /api/join-requests - Submit join request
const createJoinRequest = async (req, res) => {
  try {
    const { tripId, joinUntilStep, finalDestination, travelDate, message } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    if (trip.status !== 'open') return res.status(400).json({ message: 'This trip is no longer open.' });
    if (trip.organizerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot join your own trip.' });
    }

    const existing = await JoinRequest.findOne({ userId: req.user._id, tripId, status: { $in: ['pending', 'approved'] } });
    if (existing) return res.status(409).json({ message: 'You have already requested to join this trip.' });

    const joinRequest = await JoinRequest.create({
      userId: req.user._id,
      tripId,
      joinUntilStep,
      finalDestination,
      travelDate,
      message,
    });

    await Trip.findByIdAndUpdate(tripId, { $push: { joinRequests: joinRequest._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { joinedTrips: tripId } });

    const populated = await joinRequest.populate('userId', 'name email phone registerNumber');
    res.status(201).json({ message: 'Join request submitted.', joinRequest: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting join request.' });
  }
};

// GET /api/join-requests/trip/:tripId - Get all join requests for a trip (organizer only)
const getTripJoinRequests = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    if (trip.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organizer can view join requests.' });
    }

    const requests = await JoinRequest.find({ tripId: req.params.tripId })
      .populate('userId', 'name email phone registerNumber');
    res.json({ joinRequests: requests });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching join requests.' });
  }
};

// GET /api/join-requests/my - Get my join requests
const getMyJoinRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find({ userId: req.user._id })
      .populate({ path: 'tripId', populate: { path: 'organizerId', select: 'name email phone' } });
    res.json({ joinRequests: requests });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching join requests.' });
  }
};

// PUT /api/join-requests/:id/status - Approve or reject (organizer only)
const updateJoinRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected.' });
    }

    const joinRequest = await JoinRequest.findById(req.params.id).populate('tripId');
    if (!joinRequest) return res.status(404).json({ message: 'Join request not found.' });

    if (joinRequest.tripId.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organizer can update join requests.' });
    }

    joinRequest.status = status;
    await joinRequest.save();

    res.json({ message: `Join request ${status}.`, joinRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error updating join request.' });
  }
};

// DELETE /api/join-requests/:id - Withdraw join request
const withdrawJoinRequest = async (req, res) => {
  try {
    const joinRequest = await JoinRequest.findById(req.params.id);
    if (!joinRequest) return res.status(404).json({ message: 'Join request not found.' });
    if (joinRequest.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only withdraw your own requests.' });
    }

    joinRequest.status = 'withdrawn';
    await joinRequest.save();
    res.json({ message: 'Join request withdrawn.' });
  } catch (error) {
    res.status(500).json({ message: 'Error withdrawing join request.' });
  }
};

module.exports = { createJoinRequest, getTripJoinRequests, getMyJoinRequests, updateJoinRequestStatus, withdrawJoinRequest };
