'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Snackbar,
  Alert,
  TextField,
  Skeleton,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Tooltip,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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
  CardActions
} from '@mui/material';
import {
  Build as BuildIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  AssignmentInd as AssignIcon,
  PlayArrow as StartIcon,
  DoneAll as CompleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  LaptopMac as LaptopIcon,
  DesktopWindows as DesktopIcon,
  Tv as ScreenIcon,
  Headphones as HeadphoneIcon,
  MonetizationOn as MoneyIcon,
  Engineering as TechIcon,
  Visibility as ViewIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  ViewModule as KanbanIcon,
  ViewList as TableViewIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  FlashOn as FlashIcon
} from '@mui/icons-material';
import StatusChip from '@/components/shared/StatusChip';

type Maintenance = {
  id: string;
  type: string;
  status: string;
  priority: string;
  description: string;
  diagnosis?: string;
  solution?: string;
  cost?: number;
  reportedDate: string;
  startDate?: string;
  endDate?: string;
  equipment: {
    id: string;
    name: string;
    inventoryNumber: string;
    serialNumber?: string;
    brand?: string;
    model?: string;
    category?: { name: string };
  };
  reportedBy: { id: string; firstName: string; lastName: string; email: string };
  technician?: { id: string; firstName: string; lastName: string; email: string };
};

const statusMap = {
  REPORTED: { label: 'Signalée / En attente', color: '#D97706', bgColor: '#FFFBEB' },
  ASSIGNED: { label: 'Assignée au Technicien', color: '#2563EB', bgColor: '#EFF6FF' },
  IN_PROGRESS: { label: 'En cours de Réparation', color: '#7C3AED', bgColor: '#F5F3FF' },
  RESOLVED: { label: 'Réparée • Validation Requise ⏳', color: '#D97706', bgColor: '#FEF3C7' },
  COMPLETED: { label: 'Résolue & Clôturée ✓', color: '#059669', bgColor: '#ECFDF5' },
  CANCELLED: { label: 'Annulée', color: '#64748B', bgColor: '#F1F5F9' },
};

