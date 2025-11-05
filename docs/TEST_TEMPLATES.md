# TEST CASE TEMPLATES & EXAMPLES

## 1. UNIT TEST TEMPLATE

### Template Structure
```typescript
// [module-name]/services/[service-name].service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ServiceUnderTest } from './service-under-test.service';
import { Entity } from '../entities/entity.entity';
import { DependencyService } from '../dependencies/dependency.service';

describe('ServiceUnderTest', () => {
  let service: ServiceUnderTest;
  let mockRepository: any;
  let mockDependency: any;

  // Mock setup
  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockDependency = {
      method: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceUnderTest,
        { provide: getRepositoryToken(Entity), useValue: mockRepository },
        { provide: DependencyService, useValue: mockDependency },
      ],
    }).compile();

    service = module.get<ServiceUnderTest>(ServiceUnderTest);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('[methodName]', () => {
    // Happy path test
    it('should [expected behavior] when [condition]', async () => {
      // ARRANGE: Setup test data
      const input = { /* test data */ };
      const expectedOutput = { /* expected result */ };
      mockRepository.findOne.mockResolvedValue(expectedOutput);

      // ACT: Execute method
      const result = await service.methodName(input);

      // ASSERT: Verify expectations
      expect(result).toEqual(expectedOutput);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: input.id }
      });
    });

    // Error path test
    it('should throw [ExceptionType] when [error condition]', async () => {
      // ARRANGE
      const invalidInput = { /* invalid data */ };
      mockRepository.findOne.mockResolvedValue(null);

      // ACT & ASSERT
      await expect(service.methodName(invalidInput))
        .rejects.toThrow(ExceptionType);
      await expect(service.methodName(invalidInput))
        .rejects.toThrow('Expected error message');
    });

    // Edge case test
    it('should handle [edge case] correctly', async () => {
      // Test boundary values, null, undefined, empty arrays, etc.
    });
  });
});
```

---

## 2. INTEGRATION TEST TEMPLATE

### Template Structure
```typescript
// test/integration/[feature-name].integration.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleA } from '@/modules/module-a/module-a.module';
import { ModuleB } from '@/modules/module-b/module-b.module';
import { testDatabaseConfig } from '../database-test.config';

describe('ModuleA <-> ModuleB Integration', () => {
  let app: INestApplication;
  let serviceA: ServiceA;
  let serviceB: ServiceB;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        ModuleA,
        ModuleB,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    serviceA = moduleFixture.get<ServiceA>(ServiceA);
    serviceB = moduleFixture.get<ServiceB>(ServiceB);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await cleanDatabase();
  });

  describe('Integration Flow: [Flow Name]', () => {
    it('should complete [integration scenario] successfully', async () => {
      // ARRANGE: Setup initial state
      const dataA = await serviceA.create({ /* data */ });

      // ACT: Trigger integration flow
      const result = await serviceB.processWithA(dataA.id);

      // ASSERT: Verify integration result
      expect(result).toHaveProperty('integrationField');
      
      // Verify side effects in both modules
      const updatedA = await serviceA.findById(dataA.id);
      expect(updatedA.status).toBe('PROCESSED');
    });
  });
});
```

---

## 3. E2E TEST TEMPLATE

### Template Structure
```typescript
// test/e2e/[user-journey].e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';

describe('[User Journey Name] (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete User Journey', () => {
    it('Step 1: User registers', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'testuser@example.com',
          password: 'Test123456',
          full_name: 'Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      authToken = response.body.access_token;
      userId = response.body.user.user_id;
    });

    it('Step 2: User logs in', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'Test123456',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      authToken = response.body.access_token;
    });

    it('Step 3: User performs action with auth', async () => {
      const response = await request(app.getHttpServer())
        .post('/some-protected-endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ /* data */ })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    // Continue with remaining steps...
  });
});
```

---

## 4. PERFORMANCE TEST TEMPLATE (k6)

