const router = require('express').Router();
const ctrl = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/my', authenticate, ctrl.getMyNotifications);
router.get('/unread-count', authenticate, ctrl.getUnreadCount);
router.put('/mark-all-read', authenticate, ctrl.markAllRead);
router.put('/:id/read', authenticate, ctrl.markRead);
router.get('/', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getAllNotifications);
router.post('/', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.createNotification);
router.post('/broadcast', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.broadcastNotification);
router.delete('/:id', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.deleteNotification);

module.exports = router;
