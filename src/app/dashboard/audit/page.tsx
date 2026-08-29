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
  TablePagination
} from '@mui/material';
import {
  Security as SecurityIcon,
  VerifiedUser as ShieldCheckIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  AddCircle as AddIcon,
  Edit as EditIcon,
  DeleteForever as DeleteIcon,
  AssignmentInd as AssignIcon,
  Draw as SignIcon,
  Email as EmailIcon,
  VpnKey as KeyIcon,
  Computer as ComputerIcon,
  Person as PersonIcon,
  Storefront as SupplierIcon,
  Inventory as InventoryIcon,
  Build as MaintenanceIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Schedule as TimeIcon,
  Fingerprint as FingerprintIcon
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';

export default function AuditLogsPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    createCount: 0,
    updateCount: 0,
    deleteCount: 0,
    securityCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Inspector Modal
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (actionFilter !== 'ALL') params.set('action', actionFilter);
      if (entityFilter !== 'ALL') params.set('entity', entityFilter);
      params.set('limit', '300');

      const res = await fetch(`/api/audit?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setLogs(json.logs || []);
        if (json.stats) setStats(json.stats);
      } else {
        const err = await res.json();
        throw new Error(err.error || "Erreur de chargement");
      }
    } catch (err: any) {
      console.error(err);
      setSnackbar({ open: true, message: err.message || "Erreur lors du chargement des logs", severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleOpenInspector = (log: any) => {
    setSelectedLog(log);
    setInspectorOpen(true);
  };

  const handleCopyJSON = () => {
    if (selectedLog) {
      navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
      setSnackbar({ open: true, message: "Détails JSON copiés dans le presse-papier !", severity: 'success' });
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["ID", "Date", "Action", "Entité", "ID Entité", "Utilisateur", "Email", "Rôle", "Détails"];
    const rows = logs.map(l => [
      l.id,
      new Date(l.createdAt).toISOString(),
      `"${l.action}"`,
      `"${l.entity}"`,
      `"${l.entityId || ''}"`,
      `"${l.user ? `${l.user.firstName} ${l.user.lastName}` : 'Système'}"`,
      `"${l.user?.email || ''}"`,
      `"${l.user?.role || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `journal_audit_cathedis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({ open: true, message: "Export CSV généré avec succès !", severity: 'success' });
  };

  // Format Relative Time
  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return "À l'instant";
    if (diffSec < 3600) return `Il y a ${Math.floor(diffSec / 60)} min`;
    if (diffSec < 86400) return `Il y a ${Math.floor(diffSec / 3600)} h`;
    if (diffSec < 604800) return `Il y a ${Math.floor(diffSec / 86400)} j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  // Action badge and visual styling
  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CREATE')) {
      return (
        <Chip
          icon={<AddIcon sx={{ fontSize: 16, color: '#047857 !important' }} />}
          label={action}
          size="small"
          sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 800, border: '1px solid #A7F3D0', fontSize: '0.74rem' }}
        />
      );
    }
    if (act.includes('UPDATE')) {
      return (
        <Chip
          icon={<EditIcon sx={{ fontSize: 16, color: '#1D4ED8 !important' }} />}
          label={action}
          size="small"
          sx={{ bgcolor: '#EFF6FF', color: '#1E40AF', fontWeight: 800, border: '1px solid #BFDBFE', fontSize: '0.74rem' }}
        />
      );
    }
    if (act.includes('DELETE')) {
      return (
        <Chip
          icon={<DeleteIcon sx={{ fontSize: 16, color: '#DC2626 !important' }} />}
          label={action}
          size="small"
          sx={{ bgcolor: '#FEF2F2', color: '#991B1B', fontWeight: 800, border: '1px solid #FECACA', fontSize: '0.74rem' }}
        />
      );
    }
    if (act.includes('ASSIGN')) {
      return (
        <Chip
          icon={<AssignIcon sx={{ fontSize: 16, color: '#7C3AED !important' }} />}
          label={action}
          size="small"
          sx={{ bgcolor: '#F5F3FF', color: '#5B21B6', fontWeight: 800, border: '1px solid #DDD6FE', fontSize: '0.74rem' }}
        />
      );
    }
    if (act.includes('SIGN')) {
      return (
        <Chip
          icon={<SignIcon sx={{ fontSize: 16, color: '#D97706 !important' }} />}
          label={action}
          size="small"
          sx={{ bgcolor: '#FFFBEB', color: '#92400E', fontWeight: 800, border: '1px solid #FDE68A', fontSize: '0.74rem' }}
        />
      );
    }
    if (act.includes('EMAIL') || act.includes('MAIL')) {
      return (
        <Chip
          icon={<EmailIcon sx={{ fontSize: 16, color: '#0891B2 !important' }} />}
          label={action}
          size="small"
          sx={{ bgcolor: '#ECFEFF', color: '#155E75', fontWeight: 800, border: '1px solid #A5F3FC', fontSize: '0.74rem' }}
        />
      );
    }
    if (act.includes('LOGIN') || act.includes('AUTH')) {
      return (
        <Chip
          icon={<KeyIcon sx={{ fontSize: 16, color: '#B45309 !important' }} />}
          label={action}
          size="small"
          sx={{ bgcolor: '#FEF3C7', color: '#78350F', fontWeight: 800, border: '1px solid #FCD34D', fontSize: '0.74rem' }}
        />
      );
    }
    return (
      <Chip
        label={action}
        size="small"
        sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 800, border: '1px solid #CBD5E1', fontSize: '0.74rem' }}
      />
    );
  };

  // Entity Icon Helper
  const getEntityIcon = (entity: string) => {
    const ent = (entity || '').toLowerCase();
    if (ent.includes('equipment') || ent.includes('équipement')) return <ComputerIcon sx={{ fontSize: 16, color: '#2563EB' }} />;
    if (ent.includes('user') || ent.includes('utilisateur')) return <PersonIcon sx={{ fontSize: 16, color: '#E31E24' }} />;
    if (ent.includes('supplier') || ent.includes('fournisseur')) return <SupplierIcon sx={{ fontSize: 16, color: '#059669' }} />;
    if (ent.includes('maintenance')) return <MaintenanceIcon sx={{ fontSize: 16, color: '#D97706' }} />;
    if (ent.includes('inventory') || ent.includes('inventaire')) return <InventoryIcon sx={{ fontSize: 16, color: '#7C3AED' }} />;
    return <HistoryIcon sx={{ fontSize: 16, color: '#64748B' }} />;
  };

  const parseDetailsPreview = (details?: string) => {
    if (!details) return '-';
    try {
      const obj = JSON.parse(details);
      if (typeof obj === 'object') {
        const keys = Object.keys(obj).slice(0, 3);
        return keys.map(k => `${k}: ${typeof obj[k] === 'object' ? '...' : obj[k]}`).join(' | ');
      }
      return String(obj);
    } catch {
      return details;
    }
  };

  const paginatedLogs = logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
      
      {/* 🛡️ ULTRA-PREMIUM HERO BANNER */}
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
        {/* Subtle decorative background elements */}
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.25) 0%, rgba(227,30,36,0) 70%)', pointerEvents: 'none' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap', gap: 2.5, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar sx={{ width: 62, height: 62, bgcolor: 'rgba(227,30,36,0.3)', border: '2px solid rgba(227,30,36,0.8)', color: '#FFFFFF', boxShadow: '0 8px 24px rgba(227,30,36,0.45)' }}>
              <SecurityIcon sx={{ fontSize: 34, color: '#FFFFFF' }} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                  Journal d'Audit & Sécurité
                </Typography>
                <Chip
                  icon={<ShieldCheckIcon sx={{ fontSize: 16, color: '#A7F3D0 !important' }} />}
                  label="Traçabilité Active & Inviolable"
                  size="small"
                  sx={{ bgcolor: 'rgba(5, 150, 105, 0.25)', color: '#A7F3D0', border: '1px solid rgba(167, 243, 208, 0.4)', fontWeight: 800 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.6, maxWidth: 650 }}>
                Registre temps réel de toutes les opérations du parc informatique Cathedis : créations, modifications, suppressions, signatures de PV et communications.
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={handleExportCSV}
              startIcon={<DownloadIcon />}
              sx={{
                color: '#FFFFFF',
                borderColor: 'rgba(255,255,255,0.3)',
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                px: 2.2,
                backdropFilter: 'blur(10px)',
                bgcolor: 'rgba(255,255,255,0.06)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: '#FFFFFF' }
              }}
            >
              Exporter CSV
            </Button>
            <Button
              variant="contained"
              onClick={fetchLogs}
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

      {/* 📊 4 KPI AUDIT METRICS */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {[
          { label: "Total Événements Audit", number: stats.totalCount, icon: <FingerprintIcon />, color: '#1A1A2E', bg: '#F8FAFC' },
          { label: "Créations & Enregistrements", number: stats.createCount, icon: <AddIcon />, color: '#059669', bg: '#ECFDF5' },
          { label: "Modifications & Mises à Jour", number: stats.updateCount, icon: <EditIcon />, color: '#2563EB', bg: '#EFF6FF' },
          { label: "Suppressions & Sécurité", number: stats.deleteCount + stats.securityCount, icon: <DeleteIcon />, color: '#E31E24', bg: '#FEF2F2' },
        ].map((stat, i) => (
          <Paper
            key={i}
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
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
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, mt: 0.5, display: 'block' }}>
                {stat.label}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* 🔍 FILTER & SEARCH CONSOLE */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', p: 2.5, bgcolor: '#FFFFFF' }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Rechercher par action, entité, nom opérateur, email, détails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> }
            }}
            sx={{ flex: '1 1 300px' }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Type d'Action</InputLabel>
            <Select value={actionFilter} label="Type d'Action" onChange={(e) => setActionFilter(e.target.value)}>
              <MenuItem value="ALL">Toutes les actions</MenuItem>
              <MenuItem value="CREATE">➕ CREATE (Création)</MenuItem>
              <MenuItem value="UPDATE">✏️ UPDATE (Modification)</MenuItem>
              <MenuItem value="DELETE">🗑️ DELETE (Suppression)</MenuItem>
              <MenuItem value="ASSIGN">🟣 ASSIGN (Affectation)</MenuItem>
              <MenuItem value="SIGN">✍️ SIGN (Signature PV)</MenuItem>
              <MenuItem value="EMAIL">✉️ EMAIL (Communication)</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Entité Concernée</InputLabel>
            <Select value={entityFilter} label="Entité Concernée" onChange={(e) => setEntityFilter(e.target.value)}>
              <MenuItem value="ALL">Toutes les entités</MenuItem>
              <MenuItem value="Equipment">💻 Équipement</MenuItem>
              <MenuItem value="User">👤 Utilisateur</MenuItem>
              <MenuItem value="Assignment">📋 Affectation</MenuItem>
              <MenuItem value="Maintenance">🛠️ Maintenance</MenuItem>
              <MenuItem value="Supplier">🏢 Fournisseur</MenuItem>
              <MenuItem value="Inventory">📦 Inventaire</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #1A1A2E 0%, #2A1B28 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Filtrer
          </Button>
        </Box>

        {/* 📜 AUDIT LOGS DATA TABLE */}
        <TableContainer>
          <Table size="medium">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Horodatage & Date</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Action Effectuée</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Entité Concernée</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Opérateur Responsable</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Résumé des Détails</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#1E293B' }}>Inspecter</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton width={120} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell><Skeleton width={110} /></TableCell>
                    <TableCell><Skeleton width={140} /></TableCell>
                    <TableCell><Skeleton width={200} /></TableCell>
                    <TableCell align="center"><Skeleton width={32} height={32} variant="circular" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                    <ShieldCheckIcon sx={{ fontSize: 52, color: '#CBD5E1', mb: 1 }} />
                    <Typography sx={{ fontWeight: 700, color: '#64748B' }}>
                      Aucun événement d'audit ne correspond aux critères de recherche.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                      '&:hover': { bgcolor: '#F8FAFC' }
                    }}
                    onClick={() => handleOpenInspector(log)}
                  >
                    {/* Timestamp */}
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E293B' }}>
                        {new Date(log.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        <TimeIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                        {new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        <span style={{ color: '#E31E24', fontWeight: 700, marginLeft: 4 }}>• {getRelativeTime(log.createdAt)}</span>
                      </Typography>
                    </TableCell>

                    {/* Action */}
                    <TableCell>
                      {getActionBadge(log.action)}
                    </TableCell>

                    {/* Entity */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ p: 0.6, borderRadius: 1.5, bgcolor: '#F1F5F9' }}>
                          {getEntityIcon(log.entity)}
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E293B' }}>
                            {log.entity}
                          </Typography>
                          {log.entityId && (
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#94A3B8', fontSize: '0.72rem' }}>
                              ID: {log.entityId.slice(-8)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Operator User */}
                    <TableCell>
                      {log.user ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#1A1A2E', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 800 }}>
                            {log.user.firstName?.[0]}{log.user.lastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A1A2E' }}>
                              {log.user.firstName} {log.user.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                              {log.user.email}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Chip label="Système Automatique" size="small" sx={{ fontWeight: 700, bgcolor: '#F1F5F9', color: '#64748B' }} />
                      )}
                    </TableCell>

                    {/* Summary */}
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography sx={{ fontSize: '0.82rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {parseDetailsPreview(log.details)}
                      </Typography>
                    </TableCell>

                    {/* Action Inspector Button */}
                    <TableCell align="center">
                      <Tooltip title="Inspecter l'événement & Payload JSON">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInspector(log);
                          }}
                          sx={{ color: '#E31E24', bgcolor: '#FFF1F1', '&:hover': { bgcolor: '#FFE2E2' } }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={logs.length}
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
      </Paper>

      {/* 🔍 MODALE INSPECTEUR DE SÉCURITÉ & DÉTAILS JSON 🔍 */}
      <Dialog
        open={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        {selectedLog && (
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
                  <ShieldCheckIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                    Détails de l'Événement d'Audit
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'monospace' }}>
                    ID: {selectedLog.id}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setInspectorOpen(false)} sx={{ color: '#FFFFFF' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3, bgcolor: '#FAFAFA' }}>
              
              {/* Event Metadata Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                    Type d'Action & Entité
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                    {getActionBadge(selectedLog.action)}
                    <Chip label={selectedLog.entity} size="small" sx={{ fontWeight: 800, bgcolor: '#F1F5F9' }} />
                  </Box>
                  {selectedLog.entityId && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, fontFamily: 'monospace', color: '#64748B' }}>
                      Réf. Cible : {selectedLog.entityId}
                    </Typography>
                  )}
                </Paper>

                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                    Opérateur Responsable
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: '#1E293B', mt: 0.5 }}>
                    {selectedLog.user ? `${selectedLog.user.firstName} ${selectedLog.user.lastName}` : 'Système Automatique'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                    {selectedLog.user?.email || 'N/A'} • {selectedLog.user?.role || 'SYSTEM'}
                  </Typography>
                </Paper>
              </Box>

              {/* Timestamp Info */}
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CalendarIcon sx={{ color: '#E31E24' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Date d'Exécution</Typography>
                    <Typography sx={{ fontWeight: 800, color: '#1A1A2E' }}>
                      {new Date(selectedLog.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} à {new Date(selectedLog.createdAt).toLocaleTimeString('fr-FR')}
                    </Typography>
                  </Box>
                </Box>
                <Chip label={getRelativeTime(selectedLog.createdAt)} size="small" sx={{ fontWeight: 800, bgcolor: '#FFF1F1', color: '#E31E24' }} />
              </Paper>

              {/* JSON Payload Inspector */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#1A1A2E' }}>
                    📦 Données de l'Opération (Payload JSON / Métadonnées)
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={handleCopyJSON}
                    sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', color: '#E31E24' }}
                  >
                    Copier JSON
                  </Button>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    bgcolor: '#1A1A2E',
                    color: '#A7F3D0',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: '0.85rem',
                    maxHeight: 280,
                    overflowY: 'auto',
                    border: '1px solid #334155'
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLog.details || '{}'), null, 2);
                      } catch {
                        return selectedLog.details || 'Aucune donnée supplémentaire enregistrée.';
                      }
                    })()}
                  </pre>
                </Paper>
              </Box>

            </DialogContent>

            <DialogActions sx={{ p: 2.5, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
              <Button onClick={() => setInspectorOpen(false)} variant="outlined" sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B' }}>
                Fermer
              </Button>
              <Button
                variant="contained"
                onClick={handleCopyJSON}
                startIcon={<CopyIcon />}
                sx={{
                  background: 'linear-gradient(90deg, #1A1A2E 0%, #2A1B28 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  borderRadius: 2.5,
                  px: 3,
                  textTransform: 'none'
                }}
              >
                Copier les Détails Complets
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2.5, fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
