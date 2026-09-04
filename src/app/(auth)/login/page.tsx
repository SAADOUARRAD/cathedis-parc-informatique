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

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

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
      bgcolor: '#0B0F19',
      p: { xs: 2.5, sm: 4 },
      overflow: 'hidden',
    }}>
      {/* 1. Arrière-plan Cinématique Élégant */}
      <Box
        component="img"
        src="/images/img.jpg"
        alt="Cathedis Background"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          filter: 'brightness(0.3) saturate(1.1)',
          zIndex: 0,
        }}
      />

      {/* 2. Filtre Dégradé de Profondeur */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 50% 30%, rgba(227, 30, 36, 0.15) 0%, transparent 65%),
          linear-gradient(180deg, rgba(11, 15, 25, 0.85) 0%, rgba(11, 15, 25, 0.95) 100%)
        `,
        zIndex: 1,
      }} />

      {/* 3. Carte de Connexion Blanche Haut de Gamme */}
      <Box sx={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: 440,
        bgcolor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>

        {/* Barre d'accent supérieure rouge Cathedis */}
        <Box sx={{
          height: 4,
          background: 'linear-gradient(90deg, #E31E24 0%, #FF4D4D 50%, #C41018 100%)',
        }} />

        <Box sx={{ p: { xs: 3.5, sm: 4.5 } }}>

          {/* Logo Cathedis 2 Intégré */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2.5,
          }}>
            <Box
              component="img"
              src="/images/logo2.png"
              alt="Cathedis Logo"
              sx={{
                height: 52,
                maxWidth: 240,
                objectFit: 'contain',
              }}
            />
          </Box>

          {/* Titre & Sous-titre Institutionnel */}
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Typography variant="h5" sx={{
              fontWeight: 800,
              color: '#0F172A',
              fontSize: '1.4rem',
              letterSpacing: '-0.02em',
            }}>
              Espace Authentification
            </Typography>
            <Typography sx={{
              color: '#64748B',
              fontSize: '0.86rem',
              mt: 0.6,
              fontWeight: 500,
            }}>
              Portail de gestion du parc informatique DSI
            </Typography>
          </Box>

          {/* Message d'erreur */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2.5,
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

          {/* Formulaire de Connexion */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.4 }}>

            {/* Champ Email */}
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.7 }}>
                Identifiant / Email professionnel
              </Typography>
              <TextField
                {...register('email')}
                fullWidth
                size="small"
                placeholder="nom.prenom@cathedis.com"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: '12px',
                      bgcolor: '#F8FAFC',
                      color: '#0F172A',
                      fontSize: '0.92rem',
                      fontWeight: 500,
                      '& input': { color: '#0F172A', py: 1.35 },
                      '& input::placeholder': { color: '#94A3B8' },
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#CBD5E1 !important' },
                      '&.Mui-focused': {
                        bgcolor: '#FFFFFF',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#E31E24 !important',
                        boxShadow: '0 0 0 3px rgba(227, 30, 36, 0.15)',
                      },
                    },
                  },
                }}
              />
            </Box>

            {/* Champ Mot de passe */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.7 }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                  Mot de passe
                </Typography>
                <Tooltip title="Veuillez contacter le support informatique (support.it@cathedis.com) pour réinitialiser votre mot de passe." arrow>
                  <Typography sx={{
                    fontSize: '0.78rem',
                    color: '#64748B',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                    '&:hover': { color: '#E31E24' }
                  }}>
                    Mot de passe oublié ?
                  </Typography>
                </Tooltip>
              </Box>

              <TextField
                {...register('password')}
                fullWidth
                size="small"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
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
                      bgcolor: '#F8FAFC',
                      color: '#0F172A',
                      fontSize: '0.92rem',
                      fontWeight: 500,
                      '& input': { color: '#0F172A', py: 1.35 },
                      '& input::placeholder': { color: '#94A3B8' },
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#CBD5E1 !important' },
                      '&.Mui-focused': {
                        bgcolor: '#FFFFFF',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#E31E24 !important',
                        boxShadow: '0 0 0 3px rgba(227, 30, 36, 0.15)',
                      },
                    },
                  },
                }}
              />
            </Box>

            {/* Bouton de Connexion */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 1,
                py: 1.4,
                borderRadius: '12px',
                background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                color: '#FFFFFF',
                textTransform: 'none',
                fontSize: '0.98rem',
                fontWeight: 800,
                letterSpacing: '0.01em',
                boxShadow: '0 4px 14px rgba(227, 30, 36, 0.35)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)',
                  boxShadow: '0 6px 20px rgba(227, 30, 36, 0.45)',
                  transform: 'translateY(-1px)',
                },
                '&.Mui-disabled': {
                  background: '#CBD5E1',
                  color: '#94A3B8',
                },
              }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Connexion en cours...</span>
                </Box>
              ) : (
                'Se connecter'
              )}
            </Button>
          </Box>

          {/* Pied de Page Sécurisé */}
          <Box sx={{
            mt: 4,
            pt: 2.5,
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}>
            <ShieldOutlinedIcon sx={{ color: '#94A3B8', fontSize: 16 }} />
            <Typography sx={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600 }}>
              Connexion sécurisée SSL • DSI Cathedis
            </Typography>
          </Box>

        </Box>
      </Box>

      {/* Animation d'apparition */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </Box>
  );
}
