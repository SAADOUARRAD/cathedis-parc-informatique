'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Snackbar, Alert, TextField, Skeleton, IconButton } from '@mui/material';
import { Storefront as StoreIcon, LocalShipping as ShippingIcon, CheckCircle as ActiveIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormDialog from '@/components/shared/FormDialog';
import StatusChip from '@/components/shared/StatusChip';

const schema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  contactName: z.string().optional(),
  email: z.string().email("Format d'email invalide").optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SuppliersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        const json = await res.json();
        setData(json || []);
      }
    } catch (err) {
      console.error(err);
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
      setValue('contactName', item.contactName || '');
      setValue('email', item.email || '');
      setValue('phone', item.phone || '');
      setValue('address', item.address || '');
      setValue('website', item.website || '');
    } else {
      reset({ name: '', contactName: '', email: '', phone: '', address: '', website: '' });
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
      const url = editItem ? `/api/suppliers/${editItem.id}` : '/api/suppliers';
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSnackbar({ open: true, message: editItem ? "Fournisseur mis à jour" : "Fournisseur créé", severity: 'success' });
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
      const res = await fetch(`/api/suppliers/${deleteItem.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSnackbar({ open: true, message: "Fournisseur supprimé", severity: 'success' });
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

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'contactName', label: 'Contact' },
    { 
      key: 'email', 
      label: 'Email', 
      render: (row: any) => (
        <a href={`mailto:${row.email}`} style={{ color: '#E31E24', textDecoration: 'none' }}>
          {row.email}
        </a>
      )
    },
    { key: 'phone', label: 'Téléphone' },
    { 
      key: 'equipments', 
      label: 'Équipements', 
      render: (row: any) => (
        <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 2, bgcolor: '#1A1A2E10', color: '#1A1A2E', sx: { fontWeight: 'bold' } }}>
          {row.equipmentsCount || 0}
        </Box>
      ) 
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
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

  const totalSuppliers = data.length;
  const activeSuppliers = data.filter(d => d.equipmentsCount > 0).length;
  const totalEquipments = data.reduce((acc, curr) => acc + (curr.equipmentsCount || 0), 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, p: 3, animation: 'fadeIn 0.5s ease-in-out' }}>
      <PageHeader 
        title="Fournisseurs" 
        subtitle="Gérez vos prestataires et fournisseurs d'équipements"
        actionLabel="Nouveau Fournisseur"
        onAction={() => openForm()}
      />

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {[
          { label: "Total Fournisseurs", number: totalSuppliers, icon: <StoreIcon />, color: '#1A1A2E' },
          { label: "Fournisseurs Actifs", number: activeSuppliers, icon: <ActiveIcon />, color: '#4CAF50' },
          { label: "Équipements Fournis", number: totalEquipments, icon: <ShippingIcon />, color: '#E31E24' },
        ].map((stat, i) => (
          <Paper key={i} sx={{ flex: '1 1 300px', p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
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

      <Paper sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <DataTable columns={columns} data={data} loading={loading} />
      </Paper>

      <FormDialog 
        open={formOpen} 
        onClose={closeForm} 
        title={editItem ? "Modifier le fournisseur" : "Nouveau fournisseur"}
        loading={saving}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          <TextField 
            label="Nom" 
            fullWidth 
            {...register('name')} 
            error={!!errors.name} 
            helperText={errors.name?.message} 
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
              label="Nom du contact" 
              fullWidth 
              {...register('contactName')} 
            />
            <TextField 
              label="Téléphone" 
              fullWidth 
              {...register('phone')} 
            />
          </Box>
          <TextField 
            label="Email" 
            fullWidth 
            {...register('email')} 
            error={!!errors.email} 
            helperText={errors.email?.message} 
          />
          <TextField 
            label="Site web" 
            fullWidth 
            {...register('website')} 
          />
          <TextField 
            label="Adresse" 
            fullWidth 
            multiline 
            rows={3} 
            {...register('address')} 
          />
        </Box>
      </FormDialog>

      <ConfirmDialog 
        open={deleteConfirmOpen} 
        onCancel={() => setDeleteConfirmOpen(false)} 
        onConfirm={handleDelete}
        title="Supprimer ce fournisseur ?"
        message="Cette action est irréversible. Les équipements liés ne seront pas supprimés."
        loading={saving}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
