const router = require('express').Router();
const ctrl   = require('../controllers/menuController');
const { authenticate, authorize } = require('../middleware/auth');

const SA = authorize('SuperAdmin');

router.get('/public',    ctrl.getPublic);
router.get('/by-role',   authenticate, ctrl.getByRole);
router.get('/',          authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getAll);
router.post('/reseed',   authenticate, SA, ctrl.reseed);
router.post('/',         authenticate, SA, ctrl.create);
router.put('/:id',       authenticate, SA, ctrl.update);
router.delete('/:id',    authenticate, SA, ctrl.remove);

module.exports = router;
