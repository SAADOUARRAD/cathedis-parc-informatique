"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, Select, MenuItem, FormControl, InputLabel, IconButton, Snackbar, Alert, Skeleton, CircularProgress, LinearProgress, Fade } from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, Inventory as InventoryIcon, CheckCircle as CheckCircleIcon, PlayArrow as PlayArrowIcon, Stop as StopIcon, AssignmentTurnedIn as AssignmentIcon } from '@mui/icons-material';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormDialog from '@/components/shared/FormDialog';
import StatusChip from '@/components/shared/StatusChip';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// --- Zod schemas ---
const createInventorySchema = z.object({
  name: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
  description: z.string().optional(),
  startDate: z.string().optional(),
});
type CreateInventoryInput = z.infer<typeof createInventorySchema>;

// --- Constants ---
const INVENTORY_STATUS_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  PLANNED: { label: "Planifiée", color: "#1E88E5", bgColor: "#E3F2FD" },
  IN_PROGRESS: { label: "En cours", color: "#FB8C00", bgColor: "#FFF3E0" },
  COMPLETED: { label: "Terminée", color: "#43A047", bgColor: "#E8F5E9" },
  CANCELLED: { label: "Annulée", color: "#757575", bgColor: "#F5F5F5" },
};

const ITEM_STATUS_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  FOUND: { label: "Trouvé", color: "#43A047", bgColor: "#E8F5E9" },
  NOT_FOUND: { label: "Non trouvé", color: "#E53935", bgColor: "#FFEBEE" },
  SURPLUS: { label: "Surplus", color: "#1E88E5", bgColor: "#E3F2FD" },
  DAMAGED: { label: "Endommagé", color: "#FB8C00", bgColor: "#FFF3E0" },
};

