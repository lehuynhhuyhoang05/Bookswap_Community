# 📊 PHASE 9: TESTING & OPTIMIZATION - OVERVIEW

**Date:** November 5, 2025  
**Status:** 🚀 **READY TO START**  
**Prerequisites:** ✅ Phase 8 (Admin Module) Complete

---

## 🎯 MỤC TIÊU TỔNG QUAN

Phase 9 tập trung vào **3 trụ cột chính**:

### 1. 🧪 **TESTING** - Đảm bảo chất lượng
- Unit Tests cho services/controllers
- Integration Tests cho modules
- E2E Tests cho các user flows
- Load Testing để đánh giá performance

### 2. ⚡ **OPTIMIZATION** - Tối ưu hiệu suất
- Database query optimization
- Caching strategies (Redis)
- API response time improvement
- Memory & CPU usage optimization

### 3. 🔍 **MONITORING** - Giám sát hệ thống
- Logging system upgrade
- Performance metrics collection
- Error tracking & alerting
- Health checks & status endpoints

---

## 📋 I. CURRENT STATE ANALYSIS

### ✅ What We Have
```
Project Structure:
├── src/
│   ├── modules/ (7 modules)
│   │   ├── auth/ ✅ Auth, Login, Register, JWT
│   │   ├── books/ ✅ Book CRUD, Google Books API
│   │   ├── library/ ✅ Personal Library, Wanted Books
│   │   ├── exchanges/ ✅ Exchange Requests, Matching Algorithm
│   │   ├── messages/ ✅ WebSocket Chat, Conversations
│   │   ├── reviews/ ✅ Reviews, Trust Score
│   │   ├── admin/ ✅ 24 Admin Endpoints (PHASE 8)
│   │   └── reports/ ✅ Violation Reports
│   ├── common/ ✅ Guards, Filters, Interceptors
│   └── infrastructure/ ✅ Database, Email, Google Books
└── test/
    ├── app.e2e-spec.ts ⚠️ Basic test only
    └── jest-e2e.json ✅ Config ready
```

### ⚠️ What's Missing
```
Testing:
❌ Unit tests: 0/7 modules (0% coverage)
❌ E2E tests: 1 basic test (minimal coverage)
❌ Integration tests: None
❌ Load tests: None

Optimization:
❌ No caching (Redis)
❌ No query optimization analysis
❌ No rate limiting
❌ No response compression

Monitoring:
⚠️ Basic logging only (console.log)
❌ No performance metrics
❌ No health check endpoints
❌ No error tracking service
```

---

## 📊 II. TESTING STRATEGY

### Phase 9A: Unit Testing (3-4 days)

#### 🎯 Target Coverage: 70%+

**Priority Modules to Test:**

1. **AuthService** (Highest Priority)
   ```typescript
   // Tests needed:
   ✓ register() - Email validation, password hash, member creation
   ✓ login() - Credentials check, JWT generation, refresh token
   ✓ validateUser() - JWT strategy validation
   ✓ refreshToken() - Token rotation, blacklist check
   ✓ forgotPassword() - Email token generation
   ✓ resetPassword() - Token validation, password update
   ```

2. **ExchangesService** (Complex Logic)
   ```typescript
   // Tests needed:
   ✓ createExchangeRequest() - Validation, duplicate check
   ✓ acceptExchange() - Status transitions, member validation
   ✓ rejectExchange() - Rejection logic
   ✓ cancelExchange() - Cancellation rules
   ✓ confirmExchange() - Completion logic, stats update
   ```

3. **MatchingService** (Algorithm Heavy)
   ```typescript
   // Tests needed:
   ✓ findMatchingSuggestions() - Matching algorithm
   ✓ calculateComprehensiveScore() - Scoring logic
   ✓ getBlockedMembers() - Block list filtering
   ✓ getMembersWithPendingRequests() - Pending filter
   ```

4. **AdminService** (Just Completed - Phase 8)
   ```typescript
   // Tests needed:
   ✓ lockUser() - Lock logic, audit logging
   ✓ unlockUser() - Unlock logic
   ✓ deleteUser() - Soft delete, cascade checks
   ✓ getDashboardStats() - Statistics accuracy
   ✓ getExchangeStats() - Calculation correctness
   ```

