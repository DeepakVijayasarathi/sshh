const router = require('express').Router();
const ctrl = require('../controllers/auditController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getLogs);
router.get('/entities', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getEntities);

module.exports = router;
