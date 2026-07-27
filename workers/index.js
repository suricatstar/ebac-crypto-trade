const Queue = require('bull');

const { cotacoesWorker } = require('./cotacoes');
const { topMoversWorker } = require('./top-gainers-loosers');
const { saldoWorker } = require('./saldo');


const cotacoesQueue = new Queue('Busca-cotacoes', process.env.REDIS_URL);
const topMoversQueue = new Queue('Top-Movers', process.env.REDIS_URL);
const aumentaSaldoQueue = new Queue('Saldo', process.env.REDIS_URL);

cotacoesQueue.process(cotacoesWorker);
topMoversQueue.process(topMoversWorker);
aumentaSaldoQueue.process(saldoWorker);

const agendaTarefas = async () => {
    const cotacoesAgendadas = await cotacoesQueue.getRepeatableJobs();
    for (const jobDeBusca of cotacoesAgendadas) {
        await cotacoesQueue.removeRepeatableByKey(jobDeBusca.key);
    }

    cotacoesQueue.add({}, 
        {
            repeat: { cron: '0/1 * * * *' },
            attempts: 3,
            backoff: 5000
        }
    );

    const topMoversAgendadas = await topMoversQueue.getRepeatableJobs();
    for (const jobDeBusca of topMoversAgendadas) {
        await topMoversQueue.removeRepeatableByKey(jobDeBusca.key);
    }

    topMoversQueue.add({},{
        repeat: { cron: '59 23 * * *'},
        attempts: 3,
        backoff: 5000
    });

    aumentaSaldoQueue.add({},{
        repeat: { cron: '0 0 * * *' },
        attempts: 3,
        backoff: 5000
    });
};



module.exports = { agendaTarefas };