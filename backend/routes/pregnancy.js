const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/pregnancyController');

router.post('/',          auth, ctrl.createProfile);
router.get('/',           auth, ctrl.getProfile);
router.put('/',           auth, ctrl.updateProfile);
router.get('/week/:week', auth, ctrl.getWeeklyContent);

module.exports = router;
