const router = require('express').Router();
const ctrl = require('../controllers/businessController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../config/multer');

const upload = uploadImage('businesses');

router.get('/categories', ctrl.getCategories);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authenticate, upload.single('logo'), ctrl.create);
router.put('/:id', authenticate, upload.single('logo'), ctrl.update);
router.post('/:id/approve', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.approve);
router.delete('/:id', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.remove);

module.exports = router;
