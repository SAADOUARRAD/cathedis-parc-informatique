'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Snackbar, Alert, TextField, Skeleton, IconButton } from '@mui/material';
import { Domain as DomainIcon, Devices as DevicesIcon, People as PeopleIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
  description: z.string().optional(),
  location: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function DepartmentsPage() {
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
      const res = await fetch('/api/departments');
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
        setSnackbar({ open: true, message: editItem ? "Département mis à jour" : "Département créé", severity: 'success' });
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
      const res = await fetch(`/api/departments/${deleteItem.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSnackbar({ open: true, message: "Département supprimé", severity: 'success' });
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
    { key: 'description', label: 'Description' },
    { key: 'location', label: 'Localisation' },
    { 
      key: 'employees', 
      label: 'Employés', 
      render: (row: any) => (
        <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 2, bgcolor: '#1A1A2E10', color: '#1A1A2E', sx: { fontWeight: 'bold' } }}>
          {row.employeesCount || 0}
        </Box>
      ) 
    },
    { 
      key: 'equipments', 
      label: 'Équipements', 
      render: (row: any) => (
        <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 2, bgcolor: '#E31E2410', color: '#E31E24', sx: { fontWeight: 'bold' } }}>
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

  const totalDepts = data.length;
  const deptsWithEquipments = data.filter(d => d.equipmentsCount > 0).length;
  const deptsWithEmployees = data.filter(d => d.employeesCount > 0).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, p: 3, animation: 'fadeIn 0.5s ease-in-out' }}>
      <PageHeader 
        title="Départements" 
        subtitle="Gérez les départements de l'entreprise"
        actionLabel="Nouveau Département"
        onAction={() => openForm()}
      />

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {[
          { label: "Total Départements", number: totalDepts, icon: <DomainIcon />, color: '#1A1A2E' },
          { label: "Avec Équipements", number: deptsWithEquipments, icon: <DevicesIcon />, color: '#E31E24' },
          { label: "Avec Employés", number: deptsWithEmployees, icon: <PeopleIcon />, color: '#4CAF50' },
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
        title={editItem ? "Modifier le département" : "Nouveau département"}
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
          <TextField 
            label="Localisation" 
            fullWidth 
            {...register('location')} 
          />
          <TextField 
            label="Description" 
            fullWidth 
            multiline 
            rows={3} 
            {...register('description')} 
          />
        </Box>
      </FormDialog>

      <ConfirmDialog 
        open={deleteConfirmOpen} 
        onCancel={() => setDeleteConfirmOpen(false)} 
        onConfirm={handleDelete}
        title="Supprimer ce département ?"
        message="Cette action est irréversible. Les équipements et employés associés risquent d'être orphelins."
        loading={saving}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
