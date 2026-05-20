# SRS_REVIEW_CONTEXT

This SRS context is intended to help an LLM review:
- Bugs
- Missing requirements
- Compliance failures
- Test coverage gaps
- Implementation mismatches
- Security violations
- Data handling errors

---

# 1. Purpose

## 1.1 System Purpose

The system exists to provide an energy management system that allows users to manage their energy consumption through prepaid meters. The system supports three user roles (Regular User, Admin, Auditor) and provides functionality for user registration, authentication, energy card management, recharge operations with secure PIN generation using the STS-20 algorithm, profile management, account status management, administrative user management, and comprehensive auditing capabilities.

## 1.2 Review Purpose

This SRS document provides a complete specification of the EnergoMobile system for review purposes including bug detection, compliance checking against documented requirements, test coverage gap identification, and implementation alignment verification.

---

# 2. Scope

## 2.1 In Scope

| ID     | In-Scope Item |
| ------ | ------------- |
| SC-001 | Mobile application (React Native/Expo) for energy meter management |
| SC-002 | Web application (React/Material-UI) providing same functionality as mobile |
| SC-003 | Backend REST API (Node.js/Express) for business logic processing |
| SC-004 | MySQL database with stored procedures for data persistence |
| SC-005 | User authentication and session-based authorization |
| SC-006 | Energy card (meter) CRUD operations with balance tracking |
| SC-007 | Recharge system supporting three methods: by COP amount, by kWh, by PIN code |
| SC-008 | STS-20 token generation for recharge proof |
| SC-009 | Role-based access control (RBAC) with three roles: user, admin, audit |
| SC-010 | Account status management: Activo, Pausa, Deshabilitado, Suspendido |
| SC-011 | User profile management with personal data and completion tracking |
| SC-012 | Password management including policy enforcement, change, and reset |
| SC-013 | Admin functions: user management, meter linking/unlinking, kWh price updates |
| SC-014 | Auditor functions: employee code generation, sales metrics, security logs, price history |
| SC-015 | Security event logging for all significant operations |

## 2.2 Out of Scope

| ID      | Out-of-Scope Item | Reason |
| ------- | ----------------- | ------ |
| OOS-001 | Hardware meter interface integration | External system not developed |
| OOS-002 | Real-time energy consumption monitoring | Future enhancement |
| OOS-003 | Push notifications | Not implemented in current version |
| OOS-004 | Multi-language support | Spanish only |
| OOS-005 | Offline mode for mobile app | Requires server connectivity |
| OOS-006 | Third-party payment integrations | Uses internal PIN system |
| OOS-007 | Email notification service | Mock implementation only |
| OOS-008 | Mobile push notifications | Not implemented |
| OOS-009 | Data export (CSV/PDF) | Future enhancement |
| OOS-010 | Scheduled price changes | Not implemented |

---

# 3. Glossary, Definitions, Acronyms, and Domain Terms

| Term | Type | Definition | System Meaning |
| ---- | -------------- | ---------- | -------------- |
| Energo | Product Name | Energy management system | The complete system (mobile, web, API, database) |
| Meter / Energy Card | Domain term | Prepaid energy measurement device | Physical or virtual card representing an energy account |
| kWh | Unit of Measure | Kilowatt-hour | Unit of electrical energy measurement |
| COP | Currency | Colombian Peso | Currency used for monetary values |
| PIN | Technical term | Personal Identification Number | 20-digit STS-20 token for recharge proof |
| STS-20 | Algorithm | Secure Token Standard 20 | Algorithm for generating cryptographically secure recharge tokens |
| RBAC | Acronym | Role-Based Access Control | Authorization model used in the system |
| Activo | State | Active | User account status with full access |
| Pausa | State | Paused | User account status with login but no recharge capability |
| Deshabilitado | State | Disabled | User account status that is permanent and blocks login |
| Suspendido | State | Suspended | User account status that is temporary and blocks login |
| bcrypt | Technical term | Password hashing algorithm | Used for secure password storage with cost factor 10 |
| Session | State | User session | Server-side authentication state managed via express-session |
| Joi | Technical term | Validation library | JavaScript schema validation used for input validation |
| Expo | Framework | React Native framework | Platform for building mobile applications |
| MUI | Acronym | Material-UI | React component library for web UI |

---

# 4. Requirement Language Rules

Include this because the LLM needs to understand requirement force.

| Word     | Meaning                              |
| -------- | ------------------------------------ |
| Shall    | Mandatory                            |
| Must     | Mandatory                            |
| Must not | Forbidden                            |
| Should   | Recommended but not mandatory        |
| May      | Optional / allowed                   |
| Can      | Capability, not necessarily required |

---

# 5. System Context

## 5.1 Product Overview

| Area                       | Description                                                                  |
| -------------------------- | ---------------------------------------------------------------------------- |
| Product name               | EnergoMobile                                                                 |
| Product type               | Mobile app + Web app + API backend + Database                                |
| Primary users              | Regular users (energy consumers), Admins (system managers), Auditors (compliance officers) |
| Main goal                  | Enable users to manage prepaid energy meters, recharge credit, and administrators to manage users and pricing |
| Deployment environment     | Cloud-hosted (backend at energoapi.gosr.lol), Mobile (iOS/Android via Expo), Web (React) |
| Main external dependencies | MySQL database, Browser/Mobile client, HTTPS transport |

## 5.2 Actors and External Systems

| Actor / System | Type            | Interaction With System |
| -------------- | --------------- | ----------------------- |
| Regular User   | Human user      | Register, login, manage profile, manage meters, recharge energy, view history |
| Admin User     | Human user      | All user permissions plus user management, meter linking, price updates, view all recharge history |
| Auditor User   | Human user      | View-only monitoring, generate employee codes, view metrics and logs |
| MySQL Database | External System | Stores all persistent data including users, meters, transactions, logs |
| STS Token System | External System | Generates 20-digit PIN codes for recharge validation (integrated in backend) |

---

# 6. User Classes and Permissions

| User Class      | Description | Allowed Actions | Forbidden Actions |
| --------------- | ----------- | --------------- | ----------------- |
| Guest           | Unauthenticated visitor | View home page, navigate to login/register | Access any authenticated endpoint, view personal data |
| Regular User    | Standard customer with prepaid energy meter | Login, logout, view dashboard, view/edit profile, change password, manage own meters (add/rename/release), recharge by amount/kWh/PIN, view own recharge history, pause/reactivate own account | Access admin endpoints, access audit endpoints, view other users' data, modify kWh price |
| Admin           | System administrator | All regular user actions plus view all users, view user details, update user email, change user status, suspend/unsuspend users, send password resets, link/unlink meters to users, update kWh price, view all recharge history with user email/ID | Access audit-specific endpoints like employee code generation |
| Auditor         | Compliance and monitoring officer | View all admins, view admin profiles, update admin status, view all employees, generate employee codes, view employee codes with usage status, view sales metrics (totals and daily), view kWh price history, view security logs for all users | Perform regular user operations, modify user data or meters |

---

# 7. Functional Requirements

## 7.1 Functional Requirement Format

| Field                  | Value               |
| ---------------------- | ------------------- |
| Requirement ID         | FR-001              |
| Requirement            | The system shall... |
| Actor                  |                     |
| Trigger                |                     |
| Input                  |                     |
| Processing Rule        |                     |
| Output                 |                     |
| Error Behavior         |                     |
| Acceptance Criteria    |                     |
| Related Business Rules |                     |
| Related Test Cases     |                     |

## 7.2 Functional Requirements

