'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

const loginSchema = z.object({
  email: z.string().min(1, "L'adresse email est requise").email("Format d'email invalide"),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'TECH' | 'USER'>('ADMIN');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleRoleChange = (role: 'ADMIN' | 'TECH' | 'USER') => {
    setSelectedRole(role);
    if (role === 'ADMIN') {
      setValue('email', 'admin@cathedis.com');
      setValue('password', 'Admin@2024');
    } else if (role === 'TECH') {
      setValue('email', 'technicien@cathedis.com');
      setValue('password', 'Tech@2024');
    } else {
      setValue('email', 'employe@cathedis.com');
      setValue('password', 'User@2024');
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (result?.error) {
        setError('Adresse email ou mot de passe incorrect.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Une erreur réseau est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#F8FAFC',
      backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      p: { xs: 2.5, sm: 4 },
      overflow: 'hidden',
      fontFamily: 'inherit',
    }}>
      {/* Halo lumineux très doux en arrière-plan */}
      <Box sx={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(227, 30, 36, 0.04) 0%, rgba(248, 250, 252, 0) 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      {/* Carte Blanche Concept 3 (Style Apple / Stripe) */}
      <Box sx={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: 420,
        bgcolor: '#FFFFFF',
        borderRadius: '28px',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)',
        p: { xs: 3.5, sm: 4.5 },
        animation: 'cardAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>

        {/* Logo Cathedis 2 */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2.5,
        }}>
          <Box
            component="img"
            src="/images/logo2.png"
            alt="Cathedis"
            sx={{
              height: 48,
              maxWidth: 220,
              objectFit: 'contain',
            }}
          />
        </Box>

        {/* Titre & Sous-titre Épuré */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography sx={{
            fontWeight: 800,
            color: '#0F172A',
            fontSize: '1.45rem',
            letterSpacing: '-0.02em',
          }}>
            Connexion au Portail IT
          </Typography>
          <Typography sx={{
            color: '#64748B',
            fontSize: '0.88rem',
            mt: 0.5,
            fontWeight: 500,
          }}>
            Gestion centralisée du parc
          </Typography>
        </Box>

        {/* Sélecteur de profil en pilule segmentée */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          p: 0.5,
          borderRadius: '14px',
          bgcolor: '#F1F5F9',
          mb: 3,
          gap: 0.5,
        }}>
          <Button
            size="small"
            onClick={() => handleRoleChange('ADMIN')}
            sx={{
              py: 0.7,
              borderRadius: '10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'none',
              color: selectedRole === 'ADMIN' ? '#0F172A' : '#64748B',
              bgcolor: selectedRole === 'ADMIN' ? '#FFFFFF' : 'transparent',
              boxShadow: selectedRole === 'ADMIN' ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
              '&:hover': {
                bgcolor: selectedRole === 'ADMIN' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
              },
            }}
          >
            Administrateur
          </Button>

          <Button
            size="small"
            onClick={() => handleRoleChange('TECH')}
            sx={{
              py: 0.7,
              borderRadius: '10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'none',
              color: selectedRole === 'TECH' ? '#0F172A' : '#64748B',
              bgcolor: selectedRole === 'TECH' ? '#FFFFFF' : 'transparent',
              boxShadow: selectedRole === 'TECH' ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
              '&:hover': {
                bgcolor: selectedRole === 'TECH' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
              },
            }}
          >
            Technicien
          </Button>

          <Button
            size="small"
            onClick={() => handleRoleChange('USER')}
            sx={{
              py: 0.7,
              borderRadius: '10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'none',
              color: selectedRole === 'USER' ? '#0F172A' : '#64748B',
              bgcolor: selectedRole === 'USER' ? '#FFFFFF' : 'transparent',
              boxShadow: selectedRole === 'USER' ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
              '&:hover': {
                bgcolor: selectedRole === 'USER' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
              },
            }}
          >
            Collaborateur
          </Button>
        </Box>

        {/* Message d'erreur */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2.5,
              borderRadius: '12px',
              fontSize: '0.84rem',
              fontWeight: 600,
              bgcolor: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FEE2E2',
            }}
          >
            {error}
          </Alert>
        )}

        {/* Formulaire */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Champ Email */}
          <TextField
            {...register('email')}
            fullWidth
            size="small"
            placeholder="Email"
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={isLoading}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '12px',
                  bgcolor: '#FFFFFF',
                  color: '#0F172A',
                  fontSize: '0.92rem',
                  '& input': { color: '#0F172A', py: 1.3 },
                  '& input::placeholder': { color: '#94A3B8' },
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#CBD5E1 !important' },
                  '&.Mui-focused fieldset': {
                    borderColor: '#E31E24 !important',
                    boxShadow: '0 0 0 3px rgba(227, 30, 36, 0.12)',
                  },
                },
              },
            }}
          />

          {/* Champ Mot de passe */}
          <TextField
            {...register('password')}
            fullWidth
            size="small"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mot de passe"
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isLoading}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      disabled={isLoading}
                      sx={{ color: '#94A3B8' }}
                    >
                      {showPassword ? <VisibilityOff sx={{ fontSize: 19 }} /> : <Visibility sx={{ fontSize: 19 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '12px',
                  bgcolor: '#FFFFFF',
                  color: '#0F172A',
                  fontSize: '0.92rem',
                  '& input': { color: '#0F172A', py: 1.3 },
                  '& input::placeholder': { color: '#94A3B8' },
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#CBD5E1 !important' },
                  '&.Mui-focused fieldset': {
                    borderColor: '#E31E24 !important',
                    boxShadow: '0 0 0 3px rgba(227, 30, 36, 0.12)',
                  },
                },
              },
            }}
          />

          {/* Bouton d'action rouge signature */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              mt: 1,
              py: 1.35,
              borderRadius: '12px',
              bgcolor: '#E31E24',
              color: '#FFFFFF',
              textTransform: 'none',
              fontSize: '0.96rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(227, 30, 36, 0.25)',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#C41018',
                boxShadow: '0 6px 16px rgba(227, 30, 36, 0.35)',
                transform: 'translateY(-1px)',
              },
              '&.Mui-disabled': {
                bgcolor: '#CBD5E1',
                color: '#94A3B8',
              },
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={18} color="inherit" />
                <span>Accès en cours...</span>
              </Box>
            ) : (
              'Accéder à mon espace'
            )}
          </Button>
        </Box>

        {/* Pied de Page Concept 3 */}
        <Box sx={{
          mt: 4,
          pt: 2.5,
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Typography sx={{ color: '#94A3B8', fontSize: '0.74rem', fontWeight: 500 }}>
            Chiffrement SSL 256-bit
          </Typography>

          <Typography sx={{ color: '#94A3B8', fontSize: '0.74rem', fontWeight: 500 }}>
            DSI Cathedis
          </Typography>
        </Box>

      </Box>

      {/* Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cardAppear {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </Box>
  );
}
