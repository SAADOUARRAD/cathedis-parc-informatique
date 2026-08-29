'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box, Typography, Paper, Chip, Button, Dialog, DialogTitle, DialogContent,
  TextField, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert,
  Skeleton, Avatar, IconButton, InputAdornment, Tooltip, LinearProgress, Grid, Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Computer as ComputerIcon,
  LaptopMac as LaptopIcon,
  DesktopWindows as MonitorIcon,
  Keyboard as KeyboardIcon,
  Headset as HeadsetIcon,
  Print as PrintIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalShipping as LocalShippingIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Search as SearchIcon,
  InfoOutlined as InfoIcon,
  FlashOn as FlashIcon,
  Speed as SpeedIcon,
  ChatBubbleOutlined as ChatIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

// --- Status Configuration ---
const statusConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string; progress: number; icon: React.ReactNode }> = {
  PENDING: {
    label: 'En attente d’évaluation',
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A',
    progress: 25,
    icon: <ScheduleIcon sx={{ fontSize: 18, color: '#D97706' }} />
  },
  APPROVED: {
    label: 'Demande Approuvée',
    color: '#059669',
    bgColor: '#D1FAE5',
    borderColor: '#A7F3D0',
    progress: 75,
    icon: <CheckCircleIcon sx={{ fontSize: 18, color: '#059669' }} />
  },
  FULFILLED: {
    label: 'Matériel Livré & Affecté',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    borderColor: '#BFDBFE',
    progress: 100,
    icon: <LocalShippingIcon sx={{ fontSize: 18, color: '#2563EB' }} />
  },
  REJECTED: {
    label: 'Demande Refusée',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#FECACA',
    progress: 100,
    icon: <CancelIcon sx={{ fontSize: 18, color: '#DC2626' }} />
  },
};

// --- Priority Configuration ---
const priorityConfig: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  LOW: { label: 'Basse (Planifiée)', color: '#0284C7', bgColor: '#E0F2FE', icon: '🟢' },
  MEDIUM: { label: 'Normale (Standard)', color: '#D97706', bgColor: '#FEF3C7', icon: '🟠' },
  HIGH: { label: 'Haute (Prioritaire)', color: '#EA580C', bgColor: '#FFEDD5', icon: '🔴' },
  CRITICAL: { label: 'Urgente (Blocage)', color: '#DC2626', bgColor: '#FEE2E2', icon: '⚡' },
};

// --- Quick Category Presets (Express Catalog) ---
const quickTemplates = [
  {
    title: 'Ordinateur Portable Pro',
    categoryName: 'Ordinateur Portable',
    description: 'PC portable haute performance pour travail bureautique, réunions et mobilité.',
    icon: <LaptopIcon sx={{ fontSize: 28, color: '#E31E24' }} />,
    priority: 'HIGH',
  },
  {
    title: 'Écran Externe HD / 4K',
    categoryName: 'Écran',
    description: 'Moniteur ergonomique externe (24" ou 27") pour configuration double écran.',
    icon: <MonitorIcon sx={{ fontSize: 28, color: '#E31E24' }} />,
    priority: 'MEDIUM',
  },
  {
    title: 'Pack Périphériques Ergonomiques',
    categoryName: 'Accessoire',
    description: 'Clavier et souris sans fil ergonomiques pour confort de frappe prolongé.',
    icon: <KeyboardIcon sx={{ fontSize: 28, color: '#E31E24' }} />,
    priority: 'LOW',
  },
  {
    title: 'Casque Visioconférence avec Micro',
    categoryName: 'Accessoire',
    description: 'Casque audio réducteur de bruit pour appels clients et réunions Teams/Meet.',
    icon: <HeadsetIcon sx={{ fontSize: 28, color: '#E31E24' }} />,
    priority: 'MEDIUM',
  },
];

