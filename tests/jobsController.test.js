const request = require('supertest');
const bodyParser = require('body-parser');
const app = require('../src/app');

app.use(bodyParser.json());

describe('POST /jobs/:job_id/pay', () => {
    it('should successfully pay for a job', async () => {
        const response = await request(app)
            .post(`/jobs/1/pay`)
            .set('profile_id', 1)
            .send({});
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Payment successful' });
    });

    it('should return 404 if the job does not exist', async () => {
        const response = await request(app)
            .post('/jobs/999/pay')
            .set('profile_id', 1)
            .send({});
        expect(response.status).toBe(404);
    });

    it('should return 403 if the user does not have permission to pay for the job', async () => {
        const response = await request(app)
            .post('/jobs/1/pay')
            .set('profile_id', 3)
            .send({});
        expect(response.status).toBe(403);
    });

    it('should return 400 if the job has already been paid', async () => {
        const response = await request(app)
            .post('/jobs/10/pay')
            .set('profile_id', 3)
            .send({});
        expect(response.status).toBe(400);
    });

    it('should return 400 if the user has insufficient balance', async () => {
        const response = await request(app)
            .post('/jobs/5/pay')
            .set('profile_id', 4)
            .send({});
        expect(response.status).toBe(400);
    });
});

describe('GET /jobs/unpaid', () => {
    it('should return a list of unpaid jobs', async () => {
        const response = await request(app).get('/jobs/unpaid').set('profile_id', 1);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});