| ID     | Requirement      | Acceptance Criteria |
| ------ | ---------------- | ------------------- |
| FR-001 | The system shall authenticate users with username and password, establishing a server-side session | User can log in with valid credentials; session cookie is returned; user cannot access protected routes without session |
| FR-002 | The system shall register new users with unique username, email, password meeting policy requirements, and optionally an energy card serial or employee code | Registration succeeds with valid data; duplicate username/email rejected; password policy enforced; card linkage or role assignment based on input |
| FR-003 | The system shall provide role-based access control with three roles: user, admin, and audit | Users see only their features; admins see user management; auditors see monitoring features |
| FR-004 | The system shall allow users to manage their profile including first name, last name, ID type, ID number, address, and phone | Profile can be viewed and updated; required fields enforced; changes logged |
| FR-005 | The system shall allow users to change their password by providing current password and new password meeting policy | Password change succeeds with valid current password; new password must meet policy (12+ chars, 3 of 4 character classes) |
| FR-006 | The system shall allow users to request password reset via token-based flow | Valid token allows password reset; token expires after 1 hour; single-use enforcement |
| FR-007 | The system shall allow users to add energy cards (meters) by providing card serial number | New card is created or existing released card is claimed; card becomes linked to user |
| FR-008 | The system shall allow users to rename their energy cards | Card name can be updated; name is optional and used for display only |
| FR-009 | The system shall allow users to release (unlink) their energy cards | Card is unlinked from user; marked as released; becomes available for other users to claim |
| FR-010 | The system shall allow users to recharge by specifying amount in COP | Amount is converted to kWh using current price; balance and kWh updated; PIN generated |
| FR-011 | The system shall allow users to recharge by specifying energy in kWh | kWh is converted to COP using current price; balance and kWh updated; PIN generated |
| FR-012 | The system shall generate STS-20 tokens (20-digit PINs) as proof of recharge | PIN encodes amount, card number, timestamp; includes Luhn check digit; can be validated |
| FR-013 | The system shall display user's recharge history with date, PIN, amount, kWh, and price at time of recharge | History shows all user's recharges; admin view shows all users' recharges with email and ID |
| FR-014 | The system shall allow users to pause their own account | User status changes to Pausa; user can login but cannot recharge; user can self-reactivate |
| FR-015 | The system shall track profile completion status and prompt users with incomplete profiles | Users with missing required fields see prompt; completion unlocks full functionality |
| FR-016 | The system shall restrict document changes to once per user | Document type and number can only be changed once; change is logged in user_document_changes |
| FR-017 | The system shall allow admins to view all regular users in a paginated list | Admin sees username, email, created_at, last_login, role, status |
| FR-018 | The system shall allow admins to view detailed user information including profile, meters, and security logs | Admin sees complete user data; can see user's meters and activity logs |
| FR-019 | The system shall allow admins to update user email address | Email change validated for uniqueness; change is logged |
| FR-020 | The system shall allow admins to change user status to Activo, Pausa, Deshabilitado, or Suspendido | Status change is immediate; affects user's login and recharge capability |
| FR-021 | The system shall allow admins to suspend and unsuspend users | Suspended users cannot login; unsuspension restores access |
| FR-022 | The system shall allow admins to send password reset links to users | Reset token is generated; token returned in response (mock); user can reset password |
| FR-023 | The system shall allow admins to link meters to users | Admin can assign released cards to any user |
| FR-024 | The system shall allow admins to unlink meters from users | Admin can release cards from any user; admin ID recorded as releaser |
| FR-025 | The system shall allow admins to update the kWh price | Price change is immediate; history is preserved; change is logged with admin ID |
| FR-026 | The system shall allow auditors to view all admin users | Auditor sees list of all users with admin role |
| FR-027 | The system shall allow auditors to view admin profile details | Auditor sees full profile data for any admin |
| FR-028 | The system shall allow auditors to update admin status to Activo or Deshabilitado | Status change is logged |
| FR-029 | The system shall allow auditors to view all employees (admins and auditors) | Combined list of both admin and audit role users |
| FR-030 | The system shall allow auditors to generate one-time employee codes for admin or audit roles | Generated code follows format ROLE-XXXXXXXX; code can be used once |
| FR-031 | The system shall allow auditors to view all employee codes with usage status | Shows all codes, used/unused status, who used each code and when |
| FR-032 | The system shall allow auditors to view sales metrics with totals and daily breakdown | Shows total codes sold, total amount COP, total kWh; daily breakdown for configurable days |
| FR-033 | The system shall allow auditors to view complete kWh price history | Shows all price changes with admin username and timestamp |
| FR-034 | The system shall allow auditors to view all security logs | Shows latest 200 security events; can filter by user |
| FR-035 | The system shall log all security-relevant events including login, logout, registration, recharge, password changes, and admin actions | Logs include event type, username, timestamp, IP address, details |
| FR-036 | The system shall validate all user inputs using Joi schemas with appropriate validation rules | Invalid inputs return 400 with descriptive error messages |

---

# 8. Use Cases / User Flows

## UC-001: User Registration

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-001      |
| Actor                | Regular User (new), Employee (via code) |
| Goal                 | Create a new user account with optional energy card linkage or employee role |
| Preconditions        | User does not have an account; has valid energy card serial or valid employee code |
| Trigger              | User navigates to registration page, enters data, submits form |
| Postconditions       | User account created; session established; energy card linked (if regular registration) or role assigned (if employee code) |
| Related Requirements | FR-002, FR-003, FR-015 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | User navigates to /register | System displays registration form |
| 2    | User enters username, email, password, and either card_number or employee_code | System validates input format |
| 3    | User submits form | System validates uniqueness, password policy |
| 4    |              | System creates user record with role_id from code or default 3 |
| 5    |              | System creates user profile and flags records |
| 6    |              | If card_number: system creates or claims energy card |
| 7    |              | If employee_code: system marks code as used |
| 8    |              | System commits transaction |
| 9    |              | System establishes session |
| 10   |              | System logs security event |
| 11   |              | System returns success response |
| 12   | Frontend shows success, redirects to dashboard | |

### Alternative Flows

| Flow ID | Condition | Expected Behavior |
| ------- | --------- | ----------------- |
| AF-001  | Username already exists | Return 400 "Username already exists" |
| AF-002  | Email already exists | Return 400 "Email already exists" |
| AF-003  | Password fails policy | Return 400 with specific policy violation |
| AF-004  | Card already in use | Return 400 "Card already linked to another user" |
| AF-005  | Employee code invalid or used | Return 400 "Invalid or used employee code" |

### Exception Flows

| Exception ID | Error Condition | Expected System Response |
| ------------ | --------------- | ------------------------ |
| EX-001       | Database error | Rollback transaction, return 500 "Registration failed" |

---

## UC-002: User Login

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-002      |
| Actor                | Registered User |
| Goal                 | Authenticate and establish session |
| Preconditions        | User has valid username and password |
| Trigger              | User enters credentials and submits |
| Postconditions       | Session established; last_login updated |
| Related Requirements | FR-001 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | User navigates to /login | System displays login form |
| 2    | User enters username and password | |
| 3    | User submits form | System looks up user by username |
| 4    |              | System compares password with hash |
| 5    |              | System checks user status |
| 6    |              | If Activo or Pausa: System creates session |
| 7    |              | System updates last_login |
| 8    |              | System logs security event |
| 9    |              | System returns 200 with session cookie |
| 10   | Frontend stores session, redirects to dashboard | |

### Alternative Flows

| Flow ID | Condition | Expected Behavior |
| ------- | --------- | ----------------- |
| AF-001  | User not found | Return 401 "Invalid credentials" |
| AF-002  | Password mismatch | Return 401 "Invalid credentials" |
| AF-003  | Status is Deshabilitado | Return 403 with specific message |
| AF-004  | Status is Suspendido | Return 403 with specific message |
| AF-005  | Status is Pausa | Allow login but show warning banner |

---

## UC-003: User Logout

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-003      |
| Actor                | Authenticated User |
| Goal                 | End session |
| Preconditions        | User has active session |
| Trigger              | User clicks logout |
| Postconditions       | Session destroyed |
| Related Requirements | FR-001 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | User clicks Logout | Frontend sends POST /api/auth/logout |
| 2    |              | System destroys session |
| 3    |              | System logs security event |
| 4    |              | System returns 200 |
| 5    | Frontend clears state, redirects to home | |

---

## UC-004: View Dashboard

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-004      |
| Actor                | Authenticated User |
| Goal                 | Display user-specific data based on role |
| Preconditions        | User has valid session |
| Trigger              | User navigates to dashboard |
| Postconditions       | Dashboard displayed with appropriate data |
| Related Requirements | FR-010, FR-011, FR-013, FR-033 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | User navigates to /dashboard | Frontend calls GET /api/user/profile |
| 2    |              | System verifies session |
| 3    |              | System retrieves user info, profile, cards, history |
| 4    |              | For admin: retrieves all recharge history |
| 5    |              | For auditor: retrieves security logs and metrics |
| 6    |              | System returns data |
| 7    | Frontend renders dashboard with role-appropriate sections | |

---

## UC-005: Recharge by Amount (COP)

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-005      |
| Actor                | Authenticated User (Activo status) |
| Goal                 | Add credit to energy card using COP amount |
| Preconditions        | User has at least one energy card; account status is Activo |
| Trigger              | User selects card, enters COP amount, submits |
| Postconditions       | Card balance increased; PIN generated; transaction recorded |
| Related Requirements | FR-010, FR-012 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | User selects energy card | |
| 2    | User enters amount in COP | System shows equivalent kWh |
| 3    | User clicks recharge | Frontend sends POST /api/recharge |
| 4    |              | System validates authentication, card ownership, amount |
| 5    |              | System calculates kWh from amount and current price |
| 6    |              | System locks card row for update |
| 7    |              | System updates balance and kWh |
| 8    |              | System generates STS-20 PIN |
| 9    |              | System records transaction in recharge_pins |
| 10   |              | System logs security event |
| 11   |              | System returns PIN and updated balances |
| 12   | Frontend displays PIN, updates balance display | |

### Alternative Flows

| Flow ID | Condition | Expected Behavior |
| ------- | --------- | ----------------- |
| AF-001  | Invalid amount (≤0) | Return 400 "Invalid amount" |
| AF-002  | Card not owned by user | Return 404 "Card not found" |
| AF-003  | Account not Activo | Return 403 "Recharge blocked due to account status" |

---

