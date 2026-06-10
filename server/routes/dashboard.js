const router = require('express').Router();
const ctrl = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/public-stats', ctrl.getPublicStats);
router.get('/stats', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getStats);
router.get('/activity', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getRecentActivity);
router.get('/members-by-district', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getMembersByDistrict);
router.get('/members-by-type', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getMembersByType);

module.exports = router;
