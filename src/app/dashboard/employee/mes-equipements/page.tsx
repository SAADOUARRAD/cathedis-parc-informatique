'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Skeleton,
  Avatar,
  IconButton,
  InputAdornment,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Computer as ComputerIcon,
  LaptopMac as LaptopIcon,
  DesktopWindows as MonitorIcon,
  DevicesOther as DevicesIcon,
  ReportProblem as ReportProblemIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
  QrCode2 as QrCodeIcon,
  Draw as DrawIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  ContentCopy as ContentCopyIcon,
  Shield as ShieldIcon,
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowForwardIcon,
  AutoAwesome as SparklesIcon,
  Psychology as BrainIcon
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import AssetTagQRModal from '@/components/shared/AssetTagQRModal';
import SignatureCanvasModal from '@/components/shared/SignatureCanvasModal';
import AIDiagnosticModal from '@/components/shared/AIDiagnosticModal';
import { generateAssignmentPDF } from '@/lib/pdf/generateAssignmentPDF';

interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  status: string;
}

interface Assignment {
  id: string;
  equipment: Equipment;
  assignedAt: string;
  signatures?: any[];
}

export default function MesEquipementsPage() {
  const { data: session } = useSession();
  const [equipments, setEquipments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // AI Diagnostic Modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiSelectedEqId, setAiSelectedEqId] = useState<string>('');

  // Incident Report Dialog state
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // QR Modal state
  const [qrOpen, setQrOpen] = useState(false);
  const [qrEquipment, setQrEquipment] = useState<Equipment | null>(null);

  // Signature Modal state
  const [sigOpen, setSigOpen] = useState(false);
  const [sigAssignment, setSigAssignment] = useState<Assignment | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const handleOpenAIDiagnostic = (eq?: Equipment) => {
    if (eq) {
      setAiSelectedEqId(eq.id);
    } else if (equipments.length > 0) {
      const first = equipments[0].equipment || equipments[0];
      setAiSelectedEqId(first.id);
    }
    setAiModalOpen(true);
  };

  const fetchEquipments = async () => {
    try {
      const res = await fetch('/api/dashboard/employee-stats');
      if (res.ok) {
        const data = await res.json();
        const eqList = data.myEquipments || data.myEquipment || data.activeAssignments || data.assignments || data.equipments || [];
        setEquipments(eqList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  const handleSaveSignature = async (signatureBase64: string) => {
    if (!sigAssignment) return;
    try {
      const res = await fetch(`/api/assignments/${sigAssignment.id}/signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureData: signatureBase64 }),
      });

      if (!res.ok) throw new Error("Erreur d'enregistrement de la signature");

      const assignmentObj = sigAssignment as any;
      const pdf = await generateAssignmentPDF({
        assignmentId: assignmentObj.id,
        recipientName: session?.user?.name || "Employé",
        recipientEmail: session?.user?.email || undefined,
        recipientDepartment: assignmentObj.equipment?.category || assignmentObj.category,
        equipmentName: assignmentObj.equipment?.name || assignmentObj.name,
        serialNumber: assignmentObj.equipment?.serialNumber || assignmentObj.serialNumber,
        categoryName: assignmentObj.equipment?.category || assignmentObj.category,
        assignedBy: "Administration Cathedis IT",
        assignedDate: assignmentObj.assignedAt ? new Date(assignmentObj.assignedAt).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
        signatureBase64,
      });

      pdf.save(`PV_Affectation_${assignmentObj.equipment?.name || assignmentObj.name || 'Equipement'}.pdf`);
      setSnackbar({ open: true, message: "Procès-verbal signé avec succès !", severity: "success" });
      fetchEquipments();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur lors de la signature", severity: "error" });
    }
  };

  const handleDownloadPDF = async (assignment: any) => {
    const signatureBase64 = assignment.signatures && assignment.signatures.length > 0
      ? assignment.signatures[0].signatureData
      : undefined;

    const pdf = await generateAssignmentPDF({
      assignmentId: assignment.id,
      recipientName: session?.user?.name || "Employé",
      recipientEmail: session?.user?.email || undefined,
      recipientDepartment: assignment.equipment?.category || assignment.category,
      equipmentName: assignment.equipment?.name || assignment.name,
      serialNumber: assignment.equipment?.serialNumber || assignment.serialNumber,
      categoryName: assignment.equipment?.category || assignment.category,
      assignedBy: "Administration Cathedis IT",
      assignedDate: assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
      signatureBase64,
    });

    pdf.save(`PV_Affectation_${assignment.equipment?.name || assignment.name || 'Equipement'}.pdf`);
  };

  const handleOpenReportDialog = (eq: Equipment) => {
    setSelectedEq(eq);
    setPriority('MEDIUM');
    setDescription('');
    setReportOpen(true);
  };

  const handleSubmitReport = async () => {
    if (description.trim().length < 10) {
      setSnackbar({ open: true, message: 'La description doit comporter au moins 10 caractères.', severity: 'error' });
      return;
    }

    setSubmittingReport(true);
    try {
      const res = await fetch('/api/maintenances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: selectedEq?.id,
          description,
          priority,
          reportedById: session?.user?.id
        })
      });

      if (res.ok) {
        setSnackbar({ open: true, message: 'Votre signalement a été transmis à l\'équipe technique !', severity: 'success' });
        setReportOpen(false);
      } else {
        setSnackbar({ open: true, message: 'Erreur lors de l\'envoi du signalement.', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur réseau lors de l\'envoi.', severity: 'error' });
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleCopySerial = (sn: string) => {
    navigator.clipboard.writeText(sn);
    setSnackbar({ open: true, message: `N° de série ${sn} copié !`, severity: 'info' });
  };

  const getEquipmentIcon = (categoryName?: string) => {
    const cat = categoryName?.toLowerCase() || '';
    if (cat.includes('laptop') || cat.includes('portable')) return <LaptopIcon sx={{ fontSize: 26, color: '#E31E24' }} />;
    if (cat.includes('écran') || cat.includes('ecran') || cat.includes('moniteur')) return <MonitorIcon sx={{ fontSize: 26, color: '#E31E24' }} />;
    return <ComputerIcon sx={{ fontSize: 26, color: '#E31E24' }} />;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return { label: 'Disponible', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' };
      case 'ASSIGNED':
        return { label: 'Affecté & Opérationnel', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' };
      case 'MAINTENANCE':
        return { label: 'En Maintenance', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' };
      case 'DECOMMISSIONED':
        return { label: 'Déclassé', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' };
      default:
        return { label: status, color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' };
    }
  };

  // Get unique categories for filter
  const categoriesList = Array.from(
    new Set(
      equipments.map((a: any) => {
        const eq = a.equipment || a;
        return eq.category || 'Matériel';
      })
    )
  );

  // Filtered equipment list
  const filteredEquipments = equipments.filter((assignment: any) => {
    const eq = assignment.equipment || assignment;
    if (!eq) return false;
    const matchesSearch =
      searchQuery === '' ||
      eq.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || eq.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const signedCount = equipments.filter((a: any) => a.signatures && a.signatures.length > 0).length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 1.5, md: 3 } }}>
        <Skeleton variant="rounded" height={160} sx={{ borderRadius: 4 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={320} sx={{ borderRadius: 4 }} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
      
      {/* 1. Hero Banner */}
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
        {/* Ambient Spheres */}
        <Box sx={{ position: 'absolute', top: -50, right: -30, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.35) 0%, rgba(227,30,36,0) 70%)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: 180, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ maxWidth: 650 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.8, py: 0.6, borderRadius: 10, bgcolor: 'rgba(227, 30, 36, 0.25)', border: '1px solid rgba(227, 30, 36, 0.5)', mb: 1.5 }}>
              <ShieldIcon sx={{ fontSize: 16, color: '#FF8A80' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFCDD2', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Mon Espace Matériel • Cathedis
              </Typography>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', fontSize: { xs: '1.6rem', md: '2.1rem' }, letterSpacing: '-0.02em', mb: 1 }}>
              Mes Équipements Informatiques 💻
            </Typography>

            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Consultez l'ensemble du matériel informatique qui vous est actuellement affecté, signez vos PV de décharge, imprimez vos étiquettes QR ou signalez une panne en direct.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<SparklesIcon sx={{ color: '#FFD54F' }} />}
              onClick={() => handleOpenAIDiagnostic()}
              sx={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#FFFFFF',
                borderRadius: 3,
                px: 2.8,
                py: 1.2,
                fontWeight: 900,
                fontSize: '0.88rem',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.25)',
                  border: '1px solid #FFFFFF',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Auto-Diagnostic IA ⚡
            </Button>
            <Paper elevation={0} sx={{ px: 2.5, py: 1.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>{equipments.length}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Matériels Actifs</Typography>
            </Paper>
            <Paper elevation={0} sx={{ px: 2.5, py: 1.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#4ADE80', lineHeight: 1 }}>{signedCount}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>PV Signés ✓</Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* 2. Search & Category Filters */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        bgcolor: '#FFFFFF',
        p: 2,
        borderRadius: 3,
        border: '1px solid #E2E8F0',
      }}>
        <TextField
          size="small"
          placeholder="Rechercher équipement, N° de série (S/N)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flex: '1 1 300px' }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="Tous les matériels"
            onClick={() => setSelectedCategory('ALL')}
            variant={selectedCategory === 'ALL' ? 'filled' : 'outlined'}
            sx={{
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              bgcolor: selectedCategory === 'ALL' ? '#1A1A2E' : undefined,
              color: selectedCategory === 'ALL' ? '#FFFFFF' : '#475569',
              borderColor: '#CBD5E1',
              '&:hover': { bgcolor: selectedCategory === 'ALL' ? '#0F172A' : '#F1F5F9' }
            }}
          />
          {categoriesList.map((catName: string) => (
            <Chip
              key={catName}
              label={catName}
              onClick={() => setSelectedCategory(catName)}
              variant={selectedCategory === catName ? 'filled' : 'outlined'}
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                bgcolor: selectedCategory === catName ? '#E31E24' : undefined,
                color: selectedCategory === catName ? '#FFFFFF' : '#475569',
                borderColor: '#CBD5E1',
                '&:hover': { bgcolor: selectedCategory === catName ? '#C41018' : '#F1F5F9' }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* 3. Equipments Grid */}
      {filteredEquipments.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: 6,
            textAlign: 'center',
            bgcolor: '#FFFFFF',
            border: '2px dashed #E2E8F0',
          }}
        >
          <Avatar sx={{ width: 70, height: 70, bgcolor: 'rgba(227,30,36,0.08)', color: '#E31E24', mx: 'auto', mb: 2 }}>
            <ComputerIcon sx={{ fontSize: 36 }} />
          </Avatar>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#1A1A2E', mb: 0.5 }}>
            Aucun équipement trouvé
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: '#64748B', maxWidth: 450, mx: 'auto' }}>
            Aucun équipement ne correspond à vos critères de recherche ou aucun matériel ne vous est affecté pour le moment.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {filteredEquipments.map((assignment: any) => {
            const eq = assignment.equipment || assignment;
            if (!eq) return null;

            const st = getStatusConfig(eq.status);
            const isSigned = assignment.signatures && assignment.signatures.length > 0;

            return (
              <Paper
                key={assignment.id}
                elevation={0}
                sx={{
                  borderRadius: 3.5,
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 16px 32px rgba(227, 30, 36, 0.1)',
                    borderColor: '#E31E24',
                  }
                }}
              >
                {/* Card Top Accent Bar */}
                <Box sx={{ height: 4, background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)' }} />

                <Box sx={{ p: 3 }}>
                  {/* Header: Icon + Category + Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 46, height: 46, bgcolor: 'rgba(227, 30, 36, 0.08)', borderRadius: 2.5 }}>
                        {getEquipmentIcon(eq.category)}
                      </Avatar>
                      <Box>
                        <Chip
                          label={eq.category || 'Matériel'}
                          size="small"
                          sx={{ fontSize: '0.7rem', fontWeight: 700, bgcolor: '#F1F5F9', color: '#475569', mb: 0.3 }}
                        />
                        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A1A2E', lineHeight: 1.2 }}>
                          {eq.name}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Status Badge */}
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={st.label}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        bgcolor: st.bg,
                        color: st.color,
                        border: `1px solid ${st.border}`,
                      }}
                    />
                  </Box>

                  {/* Serial Number & Date Details */}
                  <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2.5, mb: 2.5, border: '1px solid #F1F5F9' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                        Numéro de Série :
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.85rem', color: '#1E293B' }}>
                          {eq.serialNumber || '-'}
                        </Typography>
                        {eq.serialNumber && (
                          <Tooltip title="Copier le N° de série">
                            <IconButton size="small" onClick={() => handleCopySerial(eq.serialNumber)} sx={{ p: 0.3, color: '#94A3B8' }}>
                              <ContentCopyIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                        Date d'affectation :
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#334155', fontWeight: 800 }}>
                        {assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Buttons Grid */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                    {/* Row 1: Signature & PDF */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {isSigned ? (
                        <Chip
                          label="PV Signé ✓"
                          color="success"
                          sx={{
                            flex: 1,
                            height: 38,
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            bgcolor: '#ECFDF5',
                            color: '#059669',
                            border: '1px solid #A7F3D0',
                          }}
                        />
                      ) : (
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<DrawIcon />}
                          onClick={() => { setSigAssignment(assignment); setSigOpen(true); }}
                          sx={{
                            flex: 1,
                            background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                            color: '#FFFFFF',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            boxShadow: '0 4px 12px rgba(227, 30, 36, 0.25)',
                            '&:hover': {
                              boxShadow: '0 6px 16px rgba(227, 30, 36, 0.4)',
                              background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)',
                            }
                          }}
                        >
                          Signer mon PV ✍️
                        </Button>
                      )}

                      <Button
                        variant="outlined"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => handleDownloadPDF(assignment)}
                        sx={{
                          flex: 1,
                          color: '#1A1A2E',
                          borderColor: '#CBD5E1',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          '&:hover': {
                            bgcolor: '#F8FAFC',
                            borderColor: '#1A1A2E'
                          }
                        }}
                      >
                        PV PDF
                      </Button>
                    </Box>

                    {/* Row 2: QR Tag & Report Problem */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<QrCodeIcon />}
                        onClick={() => { setQrEquipment(eq); setQrOpen(true); }}
                        sx={{
                          flex: 1,
                          color: '#475569',
                          borderColor: '#E2E8F0',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          '&:hover': {
                            bgcolor: '#F8FAFC',
                            borderColor: '#64748B'
                          }
                        }}
                      >
                        Étiquette QR
                      </Button>

                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<SparklesIcon sx={{ color: '#DC2626' }} />}
                        onClick={() => handleOpenAIDiagnostic(eq)}
                        sx={{
                          flex: 1,
                          borderColor: '#FECACA',
                          bgcolor: '#FEF2F2',
                          color: '#DC2626',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          '&:hover': {
                            bgcolor: '#FEE2E2',
                            borderColor: '#DC2626',
                          }
                        }}
                      >
                        Diagnostic IA 🛠️
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* 4. Report Problem Dialog */}
      <Dialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3.5, overflow: 'hidden' }
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1A1A2E 0%, #7B0000 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 2.5
        }}>
          <ReportProblemIcon sx={{ color: '#FF8A80' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Signaler un Problème / Panne
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Équipement : {selectedEq?.name}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 3.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Équipement concerné"
            value={selectedEq ? `${selectedEq.name} (SN: ${selectedEq.serialNumber || '-'})` : ''}
            fullWidth
            disabled
            sx={{ mt: 1 }}
          />

          <FormControl fullWidth>
            <InputLabel>Niveau d'Urgence</InputLabel>
            <Select
              value={priority}
              label="Niveau d'Urgence"
              onChange={(e) => setPriority(e.target.value)}
            >
              <MenuItem value="LOW">🟢 Basse (Gêne mineure)</MenuItem>
              <MenuItem value="MEDIUM">🟠 Moyenne (Panne partielle)</MenuItem>
              <MenuItem value="HIGH">🔴 Haute (Travail fortement impacté)</MenuItem>
              <MenuItem value="CRITICAL">⚡ Critique (Blocage total)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Description détaillée de l'anomalie *"
            placeholder="Décrivez précisément les symptômes observés (ex: écran scintille, chargeur défectueux, ne démarre plus...)"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            helperText={`${description.length}/10 caractères minimum`}
            error={description.length > 0 && description.length < 10}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
          <Button onClick={() => setReportOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmitReport}
            disabled={submittingReport || description.trim().length < 10}
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
              borderRadius: 2,
              px: 3,
              fontWeight: 800,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)',
              }
            }}
          >
            {submittingReport ? 'Envoi...' : 'Transmettre au Support IT'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 5. Modals: QR Code & Signature Canvas */}
      {qrEquipment && (
        <AssetTagQRModal
          open={qrOpen}
          onClose={() => setQrOpen(false)}
          equipment={{
            id: qrEquipment.id,
            name: qrEquipment.name,
            serialNumber: qrEquipment.serialNumber,
            category: qrEquipment.category,
          }}
        />
      )}

      {sigAssignment && (
        <SignatureCanvasModal
          open={sigOpen}
          onClose={() => setSigOpen(false)}
          onSaveSignature={handleSaveSignature}
          recipientName={session?.user?.name || "Employé"}
          equipmentName={sigAssignment.equipment?.name || (sigAssignment as any).name || "Équipement"}
        />
      )}

      {/* 🤖 AI Diagnostic Modal */}
      <AIDiagnosticModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        equipments={equipments.map((a: any) => {
          const eq = a.equipment || a;
          return {
            id: eq.id,
            name: eq.name,
            serialNumber: eq.serialNumber,
            category: eq.category,
          };
        })}
        preSelectedEquipmentId={aiSelectedEqId}
        userId={session?.user?.id}
        onTicketCreated={() => {
          setSnackbar({ open: true, message: "Ticket transmis au Support IT suite à l'analyse IA !", severity: "success" });
          fetchEquipments();
        }}
      />

      {/* 6. Snackbar */}
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
