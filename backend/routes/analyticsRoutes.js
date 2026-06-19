const express = require('express');
const router = express.Router();
const { getDashboard, getStudentDashboard, getStaffDashboard } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', authorize('admin'), getDashboard);
router.get('/student', authorize('student'), getStudentDashboard);
router.get('/staff', authorize('staff'), getStaffDashboard);

module.exports = router;
