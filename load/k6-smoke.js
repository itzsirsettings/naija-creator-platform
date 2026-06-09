import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export const options = {
  vus: 5,
  duration: '20s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

export default function () {
  const health = http.get(`${BASE_URL}/health`);
  check(health, { 'health 200': (res) => res.status === 200 });

  const ready = http.get(`${BASE_URL}/ready`);
  check(ready, { 'ready 200': (res) => res.status === 200 });

  const creators = http.get(`${BASE_URL}/api/creators?limit=10`);
  check(creators, {
    'creators 200': (res) => res.status === 200,
    'creators bounded': (res) => (res.json('creators') || []).length <= 10,
  });

  sleep(1);
}
