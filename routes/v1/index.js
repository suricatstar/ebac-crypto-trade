const express = require('express');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');

require('./auth/jwt');

const swaggerConfig = require('./docs');
const statusRouter = require('./status');
const usuarioRouter = require('./usuarios');
const authRouter = require('./auth');
const depositosRouter = require('./depositos');
const saquesRouter = require('./saques');
const cotacoesRouter = require('./cotacoes');
const trocasRouter = require('./trocas');
const topClientsRouter = require('./top-clients');
const relatoriosRouter = require('./relatorios');


const router = express.Router();

router.use('/status', statusRouter);
router.use('/usuario', usuarioRouter);
router.use('/cotacoes', cotacoesRouter);
router.use('/auth', authRouter);
router.use('/trocas', passport.authenticate('jwt', { session: false }), trocasRouter);
router.use('/depositos', passport.authenticate('jwt', { session: false }), depositosRouter);
router.use('/saques', passport.authenticate('jwt', { session: false }), saquesRouter);
router.use('/top-clients', topClientsRouter);
router.use('/docs', swaggerUi.serve);
router.use('/docs',swaggerUi.setup(swaggerConfig));
router.use('/relatorios', passport.authenticate('jwt', { session: false }), relatoriosRouter);


module.exports = router;
