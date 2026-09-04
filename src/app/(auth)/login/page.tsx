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
      bgcolor: '#090D16',
      p: { xs: 2.5, sm: 4 },
      overflow: 'hidden',
    }}>
      {/* 1. Arrière-plan Cinématique Subtil */}
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
          filter: 'brightness(0.25) saturate(1.1)',
          zIndex: 0,
        }}
      />

      {/* 2. Filtre Dégradé Sombre & Épuré */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 50% 20%, rgba(227, 30, 36, 0.12) 0%, transparent 60%),
          linear-gradient(180deg, rgba(9, 13, 22, 0.85) 0%, rgba(9, 13, 22, 0.95) 100%)
        `,
        zIndex: 1,
      }} />

      {/* 3. Carte de Connexion Centrale Professionnelle */}
      <Box sx={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: 440,
        bgcolor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        animation: 'fadeIn 0.5s ease-out',
      }}>

        {/* Ligne d'accent supérieure rouge Cathedis */}
        <Box sx={{
          height: 3,
          background: 'linear-gradient(90deg, #E31E24 0%, #FF4D4D 50%, #C41018 100%)',
        }} />

        <Box sx={{ p: { xs: 3.5, sm: 4.5 } }}>

          {/* Logo Cathedis Intégré */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 3,
          }}>
            <Box
              component="img"
              src="/images/logo.png"
              alt="Cathedis Logo"
              sx={{
                height: 48,
                maxWidth: 220,
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
              }}
            />
          </Box>

          {/* Titre & Sous-titre Institutionnel */}
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Typography variant="h5" sx={{
              fontWeight: 800,
              color: '#FFFFFF',
              fontSize: '1.45rem',
              letterSpacing: '-0.01em',
            }}>
              Portail Informatique
            </Typography>
            <Typography sx={{
              color: 'rgba(255, 255, 255, 0.65)',
              fontSize: '0.86rem',
              mt: 0.6,
            }}>
              Authentification sécurisée DSI Cathedis
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
                bgcolor: 'rgba(220, 38, 38, 0.15)',
                color: '#FCA5A5',
                border: '1px solid rgba(220, 38, 38, 0.35)',
              }}
            >
              {error}
            </Alert>
          )}

          {/* Formulaire de Connexion */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* Champ Email */}
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', mb: 0.7 }}>
                Identifiant / Email
              </Typography>
              <TextField
                {...register('email')}
                fullWidth
                size="small"
                placeholder="votre.email@cathedis.com"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: '12px',
                      bgcolor: 'rgba(0, 0, 0, 0.3)',
                      color: '#FFFFFF',
                      fontSize: '0.92rem',
                      '& input': { color: '#FFFFFF', py: 1.35 },
                      '& input::placeholder': { color: 'rgba(255, 255, 255, 0.35)' },
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.35) !important' },
                      '&.Mui-focused fieldset': {
                        borderColor: '#E31E24 !important',
                        boxShadow: '0 0 0 3px rgba(227, 30, 36, 0.2)',
                      },
                      '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
                        WebkitBoxShadow: '0 0 0 1000px #0F172A inset !important',
                        WebkitTextFillColor: '#FFFFFF !important',
                        caretColor: '#FFFFFF',
                      },
                    },
                  },
                }}
              />
            </Box>

            {/* Champ Mot de passe */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.7 }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>
                  Mot de passe
                </Typography>
                <Tooltip title="Veuillez contacter le support informatique (support.it@cathedis.com) pour réinitialiser votre mot de passe." arrow>
                  <Typography sx={{
                    fontSize: '0.78rem',
                    color: 'rgba(255, 255, 255, 0.55)',
                    fontWeight: 500,
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
                        <LockOutlinedIcon sx={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          disabled={isLoading}
                          sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                        >
                          {showPassword ? <VisibilityOff sx={{ fontSize: 19 }} /> : <Visibility sx={{ fontSize: 19 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: '12px',
                      bgcolor: 'rgba(0, 0, 0, 0.3)',
                      color: '#FFFFFF',
                      fontSize: '0.92rem',
                      '& input': { color: '#FFFFFF', py: 1.35 },
                      '& input::placeholder': { color: 'rgba(255, 255, 255, 0.35)' },
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 0.35) !important' },
                      '&.Mui-focused fieldset': {
                        borderColor: '#E31E24 !important',
                        boxShadow: '0 0 0 3px rgba(227, 30, 36, 0.2)',
                      },
                      '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
                        WebkitBoxShadow: '0 0 0 1000px #0F172A inset !important',
                        WebkitTextFillColor: '#FFFFFF !important',
                        caretColor: '#FFFFFF',
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
                fontSize: '0.96rem',
                fontWeight: 700,
                letterSpacing: '0.01em',
                boxShadow: '0 4px 14px rgba(227, 30, 36, 0.35)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)',
                  boxShadow: '0 6px 20px rgba(227, 30, 36, 0.5)',
                  transform: 'translateY(-1px)',
                },
                '&.Mui-disabled': {
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.35)',
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

          {/* Pied de Page Sécurisé & Sobre */}
          <Box sx={{
            mt: 4,
            pt: 2.5,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}>
            <ShieldOutlinedIcon sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 16 }} />
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.74rem', fontWeight: 500 }}>
              Connexion sécurisée SSL • DSI Cathedis
            </Typography>
          </Box>

        </Box>
      </Box>

      {/* Animation d'apparition douce */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </Box>
  );
}
