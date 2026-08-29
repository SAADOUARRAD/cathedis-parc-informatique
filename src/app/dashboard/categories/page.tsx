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
  Category as CategoryIcon,
  DevicesOther as DevicesOtherIcon,
  FormatListNumbered as ListIcon,
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
  LaptopMac as LaptopIcon,
  DesktopWindows as DesktopIcon,
  Tv as ScreenIcon,
  Headphones as HeadphoneIcon,
  Print as PrintIcon,
  Router as NetworkIcon,
  QrCode as QrIcon,
  Tag as TagIcon,
  Layers as LayersIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as SparklesIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

const schema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  prefix: z.string().min(1, "Le préfixe est requis (ex: LAP, FIX, ECR)"),
});

type FormData = z.infer<typeof schema>;

const PREFIX_PRESETS = [
  { label: "Ordinateur Portable", prefix: "LAP", icon: <LaptopIcon /> },
  { label: "Ordinateur Fixe", prefix: "FIX", icon: <DesktopIcon /> },
  { label: "Écran / Moniteur", prefix: "ECR", icon: <ScreenIcon /> },
  { label: "Casque Audio", prefix: "CSQ", icon: <HeadphoneIcon /> },
  { label: "Imprimante", prefix: "IMP", icon: <PrintIcon /> },
  { label: "Réseau / Switch", prefix: "RES", icon: <NetworkIcon /> },
];

