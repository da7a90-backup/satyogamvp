/**
 * Test Data Fixtures for E2E Tests
 */

export const testUsers = {
  validUser: {
    email: 'testuser@example.com',
    password: 'testpass123',
    name: 'Test User',
  },
  newUser: {
    email: 'newuser@example.com',
    password: 'newpass123',
    name: 'New User',
  },
  invalidUser: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  },
};

export const routes = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  teachings: '/teachings',
  courses: '/courses',
};
