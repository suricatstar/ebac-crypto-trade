const express = require('express');

require('./auth/jwt');

const statusRouter = require('./status');
const usuarioRouter = require('./usuarios');
const authRouter = require('./auth');

const router = express.Router();

router.use('/status', statusRouter);
router.use('/usuario', usuarioRouter);
router.use('/auth', authRouter);

module.exports = router;
