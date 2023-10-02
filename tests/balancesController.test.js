const request = require('supertest');
const bodyParser = require('body-parser');
const app = require('../src/app');

app.use(bodyParser.json());

describe('POST /balances/deposit/:userId', () => {
    it('should allow a valid deposit', async () => {
        const response = await request(app)
            .post('/balances/deposit/1')
            .set('profile_id', 1)
            .send({ amount: 50 });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Deposit successful' });
    });

    it('should return 403 if the user does not have permission to deposit', async () => {
        const response = await request(app)
            .post('/balances/deposit/2')
            .set('profile_id', 1)
            .send({ amount: 500 });
        expect(response.status).toBe(403);
    });

    it('should return 400 for an invalid deposit amount', async () => {
        const response = await request(app)
            .post('/balances/deposit/1')
            .set('profile_id', 1)
            .send({ amount: 0 });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the user is not a client', async () => {
        const response = await request(app)
            .post('/balances/deposit/5')
            .set('profile_id', 5)
            .send({ amount: 500 });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the deposit amount exceeds the maximum allowed', async () => {
        const response = await request(app)
            .post('/balances/deposit/1')
            .set('profile_id', 1)
            .send({ amount: 5000 });
        expect(response.status).toBe(400);
    });
});