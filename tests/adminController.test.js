const request = require('supertest');
const bodyParser = require('body-parser');
const app = require('../src/app');

app.use(bodyParser.json());

describe('Admin Controller', () => {
    describe('GET /admin/best-profession', () => {
        it('Should return the best profession', async () => {
            const response = await request(app)
                .get('/admin/best-profession?start=2019-01-01&end=2023-12-31');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('profession');
            expect(response.body).toHaveProperty('totalEarnings');
        });

        it('Should return a 400 error if dates are missing', async () => {
            const response = await request(app)
                .get('/admin/best-profession');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Both start and end dates are required');
        });

        it('Should return a 400 error if dates are invalid', async () => {
            const response = await request(app)
                .get('/admin/best-profession?start=invalid&end=invalid');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid date format');
        });

        it('Should return a 404 error if there is no data in the specified date range', async () => {
            const response = await request(app)
                .get('/admin/best-profession?start=1014-01-01&end=1014-12-31');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'No data found for the specified date range');
        });
    });

    describe('GET /admin/best-clients', () => {
        it('Should return the best clients', async () => {
            const response = await request(app)
                .get('/admin/best-clients?start=2019-01-01&end=2023-12-31');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('Should return a 400 error if dates are missing', async () => {
            const response = await request(app)
                .get('/admin/best-clients');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Both start and end dates are required');
        });

        it('Should return a 400 error if dates are invalid', async () => {
            const response = await request(app)
                .get('/admin/best-clients?start=invalid&end=invalid');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid date format');
        });

        it('Should return a 404 error if there is no data in the specified date range', async () => {
            const response = await request(app)
                .get('/admin/best-clients?start=1014-01-01&end=1014-12-31');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'No data found for the specified date range');
        });
    });
});