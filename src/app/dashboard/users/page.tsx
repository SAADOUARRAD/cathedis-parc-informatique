'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Snackbar, Alert, TextField, Skeleton, IconButton, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Group as GroupIcon, AdminPanelSettings as AdminIcon, Engineering as TechIcon, Person as EmployeeIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormDialog from '@/components/shared/FormDialog';
import StatusChip from '@/components/shared/StatusChip';

const schema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Format d'email invalide"),
  password: z.string().optional(),
  role: z.enum(['ADMIN', 'TECHNICIAN', 'EMPLOYEE']),
  departmentId: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function UsersPage() {
  const [data, setData] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [roleFilter, setRoleFilter] = useState('ALL');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'EMPLOYEE' }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resUsers, resDepts] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/departments')
      ]);
      
      if (resUsers.ok) setData(await resUsers.json() || []);
      if (resDepts.ok) setDepartments(await resDepts.json() || []);
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
      setValue('firstName', item.firstName || '');
      setValue('lastName', item.lastName || '');
      setValue('email', item.email || '');
      setValue('role', item.role || 'EMPLOYEE');
      setValue('departmentId', item.departmentId || '');
      setValue('position', item.position || '');
      setValue('phone', item.phone || '');
    } else {
      reset({ firstName: '', lastName: '', email: '', password: '', role: 'EMPLOYEE', departmentId: '', position: '', phone: '' });
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
      if (!editItem && (!formData.password || formData.password.length < 6)) {
        throw new Error("Mot de passe requis (min 6 caractères) pour la création");
      }

      const url = editItem ? `/api/users/${editItem.id}` : '/api/users';
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSnackbar({ open: true, message: editItem ? "Utilisateur mis à jour" : "Utilisateur créé", severity: 'success' });
        closeForm();
        fetchData();
      } else {
        throw new Error("Erreur de sauvegarde");
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
      const res = await fetch(`/api/users/${deleteItem.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSnackbar({ open: true, message: "Utilisateur supprimé", severity: 'success' });
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'TECHNICIAN': return 'info';
      default: return 'success';
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Nom Complet', 
      render: (row: any) => `${row.firstName} ${row.lastName}`
    },
    { key: 'email', label: 'Email' },
    { 
      key: 'role', 
      label: 'Rôle', 
      render: (row: any) => (
        <StatusChip status={row.role} />
      )
    },
    { 
      key: 'department', 
      label: 'Département', 
      render: (row: any) => row.department?.name || '-'
    },
    { key: 'position', label: 'Poste' },
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

  const totalUsers = data.length;
  const admins = data.filter(d => d.role === 'ADMIN').length;
  const techs = data.filter(d => d.role === 'TECHNICIAN').length;
  const employees = data.filter(d => d.role === 'EMPLOYEE').length;

  const filteredData = roleFilter === 'ALL' ? data : data.filter(d => d.role === roleFilter);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, p: 3, animation: 'fadeIn 0.5s ease-in-out' }}>
      <PageHeader 
        title="Utilisateurs" 
        subtitle="Gérez les accès et les employés"
        actionLabel="Nouvel Utilisateur"
        onAction={() => openForm()}
      />

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {[
          { label: "Total Utilisateurs", number: totalUsers, icon: <GroupIcon />, color: '#1A1A2E' },
          { label: "Administrateurs", number: admins, icon: <AdminIcon />, color: '#E31E24' },
          { label: "Techniciens", number: techs, icon: <TechIcon />, color: '#2196F3' },
          { label: "Employés", number: employees, icon: <EmployeeIcon />, color: '#4CAF50' },
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
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Filtrer par rôle</InputLabel>
            <Select
              value={roleFilter}
              label="Filtrer par rôle"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="ALL">Tous</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="TECHNICIAN">Technicien</MenuItem>
              <MenuItem value="EMPLOYEE">Employé</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <DataTable columns={columns} data={filteredData} loading={loading} />
      </Paper>

      <FormDialog 
        open={formOpen} 
        onClose={closeForm} 
        title={editItem ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
        loading={saving}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
              label="Prénom" 
              fullWidth 
              {...register('firstName')} 
              error={!!errors.firstName} 
              helperText={errors.firstName?.message} 
            />
            <TextField 
              label="Nom" 
              fullWidth 
              {...register('lastName')} 
              error={!!errors.lastName} 
              helperText={errors.lastName?.message} 
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
              label="Email" 
              fullWidth 
              {...register('email')} 
              error={!!errors.email} 
              helperText={errors.email?.message} 
            />
            <TextField 
              label="Mot de passe" 
              type="password"
              fullWidth 
              {...register('password')} 
              helperText={editItem ? "Laisser vide pour ne pas changer" : "Minimum 6 caractères"}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Rôle</InputLabel>
              <Select label="Rôle" defaultValue="EMPLOYEE" {...register('role')}>
                <MenuItem value="EMPLOYEE">Employé</MenuItem>
                <MenuItem value="TECHNICIAN">Technicien</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Département</InputLabel>
              <Select label="Département" defaultValue="" {...register('departmentId')}>
                <MenuItem value="">Aucun</MenuItem>
                {departments.map(d => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Poste" fullWidth {...register('position')} />
            <TextField label="Téléphone" fullWidth {...register('phone')} />
          </Box>
        </Box>
      </FormDialog>

      <ConfirmDialog 
        open={deleteConfirmOpen} 
        onCancel={() => setDeleteConfirmOpen(false)} 
        onConfirm={handleDelete}
        title="Supprimer cet utilisateur ?"
        message="Cette action est irréversible."
        loading={saving}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
