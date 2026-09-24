require('dotenv').config();

const app = require('./app');

const { agendaTarefas } = require('./workers');

const { logger } = require('./utils');
const { connect } = require('./models');

// inicializa tarefas
agendaTarefas();


const porta = 3000;
app.listen(porta, () => {
  connect();

  logger.info(`Servidor ouvindo na porta ${porta}`);
});