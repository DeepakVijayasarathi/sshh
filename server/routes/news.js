const router = require('express').Router();
const ctrl = require('../controllers/newsController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../config/multer');

const upload = uploadImage('news');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authenticate, authorize('SuperAdmin', 'Admin'), upload.single('image'), ctrl.create);
router.put('/:id', authenticate, authorize('SuperAdmin', 'Admin'), upload.single('image'), ctrl.update);
router.delete('/:id', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.remove);

module.exports = router;
