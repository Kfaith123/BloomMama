const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/healthController');

router.post('/',        auth, ctrl.addLog);
router.get('/',         auth, ctrl.getLogs);
router.delete('/:id',   auth, ctrl.deleteLog);

module.exports = router;
