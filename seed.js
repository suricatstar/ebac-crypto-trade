require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const { Corretora, connect, Usuario, TopClients } = require('./models');
const { CNPJ, RESERVA_MINIMA } = require('./constants');

// popula base de dados
(async () => {
  await connect();

  // insere / atualiza corretora
  await Corretora.findOneAndUpdate({
    cnpj: CNPJ,
  }, {
    caixa: RESERVA_MINIMA,
  }, {
    upsert: true,
  });

  // insere usuários
  const usuarioUm = await Usuario.findOneAndUpdate({
    cpf: '90925683094',
    email: 'juninho@ebac.com.br',
  }, {
    nome: 'Juninho da Silva Santos',
    senha: await bcrypt.hash('ebac1234', 10),
  }, {
    upsert: true,
    new: true,
  });

  const usuarioDois = await Usuario.findOneAndUpdate({
    cpf: '70200659022',
    email: 'mariazinha@ebac.com.br',
  }, {
    nome: 'Mariazinha da silva',
    senha: await bcrypt.hash('ebac1234', 10),
  }, {
    upsert: true,
    new: true,
  });

  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);

  const anteOntem = new Date();
  anteOntem.setDate(anteOntem.getDate() - 2);

  const tresDiasAtras = new Date();
  tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);

  // insere ranking
  await TopClients.insertMany([
    {
      dia: ontem,
      gainers: [{ usuario: usuarioUm, variacao: 200 }],
      loosers: [{ usuario: usuarioDois, variacao: -1300 }]
    },
    {
      dia: anteOntem,
      gainers: [{ usuario: usuarioDois, variacao: 2000 }],
      loosers: [{ usuario: usuarioUm, variacao: -100 }]
    },
    {
      dia: tresDiasAtras,
      gainers: [{ usuario: usuarioDois, variacao: 100 }],
      loosers: [{ usuario: usuarioUm, variacao: -2000 }]
    },
  ]);

  console.log('Seed de top clients executado com sucesso!');

  await mongoose.disconnect();
})();
