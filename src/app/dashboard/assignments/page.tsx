'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Snackbar,
  Alert,
  TextField,
  Skeleton,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Tooltip,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  ButtonGroup
} from '@mui/material';
import {
  AssignmentInd as AssignmentIcon,
  CheckCircle as ActiveIcon,
  Reply as ReturnIcon,
  SwapHoriz as TransferIcon,
  Draw as DrawIcon,
  PictureAsPdf as PdfIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  LaptopMac as LaptopIcon,
  DesktopWindows as DesktopIcon,
  Headphones as HeadphoneIcon,
  Tv as ScreenIcon,
  Keyboard as KeyboardIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  History as HistoryIcon,
  Business as BusinessIcon,
  FileDownload as ExportIcon,
  Check as CheckIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
  LocalShipping as ShippingIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  AutoAwesome as SparklesIcon,
  Map as MapIcon,
  ViewList as TableViewIcon
} from '@mui/icons-material';
import SignatureCanvas from 'react-signature-canvas';
import { generateAssignmentPDF } from '@/lib/pdf/generateAssignmentPDF';
import StatusChip from '@/components/shared/StatusChip';
import SignatureCanvasModal from '@/components/shared/SignatureCanvasModal';
import VisualFleetMap from '@/components/shared/VisualFleetMap';

