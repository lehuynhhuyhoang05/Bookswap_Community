# 🔧 Backend API Requirements - Phase 1 Critical Features

## 📊 Database Schema Updates

### 1. Reports Table - Add New Columns

```sql
ALTER TABLE reports 
ADD COLUMN severity ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM' AFTER report_type,
ADD COLUMN evidence_urls JSON DEFAULT NULL AFTER description,
ADD COLUMN status ENUM('NEW', 'INVESTIGATING', 'ACTION_TAKEN', 'CLOSED') DEFAULT 'NEW' AFTER severity,
ADD COLUMN resolution_notes TEXT DEFAULT NULL,
ADD COLUMN admin_action_type ENUM('WARN_USER', 'TEMPORARY_BAN', 'PERMANENT_BAN', 'REQUIRE_MORE_EVIDENCE', 'NO_ACTION') DEFAULT NULL,
ADD COLUMN admin_notes TEXT DEFAULT NULL,
ADD COLUMN reviewed_by INT DEFAULT NULL,
ADD COLUMN reviewed_at TIMESTAMP DEFAULT NULL;
```

**Migration Notes:**
- `severity`: Mức độ nghiêm trọng của báo cáo
- `evidence_urls`: JSON array chứa URLs của file bằng chứng đã upload
- `status`: Workflow state cho admin investigation
- `resolution_notes`: Ghi chú kết quả xử lý (hiển thị cho user)
- `admin_action_type`: Loại hành động admin đã thực hiện
- `admin_notes`: Ghi chú nội bộ (chỉ admin xem)
- `reviewed_by`: Admin ID đã xử lý
- `reviewed_at`: Thời gian xử lý

---

## 🎯 DTOs Update

### CreateReportDto
```typescript
export class CreateReportDto {
  @IsEnum(['SPAM', 'INAPPROPRIATE', 'HARASSMENT', 'FRAUD', 'FAKE_PROFILE', 'OTHER'])
  report_type: string;

  @IsNotEmpty()
  reported_member_id: string;

  @IsOptional()
  reported_item_type?: string; // 'BOOK', 'REVIEW', 'EXCHANGE', etc.

  @IsOptional()
  reported_item_id?: string;

  @IsNotEmpty()
  @MinLength(20)
  description: string;

  // ✨ NEW FIELDS
  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  @IsOptional()
  severity?: string = 'MEDIUM';

  @IsArray()
  @IsOptional()
  evidence_urls?: string[]; // Array of uploaded file URLs
}
```

### UpdateReportStatusDto
```typescript
export class UpdateReportStatusDto {
  @IsEnum(['NEW', 'INVESTIGATING', 'ACTION_TAKEN', 'CLOSED'])
  status: string;
}
```

### TakeActionDto
```typescript
export class TakeActionDto {
  @IsEnum(['WARN_USER', 'TEMPORARY_BAN', 'PERMANENT_BAN', 'REQUIRE_MORE_EVIDENCE', 'NO_ACTION'])
  action_type: string;

  @IsNotEmpty()
  @MinLength(10)
  resolution_notes: string; // Shown to user

  @IsOptional()
  admin_notes?: string; // Internal notes for admins only
}
```

---

## 🔌 API Endpoints Required

### 1. Upload Report Evidence
**Endpoint:** `POST /api/reports/upload-evidence`  
**Purpose:** Upload file bằng chứng (ảnh, PDF) cho báo cáo  
**Auth:** Required (user who is creating the report)

**Request:**
- Content-Type: `multipart/form-data`
- Body: 
  - `files`: File[] (max 5 files, max 10MB each)
  - Allowed types: JPG, PNG, GIF, WEBP, PDF

**Response:**
```json
{
  "success": true,
  "urls": [
    "https://storage.bookswap.com/evidence/report_123_file1.jpg",
    "https://storage.bookswap.com/evidence/report_123_file2.png"
  ]
}
```

**Validation:**
- Max 5 files per request
- Max 10MB per file
- Only images (jpg, png, gif, webp) and PDF allowed
- Store in separate folder: `/uploads/reports/evidence/`

---

### 2. Update Report Workflow Status
**Endpoint:** `PATCH /api/reports/:id/status`  
**Purpose:** Admin cập nhật trạng thái workflow (NEW → INVESTIGATING → ACTION_TAKEN → CLOSED)  
**Auth:** Admin only

**Request Body:**
```json
{
  "status": "INVESTIGATING"
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "report_id": "R123",
    "status": "INVESTIGATING",
    "updated_at": "2024-12-03T10:30:00Z"
  }
}
```

