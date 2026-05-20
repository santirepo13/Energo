import { useState } from 'react';
import { AuditMetrics } from '../../../api/client';

export function useDashboardAudit() {
  const [auditMetrics, setAuditMetrics] = useState<AuditMetrics | null>(null);

  return {
    auditMetrics,
    setAuditMetrics
  };
}