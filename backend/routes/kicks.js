const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/kickController');

router.post('/',    auth, ctrl.addKickCount);
router.get('/',     auth, ctrl.getKickCounts);
router.get('/today', auth, ctrl.getTodayKicks);

module.exports = router;
