const router = require('express').Router();
const ctrl = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../config/multer');

const upload = uploadImage('settings');

router.get('/', ctrl.getAll);
router.put('/', authenticate, authorize('SuperAdmin'), ctrl.update);
router.post('/logo', authenticate, authorize('SuperAdmin'), upload.single('logo'), ctrl.uploadLogo);

module.exports = router;
