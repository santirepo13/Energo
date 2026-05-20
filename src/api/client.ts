// Barrel export file - re-exports all API modules for backward compatibility
// This maintains the existing import path: `from './api/client'`

// Instance (axios client with interceptor)
export { api } from './instance';

// Auth module
export {
  login,
  registerUser,
  type LoginRequest,
  type RegisterRequest,
} from './auth';

// Dashboard module
export {
  getDashboard,
  health,
  type DashboardResponse,
  type UserInfo,
} from './dashboard';

// Profile module
export {
  meGetProfile,
  meUpdateProfile,
  meChangePassword,
  meUpdateStatus,
  type UserProfile,
  type MeProfileResponse,
  type UpdateProfileRequest,
  type SelfStatus,
} from './profile';

// Recharge module
export {
  recharge,
  type RechargeRequest,
} from './recharge';

// Meters module
export {
  meListMeters,
  meAddMeter,
  meReleaseMeter,
  meRenameMeter,
  type UserMeter,
} from './meters';

// Admin module
export {
  adminListUsers,
  adminGetUserDetail,
  adminGetUserLogs,
  adminLinkMeterToUser,
  adminRemoveUserMeter,
  adminSendPasswordReset,
  adminUpdateUserEmail,
  adminUpdateUserStatus,
  adminSuspendUser,
  adminUnsuspendUser,
  adminUpdateKwhPrice,
  type AdminUserRow,
  type AdminUserDetail,
} from './admin';

// Audit module
export {
  auditGetAdmins,
  auditGetAdminProfile,
  auditUpdateAdminStatus,
  auditGetEmployees,
  auditGetEmployeeCodes,
  auditGenerateEmployeeCode,
  auditGetMetrics,
  auditGetKwhPriceHistory,
  type AuditMetrics,
  type KwhPriceHistoryEntry,
  type EmployeeCodeRow,
} from './audit';

// Mock module
export {
  mockPausaVerify,
} from './mock';