5. **ReviewsService** (Trust Score Logic)
   ```typescript
   // Tests needed:
   ✓ createReview() - Validation, duplicate check
   ✓ updateTrustScore() - Trust calculation
   ✓ trustDeltaFromRating() - Delta logic (5★=+0.1, 1★=-0.1)
   ✓ clampTrust() - 0-5 range enforcement
   ```

**Testing Framework Setup:**
```bash
npm install --save-dev @nestjs/testing jest ts-jest @types/jest
```

**Test File Structure:**
```
src/
└── modules/
    ├── auth/
    │   ├── services/
    │   │   ├── auth.service.ts
    │   │   └── auth.service.spec.ts ← CREATE
    ├── exchanges/
    │   ├── services/
    │   │   ├── exchanges.service.spec.ts ← CREATE
    │   │   └── matching.service.spec.ts ← CREATE
    └── admin/
        └── services/
            └── admin.service.spec.ts ← CREATE
```

---

### Phase 9B: Integration Testing (2-3 days)

#### 🎯 Test Module Interactions

**Key Integration Flows:**

1. **Auth → Member Creation**
   ```typescript
   describe('Auth Integration', () => {
     it('should register user and create member profile', async () => {
       // Test full registration flow
       const result = await authService.register({
         email: 'test@example.com',
         password: 'Password123',
         full_name: 'Test User',
         region: 'Ho Chi Minh City',
       });
       
       expect(result.user).toBeDefined();
       expect(result.member).toBeDefined();
       expect(result.access_token).toBeDefined();
     });
   });
   ```

2. **Books → Library → Matching**
   ```typescript
   describe('Exchange Flow Integration', () => {
     it('should create book → add to library → find matches', async () => {
       // Test book-to-matching pipeline
     });
   });
   ```

3. **Exchange → Message → Notification**
   ```typescript
   describe('Exchange Communication', () => {
     it('should create exchange → open conversation → send notification', async () => {
       // Test exchange communication flow
     });
   });
   ```

---

### Phase 9C: E2E Testing (2-3 days)

#### 🎯 Test Complete User Journeys

**Critical User Flows:**

1. **New User Registration → Book Add → Find Match → Exchange**
   ```typescript
   describe('Complete Exchange Flow (e2e)', () => {
     it('should complete full exchange journey', async () => {
       // 1. Register 2 users
       const userA = await request(app.getHttpServer())
         .post('/auth/register')
         .send({ ... });
       
       // 2. Add books to library
       // 3. Mark wanted books
       // 4. Generate suggestions
       // 5. Create exchange request
       // 6. Accept exchange
       // 7. Confirm completion
       // 8. Leave review
     });
   });
   ```

2. **Admin Moderation Flow**
   ```typescript
   describe('Admin Moderation (e2e)', () => {
     it('should handle user report → admin review → action', async () => {
       // 1. User creates report
       // 2. Admin views report
       // 3. Admin resolves (locks user or deletes content)
       // 4. Audit log created
       // 5. User receives notification
     });
   });
   ```

3. **Messaging System**
   ```typescript
   describe('Real-time Messaging (e2e)', () => {
     it('should handle WebSocket message exchange', async () => {
       // 1. User A connects WebSocket
       // 2. User B connects WebSocket
       // 3. User A sends message
       // 4. User B receives real-time
       // 5. Message saved to database
     });
   });
   ```

---

### Phase 9D: Load Testing (1-2 days)

#### 🎯 Performance Under Load

**Tools:**
- **Artillery**: HTTP load testing
- **k6**: Modern load testing (recommended)
- **Apache JMeter**: Enterprise-grade testing

**Test Scenarios:**

1. **Concurrent Users Test**
   ```yaml
   # artillery-load-test.yml
   config:
     target: 'http://localhost:3000'
     phases:
       - duration: 60
         arrivalRate: 10  # 10 users/sec
       - duration: 120
         arrivalRate: 50  # 50 users/sec
       - duration: 60
         arrivalRate: 100 # 100 users/sec
   
   scenarios:
     - name: "Browse & Search"
       flow:
         - get:
             url: "/books"
         - get:
             url: "/exchanges/suggestions"
   ```

