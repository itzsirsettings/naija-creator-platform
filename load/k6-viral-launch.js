import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export const options = {
  scenarios: {
    public_read_spike: {
      executor: 'ramping-arrival-rate',
      startRate: 20,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 1000,
      stages: [
        { target: 100, duration: '1m' },
        { target: 500, duration: '2m' },
        { target: 1000, duration: '2m' },
        { target: 100, duration: '1m' },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{kind:cached_read}': ['p(95)<300'],
    'http_req_duration{kind:write}': ['p(95)<800'],
    http_req_duration: ['p(99)<2000'],
  },
};

export default function () {
  const health = http.get(`${BASE_URL}/health`, { tags: { kind: 'cached_read' } });
  check(health, { 'health 200': (res) => res.status === 200 });

  const creators = http.get(`${BASE_URL}/api/creators?limit=20`, { tags: { kind: 'cached_read' } });
  check(creators, {
    'creators list ok': (res) => res.status === 200,
    'creators bounded': (res) => (res.json('creators') || []).length <= 20,
  });

  sleep(1);
}