**Business Logic:**
- Only admins can update status
- Valid transitions: NEW → INVESTIGATING → ACTION_TAKEN → CLOSED
- Update `updated_at` timestamp
- Optionally send notification to reporter

---

### 3. Take Admin Action on Report
**Endpoint:** `POST /api/reports/:id/action`  
**Purpose:** Admin thực hiện hành động xử lý (warn, ban, etc.)  
**Auth:** Admin only

**Request Body:**
```json
{
  "action_type": "TEMPORARY_BAN",
  "resolution_notes": "Thành viên đã vi phạm quy định về spam. Tài khoản bị khóa 7 ngày.",
  "admin_notes": "User has 2 previous warnings. Escalated to temp ban."
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "report_id": "R123",
    "status": "ACTION_TAKEN",
    "admin_action_type": "TEMPORARY_BAN",
    "resolution_notes": "Thành viên đã vi phạm...",
    "reviewed_by": 1,
    "reviewed_at": "2024-12-03T10:35:00Z"
  }
}
```

**Business Logic:**
- Only admins can take action
- Automatically update `status` to `ACTION_TAKEN`
- Set `reviewed_by` to current admin user_id
- Set `reviewed_at` to current timestamp
- Send notification to reporter with `resolution_notes`
- Apply action to reported member:
  - **WARN_USER**: Increment warning count, send warning email
  - **TEMPORARY_BAN**: Set member.status = 'SUSPENDED', set unban_date = now + 7 days
  - **PERMANENT_BAN**: Set member.status = 'BANNED'
  - **REQUIRE_MORE_EVIDENCE**: Send notification to reporter asking for more info
  - **NO_ACTION**: Close report without penalty

---

### 4. Get Member Report History
**Endpoint:** `GET /api/reports/member/:memberId/history`  
**Purpose:** Admin xem lịch sử báo cáo của thành viên (cho investigation panel)  
**Auth:** Admin only

**Response:**
```json
{
  "member_id": "M123",
  "full_name": "Nguyễn Văn A",
  "member_since": "2024-01-15T00:00:00Z",
  "account_status": "ACTIVE",
  "trust_score": 75,
  "stats": {
    "total_reports_against": 3,
    "total_warnings": 1,
    "total_bans": 0,
    "total_exchanges": 12,
    "completed_exchanges": 10,
    "cancelled_exchanges": 2
  },
  "recent_reports": [
    {
      "report_id": "R001",
      "report_type": "SPAM",
      "status": "RESOLVED",
      "severity": "LOW",
      "created_at": "2024-12-01T10:00:00Z",
      "resolution": "Warning issued"
    },
    {
      "report_id": "R002",
      "report_type": "NO_SHOW",
      "status": "CLOSED",
      "severity": "MEDIUM",
      "created_at": "2024-11-15T14:30:00Z",
      "resolution": "No action needed - valid excuse provided"
    }
  ]
}
```

**Query Logic:**
```sql
SELECT 
  r.*,
  COUNT(*) as total_reports,
  SUM(CASE WHEN admin_action_type = 'WARN_USER' THEN 1 ELSE 0 END) as total_warnings,
  SUM(CASE WHEN admin_action_type IN ('TEMPORARY_BAN', 'PERMANENT_BAN') THEN 1 ELSE 0 END) as total_bans
FROM reports r
WHERE r.reported_member_id = :memberId
ORDER BY r.created_at DESC
LIMIT 10;
```

---

## 🔄 Update Existing Endpoints

### GET /api/reports (My Reports)
**Add to response:**
```json
{
  "reports": [
    {
      "report_id": "R123",
      "severity": "HIGH",        // ✨ NEW
      "evidence_urls": [...],    // ✨ NEW
      "status": "INVESTIGATING", // ✨ NEW
      "resolution_notes": "...", // ✨ NEW (if resolved)
      ...existing fields...
    }
  ]
}
```

### GET /api/reports/:id (Report Detail)
**Add to response:**
```json
{
  "report_id": "R123",
  "severity": "HIGH",           // ✨ NEW
  "evidence_urls": [            // ✨ NEW
    "https://storage.../evidence1.jpg",
    "https://storage.../evidence2.png"
  ],
  "status": "ACTION_TAKEN",     // ✨ NEW
  "resolution_notes": "...",    // ✨ NEW
  "admin_action_type": "WARN_USER", // ✨ NEW
  "reviewed_at": "...",         // ✨ NEW
  ...existing fields...
}
```

### POST /api/reports (Create Report)
**Accept new fields:**
```json
{
  "report_type": "SPAM",
  "reported_member_id": "M123",
  "description": "...",
  "severity": "MEDIUM",         // ✨ NEW (optional, default: MEDIUM)
  "evidence_urls": [...]        // ✨ NEW (optional, from upload endpoint)
}
```

