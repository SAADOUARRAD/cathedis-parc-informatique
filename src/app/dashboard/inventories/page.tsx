'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  LinearProgress,
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
  Card,
  CardContent
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  CheckCircle as SuccessIcon,
  Schedule as PendingIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  AssignmentTurnedIn as ReportIcon,
  Timer as TimerIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  LaptopMac as LaptopIcon,
  DesktopWindows as DesktopIcon,
  Headphones as HeadphoneIcon,
  Tv as ScreenIcon,
  Devices as DevicesIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  FileDownload as ExportIcon,
  Verified as VerifiedIcon,
  AutoAwesome as SparklesIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateInventoryPDF } from '@/lib/pdf/generateInventoryPDF';
import { useSession } from 'next-auth/react';
import StatusChip from '@/components/shared/StatusChip';
import FormDialog from '@/components/shared/FormDialog';

const createInventorySchema = z.object({
  name: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
  description: z.string().optional(),
});
type CreateInventoryInput = z.infer<typeof createInventorySchema>;

const INVENTORY_STATUS_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  PLANNED: { label: 'Planifiée', color: '#1E88E5', bgColor: '#EFF6FF' },
  IN_PROGRESS: { label: 'En cours (Live ⏱️)', color: '#D97706', bgColor: '#FFFBEB' },
  COMPLETED: { label: 'Clôturée & Certifiée', color: '#059669', bgColor: '#ECFDF5' },
  CANCELLED: { label: 'Annulée', color: '#64748B', bgColor: '#F1F5F9' },
};

