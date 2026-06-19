const express = require('express');
const router = express.Router();
const {
  createComplaint, getComplaints, getComplaint,
  updateStatus, assignComplaint, deleteComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.post('/', authorize('student'), upload.single('image'), createComplaint);
router.get('/', getComplaints);
router.get('/:id', getComplaint);
router.put('/:id/status', authorize('staff', 'admin'), upload.single('proof_image'), updateStatus);
router.put('/:id/assign', authorize('admin'), assignComplaint);
router.delete('/:id', authorize('admin'), deleteComplaint);

module.exports = router;