export default function CategoriesPage() {
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
  const [selectedCat, setSelectedCat] = useState<any>(null);

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
      const res = await fetch('/api/categories');
      if (res.ok) {
        const json = await res.json();
        setData(json || []);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Erreur lors du chargement des catégories", severity: 'error' });
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
      setValue('prefix', item.prefix || '');
    } else {
      reset({ name: '', description: '', prefix: '' });
    }
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditItem(null);
    reset();
  };

  const openDetails = (cat: any) => {
    setSelectedCat(cat);
    setDetailsOpen(true);
  };

  const onSubmit = async (formData: FormData) => {
    setSaving(true);
    try {
      const url = editItem ? `/api/categories/${editItem.id}` : '/api/categories';
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSnackbar({ open: true, message: editItem ? "Catégorie mise à jour avec succès !" : "Nouvelle catégorie créée avec succès !", severity: 'success' });
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
      const res = await fetch(`/api/categories/${deleteItem.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSnackbar({ open: true, message: "Catégorie supprimée avec succès", severity: 'success' });
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

  const getCategoryIcon = (catName?: string) => {
    const c = (catName || '').toLowerCase();
    if (c.includes('portable') || c.includes('laptop')) return <LaptopIcon sx={{ color: '#E31E24' }} />;
    if (c.includes('fixe') || c.includes('desktop') || c.includes('unité')) return <DesktopIcon sx={{ color: '#2563EB' }} />;
    if (c.includes('écran') || c.includes('ecran') || c.includes('moniteur')) return <ScreenIcon sx={{ color: '#059669' }} />;
    if (c.includes('casque') || c.includes('audio') || c.includes('micro')) return <HeadphoneIcon sx={{ color: '#7C3AED' }} />;
    if (c.includes('imprimante') || c.includes('printer')) return <PrintIcon sx={{ color: '#D97706' }} />;
    if (c.includes('réseau') || c.includes('switch') || c.includes('routeur')) return <NetworkIcon sx={{ color: '#0284C7' }} />;
    return <CategoryIcon sx={{ color: '#64748B' }} />;
  };

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = ["ID", "Nom de la Catégorie", "Préfixe d'Inventaire", "Description", "Nombre d'Équipements"];
    const rows = data.map(d => [
      d.id,
      `"${(d.name || '').replace(/"/g, '""')}"`,
      `"${(d.prefix || '').replace(/"/g, '""')}"`,
      `"${(d.description || '').replace(/"/g, '""')}"`,
      d.equipmentsCount || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `categories_equipements_cathedis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({ open: true, message: "Exportation de la nomenclature réussie !", severity: 'success' });
  };

  const filteredData = data.filter(d => {
    const s = search.toLowerCase();
    return !s ||
      (d.name && d.name.toLowerCase().includes(s)) ||
      (d.prefix && d.prefix.toLowerCase().includes(s)) ||
      (d.description && d.description.toLowerCase().includes(s));
  });

  // KPI Metrics
  const totalCategories = data.length;
  const categoriesUsed = data.filter(d => (d.equipmentsCount || 0) > 0).length;
  const totalEquipments = data.reduce((acc, curr) => acc + (curr.equipmentsCount || 0), 0);
  const prefixesConfigured = data.filter(d => Boolean(d.prefix)).length;

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
              <CategoryIcon sx={{ fontSize: 34, color: '#FFFFFF' }} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                  Nomenclature & Familles Matérielles
                </Typography>
                <Chip
                  icon={<LayersIcon sx={{ fontSize: 16, color: '#A7F3D0 !important' }} />}
                  label="Standardisation & Préfixes d'Inventaire"
                  size="small"
                  sx={{ bgcolor: 'rgba(5, 150, 105, 0.25)', color: '#A7F3D0', border: '1px solid rgba(167, 243, 208, 0.4)', fontWeight: 800 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.6, maxWidth: 680 }}>
                Classification normalisée du parc informatique Cathedis, génération automatique des numéros d'inventaire et codification des préfixes.
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
              + Nouvelle Catégorie
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 📊 2. FOUR GLASSMORPHIС KPI CARDS 📊 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {[
          { label: "Total Familles", number: totalCategories, sub: "Catégories actives", icon: <CategoryIcon />, color: '#1A1A2E' },
          { label: "Matériels Classifiés", number: totalEquipments, sub: "Appareils répertoriés", icon: <DevicesOtherIcon />, color: '#E31E24' },
          { label: "Catégories en Service", number: categoriesUsed, sub: "Avec équipements actifs", icon: <CheckCircleIcon />, color: '#059669' },
          { label: "Préfixes Codifiés", number: prefixesConfigured, sub: "Standards normalisés", icon: <TagIcon />, color: '#2563EB' },
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
            placeholder="Rechercher par nom de catégorie, préfixe, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> } }}
            sx={{ flex: '1 1 320px', maxWidth: 450 }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>
              {filteredData.length} catégorie(s)
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
                Cartes des Familles
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

        {/* 🔲 VIEW 1: MODERN CATEGORY CARDS 🔲 */}
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
            ) : filteredData.length === 0 ? (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 6 }}>
                <CategoryIcon sx={{ fontSize: 50, color: '#CBD5E1', mb: 1 }} />
                <Typography sx={{ fontWeight: 800, color: '#64748B' }}>
                  Aucune catégorie ne correspond à votre recherche.
                </Typography>
              </Box>
            ) : (
              filteredData.map((cat) => {
                const count = cat.equipmentsCount || 0;
                const percentage = totalEquipments > 0 ? Math.round((count / totalEquipments) * 100) : 0;

                return (
                  <Card
                    key={cat.id}
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
                      {/* Header with Icon & Prefix */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 44, height: 44, bgcolor: '#FFF5F5', border: '1px solid #FECACA' }}>
                            {getCategoryIcon(cat.name)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.05rem', lineHeight: 1.2 }}>
                              {cat.name}
                            </Typography>
                            <Chip
                              label={`Préfixe : ${cat.prefix || 'N/A'}`}
                              size="small"
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: 900,
                                fontSize: '0.7rem',
                                bgcolor: '#EFF6FF',
                                color: '#1D4ED8',
                                mt: 0.4,
                                border: '1px solid #BFDBFE'
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>

                      {/* Description */}
                      <Typography sx={{ fontSize: '0.85rem', color: '#475569', mb: 2, minHeight: 40, lineHeight: 1.4 }}>
                        {cat.description || "Aucune description détaillée renseignée pour cette catégorie."}
                      </Typography>

                      {/* Equipment Count & Share of Fleet */}
                      <Box sx={{ bgcolor: '#F8FAFC', p: 1.8, borderRadius: 2.5, border: '1px solid #F1F5F9', mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                            Volume en service :
                          </Typography>
                          <Typography sx={{ fontWeight: 900, color: '#E31E24', fontSize: '1rem' }}>
                            {count} équipement{count > 1 ? 's' : ''}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                            Part du parc global :
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '0.72rem' }}>
                            {percentage}%
                          </Typography>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#E2E8F0',
                            '& .MuiLinearProgress-bar': { bgcolor: '#E31E24', borderRadius: 3 }
                          }}
                        />
                      </Box>
                    </CardContent>

                    {/* Actions Footer */}
                    <CardActions sx={{ p: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        onClick={() => openDetails(cat)}
                        startIcon={<ViewIcon />}
                        sx={{ textTransform: 'none', fontWeight: 800, color: '#1A1A2E', fontSize: '0.78rem' }}
                      >
                        Fiche 360°
                      </Button>

                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Modifier">
                          <IconButton size="small" onClick={() => openForm(cat)} sx={{ color: '#2563EB', bgcolor: '#EFF6FF' }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" onClick={() => { setDeleteItem(cat); setDeleteConfirmOpen(true); }} sx={{ color: '#DC2626', bgcolor: '#FEF2F2' }}>
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
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Famille Matérielle</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Préfixe d'Inventaire</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Description</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#1E293B' }}>Volume en Parc</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#1E293B' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton width={160} /></TableCell>
                        <TableCell><Skeleton width={80} /></TableCell>
                        <TableCell><Skeleton width={200} /></TableCell>
                        <TableCell align="center"><Skeleton width={60} /></TableCell>
                        <TableCell align="center"><Skeleton width={100} /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ py: 6, textAlign: 'center' }}>
                        <CategoryIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                        <Typography sx={{ fontWeight: 700, color: '#64748B' }}>
                          Aucune catégorie trouvée.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row) => (
                      <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 34, height: 34, bgcolor: '#FFF5F5', color: '#E31E24' }}>
                              {getCategoryIcon(row.name)}
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
                          <Chip
                            label={row.prefix || '-'}
                            size="small"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 900,
                              fontSize: '0.74rem',
                              bgcolor: '#EFF6FF',
                              color: '#1D4ED8',
                              border: '1px solid #BFDBFE'
                            }}
                          />
                        </TableCell>

                        <TableCell sx={{ fontSize: '0.85rem', color: '#475569', maxWidth: 280 }}>
                          {row.description || '-'}
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={`${row.equipmentsCount || 0} appareils`}
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

      {/* 📝 4. MODALE CRÉATION / MODIFICATION CATÉGORIE 📝 */}
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
              <CategoryIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                {editItem ? "Modifier la Catégorie" : "Nouvelle Catégorie Matérielle"}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Nomenclature & Codification d'Inventaire
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
              label="Nom de la Catégorie *"
              placeholder="ex: Ordinateur Portable, Écran 27 pouces, Casque Call Center..."
              fullWidth
              required
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ bgcolor: '#FFFFFF' }}
            />

            <Box>
              <TextField
                label="Préfixe d'Inventaire (Code Court) *"
                placeholder="ex: LAP, FIX, ECR, CSQ, IMP"
                fullWidth
                required
                {...register('prefix')}
                error={!!errors.prefix}
                helperText={errors.prefix?.message || "Utilisé pour formater automatiquement les N° d'inventaire (ex: LAP-001)"}
                sx={{ bgcolor: '#FFFFFF', mb: 1 }}
              />
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                Suggestions de préfixes normalisés Cathedis :
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                {PREFIX_PRESETS.map((p, idx) => (
                  <Chip
                    key={idx}
                    label={`${p.prefix} (${p.label})`}
                    size="small"
                    clickable
                    onClick={() => setValue('prefix', p.prefix)}
                    sx={{ fontSize: '0.7rem', fontWeight: 700, bgcolor: '#F1F5F9' }}
                  />
                ))}
              </Box>
            </Box>

            <TextField
              label="Description / Spécifications attendues"
              placeholder="Précisez les caractéristiques standards associées à cette catégorie..."
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
              {saving ? 'Enregistrement...' : editItem ? 'Mettre à jour' : 'Créer la Catégorie'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* 🔍 5. FICHE 360° DE LA CATÉGORIE 🔍 */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        {selectedCat && (
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
                  {getCategoryIcon(selectedCat.name)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                    {selectedCat.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    Fiche Nomenclature 360°
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setDetailsOpen(false)} sx={{ color: '#FFFFFF' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3, bgcolor: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #BFDBFE', bgcolor: '#EFF6FF', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase' }}>Préfixe d'Inventaire</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#1D4ED8', mt: 0.5, fontFamily: 'monospace' }}>
                    {selectedCat.prefix || '-'}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #A7F3D0', bgcolor: '#ECFDF5', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#065F46', textTransform: 'uppercase' }}>Équipements Actifs</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#047857', mt: 0.5 }}>
                    {selectedCat.equipmentsCount || 0}
                  </Typography>
                </Paper>
              </Box>

              <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Description & Rôle</Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#475569', mt: 0.5, lineHeight: 1.5 }}>
                  {selectedCat.description || "Aucune description détaillée renseignée pour cette catégorie."}
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
        title="Supprimer cette catégorie ?"
        message={`Êtes-vous sûr de vouloir supprimer définitivement la catégorie "${deleteItem?.name}" ? Cette action est irréversible.`}
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
