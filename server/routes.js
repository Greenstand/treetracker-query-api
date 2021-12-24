const express = require('express');
const router = express.Router();
const { rawCapturePost, rawCaptureGet } = require('./handlers/rawCaptureHandler.js');
const replayEventPost = require('./handlers/replayEventHandler');
const { handlerWrapper } = require('./handlers/utils');

router.post('/raw-captures', handlerWrapper(rawCapturePost));
router.get('/raw-captures', handlerWrapper(rawCaptureGet));
router.post('/replay-events', handlerWrapper(replayEventPost));

module.exports = router;