## UC-006: Recharge by Energy (kWh)

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-006      |
| Actor                | Authenticated User (Activo status) |
| Goal                 | Add credit to energy card using kWh amount |
| Preconditions        | User has at least one energy card; account status is Activo |
| Trigger              | User selects card, enters kWh amount, submits |
| Postconditions       | Card balance and kWh increased; PIN generated; transaction recorded |
| Related Requirements | FR-011, FR-012 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | User selects energy card | |
| 2    | User enters energy in kWh | System shows equivalent COP |
| 3    | User clicks recharge | Frontend sends POST /api/recharge with kWh |
| 4    |              | System validates input and user status |
| 5    |              | System calculates COP from kWh and current price |
| 6    |              | System performs atomic update with PIN generation |
| 7    |              | System returns PIN and updated balances |
| 8    | Frontend displays success with PIN | |

---

## UC-007: Recharge by PIN Code

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-007      |
| Actor                | Authenticated User (Activo status) |
| Goal                 | Redeem a pre-generated PIN code |
| Preconditions        | User has valid PIN code from prior recharge or external source; account status is Activo |
| Trigger              | User enters PIN code, submits |
| Postconditions       | Card balance increased; transaction recorded |
| Related Requirements | FR-012 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | User enters 20-digit PIN | |
| 2    | User submits | Frontend sends POST /api/recharge with pin_code |
| 3    |              | System validates PIN format and existence |
| 4    |              | System retrieves amount and kWh from PIN record |
| 5    |              | System updates card balance |
| 6    |              | System returns updated balances |
| 7    | Frontend displays success | |

### Alternative Flows

| Flow ID | Condition | Expected Behavior |
| ------- | --------- | ----------------- |
| AF-001  | PIN not found | Return 400 "Invalid PIN code" |
| AF-002  | PIN belongs to different user | Return 400 "Invalid PIN code" (do not reveal ownership) |

---

## UC-008: View Recharge History

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-008      |
| Actor                | Authenticated User |
| Goal                 | Display list of past recharges |
| Preconditions        | User has valid session |
| Trigger              | User views dashboard |
| Postconditions       | History displayed |
| Related Requirements | FR-013 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | User views dashboard | System includes recharge_history in response |
| 2    |              | Regular users see their own history |
| 3    |              | Admins see all users' history with user details |
| 4    | Frontend displays table with columns | |

---

## UC-009: View Profile

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-009      |
| Actor                | Authenticated User |
| Goal                 | Display user's personal data |
| Preconditions        | User has valid session |
| Trigger              | User navigates to profile page |
| Postconditions       | Profile data displayed |
| Related Requirements | FR-004 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | User navigates to /me | Frontend calls GET /api/user/profile |
| 2    |              | System retrieves user info and profile |
| 3    |              | System returns data |
| 4    | Frontend displays profile form | |

---

## UC-010: Update Profile

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-010      |
| Actor                | Authenticated User |
| Goal                 | Update personal data |
| Preconditions        | User has valid session |
| Trigger              | User edits and saves profile |
| Postconditions       | Profile updated; completion flag set if required fields filled |
| Related Requirements | FR-004, FR-016 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | User clicks edit on profile | |
| 2    | User modifies fields | |
| 3    | User saves | Frontend sends PUT /api/user/profile |
| 4    |              | System validates required fields |
| 5    |              | System checks document/phone uniqueness |
| 6    |              | System updates profile |
| 7    |              | If document changed: insert into user_document_changes |
| 8    |              | System sets personal_data_filled flag if complete |
| 9    |              | System returns success |
| 10   | Frontend shows success | |

### Alternative Flows

| Flow ID | Condition | Expected Behavior |
| ------- | --------- | ----------------- |
| AF-001  | Document already exists | Return 400 "Document number already registered" |
| AF-002  | Phone already exists | Return 400 "Phone already registered" |
| AF-003  | Document already changed | Return 403 "Document can only be changed once" |

---

## UC-011: Change Password

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-011      |
| Actor                | Authenticated User |
| Goal                 | Update account password |
| Preconditions        | User knows current password |
| Trigger              | User enters current and new password, submits |
| Postconditions       | Password updated; password_changed_at set |
| Related Requirements | FR-005 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | User navigates to security settings | |
| 2    | User enters current password and new password | |
| 3    | User submits | Frontend sends POST /api/user/password-change |
| 4    |              | System validates current password |
| 5    |              | System validates new password meets policy |
| 6    |              | System hashes new password with bcrypt |
| 7    |              | System updates user record |
| 8    |              | System logs security event |
| 9    |              | System returns success |
| 10   | Frontend shows success message | |

### Alternative Flows

| Flow ID | Condition | Expected Behavior |
| ------- | --------- | ----------------- |
| AF-001  | Current password incorrect | Return 400 "Current password is incorrect" |
| AF-002  | New password fails policy | Return 400 with policy violation details |

---

## UC-012: Add Energy Card

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-012      |
| Actor                | Regular User |
| Goal                 | Link a new meter to user account |
| Preconditions        | User has valid session; card is available (not linked) |
| Trigger              | User enters card serial, submits |
| Postconditions       | Energy card created and linked to user |
| Related Requirements | FR-007 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | User clicks add meter | |
| 2    | User enters card serial (11+ digits) | |
| 3    | User confirms | Frontend sends POST /api/meters |
| 4    |              | System validates format |
| 5    |              | If card exists and released: claim it |
| 6    |              | If card exists and active: return error |
| 7    |              | If card does not exist: create new |
| 8    |              | System returns created card |
| 9    | Frontend adds card to list | |

### Alternative Flows

| Flow ID | Condition | Expected Behavior |
| ------- | --------- | ----------------- |
| AF-001  | Card already in use | Return 400 "Card already linked to another user" |

---

## UC-013: Rename Energy Card

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-013      |
| Actor                | Regular User |
| Goal                 | Update display name of meter |
| Preconditions        | User owns the energy card |
| Trigger              | User edits card name |
| Postconditions       | Card name updated |
| Related Requirements | FR-008 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | User clicks edit on card | |
| 2    | User enters new name | |
| 3    | User confirms | Frontend sends PATCH /api/meters/{card_number} |
| 4    |              | System validates ownership |
| 5    |              | System updates name |
| 6    |              | System returns updated card |
| 7    | Frontend updates display | |

---

## UC-014: Release Energy Card

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-014      |
| Actor                | Regular User |
| Goal                 | Unlink meter from account |
| Preconditions        | User owns the energy card |
| Trigger              | User clicks release, confirms |
| Postconditions       | Card unlinked; marked as released |
| Related Requirements | FR-009 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | User clicks release on card | |
| 2    | System shows confirmation dialog | |
| 3    | User confirms | Frontend sends DELETE /api/meters/{card_number} |
| 4    |              | System validates ownership |
| 5    |              | System sets user_id=NULL, released=1, records releasing user |
| 6    |              | System returns success |
| 7    | Frontend removes card from list | |

---

## UC-015: Pause Account

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-015      |
| Actor                | Regular User |
| Goal                 | Temporarily pause account |
| Preconditions        | User account is active |
| Trigger              | User clicks pause account, confirms |
| Postconditions       | Account status changed to Pausa |
| Related Requirements | FR-014 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | User navigates to account settings | |
| 2    | User clicks pause | |
| 3    | System shows confirmation | |
| 4    | User confirms | Frontend sends POST /api/user/status |
| 5    |              | System validates status transition |
| 6    |              | System updates status to Pausa |
| 7    |              | System logs security event |
| 8    |              | System returns success |
| 9    | Frontend shows success, disables recharge | |

---

## UC-016: Reactivate Account

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-016      |
| Actor                | Paused User |
| Goal                 | Restore account to active status |
| Preconditions        | User account status is Pausa |
| Trigger              | User clicks reactivate, enters password |
| Postconditions       | Account status changed to Activo |
| Related Requirements | FR-014 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Paused user navigates to /reactivar | |
| 2    | User enters current password | |
| 3    | User confirms | Frontend sends POST /api/user/status with Activo |
| 4    |              | System validates password |
| 5    |              | System updates status to Activo |
| 6    |              | System logs security event |
| 7    |              | System returns success |
| 8    | Frontend redirects to dashboard | |

---

## UC-017: Admin View All Users

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-017      |
| Actor                | Admin |
| Goal                 | Display list of all regular users |
| Preconditions        | User has admin role; valid session |
| Trigger              | Admin navigates to Users page |
| Postconditions       | User list displayed |
| Related Requirements | FR-017 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Admin navigates to /admin/users | Frontend calls GET /api/admin/users |
| 2    |              | System verifies admin role |
| 3    |              | System retrieves all users with role='user' |
| 4    |              | System returns user list |
| 5    | Frontend displays table with search/filter | |

---

## UC-018: Admin View User Detail

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-018      |
| Actor                | Admin |
| Goal                 | Display detailed information about a specific user |
| Preconditions        | Admin has valid session; user ID exists |
| Trigger              | Admin clicks on user in list |
| Postconditions       | Detailed user information displayed |
| Related Requirements | FR-018 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Admin clicks on user | Frontend navigates to /admin/users/{id} |
| 2    |              | Frontend calls GET /api/admin/users/{id} |
| 3    |              | System verifies admin role |
| 4    |              | System retrieves user info, profile, meters, logs |
| 5    |              | System returns complete user detail |
| 6    | Frontend displays detail with actions | |

---

