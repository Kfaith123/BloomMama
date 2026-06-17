const router  = require('express').Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/authController');

router.post('/register',          ctrl.register);
router.post('/login',             ctrl.login);
router.get('/me',                 auth, ctrl.getMe);
router.put('/me',                 auth, ctrl.updateMe);
router.post('/me/change-password', auth, ctrl.changePassword);

module.exports = router;
