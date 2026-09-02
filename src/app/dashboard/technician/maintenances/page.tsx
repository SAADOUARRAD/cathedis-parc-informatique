'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Skeleton,
  Avatar,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  ButtonGroup,
  Card,
  CardContent,
  CardActions,
  Divider,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Build as BuildIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  AttachMoney as MoneyIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as CriticalIcon,
  Schedule as ScheduleIcon,
  PlayArrow as StartIcon,
  DoneAll as DoneIcon,
  FileDownload as ExportIcon,
  ViewList as TableViewIcon,
  ViewModule as GridViewIcon,
  Visibility as ViewIcon,
  Computer as ComputerIcon,
  Person as PersonIcon,
  Engineering as TechIcon,
  Psychology as BrainIcon,
  AutoAwesome as SparklesIcon,
  Speed as SpeedIcon,
  ReceiptLong as ReceiptIcon,
  Layers as LayersIcon
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';

enum MaintenanceStatus {
  REPORTED = 'REPORTED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

enum MaintenanceType {
  CORRECTIVE = 'CORRECTIVE',
  PREVENTIVE = 'PREVENTIVE'
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }> = {
  REPORTED: {
    label: 'En Attente',
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A',
    icon: <ScheduleIcon sx={{ fontSize: 16, color: '#D97706' }} />
  },
  ASSIGNED: {
    label: 'Assignée',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    borderColor: '#BFDBFE',
    icon: <PersonIcon sx={{ fontSize: 16, color: '#2563EB' }} />
  },
  IN_PROGRESS: {
    label: 'En Réparation',
    color: '#0284C7',
    bgColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    icon: <TechIcon sx={{ fontSize: 16, color: '#0284C7' }} />
  },
  RESOLVED: {
    label: 'Réparé • En attente validation Admin',
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    icon: <ScheduleIcon sx={{ fontSize: 16, color: '#D97706' }} />
  },
  COMPLETED: {
    label: 'Matériel Réparé & Validé ✓',
    color: '#059669',
    bgColor: '#D1FAE5',
    borderColor: '#A7F3D0',
    icon: <SuccessIcon sx={{ fontSize: 16, color: '#059669' }} />
  },
  CANCELLED: {
    label: 'Annulée',
    color: '#64748B',
    bgColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    icon: <CloseIcon sx={{ fontSize: 16, color: '#64748B' }} />
  }
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }> = {
  LOW: {
    label: 'Basse',
    color: '#0284C7',
    bgColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    icon: <SpeedIcon sx={{ fontSize: 14, color: '#0284C7' }} />
  },
  MEDIUM: {
    label: 'Moyenne',
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A',
    icon: <WarningIcon sx={{ fontSize: 14, color: '#D97706' }} />
  },
  HIGH: {
    label: 'Haute Priorité',
    color: '#EA580C',
    bgColor: '#FFEDD5',
    borderColor: '#FED7AA',
    icon: <WarningIcon sx={{ fontSize: 14, color: '#EA580C' }} />
  },
  CRITICAL: {
    label: 'URGENCE CRITIQUE',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#FECACA',
    icon: <CriticalIcon sx={{ fontSize: 14, color: '#DC2626' }} />
  }
};

export default function TechnicianMaintenancesPage() {
  const { data: session } = useSession();
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // View Mode: 'CARDS' or 'TABLE'
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Pagination for table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Edit / Resolve Form State
  const [editStatus, setEditStatus] = useState<string>('IN_PROGRESS');
  const [editPriority, setEditPriority] = useState<string>('MEDIUM');
  const [editDiagnosis, setEditDiagnosis] = useState('');
  const [editSolution, setEditSolution] = useState('');
  const [editCost, setEditCost] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);

  // Dedicated Declare Repaired Dialog State
  const [declareRepairedOpen, setDeclareRepairedOpen] = useState(false);
  const [declareDiagnosis, setDeclareDiagnosis] = useState('');
  const [declareSolution, setDeclareSolution] = useState('');
  const [declareCost, setDeclareCost] = useState<number | ''>('');
  const [declaring, setDeclaring] = useState(false);

