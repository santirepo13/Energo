# Use Cases for Energo

## Table of Contents

1. [Introduction](#1-introduction)
2. [Actors](#2-actors)
3. [Use Case Diagram Overview](#3-use-case-diagram-overview)
4. [Detailed Use Cases](#4-detailed-use-cases)
   - [UC-001: User Registration](#uc-001-user-registration)
   - [UC-002: User Login](#uc-002-user-login)
   - [UC-003: User Logout](#uc-003-user-logout)
   - [UC-004: View Dashboard](#uc-004-view-dashboard)
   - [UC-005: Recharge by Amount (COP)](#uc-005-recharge-by-amount-cop)
   - [UC-006: Recharge by Energy (kWh)](#uc-006-recharge-by-energy-kwh)
   - [UC-007: Recharge by PIN Code](#uc-007-recharge-by-pin-code)
   - [UC-008: View Recharge History](#uc-008-view-recharge-history)
   - [UC-009: View Profile](#uc-009-view-profile)
   - [UC-010: Update Profile](#uc-010-update-profile)
   - [UC-011: Change Password](#uc-011-change-password)
   - [UC-012: Add Energy Card](#uc-012-add-energy-card)
   - [UC-013: Rename Energy Card](#uc-013-rename-energy-card)
   - [UC-014: Release Energy Card](#uc-014-release-energy-card)
   - [UC-015: Pause Account](#uc-015-pause-account)
   - [UC-016: Reactivate Account](#uc-016-reactivate-account)
   - [UC-017: Admin View All Users](#uc-017-admin-view-all-users)
   - [UC-018: Admin View User Detail](#uc-018-admin-view-user-detail)
   - [UC-019: Admin View User Logs](#uc-019-admin-view-user-logs)
   - [UC-020: Admin Update User Email](#uc-020-admin-update-user-email)
   - [UC-021: Admin Send Password Reset](#uc-021-admin-send-password-reset)
   - [UC-022: Admin Link Meter to User](#uc-022-admin-link-meter-to-user)
   - [UC-023: Admin Unlink Meter from User](#uc-023-admin-unlink-meter-from-user)
   - [UC-024: Admin Suspend User](#uc-024-admin-suspend-user)
   - [UC-025: Admin Reactivate User](#uc-025-admin-reactivate-user)
   - [UC-026: Admin Update kWh Price](#uc-026-admin-update-kwh-price)
   - [UC-027: Admin View All Recharge History](#uc-027-admin-view-all-recharge-history)
   - [UC-028: Auditor View All Admins](#uc-028-auditor-view-all-admins)
   - [UC-029: Auditor View Admin Profile](#uc-029-auditor-view-admin-profile)
   - [UC-030: Auditor Update Admin Status](#uc-030-auditor-update-admin-status)
   - [UC-031: Auditor View All Employees](#uc-031-auditor-view-all-employees)
   - [UC-032: Auditor Generate Employee Code](#uc-032-auditor-generate-employee-code)
   - [UC-033: Auditor View Employee Codes](#uc-033-auditor-view-employee-codes)
   - [UC-034: Auditor View Sales Metrics](#uc-034-auditor-view-sales-metrics)
   - [UC-035: Auditor View kWh Price History](#uc-035-auditor-view-kwh-price-history)
   - [UC-036: Auditor View Security Logs](#uc-036-auditor-view-security-logs)
5. [Use Case Relationships](#5-use-case-relationships)
6. [Business Rules Cross-Reference](#6-business-rules-cross-reference)

---

## 1. Introduction

This document describes all use cases for the Energo system. Each use case follows the standard template:

- **ID**: Unique identifier
- **Name**: Brief descriptive name
- **Primary Actor**: Who initiates the use case
- **Preconditions**: Conditions that must be true before execution
- **Postconditions**: State after successful completion
- **Main Flow**: Step-by-step normal execution
- **Alternative Flows**: Variations and error handling
- **Special Requirements**: Non-functional requirements
- **Extensions**: Additional capabilities

---

## 2. Actors

| Actor | Description | Permissions |
|-------|-------------|-------------|
| **Regular User** | Standard customer with prepaid energy meter | Manage own account, cards, recharges |
| **Admin** | System administrator | All user permissions + user management, pricing |
| **Auditor** | Compliance and monitoring officer | View-only access to all data, employee code generation |
| **System** | Automated processes (session, logging) | Background operations |

---

## 3. Use Case Diagram Overview

```
                    ┌─────────────────┐
                    │   Regular User  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Authentication│    │   Card &     │    │   Recharge   │
│   & Profile  │    │   Balance    │    │   Operations │
└──────────────┘    └──────────────┘    └──────────────┘
                                                     │
        ┌────────────────────────────────────────────┼──────────────┐
        │                                            │              │
        ▼                                            ▼              ▼
┌──────────────┐                            ┌──────────────┐ ┌──────────────┐
│    Admin      │                            │   Auditor    │ │   System     │
│  Management  │                            │   Monitoring │ │  Background  │
└──────────────┘                            └──────────────┘ └──────────────┘
```

---

## 4. Detailed Use Cases

---

### UC-001: User Registration

**ID**: UC-001  
**Name**: User Registration  
**Primary Actor**: Regular User (new)  
**Secondary Actors**: System (validation, database)  
**Preconditions**: User does not have an account; has valid energy card serial (or employee code)  
**Postconditions**: User account created; session established; energy card linked (if regular registration)

#### Main Flow

1. User navigates to `/register`
2. System displays registration form with fields: username, email, password, confirm password, card serial (or employee code checkbox)
3. User enters:
   - Unique username
   - Valid email
   - Password meeting policy requirements
   - Energy card serial (11+ digits) OR checks "I have employee code" and enters code
4. User submits form
5. System validates all inputs:
   - Checks username uniqueness (case-insensitive)
   - Checks email uniqueness (case-insensitive)
   - Validates password policy (12+ chars, 3/4 classes, no spaces, no username/email parts)
   - Validates card serial format OR validates employee code exists and unused
6. System begins database transaction
7. System creates user record with:
   - `username`, `email`, `password_hash` (bcrypt)
   - `role_id` = 3 (user) OR from employee code
   - `status_id` = 1 (Activo)
8. System creates user profile record (empty, to be filled later)
9. System creates user_flags record with `personal_data_filled = 0`
10. If regular registration (no employee code):
    - System checks if card serial exists
    - If exists and released: claims it (sets user_id, clears released flags)
    - If exists and active: returns error "Card already in use"
    - If new: creates energy_card record
11. If employee code used:
    - System marks employee_code as `used = 1`
    - Creates employee_code_usages record linking code to user
    - No energy card created
12. System commits transaction
13. System establishes session with user ID, username, role, status
14. System logs security event: "User registered successfully"
15. System returns success response
16. Frontend shows success message and redirects to dashboard

#### Alternative Flows

**6a. Validation Failure**
- Any validation fails → return 400 with specific error message
- Examples: "Username already exists", "Email already exists", "Password must be 12+ characters", "Card already in use"

**10a. Card Serial Invalid**
- Card serial must be 11+ digits, numeric only
- If format invalid → return error "Card serial must be 11+ digits"

**11a. Employee Code Invalid**
- Code not found → "Invalid employee code"
- Code already used → "Employee code already used"

**12a. Transaction Error**
- Duplicate entry race condition → rollback and return error
- Database error → rollback and return 500

#### Special Requirements

- Password must meet policy (see BR-005)
- Card serial validation on client and server
- Employee code validation on server only
- Session established immediately (auto-login)
- Security event logged

#### Extensions

- Future: Email verification before account activation
- Future: Admin approval workflow for registrations

---

### UC-002: User Login

**ID**: UC-002  
**Name**: User Login  
**Primary Actor**: Registered User  
**Secondary Actors**: System (authentication, session)  
**Preconditions**: User has valid username and password  
**Postconditions**: Session established; user authenticated; last_login timestamp updated

#### Main Flow

1. User navigates to `/login`
2. System displays login form (username, password)
3. User enters credentials
4. User submits form
5. System receives POST `/api/auth/login`
6. System looks up user by username (case-insensitive)
7. System retrieves password_hash, role_id, status_id
8. System compares provided password with hash using bcrypt.compare
9. If password matches:
   10. System checks user status
   11. If status is `Deshabilitado` or `Suspendido`:
       - Return 403 with message "Account [status]. Contact administrator."
   12. If status is `Activo` or `Pausa`:
       - System updates `last_login` timestamp
       - System creates session with:
         - `userId` = user.id
         - `username` = user.username
         - `role` = role_name
         - `status` = status_name
       - System logs security event: "Login successful" with IP
       - System returns 200 OK
13. Frontend receives success, stores session cookie, redirects to dashboard

#### Alternative Flows

**6a. User Not Found**
- Username does not exist → return 401 "Invalid credentials" (generic to avoid enumeration)

**8a. Password Mismatch**
- Password incorrect → return 401 "Invalid credentials"
- Log security event: "Login failed - invalid password" with IP

**11a. Account Paused**
- Status = `Pausa` → allow login but frontend shows warning banner
- Recharge operations will be blocked separately

**11b. Account Disabled/Suspended**
- Status = `Deshabilitado` or `Suspendido` → block login with specific message

#### Special Requirements

- Password verification uses timing-safe bcrypt.compare
- Session cookie is httpOnly, sameSite=lax
- Session secret from environment variable
- IP address logged for security
- Failed login attempts logged (but not counted for lockout yet)

#### Extensions

- Future: Implement rate limiting (5 attempts / 15 min)
- Future: Implement account lockout after repeated failures
- Future: Add two-factor authentication option

---

### UC-003: User Logout

**ID**: UC-003  
**Name**: User Logout  
**Primary Actor**: Authenticated User  
**Secondary Actors**: System (session destruction)  
**Preconditions**: User has active session  
**Postconditions**: Session destroyed; user logged out

#### Main Flow

1. User clicks "Logout" in UI
2. Frontend sends POST `/api/auth/logout`
3. System destroys session
4. System logs security event: "Logout" with username and IP
5. System returns 200 OK
6. Frontend clears local state, redirects to home page

#### Alternative Flows

**3a. Session Already Expired**
- Destroy may fail silently → return 200 anyway (idempotent)

#### Special Requirements

- Session must be completely removed from store
- Security log entry created
- Client-side state cleared

---

### UC-004: View Dashboard

**ID**: UC-004  
**Name**: View Dashboard  
**Primary Actor**: Authenticated User  
**Secondary Actors**: System (data retrieval)  
**Preconditions**: User has valid session  
**Postconditions**: Dashboard displayed with user's data

#### Main Flow

1. User navigates to `/dashboard` (or auto-redirect after login)
2. Frontend sends GET `/api/user/profile` (includes dashboard data)
3. System verifies session (requireAuth middleware)
4. System retrieves:
   - User basic info (username, email, role, status)
   - User profile (personal data)
   - Energy cards linked to user
   - Recharge history (own history for regular users; all history for admins)
   - Current kWh price
   - If auditor: security logs, sales metrics
   - If admin: kWh price history
5. System returns 200 with all data
6. Frontend renders:
   - User info (username, role, status)
   - Energy card(s) with current balance and kWh
   - Recharge form (if not paused)
   - Recharge history table
   - Admin/auditor-specific sections

#### Alternative Flows

**3a. Session Invalid**
- Return 401 → redirect to login

**3b. Account Status Blocked**
- Return 403 → show error message

**4a. No Energy Cards**
- Show warning "No energy card associated"
- Recharge form disabled

#### Special Requirements

- Dashboard data fetched in single request
- Real-time balance display
- Historical price shown in admin recharge history
- Security logs visible only to auditors
- Sales metrics visible only to auditors

#### Extensions

- Future: Add real-time updates via WebSocket
- Future: Add charts for consumption trends

---

### UC-005: Recharge by Amount (COP)

**ID**: UC-005  
**Name**: Recharge by Amount (COP)  
**Primary Actor**: Authenticated User (Activo status)  
**Secondary Actors**: System (transaction, PIN generation)  
**Preconditions**: User has at least one active energy card; account status is `Activo`  
**Postconditions**: Card balance increased; PIN generated; recharge recorded

#### Main Flow

1. User on dashboard selects energy card (if multiple)
2. User selects "Pesos (COP)" radio button
3. User enters amount in COP (positive integer)
4. System shows equivalent kWh based on current price
5. User clicks "Generar PIN y recargar"
6. Frontend sends POST `/api/recharge` with:
   ```json
   {
     "amount": 50000,
     "card_number": "14416394063"
   }
   ```
7. System validates:
   - User authenticated
   - Card belongs to user
   - Amount > 0
   - Account status is `Activo`
8. System begins transaction with row lock on energy card
9. System fetches current kWh price from settings
10. System calculates kWh = amount / price (rounded to 2 decimals)
11. System updates energy card:
    - `current_balance += amount`
    - `current_kwh += calculated_kwh`
    - `last_recharge = NOW()`
12. System generates recharge PIN using STS-20 algorithm:
    - Derives meter key from card_number and master secret
    - Encodes amount (in cents), days since epoch, random nonce
    - Creates HMAC-SHA256 MAC
    - Applies Luhn check digit
    - Returns 20-digit PIN
13. System inserts record into `recharge_pins`:
    - user_id, card_number, pin_code, amount, kwh, kwh_price_at_time, created_at
14. System commits transaction
15. System logs security event: "Recharge successful" with amount, card, user
16. System returns 200 with:
    ```json
    {
      "pin_code": "12345678901234567890",
      "current_balance": 150000.00,
      "current_kwh": 174.18
    }
    ```
17. Frontend displays success message, shows PIN, updates balance display, adds entry to history table

#### Alternative Flows

**7a. Invalid Amount**
- Amount ≤ 0 → return 400 "Invalid amount"

**7b. Card Not Found**
- Card doesn't belong to user → return 404 "Card not found"

**7c. Account Not Active**
- Status is Pausa/Deshabilitado/Suspendido → return 403 "Recharge blocked due to account status"

**8a. Transaction Conflict**
- Card modified concurrently → retry or return error
- Duplicate entry → return appropriate error

**12a. PIN Generation Failure**
- Cryptographic error → rollback transaction, return 500

#### Special Requirements

- Transaction ensures atomic balance update + PIN creation
- Row-level locking prevents race conditions
- kWh price at time of recharge is stored
- PIN is single-use (not enforced at generation, but at redemption if applicable)
- Balance precision: DECIMAL(10,2) for COP, DECIMAL(10,2) for kWh

#### Extensions

- Future: PIN redemption tracking (if PINs are sold/resold)
- Future: Recharge limits per day/week
- Future: Minimum/maximum recharge amounts

---

### UC-006: Recharge by Energy (kWh)

**ID**: UC-006  
**Name**: Recharge by Energy (kWh)  
**Primary Actor**: Authenticated User (Activo status)  
**Secondary Actors**: System (transaction, PIN generation)  
**Preconditions**: User has at least one active energy card; account status is `Activo`  
**Postconditions**: Card balance and kWh increased; PIN generated; recharge recorded

#### Main Flow

1. User on dashboard selects energy card
2. User selects "kWh" radio button
3. User enters energy amount in kWh (positive number, 2 decimal places)
4. System shows equivalent COP based on current price
5. User clicks "Generar PIN y recargar"
6. Frontend sends POST `/api/recharge` with:
   ```json
   {
     "kwh": 10.5,
     "card_number": "14416394063"
   }
   ```
7. System validates:
   - User authenticated
   - Card belongs to user
   - kWh > 0 and finite
   - Account status is `Activo`
8. System begins transaction with row lock
9. System fetches current kWh price
10. System calculates amount = kWh × price (rounded to nearest integer)
11. System updates energy card:
    - `current_balance += amount`
    - `current_kwh += kWh`
12. System generates PIN (same as UC-005)
13. System inserts `recharge_pins` record with calculated amount and provided kWh
14. System commits transaction
15. System logs security event
16. System returns PIN and updated balances
17. Frontend displays success

#### Alternative Flows

**10a. Price Not Found**
- kWh price not configured → return 500 "Price not configured"

**10b. Price Invalid**
- Price ≤ 0 → return 500 "Invalid price configuration"

**11a. Balance Exceeds Limit**
- If DECIMAL(10,2) max (99999999.99) would be exceeded → return error

#### Special Requirements

- kWh stored with 2 decimal precision
- Amount calculated as integer (rounded)
- Same transaction integrity as UC-005

---

### UC-007: Recharge by PIN Code

**ID**: UC-007  
**Name**: Recharge by PIN Code  
**Primary Actor**: Authenticated User (Activo status)  
**Secondary Actors**: System (PIN validation, transaction)  
**Preconditions**: User has valid, unused PIN code; account status is `Activo`  
**Postconditions**: Card balance increased; PIN marked as used (implicitly by not checking usage)

#### Main Flow

1. User on dashboard selects "PIN" radio button
2. User enters 20-digit PIN code
3. User clicks "Generar PIN y recargar" (misnomer - should be "Recargar")
4. Frontend sends POST `/api/recharge` with:
   ```json
   {
     "pin_code": "12345678901234567890",
     "card_number": "14416394063"
   }
   ```
5. System validates:
   - User authenticated
   - Card belongs to user
   - PIN format (20 digits)
   - Account status is `Activo`
6. System looks up PIN in `recharge_pins`:
   - WHERE `pin_code` = provided PIN
   - AND `user_id` = current user (PIN must belong to user)
7. If PIN found:
   8. System retrieves stored `amount` and `kwh` from PIN record
   9. System begins transaction with row lock on card
   10. System updates energy card balances
   11. System commits transaction
   12. System logs security event: "PIN recharge successful"
   13. System returns updated balances (PIN itself is returned for display)
8. Frontend shows success, updates balance, adds to history

#### Alternative Flows

**6a. PIN Not Found**
- No record with that PIN → return 400 "Invalid PIN code"

**6b. PIN Belongs to Different User**
- PIN found but user_id mismatch → return 400 "Invalid PIN code" (do not reveal ownership)

**8a. PIN Already Used**
- Current implementation does not track usage; PINs are records in table
- Future: Add `used` flag to prevent reuse

#### Special Requirements

- PIN validation must be constant-time to avoid timing attacks (not currently implemented)
- PIN lookup uses index on pin_code for performance
- No explicit "mark as used" - PIN record remains but can only be used once if enforced

#### Extensions

- Future: Add `used` flag to recharge_pins to prevent multiple redemptions
- Future: Support PINs from third-party sellers (not tied to user_id)
- Future: PIN expiration policy

---

### UC-008: View Recharge History

**ID**: UC-008  
**Name**: View Recharge History  
**Primary Actor**: Authenticated User  
**Secondary Actors**: System  
**Preconditions**: User has valid session  
**Postconditions**: Recharge history displayed

#### Main Flow

1. User views dashboard (see UC-004)
2. System includes `recharge_history` in dashboard response
3. For regular users: history filtered to their own recharges
4. For admins: history includes all users' recharges
5. Frontend displays table with columns:
   - Date/Time
   - PIN code
   - Card/Medidor name
   - (Admin only) User ID
   - (Admin only) User email
   - Amount (COP)
   - kWh
   - Price per kWh at time of recharge

#### Alternative Flows

**No History**
- User has no recharges → show "Sin recargas todavía" message

#### Special Requirements

- History sorted by date descending (most recent first)
- Admin view shows additional columns
- kWh price displayed is the price locked at recharge time (from `kwh_price_at_time`)
- If `kwh_price_at_time` is NULL (old records), calculate from amount/kwh

#### Extensions

- Future: Pagination or infinite scroll for long histories
- Future: Filter by date range, card, amount range
- Future: Export to CSV/PDF

---

### UC-009: View Profile

**ID**: UC-009  
**Name**: View Profile  
**Primary Actor**: Authenticated User  
**Secondary Actors**: System  
**Preconditions**: User has valid session  
**Postconditions**: Profile data displayed

#### Main Flow

1. User navigates to Profile page (`/me`)
2. Frontend sends GET `/api/user/profile`
3. System retrieves:
   - User basic info (username, email, role, status)
   - User profile (names, document, address, phone)
   - `personal_data_filled` flag
   - Linked energy cards
4. System returns 200 with profile data
5. Frontend displays:
   - Personal information (read-only or editable)
   - Energy cards list
   - Option to edit profile
   - Option to change password

#### Alternative Flows

**No Profile Yet**
- User profile not created (should not happen - created at registration) → create empty profile

#### Special Requirements

- Profile completion flag drives UI prompts for regular users
- Document and phone are masked/partially hidden? (consider privacy)

#### Extensions

- Future: Show profile update history
- Future: Allow profile picture upload

---

### UC-010: Update Profile

**ID**: UC-010  
**Name**: Update Profile  
**Primary Actor**: Authenticated User  
**Secondary Actors**: System (validation, database)  
**Preconditions**: User has valid session  
**Postconditions**: Profile updated; completion flag set if required fields filled

#### Main Flow

1. User clicks "Edit" on profile page
2. User modifies fields:
   - primer_nombre
   - segundo_nombre (optional)
   - primer_apellido
   - segundo_apellido (optional)
   - tipo_identificacion (dropdown: CC, CE, etc.)
   - numero_identificacion
   - direccion (optional)
   - telefono
3. User saves changes
4. Frontend sends PUT `/api/user/profile` with profile data
5. System validates:
   - All required fields present
   - `numero_identificacion` unique across users (excluding current user)
   - `telefono` unique across users (excluding current user)
6. System updates `user_profiles` record (upsert)
7. System checks if required fields are now filled:
   - primer_nombre, primer_apellido, tipo_identificacion, numero_identificacion all non-empty
8. If all required fields present:
   - System sets `user_flags.personal_data_filled = 1`
   - System sets `user_flags.filled_at = NOW()` (if not already set)
9. If document changed (tipo_identificacion or numero_identificacion):
   - System inserts record into `user_document_changes` with old and new values
10. System returns 200 "Profile updated"
11. Frontend shows success, updates UI, closes edit mode

#### Alternative Flows

**5a. Duplicate Document**
- Another user has same tipo_identificacion + numero_identificacion → return 400 "Document number already registered"

**5b. Duplicate Phone**
- Another user has same telefono → return 400 "Phone already registered"

**9a. Document Change Restriction**
- Business rule: document can only be changed once
- If user already has entry in `user_document_changes` → return 403 "Document can only be changed once"

#### Special Requirements

- Document change is logged for audit
- Profile completion flag drives dashboard access (regular users)
- Unique constraints enforced at database level

#### Extensions

- Future: Require admin approval for document changes
- Future: Allow document change only with supporting documents

---

### UC-011: Change Password

**ID**: UC-011  
**Name**: Change Password  
**Primary Actor**: Authenticated User  
**Secondary Actors**: System (bcrypt, database)  
**Preconditions**: User knows current password  
**Postconditions**: Password updated; `password_changed_at` set

#### Main Flow

1. User navigates to Security settings (`/me/seguridad`)
2. User enters:
   - Current password
   - New password
   - Confirm new password
3. User submits
4. Frontend sends POST `/api/user/password-change` with:
   ```json
   {
     "current_password": "oldPass123",
     "new_password": "newPass456!"
   }
   ```
5. System validates:
   - User authenticated
   - Current password matches hash (bcrypt.compare)
   - New password meets policy (12+ chars, 3/4 classes, no spaces, no username/email)
6. System hashes new password with bcrypt (cost 10)
7. System updates `users.password_hash` and `password_changed_at = NOW()`
8. System logs security event: "Password changed successfully"
9. System returns 200 "Password updated"
10. Frontend shows success message

#### Alternative Flows

**5a. Current Password Incorrect**
- Return 400 "Current password is incorrect"

**5b. New Password Fails Policy**
- Return 400 with policy violation details (e.g., "Must include at least 3 of: uppercase, lowercase, digits, symbols")

**7a. Update Fails**
- Database error → return 500

#### Special Requirements

- Current password verification required (prevents session hijack without password)
- Password policy enforced server-side
- Password hash never exposed in responses
- Security event logged

#### Extensions

- Future: Force password change on next login (admin flag)
- Future: Prevent reuse of last N passwords
- Future: Password expiration (e.g., every 90 days)

---

### UC-012: Add Energy Card

**ID**: UC-012  
**Name**: Add Energy Card  
**Primary Actor**: Regular User  
**Secondary Actors**: System  
**Preconditions**: User has valid session; card serial is available (not linked)  
**Postconditions**: Energy card created and linked to user

#### Main Flow

1. User on dashboard or profile clicks "Add Meter"
2. User enters card serial number (11+ digits)
3. User optionally enters card name (display label)
4. User confirms
5. Frontend sends POST `/api/meters` with:
   ```json
   {
     "card_number": "14416394063",
     "name": "Medidor Principal"
   }
   ```
6. System validates:
   - User authenticated
   - Card serial format (11+ digits)
7. System checks if card exists:
   - If exists and `user_id IS NULL` (released): claim it (update user_id, clear released flags)
   - If exists and `user_id IS NOT NULL` (active): return error "Card already in use"
   - If does not exist: create new card with user_id, card_number, name
8. System returns 200 with created card data
9. Frontend adds card to list, selects it

#### Alternative Flows

**7a. Card Already in Use**
- Return 400 "Card already linked to another user. Contact support."

**7b. Card Serial Invalid**
- Return 400 "Invalid card serial format"

#### Special Requirements

- Card serial uniqueness enforced at database level
- Claiming released cards is atomic
- User can have multiple cards

#### Extensions

- Future: QR code scanning for card serial
- Future: Bulk card import for users with multiple meters

---

### UC-013: Rename Energy Card

**ID**: UC-013  
**Name**: Rename Energy Card  
**Primary Actor**: Regular User  
**Secondary Actors**: System  
**Preconditions**: User owns the energy card  
**Postconditions**: Card name updated

#### Main Flow

1. User clicks "Edit" or rename icon on card
2. User enters new name (or clears to default to card number)
3. User confirms
4. Frontend sends PUT `/api/meters/{card_number}/name` with:
   ```json
   {
     "name": "Casa Principal"
   }
   ```
5. System validates:
   - User authenticated
   - Card belongs to user
6. System updates `energy_cards.name` where `user_id` and `card_number` match
7. System returns 200 with updated card
8. Frontend updates display

#### Alternative Flows

**5a. Card Not Found or Not Owned**
- Return 404 or 403

#### Special Requirements

- Name is optional (can be NULL)
- Name is for display only, not used in transactions

---

### UC-014: Release Energy Card

**ID**: UC-014  
**Name**: Release Energy Card  
**Primary Actor**: Regular User  
**Secondary Actors**: System  
**Preconditions**: User owns the energy card  
**Postconditions**: Card unlinked from user; marked as released

#### Main Flow

1. User clicks "Release" or "Unlink" on card
2. System shows confirmation dialog ("Are you sure?")
3. User confirms
4. Frontend sends DELETE `/api/meters/{card_number}`
5. System validates:
   - User authenticated
   - Card belongs to user
6. System updates `energy_cards`:
   - `user_id = NULL`
   - `released = 1`
   - `released_by_user_id = current user ID`
   - `released_at = NOW()`
7. System returns 200
8. Frontend removes card from user's list

#### Alternative Flows

**6a. Card Not Found**
- Return 404

#### Special Requirements

- Released cards can be claimed by new users during registration
- Release is irreversible by user (admin can transfer)
- `released_by_user_id` tracks who released it (for audit)

#### Extensions

- Future: Allow user to specify reason for release
- Future: Temporary release with auto-return after period

---

### UC-015: Pause Account

**ID**: UC-015  
**Name**: Pause Account  
**Primary Actor**: Regular User  
**Secondary Actors**: System  
**Preconditions**: User account is active  
**Postconditions**: Account status changed to `Pausa`

#### Main Flow

1. User navigates to Settings or Account Status section
2. User clicks "Pause Account"
3. System shows confirmation: "Pausing will prevent recharges. Continue?"
4. User confirms
5. Frontend sends POST `/api/user/status` with:
   ```json
   { "status": "Pausa" }
   ```
6. System validates:
   - User authenticated
   - Status "Pausa" is valid
7. System updates `users.status_id` to status ID for "Pausa"
8. System logs security event: "Account paused by user"
9. System returns 200
10. Frontend shows success, updates status indicator
11. Recharge form becomes disabled

#### Alternative Flows

**7a. Invalid Status**
- Return 400 "Invalid status"

#### Special Requirements

- Paused accounts can still log in and view data
- Paused accounts cannot recharge
- User can unpause themselves (see UC-016)

#### Extensions

- Future: Auto-pause after extended inactivity
- Future: Scheduled pause/unpause

---

### UC-016: Reactivate Account

**ID**: UC-016  
**Name**: Reactivate Account  
**Primary Actor**: Regular User (paused)  
**Secondary Actors**: System  
**Preconditions**: User account status is `Pausa`  
**Postconditions**: Account status changed back to `Activo`

#### Main Flow

1. Paused user attempts to access dashboard or sees status banner
2. User clicks "Reactivate Account" or navigates to `/reactivar`
3. System prompts for password confirmation
4. User enters current password
5. User confirms
6. Frontend sends POST `/api/user/status` with:
   ```json
   { "status": "Activo" }
   ```
7. System validates:
   - User authenticated
   - Current password correct (optional but recommended)
   - Status "Activo" is valid
8. System updates status to `Activo`
9. System logs security event: "Account reactivated by user"
10. System returns 200
11. Frontend redirects to dashboard, recharging enabled

#### Alternative Flows

**4a. Password Incorrect**
- Return 403 "Incorrect password"

#### Special Requirements

- Paused users can self-reactivate (unlike suspended users)
- Password confirmation adds security

---

### UC-017: Admin View All Users

**ID**: UC-017  
**Name**: Admin View All Users  
**Primary Actor**: Admin  
**Secondary Actors**: System  
**Preconditions**: User has admin role; valid session  
**Postconditions**: List of all regular users displayed

#### Main Flow

1. Admin navigates to "Users" page (`/admin/users`)
2. Frontend sends GET `/api/admin/users`
3. System verifies admin role (requireAdmin middleware)
4. System calls stored procedure `sp_admin_list_users`
5. System retrieves all users with role='user' including:
   - id, username, email, created_at, last_login, role name, status name
6. System returns 200 with user list
7. Frontend displays table with search/filter options

#### Alternative Flows

**3a. Not Admin**
- Return 403 "Solo administradores"

#### Special Requirements

- Only admin users visible (not other admins or auditors)
- Sorted by creation date descending
- Search by username/email (frontend filtering)

#### Extensions

- Future: Pagination
- Future: Export to CSV

---

### UC-018: Admin View User Detail

**ID**: UC-018  
**Name**: Admin View User Detail  
**Primary Actor**: Admin  
**Secondary Actors**: System  
**Preconditions**: Admin has valid session; user ID exists  
**Postconditions**: Detailed user information displayed

#### Main Flow

1. Admin clicks on a user in the users list
2. Frontend navigates to `/admin/users/{userId}`
3. Frontend sends GET `/api/admin/users/{userId}`
4. System verifies admin role
5. System retrieves:
   - User basic info (id, username, email, created_at, last_login, role, status)
   - User profile (full personal data)
   - All energy cards linked to user (with balances)
   - Security logs for that user (filtered by username)
6. System returns 200 with complete user detail
7. Frontend displays:
   - Profile section
   - Meters section (with option to release/unlink)
   - Activity logs section
   - Actions: update email, change status, suspend, send reset

#### Alternative Flows

**5a. User Not Found**
- Return 404

#### Special Requirements

- Admin sees full profile data (including sensitive PII)
- Admin sees all user's meters and balances
- Admin sees user's security logs

---

### UC-019: Admin View User Logs

**ID**: UC-019  
**Name**: Admin View User Logs  
**Primary Actor**: Admin  
**Secondary Actors**: System  
**Preconditions**: Admin has valid session; user ID exists  
**Postconditions**: Security logs for user displayed

#### Main Flow

1. Admin on user detail page clicks "View Logs" tab
2. Frontend sends GET `/api/admin/users/{userId}/logs`
3. System verifies admin role
4. System retrieves user's username
5. System queries `security_logs` filtered by username (latest 200)
6. System returns log entries: event_type, event_time, ip_address, details
7. Frontend displays chronological log table

#### Alternative Flows

**4a. User Has No Logs**
- Return empty array → show "No logs available"

#### Special Requirements

- Logs limited to 200 most recent
- Sorted by event_time descending

---

### UC-020: Admin Update User Email

**ID**: UC-020  
**Name**: Admin Update User Email  
**Primary Actor**: Admin  
**Secondary Actors**: System  
**Preconditions**: Admin has valid session; user exists; new email is unique  
**Postconditions**: User's email updated

#### Main Flow

1. Admin on user detail page clicks "Edit Email"
2. Admin enters new email address
3. Admin confirms
4. Frontend sends PATCH `/api/admin/users/{userId}/email` with:
   ```json
   { "email": "newemail@example.com" }
   ```
5. System validates:
   - Admin role
   - Email format valid
   - Email not used by another user
6. System updates `users.email` where `id = userId`
7. System logs security event: "Admin updated user email" with admin username, target user, old/new email
8. System returns 200 "Email updated"
9. Frontend shows success, updates display

#### Alternative Flows

**5a. Email Already in Use**
- Return 400 "Email already exists"

#### Special Requirements

- Email change logged for audit
- No notification email sent (could be added)

---

### UC-021: Admin Send Password Reset

**ID**: UC-021  
**Name**: Admin Send Password Reset  
**Primary Actor**: Admin  
**Secondary Actors**: System (token generation, email service - mock)  
**Preconditions**: Admin has valid session; user exists  
**Postconditions**: Password reset token generated and stored

#### Main Flow

1. Admin on user detail page clicks "Send Password Reset"
2. System shows confirmation: "Send reset link to user's email?"
3. Admin confirms
4. Frontend sends POST `/api/admin/users/{userId}/send-reset`
5. System verifies admin role
6. System generates secure random token (32 bytes, hex-encoded)
7. System hashes token (SHA-256)
8. System stores token hash in `password_resets`:
   - user_id, token_hash, expires_at = NOW() + 1 hour
   - Invalidate any existing tokens for this user (set used_at)
9. System logs security event: "Password reset requested by admin"
10. System returns 200 "Reset link sent"
11. Frontend shows success message

#### Alternative Flows

**6a. Token Generation Fails**
- Return 500

#### Special Requirements

- Token is hashed before storage (one-way)
- Token expires in 1 hour
- Single-use (marked used upon successful reset)
- **NOTE**: Email sending is NOT implemented (mock). Token is returned in response for testing.

#### Extensions

- Future: Integrate actual email service (SMTP or API)
- Future: Reset page where user enters token and new password
- Future: Token single-use enforcement

---

### UC-022: Admin Link Meter to User

**ID**: UC-022  
**Name**: Admin Link Meter to User  
**Primary Actor**: Admin  
**Secondary Actors**: System  
**Preconditions**: Admin has valid session; card exists and is released (unlinked)  
**Postconditions**: Energy card linked to specified user

#### Main Flow

1. Admin on user detail page clicks "Link Meter"
2. Admin enters card serial number
3. Admin confirms
4. Frontend sends POST `/api/admin/users/{userId}/link` with:
   ```json
   { "card_number": "14416394063" }
   ```
5. System validates:
   - Admin role
   - Card exists
   - Card is released (user_id IS NULL)
6. System updates `energy_cards`:
   - `user_id = userId`
   - `released = 0`
   - `released_by_user_id = NULL`
   - `released_at = NULL`
7. System logs security event: "Admin linked card to user"
8. System returns 200 "Meter linked"
9. Frontend shows success, refreshes user detail

#### Alternative Flows

**5a. Card Not Found**
- Return 404 "Card not found"

**5b. Card Already Linked**
- Return 400 "Card already in use"

#### Special Requirements

- Only released cards can be linked
- Admin can link cards to any user (not just themselves)
- Transfer of ownership is logged implicitly (released_by_user_id cleared)

---

### UC-023: Admin Unlink Meter from User

**ID**: UC-023  
**Name**: Admin Unlink Meter from User  
**Primary Actor**: Admin  
**Secondary Actors**: System  
**Preconditions**: Admin has valid session; card exists and is linked to specified user  
**Postconditions**: Energy card unlinked from user; marked as released

#### Main Flow

1. Admin on user detail page clicks "Remove" or "Unlink" next to a meter
2. System shows confirmation: "Remove this meter from user?"
3. Admin confirms
4. Frontend sends DELETE `/api/admin/users/{userId}/{card_number}`
5. System validates:
   - Admin role
   - Card exists and belongs to user
6. System updates `energy_cards`:
   - `user_id = NULL`
   - `released = 1`
   - `released_by_user_id = admin's user ID`
   - `released_at = NOW()`
7. System logs security event: "Admin released card from user"
8. System returns 200 "Meter removed"
9. Frontend removes card from user's meter list

#### Alternative Flows

**5a. Card Not Found or Not Owned by User**
- Return 404

#### Special Requirements

- Admin's ID recorded as releaser for audit
- Released card can be claimed by another user

---

### UC-024: Admin Suspend User

**ID**: UC-024  
**Name**: Admin Suspend User  
**Primary Actor**: Admin  
**Secondary Actors**: System  
**Preconditions**: Admin has valid session; user exists and is currently active  
**Postconditions**: User status changed to `Suspendido`

#### Main Flow

1. Admin on user detail page clicks "Suspend User"
2. System shows confirmation: "Suspend this user? They will be unable to log in."
3. Admin confirms
4. Frontend sends POST `/api/admin/users/{userId}/suspend`
5. System verifies admin role
6. System updates `users.status_id` to `Suspendido`
7. System logs security event: "User suspended by admin" with admin and target usernames
8. System returns 200 "User suspended"
9. Frontend shows success, updates status display

#### Alternative Flows

**6a. User Already Suspended/Disabled**
- Return 400 "User already in that status"

#### Special Requirements

- Suspended users cannot log in
- Suspended users' data remains intact
- Suspension is reversible (unsuspend)

---

### UC-025: Admin Reactivate User

**ID**: UC-025  
**Name**: Admin Reactivate User  
**Primary Actor**: Admin  
**Secondary Actors**: System  
**Preconditions**: Admin has valid session; user is suspended  
**Postconditions**: User status changed to `Activo`

#### Main Flow

1. Admin on user detail page clicks "Unsuspend" or "Reactivate"
2. System shows confirmation
3. Admin confirms
4. Frontend sends POST `/api/admin/users/{userId}/unsuspend`
5. System verifies admin role
6. System updates status to `Activo`
7. System logs: "User unsuspended by admin"
8. System returns 200 "User unsuspended"
9. Frontend updates status

#### Alternative Flows

**User is Paused**
- Admin can also set status to `Activo` to unpause (same endpoint)

#### Special Requirements

- Unsuspend restores full access
- Logged for audit

---

### UC-026: Admin Update kWh Price

**ID**: UC-026  
**Name**: Admin Update kWh Price  
**Primary Actor**: Admin  
**Secondary Actors**: System  
**Preconditions**: Admin has valid session; new price is positive number  
**Postconditions**: kWh price updated; history logged

#### Main Flow

1. Admin on dashboard clicks "Update Cost per kWh" chip
2. Dialog opens showing current price
3. Admin enters new price (COP per kWh)
4. Admin clicks "Save"
5. Frontend sends POST `/api/admin/kwh-price` with:
   ```json
   { "price": 950.50 }
   ```
6. System validates:
   - Admin role
   - Price > 0
7. System calls stored procedure `sp_set_kwh_price`:
   - Inserts into `kwh_price_history` (admin_user_id, price_cop)
   - Upserts into `settings` (key='kwh_price', value=price)
8. System logs: "kWh price updated by admin"
9. System returns 200 with new price
10. Frontend closes dialog, updates price display on dashboard

#### Alternative Flows

**6a. Invalid Price**
- Return 400 "Price must be positive"

**7a. Database Error**
- Return 500

#### Special Requirements

- Price change is immediate and affects all subsequent recharges
- Historical recharges retain their original `kwh_price_at_time`
- Price history is immutable (only inserts, never updates/deletes)

#### Extensions

- Future: Schedule price changes (effective future date)
- Future: Price change approval workflow

---

### UC-027: Admin View All Recharge History

**ID**: UC-027  
**Name**: Admin View All Recharge History  
**Primary Actor**: Admin  
**Secondary Actors**: System  
**Preconditions**: Admin has valid session  
**Postconditions**: All recharges across all users displayed

#### Main Flow

1. Admin on dashboard views "Recent Movements" table
2. System (in UC-004) already fetched all recharges for admin role
3. Table shows for each recharge:
   - Date
   - PIN code
   - Card/Medidor name
   - User ID
   - User email
   - Amount (COP)
   - kWh
   - Price per kWh at time

#### Alternative Flows

**No Recharges Yet**
- Show "No recharges" message

#### Special Requirements

- Admin sees all users' recharges (not just own)
- Includes user email and ID columns
- Shows historical kWh price

---

### UC-028: Auditor View All Admins

**ID**: UC-028  
**Name**: Auditor View All Admins  
**Primary Actor**: Auditor  
**Secondary Actors**: System  
**Preconditions**: Auditor has valid session  
**Postconditions**: List of all admin users displayed

#### Main Flow

1. Auditor navigates to "Admins" section (or uses audit metrics)
2. Frontend sends GET `/api/audit/admins`
3. System verifies auditor role (requireAudit middleware)
4. System calls stored procedure `sp_audit_list_admins`
5. System retrieves all users with role='admin'
6. System returns 200 with admin list
7. Frontend displays table: username, email, role, status, created_at, last_login

#### Alternative Flows

**3a. Not Auditor**
- Return 403 "Solo auditoría"

#### Special Requirements

- Only admins listed (not regular users or other auditors)
- Sorted by creation date descending

---

### UC-029: Auditor View Admin Profile

**ID**: UC-029  
**Name**: Auditor View Admin Profile  
**Primary Actor**: Auditor  
**Secondary Actors**: System  
**Preconditions**: Auditor has valid session; admin user ID exists  
**Postconditions**: Admin profile details displayed

#### Main Flow

1. Auditor clicks on an admin in the admins list
2. Frontend navigates to `/audit/admins/{id}`
3. Frontend sends GET `/api/audit/admins/{id}/profile`
4. System verifies auditor role
5. System retrieves admin's profile (same as user profile endpoint)
6. System returns profile data
7. Frontend displays admin's personal information

#### Alternative Flows

**5a. User Not Found or Not Admin**
- Return 404

#### Special Requirements

- Auditor can view but not edit admin profile through this flow (editing via separate endpoint)

---

### UC-030: Auditor Update Admin Status

**ID**: UC-030  
**Name**: Auditor Update Admin Status  
**Primary Actor**: Auditor  
**Secondary Actors**: System  
**Preconditions**: Auditor has valid session; admin user exists; valid status  
**Postconditions**: Admin's status updated

#### Main Flow

1. Auditor on admin profile page selects new status (Activo or Deshabilitado)
2. Auditor confirms change
3. Frontend sends PATCH `/api/audit/admins/{id}/status` with:
   ```json
   { "status": "Deshabilitado" }
   ```
4. System verifies auditor role
5. System validates status is allowed (Activo, Deshabilitado)
6. System updates user's status
7. System logs: "Admin status changed by auditor"
8. System returns 200
9. Frontend shows success

#### Alternative Flows

**5a. Invalid Status**
- Return 400

**Target User is Regular User**
- Should not happen if UI only shows admins, but system may check role → return 403

#### Special Requirements

- Auditors can only update admin/auditor statuses (not regular users through this endpoint)
- Status change is logged

---

### UC-031: Auditor View All Employees

**ID**: UC-031  
**Name**: Auditor View All Employees  
**Primary Actor**: Auditor  
**Secondary Actors**: System  
**Preconditions**: Auditor has valid session  
**Postconditions**: List of all admin and auditor users displayed

#### Main Flow

1. Auditor navigates to "Employees" page
2. Frontend sends GET `/api/audit/employees`
3. System verifies auditor role
4. System calls `sp_audit_list_employees` (role IN ('admin','audit'))
5. System returns list of employees
6. Frontend displays table

#### Special Requirements

- Shows both admins and auditors
- Used for oversight of employee accounts

---

### UC-032: Auditor Generate Employee Code

**ID**: UC-032  
**Name**: Auditor Generate Employee Code  
**Primary Actor**: Auditor  
**Secondary Actors**: System  
**Preconditions**: Auditor has valid session; role is 'admin' or 'audit'  
**Postconditions**: New one-time employee code generated

#### Main Flow

1. Auditor navigates to "Employee Codes" section
2. Auditor clicks "Generate Code"
3. Auditor selects role: admin or audit
4. Auditor confirms
5. Frontend sends POST `/api/audit/employee-codes` with:
   ```json
   { "role": "admin" }
   ```
6. System verifies auditor role
7. System validates role is admin or audit
8. System generates random 8-character code (excluding ambiguous characters)
9. System formats: `ADMIN-XXXXXXXX` or `AUDIT-XXXXXXXX`
10. System gets role_id from database
11. System inserts into `employee_codes`:
    - `code`, `role_id`, `used = 0`
12. System returns 201 with:
    ```json
    { "id": 123, "code": "ADMIN-ABC12345", "role": "admin" }
    ```
13. Frontend displays new code with copy button
14. Auditor distributes code to new employee

#### Alternative Flows

**7a. Code Collision (extremely unlikely)**
- UNIQUE constraint on code → retry generation

#### Special Requirements

- Code is one-time use only
- Code format is human-readable with role prefix
- Characters chosen to avoid confusion (no I, O, 0, 1, etc.)
- Code must be presented to registration form (UC-001 with employee_code)

#### Extensions

- Future: Set expiration date on codes
- Future: Limit number of active codes per auditor
- Future: Revoke unused codes

---

### UC-033: Auditor View Employee Codes

**ID**: UC-033  
**Name**: Auditor View Employee Codes  
**Primary Actor**: Auditor  
**Secondary Actors**: System  
**Preconditions**: Auditor has valid session  
**Postconditions**: List of all employee codes displayed with usage status

#### Main Flow

1. Auditor navigates to "Employee Codes" list
2. Frontend sends GET `/api/audit/employee-codes`
3. System verifies auditor role
4. System retrieves all employee codes with joins to:
   - roles (role name)
   - employee_code_usages (usage info)
   - users (who used the code)
5. System returns codes with:
   - id, code, used (boolean), created_at, used_at, role, used_by_username
6. Frontend displays table with color coding (used/unused)

#### Special Requirements

- Shows full audit trail of code usage
- Used codes show which user consumed them and when

---

### UC-034: Auditor View Sales Metrics

**ID**: UC-034  
**Name**: Auditor View Sales Metrics  
**Primary Actor**: Auditor  
**Secondary Actors**: System  
**Preconditions**: Auditor has valid session  
**Postconditions**: Sales totals and daily breakdown displayed

#### Main Flow

1. Auditor navigates to "Metrics" or "Dashboard" section
2. Frontend sends GET `/api/audit/metrics/series?days=30`
3. System verifies auditor role
4. System calls stored procedure `sp_audit_metrics_series` with days parameter (default 30)
5. Procedure returns two result sets:
   - Totals: total pins (recharges), total_amount, total_kwh
   - By day: DATE(created_at), COUNT, SUM(amount), SUM(kwh) grouped by day
6. System aggregates into structured response
7. System returns 200 with:
   ```json
   {
     "totals": { "codes_sold": 1500, "amount_cop": 125000000, "kwh": 145000 },
     "by_day": [
       { "day": "2026-03-01", "codes_sold": 50, "amount_cop": 4500000, "kwh": 5225 },
       ...
     ]
   }
   ```
8. Frontend displays:
   - Summary chips (total codes, total kWh, total amount)
   - Table or chart of daily breakdown

#### Alternative Flows

**No Data**
- Empty results → show "No data available"

#### Special Requirements

- Metrics calculated from `recharge_pins` table
- All recharges included (not filtered by user)
- Date range configurable (default 30 days)
- Amounts formatted as currency (COP)

#### Extensions

- Future: Filter by date range picker
- Future: Export metrics to CSV/PDF
- Future: Graphical chart visualization

---

### UC-035: Auditor View kWh Price History

**ID**: UC-035  
**Name**: Auditor View kWh Price History  
**Primary Actor**: Auditor  
**Secondary Actors**: System  
**Preconditions**: Auditor has valid session  
**Postconditions**: Complete history of price changes displayed

#### Main Flow

1. Auditor navigates to "Price History" tab
2. Frontend sends GET `/api/audit/kwh-price-history`
3. System verifies auditor role
4. System retrieves from `kwh_price_history` joined with `users` (for admin username)
5. System orders by `created_at DESC`
6. System returns list of entries:
   - id, admin_user_id, admin_username, price_cop, created_at
7. Frontend displays table with all historical price changes

#### Special Requirements

- Immutable audit trail of all pricing decisions
- Shows which admin made each change
- Sorted newest first

---

### UC-036: Auditor View Security Logs

**ID**: UC-036  
**Name**: Auditor View Security Logs  
**Primary Actor**: Auditor  
**Secondary Actors**: System  
**Preconditions**: Auditor has valid session  
**Postconditions**: Security event logs displayed

#### Main Flow

1. Auditor navigates to "Security Logs" section
2. Frontend sends GET `/api/audit/security-logs` (optionally with limit)
3. System verifies auditor role
4. System retrieves latest 200 entries from `security_logs` (ordered by event_time DESC)
5. System returns logs: event_type, username, event_time, ip_address, details
6. Frontend displays table with filtering options

#### Alternative Flows

**Auditor Wants Specific User's Logs**
- Auditor can also call GET `/api/audit/security-logs/user/{userId}`
- System filters logs by username associated with user_id

#### Special Requirements

- Logs are read-only
- IP addresses preserved for forensic analysis
- Event types include: login, logout, register, recharge, password_reset, etc.
- Details field may contain JSON with additional context

#### Extensions

- Future: Full-text search in details
- Future: Export logs for external analysis
- Future: Alert rules (e.g., multiple failed logins from same IP)

---

## 5. Use Case Relationships

### 5.1 Includes Relationships

- **UC-004 (View Dashboard)** includes:
  - Retrieval of user profile (implicit)
  - Retrieval of energy cards
  - Retrieval of recharge history
  - (For admin) Retrieval of all recharges
  - (For auditor) Retrieval of metrics and logs

- **UC-005/006/007 (Recharge)** all include:
  - Card ownership validation
  - Account status check
  - Transaction with row locking
  - PIN generation (except PIN recharge uses existing PIN)
  - Security event logging

- **UC-010 (Update Profile)** includes:
  - Document change logging (if document fields changed)
  - Profile completion flag update

### 5.2 Extends Relationships

- **UC-002 (Login)** extends to:
  - Pause verification flow (if status = Pausa, redirect to `/reactivar`)
  - MFA flow (future)

- **UC-004 (Dashboard)** extends to:
  - Profile completion prompt (for regular users with incomplete profile)
  - Admin controls (price update dialog)
  - Auditor metrics display

### 5.3 Generalization/Specialization

- **Recharge** use cases (UC-005, UC-006, UC-007) are specializations of a general "Recharge" operation with different input modes.
- **Admin User Management** (UC-017 through UC-026) are specialized for admin role.
- **Auditor Monitoring** (UC-028 through UC-036) are specialized for auditor role.

---

## 6. Business Rules Cross-Reference

Each use case references specific business rules defined in `BUSINESS_RULES.md`:

| Use Case | Related Business Rules |
|----------|----------------------|
| UC-001 | BR-001, BR-002, BR-003, BR-004, BR-005, BR-006, BR-007, BR-008, BR-009, BR-010, BR-011 |
| UC-002 | BR-001, BR-002, BR-003, BR-004, BR-011, BR-012 |
| UC-003 | BR-012 |
| UC-004 | BR-001, BR-002, BR-003, BR-013, BR-014, BR-015 |
| UC-005/006/007 | BR-002, BR-003, BR-013, BR-014, BR-016, BR-017, BR-018, BR-019, BR-020 |
| UC-008 | BR-013, BR-014, BR-021 |
| UC-009/010 | BR-001, BR-002, BR-022, BR-023, BR-024, BR-025 |
| UC-011 | BR-005, BR-026 |
| UC-012/013/014 | BR-002, BR-013, BR-027, BR-028, BR-029 |
| UC-015/016 | BR-002, BR-030, BR-031, BR-032 |
| UC-017 through UC-027 | BR-002, BR-003, BR-033, BR-034, BR-035, BR-036, BR-037, BR-038 |
| UC-028 through UC-036 | BR-002, BR-003, BR-039, BR-040, BR-041, BR-042, BR-043 |

*(Note: BR-XXX references correspond to numbered rules in BUSINESS_RULES.md)*

---

## 7. Non-Functional Requirements per Use Case

### Performance
- Dashboard load: < 2 seconds
- Recharge transaction: < 1 second (including PIN generation)
- Login: < 1 second

### Security
- All state-changing operations require authentication
- Passwords never logged or returned in responses
- PIN generation uses cryptographic HMAC
- SQL injection prevented via parameterized queries
- Session hijacking mitigated with httpOnly cookies

### Reliability
- Transactions ensure atomicity
- Row-level locking prevents race conditions
- Duplicate handling with proper error messages

### Usability
- Clear error messages in Spanish
- Real-time validation on forms
- Optimistic UI updates where appropriate
- Role-based UI adaptation

---

*Document version: 1.0*  
*Last updated: 2026-04-17*
