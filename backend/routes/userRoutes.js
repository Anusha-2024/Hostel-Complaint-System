const express = require('express');
const router = express.Router();
const {
  getStaffList, getAllUsers, createUser, toggleUser,
  getNotifications, markNotificationsRead, getSLAConfig, updateSLAConfig,
  assignStaffCategory, getStaffCategories, removeStaffCategory,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/notifications', getNotifications);
router.put('/notifications/read', markNotificationsRead);

router.get('/staff', authorize('admin'), getStaffList);
router.get('/staff-category', authorize('admin'), getStaffCategories);
router.post('/staff-category', authorize('admin'), assignStaffCategory);
router.delete('/staff-category/:id', authorize('admin'), removeStaffCategory);
router.get('/', authorize('admin'), getAllUsers);
router.post('/', authorize('admin'), createUser);
router.put('/:id/toggle', authorize('admin'), toggleUser);
router.get('/sla-config', authorize('admin'), getSLAConfig);
router.put('/sla-config', authorize('admin'), updateSLAConfig);

module.exports = router;
