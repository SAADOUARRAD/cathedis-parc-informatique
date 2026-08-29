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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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
  CardActions
} from '@mui/material';
import {
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  Engineering as TechIcon,
  Person as EmployeeIcon,
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
  Email as EmailIcon,
  Phone as PhoneIcon,
  Domain as DomainIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  Key as KeyIcon,
  Shield as ShieldIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  AutoAwesome as SparklesIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

const schema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Format d'email invalide"),
  password: z.string().optional(),
  role: z.enum(['ADMIN', 'TECHNICIAN', 'EMPLOYEE']),
  departmentId: z.string().optional().nullable(),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const roleConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode; description: string; gradient: string }> = {
  ADMIN: {
    label: 'Administrateur DSI',
    color: '#E31E24',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    gradient: 'linear-gradient(135deg, #E31E24 0%, #991B1B 100%)',
    icon: <AdminIcon sx={{ fontSize: 20, color: '#E31E24' }} />,
    description: 'Pilotage global du parc, gouvernance, audits, validation des arbitrages et gestion des utilisateurs.'
  },
  TECHNICIAN: {
    label: 'Technicien Support IT',
    color: '#0284C7',
    bgColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    gradient: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
    icon: <TechIcon sx={{ fontSize: 20, color: '#0284C7' }} />,
    description: 'Résolution des pannes, maintenance préventive/corrective, gestion des garanties et interventions sur site.'
  },
  EMPLOYEE: {
    label: 'Collaborateur / Employé',
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    icon: <EmployeeIcon sx={{ fontSize: 20, color: '#059669' }} />,
    description: 'Consultation de ses dotations, signature numérique des PV de décharge, Auto-Diagnostic IA et déclaration d\'incidents.'
  },
};

