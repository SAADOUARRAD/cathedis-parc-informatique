'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Skeleton,
  Avatar,
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
  InputAdornment,
  Tooltip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Build as BuildIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  FlashOn as FlashIcon,
  Search as SearchIcon,
  Computer as ComputerIcon,
  LaptopMac as LaptopIcon,
  DesktopWindows as MonitorIcon,
  SupportAgent as SupportAgentIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  ReportProblem as ReportProblemIcon,
  ArrowForward as ArrowForwardIcon,
  AutoAwesome as SparklesIcon,
  Psychology as BrainIcon
} from '@mui/icons-material';
import AIDiagnosticModal from '@/components/shared/AIDiagnosticModal';

const statusConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string; progress: number; icon: React.ReactNode }> = {
  REPORTED: {
    label: 'Signalé • En attente d\'attribution IT',
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A',
    progress: 25,
    icon: <ScheduleIcon sx={{ fontSize: 18, color: '#D97706' }} />
  },
  ASSIGNED: {
    label: 'Assigné au Technicien',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    borderColor: '#BFDBFE',
    progress: 55,
    icon: <SupportAgentIcon sx={{ fontSize: 18, color: '#2563EB' }} />
  },
  IN_PROGRESS: {
    label: 'En cours de réparation',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    progress: 80,
    icon: <BuildIcon sx={{ fontSize: 18, color: '#7C3AED' }} />
  },
  COMPLETED: {
    label: 'Réparé & Résolu',
    color: '#059669',
    bgColor: '#D1FAE5',
    borderColor: '#A7F3D0',
    progress: 100,
    icon: <CheckCircleIcon sx={{ fontSize: 18, color: '#059669' }} />
  },
  CANCELLED: {
    label: 'Annulé',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#FECACA',
    progress: 100,
    icon: <ErrorIcon sx={{ fontSize: 18, color: '#DC2626' }} />
  },
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  LOW: { label: 'Basse (Gêne mineure)', color: '#0284C7', bgColor: '#E0F2FE', icon: '🟢' },
  MEDIUM: { label: 'Normale (Panne partielle)', color: '#D97706', bgColor: '#FEF3C7', icon: '🟠' },
  HIGH: { label: 'Haute (Travail impacté)', color: '#EA580C', bgColor: '#FFEDD5', icon: '🔴' },
  CRITICAL: { label: 'Urgente (Blocage total)', color: '#DC2626', bgColor: '#FEE2E2', icon: '⚡' },
};

