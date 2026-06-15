const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.post('/', auth, chat);

module.exports = router;
