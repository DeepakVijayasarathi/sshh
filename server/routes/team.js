const router = require('express').Router();
const ctrl = require('../controllers/teamController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../config/multer');

const upload = uploadImage('team');

router.get('/',        ctrl.getPublic);
router.get('/admin',   authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getAll);
router.post('/',       authenticate, authorize('SuperAdmin', 'Admin'), upload.single('photo'), ctrl.create);
router.put('/:id',     authenticate, authorize('SuperAdmin', 'Admin'), upload.single('photo'), ctrl.update);
router.delete('/:id',  authenticate, authorize('SuperAdmin', 'Admin'), ctrl.remove);

module.exports = router;
