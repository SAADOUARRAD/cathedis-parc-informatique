'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  Skeleton,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Snackbar,
  Alert,
  DialogActions,
  CircularProgress,
  InputAdornment,
  Tooltip,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Computer as ComputerIcon,
  PlayArrow as PlayArrowIcon,
  Done as DoneIcon,
  Assessment as AssessmentIcon,
  MonetizationOn as MonetizationOnIcon,
  LaptopMac as LaptopIcon,
  DesktopWindows as MonitorIcon,
  FlashOn as FlashIcon,
  Search as SearchIcon,
  ContentCopy as ContentCopyIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Speed as SpeedIcon,
  Shield as ShieldIcon,
  Handyman as HandymanIcon
} from '@mui/icons-material';

interface Maintenance {
  id: string;
  description: string;
  status: 'REPORTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string;
  diagnosis?: string;
  solution?: string;
  cost?: number | null;
  equipmentName: string;
  equipmentId?: string;
  serialNumber: string;
  reportedBy: string;
  createdAt: string;
}

interface EquipmentInMaintenance {
  id: string;
  name: string;
  serialNumber: string;
  categoryName: string;
  departmentName: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  REPORTED: { label: 'Signalé • À traiter', color: '#D97706', bgColor: '#FEF3C7', borderColor: '#FDE68A' },
  ASSIGNED: { label: 'Assigné', color: '#2563EB', bgColor: '#DBEAFE', borderColor: '#BFDBFE' },
  IN_PROGRESS: { label: 'En cours de réparation', color: '#7C3AED', bgColor: '#F5F3FF', borderColor: '#DDD6FE' },
  COMPLETED: { label: 'Résolu & Conforme', color: '#059669', bgColor: '#D1FAE5', borderColor: '#A7F3D0' },
  CANCELLED: { label: 'Annulé', color: '#DC2626', bgColor: '#FEE2E2', borderColor: '#FECACA' },
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  LOW: { label: 'Basse', color: '#0284C7', bgColor: '#E0F2FE', icon: '🟢' },
  MEDIUM: { label: 'Normale', color: '#D97706', bgColor: '#FEF3C7', icon: '🟠' },
  HIGH: { label: 'Haute', color: '#EA580C', bgColor: '#FFEDD5', icon: '🔴' },
  CRITICAL: { label: 'Urgente', color: '#DC2626', bgColor: '#FEE2E2', icon: '⚡' },
};

