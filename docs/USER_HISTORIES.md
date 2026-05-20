# User Histories (UHs) per Role

This document lists all user histories (UHs) available for each role in the Energo system.

---

## Regular User

| UH # | Action/History | Description |
|------|----------------|-------------|
| UH-001 | Login | Authenticate with username/password |
| UH-002 | Logout | End session |
| UH-003 | View Dashboard | View meter balance, kWh price, and status |
| UH-004 | Recharge (COP) | Recharge energy by specifying pesos |
| UH-005 | Recharge (kWh) | Recharge energy by specifying kWh |
| UH-006 | Recharge (PIN) | Redeem PIN code for energy |
| UH-007 | View Recharge History | View list of past recharges with PIN, amount, kWh, date |
| UH-008 | View Profile | View personal data (names, document, address, phone) |
| UH-009 | Update Profile | Edit personal data (one-time document change allowed) |
| UH-010 | Change Password | Update account password |
| UH-011 | Add Meter | Add new meter by serial number |
| UH-012 | Rename Meter | Edit name of linked meter |
| UH-013 | Release Meter | Unlink meter from account |
| UH-014 | Pause Account | Set account status to Pausa (temporary) |
| UH-015 | Disable Account | Set account status to Deshabilitado (permanent) |

---

## Admin

All Regular User UHs (UH-001 to UH-008, UH-010 to UH-013) plus:

| UH # | Action/History | Description |
|------|----------------|-------------|
| UH-101 | View All Users | List all registered users with search |
| UH-102 | View User Detail | View detailed user information |
| UH-103 | View User Logs | View activity logs for specific user |
| UH-104 | Update User Email | Modify user email address |
| UH-105 | Send Password Reset | Send password recovery link to user |
| UH-106 | Link Meter | Assign meter to user account |
| UH-107 | Unlink Meter | Remove meter from user account |
| UH-108 | Update User Status | Change user status (Activo/Pausa/Deshabilitado/Suspendido) |
| UH-109 | Suspend User | Temporarily suspend user account |
| UH-110 | Reactivate User | Remove suspension from user account |
| UH-111 | Update kWh Price | Modify price per kWh |
| UH-112 | View All Recharge History | View complete recharge history of all users |

---

## Auditor

| UH # | Action/History | Description |
|------|----------------|-------------|
| UH-201 | View Admins | List all admin users |
| UH-202 | View Admin Profile | View detailed profile of admin |
| UH-203 | Update Admin Status | Change admin status (Activo/Deshabilitado) |
| UH-204 | View Employees | List all employees (admin + auditor) |
| UH-205 | Generate Employee Code | Create one-time-use code for admin or auditor role |
| UH-206 | View Employee Codes | List all generated employee codes |
| UH-207 | View Sales Metrics | View sales totals and daily breakdown |
| UH-208 | View kWh Price History | View historical kWh price changes |
| UH-209 | View Security Logs | View security event logs for all users |

---

## Role Summary

| Role | Total UHs |
|------|-----------|
| Regular User | 15 |
| Admin | 12 additional (27 total) |
| Auditor | 9 |

---

## Notes

- Regular users cannot access admin or auditor features.
- Admins have all regular user capabilities plus administrative controls.
- Auditors have monitoring and employee management capabilities without direct user management.
- User status transitions: Activo, Pausa, Deshabilitado, Suspendido.