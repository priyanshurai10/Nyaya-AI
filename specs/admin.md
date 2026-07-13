# Admin Specification

## Feature Description
The Administrative Console provides operations for managing user records, verifying payment submissions, auditing security/system event logs, and updating directory information (courts, advocates) in real-time.

## User Flow
1. **Admin Authentication**:
   - Administrative operator logs in using credentials flagged with `is_admin = True`.
   - Accesses dashboard at `/admin`.
2. **Payment Review**:
   - Operator selects "Marketplace Payments".
   - Operator reviews the list of pending UTRs and screenshot attachments.
   - Operator clicks "Approve" or "Reject".
3. **Log Analysis**:
   - Operator navigates to "System Logs" or "Observability".
   - System renders security dashboards, rate limit violations, OCR failure metrics, and recent audit trails.

## Business Rules
- **No Automated Actions**: All payments must remain pending until explicitly reviewed by the operator.
- **Audit Logging**: Every action performed by an admin (approving/rejecting payments, modifying court listings) must log the timestamp, IP hash, and admin ID in the audit database.

## Validation Rules
- Rejections must require the operator to enter a reason string (minimum 10 characters).

## Error Handling
- **Database Conflict**: If two admins attempt to approve the same transaction, show: *"This transaction has already been modified by another administrator."*
- **Access Denied**: Non-admin users attempting to open `/admin` routes must be redirected to the home page.

## Database Requirements
- Table: `users` (checks `is_admin`)
- Table: `transactions` (status transitions)
- Table: `audit_logs` (stores trace logs)

## API Requirements
- `GET /api/v1/admin/transactions/pending`: Lists transactions awaiting verification.
- `POST /api/v1/admin/transactions/{tx_id}/approve`: Approves a transaction, generates a Consultation ID, and sends email/chat triggers.
- `POST /api/v1/admin/transactions/{tx_id}/reject`: Rejects transaction reference.
- `GET /api/v1/observability/stats`: Retrieves statistics on blocked injections, upload counts, and agent utilization.

## Edge Cases
- **Stale UTRs**: Admin must have the capability to filter pending logs by date to find abandoned or incorrect payment attempts.

## Acceptance Criteria
- [x] Administrative pages check roles on both frontend client routes and backend APIs.
- [x] Audit trails correctly trace administrative operations.

---

## BDD Test Cases

### Payment Approval Workflow Scenario
```gherkin
Given administrator is logged into the admin dashboard
And selects a transaction with status "pending_verification"
When the administrator clicks the "Approve" button
Then the backend should generate a new unique Consultation ID (e.g. NYA-2026-XXXXXX)
And update the transaction status to "verified"
And log a "Verification Completed" event in the audit trail
And the citizen's consultation request status should change to "Payment Verified"
```

### Payment Rejection Workflow Scenario
```gherkin
Given administrator selects a pending transaction
When the administrator enters the reason "Incorrect UTR format"
And clicks the "Reject" button
Then the transaction status should update to "rejected"
And the citizen's consultation request status should update to "Rejected"
```
