import { useState, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getDashboard, auditGetMetrics, auditGetKwhPriceHistory, DashboardResponse, AuditMetrics, KwhPriceHistoryEntry } from '../../api/client';

export class RoleSelector {
  private normalizedRole: 'admin' | 'audit' | 'user' | null;

  constructor(role: string | null) {
    this.normalizedRole = this.normalizeRole(role);
  }

  private normalizeRole(role: string | null): 'admin' | 'audit' | 'user' | null {
    if (!role) return null;
    const norm = role.toLowerCase();
    if (norm === 'admin' || norm === 'administrator' || norm === 'administrador') return 'admin';
    if (norm === 'audit' || norm === 'auditor' || norm === 'auditoría' || norm === 'auditoria') return 'audit';
    return 'user';
  }

  isAdmin(): boolean {
    return this.normalizedRole === 'admin';
  }

  isAudit(): boolean {
    return this.normalizedRole === 'audit';
  }

  isUser(): boolean {
    return this.normalizedRole === 'user';
  }

  getRole(): 'admin' | 'audit' | 'user' | null {
    return this.normalizedRole;
  }
}

export interface DashboardCommonResult {
  data: DashboardResponse | null;
  setData: React.Dispatch<React.SetStateAction<DashboardResponse | null>>;
  loading: boolean;
  error: string | null;
  kwhPriceHistory: KwhPriceHistoryEntry[];
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCard: string | null;
  setSelectedCard: React.Dispatch<React.SetStateAction<string | null>>;
  fetchDashboard: () => Promise<void>;
  isAdmin: boolean;
  isAudit: boolean;
  isPaused: boolean;
  selectedCardData: any;
  showRechargeSection: boolean;
  showAdminPrice: boolean;
  showHistory: boolean;
  showAuditMetrics: boolean;
  showSecurityLogs: boolean;
  showAdminNavigation: boolean;
  sidebarUser: { username: string | null | undefined; status: string | null | undefined; role: string | null | undefined };
}

export function useDashboardCommon(
  userRole: string | null | undefined,
  userStatus: string | null | undefined,
  userUsername: string | null | undefined,
  setAuditMetrics: (metrics: AuditMetrics | null) => void
): DashboardCommonResult {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kwhPriceHistory, setKwhPriceHistory] = useState<KwhPriceHistoryEntry[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const roleSelector = useMemo(() => new RoleSelector(userRole ?? null), [userRole]);
  const isAdmin = roleSelector.isAdmin();
  const isAudit = roleSelector.isAudit();
  const isUser = roleSelector.isUser();
  const isPaused = userStatus === 'Pausa';

  const sidebarUser = useMemo(() => ({
    username: userUsername ?? '',
    status: userStatus,
    role: userRole
  }), [userUsername, userStatus, userRole]);

  const selectedCardData = useMemo(() => {
    if (!selectedCard || !data?.cards) return null;
    return data.cards.find((c: any) => c.card_number === selectedCard) ?? null;
  }, [selectedCard, data?.cards]);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getDashboard();
      setData(result);
      if (result.cards && result.cards.length > 0 && !selectedCard) {
        setSelectedCard(result.cards[0].card_number);
      }

      if (isAudit) {
        auditGetMetrics(30).then(metrics => setAuditMetrics(metrics)).catch(console.error);
        auditGetKwhPriceHistory().then(history => setKwhPriceHistory(history.history)).catch(console.error);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isAudit, selectedCard, setAuditMetrics]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard])
  );

  const showRechargeSection = !isPaused && isUser;
  const showAdminPrice = isAdmin;
  const showHistory = !!(data?.recharge_history && data.recharge_history.length > 0);
  const showAuditMetrics = isAudit;
  const showSecurityLogs = isAudit && !!(data?.security_logs && data.security_logs.length > 0);
  const showAdminNavigation = isAdmin || isAudit;

  return {
    data,
    setData,
    loading,
    error,
    kwhPriceHistory,
    sidebarOpen,
    setSidebarOpen,
    selectedCard,
    setSelectedCard,
    fetchDashboard,
    isAdmin,
    isAudit,
    isPaused,
    selectedCardData,
    showRechargeSection,
    showAdminPrice,
    showHistory,
    showAuditMetrics,
    showSecurityLogs,
    showAdminNavigation,
    sidebarUser
  };
}