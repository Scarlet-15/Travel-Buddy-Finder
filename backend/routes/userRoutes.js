const express = require('express');
const { getProfile, updateProfile, getTravelHistory } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/history', getTravelHistory);

module.exports = router;