## UC-019: Admin View User Logs

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-019      |
| Actor                | Admin |
| Goal                 | Display security logs for a specific user |
| Preconditions        | Admin has valid session; user ID exists |
| Trigger              | Admin clicks logs tab on user detail |
| Postconditions       | Security logs displayed |
| Related Requirements | FR-018 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Admin views user detail | |
| 2    | Admin clicks logs tab | Frontend calls GET /api/admin/users/{id}/logs |
| 3    |              | System retrieves logs for user (latest 200) |
| 4    |              | System returns log entries |
| 5    | Frontend displays chronological log table | |

---

## UC-020: Admin Update User Email

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-020      |
| Actor                | Admin |
| Goal                 | Change user's email address |
| Preconditions        | Admin has valid session; user exists; new email is unique |
| Trigger              | Admin enters new email, confirms |
| Postconditions       | User's email updated; change logged |
| Related Requirements | FR-019 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Admin clicks edit email on user detail | |
| 2    | Admin enters new email | |
| 3    | Admin confirms | Frontend sends PATCH /api/admin/users/{id}/email |
| 4    |              | System validates admin role, email format, uniqueness |
| 5    |              | System updates email |
| 6    |              | System logs security event |
| 7    |              | System returns success |
| 8    | Frontend shows success | |

---

## UC-021: Admin Send Password Reset

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-021      |
| Actor                | Admin |
| Goal                 | Generate and send password reset link to user |
| Preconditions        | Admin has valid session; user exists |
| Trigger              | Admin clicks send password reset, confirms |
| Postconditions       | Reset token generated and stored |
| Related Requirements | FR-022 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Admin clicks send reset | |
| 2    | System shows confirmation | |
| 3    | Admin confirms | Frontend sends POST /api/admin/users/{id}/send-reset |
| 4    |              | System verifies admin role |
| 5    |              | System generates secure token |
| 6    |              | System stores token hash with 1-hour expiry |
| 7    |              | System invalidates existing tokens |
| 8    |              | System logs security event |
| 9    |              | System returns reset link (mock - token in response) |
| 10   | Frontend shows success message | |

---

## UC-022: Admin Link Meter to User

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-022      |
| Actor                | Admin |
| Goal                 | Assign an energy card to a user |
| Preconditions        | Admin has valid session; card exists and is released |
| Trigger              | Admin enters card number, confirms |
| Postconditions       | Energy card linked to specified user |
| Related Requirements | FR-023 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Admin clicks link meter on user detail | |
| 2    | Admin enters card serial | |
| 3    | Admin confirms | Frontend sends POST /api/admin/users/{id}/link |
| 4    |              | System validates admin role, card exists, card is released |
| 5    |              | System updates card user_id, clears released flags |
| 6    |              | System logs security event |
| 7    |              | System returns success |
| 8    | Frontend shows success, refreshes detail | |

---

## UC-023: Admin Unlink Meter from User

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-023      |
| Actor                | Admin |
| Goal                 | Remove an energy card from a user |
| Preconditions        | Admin has valid session; card exists and is linked to user |
| Trigger              | Admin clicks remove on meter, confirms |
| Postconditions       | Energy card unlinked; marked as released |
| Related Requirements | FR-024 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Admin clicks remove on user's meter | |
| 2    | System shows confirmation | |
| 3    | Admin confirms | Frontend sends DELETE /api/admin/users/{id}/{card_number} |
| 4    |              | System validates admin role, card ownership |
| 5    |              | System sets user_id=NULL, released=1, records admin as releaser |
| 6    |              | System logs security event |
| 7    |              | System returns success |
| 8    | Frontend removes meter from list | |

---

## UC-024: Admin Suspend User

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-024      |
| Actor                | Admin |
| Goal                 | Temporarily suspend user's account |
| Preconditions        | Admin has valid session; user exists and is active |
| Trigger              | Admin clicks suspend, confirms |
| Postconditions       | User status changed to Suspendido |
| Related Requirements | FR-020 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Admin clicks suspend user | |
| 2    | System shows confirmation | |
| 3    | Admin confirms | Frontend sends POST /api/admin/users/{id}/suspend |
| 4    |              | System verifies admin role |
| 5    |              | System updates status to Suspendido |
| 6    |              | System logs security event |
| 7    |              | System returns success |
| 8    | Frontend shows success, updates status display | |

---

## UC-025: Admin Reactivate User

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-025      |
| Actor                | Admin |
| Goal                 | Remove suspension from user's account |
| Preconditions        | Admin has valid session; user is suspended |
| Trigger              | Admin clicks unsuspend/reactivate, confirms |
| Postconditions       | User status changed to Activo |
| Related Requirements | FR-020 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Admin clicks unsuspend | |
| 2    | Admin confirms | Frontend sends POST /api/admin/users/{id}/unsuspend |
| 3    |              | System verifies admin role |
| 4    |              | System updates status to Activo |
| 5    |              | System logs security event |
| 6    |              | System returns success |
| 7    | Frontend updates status | |

---

## UC-026: Admin Update kWh Price

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-026      |
| Actor                | Admin |
| Goal                 | Modify the price per kWh used for recharge calculations |
| Preconditions        | Admin has valid session; new price is positive number |
| Trigger              | Admin enters new price, saves |
| Postconditions       | kWh price updated; history logged |
| Related Requirements | FR-025 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Admin clicks update price chip | |
| 2    | Dialog shows current price | |
| 3    | Admin enters new price | |
| 4    | Admin clicks save | Frontend sends POST /api/admin/kwh-price |
| 5    |              | System validates admin role, price > 0 |
| 6    |              | System inserts into kwh_price_history |
| 7    |              | System upserts into settings |
| 8    |              | System logs security event |
| 9    |              | System returns new price |
| 10   | Frontend updates price display | |

---

## UC-027: Admin View All Recharge History

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-027      |
| Actor                | Admin |
| Goal                 | Display complete recharge history across all users |
| Preconditions        | Admin has valid session |
| Trigger              | Admin views dashboard |
| Postconditions       | All recharges displayed with user details |
| Related Requirements | FR-019 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Admin views dashboard | System includes all recharge history |
| 2    |              | Table shows all columns including user ID and email |
| 3    | Frontend displays history table | |

---

## UC-028: Auditor View All Admins

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-028      |
| Actor                | Auditor |
| Goal                 | Display list of all admin users |
| Preconditions        | Auditor has valid session |
| Trigger              | Auditor navigates to Admins section |
| Postconditions       | Admin list displayed |
| Related Requirements | FR-026 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Auditor navigates to audit section | Frontend calls GET /api/audit/admins |
| 2    |              | System verifies auditor role |
| 3    |              | System retrieves all users with role='admin' |
| 4    |              | System returns admin list |
| 5    | Frontend displays table | |

---

## UC-029: Auditor View Admin Profile

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-029      |
| Actor                | Auditor |
| Goal                 | Display detailed profile of an admin |
| Preconditions        | Auditor has valid session; admin user ID exists |
| Trigger              | Auditor clicks on admin |
| Postconditions       | Admin profile details displayed |
| Related Requirements | FR-027 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Auditor clicks on admin | Frontend navigates to /audit/admins/{id} |
| 2    |              | Frontend calls GET /api/audit/admins/{id}/profile |
| 3    |              | System verifies auditor role |
| 4    |              | System retrieves admin profile |
| 5    |              | System returns profile data |
| 6    | Frontend displays profile | |

---

## UC-030: Auditor Update Admin Status

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-030      |
| Actor                | Auditor |
| Goal                 | Change admin's account status |
| Preconditions        | Auditor has valid session; admin user exists; valid status |
| Trigger              | Auditor selects new status, confirms |
| Postconditions       | Admin's status updated |
| Related Requirements | FR-028 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Auditor selects status | |
| 2    | Auditor confirms | Frontend sends PATCH /api/audit/admins/{id}/status |
| 3    |              | System verifies auditor role |
| 4    |              | System validates status is Activo or Deshabilitado |
| 5    |              | System updates user status |
| 6    |              | System logs security event |
| 7    |              | System returns success |
| 8    | Frontend shows success | |

---

## UC-031: Auditor View All Employees

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-031      |
| Actor                | Auditor |
| Goal                 | Display list of all employees (admins and auditors) |
| Preconditions        | Auditor has valid session |
| Trigger              | Auditor navigates to Employees page |
| Postconditions       | Employee list displayed |
| Related Requirements | FR-029 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Auditor navigates to /audit/employees | Frontend calls GET /api/audit/employees |
| 2    |              | System verifies auditor role |
| 3    |              | System retrieves users with role IN (admin, audit) |
| 4    |              | System returns employee list |
| 5    | Frontend displays table | |

---

## UC-032: Auditor Generate Employee Code

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-032      |
| Actor                | Auditor |
| Goal                 | Create a one-time code for admin or auditor registration |
| Preconditions        | Auditor has valid session; role is admin or audit |
| Trigger              | Auditor selects role, clicks generate |
| Postconditions       | New employee code generated |
| Related Requirements | FR-030 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Auditor clicks generate code | |
| 2    | Auditor selects role (admin or audit) | |
| 3    | Auditor confirms | Frontend sends POST /api/audit/employee-codes |
| 4    |              | System verifies auditor role |
| 5    |              | System validates role |
| 6    |              | System generates random 8-character code |
| 7    |              | System formats as ROLE-XXXXXXXX |
| 8    |              | System inserts into employee_codes |
| 9    |              | System returns new code |
| 10   | Frontend displays code with copy button | |

