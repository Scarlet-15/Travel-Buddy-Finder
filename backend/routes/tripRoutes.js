const express = require('express');
const { createTrip, getTrips, getTripById, updateTrip, deleteTrip, getMyOrganizedTrips, getMyJoinedTrips, createChatRoom } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/my/organized', getMyOrganizedTrips);
router.get('/my/joined', getMyJoinedTrips);
router.get('/', getTrips);
router.post('/', createTrip);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/chat', createChatRoom);

module.exports = router;
