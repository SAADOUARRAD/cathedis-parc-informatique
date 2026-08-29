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
  LinearProgress,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Security as SecurityIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  Add as AddIcon,
  FileDownload as ExportIcon,
  ViewList as TableViewIcon,
  ViewModule as GridViewIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Computer as ComputerIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Verified as VerifiedIcon,
  Layers as LayersIcon,
  Refresh as RefreshIcon,
  LocalShipping as SupplierIcon,
  ReceiptLong as ReceiptIcon
} from '@mui/icons-material';

export default function WarrantiesPage() {
  const [warranties, setWarranties] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // View Mode: 'CARDS' or 'TABLE'
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED'>('ALL');

  // Pagination for table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialogs
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Form State
  const [equipmentId, setEquipmentId] = useState('');
  const [provider, setProvider] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [conditions, setConditions] = useState('');
  const [saving, setSaving] = useState(false);

  // Snackbar State
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wRes, eqRes] = await Promise.all([
        fetch('/api/warranties'),
        fetch('/api/equipments')
      ]);

      if (wRes.ok) {
        const wData = await wRes.json();
        setWarranties(wData || []);
      }
      if (eqRes.ok) {
        const eqData = await eqRes.json();
        setEquipments(eqData || []);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Erreur lors du chargement des garanties', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDaysRemaining = (endDateStr: string) => {
    if (!endDateStr) return 0;
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  const getWarrantyStatus = (w: any) => {
    if (!w.endDate) return { label: 'Inconnue', color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0', status: 'UNKNOWN' };
    const days = getDaysRemaining(w.endDate);
    if (days < 0) return { label: 'Expirée (Hors Couverture)', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', status: 'EXPIRED' };
    if (days < 30) return { label: `Expire dans ${days}j (Action Requise)`, color: '#EA580C', bg: '#FFEDD5', border: '#FED7AA', status: 'EXPIRING' };
    if (days <= 90) return { label: `Valide (${days} jours restants)`, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', status: 'ACTIVE' };
    return { label: `Active & Conforme (${days}j)`, color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', status: 'ACTIVE' };
  };

  const handleOpenCreate = () => {
    setSelectedWarranty(null);
    setEquipmentId('');
    setProvider('');
    setStartDate(new Date().toISOString().split('T')[0]);
    
    // Default 3 years warranty
    const future = new Date();
    future.setFullYear(future.getFullYear() + 3);
    setEndDate(future.toISOString().split('T')[0]);
    setConditions('Garantie constructeur standard sur site (J+1). Pièces, main d\'œuvre et déplacement inclus.');
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (w: any) => {
    setSelectedWarranty(w);
    setEquipmentId(w.equipmentId || w.equipment?.id || '');
    setProvider(w.provider || '');
    setStartDate(w.startDate ? new Date(w.startDate).toISOString().split('T')[0] : '');
    setEndDate(w.endDate ? new Date(w.endDate).toISOString().split('T')[0] : '');
    setConditions(w.conditions || '');
    setFormDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentId || !provider || !startDate || !endDate) {
      setSnackbar({ open: true, message: 'Veuillez remplir tous les champs obligatoires.', severity: 'error' });
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setSnackbar({ open: true, message: 'La date de fin doit être postérieure à la date de début.', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      const payload = { equipmentId, provider, startDate, endDate, conditions };
      const url = selectedWarranty ? `/api/warranties/${selectedWarranty.id}` : '/api/warranties';
      const method = selectedWarranty ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSnackbar({ open: true, message: selectedWarranty ? 'Garantie mise à jour avec succès !' : 'Nouvelle garantie enregistrée avec succès !', severity: 'success' });
        setFormDialogOpen(false);
        fetchData();
      } else {
        throw new Error('Erreur lors de l\'enregistrement');
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Erreur lors de l\'enregistrement', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const openDetails = (w: any) => {
    setSelectedWarranty(w);
    setDetailsOpen(true);
  };

  const handleExportCSV = () => {
    if (warranties.length === 0) return;
    const headers = ['Équipement', 'N° Série', 'Fournisseur Garantie', 'Date Début', 'Date Fin', 'Jours Restants', 'Statut Couverture', 'Conditions'];
    const rows = warranties.map(w => {
      const days = getDaysRemaining(w.endDate);
      const st = getWarrantyStatus(w);
      return [
        `"${(w.equipment?.name || '').replace(/"/g, '""')}"`,
        `"${(w.equipment?.serialNumber || '').replace(/"/g, '""')}"`,
        `"${(w.provider || '').replace(/"/g, '""')}"`,
        w.startDate ? new Date(w.startDate).toLocaleDateString('fr-FR') : '-',
        w.endDate ? new Date(w.endDate).toLocaleDateString('fr-FR') : '-',
        days < 0 ? 'Expirée' : `${days} jours`,
        `"${st.label}"`,
        `"${(w.conditions || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `garanties_materielles_cathedis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({ open: true, message: 'Exportation du registre des garanties réussie !', severity: 'success' });
  };

  const filteredWarranties = warranties.filter((w) => {
    const eqName = w.equipment?.name || '';
    const sn = w.equipment?.serialNumber || '';
    const prov = w.provider || '';
    const cond = w.conditions || '';
    const s = search.toLowerCase();

    const matchesSearch = !s ||
      eqName.toLowerCase().includes(s) ||
      sn.toLowerCase().includes(s) ||
      prov.toLowerCase().includes(s) ||
      cond.toLowerCase().includes(s);

    const days = getDaysRemaining(w.endDate);
    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') matchesStatus = days >= 30;
    else if (statusFilter === 'EXPIRING') matchesStatus = days >= 0 && days < 30;
    else if (statusFilter === 'EXPIRED') matchesStatus = days < 0;

    return matchesSearch && matchesStatus;
  });

  const nowTime = new Date().getTime();
  const totalCount = warranties.length;
  const activeCount = warranties.filter(w => getDaysRemaining(w.endDate) >= 30).length;
  const expiringSoonCount = warranties.filter(w => {
    const d = getDaysRemaining(w.endDate);
    return d >= 0 && d < 30;
  }).length;
  const expiredCount = warranties.filter(w => getDaysRemaining(w.endDate) < 0).length;

  const paginatedData = filteredWarranties.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const formatDate = (d?: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
      
      {/* 🌟 1. HERO BANNER GARANTIES & SAV 🌟 */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          background: 'linear-gradient(135deg, #0D0F1D 0%, #1A1A2E 45%, #7B0000 100%)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(26, 26, 46, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.35) 0%, rgba(227,30,36,0) 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: 240, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.2) 0%, rgba(5,150,105,0) 70%)', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar sx={{ width: 62, height: 62, bgcolor: 'rgba(227, 30, 36, 0.25)', border: '2px solid rgba(227, 30, 36, 0.6)', color: '#FFFFFF', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
              <SecurityIcon sx={{ fontSize: 34, color: '#FF8A80' }} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                  Couvertures de Garantie & SAV
                </Typography>
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: 16, color: '#FFCDD2 !important' }} />}
                  label="Contrats Constructeurs Cathedis"
                  size="small"
                  sx={{ bgcolor: 'rgba(227, 30, 36, 0.35)', color: '#FFCDD2', border: '1px solid rgba(255, 205, 210, 0.5)', fontWeight: 800 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.6, maxWidth: 680 }}>
                Supervision des contrats de garantie matérielle, anticipation des expirations sous 30 jours, suivi des prestataires et SLA constructeurs.
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
                color: '#FFFFFF',
                borderColor: 'rgba(255,255,255,0.4)',
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                px: 2.2,
                backdropFilter: 'blur(10px)',
                bgcolor: 'rgba(255,255,255,0.08)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.18)', borderColor: '#FFFFFF' }
              }}
            >
              Exporter CSV
            </Button>
            
            <Button
              variant="contained"
              onClick={handleOpenCreate}
              startIcon={<AddIcon />}
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
              + Nouvelle Garantie
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 📊 2. FOUR GLASSMORPHIС KPI CARDS 📊 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {[
          { label: 'Total Garanties', count: totalCount, sub: 'Contrats répertoriés', color: '#1A1A2E', icon: <SecurityIcon />, filter: 'ALL' as const },
          { label: 'Couvertures Actives', count: activeCount, sub: 'Garanties valides (> 30j)', color: '#059669', icon: <SuccessIcon />, filter: 'ACTIVE' as const },
          { label: 'Expirent sous 30 jours', count: expiringSoonCount, sub: 'Action de renouvellement requise', color: '#EA580C', icon: <WarningIcon />, filter: 'EXPIRING' as const },
          { label: 'Garanties Expirées', count: expiredCount, sub: 'Hors couverture SAV', color: '#DC2626', icon: <ErrorIcon />, filter: 'EXPIRED' as const },
        ].map((stat, i) => (
          <Paper
            key={i}
            elevation={0}
            onClick={() => setStatusFilter(stat.filter)}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              border: statusFilter === stat.filter ? `2px solid ${stat.color}` : '1px solid #E2E8F0',
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
                {loading ? <Skeleton width={50} /> : stat.count}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, mt: 0.3, display: 'block' }}>
                {stat.label}
              </Typography>
              <Typography variant="caption" sx={{ color: stat.color, fontWeight: 700, fontSize: '0.72rem' }}>
                {stat.sub}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* 🔍 3. SEARCH, FILTERS & VIEW CONTROLLER 🔍 */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', p: 2.5, bgcolor: '#FFFFFF' }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <Box sx={{ display: 'flex', gap: 1.5, flex: '1 1 450px', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Rechercher équipement, N° série, fournisseur, conditions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> } }}
              sx={{ flex: '1 1 260px' }}
            />

            <FormControl size="small" sx={{ minWidth: 190 }}>
              <InputLabel>Filtrer par statut</InputLabel>
              <Select
                value={statusFilter}
                label="Filtrer par statut"
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <MenuItem value="ALL">Toutes les garanties ({totalCount})</MenuItem>
                <MenuItem value="ACTIVE">Actives & Conformes ({activeCount})</MenuItem>
                <MenuItem value="EXPIRING">⚡ Expirent bientôt ({expiringSoonCount})</MenuItem>
                <MenuItem value="EXPIRED">🔴 Expirées ({expiredCount})</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>
              {filteredWarranties.length} contrat(s)
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
                Cartes SAV
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

        {/* 🔲 VIEW 1: MODERN WARRANTY CARDS 🔲 */}
        {viewMode === 'CARDS' ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 2.5 }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Paper key={i} elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0' }}>
                  <Skeleton width="60%" height={30} />
                  <Skeleton width="100%" height={60} sx={{ my: 1.5 }} />
                  <Skeleton width="80%" height={25} />
                </Paper>
              ))
            ) : filteredWarranties.length === 0 ? (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 6 }}>
                <SecurityIcon sx={{ fontSize: 50, color: '#CBD5E1', mb: 1 }} />
                <Typography sx={{ fontWeight: 800, color: '#64748B' }}>
                  Aucun contrat de garantie ne correspond aux critères sélectionnés.
                </Typography>
              </Box>
            ) : (
              filteredWarranties.map((w) => {
                const st = getWarrantyStatus(w);
                const days = getDaysRemaining(w.endDate);
                
                // Progression bar
                const start = w.startDate ? new Date(w.startDate).getTime() : 0;
                const end = w.endDate ? new Date(w.endDate).getTime() : 0;
                const total = end - start;
                const elapsed = nowTime - start;
                const progressPct = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 100;

                return (
                  <Card
                    key={w.id}
                    elevation={0}
                    sx={{
                      borderRadius: 3.5,
                      border: '1px solid #E2E8F0',
                      borderTop: `5px solid ${st.color}`,
                      bgcolor: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                        borderColor: st.color
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      {/* Equipment Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 44, height: 44, bgcolor: `${st.color}15`, color: st.color, border: `1px solid ${st.border}` }}>
                            <ComputerIcon />
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.05rem', lineHeight: 1.2 }}>
                              {w.equipment?.name || 'Équipement'}
                            </Typography>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748B', display: 'block' }}>
                              SN: {w.equipment?.serialNumber || '-'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Status Chip */}
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={st.label}
                          size="small"
                          sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                        />
                      </Box>

                      {/* Provider & Dates */}
                      <Box sx={{ bgcolor: '#F8FAFC', p: 1.8, borderRadius: 2.5, border: '1px solid #F1F5F9', mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>Fournisseur :</Typography>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E293B' }}>{w.provider || '-'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>Échéance :</Typography>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: st.color }}>{formatDate(w.endDate)}</Typography>
                        </Box>
                      </Box>

                      {/* Warranty Progress Jauge */}
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Temps consommé</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: st.color }}>{Math.round(progressPct)}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progressPct}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#E2E8F0',
                            '& .MuiLinearProgress-bar': { bgcolor: st.color, borderRadius: 3 }
                          }}
                        />
                      </Box>
                    </CardContent>

                    {/* Actions Footer */}
                    <CardActions sx={{ p: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        onClick={() => openDetails(w)}
                        startIcon={<ViewIcon />}
                        sx={{ textTransform: 'none', fontWeight: 800, color: '#1A1A2E', fontSize: '0.78rem' }}
                      >
                        Fiche 360°
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenEdit(w)}
                        startIcon={<EditIcon />}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          textTransform: 'none',
                          color: '#E31E24',
                          borderColor: 'rgba(227,30,36,0.3)',
                          '&:hover': { bgcolor: '#FFF5F5', borderColor: '#E31E24' }
                        }}
                      >
                        Modifier
                      </Button>
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
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Équipement</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Fournisseur SAV</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Date Début</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Date Fin</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>État Couverture</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Progression</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#1E293B' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton width={160} /></TableCell>
                        <TableCell><Skeleton width={130} /></TableCell>
                        <TableCell><Skeleton width={90} /></TableCell>
                        <TableCell><Skeleton width={90} /></TableCell>
                        <TableCell><Skeleton width={120} /></TableCell>
                        <TableCell><Skeleton width={100} /></TableCell>
                        <TableCell align="center"><Skeleton width={80} /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center' }}>
                        <SecurityIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                        <Typography sx={{ fontWeight: 700, color: '#64748B' }}>
                          Aucun contrat de garantie trouvé.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row) => {
                      const st = getWarrantyStatus(row);
                      const start = row.startDate ? new Date(row.startDate).getTime() : 0;
                      const end = row.endDate ? new Date(row.endDate).getTime() : 0;
                      const total = end - start;
                      const elapsed = nowTime - start;
                      const progressPct = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 100;

                      return (
                        <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 34, height: 34, bgcolor: `${st.color}15`, color: st.color }}>
                                <ComputerIcon sx={{ fontSize: 18 }} />
                              </Avatar>
                              <Box>
                                <Typography
                                  onClick={() => openDetails(row)}
                                  sx={{ fontWeight: 800, color: '#1A1A2E', cursor: 'pointer', '&:hover': { color: '#E31E24', textDecoration: 'underline' } }}
                                >
                                  {row.equipment?.name || 'Équipement'}
                                </Typography>
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748B', display: 'block' }}>
                                  SN: {row.equipment?.serialNumber || '-'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ fontWeight: 700, color: '#334155' }}>
                            {row.provider || '-'}
                          </TableCell>

                          <TableCell sx={{ fontSize: '0.85rem', color: '#64748B' }}>
                            {formatDate(row.startDate)}
                          </TableCell>

                          <TableCell sx={{ fontSize: '0.85rem', fontWeight: 700, color: st.color }}>
                            {formatDate(row.endDate)}
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={st.label}
                              size="small"
                              sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                            />
                          </TableCell>

                          <TableCell sx={{ width: 140 }}>
                            <LinearProgress
                              variant="determinate"
                              value={progressPct}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: '#E2E8F0',
                                '& .MuiLinearProgress-bar': { bgcolor: st.color, borderRadius: 3 }
                              }}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.8, justifyContent: 'center' }}>
                              <Tooltip title="Fiche 360°">
                                <IconButton size="small" onClick={() => openDetails(row)} sx={{ color: '#1A1A2E', bgcolor: '#F1F5F9' }}>
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Modifier">
                                <IconButton size="small" onClick={() => handleOpenEdit(row)} sx={{ color: '#E31E24', bgcolor: '#FFF5F5' }}>
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
              count={filteredWarranties.length}
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

      {/* 🛠️ 4. MODALE DE CRÉATION & MODIFICATION DE GARANTIE 🛠️ */}
      <Dialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #0D0F1D 0%, #1A1A2E 45%, #7B0000 100%)',
          color: '#FFFFFF',
          p: 2.5,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#E31E24', color: '#FFFFFF' }}>
              <SecurityIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                {selectedWarranty ? 'Modifier la Garantie' : 'Nouvelle Couverture de Garantie'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Contrat constructeur & support après-vente
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setFormDialogOpen(false)} sx={{ color: '#FFFFFF' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSave}>
          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, bgcolor: '#FAFAFA' }}>
            
            <TextField
              select
              label="Équipement Concerné *"
              fullWidth
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              sx={{ bgcolor: '#FFFFFF' }}
            >
              {equipments.map((eq) => (
                <MenuItem key={eq.id} value={eq.id}>
                  {eq.name} (SN: {eq.serialNumber || '-'})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Fournisseur / Prestataire de Garantie *"
              placeholder="ex: HP Care Pack, Dell ProSupport, Lenovo Premier Support..."
              fullWidth
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              sx={{ bgcolor: '#FFFFFF' }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Date de Début *"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                sx={{ bgcolor: '#FFFFFF' }}
              />

              <TextField
                label="Date de Fin (Échéance) *"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                sx={{ bgcolor: '#FFFFFF' }}
              />
            </Box>

            <TextField
              label="Conditions & Clauses Particulières de Couverture"
              placeholder="ex: Intervention sous 24h ouvrées, remplacement de pièces d'origine, support téléphonique 24/7..."
              fullWidth
              multiline
              rows={3}
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              sx={{ bgcolor: '#FFFFFF' }}
            />

          </DialogContent>

          <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
            <Button onClick={() => setFormDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B' }}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
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
              {saving ? 'Enregistrement...' : selectedWarranty ? 'Mettre à jour la Garantie' : 'Créer le Contrat de Garantie'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 🔍 5. FICHE 360° D'INSPECTION DE LA GARANTIE 🔍 */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        {selectedWarranty && (
          <>
            <DialogTitle sx={{
              background: 'linear-gradient(135deg, #0D0F1D 0%, #1A1A2E 45%, #7B0000 100%)',
              color: '#FFFFFF',
              p: 2.5,
              px: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                <Avatar sx={{ bgcolor: '#E31E24', color: '#FFFFFF', width: 48, height: 48 }}>
                  <ReceiptIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                    Fiche Contrat de Garantie #{selectedWarranty.id.slice(0, 8)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Couverture SAV & Conditions Contractuelles
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setDetailsOpen(false)} sx={{ color: '#FFFFFF' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3, bgcolor: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              
              {/* Equipment & Provider */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Équipement Couvert</Typography>
                  <Typography sx={{ fontWeight: 900, color: '#1A1A2E', mt: 0.5, fontSize: '1.05rem' }}>
                    {selectedWarranty.equipment?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748B', display: 'block' }}>
                    SN: {selectedWarranty.equipment?.serialNumber || '-'}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Fournisseur de Garantie</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#1A1A2E', mt: 0.5, fontSize: '1.05rem' }}>
                    {selectedWarranty.provider || '-'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, display: 'block' }}>
                    Support Agréé Constructeur
                  </Typography>
                </Paper>
              </Box>

              {/* Dates & Status */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Période Contractuelle</Typography>
                  <Typography sx={{ fontWeight: 700, color: '#1E293B', mt: 0.5 }}>
                    Du {formatDate(selectedWarranty.startDate)} au {formatDate(selectedWarranty.endDate)}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>État Actuel de Couverture</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={getWarrantyStatus(selectedWarranty).label}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        bgcolor: getWarrantyStatus(selectedWarranty).bg,
                        color: getWarrantyStatus(selectedWarranty).color,
                        border: `1px solid ${getWarrantyStatus(selectedWarranty).border}`
                      }}
                    />
                  </Box>
                </Paper>
              </Box>

              {/* Conditions */}
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Conditions de Prise en Charge</Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#334155', mt: 0.8, lineHeight: 1.5 }}>
                  {selectedWarranty.conditions || 'Aucune condition spécifique renseignée.'}
                </Typography>
              </Paper>

            </DialogContent>

            <DialogActions sx={{ p: 2, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
              <Button onClick={() => setDetailsOpen(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700, color: '#64748B' }}>
                Fermer
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setDetailsOpen(false);
                  handleOpenEdit(selectedWarranty);
                }}
                startIcon={<EditIcon />}
                sx={{
                  background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                  color: '#FFFFFF',
                  borderRadius: 2,
                  fontWeight: 800,
                  textTransform: 'none'
                }}
              >
                Modifier le Contrat
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
