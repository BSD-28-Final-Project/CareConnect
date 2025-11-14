# 📝 Testing Guide - CareConnect Backend

## 🎯 Overview
Comprehensive test suite menggunakan **TDD (Test-Driven Development)** approach dengan target coverage **90-100%**.

## 📦 Dependencies
```json
{
  "jest": "^29.7.0",
  "@jest/globals": "^29.7.0",
  "supertest": "^6.3.3",
  "mongodb-memory-server": "^9.1.6"
}
```

## 🚀 Installation
```bash
cd server
npm install --save-dev jest @jest/globals supertest mongodb-memory-server
```

## 📋 Test Commands

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## 📊 Test Coverage Summary

### Controllers Coverage
| Controller | Tests | Coverage |
|-----------|-------|----------|
| **userController.js** | 20+ tests | ~95% |
| **activityController.js** | 25+ tests | ~90% |
| **donationController.js** | 15+ tests | ~95% |
| **expenseController.js** | 15+ tests | ~90% |
| **newsController.js** | 20+ tests | ~90% |

### Middlewares Coverage
| Middleware | Tests | Coverage |
|-----------|-------|----------|
| **authentication.js** | 10+ tests | ~95% |

### Total: **115+ test cases**

## 🧪 Test Structure

```
server/__tests__/
├── controllers/
│   ├── userController.test.js       # User registration, login, profile
│   ├── activityController.test.js   # Activity CRUD operations
│   ├── donationController.test.js   # Donation creation & retrieval
│   ├── expenseController.test.js    # Expense management
│   └── newsController.test.js       # News CRUD operations
├── middlewares/
│   └── authentication.test.js       # JWT auth & authorization
└── helpers/
    └── testHelper.js                # Test database setup utilities
```

## ✅ Test Coverage Areas

### 1. User Controller Tests
- ✅ User registration with validation
- ✅ Email format validation
- ✅ Password length validation
- ✅ Duplicate email prevention
- ✅ User login with credentials
- ✅ JWT token generation
- ✅ Profile retrieval with authentication
- ✅ Profile update operations

### 2. Activity Controller Tests
- ✅ Create activity (admin only)
- ✅ Get all activities with filters
- ✅ Search activities by title/description
- ✅ Filter by category and location
- ✅ Get activity by ID
- ✅ Update activity (admin only)
- ✅ Delete activity (admin only)
- ✅ Authentication & authorization checks

### 3. Donation Controller Tests
- ✅ Create donation with validation
- ✅ Update activity's collectedMoney
- ✅ Get donations with filters
- ✅ Filter by userId and activityId
- ✅ Get donation by ID
- ✅ Invalid ObjectId handling
- ✅ Amount validation (positive numbers)

### 4. Expense Controller Tests
- ✅ Create expense (admin only)
- ✅ Amount validation
- ✅ Activity existence check
- ✅ Get expenses with filters
- ✅ Get expenses by activity
- ✅ Update & delete expenses (admin only)

### 5. News Controller Tests
- ✅ Create news (admin only)
- ✅ Get all news with filters
- ✅ Get news by activity
- ✅ Get news by ID
- ✅ Update news (admin only)
- ✅ Delete news (admin only)
- ✅ Image array handling

### 6. Authentication Middleware Tests
- ✅ Valid JWT token verification
- ✅ Missing token handling
- ✅ Invalid token format
- ✅ Expired token handling
- ✅ Admin role verification
- ✅ User authorization checks

## 🛠️ Test Utilities

### Test Database
- Uses **MongoDB Memory Server** for isolated testing
- Automatic setup and teardown
- Database cleared between tests

### Test Helpers (`testHelper.js`)
```javascript
setupTestDB()      // Initialize in-memory MongoDB
teardownTestDB()   // Cleanup after tests
clearDatabase()    // Clear all collections
getTestDB()        // Get database instance
```

## 📈 Coverage Report Example

```
------------------------|---------|----------|---------|---------|
File                    | % Stmts | % Branch | % Funcs | % Lines |
------------------------|---------|----------|---------|---------|
All files               |   92.50 |    88.75 |   95.00 |   93.20 |
 controllers            |   91.20 |    87.50 |   94.00 |   92.10 |
 middlewares            |   96.00 |    93.00 |   98.00 |   96.50 |
 models                 |  100.00 |   100.00 |  100.00 |  100.00 |
 routes                 |  100.00 |   100.00 |  100.00 |  100.00 |
------------------------|---------|----------|---------|---------|
```

## 🎯 Best Practices

### 1. Test Isolation
- Each test runs in a clean database
- No test dependencies
- Predictable test results

### 2. Descriptive Test Names
```javascript
test('should fail when email already exists', async () => {
  // Test implementation
});
```

### 3. Comprehensive Assertions
```javascript
expect(response.body).toHaveProperty('message', 'Success');
expect(response.body).toHaveProperty('data');
expect(response.body.data).toHaveProperty('name', 'John Doe');
```

### 4. Test Both Success and Failure Cases
- ✅ Happy path (valid inputs)
- ✅ Error cases (invalid inputs)
- ✅ Edge cases (boundary conditions)
- ✅ Authentication/authorization

## 🐛 Debugging Tests

### Run Specific Test File
```bash
npm test __tests__/controllers/userController.test.js
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="User Controller"
```

### Enable Verbose Output
```bash
npm test -- --verbose
```

## 📝 Writing New Tests

### Template
```javascript
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../testApp.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../helpers/testHelper.js';

let db;

beforeAll(async () => {
  const testDb = await setupTestDB();
  db = testDb.db;
  global.testDb = db;
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearDatabase();
});

describe('Your Feature', () => {
  test('should do something', async () => {
    const response = await request(app)
      .get('/api/your-endpoint')
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```

## 🎓 TDD Workflow

1. **Write Test First** ❌
   - Write a failing test for new feature
   
2. **Implement Feature** ✅
   - Write minimum code to pass the test
   
3. **Refactor** ♻️
   - Improve code while keeping tests green
   
4. **Repeat** 🔄
   - Continue for next feature

## 🔍 Common Issues

### Issue: Tests timeout
**Solution**: Increase timeout in jest config
```javascript
"jest": {
  "testTimeout": 10000
}
```

### Issue: Database connection errors
**Solution**: Ensure MongoDB Memory Server is properly installed
```bash
npm install --save-dev mongodb-memory-server
```

### Issue: Port already in use
**Solution**: Tests use in-memory DB, no port conflicts

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [TDD Best Practices](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## ✨ Maintainers

Tested and maintained by the CareConnect development team.

---

**Target**: 90-100% Test Coverage ✅
**Status**: In Progress 🚀
**Last Updated**: November 2025