export default function UsersPage() {
  const [data, setData] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View mode: 'CARDS' or 'TABLE'
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  // Search & Role Filter
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Pagination for table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'EMPLOYEE', departmentId: '' }
  });

  const selectedRole = watch('role');

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
      setSnackbar({ open: true, message: "Erreur lors du chargement des données", severity: 'error' });
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
      setValue('phone', item.phone || '');
    } else {
      reset({ firstName: '', lastName: '', email: '', password: '', role: 'EMPLOYEE', departmentId: '', phone: '' });
    }
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditItem(null);
    reset();
  };

  const openDetails = (user: any) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const onSubmit = async (formData: FormData) => {
    setSaving(true);
    try {
      if (!editItem && (!formData.password || formData.password.length < 6)) {
        throw new Error("Mot de passe requis (min 6 caractères) pour la création d'un compte");
      }

      const payload = {
        ...formData,
        departmentId: formData.role === 'EMPLOYEE' ? (formData.departmentId || null) : null,
      };

      const url = editItem ? `/api/users/${editItem.id}` : '/api/users';
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSnackbar({ open: true, message: editItem ? "Compte utilisateur mis à jour !" : "Nouvel utilisateur créé avec succès !", severity: 'success' });
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
      const res = await fetch(`/api/users/${deleteItem.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSnackbar({ open: true, message: "Utilisateur supprimé du système", severity: 'success' });
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

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = ["ID", "Prénom", "Nom", "Email", "Rôle", "Département", "Téléphone"];
    const rows = data.map(u => [
      u.id,
      `"${(u.firstName || '').replace(/"/g, '""')}"`,
      `"${(u.lastName || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      u.role || 'EMPLOYEE',
      `"${(u.department?.name || '').replace(/"/g, '""')}"`,
      `"${(u.phone || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `utilisateurs_cathedis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({ open: true, message: "Exportation des utilisateurs réussie !", severity: 'success' });
  };

  const totalUsers = data.length;
  const admins = data.filter(d => d.role === 'ADMIN').length;
  const techs = data.filter(d => d.role === 'TECHNICIAN').length;
  const employees = data.filter(d => d.role === 'EMPLOYEE').length;

  const filteredData = data.filter(u => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const s = search.toLowerCase();
    const matchesSearch = !s ||
      (u.firstName && u.firstName.toLowerCase().includes(s)) ||
      (u.lastName && u.lastName.toLowerCase().includes(s)) ||
      (u.email && u.email.toLowerCase().includes(s)) ||
      (u.phone && u.phone.toLowerCase().includes(s)) ||
      (u.department?.name && u.department.name.toLowerCase().includes(s));

    return matchesRole && matchesSearch;
  });

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getInitials = (fn?: string, ln?: string) => {
    return `${(fn || '')[0] || ''}${(ln || '')[0] || ''}`.toUpperCase() || 'U';
  };

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
              <GroupIcon sx={{ fontSize: 34, color: '#FFFFFF' }} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                  Utilisateurs & Contrôle des Accès
                </Typography>
                <Chip
                  icon={<ShieldIcon sx={{ fontSize: 16, color: '#A7F3D0 !important' }} />}
                  label="Sécurité RBAC • 3 Rôles Acteurs"
                  size="small"
                  sx={{ bgcolor: 'rgba(5, 150, 105, 0.25)', color: '#A7F3D0', border: '1px solid rgba(167, 243, 208, 0.4)', fontWeight: 800 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.6, maxWidth: 680 }}>
                Administration centralisée des comptes, permissions d'accès et répartition des collaborateurs par direction.
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
              + Nouvel Utilisateur
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 🎭 2. LES 3 ACTEURS DU SYSTÈME (IMAGE & SHOWCASE DÉCORATIF) 🎭 */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: { xs: 2.5, md: 3 },
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#1A1A2E', color: '#FFFFFF', width: 36, height: 36 }}>
              <SecurityIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.1rem' }}>
                Architecture des 3 Acteurs du Système Cathedis
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Modèle de gouvernance et matrice des rôles pour le parc informatique
              </Typography>
            </Box>
          </Box>
          <Chip
            label="Matrice des Droits RBAC Active"
            size="small"
            sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: '#EFF6FF', color: '#1D4ED8' }}
          />
        </Box>

        {/* 3 Interactive Cards for the 3 Actors */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
          
          {/* ACTOR 1: ADMIN */}
          <Paper
            elevation={0}
            onClick={() => setRoleFilter('ADMIN')}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              border: '2px solid',
              borderColor: roleFilter === 'ADMIN' ? '#E31E24' : '#FECACA',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF5F5 100%)',
              cursor: 'pointer',
              transition: 'all 0.25s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(227,30,36,0.15)', borderColor: '#E31E24' }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Avatar sx={{ width: 52, height: 52, background: roleConfig.ADMIN.gradient, color: '#FFFFFF', boxShadow: '0 4px 14px rgba(227,30,36,0.35)' }}>
                <AdminIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Chip
                label={`${admins} Actif${admins > 1 ? 's' : ''}`}
                size="small"
                sx={{ bgcolor: '#FEF2F2', color: '#E31E24', fontWeight: 900, border: '1px solid #FECACA' }}
              />
            </Box>
            <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.05rem', mb: 0.5 }}>
              1. Administrateur DSI
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4, mb: 1.5, minHeight: 48 }}>
              {roleConfig.ADMIN.description}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ color: '#E31E24', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              ● Accès Total • Pilotage & Arbitrage DSI
            </Typography>
          </Paper>

          {/* ACTOR 2: TECHNICIAN */}
          <Paper
            elevation={0}
            onClick={() => setRoleFilter('TECHNICIAN')}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              border: '2px solid',
              borderColor: roleFilter === 'TECHNICIAN' ? '#0284C7' : '#BAE6FD',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)',
              cursor: 'pointer',
              transition: 'all 0.25s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(2,132,199,0.15)', borderColor: '#0284C7' }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Avatar sx={{ width: 52, height: 52, background: roleConfig.TECHNICIAN.gradient, color: '#FFFFFF', boxShadow: '0 4px 14px rgba(2,132,199,0.35)' }}>
                <TechIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Chip
                label={`${techs} Actif${techs > 1 ? 's' : ''}`}
                size="small"
                sx={{ bgcolor: '#F0F9FF', color: '#0284C7', fontWeight: 900, border: '1px solid #BAE6FD' }}
              />
            </Box>
            <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.05rem', mb: 0.5 }}>
              2. Technicien Support IT
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4, mb: 1.5, minHeight: 48 }}>
              {roleConfig.TECHNICIAN.description}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              ● Espace Technique • Diagnostics & Réparations
            </Typography>
          </Paper>

          {/* ACTOR 3: EMPLOYEE */}
          <Paper
            elevation={0}
            onClick={() => setRoleFilter('EMPLOYEE')}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              border: '2px solid',
              borderColor: roleFilter === 'EMPLOYEE' ? '#059669' : '#A7F3D0',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #ECFDF5 100%)',
              cursor: 'pointer',
              transition: 'all 0.25s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(5,150,105,0.15)', borderColor: '#059669' }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Avatar sx={{ width: 52, height: 52, background: roleConfig.EMPLOYEE.gradient, color: '#FFFFFF', boxShadow: '0 4px 14px rgba(5,150,105,0.35)' }}>
                <EmployeeIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Chip
                label={`${employees} Actif${employees > 1 ? 's' : ''}`}
                size="small"
                sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 900, border: '1px solid #A7F3D0' }}
              />
            </Box>
            <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.05rem', mb: 0.5 }}>
              3. Collaborateur / Employé
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4, mb: 1.5, minHeight: 48 }}>
              {roleConfig.EMPLOYEE.description}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              ● Espace Collaborateur • Dotations & Auto-Diagnostic
            </Typography>
          </Paper>

        </Box>
      </Paper>

      {/* 📊 3. FOUR GLASSMORPHIС KPI CARDS 📊 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {[
          { label: "Total Utilisateurs", number: totalUsers, sub: "Comptes enregistrés", icon: <GroupIcon />, color: '#1A1A2E', filter: 'ALL' },
          { label: "Administrateurs", number: admins, sub: "Supervision DSI", icon: <AdminIcon />, color: '#E31E24', filter: 'ADMIN' },
          { label: "Techniciens IT", number: techs, sub: "Maintenance & Support", icon: <TechIcon />, color: '#0284C7', filter: 'TECHNICIAN' },
          { label: "Collaborateurs", number: employees, sub: "Dotations matérielles", icon: <EmployeeIcon />, color: '#059669', filter: 'EMPLOYEE' },
        ].map((stat, i) => (
          <Paper
            key={i}
            elevation={0}
            onClick={() => setRoleFilter(stat.filter)}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }
            }}
          >
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

      {/* 🔍 4. SEARCH, FILTER & VIEW CONTROLLER 🔍 */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', p: 2.5, bgcolor: '#FFFFFF' }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <Box sx={{ display: 'flex', gap: 1.5, flex: '1 1 400px', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Rechercher par nom, email, département, téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> } }}
              sx={{ flex: '1 1 260px' }}
            />

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Filtrer par rôle</InputLabel>
              <Select
                value={roleFilter}
                label="Filtrer par rôle"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="ALL">Tous les rôles ({totalUsers})</MenuItem>
                <MenuItem value="ADMIN">Administrateurs ({admins})</MenuItem>
                <MenuItem value="TECHNICIAN">Techniciens ({techs})</MenuItem>
                <MenuItem value="EMPLOYEE">Employés ({employees})</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>
              {filteredData.length} utilisateur(s)
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
                Cartes Acteurs
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

        {/* 🔲 VIEW 1: MODERN USER CARDS 🔲 */}
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
                <GroupIcon sx={{ fontSize: 50, color: '#CBD5E1', mb: 1 }} />
                <Typography sx={{ fontWeight: 800, color: '#64748B' }}>
                  Aucun utilisateur ne correspond à votre filtre de recherche.
                </Typography>
              </Box>
            ) : (
              filteredData.map((user) => {
                const rc = roleConfig[user.role] || roleConfig.EMPLOYEE;

                return (
                  <Card
                    key={user.id}
                    elevation={0}
                    sx={{
                      borderRadius: 3.5,
                      border: '1px solid #E2E8F0',
                      borderTop: `5px solid ${rc.color}`,
                      bgcolor: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                        borderColor: rc.color
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      {/* Header with Avatar & Role Badge */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 46, height: 46, background: rc.gradient, color: '#FFFFFF', fontWeight: 900, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            {getInitials(user.firstName, user.lastName)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.05rem', lineHeight: 1.2 }}>
                              {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                              <EmailIcon sx={{ fontSize: 13 }} /> {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Role & Department Chips */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        <Chip
                          icon={rc.icon as any}
                          label={rc.label}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            bgcolor: rc.bgColor,
                            color: rc.color,
                            border: `1px solid ${rc.borderColor}`
                          }}
                        />

                        {user.role === 'EMPLOYEE' && user.department?.name && (
                          <Chip
                            icon={<DomainIcon sx={{ fontSize: 14 }} />}
                            label={user.department.name}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: '#F8FAFC' }}
                          />
                        )}
                      </Box>

                      {/* Contact Info Box */}
                      <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: 2.5, border: '1px solid #F1F5F9' }}>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <PhoneIcon sx={{ fontSize: 14, color: '#94A3B8' }} /> {user.phone || 'Aucun numéro enregistré'}
                        </Typography>
                      </Box>
                    </CardContent>

                    {/* Actions Footer */}
                    <CardActions sx={{ p: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        onClick={() => openDetails(user)}
                        startIcon={<ViewIcon />}
                        sx={{ textTransform: 'none', fontWeight: 800, color: '#1A1A2E', fontSize: '0.78rem' }}
                      >
                        Fiche 360°
                      </Button>

                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Modifier">
                          <IconButton size="small" onClick={() => openForm(user)} sx={{ color: '#2563EB', bgcolor: '#EFF6FF' }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" onClick={() => { setDeleteItem(user); setDeleteConfirmOpen(true); }} sx={{ color: '#DC2626', bgcolor: '#FEF2F2' }}>
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
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Utilisateur / Collaborateur</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Rôle Système</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Département</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Téléphone</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#1E293B' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton width={160} /></TableCell>
                        <TableCell><Skeleton width={180} /></TableCell>
                        <TableCell><Skeleton width={100} /></TableCell>
                        <TableCell><Skeleton width={120} /></TableCell>
                        <TableCell><Skeleton width={100} /></TableCell>
                        <TableCell align="center"><Skeleton width={80} /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                        <GroupIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                        <Typography sx={{ fontWeight: 700, color: '#64748B' }}>
                          Aucun utilisateur trouvé.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row) => {
                      const rc = roleConfig[row.role] || roleConfig.EMPLOYEE;

                      return (
                        <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 34, height: 34, background: rc.gradient, color: '#FFFFFF', fontWeight: 900, fontSize: '0.8rem' }}>
                                {getInitials(row.firstName, row.lastName)}
                              </Avatar>
                              <Typography
                                onClick={() => openDetails(row)}
                                sx={{ fontWeight: 800, color: '#1A1A2E', cursor: 'pointer', '&:hover': { color: '#E31E24', textDecoration: 'underline' } }}
                              >
                                {row.firstName} {row.lastName}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ fontSize: '0.85rem', color: '#475569' }}>
                            {row.email}
                          </TableCell>

                          <TableCell>
                            <Chip
                              icon={rc.icon as any}
                              label={rc.label}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                bgcolor: rc.bgColor,
                                color: rc.color,
                                border: `1px solid ${rc.borderColor}`
                              }}
                            />
                          </TableCell>

                          <TableCell sx={{ fontSize: '0.85rem', color: '#475569' }}>
                            {row.role === 'EMPLOYEE' ? (row.department?.name || '-') : '— Direction Centrale'}
                          </TableCell>

                          <TableCell sx={{ fontSize: '0.85rem', color: '#64748B' }}>
                            {row.phone || '-'}
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
                      );
                    })
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

      {/* 📝 5. MODALE CRÉATION / MODIFICATION UTILISATEUR 📝 */}
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
              <KeyIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                {editItem ? "Modifier le Compte Utilisateur" : "Créer un Nouvel Utilisateur"}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Sécurité & Affectation des Permissions
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={closeForm} sx={{ color: '#FFFFFF' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, bgcolor: '#FAFAFA' }}>
            
            {/* Prénom & Nom */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Prénom *"
                placeholder="ex: Yassine"
                fullWidth
                required
                {...register('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                sx={{ bgcolor: '#FFFFFF' }}
              />
              <TextField
                label="Nom *"
                placeholder="ex: El Mansouri"
                fullWidth
                required
                {...register('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                sx={{ bgcolor: '#FFFFFF' }}
              />
            </Box>

            {/* Email & Phone */}
            <TextField
              label="Email Professionnel *"
              placeholder="ex: yassine.elmansouri@cathedis.ma"
              type="email"
              fullWidth
              required
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ bgcolor: '#FFFFFF' }}
            />

            <TextField
              label="Téléphone Professionnel"
              placeholder="ex: +212 6 00 00 00 00"
              fullWidth
              {...register('phone')}
              sx={{ bgcolor: '#FFFFFF' }}
            />

            {/* Rôle Selector */}
            <FormControl fullWidth sx={{ bgcolor: '#FFFFFF' }}>
              <InputLabel>Rôle Système *</InputLabel>
              <Select
                label="Rôle Système *"
                defaultValue="EMPLOYEE"
                {...register('role')}
              >
                <MenuItem value="ADMIN">👑 Administrateur DSI (Accès Complet)</MenuItem>
                <MenuItem value="TECHNICIAN">🛠️ Technicien Support IT (Maintenances & Pannes)</MenuItem>
                <MenuItem value="EMPLOYEE">👤 Collaborateur / Employé (Dotations & Demandes)</MenuItem>
              </Select>
            </FormControl>

            {/* Département si Employé */}
            {selectedRole === 'EMPLOYEE' && (
              <FormControl fullWidth sx={{ bgcolor: '#FFFFFF' }}>
                <InputLabel>Département / Direction de Rattachement</InputLabel>
                <Select
                  label="Département / Direction de Rattachement"
                  defaultValue=""
                  {...register('departmentId')}
                >
                  <MenuItem value="">-- Aucun Département --</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name} {dept.location ? `(${dept.location})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Password Field */}
            <TextField
              label={editItem ? "Nouveau Mot de Passe (laisser vide pour conserver l'actuel)" : "Mot de Passe Provisoire *"}
              type="password"
              placeholder={editItem ? "••••••••" : "Min 6 caractères"}
              fullWidth
              required={!editItem}
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
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
              {saving ? 'Enregistrement...' : editItem ? 'Mettre à jour' : 'Créer l\'Utilisateur'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* 🔍 6. FICHE 360° DE L'UTILISATEUR 🔍 */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        {selectedUser && (
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
                <Avatar sx={{ width: 48, height: 48, background: (roleConfig[selectedUser.role] || roleConfig.EMPLOYEE).gradient, color: '#FFFFFF', fontWeight: 900 }}>
                  {getInitials(selectedUser.firstName, selectedUser.lastName)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    Fiche Profil & Permissions 360°
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setDetailsOpen(false)} sx={{ color: '#FFFFFF' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3, bgcolor: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              
              {/* Role Card */}
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: (roleConfig[selectedUser.role] || roleConfig.EMPLOYEE).borderColor, bgcolor: (roleConfig[selectedUser.role] || roleConfig.EMPLOYEE).bgColor }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: (roleConfig[selectedUser.role] || roleConfig.EMPLOYEE).color, textTransform: 'uppercase' }}>
                  Rôle & Matrice des Droits
                </Typography>
                <Typography sx={{ fontWeight: 900, color: '#1A1A2E', mt: 0.5, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                  {(roleConfig[selectedUser.role] || roleConfig.EMPLOYEE).icon}
                  {(roleConfig[selectedUser.role] || roleConfig.EMPLOYEE).label}
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#475569', mt: 0.5 }}>
                  {(roleConfig[selectedUser.role] || roleConfig.EMPLOYEE).description}
                </Typography>
              </Paper>

              {/* Coordinates Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Email</Typography>
                  <Typography sx={{ fontWeight: 700, color: '#1A1A2E', mt: 0.5, fontSize: '0.88rem' }}>
                    {selectedUser.email}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Téléphone</Typography>
                  <Typography sx={{ fontWeight: 700, color: '#1A1A2E', mt: 0.5, fontSize: '0.88rem' }}>
                    {selectedUser.phone || 'Non renseigné'}
                  </Typography>
                </Paper>
              </Box>

              {/* Department */}
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Département / Direction</Typography>
                <Typography sx={{ fontWeight: 800, color: '#1A1A2E', mt: 0.5 }}>
                  {selectedUser.role === 'EMPLOYEE' ? (selectedUser.department?.name || 'Aucun département assigné') : 'Direction Générale / DSI'}
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

      {/* ⚠️ 7. MODALE CONFIRMATION SUPPRESSION ⚠️ */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer cet utilisateur ?"
        message={`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${deleteItem?.firstName} ${deleteItem?.lastName} ? Cette action révoquera immédiatement tous ses accès.`}
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
