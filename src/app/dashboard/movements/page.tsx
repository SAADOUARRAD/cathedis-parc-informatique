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
  CardContent
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  ShoppingCart as PurchaseIcon,
  AssignmentInd as AssignIcon,
  Reply as ReturnIcon,
  SwapHoriz as TransferIcon,
  Build as MaintenanceIcon,
  DeleteForever as DecommissionIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Devices as DevicesIcon,
  LaptopMac as LaptopIcon,
  DesktopWindows as DesktopIcon,
  Headphones as HeadphoneIcon,
  Tv as ScreenIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  AccountTree as DiagramIcon,
  ViewList as TableViewIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Download as ExportIcon,
  Storefront as SupplierIcon,
  Verified as VerifiedIcon,
  DoubleArrow as NextStepIcon,
  AutoAwesome as SparklesIcon
} from '@mui/icons-material';
import PageHeader from '@/components/shared/PageHeader';
import StatusChip from '@/components/shared/StatusChip';

export default function MovementsPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'DIAGRAM' (Visual Schemas) or 'TABLE' (Chronological Journal)
  const [viewMode, setViewMode] = useState<'DIAGRAM' | 'TABLE'>('DIAGRAM');

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState('ALL');

  // Modal Detailed Blueprint
  const [blueprintModalOpen, setBlueprintModalOpen] = useState(false);
  const [selectedEquipmentBlueprint, setSelectedEquipmentBlueprint] = useState<any>(null);

  // Pagination for Table view
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'ALL') params.set('type', filterType);
      if (search) params.set('search', search);

      const res = await fetch(`/api/movements?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMovements(data || []);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Erreur lors du chargement des mouvements", severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [filterType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMovements();
  };

  const getMovementMeta = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return {
          label: 'Achat & Réception',
          icon: <PurchaseIcon sx={{ fontSize: 20 }} />,
          color: '#059669',
          bgColor: '#ECFDF5',
          borderColor: '#A7F3D0',
          desc: 'Entrée initiale du matériel dans le parc Cathedis'
        };
      case 'ASSIGNMENT':
        return {
          label: 'Affectation & Dotation',
          icon: <AssignIcon sx={{ fontSize: 20 }} />,
          color: '#2563EB',
          bgColor: '#EFF6FF',
          borderColor: '#BFDBFE',
          desc: 'Remise en main propre au collaborateur avec PV'
        };
      case 'RETURN':
        return {
          label: 'Restitution en Stock',
          icon: <ReturnIcon sx={{ fontSize: 20 }} />,
          color: '#0891B2',
          bgColor: '#ECFEFF',
          borderColor: '#A5F3FC',
          desc: 'Matériel restitué et réintégré au stock disponible'
        };
      case 'TRANSFER':
        return {
          label: 'Transfert de Service',
          icon: <TransferIcon sx={{ fontSize: 20 }} />,
          color: '#D97706',
          bgColor: '#FFFBEB',
          borderColor: '#FDE68A',
          desc: 'Changement de titulaire ou de département'
        };
      case 'MAINTENANCE':
        return {
          label: 'Prise en Charge SAV / Atelier',
          icon: <MaintenanceIcon sx={{ fontSize: 20 }} />,
          color: '#7C3AED',
          bgColor: '#F5F3FF',
          borderColor: '#DDD6FE',
          desc: 'Intervention technique, diagnostic ou réparation'
        };
      case 'DECOMMISSION':
        return {
          label: 'Réforme / Déclassement',
          icon: <DecommissionIcon sx={{ fontSize: 20 }} />,
          color: '#DC2626',
          bgColor: '#FEF2F2',
          borderColor: '#FECACA',
          desc: 'Sortie définitive du parc pour obsolescence'
        };
      default:
        return {
          label: type,
          icon: <TimelineIcon sx={{ fontSize: 20 }} />,
          color: '#64748B',
          bgColor: '#F8FAFC',
          borderColor: '#E2E8F0',
          desc: 'Événement d\'inventaire'
        };
    }
  };

  const getCategoryIcon = (catName?: string) => {
    const c = catName?.toLowerCase() || '';
    if (c.includes('portable') || c.includes('laptop')) return <LaptopIcon sx={{ color: '#E31E24' }} />;
    if (c.includes('fixe') || c.includes('desktop')) return <DesktopIcon sx={{ color: '#2563EB' }} />;
    if (c.includes('casque') || c.includes('audio')) return <HeadphoneIcon sx={{ color: '#7C3AED' }} />;
    if (c.includes('écran') || c.includes('ecran')) return <ScreenIcon sx={{ color: '#059669' }} />;
    return <DevicesIcon sx={{ color: '#64748B' }} />;
  };

  // Group movements by equipment
  const equipmentGroups: Record<string, { equipment: any; movements: any[] }> = {};
  movements.forEach((m) => {
    if (m.equipment) {
      const eqId = m.equipment.id;
      if (!equipmentGroups[eqId]) {
        equipmentGroups[eqId] = {
          equipment: m.equipment,
          movements: []
        };
      }
      equipmentGroups[eqId].movements.push(m);
    }
  });

  const equipmentList = Object.values(equipmentGroups);

  const filteredEquipmentList = equipmentList.filter(({ equipment }) => {
    if (selectedEquipmentFilter !== 'ALL' && equipment.id !== selectedEquipmentFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const matchName = equipment.name.toLowerCase().includes(s);
      const matchInv = equipment.inventoryNumber && equipment.inventoryNumber.toLowerCase().includes(s);
      const matchSn = equipment.serialNumber && equipment.serialNumber.toLowerCase().includes(s);
      return matchName || matchInv || matchSn;
    }
    return true;
  });

  // KPI Metrics
  const totalMovements = movements.length;
  const purchases = movements.filter(m => m.type === 'PURCHASE').length;
  const assignments = movements.filter(m => m.type === 'ASSIGNMENT').length;
  const returns = movements.filter(m => m.type === 'RETURN').length;
  const transfers = movements.filter(m => m.type === 'TRANSFER').length;

  const handleOpenBlueprint = (group: any) => {
    setSelectedEquipmentBlueprint(group);
    setBlueprintModalOpen(true);
  };

  const handleExportCSV = () => {
    if (movements.length === 0) return;
    const headers = ["ID", "Date", "Type", "Équipement", "N° Inventaire", "S/N", "Opérateur IT", "Département Origine", "Département Destination", "Notes"];
    const rows = movements.map(m => [
      m.id,
      m.date ? new Date(m.date).toISOString() : '',
      `"${m.type}"`,
      `"${(m.equipment?.name || '').replace(/"/g, '""')}"`,
      `"${m.equipment?.inventoryNumber || ''}"`,
      `"${m.equipment?.serialNumber || ''}"`,
      `"${m.performedBy ? `${m.performedBy.firstName} ${m.performedBy.lastName}` : 'Système'}"`,
      `"${m.fromDepartment?.name || ''}"`,
      `"${m.toDepartment?.name || ''}"`,
      `"${(m.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `schema_mouvements_cathedis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({ open: true, message: "Exportation du registre des mouvements réussie !", severity: 'success' });
  };

  const paginatedMovements = movements.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
              <DiagramIcon sx={{ fontSize: 34, color: '#FFFFFF' }} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                  Schémas des Mouvements & Cycle de Vie
                </Typography>
                <Chip
                  icon={<SparklesIcon sx={{ fontSize: 16, color: '#FFD54F !important' }} />}
                  label="Cartographie & Diagrammes Interactifs"
                  size="small"
                  sx={{ bgcolor: 'rgba(255, 213, 79, 0.2)', color: '#FFD54F', border: '1px solid rgba(255, 213, 79, 0.4)', fontWeight: 800 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.6, maxWidth: 680 }}>
                Visualisez sous forme de schéma interactif et de circuit graphique chaque étape de vie de vos équipements : achat, dotation, transferts, maintenances et restitutions.
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
              onClick={fetchMovements}
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
          { label: "Total Mouvements Réalisés", number: totalMovements, sub: "Traçabilité intégrale du parc", icon: <TimelineIcon />, color: '#1A1A2E' },
          { label: "Achats & Entrées en Parc", number: purchases, sub: "Réceptions fournisseurs", icon: <PurchaseIcon />, color: '#059669' },
          { label: "Affectations & Dotations", number: assignments, sub: "Mises en service collaborateur", icon: <AssignIcon />, color: '#2563EB' },
          { label: "Restitutions & Transferts", number: returns + transfers, sub: "Mobilité interne du matériel", icon: <TransferIcon />, color: '#D97706' },
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

      {/* 🔍 3. SEARCH, FILTERS & VIEW MODE SWITCHER 🔍 */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', p: 2.5, bgcolor: '#FFFFFF' }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 2, flex: '1 1 500px', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Rechercher un équipement, S/N, n° inventaire ou note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> } }}
              sx={{ flex: '1 1 280px' }}
            />

            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>Type d'Événement</InputLabel>
              <Select value={filterType} label="Type d'Événement" onChange={(e) => setFilterType(e.target.value)}>
                <MenuItem value="ALL">Tous les types</MenuItem>
                <MenuItem value="PURCHASE">🛒 Achat / Entrée</MenuItem>
                <MenuItem value="ASSIGNMENT">🚀 Affectation</MenuItem>
                <MenuItem value="RETURN">🔄 Restitution</MenuItem>
                <MenuItem value="TRANSFER">🔀 Transfert</MenuItem>
                <MenuItem value="MAINTENANCE">🛠️ Maintenance</MenuItem>
                <MenuItem value="DECOMMISSION">⛔ Réforme</MenuItem>
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
                px: 2.5
              }}
            >
              Filtrer
            </Button>
          </Box>

          {/* View Mode Toggle Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ButtonGroup size="small" sx={{ borderRadius: 2 }}>
              <Button
                variant={viewMode === 'DIAGRAM' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('DIAGRAM')}
                startIcon={<DiagramIcon />}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: viewMode === 'DIAGRAM' ? '#E31E24' : 'transparent',
                  color: viewMode === 'DIAGRAM' ? '#FFFFFF' : '#64748B',
                  borderColor: '#CBD5E1',
                  '&:hover': { bgcolor: viewMode === 'DIAGRAM' ? '#C41018' : '#F1F5F9' }
                }}
              >
                Schémas Visuels par Matériel
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
                Journal Chronologique
              </Button>
            </ButtonGroup>
          </Box>
        </Box>

        {/* 🗺️ VIEW 1: INTERACTIVE VISUAL JOURNEY DIAGRAMS PER EQUIPMENT 🗺️ */}
        {viewMode === 'DIAGRAM' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Paper key={i} elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Skeleton width="40%" height={30} />
                  <Skeleton width="100%" height={120} sx={{ mt: 2 }} />
                </Paper>
              ))
            ) : filteredEquipmentList.length === 0 ? (
              <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <DiagramIcon sx={{ fontSize: 54, color: '#CBD5E1', mb: 1.5 }} />
                <Typography sx={{ fontWeight: 800, color: '#64748B', fontSize: '1.05rem' }}>
                  Aucun schéma de mouvement trouvé pour ces critères.
                </Typography>
              </Paper>
            ) : (
              filteredEquipmentList.map((group) => {
                const { equipment, movements: eqMovements } = group;
                // Sort chronologically from oldest (initial purchase) to newest
                const sortedMovements = [...eqMovements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                return (
                  <Paper
                    key={equipment.id}
                    elevation={0}
                    sx={{
                      borderRadius: 3.5,
                      border: '1px solid #E2E8F0',
                      bgcolor: '#FFFFFF',
                      overflow: 'hidden',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { boxShadow: '0 10px 30px rgba(0,0,0,0.07)' }
                    }}
                  >
                    {/* Equipment Card Header Banner */}
                    <Box sx={{
                      p: 2.5,
                      px: 3,
                      bgcolor: '#F8FAFC',
                      borderBottom: '1px solid #E2E8F0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 46, height: 46, bgcolor: '#FFFFFF', border: '1px solid #CBD5E1', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                          {getCategoryIcon(equipment.category?.name)}
                        </Avatar>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.05rem' }}>
                              {equipment.name}
                            </Typography>
                            <StatusChip status={equipment.status} />
                          </Box>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.3, flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#E31E24' }}>
                              N° Inv : {equipment.inventoryNumber || '-'}
                            </span>
                            {equipment.serialNumber && (
                              <span style={{ fontFamily: 'monospace' }}>• S/N: {equipment.serialNumber}</span>
                            )}
                            {equipment.brand && (
                              <span>• {equipment.brand} {equipment.model}</span>
                            )}
                          </Typography>
                        </Box>
                      </Box>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenBlueprint(group)}
                        startIcon={<ViewIcon />}
                        sx={{
                          color: '#E31E24',
                          borderColor: '#FFCDD2',
                          bgcolor: '#FFF5F5',
                          fontWeight: 800,
                          borderRadius: 2,
                          textTransform: 'none',
                          px: 2,
                          '&:hover': { bgcolor: '#FFE5E5', borderColor: '#E31E24' }
                        }}
                      >
                        Agrandir le Schéma 🔍
                      </Button>
                    </Box>

                    {/* 🚀 VISUAL FLOWCHART / ROADMAP DIAGRAM 🚀 */}
                    <Box sx={{ p: 3, overflowX: 'auto', bgcolor: '#FFFFFF' }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'stretch',
                        gap: 2,
                        minWidth: `${sortedMovements.length * 240}px`,
                        position: 'relative',
                        py: 1
                      }}>
                        {sortedMovements.map((step, idx) => {
                          const meta = getMovementMeta(step.type);
                          const isLastStep = idx === sortedMovements.length - 1;

                          return (
                            <React.Fragment key={step.id || idx}>
                              {/* DIAGRAM STEP NODE */}
                              <Box sx={{
                                flex: '1 1 240px',
                                minWidth: 220,
                                maxWidth: 280,
                                p: 2.5,
                                borderRadius: 3,
                                border: '2px solid',
                                borderColor: isLastStep ? meta.color : '#E2E8F0',
                                bgcolor: isLastStep ? meta.bgColor : '#FAFAFA',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                transition: 'all 0.2s',
                                boxShadow: isLastStep ? `0 6px 20px ${meta.color}25` : 'none',
                                '&:hover': { borderColor: meta.color, transform: 'translateY(-2px)' }
                              }}>
                                
                                {/* Step Header */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                  <Chip
                                    label={`Étape ${idx + 1}`}
                                    size="small"
                                    sx={{
                                      fontWeight: 900,
                                      fontSize: '0.68rem',
                                      bgcolor: isLastStep ? meta.color : '#E2E8F0',
                                      color: isLastStep ? '#FFFFFF' : '#475569'
                                    }}
                                  />
                                  {isLastStep && (
                                    <Chip
                                      label="Statut Actuel"
                                      size="small"
                                      sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: `${meta.color}25`, color: meta.color }}
                                    />
                                  )}
                                </Box>

                                {/* Action Badge & Icon */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
                                  <Box sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: isLastStep ? '#FFFFFF' : `${meta.color}15`,
                                    color: meta.color,
                                    boxShadow: isLastStep ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                                  }}>
                                    {meta.icon}
                                  </Box>
                                  <Box>
                                    <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: '#1A1A2E', lineHeight: 1.2 }}>
                                      {meta.label}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                      <TimeIcon sx={{ fontSize: 12 }} />
                                      {new Date(step.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Step Description / Details */}
                                <Typography sx={{ fontSize: '0.8rem', color: '#475569', mb: 1.5, lineHeight: 1.4 }}>
                                  {step.notes || meta.desc}
                                </Typography>

                                {/* Step Footer Metadata */}
                                <Box sx={{ pt: 1, borderTop: '1px dashed #CBD5E1', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  {step.performedBy && (
                                    <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <PersonIcon sx={{ fontSize: 13, color: '#2563EB' }} /> Par : <strong>{step.performedBy.firstName} {step.performedBy.lastName}</strong>
                                    </Typography>
                                  )}
                                  {(step.fromDepartment || step.toDepartment) && (
                                    <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                      <BusinessIcon sx={{ fontSize: 13 }} />
                                      {step.fromDepartment?.name || 'Stock'} ➔ {step.toDepartment?.name || 'Stock'}
                                    </Typography>
                                  )}
                                </Box>

                              </Box>

                              {/* DIRECTIONAL CONNECTOR ARROW */}
                              {!isLastStep && (
                                <Box sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  px: 0.5,
                                  color: '#CBD5E1'
                                }}>
                                  <Box sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    bgcolor: '#F1F5F9',
                                    border: '1px solid #CBD5E1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#E31E24'
                                  }}>
                                    <ArrowIcon sx={{ fontSize: 18 }} />
                                  </Box>
                                </Box>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </Box>
                    </Box>
                  </Paper>
                );
              })
            )}
          </Box>
        ) : (
          /* 📋 VIEW 2: GLOBAL CHRONOLOGICAL JOURNAL TABLE 📋 */
          <>
            <TableContainer>
              <Table size="medium">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Horodatage</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Type de Mouvement</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Équipement Concerné</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Opérateur Responsable</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Trajet / Départements</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Observations / Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton width={120} /></TableCell>
                        <TableCell><Skeleton width={130} /></TableCell>
                        <TableCell><Skeleton width={180} /></TableCell>
                        <TableCell><Skeleton width={140} /></TableCell>
                        <TableCell><Skeleton width={160} /></TableCell>
                        <TableCell><Skeleton width={200} /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedMovements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                        <TimelineIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                        <Typography sx={{ fontWeight: 700, color: '#64748B' }}>
                          Aucun mouvement enregistré dans le journal.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedMovements.map((row) => {
                      const meta = getMovementMeta(row.type);
                      return (
                        <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                          
                          {/* Date */}
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E293B' }}>
                              {new Date(row.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                              <TimeIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                              {new Date(row.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </TableCell>

                          {/* Type Chip */}
                          <TableCell>
                            <Chip
                              icon={meta.icon}
                              label={meta.label}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.74rem',
                                bgcolor: meta.bgColor,
                                color: meta.color,
                                border: '1px solid',
                                borderColor: meta.borderColor
                              }}
                            />
                          </TableCell>

                          {/* Equipment */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
                                {getCategoryIcon(row.equipment?.category?.name)}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '0.88rem' }}>
                                  {row.equipment?.name || 'Matériel'}
                                </Typography>
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#E31E24', fontWeight: 800 }}>
                                  {row.equipment?.inventoryNumber || '-'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Operator */}
                          <TableCell>
                            {row.performedBy ? (
                              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>
                                {row.performedBy.firstName} {row.performedBy.lastName}
                              </Typography>
                            ) : (
                              <Chip label="Système" size="small" sx={{ fontWeight: 700, bgcolor: '#F1F5F9', color: '#64748B' }} />
                            )}
                          </TableCell>

                          {/* Journey Route */}
                          <TableCell>
                            <Typography sx={{ fontSize: '0.82rem', color: '#047857', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {row.fromDepartment?.name || 'Stock IT'} <ArrowIcon sx={{ fontSize: 14 }} /> {row.toDepartment?.name || 'Stock IT'}
                            </Typography>
                          </TableCell>

                          {/* Notes */}
                          <TableCell sx={{ maxWidth: 280 }}>
                            <Typography sx={{ fontSize: '0.82rem', color: '#475569' }}>
                              {row.notes || '-'}
                            </Typography>
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
              count={movements.length}
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

      {/* 🔍 4. FULL-SCREEN INTERACTIVE BLUEPRINT MODAL 🔍 */}
      <Dialog
        open={blueprintModalOpen}
        onClose={() => setBlueprintModalOpen(false)}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        {selectedEquipmentBlueprint && (
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
                <Avatar sx={{ width: 54, height: 54, bgcolor: '#E31E24', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(227,30,36,0.45)' }}>
                  {getCategoryIcon(selectedEquipmentBlueprint.equipment?.category?.name)}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFFFFF' }}>
                      Passeport & Traçabilité : {selectedEquipmentBlueprint.equipment?.name}
                    </Typography>
                    <StatusChip status={selectedEquipmentBlueprint.equipment?.status} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#FFCDD2', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.85rem' }}>
                    N° Inventaire : {selectedEquipmentBlueprint.equipment?.inventoryNumber} • S/N: {selectedEquipmentBlueprint.equipment?.serialNumber || 'N/A'}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setBlueprintModalOpen(false)} sx={{ color: '#FFFFFF' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3.5, bgcolor: '#FAFAFA' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1A1A2E', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DiagramIcon sx={{ color: '#E31E24' }} /> Schéma Chronologique Exhaustif du Cycle de Vie
              </Typography>

              {/* Vertical Detailed Timeline Circuit */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, position: 'relative', pl: 3, borderLeft: '3px solid #E31E24' }}>
                {selectedEquipmentBlueprint.movements
                  .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((step: any, index: number) => {
                    const meta = getMovementMeta(step.type);
                    return (
                      <Paper
                        key={step.id || index}
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          border: '1px solid #E2E8F0',
                          bgcolor: '#FFFFFF',
                          position: 'relative',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}
                      >
                        {/* Glowing Left Dot on the Axis */}
                        <Box sx={{
                          position: 'absolute',
                          left: -37,
                          top: 24,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          bgcolor: meta.color,
                          border: '3px solid #FFFFFF',
                          boxShadow: `0 0 10px ${meta.color}`
                        }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Chip
                              icon={meta.icon}
                              label={meta.label}
                              sx={{ fontWeight: 900, bgcolor: meta.bgColor, color: meta.color, border: '1px solid', borderColor: meta.borderColor }}
                            />
                            <Typography sx={{ fontWeight: 800, color: '#1E293B' }}>
                              Étape {index + 1}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                            {new Date(step.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} à {new Date(step.date).toLocaleTimeString('fr-FR')}
                          </Typography>
                        </Box>

                        <Typography sx={{ fontSize: '0.88rem', color: '#334155', mt: 1, mb: 1.5 }}>
                          {step.notes || meta.desc}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', pt: 1, borderTop: '1px dashed #E2E8F0' }}>
                          {step.performedBy && (
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              👤 Enregistré par : <strong>{step.performedBy.firstName} {step.performedBy.lastName}</strong>
                            </Typography>
                          )}
                          {(step.fromDepartment || step.toDepartment) && (
                            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700 }}>
                              📍 Transfert : {step.fromDepartment?.name || 'Stock IT'} ➔ {step.toDepartment?.name || 'Stock IT'}
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    );
                  })}
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
              <Button onClick={() => setBlueprintModalOpen(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700, color: '#64748B' }}>
                Fermer
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  window.print();
                }}
                sx={{
                  background: 'linear-gradient(90deg, #1A1A2E 0%, #2A1B28 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3
                }}
              >
                🖨️ Imprimer la Fiche Traçabilité
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
