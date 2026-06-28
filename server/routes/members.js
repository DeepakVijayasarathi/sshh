const router = require('express').Router();
const ctrl = require('../controllers/memberController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../config/multer');

const upload = uploadImage('members');

router.get('/types',        ctrl.getMembershipTypes);
router.get('/types/all',   authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getAllMembershipTypes);
router.post('/types',      authenticate, authorize('SuperAdmin', 'Admin'), ctrl.createMembershipType);
router.put('/types/:id',   authenticate, authorize('SuperAdmin', 'Admin'), ctrl.updateMembershipType);
router.delete('/types/:id',authenticate, authorize('SuperAdmin', 'Admin'), ctrl.deleteMembershipType);
router.get('/lookup', ctrl.publicLookup);
router.get('/', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getAll);
router.get('/:id', authenticate, ctrl.getById);
router.post('/', upload.single('photo'), ctrl.create);
router.put('/:id', authenticate, upload.single('photo'), ctrl.update);
router.post('/:id/approve', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.approve);
router.post('/:id/reject', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.reject);
router.delete('/:id', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.remove);

module.exports = router;
