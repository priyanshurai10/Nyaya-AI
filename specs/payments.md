# Payments Specification

## Feature Description
The Payments system processes user transactions for premium legal services (e.g. Talk to Legal Specialist) using manual UPI or card payments. It provides robust protection by requiring user-entered transaction references (UTR) or receipt uploads, enforcing multi-state transaction flows, and requiring admin manual verification before services are activated.

## User Flow
1. **Initiate Payment**:
   - User requests a premium consultation (₹200 specialist offer).
   - System registers a transaction in `pending` status.
2. **Payment Execution**:
   - User scans the dynamic UPI QR code or inputs card credentials.
   - User completes payment in their bank app.
3. **Reference Submission**:
   - User copies the transaction UTR number or uploads a screenshot in the app and clicks "Verify".
   - Transaction state moves to `pending_verification`.
4. **Admin Approval**:
   - Administrative operator logs in, checks matching bank logs, and approves or rejects the UTR.
   - Upon approval, transaction status moves to `verified` and consultation is activated.

## Business Rules
- **No Auto-Verification**: Transactions must never auto-verify based on timer triggers or mocked completions. A manual UTR or screenshot submission is strictly required.
- **Human Approval Only**: Verification is fully manual; payments are only verified when approved by an administrator.
- **Comprehensive Logging**: Every transaction event (Initiated, Submitted UTR, Admin Verified, Admin Rejected) must write an immutable audit log entry containing timestamps and user info.

## Validation Rules
- **UTR Format**: Numeric string between 10 and 22 digits.
- **Price Integrity**: Base transaction amount for standard specialist consultations is locked at ₹200.

## Error Handling
- **Duplicate UTR**: Reject UTR submissions that already exist in the database with `409 Conflict`.
- **Payment Rejected**: If an admin rejects a payment, the status must update to `rejected` and notify the user to upload a valid screenshot.

## Database Requirements
- Table: `transactions`
  - `id`: String (Primary Key)
  - `user_id`: String (ForeignKey)
  - `amount`: Integer
  - `payment_method`: String ("upi", "card")
  - `status`: String ("pending", "pending_verification", "verified", "rejected")
  - `utr_number`: String, Unique, Nullable
  - `consultation_id`: String, Unique, Nullable
  - `created_at`: DateTime
  - `updated_at`: DateTime
- Table: `payment_settings`
  - `id`: String (Primary Key, e.g. "default")
  - `upi_id`: String
  - `support_email`: String
  - `specialist_price`: Integer
  - `specialist_original_price`: Integer

## API Requirements
- `POST /api/v1/marketplace/pay`: Initiates a pending transaction record.
- `POST /api/v1/marketplace/submit-utr`: Submits UTR number for verification.
- `POST /api/v1/admin/transactions/{tx_id}/verify`: Admin approves/rejects transaction.

## Edge Cases
- **Duplicate Verification Request**: If a user double-clicks submit, the API locks the transaction status to prevent parallel updates.
- **Database Rollbacks**: If writing a consultation ID unique key fails, the transaction update rolls back automatically to `pending_verification` to allow resubmission.

## Acceptance Criteria
- [x] UPI QR codes display the correct production address.
- [x] Status moves through: Pending -> Verification Pending -> Verified/Rejected.
- [x] Administrative panel lists all pending verifications clearly.

---

## BDD Test Cases

### Payment Initiation & Reference Submission Scenario
```gherkin
Given user initiates a consultation payment of ₹200
When the transaction status is marked "pending"
And user submits a transaction UTR "123456789012"
Then the transaction status changes to "pending_verification"
And a "Verification Started" event is logged in the audit trail
```

### Admin Verification Approval Scenario
```gherkin
Given a transaction has status "pending_verification" with UTR "123456789012"
When the administrator approves the transaction
Then the transaction status should update to "verified"
And the associated consultation request status should update to "Payment Verified"
And a unique consultation ID (e.g. NYA-2026-XXXXXX) should be generated
```

### Admin Verification Rejection Scenario
```gherkin
Given a transaction has status "pending_verification"
When the administrator rejects the transaction due to "Invalid screenshot details"
Then the transaction status should update to "rejected"
And the user is prompted to submit a valid payment proof
```
