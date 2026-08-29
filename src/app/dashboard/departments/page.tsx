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
  LinearProgress
} from '@mui/material';
import {
  Business as BusinessIcon,
  Domain as DomainIcon,
  Devices as DevicesIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  ViewList as TableViewIcon,
  ViewModule as GridViewIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Computer as ComputerIcon,
  LaptopMac as LaptopIcon,
  CorporateFare as CorporateIcon,
  Store as HubIcon,
  TrendingUp as TrendingUpIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

const schema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  location: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const LOCATION_PRESETS = [
  "Siège Social - Casablanca",
  "Hub Logistique Principal",
  "Agence Régionale - Rabat",
  "Agence Régionale - Tanger",
  "Agence Régionale - Marrakech",
  "Agence Régionale - Fès",
  "Centre de Tri & Expédition"
];

export default function DepartmentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'CARDS' or 'TABLE'
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  // Search & Filters
  const [search, setSearch] = useState('');

  // Pagination for table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialogs state
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);

  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/departments');
      if (res.ok) {
        const json = await res.json();
        setData(json || []);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Erreur lors du chargement des départements", severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openForm = (item?: any) => {
    setEditItem(item || null);
    if (item) {
      setValue('name', item.name || '');
      setValue('description', item.description || '');
      setValue('location', item.location || '');
    } else {
      reset({ name: '', description: '', location: '' });
    }
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditItem(null);
    reset();
  };

  const openDetails = (dept: any) => {
    setSelectedDept(dept);
    setDetailsOpen(true);
  };

  const onSubmit = async (formData: FormData) => {
    setSaving(true);
    try {
      const url = editItem ? `/api/departments/${editItem.id}` : '/api/departments';
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSnackbar({ open: true, message: editItem ? "Département mis à jour avec succès !" : "Nouveau département créé avec succès !", severity: 'success' });
        closeForm();
        fetchData();
      } else {
        const errJson = await res.json();
        throw new Error(errJson.error || "Erreur de sauvegarde");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Une erreur est survenue", severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/departments/${deleteItem.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSnackbar({ open: true, message: "Département supprimé du système", severity: 'success' });
        setDeleteConfirmOpen(false);
        fetchData();
      } else {
        const errJson = await res.json();
        throw new Error(errJson.error || "Erreur de suppression");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur lors de la suppression", severity: 'error' });
    } finally {
      setSaving(false);
      setDeleteItem(null);
    }
  };

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = ["ID", "Nom du Département", "Localisation", "Description", "Nombre d'Employés", "Nombre d'Équipements"];
    const rows = data.map(d => [
      d.id,
      `"${(d.name || '').replace(/"/g, '""')}"`,
      `"${(d.location || '').replace(/"/g, '""')}"`,
      `"${(d.description || '').replace(/"/g, '""')}"`,
      d.employeesCount || 0,
      d.equipmentsCount || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `departements_cathedis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({ open: true, message: "Exportation des départements réussie !", severity: 'success' });
  };

  const filteredData = data.filter(d => {
    const s = search.toLowerCase();
    return !s ||
      (d.name && d.name.toLowerCase().includes(s)) ||
      (d.location && d.location.toLowerCase().includes(s)) ||
      (d.description && d.description.toLowerCase().includes(s));
  });

  // KPI Metrics
  const totalDepts = data.length;
  const totalEmployees = data.reduce((acc, d) => acc + (d.employeesCount || 0), 0);
  const totalEquipments = data.reduce((acc, d) => acc + (d.equipmentsCount || 0), 0);
  const uniqueLocations = new Set(data.map(d => d.location).filter(Boolean)).size;

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
      
      {/* 🌟 1. HERO BANNER 🌟 */}
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
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.35) 0%, rgba(227,30,36,0) 70%)', pointerEvents: 'none' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap', gap: 2.5, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar sx={{ width: 62, height: 62, bgcolor: 'rgba(227,30,36,0.3)', border: '2px solid rgba(227,30,36,0.8)', color: '#FFFFFF', boxShadow: '0 8px 24px rgba(227,30,36,0.45)' }}>
              <DomainIcon sx={{ fontSize: 34, color: '#FFFFFF' }} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                  Départements & Services
                </Typography>
                <Chip
                  icon={<CorporateIcon sx={{ fontSize: 16, color: '#A7F3D0 !important' }} />}
                  label="Organisation Interne Cathedis"
                  size="small"
                  sx={{ bgcolor: 'rgba(5, 150, 105, 0.25)', color: '#A7F3D0', border: '1px solid rgba(167, 243, 208, 0.4)', fontWeight: 800 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.6, maxWidth: 680 }}>
                Structure organisationnelle, cartographie des sites, affectation des collaborateurs et répartition du parc informatique par service.
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
              onClick={() => openForm()}
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
              + Nouveau Département
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 📊 2. FOUR GLASSMORPHIС KPI CARDS 📊 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {[
          { label: "Total Départements", number: totalDepts, sub: "Services & Directions", icon: <DomainIcon />, color: '#1A1A2E' },
          { label: "Collaborateurs Rattachés", number: totalEmployees, sub: "Employés actifs", icon: <PeopleIcon />, color: '#2563EB' },
          { label: "Matériels en Service", number: totalEquipments, sub: "Ordinateurs & écrans", icon: <DevicesIcon />, color: '#059669' },
          { label: "Sites & Agences Couverts", number: uniqueLocations || 1, sub: "Implantations réseau", icon: <LocationIcon />, color: '#D97706' },
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

      {/* 🔍 3. SEARCH & VIEW CONTROLLER 🔍 */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', p: 2.5, bgcolor: '#FFFFFF' }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <TextField
            size="small"
            placeholder="Rechercher par nom de département, localisation, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> } }}
            sx={{ flex: '1 1 320px', maxWidth: 450 }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>
              {filteredData.length} département(s)
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
                Cartes des Services
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

        {/* 🔲 VIEW 1: MODERN DEPARTMENT CARDS 🔲 */}
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
            ) : filteredData.length === 0 ? (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 6 }}>
                <DomainIcon sx={{ fontSize: 50, color: '#CBD5E1', mb: 1 }} />
                <Typography sx={{ fontWeight: 800, color: '#64748B' }}>
                  Aucun département ne correspond à votre recherche.
                </Typography>
              </Box>
            ) : (
              filteredData.map((dept) => {
                const ratio = dept.employeesCount > 0 ? ((dept.equipmentsCount || 0) / dept.employeesCount).toFixed(1) : '0';

                return (
                  <Card
                    key={dept.id}
                    elevation={0}
                    sx={{
                      borderRadius: 3.5,
                      border: '1px solid #E2E8F0',
                      borderTop: '5px solid #E31E24',
                      bgcolor: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                        borderColor: '#E31E24'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      {/* Department Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 44, height: 44, bgcolor: '#FFF5F5', color: '#E31E24', border: '1px solid #FECACA' }}>
                            <BusinessIcon />
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.05rem', lineHeight: 1.2 }}>
                              {dept.name}
                            </Typography>
                            {dept.location && (
                              <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.2 }}>
                                <LocationIcon sx={{ fontSize: 13, color: '#E31E24' }} /> {dept.location}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      {/* Description */}
                      <Typography sx={{ fontSize: '0.85rem', color: '#475569', mb: 2, minHeight: 40, lineHeight: 1.4 }}>
                        {dept.description || "Aucune description renseignée pour ce département."}
                      </Typography>

                      {/* Department KPIs (Staff & Machines) */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, p: 1.5, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PeopleIcon sx={{ fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.05rem', lineHeight: 1 }}>
                              {dept.employeesCount || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 700 }}>
                              Employés
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DevicesIcon sx={{ fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.05rem', lineHeight: 1 }}>
                              {dept.equipmentsCount || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 700 }}>
                              Matériels
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Equipment Density Ratio */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                          Taux d'équipement :
                        </Typography>
                        <Chip
                          icon={<TrendingUpIcon sx={{ fontSize: 13, color: '#059669 !important' }} />}
                          label={`${ratio} appareil/collaborateur`}
                          size="small"
                          sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: '#ECFDF5', color: '#047857' }}
                        />
                      </Box>
                    </CardContent>

                    {/* Actions Footer */}
                    <CardActions sx={{ p: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        onClick={() => openDetails(dept)}
                        startIcon={<ViewIcon />}
                        sx={{ textTransform: 'none', fontWeight: 800, color: '#1A1A2E', fontSize: '0.78rem' }}
                      >
                        Fiche 360°
                      </Button>

                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Modifier">
                          <IconButton size="small" onClick={() => openForm(dept)} sx={{ color: '#2563EB', bgcolor: '#EFF6FF' }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" onClick={() => { setDeleteItem(dept); setDeleteConfirmOpen(true); }} sx={{ color: '#DC2626', bgcolor: '#FEF2F2' }}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
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
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Département / Direction</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Localisation & Site</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Description</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#1E293B' }}>Collaborateurs</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#1E293B' }}>Matériels Déployés</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#1E293B' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton width={160} /></TableCell>
                        <TableCell><Skeleton width={140} /></TableCell>
                        <TableCell><Skeleton width={200} /></TableCell>
                        <TableCell align="center"><Skeleton width={60} /></TableCell>
                        <TableCell align="center"><Skeleton width={60} /></TableCell>
                        <TableCell align="center"><Skeleton width={100} /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                        <DomainIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                        <Typography sx={{ fontWeight: 700, color: '#64748B' }}>
                          Aucun département trouvé.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row) => (
                      <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 34, height: 34, bgcolor: '#FFF5F5', color: '#E31E24' }}>
                              <BusinessIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Typography
                              onClick={() => openDetails(row)}
                              sx={{ fontWeight: 800, color: '#1A1A2E', cursor: 'pointer', '&:hover': { color: '#E31E24', textDecoration: 'underline' } }}
                            >
                              {row.name}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          {row.location ? (
                            <Chip
                              icon={<LocationIcon sx={{ fontSize: 13, color: '#E31E24 !important' }} />}
                              label={row.location}
                              size="small"
                              sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#F8FAFC' }}
                            />
                          ) : (
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>Non spécifié</Typography>
                          )}
                        </TableCell>

                        <TableCell sx={{ fontSize: '0.85rem', color: '#475569', maxWidth: 280 }}>
                          {row.description || '-'}
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={`${row.employeesCount || 0} pers.`}
                            size="small"
                            sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: '#EFF6FF', color: '#1D4ED8' }}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={`${row.equipmentsCount || 0} app.`}
                            size="small"
                            sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: '#ECFDF5', color: '#047857' }}
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
                              <IconButton size="small" onClick={() => openForm(row)} sx={{ color: '#2563EB', bgcolor: '#EFF6FF' }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton size="small" onClick={() => { setDeleteItem(row); setDeleteConfirmOpen(true); }} sx={{ color: '#DC2626', bgcolor: '#FEF2F2' }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
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
              count={filteredData.length}
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

      {/* 📝 4. MODALE CRÉATION / MODIFICATION DÉPARTEMENT 📝 */}
      <Dialog
        open={formOpen}
        onClose={closeForm}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
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
              <DomainIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                {editItem ? "Modifier le Département" : "Nouveau Département"}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Organisation & Structure du Parc Cathedis
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={closeForm} sx={{ color: '#FFFFFF' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, bgcolor: '#FAFAFA' }}>
            <TextField
              label="Nom du Département / Service *"
              placeholder="ex: Direction Financière, Pôle IT, Opérations & Logistique..."
              fullWidth
              required
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ bgcolor: '#FFFFFF' }}
            />

            <Box>
              <TextField
                label="Localisation / Site"
                placeholder="ex: Siège Social - Casablanca"
                fullWidth
                {...register('location')}
                sx={{ bgcolor: '#FFFFFF', mb: 1 }}
              />
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                Suggestions rapides de sites Cathedis :
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                {LOCATION_PRESETS.slice(0, 4).map((loc, idx) => (
                  <Chip
                    key={idx}
                    label={loc}
                    size="small"
                    clickable
                    onClick={() => setValue('location', loc)}
                    sx={{ fontSize: '0.7rem', fontWeight: 700, bgcolor: '#F1F5F9' }}
                  />
                ))}
              </Box>
            </Box>

            <TextField
              label="Description / Rôle du service"
              placeholder="Précisez la mission et les spécificités de ce département..."
              fullWidth
              multiline
              rows={3}
              {...register('description')}
              sx={{ bgcolor: '#FFFFFF' }}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
            <Button onClick={closeForm} variant="outlined" sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B' }}>
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
              {saving ? 'Enregistrement...' : editItem ? 'Mettre à jour' : 'Créer le Département'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* 🔍 5. FICHE 360° DU DÉPARTEMENT 🔍 */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        {selectedDept && (
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                <Avatar sx={{ bgcolor: '#E31E24', color: '#FFFFFF', width: 46, height: 46 }}>
                  <DomainIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                    {selectedDept.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    Fiche Organisationnelle 360°
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setDetailsOpen(false)} sx={{ color: '#FFFFFF' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3, bgcolor: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Localisation Géographique</Typography>
                <Typography sx={{ fontWeight: 800, color: '#1A1A2E', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <LocationIcon sx={{ color: '#E31E24' }} /> {selectedDept.location || 'Non spécifiée'}
                </Typography>
              </Paper>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #BFDBFE', bgcolor: '#EFF6FF', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase' }}>Collaborateurs</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#1D4ED8', mt: 0.5 }}>
                    {selectedDept.employeesCount || 0}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #A7F3D0', bgcolor: '#ECFDF5', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#065F46', textTransform: 'uppercase' }}>Matériels Déployés</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#047857', mt: 0.5 }}>
                    {selectedDept.equipmentsCount || 0}
                  </Typography>
                </Paper>
              </Box>

              <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Description & Missions</Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#475569', mt: 0.5, lineHeight: 1.5 }}>
                  {selectedDept.description || "Aucune description détaillée renseignée."}
                </Typography>
              </Paper>
            </DialogContent>

            <DialogActions sx={{ p: 2, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'flex-end' }}>
              <Button onClick={() => setDetailsOpen(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700, color: '#64748B' }}>
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ⚠️ 6. MODALE CONFIRMATION SUPPRESSION ⚠️ */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer ce département ?"
        message={`Êtes-vous sûr de vouloir supprimer définitivement le département "${deleteItem?.name}" ? Cette action est irréversible.`}
        loading={saving}
      />

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2.5, fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
