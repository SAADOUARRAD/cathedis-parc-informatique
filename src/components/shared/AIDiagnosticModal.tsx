'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  Avatar,
  Chip,
  Paper,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  IconButton,
  Alert,
  Divider
} from '@mui/material';
import {
  AutoAwesome as SparklesIcon,
  Build as BuildIcon,
  CheckCircle as SuccessIcon,
  Close as CloseIcon,
  Computer as ComputerIcon,
  LaptopMac as LaptopIcon,
  Tv as ScreenIcon,
  Headphones as HeadphoneIcon,
  Wifi as WifiIcon,
  BatteryChargingFull as BatteryIcon,
  Print as PrintIcon,
  ArrowForward as ArrowIcon,
  Psychology as BrainIcon,
  ReportProblem as ProblemIcon,
  Send as SendIcon,
  Help as HelpIcon,
  KeyboardBackspace as BackIcon
} from '@mui/icons-material';

interface Equipment {
  id: string;
  name: string;
  serialNumber?: string;
  category?: string;
}

interface AIDiagnosticModalProps {
  open: boolean;
  onClose: () => void;
  equipments: Equipment[];
  preSelectedEquipmentId?: string;
  userId?: string;
  onTicketCreated?: () => void;
}

const COMMON_ISSUES = [
  { label: '💻 PC très lent / Rame', query: 'Mon ordinateur est très lent et freeze souvent au démarrage', icon: <ComputerIcon /> },
  { label: '📺 Écran noir / Scintille', query: 'Mon écran scintille, clignote ou reste noir après branchement', icon: <ScreenIcon /> },
  { label: '🌐 Wi-Fi déconnecté', query: 'Impossible de me connecter au réseau Wi-Fi ou connexion instable', icon: <WifiIcon /> },
  { label: '🎧 Casque / Micro sans son', query: 'Le son ne sort pas dans mon casque audio ou mon micro ne fonctionne pas', icon: <HeadphoneIcon /> },
  { label: '🔋 Batterie ne charge pas', query: 'La batterie de mon PC portable ne prend plus la charge sur secteur', icon: <BatteryIcon /> },
  { label: '🖨️ Problème d\'impression', query: 'Mes documents sont bloqués dans la file d\'attente de l\'imprimante', icon: <PrintIcon /> },
];