---

## UC-033: Auditor View Employee Codes

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-033      |
| Actor                | Auditor |
| Goal                 | Display all generated employee codes with usage status |
| Preconditions        | Auditor has valid session |
| Trigger              | Auditor navigates to codes list |
| Postconditions       | Code list displayed |
| Related Requirements | FR-031 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Auditor navigates to codes list | Frontend calls GET /api/audit/employee-codes |
| 2    |              | System verifies auditor role |
| 3    |              | System retrieves all codes with usage info |
| 4    |              | System returns codes with status |
| 5    | Frontend displays table with color coding | |

---

## UC-034: Auditor View Sales Metrics

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-034      |
| Actor                | Auditor |
| Goal                 | Display sales totals and daily breakdown |
| Preconditions        | Auditor has valid session |
| Trigger              | Auditor navigates to metrics/dashboard |
| Postconditions       | Metrics displayed |
| Related Requirements | FR-032 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Auditor navigates to metrics | Frontend calls GET /api/audit/metrics/series?days=30 |
| 2    |              | System verifies auditor role |
| 3    |              | System calls stored procedure for totals and daily breakdown |
| 4    |              | System returns metrics |
| 5    | Frontend displays summary chips and table | |

---

## UC-035: Auditor View kWh Price History

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-035      |
| Actor                | Auditor |
| Goal                 | Display complete history of price changes |
| Preconditions        | Auditor has valid session |
| Trigger              | Auditor navigates to price history |
| Postconditions       | Price history displayed |
| Related Requirements | FR-033 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Auditor navigates to price history | Frontend calls GET /api/audit/kwh-price-history |
| 2    |              | System verifies auditor role |
| 3    |              | System retrieves from kwh_price_history with admin usernames |
| 4    |              | System orders by created_at DESC |
| 5    |              | System returns price history |
| 6    | Frontend displays table | |

---

## UC-036: Auditor View Security Logs

| Field                | Description |
| -------------------- | ----------- |
| Use Case ID          | UC-036      |
| Actor                | Auditor |
| Goal                 | Display security event logs |
| Preconditions        | Auditor has valid session |
| Trigger              | Auditor navigates to security logs |
| Postconditions       | Security logs displayed |
| Related Requirements | FR-034, FR-035 |

### Main Flow

| Step | Actor Action | System Response |
| ---- | ------------ | --------------- |
| 1    | Auditor navigates to security logs | Frontend calls GET /api/audit/security-logs |
| 2    |              | System verifies auditor role |
| 3    |              | System retrieves latest 200 log entries |
| 4    |              | System returns logs |
| 5    | Frontend displays table with filtering | |

---

# 9. Business Rules

| Rule ID | Business Rule | Related Requirements |
| ------- | ------------- | -------------------- |
| BR-001  | Users must have unique username (case-insensitive) and unique email | FR-002 |
| BR-002  | Password policy: minimum 12 characters, at least 3 of 4 character classes (lowercase, uppercase, digits, symbols), no whitespace, no username or email local part | FR-005 |
| BR-003  | Energy card numbers must be unique across the system | FR-007 |
| BR-004  | Users can only have one profile; document type and number must be unique across all users | FR-004, FR-016 |
| BR-005  | Users can only change document fields once; change is logged | FR-016 |
| BR-006  | Account statuses: Activo (full access), Pausa (login but no recharge), Deshabilitado (permanent block), Suspendido (temporary block) | FR-014 |
| BR-007  | STS-20 PIN generation: 20-digit token with Luhn check digit, HMAC-SHA256 signature, encodes amount, card number, timestamp | FR-012 |
| BR-008  | Only admins can update kWh price; all changes are logged | FR-025 |
| BR-009  | Employee codes are one-time use, format ROLE-XXXXXXXX, generated by auditors | FR-030 |
| BR-010  | All security events must be logged with event type, username, timestamp, IP, details | FR-035 |
| BR-011  | Session validation revalidates user status on each request; disabled/suspended users are denied | FR-001 |
| BR-012  | Recharge amount/kWh must be positive and within database limits (kWh <= 99999999.99) | FR-010, FR-011 |
| BR-013  | Card balances updated atomically with row-level locking to prevent race conditions | FR-010, FR-011 |
| BR-014  | kWh price at time of recharge stored with each transaction for historical accuracy | FR-013 |
| BR-015  | Profile completion flag must be set when required fields (primer_nombre, primer_apellido, tipo_identificacion, numero_identificacion) are filled | FR-015 |
| BR-016  | Password reset tokens expire after 1 hour, single-use | FR-006 |
| BR-017  | Admin can only link released (unlinked) cards to users | FR-023 |
| BR-018  | Auditor can only set admin status to Activo or Deshabilitado (not Pausa or Suspendido) | FR-028 |

---

# 10. Validation Rules

| Rule ID | Field / Input / Action | Validation Rule | Expected Error |
| ------- | ---------------------- | --------------- | -------------- |
| VAL-001 | Username | Required, 3-50 characters, unique | "Username required", "Username already exists" |
| VAL-002 | Email | Required, valid format, unique | "Valid email required", "Email already exists" |
| VAL-003 | Password | Min 12 chars, 3/4 classes, no spaces, no username/email parts | Specific policy violation message |
| VAL-004 | Card Number | Required for user registration, 11+ digits, not already linked | "Card number required", "Card already in use" |
| VAL-005 | Employee Code | Valid format (ROLE-XXXXXXXX), not used | "Invalid employee code", "Code already used" |
| VAL-006 | Recharge Amount | Positive number, finite, within limits | "Invalid amount", "Amount exceeds limit" |
| VAL-007 | Recharge kWh | Positive number, finite, within limits | "Invalid kWh", "kWh exceeds limit" |
| VAL-008 | PIN Code | 20 digits, valid format, belongs to user | "Invalid PIN code" |
| VAL-009 | Profile - Required Fields | primer_nombre, primer_apellido, tipo_identificacion, numero_identificacion required | "Required field missing" |
| VAL-010 | Profile - Document Number | Unique across users (excluding current user) | "Document number already registered" |
| VAL-011 | Profile - Phone | Unique across users (excluding current user) | "Phone already registered" |
| VAL-012 | kWh Price | Positive number | "Price must be positive" |
| VAL-013 | Status Update | Valid status value for context | "Invalid status" |

---

# 11. Error Handling Requirements

| Error ID | Condition | Expected System Behavior | Related Requirement |
| -------- | --------- | ------------------------ | ------------------- |
| ERR-001  | Invalid credentials | Return 401 "Invalid credentials" (generic to prevent enumeration) | FR-001 |
| ERR-002  | Account disabled | Return 403 "Account disabled. Contact administrator." | FR-001 |
| ERR-003  | Account suspended | Return 403 "Account suspended. Contact administrator." | FR-001 |
| ERR-004  | Recharge blocked (Pausa) | Return 403 "Recharge blocked due to account status" | FR-014 |
| ERR-005  | Resource not found | Return 404 with descriptive message | Multiple |
| ERR-006  | Validation failure | Return 400 with specific validation error | FR-036 |
| ERR-007  | Duplicate entry | Return 400 with "already exists" message | BR-001, BR-003, BR-004 |
| ERR-008  | Unauthorized access | Return 403 "Access denied" | Multiple RBAC |
| ERR-009  | Server error | Return 500 with generic message; details logged | All |
| ERR-010  | Document change limit | Return 403 "Document can only be changed once" | BR-005 |

---

# 12. UI Requirements

Use only if the system has a user interface.

## 12.1 Mobile App (src/)

| ID     | Requirement      | Screen / Component | Acceptance Criteria |
| ------ | ---------------- | ------------------ | ------------------- |
| UI-001 | The system shall display login form with username and password fields | LoginScreen | User can enter credentials and submit |
| UI-002 | The system shall display registration form with username, email, password, card number fields | RegisterScreen | New user can register with card or employee code |
| UI-003 | The system shall display dashboard with card balance, recharge form, and history | DashboardScreen | User sees current balance, can recharge, sees history |
| UI-004 | The system shall display profile form with personal data fields | ProfileScreen | User can view and edit profile |
| UI-005 | The system shall display security settings with password change and meter management | SecurityScreen | User can change password and manage meters |
| UI-006 | The system shall prompt incomplete profile users with modal | DashboardScreen | Users without complete profile see prompt to fill |
| UI-007 | The system shall display account status indicator on dashboard | DashboardScreen | User sees Activo/Pausa/Deshabilitado/Suspendido status |
| UI-008 | The system shall display role-specific navigation for admins | AppNavigator | Admins see Users menu item |
| UI-009 | The system shall display role-specific navigation for auditors | AppNavigator | Auditors see Employee Registration menu item |
| UI-010 | The system shall adapt theme color based on role | AppNavigator | User/admin = green, auditor = black |

## 12.2 Web App (WebVs/)

