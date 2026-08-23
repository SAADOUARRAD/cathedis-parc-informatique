'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Box, Typography, Paper, Chip, Avatar, Skeleton, Button, 
  Dialog, DialogTitle, DialogContent, TextField, Snackbar, 
  Alert, DialogActions, CircularProgress 
} from '@mui/material';
import { 
  Build, Schedule, CheckCircle, Warning, Computer, 
  PlayArrow, Done, Assessment, MonetizationOn 
} from '@mui/icons-material';

interface Maintenance {
  id: string;
  type: string;
  status: 'REPORTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
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
    serialNumber: string;
  };
  reportedBy: {
    firstName: string;
    lastName: string;
  };
}

interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
  status: string;
}

interface DashboardStats {
  ticketsToProcess: number;
  inProgress: number;
  highPriority: number;
  resolvedThisMonth: number;
  activeMaintenances: Maintenance[];
  brokenEquipment: Equipment[];
}

export default function TechnicianDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [solution, setSolution] = useState('');
  const [cost, setCost] = useState<number | ''>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/dashboard/technician-stats');
      if (!response.ok) throw new Error('Erreur lors du chargement des données');
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRepair = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/maintenances/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' })
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      setSnackbar({ open: true, message: 'Réparation démarrée', severity: 'success' });
      fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalizeRepairClick = (m: Maintenance) => {
    setSelectedMaintenance(m);
    setDiagnosis(m.diagnosis || '');
    setSolution(m.solution || '');
    setCost(m.cost || '');
    setOpenDialog(true);
  };

  const handleFinalizeSubmit = async () => {
    if (!selectedMaintenance) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/maintenances/${selectedMaintenance.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED', diagnosis, solution, cost: Number(cost) || 0 })
      });
      if (!res.ok) throw new Error('Erreur lors de la finalisation');
      setSnackbar({ open: true, message: 'Réparation finalisée avec succès', severity: 'success' });
      setOpenDialog(false);
      fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setSelectedMaintenance(null);
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
        <Box sx={{ display: 'flex', gap: 2 }}>
           {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" height={120} sx={{ flex: 1, borderRadius: 2 }} />)}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Welcome Header */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: 3, 
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 50%, #FFEAEA 100%)', 
        borderLeft: '6px solid #E31E24',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', color: '#1E293B', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Build sx={{ color: '#E31E24' }} /> Espace Technique 🛠️
            </Typography>
            <Typography sx={{ color: '#64748B', fontWeight: 500 }}>
              Bienvenue, {session?.user?.name || 'Technicien'} • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: '#E31E24', width: 64, height: 64 }}>
             <Build fontSize="large" />
          </Avatar>
        </Box>
      </Paper>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <StatCard title="Tickets à Traiter" count={stats?.ticketsToProcess || 0} icon={<Build />} color="#E31E24" />
        <StatCard title="En Cours de Réparation" count={stats?.inProgress || 0} icon={<Schedule />} color="#9C27B0" />
        <StatCard title="Haute Priorité" count={stats?.highPriority || 0} icon={<Warning />} color="#F44336" />
        <StatCard title="Résolus ce mois" count={stats?.resolvedThisMonth || 0} icon={<CheckCircle />} color="#4CAF50" />
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Maintenances List */}
        <Box sx={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment sx={{ color: '#E31E24' }} /> Maintenances en Cours & Assignées
          </Typography>
          {stats?.activeMaintenances?.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, color: '#64748B' }}>
              <Typography sx={{ fontWeight: 500 }}>Aucune maintenance en cours.</Typography>
            </Paper>
          ) : (
            stats?.activeMaintenances?.map(maintenance => (
              <Paper key={maintenance.id} sx={{ p: 3, borderRadius: 2, borderLeft: `4px solid ${getStatusColor(maintenance.status)}`, display: 'flex', flexDirection: 'column', gap: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>
                        {maintenance.equipment.name}
                      </Typography>
                      <Chip label={maintenance.equipment.serialNumber} size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 600 }} />
                      <Chip label={maintenance.priority} size="small" sx={{ fontWeight: 700, color: '#FFF', bgcolor: getPriorityColor(maintenance.priority) }} />
                    </Box>
                    <Typography sx={{ color: '#475569', fontSize: '0.9rem', mb: 1 }}>
                      Signalé par : <Box component="span" sx={{ fontWeight: 600 }}>{maintenance.reportedBy.firstName} {maintenance.reportedBy.lastName}</Box>
                    </Typography>
                    <Typography sx={{ color: '#334155', bgcolor: '#F8FAFC', p: 1.5, borderRadius: 1, fontSize: '0.95rem' }}>
                      {maintenance.description}
                    </Typography>
                  </Box>
                  <Chip label={formatStatus(maintenance.status)} sx={{ fontWeight: 600, color: getStatusColor(maintenance.status), bgcolor: `${getStatusColor(maintenance.status)}15` }} />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                  {(maintenance.status === 'REPORTED' || maintenance.status === 'ASSIGNED') && (
                    <Button 
                      variant="contained" 
                      startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                      onClick={() => handleStartRepair(maintenance.id)}
                      disabled={actionLoading}
                      sx={{ bgcolor: '#E31E24', '&:hover': { bgcolor: '#C41018' }, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                    >
                      Prendre en charge
                    </Button>
                  )}
                  {maintenance.status === 'IN_PROGRESS' && (
                    <Button 
                      variant="contained" 
                      startIcon={<Done />}
                      onClick={() => handleFinalizeRepairClick(maintenance)}
                      disabled={actionLoading}
                      sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                    >
                      Finaliser la réparation
                    </Button>
                  )}
                </Box>
              </Paper>
            ))
          )}
        </Box>

        {/* Broken Equipment */}
        <Box sx={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Computer sx={{ color: '#F44336' }} /> Équipements Actuellement en Panne
          </Typography>
          {stats?.brokenEquipment?.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, color: '#64748B' }}>
              <Typography sx={{ fontWeight: 500 }}>Tous les équipements sont opérationnels.</Typography>
            </Paper>
          ) : (
            stats?.brokenEquipment?.map(eq => (
              <Paper key={eq.id} sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#FEE2E2', color: '#EF4444' }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>{eq.name}</Typography>
                  <Typography sx={{ color: '#64748B', fontSize: '0.85rem' }}>N/S: {eq.serialNumber}</Typography>
                </Box>
              </Paper>
            ))
          )}
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={closeDialog} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Done sx={{ color: '#10B981' }} /> Finaliser la Réparation
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <TextField
            label="Diagnostic"
            multiline
            rows={3}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            fullWidth
            slotProps={{
              inputLabel: { sx: { color: '#64748B' } }
            }}
          />
          <TextField
            label="Solution Appliquée"
            multiline
            rows={3}
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            fullWidth
            slotProps={{
              inputLabel: { sx: { color: '#64748B' } }
            }}
          />
          <TextField
            label="Coût (MAD)"
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value ? Number(e.target.value) : '')}
            fullWidth
            slotProps={{
              input: {
                startAdornment: <MonetizationOn sx={{ color: '#64748B', mr: 1 }} />
              },
              inputLabel: { sx: { color: '#64748B' } }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={closeDialog} sx={{ color: '#64748B', fontWeight: 600, textTransform: 'none' }}>
            Annuler
          </Button>
          <Button 
            onClick={handleFinalizeSubmit} 
            variant="contained" 
            disabled={actionLoading || !diagnosis || !solution}
            sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            {actionLoading ? <CircularProgress size={24} color="inherit" /> : 'Valider'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2, fontWeight: 500 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function StatCard({ title, count, icon, color }: { title: string, count: number, icon: React.ReactNode, color: string }) {
  return (
    <Paper sx={{ p: 3, flex: '1 1 200px', borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.95rem' }}>{title}</Typography>
        <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 48, height: 48 }}>
          {icon}
        </Avatar>
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: '2rem', color: '#1E293B' }}>
        {count}
      </Typography>
    </Paper>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'REPORTED': return '#F59E0B';
    case 'ASSIGNED': return '#3B82F6';
    case 'IN_PROGRESS': return '#8B5CF6';
    case 'COMPLETED': return '#10B981';
    default: return '#94A3B8';
  }
}

function formatStatus(status: string) {
  switch (status) {
    case 'REPORTED': return 'Signalé';
    case 'ASSIGNED': return 'Assigné';
    case 'IN_PROGRESS': return 'En Cours';
    case 'COMPLETED': return 'Terminé';
    default: return status;
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'CRITICAL':
    case 'HIGH': return '#EF4444';
    case 'MEDIUM': return '#F59E0B';
    case 'LOW': return '#3B82F6';
    default: return '#94A3B8';
  }
}
