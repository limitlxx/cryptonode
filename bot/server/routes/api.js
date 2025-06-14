const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/tradeController');

router.get('/trades', tradeController.getAll);

module.exports = router;