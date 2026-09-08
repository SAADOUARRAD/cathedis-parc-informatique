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
  DialogActions,
  Container,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';

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
  const [registerInfoOpen, setRegisterInfoOpen] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

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
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        maxHeight: '100vh',
        width: '100vw',
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: '#0B1120',
      }}
    >
      {/* 1. Image de fond haute définition plein écran sans rognage gênant (fond.png) */}
      <Box
        component="img"
        src="/images/fond.png"
        alt="Cathedis Workplace"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0,
          filter: 'brightness(0.93) contrast(1.04)',
        }}
      />

      {/* 2. Léger voile sombre pour rehausser le contraste et le texte */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(7, 10, 19, 0.42) 0%, rgba(7, 10, 19, 0.18) 50%, rgba(7, 10, 19, 0.45) 100%)',
          zIndex: 1,
        }}
      />

      {/* 3. Contenu principal structuré en 2 colonnes (calibré pour 0 défilement) */}
      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          zIndex: 2,
          height: '100vh',
          maxHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 2, md: 3 },
          px: { xs: 2.5, sm: 4, md: 6, lg: 8 },
          overflow: 'hidden',
        }}
      >
        {/* Corps central : Textes à gauche & Formulaire Glassmorphism à droite */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            gap: { xs: 3, md: 5, lg: 7 },
            transform: { md: 'translateY(-20px)', lg: 'translateY(-28px)' },
            transition: 'transform 0.3s ease',
          }}
        >
          {/* Colonne Gauche : Espace Collaboratif & Titre */}
          <Box
            sx={{
              maxWidth: { xs: '100%', md: 480, lg: 520 },
              textAlign: { xs: 'center', md: 'left' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', md: 'flex-start' },
            }}
          >
            {/* Barre décorative rouge */}
            <Box
              sx={{
                width: 38,
                height: 3.5,
                bgcolor: '#E31E24',
                borderRadius: '2px',
                mb: 1.5,
              }}
            />

            {/* Surtitre Espace Collaboratif */}
            <Typography
              variant="overline"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 600,
                letterSpacing: '2.5px',
                fontSize: { xs: '0.75rem', sm: '0.82rem' },
                textTransform: 'uppercase',
                mb: 1.2,
              }}
            >
              ESPACE COLLABORATIF
            </Typography>

            {/* Titre principal */}
            <Typography
              component="h1"
              sx={{
                color: '#FFFFFF',
                fontSize: { xs: '2rem', sm: '2.5rem', lg: '3.1rem' },
                lineHeight: 1.15,
                fontWeight: 700,
                letterSpacing: '-0.5px',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.75)',
                mb: 0.8,
              }}
            >
              Connectez-vous
            </Typography>
            <Typography
              component="h2"
              sx={{
                color: '#FFFFFF',
                fontSize: { xs: '2rem', sm: '2.5rem', lg: '3.1rem' },
                lineHeight: 1.15,
                fontWeight: 300,
                letterSpacing: '-0.5px',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.75)',
                mb: 2,
              }}
            >
              à votre espace
            </Typography>

            {/* Sous-titre descriptif */}
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.75)',
                fontSize: { xs: '0.92rem', sm: '1rem' },
                lineHeight: 1.6,
                maxWidth: 420,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)',
              }}
            >
              Gérez vos équipements informatiques en toute simplicité.
            </Typography>
          </Box>

          {/* Colonne Droite : Carte Frosted Glass Formulaire (Remontée et même couleur que les champs) */}
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: 380, sm: 420, md: 440 },
              backdropFilter: 'blur(16px) saturate(160%)',
              WebkitBackdropFilter: 'blur(16px) saturate(160%)',
              backgroundColor: 'rgba(14, 22, 38, 0.22)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: '24px',
              p: { xs: 2.5, sm: 3.5, md: 4 },
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
            }}
          >
            {/* Titre Connexion */}
            <Typography
              component="h3"
              sx={{
                color: '#FFFFFF',
                fontSize: { xs: '1.65rem', sm: '1.9rem' },
                fontWeight: 700,
                letterSpacing: '-0.5px',
                mb: 0.6,
              }}
            >
              Connexion
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: '0.88rem',
                mb: 2.5,
              }}
            >
              Accédez à votre espace de gestion.
            </Typography>

            {/* Message d'erreur */}
            {error && (
              <Fade in={Boolean(error)}>
                <Alert
                  severity="error"
                  onClose={() => setError(null)}
                  sx={{
                    mb: 2,
                    bgcolor: 'rgba(239, 68, 68, 0.15)',
                    color: '#FCA5A5',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    borderRadius: '12px',
                    fontSize: '0.82rem',
                    '& .MuiAlert-icon': { color: '#EF4444' },
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Formulaire */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Champ Email (Même couleur de fond que le formulaire) */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Entrez votre email"
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  {...register('email')}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 48,
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      transition: 'all 0.2s ease',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.18)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.38)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#E31E24',
                        borderWidth: 1.5,
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: '#FFFFFF !important',
                      fontSize: '0.92rem',
                      bgcolor: 'transparent !important',
                    },
                    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                      WebkitBackgroundClip: 'text !important',
                      WebkitTextFillColor: '#FFFFFF !important',
                      caretColor: '#FFFFFF !important',
                      transition: 'background-color 5000000s ease-in-out 0s',
                      boxShadow: 'none !important',
                      WebkitBoxShadow: 'none !important',
                      backgroundColor: 'transparent !important',
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.45)',
                      opacity: 1,
                      fontSize: '0.9rem',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#FCA5A5',
                      fontSize: '0.75rem',
                      mt: 0.5,
                    },
                  }}
                />
              </Box>

              {/* Champ Mot de passe (Même couleur de fond que le formulaire) */}
              <Box sx={{ mb: 1.6 }}>
                <TextField
                  fullWidth
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Entrez votre mot de passe"
                  onKeyUp={handleKeyUp}
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  {...register('password')}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                            sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: '#FFFFFF' } }}
                          >
                            {showPassword ? <VisibilityOff sx={{ fontSize: 19 }} /> : <Visibility sx={{ fontSize: 19 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 48,
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      transition: 'all 0.2s ease',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.18)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.38)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#E31E24',
                        borderWidth: 1.5,
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: '#FFFFFF !important',
                      fontSize: '0.92rem',
                      bgcolor: 'transparent !important',
                    },
                    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                      WebkitBackgroundClip: 'text !important',
                      WebkitTextFillColor: '#FFFFFF !important',
                      caretColor: '#FFFFFF !important',
                      transition: 'background-color 5000000s ease-in-out 0s',
                      boxShadow: 'none !important',
                      WebkitBoxShadow: 'none !important',
                      backgroundColor: 'transparent !important',
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.45)',
                      opacity: 1,
                      fontSize: '0.9rem',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#FCA5A5',
                      fontSize: '0.75rem',
                      mt: 0.5,
                    },
                  }}
                />
              </Box>

              {/* Avertissement Caps Lock */}
              {isCapsLockOn && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.2, px: 0.5 }}>
                  <WarningAmberOutlinedIcon sx={{ color: '#FBBF24', fontSize: 15 }} />
                  <Typography sx={{ color: '#FBBF24', fontSize: '0.74rem' }}>
                    Touche Verr. Maj (Caps Lock) activée
                  </Typography>
                </Box>
              )}

              {/* Ligne "Se souvenir de moi" & "Mot de passe oublié ?" */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2.5,
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.4)',
                        p: 0.5,
                        '&.Mui-checked': {
                          color: '#E31E24',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.82rem' }}>
                      Se souvenir de moi
                    </Typography>
                  }
                  sx={{ ml: -0.5, mr: 0 }}
                />

                <Button
                  variant="text"
                  onClick={() => setForgotPasswordOpen(true)}
                  sx={{
                    p: 0,
                    minWidth: 'auto',
                    color: '#E31E24',
                    fontSize: '0.82rem',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      background: 'transparent',
                      textDecoration: 'underline',
                      color: '#FF3B42',
                    },
                  }}
                >
                  Mot de passe oublié ?
                </Button>
              </Box>

              {/* Bouton de Soumission Rouge Gradient */}
              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                sx={{
                  height: 48,
                  borderRadius: '13px',
                  background: 'linear-gradient(135deg, #E31E24 0%, #C4141A 100%)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  letterSpacing: '0.2px',
                  boxShadow: '0 8px 24px rgba(227, 30, 36, 0.42)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FF2E36 0%, #D8171E 100%)',
                    boxShadow: '0 10px 28px rgba(227, 30, 36, 0.55)',
                    transform: 'translateY(-1.5px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&.Mui-disabled': {
                    background: 'rgba(227, 30, 36, 0.5)',
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={22} sx={{ color: '#FFFFFF' }} />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <span>Se connecter</span>
                    <ArrowForwardIcon sx={{ fontSize: 18 }} />
                  </Box>
                )}
              </Button>

              {/* Pied de carte : "Pas encore membre ?" & "Créer un compte" */}
              <Box sx={{ textAlign: 'center', mt: 2.5 }}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.82rem' }}>
                  Pas encore membre ?
                </Typography>
                <Button
                  variant="text"
                  onClick={() => setRegisterInfoOpen(true)}
                  sx={{
                    p: 0,
                    mt: 0.3,
                    minWidth: 'auto',
                    color: '#E31E24',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'transparent',
                      textDecoration: 'underline',
                      color: '#FF3B42',
                    },
                  }}
                >
                  Créer un compte
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* MODAL 1 : Mot de passe oublié */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#131B2E',
              color: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              p: 1.5,
              backdropFilter: 'blur(20px)',
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SupportAgentIcon sx={{ color: '#E31E24', fontSize: 26 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
              Réinitialisation DSI
            </Typography>
          </Box>
          <IconButton onClick={() => setForgotPasswordOpen(false)} size="small" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', mb: 2 }}>
            Pour des motifs de sécurité interne, la réinitialisation de mot de passe est gérée directement par le Support Informatique Cathedis.
          </Typography>

          <Box
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              p: 2,
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 0.5 }}>
              Contact DSI Support :
            </Typography>
            <Typography sx={{ color: '#E31E24', fontWeight: 600, fontSize: '0.95rem' }}>
              support.it@cathedis.com
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mt: 1 }}>
              Disponibilité : Lun - Ven (08h00 - 18h30)
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            fullWidth
            onClick={() => setForgotPasswordOpen(false)}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              borderRadius: '10px',
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.18)' },
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL 2 : Créer un compte */}
      <Dialog
        open={registerInfoOpen}
        onClose={() => setRegisterInfoOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#131B2E',
              color: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              p: 1.5,
              backdropFilter: 'blur(20px)',
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PersonAddOutlinedIcon sx={{ color: '#E31E24', fontSize: 26 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
              Création de Compte
            </Typography>
          </Box>
          <IconButton onClick={() => setRegisterInfoOpen(false)} size="small" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', mb: 2 }}>
            Les accès au portail de gestion du parc informatique Cathedis sont strictement réservés aux collaborateurs et administrateurs habilités.
          </Typography>

          <Box
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              p: 2,
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 0.5 }}>
              Pour toute demande d&apos;ouverture d&apos;accès :
            </Typography>
            <Typography sx={{ color: '#E31E24', fontWeight: 600, fontSize: '0.95rem' }}>
              support.it@cathedis.com
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mt: 1 }}>
              Veuillez indiquer votre matricule et votre département.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            fullWidth
            onClick={() => setRegisterInfoOpen(false)}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              borderRadius: '10px',
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.18)' },
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
