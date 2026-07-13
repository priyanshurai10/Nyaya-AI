# Authentication Specification

## Feature Description
The Authentication system manages user onboarding, secure identity verification, session persistence, and role-based access control (RBAC) across Nyaya AI. It supports custom secure credential-based login and registration, issuing signed JSON Web Tokens (JWT) for subsequent authenticated sessions.

## User Flow
1. **User Onboarding/Registration**:
   - User inputs full name, mobile number, email (optional), password, and language preference.
   - Password must conform to complexity guidelines.
   - Upon form submission, credentials are validated, the password is encrypted/hashed using bcrypt, and a user record is committed.
2. **User Login**:
   - User inputs mobile number or email and password.
   - System validates input presence, queries database, verifies password hash, and generates a JWT.
   - Client stores token in localStorage and attaches it to authorization headers for API communication.
3. **Session Verification**:
   - Token is parsed on page load. Expired tokens trigger automatic redirection to the login screen.

## Business Rules
- Each email address and mobile number must be unique across all active profiles.
- Sessions expire after 1 day (`ACCESS_TOKEN_EXPIRE_MINUTES = 1440`).
- Administrative privileges (`is_admin`) can only be granted directly in the database or via authenticated root commands.

## Validation Rules
- **Email format**: Must be a valid RFC 5322 structure.
- **Mobile number**: Must be a 10-digit numeric format prefixed optionally with standard country code (`+91`).
- **Password criteria**: Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.

## Error Handling
- Invalid login credentials must return a generic `401 Unauthorized` status to avoid username enumeration.
- Registration with existing unique fields must return `400 Bad Request` with specific indicator ("Mobile number already registered" or "Email already registered").
- Invalid or expired JWT tokens return `401 Unauthorized`.

## Database Requirements
- Table: `users`
  - `id`: String (Primary Key, UUID format)
  - `name`: String, Not Null
  - `email`: String, Unique, Nullable
  - `mobile`: String, Unique, Nullable
  - `password_hash`: String, Not Null
  - `language_preference`: String, default "en"
  - `is_admin`: Boolean, default False
  - `created_at`: DateTime
  - `last_login`: DateTime

## API Requirements
- `POST /api/v1/auth/register`: Onboards a new user. Returns JSON profile without sensitive fields.
- `POST /api/v1/auth/token`: Logs in the user, returns OAuth2 compatible access token.
- `GET /api/v1/user/profile`: Fetches current user profile based on Bearer token.

## Edge Cases
- **Concurrent Logins**: Session tokens are stateless and can be used on multiple devices simultaneously.
- **Null Fields**: Email is optional; login must accept either email or mobile.
- **Token Tampering**: Spoofed headers or signature mismatch must immediately fail verification checks and log audit trail failures.

## Acceptance Criteria
- [x] Passwords must be hashed using high-work-factor algorithms (bcrypt).
- [x] Unauthorized endpoints must reject calls lacking a valid Bearer token.
- [x] Token verification middleware must be integrated on all private routes.

---

## BDD Test Cases

### Login Scenario
```gherkin
Given user navigates to the login screen
When user submits valid registered mobile "9876543210" and matching password
Then authentication should succeed
And the API should return a valid JWT access token
And the user profile last_login timestamp should update
```

### Invalid Login Scenario
```gherkin
Given user navigates to the login screen
When user enters unregistered mobile "9999999999" and any password
Then authentication should fail with 401 Unauthorized status
And the response should display "Incorrect mobile or password"
```

### Registration Scenario
```gherkin
Given user submits a new registration payload with unique mobile and email
When data validation passes
Then a new user record should be written to the database
And password must be saved as a secure hash
And client receives a success confirmation message
```
