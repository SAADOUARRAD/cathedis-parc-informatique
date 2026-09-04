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
  Chip,
  Tooltip
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const loginSchema = z.object({
  email: z.string().min(1, "L'email professionnel est requis").email("Format d'email invalide"),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<'ADMIN' | 'TECH' | 'EMPLOYEE'>('ADMIN');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleRoleQuickSelect = (role: 'ADMIN' | 'TECH' | 'EMPLOYEE') => {
    setActiveRoleTab(role);
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
        setError('Identifiants incorrects. Veuillez vérifier votre adresse email et mot de passe.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Une erreur de connexion au serveur DSI est survenue. Veuillez réessayer.');
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
      overflow: 'hidden',
      bgcolor: '#070A13',
      fontFamily: 'inherit',
    }}>
      {/* 1. Cinematic Background Image */}
      <Box
        component="img"
        src="/images/img.jpg"
        alt="Cathedis Fleet & Logistics"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          filter: 'brightness(0.35) saturate(1.2)',
          transform: 'scale(1.03)',
          animation: 'slowZoom 20s infinite alternate ease-in-out',
          zIndex: 0,
        }}
      />

      {/* 2. Cyber-Mesh Gradient Overlay */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 15% 30%, rgba(227, 30, 36, 0.18) 0%, transparent 45%),
          radial-gradient(circle at 85% 70%, rgba(14, 165, 233, 0.12) 0%, transparent 50%),
          linear-gradient(135deg, rgba(7, 10, 19, 0.94) 0%, rgba(11, 15, 25, 0.82) 50%, rgba(7, 10, 19, 0.96) 100%)
        `,
        zIndex: 1,
      }} />

      {/* 3. Subtle Cyber Grid Lines */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* 4. Main Container (Left Showcase + Right Login Card) */}
      <Box sx={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: 1400,
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: { xs: 2.5, sm: 4, md: 6, lg: 8 },
        gap: { xs: 4, lg: 8 },
      }}>

        {/* ============================================================ */}
        {/* LEFT COLUMN: BRANDING & FLEET TELEMETRY (Hidden on Mobile)   */}
        {/* ============================================================ */}
        <Box sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 4,
          maxWidth: 620,
        }}>
          {/* Logo Badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="img"
              src="/images/logo.png"
              alt="Cathedis Logo"
              sx={{
                height: { md: 46, lg: 54 },
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 12px rgba(227, 30, 36, 0.4))',
              }}
            />
            <Chip
              label="DSI • Flotte IT"
              size="small"
              sx={{
                bgcolor: 'rgba(227, 30, 36, 0.15)',
                color: '#FF4D4D',
                border: '1px solid rgba(227, 30, 36, 0.4)',
                fontWeight: 800,
                fontSize: '0.75rem',
                letterSpacing: 0.5,
              }}
            />
          </Box>

          {/* Main Headline */}
          <Box>
            <Typography variant="h3" sx={{
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.15,
              fontSize: { md: '2.4rem', lg: '3.1rem' },
              letterSpacing: '-0.02em',
            }}>
              Système d’Information &{' '}
              <Box component="span" sx={{
                background: 'linear-gradient(90deg, #E31E24 0%, #FF5A5F 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Flotte IT Connectée
              </Box>
            </Typography>

            <Typography sx={{
              mt: 2,
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: { md: '1rem', lg: '1.1rem' },
              lineHeight: 1.6,
              maxWidth: 520,
            }}>
              Gestion centralisée des actifs informatiques, maintenance d’atelier assistée par IA et suivi en temps réel de la flotte logistique Cathedis.
            </Typography>
          </Box>

          {/* Telemetry Metric Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <Box sx={{
              p: 2.2,
              borderRadius: 3,
              bgcolor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#E31E24' }}>
                <LocalShippingOutlinedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 900, fontSize: '1.35rem', lineHeight: 1 }}>
                500+
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>
                Assets Actifs
              </Typography>
            </Box>

            <Box sx={{
              p: 2.2,
              borderRadius: 3,
              bgcolor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#0EA5E9' }}>
                <SpeedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 900, fontSize: '1.35rem', lineHeight: 1 }}>
                99.9%
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>
                Disponibilité SLA
              </Typography>
            </Box>

            <Box sx={{
              p: 2.2,
              borderRadius: 3,
              bgcolor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#10B981' }}>
                <BuildCircleOutlinedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 900, fontSize: '1.35rem', lineHeight: 1 }}>
                24/7
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.75rem', fontWeight: 600, mt: 0.5 }}>
                Atelier Technique
              </Typography>
            </Box>
          </Box>

          {/* Live Pulse Indicator */}
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1,
            borderRadius: 99,
            bgcolor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            width: 'fit-content',
          }}>
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#10B981',
              boxShadow: '0 0 10px #10B981',
              animation: 'pulse 2s infinite',
            }} />
            <Typography sx={{ color: '#6EE7B7', fontSize: '0.82rem', fontWeight: 700 }}>
              Flotte connectée • Systèmes informatiques opérationnels
            </Typography>
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: HIGH-END CYBER LOGIN PANEL                     */}
        {/* ============================================================ */}
        <Box sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 460 },
          margin: { xs: '0 auto', md: '0' },
          bgcolor: 'rgba(13, 19, 33, 0.78)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 5,
          overflow: 'hidden',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          position: 'relative',
          animation: 'cardSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>

          {/* Red Glowing Top Accent Bar */}
          <Box sx={{
            height: 4,
            background: 'linear-gradient(90deg, #E31E24 0%, #FF4D4D 50%, #C41018 100%)',
            boxShadow: '0 2px 12px rgba(227, 30, 36, 0.6)',
          }} />

          <Box sx={{ p: { xs: 3, sm: 4.5 } }}>

            {/* Mobile-Only Logo */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 3 }}>
              <Box
                component="img"
                src="/images/logo.png"
                alt="Cathedis Logo"
                sx={{ height: 42, objectFit: 'contain' }}
              />
            </Box>

            {/* Card Header */}
            <Box sx={{ textAlign: 'center', mb: 3.5 }}>
              <Box sx={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                bgcolor: 'rgba(227, 30, 36, 0.15)',
                border: '1px solid rgba(227, 30, 36, 0.5)',
                boxShadow: '0 0 24px rgba(227, 30, 36, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}>
                <SecurityIcon sx={{ color: '#E31E24', fontSize: 30 }} />
              </Box>

              <Typography variant="h5" sx={{
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
                fontSize: '1.5rem',
              }}>
                Accès Flotte & Parc IT
              </Typography>
              <Typography sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.85rem',
                mt: 0.6,
              }}>
                Authentification sécurisée • Portail DSI Cathedis
              </Typography>
            </Box>

            {/* Fast Role Switcher Pills */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              p: 0.6,
              borderRadius: 3,
              bgcolor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              mb: 3,
              gap: 0.5,
            }}>
              <Button
                size="small"
                onClick={() => handleRoleQuickSelect('ADMIN')}
                startIcon={<AdminPanelSettingsOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                sx={{
                  py: 0.8,
                  borderRadius: 2.2,
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  color: activeRoleTab === 'ADMIN' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                  bgcolor: activeRoleTab === 'ADMIN' ? 'rgba(227, 30, 36, 0.85)' : 'transparent',
                  boxShadow: activeRoleTab === 'ADMIN' ? '0 2px 10px rgba(227, 30, 36, 0.4)' : 'none',
                  '&:hover': {
                    bgcolor: activeRoleTab === 'ADMIN' ? '#E31E24' : 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                DSI Admin
              </Button>

              <Button
                size="small"
                onClick={() => handleRoleQuickSelect('TECH')}
                startIcon={<EngineeringOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                sx={{
                  py: 0.8,
                  borderRadius: 2.2,
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  color: activeRoleTab === 'TECH' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                  bgcolor: activeRoleTab === 'TECH' ? 'rgba(14, 165, 233, 0.85)' : 'transparent',
                  boxShadow: activeRoleTab === 'TECH' ? '0 2px 10px rgba(14, 165, 233, 0.4)' : 'none',
                  '&:hover': {
                    bgcolor: activeRoleTab === 'TECH' ? '#0EA5E9' : 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                Technicien
              </Button>

              <Button
                size="small"
                onClick={() => handleRoleQuickSelect('EMPLOYEE')}
                startIcon={<PersonOutlineOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                sx={{
                  py: 0.8,
                  borderRadius: 2.2,
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  color: activeRoleTab === 'EMPLOYEE' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                  bgcolor: activeRoleTab === 'EMPLOYEE' ? 'rgba(16, 185, 129, 0.85)' : 'transparent',
                  boxShadow: activeRoleTab === 'EMPLOYEE' ? '0 2px 10px rgba(16, 185, 129, 0.4)' : 'none',
                  '&:hover': {
                    bgcolor: activeRoleTab === 'EMPLOYEE' ? '#10B981' : 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                Collaborateur
              </Button>
            </Box>

            {/* Error Message */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2.5,
                  borderRadius: 2.5,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  bgcolor: 'rgba(220, 38, 38, 0.15)',
                  color: '#FCA5A5',
                  border: '1px solid rgba(220, 38, 38, 0.35)',
                }}
              >
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>

              {/* Email Input */}
              <Box>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)', mb: 0.6 }}>
                  Email Professionnel
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
                          <EmailOutlinedIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 19 }} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '12px',
                        bgcolor: 'rgba(0, 0, 0, 0.35)',
                        color: '#FFFFFF',
                        fontSize: '0.9rem',
                        '& input': { color: '#FFFFFF', py: 1.3 },
                        '& input::placeholder': { color: 'rgba(255, 255, 255, 0.4)' },
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4) !important' },
                        '&.Mui-focused fieldset': {
                          borderColor: '#E31E24 !important',
                          boxShadow: '0 0 0 3px rgba(227, 30, 36, 0.25)',
                        },
                        '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
                          WebkitBoxShadow: '0 0 0 1000px #0D1321 inset !important',
                          WebkitTextFillColor: '#FFFFFF !important',
                          caretColor: '#FFFFFF',
                        },
                      },
                    },
                  }}
                />
              </Box>

              {/* Password Input */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)' }}>
                    Mot de passe
                  </Typography>
                  <Tooltip title="Contactez la DSI Cathedis (support.it@cathedis.com) pour réinitialiser vos accès." arrow>
                    <Typography sx={{
                      fontSize: '0.78rem',
                      color: '#E31E24',
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' }
                    }}>
                      Oublié ?
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
                          <LockOutlinedIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 19 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                            disabled={isLoading}
                            sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                          >
                            {showPassword ? <VisibilityOff sx={{ fontSize: 19 }} /> : <Visibility sx={{ fontSize: 19 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '12px',
                        bgcolor: 'rgba(0, 0, 0, 0.35)',
                        color: '#FFFFFF',
                        fontSize: '0.9rem',
                        '& input': { color: '#FFFFFF', py: 1.3 },
                        '& input::placeholder': { color: 'rgba(255, 255, 255, 0.4)' },
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4) !important' },
                        '&.Mui-focused fieldset': {
                          borderColor: '#E31E24 !important',
                          boxShadow: '0 0 0 3px rgba(227, 30, 36, 0.25)',
                        },
                        '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
                          WebkitBoxShadow: '0 0 0 1000px #0D1321 inset !important',
                          WebkitTextFillColor: '#FFFFFF !important',
                          caretColor: '#FFFFFF',
                        },
                      },
                    },
                  }}
                />
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 1.2,
                  py: 1.4,
                  borderRadius: '12px',
                  background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  boxShadow: '0 8px 24px rgba(227, 30, 36, 0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #FF333A 0%, #E31E24 100%)',
                    boxShadow: '0 10px 30px rgba(227, 30, 36, 0.55)',
                    transform: 'translateY(-1px)',
                  },
                  '&.Mui-disabled': {
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: 'rgba(255, 255, 255, 0.35)',
                  },
                  transition: 'all 0.25s ease',
                }}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Authentification sécurisée...</span>
                  </Box>
                ) : (
                  'Accéder à la Flotte Informatique 🚀'
                )}
              </Button>
            </Box>

            {/* Footer Trust & Security Badges */}
            <Box sx={{
              mt: 4,
              pt: 2.5,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <CheckCircleIcon sx={{ color: '#10B981', fontSize: 16 }} />
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.74rem', fontWeight: 600 }}>
                  Chiffrement SSL 256-bit
                </Typography>
              </Box>

              <Typography sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.72rem', fontWeight: 600 }}>
                DSI Cathedis • v2.4
              </Typography>
            </Box>

          </Box>
        </Box>
      </Box>

      {/* Dynamic Keyframe Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cardSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.06); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}} />
    </Box>
  );
}