2. **Stress Testing**
   ```javascript
   // k6-stress-test.js
   import http from 'k6/http';
   import { check, sleep } from 'k6';
   
   export let options = {
     stages: [
       { duration: '2m', target: 100 },  // Ramp-up
       { duration: '5m', target: 100 },  // Stay at 100 users
       { duration: '2m', target: 200 },  // Spike
       { duration: '5m', target: 200 },
       { duration: '2m', target: 0 },    // Ramp-down
     ],
   };
   
   export default function() {
     let res = http.get('http://localhost:3000/exchanges/suggestions');
     check(res, { 'status is 200': (r) => r.status === 200 });
     sleep(1);
   }
   ```

3. **Database Load Testing**
   ```bash
   # Test concurrent database queries
   - 100 simultaneous reads
   - 50 simultaneous writes
   - 20 complex JOIN queries
   - Measure: Query time, connection pool usage, deadlocks
   ```

**Performance Targets:**
```
API Response Times:
✓ Simple queries (GET /books): <100ms (p95)
✓ Complex queries (GET /exchanges/suggestions): <500ms (p95)
✓ Mutations (POST /exchanges/request): <200ms (p95)

Throughput:
✓ 100+ requests/second sustained
✓ 500+ peak requests/second

Database:
✓ <50ms query time (p95)
✓ <100 concurrent connections
✓ Zero deadlocks
```

---

## ⚡ III. OPTIMIZATION STRATEGY

### Phase 9E: Database Optimization (2 days)

#### 🎯 Query Performance

**Tasks:**

1. **Analyze Slow Queries**
   ```sql
   -- Enable MySQL slow query log
   SET GLOBAL slow_query_log = 'ON';
   SET GLOBAL long_query_time = 0.5; -- Queries >500ms
   SET GLOBAL log_queries_not_using_indexes = 'ON';
   
   -- After load testing, analyze:
   SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 20;
   ```

2. **Add Missing Indexes**
   ```sql
   -- Example: If exchanges queries are slow
   CREATE INDEX idx_exchanges_status_created ON exchanges(status, created_at);
   CREATE INDEX idx_books_owner_status ON books(owner_id, status);
   CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
   ```

3. **Optimize Complex Queries**
   ```typescript
   // BEFORE: N+1 query problem
   const exchanges = await this.exchangeRepo.find();
   for (const ex of exchanges) {
     ex.memberA = await this.memberRepo.findOne(ex.member_a_id);
     ex.memberB = await this.memberRepo.findOne(ex.member_b_id);
   }
   
   // AFTER: Single query with joins
   const exchanges = await this.exchangeRepo.find({
     relations: ['memberA', 'memberB', 'booksOffered', 'booksRequested']
   });
   ```

4. **Query Result Caching**
   ```typescript
   // Add query result cache
   const books = await this.bookRepo
     .createQueryBuilder('book')
     .where('book.status = :status', { status: 'AVAILABLE' })
     .cache('available_books', 60000) // Cache for 60 seconds
     .getMany();
   ```

---

### Phase 9F: Redis Caching (2-3 days)

#### 🎯 Reduce Database Load

**Setup Redis:**
```bash
# docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

**Install Dependencies:**
```bash
npm install cache-manager cache-manager-redis-store redis
npm install --save-dev @types/cache-manager
```

**Implement Caching:**

1. **Configure Cache Module**
   ```typescript
   // app.module.ts
   import { CacheModule } from '@nestjs/cache-manager';
   import * as redisStore from 'cache-manager-redis-store';
   
   @Module({
     imports: [
       CacheModule.register({
         isGlobal: true,
         store: redisStore,
         host: 'localhost',
         port: 6379,
         ttl: 60, // Default 60 seconds
       }),
       // ... other modules
     ],
   })
   ```

2. **Cache Hot Data**
   ```typescript
   // books.service.ts
   import { CACHE_MANAGER } from '@nestjs/cache-manager';
   import { Cache } from 'cache-manager';
   
   @Injectable()
   export class BooksService {
     constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
     
     async getAvailableBooks() {
       const cacheKey = 'books:available';
       
       // Try cache first
       let books = await this.cacheManager.get(cacheKey);
       if (books) return books;
       
       // Cache miss - query DB
       books = await this.bookRepo.find({ 
         where: { status: 'AVAILABLE' } 
       });
       
       // Store in cache for 5 minutes
       await this.cacheManager.set(cacheKey, books, 300);
       return books;
     }
     
     async updateBook(bookId: string, dto: UpdateBookDto) {
       const result = await this.bookRepo.update(bookId, dto);
       
       // Invalidate cache
       await this.cacheManager.del('books:available');
       await this.cacheManager.del(`book:${bookId}`);
       
       return result;
     }
   }
   ```

3. **Cache Strategy Matrix**
   ```
   Data Type              | TTL    | Invalidation Strategy
   -----------------------|--------|----------------------
   Available Books        | 5 min  | On book status change
   User Profile           | 15 min | On profile update
   Dashboard Stats        | 10 min | On hourly cron job
   Matching Suggestions   | 30 min | On library change
   Google Books Search    | 24 hr  | Never (external API)
   Exchange Statistics    | 5 min  | On exchange update
   ```

---

### Phase 9G: API Rate Limiting (1 day)

#### 🎯 Prevent Abuse & DDoS

**Install Throttler:**
```bash
npm install @nestjs/throttler
```

**Configure Rate Limiting:**
```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,  // 1 second
        limit: 10,  // 10 requests/second
      },
      {
        name: 'medium',
        ttl: 60000,  // 1 minute
        limit: 100,  // 100 requests/minute
      },
      {
        name: 'long',
        ttl: 900000, // 15 minutes
        limit: 1000, // 1000 requests/15min
      },
    ]),
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
```

**Custom Limits per Endpoint:**
```typescript
// exchanges.controller.ts
import { Throttle } from '@nestjs/throttler';