export default function InventoriesDashboard() {
  const { data: session } = useSession();
  
  // State
  const [inventories, setInventories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false, message: '', severity: 'info'
  });

  // Search & Filter in main page
  const [mainSearch, setMainSearch] = useState('');
  const [mainStatusFilter, setMainStatusFilter] = useState('ALL');

  // Pagination for main table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const [inventoryDetails, setInventoryDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Live session filters
  const [itemSearch, setItemSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Live Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateInventoryInput>({
    resolver: zodResolver(createInventorySchema)
  });

  const fetchInventories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inventories');
      if (res.ok) {
        const data = await res.json();
        setInventories(data || []);
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: "Erreur de chargement des inventaires", severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  const fetchInventoryDetails = async (id: string) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/inventories/${id}`);
      if (res.ok) {
        const data = await res.json();
        setInventoryDetails(data);
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: "Erreur lors du chargement des détails", severity: 'error' });
    } finally {
      setLoadingDetails(false);
    }
  };

  // Live Timer Effect
  useEffect(() => {
    if (inventoryDetails && inventoryDetails.status === 'IN_PROGRESS' && inventoryDetails.startDate) {
      const startMs = new Date(inventoryDetails.startDate).getTime();
      const updateTimer = () => {
        const diffSec = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        setElapsedSeconds(diffSec);
      };
      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    } else if (inventoryDetails && inventoryDetails.status === 'COMPLETED' && inventoryDetails.startDate && inventoryDetails.endDate) {
      const startMs = new Date(inventoryDetails.startDate).getTime();
      const endMs = new Date(inventoryDetails.endDate).getTime();
      setElapsedSeconds(Math.max(0, Math.floor((endMs - startMs) / 1000)));
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [inventoryDetails?.status, inventoryDetails?.startDate, inventoryDetails?.endDate]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartNewSession = async (data: CreateInventoryInput) => {
    try {
      const res = await fetch('/api/inventories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur de création");
      const created = await res.json();

      await fetch(`/api/inventories/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });

      setSnackbar({ open: true, message: "Session d'inventaire initialisée avec succès ! 🚀", severity: 'success' });
      setCreateDialogOpen(false);
      reset();
      openSessionDialog(created.id);
      fetchInventories();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur de démarrage", severity: 'error' });
    }
  };

  const openSessionDialog = (id: string) => {
    setSelectedInventoryId(id);
    setSessionDialogOpen(true);
    fetchInventoryDetails(id);
  };

  const handleUpdateItemStatus = async (itemId: string, newStatus: string, notes?: string) => {
    if (!selectedInventoryId) return;

    // Optimistic Update
    setInventoryDetails((prev: any) => {
      if (!prev) return prev;
      const updatedItems = prev.items.map((item: any) => {
        if (item.id === itemId) {
          return { ...item, status: newStatus, notes: notes !== undefined ? notes : item.notes };
        }
        return item;
      });

      const totalItems = updatedItems.length;
      const found = updatedItems.filter((i: any) => i.status === 'FOUND').length;
      const notFound = updatedItems.filter((i: any) => i.status === 'NOT_FOUND').length;
      const damaged = updatedItems.filter((i: any) => i.status === 'DAMAGED').length;
      const surplus = updatedItems.filter((i: any) => i.status === 'SURPLUS').length;

      return {
        ...prev,
        items: updatedItems,
        stats: { totalItems, found, notFound, damaged, surplus }
      };
    });

    try {
      await fetch(`/api/inventories/${selectedInventoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-item',
          itemId,
          itemStatus: newStatus,
          notes,
        }),
      });
    } catch (err) {
      setSnackbar({ open: true, message: "Erreur de sauvegarde de l'équipement", severity: 'error' });
      fetchInventoryDetails(selectedInventoryId);
    }
  };

  const handleCompleteSession = async () => {
    if (!selectedInventoryId) return;
    try {
      const res = await fetch(`/api/inventories/${selectedInventoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      });
      if (!res.ok) throw new Error("Erreur de clôture");

      setSnackbar({ open: true, message: "Session d'inventaire clôturée avec succès !", severity: 'success' });
      await fetchInventoryDetails(selectedInventoryId);
      setSessionDialogOpen(false);
      setSummaryDialogOpen(true);
      fetchInventories();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur de clôture", severity: 'error' });
    }
  };

  const handleDownloadPDFReport = async () => {
    if (!inventoryDetails) return;

    const formattedStartDate = inventoryDetails.startDate
      ? `${new Date(inventoryDetails.startDate).toLocaleDateString('fr-FR')} ${new Date(inventoryDetails.startDate).toLocaleTimeString('fr-FR')}`
      : '-';

    const formattedEndDate = inventoryDetails.endDate
      ? `${new Date(inventoryDetails.endDate).toLocaleDateString('fr-FR')} ${new Date(inventoryDetails.endDate).toLocaleTimeString('fr-FR')}`
      : new Date().toLocaleTimeString('fr-FR');

    const pdf = await generateInventoryPDF({
      inventoryId: inventoryDetails.id,
      sessionName: inventoryDetails.name,
      description: inventoryDetails.description,
      adminName: session?.user?.name || "Administrateur Cathedis IT",
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      durationFormatted: formatTimer(elapsedSeconds),
      stats: inventoryDetails.stats || { totalItems: 0, found: 0, notFound: 0, damaged: 0, surplus: 0 },
      items: (inventoryDetails.items || []).map((item: any) => ({
        equipmentName: item.equipment?.name || 'Inconnu',
        serialNumber: item.equipment?.serialNumber || item.equipment?.inventoryNumber || '-',
        category: item.equipment?.category?.name || 'Matériel',
        status: item.status,
        notes: item.notes || undefined,
      })),
    });

    pdf.save(`Rapport_Audit_Inventaire_${inventoryDetails.name.replace(/\s+/g, '_')}.pdf`);
  };

  const filteredInventories = inventories.filter(inv => {
    const s = mainSearch.toLowerCase();
    const matchSearch = !s || inv.name.toLowerCase().includes(s) || (inv.description && inv.description.toLowerCase().includes(s));
    const matchStatus = mainStatusFilter === 'ALL' || inv.status === mainStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredSessionItems = (inventoryDetails?.items || []).filter((item: any) => {
    const matchesSearch = itemSearch === '' || 
      item.equipment?.name?.toLowerCase().includes(itemSearch.toLowerCase()) ||
      item.equipment?.serialNumber?.toLowerCase().includes(itemSearch.toLowerCase()) ||
      item.equipment?.inventoryNumber?.toLowerCase().includes(itemSearch.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: inventories.length,
    planned: inventories.filter(i => i.status === 'PLANNED').length,
    inProgress: inventories.filter(i => i.status === 'IN_PROGRESS').length,
    completed: inventories.filter(i => i.status === 'COMPLETED').length,
  };

  const paginatedInventories = filteredInventories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
              <InventoryIcon sx={{ fontSize: 34, color: '#FFFFFF' }} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                  Campagnes & Audit d'Inventaire
                </Typography>
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: 16, color: '#A7F3D0 !important' }} />}
                  label="Contrôle Physique en Temps Réel"
                  size="small"
                  sx={{ bgcolor: 'rgba(5, 150, 105, 0.25)', color: '#A7F3D0', border: '1px solid rgba(167, 243, 208, 0.4)', fontWeight: 800 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.6, maxWidth: 680 }}>
                Pointage physique des équipements, chronomètre en temps réel, constat d'anomalies et rapports d'audit PDF certifiés.
              </Typography>
            </Box>
          </Box>

          {/* Action Hub */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => setCreateDialogOpen(true)}
              startIcon={<StartIcon />}
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
              + Lancer une Session d'Inventaire
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 📊 2. FOUR GLASSMORPHIС KPI CARDS 📊 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {[
          { label: "Total Sessions", number: stats.total, sub: "Toutes campagnes", icon: <InventoryIcon />, color: '#1A1A2E' },
          { label: "Sessions en Cours Live ⏱️", number: stats.inProgress, sub: "Pointage actif", icon: <PendingIcon />, color: '#D97706' },
          { label: "Sessions Clôturées", number: stats.completed, sub: "Certifiées avec rapport PDF", icon: <SuccessIcon />, color: '#059669' },
          { label: "Sessions Planifiées", number: stats.planned, sub: "Prochains contrôles", icon: <TimerIcon />, color: '#2563EB' },
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

      {/* 🔍 3. MAIN TABLE PAPERS & CONTROLLERS 🔍 */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', p: 2.5, bgcolor: '#FFFFFF' }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <Box sx={{ display: 'flex', gap: 2, flex: '1 1 400px', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Rechercher une session d'inventaire..."
              value={mainSearch}
              onChange={(e) => setMainSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> } }}
              sx={{ flex: '1 1 260px' }}
            />

            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>Statut Campagne</InputLabel>
              <Select value={mainStatusFilter} label="Statut Campagne" onChange={(e) => setMainStatusFilter(e.target.value)}>
                <MenuItem value="ALL">Tous les statuts</MenuItem>
                <MenuItem value="IN_PROGRESS">🟠 En cours (Live)</MenuItem>
                <MenuItem value="COMPLETED">🟢 Clôturée</MenuItem>
                <MenuItem value="PLANNED">🔵 Planifiée</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>
            {filteredInventories.length} session(s) d'inventaire
          </Typography>
        </Box>

        <TableContainer>
          <Table size="medium">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Nom de la Session & Périmètre</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Statut Campagne</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Équipements Inclus</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Superviseur DSI</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Date de Démarrage</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#1E293B' }}>Actions d'Audit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton width={200} /></TableCell>
                    <TableCell><Skeleton width={130} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell><Skeleton width={140} /></TableCell>
                    <TableCell><Skeleton width={110} /></TableCell>
                    <TableCell align="center"><Skeleton width={160} /></TableCell>
                  </TableRow>
                ))
              ) : paginatedInventories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                    <InventoryIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                    <Typography sx={{ fontWeight: 700, color: '#64748B' }}>
                      Aucune session d'inventaire trouvée.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInventories.map((row) => (
                  <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                    
                    {/* Session Name */}
                    <TableCell>
                      <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '0.95rem' }}>
                        {row.name}
                      </Typography>
                      {row.description && (
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                          {row.description}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusChip status={row.status} statusMap={INVENTORY_STATUS_MAP} />
                    </TableCell>

                    {/* Equipment Count */}
                    <TableCell>
                      <Chip
                        label={`${row._count?.items || 0} appareils`}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.74rem', bgcolor: '#F1F5F9', color: '#1E293B' }}
                      />
                    </TableCell>

                    {/* Supervisor */}
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>
                        {row.createdBy?.firstName} {row.createdBy?.lastName}
                      </Typography>
                    </TableCell>

                    {/* Start Date */}
                    <TableCell sx={{ fontSize: '0.85rem', color: '#64748B' }}>
                      {row.startDate ? new Date(row.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {row.status === 'IN_PROGRESS' && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<StartIcon />}
                            onClick={() => openSessionDialog(row.id)}
                            sx={{
                              background: 'linear-gradient(90deg, #D97706 0%, #B45309 100%)',
                              color: '#FFFFFF',
                              fontWeight: 800,
                              textTransform: 'none',
                              borderRadius: 2,
                              px: 1.8
                            }}
                          >
                            Pointage Live ⏱️
                          </Button>
                        )}
                        {row.status === 'PLANNED' && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<StartIcon />}
                            onClick={async () => {
                              await fetch(`/api/inventories/${row.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'start' }),
                              });
                              openSessionDialog(row.id);
                              fetchInventories();
                            }}
                            sx={{
                              background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                              color: '#FFFFFF',
                              fontWeight: 800,
                              textTransform: 'none',
                              borderRadius: 2,
                              px: 1.8
                            }}
                          >
                            Démarrer
                          </Button>
                        )}
                        {row.status === 'COMPLETED' && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ReportIcon sx={{ color: '#059669' }} />}
                            onClick={() => {
                              setSelectedInventoryId(row.id);
                              fetchInventoryDetails(row.id);
                              setSummaryDialogOpen(true);
                            }}
                            sx={{
                              color: '#1A1A2E',
                              borderColor: '#CBD5E1',
                              fontWeight: 800,
                              textTransform: 'none',
                              borderRadius: 2,
                              px: 1.8,
                              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#059669' }
                            }}
                          >
                            Rapport & Bilan
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
          count={filteredInventories.length}
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

      {/* 🚀 4. MODALE LIVE : SESSION DE POINTAGE EN TEMPS RÉEL 🚀 */}
      <Dialog
        open={sessionDialogOpen}
        onClose={() => {}}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 4, overflow: 'hidden', minHeight: '85vh', display: 'flex', flexDirection: 'column' } }
        }}
      >
        {loadingDetails || !inventoryDetails ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress sx={{ color: '#E31E24' }} /></Box>
        ) : (
          <>
            {/* Header with Live HUD & Timer */}
            <DialogTitle sx={{
              background: 'linear-gradient(135deg, #1A1A2E 0%, #2A1B28 50%, #7B0000 100%)',
              color: '#FFFFFF',
              p: 2.5,
              px: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              flexShrink: 0
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#E31E24', color: '#FFFFFF' }}>
                  <InventoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2 }}>
                    {inventoryDetails.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    Supervisé par : {session?.user?.name || "Administrateur Cathedis"}
                  </Typography>
                </Box>
              </Box>

              {/* HUD Live Timer */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', px: 2.5, py: 0.8, borderRadius: 2.5 }}>
                  <TimerIcon sx={{ color: '#FFD54F' }} />
                  <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.25rem', color: '#FFD54F' }}>
                    {formatTimer(elapsedSeconds)}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<StopIcon />}
                  onClick={handleCompleteSession}
                  sx={{
                    background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                    borderRadius: 2.5,
                    fontWeight: 800,
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)'
                  }}
                >
                  Clôturer l'Inventaire
                </Button>

                <IconButton onClick={() => setSessionDialogOpen(false)} sx={{ color: '#FFFFFF' }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3, bgcolor: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1, overflowY: 'auto' }}>
              
              {/* Progress Summary Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>Total Équipements</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#1A1A2E' }}>{inventoryDetails.stats?.totalItems || 0}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #A7F3D0', bgcolor: '#ECFDF5', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#047857' }}>✅ Présents</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#047857' }}>{inventoryDetails.stats?.found || 0}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #FDE68A', bgcolor: '#FFFBEB', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#B45309' }}>❌ Absents</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#B45309' }}>{inventoryDetails.stats?.notFound || 0}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #FECACA', bgcolor: '#FEF2F2', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#DC2626' }}>⚠️ État Critique</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#DC2626' }}>{inventoryDetails.stats?.damaged || 0}</Typography>
                </Paper>
              </Box>

              {/* Progress Bar */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>
                    Progression du pointage : {inventoryDetails.stats?.totalItems > 0 ? Math.round(((inventoryDetails.stats.found + inventoryDetails.stats.damaged) / inventoryDetails.stats.totalItems) * 100) : 0}%
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#1A1A2E' }}>
                    {inventoryDetails.stats?.found + inventoryDetails.stats?.damaged} / {inventoryDetails.stats?.totalItems} contrôlés
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={inventoryDetails.stats?.totalItems > 0 ? Math.round(((inventoryDetails.stats.found + inventoryDetails.stats.damaged) / inventoryDetails.stats.totalItems) * 100) : 0}
                  sx={{ height: 10, borderRadius: 5, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#059669' } }}
                />
              </Box>

              {/* Search & Filter Bar */}
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Rechercher par nom, S/N, N° d'inventaire..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> } }}
                  sx={{ flex: '1 1 260px' }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[
                    { id: 'ALL', label: 'Tous' },
                    { id: 'FOUND', label: '✅ Présents' },
                    { id: 'NOT_FOUND', label: '❌ Absents' },
                    { id: 'DAMAGED', label: '⚠️ Critiques' },
                  ].map((f) => (
                    <Chip
                      key={f.id}
                      label={f.label}
                      onClick={() => setStatusFilter(f.id)}
                      sx={{
                        fontWeight: 800,
                        cursor: 'pointer',
                        bgcolor: statusFilter === f.id ? '#1A1A2E' : '#FFFFFF',
                        color: statusFilter === f.id ? '#FFFFFF' : '#475569',
                        border: '1px solid #CBD5E1'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Table of items to verify */}
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Équipement</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Catégorie</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Pointage Physique</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Constat / Observation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSessionItems.map((row: any) => (
                      <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '0.9rem' }}>
                            {row.equipment?.name || 'Inconnu'}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#E31E24', fontWeight: 800 }}>
                            {row.equipment?.inventoryNumber || '-'} {row.equipment?.serialNumber ? `• S/N: ${row.equipment.serialNumber}` : ''}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={row.equipment?.category?.name || 'Général'}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#F1F5F9' }}
                          />
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.8 }}>
                            <Button
                              size="small"
                              variant={row.status === 'FOUND' ? 'contained' : 'outlined'}
                              onClick={() => handleUpdateItemStatus(row.id, 'FOUND')}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                px: 1.5,
                                bgcolor: row.status === 'FOUND' ? '#059669' : 'transparent',
                                color: row.status === 'FOUND' ? '#FFFFFF' : '#059669',
                                borderColor: '#059669',
                                '&:hover': { bgcolor: '#059669', color: '#FFFFFF' }
                              }}
                            >
                              ✅ Présent
                            </Button>
                            <Button
                              size="small"
                              variant={row.status === 'NOT_FOUND' ? 'contained' : 'outlined'}
                              onClick={() => handleUpdateItemStatus(row.id, 'NOT_FOUND')}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                px: 1.5,
                                bgcolor: row.status === 'NOT_FOUND' ? '#D97706' : 'transparent',
                                color: row.status === 'NOT_FOUND' ? '#FFFFFF' : '#D97706',
                                borderColor: '#D97706',
                                '&:hover': { bgcolor: '#D97706', color: '#FFFFFF' }
                              }}
                            >
                              ❌ Absent
                            </Button>
                            <Button
                              size="small"
                              variant={row.status === 'DAMAGED' ? 'contained' : 'outlined'}
                              onClick={() => handleUpdateItemStatus(row.id, 'DAMAGED')}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                px: 1.5,
                                bgcolor: row.status === 'DAMAGED' ? '#DC2626' : 'transparent',
                                color: row.status === 'DAMAGED' ? '#FFFFFF' : '#DC2626',
                                borderColor: '#DC2626',
                                '&:hover': { bgcolor: '#DC2626', color: '#FFFFFF' }
                              }}
                            >
                              ⚠️ Critique
                            </Button>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="Remarque ou anomalie..."
                            defaultValue={row.notes || ''}
                            onBlur={(e) => {
                              if (e.target.value !== row.notes) {
                                handleUpdateItemStatus(row.id, row.status, e.target.value);
                              }
                            }}
                            sx={{ width: 260, '& .MuiInputBase-input': { fontSize: '0.82rem' } }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* 📄 5. MODALE BILAN & RAPPORT PDF OFFICIEL 📄 */}
      <Dialog
        open={summaryDialogOpen}
        onClose={() => setSummaryDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1A1A2E 0%, #2A1B28 50%, #7B0000 100%)',
          color: '#FFFFFF',
          p: 3,
          textAlign: 'center'
        }}>
          <SuccessIcon sx={{ fontSize: 56, color: '#A7F3D0', mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFFFFF' }}>
            Session d'Inventaire Clôturée avec Succès !
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            Durée totale du contrôle : <strong>{formatTimer(elapsedSeconds)}</strong>
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 3.5, bgcolor: '#FAFAFA' }}>
          {inventoryDetails && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Summary KPIs */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>Total Contrôlés</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#1A1A2E' }}>{inventoryDetails.stats?.totalItems}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #A7F3D0', bgcolor: '#ECFDF5', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#047857' }}>Présents</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#047857' }}>{inventoryDetails.stats?.found}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #FDE68A', bgcolor: '#FFFBEB', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#B45309' }}>Absents</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#B45309' }}>{inventoryDetails.stats?.notFound}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #FECACA', bgcolor: '#FEF2F2', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#DC2626' }}>Critiques</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#DC2626' }}>{inventoryDetails.stats?.damaged}</Typography>
                </Paper>
              </Box>

              {/* PDF Download Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PdfIcon />}
                  onClick={handleDownloadPDFReport}
                  sx={{
                    background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 900,
                    fontSize: '1.05rem',
                    textTransform: 'none',
                    boxShadow: '0 6px 20px rgba(227, 30, 36, 0.4)',
                    '&:hover': { background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)' }
                  }}
                >
                  Télécharger le Rapport d'Audit PDF Certifié 📄
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'center' }}>
          <Button onClick={() => setSummaryDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2.5, fontWeight: 700, color: '#64748B' }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🚀 6. MODALE CRÉATION D'UNE SESSION D'INVENTAIRE 🚀 */}
      <FormDialog
        open={createDialogOpen}
        title="⚡ Lancer une Session d'Inventaire"
        onClose={() => { setCreateDialogOpen(false); reset(); }}
        onSubmit={handleSubmit(handleStartNewSession)}
        loading={isSubmitting}
        submitLabel="Démarrer le Pointage Live"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <Alert severity="info" sx={{ borderRadius: 2, fontWeight: 600 }}>
            Une session de contrôle physique avec chronomètre en temps réel sera initialisée pour l'ensemble des équipements du parc.
          </Alert>

          <TextField
            label="Nom de la session d'inventaire *"
            placeholder="ex: Inventaire Général Siège - T3 2026"
            fullWidth
            required
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Périmètre / Observations"
            placeholder="ex: Contrôle physique des laptops, écrans et casques audio des services Siège..."
            fullWidth
            multiline
            rows={3}
            {...register('description')}
          />
        </Box>
      </FormDialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2.5, fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
