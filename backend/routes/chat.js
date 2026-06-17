const express = require('express');
const router = express.Router();
const { chat, getHistory, clearHistory, saveEmergency } = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.post('/',           auth, chat);
router.get('/history',     auth, getHistory);
router.delete('/history',  auth, clearHistory);
router.post('/emergency',  auth, saveEmergency);

module.exports = router;