@Controller('exchanges')
export class ExchangesController {
  // Default limits apply
  @Get('suggestions')
  async getSuggestions() { ... }
  
  // Stricter limit for expensive operation
  @Throttle({ short: { limit: 1, ttl: 10000 } }) // 1 req per 10 seconds
  @Post('generate-suggestions')
  async generateSuggestions() { ... }
  
  // Bypass rate limit for admins
  @SkipThrottle()
  @UseGuards(AdminGuard)
  @Get('admin/stats')
  async getAdminStats() { ... }
}
```

---

### Phase 9H: Response Compression (0.5 day)

#### 🎯 Reduce Bandwidth

**Enable Compression:**
```typescript
// main.ts
import compression from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable GZIP compression
  app.use(compression());
  
  await app.listen(3000);
}
```

**Results:**
```
Before Compression:
GET /exchanges/suggestions -> 250 KB JSON

After Compression:
GET /exchanges/suggestions -> 35 KB (85% reduction)
```

---

## 🔍 IV. MONITORING STRATEGY

### Phase 9I: Logging System (1 day)

#### 🎯 Structured Logging

**Install Winston:**
```bash
npm install nest-winston winston
```

**Configure Winston:**
```typescript
// main.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const app = await NestFactory.create(AppModule, {
  logger: WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context }) => {
            return `[${timestamp}] [${level}] [${context}] ${message}`;
          }),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.json(),
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.json(),
      }),
    ],
  }),
});
```

**Log Levels:**
```typescript
logger.error('Critical failure', { userId, error }); // Production
logger.warn('Deprecated API used', { endpoint });    // Production
logger.log('User logged in', { userId });            // Production
logger.debug('Cache hit', { key, ttl });             // Development
logger.verbose('Query executed', { sql, params });   // Development
```

---

### Phase 9J: Health Checks (1 day)

#### 🎯 System Status Monitoring

**Install Terminus:**
```bash
npm install @nestjs/terminus
```

**Create Health Module:**
```typescript
// health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { 
  HealthCheck, 
  HealthCheckService, 
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database check
      () => this.db.pingCheck('database'),
      
      // Memory check (heap <150MB)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      
      // Disk check (storage <90% full)
      () => this.disk.checkStorage('storage', { 
        path: '/', 
        thresholdPercent: 0.9 
      }),
    ]);
  }
}
```

**Response Example:**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "storage": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up", "heapUsed": 45123456 },
    "storage": { "status": "up", "percentUsed": 0.65 }
  }
}
```

---

### Phase 9K: Performance Metrics (1-2 days)

#### 🎯 Real-time Metrics Collection

