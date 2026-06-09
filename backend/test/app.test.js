import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';

describe('app health surfaces', () => {
  afterAll(async () => {
    if (app.closeInfrastructure) await app.closeInfrastructure();
  });

  it('serves liveness without database access', async () => {
    const response = await request(app).get('/health').expect(200);
    expect(response.body.status).toBe('ok');
  });

  it('allows loopback Vite dev origins for auth preflight requests', async () => {
    const response = await request(app)
      .options('/api/auth/register')
      .set('Origin', 'http://127.0.0.1:5175')
      .set('Access-Control-Request-Method', 'POST')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBe('http://127.0.0.1:5175');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('exposes prometheus metrics when enabled', async () => {
    const response = await request(app).get('/metrics').expect(200);
    expect(response.text).toContain('tehilla_');
  });
});
