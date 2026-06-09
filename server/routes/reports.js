const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

const admin = [authenticate, authorize('SuperAdmin', 'Admin')];

router.get('/members', ...admin, ctrl.memberReport);
router.get('/events', ...admin, ctrl.eventReport);
router.get('/donations', ...admin, ctrl.donationReport);
router.get('/district', ...admin, ctrl.districtReport);

module.exports = router;