export default function AIDiagnosticModal({
  open,
  onClose,
  equipments,
  preSelectedEquipmentId,
  userId,
  onTicketCreated
}: AIDiagnosticModalProps) {
  // Wizard steps: 'INTAKE' | 'DIAGNOSTIC' | 'RESOLVED' | 'SUBMITTING'
  const [step, setStep] = useState<'INTAKE' | 'DIAGNOSTIC' | 'RESOLVED'>('INTAKE');

  const [selectedEqId, setSelectedEqId] = useState<string>(preSelectedEquipmentId || (equipments[0]?.id || ''));
  const [symptoms, setSymptoms] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  // Ticket submission state
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync preselection
  React.useEffect(() => {
    if (preSelectedEquipmentId) {
      setSelectedEqId(preSelectedEquipmentId);
    } else if (equipments.length > 0 && !selectedEqId) {
      setSelectedEqId(equipments[0].id);
    }
  }, [preSelectedEquipmentId, equipments]);

  const handleReset = () => {
    setStep('INTAKE');
    setSymptoms('');
    setDiagnosticResult(null);
    setCheckedSteps({});
    setTicketSuccess(false);
    setErrorMessage(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleRunAIDiagnostic = async () => {
    if (!symptoms.trim() || symptoms.trim().length < 3) {
      setErrorMessage("Veuillez décrire le problème rencontré.");
      return;
    }

    setErrorMessage(null);
    setLoadingAI(true);

    const selectedEq = equipments.find(e => e.id === selectedEqId);

    try {
      const res = await fetch('/api/ai/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentName: selectedEq?.name || 'Matériel',
          category: selectedEq?.category || 'Informatique',
          symptoms: symptoms.trim()
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDiagnosticResult(data.analysis);
        setStep('DIAGNOSTIC');
      } else {
        throw new Error("Erreur de communication avec l'assistant IA");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur de diagnostic");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleToggleStep = (index: number) => {
    setCheckedSteps(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleResolveProblem = () => {
    setStep('RESOLVED');
  };

  const handleEscalateToTechnician = async () => {
    setSubmittingTicket(true);
    setErrorMessage(null);

    const selectedEq = equipments.find(e => e.id === selectedEqId);

    try {
      const ticketDescription = `${symptoms.trim()}\n\n--- AUTO-DIAGNOSTIC IA RÉALISÉ ---\nCause estimée : ${diagnosticResult?.probableCause || 'N/A'}\nÉtapes de dépannage testées sans succès par le collaborateur.`;

      const res = await fetch('/api/maintenances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: selectedEq?.id,
          description: ticketDescription,
          priority: diagnosticResult?.priority || 'MEDIUM',
          reportedById: userId
        }),
      });

      if (res.ok) {
        setTicketSuccess(true);
        if (onTicketCreated) onTicketCreated();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors de la création du ticket");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de l'envoi du ticket");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const selectedEq = equipments.find(e => e.id === selectedEqId);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.2)'
          }
        }
      }}
    >
      {/* Header Banner */}
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
          <Avatar sx={{
            bgcolor: 'rgba(227,30,36,0.35)',
            border: '2px solid rgba(227,30,36,0.8)',
            color: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(227,30,36,0.5)'
          }}>
            <BrainIcon />
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2 }}>
                Assistant IA • Auto-Diagnostic & Dépannage Immédiat
              </Typography>
              <Chip
                icon={<SparklesIcon sx={{ fontSize: 13, color: '#FFD54F !important' }} />}
                label="IA Cathedis Active"
                size="small"
                sx={{ bgcolor: 'rgba(255,213,79,0.2)', color: '#FFD54F', fontWeight: 800, fontSize: '0.68rem', border: '1px solid rgba(255,213,79,0.4)' }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              Résolvez votre panne en quelques étapes guidées avant de créer un ticket
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: '#FFFFFF' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        
        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: 2.5, fontWeight: 700 }} onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 1: INTAKE & SYMPTOMS DESCRIPTION */}
        {/* ---------------------------------------------------- */}
        {step === 'INTAKE' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            
            {/* Equipment Selector */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 1 }}>
                1. Sélectionnez l'équipement concerné :
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {equipments.map(eq => (
                  <Paper
                    key={eq.id}
                    onClick={() => setSelectedEqId(eq.id)}
                    elevation={0}
                    sx={{
                      p: 1.8,
                      borderRadius: 2.5,
                      border: '2px solid',
                      borderColor: selectedEqId === eq.id ? '#E31E24' : '#E2E8F0',
                      bgcolor: selectedEqId === eq.id ? '#FFF5F5' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      transition: 'all 0.2s',
                      flex: '1 1 220px',
                      '&:hover': { borderColor: '#E31E24' }
                    }}
                  >
                    <Avatar sx={{ bgcolor: selectedEqId === eq.id ? '#E31E24' : '#F1F5F9', color: selectedEqId === eq.id ? '#FFFFFF' : '#64748B', width: 36, height: 36 }}>
                      <ComputerIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#1A1A2E' }}>
                        {eq.name}
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748B' }}>
                        SN: {eq.serialNumber || '-'}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>

            {/* Quick Common Issues Buttons */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 1 }}>
                2. Choisissez un problème fréquent (ou tapez votre question ci-dessous) :
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {COMMON_ISSUES.map((issue, idx) => (
                  <Chip
                    key={idx}
                    icon={React.cloneElement(issue.icon, { sx: { fontSize: 16 } })}
                    label={issue.label}
                    clickable
                    onClick={() => setSymptoms(issue.query)}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      py: 2,
                      px: 1,
                      bgcolor: symptoms === issue.query ? '#1A1A2E' : '#FFFFFF',
                      color: symptoms === issue.query ? '#FFFFFF' : '#334155',
                      border: '1px solid #CBD5E1',
                      '&:hover': { bgcolor: symptoms === issue.query ? '#1A1A2E' : '#F1F5F9' }
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Freeform Question Box */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 1 }}>
                3. Que se passe-t-il exactement ? (Posez votre question en langage naturel) :
              </Typography>
              <TextField
                placeholder="ex: Mon écran scintille et devient noir quand je branche mon câble... ou mon PC rame quand j'ouvre Excel..."
                fullWidth
                multiline
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                sx={{ bgcolor: '#FFFFFF' }}
              />
            </Box>

            <Button
              variant="contained"
              size="large"
              disabled={loadingAI || symptoms.trim().length < 3}
              onClick={handleRunAIDiagnostic}
              startIcon={loadingAI ? <CircularProgress size={20} color="inherit" /> : <SparklesIcon sx={{ color: '#FFD54F' }} />}
              sx={{
                background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                color: '#FFFFFF',
                borderRadius: 3,
                fontWeight: 900,
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 6px 20px rgba(227, 30, 36, 0.35)',
                '&:hover': { background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)' }
              }}
            >
              {loadingAI ? 'Analyse IA en cours...' : 'Analyser avec l\'Assistant IA ⚡'}
            </Button>
          </Box>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 2: AI STEP-BY-STEP TROUBLESHOOTING PROTOCOL */}
        {/* ---------------------------------------------------- */}
        {step === 'DIAGNOSTIC' && diagnosticResult && !ticketSuccess && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            
            {/* Probable Cause Alert Box */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                <BrainIcon sx={{ color: '#2563EB', fontSize: 22 }} />
                <Typography sx={{ fontWeight: 900, color: '#1E40AF', fontSize: '0.95rem' }}>
                  Cause Probable Identifiée par l'IA :
                </Typography>
              </Box>
              <Typography sx={{ color: '#1E3A8A', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {diagnosticResult.probableCause}
              </Typography>
            </Paper>

            {/* Step-by-Step Action Plan */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BuildIcon sx={{ color: '#E31E24', fontSize: 18 }} />
                Étapes de résolution à tester immédiatement (Cochez au fur et à mesure) :
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                {diagnosticResult.troubleshootingSteps.map((s: any, idx: number) => {
                  const isDone = checkedSteps[idx];
                  return (
                    <Paper
                      key={idx}
                      elevation={0}
                      onClick={() => handleToggleStep(idx)}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: isDone ? '#A7F3D0' : '#E2E8F0',
                        bgcolor: isDone ? '#ECFDF5' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#CBD5E1' }
                      }}
                    >
                      <Checkbox
                        checked={!!isDone}
                        sx={{
                          p: 0,
                          mt: 0.2,
                          color: '#94A3B8',
                          '&.Mui-checked': { color: '#059669' }
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: isDone ? '#065F46' : '#1A1A2E', textDecoration: isDone ? 'line-through' : 'none' }}>
                          Étape {idx + 1} : {s.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#475569', mt: 0.4, lineHeight: 1.4 }}>
                          {s.action}
                        </Typography>
                        {s.tip && (
                          <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, mt: 0.6, display: 'block' }}>
                            💡 Astuce : {s.tip}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Decision Buttons: Worked vs Failed */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', textAlign: 'center' }}>
                Avez-vous réussi à résoudre votre problème grâce à ces étapes ?
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {/* 🟢 WORKED BUTTON */}
                <Button
                  variant="contained"
                  onClick={handleResolveProblem}
                  startIcon={<SuccessIcon />}
                  sx={{
                    background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    borderRadius: 2.5,
                    py: 1.4,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                    '&:hover': { background: 'linear-gradient(90deg, #047857 0%, #059669 100%)' }
                  }}
                >
                  🎉 Problème Résolu !
                </Button>

                {/* 🔴 FAILED BUTTON ➔ ESCALATE */}
                <Button
                  variant="outlined"
                  color="error"
                  disabled={submittingTicket}
                  onClick={handleEscalateToTechnician}
                  startIcon={submittingTicket ? <CircularProgress size={18} color="inherit" /> : <ProblemIcon />}
                  sx={{
                    borderColor: '#FECACA',
                    bgcolor: '#FEF2F2',
                    color: '#DC2626',
                    fontWeight: 800,
                    borderRadius: 2.5,
                    py: 1.4,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#FEE2E2', borderColor: '#DC2626' }
                  }}
                >
                  {submittingTicket ? 'Transmission...' : '❌ Ça ne marche pas ➔ Support IT'}
                </Button>
              </Box>
            </Box>

          </Box>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUCCESS STATE 1: RESOLVED WITH AI */}
        {/* ---------------------------------------------------- */}
        {step === 'RESOLVED' && (
          <Box sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: '#ECFDF5', color: '#059669', mb: 1 }}>
              <SuccessIcon sx={{ fontSize: 44 }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#065F46' }}>
              Bravo ! Problème résolu en toute autonomie ! 🚀
            </Typography>
            <Typography sx={{ color: '#475569', maxWidth: 480, fontSize: '0.92rem' }}>
              Merci d'avoir utilisé l'auto-diagnostic IA. Aucun ticket n'a été créé inutilement, ce qui permet de soulager l'équipe technique Cathedis.
            </Typography>
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{
                background: '#1A1A2E',
                color: '#FFFFFF',
                borderRadius: 2.5,
                px: 4,
                py: 1.2,
                fontWeight: 800,
                textTransform: 'none',
                mt: 2
              }}
            >
              Fermer l'Assistant
            </Button>
          </Box>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUCCESS STATE 2: TICKET TRANSMITTED TO TECHNICIAN */}
        {/* ---------------------------------------------------- */}
        {ticketSuccess && (
          <Box sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: '#EFF6FF', color: '#2563EB', mb: 1 }}>
              <SendIcon sx={{ fontSize: 38 }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1E3A8A' }}>
              Ticket Transmis à l'Équipe Technique ! 📨
            </Typography>
            <Typography sx={{ color: '#475569', maxWidth: 520, fontSize: '0.92rem' }}>
              Votre demande a été enregistrée avec succès. Le rapport d'auto-diagnostic IA a été joint au ticket afin que le technicien sache exactement ce qui a déjà été testé.
            </Typography>
            <Chip
              label="Notification envoyée aux techniciens Cathedis"
              size="small"
              sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, border: '1px solid #A7F3D0' }}
            />
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{
                background: '#1A1A2E',
                color: '#FFFFFF',
                borderRadius: 2.5,
                px: 4,
                py: 1.2,
                fontWeight: 800,
                textTransform: 'none',
                mt: 2
              }}
            >
              Retour à mes équipements
            </Button>
          </Box>
        )}

      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
        {step === 'DIAGNOSTIC' && !ticketSuccess ? (
          <Button
            onClick={() => setStep('INTAKE')}
            startIcon={<BackIcon />}
            sx={{ textTransform: 'none', fontWeight: 700, color: '#64748B' }}
          >
            Modifier ma question
          </Button>
        ) : (
          <Box />
        )}

        <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700, color: '#64748B', borderColor: '#CBD5E1', textTransform: 'none' }}>
          Quitter
        </Button>
      </DialogActions>
    </Dialog>
  );
}
