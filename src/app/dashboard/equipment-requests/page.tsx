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
  AssignmentTurnedIn as RequestIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  LocalShipping as FulfillIcon,
  Schedule as PendingIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LaptopMac as LaptopIcon,
  DesktopWindows as DesktopIcon,
  Headphones as HeadphoneIcon,
  Tv as ScreenIcon,
  Devices as DevicesIcon,
  FileDownload as ExportIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  FlashOn as UrgentIcon,
  Chat as CommentIcon,
  ViewList as TableViewIcon,
  ViewModule as GridViewIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import StatusChip from '@/components/shared/StatusChip';

const statusConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  PENDING: { label: 'En attente d\'arbitrage', color: '#D97706', bgColor: '#FFFBEB', borderColor: '#FDE68A' },
  APPROVED: { label: 'Approuvée (En préparation)', color: '#2563EB', bgColor: '#EFF6FF', borderColor: '#BFDBFE' },
  REJECTED: { label: 'Refusée', color: '#DC2626', bgColor: '#FEF2F2', borderColor: '#FECACA' },
  FULFILLED: { label: 'Matériel Livré & Déployé', color: '#059669', bgColor: '#ECFDF5', borderColor: '#A7F3D0' },
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  LOW: { label: 'Basse Priorité', color: '#64748B', bgColor: '#F1F5F9', borderColor: '#E2E8F0' },
  MEDIUM: { label: 'Priorité Standard', color: '#2563EB', bgColor: '#EFF6FF', borderColor: '#BFDBFE' },
  HIGH: { label: 'Haute Priorité', color: '#D97706', bgColor: '#FFFBEB', borderColor: '#FDE68A' },
  CRITICAL: { label: 'Urgente / Bloquante', color: '#DC2626', bgColor: '#FEF2F2', borderColor: '#FECACA' },
};