export default function InventoriesDashboard() {
  // State
  const [inventories, setInventories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'info' });

  // Dialogs state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const [inventoryDetails, setInventoryDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const [addEquipmentDialogOpen, setAddEquipmentDialogOpen] = useState(false);

  // Stats
  const stats = {
    total: inventories.length,
    planned: inventories.filter(i => i.status === 'PLANNED').length,
    inProgress: inventories.filter(i => i.status === 'IN_PROGRESS').length,
    completed: inventories.filter(i => i.status === 'COMPLETED').length,
  };

  // Forms
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateInventoryInput>({
    resolver: zodResolver(createInventorySchema)
  });

  const { register: registerAddEq, handleSubmit: handleSubmitAddEq, reset: resetAddEq, formState: { errors: addEqErrors, isSubmitting: isSubmittingAddEq } } = useForm({
    defaultValues: { equipmentId: '', status: 'FOUND', notes: '' }
  });

  // Fetch lists
  const fetchInventories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventories');
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setInventories(data);
    } catch (err: any) {
      setErrorMsg(err.message);
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
      if (!res.ok) throw new Error("Erreur de chargement des détails");
      const data = await res.json();
      setInventoryDetails(data);
    } catch (err: any) {
      showSnackbar(err.message, 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Handlers
  const handleCreate = async (data: CreateInventoryInput) => {
    try {
      const res = await fetch('/api/inventories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur lors de la création");
      showSnackbar("Session d'inventaire créée avec succès", 'success');
      setCreateDialogOpen(false);
      reset();
      fetchInventories();
    } catch (err: any) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleAction = async (id: string, action: string, actionData: any = {}) => {
    try {
      const res = await fetch(`/api/inventories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...actionData }),
      });
      if (!res.ok) throw new Error("Action échouée");
      
      const resData = await res.json();
      
      if (action === 'auto-populate') {
        showSnackbar(`${resData.count} équipements ajoutés`, 'success');
      } else {
        showSnackbar("Action effectuée", 'success');
      }
      
      fetchInventories();
      if (detailDialogOpen && id === selectedInventoryId) {
        fetchInventoryDetails(id);
      }
    } catch (err: any) {
      showSnackbar(err.message, 'error');
    }
  };

  const openDetails = (id: string) => {
    setSelectedInventoryId(id);
    setDetailDialogOpen(true);
    fetchInventoryDetails(id);
  };

  // Columns for main table
  const columns = [
    { key: 'name', label: "Nom de la session", sortable: true },
    { 
      key: 'status', 
      label: "Statut", 
      render: (item: any) => <StatusChip status={item.status} statusMap={INVENTORY_STATUS_MAP} />
    },
    { 
      key: 'itemCount', 
      label: "Équipements", 
      render: (item: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ bgcolor: 'action.selected', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem' }}>
            {item._count?.items || 0}
          </Box>
        </Box>
      )
    },
    { 
      key: 'createdBy', 
      label: "Créé par", 
      render: (item: any) => `${item.createdBy?.firstName || ''} ${item.createdBy?.lastName || ''}`
    },
    { 
      key: 'startDate', 
      label: "Début", 
      render: (item: any) => item.startDate ? new Date(item.startDate).toLocaleDateString("fr-FR") : '-'
    },
    { 
      key: 'endDate', 
      label: "Fin", 
      render: (item: any) => item.endDate ? new Date(item.endDate).toLocaleDateString("fr-FR") : '-'
    },
    {
      key: 'actions',
      label: "Actions",
      render: (item: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {item.status === 'PLANNED' && (
            <>
              <Button size="small" variant="contained" color="primary" onClick={() => handleAction(item.id, 'start')}>Démarrer</Button>
              <Button size="small" variant="outlined" color="info" onClick={() => openDetails(item.id)}>Ouvrir</Button>
            </>
          )}
          {item.status === 'IN_PROGRESS' && (
            <>
              <Button size="small" variant="contained" color="success" onClick={() => handleAction(item.id, 'complete')}>Terminer</Button>
              <Button size="small" variant="outlined" color="info" onClick={() => openDetails(item.id)}>Ouvrir</Button>
            </>
          )}
          {item.status === 'COMPLETED' && (
            <Button size="small" variant="outlined" color="info" onClick={() => openDetails(item.id)}>Voir résultats</Button>
          )}
          {item.status === 'CANCELLED' && (
            <Button size="small" variant="outlined" color="inherit" onClick={() => openDetails(item.id)}>Ouvrir</Button>
          )}
        </Box>
      )
    }
  ];

  // Columns for detail table
  const detailColumns = [
    { 
      key: 'equipment', 
      label: "Équipement", 
      render: (item: any) => item.equipment?.name || 'Inconnu'
    },
    { 
      key: 'invNumber', 
      label: "N° Inventaire", 
      render: (item: any) => item.equipment?.inventoryNumber || '-'
    },
    { 
      key: 'status', 
      label: "Statut", 
      render: (item: any) => (
        <Select
          size="small"
          value={item.status}
          onChange={(e) => handleAction(selectedInventoryId!, 'update-item', { itemId: item.id, itemStatus: e.target.value })}
          sx={{ minWidth: 120 }}
          disabled={inventoryDetails?.status !== 'IN_PROGRESS'}
        >
          {Object.entries(ITEM_STATUS_MAP).map(([key, val]) => (
            <MenuItem key={key} value={key}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: val.color }} />
                {val.label}
              </Box>
            </MenuItem>
          ))}
        </Select>
      )
    },
    { key: 'notes', label: "Notes", render: (item: any) => item.notes || '-' },
    { 
      key: 'scannedAt', 
      label: "Scanné le", 
      render: (item: any) => item.scannedAt ? new Date(item.scannedAt).toLocaleDateString("fr-FR") : '-'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Gestion des Inventaires"
        subtitle="Suivez et réalisez vos sessions d'inventaire"
        actionLabel="Nouvelle Session"
        actionIcon={<AddIcon />}
        onAction={() => setCreateDialogOpen(true)}
      />

      {/* Stats Row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        {[
          { label: "Total Sessions", value: stats.total, color: "text.secondary" },
          { label: "Planifiées", value: stats.planned, color: "#1E88E5" },
          { label: "En cours", value: stats.inProgress, color: "#FB8C00" },
          { label: "Terminées", value: stats.completed, color: "#43A047" },
        ].map((stat, idx) => (
          <Card key={idx} sx={{ flex: '1 1 200px', borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{stat.label}</Typography>
              <Typography variant="h4" sx={{ color: stat.color, fontWeight: 700 }}>{stat.value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Main Data Table */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <Box sx={{ p: 4 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} height={60} sx={{ mb: 1 }} />)}
          </Box>
        ) : (
          <DataTable
            data={inventories}
            columns={columns}
          />
        )}
      </Card>

      {/* Create Dialog */}
      <FormDialog
        open={createDialogOpen}
        title="Nouvelle Session d'Inventaire"
        onClose={() => { setCreateDialogOpen(false); reset(); }}
        onSubmit={handleSubmit(handleCreate)}
        loading={isSubmitting}
        submitLabel="Créer"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Nom de la session"
            fullWidth
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            {...register('description')}
          />
          <TextField
            label="Date de début prévue"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('startDate')}
          />
        </Box>
      </FormDialog>

      {/* Detail Dialog */}
      <FormDialog
        open={detailDialogOpen}
        title={`Détail de l'Inventaire: ${inventoryDetails?.name || ''}`}
        onClose={() => { setDetailDialogOpen(false); setInventoryDetails(null); }}
        maxWidth="lg"
        submitLabel="Fermer"
        onSubmit={async () => { setDetailDialogOpen(false); setInventoryDetails(null); }}
      >
        {loadingDetails || !inventoryDetails ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Fade in={true}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Summary Bar */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', bgcolor: 'background.default', p: 2, borderRadius: 2 }}>
                <Box sx={{ flex: 1, textAlign: 'center', borderRight: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">Total</Typography>
                  <Typography variant="h6">{inventoryDetails.stats.totalItems}</Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center', borderRight: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="#43A047">Trouvés</Typography>
                  <Typography variant="h6" sx={{ color: '#43A047' }}>{inventoryDetails.stats.found}</Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center', borderRight: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="#E53935">Non trouvés</Typography>
                  <Typography variant="h6" sx={{ color: '#E53935' }}>{inventoryDetails.stats.notFound}</Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center', borderRight: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="#1E88E5">Surplus</Typography>
                  <Typography variant="h6" sx={{ color: '#1E88E5' }}>{inventoryDetails.stats.surplus}</Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography variant="caption" color="#FB8C00">Endommagés</Typography>
                  <Typography variant="h6" sx={{ color: '#FB8C00' }}>{inventoryDetails.stats.damaged}</Typography>
                </Box>
              </Box>

              {/* Progress Bar */}
              {inventoryDetails.stats.totalItems > 0 && (
                <Box sx={{ width: '100%', display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                  <Box sx={{ width: `${(inventoryDetails.stats.found / inventoryDetails.stats.totalItems) * 100}%`, bgcolor: '#43A047' }} />
                  <Box sx={{ width: `${(inventoryDetails.stats.notFound / inventoryDetails.stats.totalItems) * 100}%`, bgcolor: '#E53935' }} />
                  <Box sx={{ width: `${(inventoryDetails.stats.surplus / inventoryDetails.stats.totalItems) * 100}%`, bgcolor: '#1E88E5' }} />
                  <Box sx={{ width: `${(inventoryDetails.stats.damaged / inventoryDetails.stats.totalItems) * 100}%`, bgcolor: '#FB8C00' }} />
                </Box>
              )}

              {/* Actions */}
              {inventoryDetails.status === 'IN_PROGRESS' && (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<AssignmentIcon />} 
                    onClick={() => handleAction(inventoryDetails.id, 'auto-populate')}
                  >
                    Peupler auto
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => setAddEquipmentDialogOpen(true)}
                  >
                    Ajouter équipement
                  </Button>
                </Box>
              )}

              {/* Items Table */}
              <DataTable
                data={inventoryDetails.items}
                columns={detailColumns}
              />
            </Box>
          </Fade>
        )}
      </FormDialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
