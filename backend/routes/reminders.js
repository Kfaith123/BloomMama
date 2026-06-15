const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/reminderController');

router.post('/',           auth, ctrl.createReminder);
router.get('/',            auth, ctrl.getReminders);
router.patch('/:id/status', auth, ctrl.updateReminderStatus);
router.delete('/:id',      auth, ctrl.deleteReminder);

module.exports = router;
