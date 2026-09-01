const express = require('express');

const router = express.Router();

/**
 * @openapi
 * /v1//status:
 *  get:
 *    description: Verifica o status do sistema
 *    responses:
 *      200:
 *        description: Status do sistema está tudo ok!
 */

router.get('/', (_req, res) => {
  res.json({
    sucesso: true,
    status: 'ok',
  });
});

module.exports = router;