export default function TechnicianDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [assignedMaintenances, setAssignedMaintenances] = useState<Maintenance[]>([]);
  const [completedMaintenances, setCompletedMaintenances] = useState<Maintenance[]>([]);
  const [equipmentInMaintenance, setEquipmentInMaintenance] = useState<EquipmentInMaintenance[]>([]);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    inProgressCount: 0,
    criticalCount: 0,
    completedThisMonth: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Finalize Repair Modal
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [solution, setSolution] = useState('');
  const [cost, setCost] = useState<number | ''>('');
  const [actionLoading, setActionLoading] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchData = async () => {
    try {
      const response = await fetch('/api/dashboard/technician-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || { totalAssigned: 0, inProgressCount: 0, criticalCount: 0, completedThisMonth: 0 });
        setAssignedMaintenances(data.assignedMaintenances || []);
        setCompletedMaintenances(data.completedMaintenances || []);
        setEquipmentInMaintenance(data.equipmentInMaintenance || []);
      }
    } catch (err) {
      console.error('Error loading technician dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartRepair = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/maintenances/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: 'Intervention démarrée • Statut passé à "En cours"', severity: 'success' });
        fetchData();
      } else {
        setSnackbar({ open: true, message: 'Erreur lors de la prise en charge', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Erreur réseau', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalizeRepairClick = (m: Maintenance) => {
    setSelectedMaintenance(m);
    setDiagnosis(m.diagnosis || '');
    setSolution(m.solution || '');
    setCost(m.cost ? Number(m.cost) : '');
    setOpenDialog(true);
  };

  const handleFinalizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaintenance) return;
    if (!diagnosis.trim() || !solution.trim()) {
      setSnackbar({ open: true, message: 'Le diagnostic et la solution sont obligatoires', severity: 'error' });
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`/api/maintenances/${selectedMaintenance.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          diagnosis,
          solution,
          cost: cost ? Number(cost) : 0,
        }),
      });

      if (res.ok) {
        setSnackbar({ open: true, message: 'Réparation finalisée avec succès ! Matériel remis en service.', severity: 'success' });
        setOpenDialog(false);
        fetchData();
      } else {
        setSnackbar({ open: true, message: 'Erreur lors de la clôture', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Erreur réseau', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopySerial = (sn: string) => {
    navigator.clipboard.writeText(sn);
    setSnackbar({ open: true, message: `N° de série ${sn} copié !`, severity: 'info' });
  };

  const getEquipmentIcon = (categoryName?: string) => {
    const cat = categoryName?.toLowerCase() || '';
    if (cat.includes('laptop') || cat.includes('portable')) return <LaptopIcon sx={{ fontSize: 22, color: '#E31E24' }} />;
    if (cat.includes('écran') || cat.includes('ecran') || cat.includes('moniteur')) return <MonitorIcon sx={{ fontSize: 22, color: '#E31E24' }} />;
    return <ComputerIcon sx={{ fontSize: 22, color: '#E31E24' }} />;
  };

  // Filter active maintenances
  const filteredMaintenances = assignedMaintenances.filter((m) => {
    const matchesSearch =
      searchQuery === '' ||
      m.equipmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.reportedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'REPORTED' && (m.status === 'REPORTED' || m.status === 'ASSIGNED')) ||
      (statusFilter === 'IN_PROGRESS' && m.status === 'IN_PROGRESS') ||
      (statusFilter === 'CRITICAL' && (m.priority === 'HIGH' || m.priority === 'CRITICAL'));

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 1.5, md: 3 } }}>
        <Skeleton variant="rounded" height={160} sx={{ borderRadius: 4 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={110} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
          <Skeleton variant="rounded" height={380} sx={{ borderRadius: 4 }} />
          <Skeleton variant="rounded" height={380} sx={{ borderRadius: 4 }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
      
      {/* 1. Hero Banner */}
      <Box sx={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF1F1 50%, #FFE2E2 100%)',
        borderRadius: 4,
        p: { xs: 3, md: 4 },
        color: '#1A1A2E',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(227, 30, 36, 0.08)',
        border: '1px solid rgba(227, 30, 36, 0.2)',
        borderLeft: '6px solid #E31E24',
      }}>
        {/* Glow Spheres */}
        <Box sx={{ position: 'absolute', top: -50, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.15) 0%, rgba(227,30,36,0) 70%)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: 200, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.08) 0%, rgba(227,30,36,0) 70%)' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ maxWidth: 680 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.8, py: 0.6, borderRadius: 10, bgcolor: 'rgba(227, 30, 36, 0.1)', border: '1px solid rgba(227, 30, 36, 0.25)', mb: 1.5 }}>
              <HandymanIcon sx={{ fontSize: 16, color: '#E31E24' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#C41018', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Atelier Technique & Support Hardware • Cathedis
              </Typography>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: { xs: '1.6rem', md: '2.1rem' }, letterSpacing: '-0.02em', mb: 1 }}>
              Bonjour, {session?.user?.name || 'Technicien IT'} 🛠️
            </Typography>

            <Typography sx={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 500 }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — Centre de pilotage des interventions, diagnostic de pannes et gestion des réparations en temps réel.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Paper elevation={0} sx={{ px: 2.5, py: 1.5, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid rgba(227, 30, 36, 0.2)', boxShadow: '0 4px 12px rgba(227, 30, 36, 0.08)', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#E31E24', lineHeight: 1 }}>{stats.totalAssigned}</Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Tickets Actifs</Typography>
            </Paper>
            <Paper elevation={0} sx={{ px: 2.5, py: 1.5, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid rgba(16, 185, 129, 0.25)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669', lineHeight: 1 }}>{stats.completedThisMonth}</Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Résolus ce mois</Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* 2. KPI Metrics Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {[
          {
            title: 'Tickets à Traiter',
            value: stats.totalAssigned,
            color: '#D97706',
            gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
            sub: 'En attente & assignés',
            icon: <BuildIcon sx={{ fontSize: 26 }} />,
          },
          {
            title: 'En Cours de Réparation',
            value: stats.inProgressCount,
            color: '#7C3AED',
            gradient: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            sub: 'Interventions actives',
            icon: <ScheduleIcon sx={{ fontSize: 26 }} />,
          },
          {
            title: 'Haute Priorité / Urgences',
            value: stats.criticalCount,
            color: '#DC2626',
            gradient: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
            sub: 'Blocages immédiats',
            icon: <WarningIcon sx={{ fontSize: 26 }} />,
          },
          {
            title: 'Résolus ce mois',
            value: stats.completedThisMonth,
            color: '#059669',
            gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            sub: 'Clôturés avec succès',
            icon: <CheckCircleIcon sx={{ fontSize: 26 }} />,
          },
        ].map((card, idx) => (
          <Paper
            key={idx}
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
                borderColor: card.color,
              }
            }}
          >
            <Box sx={{ height: 4, position: 'absolute', top: 0, left: 0, right: 0, background: card.gradient }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  {card.title}
                </Typography>
                <Typography sx={{ fontSize: '1.9rem', fontWeight: 900, color: '#1A1A2E', lineHeight: 1.2, mt: 0.5 }}>
                  {card.value}
                </Typography>
              </Box>

              <Avatar sx={{ width: 46, height: 46, background: card.gradient, color: '#FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {card.icon}
              </Avatar>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #F1F5F9' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                {card.sub}
              </Typography>
              <Chip label="Détails" size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, bgcolor: '#F8FAFC', color: card.color }} />
            </Box>
          </Paper>
        ))}
      </Box>

      {/* 3. Search & Filter Bar */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        bgcolor: '#FFFFFF',
        p: 2,
        borderRadius: 3,
        border: '1px solid #E2E8F0',
      }}>
        <TextField
          size="small"
          placeholder="Rechercher par équipement, N° de série, demandeur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flex: '1 1 300px' }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'Tous les tickets' },
            { id: 'REPORTED', label: 'À Traiter 📨' },
            { id: 'IN_PROGRESS', label: 'En Cours ⚙️' },
            { id: 'CRITICAL', label: 'Urgences ⚡' },
          ].map((f) => (
            <Chip
              key={f.id}
              label={f.label}
              onClick={() => setStatusFilter(f.id)}
              variant={statusFilter === f.id ? 'filled' : 'outlined'}
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                bgcolor: statusFilter === f.id ? '#1A1A2E' : undefined,
                color: statusFilter === f.id ? '#FFFFFF' : '#475569',
                borderColor: '#CBD5E1',
                '&:hover': { bgcolor: statusFilter === f.id ? '#0F172A' : '#F1F5F9' }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* 4. Two-Column Workspace */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.8fr 1fr' }, gap: 3 }}>
        
        {/* Left Column: Active Maintenances Queue */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon sx={{ color: '#E31E24' }} /> File d'Interventions Actives ({filteredMaintenances.length})
            </Typography>
          </Box>

          {filteredMaintenances.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                borderRadius: 3.5,
                bgcolor: '#FFFFFF',
                border: '2px dashed #E2E8F0',
                textAlign: 'center',
              }}
            >
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(5, 150, 105, 0.08)', color: '#059669', mx: 'auto', mb: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 36 }} />
              </Avatar>
              <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1.1rem', mb: 0.5 }}>
                Aucune maintenance en attente
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Tous les tickets ont été traités ou aucun filtre ne correspond à la recherche.
              </Typography>
            </Paper>
          ) : (
            filteredMaintenances.map((maintenance) => {
              const sc = statusConfig[maintenance.status] || statusConfig.REPORTED;
              const pc = priorityConfig[maintenance.priority] || priorityConfig.MEDIUM;

              return (
                <Paper
                  key={maintenance.id}
                  elevation={0}
                  sx={{
                    borderRadius: 3.5,
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderLeft: `6px solid ${sc.color}`,
                    p: { xs: 2.5, md: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
                      borderColor: sc.color,
                    },
                  }}
                >
                  <Box>
                    {/* Top Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 42, height: 42, bgcolor: sc.bgColor, color: sc.color }}>
                          {getEquipmentIcon(maintenance.equipmentName)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1A1A2E' }}>
                            {maintenance.equipmentName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                            <Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748B', bgcolor: '#F8FAFC', px: 1, py: 0.2, borderRadius: 1 }}>
                              SN: {maintenance.serialNumber || '-'}
                            </Typography>
                            {maintenance.serialNumber && (
                              <Tooltip title="Copier le N° de série">
                                <IconButton size="small" onClick={() => handleCopySerial(maintenance.serialNumber)} sx={{ p: 0.2, color: '#94A3B8' }}>
                                  <ContentCopyIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={sc.label}
                          size="small"
                          sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: sc.bgColor, color: sc.color, border: `1px solid ${sc.borderColor}` }}
                        />
                        <Chip
                          label={`${pc.icon} ${pc.label}`}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: pc.bgColor, color: pc.color }}
                        />
                      </Box>
                    </Box>

                    {/* Reporter Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, color: '#64748B', fontSize: '0.82rem' }}>
                      <PersonIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Signalé par : <strong>{maintenance.reportedBy}</strong> • le {new Date(maintenance.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </Typography>
                    </Box>

                    {/* Description */}
                    <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2.5, mb: 2, border: '1px solid #F1F5F9' }}>
                      <Typography sx={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                        {maintenance.description}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Actions Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1.5, borderTop: '1px solid #F1F5F9' }}>
                    {(maintenance.status === 'REPORTED' || maintenance.status === 'ASSIGNED') && (
                      <Button
                        variant="contained"
                        startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
                        onClick={() => handleStartRepair(maintenance.id)}
                        disabled={actionLoading}
                        sx={{
                          background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                          color: '#FFFFFF',
                          borderRadius: 2.5,
                          px: 3,
                          py: 0.8,
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          textTransform: 'none',
                          boxShadow: '0 4px 12px rgba(227, 30, 36, 0.25)',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)',
                          }
                        }}
                      >
                        Prendre en charge 🛠️
                      </Button>
                    )}

                    {maintenance.status === 'IN_PROGRESS' && (
                      <Button
                        variant="contained"
                        startIcon={<DoneIcon />}
                        onClick={() => handleFinalizeRepairClick(maintenance)}
                        disabled={actionLoading}
                        sx={{
                          background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                          color: '#FFFFFF',
                          borderRadius: 2.5,
                          px: 3,
                          py: 0.8,
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          textTransform: 'none',
                          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #047857 0%, #059669 100%)',
                          }
                        }}
                      >
                        Finaliser la réparation ✅
                      </Button>
                    )}
                  </Box>
                </Paper>
              );
            })
          )}
        </Box>

        {/* Right Column: Broken Equipment In Workshop */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon sx={{ color: '#DC2626' }} /> Matériel Actuellement en Panne ({equipmentInMaintenance.length})
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            {equipmentInMaintenance.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 44, color: '#059669', mb: 1, opacity: 0.8 }} />
                <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '0.95rem' }}>
                  Aucun équipement en panne
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Tous les équipements du parc sont opérationnels.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {equipmentInMaintenance.map((eq) => (
                  <Box
                    key={eq.id}
                    sx={{
                      p: 1.8,
                      borderRadius: 2.5,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #F1F5F9',
                      borderLeft: '4px solid #DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: '#FEE2E2', color: '#DC2626' }}>
                        <WarningIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#1A1A2E' }}>
                          {eq.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>
                          SN: {eq.serialNumber || '-'}
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      label={eq.departmentName || 'Service IT'}
                      size="small"
                      sx={{ fontSize: '0.68rem', fontWeight: 700, bgcolor: '#EFF6FF', color: '#2563EB' }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* 5. Finalize Repair Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3.5, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1A1A2E 0%, #059669 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 2.5
        }}>
          <DoneIcon sx={{ color: '#A7F3D0' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Finaliser la Réparation & Remettre en Service
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              Équipement : {selectedMaintenance?.equipmentName} (SN: {selectedMaintenance?.serialNumber || '-'})
            </Typography>
          </Box>
        </DialogTitle>

        <form onSubmit={handleFinalizeSubmit}>
          <DialogContent sx={{ p: 3, pt: 3.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Diagnostic Technique Constaté *"
              placeholder="ex: Câble nappe écran sectionné, RAM défectueuse, poussière ventilateur..."
              multiline
              rows={3}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Solution & Réparation Appliquée *"
              placeholder="ex: Remplacement barrette RAM 16Go DDR4, dépoussiérage et test de stabilité OK..."
              multiline
              rows={3}
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Coût de l'intervention (MAD)"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value ? Number(e.target.value) : '')}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MonetizationOnIcon sx={{ color: '#059669', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              helperText="Optionnel — Coût des pièces remplacées ou prestation"
            />
          </DialogContent>

          <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
            <Button
              onClick={() => setOpenDialog(false)}
              variant="outlined"
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, color: '#64748B', borderColor: '#CBD5E1' }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={actionLoading || !diagnosis.trim() || !solution.trim()}
              variant="contained"
              sx={{
                background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                borderRadius: 2,
                px: 3.5,
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #047857 0%, #059669 100%)',
                }
              }}
            >
              {actionLoading ? 'Clôture en cours...' : 'Valider & Clôturer l\'Incident'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 6. Snackbar Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity as any}
          sx={{ width: '100%', borderRadius: 2.5, fontWeight: 700 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