export default function EquipmentRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'CARDS' or 'TABLE'
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  // Filters
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [search, setSearch] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Decision Modal State
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionStatus, setActionStatus] = useState<'APPROVED' | 'REJECTED' | 'FULFILLED'>('APPROVED');
  const [adminResponse, setAdminResponse] = useState('');
  const [saving, setSaving] = useState(false);

  // Details 360 Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'ALL') params.set('status', filterStatus);
      if (filterPriority !== 'ALL') params.set('priority', filterPriority);

      const res = await fetch(`/api/equipment-requests?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setSnackbar({ open: true, message: "Erreur lors du chargement des demandes", severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, filterPriority]);

  const handleOpenDecision = (req: any, status: 'APPROVED' | 'REJECTED' | 'FULFILLED') => {
    setSelectedRequest(req);
    setActionStatus(status);
    if (status === 'APPROVED') {
      setAdminResponse("Demande validée par la DSI. Le matériel est en cours de préparation pour remise avec PV de décharge.");
    } else if (status === 'REJECTED') {
      setAdminResponse("Demande refusée : le matériel demandé n'est pas conforme aux prérequis du poste ou stock insuffisant.");
    } else {
      setAdminResponse("Matériel remis en main propre au collaborateur et déployé.");
    }
    setDecisionModalOpen(true);
  };

  const handleOpenDetails = (req: any) => {
    setSelectedRequest(req);
    setDetailsModalOpen(true);
  };

  const handleConfirmDecision = async () => {
    if (!selectedRequest) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/equipment-requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionStatus,
          adminResponse: adminResponse.trim() || undefined
        }),
      });

      if (res.ok) {
        const actionLabel = actionStatus === 'APPROVED' ? 'approuvée' : actionStatus === 'REJECTED' ? 'refusée' : 'marquée comme livrée';
        setSnackbar({ open: true, message: `Demande ${actionLabel} avec succès ! Notification envoyée à l'employé.`, severity: 'success' });
        setDecisionModalOpen(false);
        fetchRequests();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Erreur de mise à jour");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur lors de la validation", severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (requests.length === 0) return;
    const headers = ["ID", "Date", "Titre", "Quantité", "Catégorie", "Demandeur", "Département", "Priorité", "Statut", "Justification", "Réponse DSI"];
    const rows = requests.map(r => [
      r.id,
      r.createdAt ? new Date(r.createdAt).toISOString() : '',
      `"${(r.title || '').replace(/"/g, '""')}"`,
      r.quantity || 1,
      `"${r.categoryName || ''}"`,
      `"${r.requestedBy || ''}"`,
      `"${r.departmentName || ''}"`,
      `"${r.priority}"`,
      `"${r.status}"`,
      `"${(r.reason || r.description || '').replace(/"/g, '""')}"`,
      `"${(r.adminResponse || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `demandes_equipement_cathedis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({ open: true, message: "Exportation du registre des demandes réussie !", severity: 'success' });
  };

  const getCategoryIcon = (catName?: string) => {
    const c = catName?.toLowerCase() || '';
    if (c.includes('portable') || c.includes('laptop')) return <LaptopIcon sx={{ fontSize: 20, color: '#E31E24' }} />;
    if (c.includes('fixe') || c.includes('desktop')) return <DesktopIcon sx={{ fontSize: 20, color: '#2563EB' }} />;
    if (c.includes('casque') || c.includes('audio')) return <HeadphoneIcon sx={{ fontSize: 20, color: '#7C3AED' }} />;
    if (c.includes('écran') || c.includes('ecran')) return <ScreenIcon sx={{ fontSize: 20, color: '#059669' }} />;
    return <DevicesIcon sx={{ fontSize: 20, color: '#64748B' }} />;
  };

  const filteredRequests = requests.filter(r => {
    const s = search.toLowerCase();
    const matchSearch = !s ||
      (r.title && r.title.toLowerCase().includes(s)) ||
      (r.requestedBy && r.requestedBy.toLowerCase().includes(s)) ||
      (r.departmentName && r.departmentName.toLowerCase().includes(s)) ||
      (r.description && r.description.toLowerCase().includes(s)) ||
      (r.reason && r.reason.toLowerCase().includes(s));

    return matchSearch;
  });

  // KPI Metrics
  const total = requests.length;
  const pending = requests.filter(r => r.status === 'PENDING').length;
  const approved = requests.filter(r => r.status === 'APPROVED').length;
  const fulfilled = requests.filter(r => r.status === 'FULFILLED').length;
  const rejected = requests.filter(r => r.status === 'REJECTED').length;

  const paginatedRequests = filteredRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
              <RequestIcon sx={{ fontSize: 34, color: '#FFFFFF' }} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                  Demandes d'Équipement & Dotations
                </Typography>
                <Chip
                  label={`${pending} en attente d'arbitrage`}
                  size="small"
                  sx={{ bgcolor: 'rgba(217, 119, 6, 0.25)', color: '#FDE68A', border: '1px solid rgba(253, 230, 138, 0.4)', fontWeight: 800 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.6, maxWidth: 680 }}>
                Centre d'arbitrage et de validation des demandes de matériel soumises par les collaborateurs Cathedis.
              </Typography>
            </Box>
          </Box>

          {/* Action Hub */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
              onClick={fetchRequests}
              startIcon={<RefreshIcon />}
              sx={{
                background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                color: '#FFFFFF',
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                px: 2.5,
                boxShadow: '0 4px 14px rgba(227, 30, 36, 0.4)',
                '&:hover': { background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)' }
              }}
            >
              Actualiser
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 📊 2. FOUR GLASSMORPHIС KPI CARDS 📊 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {[
          { label: "Total Demandes Reçues", number: total, sub: "Toutes périodes", icon: <RequestIcon />, color: '#1A1A2E' },
          { label: "En Attente d'Arbitrage", number: pending, sub: "Nécessite votre validation", icon: <PendingIcon />, color: '#D97706' },
          { label: "Demandes Approuvées", number: approved, sub: "En cours de préparation IT", icon: <ApproveIcon />, color: '#2563EB' },
          { label: "Matériels Livrés & Déployés", number: fulfilled, sub: "Dotations effectives", icon: <FulfillIcon />, color: '#059669' },
        ].map((stat, i) => (
          <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 2, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' } }}>
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
        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <Box sx={{ display: 'flex', gap: 2, flex: '1 1 500px', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Rechercher par matériel, demandeur, département, justification..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> } }}
              sx={{ flex: '1 1 280px' }}
            />

            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>Statut d'Arbitrage</InputLabel>
              <Select value={filterStatus} label="Statut d'Arbitrage" onChange={(e) => setFilterStatus(e.target.value)}>
                <MenuItem value="ALL">Tous les statuts</MenuItem>
                <MenuItem value="PENDING">🟠 En attente ({pending})</MenuItem>
                <MenuItem value="APPROVED">🔵 Approuvée ({approved})</MenuItem>
                <MenuItem value="FULFILLED">🟢 Livrée ({fulfilled})</MenuItem>
                <MenuItem value="REJECTED">🔴 Refusée ({rejected})</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Priorité</InputLabel>
              <Select value={filterPriority} label="Priorité" onChange={(e) => setFilterPriority(e.target.value)}>
                <MenuItem value="ALL">Toutes</MenuItem>
                <MenuItem value="CRITICAL">🚨 Urgente</MenuItem>
                <MenuItem value="HIGH">🟠 Haute</MenuItem>
                <MenuItem value="MEDIUM">🔵 Standard</MenuItem>
                <MenuItem value="LOW">⚪ Basse</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* View Mode Toggle Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>
              {filteredRequests.length} demande(s)
            </Typography>
            <ButtonGroup size="small" sx={{ borderRadius: 2 }}>
              <Button
                variant={viewMode === 'CARDS' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('CARDS')}
                startIcon={<GridViewIcon />}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: viewMode === 'CARDS' ? '#1A1A2E' : 'transparent',
                  color: viewMode === 'CARDS' ? '#FFFFFF' : '#64748B',
                  borderColor: '#CBD5E1',
                  '&:hover': { bgcolor: viewMode === 'CARDS' ? '#1A1A2E' : '#F1F5F9' }
                }}
              >
                Cartes d'Arbitrage
              </Button>
              <Button
                variant={viewMode === 'TABLE' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('TABLE')}
                startIcon={<TableViewIcon />}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: viewMode === 'TABLE' ? '#1A1A2E' : 'transparent',
                  color: viewMode === 'TABLE' ? '#FFFFFF' : '#64748B',
                  borderColor: '#CBD5E1',
                  '&:hover': { bgcolor: viewMode === 'TABLE' ? '#1A1A2E' : '#F1F5F9' }
                }}
              >
                Tableau
              </Button>
            </ButtonGroup>
          </Box>
        </Box>

        {/* 🔲 VIEW 1: MODERN DECISION CARDS 🔲 */}
        {viewMode === 'CARDS' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Paper key={i} elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Skeleton width="40%" height={30} />
                  <Skeleton width="100%" height={80} sx={{ mt: 2 }} />
                </Paper>
              ))
            ) : filteredRequests.length === 0 ? (
              <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <RequestIcon sx={{ fontSize: 54, color: '#CBD5E1', mb: 1.5 }} />
                <Typography sx={{ fontWeight: 800, color: '#64748B', fontSize: '1.05rem' }}>
                  Aucune demande d'équipement ne correspond aux critères.
                </Typography>
              </Paper>
            ) : (
              paginatedRequests.map((req) => {
                const sc = statusConfig[req.status] || statusConfig.PENDING;
                const pc = priorityConfig[req.priority] || priorityConfig.MEDIUM;

                return (
                  <Paper
                    key={req.id}
                    elevation={0}
                    sx={{
                      borderRadius: 3.5,
                      border: '1px solid #E2E8F0',
                      borderLeft: `6px solid ${sc.color}`,
                      bgcolor: '#FFFFFF',
                      p: 3,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2.5 }}>
                      
                      {/* Left: Request & User Details */}
                      <Box sx={{ flex: '1 1 500px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getCategoryIcon(req.categoryName)}
                          </Box>
                          <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.15rem' }}>
                            {req.title}
                          </Typography>
                          {req.quantity > 1 && (
                            <Chip label={`Quantité : ${req.quantity}`} size="small" sx={{ fontWeight: 800, bgcolor: '#1A1A2E', color: '#FFFFFF', fontSize: '0.72rem' }} />
                          )}
                          <Chip
                            label={sc.label}
                            size="small"
                            sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: sc.bgColor, color: sc.color, border: '1px solid', borderColor: sc.borderColor }}
                          />
                          <Chip
                            label={pc.label}
                            size="small"
                            sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: pc.bgColor, color: pc.color, border: '1px solid', borderColor: pc.borderColor }}
                          />
                        </Box>

                        <Typography sx={{ fontSize: '0.9rem', color: '#475569', mb: 1.5, lineHeight: 1.4 }}>
                          {req.description}
                        </Typography>

                        {req.reason && (
                          <Box sx={{ p: 1.8, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.3 }}>
                              📝 Justification & Contexte du Collaborateur :
                            </Typography>
                            <Typography sx={{ fontSize: '0.85rem', color: '#334155', fontStyle: 'italic' }}>
                              "{req.reason}"
                            </Typography>
                          </Box>
                        )}

                        {/* Admin Feedback Box */}
                        {req.adminResponse && (
                          <Box sx={{ p: 1.8, borderRadius: 2.5, bgcolor: req.status === 'APPROVED' ? '#ECFDF5' : req.status === 'REJECTED' ? '#FEF2F2' : '#EFF6FF', border: '1px solid', borderColor: req.status === 'APPROVED' ? '#A7F3D0' : req.status === 'REJECTED' ? '#FECACA' : '#BFDBFE', mb: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: req.status === 'APPROVED' ? '#047857' : req.status === 'REJECTED' ? '#DC2626' : '#1D4ED8', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                              <CommentIcon sx={{ fontSize: 14 }} /> Réponse Officielle de la DSI :
                            </Typography>
                            <Typography sx={{ fontSize: '0.85rem', color: '#1E293B', fontWeight: 700 }}>
                              {req.adminResponse}
                            </Typography>
                          </Box>
                        )}

                        {/* Requester Metadata Footer */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', pt: 1, borderTop: '1px dashed #E2E8F0' }}>
                          <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PersonIcon sx={{ fontSize: 15, color: '#E31E24' }} />
                            Demandé par : {req.requestedBy}
                          </Typography>
                          {req.departmentName && (
                            <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <BusinessIcon sx={{ fontSize: 15 }} /> {req.departmentName}
                            </Typography>
                          )}
                          <Typography variant="caption" sx={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                            <CalendarIcon sx={{ fontSize: 13 }} />
                            {new Date(req.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Right: Quick Action Buttons */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 160 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenDetails(req)}
                          startIcon={<ViewIcon />}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, color: '#475569', borderColor: '#CBD5E1' }}
                        >
                          Fiche 360°
                        </Button>

                        {req.status === 'PENDING' && (
                          <>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<ApproveIcon />}
                              onClick={() => handleOpenDecision(req, 'APPROVED')}
                              sx={{
                                background: 'linear-gradient(90deg, #2563EB 0%, #1D4ED8 100%)',
                                color: '#FFFFFF',
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 800,
                                py: 0.8,
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
                              }}
                            >
                              Approuver
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              startIcon={<RejectIcon />}
                              onClick={() => handleOpenDecision(req, 'REJECTED')}
                              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}
                            >
                              Refuser
                            </Button>
                          </>
                        )}

                        {req.status === 'APPROVED' && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<FulfillIcon />}
                            onClick={() => handleOpenDecision(req, 'FULFILLED')}
                            sx={{
                              background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                              color: '#FFFFFF',
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 800,
                              py: 0.8,
                              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)'
                            }}
                          >
                            Marquer Livré
                          </Button>
                        )}
                      </Box>

                    </Box>
                  </Paper>
                );
              })
            )}

            <TablePagination
              component="div"
              count={filteredRequests.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Demandes par page :"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`}
              sx={{ borderTop: '1px solid #E2E8F0', px: 2 }}
            />
          </Box>
        ) : (
          /* 📋 VIEW 2: HIGH-DENSITY DATA TABLE VIEW 📋 */
          <>
            <TableContainer>
              <Table size="medium">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Matériel Demandé</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Demandeur & Service</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Priorité</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Statut d'Arbitrage</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Date</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#1E293B' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton width={160} /></TableCell>
                        <TableCell><Skeleton width={140} /></TableCell>
                        <TableCell><Skeleton width={100} /></TableCell>
                        <TableCell><Skeleton width={120} /></TableCell>
                        <TableCell><Skeleton width={90} /></TableCell>
                        <TableCell align="center"><Skeleton width={120} /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                        <RequestIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                        <Typography sx={{ fontWeight: 700, color: '#64748B' }}>
                          Aucune demande trouvée.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRequests.map((row) => (
                      <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '0.92rem' }}>
                            {row.title}
                          </Typography>
                          {row.quantity > 1 && (
                            <Typography variant="caption" sx={{ color: '#E31E24', fontWeight: 800 }}>
                              Quantité : {row.quantity}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>
                            {row.requestedBy}
                          </Typography>
                          {row.departmentName && (
                            <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, display: 'block' }}>
                              {row.departmentName}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={priorityConfig[row.priority]?.label || row.priority}
                            size="small"
                            sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: priorityConfig[row.priority]?.bgColor, color: priorityConfig[row.priority]?.color }}
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={statusConfig[row.status]?.label || row.status}
                            size="small"
                            sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: statusConfig[row.status]?.bgColor, color: statusConfig[row.status]?.color }}
                          />
                        </TableCell>

                        <TableCell sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                          {new Date(row.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </TableCell>

                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.8, justifyContent: 'center' }}>
                            <Tooltip title="Fiche 360°">
                              <IconButton onClick={() => handleOpenDetails(row)} size="small" sx={{ color: '#1A1A2E', bgcolor: '#F1F5F9' }}>
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {row.status === 'PENDING' && (
                              <>
                                <Button size="small" variant="contained" onClick={() => handleOpenDecision(row, 'APPROVED')} sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 800, fontSize: '0.72rem' }}>
                                  Approuver
                                </Button>
                                <Button size="small" variant="outlined" color="error" onClick={() => handleOpenDecision(row, 'REJECTED')} sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.72rem' }}>
                                  Refuser
                                </Button>
                              </>
                            )}
                            {row.status === 'APPROVED' && (
                              <Button size="small" variant="contained" color="success" onClick={() => handleOpenDecision(row, 'FULFILLED')} sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.72rem' }}>
                                Livrer
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
              count={filteredRequests.length}
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

      {/* ⚖️ 4. MODALE D'ARBITRAGE (Approbation / Refus / Livraison) ⚖️ */}
      <Dialog
        open={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}
      >
        <DialogTitle sx={{
          fontWeight: 800,
          color: '#1A1A2E',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid #E2E8F0',
          py: 2
        }}>
          {actionStatus === 'APPROVED' ? <ApproveIcon sx={{ color: '#2563EB' }} /> : actionStatus === 'REJECTED' ? <RejectIcon sx={{ color: '#DC2626' }} /> : <FulfillIcon sx={{ color: '#059669' }} />}
          {actionStatus === 'APPROVED' ? 'Approuver la Demande de Matériel' : actionStatus === 'REJECTED' ? 'Refuser la Demande' : 'Confirmer la Livraison du Matériel'}
        </DialogTitle>

        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {selectedRequest && (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>Demande sélectionnée :</Typography>
              <Typography sx={{ fontWeight: 800, color: '#1A1A2E' }}>
                {selectedRequest.title} {selectedRequest.quantity > 1 ? `(x${selectedRequest.quantity})` : ''}
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.3 }}>
                Demandeur : <strong>{selectedRequest.requestedBy}</strong> ({selectedRequest.departmentName || 'Département'})
              </Typography>
            </Paper>
          )}

          <TextField
            label="Réponse officielle / Message pour l'employé *"
            placeholder="Précisez les consignes de retrait ou le motif du refus..."
            fullWidth
            multiline
            rows={4}
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
            required
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
          <Button onClick={() => setDecisionModalOpen(false)} variant="outlined" sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B' }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            disabled={saving}
            onClick={handleConfirmDecision}
            sx={{
              bgcolor: actionStatus === 'APPROVED' ? '#2563EB' : actionStatus === 'REJECTED' ? '#DC2626' : '#059669',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: 2.5,
              px: 3.5,
              textTransform: 'none',
              '&:hover': { opacity: 0.9 }
            }}
          >
            {saving ? 'Enregistrement...' : actionStatus === 'APPROVED' ? 'Confirmer l\'Approbation' : actionStatus === 'REJECTED' ? 'Confirmer le Refus' : 'Confirmer la Livraison'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔍 5. MODALE FICHE 360° DE LA DEMANDE 🔍 */}
      <Dialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        {selectedRequest && (
          <>
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
                  <RequestIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                    Fiche Demande #{selectedRequest.id.slice(-6).toUpperCase()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    Demandé par {selectedRequest.requestedBy}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setDetailsModalOpen(false)} sx={{ color: '#FFFFFF' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3, bgcolor: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Matériel Demandé</Typography>
                <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.05rem', mt: 0.3 }}>
                  {selectedRequest.title} {selectedRequest.quantity > 1 ? `(x${selectedRequest.quantity})` : ''}
                </Typography>
                <Typography sx={{ fontSize: '0.88rem', color: '#475569', mt: 1 }}>{selectedRequest.description}</Typography>
              </Paper>

              {selectedRequest.reason && (
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Justification de l'Employé</Typography>
                  <Typography sx={{ fontSize: '0.88rem', color: '#334155', fontStyle: 'italic', mt: 0.5 }}>"{selectedRequest.reason}"</Typography>
                </Paper>
              )}

              {selectedRequest.adminResponse && (
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase' }}>Réponse Officielle DSI</Typography>
                  <Typography sx={{ fontSize: '0.88rem', color: '#1E293B', fontWeight: 700, mt: 0.5 }}>{selectedRequest.adminResponse}</Typography>
                </Paper>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'flex-end' }}>
              <Button onClick={() => setDetailsModalOpen(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700, color: '#64748B' }}>
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
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
