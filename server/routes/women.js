const router = require('express').Router();
const ctrl = require('../controllers/womenController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getAll);
router.get('/stats', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getStats);
router.post('/', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.create);
router.put('/:id', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.update);
router.delete('/:id', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.remove);

module.exports = router;
