const router = require('express').Router();
const ctrl = require('../controllers/womenController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', ctrl.getAll);
router.get('/stats', ctrl.getStats);
router.post('/', ctrl.create);
router.put('/:id', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.update);
router.delete('/:id', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.remove);

module.exports = router;