### Template Structure
```javascript
// test/performance/load-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp-up to 20 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 100 }, // Spike to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp-down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests < 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
    errors: ['rate<0.05'],            // Custom error rate < 5%
  },
};

// Test data
const BASE_URL = 'http://localhost:3000';

export function setup() {
  // Setup: Create test user and get auth token
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'loadtest@example.com',
    password: 'LoadTest123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  return { token: loginRes.json('access_token') };
}

export default function (data) {
  // Scenario 1: Browse books
  const booksRes = http.get(`${BASE_URL}/books`, {
    headers: { 'Authorization': `Bearer ${data.token}` },
  });

  check(booksRes, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Scenario 2: Generate suggestions (expensive operation)
  const suggestionsRes = http.post(
    `${BASE_URL}/exchanges/generate-suggestions`,
    null,
    {
      headers: { 'Authorization': `Bearer ${data.token}` },
    }
  );

  check(suggestionsRes, {
    'suggestions status is 200': (r) => r.status === 200,
    'suggestions response time < 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(2);
}

export function teardown(data) {
  // Cleanup: Optional cleanup tasks
}
```

---

## 5. SECURITY TEST TEMPLATE

### Template Structure
```typescript
// test/security/security.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';

describe('Security Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('SQL Injection Prevention', () => {
    it('should prevent SQL injection in login', async () => {
      const sqlInjectionPayloads = [
        "' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM users--",
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: payload,
            password: 'anything',
          });

        // Should reject, not expose SQL errors
        expect(response.status).not.toBe(500);
        expect(response.body).not.toHaveProperty('sqlMessage');
      }
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize user input to prevent XSS', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
      ];

      for (const payload of xssPayloads) {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            password: 'Test123',
            full_name: payload,
          });

        // Input should be sanitized or rejected
        if (response.status === 201) {
          expect(response.body.user.full_name).not.toContain('<script>');
          expect(response.body.user.full_name).not.toContain('onerror=');
        }
      }
    });
  });

  describe('Authentication Bypass Prevention', () => {
    it('should require valid JWT token for protected routes', async () => {
      const protectedEndpoints = [
        '/books',
        '/exchanges/suggestions',
        '/messages',
      ];

      for (const endpoint of protectedEndpoints) {
        // No token
        await request(app.getHttpServer())
          .get(endpoint)
          .expect(401);

        // Invalid token
        await request(app.getHttpServer())
          .get(endpoint)
          .set('Authorization', 'Bearer invalid_token')
          .expect(401);
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit login attempts', async () => {
      const attempts = [];
      
      // Try 20 rapid login attempts
      for (let i = 0; i < 20; i++) {
        attempts.push(
          request(app.getHttpServer())
            .post('/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrong',
            })
        );
      }

      const responses = await Promise.all(attempts);
      const tooManyRequests = responses.filter(r => r.status === 429);

      // Should block after threshold
      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });

  describe('Authorization Tests', () => {
    it('should prevent non-admin from accessing admin endpoints', async () => {
      // Login as regular user
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'regular@example.com',
          password: 'Regular123',
        });

      const token = loginRes.body.access_token;

      // Try to access admin endpoint
      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403); // Forbidden
    });
  });
});
```

---

## 6. WEBSOCKET TEST TEMPLATE

