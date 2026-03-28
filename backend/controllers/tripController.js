const Trip = require('../models/Trip');
const User = require('../models/User');
const JoinRequest = require('../models/JoinRequest');

// POST /api/trips - Create trip
const createTrip = async (req, res) => {
  try {
    const { destination, travelDate, preferredSex, companionUntilStep, transportSteps, additionalDetails, maxCompanions } = req.body;

    const stepsWithNumbers = transportSteps.map((step, i) => ({ ...step, stepNumber: i + 1 }));

    const trip = await Trip.create({
      organizerId: req.user._id,
      destination,
      travelDate,
      preferredSex,
      companionUntilStep,
      transportSteps: stepsWithNumbers,
      additionalDetails,
      maxCompanions: maxCompanions || 4,
    });

    await User.findByIdAndUpdate(req.user._id, { $push: { createdTrips: trip._id } });

    const populated = await trip.populate('organizerId', 'name email phone registerNumber');
    res.status(201).json({ message: 'Trip created successfully', trip: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating trip.' });
  }
};

// GET /api/trips - Get all trips (with optional search)
const getTrips = async (req, res) => {
  try {
    const { search, date, mode } = req.query;
    let query = { status: 'open' };

    if (search) {
      query.$or = [
        { destination: { $regex: search, $options: 'i' } },
        { 'transportSteps.from': { $regex: search, $options: 'i' } },
        { 'transportSteps.to': { $regex: search, $options: 'i' } },
      ];
    }
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      query.travelDate = { $gte: d, $lt: next };
    }
    if (mode) {
      query['transportSteps.mode'] = mode;
    }

    const trips = await Trip.find(query)
      .populate('organizerId', 'name email phone registerNumber')
      .populate({ path: 'joinRequests', match: { status: 'approved' }, select: 'userId' })
      .sort({ travelDate: 1 });

    res.json({ trips });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching trips.' });
  }
};

// GET /api/trips/:id - Get single trip
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('organizerId', 'name email phone registerNumber')
      .populate({
        path: 'joinRequests',
        populate: { path: 'userId', select: 'name email phone registerNumber' },
      });

    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    res.json({ trip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching trip.' });
  }
};

// PUT /api/trips/:id - Update trip
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    if (trip.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organizer can update this trip.' });
    }

    const updated = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('organizerId', 'name email phone registerNumber');

    res.json({ message: 'Trip updated', trip: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating trip.' });
  }
};

// DELETE /api/trips/:id - Cancel trip
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    if (trip.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organizer can cancel this trip.' });
    }

    await Trip.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ message: 'Trip cancelled successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error cancelling trip.' });
  }
};

// GET /api/trips/my/organized
const getMyOrganizedTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ organizerId: req.user._id })
      .populate('organizerId', 'name email phone')
      .populate({ path: 'joinRequests', populate: { path: 'userId', select: 'name email phone' } })
      .sort({ travelDate: -1 });
    res.json({ trips });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organized trips.' });
  }
};

// GET /api/trips/my/joined
const getMyJoinedTrips = async (req, res) => {
  try {
    const requests = await JoinRequest.find({ userId: req.user._id, status: 'approved' })
      .populate({
        path: 'tripId',
        populate: { path: 'organizerId', select: 'name email phone' },
      });
    const trips = requests.map((r) => r.tripId);
    res.json({ trips });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching joined trips.' });
  }
};

module.exports = { createTrip, getTrips, getTripById, updateTrip, deleteTrip, getMyOrganizedTrips, getMyJoinedTrips };