**Install Prometheus + Grafana:**
```yaml
# docker-compose.yml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

**Install Metrics Library:**
```bash
npm install @willsoto/nestjs-prometheus prom-client
```

**Configure Metrics:**
```typescript
// app.module.ts
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),
  ],
})
```

**Custom Metrics:**
```typescript
// exchanges/exchanges.service.ts
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class ExchangesService {
  constructor(
    @InjectMetric('exchange_requests_total') 
    private exchangeCounter: Counter,
    
    @InjectMetric('exchange_duration_seconds') 
    private exchangeDuration: Histogram,
  ) {}
  
  async createExchangeRequest(dto: CreateExchangeRequestDto) {
    const timer = this.exchangeDuration.startTimer();
    
    try {
      const result = await this.exchangeRepo.save({ ... });
      this.exchangeCounter.inc({ status: 'success' });
      return result;
    } catch (error) {
      this.exchangeCounter.inc({ status: 'error' });
      throw error;
    } finally {
      timer();
    }
  }
}
```

**Metrics Dashboard:**
```
Grafana Panels:
1. Request Rate (req/sec)
2. Error Rate (%)
3. Response Time (p50, p95, p99)
4. Database Query Time
5. Cache Hit Rate
6. Active WebSocket Connections
7. Memory Usage (MB)
8. CPU Usage (%)
```

---

## 📅 V. IMPLEMENTATION TIMELINE

### Week 1: Testing Foundation (5 days)
```
Day 1-2: Setup testing framework + Write AuthService tests
Day 3-4: ExchangesService + MatchingService tests
Day 5:   AdminService + ReviewsService tests
```

### Week 2: Integration & E2E (5 days)
```
Day 1-2: Integration tests (module interactions)
Day 3-4: E2E tests (user flows)
Day 5:   Load testing setup + initial runs
```

### Week 3: Optimization (5 days)
```
Day 1-2: Database optimization (indexes, queries)
Day 3-4: Redis caching implementation
Day 5:   Rate limiting + compression
```

### Week 4: Monitoring & Polish (5 days)
```
Day 1:   Logging system upgrade
Day 2:   Health checks
Day 3-4: Metrics collection (Prometheus + Grafana)
Day 5:   Documentation + final testing
```

**Total Duration: 20 working days (4 weeks)**

---

## 🎯 VI. SUCCESS CRITERIA

### Testing Metrics
- ✅ **Unit Test Coverage:** ≥70%
- ✅ **Integration Tests:** 20+ test cases
- ✅ **E2E Tests:** 10+ critical flows
- ✅ **Load Test:** Handle 100 RPS sustained

### Performance Metrics
- ✅ **API Response Time (p95):** <500ms
- ✅ **Database Query Time (p95):** <50ms
- ✅ **Cache Hit Rate:** >80%
- ✅ **Memory Usage:** <200MB idle, <500MB under load

### Monitoring Metrics
- ✅ **Logging:** Structured JSON logs to file
- ✅ **Health Check:** /health endpoint responding
- ✅ **Metrics:** Prometheus scraping successfully
- ✅ **Dashboards:** Grafana showing live metrics

---

## 🚀 VII. GETTING STARTED

### 1. Review Current System
```bash
# Check current test coverage
npm run test:cov

# Run existing tests
npm run test

# Run E2E tests
npm run test:e2e
```

### 2. Install Testing Dependencies
```bash
npm install --save-dev @nestjs/testing jest ts-jest @types/jest
npm install --save-dev supertest @types/supertest
npm install --save-dev artillery k6
```

### 3. Create First Test File
```bash
# AuthService unit test
touch src/modules/auth/services/auth.service.spec.ts
```

### 4. Set Coverage Threshold
```json
// package.json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

---

## 📚 VIII. RESOURCES & REFERENCES

### Testing
- [NestJS Testing Docs](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Guide](https://github.com/ladjs/supertest)
- [k6 Load Testing](https://k6.io/docs/)

### Optimization
- [TypeORM Query Optimization](https://typeorm.io/caching)
- [Redis Caching Strategies](https://redis.io/docs/manual/patterns/)
- [NestJS Performance](https://docs.nestjs.com/techniques/performance)

### Monitoring
- [Prometheus + NestJS](https://github.com/willsoto/nestjs-prometheus)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [Winston Logging](https://github.com/winstonjs/winston)

---

## 🎉 SUMMARY

**Phase 9 Goals:**
1. ✅ Achieve 70%+ test coverage
2. ✅ API response <500ms (p95)
3. ✅ Handle 100+ RPS sustained
4. ✅ Implement Redis caching
5. ✅ Add rate limiting
6. ✅ Setup monitoring dashboards

**End Result:** Production-ready, well-tested, optimized, and monitored system! 🚀

---

**Next Action:** Start với Phase 9A - Unit Testing cho AuthService! 🧪