| ID     | Requirement      | Screen / Component | Acceptance Criteria |
| ------ | ---------------- | ------------------ | ------------------- |
| UI-101 | The system shall display navigation bar with role-appropriate menu items | App.tsx | Nav bar shows login/register for guests, full menu for authenticated |
| UI-102 | The system shall display dashboard with recharge section and history table | Dashboard.tsx | User can view balance, select meter, enter amount/kWh, see history |
| UI-103 | The system shall display admin user management table | AdminUsers.tsx | Admin can view and search all users |
| UI-104 | The system shall display admin user detail with profile, meters, logs, actions | AdminUserDetail.tsx | Admin can view user details and perform actions |
| UI-105 | The system shall display auditor employee code management | AuditEmployees.tsx | Auditor can generate and view codes |
| UI-106 | The system shall display auditor metrics with totals and daily breakdown | Dashboard.tsx | Auditor sees sales metrics chips and table |
| UI-107 | The system shall display profile prompt modal for incomplete profiles | App.tsx | Incomplete profile users see modal prompting completion |
| UI-108 | The system shall display kWh price update dialog for admins | Dashboard.tsx | Admin can update price via dialog |

## 12.2 Screen Definitions

| Screen ID | Screen Name | Purpose | Visible Data | Allowed Actions |
| --------- | ----------- | ------- | ------------ | --------------- |
| SCR-001   | Login | User authentication | Username, password fields | Submit login |
| SCR-002   | Register | User registration | Registration form fields | Submit registration |
| SCR-003   | Dashboard | Main user interface | Card balance, recharge form, history, status | Recharge, view history |
| SCR-004   | Profile | Personal data management | Profile form fields | View, edit profile |
| SCR-005   | Security | Account security settings | Password change, meter management | Change password, manage meters |
| SCR-006   | Admin Users | User list | User table with search | View users |
| SCR-007   | Admin User Detail | Individual user management | User info, profile, meters, logs, actions | Manage user |
| SCR-008   | Audit Employees | Employee code management | Code list, generate form | Generate codes |
| SCR-009   | Audit Admin Detail | Admin profile viewing | Admin profile data | View profile |

---

# 13. API Requirements

Use only if the system exposes or consumes APIs.

## 13.1 Endpoint Format

| Field                   | Value                             |
| ----------------------- | --------------------------------- |
| Endpoint ID             | API-001                           |
| Method                  | GET / POST / PUT / PATCH / DELETE |
| Route                   |                                   |
| Authentication Required | Yes / No                          |
| Request Body            |                                   |
| Response Body           |                                   |
| Success Status          |                                   |
| Error Statuses          |                                   |
| Related Requirements    |                                   |

## 13.2 API Endpoints

| ID      | Method | Route | Expected Behavior | Related Requirement |
| ------- | ------ | ----- | ----------------- | ------------------- |
| API-001 | POST | /api/auth/login | Authenticate user, create session | FR-001 |
| API-002 | POST | /api/auth/register | Create new user account | FR-002 |
| API-003 | POST | /api/auth/logout | Destroy session | FR-001 |
| API-004 | GET | /api/auth/password/reset/validate | Validate reset token | FR-006 |
| API-005 | POST | /api/auth/password/reset | Reset password with token | FR-006 |
| API-006 | GET | /api/user/profile | Get user data with profile, cards, history | FR-004, FR-013 |
| API-007 | PUT | /api/user/profile | Update user profile | FR-004 |
| API-008 | POST | /api/user/password-change | Change password | FR-005 |
| API-009 | POST | /api/user/status | Update own account status | FR-014 |
| API-010 | GET | /api/meters | List user's energy cards | FR-007 |
| API-011 | POST | /api/meters | Add energy card | FR-007 |
| API-012 | DELETE | /api/meters/:card_number | Release energy card | FR-009 |
| API-013 | PATCH | /api/meters/:card_number | Rename energy card | FR-008 |
| API-014 | POST | /api/recharge | Process recharge (amount/kWh/pin) | FR-010, FR-011, FR-012 |
| API-015 | GET | /api/recharge/history | Get recharge history | FR-013 |
| API-016 | GET | /api/admin/users | List all regular users | FR-017 |
| API-017 | GET | /api/admin/users/:id | Get user detail | FR-018 |
| API-018 | GET | /api/admin/users/:id/logs | Get user security logs | FR-019 |
| API-019 | PATCH | /api/admin/users/:id/email | Update user email | FR-019 |
| API-020 | PATCH | /api/admin/users/:id/status | Update user status | FR-020 |
| API-021 | POST | /api/admin/users/:id/suspend | Suspend user | FR-020 |
| API-022 | POST | /api/admin/users/:id/unsuspend | Unsuspend user | FR-020 |
| API-023 | POST | /api/admin/users/:id/send-reset | Send password reset | FR-022 |
| API-024 | POST | /api/admin/users/:id/link | Link meter to user | FR-023 |
| API-025 | DELETE | /api/admin/users/:id/:card_number | Unlink meter from user | FR-024 |
| API-026 | POST | /api/admin/kwh-price | Update kWh price | FR-025 |
| API-027 | GET | /api/audit/admins | List all admins | FR-026 |
| API-028 | GET | /api/audit/admins/:id/profile | Get admin profile | FR-027 |
| API-029 | PATCH | /api/audit/admins/:id/status | Update admin status | FR-028 |
| API-030 | GET | /api/audit/employees | List all employees | FR-029 |
| API-031 | GET | /api/audit/employee-codes | List employee codes | FR-031 |
| API-032 | POST | /api/audit/employee-codes | Generate employee code | FR-030 |
| API-033 | GET | /api/audit/metrics/series | Get sales metrics | FR-032 |
| API-034 | GET | /api/audit/kwh-price-history | Get price history | FR-033 |
| API-035 | GET | /api/audit/security-logs | Get security logs | FR-034 |

---

# 14. Data Requirements

## 14.1 Data Entities

| Entity | Purpose |
| ------ | ------- |
| users | Core user accounts with authentication and authorization data |
| user_profiles | Personal identification and contact information |
| user_flags | User-specific flags like profile completion status |
| energy_cards | Prepaid meters with balance and ownership tracking |
| recharge_pins | Recharge transactions with PIN codes and historical pricing |
| employee_codes | One-time codes for admin/auditor registration |
| employee_code_usages | Usage tracking for employee codes |
| security_logs | Security event logging for audit trail |
| roles | User role definitions (user, admin, audit) |
| statuses | Account status definitions (Activo, Pausa, Deshabilitado, Suspendido) |
| settings | System configuration like kWh price |
| password_resets | Password reset tokens with expiration |
| user_document_changes | Audit trail for document field changes |

## 14.2 Data Dictionary

