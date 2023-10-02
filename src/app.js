const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model');
const {getProfile} = require('./middleware/getProfile');
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

const contractsController = require('./controllers/contractsController');
const jobsController = require('./controllers/jobsController');
const balancesController = require('./controllers/balancesController');
const adminController = require('./controllers/adminController');

app.get('/contracts/:id', getProfile, contractsController.getContractById);
app.get('/contracts', getProfile, contractsController.listContracts);

app.post('/jobs/:job_id/pay', getProfile, jobsController.payJobById);
app.get('/jobs/unpaid', getProfile, jobsController.listUnpaidJobs);

app.post('/balances/deposit/:userId', getProfile, balancesController.listDepositsByUser);

app.get('/admin/best-profession', adminController.getBestProfession);
app.get('/admin/best-clients', adminController.getBestClients);

module.exports = app;
