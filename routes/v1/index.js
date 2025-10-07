const express = require('express');
const passport = require('passport');

require('./auth/jwt');

const statusRouter = require('./status');
const usuarioRouter = require('./usuarios');
const authRouter = require('./auth');
const depositosRouter = require('./depositos');

const router = express.Router();

router.use('/status', statusRouter);
router.use('/usuario', usuarioRouter);
router.use('/auth', authRouter);
router.use('/depositos', passport.authenticate('jwt', { session: false }), depositosRouter);

module.exports = router;