| Field | Type | Required | Meaning | Validation Rule |
| ----- | ---- | -------- | ------- | --------------- |
| users.id | INT | Yes | Primary key | Auto-increment |
| users.username | VARCHAR(50) | Yes | Unique login name | Unique, case-insensitive |
| users.email | VARCHAR(100) | Yes | Email address | Unique, valid format |
| users.password_hash | VARCHAR(255) | Yes | Bcrypt hash | Never stored in plain text |
| users.role_id | INT | Yes | Foreign key to roles | Required |
| users.status_id | INT | Yes | Foreign key to statuses | Required |
| users.created_at | TIMESTAMP | Yes | Account creation time | Default CURRENT_TIMESTAMP |
| users.last_login | TIMESTAMP | No | Last login time | Updated on login |
| users.password_changed_at | TIMESTAMP | No | Last password change | Updated on password change |
| user_profiles.user_id | INT | Yes | Foreign key to users | Unique |
| user_profiles.primer_nombre | VARCHAR(100) | Yes | First name | Required |
| user_profiles.segundo_nombre | VARCHAR(100) | No | Middle name | Optional |
| user_profiles.primer_apellido | VARCHAR(100) | Yes | Last name | Required |
| user_profiles.segundo_apellido | VARCHAR(100) | No | Second last name | Optional |
| user_profiles.tipo_identificacion | VARCHAR(50) | Yes | ID type (CC, CE, etc.) | Required |
| user_profiles.numero_identificacion | VARCHAR(100) | Yes | ID number | Unique with tipo |
| user_profiles.direccion | VARCHAR(255) | No | Address | Optional |
| user_profiles.telefono | VARCHAR(50) | No | Phone number | Unique |
| user_flags.user_id | INT | Yes | Foreign key to users | Primary key |
| user_flags.personal_data_filled | TINYINT | Yes | Profile completion flag | 0 or 1 |
| user_flags.filled_at | TIMESTAMP | No | When profile was completed | Set when flag becomes 1 |
| user_flags.document_change_used | TINYINT | Yes | Document change tracking | 0 or 1 |
| energy_cards.id | INT | Yes | Primary key | Auto-increment |
| energy_cards.user_id | INT | No | Foreign key to users | Nullable for released cards |
| energy_cards.card_number | VARCHAR(50) | Yes | Unique card identifier | Unique |
| energy_cards.name | VARCHAR(100) | No | Display name | Optional |
| energy_cards.current_balance | DECIMAL(10,2) | Yes | Current COP balance | Default 0.00 |
| energy_cards.current_kwh | DECIMAL(10,2) | Yes | Current kWh balance | Default 0.00 |
| energy_cards.last_recharge | TIMESTAMP | No | Last recharge time | Updated on recharge |
| energy_cards.released | TINYINT | Yes | Release flag | 0 = active, 1 = released |
| energy_cards.released_by_user_id | INT | No | User who released | Set when released |
| energy_cards.released_at | TIMESTAMP | No | Release timestamp | Set when released |
| recharge_pins.id | INT | Yes | Primary key | Auto-increment |
| recharge_pins.user_id | INT | Yes | Foreign key to users | Required |
| recharge_pins.card_number | VARCHAR(50) | Yes | Card recharged | Foreign key |
| recharge_pins.pin_code | VARCHAR(20) | Yes | Generated PIN | Unique |
| recharge_pins.amount | DECIMAL(10,2) | Yes | COP amount | Positive |
| recharge_pins.kwh | DECIMAL(10,2) | Yes | kWh amount | Positive |
| recharge_pins.kwh_price_at_time | DECIMAL(10,2) | No | Price at recharge time | Historical record |
| recharge_pins.created_at | TIMESTAMP | Yes | Transaction time | Default CURRENT_TIMESTAMP |
| employee_codes.id | INT | Yes | Primary key | Auto-increment |
| employee_codes.code | VARCHAR(100) | Yes | Unique code | Unique, format ROLE-XXXXXXXX |
| employee_codes.role_id | INT | Yes | Target role | Foreign key to roles |
| employee_codes.used | TINYINT | Yes | Usage flag | 0 = unused, 1 = used |
| employee_codes.employee_usage_id | INT | No | Usage record | Foreign key |
| employee_codes.created_at | TIMESTAMP | Yes | Creation time | Default CURRENT_TIMESTAMP |
| employee_codes.used_at | TIMESTAMP | No | Usage time | Set when used |
| security_logs.id | INT | Yes | Primary key | Auto-increment |
| security_logs.event_type | VARCHAR(50) | Yes | Event type | LOGIN, LOGOUT, etc. |
| security_logs.username | VARCHAR(50) | No | Associated username | Optional |
| security_logs.event_time | TIMESTAMP | Yes | Event timestamp | Default CURRENT_TIMESTAMP |
| security_logs.ip_address | VARCHAR(45) | No | Client IP | IPv4/IPv6 |
| security_logs.details | TEXT | No | Additional details | JSON-serializable |
| settings.key | VARCHAR(100) | Yes | Setting key | Unique |
| settings.value | VARCHAR(255) | Yes | Setting value | |
| password_resets.user_id | INT | Yes | Foreign key to users | Required |
| password_resets.token_hash | CHAR(64) | Yes | SHA-256 hash of token | Unique |
| password_resets.expires_at | TIMESTAMP | Yes | Expiration time | 1 hour from creation |
| password_resets.used_at | TIMESTAMP | No | Usage time | Set when used |
| kwh_price_history.admin_user_id | INT | Yes | Admin who changed price | Foreign key |
| kwh_price_history.price_cop | DECIMAL(10,2) | Yes | New price value | Positive |
| kwh_price_history.created_at | TIMESTAMP | Yes | Change timestamp | Default CURRENT_TIMESTAMP |

## 14.3 Data Storage Rules

| ID     | Requirement      |
| ------ | ---------------- |
| DR-001 | The system shall store password hashes using bcrypt with cost factor 10 |
| DR-002 | The system shall store kWh price in settings table and history in kwh_price_history |
| DR-003 | The system shall store kwh_price_at_time with each recharge transaction for historical accuracy |
| DR-004 | The system shall use DECIMAL(10,2) for all monetary and energy values |
| DR-005 | The system shall store session data in server-side session store (database) |

## 14.4 Data Integrity Rules

| ID     | Rule |
| ------ | ---- |
| DI-001 | Username must be unique across all users (case-insensitive) |
| DI-002 | Email must be unique across all users (case-insensitive) |
| DI-003 | Card number must be unique across all energy cards |
| DI-004 | Document type + number combination must be unique across all user profiles |
| DI-005 | Phone number must be unique across all user profiles |
| DI-006 | PIN code must be unique across all recharge records |
| DI-007 | Employee code must be unique across all codes |
| DI-008 | Recharge operations must use row-level locking to prevent concurrent modification |
| DI-009 | Document changes can only occur once per user (enforced by unique constraint) |

---

# 15. Security Requirements

| ID      | Requirement         | Verification Method |
| ------- | ------------------- | ------------------- |
| SEC-001 | The system shall hash passwords using bcrypt with cost factor 10 | Code review |
| SEC-002 | The system shall use session-based authentication with httpOnly cookies | Code review |
| SEC-003 | The system shall validate all inputs using Joi schemas | Test with invalid inputs |
| SEC-004 | The system shall use parameterized SQL queries to prevent injection | Code review |
| SEC-005 | The system shall log all security-relevant events | Review security_logs table |
| SEC-006 | The system shall implement role-based access control | Test unauthorized access |
| SEC-007 | The system shall validate user status on each authenticated request | Code review |
| SEC-008 | The system shall return generic error messages for authentication failures | Test login with wrong credentials |
| SEC-009 | The system shall set security headers (CSP, X-Frame-Options, X-Content-Type-Options) | Browser inspection |
| SEC-010 | The system shall block access to hidden files in production | Test access to .env file |
| SEC-011 | The system shall implement CORS with credential support | Configuration review |
| SEC-012 | The system shall extract client IP from X-Forwarded-For header | Code review |
| SEC-013 | The system must not store passwords in plain text | Code review |
| SEC-014 | The system must not expose password hashes in API responses | Test API responses |
| SEC-015 | The system must not reveal whether username or email exists during authentication | Test login with different credentials |

---

# 16. Compliance Requirements

Use only when checking legal, institutional, rubric, security, privacy, or technical compliance.

| ID       | Compliance Rule | Required System Behavior | Evidence Needed |
| -------- | --------------- | ------------------------ | --------------- |
| COMP-001 | Data Privacy - Personal Data | System shall only collect and store personal data necessary for service delivery | Privacy policy, data minimization review |
| COMP-002 | Data Retention - Transaction History | System shall retain recharge history indefinitely | Database records |
| COMP-003 | Data Retention - Price History | System shall retain kWh price change history indefinitely | kwh_price_history table |
| COMP-004 | Audit Trail - Security Logs | System shall maintain security logs for forensic analysis | security_logs table completeness |
| COMP-005 | Unique Identification | System shall enforce uniqueness constraints on username, email, card number, document, phone | Database constraints |
| COMP-006 | Session Security | System shall use server-side session storage with secure cookies | Session configuration review |

---

# 17. Non-Functional Requirements

## 17.1 Performance

| ID       | Requirement      | Measurement |
| -------- | ---------------- | ----------- |
| PERF-001 | The system shall authenticate users in less than 1 second | Response time measurement |
| PERF-001 | The system shall process recharge transactions in less than 1 second | Response time measurement |
| PERF-001 | The system shall load dashboard data in less than 2 seconds | Response time measurement |
| PERF-002 | The system shall handle concurrent recharge operations without data corruption | Row-level locking verification |

## 17.2 Reliability

| ID      | Requirement      | Measurement |
| ------- | ---------------- | ----------- |
| REL-001 | The system shall maintain data integrity during transaction failures | Rollback testing |
| REL-002 | The system shall prevent duplicate entries through database constraints | Constraint verification |
| REL-003 | The system shall log security events even when main operations fail | Error handling review |

## 17.3 Maintainability

| ID      | Requirement      | Verification |
| ------- | ---------------- | ------------ |
| MNT-001 | The system shall use parameterized queries for all database operations | Code review |
| MNT-002 | The system shall use Joi schemas for validation in both frontend and backend | Schema consistency review |
| MNT-003 | The system shall separate concerns in backend (routes, services, repositories) | Architecture review |

## 17.4 Availability

| ID      | Requirement      | Measurement |
| ------- | ---------------- | ----------- |
| AVL-001 | The system shall be deployable on cloud infrastructure | Deployment configuration |
| AVL-001 | The system shall support horizontal scaling for API tier | Architecture design |

---

# 18. LLM-Specific Requirements

Use only if the software uses an LLM.

N/A - This system does not use an LLM.

---

# 19. Test Requirements

## 19.1 Test Case Format

| Field               | Value                                                      |
| ------------------- | ---------------------------------------------------------- |
| Test Case ID        | TC-001                                                     |
| Related Requirement |                                                            |
| Test Type           | Functional / API / UI / Security / Regression / Compliance |
| Preconditions       |                                                            |
| Test Data           |                                                            |
| Steps               |                                                            |
| Expected Result     |                                                            |
| Pass / Fail Rule    |                                                            |

## 19.2 Required Test Coverage

