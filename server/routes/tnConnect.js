const router = require('express').Router();
const ctrl = require('../controllers/tnConnectController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', ctrl.create);
router.get('/', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getAll);
router.put('/:id/status', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.updateStatus);
router.delete('/:id', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.remove);

module.exports = router;
