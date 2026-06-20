// Minimal valid env so config.ts loads without hitting production guards.
// Unit tests mock the repositories and provider, so no real DB/Paystack is touched.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET ||= 'test-jwt-secret-value-not-used-for-real';
process.env.FRONTEND_URL ||= 'http://localhost:5173';
process.env.PAYMENT_PROVIDER ||= 'paystack';
