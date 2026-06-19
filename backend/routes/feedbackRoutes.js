const express = require('express');
const router = express.Router();
const { submitFeedback, getStaffFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('student'), submitFeedback);
router.get('/staff/:staffId', getStaffFeedback);

module.exports = router;
