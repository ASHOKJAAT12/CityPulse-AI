import request from 'supertest';
import { createApp } from '../src/app';

// Override DATABASE_URL for tests — use a test-isolated DB or mock
process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] = process.env['DATABASE_URL'] ?? 'postgresql://localhost:5432/smartcity360_test';
process.env['JWT_ACCESS_SECRET'] = 'test_jwt_access_secret_at_least_32_chars_long';
process.env['JWT_REFRESH_SECRET'] = 'test_jwt_refresh_secret_at_least_32_chars_long';
process.env['FRONTEND_URL'] = 'http://localhost:3000';

const app = createApp();

describe('Health Check', () => {
    it('GET /api/v1/health — should return 200 or 503 with standard shape', async () => {
        const response = await request(app).get('/api/v1/health');

        // Either healthy (200) or degraded (503) — both are valid responses
        expect([200, 503]).toContain(response.status);

        expect(response.body).toMatchObject({
            success: true,
            message: expect.stringContaining('SmartCity 360'),
            data: expect.objectContaining({
                status: expect.stringMatching(/^(ok|degraded)$/),
                version: expect.any(String),
                timestamp: expect.any(String),
            }),
        });
    });

    it('GET / — should return API info', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            name: 'SmartCity 360 API',
            version: '1.0.0',
        });
    });

    it('GET /api/v1/nonexistent — should return 404 with standard error shape', async () => {
        const response = await request(app).get('/api/v1/nonexistent');
        expect(response.status).toBe(404);
        expect(response.body).toMatchObject({
            success: false,
            error: expect.objectContaining({
                code: 'NOT_FOUND',
            }),
        });
    });

    it('Standard response shape — success', async () => {
        const response = await request(app).get('/api/v1/cities');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('data');
    });
});