### Template Structure
```typescript
// test/websocket/messages.gateway.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '@/app.module';

describe('MessagesGateway (WebSocket)', () => {
  let app: INestApplication;
  let clientSocket: Socket;
  let serverUrl: string;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(3001);
    serverUrl = 'http://localhost:3001';

    // Get auth token
    const loginRes = await fetch(`${serverUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test123',
      }),
    });
    const loginData = await loginRes.json();
    authToken = loginData.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    if (clientSocket?.connected) {
      clientSocket.disconnect();
    }
  });

  it('should connect successfully with valid token', (done) => {
    clientSocket = io(serverUrl, {
      auth: { token: authToken },
    });

    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);
      done();
    });

    clientSocket.on('connect_error', (error) => {
      done(error);
    });
  });

  it('should reject connection with invalid token', (done) => {
    clientSocket = io(serverUrl, {
      auth: { token: 'invalid_token' },
    });

    clientSocket.on('connect_error', (error) => {
      expect(error.message).toContain('Unauthorized');
      done();
    });

    // Should not connect
    clientSocket.on('connect', () => {
      done(new Error('Should not connect with invalid token'));
    });
  });

  it('should send and receive message', (done) => {
    clientSocket = io(serverUrl, {
      auth: { token: authToken },
    });

    clientSocket.on('connect', () => {
      // Listen for message
      clientSocket.on('message', (data) => {
        expect(data).toHaveProperty('message_id');
        expect(data.content).toBe('Test message');
        done();
      });

      // Send message
      clientSocket.emit('sendMessage', {
        conversation_id: 'conv-123',
        content: 'Test message',
      });
    });
  });

  it('should broadcast message to other users', (done) => {
    const client1 = io(serverUrl, { auth: { token: authToken } });
    const client2 = io(serverUrl, { auth: { token: authToken } });

    let received = false;

    client2.on('connect', () => {
      // Client 2 listens for messages
      client2.on('message', (data) => {
        if (!received) {
          received = true;
          expect(data.content).toBe('Broadcast test');
          client1.disconnect();
          client2.disconnect();
          done();
        }
      });

      // Client 1 sends message
      client1.emit('sendMessage', {
        conversation_id: 'conv-123',
        content: 'Broadcast test',
      });
    });
  });
});
```

---

## 7. TEST DATA FACTORY PATTERN

### Template Structure
```typescript
// test/factories/user.factory.ts

import { faker } from '@faker-js/faker';
import { User, UserRole, AccountStatus } from '@/entities/user.entity';

export class UserFactory {
  static create(overrides?: Partial<User>): User {
    return {
      user_id: faker.string.uuid(),
      email: faker.internet.email(),
      password_hash: faker.internet.password(),
      full_name: faker.person.fullName(),
      phone: faker.phone.number(),
      region: faker.location.city(),
      auth_provider: 'LOCAL',
      role: UserRole.MEMBER,
      is_email_verified: false,
      account_status: AccountStatus.ACTIVE,
      last_login_at: faker.date.recent(),
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
      ...overrides,
    } as User;
  }

  static createMany(count: number, overrides?: Partial<User>): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createAdmin(overrides?: Partial<User>): User {
    return this.create({
      role: UserRole.ADMIN,
      email: 'admin@bookswap.com',
      ...overrides,
    });
  }

  static createVerified(overrides?: Partial<User>): User {
    return this.create({
      is_email_verified: true,
      ...overrides,
    });
  }
}

// Usage in tests:
// const user = UserFactory.create();
// const admin = UserFactory.createAdmin({ full_name: 'Custom Admin' });
// const users = UserFactory.createMany(10);
```

---

## 8. ASSERTION HELPER FUNCTIONS

### Template Structure
```typescript
// test/helpers/assertions.helper.ts

export class TestAssertions {
  static expectValidUUID(value: string) {
    expect(value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  }

  static expectValidEmail(email: string) {
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  }

  static expectValidJWT(token: string) {
    expect(token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    const parts = token.split('.');
    expect(parts).toHaveLength(3);
  }

  static expectValidTimestamp(timestamp: Date | string) {
    const date = new Date(timestamp);
    expect(date.toString()).not.toBe('Invalid Date');
    expect(date.getTime()).toBeGreaterThan(0);
  }

  static expectResponseShape(response: any, shape: object) {
    for (const key in shape) {
      expect(response).toHaveProperty(key);
      const expectedType = typeof shape[key];
      expect(typeof response[key]).toBe(expectedType);
    }
  }

  static expectPaginatedResponse(response: any) {
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('page');
    expect(response).toHaveProperty('limit');
    expect(Array.isArray(response.data)).toBe(true);
  }

  static expectErrorResponse(response: any, statusCode: number) {
    expect(response.status).toBe(statusCode);
    expect(response.body).toHaveProperty('statusCode');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
  }
}

// Usage:
// TestAssertions.expectValidUUID(user.user_id);
// TestAssertions.expectPaginatedResponse(result);
```

---

**Document Version:** 1.0  
**Last Updated:** 05/11/2025  
**Purpose:** Cung cấp templates chuẩn cho tất cả loại tests trong dự án
