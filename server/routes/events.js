const router = require('express').Router();
const ctrl = require('../controllers/eventController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../config/multer');

const upload = uploadImage('events');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/participants', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getParticipants);
router.post('/', authenticate, authorize('SuperAdmin', 'Admin'), upload.single('banner'), ctrl.create);
router.put('/:id', authenticate, authorize('SuperAdmin', 'Admin'), upload.single('banner'), ctrl.update);
router.delete('/:id', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.remove);
router.post('/:id/register', ctrl.register);

module.exports = router;
