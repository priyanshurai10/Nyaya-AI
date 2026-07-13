# Consultations Specification

## Feature Description
The Consultation engine manages citizen requests for callback services, email advisories, and premium specialist video/chat conferences. It enforces strict workflow stages, requires payment confirmation before premium activation, and tracks admin assignments of verified specialists.

## User Flow
1. **Consultation Selection**:
   - User navigates to Legal Marketplace.
   - User chooses "Callback" (Free) or "Talk to Legal Specialist" (Premium).
2. **Details Input**:
   - User inputs full name, mobile number, language, and legal issue details.
3. **State & Workflow Execution**:
   - For Callbacks: Request status goes directly to "Callback Requested".
   - For Premium: Request status enters "Pending Payment". User must complete payment verification flow.
4. **Specialist Allocation**:
   - Once payment is verified, the request status updates to "Payment Verified".
   - Admin allocates an advocate specialist, updating status to "Specialist Assigned".
5. **Session Resolution**:
   - Upon service completion, consultation is marked "Consultation Completed".

## Business Rules
- **No Automatic Activation**: Premium consultation rooms must never activate without verification.
- **Strict Role-based Assignment**: Only users flagged as `is_admin = True` can assign specialists to active queries.
- **Audit Logging**: Every step of the consultation lifecycle must write log entries to `audit_logs` tracking dates and actions.

## Validation Rules
- **Mobile Number**: Valid 10-digit format.
- **Language**: Restricted to supported translation locales (English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi).

## Error Handling
- **No Specialist Available**: If no specialist is available for a selected language, state: *"All specialists for this language are currently busy. A representative will callback shortly."*
- **Verification Expired**: If a verification remains pending for more than 48 hours, raise a system alert in the administrator's log panel.

## Database Requirements
- Table: `consultation_requests`
  - `id`: String (Primary Key, UUID format)
  - `user_id`: String (ForeignKey)
  - `service_name`: String
  - `request_type`: String ("callback", "pay_now")
  - `full_name`: String
  - `mobile_number`: String
  - `preferred_language`: String
  - `legal_issue_type`: String
  - `status`: String
  - `transaction_id`: String (ForeignKey, Nullable)
  - `consultation_id`: String (Unique, Nullable)
  - `assigned_specialist`: String (Nullable)
  - `created_at`: DateTime
  - `updated_at`: DateTime

## API Requirements
- `POST /api/v1/marketplace/consultations`: Submits a new consultation request.
- `GET /api/v1/marketplace/consultations/my`: Fetches logged-in user's consultation history.
- `POST /api/v1/admin/consultations/{req_id}/assign`: Admin assigns specialist to request.

## Edge Cases
- **Parallel Submissions**: If a user submits duplicate requests rapidly, the system blocks requests matching active pending statuses for the same user.
- **Language Mismatch**: If user requests Tamil but no Tamil specialists are registered, route dynamically to English with a translator flag.

## Acceptance Criteria
- [x] Payment verification unlocks specialist assignment.
- [x] Logs accurately record all state transitions.

---

## BDD Test Cases

### Callback Request Scenario
```gherkin
Given user chooses "Talk to Legal Specialist (Callback)"
When user fills in their contact details and legal issue
And clicks submit
Then a new consultation request should be created in the database
And the status should be set to "Callback Requested"
And the user should see a confirmation message on screen
```

### Premium Consultation Request Scenario
```gherkin
Given user chooses "Talk to Legal Specialist (Pay Now)"
When user enters their details and submits the form
Then the consultation request status should be set to "Pending Payment"
And the user is redirected to the UTR verification entry screen
```

### Specialist Assignment Scenario
```gherkin
Given a consultation request has status "Payment Verified"
When the admin selects a verified local advocate
And assigns them to the consultation request
Then the status must update to "Specialist Assigned"
And a "Specialist Assigned" event is logged in the audit trail
```
