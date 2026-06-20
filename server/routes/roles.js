const router = require('express').Router();
const ctrl   = require('../controllers/roleController');
const { authenticate, authorize } = require('../middleware/auth');

const SA    = authorize('SuperAdmin');
const Admin = authorize('SuperAdmin', 'Admin');

router.get('/',           authenticate, Admin, ctrl.getAll);
router.post('/',          authenticate, SA,    ctrl.create);
router.put('/:id',        authenticate, SA,    ctrl.update);
router.delete('/:id',     authenticate, SA,    ctrl.remove);
router.get('/:id/menus',  authenticate, SA,    ctrl.getMenus);
router.put('/:id/menus',  authenticate, SA,    ctrl.setMenus);

module.exports = router;
