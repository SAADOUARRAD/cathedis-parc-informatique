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
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Skeleton,
  Avatar,
  IconButton,
  InputBase,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  SelectChangeEvent
} from '@mui/material';
import {
  Build,
  Search,
  FilterList,
  Edit,
  AttachMoney,
  Close as CloseIcon
} from '@mui/icons-material';
// Ensure next-auth or similar is used for session in your app if you use useSession.
import { useSession } from 'next-auth/react'; 

enum MaintenanceStatus {
  REPORTED = 'REPORTED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

enum MaintenanceType {
  CORRECTIVE = 'CORRECTIVE',
  PREVENTIVE = 'PREVENTIVE'
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
}

interface Maintenance {
  id: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  description: string;
  diagnosis?: string;
  solution?: string;
  cost?: number;
  reportedDate: string;
  startDate?: string;
  endDate?: string;
  equipment: Equipment;
  reportedBy: User;
  technician?: User;
}

const statusColors: Record<MaintenanceStatus, "default" | "error" | "info" | "success" | "warning"> = {
  REPORTED: 'error',
  ASSIGNED: 'info',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'default'
};

const statusLabels: Record<MaintenanceStatus, string> = {
  REPORTED: 'En Attente',
  ASSIGNED: 'Assignée',
  IN_PROGRESS: 'En Cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée'
};

const priorityColors: Record<MaintenancePriority, "default" | "error" | "info" | "success" | "warning"> = {
  LOW: 'info',
  MEDIUM: 'success',
  HIGH: 'warning',
  CRITICAL: 'error'
};

export default function TechnicianMaintenancesPage() {
  const { data: session } = useSession();
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<MaintenancePriority | 'ALL'>('ALL');

  // Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  
  // Edit Form State
  const [editStatus, setEditStatus] = useState<MaintenanceStatus>(MaintenanceStatus.REPORTED);
  const [editPriority, setEditPriority] = useState<MaintenancePriority>(MaintenancePriority.LOW);
  const [editDiagnosis, setEditDiagnosis] = useState('');
  const [editSolution, setEditSolution] = useState('');
  const [editCost, setEditCost] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);

