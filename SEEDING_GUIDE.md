# Seeding Guide (Frontend Full Logic Dataset)

## Purpose
Populate the database with a comprehensive dataset that covers all business logic branches for frontend development & testing.

## What Is Included
- 6 members across all trust tiers (<10, 10-19, 20-39, ≥40)
- 1 admin
- Books in multiple ownership + statuses
- Exchanges: COMPLETED, USER_CANCELLED, NO_SHOW, BOTH_NO_SHOW, DISPUTE, EXPIRED, PENDING
- Reviews: good (4-5★) and bad (1-2★)
- Conversations & messages (multi-thread + follow-up)
- Activity logs for major events

## File
`sql/seed/seed-data.sql`

## WARNING
Running the seed will TRUNCATE critical tables. Only use on local dev / ephemeral environments.

## Apply Seed (Docker MySQL)
```powershell
# Ensure backend containers up (db must be running)
docker-compose up -d mysql

# Apply seed
Get-Content sql/seed/seed-data.sql | docker exec -i bookswap_mysql mysql -uroot -proot bookswap_db
```

## Verify Quickly
```powershell
# Count members
Get-Content "SELECT COUNT(*) FROM members;" | docker exec -i bookswap_mysql mysql -uroot -proot bookswap_db

# List exchange statuses
Get-Content "SELECT status, cancellation_reason, COUNT(*) FROM exchanges GROUP BY status, cancellation_reason;" | docker exec -i bookswap_mysql mysql -uroot -proot bookswap_db
```

## Optional: Recalculate Trust Scores Programmatically
If you want the system to recompute trust scores instead of using static values:
1. After seeding, run a temporary script invoking `TrustScoreService.updateTrustScore(member_id)` for each member.
2. Or hit a custom admin endpoint if implemented.

## Suggested Frontend Test Scenarios
| Scenario | Member / Exchange | Endpoint |
|----------|-------------------|----------|
| Blocked creation (<10) | `BannedUser` (trust 5) | POST /exchanges/requests -> expect 403/validation |
| Limited pending constraint | `LimitedUser` (trust 15) | Create >2 PENDING -> expect rejection |
| Medium extended confirm window | `MediumUser` | Observe expiry times GET /exchanges |
| VIP privileges | `VipUser` | Larger confirm window, highlight badge |
| NO_SHOW penalty representation | Exchange `exch0003` | GET /exchanges/:id |
| BOTH_NO_SHOW UI branch | Exchange `exch0004` | GET /exchanges/:id |
| DISPUTE badge & review conflict | Exchange `exch0005` | GET /exchanges/:id + reviews |
| EXPIRED logic (only one confirm) | Exchange `exch0006` | GET /exchanges/:id |
| Messaging thread continuity | Conversation `conv0001` | GET /messages/conversation/:id |
| Trust score diff in profile | All members | GET /auth/me (per token) |

## Tokens (Manual Generation)
You can generate JWTs by logging in via existing auth endpoints using seeded emails:
- banned@test.com
- limited@test.com
- medium@test.com
- vip@test.com
- disputer@test.com
- noshow@test.com
- admin@test.com

If you bypass hashing for local quickstart, ensure password matches whatever logic is in `auth.service.ts` (default: you may need to set a known raw password and hash properly before seeding for real usage).

## Reset Flow
```powershell
# Drop & recreate schema (if you have a full init script)
Get-Content sql/migrations/011-fix-trust-score-precision.sql | docker exec -i bookswap_mysql mysql -uroot -proot bookswap_db
# Re-apply seed
Get-Content sql/seed/seed-data.sql | docker exec -i bookswap_mysql mysql -uroot -proot bookswap_db
```

## Next Enhancements (Optional)
- Add more PENDING exchanges for pagination UI
- Add avatar variations + missing avatar case
- Add admin-cancelled exchange
- Add additional dispute record to test multiple disputes

## Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| Foreign key error on truncate | Table order mismatch | Disable FK checks (already in script) |
| Password login fails | Placeholder bcrypt not matching raw | Replace hashes with real bcrypt hashes |
| Trust UI mismatch | Static trust_score seed vs recalculated | Run recalculation script |

---
Seed ready. 🎉