| Requirement ID | Required Test Type | Test Case ID |
| -------------- | ------------------ | ------------ |
| FR-001 | Functional | TC-001 - Login with valid credentials succeeds |
| FR-001 | Functional | TC-002 - Login with invalid credentials fails |
| FR-001 | Functional | TC-003 - Login with disabled account fails |
| FR-002 | Functional | TC-004 - Registration with valid data succeeds |
| FR-002 | Functional | TC-005 - Registration with duplicate username fails |
| FR-002 | Functional | TC-006 - Registration with weak password fails |
| FR-003 | Security | TC-007 - Unauthorized user cannot access admin endpoints |
| FR-003 | Security | TC-008 - Unauthorized user cannot access audit endpoints |
| FR-004 | Functional | TC-009 - Profile update with valid data succeeds |
| FR-004 | Functional | TC-010 - Profile update with duplicate document fails |
| FR-005 | Functional | TC-011 - Password change with correct current password succeeds |
| FR-005 | Functional | TC-012 - Password change with incorrect current password fails |
| FR-005 | Functional | TC-013 - Password change with weak new password fails |
| FR-006 | Functional | TC-014 - Password reset with valid token succeeds |
| FR-006 | Functional | TC-015 - Password reset with expired token fails |
| FR-007 | Functional | TC-016 - Add new meter with valid serial succeeds |
| FR-007 | Functional | TC-017 - Add meter with already linked serial fails |
| FR-008 | Functional | TC-018 - Rename meter succeeds |
| FR-009 | Functional | TC-019 - Release meter succeeds |
| FR-010 | Functional | TC-020 - Recharge by COP amount succeeds |
| FR-010 | Functional | TC-021 - Recharge by COP with invalid amount fails |
| FR-011 | Functional | TC-022 - Recharge by kWh succeeds |
| FR-012 | Functional | TC-023 - Generated PIN is 20 digits with valid Luhn |
| FR-012 | Functional | TC-024 - PIN recharge with invalid PIN fails |
| FR-013 | Functional | TC-025 - User sees own recharge history |
| FR-013 | Functional | TC-026 - Admin sees all users' recharge history |
| FR-014 | Functional | TC-027 - Pause account succeeds |
| FR-014 | Functional | TC-028 - Paused user cannot recharge |
| FR-014 | Functional | TC-029 - Reactivate account succeeds |
| FR-015 | Functional | TC-030 - Profile prompt shown for incomplete profile |
| FR-016 | Functional | TC-031 - Document change limited to once |
| FR-017 | API | TC-032 - Admin can list all users |
| FR-018 | API | TC-033 - Admin can view user detail |
| FR-019 | API | TC-034 - Admin can update user email |
| FR-020 | API | TC-035 - Admin can change user status |
| FR-021 | API | TC-036 - Admin can suspend user |
| FR-021 | API | TC-037 - Admin can unsuspend user |
| FR-022 | API | TC-038 - Admin can send password reset |
| FR-023 | API | TC-039 - Admin can link meter to user |
| FR-024 | API | TC-040 - Admin can unlink meter from user |
| FR-025 | API | TC-041 - Admin can update kWh price |
| FR-026 | API | TC-042 - Auditor can list admins |
| FR-027 | API | TC-043 - Auditor can view admin profile |
| FR-028 | API | TC-044 - Auditor can update admin status |
| FR-029 | API | TC-045 - Auditor can list employees |
| FR-030 | API | TC-046 - Auditor can generate employee code |
| FR-031 | API | TC-047 - Auditor can list employee codes |
| FR-032 | API | TC-048 - Auditor can view sales metrics |
| FR-033 | API | TC-049 - Auditor can view kWh price history |
| FR-034 | API | TC-050 - Auditor can view security logs |
| FR-035 | Compliance | TC-051 - All login events are logged |
| FR-035 | Compliance | TC-052 - All logout events are logged |
| FR-035 | Compliance | TC-053 - All recharge events are logged |
| FR-036 | Functional | TC-054 - Invalid input returns 400 with error message |
| SEC-001 | Security | TC-055 - Passwords are bcrypt hashed in database |
| SEC-003 | Security | TC-056 - SQL injection attempts are rejected |
| SEC-004 | Security | TC-057 - XSS attempts in input are rejected |
| SEC-006 | Security | TC-058 - Role-based access is enforced |

---

# 20. Traceability Matrix

| Requirement ID | Business Rule | API / UI / Data Element | Test Case | Status |
| -------------- | ------------- | ----------------------- | --------- | ------ |
| FR-001 | BR-011 | API-001, API-003 | TC-001, TC-002, TC-003 | |
| FR-002 | BR-001, BR-002 | API-002 | TC-004, TC-005, TC-006 | |
| FR-003 | BR-011 | API endpoints with RBAC | TC-007, TC-008 | |
| FR-004 | BR-004 | API-006, API-007, users, user_profiles | TC-009, TC-010 | |
| FR-005 | BR-002 | API-008 | TC-011, TC-012, TC-013 | |
| FR-006 | BR-016 | API-004, API-005, password_resets | TC-014, TC-015 | |
| FR-007 | BR-003, BR-017 | API-010, API-011, energy_cards | TC-016, TC-017 | |
| FR-008 | BR-003 | API-013 | TC-018 | |
| FR-009 | BR-017 | API-012 | TC-019 | |
| FR-010 | BR-012, BR-013 | API-014, recharge_pins | TC-020, TC-021 | |
| FR-011 | BR-012, BR-013 | API-014, recharge_pins | TC-022 | |
| FR-012 | BR-007 | API-014, recharge_pins | TC-023, TC-024 | |
| FR-013 | BR-014 | API-006, API-015 | TC-025, TC-026 | |
| FR-014 | BR-006 | API-009 | TC-027, TC-028, TC-029 | |
| FR-015 | BR-015 | UI prompt, user_flags | TC-030 | |
| FR-016 | BR-005 | API-007, user_document_changes | TC-031 | |
| FR-017 | BR-001 | API-016 | TC-032 | |
| FR-018 | BR-001 | API-017 | TC-033 | |
| FR-019 | BR-001 | API-019 | TC-034 | |
| FR-020 | BR-006 | API-020 | TC-035 | |
| FR-021 | BR-006 | API-021, API-022 | TC-036, TC-037 | |
| FR-022 | BR-016 | API-023 | TC-038 | |
| FR-023 | BR-017 | API-024 | TC-039 | |
| FR-024 | BR-017 | API-025 | TC-040 | |
| FR-025 | BR-008 | API-026, settings, kwh_price_history | TC-041 | |
| FR-026 | BR-001 | API-027 | TC-042 | |
| FR-027 | BR-001 | API-028 | TC-043 | |
| FR-028 | BR-018 | API-029 | TC-044 | |
| FR-029 | BR-001 | API-030 | TC-045 | |
| FR-030 | BR-009 | API-032, employee_codes | TC-046 | |
| FR-031 | BR-009 | API-031 | TC-047 | |
| FR-032 | BR-014 | API-033 | TC-048 | |
| FR-033 | BR-008 | API-034 | TC-049 | |
| FR-034 | BR-010 | API-035, security_logs | TC-050 | |
| FR-035 | BR-010 | security_logs | TC-051, TC-052, TC-053 | |
| FR-036 | All VAL-* | Validation schemas | TC-054 | |
| SEC-001 | BR-002 | Password storage | TC-055 | |
| SEC-003 | N/A | Parameterized queries | TC-056 | |
| SEC-004 | N/A | Input validation | TC-057 | |
| SEC-006 | BR-011 | Authorization middleware | TC-058 | |

---

# 21. Acceptance Criteria

| ID      | Acceptance Criterion                                                                 |
| ------- | ------------------------------------------------------------------------------------ |
| ACC-001 | Every mandatory functional requirement shall have at least one related test case.    |
| ACC-002 | Every security requirement shall have verification evidence.                         |
| ACC-003 | Every validation rule shall have positive and negative test coverage.                |
| ACC-004 | Every API requirement shall define success and error behavior.                       |
| ACC-005 | All user roles shall have test coverage for their allowed actions.                   |
| ACC-006 | All account status transitions shall be tested.                                      |
| ACC-007 | All business rules shall be enforced in the implementation.                          |
| ACC-008 | All data integrity constraints shall be verified in the database.                    |
| ACC-009 | All security logging shall be verified by checking security_logs table.              |
| ACC-010 | The system shall handle all documented error conditions appropriately.               |

---

# 22. Excluded From LLM Review Context

These sections should not be sent to the LLM when the task is bug review, compliance review, test coverage, or implementation checking.

| Excluded Data              | Reason                                                    |
| -------------------------- | --------------------------------------------------------- |
| Document title             | Does not define system behavior                           |
| Document version           | Administrative metadata                                   |
| Revision history           | Administrative metadata                                   |
| Author                     | Ownership metadata                                        |
| Owner                      | Ownership metadata                                        |
| Reviewed by                | Approval metadata                                         |
| Approved by                | Approval metadata                                         |
| Signature table            | Approval metadata                                         |
| Project sponsor            | Administrative metadata                                   |
| Approval dates             | Administrative metadata                                   |
| Change authors             | Administrative metadata                                   |
| Document status            | Administrative metadata unless checking governance        |
| Full release checklist     | Not needed unless checking deployment readiness           |
| Hardware interface section | Exclude unless the software interacts with hardware       |
| Backup section             | Exclude unless stored data recovery is part of the review |
| Migration section          | Exclude unless reviewing database migration behavior      |

---

```text
Rule:
Only include SRS data that defines behavior, terminology, validation, security, data handling, interface behavior, error handling, constraints, tests, compliance, or pass/fail criteria.
```