  // Snackbar State
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchMaintenances = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/maintenances');
      if (res.ok) {
        const data = await res.json();
        setMaintenances(data);
      } else {
        throw new Error('Erreur lors du chargement des maintenances');
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Erreur lors du chargement', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const handleOpenEdit = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setEditStatus(maintenance.status);
    setEditPriority(maintenance.priority);
    setEditDiagnosis(maintenance.diagnosis || '');
    setEditSolution(maintenance.solution || '');
    setEditCost(maintenance.cost || '');
    setEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setSelectedMaintenance(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedMaintenance) return;
    setSaving(true);
    try {
      const payload = {
        status: editStatus,
        priority: editPriority,
        diagnosis: editDiagnosis,
        solution: editSolution,
        cost: editCost === '' ? undefined : Number(editCost)
      };

      const res = await fetch(`/api/maintenances/${selectedMaintenance.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSnackbar({ open: true, message: 'Maintenance mise à jour avec succès', severity: 'success' });
        handleCloseEdit();
        fetchMaintenances();
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Erreur lors de la mise à jour', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const filteredMaintenances = maintenances.filter((m) => {
    const matchesSearch = 
      m.equipment.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase()) ||
      (m.technician ? `${m.technician.firstName} ${m.technician.lastName}`.toLowerCase().includes(search.toLowerCase()) : false);
    
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || m.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#E31E24' }}>
            <Build />
          </Avatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1E293B' }}>
              Gestion des Maintenances
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              Interface Technicien
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9', borderRadius: 1, px: 2, py: 0.5, flexGrow: 1, maxWidth: '400px' }}>
          <Search sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase
            placeholder="Rechercher équipement, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FilterList sx={{ color: 'text.secondary' }} />
          <Chip 
            label="Toutes" 
            onClick={() => setStatusFilter('ALL')}
            color={statusFilter === 'ALL' ? 'primary' : 'default'}
            sx={{ bgcolor: statusFilter === 'ALL' ? '#E31E24' : undefined, color: statusFilter === 'ALL' ? 'white' : undefined }}
          />
          <Chip 
            label="En Attente" 
            onClick={() => setStatusFilter(MaintenanceStatus.REPORTED)}
            color={statusFilter === MaintenanceStatus.REPORTED ? 'primary' : 'default'}
          />
          <Chip 
            label="En Cours" 
            onClick={() => setStatusFilter(MaintenanceStatus.IN_PROGRESS)}
            color={statusFilter === MaintenanceStatus.IN_PROGRESS ? 'primary' : 'default'}
          />
          <Chip 
            label="Terminées" 
            onClick={() => setStatusFilter(MaintenanceStatus.COMPLETED)}
            color={statusFilter === MaintenanceStatus.COMPLETED ? 'primary' : 'default'}
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Priorité</InputLabel>
          <Select
            value={priorityFilter}
            label="Priorité"
            onChange={(e: SelectChangeEvent) => setPriorityFilter(e.target.value as MaintenancePriority | 'ALL')}
          >
            <MenuItem value="ALL">Toutes</MenuItem>
            <MenuItem value={MaintenancePriority.LOW}>Basse</MenuItem>
            <MenuItem value={MaintenancePriority.MEDIUM}>Moyenne</MenuItem>
            <MenuItem value={MaintenancePriority.HIGH}>Haute</MenuItem>
            <MenuItem value={MaintenancePriority.CRITICAL}>Critique</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell><Typography sx={{ fontWeight: 'bold', color: '#1E293B' }}>Équipement</Typography></TableCell>
              <TableCell><Typography sx={{ fontWeight: 'bold', color: '#1E293B' }}>Type</Typography></TableCell>
              <TableCell><Typography sx={{ fontWeight: 'bold', color: '#1E293B' }}>Statut</Typography></TableCell>
              <TableCell><Typography sx={{ fontWeight: 'bold', color: '#1E293B' }}>Priorité</Typography></TableCell>
              <TableCell><Typography sx={{ fontWeight: 'bold', color: '#1E293B' }}>Signalé le</Typography></TableCell>
              <TableCell align="right"><Typography sx={{ fontWeight: 'bold', color: '#1E293B' }}>Actions</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell align="right"><Skeleton variant="circular" width={40} height={40} sx={{ ml: 'auto' }} /></TableCell>
                </TableRow>
              ))
            ) : filteredMaintenances.length > 0 ? (
              filteredMaintenances.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontWeight: 'medium' }}>{m.equipment.name}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>SN: {m.equipment.serialNumber}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.875rem' }}>
                      {m.type === MaintenanceType.CORRECTIVE ? 'Corrective' : 'Préventive'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={statusLabels[m.status]} color={statusColors[m.status]} />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={m.priority} color={priorityColors[m.priority]} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontSize: '0.875rem' }}>{new Date(m.reportedDate).toLocaleDateString('fr-FR')}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>par {m.reportedBy.firstName} {m.reportedBy.lastName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(m)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: 'text.secondary' }}>Aucune maintenance trouvée.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editDialogOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold' }}>Mettre à jour la maintenance</Typography>
          <IconButton onClick={handleCloseEdit} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {selectedMaintenance && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
              <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>Description initiale :</Typography>
              <Typography sx={{ fontSize: '0.875rem', bgcolor: '#f1f5f9', p: 1, borderRadius: 1 }}>
                {selectedMaintenance.description}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Statut</InputLabel>
              <Select
                value={editStatus}
                label="Statut"
                onChange={(e: SelectChangeEvent) => setEditStatus(e.target.value as MaintenanceStatus)}
              >
                <MenuItem value={MaintenanceStatus.REPORTED}>{statusLabels[MaintenanceStatus.REPORTED]}</MenuItem>
                <MenuItem value={MaintenanceStatus.ASSIGNED}>{statusLabels[MaintenanceStatus.ASSIGNED]}</MenuItem>
                <MenuItem value={MaintenanceStatus.IN_PROGRESS}>{statusLabels[MaintenanceStatus.IN_PROGRESS]}</MenuItem>
                <MenuItem value={MaintenanceStatus.COMPLETED}>{statusLabels[MaintenanceStatus.COMPLETED]}</MenuItem>
                <MenuItem value={MaintenanceStatus.CANCELLED}>{statusLabels[MaintenanceStatus.CANCELLED]}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Priorité</InputLabel>
              <Select
                value={editPriority}
                label="Priorité"
                onChange={(e: SelectChangeEvent) => setEditPriority(e.target.value as MaintenancePriority)}
              >
                <MenuItem value={MaintenancePriority.LOW}>Basse</MenuItem>
                <MenuItem value={MaintenancePriority.MEDIUM}>Moyenne</MenuItem>
                <MenuItem value={MaintenancePriority.HIGH}>Haute</MenuItem>
                <MenuItem value={MaintenancePriority.CRITICAL}>Critique</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Diagnostic"
            multiline
            rows={3}
            value={editDiagnosis}
            onChange={(e) => setEditDiagnosis(e.target.value)}
            fullWidth
            slotProps={{
              inputLabel: { shrink: true }
            }}
          />

          <TextField
            label="Solution / Intervention"
            multiline
            rows={3}
            value={editSolution}
            onChange={(e) => setEditSolution(e.target.value)}
            fullWidth
            slotProps={{
              inputLabel: { shrink: true }
            }}
          />

          <TextField
            label="Coût estimé (€)"
            type="number"
            value={editCost}
            onChange={(e) => setEditCost(e.target.value ? Number(e.target.value) : '')}
            fullWidth
            slotProps={{
              input: { startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} /> }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseEdit} color="inherit">Annuler</Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained" 
            disabled={saving}
            sx={{ bgcolor: '#E31E24', '&:hover': { bgcolor: '#C41018' } }}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