  // Snackbar State
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchMaintenances = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/maintenances?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setMaintenances(data || []);
      } else {
        throw new Error('Erreur lors du chargement des maintenances');
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Erreur lors du chargement des données', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const handleOpenEdit = (m: any) => {
    setSelectedMaintenance(m);
    setEditStatus(m.status || 'IN_PROGRESS');
    setEditPriority(m.priority || 'MEDIUM');
    setEditDiagnosis(m.diagnosis || '');
    setEditSolution(m.solution || '');
    setEditCost(m.cost !== undefined && m.cost !== null ? m.cost : '');
    setEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setSelectedMaintenance(null);
  };

  const handleOpenDeclareRepaired = (m: any) => {
    setSelectedMaintenance(m);
    setDeclareDiagnosis(m.diagnosis || '');
    setDeclareSolution(m.solution || '');
    setDeclareCost(m.cost !== null && m.cost !== undefined ? m.cost : '');
    setDeclareRepairedOpen(true);
  };

  const handleCloseDeclareRepaired = () => {
    setDeclareRepairedOpen(false);
    setSelectedMaintenance(null);
  };

  const handleConfirmDeclareRepaired = async () => {
    if (!selectedMaintenance) return;
    if (!declareDiagnosis.trim() || !declareSolution.trim()) {
      setSnackbar({ open: true, message: 'Veuillez renseigner le diagnostic et la solution appliquée.', severity: 'error' });
      return;
    }

    setDeclaring(true);
    try {
      const res = await fetch(`/api/maintenances/${selectedMaintenance.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve',
          status: 'RESOLVED',
          diagnosis: declareDiagnosis,
          solution: declareSolution,
          cost: declareCost === '' ? 0 : Number(declareCost),
          technicianId: session?.user?.id
        })
      });

      if (res.ok) {
        // Optimistic update
        setMaintenances(prev =>
          prev.map(item =>
            item.id === selectedMaintenance.id
              ? {
                  ...item,
                  status: 'RESOLVED',
                  diagnosis: declareDiagnosis,
                  solution: declareSolution,
                  cost: Number(declareCost) || 0
                }
              : item
          )
        );
        setSnackbar({
          open: true,
          message: "✅ Matériel déclaré comme réparé ! Le ticket est en attente de validation et clôture par l'administrateur.",
          severity: 'success'
        });
        handleCloseDeclareRepaired();
        fetchMaintenances();
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur lors de la déclaration (${res.status})`);
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur lors de la déclaration", severity: 'error' });
    } finally {
      setDeclaring(false);
    }
  };

  const openDetails = (m: any) => {
    setSelectedMaintenance(m);
    setDetailsOpen(true);
  };

  const handleQuickStart = async (m: any) => {
    try {
      // Optimistic update right away so the user sees the button turn green instantly
      setMaintenances(prev =>
        prev.map(item =>
          item.id === m.id ? { ...item, status: 'IN_PROGRESS' } : item
        )
      );

      const res = await fetch(`/api/maintenances/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          status: 'IN_PROGRESS',
          technicianId: session?.user?.id
        })
      });
      if (res.ok) {
        setSnackbar({
          open: true,
          message: `🚀 Prise en charge validée ! Le statut est passé à "En Réparation". Le bouton devient "Déclarer Réparé 🛠️".`,
          severity: 'success'
        });
        fetchMaintenances();
      } else {
        throw new Error("Erreur de mise à jour");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur de mise à jour", severity: 'error' });
      fetchMaintenances();
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedMaintenance) return;
    setSaving(true);
    try {
      const isResolving = editStatus === 'RESOLVED';
      const payload = {
        action: isResolving ? 'resolve' : undefined,
        status: editStatus,
        priority: editPriority,
        diagnosis: editDiagnosis,
        solution: editSolution,
        cost: editCost === '' ? 0 : Number(editCost),
        technicianId: session?.user?.id
      };

      const res = await fetch(`/api/maintenances/${selectedMaintenance.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSnackbar({
          open: true,
          message: isResolving
            ? "Réparation déclarée avec succès ! Le ticket est transmis à l'administrateur pour validation finale et clôture."
            : "Ticket technique mis à jour avec succès !",
          severity: 'success'
        });
        handleCloseEdit();
        fetchMaintenances();
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Erreur lors de la mise à jour', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Scope Filter: 'MY_TICKETS' or 'ALL_TICKETS' (Default to MY_TICKETS so technician only sees his assigned tickets)
  const [scopeFilter, setScopeFilter] = useState<'MY_TICKETS' | 'ALL_TICKETS'>('MY_TICKETS');

  const handleExportCSV = () => {
    if (maintenances.length === 0) return;
    const headers = ["ID", "Équipement", "N° Série", "Demandeur", "Priorité", "Statut", "Description", "Diagnostic", "Solution", "Coût (DH)"];
    const rows = maintenances.map(m => [
      m.id,
      `"${(m.equipment?.name || '').replace(/"/g, '""')}"`,
      `"${(m.equipment?.serialNumber || '').replace(/"/g, '""')}"`,
      `"${(m.reportedBy ? `${m.reportedBy.firstName} ${m.reportedBy.lastName}` : '').replace(/"/g, '""')}"`,
      m.priority || 'MEDIUM',
      m.status || 'REPORTED',
      `"${(m.description || '').replace(/"/g, '""')}"`,
      `"${(m.diagnosis || '').replace(/"/g, '""')}"`,
      `"${(m.solution || '').replace(/"/g, '""')}"`,
      m.cost || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `maintenances_techniques_cathedis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({ open: true, message: "Exportation des tickets de maintenance réussie !", severity: 'success' });
  };

  const currentUserId = session?.user?.id;
  const currentUserEmail = session?.user?.email;

  const isAssignedToCurrentTech = (m: any) => {
    if (!currentUserId && !currentUserEmail) return false;
    return (
      (currentUserId && (m.technicianId === currentUserId || m.technician?.id === currentUserId)) ||
      (currentUserEmail && m.technician?.email === currentUserEmail)
    );
  };

  const myTicketsCount = maintenances.filter(isAssignedToCurrentTech).length;

  const scopedMaintenances = maintenances.filter((m) => {
    if (scopeFilter === 'MY_TICKETS') {
      return isAssignedToCurrentTech(m);
    }
    return true;
  });

  const filteredMaintenances = scopedMaintenances.filter((m) => {
    const eqName = m.equipment?.name || '';
    const desc = m.description || '';
    const reporter = m.reportedBy ? `${m.reportedBy.firstName} ${m.reportedBy.lastName}` : '';
    const s = search.toLowerCase();

    const matchesSearch = !s ||
      eqName.toLowerCase().includes(s) ||
      desc.toLowerCase().includes(s) ||
      reporter.toLowerCase().includes(s);
    
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || m.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // KPI Metrics computed on scopedMaintenances
  const totalTickets = scopedMaintenances.length;
  const pendingCount = scopedMaintenances.filter(m => m.status === 'REPORTED' || m.status === 'ASSIGNED').length;
  const inProgressCount = scopedMaintenances.filter(m => m.status === 'IN_PROGRESS').length;
  const criticalCount = scopedMaintenances.filter(m => (m.priority === 'HIGH' || m.priority === 'CRITICAL') && m.status !== 'COMPLETED').length;
  const completedCount = scopedMaintenances.filter(m => m.status === 'COMPLETED').length;

  const paginatedData = filteredMaintenances.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const formatDate = (d?: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
      
      {/* 🌟 1. HERO BANNER TECHNIQUE 🌟 */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: { xs: 2.5, md: 3.5 },
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF1F1 50%, #FFE2E2 100%)',
          color: '#1A1A2E',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(227, 30, 36, 0.08)',
          border: '1px solid rgba(227, 30, 36, 0.2)',
          borderLeft: '6px solid #E31E24',
        }}
      >
        {/* Glow Spheres */}
        <Box sx={{ position: 'absolute', top: -50, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.15) 0%, rgba(227,30,36,0) 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: 200, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.08) 0%, rgba(227,30,36,0) 70%)', pointerEvents: 'none' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap', gap: 2.5, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar sx={{ width: 62, height: 62, bgcolor: '#E31E24', color: '#FFFFFF', boxShadow: '0 8px 24px rgba(227,30,36,0.35)' }}>
              <BuildIcon sx={{ fontSize: 32, color: '#FFFFFF' }} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.8, py: 0.6, borderRadius: 10, bgcolor: 'rgba(227, 30, 36, 0.1)', border: '1px solid rgba(227, 30, 36, 0.25)', mb: 1 }}>
                <TechIcon sx={{ fontSize: 16, color: '#E31E24' }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#C41018', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Atelier Technique & Maintenances • Cathedis
                </Typography>
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 900, color: '#1A1A2E', letterSpacing: '-0.5px' }}>
                Centre des Maintenances & Réparations
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mt: 0.6, maxWidth: 680, fontWeight: 500 }}>
                Diagnostic des incidents signalés, qualification des rapports d'Auto-Diagnostic IA, dépannage matériel et suivi des coûts de réparation.
              </Typography>
            </Box>
          </Box>

          {/* Action Hub */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={handleExportCSV}
              startIcon={<ExportIcon />}
              sx={{
                color: '#E31E24',
                borderColor: 'rgba(227, 30, 36, 0.3)',
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                px: 2.2,
                bgcolor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                '&:hover': { bgcolor: '#FFF5F5', borderColor: '#E31E24' }
              }}
            >
              Exporter CSV
            </Button>
            <Button
              variant="contained"
              onClick={fetchMaintenances}
              startIcon={<SparklesIcon />}
              sx={{
                background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                color: '#FFFFFF',
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                px: 2.5,
                boxShadow: '0 4px 14px rgba(227, 30, 36, 0.35)',
                '&:hover': { background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)' }
              }}
            >
              Actualiser les Tickets
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 📊 2. FOUR GLASSMORPHIС KPI CARDS 📊 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {[
          { label: "À Traiter / En Attente", number: pendingCount, sub: "Nouveaux signalements", icon: <ScheduleIcon />, color: '#D97706', filter: 'REPORTED' },
          { label: "En Cours de Réparation", number: inProgressCount, sub: "Interventions actives", icon: <TechIcon />, color: '#0284C7', filter: 'IN_PROGRESS' },
          { label: "Urgences & SLA", number: criticalCount, sub: "Priorité Haute / Critique", icon: <CriticalIcon />, color: '#DC2626', priority: 'CRITICAL' },
          { label: "Résolues & Clôturées", number: completedCount, sub: "Réparations terminées", icon: <SuccessIcon />, color: '#059669', filter: 'COMPLETED' },
        ].map((stat, i) => (
          <Paper
            key={i}
            elevation={0}
            onClick={() => {
              if (stat.filter) setStatusFilter(stat.filter);
              if (stat.priority) setPriorityFilter('CRITICAL');
            }}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }
            }}
          >
            <Box sx={{ width: 50, height: 50, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.65rem', lineHeight: 1.1 }}>
                {loading ? <Skeleton width={50} /> : stat.number}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, mt: 0.3, display: 'block' }}>
                {stat.label}
              </Typography>
              <Typography variant="caption" sx={{ color: stat.color, fontWeight: 800, fontSize: '0.72rem' }}>
                {stat.sub}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* 🔍 3. SEARCH, FILTERS & VIEW CONTROLLER 🔍 */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', p: 2.5, bgcolor: '#FFFFFF' }}>
        
        {/* Scope Switch: Mes Interventions vs Tout l'Atelier */}
        <Box sx={{ display: 'flex', gap: 1, p: 0.6, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px solid #E2E8F0', width: 'fit-content', mb: 2.5, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant={scopeFilter === 'MY_TICKETS' ? 'contained' : 'text'}
            onClick={() => { setScopeFilter('MY_TICKETS'); setStatusFilter('ALL'); setPage(0); }}
            startIcon={<TechIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.85rem',
              px: 2.5,
              py: 0.8,
              bgcolor: scopeFilter === 'MY_TICKETS' ? '#E31E24' : 'transparent',
              color: scopeFilter === 'MY_TICKETS' ? '#FFFFFF' : '#475569',
              boxShadow: scopeFilter === 'MY_TICKETS' ? '0 4px 12px rgba(227,30,36,0.25)' : 'none',
              '&:hover': {
                bgcolor: scopeFilter === 'MY_TICKETS' ? '#B91C1C' : '#F1F5F9',
              },
            }}
          >
            Mes Interventions Assignées ({myTicketsCount})
          </Button>
          <Button
            size="small"
            variant={scopeFilter === 'ALL_TICKETS' ? 'contained' : 'text'}
            onClick={() => { setScopeFilter('ALL_TICKETS'); setStatusFilter('ALL'); setPage(0); }}
            startIcon={<LayersIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.85rem',
              px: 2.5,
              py: 0.8,
              bgcolor: scopeFilter === 'ALL_TICKETS' ? '#1A1A2E' : 'transparent',
              color: scopeFilter === 'ALL_TICKETS' ? '#FFFFFF' : '#475569',
              boxShadow: scopeFilter === 'ALL_TICKETS' ? '0 4px 12px rgba(26,26,46,0.25)' : 'none',
              '&:hover': {
                bgcolor: scopeFilter === 'ALL_TICKETS' ? '#0F172A' : '#F1F5F9',
              },
            }}
          >
            Tous les Tickets Atelier ({maintenances.length})
          </Button>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <Box sx={{ display: 'flex', gap: 1.5, flex: '1 1 450px', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Rechercher équipement, panne, collaborateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> } }}
              sx={{ flex: '1 1 240px' }}
            />

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Statut</InputLabel>
              <Select
                value={statusFilter}
                label="Statut"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">Tous les statuts ({totalTickets})</MenuItem>
                <MenuItem value="REPORTED">En Attente ({pendingCount})</MenuItem>
                <MenuItem value="IN_PROGRESS">En Réparation ({inProgressCount})</MenuItem>
                <MenuItem value="COMPLETED">Résolues ({completedCount})</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Priorité</InputLabel>
              <Select
                value={priorityFilter}
                label="Priorité"
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <MenuItem value="ALL">Toutes les priorités</MenuItem>
                <MenuItem value="CRITICAL">⚡ Urgences Critiques</MenuItem>
                <MenuItem value="HIGH">🔴 Haute Priorité</MenuItem>
                <MenuItem value="MEDIUM">🟠 Moyenne</MenuItem>
                <MenuItem value="LOW">🟢 Basse</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>
              {filteredMaintenances.length} ticket(s)
            </Typography>
            <ButtonGroup size="small" sx={{ borderRadius: 2 }}>
              <Button
                variant={viewMode === 'CARDS' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('CARDS')}
                startIcon={<GridViewIcon />}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: viewMode === 'CARDS' ? '#0F172A' : 'transparent',
                  color: viewMode === 'CARDS' ? '#FFFFFF' : '#64748B',
                  borderColor: '#CBD5E1',
                  '&:hover': { bgcolor: viewMode === 'CARDS' ? '#0F172A' : '#F1F5F9' }
                }}
              >
                Cartes d'Atelier
              </Button>
              <Button
                variant={viewMode === 'TABLE' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('TABLE')}
                startIcon={<TableViewIcon />}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: viewMode === 'TABLE' ? '#0F172A' : 'transparent',
                  color: viewMode === 'TABLE' ? '#FFFFFF' : '#64748B',
                  borderColor: '#CBD5E1',
                  '&:hover': { bgcolor: viewMode === 'TABLE' ? '#0F172A' : '#F1F5F9' }
                }}
              >
                Tableau
              </Button>
            </ButtonGroup>
          </Box>
        </Box>

        {/* 🔲 VIEW 1: MODERN TECHNICIAN CARDS 🔲 */}
        {viewMode === 'CARDS' ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 2.5 }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Paper key={i} elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0' }}>
                  <Skeleton width="50%" height={30} />
                  <Skeleton width="100%" height={60} sx={{ my: 1.5 }} />
                  <Skeleton width="70%" height={25} />
                </Paper>
              ))
            ) : filteredMaintenances.length === 0 ? (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 6 }}>
                <BuildIcon sx={{ fontSize: 50, color: '#CBD5E1', mb: 1 }} />
                <Typography sx={{ fontWeight: 800, color: '#64748B' }}>
                  Aucun ticket de maintenance ne correspond aux critères sélectionnés.
                </Typography>
              </Box>
            ) : (
              filteredMaintenances.map((m) => {
                const sc = statusConfig[m.status] || statusConfig.REPORTED;
                const pc = priorityConfig[m.priority] || priorityConfig.MEDIUM;
                const hasAI = (m.description || '').includes('AUTO-DIAGNOSTIC IA');

                return (
                  <Card
                    key={m.id}
                    elevation={0}
                    sx={{
                      borderRadius: 3.5,
                      border: '1px solid #E2E8F0',
                      borderTop: `5px solid ${sc.color}`,
                      bgcolor: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                        borderColor: sc.color
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      {/* Equipment Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 44, height: 44, bgcolor: `${sc.color}15`, color: sc.color, border: `1px solid ${sc.borderColor}` }}>
                            <ComputerIcon />
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.05rem', lineHeight: 1.2 }}>
                              {m.equipment?.name || 'Matériel'}
                            </Typography>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748B', display: 'block' }}>
                              SN: {m.equipment?.serialNumber || '-'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Chips: Status & Priority */}
                      <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 2 }}>
                        <Chip
                          icon={sc.icon as any}
                          label={sc.label}
                          size="small"
                          sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: sc.bgColor, color: sc.color, border: `1px solid ${sc.borderColor}` }}
                        />
                        <Chip
                          icon={pc.icon as any}
                          label={pc.label}
                          size="small"
                          sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: pc.bgColor, color: pc.color, border: `1px solid ${pc.borderColor}` }}
                        />
                        {hasAI && (
                          <Chip
                            icon={<BrainIcon sx={{ fontSize: 13, color: '#1D4ED8 !important' }} />}
                            label="Rapport IA Joint"
                            size="small"
                            sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
                          />
                        )}
                      </Box>

                      {/* Symptom Description */}
                      <Typography sx={{ fontSize: '0.85rem', color: '#475569', mb: 2, minHeight: 44, lineHeight: 1.4 }}>
                        {m.description ? m.description.split('--- AUTO-DIAGNOSTIC')[0] : 'Aucune description détaillée.'}
                      </Typography>

                      {/* Reporter & Cost Details */}
                      <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: 2.5, border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color: '#64748B' }} />
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E293B' }}>
                            {m.reportedBy ? `${m.reportedBy.firstName} ${m.reportedBy.lastName}` : 'Collaborateur'}
                          </Typography>
                        </Box>

                        {m.cost !== undefined && m.cost !== null && m.cost > 0 && (
                          <Chip
                            label={`${m.cost} DH`}
                            size="small"
                            sx={{ fontWeight: 900, bgcolor: '#ECFDF5', color: '#047857', fontSize: '0.72rem' }}
                          />
                        )}
                      </Box>

                      {/* Status Guidance Banners */}
                      {m.status === 'IN_PROGRESS' && (
                        <Box sx={{ mt: 1.5, p: 1.2, borderRadius: 2, bgcolor: '#F0F9FF', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TechIcon sx={{ color: '#0284C7', fontSize: 18 }} />
                          <Typography sx={{ fontSize: '0.76rem', color: '#0369A1', fontWeight: 700 }}>
                            Matériel en cours de réparation à l&apos;atelier • Cliquez sur &quot;Déclarer Réparé 🛠️&quot; ci-dessous dès que l&apos;intervention est terminée.
                          </Typography>
                        </Box>
                      )}

                      {m.status === 'RESOLVED' && (
                        <Box sx={{ mt: 1.5, p: 1.2, borderRadius: 2, bgcolor: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon sx={{ color: '#D97706', fontSize: 18 }} />
                          <Typography sx={{ fontSize: '0.76rem', color: '#B45309', fontWeight: 700 }}>
                            ⏳ Réparation déclarée ! En attente de validation et clôture par l&apos;Administrateur.
                          </Typography>
                        </Box>
                      )}

                      {m.status === 'COMPLETED' && (
                        <Box sx={{ mt: 1.5, p: 1.2, borderRadius: 2, bgcolor: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SuccessIcon sx={{ color: '#059669', fontSize: 18 }} />
                          <Typography sx={{ fontSize: '0.76rem', color: '#047857', fontWeight: 700 }}>
                            ✅ Matériel réparé et validé par l&apos;Administrateur IT ! Remis en service.
                          </Typography>
                        </Box>
                      )}
                    </CardContent>

                    {/* Actions Footer */}
                    <CardActions sx={{ p: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        onClick={() => openDetails(m)}
                        startIcon={<ViewIcon />}
                        sx={{ textTransform: 'none', fontWeight: 800, color: '#1A1A2E', fontSize: '0.78rem' }}
                      >
                        Fiche 360°
                      </Button>

                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {(m.status === 'REPORTED' || m.status === 'ASSIGNED') && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleQuickStart(m)}
                            startIcon={<StartIcon />}
                            sx={{
                              background: 'linear-gradient(90deg, #0284C7 0%, #0369A1 100%)',
                              color: '#FFFFFF',
                              borderRadius: 2,
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              textTransform: 'none',
                              px: 1.8,
                              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
                            }}
                          >
                            Prendre en charge
                          </Button>
                        )}

                        {m.status === 'IN_PROGRESS' && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOpenDeclareRepaired(m)}
                            startIcon={<SuccessIcon />}
                            sx={{
                              background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                              color: '#FFFFFF',
                              borderRadius: 2,
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              textTransform: 'none',
                              px: 1.8,
                              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
                              '&:hover': {
                                background: 'linear-gradient(90deg, #047857 0%, #059669 100%)'
                              }
                            }}
                          >
                            Déclarer Réparé 🛠️
                          </Button>
                        )}

                        {m.status === 'RESOLVED' && (
                          <Chip
                            size="small"
                            icon={<ScheduleIcon sx={{ fontSize: 14, color: '#B45309 !important' }} />}
                            label="En attente validation Admin ⏳"
                            sx={{
                              bgcolor: '#FFFBEB',
                              color: '#B45309',
                              border: '1px solid #FDE68A',
                              fontWeight: 800,
                              fontSize: '0.74rem',
                              py: 1.8,
                              px: 1
                            }}
                          />
                        )}

                        {m.status === 'COMPLETED' && (
                          <Chip
                            size="small"
                            icon={<SuccessIcon sx={{ fontSize: 14, color: '#047857 !important' }} />}
                            label="Matériel Réparé & Validé ✓"
                            sx={{
                              bgcolor: '#ECFDF5',
                              color: '#047857',
                              border: '1px solid #A7F3D0',
                              fontWeight: 800,
                              fontSize: '0.74rem',
                              py: 1.8,
                              px: 1
                            }}
                          />
                        )}

                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenEdit(m)}
                          startIcon={<EditIcon />}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            color: '#0284C7',
                            borderColor: '#BAE6FD'
                          }}
                        >
                          Diagnostiquer
                        </Button>
                      </Box>
                    </CardActions>
                  </Card>
                );
              })
            )}
          </Box>
        ) : (
          /* 📋 VIEW 2: HIGH-DENSITY DATA TABLE 📋 */
          <>
            <TableContainer>
              <Table size="medium">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Équipement / Matériel</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Collaborateur</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Priorité</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Date de Signalement</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#1E293B' }}>Coût</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#1E293B' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton width={160} /></TableCell>
                        <TableCell><Skeleton width={140} /></TableCell>
                        <TableCell><Skeleton width={80} /></TableCell>
                        <TableCell><Skeleton width={100} /></TableCell>
                        <TableCell><Skeleton width={120} /></TableCell>
                        <TableCell align="center"><Skeleton width={60} /></TableCell>
                        <TableCell align="center"><Skeleton width={100} /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center' }}>
                        <BuildIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                        <Typography sx={{ fontWeight: 700, color: '#64748B' }}>
                          Aucun ticket de maintenance trouvé.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row) => {
                      const sc = statusConfig[row.status] || statusConfig.REPORTED;
                      const pc = priorityConfig[row.priority] || priorityConfig.MEDIUM;

                      return (
                        <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 34, height: 34, bgcolor: `${sc.color}15`, color: sc.color }}>
                                <ComputerIcon sx={{ fontSize: 18 }} />
                              </Avatar>
                              <Box>
                                <Typography
                                  onClick={() => openDetails(row)}
                                  sx={{ fontWeight: 800, color: '#1A1A2E', cursor: 'pointer', '&:hover': { color: '#0284C7', textDecoration: 'underline' } }}
                                >
                                  {row.equipment?.name || 'Matériel'}
                                </Typography>
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748B', display: 'block' }}>
                                  SN: {row.equipment?.serialNumber || '-'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ fontSize: '0.85rem', color: '#475569' }}>
                            {row.reportedBy ? `${row.reportedBy.firstName} ${row.reportedBy.lastName}` : 'Collaborateur'}
                          </TableCell>

                          <TableCell>
                            <Chip
                              icon={pc.icon as any}
                              label={pc.label}
                              size="small"
                              sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: pc.bgColor, color: pc.color, border: `1px solid ${pc.borderColor}` }}
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              icon={sc.icon as any}
                              label={sc.label}
                              size="small"
                              sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: sc.bgColor, color: sc.color, border: `1px solid ${sc.borderColor}` }}
                            />
                          </TableCell>

                          <TableCell sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                            {formatDate(row.createdAt || row.reportedDate)}
                          </TableCell>

                          <TableCell align="center">
                            {row.cost ? (
                              <Typography sx={{ fontWeight: 800, color: '#047857', fontSize: '0.85rem' }}>
                                {row.cost} DH
                              </Typography>
                            ) : (
                              <Typography variant="caption" sx={{ color: '#94A3B8' }}>—</Typography>
                            )}
                          </TableCell>

                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.8, justifyContent: 'center', alignItems: 'center' }}>
                              {(row.status === 'REPORTED' || row.status === 'ASSIGNED') && (
                                <Tooltip title="Prendre en charge">
                                  <IconButton size="small" onClick={() => handleQuickStart(row)} sx={{ color: '#FFFFFF', bgcolor: '#0284C7', '&:hover': { bgcolor: '#0369A1' } }}>
                                    <StartIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {row.status === 'IN_PROGRESS' && (
                                <Tooltip title="Déclarer Réparé 🛠️">
                                  <IconButton size="small" onClick={() => handleOpenDeclareRepaired(row)} sx={{ color: '#FFFFFF', bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}>
                                    <SuccessIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Fiche 360°">
                                <IconButton size="small" onClick={() => openDetails(row)} sx={{ color: '#1A1A2E', bgcolor: '#F1F5F9' }}>
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Diagnostiquer / Modifier">
                                <IconButton size="small" onClick={() => handleOpenEdit(row)} sx={{ color: '#0284C7', bgcolor: '#E0F2FE' }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredMaintenances.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Lignes par page :"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`}
              sx={{ borderTop: '1px solid #E2E8F0', px: 2 }}
            />
          </>
        )}
      </Paper>

      {/* 🛠️ 4. MODALE DE DIAGNOSTIC & CLÔTURE D'INTERVENTION 🛠️ */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEdit}
        maxWidth="md"
        fullWidth
        scroll="paper"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              overflow: 'hidden',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #0F172A 0%, #0369A1 50%, #0284C7 100%)',
          color: '#FFFFFF',
          p: 2.5,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#FFFFFF', color: '#0284C7' }}>
              <BuildIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                Diagnostic & Clôture d'Intervention
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {selectedMaintenance?.equipment?.name} (SN: {selectedMaintenance?.equipment?.serialNumber})
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseEdit} sx={{ color: '#FFFFFF' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, bgcolor: '#FAFAFA', overflowY: 'auto' }}>
          
          {/* Status & Priority Selectors */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl fullWidth sx={{ bgcolor: '#FFFFFF' }}>
              <InputLabel>Statut de l'Intervention *</InputLabel>
              <Select
                value={editStatus}
                label="Statut de l'Intervention *"
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <MenuItem value="REPORTED">🟠 En Attente (Nouveau)</MenuItem>
                <MenuItem value="IN_PROGRESS">🔵 En Cours de Réparation (Atelier)</MenuItem>
                <MenuItem value="RESOLVED">🛠️ Réparée (Soumettre à l'Admin pour validation)</MenuItem>
                <MenuItem value="COMPLETED">🟢 Résolue & Réparée (Clôture)</MenuItem>
                <MenuItem value="CANCELLED">⚪ Annulée / Non Reproductible</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ bgcolor: '#FFFFFF' }}>
              <InputLabel>Niveau de Priorité</InputLabel>
              <Select
                value={editPriority}
                label="Niveau de Priorité"
                onChange={(e) => setEditPriority(e.target.value)}
              >
                <MenuItem value="LOW">🟢 Basse Priorité</MenuItem>
                <MenuItem value="MEDIUM">🟠 Priorité Standard (Moyenne)</MenuItem>
                <MenuItem value="HIGH">🔴 Haute Priorité</MenuItem>
                <MenuItem value="CRITICAL">⚡ Urgence Critique</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Diagnosis */}
          <TextField
            label="Diagnostic Technique de la Panne"
            placeholder="ex: Court-circuit connecteur d'alimentation, barrette RAM défectueuse, dalle LCD fissurée..."
            fullWidth
            multiline
            rows={2}
            value={editDiagnosis}
            onChange={(e) => setEditDiagnosis(e.target.value)}
            sx={{ bgcolor: '#FFFFFF' }}
          />

          {/* Solution */}
          <TextField
            label="Solution Appliquée & Pièces Remplacées"
            placeholder="ex: Remplacement adaptateur 65W d'origine, dépoussiérage ventilation et réinstallation pilote d'affichage..."
            fullWidth
            multiline
            rows={3}
            value={editSolution}
            onChange={(e) => setEditSolution(e.target.value)}
            sx={{ bgcolor: '#FFFFFF' }}
          />

          {/* Repair Cost in MAD */}
          <TextField
            label="Coût Total de l'Intervention (Pièces + Main d'œuvre)"
            placeholder="ex: 450"
            type="number"
            value={editCost}
            onChange={(e) => setEditCost(e.target.value === '' ? '' : Number(e.target.value))}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end"><Typography sx={{ fontWeight: 800, color: '#047857' }}>MAD (DH)</Typography></InputAdornment>
              }
            }}
            sx={{ bgcolor: '#FFFFFF' }}
          />

        </DialogContent>

        <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
          <Button onClick={handleCloseEdit} variant="outlined" sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B' }}>
            Annuler
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={saving}
            sx={{
              background: editStatus === 'RESOLVED' ? 'linear-gradient(90deg, #059669 0%, #047857 100%)' : 'linear-gradient(90deg, #0284C7 0%, #0369A1 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: 2.5,
              px: 3.5,
              textTransform: 'none',
              boxShadow: editStatus === 'RESOLVED' ? '0 4px 14px rgba(5, 150, 105, 0.4)' : '0 4px 14px rgba(2, 132, 199, 0.4)'
            }}
          >
            {saving ? 'Enregistrement...' : editStatus === 'RESOLVED' ? 'Soumettre pour Validation Admin 🚀' : 'Enregistrer les Modifications'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔍 5. FICHE 360° DU TICKET TECHNIQUE 🔍 */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        {selectedMaintenance && (
          <>
            <DialogTitle sx={{
              background: 'linear-gradient(135deg, #0F172A 0%, #0369A1 50%, #0284C7 100%)',
              color: '#FFFFFF',
              p: 2.5,
              px: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                <Avatar sx={{ bgcolor: '#FFFFFF', color: '#0284C7', width: 48, height: 48 }}>
                  <ReceiptIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                    Ticket d'Intervention #{selectedMaintenance.id.slice(0, 8)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Fiche Technique Complète & Historique
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setDetailsOpen(false)} sx={{ color: '#FFFFFF' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3, bgcolor: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              
              {/* Equipment & Reporter */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Équipement Concerné</Typography>
                  <Typography sx={{ fontWeight: 900, color: '#1A1A2E', mt: 0.5, fontSize: '1.05rem' }}>
                    {selectedMaintenance.equipment?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748B', display: 'block' }}>
                    SN: {selectedMaintenance.equipment?.serialNumber || '-'}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Demandeur / Collaborateur</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#1A1A2E', mt: 0.5 }}>
                    {selectedMaintenance.reportedBy ? `${selectedMaintenance.reportedBy.firstName} ${selectedMaintenance.reportedBy.lastName}` : 'Collaborateur Cathedis'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                    {selectedMaintenance.reportedBy?.email || '-'}
                  </Typography>
                </Paper>
              </Box>

              {/* Description */}
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Description du Problème</Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#334155', mt: 0.8, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {selectedMaintenance.description || 'Aucune description.'}
                </Typography>
              </Paper>

              {/* Diagnostic & Solution */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #BFDBFE', bgcolor: '#EFF6FF' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase' }}>Diagnostic Technique</Typography>
                  <Typography sx={{ fontSize: '0.88rem', color: '#1E3A8A', mt: 0.5 }}>
                    {selectedMaintenance.diagnosis || 'En attente de diagnostic.'}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #A7F3D0', bgcolor: '#ECFDF5' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#065F46', textTransform: 'uppercase' }}>Solution Appliquée</Typography>
                  <Typography sx={{ fontSize: '0.88rem', color: '#047857', mt: 0.5 }}>
                    {selectedMaintenance.solution || 'En cours d\'intervention.'}
                  </Typography>
                </Paper>
              </Box>

            </DialogContent>

            <DialogActions sx={{ p: 2, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
              <Button onClick={() => setDetailsOpen(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700, color: '#64748B' }}>
                Fermer
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setDetailsOpen(false);
                  handleOpenEdit(selectedMaintenance);
                }}
                startIcon={<EditIcon />}
                sx={{
                  background: 'linear-gradient(90deg, #0284C7 0%, #0369A1 100%)',
                  color: '#FFFFFF',
                  borderRadius: 2,
                  fontWeight: 800,
                  textTransform: 'none'
                }}
              >
                Mettre à jour le Rapport
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 🛠️ MODALE DÉDIÉE : DÉCLARER LE MATÉRIEL COMME RÉPARÉ 🛠️ */}
      <Dialog
        open={declareRepairedOpen}
        onClose={handleCloseDeclareRepaired}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: '#FFFFFF',
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}>
            <SuccessIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
              Déclarer le Matériel comme Réparé 🛠️
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              {selectedMaintenance?.equipment?.name} (SN: {selectedMaintenance?.equipment?.serialNumber || '-'})
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDeclareRepaired} sx={{ color: '#FFFFFF' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, bgcolor: '#FAFAFA' }}>
          <Alert severity="info" sx={{ borderRadius: 2.5, fontSize: '0.82rem', fontWeight: 600 }}>
            Renseignez les détails de votre réparation. Dès validation par l&apos;Administrateur, le ticket sera clôturé et le matériel remis en service.
          </Alert>

          <TextField
            label="Diagnostic de la Panne Constatée *"
            placeholder="ex: Batterie interne hors d'usage, connecteur encrassé..."
            fullWidth
            multiline
            rows={2}
            value={declareDiagnosis}
            onChange={(e) => setDeclareDiagnosis(e.target.value)}
            required
            sx={{ bgcolor: '#FFFFFF' }}
          />

          <TextField
            label="Solution Appliquée & Pièces Remplacées *"
            placeholder="ex: Remplacement bloc batterie OEM, nettoyage connectique, test de charge à 100% concluant..."
            fullWidth
            multiline
            rows={3}
            value={declareSolution}
            onChange={(e) => setDeclareSolution(e.target.value)}
            required
            sx={{ bgcolor: '#FFFFFF' }}
          />

          <TextField
            label="Coût Total de Réparation (MAD / DH)"
            placeholder="0"
            type="number"
            value={declareCost}
            onChange={(e) => setDeclareCost(e.target.value === '' ? '' : Number(e.target.value))}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end"><Typography sx={{ fontWeight: 800, color: '#047857' }}>MAD (DH)</Typography></InputAdornment>
              }
            }}
            helperText="Indiquez 0 si l'intervention est sans surcoût matériel"
            sx={{ bgcolor: '#FFFFFF' }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
          <Button onClick={handleCloseDeclareRepaired} variant="outlined" sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B' }}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirmDeclareRepaired}
            variant="contained"
            disabled={declaring || !declareDiagnosis.trim() || !declareSolution.trim()}
            sx={{
              background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: 2.5,
              px: 3.5,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)',
              '&:hover': {
                background: 'linear-gradient(90deg, #047857 0%, #059669 100%)'
              }
            }}
          >
            {declaring ? 'Transmission en cours...' : 'Déclarer Réparé & Transmettre à l\'Admin 🚀'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2.5, fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
