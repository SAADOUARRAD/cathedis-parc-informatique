'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box, TextField, Button, Typography, Alert, CircularProgress,
  InputAdornment, IconButton
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ComputerIcon from '@mui/icons-material/Computer';
import PeopleIcon from '@mui/icons-material/People';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';

const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const stats = [
  { icon: <ComputerIcon />, value: '500+', label: 'Équipements' },
  { icon: <PeopleIcon />, value: '50+', label: 'Utilisateurs' },
  { icon: <SpeedIcon />, value: '99.9%', label: 'Disponibilité' },
  { icon: <SecurityIcon />, value: 'Sécurité', label: '& Performance' },
];

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
        setError('Email ou mot de passe incorrect');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Une erreur est survenue lors de la connexion');
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
    }}>
      {/* Full Background Image */}
      <Box
        component="img"
        src="/images/img.jpg"
        alt=""
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0,
        }}
      />
      {/* Dark Overlay */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)',
        zIndex: 1,
      }} />



      {/* Centered Login Card */}
      <Box sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
        p: { xs: 3, sm: 4 },
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: 400,
          bgcolor: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.2)',
          position: 'relative',
          animation: 'fadeUp 0.6s ease-out',
        }}>
          {/* Red Top Border */}
          <Box sx={{
            height: 4,
            background: 'linear-gradient(90deg, #E31E24, #C41018)',
          }} />

          {/* Lock Icon */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: -0.5,
            pt: 3,
          }}>
            <Box sx={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: 'rgba(227,30,36,0.15)',
              border: '3px solid rgba(227,30,36,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LockOutlinedIcon sx={{ color: '#E31E24', fontSize: 34 }} />
            </Box>
          </Box>

          {/* Title */}
          <Typography sx={{
            textAlign: 'center',
            fontSize: '1.6rem',
            fontWeight: 700,
            color: '#fff',
            mt: 2,
            mb: 3,
          }}>
            Connexion
          </Typography>

          {/* Form */}
          <Box sx={{ px: 4, pb: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.85rem' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Email */}
              <Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>
                  Email
                </Typography>
                <TextField
                  {...register('email')}
                  fullWidth
                  size="small"
                  placeholder="Entrez votre email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isLoading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '12px',
                        bgcolor: 'rgba(255,255,255,0.12)',
                        color: '#fff',
                        '& input': { color: '#fff' },
                        '& input::placeholder': { color: 'rgba(255,255,255,0.6)' },
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4) !important' },
                        '&.Mui-focused fieldset': { borderColor: '#E31E24 !important' },
                        '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                          WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                          WebkitTextFillColor: '#ffffff !important',
                          caretColor: '#ffffff',
                          transition: 'background-color 5000000s ease-in-out 0s',
                          backgroundColor: 'transparent !important',
                        },
                      },
                    },
                  }}
                />
              </Box>

              {/* Password */}
              <Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>
                  Mot de passe
                </Typography>
                <TextField
                  {...register('password')}
                  fullWidth
                  size="small"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Entrez votre mot de passe"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isLoading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                            disabled={isLoading}
                          >
                            {showPassword ? <VisibilityOff sx={{ fontSize: 20, color: 'rgba(255,255,255,0.6)' }} /> : <Visibility sx={{ fontSize: 20, color: 'rgba(255,255,255,0.6)' }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '12px',
                        bgcolor: 'rgba(255,255,255,0.12)',
                        color: '#fff',
                        '& input': { color: '#fff' },
                        '& input::placeholder': { color: 'rgba(255,255,255,0.6)' },
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4) !important' },
                        '&.Mui-focused fieldset': { borderColor: '#E31E24 !important' },
                        '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                          WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                          WebkitTextFillColor: '#ffffff !important',
                          caretColor: '#ffffff',
                          transition: 'background-color 5000000s ease-in-out 0s',
                          backgroundColor: 'transparent !important',
                        },
                      },
                    },
                  }}
                />
              </Box>

              {/* Forgot password */}
              <Typography sx={{ textAlign: 'right', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', '&:hover': { color: '#E31E24' } }}>
                Mot de passe oublié ?
              </Typography>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 1,
                  py: 1.3,
                  borderRadius: '12px',
                  background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                  color: '#fff',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(227, 30, 36, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)',
                    boxShadow: '0 6px 20px rgba(227, 30, 36, 0.4)',
                  },
                  '&.Mui-disabled': { background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)' },
                }}
              >
                {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Se connecter'}
              </Button>

              {/* Divider */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 0.5 }}>
                <Box sx={{ flex: 1, height: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
                <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>ou</Typography>
                <Box sx={{ flex: 1, height: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
              </Box>

              {/* Register Button */}
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  py: 1.3,
                  borderRadius: '12px',
                  borderColor: 'rgba(255,255,255,0.4)',
                  color: '#fff',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#E31E24',
                    bgcolor: 'rgba(227, 30, 36, 0.1)',
                  },
                }}
              >
                {"S'inscrire"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </Box>
  );
}