export default function MaintenancesPage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'TABLE' or 'CARDS'
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Selected Maintenance for actions
  const [selectedItem, setSelectedItem] = useState<Maintenance | null>(null);

  // Equipments & Technicians for form selectors
  const [equipments, setEquipments] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    equipmentId: '',
    description: '',
    type: 'CORRECTIVE',
    priority: 'MEDIUM',
  });

  const [assignTechnicianId, setAssignTechnicianId] = useState('');
  const [completeData, setCompleteData] = useState({
    diagnosis: '',
    solution: '',
    cost: '',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (priorityFilter !== 'ALL') params.set('priority', priorityFilter);
      if (typeFilter !== 'ALL') params.set('type', typeFilter);

      const res = await fetch(`/api/maintenances?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMaintenances(data || []);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Erreur lors du chargement des tickets", severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipmentsAndTechs = async () => {
    try {
      const [resEq, resTech] = await Promise.all([
        fetch('/api/equipments'),
        fetch('/api/users?role=TECHNICIAN')
      ]);
      if (resEq.ok) setEquipments(await resEq.json() || []);
      if (resTech.ok) setTechnicians(await resTech.json() || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, [statusFilter, priorityFilter, typeFilter]);

  useEffect(() => {
    fetchEquipmentsAndTechs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.equipmentId || !formData.description.trim()) {
      setSnackbar({ open: true, message: "Veuillez sélectionner un équipement et décrire la panne.", severity: 'error' });
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/maintenances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSnackbar({ open: true, message: "Ticket de maintenance ouvert avec succès !", severity: 'success' });
        setCreateOpen(false);
        setFormData({ equipmentId: '', description: '', type: 'CORRECTIVE', priority: 'MEDIUM' });
        fetchMaintenances();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Erreur de création");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur de création", severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (action: string, id: string, payload?: any) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/maintenances/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });

      if (res.ok) {
        let msg = "Action effectuée avec succès";
        if (action === 'assign') msg = "Technicien assigné et notifié par email Gmail ! ✉️";
        if (action === 'start') msg = "Prise en charge démarrée !";
        if (action === 'complete') msg = "Maintenance clôturée et équipement remis en service !";
        if (action === 'cancel') msg = "Ticket annulé.";

        setSnackbar({ open: true, message: msg, severity: 'success' });
        setAssignOpen(false);
        setCompleteOpen(false);
        fetchMaintenances();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de l'opération");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur lors de l'opération", severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAssign = (item: Maintenance) => {
    setSelectedItem(item);
    setAssignTechnicianId(item.technician?.id || '');
    setAssignOpen(true);
  };

  const handleOpenComplete = (item: Maintenance) => {
    setSelectedItem(item);
    setCompleteData({
      diagnosis: item.diagnosis || '',
      solution: item.solution || '',
      cost: item.cost ? String(item.cost) : '',
    });
    setCompleteOpen(true);
  };

  const handleOpenDetails = (item: Maintenance) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <Chip
            icon={<FlashIcon sx={{ fontSize: 14, color: '#DC2626 !important' }} />}
            label="CRITIQUE (SLA Immédiat)"
            size="small"
            sx={{
              fontWeight: 900,
              fontSize: '0.68rem',
              bgcolor: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              animation: 'pulseCritical 2s infinite'
            }}
          />
        );
      case 'HIGH':
        return (
          <Chip
            label="Haute Priorité"
            size="small"
            sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}
          />
        );
      case 'MEDIUM':
        return (
          <Chip
            label="Moyenne"
            size="small"
            sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
          />
        );
      case 'LOW':
      default:
        return (
          <Chip
            label="Basse"
            size="small"
            sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: '#F1F5F9', color: '#64748B' }}
          />
        );
    }
  };

  const getCategoryIcon = (catName?: string) => {
    const c = catName?.toLowerCase() || '';
    if (c.includes('portable') || c.includes('laptop')) return <LaptopIcon sx={{ fontSize: 18, color: '#E31E24' }} />;
    if (c.includes('fixe') || c.includes('desktop')) return <DesktopIcon sx={{ fontSize: 18, color: '#2563EB' }} />;
    if (c.includes('casque') || c.includes('audio')) return <HeadphoneIcon sx={{ fontSize: 18, color: '#7C3AED' }} />;
    if (c.includes('écran') || c.includes('ecran')) return <ScreenIcon sx={{ fontSize: 18, color: '#059669' }} />;
    return <ComputerIcon sx={{ fontSize: 18, color: '#64748B' }} />;
  };

  const handleExportCSV = () => {
    if (maintenances.length === 0) return;
    const headers = ["ID", "Date Signalement", "Équipement", "N° Inventaire", "S/N", "Type", "Priorité", "Statut", "Demandeur", "Technicien", "Diagnostic", "Solution", "Coût (DH)"];
    const rows = maintenances.map(m => [
      m.id,
      m.reportedDate ? new Date(m.reportedDate).toISOString() : '',
      `"${(m.equipment?.name || '').replace(/"/g, '""')}"`,
      `"${m.equipment?.inventoryNumber || ''}"`,
      `"${m.equipment?.serialNumber || ''}"`,
      `"${m.type}"`,
      `"${m.priority}"`,
      `"${m.status}"`,
      `"${m.reportedBy ? `${m.reportedBy.firstName} ${m.reportedBy.lastName}` : ''}"`,
      `"${m.technician ? `${m.technician.firstName} ${m.technician.lastName}` : 'Non assigné'}"`,
      `"${(m.diagnosis || '').replace(/"/g, '""')}"`,
      `"${(m.solution || '').replace(/"/g, '""')}"`,
      m.cost || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registre_maintenances_cathedis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({ open: true, message: "Exportation du registre de maintenance réussie !", severity: 'success' });
  };

  const filteredMaintenances = maintenances.filter(m => {
    const s = search.toLowerCase();
    const matchSearch = !s ||
      (m.equipment?.name && m.equipment.name.toLowerCase().includes(s)) ||
      (m.equipment?.inventoryNumber && m.equipment.inventoryNumber.toLowerCase().includes(s)) ||
      (m.description && m.description.toLowerCase().includes(s)) ||
      (m.reportedBy && `${m.reportedBy.firstName} ${m.reportedBy.lastName}`.toLowerCase().includes(s)) ||
      (m.technician && `${m.technician.firstName} ${m.technician.lastName}`.toLowerCase().includes(s));

    return matchSearch;
  });

  // KPI Metrics
  const total = maintenances.length;
  const reported = maintenances.filter(m => m.status === 'REPORTED').length;
  const inProgress = maintenances.filter(m => ['ASSIGNED', 'IN_PROGRESS'].includes(m.status)).length;
  const completed = maintenances.filter(m => m.status === 'COMPLETED').length;
  const critical = maintenances.filter(m => ['CRITICAL', 'HIGH'].includes(m.priority) && m.status !== 'COMPLETED').length;

  const paginatedMaintenances = filteredMaintenances.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
      
      {/* 🌟 1. ULTRA-PREMIUM HERO BANNER 🌟 */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: { xs: 2.5, md: 3.5 },
          background: 'linear-gradient(135deg, #1A1A2E 0%, #2A1B28 50%, #7B0000 100%)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(26, 26, 46, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.3) 0%, rgba(227,30,36,0) 70%)', pointerEvents: 'none' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap', gap: 2.5, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar sx={{ width: 62, height: 62, bgcolor: 'rgba(227,30,36,0.3)', border: '2px solid rgba(227,30,36,0.8)', color: '#FFFFFF', boxShadow: '0 8px 24px rgba(227,30,36,0.45)' }}>
              <BuildIcon sx={{ fontSize: 34, color: '#FFFFFF' }} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                  Centre de Maintenance & Support IT
                </Typography>
                <Chip
                  icon={<TechIcon sx={{ fontSize: 16, color: '#A7F3D0 !important' }} />}
                  label="Dispatching & Notifications Gmail"
                  size="small"
                  sx={{ bgcolor: 'rgba(5, 150, 105, 0.25)', color: '#A7F3D0', border: '1px solid rgba(167, 243, 208, 0.4)', fontWeight: 800 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.6, maxWidth: 680 }}>
                Pilotage des incidents, assignation automatique aux techniciens par email, suivi des diagnostics, résolutions et coûts de réparation.
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={handleExportCSV}
              startIcon={<ExportIcon />}
              sx={{
                color: '#FFFFFF',
                borderColor: 'rgba(255,255,255,0.3)',
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                px: 2,
                backdropFilter: 'blur(10px)',
                bgcolor: 'rgba(255,255,255,0.06)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: '#FFFFFF' }
              }}
            >
              Exporter CSV
            </Button>
            <Button
              variant="contained"
              onClick={() => setCreateOpen(true)}
              startIcon={<AddIcon />}
              sx={{
                background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                color: '#FFFFFF',
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                px: 2.8,
                boxShadow: '0 4px 14px rgba(227, 30, 36, 0.45)',
                '&:hover': { background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)' }
              }}
            >
              + Déclarer une Panne
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 📊 2. FIVE GLASSMORPHIС KPI CARDS 📊 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 2 }}>
        {[
          { label: "Total Tickets", number: total, sub: "Toutes pannes confondues", icon: <BuildIcon />, color: '#1A1A2E' },
          { label: "En Attente", number: reported, sub: "À assigner au technicien", icon: <ScheduleIcon />, color: '#D97706' },
          { label: "En Réparation", number: inProgress, sub: "Intervention en cours", icon: <TechIcon />, color: '#2563EB' },
          { label: "Pannes Résolues", number: completed, sub: "Matériels remis en service", icon: <SuccessIcon />, color: '#059669' },
          { label: "Urgences Critiques", number: critical, sub: "Haute priorité active", icon: <WarningIcon />, color: '#DC2626' },
        ].map((stat, i) => (
          <Paper key={i} elevation={0} sx={{ p: 2.2, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 1.8, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' } }}>
            <Box sx={{ width: 46, height: 46, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.55rem', lineHeight: 1.1 }}>
                {loading ? <Skeleton width={40} /> : stat.number}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, mt: 0.2, display: 'block' }}>
                {stat.label}
              </Typography>
              <Typography variant="caption" sx={{ color: stat.color, fontWeight: 800, fontSize: '0.68rem' }}>
                {stat.sub}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* 🔍 3. SEARCH, FILTERS & VIEW MODE SWITCHER 🔍 */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', p: 2.5, bgcolor: '#FFFFFF' }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <Box sx={{ display: 'flex', gap: 2, flex: '1 1 500px', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Rechercher par matériel, demandeur, technicien, panne..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> } }}
              sx={{ flex: '1 1 260px' }}
            />

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Statut</InputLabel>
              <Select value={statusFilter} label="Statut" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="ALL">Tous les statuts</MenuItem>
                <MenuItem value="REPORTED">🟠 En attente</MenuItem>
                <MenuItem value="ASSIGNED">🔵 Assignée</MenuItem>
                <MenuItem value="IN_PROGRESS">🟣 En cours</MenuItem>
                <MenuItem value="COMPLETED">🟢 Résolue</MenuItem>
                <MenuItem value="CANCELLED">⚪ Annulée</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Priorité</InputLabel>
              <Select value={priorityFilter} label="Priorité" onChange={(e) => setPriorityFilter(e.target.value)}>
                <MenuItem value="ALL">Toutes</MenuItem>
                <MenuItem value="CRITICAL">🚨 Critique</MenuItem>
                <MenuItem value="HIGH">🟠 Haute</MenuItem>
                <MenuItem value="MEDIUM">🔵 Moyenne</MenuItem>
                <MenuItem value="LOW">⚪ Basse</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)}>
                <MenuItem value="ALL">Tous types</MenuItem>
                <MenuItem value="CORRECTIVE">Corrective (Panne)</MenuItem>
                <MenuItem value="PREVENTIVE">Préventive (Entretien)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* View Mode Toggle Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>
              {filteredMaintenances.length} ticket(s)
            </Typography>
            <ButtonGroup size="small" sx={{ borderRadius: 2 }}>
              <Button
                variant={viewMode === 'TABLE' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('TABLE')}
                startIcon={<TableViewIcon />}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: viewMode === 'TABLE' ? '#1A1A2E' : 'transparent',
                  color: viewMode === 'TABLE' ? '#FFFFFF' : '#64748B',
                  borderColor: '#CBD5E1'
                }}
              >
                Tableau
              </Button>
              <Button
                variant={viewMode === 'CARDS' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('CARDS')}
                startIcon={<KanbanIcon />}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: viewMode === 'CARDS' ? '#1A1A2E' : 'transparent',
                  color: viewMode === 'CARDS' ? '#FFFFFF' : '#64748B',
                  borderColor: '#CBD5E1'
                }}
              >
                Cartes
              </Button>
            </ButtonGroup>
          </Box>
        </Box>

        {/* 📋 VIEW 1: DATA TABLE VIEW 📋 */}
        {viewMode === 'TABLE' ? (
          <>
            <TableContainer>
              <Table size="medium">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Équipement en Panne</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Priorité & Type</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Demandeur & Date</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Technicien Assigné</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#1E293B' }}>Actions d'Intervention</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton width={180} /></TableCell>
                        <TableCell><Skeleton width={130} /></TableCell>
                        <TableCell><Skeleton width={120} /></TableCell>
                        <TableCell><Skeleton width={150} /></TableCell>
                        <TableCell><Skeleton width={140} /></TableCell>
                        <TableCell align="center"><Skeleton width={160} /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedMaintenances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                        <SuccessIcon sx={{ fontSize: 48, color: '#059669', mb: 1 }} />
                        <Typography sx={{ fontWeight: 800, color: '#1A1A2E' }}>
                          Aucun ticket de maintenance actif ne correspond à vos filtres.
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Le parc informatique fonctionne de manière optimale.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedMaintenances.map((row) => (
                      <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                        
                        {/* Equipment Info */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#F1F5F9', border: '1px solid #E2E8F0', mt: 0.2 }}>
                              {getCategoryIcon(row.equipment?.category?.name)}
                            </Avatar>
                            <Box>
                              <Typography
                                onClick={() => handleOpenDetails(row)}
                                sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '0.92rem', cursor: 'pointer', '&:hover': { color: '#E31E24', textDecoration: 'underline' } }}
                              >
                                {row.equipment?.name || 'Matériel inconnu'}
                              </Typography>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#E31E24', display: 'block' }}>
                                {row.equipment?.inventoryNumber || '-'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748B', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: 260 }}>
                                {row.description}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Priority & Type */}
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, alignItems: 'flex-start' }}>
                            {getPriorityBadge(row.priority)}
                            <Chip
                              label={row.type === 'CORRECTIVE' ? 'Panne Corrective' : 'Entretien Préventif'}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.68rem',
                                bgcolor: row.type === 'CORRECTIVE' ? '#FFF5F5' : '#EFF6FF',
                                color: row.type === 'CORRECTIVE' ? '#E31E24' : '#2563EB'
                              }}
                            />
                          </Box>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <StatusChip status={row.status} statusMap={statusMap as any} />
                        </TableCell>

                        {/* Reporter & Date */}
                        <TableCell>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>
                            {row.reportedBy ? `${row.reportedBy.firstName} ${row.reportedBy.lastName}` : 'Utilisateur'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                            <CalendarIcon sx={{ fontSize: 12 }} />
                            {new Date(row.reportedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          </Typography>
                        </TableCell>

                        {/* Technician */}
                        <TableCell>
                          {row.technician ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 28, height: 28, bgcolor: '#2563EB', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 800 }}>
                                {row.technician.firstName?.[0]}{row.technician.lastName?.[0]}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1A1A2E' }}>
                                  {row.technician.firstName} {row.technician.lastName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, display: 'block' }}>
                                  Technicien assigné
                                </Typography>
                              </Box>
                            </Box>
                          ) : (
                            <Chip
                              label="Non assigné"
                              size="small"
                              onClick={() => handleOpenAssign(row)}
                              clickable
                              sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}
                            />
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.8, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Tooltip title="Fiche Complète du Ticket">
                              <IconButton onClick={() => handleOpenDetails(row)} size="small" sx={{ color: '#1A1A2E', bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' } }}>
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {row.status === 'REPORTED' && (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<AssignIcon />}
                                onClick={() => handleOpenAssign(row)}
                                sx={{
                                  background: 'linear-gradient(90deg, #2563EB 0%, #1D4ED8 100%)',
                                  color: '#FFFFFF',
                                  fontWeight: 800,
                                  fontSize: '0.74rem',
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  px: 1.5
                                }}
                              >
                                Assigner
                              </Button>
                            )}

                            {row.status === 'ASSIGNED' && (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<StartIcon />}
                                onClick={() => handleAction('start', row.id)}
                                sx={{
                                  background: 'linear-gradient(90deg, #7C3AED 0%, #6D28D9 100%)',
                                  color: '#FFFFFF',
                                  fontWeight: 800,
                                  fontSize: '0.74rem',
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  px: 1.5
                                }}
                              >
                                Démarrer
                              </Button>
                            )}

                            {row.status === 'RESOLVED' && (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<CompleteIcon />}
                                onClick={() => handleOpenComplete(row)}
                                sx={{
                                  background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                                  color: '#FFFFFF',
                                  fontWeight: 800,
                                  fontSize: '0.74rem',
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  px: 1.5,
                                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.35)'
                                }}
                              >
                                Valider la Clôture ✅
                              </Button>
                            )}

                            {row.status === 'IN_PROGRESS' && (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<CompleteIcon />}
                                onClick={() => handleOpenComplete(row)}
                                sx={{
                                  background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                                  color: '#FFFFFF',
                                  fontWeight: 800,
                                  fontSize: '0.74rem',
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  px: 1.5
                                }}
                              >
                                Résoudre
                              </Button>
                            )}

                            {!['COMPLETED', 'CANCELLED'].includes(row.status) && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleAction('cancel', row.id)}
                                sx={{ color: '#DC2626', borderColor: '#FECACA', fontSize: '0.72rem', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                              >
                                Annuler
                              </Button>
                            )}
                          </Box>
                        </TableCell>

                      </TableRow>
                    ))
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
        ) : (
          /* 🔲 VIEW 2: VISUAL KANBAN / INTERVENTION CARDS 🔲 */
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 2.5, pt: 1 }}>
            {paginatedMaintenances.map((row) => (
              <Card
                key={row.id}
                elevation={0}
                sx={{
                  borderRadius: 3.5,
                  border: '1px solid #E2E8F0',
                  borderTop: '5px solid',
                  borderTopColor: row.status === 'COMPLETED' ? '#059669' : row.status === 'IN_PROGRESS' ? '#7C3AED' : row.status === 'ASSIGNED' ? '#2563EB' : '#D97706',
                  bgcolor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 42, height: 42, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        {getCategoryIcon(row.equipment?.category?.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 900, color: '#E31E24' }}>
                          {row.equipment?.inventoryNumber}
                        </Typography>
                        <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1rem', lineHeight: 1.2 }}>
                          {row.equipment?.name}
                        </Typography>
                      </Box>
                    </Box>
                    {getPriorityBadge(row.priority)}
                  </Box>

                  <Typography sx={{ fontSize: '0.85rem', color: '#334155', bgcolor: '#F8FAFC', p: 1.5, borderRadius: 2, border: '1px solid #E2E8F0', mb: 2, minHeight: 54 }}>
                    {row.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #F1F5F9' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                      👤 {row.reportedBy ? `${row.reportedBy.firstName} ${row.reportedBy.lastName}` : 'Demandeur'}
                    </Typography>
                    <StatusChip status={row.status} statusMap={statusMap as any} />
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
                  <Button size="small" onClick={() => handleOpenDetails(row)} sx={{ textTransform: 'none', fontWeight: 800, color: '#1A1A2E' }}>
                    Détails 360°
                  </Button>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {row.status === 'REPORTED' && (
                      <Button size="small" variant="contained" onClick={() => handleOpenAssign(row)} sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 800 }}>
                        Assigner
                      </Button>
                    )}
                    {row.status === 'RESOLVED' && (
                      <Button size="small" variant="contained" color="success" onClick={() => handleOpenComplete(row)} sx={{ bgcolor: '#059669', textTransform: 'none', fontWeight: 800 }}>
                        Valider la Clôture ✅
                      </Button>
                    )}
                    {row.status === 'IN_PROGRESS' && (
                      <Button size="small" variant="contained" color="success" onClick={() => handleOpenComplete(row)} sx={{ textTransform: 'none', fontWeight: 800 }}>
                        Résoudre
                      </Button>
                    )}
                  </Box>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Paper>

      {/* 🚀 4. MODALE NOUVEAU TICKET DE MAINTENANCE 🚀 */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1A1A2E 0%, #2A1B28 50%, #7B0000 100%)',
          color: '#FFFFFF',
          p: 2.5,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#E31E24', color: '#FFFFFF' }}>
              <BuildIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                Ouvrir un Ticket de Maintenance
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Déclaration d'incident matériel pour prise en charge technique
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setCreateOpen(false)} sx={{ color: '#FFFFFF' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleCreate}>
          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, bgcolor: '#FAFAFA' }}>
            
            <FormControl fullWidth required>
              <InputLabel>Sélectionner l'Équipement en Panne *</InputLabel>
              <Select
                value={formData.equipmentId}
                label="Sélectionner l'Équipement en Panne *"
                onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                sx={{ bgcolor: '#FFFFFF' }}
              >
                {equipments.map(eq => (
                  <MenuItem key={eq.id} value={eq.id}>
                    {eq.name} ({eq.inventoryNumber}) {eq.serialNumber ? `• S/N: ${eq.serialNumber}` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Type d'Intervention</InputLabel>
                <Select
                  value={formData.type}
                  label="Type d'Intervention"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  sx={{ bgcolor: '#FFFFFF' }}
                >
                  <MenuItem value="CORRECTIVE">🔴 Maintenance Corrective (Panne / Réparation)</MenuItem>
                  <MenuItem value="PREVENTIVE">🔵 Maintenance Préventive (Entretien / Nettoyage)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Niveau de Priorité</InputLabel>
                <Select
                  value={formData.priority}
                  label="Niveau de Priorité"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  sx={{ bgcolor: '#FFFFFF' }}
                >
                  <MenuItem value="CRITICAL">🚨 Critique (Bloquant / SLA Immédiat)</MenuItem>
                  <MenuItem value="HIGH">🟠 Haute (Urgent)</MenuItem>
                  <MenuItem value="MEDIUM">🔵 Moyenne (Standard)</MenuItem>
                  <MenuItem value="LOW">⚪ Basse (Mineur)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Description Détaillée de la Panne *"
              placeholder="ex: L'ordinateur portable s'éteint brusquement après 10 minutes d'utilisation. Problème d'écran bleu au démarrage..."
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              sx={{ bgcolor: '#FFFFFF' }}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
            <Button onClick={() => setCreateOpen(false)} variant="outlined" sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B' }}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={actionLoading || !formData.equipmentId || !formData.description.trim()}
              sx={{
                background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                borderRadius: 2.5,
                px: 3.5,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(227, 30, 36, 0.4)'
              }}
            >
              {actionLoading ? 'Création en cours...' : 'Ouvrir le Ticket'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* 👨‍🔧 5. MODALE ASSIGNATION TECHNICIEN (Notification Gmail) 👨‍🔧 */}
      <Dialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssignIcon sx={{ color: '#2563EB' }} /> Assigner un Technicien IT
        </DialogTitle>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {selectedItem && (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E40AF' }}>Équipement concerné :</Typography>
              <Typography sx={{ fontWeight: 800, color: '#1E40AF' }}>
                {selectedItem.equipment?.name} ({selectedItem.equipment?.inventoryNumber})
              </Typography>
              <Typography variant="caption" sx={{ color: '#3B82F6', display: 'block', mt: 0.3 }}>
                Panne : {selectedItem.description}
              </Typography>
            </Paper>
          )}

          <FormControl fullWidth required>
            <InputLabel>Technicien en Charge *</InputLabel>
            <Select
              value={assignTechnicianId}
              label="Technicien en Charge *"
              onChange={(e) => setAssignTechnicianId(e.target.value)}
            >
              {technicians.map(t => (
                <MenuItem key={t.id} value={t.id}>
                  {t.firstName} {t.lastName} ({t.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="caption" sx={{ color: '#059669', bgcolor: '#ECFDF5', p: 1.5, borderRadius: 2, border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <EmailIcon sx={{ fontSize: 16 }} /> Un email Gmail officiel avec les détails de la panne sera envoyé au technicien sélectionné.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
          <Button onClick={() => setAssignOpen(false)} variant="outlined" sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B' }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            disabled={actionLoading || !assignTechnicianId || !selectedItem}
            onClick={() => handleAction('assign', selectedItem!.id, { technicianId: assignTechnicianId })}
            sx={{
              background: 'linear-gradient(90deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: 2.5,
              px: 3.5,
              textTransform: 'none'
            }}
          >
            {actionLoading ? 'Assignation & Envoi Email...' : 'Confirmer & Envoyer l\'Email'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ 6. MODALE CLÔTURE & RÉSOLUTION MAINTENANCE ✅ */}
      <Dialog
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CompleteIcon sx={{ color: '#059669' }} /> Clôturer & Résoudre la Maintenance
        </DialogTitle>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Diagnostic Réalisé *"
            placeholder="ex: Disque dur SSD défectueux remplacé et réinstallation de Windows 11..."
            fullWidth
            multiline
            rows={2}
            value={completeData.diagnosis}
            onChange={(e) => setCompleteData({ ...completeData, diagnosis: e.target.value })}
            required
          />

          <TextField
            label="Solution Technique Appliquée *"
            placeholder="ex: Remplacement par SSD Kingston 512 Go NVMe et mise à jour BIOS..."
            fullWidth
            multiline
            rows={2}
            value={completeData.solution}
            onChange={(e) => setCompleteData({ ...completeData, solution: e.target.value })}
            required
          />

          <TextField
            label="Coût de Réparation (MAD / DH)"
            type="number"
            placeholder="ex: 450"
            fullWidth
            value={completeData.cost}
            onChange={(e) => setCompleteData({ ...completeData, cost: e.target.value })}
            slotProps={{
              input: { startAdornment: <InputAdornment position="start">DH</InputAdornment> }
            }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
          <Button onClick={() => setCompleteOpen(false)} variant="outlined" sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B' }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            disabled={actionLoading || !completeData.diagnosis.trim() || !completeData.solution.trim() || !selectedItem}
            onClick={() => handleAction('complete', selectedItem!.id, {
              diagnosis: completeData.diagnosis,
              solution: completeData.solution,
              cost: completeData.cost ? Number(completeData.cost) : null,
            })}
            sx={{
              background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: 2.5,
              px: 3.5,
              textTransform: 'none'
            }}
          >
            {actionLoading ? 'Clôture en cours...' : 'Valider la Réparation & Clôturer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔍 7. FICHE 360° DÉTAILLÉE DU TICKET 🔍 */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        {selectedItem && (
          <>
            <DialogTitle sx={{
              background: 'linear-gradient(135deg, #1A1A2E 0%, #2A1B28 50%, #7B0000 100%)',
              color: '#FFFFFF',
              p: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 52, height: 52, bgcolor: '#E31E24', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(227,30,36,0.45)' }}>
                  <BuildIcon />
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFFFFF' }}>
                      Ticket #{selectedItem.id.slice(-6).toUpperCase()}
                    </Typography>
                    <StatusChip status={selectedItem.status} statusMap={statusMap as any} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#FFCDD2', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.85rem' }}>
                    Équipement : {selectedItem.equipment?.name} ({selectedItem.equipment?.inventoryNumber})
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setDetailsOpen(false)} sx={{ color: '#FFFFFF' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3, bgcolor: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Description de la Panne</Typography>
                <Typography sx={{ fontWeight: 700, color: '#1E293B', mt: 0.5, fontSize: '0.95rem' }}>{selectedItem.description}</Typography>
              </Paper>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Demandeur</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#1A1A2E', mt: 0.5 }}>
                    {selectedItem.reportedBy?.firstName} {selectedItem.reportedBy?.lastName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>{selectedItem.reportedBy?.email}</Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Technicien en Charge</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#2563EB', mt: 0.5 }}>
                    {selectedItem.technician ? `${selectedItem.technician.firstName} ${selectedItem.technician.lastName}` : 'Non assigné'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>{selectedItem.technician?.email || '-'}</Typography>
                </Paper>
              </Box>

              {(selectedItem.diagnosis || selectedItem.solution) && (
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #A7F3D0', bgcolor: '#ECFDF5' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#065F46', textTransform: 'uppercase' }}>Résolution Technique</Typography>
                  {selectedItem.diagnosis && (
                    <Typography sx={{ fontSize: '0.88rem', color: '#065F46', mt: 0.5 }}>
                      <strong>Diagnostic :</strong> {selectedItem.diagnosis}
                    </Typography>
                  )}
                  {selectedItem.solution && (
                    <Typography sx={{ fontSize: '0.88rem', color: '#065F46', mt: 0.5 }}>
                      <strong>Solution :</strong> {selectedItem.solution}
                    </Typography>
                  )}
                  {selectedItem.cost && (
                    <Typography sx={{ fontSize: '0.92rem', fontWeight: 900, color: '#047857', mt: 1 }}>
                      Coût d'intervention : {Number(selectedItem.cost).toLocaleString('fr-FR')} DH
                    </Typography>
                  )}
                </Paper>
              )}

            </DialogContent>

            <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'flex-end' }}>
              <Button onClick={() => setDetailsOpen(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700, color: '#64748B' }}>
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Pulse style for critical priority */}
      <style>{`
        @keyframes pulseCritical {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2.5, fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
