const router = require('express').Router();
const ctrl = require('../controllers/jobController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadDocument } = require('../config/multer');

const upload = uploadDocument('resumes');

router.get('/', ctrl.getJobs);
router.get('/all', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.getAllJobs);
router.get('/:id', ctrl.getJobById);
router.get('/:id/applications', authenticate, authorize('SuperAdmin', 'Admin', 'Employer'), ctrl.getApplications);
router.post('/', authenticate, authorize('SuperAdmin', 'Admin', 'Employer'), ctrl.createJob);
router.put('/:id', authenticate, authorize('SuperAdmin', 'Admin', 'Employer'), ctrl.updateJob);
router.delete('/:id', authenticate, authorize('SuperAdmin', 'Admin'), ctrl.deleteJob);
router.post('/:id/apply', upload.single('resume'), ctrl.applyJob);
router.post('/employer/register', ctrl.registerEmployer);

module.exports = router;