---

## 📂 File Storage Structure

```
/uploads/
  └── reports/
      └── evidence/
          ├── report_R123_1702467890_file1.jpg
          ├── report_R123_1702467890_file2.png
          └── report_R456_1702468000_document.pdf
```

**File Naming Convention:**
`report_{report_id}_{timestamp}_{original_filename}`

**Storage Config:**
- Local development: `/uploads/reports/evidence/`
- Production: Cloud storage (AWS S3, Cloudinary, etc.)
- Serve via: Static file endpoint or CDN

---

## 🔔 Notification Integration

### Notify Reporter When Report Resolved
```typescript
// After admin takes action
await notificationsService.create({
  member_id: report.reporter_member_id,
  type: 'REPORT_RESOLVED',
  title: 'Báo cáo của bạn đã được xử lý',
  message: report.resolution_notes,
  action_url: `/reports/${report.report_id}`,
  priority: 'NORMAL'
});
```

### Notify Reported Member (If Warned/Banned)
```typescript
// When action_type = WARN_USER, TEMPORARY_BAN, or PERMANENT_BAN
await notificationsService.create({
  member_id: report.reported_member_id,
  type: 'ACCOUNT_WARNING',
  title: 'Cảnh báo vi phạm',
  message: `Tài khoản của bạn đã nhận cảnh cáo: ${report.admin_action_type}`,
  action_url: '/profile/violations',
  priority: 'URGENT'
});
```

---

## ✅ Testing Checklist

### API Tests
- [ ] Upload evidence files (valid images, PDFs)
- [ ] Upload evidence files (invalid types, oversized)
- [ ] Create report with severity + evidence_urls
- [ ] Update report status (NEW → INVESTIGATING → CLOSED)
- [ ] Take admin action (WARN_USER)
- [ ] Take admin action (TEMPORARY_BAN) - verify member suspended
- [ ] Take admin action (PERMANENT_BAN) - verify member banned
- [ ] Get member history with correct stats
- [ ] Verify notifications sent to reporter and reported member

### Authorization Tests
- [ ] Regular user cannot update report status
- [ ] Regular user cannot take admin action
- [ ] Regular user cannot view member history
- [ ] Admin can perform all actions
- [ ] User can only view their own reports

### Data Integrity
- [ ] Severity defaults to MEDIUM if not provided
- [ ] Status defaults to NEW on report creation
- [ ] Evidence URLs stored as JSON array
- [ ] Timestamps updated correctly (reviewed_at)
- [ ] Member stats calculated accurately

---

## 🚀 Implementation Priority

### High Priority (Do First)
1. ✅ Database migration - Add new columns
2. ✅ Update DTOs
3. ✅ POST /reports/upload-evidence
4. ✅ Update POST /reports (accept severity, evidence_urls)
5. ✅ Update GET /reports/:id (return new fields)

### Medium Priority (Do Next)
6. ✅ PATCH /reports/:id/status
7. ✅ POST /reports/:id/action
8. ✅ Apply actions to member (warn, ban logic)
9. ✅ Notification integration

### Lower Priority (Nice to Have)
10. GET /reports/member/:id/history
11. Admin analytics dashboard
12. Automated evidence scan (detect inappropriate images)

---

## 💡 Additional Recommendations

### Security
- Virus scan uploaded files before storing
- Sanitize filenames to prevent path traversal
- Rate limit upload endpoint (max 10 uploads/hour per user)
- Store evidence files with private access (authenticated URL)

### Performance
- Compress large images before storing (max 2MB after compression)
- Generate thumbnails for evidence images
- Use CDN for serving evidence files
- Cache member history for 5 minutes

### UX Improvements
- Email notification when report status changes
- In-app toast notification for report updates
- Admin dashboard showing pending reports count
- Auto-close reports older than 30 days if no action taken

---

## 📞 Questions for Backend Team

1. **File Storage**: Sử dụng local storage hay cloud storage (S3, Cloudinary)?
2. **Member Ban Logic**: Có table riêng cho violations/bans không? Hay update trực tiếp `members.status`?
3. **Trust Score**: Trust score có bị ảnh hưởng khi bị báo cáo không? Công thức tính như thế nào?
4. **Workflow Automation**: Có cần auto-escalate reports HIGH severity sau 24h không?
5. **Evidence Retention**: Giữ evidence files bao lâu? Delete sau khi close report?

---

**Frontend Team Contact:** ✅ Ready to integrate  
**Expected Backend ETA:** TBD  
**Last Updated:** December 3, 2024