const statusMap = {
  ACTIVE: { label: 'En Service Actif', color: '#059669', bgColor: '#ECFDF5' },
  RETURNED: { label: 'Restitué au Stock', color: '#2563EB', bgColor: '#EFF6FF' },
  TRANSFERRED: { label: 'Transféré à un Tiers', color: '#D97706', bgColor: '#FFFBEB' },
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'TABLE' or 'MAP'
  const [viewMode, setViewMode] = useState<'TABLE' | 'MAP'>('TABLE');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [signatureFilter, setSignatureFilter] = useState('ALL');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Guided Wizard Modal State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [enableImmediateSign, setEnableImmediateSign] = useState(true);
  const sigPadRef = useRef<any>(null);
  const [savingAssignment, setSavingAssignment] = useState(false);

  // Return Dialog State
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedReturnAssignment, setSelectedReturnAssignment] = useState<any>(null);
  const [returnCondition, setReturnCondition] = useState<'GOOD' | 'NORMAL' | 'DAMAGED'>('GOOD');
  const [returnNotes, setReturnNotes] = useState('');
  const [savingReturn, setSavingReturn] = useState(false);

  // Transfer Dialog State
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedTransferAssignment, setSelectedTransferAssignment] = useState<any>(null);
  const [transferNewUserId, setTransferNewUserId] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [savingTransfer, setSavingTransfer] = useState(false);

  // Direct Sign Modal State
  const [sigModalOpen, setSigModalOpen] = useState(false);
  const [sigAssignment, setSigAssignment] = useState<any>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resAss, resEq, resUsr] = await Promise.all([
        fetch('/api/assignments'),
        fetch('/api/equipments?status=AVAILABLE'),
        fetch('/api/users')
      ]);

      if (resAss.ok) setAssignments(await resAss.json() || []);
      if (resEq.ok) setEquipments(await resEq.json() || []);
      if (resUsr.ok) setUsers(await resUsr.json() || []);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Erreur lors du chargement des données", severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open Wizard for Single or Pack Onboarding
  const handleOpenWizard = (packPreset: boolean = false) => {
    setActiveStep(0);
    setSelectedUserId('');
    setSelectedEquipmentIds([]);
    setAssignmentNotes(packPreset ? "Pack Onboarding complet (Dotation nouveau collaborateur)" : "");
    setEnableImmediateSign(true);
    setWizardOpen(true);
  };

  // Open Wizard directly targeting a specific Desk from Visual Fleet Map
  const handleOpenWizardFromDesk = (desk: any) => {
    setActiveStep(0);
    const foundUser = users.find(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(desk.user?.toLowerCase().split(' ')[0] || ''));
    setSelectedUserId(foundUser ? foundUser.id : '');
    setSelectedEquipmentIds([]);
    setAssignmentNotes(`Affectation de poste : #${desk.id} - ${desk.label}`);
    setEnableImmediateSign(true);
    setWizardOpen(true);
  };

  const handleToggleEquipment = (eqId: string) => {
    setSelectedEquipmentIds(prev => 
      prev.includes(eqId) ? prev.filter(id => id !== eqId) : [...prev, eqId]
    );
  };

  // Submit Guided Assignment Wizard
  const handleCompleteWizard = async () => {
    if (!selectedUserId || selectedEquipmentIds.length === 0) {
      setSnackbar({ open: true, message: "Veuillez sélectionner un collaborateur et au moins un équipement.", severity: 'error' });
      return;
    }

    let signatureBase64: string | undefined = undefined;
    if (enableImmediateSign && sigPadRef.current && !sigPadRef.current.isEmpty()) {
      signatureBase64 = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
    }

    setSavingAssignment(true);
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedToId: selectedUserId,
          equipmentIds: selectedEquipmentIds,
          notes: assignmentNotes.trim() || undefined,
          signatureBase64,
        }),
      });

      if (res.ok) {
        setSnackbar({
          open: true,
          message: `Dotation de ${selectedEquipmentIds.length} équipement(s) validée avec succès ! 🎉`,
          severity: 'success'
        });
        setWizardOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Erreur de création");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur lors de l'affectation", severity: 'error' });
    } finally {
      setSavingAssignment(false);
    }
  };

  // Save Signature from standalone modal
  const handleSaveStandaloneSignature = async (signatureBase64: string) => {
    if (!sigAssignment) return;
    try {
      const res = await fetch(`/api/assignments/${sigAssignment.id}/signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureData: signatureBase64 }),
      });

      if (!res.ok) throw new Error("Erreur lors de l'enregistrement de la signature");

      // Generate PDF
      const pdf = await generateAssignmentPDF({
        assignmentId: sigAssignment.id,
        recipientName: sigAssignment.assignedTo ? `${sigAssignment.assignedTo.firstName} ${sigAssignment.assignedTo.lastName}` : "Collaborateur",
        recipientEmail: sigAssignment.assignedTo?.email,
        recipientDepartment: sigAssignment.assignedTo?.department?.name || sigAssignment.equipment?.department?.name,
        equipmentName: sigAssignment.equipment?.name || "Équipement",
        serialNumber: sigAssignment.equipment?.serialNumber || sigAssignment.equipment?.inventoryNumber,
        categoryName: sigAssignment.equipment?.category?.name,
        assignedBy: "Administration Cathedis IT",
        assignedDate: sigAssignment.startDate ? new Date(sigAssignment.startDate).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR"),
        signatureBase64,
      });

      pdf.save(`PV_Affectation_${sigAssignment.equipment?.name || 'Equipement'}_${sigAssignment.assignedTo?.lastName || ''}.pdf`);

      setSnackbar({ open: true, message: "Procès-verbal signé et PDF téléchargé avec succès !", severity: 'success' });
      fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur lors de la signature", severity: 'error' });
    }
  };

  // Download PDF PV
  const handleDownloadPDF = async (row: any) => {
    const signatureBase64 = row.signatures && row.signatures.length > 0 ? row.signatures[0].signatureData : undefined;
    const pdf = await generateAssignmentPDF({
      assignmentId: row.id,
      recipientName: row.assignedTo ? `${row.assignedTo.firstName} ${row.assignedTo.lastName}` : "Collaborateur",
      recipientEmail: row.assignedTo?.email,
      recipientDepartment: row.assignedTo?.department?.name || row.equipment?.department?.name,
      equipmentName: row.equipment?.name || "Équipement",
      serialNumber: row.equipment?.serialNumber || row.equipment?.inventoryNumber,
      categoryName: row.equipment?.category?.name,
      assignedBy: "Administration Cathedis IT",
      assignedDate: row.startDate ? new Date(row.startDate).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR"),
      signatureBase64,
    });

    pdf.save(`PV_Affectation_${row.equipment?.name || 'Equipement'}_${row.assignedTo?.lastName || ''}.pdf`);
  };

  // Return Handlers
  const handleOpenReturn = (assignment: any) => {
    setSelectedReturnAssignment(assignment);
    setReturnCondition('GOOD');
    setReturnNotes('');
    setReturnDialogOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedReturnAssignment) return;
    setSavingReturn(true);
    try {
      const res = await fetch(`/api/assignments/${selectedReturnAssignment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'return',
          condition: returnCondition,
          notes: returnNotes.trim() || undefined
        }),
      });

      if (res.ok) {
        setSnackbar({ open: true, message: `Matériel ${selectedReturnAssignment.equipment?.name} restitué au stock avec succès !`, severity: 'success' });
        setReturnDialogOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la restitution");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur de restitution", severity: 'error' });
    } finally {
      setSavingReturn(false);
    }
  };

  // Transfer Handlers
  const handleOpenTransfer = (assignment: any) => {
    setSelectedTransferAssignment(assignment);
    setTransferNewUserId('');
    setTransferNotes('');
    setTransferDialogOpen(true);
  };

  const handleConfirmTransfer = async () => {
    if (!selectedTransferAssignment || !transferNewUserId) {
      setSnackbar({ open: true, message: "Veuillez sélectionner le nouveau collaborateur bénéficiaire.", severity: 'error' });
      return;
    }

    setSavingTransfer(true);
    try {
      const res = await fetch(`/api/assignments/${selectedTransferAssignment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'transfer',
          newUserId: transferNewUserId,
          notes: transferNotes.trim() || undefined
        }),
      });

      if (res.ok) {
        setSnackbar({ open: true, message: "Équipement transféré avec succès ! Nouveau PV généré.", severity: 'success' });
        setTransferDialogOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors du transfert");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur de transfert", severity: 'error' });
    } finally {
      setSavingTransfer(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (assignments.length === 0) return;
    const headers = ["ID", "Équipement", "N° Inventaire", "S/N", "Collaborateur", "Email", "Département", "Date Début", "Date Fin", "Statut", "PV Signé"];
    const rows = assignments.map(a => [
      a.id,
      `"${a.equipment?.name || ''}"`,
      `"${a.equipment?.inventoryNumber || ''}"`,
      `"${a.equipment?.serialNumber || ''}"`,
      `"${a.assignedTo ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}` : ''}"`,
      `"${a.assignedTo?.email || ''}"`,
      `"${a.assignedTo?.department?.name || a.equipment?.department?.name || ''}"`,
      a.startDate ? new Date(a.startDate).toISOString().split('T')[0] : '',
      a.endDate ? new Date(a.endDate).toISOString().split('T')[0] : '',
      `"${a.status}"`,
      a.signatures && a.signatures.length > 0 ? "OUI" : "NON"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registre_affectations_cathedis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({ open: true, message: "Exportation du registre d'affectation réussie !", severity: 'success' });
  };

  const getCategoryIcon = (catName?: string) => {
    const c = catName?.toLowerCase() || '';
    if (c.includes('portable') || c.includes('laptop')) return <LaptopIcon sx={{ fontSize: 18, color: '#E31E24' }} />;
    if (c.includes('fixe') || c.includes('desktop')) return <DesktopIcon sx={{ fontSize: 18, color: '#2563EB' }} />;
    if (c.includes('casque') || c.includes('audio')) return <HeadphoneIcon sx={{ fontSize: 18, color: '#7C3AED' }} />;
    if (c.includes('écran') || c.includes('ecran')) return <ScreenIcon sx={{ fontSize: 18, color: '#059669' }} />;
    return <ComputerIcon sx={{ fontSize: 18, color: '#64748B' }} />;
  };

  const filteredAssignments = assignments.filter(a => {
    const s = search.toLowerCase();
    const matchSearch = !s ||
      (a.equipment?.name && a.equipment.name.toLowerCase().includes(s)) ||
      (a.equipment?.inventoryNumber && a.equipment.inventoryNumber.toLowerCase().includes(s)) ||
      (a.equipment?.serialNumber && a.equipment.serialNumber.toLowerCase().includes(s)) ||
      (a.assignedTo && `${a.assignedTo.firstName} ${a.assignedTo.lastName}`.toLowerCase().includes(s)) ||
      (a.assignedTo?.email && a.assignedTo.email.toLowerCase().includes(s));

    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const hasSig = a.signatures && a.signatures.length > 0;
    const matchSig = signatureFilter === 'ALL' || (signatureFilter === 'SIGNED' ? hasSig : !hasSig);

    return matchSearch && matchStatus && matchSig;
  });

  const total = assignments.length;
  const actives = assignments.filter(a => a.status === 'ACTIVE').length;
  const signedCount = assignments.filter(a => a.signatures && a.signatures.length > 0 && a.status === 'ACTIVE').length;
  const returned = assignments.filter(a => a.status === 'RETURNED').length;
  const transferred = assignments.filter(a => a.status === 'TRANSFERRED').length;

  const paginatedAssignments = filteredAssignments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const selectedUserObj = users.find(u => u.id === selectedUserId);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
      
      {/* 🌟 1. ULTRA-PREMIUM HERO BANNER 🌟 */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: { xs: 2.5, md: 3.5 },
          background: 'linear-gradient(135deg, #1A1A2E 0%, #2A1B28 50%, #7B0000 100%)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(26, 26, 46, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.3) 0%, rgba(227,30,36,0) 70%)', pointerEvents: 'none' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap', gap: 2.5, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar sx={{ width: 62, height: 62, bgcolor: 'rgba(227,30,36,0.3)', border: '2px solid rgba(227,30,36,0.8)', color: '#FFFFFF', boxShadow: '0 8px 24px rgba(227,30,36,0.45)' }}>
              <AssignmentIcon sx={{ fontSize: 34, color: '#FFFFFF' }} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                  Affectations & Décharges Numériques
                </Typography>
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: 16, color: '#A7F3D0 !important' }} />}
                  label="PV Électroniques Certifiés"
                  size="small"
                  sx={{ bgcolor: 'rgba(5, 150, 105, 0.25)', color: '#A7F3D0', border: '1px solid rgba(167, 243, 208, 0.4)', fontWeight: 800 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.6, maxWidth: 680 }}>
                Dotations de matériel informatique avec signature électronique immédiate sur écran, traçabilité des PV et gestion des transferts.
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={handleExportCSV}
              startIcon={<ExportIcon />}
              sx={{
                color: '#FFFFFF',
                borderColor: 'rgba(255,255,255,0.3)',
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                px: 2,
                backdropFilter: 'blur(10px)',
                bgcolor: 'rgba(255,255,255,0.06)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: '#FFFFFF' }
              }}
            >
              Exporter CSV
            </Button>

            <Button
              variant="contained"
              onClick={() => handleOpenWizard(false)}
              startIcon={<AddIcon />}
              sx={{
                background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                color: '#FFFFFF',
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                px: 2.8,
                boxShadow: '0 4px 14px rgba(227, 30, 36, 0.45)',
                '&:hover': { background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)' }
              }}
            >
              Nouvelle Affectation
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 📊 2. FOUR GLASSMORPHIС KPI CARDS 📊 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {[
          { label: "Total Affectations", number: total, sub: "Historique des dotations", icon: <AssignmentIcon />, color: '#1A1A2E' },
          { label: "En Service Actif", number: actives, sub: `${actives > 0 ? Math.round((signedCount/actives)*100) : 100}% PV signés`, icon: <ActiveIcon />, color: '#059669' },
          { label: "Restitutions Clôturées", number: returned, sub: "Matériels réintégrés au stock", icon: <ReturnIcon />, color: '#2563EB' },
          { label: "Transferts de Postes", number: transferred, sub: "Réaffectations entre équipes", icon: <TransferIcon />, color: '#D97706' },
        ].map((stat, i) => (
          <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 2, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' } }}>
            <Box sx={{ width: 50, height: 50, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.65rem', lineHeight: 1.1 }}>
                {loading ? <Skeleton width={50} /> : stat.number}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, mt: 0.3, display: 'block' }}>
                {stat.label}
              </Typography>
              <Typography variant="caption" sx={{ color: stat.color, fontWeight: 800, fontSize: '0.72rem' }}>
                {stat.sub}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* 🔍 3. SEARCH & FILTERS BAR 🔍 */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', p: 2.5, bgcolor: '#FFFFFF' }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <Box sx={{ display: 'flex', gap: 2, flex: '1 1 500px', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Rechercher par collaborateur, équipement, n° inventaire, S/N, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> } }}
              sx={{ flex: '1 1 300px' }}
            />
            
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>Statut d'Affectation</InputLabel>
              <Select value={statusFilter} label="Statut d'Affectation" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="ALL">Tous les statuts</MenuItem>
                <MenuItem value="ACTIVE">🟢 En Service Actif</MenuItem>
                <MenuItem value="RETURNED">🔵 Restitué au stock</MenuItem>
                <MenuItem value="TRANSFERRED">🟠 Transféré</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>Statut Signature PV</InputLabel>
              <Select value={signatureFilter} label="Statut Signature PV" onChange={(e) => setSignatureFilter(e.target.value)}>
                <MenuItem value="ALL">Toutes les signatures</MenuItem>
                <MenuItem value="SIGNED">✅ PV Signé (Conforme)</MenuItem>
                <MenuItem value="UNSIGNED">⏳ En attente de signature</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* View Switcher Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>
              {filteredAssignments.length} affectation(s)
            </Typography>
            <ButtonGroup size="small" sx={{ borderRadius: 2 }}>
              <Button
                variant={viewMode === 'TABLE' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('TABLE')}
                startIcon={<TableViewIcon />}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: viewMode === 'TABLE' ? '#1A1A2E' : 'transparent',
                  color: viewMode === 'TABLE' ? '#FFFFFF' : '#64748B',
                  borderColor: '#CBD5E1',
                  '&:hover': { bgcolor: viewMode === 'TABLE' ? '#1A1A2E' : '#F8FAFC' }
                }}
              >
                Tableau Registre
              </Button>
              <Button
                variant={viewMode === 'MAP' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('MAP')}
                startIcon={<MapIcon />}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: viewMode === 'MAP' ? '#E31E24' : 'transparent',
                  color: viewMode === 'MAP' ? '#FFFFFF' : '#64748B',
                  borderColor: '#CBD5E1',
                  '&:hover': { bgcolor: viewMode === 'MAP' ? '#C41018' : '#F1F5F9' }
                }}
              >
                Visual Fleet Map 🗺️
              </Button>
            </ButtonGroup>
          </Box>
        </Box>

        {/* 🗺️ VIEW: MAP OR TABLE */}
        {viewMode === 'MAP' ? (
          <VisualFleetMap
            equipments={equipments}
            assignments={assignments}
            onAssignDesk={(desk) => handleOpenWizardFromDesk(desk)}
            onSignPV={(a) => {
              setSigAssignment(a);
              setSigModalOpen(true);
            }}
            onDownloadPV={(a) => handleDownloadPDF(a)}
            onReturnEquipment={(a) => handleOpenReturn(a)}
          />
        ) : (
          <>
            <TableContainer>
          <Table size="medium">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Collaborateur Bénéficiaire</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Matériel Doté & S/N</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Période de Dotation</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Statut & Signature PV</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#1E293B' }}>Procès-Verbal</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#1E293B' }}>Actions Cycle de Vie</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton width={160} /></TableCell>
                    <TableCell><Skeleton width={180} /></TableCell>
                    <TableCell><Skeleton width={120} /></TableCell>
                    <TableCell><Skeleton width={140} /></TableCell>
                    <TableCell align="center"><Skeleton width={100} /></TableCell>
                    <TableCell align="center"><Skeleton width={140} /></TableCell>
                  </TableRow>
                ))
              ) : paginatedAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                    <AssignmentIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                    <Typography sx={{ fontWeight: 700, color: '#64748B' }}>
                      Aucune affectation trouvée avec ces critères.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAssignments.map((row) => {
                  const hasSig = row.signatures && row.signatures.length > 0;
                  return (
                    <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                      
                      {/* Collaborator */}
                      <TableCell>
                        {row.assignedTo ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 38, height: 38, bgcolor: '#1A1A2E', color: '#FFFFFF', fontWeight: 800, fontSize: '0.85rem' }}>
                              {row.assignedTo.firstName?.[0]}{row.assignedTo.lastName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '0.92rem' }}>
                                {row.assignedTo.firstName} {row.assignedTo.lastName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                                {row.assignedTo.email}
                              </Typography>
                              {row.assignedTo.department && (
                                <Chip
                                  label={row.assignedTo.department.name}
                                  size="small"
                                  sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#EFF6FF', color: '#1D4ED8', mt: 0.3 }}
                                />
                              )}
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: '#94A3B8' }}>Non assigné</Typography>
                        )}
                      </TableCell>

                      {/* Equipment */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: '#F1F5F9', border: '1px solid #E2E8F0', mt: 0.2 }}>
                            {getCategoryIcon(row.equipment?.category?.name)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '0.9rem' }}>
                              {row.equipment?.name || 'Matériel'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.3, flexWrap: 'wrap' }}>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#E31E24' }}>
                                {row.equipment?.inventoryNumber || '-'}
                              </Typography>
                              {row.equipment?.serialNumber && (
                                <Typography variant="caption" sx={{ color: '#64748B', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                                  • S/N: {row.equipment.serialNumber}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Period */}
                      <TableCell>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E293B' }}>
                          {row.startDate ? new Date(row.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </Typography>
                        {row.endDate && (
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                            Fin : {new Date(row.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Status & Signature Badge */}
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, alignItems: 'flex-start' }}>
                          <StatusChip status={row.status} statusMap={statusMap} />
                          {hasSig ? (
                            <Chip
                              icon={<VerifiedIcon sx={{ fontSize: 14, color: '#047857 !important' }} />}
                              label="PV Signé Électroniquement"
                              size="small"
                              sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}
                            />
                          ) : (
                            <Chip
                              icon={<DrawIcon sx={{ fontSize: 14, color: '#B45309 !important' }} />}
                              label="En attente de signature"
                              size="small"
                              onClick={() => { setSigAssignment(row); setSigModalOpen(true); }}
                              clickable
                              sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A' }}
                            />
                          )}
                        </Box>
                      </TableCell>

                      {/* Download PDF Button */}
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PdfIcon sx={{ color: '#E31E24' }} />}
                          onClick={() => handleDownloadPDF(row)}
                          sx={{
                            color: '#1A1A2E',
                            borderColor: '#CBD5E1',
                            fontSize: '0.78rem',
                            textTransform: 'none',
                            fontWeight: 800,
                            borderRadius: 2,
                            px: 1.5,
                            '&:hover': { bgcolor: '#F8FAFC', borderColor: '#E31E24' }
                          }}
                        >
                          Télécharger PV
                        </Button>
                      </TableCell>

                      {/* Life-cycle Actions */}
                      <TableCell align="center">
                        {row.status === 'ACTIVE' ? (
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<ReturnIcon />}
                              onClick={() => handleOpenReturn(row)}
                              sx={{
                                background: 'linear-gradient(90deg, #2563EB 0%, #1D4ED8 100%)',
                                color: '#FFFFFF',
                                textTransform: 'none',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                borderRadius: 2,
                                px: 1.5
                              }}
                            >
                              Restituer
                            </Button>

                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<TransferIcon />}
                              onClick={() => handleOpenTransfer(row)}
                              sx={{
                                background: 'linear-gradient(90deg, #D97706 0%, #B45309 100%)',
                                color: '#FFFFFF',
                                textTransform: 'none',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                borderRadius: 2,
                                px: 1.5
                              }}
                            >
                              Transférer
                            </Button>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>
                            Dossier clôturé
                          </Typography>
                        )}
                      </TableCell>

                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredAssignments.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Lignes par page :"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`}
          sx={{ borderTop: '1px solid #E2E8F0', px: 2 }}
        />
          </>
        )}
      </Paper>

      {/* 🚀 5. GUIDED 3-STEP ASSIGNMENT & PACK WIZARD DIALOG 🚀 */}
      <Dialog
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1A1A2E 0%, #2A1B28 50%, #7B0000 100%)',
          color: '#FFFFFF',
          p: 2.5,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#E31E24', color: '#FFFFFF' }}>
              <AssignmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                Assistant d'Affectation & Signature de Décharge
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Dotation de matériel avec signature immédiate ou différée
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setWizardOpen(false)} sx={{ color: '#FFFFFF' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Stepper Header */}
        <Box sx={{ p: 2, px: 4, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <Stepper activeStep={activeStep}>
            <Step><StepLabel><Typography sx={{ fontWeight: 800, fontSize: '0.82rem' }}>1. Collaborateur</Typography></StepLabel></Step>
            <Step><StepLabel><Typography sx={{ fontWeight: 800, fontSize: '0.82rem' }}>2. Matériel(s) en Stock</Typography></StepLabel></Step>
            <Step><StepLabel><Typography sx={{ fontWeight: 800, fontSize: '0.82rem' }}>3. Signature & Validation</Typography></StepLabel></Step>
          </Stepper>
        </Box>

        <DialogContent sx={{ p: 3, bgcolor: '#FAFAFA', minHeight: 360 }}>
          
          {/* STEP 0: COLLABORATOR SELECTION */}
          {activeStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1rem' }}>
                👤 Choisissez le collaborateur destinataire :
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Sélectionner un collaborateur *</InputLabel>
                <Select
                  value={selectedUserId}
                  label="Sélectionner un collaborateur *"
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  sx={{ bgcolor: '#FFFFFF' }}
                >
                  {users.map(u => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email}) {u.department?.name ? `• ${u.department.name}` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedUserObj && (
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #BFDBFE', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 50, height: 50, bgcolor: '#2563EB', color: '#FFFFFF', fontWeight: 900, fontSize: '1.2rem' }}>
                    {selectedUserObj.firstName?.[0]}{selectedUserObj.lastName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 900, color: '#1E40AF', fontSize: '1.05rem' }}>
                      {selectedUserObj.firstName} {selectedUserObj.lastName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#3B82F6' }}>
                      {selectedUserObj.email} {selectedUserObj.phone ? `• 📞 ${selectedUserObj.phone}` : ''}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#1E40AF', fontWeight: 700, mt: 0.5, display: 'block' }}>
                      📍 Département : {selectedUserObj.department?.name || 'Non assigné'} ({selectedUserObj.department?.location || 'Siège'})
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Box>
          )}

          {/* STEP 1: EQUIPMENT SELECTION (Single or Multi-Pack) */}
          {activeStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1rem' }}>
                  💻 Sélectionnez le(s) équipement(s) à affecter ({selectedEquipmentIds.length} sélectionné(s)) :
                </Typography>
                <Button
                  size="small"
                  onClick={() => setSelectedEquipmentIds(equipments.map(e => e.id))}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', color: '#2563EB' }}
                >
                  Tout sélectionner
                </Button>
              </Box>

              {equipments.length === 0 ? (
                <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <InventoryIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1 }} />
                  <Typography sx={{ fontWeight: 700, color: '#64748B' }}>
                    Aucun équipement disponible en stock actuellement.
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, maxHeight: 320, overflowY: 'auto', p: 0.5 }}>
                  {equipments.map(eq => {
                    const isSelected = selectedEquipmentIds.includes(eq.id);
                    return (
                      <Paper
                        key={eq.id}
                        elevation={0}
                        onClick={() => handleToggleEquipment(eq.id)}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          border: '2px solid',
                          borderColor: isSelected ? '#E31E24' : '#E2E8F0',
                          bgcolor: isSelected ? '#FFF1F1' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          transition: 'all 0.15s'
                        }}
                      >
                        <Checkbox checked={isSelected} sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' }, p: 0 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '0.9rem', lineHeight: 1.2 }}>
                            {eq.name}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#E31E24', fontWeight: 800, display: 'block', mt: 0.3 }}>
                            {eq.inventoryNumber}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {eq.category?.name} {eq.serialNumber ? `• S/N: ${eq.serialNumber}` : ''}
                          </Typography>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </Box>
          )}

          {/* STEP 2: DIGITAL SIGNATURE & NOTES */}
          {activeStep === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                  Récapitulatif de la Dotation
                </Typography>
                <Typography sx={{ fontWeight: 800, color: '#1A1A2E', mt: 0.5 }}>
                  Collaborateur : {selectedUserObj?.firstName} {selectedUserObj?.lastName} ({selectedUserObj?.department?.name || 'Département'})
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', mt: 0.3 }}>
                  Matériel(s) affecté(s) : {selectedEquipmentIds.length} équipement(s)
                </Typography>
              </Box>

              <TextField
                label="Observations & Notes de Décharge"
                placeholder="ex: Matériel neuf remis en main propre avec housse et câble d'alimentation..."
                fullWidth
                multiline
                rows={2}
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
              />

              <FormControlLabel
                control={<Checkbox checked={enableImmediateSign} onChange={(e) => setEnableImmediateSign(e.target.checked)} sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />}
                label={<Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '0.9rem' }}>✍️ Signer électroniquement la décharge sur cet écran maintenant</Typography>}
              />

              {enableImmediateSign && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>
                      Zone de Signature Tactile du Collaborateur :
                    </Typography>
                    <Button size="small" onClick={() => sigPadRef.current?.clear()} sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#E31E24', fontWeight: 700 }}>
                      Effacer la signature
                    </Button>
                  </Box>
                  <Box sx={{ border: '2px dashed #CBD5E1', borderRadius: 2.5, bgcolor: '#FFFFFF', overflow: 'hidden' }}>
                    <SignatureCanvas
                      ref={sigPadRef}
                      penColor="#1A1A2E"
                      canvasProps={{ width: 680, height: 140, className: 'sigCanvas', style: { width: '100%', height: '140px', background: '#FFFFFF' } }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          )}

        </DialogContent>

        <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
          <Button
            onClick={() => activeStep === 0 ? setWizardOpen(false) : setActiveStep(s => s - 1)}
            variant="outlined"
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B' }}
          >
            {activeStep === 0 ? 'Annuler' : 'Précédent'}
          </Button>

          {activeStep < 2 ? (
            <Button
              variant="contained"
              onClick={() => {
                if (activeStep === 0 && !selectedUserId) {
                  setSnackbar({ open: true, message: "Sélectionnez d'abord un collaborateur.", severity: 'error' });
                  return;
                }
                if (activeStep === 1 && selectedEquipmentIds.length === 0) {
                  setSnackbar({ open: true, message: "Sélectionnez au moins un équipement.", severity: 'error' });
                  return;
                }
                setActiveStep(s => s + 1);
              }}
              sx={{
                background: 'linear-gradient(90deg, #1A1A2E 0%, #2A1B28 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                borderRadius: 2.5,
                px: 3.5,
                textTransform: 'none'
              }}
            >
              Étape Suivante ➔
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={savingAssignment}
              onClick={handleCompleteWizard}
              sx={{
                background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                borderRadius: 2.5,
                px: 4,
                py: 1.1,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(227, 30, 36, 0.4)'
              }}
            >
              {savingAssignment ? 'Enregistrement & Génération PV...' : 'Valider & Enregistrer l\'Affectation'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* 🔄 6. RESTITUTION AVEC CHECK-UP D'ÉTAT DU MATÉRIEL 🔄 */}
      <Dialog
        open={returnDialogOpen}
        onClose={() => setReturnDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ReturnIcon sx={{ color: '#2563EB' }} /> Restitution du Matériel au Stock
        </DialogTitle>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {selectedReturnAssignment && (
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>Matériel Restitué :</Typography>
              <Typography sx={{ fontWeight: 800, color: '#1A1A2E' }}>
                {selectedReturnAssignment.equipment?.name} ({selectedReturnAssignment.equipment?.inventoryNumber})
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.3 }}>
                Restitué par : <strong>{selectedReturnAssignment.assignedTo?.firstName} {selectedReturnAssignment.assignedTo?.lastName}</strong>
              </Typography>
            </Box>
          )}

          <FormControl fullWidth>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 1, display: 'block' }}>
              📋 Évaluation de l'état du matériel rendu :
            </Typography>
            <RadioGroup value={returnCondition} onChange={(e) => setReturnCondition(e.target.value as any)}>
              <FormControlLabel value="GOOD" control={<Radio sx={{ color: '#059669', '&.Mui-checked': { color: '#059669' } }} />} label="🟢 Excellent état (Remise en stock immédiate)" />
              <FormControlLabel value="NORMAL" control={<Radio sx={{ color: '#2563EB', '&.Mui-checked': { color: '#2563EB' } }} />} label="🟡 Bon état avec usure normale" />
              <FormControlLabel value="DAMAGED" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="🔴 Matériel défectueux / Panne (Envoi direct en maintenance)" />
            </RadioGroup>
          </FormControl>

          <TextField
            label="Notes de Restitution / Constat IT"
            placeholder="ex: Restitué complet avec chargeur et souris sans rayures."
            fullWidth
            multiline
            rows={2}
            value={returnNotes}
            onChange={(e) => setReturnNotes(e.target.value)}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
          <Button onClick={() => setReturnDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B' }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            disabled={savingReturn}
            onClick={handleConfirmReturn}
            sx={{
              background: 'linear-gradient(90deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: 2.5,
              px: 3.5,
              textTransform: 'none'
            }}
          >
            {savingReturn ? 'Clôture en cours...' : 'Confirmer la Restitution'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔀 7. TRANSFERT D'ÉQUIPEMENT À UN AUTRE COLLABORATEUR 🔀 */}
      <Dialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TransferIcon sx={{ color: '#D97706' }} /> Transfert de Matériel vers un Nouveau Collaborateur
        </DialogTitle>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {selectedTransferAssignment && (
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#92400E' }}>Matériel à transférer :</Typography>
              <Typography sx={{ fontWeight: 800, color: '#78350F' }}>
                {selectedTransferAssignment.equipment?.name} ({selectedTransferAssignment.equipment?.inventoryNumber})
              </Typography>
              <Typography variant="caption" sx={{ color: '#92400E', display: 'block', mt: 0.3 }}>
                Actuellement détenu par : {selectedTransferAssignment.assignedTo?.firstName} {selectedTransferAssignment.assignedTo?.lastName}
              </Typography>
            </Box>
          )}

          <FormControl fullWidth required>
            <InputLabel>Nouveau Bénéficiaire *</InputLabel>
            <Select
              value={transferNewUserId}
              label="Nouveau Bénéficiaire *"
              onChange={(e) => setTransferNewUserId(e.target.value)}
            >
              {users
                .filter(u => u.id !== selectedTransferAssignment?.assignedToId)
                .map(u => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.email}) {u.department?.name ? `• ${u.department.name}` : ''}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            label="Motif / Notes de Transfert"
            placeholder="ex: Changement de poste interne ou réaffectation de service."
            fullWidth
            multiline
            rows={2}
            value={transferNotes}
            onChange={(e) => setTransferNotes(e.target.value)}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
          <Button onClick={() => setTransferDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B' }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            disabled={savingTransfer || !transferNewUserId}
            onClick={handleConfirmTransfer}
            sx={{
              background: 'linear-gradient(90deg, #D97706 0%, #B45309 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: 2.5,
              px: 3.5,
              textTransform: 'none'
            }}
          >
            {savingTransfer ? 'Transfert en cours...' : 'Valider le Transfert'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✍️ STANDALONE SIGNATURE CANVAS MODAL */}
      <SignatureCanvasModal
        open={sigModalOpen}
        onClose={() => setSigModalOpen(false)}
        onSaveSignature={handleSaveStandaloneSignature}
        recipientName={sigAssignment?.assignedTo ? `${sigAssignment.assignedTo.firstName} ${sigAssignment.assignedTo.lastName}` : "Collaborateur"}
        equipmentName={sigAssignment?.equipment?.name || "Équipement"}
        serialNumber={sigAssignment?.equipment?.serialNumber || sigAssignment?.equipment?.inventoryNumber}
      />

      {/* Snackbar Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2.5, fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
