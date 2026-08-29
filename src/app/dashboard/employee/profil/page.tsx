'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  TextField,
  Avatar,
  Skeleton,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Computer as ComputerIcon,
  LaptopMac as LaptopIcon,
  DesktopWindows as MonitorIcon,
  Draw as DrawIcon,
  CalendarToday as CalendarIcon,
  ContentCopy as ContentCopyIcon,
  LocationOn as LocationIcon,
  Key as KeyIcon,
  Badge as BadgeIcon,
  VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';

export default function EmployeeProfilePage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Form Fields: Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Form Fields: Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Feedback
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setPhone(data.phone || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setSnackbar({ open: true, message: 'Le prénom et le nom sont requis.', severity: 'error' });
      return;
    }

    setSavingInfo(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone }),
      });

      const data = await res.json();
      if (res.ok) {
        setSnackbar({ open: true, message: 'Informations personnelles mises à jour avec succès !', severity: 'success' });
        fetchProfile();
        if (update) {
          update({ name: `${firstName} ${lastName}` });
        }
      } else {
        setSnackbar({ open: true, message: data.error || 'Erreur lors de la mise à jour', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Erreur réseau', severity: 'error' });
    } finally {
      setSavingInfo(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setSnackbar({ open: true, message: 'Veuillez saisir votre mot de passe actuel.', severity: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setSnackbar({ open: true, message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.', severity: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: 'Les nouveaux mots de passe ne correspondent pas.', severity: 'error' });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setSnackbar({ open: true, message: 'Mot de passe modifié avec succès !', severity: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSnackbar({ open: true, message: data.error || 'Erreur lors de la modification du mot de passe', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Erreur réseau', severity: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: `${label} copié !`, severity: 'info' });
  };

  const getEquipmentIcon = (categoryName?: string) => {
    const cat = categoryName?.toLowerCase() || '';
    if (cat.includes('laptop') || cat.includes('portable')) return <LaptopIcon sx={{ fontSize: 22, color: '#E31E24' }} />;
    if (cat.includes('écran') || cat.includes('ecran') || cat.includes('moniteur')) return <MonitorIcon sx={{ fontSize: 22, color: '#E31E24' }} />;
    return <ComputerIcon sx={{ fontSize: 22, color: '#E31E24' }} />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 1.5, md: 3 } }}>
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 4 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: 3 }}>
          <Skeleton variant="rounded" height={360} sx={{ borderRadius: 4 }} />
          <Skeleton variant="rounded" height={360} sx={{ borderRadius: 4 }} />
        </Box>
      </Box>
    );
  }

  const stats = profile?.stats || {};
  const assignments = profile?.assignments || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
      
      {/* 1. Hero Profile Banner */}
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
        {/* Glow Ambient Spheres */}
        <Box sx={{ position: 'absolute', top: -50, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.35) 0%, rgba(227,30,36,0) 70%)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: 200, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            {/* Big Avatar */}
            <Avatar
              sx={{
                width: 90,
                height: 90,
                background: 'linear-gradient(135deg, #E31E24 0%, #7B0000 100%)',
                fontSize: '2.4rem',
                fontWeight: 900,
                color: '#FFFFFF',
                border: '4px solid rgba(255,255,255,0.25)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
            >
              {profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U'}
            </Avatar>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', fontSize: { xs: '1.5rem', md: '1.9rem' } }}>
                  {profile?.firstName} {profile?.lastName}
                </Typography>
                <Chip
                  icon={<VerifiedUserIcon sx={{ fontSize: 15, color: '#FFCDD2 !important' }} />}
                  label="Collaborateur Cathedis"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(227, 30, 36, 0.35)',
                    color: '#FFCDD2',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    border: '1px solid rgba(227, 30, 36, 0.5)',
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EmailIcon sx={{ fontSize: 16, color: '#FF8A80' }} />
                  <Typography variant="body2">{profile?.email}</Typography>
                </Box>
                {profile?.department && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BusinessIcon sx={{ fontSize: 16, color: '#FF8A80' }} />
                    <Typography variant="body2">{profile.department.name}</Typography>
                  </Box>
                )}
                {profile?.createdAt && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 16, color: '#FF8A80' }} />
                    <Typography variant="body2">
                      Membre depuis le {new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Quick Metrics Badges */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Paper elevation={0} sx={{ px: 2.5, py: 1.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>{stats.totalEquipments || 0}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>Matériels Actifs</Typography>
            </Paper>
            <Paper elevation={0} sx={{ px: 2.5, py: 1.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#4ADE80', lineHeight: 1 }}>{stats.signedPVCount || 0}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>PV Signés ✓</Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* 2. Main Two-Column Workspace */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.3fr 1fr' }, gap: 3 }}>
        
        {/* Left Column: Personal Information & Profile Edit */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3.5,
            p: { xs: 2.5, md: 3.5 },
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(227, 30, 36, 0.08)' }}>
              <PersonIcon sx={{ color: '#E31E24' }} />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#1A1A2E' }}>
                Informations du Profil
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Gérez vos coordonnées et coordonnées de flotte Cathedis
              </Typography>
            </Box>
          </Box>

          <form onSubmit={handleUpdateInfo}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Prénom *"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Nom *"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  fullWidth
                  required
                />
              </Box>

              <TextField
                label="Adresse Email Professionnelle"
                value={profile?.email || ''}
                fullWidth
                disabled
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Chip label="Vérifié" size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, fontSize: '0.68rem' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                helperText="L'adresse email est gérée par l'administrateur Cathedis IT."
              />

              <TextField
                label="Téléphone / Flotte Mobile"
                placeholder="ex: +212 6 00 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Département / Service"
                  value={profile?.department?.name || 'Général'}
                  fullWidth
                  disabled
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Localisation / Siège"
                  value={profile?.department?.location || 'Casablanca, Maroc'}
                  fullWidth
                  disabled
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={savingInfo}
                  startIcon={<SaveIcon />}
                  sx={{
                    background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                    borderRadius: 2.5,
                    px: 3.5,
                    py: 1.2,
                    fontWeight: 800,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(227, 30, 36, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)',
                    }
                  }}
                >
                  {savingInfo ? 'Enregistrement...' : 'Enregistrer les Modifications'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>

        {/* Right Column: Security & Password Change */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3.5,
            p: { xs: 2.5, md: 3.5 },
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(37, 99, 235, 0.08)' }}>
                <SecurityIcon sx={{ color: '#2563EB' }} />
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#1A1A2E' }}>
                  Sécurité du Compte
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Modifiez votre mot de passe d'accès au portail
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleUpdatePassword}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Mot de passe actuel *"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Nouveau mot de passe *"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  required
                  helperText="Minimum 6 caractères"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Confirmer le nouveau mot de passe *"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box sx={{ pt: 1 }}>
                  <Button
                    type="submit"
                    variant="outlined"
                    fullWidth
                    disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                    startIcon={<KeyIcon />}
                    sx={{
                      borderRadius: 2.5,
                      py: 1.2,
                      fontWeight: 800,
                      textTransform: 'none',
                      color: '#1A1A2E',
                      borderColor: '#CBD5E1',
                      '&:hover': {
                        bgcolor: '#F8FAFC',
                        borderColor: '#1A1A2E',
                      }
                    }}
                  >
                    {savingPassword ? 'Mise à jour...' : 'Modifier le Mot de Passe'}
                  </Button>
                </Box>
              </Box>
            </form>
          </Box>

          <Box sx={{ p: 2, mt: 3, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px dashed #E2E8F0' }}>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.8, fontWeight: 600 }}>
              <ShieldIcon sx={{ fontSize: 16, color: '#059669' }} />
              Connexion chiffrée SSL / TLS • Cathedis IT Security Policy
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* 3. Assigned Equipment Responsibility Summary */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3.5,
          p: { xs: 2.5, md: 3.5 },
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(227, 30, 36, 0.08)' }}>
              <ComputerIcon sx={{ color: '#E31E24' }} />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#1A1A2E' }}>
                Matériel Informatique Sous Votre Responsabilité ({assignments.length})
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Liste des équipements enregistrés à votre nom avec conformité des PV d'affectation
              </Typography>
            </Box>
          </Box>
        </Box>

        {assignments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#F8FAFC', borderRadius: 3 }}>
            <ComputerIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1 }} />
            <Typography sx={{ fontWeight: 700, color: '#64748B' }}>Aucun matériel sous votre responsabilité actuellement.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
            {assignments.map((item: any) => (
              <Box
                key={item.id}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderLeft: '4px solid #E31E24',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                  }
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                        {getEquipmentIcon(item.equipment.category)}
                      </Avatar>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A1A2E' }}>
                        {item.equipment.name}
                      </Typography>
                    </Box>
                    {item.isSigned ? (
                      <Chip label="PV Signé ✓" size="small" sx={{ fontSize: '0.68rem', fontWeight: 800, bgcolor: '#ECFDF5', color: '#059669' }} />
                    ) : (
                      <Chip label="PV à Signer ✍️" size="small" sx={{ fontSize: '0.68rem', fontWeight: 800, bgcolor: '#FEF3C7', color: '#D97706' }} />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                    <Chip label={item.equipment.category} size="small" sx={{ fontSize: '0.68rem', fontWeight: 700, bgcolor: '#EFF6FF', color: '#2563EB' }} />
                    <Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748B' }}>
                      SN: {item.equipment.serialNumber || '-'}
                    </Typography>
                    {item.equipment.serialNumber && (
                      <Tooltip title="Copier le N° de série">
                        <IconButton size="small" onClick={() => handleCopy(item.equipment.serialNumber, 'N° de série')} sx={{ p: 0.2, color: '#94A3B8' }}>
                          <ContentCopyIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.72rem', pt: 1, borderTop: '1px solid #F1F5F9' }}>
                  Affecté le {new Date(item.assignedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Snackbar */}
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
