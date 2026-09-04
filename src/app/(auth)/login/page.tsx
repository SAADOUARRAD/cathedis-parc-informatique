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
  Checkbox,
  FormControlLabel,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CloseIcon from '@mui/icons-material/Close';

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
  const [rememberMe, setRememberMe] = useState(true);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Handle CapsLock detection for password input
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
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
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#070A13',
      p: { xs: 2, sm: 3, md: 4 },
      overflow: 'hidden',
      fontFamily: 'inherit',
    }}>
      {/* 1. Arrière-plan Cinématique avec Effet de Flou & Profondeur */}
      <Box
        component="img"
        src="/images/img.jpg"
        alt="Cathedis Fleet"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          filter: 'brightness(0.28) saturate(1.2)',
          transform: 'scale(1.02)',
          zIndex: 0,
        }}
      />

      {/* 2. Orbes de Lumière Ambiante Animée (Mesh Glows) */}
      <Box sx={{
        position: 'absolute',
        width: { xs: 320, md: 650 },
        height: { xs: 320, md: 650 },
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(227, 30, 36, 0.22) 0%, rgba(227, 30, 36, 0.02) 60%, transparent 80%)',
        top: '15%',
        left: '12%',
        filter: 'blur(60px)',
        zIndex: 1,
        animation: 'floatGlow 14s infinite alternate ease-in-out',
        pointerEvents: 'none',
      }} />

      <Box sx={{
        position: 'absolute',
        width: { xs: 300, md: 550 },
        height: { xs: 300, md: 550 },
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(14, 165, 233, 0.02) 60%, transparent 80%)',
        bottom: '10%',
        right: '15%',
        filter: 'blur(70px)',
        zIndex: 1,
        animation: 'floatGlowReverse 16s infinite alternate ease-in-out',
        pointerEvents: 'none',
      }} />

      {/* 3. Filtre de Contraste Sombre & Grille Cyber Discrète */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(7, 10, 19, 0.92) 0%, rgba(11, 15, 25, 0.82) 50%, rgba(7, 10, 19, 0.95) 100%)',
        zIndex: 1,
      }} />

      <Box sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.018) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.018) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* 4. Carte de Connexion Deluxe Frosted Glass */}
      <Box sx={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: 450,
        bgcolor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderRadius: '28px',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
        animation: 'cardSlideUp 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>

        {/* Ligne d'accent lumineuse supérieure rouge Cathedis */}
        <Box sx={{
          height: 3.5,
          background: 'linear-gradient(90deg, #E31E24 0%, #FF4D4D 50%, #C41018 100%)',
          boxShadow: '0 2px 10px rgba(227, 30, 36, 0.5)',
        }} />

        <Box sx={{ p: { xs: 3.5, sm: 4.5 } }}>

          {/* Logo 1 directement sur le formulaire */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2.5,
          }}>
            <Box
              component="img"
              src="/images/logo1.png"
              alt="Cathedis Logo"
              sx={{
                height: 52,
                maxWidth: 240,
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4))',
              }}
            />
          </Box>

          {/* Titre & Sous-titre Institutionnel */}
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Typography variant="h5" sx={{
              fontWeight: 900,
              color: '#FFFFFF',
              fontSize: '1.45rem',
              letterSpacing: '-0.02em',
            }}>
              Portail Informatique
            </Typography>

            <Typography sx={{
              color: 'rgba(255, 255, 255, 0.65)',
              fontSize: '0.85rem',
              mt: 0.5,
              fontWeight: 500,
            }}>
              Authentification sécurisée • Parc IT Cathedis
            </Typography>
          </Box>

          {/* Alerte d'erreur avec animation */}
          {error && (
            <Fade in={!!error}>
              <Alert
                severity="error"
                sx={{
                  mb: 2.8,
                  borderRadius: '14px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  bgcolor: 'rgba(220, 38, 38, 0.18)',
                  color: '#FCA5A5',
                  border: '1px solid rgba(220, 38, 38, 0.4)',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.15)',
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {/* Formulaire de Connexion */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.4 }}>

            {/* Champ Email Professionnel */}
            <Box>
              <Typography sx={{ fontSize: '0.81rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)', mb: 0.7 }}>
                Identifiant / Email Professionnel
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
                        <EmailOutlinedIcon sx={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 19 }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: '14px',
                      bgcolor: 'rgba(0, 0, 0, 0.4)',
                      color: '#FFFFFF',
                      fontSize: '0.91rem',
                      fontWeight: 500,
                      transition: 'all 0.25s ease',
                      '& input': { color: '#FFFFFF', py: 1.35 },
                      '& input::placeholder': { color: 'rgba(255, 255, 255, 0.35)' },
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.14)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.35) !important' },
                      '&.Mui-focused': {
                        bgcolor: 'rgba(0, 0, 0, 0.55)',
                      },
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

            {/* Champ Mot de Passe */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.7 }}>
                <Typography sx={{ fontSize: '0.81rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)' }}>
                  Mot de passe
                </Typography>
                <Typography
                  onClick={() => setForgotPasswordOpen(true)}
                  sx={{
                    fontSize: '0.78rem',
                    color: '#FF5A5F',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                    '&:hover': { color: '#FFA4A7', textDecoration: 'underline' }
                  }}
                >
                  Mot de passe oublié ?
                </Typography>
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
                onKeyUp={handleKeyUp}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 19 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          disabled={isLoading}
                          sx={{ color: 'rgba(255, 255, 255, 0.55)', '&:hover': { color: '#FFFFFF' } }}
                        >
                          {showPassword ? <VisibilityOff sx={{ fontSize: 19 }} /> : <Visibility sx={{ fontSize: 19 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: '14px',
                      bgcolor: 'rgba(0, 0, 0, 0.4)',
                      color: '#FFFFFF',
                      fontSize: '0.91rem',
                      fontWeight: 500,
                      transition: 'all 0.25s ease',
                      '& input': { color: '#FFFFFF', py: 1.35 },
                      '& input::placeholder': { color: 'rgba(255, 255, 255, 0.35)' },
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.14)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.35) !important' },
                      '&.Mui-focused': {
                        bgcolor: 'rgba(0, 0, 0, 0.55)',
                      },
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

              {/* Indicateur de Verr. Majuscule actif */}
              {isCapsLockOn && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.8, color: '#FBBF24' }}>
                  <WarningAmberOutlinedIcon sx={{ fontSize: 15 }} />
                  <Typography sx={{ fontSize: '0.74rem', fontWeight: 600 }}>
                    Touche Verrouillage Majuscule activée
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Ligne Options : Mémoriser la session */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.4)',
                      '&.Mui-checked': { color: '#E31E24' },
                      p: 0.5,
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}>
                    Mémoriser ma session
                  </Typography>
                }
              />

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                px: 1.2,
                py: 0.4,
                borderRadius: '8px',
                bgcolor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                <Typography sx={{ color: '#6EE7B7', fontSize: '0.72rem', fontWeight: 700 }}>
                  Serveur DSI Actif
                </Typography>
              </Box>
            </Box>

            {/* Bouton de Connexion Se connecter */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 1,
                py: 1.45,
                borderRadius: '14px',
                background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                color: '#FFFFFF',
                textTransform: 'none',
                fontSize: '0.98rem',
                fontWeight: 800,
                letterSpacing: '0.02em',
                boxShadow: '0 8px 24px rgba(227, 30, 36, 0.4)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s ease',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FF333A 0%, #E31E24 100%)',
                  boxShadow: '0 10px 30px rgba(227, 30, 36, 0.55)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(1px) scale(0.99)',
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
                  <span>Vérification des accès...</span>
                </Box>
              ) : (
                'Se connecter'
              )}
            </Button>
          </Box>

          {/* Pied de Page Sécurisé & Certification */}
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
              <ShieldOutlinedIcon sx={{ color: '#10B981', fontSize: 16 }} />
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

      {/* Modale d'Assistance Mot de Passe Oublié */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '22px', bgcolor: '#0F172A', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)', p: 1 } } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <KeyOutlinedIcon sx={{ color: '#E31E24' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1.15rem' }}>
              Réinitialisation DSI
            </Typography>
          </Box>
          <IconButton onClick={() => setForgotPasswordOpen(false)} size="small" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', lineHeight: 1.6 }}>
            Pour des raisons de sécurité liées à la politique de l&apos;infrastructure Cathedis, la réinitialisation de votre mot de passe nécessite une validation par l&apos;administrateur IT.
          </Typography>

          <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(227, 30, 36, 0.1)', border: '1px solid rgba(227, 30, 36, 0.3)', mt: 2 }}>
            <Typography sx={{ color: '#FF7075', fontSize: '0.8rem', fontWeight: 700 }}>
              Contact Assistance Informatique :
            </Typography>
            <Typography sx={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 600, mt: 0.3 }}>
              support.it@cathedis.com
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', mt: 0.5 }}>
              Interne : Poste 104 • Disponible du Lundi au Vendredi
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setForgotPasswordOpen(false)}
            variant="contained"
            fullWidth
            sx={{
              borderRadius: '12px',
              bgcolor: '#E31E24',
              color: '#FFFFFF',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { bgcolor: '#C41018' },
            }}
          >
            Compris
          </Button>
        </DialogActions>
      </Dialog>

      {/* Animations CSS fluides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cardSlideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes floatGlow {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, 30px) scale(1.15); }
        }
        @keyframes floatGlowReverse {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-35px, -25px) scale(1.1); }
        }
      `}} />
    </Box>
  );
}
