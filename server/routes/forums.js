const router = require('express').Router();
const ctrl = require('../controllers/forumController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../config/multer');

const upload = uploadImage('issues');

router.get('/issues', ctrl.getIssues);
router.get('/issues/:id', ctrl.getIssueById);
router.post('/issues', upload.single('picture'), ctrl.createIssue);
router.put('/issues/:id/status', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.updateIssueStatus);
router.post('/issues/:id/comments', ctrl.addComment);
router.delete('/issues/:id', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.deleteIssue);

module.exports = router;
