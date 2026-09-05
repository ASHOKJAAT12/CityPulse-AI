// jest.setup.ts — Runs before all test modules are loaded
// This ensures env vars are set before env.ts is parsed

process.env['NODE_ENV'] = 'test';
process.env['MONGODB_URI'] = 'mongodb://localhost:27017';
process.env['MONGODB_DB_NAME'] = 'smartcity360_test';
process.env['JWT_ACCESS_SECRET'] = 'test_jwt_access_secret_at_least_32_chars_long__test_only';
process.env['JWT_REFRESH_SECRET'] = 'test_jwt_refresh_secret_at_least_32_chars_long__test_only';
process.env['FRONTEND_URL'] = 'http://localhost:3000';
process.env['PORT'] = '5001';