export default function DemandesEquipementPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const fetchData = async () => {
    try {
      const [reqRes, catRes] = await Promise.all([
        fetch('/api/equipment-requests'),
        fetch('/api/categories'),
      ]);
      if (reqRes.ok) setRequests(await reqRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setQuantity(1);
    setReason('');
    setCategoryId('');
  };

  const handleOpenPreset = (template: typeof quickTemplates[0]) => {
    setTitle(template.title);
    setDescription(template.description);
    setPriority(template.priority);
    setQuantity(1);
    setReason('Amélioration du poste de travail et productivité');
    
    // Match category
    const matchedCat = categories.find((c: any) => c.name.toLowerCase().includes(template.categoryName.toLowerCase()));
    if (matchedCat) setCategoryId(matchedCat.id);
    else setCategoryId('');

    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setSnackbar({ open: true, message: 'Le titre et la description sont obligatoires', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/equipment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          quantity,
          reason,
          categoryId: categoryId || null,
        }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: 'Votre demande a été transmise à l\'équipe IT avec succès !', severity: 'success' });
        setDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        setSnackbar({ open: true, message: 'Une erreur est survenue lors de l\'envoi', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Erreur de connexion réseau', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/equipment-requests/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSnackbar({ open: true, message: 'Demande annulée avec succès', severity: 'success' });
        fetchData();
      }
    } catch {
      setSnackbar({ open: true, message: 'Erreur lors de l\'annulation', severity: 'error' });
    }
  };

  // Filtered requests
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      searchQuery === '' ||
      req.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    fulfilled: requests.filter((r) => r.status === 'FULFILLED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 2, md: 3 } }}>
        <Skeleton variant="rounded" height={160} sx={{ borderRadius: 4 }} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={90} sx={{ flex: 1, borderRadius: 3 }} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 4 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
      
      {/* 1. Hero Banner Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1A1A2E 0%, #2A1B28 50%, #7B0000 100%)',
        borderRadius: 4,
        p: { xs: 3, md: 4 },
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(227, 30, 36, 0.15)',
        border: '1px solid rgba(227, 30, 36, 0.25)',
      }}>
        {/* Glow Spheres */}
        <Box sx={{ position: 'absolute', top: -60, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.35) 0%, rgba(227,30,36,0) 70%)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: 180, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ maxWidth: 650 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.8, py: 0.6, borderRadius: 10, bgcolor: 'rgba(227, 30, 36, 0.25)', border: '1px solid rgba(227, 30, 36, 0.5)', mb: 1.5 }}>
              <SpeedIcon sx={{ fontSize: 16, color: '#FF8A80' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFCDD2', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Service IT • Parc Matériel Cathedis
              </Typography>
            </Box>
            
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', fontSize: { xs: '1.6rem', md: '2.1rem' }, letterSpacing: '-0.02em', mb: 1 }}>
              Demandes & Dotations d'Équipement 📦
            </Typography>
            
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Besoin d’un nouvel ordinateur, d'un moniteur additionnel ou d'accessoires pour votre poste ? Exprimez votre besoin en 1 clic pour traitement prioritaire.
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<FlashIcon />}
            onClick={() => { resetForm(); setDialogOpen(true); }}
            sx={{
              background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
              color: '#FFFFFF',
              borderRadius: 3,
              px: 3.5,
              py: 1.5,
              fontWeight: 800,
              fontSize: '0.95rem',
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(227, 30, 36, 0.45)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.25s',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 30px rgba(227, 30, 36, 0.65)',
                background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)',
              },
            }}
          >
            Faire une Demande
          </Button>
        </Box>
      </Box>

      {/* 2. Express Catalog Presets (1-Click Requests) */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 1 }}>
            ⚡ Catalogue Express • Besoins Fréquents
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            Cliquez pour pré-remplir votre demande
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
          {quickTemplates.map((template, idx) => (
            <Paper
              key={idx}
              onClick={() => handleOpenPreset(template)}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: '#E31E24',
                  boxShadow: '0 12px 25px rgba(227, 30, 36, 0.1)',
                  '& .icon-avatar': {
                    bgcolor: '#E31E24',
                    '& svg': { color: '#FFFFFF' }
                  },
                  '& .arrow-icon': {
                    transform: 'translateX(4px)',
                    color: '#E31E24',
                  }
                }
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Avatar
                  className="icon-avatar"
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: 'rgba(227, 30, 36, 0.08)',
                    mb: 1.5,
                    transition: 'all 0.25s',
                  }}
                >
                  {template.icon}
                </Avatar>
                <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '0.95rem', mb: 0.5 }}>
                  {template.title}
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: '0.8rem', lineHeight: 1.4 }}>
                  {template.description}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #F1F5F9' }}>
                <Chip
                  label={template.categoryName}
                  size="small"
                  sx={{ fontSize: '0.7rem', fontWeight: 700, bgcolor: '#F8FAFC', color: '#475569' }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94A3B8' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Demander</Typography>
                  <ArrowForwardIcon className="arrow-icon" sx={{ fontSize: 14, transition: 'transform 0.2s' }} />
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* 3. KPI Tracker Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {[
          { label: 'Total Demandes', count: stats.total, color: '#1A1A2E', bg: '#F8FAFC', border: '#E2E8F0', icon: <ComputerIcon /> },
          { label: 'En attente IT', count: stats.pending, color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', icon: <ScheduleIcon /> },
          { label: 'Approuvées', count: stats.approved, color: '#059669', bg: '#D1FAE5', border: '#A7F3D0', icon: <CheckCircleIcon /> },
          { label: 'Livrées & Prêtes', count: stats.fulfilled, color: '#2563EB', bg: '#DBEAFE', border: '#BFDBFE', icon: <LocalShippingIcon /> },
        ].map((item, idx) => (
          <Paper
            key={idx}
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: item.bg,
              border: `1px solid ${item.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                {item.label}
              </Typography>
              <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: item.color, lineHeight: 1.2, mt: 0.5 }}>
                {item.count}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.7)', color: item.color, width: 44, height: 44, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {item.icon}
            </Avatar>
          </Paper>
        ))}
      </Box>

      {/* 4. Filter & Search Controls */}
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
          placeholder="Rechercher par titre, description ou catégorie..."
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
            { id: 'ALL', label: 'Toutes' },
            { id: 'PENDING', label: 'En attente' },
            { id: 'APPROVED', label: 'Approuvées' },
            { id: 'FULFILLED', label: 'Livrées' },
            { id: 'REJECTED', label: 'Refusées' },
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
                '&:hover': {
                  bgcolor: statusFilter === f.id ? '#0F172A' : '#F1F5F9',
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* 5. Request Cards List */}
      {filteredRequests.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: 6,
            textAlign: 'center',
            bgcolor: '#FFFFFF',
            border: '2px dashed #E2E8F0',
          }}
        >
          <Avatar sx={{ width: 70, height: 70, bgcolor: 'rgba(227,30,36,0.08)', color: '#E31E24', mx: 'auto', mb: 2 }}>
            <ComputerIcon sx={{ fontSize: 36 }} />
          </Avatar>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#1A1A2E', mb: 0.5 }}>
            Aucune demande trouvée
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: '#64748B', maxWidth: 450, mx: 'auto', mb: 3 }}>
            Vous n'avez pas encore effectué de demande de matériel ou aucun résultat ne correspond à vos filtres.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { resetForm(); setDialogOpen(true); }}
            sx={{
              background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
              color: '#FFFFFF',
              borderRadius: 2.5,
              fontWeight: 800,
              px: 3,
              py: 1,
              textTransform: 'none',
            }}
          >
            Créer ma Première Demande
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {filteredRequests.map((req) => {
            const sc = statusConfig[req.status] || statusConfig.PENDING;
            const pc = priorityConfig[req.priority] || priorityConfig.MEDIUM;

            return (
              <Paper
                key={req.id}
                elevation={0}
                sx={{
                  borderRadius: 3.5,
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderLeft: `6px solid ${sc.color}`,
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
                    borderColor: sc.color,
                  },
                }}
              >
                <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                  {/* Top Row: Title, Badges, Actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: sc.bgColor, color: sc.color, width: 44, height: 44 }}>
                        {sc.icon}
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#1A1A2E' }}>
                            {req.title}
                          </Typography>
                          {req.quantity > 1 && (
                            <Chip
                              label={`Quantité: x${req.quantity}`}
                              size="small"
                              sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: '#F1F5F9', color: '#1E293B' }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                          Réf: REQ-{req.id.slice(-6).toUpperCase()} • Soumis le {new Date(req.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={sc.label}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          bgcolor: sc.bgColor,
                          color: sc.color,
                          border: `1px solid ${sc.borderColor}`,
                        }}
                      />
                      <Chip
                        label={`${pc.icon} ${pc.label}`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          bgcolor: pc.bgColor,
                          color: pc.color,
                        }}
                      />
                      {req.categoryName && (
                        <Chip
                          label={req.categoryName}
                          size="small"
                          sx={{ fontSize: '0.72rem', fontWeight: 600, bgcolor: '#F1F5F9', color: '#475569' }}
                        />
                      )}
                      {req.status === 'PENDING' && (
                        <Tooltip title="Annuler cette demande">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(req.id)}
                            sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  {/* Description & Justification */}
                  <Box sx={{ pl: { xs: 0, md: 7 }, mb: 2 }}>
                    <Typography sx={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.6, mb: 1 }}>
                      {req.description}
                    </Typography>

                    {req.reason && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748B', fontSize: '0.82rem', bgcolor: '#F8FAFC', p: 1.2, borderRadius: 2, border: '1px dashed #E2E8F0' }}>
                        <InfoIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                        <Typography sx={{ fontSize: '0.82rem' }}>
                          <strong>Justification :</strong> {req.reason}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Admin Response Box (if any) */}
                  {req.adminResponse && (
                    <Box sx={{
                      ml: { xs: 0, md: 7 },
                      mb: 2.5,
                      p: 2,
                      borderRadius: 2.5,
                      bgcolor: req.status === 'APPROVED' ? '#ECFDF5' : req.status === 'REJECTED' ? '#FEF2F2' : '#F8FAFC',
                      border: `1px solid ${req.status === 'APPROVED' ? '#A7F3D0' : req.status === 'REJECTED' ? '#FECACA' : '#E2E8F0'}`,
                      display: 'flex',
                      gap: 1.5,
                      alignItems: 'flex-start'
                    }}>
                      <Avatar sx={{
                        width: 32,
                        height: 32,
                        bgcolor: req.status === 'APPROVED' ? '#059669' : req.status === 'REJECTED' ? '#DC2626' : '#64748B',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}>
                        IT
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: req.status === 'APPROVED' ? '#065F46' : req.status === 'REJECTED' ? '#991B1B' : '#334155' }}>
                          Réponse de l'Administration IT {req.handledBy ? `(${req.handledBy})` : ''} :
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#1E293B', mt: 0.3 }}>
                          "{req.adminResponse}"
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* 4-Step Visual Timeline Progress Bar */}
                  <Box sx={{ pl: { xs: 0, md: 7 }, pt: 1.5, borderTop: '1px solid #F1F5F9' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                        Étape de traitement :
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: sc.color }}>
                        {sc.label}
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={sc.progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#F1F5F9',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: sc.color,
                          borderRadius: 3,
                        }
                      }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>1. Soumise 📨</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: req.status !== 'PENDING' ? '#059669' : '#94A3B8', fontWeight: 600 }}>2. Examen IT 🔍</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: (req.status === 'APPROVED' || req.status === 'FULFILLED') ? '#059669' : '#94A3B8', fontWeight: 600 }}>3. Validée 📦</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: req.status === 'FULFILLED' ? '#2563EB' : '#94A3B8', fontWeight: 600 }}>4. Livrée 🎉</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* 6. Modern New Request Dialog with Live Preview */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
            }
          }
        }}
      >
        <DialogTitle sx={{
          p: 3,
          background: 'linear-gradient(135deg, #1A1A2E 0%, #7B0000 100%)',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(227,30,36,0.3)', color: '#FFCDD2', width: 40, height: 40 }}>
              <FlashIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                Nouvelle Demande d'Équipement
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Remplissez les informations ci-dessous pour validation par le Support IT
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3.5, bgcolor: '#F8FAFC' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.35fr 1fr' }, gap: 3, mt: 0.5 }}>
            {/* Left Column: Form Controls */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Titre de la demande *"
                placeholder="ex: Ordinateur portable Dell Latitude pour télétravail"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <TextField
                label="Description détaillée du besoin *"
                placeholder="Précisez les caractéristiques souhaitées (ex: 16Go RAM, écran 15.6'', sacoche, souris...)"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Catégorie de matériel</InputLabel>
                  <Select
                    value={categoryId}
                    label="Catégorie de matériel"
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <MenuItem value="">Toutes catégories</MenuItem>
                    {categories.map((cat: any) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Quantité"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  sx={{ width: 130 }}
                  slotProps={{ input: { inputProps: { min: 1, max: 10 } } }}
                />
              </Box>

              {/* Priority Selector Pills */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 1 }}>
                  Niveau de Priorité / Urgence :
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                  {[
                    { id: 'LOW', label: 'Basse', color: '#0284C7', icon: '🟢' },
                    { id: 'MEDIUM', label: 'Normale', color: '#D97706', icon: '🟠' },
                    { id: 'HIGH', label: 'Haute', color: '#EA580C', icon: '🔴' },
                    { id: 'CRITICAL', label: 'Urgente', color: '#DC2626', icon: '⚡' },
                  ].map((p) => (
                    <Button
                      key={p.id}
                      variant={priority === p.id ? 'contained' : 'outlined'}
                      onClick={() => setPriority(p.id)}
                      sx={{
                        borderRadius: 2,
                        py: 1,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'none',
                        borderColor: '#CBD5E1',
                        color: priority === p.id ? '#FFFFFF' : '#334155',
                        bgcolor: priority === p.id ? p.color : '#FFFFFF',
                        '&:hover': {
                          bgcolor: priority === p.id ? p.color : '#F1F5F9',
                        }
                      }}
                    >
                      {p.icon} {p.label}
                    </Button>
                  ))}
                </Box>
              </Box>

              <TextField
                label="Justification professionnelle (optionnel)"
                placeholder="ex: Remplacement d'un équipement obsolète ou nouveau projet..."
                fullWidth
                multiline
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Box>

            {/* Right Column: Real-time Live Preview Card */}
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', textTransform: 'uppercase', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <InfoIcon sx={{ fontSize: 16 }} /> Aperçu en direct de votre demande
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  flex: 1,
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: '#FFFFFF',
                  border: '2px dashed #CBD5E1',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Chip
                      label={priorityConfig[priority]?.label || 'Normale'}
                      size="small"
                      sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: priorityConfig[priority]?.bgColor, color: priorityConfig[priority]?.color }}
                    />
                    {quantity > 1 && (
                      <Chip label={`x${quantity}`} size="small" sx={{ fontWeight: 800, bgcolor: '#F1F5F9' }} />
                    )}
                  </Box>

                  <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1rem', mb: 1 }}>
                    {title.trim() || 'Titre de votre demande...'}
                  </Typography>

                  <Typography sx={{ color: '#64748B', fontSize: '0.82rem', lineHeight: 1.5, mb: 1.5 }}>
                    {description.trim() || 'La description de votre besoin apparaîtra ici en temps réel...'}
                  </Typography>

                  {reason && (
                    <Typography sx={{ color: '#475569', fontSize: '0.78rem', bgcolor: '#F8FAFC', p: 1, borderRadius: 1.5 }}>
                      <strong>Motif :</strong> {reason}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ pt: 2, borderTop: '1px solid #F1F5F9' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                    Demandeur : <strong>{session?.user?.name || 'Employé'}</strong>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    Délai moyen de réponse : <strong>24h à 48h</strong>
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </DialogContent>

        <Box sx={{ p: 2.5, px: 3.5, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B', borderColor: '#CBD5E1' }}
          >
            Annuler
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || !title.trim() || !description.trim()}
            startIcon={saving ? undefined : <SendIcon />}
            sx={{
              background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
              borderRadius: 2.5,
              fontWeight: 800,
              px: 3.5,
              py: 1,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(227,30,36,0.3)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(227,30,36,0.45)',
                background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)',
              },
            }}
          >
            {saving ? 'Envoi en cours...' : 'Envoyer ma Demande'}
          </Button>
        </Box>
      </Dialog>

      {/* Snackbar Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2.5, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
