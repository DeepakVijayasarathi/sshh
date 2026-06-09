const router = require('express').Router();
const ctrl = require('../controllers/donationController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getAll);
router.get('/summary', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getSummary);
router.get('/:id/receipt', ctrl.getReceipt);
router.post('/', ctrl.create);

module.exports = router;
