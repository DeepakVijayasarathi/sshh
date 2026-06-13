const router = require('express').Router();
const { register, login, getMe, changePassword, verifyEmail } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);
router.get('/verify-email', verifyEmail);

module.exports = router;
