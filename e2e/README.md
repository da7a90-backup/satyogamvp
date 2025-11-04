# E2E Tests - Sat Yoga Platform

This directory contains end-to-end tests for the Sat Yoga platform using Playwright.

## Test Structure

```
e2e/
├── README.md                  # This file
├── auth.spec.ts              # Authentication flow tests
├── teachings.spec.ts         # Teachings dashboard tests
└── fixtures/
    └── test-data.ts          # Test data and fixtures
```

## Running Tests

### Prerequisites

1. Start the development server:
```bash
npm run dev
```

2. Start the backend API server (in a separate terminal):
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Test Commands

Run all E2E tests:
```bash
npm run test:e2e
```

Run tests with UI mode (interactive):
```bash
npm run test:e2e:ui
```

Run tests in headed mode (see browser):
```bash
npm run test:e2e:headed
```

View test report:
```bash
npm run test:e2e:report
```

Run specific test file:
```bash
npx playwright test e2e/auth.spec.ts
```

Run specific test by name:
```bash
npx playwright test -g "should successfully login"
```

## Test Coverage

### Authentication Tests (`auth.spec.ts`)

- **Login Page**
  - Display login form
  - Show error for invalid credentials
  - Successfully login with valid credentials
  - Redirect authenticated users to dashboard

- **Signup Page**
  - Display signup form
  - Show error for duplicate email

- **Logout**
  - Successfully logout and redirect

### Teachings Dashboard Tests (`teachings.spec.ts`)

- **Public Access**
  - Display teachings library for unauthenticated users
  - Display free teachings
  - Show locked/premium content indicators

- **Authenticated User Access**
  - Display teachings library for authenticated users
  - Allow access to user-tier appropriate teachings
  - Display correct access level indicators based on membership tier

- **Search and Filtering**
  - Search for teachings
  - Filter teachings by category/type

- **Teaching Playback**
  - Play video teaching when clicked

- **Preview Access**
  - Allow preview access (5-10min) for PREVIEW level teachings

- **Responsive Design**
  - Display correctly on mobile devices
  - Display correctly on tablet devices

## Test Data

Test users are defined in `fixtures/test-data.ts`:

- **validUser**: Existing user for login tests
  - Email: `testuser@example.com`
  - Password: `testpass123`

- **newUser**: New user for signup tests
  - Email: `newuser@example.com`
  - Password: `newpass123`

- **invalidUser**: Invalid credentials for error testing
  - Email: `invalid@example.com`
  - Password: `wrongpassword`

## Debugging Tests

### Debug a specific test:
```bash
npx playwright test --debug -g "test name"
```

### Take screenshots on failure:
Screenshots are automatically taken on test failure and saved to `test-results/`

### View trace:
Traces are automatically collected on first retry and can be viewed with:
```bash
npx playwright show-trace trace.zip
```

## Configuration

Test configuration is in `playwright.config.ts` at the project root.

Key settings:
- **baseURL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: Only on failure
- **Trace**: On first retry

## CI/CD Integration

Tests are configured to run in CI environments with:
- `fullyParallel: true` - Run tests in parallel
- `forbidOnly: true` - Fail if `test.only` is found
- `workers: 1` on CI - Sequential execution on CI

## Best Practices

1. **Use semantic locators**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Wait for stability**: Use `waitForLoadState('networkidle')` when needed
3. **Isolation**: Each test should be independent and not rely on other tests
4. **Cleanup**: Use `beforeEach` and `afterEach` for setup and teardown
5. **Test data**: Use fixtures for consistent test data

## Troubleshooting

**Tests failing locally?**
- Make sure dev server is running on port 3000
- Make sure backend API is running on port 8000
- Clear browser cache: `npx playwright test --headed`

**Authentication tests failing?**
- Verify test users exist in the database
- Check backend API is responding
- Review authentication configuration

**Flaky tests?**
- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Increase timeout: `test.setTimeout(60000)`
- Use `test.retry()` for known flaky tests

## Next Steps

Additional tests to add:
- Payment flow E2E tests
- Course enrollment E2E tests
- Retreat registration E2E tests
- Admin dashboard E2E tests
- Profile management E2E tests
