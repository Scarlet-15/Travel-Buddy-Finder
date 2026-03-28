const express = require('express');
const { createJoinRequest, getTripJoinRequests, getMyJoinRequests, updateJoinRequestStatus, withdrawJoinRequest } = require('../controllers/joinRequestController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createJoinRequest);
router.get('/my', getMyJoinRequests);
router.get('/trip/:tripId', getTripJoinRequests);
router.put('/:id/status', updateJoinRequestStatus);
router.delete('/:id', withdrawJoinRequest);

module.exports = router;
