const router  = require('express').Router();
const ctrl    = require('../controllers/culturalController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../config/multer');
const upload  = uploadImage('cultural');

/* Public */
router.get('/categories', ctrl.getCategories);
router.get('/', ctrl.getAll);

/* Admin list (all statuses) — must be before /:id */
router.get('/admin/all', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getAdminAll);

router.get('/:id', ctrl.getById);

/* Members can submit posts */
router.post('/', authenticate, upload.single('image'), ctrl.create);

/* Admin-only write */
router.put('/:id/approve', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.approve);
router.put('/:id',         authenticate, authorize('SuperAdmin', 'Admin'), upload.single('image'), ctrl.update);
router.delete('/:id',      authenticate, authorize('SuperAdmin', 'Admin'), ctrl.remove);

module.exports = router;
