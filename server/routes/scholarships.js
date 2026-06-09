const router = require('express').Router();
const ctrl = require('../controllers/scholarshipController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadDocument } = require('../config/multer');

const upload = uploadDocument('scholarships');

router.get('/', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getAll);
router.get('/:id', authenticate, ctrl.getById);
router.post('/apply', upload.fields([
  { name: 'incomeCertificate', maxCount: 1 },
  { name: 'communityCertificate', maxCount: 1 },
  { name: 'marksheet', maxCount: 1 },
]), ctrl.apply);
router.put('/:id/status', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.updateStatus);

module.exports = router;
