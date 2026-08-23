'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Snackbar, Alert, TextField, Skeleton, IconButton, MenuItem, Select, FormControl, InputLabel, InputAdornment, Dialog, DialogTitle, DialogContent, Chip, CircularProgress } from '@mui/material';
import { Devices as DevicesIcon, CheckCircle as AvailableIcon, AssignmentInd as AssignedIcon, Build as MaintenanceIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, History as HistoryIcon, QrCode2 as QrCodeIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormDialog from '@/components/shared/FormDialog';
import StatusChip from '@/components/shared/StatusChip';
import AssetTagQRModal from '@/components/shared/AssetTagQRModal';

const schema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  serialNumber: z.string().optional(),
  categoryId: z.string().min(1, "Catégorie requise"),
  supplierId: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'DECOMMISSIONED']),
  price: z.coerce.number().optional(),
  purchaseDate: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EquipmentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyEquipment, setHistoryEquipment] = useState<string>('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrEquipment, setSelectedQrEquipment] = useState<any>(null);
  
  const [filters, setFilters] = useState({ status: 'ALL', category: 'ALL', department: 'ALL', search: '' });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'AVAILABLE' }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resEq, resCat, resDept, resSup] = await Promise.all([
        fetch('/api/equipments'),
        fetch('/api/categories'),
        fetch('/api/departments'),
        fetch('/api/suppliers')
      ]);
      
      if (resEq.ok) setData(await resEq.json() || []);
      if (resCat.ok) setCategories(await resCat.json() || []);
      if (resDept.ok) setDepartments(await resDept.json() || []);
      if (resSup.ok) setSuppliers(await resSup.json() || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchHistory = async (equipmentId: string, equipmentName: string) => {
    setHistoryEquipment(equipmentName);
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/movements?equipmentId=${equipmentId}`);
      const movements = await res.json();
      setHistoryData(movements);
    } catch {
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openForm = (item?: any) => {
    setEditItem(item || null);
    if (item) {
      setValue('name', item.name || '');
      setValue('serialNumber', item.serialNumber || '');
      setValue('categoryId', item.categoryId || '');
      setValue('supplierId', item.supplierId || '');
      setValue('departmentId', item.departmentId || '');
      setValue('status', item.status || 'AVAILABLE');
      setValue('price', item.price || '');
      setValue('purchaseDate', item.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : '');
      setValue('description', item.description || '');
    } else {
      reset({ name: '', serialNumber: '', categoryId: '', supplierId: '', departmentId: '', status: 'AVAILABLE', price: undefined, purchaseDate: '', description: '' });
    }
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditItem(null);
    reset();
  };

  const onSubmit = async (formData: FormData) => {
    setSaving(true);
    try {
      const url = editItem ? `/api/equipments/${editItem.id}` : '/api/equipments';
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSnackbar({ open: true, message: editItem ? "Équipement mis à jour" : "Équipement créé", severity: 'success' });
        closeForm();
        fetchData();
      } else {
        throw new Error("Erreur de sauvegarde");
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Une erreur est survenue", severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/equipments/${deleteItem.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSnackbar({ open: true, message: "Équipement supprimé", severity: 'success' });
        setDeleteConfirmOpen(false);
        fetchData();
      } else {
        throw new Error("Erreur de suppression");
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Erreur lors de la suppression", severity: 'error' });
    } finally {
      setSaving(false);
      setDeleteItem(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'ASSIGNED': return 'info';
      case 'MAINTENANCE': return 'warning';
      case 'DECOMMISSIONED': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    { 
      key: 'inventoryNumber', 
      label: 'N° Inventaire', 
      render: (row: any) => (
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          {row.inventoryNumber || '-'}
        </Typography>
      )
    },
    { key: 'name', label: 'Nom' },
    { 
      key: 'category', 
      label: 'Catégorie', 
      render: (row: any) => (
        <Box sx={{ display: 'inline-block', px: 1, py: 0.5, borderRadius: 1, bgcolor: '#1A1A2E0A', fontSize: '0.85rem' }}>
          {row.category?.name || '-'}
        </Box>
      )
    },
    { 
      key: 'department', 
      label: 'Département', 
      render: (row: any) => row.department?.name || '-'
    },
    { 
      key: 'status', 
      label: 'Statut', 
      render: (row: any) => (
        <StatusChip status={row.status} />
      )
    },
    { 
      key: 'price', 
      label: 'Prix', 
      render: (row: any) => row.price ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(row.price) : '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: any) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton onClick={() => { setSelectedQrEquipment(row); setQrModalOpen(true); }} size="small" sx={{ color: '#E31E24' }} title="Étiquette QR Code">
            <QrCodeIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => fetchHistory(row.id, row.name)} size="small" sx={{ color: '#1A1A2E' }} title="Historique">
            <HistoryIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => openForm(row)} size="small" color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => { setDeleteItem(row); setDeleteConfirmOpen(true); }} size="small" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  const filteredData = data.filter(d => {
    const matchStatus = filters.status === 'ALL' || d.status === filters.status;
    const matchCat = filters.category === 'ALL' || d.categoryId === filters.category;
    const matchDept = filters.department === 'ALL' || d.departmentId === filters.department;
    const matchSearch = filters.search === '' || 
      d.name.toLowerCase().includes(filters.search.toLowerCase()) || 
      (d.inventoryNumber && d.inventoryNumber.toLowerCase().includes(filters.search.toLowerCase()));
    return matchStatus && matchCat && matchDept && matchSearch;
  });

  const total = data.length;
  const available = data.filter(d => d.status === 'AVAILABLE').length;
  const assigned = data.filter(d => d.status === 'ASSIGNED').length;
  const maintenance = data.filter(d => d.status === 'MAINTENANCE').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, p: 3, animation: 'fadeIn 0.5s ease-in-out' }}>
      <PageHeader 
        title="Équipements" 
        subtitle="Gérez l'inventaire complet du parc informatique"
        actionLabel="Nouvel Équipement"
        onAction={() => openForm()}
      />

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {[
          { label: "Total Équipements", number: total, icon: <DevicesIcon />, color: '#1A1A2E' },
          { label: "Disponibles", number: available, icon: <AvailableIcon />, color: '#4CAF50' },
          { label: "Affectés", number: assigned, icon: <AssignedIcon />, color: '#2196F3' },
          { label: "En Maintenance", number: maintenance, icon: <MaintenanceIcon />, color: '#FF9800' },
        ].map((stat, i) => (
          <Paper key={i} sx={{ flex: '1 1 200px', p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1A1A2E' }}>{loading ? <Skeleton width={40} /> : stat.number}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: '500' }}>{stat.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      <Paper sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', p: 2 }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField 
            size="small" 
            placeholder="Rechercher (nom, n° inv)..." 
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
            sx={{ flex: '1 1 250px' }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Statut</InputLabel>
            <Select value={filters.status} label="Statut" onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}>
              <MenuItem value="ALL">Tous</MenuItem>
              <MenuItem value="AVAILABLE">Disponible</MenuItem>
              <MenuItem value="ASSIGNED">Affecté</MenuItem>
              <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
              <MenuItem value="DECOMMISSIONED">Déclassé</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select value={filters.category} label="Catégorie" onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}>
              <MenuItem value="ALL">Toutes</MenuItem>
              {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Département</InputLabel>
            <Select value={filters.department} label="Département" onChange={(e) => setFilters(f => ({ ...f, department: e.target.value }))}>
              <MenuItem value="ALL">Tous</MenuItem>
              {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <DataTable columns={columns} data={filteredData} loading={loading} />
      </Paper>

      <FormDialog 
        open={formOpen} 
        onClose={closeForm} 
        title={editItem ? "Modifier l'équipement" : "Nouvel équipement"}
        loading={saving}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Nom" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
            <TextField label="N° de série" fullWidth {...register('serialNumber')} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth error={!!errors.categoryId}>
              <InputLabel>Catégorie *</InputLabel>
              <Select label="Catégorie *" defaultValue="" {...register('categoryId')}>
                {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Fournisseur</InputLabel>
              <Select label="Fournisseur" defaultValue="" {...register('supplierId')}>
                <MenuItem value="">Aucun</MenuItem>
                {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Département</InputLabel>
              <Select label="Département" defaultValue="" {...register('departmentId')}>
                <MenuItem value="">Aucun</MenuItem>
                {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select label="Statut" defaultValue="AVAILABLE" {...register('status')}>
                <MenuItem value="AVAILABLE">Disponible</MenuItem>
                <MenuItem value="ASSIGNED">Affecté</MenuItem>
                <MenuItem value="MAINTENANCE">En Maintenance</MenuItem>
                <MenuItem value="DECOMMISSIONED">Déclassé</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Prix d'achat (€)" type="number" fullWidth {...register('price')} />
            <TextField label="Date d'achat" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} {...register('purchaseDate')} />
          </Box>
          <TextField label="Description" fullWidth multiline rows={3} {...register('description')} />
        </Box>
      </FormDialog>

      <ConfirmDialog 
        open={deleteConfirmOpen} 
        onCancel={() => setDeleteConfirmOpen(false)} 
        onConfirm={handleDelete}
        title="Supprimer cet équipement ?"
        message="Cette action est irréversible."
        loading={saving}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>

      {/* History Dialog */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid #eee' }}>
          <HistoryIcon sx={{ color: '#E31E24' }} />
          Historique — {historyEquipment}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#E31E24' }} />
            </Box>
          ) : historyData.length === 0 ? (
            <Typography sx={{ textAlign: 'center', color: '#999', py: 4 }}>
              Aucun mouvement enregistré pour cet équipement.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {historyData.map((m: any, idx: number) => (
                <Box key={m.id || idx} sx={{
                  display: 'flex', alignItems: 'flex-start', gap: 2,
                  p: 2, borderRadius: 2, bgcolor: '#f9f9fb',
                  borderLeft: '4px solid',
                  borderColor: m.type === 'ASSIGNMENT' ? '#2196F3'
                    : m.type === 'RETURN' ? '#4CAF50'
                    : m.type === 'TRANSFER' ? '#FF9800'
                    : m.type === 'MAINTENANCE' ? '#9C27B0'
                    : '#F44336',
                }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip
                        label={m.type}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          bgcolor: m.type === 'ASSIGNMENT' ? '#E3F2FD'
                            : m.type === 'RETURN' ? '#E8F5E9'
                            : m.type === 'TRANSFER' ? '#FFF3E0'
                            : m.type === 'MAINTENANCE' ? '#F3E5F5'
                            : '#FFEBEE',
                          color: m.type === 'ASSIGNMENT' ? '#1565C0'
                            : m.type === 'RETURN' ? '#2E7D32'
                            : m.type === 'TRANSFER' ? '#E65100'
                            : m.type === 'MAINTENANCE' ? '#6A1B9A'
                            : '#C62828',
                        }}
                      />
                    </Box>
                    {m.notes && (
                      <Typography sx={{ fontSize: '0.85rem', color: '#555' }}>{m.notes}</Typography>
                    )}
                    <Typography sx={{ fontSize: '0.75rem', color: '#999', mt: 0.5 }}>
                      Par {m.performedBy?.name || 'Système'} — {new Date(m.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Asset Tag QR Code Modal */}
      <AssetTagQRModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        equipment={selectedQrEquipment}
      />
    </Box>
  );
}
