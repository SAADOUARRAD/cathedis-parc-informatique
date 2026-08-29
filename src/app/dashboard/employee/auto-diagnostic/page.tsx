'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Button,
  TextField,
  Checkbox,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Skeleton
} from '@mui/material';
import {
  Psychology as BrainIcon,
  AutoAwesome as SparklesIcon,
  Build as BuildIcon,
  CheckCircle as SuccessIcon,
  Computer as ComputerIcon,
  LaptopMac as LaptopIcon,
  DesktopWindows as MonitorIcon,
  Tv as ScreenIcon,
  Headphones as HeadphoneIcon,
  Wifi as WifiIcon,
  BatteryChargingFull as BatteryIcon,
  Print as PrintIcon,
  ReportProblem as ProblemIcon,
  Send as SendIcon,
  KeyboardBackspace as BackIcon,
  ArrowForward as ArrowIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

const COMMON_ISSUES = [
  { label: '💻 PC très lent / Rame', query: 'Mon ordinateur est très lent et freeze souvent au démarrage', icon: <ComputerIcon /> },
  { label: '📺 Écran noir / Scintille', query: 'Mon écran scintille, clignote ou reste noir après branchement', icon: <ScreenIcon /> },
  { label: '🌐 Wi-Fi déconnecté', query: 'Impossible de me connecter au réseau Wi-Fi ou connexion instable', icon: <WifiIcon /> },
  { label: '🎧 Casque / Micro sans son', query: 'Le son ne sort pas dans mon casque audio ou mon micro ne fonctionne pas', icon: <HeadphoneIcon /> },
  { label: '🔋 Batterie ne charge pas', query: 'La batterie de mon PC portable ne prend plus la charge sur secteur', icon: <BatteryIcon /> },
  { label: '🖨️ Problème d\'impression', query: 'Mes documents sont bloqués dans la file d\'attente de l\'imprimante', icon: <PrintIcon /> },
];

export default function AutoDiagnosticPage() {
  const { data: session } = useSession();
  const [equipments, setEquipments] = useState<any[]>([]);
  const [loadingEq, setLoadingEq] = useState(true);

  // Wizard state: 'INTAKE' | 'DIAGNOSTIC' | 'RESOLVED' | 'ESCALATED'
  const [step, setStep] = useState<'INTAKE' | 'DIAGNOSTIC' | 'RESOLVED' | 'ESCALATED'>('INTAKE');

  const [selectedEqId, setSelectedEqId] = useState<string>('');
  const [symptoms, setSymptoms] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const fetchMyEquipments = async () => {
    try {
      setLoadingEq(true);
      const res = await fetch('/api/dashboard/employee-stats');
      if (res.ok) {
        const data = await res.json();
        const list = data.myEquipments || data.myEquipment || [];
        setEquipments(list);
        if (list.length > 0 && !selectedEqId) {
          const first = list[0].equipment || list[0];
          setSelectedEqId(first.id);
        }
      }
    } catch (err) {
      console.error('Error loading equipments:', err);
    } finally {
      setLoadingEq(false);
    }
  };

  useEffect(() => {
    fetchMyEquipments();
  }, []);

  const handleRunDiagnostic = async () => {
    if (!symptoms.trim() || symptoms.trim().length < 3) {
      setErrorMessage("Veuillez décrire le problème rencontré.");
      return;
    }

    setErrorMessage(null);
    setLoadingAI(true);

    const selectedEq = equipments.find(a => (a.equipment?.id || a.id) === selectedEqId);
    const eqObj = selectedEq?.equipment || selectedEq;

    try {
      const res = await fetch('/api/ai/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentName: eqObj?.name || 'Matériel',
          category: eqObj?.category || 'Informatique',
          symptoms: symptoms.trim()
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDiagnosticResult(data.analysis);
        setCheckedSteps({});
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

  const handleResolve = () => {
    setStep('RESOLVED');
  };

  const handleEscalate = async () => {
    setSubmittingTicket(true);
    setErrorMessage(null);

    const selectedEq = equipments.find(a => (a.equipment?.id || a.id) === selectedEqId);
    const eqObj = selectedEq?.equipment || selectedEq;

    try {
      const ticketDescription = `${symptoms.trim()}\n\n--- AUTO-DIAGNOSTIC IA RÉALISÉ ---\nCause estimée : ${diagnosticResult?.probableCause || 'N/A'}\nÉtapes de dépannage testées sans succès par le collaborateur.`;

      const res = await fetch('/api/maintenances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: eqObj?.id,
          description: ticketDescription,
          priority: diagnosticResult?.priority || 'MEDIUM',
          reportedById: session?.user?.id
        }),
      });

      if (res.ok) {
        setStep('ESCALATED');
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

  const handleStartOver = () => {
    setStep('INTAKE');
    setSymptoms('');
    setDiagnosticResult(null);
    setCheckedSteps({});
    setErrorMessage(null);
  };

  const selectedEq = equipments.find(a => (a.equipment?.id || a.id) === selectedEqId);
  const eqObj = selectedEq?.equipment || selectedEq;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
      
      {/* 🌟 1. HERO BANNER 🌟 */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          background: 'linear-gradient(135deg, #1A1A2E 0%, #2A1B28 50%, #7B0000 100%)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(26, 26, 46, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.35) 0%, rgba(227,30,36,0) 70%)', pointerEvents: 'none' }} />
        
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2.5 }}>
          <Box sx={{ maxWidth: 700 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.8, py: 0.6, borderRadius: 10, bgcolor: 'rgba(227, 30, 36, 0.25)', border: '1px solid rgba(227, 30, 36, 0.5)', mb: 1.5 }}>
              <BrainIcon sx={{ fontSize: 16, color: '#FF8A80' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFCDD2', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Support IT Intelligent • Cathedis
              </Typography>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', fontSize: { xs: '1.6rem', md: '2.2rem' }, letterSpacing: '-0.02em', mb: 1 }}>
              Auto-Diagnostic & Dépannage IA 🤖
            </Typography>

            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Un problème avec votre matériel ? Posez votre question à l'IA pour obtenir un protocole de test immédiat. Si les étapes ne suffisent pas, votre ticket sera transmis automatiquement au support technique.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              icon={<SparklesIcon sx={{ fontSize: 16, color: '#FFD54F !important' }} />}
              label="Moteur IA Actif"
              sx={{ bgcolor: 'rgba(255,213,79,0.2)', color: '#FFD54F', border: '1px solid rgba(255,213,79,0.4)', fontWeight: 800, px: 1 }}
            />
          </Box>
        </Box>
      </Paper>

      {errorMessage && (
        <Alert severity="error" sx={{ borderRadius: 3, fontWeight: 700 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* 🌟 2. MAIN WIZARD CONTAINER 🌟 */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0', p: { xs: 2.5, md: 4 }, bgcolor: '#FFFFFF' }}>
        
        {/* ---------------------------------------------------- */}
        {/* STEP 1: INTAKE & PROBLEM DESCRIPTION */}
        {/* ---------------------------------------------------- */}
        {step === 'INTAKE' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            
            {/* 1. Equipment Selection */}
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1.05rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#E31E24', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900 }}>1</Box>
                Sélectionnez le matériel concerné par l'incident :
              </Typography>

              {loadingEq ? (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Skeleton width={200} height={70} sx={{ borderRadius: 2.5 }} />
                  <Skeleton width={200} height={70} sx={{ borderRadius: 2.5 }} />
                </Box>
              ) : equipments.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2.5 }}>
                  Aucun équipement ne vous est actuellement affecté. Vous pouvez tout de même poser une question générale ci-dessous.
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {equipments.map((item: any) => {
                    const eq = item.equipment || item;
                    const isSelected = selectedEqId === eq.id;
                    return (
                      <Paper
                        key={eq.id}
                        onClick={() => setSelectedEqId(eq.id)}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: '2px solid',
                          borderColor: isSelected ? '#E31E24' : '#E2E8F0',
                          bgcolor: isSelected ? '#FFF5F5' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.8,
                          transition: 'all 0.2s',
                          flex: '1 1 240px',
                          '&:hover': { borderColor: '#E31E24', transform: 'translateY(-2px)' }
                        }}
                      >
                        <Avatar sx={{ bgcolor: isSelected ? '#E31E24' : '#F1F5F9', color: isSelected ? '#FFFFFF' : '#64748B', width: 42, height: 42 }}>
                          <ComputerIcon />
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A1A2E' }}>
                            {eq.name}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748B', display: 'block' }}>
                            SN: {eq.serialNumber || '-'}
                          </Typography>
                          <Chip label={eq.category || 'Matériel'} size="small" sx={{ fontSize: '0.65rem', fontWeight: 700, mt: 0.3 }} />
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* 2. Common Issues Buttons */}
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1.05rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#E31E24', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900 }}>2</Box>
                Pannes fréquentes (Cliquez pour pré-remplir) :
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
                {COMMON_ISSUES.map((issue, idx) => (
                  <Chip
                    key={idx}
                    icon={React.cloneElement(issue.icon, { sx: { fontSize: 18 } })}
                    label={issue.label}
                    clickable
                    onClick={() => setSymptoms(issue.query)}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      py: 2.2,
                      px: 1.2,
                      bgcolor: symptoms === issue.query ? '#1A1A2E' : '#F8FAFC',
                      color: symptoms === issue.query ? '#FFFFFF' : '#334155',
                      border: '1px solid',
                      borderColor: symptoms === issue.query ? '#1A1A2E' : '#CBD5E1',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: symptoms === issue.query ? '#1A1A2E' : '#F1F5F9' }
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* 3. Symptoms Description in Natural Language */}
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1.05rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#E31E24', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900 }}>3</Box>
                Décrivez les symptômes observés avec vos propres mots :
              </Typography>

              <TextField
                placeholder="ex: Mon écran scintille et devient noir quand je branche le câble... Mon PC rame énormément quand j'ouvre mes fichiers... Mon casque audio n'émet aucun son sur Teams..."
                fullWidth
                multiline
                rows={4}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                sx={{ bgcolor: '#FAFAFA' }}
              />
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
              <Button
                variant="contained"
                size="large"
                disabled={loadingAI || symptoms.trim().length < 3}
                onClick={handleRunDiagnostic}
                startIcon={loadingAI ? <CircularProgress size={22} color="inherit" /> : <SparklesIcon sx={{ color: '#FFD54F' }} />}
                sx={{
                  background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                  color: '#FFFFFF',
                  borderRadius: 3,
                  fontWeight: 900,
                  py: 1.6,
                  px: 4,
                  fontSize: '1.05rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 24px rgba(227, 30, 36, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {loadingAI ? 'Analyse IA en cours...' : 'Analyser & Dépanner avec l\'IA ⚡'}
              </Button>
            </Box>

          </Box>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 2: AI STEP-BY-STEP TROUBLESHOOTING PROTOCOL */}
        {/* ---------------------------------------------------- */}
        {step === 'DIAGNOSTIC' && diagnosticResult && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            
            {/* Header: Probable Cause */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <BrainIcon sx={{ color: '#2563EB', fontSize: 26 }} />
                <Typography sx={{ fontWeight: 900, color: '#1E40AF', fontSize: '1.1rem' }}>
                  Cause Probable Identifiée par l'Assistant IA :
                </Typography>
              </Box>
              <Typography sx={{ color: '#1E3A8A', fontSize: '0.95rem', lineHeight: 1.5 }}>
                {diagnosticResult.probableCause}
              </Typography>
            </Paper>

            {/* Checklist of Steps */}
            <Box>
              <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.1rem', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BuildIcon sx={{ color: '#E31E24' }} />
                Protocole de Dépannage Guidé (Testez chaque étape et cochez) :
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {diagnosticResult.troubleshootingSteps.map((s: any, idx: number) => {
                  const isDone = checkedSteps[idx];
                  return (
                    <Paper
                      key={idx}
                      elevation={0}
                      onClick={() => handleToggleStep(idx)}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: '2px solid',
                        borderColor: isDone ? '#059669' : '#E2E8F0',
                        bgcolor: isDone ? '#ECFDF5' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: isDone ? '#059669' : '#CBD5E1' }
                      }}
                    >
                      <Checkbox
                        checked={!!isDone}
                        sx={{
                          p: 0,
                          mt: 0.3,
                          color: '#94A3B8',
                          '&.Mui-checked': { color: '#059669' }
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: isDone ? '#065F46' : '#1A1A2E', textDecoration: isDone ? 'line-through' : 'none' }}>
                          Étape {idx + 1} : {s.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.9rem', color: '#475569', mt: 0.5, lineHeight: 1.5 }}>
                          {s.action}
                        </Typography>
                        {s.tip && (
                          <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 800, mt: 0.8, display: 'block' }}>
                            💡 Astuce Pro : {s.tip}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Decision Actions */}
            <Box sx={{ bgcolor: '#F8FAFC', p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1.05rem', mb: 2 }}>
                Avez-vous réussi à résoudre le problème avec ces étapes ?
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleResolve}
                  startIcon={<SuccessIcon />}
                  sx={{
                    background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 6px 20px rgba(5, 150, 105, 0.35)',
                    '&:hover': { background: 'linear-gradient(90deg, #047857 0%, #059669 100%)' }
                  }}
                >
                  🎉 Oui, Problème Résolu !
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  disabled={submittingTicket}
                  onClick={handleEscalate}
                  startIcon={submittingTicket ? <CircularProgress size={20} color="inherit" /> : <ProblemIcon />}
                  sx={{
                    borderColor: '#FECACA',
                    bgcolor: '#FEF2F2',
                    color: '#DC2626',
                    fontWeight: 900,
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#FEE2E2', borderColor: '#DC2626' }
                  }}
                >
                  {submittingTicket ? 'Transmission en cours...' : '❌ Non, les étapes n\'ont pas fonctionné ➔ Envoyer au Support IT'}
                </Button>
              </Box>

              <Button
                onClick={handleStartOver}
                startIcon={<BackIcon />}
                sx={{ textTransform: 'none', fontWeight: 700, color: '#64748B', mt: 2 }}
              >
                Poser une autre question
              </Button>
            </Box>

          </Box>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 3: RESOLVED WITH AI */}
        {/* ---------------------------------------------------- */}
        {step === 'RESOLVED' && (
          <Box sx={{ p: 6, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
            <Avatar sx={{ width: 84, height: 84, bgcolor: '#ECFDF5', color: '#059669', mb: 1, boxShadow: '0 8px 24px rgba(5,150,105,0.2)' }}>
              <SuccessIcon sx={{ fontSize: 52 }} />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#065F46' }}>
              Bravo ! Problème Résolu avec Succès ! 🚀
            </Typography>
            <Typography sx={{ color: '#475569', maxWidth: 520, fontSize: '1rem', lineHeight: 1.6 }}>
              Merci d'avoir utilisé le protocole d'auto-diagnostic IA. Aucun ticket n'a été créé inutilement, ce qui permet à l'équipe technique de se concentrer sur les pannes matérielles lourdes.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleStartOver}
                sx={{
                  background: '#1A1A2E',
                  color: '#FFFFFF',
                  borderRadius: 2.5,
                  px: 3.5,
                  py: 1.2,
                  fontWeight: 800,
                  textTransform: 'none'
                }}
              >
                Nouvelle analyse IA
              </Button>
              <Button
                component={Link}
                href="/dashboard/employee/mes-equipements"
                variant="outlined"
                sx={{ borderRadius: 2.5, px: 3, fontWeight: 700, textTransform: 'none' }}
              >
                Retour à mes équipements
              </Button>
            </Box>
          </Box>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 4: ESCALATED TO TECHNICIAN */}
        {/* ---------------------------------------------------- */}
        {step === 'ESCALATED' && (
          <Box sx={{ p: 6, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
            <Avatar sx={{ width: 84, height: 84, bgcolor: '#EFF6FF', color: '#2563EB', mb: 1, boxShadow: '0 8px 24px rgba(37,99,235,0.2)' }}>
              <SendIcon sx={{ fontSize: 46 }} />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1E3A8A' }}>
              Ticket de Maintenance Transmis à la DSI ! 📨
            </Typography>
            <Typography sx={{ color: '#475569', maxWidth: 560, fontSize: '1rem', lineHeight: 1.6 }}>
              Votre incident a été enregistré et transmis directement aux techniciens Cathedis. Le <strong>Rapport d'Auto-Diagnostic IA</strong> a été joint au ticket afin que le technicien sache exactement quelles manipulations ont déjà été testées.
            </Typography>
            <Chip
              label="Notification email Gmail envoyée aux techniciens IT Cathedis"
              sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, border: '1px solid #A7F3D0', py: 2, px: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                component={Link}
                href="/dashboard/employee/mes-tickets"
                variant="contained"
                sx={{
                  background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                  color: '#FFFFFF',
                  borderRadius: 2.5,
                  px: 4,
                  py: 1.3,
                  fontWeight: 800,
                  textTransform: 'none',
                  boxShadow: '0 6px 20px rgba(227, 30, 36, 0.4)'
                }}
              >
                Suivre mon Ticket en Direct 🛠️
              </Button>
            </Box>
          </Box>
        )}

      </Paper>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2.5, fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