export default function MesTicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [myEquipments, setMyEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // AI Diagnostic Modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // New Ticket Modal state (classic fallback)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard/employee-stats');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.recentMaintenances || []);
        const eqList = data.myEquipments || data.myEquipment || [];
        setMyEquipments(eqList);
        if (eqList.length > 0 && !selectedEquipmentId) {
          setSelectedEquipmentId(eqList[0].id || eqList[0].equipment?.id);
        }
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = () => {
    // Directly launch the intelligent AI Auto-Diagnostic workflow!
    setAiModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 10) {
      setSnackbar({ open: true, message: 'La description doit comporter au moins 10 caractères.', severity: 'error' });
      return;
    }
    if (!selectedEquipmentId) {
      setSnackbar({ open: true, message: 'Veuillez sélectionner un équipement.', severity: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/maintenances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: selectedEquipmentId,
          description,
          priority,
          reportedById: session?.user?.id
        })
      });

      if (res.ok) {
        setSnackbar({ open: true, message: 'Ticket de maintenance créé et transmis au Support IT !', severity: 'success' });
        setDialogOpen(false);
        setDescription('');
        fetchData();
      } else {
        setSnackbar({ open: true, message: 'Erreur lors de la création du ticket.', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Erreur réseau lors de la transmission.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getEquipmentIcon = (categoryName?: string) => {
    const cat = categoryName?.toLowerCase() || '';
    if (cat.includes('laptop') || cat.includes('portable')) return <LaptopIcon sx={{ fontSize: 24, color: '#E31E24' }} />;
    if (cat.includes('écran') || cat.includes('ecran') || cat.includes('moniteur')) return <MonitorIcon sx={{ fontSize: 24, color: '#E31E24' }} />;
    return <ComputerIcon sx={{ fontSize: 24, color: '#E31E24' }} />;
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      searchQuery === '' ||
      t.equipmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.solution?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && t.status !== 'COMPLETED' && t.status !== 'CANCELLED') ||
      (statusFilter === 'COMPLETED' && t.status === 'COMPLETED') ||
      (statusFilter === 'CRITICAL' && (t.priority === 'HIGH' || t.priority === 'CRITICAL'));

    return matchesSearch && matchesStatus;
  });

  const pendingCount = tickets.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
  const completedCount = tickets.filter(t => t.status === 'COMPLETED').length;
  const criticalCount = tickets.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 1.5, md: 3 } }}>
        <Skeleton variant="rounded" height={160} sx={{ borderRadius: 4 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
      
      {/* 1. Hero Banner */}
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
        <Box sx={{ position: 'absolute', top: -50, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.35) 0%, rgba(227,30,36,0) 70%)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: 200, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ maxWidth: 650 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.8, py: 0.6, borderRadius: 10, bgcolor: 'rgba(227, 30, 36, 0.25)', border: '1px solid rgba(227, 30, 36, 0.5)', mb: 1.5 }}>
              <SupportAgentIcon sx={{ fontSize: 16, color: '#FF8A80' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFCDD2', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Support & Maintenance Informatique • Cathedis
              </Typography>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', fontSize: { xs: '1.6rem', md: '2.1rem' }, letterSpacing: '-0.02em', mb: 1 }}>
              Mes Tickets de Maintenance 🛠️
            </Typography>

            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Un problème avec votre ordinateur, votre écran ou vos accessoires ? Signalez l'incident ici et suivez l'intervention du technicien IT en direct jusqu'à la résolution.
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<FlashIcon />}
            onClick={handleOpenDialog}
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
            Signaler une Panne
          </Button>
        </Box>
      </Box>

      {/* 2. KPI Metrics Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2.5 }}>
        {[
          { label: 'En Traitement / Attente', count: pendingCount, color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', icon: <ScheduleIcon /> },
          { label: 'Résolus & Réparés', count: completedCount, color: '#059669', bg: '#D1FAE5', border: '#A7F3D0', icon: <CheckCircleIcon /> },
          { label: 'Priorité Haute / Critique', count: criticalCount, color: '#DC2626', bg: '#FEE2E2', border: '#FECACA', icon: <WarningIcon /> },
        ].map((item, idx) => (
          <Paper
            key={idx}
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
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
              <Typography sx={{ fontSize: '1.9rem', fontWeight: 900, color: item.color, lineHeight: 1.2, mt: 0.5 }}>
                {item.count}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.8)', color: item.color, width: 46, height: 46, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {item.icon}
            </Avatar>
          </Paper>
        ))}
      </Box>

      {/* 3. Search & Filter Bar */}
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
          placeholder="Rechercher équipement, panne, diagnostic..."
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
            { id: 'ALL', label: 'Tous les tickets' },
            { id: 'PENDING', label: 'En traitement ⏳' },
            { id: 'COMPLETED', label: 'Résolus ✅' },
            { id: 'CRITICAL', label: 'Urgents ⚡' },
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
                '&:hover': { bgcolor: statusFilter === f.id ? '#0F172A' : '#F1F5F9' }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* 4. Tickets List */}
      {filteredTickets.length === 0 ? (
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
          <Avatar sx={{ width: 70, height: 70, bgcolor: 'rgba(5, 150, 105, 0.08)', color: '#059669', mx: 'auto', mb: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#1A1A2E', mb: 0.5 }}>
            Aucun incident en cours • Tout fonctionne !
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: '#64748B', maxWidth: 450, mx: 'auto', mb: 3 }}>
            Vous n'avez aucun ticket de maintenance en attente. Si vous constatez une anomalie, cliquez ci-dessous pour alerter les techniciens.
          </Typography>
          <Button
            variant="contained"
            startIcon={<FlashIcon />}
            onClick={handleOpenDialog}
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
            Signaler une Panne
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {filteredTickets.map((ticket: any, idx: number) => {
            const sc = statusConfig[ticket.status] || statusConfig.REPORTED;
            const pc = priorityConfig[ticket.priority] || priorityConfig.MEDIUM;

            return (
              <Paper
                key={ticket.id || idx}
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
                  {/* Top Header: Equipment, Badges */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: sc.bgColor, color: sc.color, width: 44, height: 44 }}>
                        {sc.icon}
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#1A1A2E' }}>
                            {ticket.equipmentName}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                          Réf: TCK-{ticket.id ? ticket.id.slice(-6).toUpperCase() : 'INC'} • Signalé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
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
                    </Box>
                  </Box>

                  {/* Description of anomaly */}
                  <Box sx={{ pl: { xs: 0, md: 7 }, mb: 2 }}>
                    <Typography sx={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.6, bgcolor: '#F8FAFC', p: 1.8, borderRadius: 2.5, border: '1px solid #F1F5F9' }}>
                      <strong>Description de la panne :</strong> {ticket.description || 'Aucune description fournie.'}
                    </Typography>
                  </Box>

                  {/* Diagnosis & Solution (if resolved) */}
                  {(ticket.diagnosis || ticket.solution) && (
                    <Box sx={{
                      ml: { xs: 0, md: 7 },
                      mb: 2,
                      p: 2,
                      borderRadius: 2.5,
                      bgcolor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <CheckCircleIcon sx={{ fontSize: 18, color: '#059669' }} />
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#065F46' }}>
                          Diagnostic & Solution Appliquée par le Support Technique :
                        </Typography>
                      </Box>
                      {ticket.diagnosis && (
                        <Typography sx={{ fontSize: '0.82rem', color: '#1E293B', ml: 3 }}>
                          • <strong>Diagnostic :</strong> {ticket.diagnosis}
                        </Typography>
                      )}
                      {ticket.solution && (
                        <Typography sx={{ fontSize: '0.82rem', color: '#1E293B', ml: 3, mt: 0.3 }}>
                          • <strong>Solution :</strong> {ticket.solution}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* 3-Step Lifecycle Stepper */}
                  <Box sx={{ pl: { xs: 0, md: 7 }, pt: 1.5, borderTop: '1px solid #F1F5F9' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                        Progression de l'intervention :
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
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>1. Signalé 📨</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: ticket.status !== 'REPORTED' ? '#2563EB' : '#94A3B8', fontWeight: 600 }}>2. Assigné IT 👑</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: ticket.status === 'IN_PROGRESS' || ticket.status === 'COMPLETED' ? '#7C3AED' : '#94A3B8', fontWeight: 600 }}>3. En réparation ⚙️</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: ticket.status === 'COMPLETED' ? '#059669' : '#94A3B8', fontWeight: 600 }}>4. Réparé 🎉</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* 5. Dialog: Signaler un Problème */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3.5, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1A1A2E 0%, #7B0000 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 2.5
        }}>
          <ReportProblemIcon sx={{ color: '#FF8A80' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Signaler un Problème / Panne Matérielle
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Les techniciens Cathedis seront alertés immédiatement
            </Typography>
          </Box>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 3, pt: 3.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth required>
              <InputLabel>Équipement concerné</InputLabel>
              <Select
                value={selectedEquipmentId}
                label="Équipement concerné"
                onChange={(e) => setSelectedEquipmentId(e.target.value)}
              >
                {myEquipments.map((item: any) => {
                  const eq = item.equipment || item;
                  return (
                    <MenuItem key={eq.id || item.id} value={eq.id || item.id}>
                      {eq.name} (SN: {eq.serialNumber || '-'})
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 1 }}>
                Niveau d'Urgence :
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
              label="Description détaillée de l'anomalie *"
              placeholder="Décrivez précisément ce qui ne fonctionne pas (ex: l'écran ne s'allume plus, la batterie ne charge pas, problème de clavier...)"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              helperText={`${description.length}/10 caractères minimum`}
              error={description.length > 0 && description.length < 10}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, color: '#64748B', borderColor: '#CBD5E1' }}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={submitting || description.trim().length < 10 || !selectedEquipmentId}
              variant="contained"
              sx={{
                background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                borderRadius: 2,
                px: 3.5,
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(227,30,36,0.3)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)',
                }
              }}
            >
              {submitting ? 'Envoi...' : 'Transmettre au Support IT'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 🤖 AI Diagnostic Modal */}
      <AIDiagnosticModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        equipments={myEquipments.map((a: any) => {
          const eq = a.equipment || a;
          return {
            id: eq.id,
            name: eq.name,
            serialNumber: eq.serialNumber,
            category: eq.category,
          };
        })}
        userId={session?.user?.id}
        onTicketCreated={() => {
          setSnackbar({ open: true, message: "Votre ticket a été transmis au Support Technique !", severity: "success" });
          fetchData();
        }}
      />

      {/* 6. Snackbar Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity as any}
          sx={{ width: '100%', borderRadius: 2.5, fontWeight: 700 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
