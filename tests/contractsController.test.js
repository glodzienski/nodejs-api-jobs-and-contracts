const request = require('supertest');
const bodyParser = require('body-parser');
const app = require('../src/app');

app.use(bodyParser.json());

describe('GET /contracts/:id', () => {
    it('Should return an existing contract', async () => {
        const response = await request(app)
            .get('/contracts/1')
            .set('profile_id', 1);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
    });

    it('Should return 404 for non-existent contract', async () => {
        const response = await request(app)
            .get('/contracts/999')
            .set('profile_id', 1);
        expect(response.status).toBe(404);
    });

    it('Should return 403 for unauthorized contract', async () => {
        const response = await request(app)
            .get('/contracts/1')
            .set('profile_id', 2);

        expect(response.status).toBe(403);
    });
});

describe('GET /contracts', () => {
    it('Should return a list of valid contracts', async () => {
        const response = await request(app).get('/contracts').set('profile_id', 1);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
