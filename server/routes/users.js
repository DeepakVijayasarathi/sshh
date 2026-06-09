const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../config/multer');

const upload = uploadImage('members');

router.get('/profile', authenticate, ctrl.getProfile);
router.put('/profile', authenticate, upload.single('photo'), ctrl.updateProfile);
router.get('/membership-card', authenticate, ctrl.getMemberCard);
router.get('/:memberId/membership-card', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getAdminMemberCard);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);
router.get('/list', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getUsersList);
router.put('/:id/toggle-active', authenticate, authorize('SuperAdmin'), ctrl.toggleUserActive);
router.post('/bulk-approve', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.bulkApproveMembers);

module.exports = router;
