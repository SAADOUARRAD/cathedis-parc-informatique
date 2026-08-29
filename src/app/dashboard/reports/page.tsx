'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Skeleton,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Assessment as ReportIcon,
  PictureAsPdf as PdfIcon,
  FileDownload as CsvIcon,
  Inventory as InventoryIcon,
  MonetizationOn as MoneyIcon,
  Build as BuildIcon,
  CheckCircle as SuccessIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  AssignmentTurnedIn as SignIcon,
  Warning as WarningIcon,
  Computer as ComputerIcon,
  Business as BusinessIcon,
  Verified as VerifiedIcon,
  AutoAwesome as SparklesIcon
} from '@mui/icons-material';
import {
  generateInventoryReportPDF,
  generateFinancialReportPDF,
  generateMaintenanceReportPDF,
  generateComplianceReportPDF
} from '@/lib/pdf/generateOfficialReportsPDF';

type ReportType = 'INVENTORY' | 'FINANCIAL' | 'MAINTENANCE' | 'COMPLIANCE';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('INVENTORY');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [search, setSearch] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports/data');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        throw new Error('Erreur lors du chargement des données');
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Erreur réseau', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleExportPDF = async () => {
    if (!data) return;
    setGeneratingPdf(true);
    try {
      if (activeReport === 'INVENTORY') {
        await generateInventoryReportPDF(data.inventoryReport);
      } else if (activeReport === 'FINANCIAL') {
        await generateFinancialReportPDF(data.financialReport);
      } else if (activeReport === 'MAINTENANCE') {
        await generateMaintenanceReportPDF(data.maintenanceReport);
      } else if (activeReport === 'COMPLIANCE') {
        await generateComplianceReportPDF(data.complianceReport);
      }
      setSnackbar({ open: true, message: 'PDF officiel certifié téléchargé avec succès !', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Erreur lors de la génération du PDF', severity: 'error' });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;

    let headers: string[] = [];
    let rows: any[][] = [];
    let fileName = '';

    if (activeReport === 'INVENTORY') {
      fileName = 'cathedis_bilan_inventaire';
      headers = ['N° Inventaire', 'Équipement', 'Marque', 'Modèle', 'N° Série', 'Catégorie', 'Statut', 'Département', 'Détenteur Actuel', 'Email Détenteur'];
      rows = data.inventoryReport.items.map((it: any) => [
        it.inventoryNumber,
        `"${(it.name || '').replace(/"/g, '""')}"`,
        `"${(it.brand || '').replace(/"/g, '""')}"`,
        `"${(it.model || '').replace(/"/g, '""')}"`,
        `"${(it.serialNumber || '').replace(/"/g, '""')}"`,
        `"${(it.category || '').replace(/"/g, '""')}"`,
        it.status,
        `"${(it.department || '').replace(/"/g, '""')}"`,
        `"${(it.holderName || '').replace(/"/g, '""')}"`,
        `"${(it.holderEmail || '').replace(/"/g, '""')}"`
      ]);
    } else if (activeReport === 'FINANCIAL') {
      fileName = 'cathedis_bilan_amortissement_vnc';
      headers = ['Équipement', 'Catégorie', 'Prix Achat (DH)', 'Durée Amortissement', 'Âge (Mois)', 'Amortissement Cumulé (DH)', 'Valeur Nette Comptable VNC (DH)'];
      rows = data.financialReport.items.map((it: any) => [
        `"${(it.name || '').replace(/"/g, '""')}"`,
        `"${(it.category || '').replace(/"/g, '""')}"`,
        it.purchasePrice,
        `${it.lifespanYears} ans`,
        it.ageInMonths,
        it.cumulativeDepreciation,
        it.vnc
      ]);
    } else if (activeReport === 'MAINTENANCE') {
      fileName = 'cathedis_rapport_maintenances';
      headers = ['Matériel', 'N° Série', 'Type', 'Priorité', 'Statut', 'Demandeur', 'Technicien', 'Coût (DH)', 'Description', 'Diagnostic', 'Solution'];
      rows = data.maintenanceReport.items.map((it: any) => [
        `"${(it.equipmentName || '').replace(/"/g, '""')}"`,
        `"${(it.serialNumber || '').replace(/"/g, '""')}"`,
        it.type,
        it.priority,
        it.status,
        `"${(it.reporterName || '').replace(/"/g, '""')}"`,
        `"${(it.technicianName || '').replace(/"/g, '""')}"`,
        it.cost,
        `"${(it.description || '').replace(/"/g, '""')}"`,
        `"${(it.diagnosis || '').replace(/"/g, '""')}"`,
        `"${(it.solution || '').replace(/"/g, '""')}"`
      ]);
    } else if (activeReport === 'COMPLIANCE') {
      fileName = 'cathedis_registre_conformite_pv';
      headers = ['Équipement', 'N° Série', 'Collaborateur', 'Email', 'Département', 'Affecté Par', 'Statut Affectation', 'Date Dotation', 'Décharge Signée'];
      rows = data.complianceReport.items.map((it: any) => [
        `"${(it.equipmentName || '').replace(/"/g, '""')}"`,
        `"${(it.serialNumber || '').replace(/"/g, '""')}"`,
        `"${(it.userName || '').replace(/"/g, '""')}"`,
        `"${(it.userEmail || '').replace(/"/g, '""')}"`,
        `"${(it.department || '').replace(/"/g, '""')}"`,
        `"${(it.assignedBy || '').replace(/"/g, '""')}"`,
        it.status,
        it.startDate ? new Date(it.startDate).toLocaleDateString('fr-FR') : '-',
        it.isSigned ? 'OUI (CONFORME)' : 'NON (EN ATTENTE)'
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({ open: true, message: 'Export Excel/CSV généré avec succès !', severity: 'success' });
  };

  const getFilteredItems = () => {
    if (!data) return [];
    const s = search.toLowerCase();

    if (activeReport === 'INVENTORY') {
      return data.inventoryReport.items.filter((it: any) =>
        !s ||
        (it.name || '').toLowerCase().includes(s) ||
        (it.inventoryNumber || '').toLowerCase().includes(s) ||
        (it.serialNumber || '').toLowerCase().includes(s) ||
        (it.holderName || '').toLowerCase().includes(s) ||
        (it.category || '').toLowerCase().includes(s)
      );
    } else if (activeReport === 'FINANCIAL') {
      return data.financialReport.items.filter((it: any) =>
        !s ||
        (it.name || '').toLowerCase().includes(s) ||
        (it.category || '').toLowerCase().includes(s) ||
        (it.serialNumber || '').toLowerCase().includes(s)
      );
    } else if (activeReport === 'MAINTENANCE') {
      return data.maintenanceReport.items.filter((it: any) =>
        !s ||
        (it.equipmentName || '').toLowerCase().includes(s) ||
        (it.reporterName || '').toLowerCase().includes(s) ||
        (it.technicianName || '').toLowerCase().includes(s) ||
        (it.description || '').toLowerCase().includes(s)
      );
    } else if (activeReport === 'COMPLIANCE') {
      return data.complianceReport.items.filter((it: any) =>
        !s ||
        (it.equipmentName || '').toLowerCase().includes(s) ||
        (it.userName || '').toLowerCase().includes(s) ||
        (it.department || '').toLowerCase().includes(s)
      );
    }
    return [];
  };

  const filteredItems = getFilteredItems();
  const paginatedItems = filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const reportTabs = [
    {
      type: 'INVENTORY' as ReportType,
      title: 'Bilan d\'Inventaire Général',
      sub: 'Parc & Affectations',
      icon: <InventoryIcon />,
      color: '#2563EB',
      gradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
    },
    {
      type: 'FINANCIAL' as ReportType,
      title: 'Amortissement & VNC',
      sub: 'Bilan Comptable & TCO',
      icon: <MoneyIcon />,
      color: '#E31E24',
      gradient: 'linear-gradient(135deg, #E31E24 0%, #C41018 100%)'
    },
    {
      type: 'MAINTENANCE' as ReportType,
      title: 'Rapport Annuel SAV',
      sub: 'Maintenances & Dépenses',
      icon: <BuildIcon />,
      color: '#0284C7',
      gradient: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)'
    },
    {
      type: 'COMPLIANCE' as ReportType,
      title: 'Conformité Légale (PV)',
      sub: 'Décharges Numériques',
      icon: <SignIcon />,
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
      
      {/* 🌟 1. HERO BANNER DSI 🌟 */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          background: 'linear-gradient(135deg, #0D0F1D 0%, #1A1A2E 45%, #7B0000 100%)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(26, 26, 46, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.35) 0%, rgba(227,30,36,0) 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: 240, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(37,99,235,0) 70%)', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ maxWidth: 720 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.8, py: 0.6, borderRadius: 10, bgcolor: 'rgba(227, 30, 36, 0.25)', border: '1px solid rgba(227, 30, 36, 0.5)', mb: 1.5 }}>
              <VerifiedIcon sx={{ fontSize: 16, color: '#FF8A80' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFCDD2', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Centre d'Édition Officielle & Audits DSI • Cathedis
              </Typography>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', fontSize: { xs: '1.7rem', md: '2.3rem' }, letterSpacing: '-0.02em', mb: 1 }}>
              Générateur de Bilans Officiels en 1 Clic 📄✨
            </Typography>

            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Édition instantanée de rapports certifiés PDF et exports comptables Excel/CSV pour la Direction Générale, les commissaires aux comptes et les audits de conformité IT.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={fetchReportsData}
            startIcon={<RefreshIcon />}
            sx={{
              color: '#FFFFFF',
              borderColor: 'rgba(255,255,255,0.4)',
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none',
              px: 2.5,
              py: 1,
              backdropFilter: 'blur(10px)',
              bgcolor: 'rgba(255,255,255,0.08)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.18)', borderColor: '#FFFFFF' }
            }}
          >
            Actualiser les Données
          </Button>
        </Box>
      </Paper>

      {/* 🗂️ 2. LES 4 ONGLETS DES RAPPORTS OFFICIELS 🗂️ */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {reportTabs.map((tab) => {
          const isActive = activeReport === tab.type;

          return (
            <Paper
              key={tab.type}
              elevation={0}
              onClick={() => {
                setActiveReport(tab.type);
                setPage(0);
              }}
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                bgcolor: isActive ? '#1A1A2E' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#1A1A2E',
                border: isActive ? `2px solid ${tab.color}` : '1px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                boxShadow: isActive ? `0 12px 28px ${tab.color}35` : 'none',
                transform: isActive ? 'scale(1.02)' : 'none',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
                }
              }}
            >
              <Avatar sx={{ width: 48, height: 48, background: tab.gradient, color: '#FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                {tab.icon}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', lineHeight: 1.2 }}>
                  {tab.title}
                </Typography>
                <Typography variant="caption" sx={{ color: isActive ? 'rgba(255,255,255,0.7)' : '#64748B', fontWeight: 700 }}>
                  {tab.sub}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* 📊 3. SECTION DU RAPPORT SÉLECTIONNÉ 📊 */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 3 }} />)}
          </Box>
          <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
        </Box>
      ) : data ? (
        <>
          {/* A. 4 KPIs Métiers Dynamiques */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            {activeReport === 'INVENTORY' && [
              { label: 'Total Équipements', val: data.inventoryReport.stats.total, sub: 'Actifs enregistrés', color: '#2563EB', icon: <ComputerIcon /> },
              { label: 'Disponibles en Stock', val: data.inventoryReport.stats.available, sub: 'Prêts à être affectés', color: '#059669', icon: <SuccessIcon /> },
              { label: 'Affectés aux Collaborateurs', val: data.inventoryReport.stats.assigned, sub: 'En utilisation active', color: '#0284C7', icon: <SignIcon /> },
              { label: 'En Maintenance / Pannes', val: data.inventoryReport.stats.maintenance, sub: 'En cours d\'atelier', color: '#D97706', icon: <BuildIcon /> },
            ].map((kpi, i) => (
              <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 46, height: 46, bgcolor: `${kpi.color}15`, color: kpi.color }}>{kpi.icon}</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', color: '#1A1A2E', lineHeight: 1.1 }}>{kpi.val}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block' }}>{kpi.label}</Typography>
                  <Typography variant="caption" sx={{ color: kpi.color, fontWeight: 700, fontSize: '0.72rem' }}>{kpi.sub}</Typography>
                </Box>
              </Paper>
            ))}

            {activeReport === 'FINANCIAL' && [
              { label: 'Valeur d\'Acquisition', val: `${data.financialReport.stats.totalAcquisitionValue} DH`, sub: 'Investissement brut initial', color: '#1A1A2E', icon: <MoneyIcon /> },
              { label: 'Amortissement Cumulé', val: `${data.financialReport.stats.totalCumulativeDepreciation} DH`, sub: `Taux: ${data.financialReport.stats.depreciationRate}% déprécié`, color: '#D97706', icon: <TrendingUpIcon /> },
              { label: 'Valeur Nette (VNC)', val: `${data.financialReport.stats.totalResidualVNC} DH`, sub: 'Valeur comptable actuelle', color: '#059669', icon: <SuccessIcon /> },
              { label: 'Dépenses SAV / Réparations', val: `${data.financialReport.stats.totalMaintenanceSpent} DH`, sub: 'Coût cumulé des pannes', color: '#E31E24', icon: <BuildIcon /> },
            ].map((kpi, i) => (
              <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 46, height: 46, bgcolor: `${kpi.color}15`, color: kpi.color }}>{kpi.icon}</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.45rem', color: '#1A1A2E', lineHeight: 1.1 }}>{kpi.val}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block' }}>{kpi.label}</Typography>
                  <Typography variant="caption" sx={{ color: kpi.color, fontWeight: 700, fontSize: '0.72rem' }}>{kpi.sub}</Typography>
                </Box>
              </Paper>
            ))}

            {activeReport === 'MAINTENANCE' && [
              { label: 'Total Interventions', val: data.maintenanceReport.stats.total, sub: 'Pannes & entretiens', color: '#1A1A2E', icon: <BuildIcon /> },
              { label: 'Pannes Correctives', val: data.maintenanceReport.stats.corrective, sub: 'Incidents matériels réactifs', color: '#DC2626', icon: <WarningIcon /> },
              { label: 'Taux de Résolution', val: `${data.maintenanceReport.stats.resolutionRate}%`, sub: `${data.maintenanceReport.stats.completed} pannes résolues`, color: '#059669', icon: <SuccessIcon /> },
              { label: 'Coût Total Réparations', val: `${data.maintenanceReport.stats.totalCost} DH`, sub: 'Pièces & Main d\'œuvre', color: '#D97706', icon: <MoneyIcon /> },
            ].map((kpi, i) => (
              <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 46, height: 46, bgcolor: `${kpi.color}15`, color: kpi.color }}>{kpi.icon}</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: '#1A1A2E', lineHeight: 1.1 }}>{kpi.val}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block' }}>{kpi.label}</Typography>
                  <Typography variant="caption" sx={{ color: kpi.color, fontWeight: 700, fontSize: '0.72rem' }}>{kpi.sub}</Typography>
                </Box>
              </Paper>
            ))}

            {activeReport === 'COMPLIANCE' && [
              { label: 'Dotations Actives', val: data.complianceReport.stats.activeAssignments, sub: 'Matériels en service', color: '#2563EB', icon: <ComputerIcon /> },
              { label: 'PV Signés Électroniquement', val: data.complianceReport.stats.signedPV, sub: 'Décharges juridiques validées', color: '#059669', icon: <VerifiedIcon /> },
              { label: 'En Attente de Signature', val: data.complianceReport.stats.pendingSignature, sub: 'Collaborateurs à relancer', color: '#D97706', icon: <ScheduleIcon /> },
              { label: 'Taux de Conformité Légale', val: `${data.complianceReport.stats.complianceRate}%`, sub: 'Couverture légale du parc', color: data.complianceReport.stats.complianceRate >= 80 ? '#059669' : '#DC2626', icon: <SecurityIcon /> },
            ].map((kpi, i) => (
              <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 46, height: 46, bgcolor: `${kpi.color}15`, color: kpi.color }}>{kpi.icon}</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: '#1A1A2E', lineHeight: 1.1 }}>{kpi.val}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block' }}>{kpi.label}</Typography>
                  <Typography variant="caption" sx={{ color: kpi.color, fontWeight: 700, fontSize: '0.72rem' }}>{kpi.sub}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>

          {/* B. Tableau & Commandes de Téléchargement */}
          <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', p: 3, bgcolor: '#FFFFFF' }}>
            
            {/* Header de la Table & Boutons de Téléchargement en 1 Clic */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              
              {/* Search */}
              <TextField
                size="small"
                placeholder="Rechercher dans ce rapport..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94A3B8' }} />
                      </InputAdornment>
                    )
                  }
                }}
                sx={{ minWidth: 280 }}
              />

              {/* Action Buttons: PDF & Excel */}
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  onClick={handleExportCSV}
                  startIcon={<CsvIcon />}
                  sx={{
                    color: '#1A1A2E',
                    borderColor: '#CBD5E1',
                    borderRadius: 2.5,
                    fontWeight: 800,
                    textTransform: 'none',
                    px: 2.5,
                    '&:hover': { bgcolor: '#F8FAFC', borderColor: '#1A1A2E' }
                  }}
                >
                  Exporter Excel / CSV
                </Button>

                <Button
                  variant="contained"
                  disabled={generatingPdf}
                  onClick={handleExportPDF}
                  startIcon={generatingPdf ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <PdfIcon />}
                  sx={{
                    background: activeReport === 'FINANCIAL' ? 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)' : activeReport === 'MAINTENANCE' ? 'linear-gradient(90deg, #0284C7 0%, #0369A1 100%)' : activeReport === 'COMPLIANCE' ? 'linear-gradient(90deg, #059669 0%, #047857 100%)' : 'linear-gradient(90deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    borderRadius: 2.5,
                    fontWeight: 800,
                    textTransform: 'none',
                    px: 3,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.18)'
                  }}
                >
                  {generatingPdf ? 'Génération du PDF...' : 'Télécharger PDF Officiel (Certifié)'}
                </Button>
              </Box>
            </Box>

            {/* Table View */}
            <TableContainer>
              <Table size="medium">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    {activeReport === 'INVENTORY' && (
                      <>
                        <TableCell sx={{ fontWeight: 800 }}>N° Inventaire</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Équipement</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Famille</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>N° Série</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Statut</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Détenteur / Service</TableCell>
                      </>
                    )}

                    {activeReport === 'FINANCIAL' && (
                      <>
                        <TableCell sx={{ fontWeight: 800 }}>Équipement</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Famille</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">Prix Achat</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="center">Durée</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="center">Âge</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">Amortissement</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">VNC Résiduelle</TableCell>
                      </>
                    )}

                    {activeReport === 'MAINTENANCE' && (
                      <>
                        <TableCell sx={{ fontWeight: 800 }}>Matériel Concerné</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Priorité</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Statut</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Demandeur</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Technicien</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">Coût Réparation</TableCell>
                      </>
                    )}

                    {activeReport === 'COMPLIANCE' && (
                      <>
                        <TableCell sx={{ fontWeight: 800 }}>Équipement</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>N° Série</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Collaborateur</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Département</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Date Dotation</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="center">Décharge Signée</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ py: 5, textAlign: 'center' }}>
                        <ReportIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
                        <Typography sx={{ fontWeight: 700, color: '#64748B' }}>
                          Aucune donnée ne correspond à votre recherche.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedItems.map((row: any) => (
                      <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                        {activeReport === 'INVENTORY' && (
                          <>
                            <TableCell sx={{ fontWeight: 800, color: '#1A1A2E', fontFamily: 'monospace' }}>{row.inventoryNumber}</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>
                            <TableCell><Chip label={row.category} size="small" sx={{ fontWeight: 700, fontSize: '0.72rem' }} /></TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', color: '#64748B' }}>{row.serialNumber}</TableCell>
                            <TableCell>
                              <Chip
                                label={row.status === 'AVAILABLE' ? 'Disponible' : row.status === 'ASSIGNED' ? 'Affecté' : row.status === 'MAINTENANCE' ? 'En Panne' : 'Réformé'}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.72rem',
                                  bgcolor: row.status === 'AVAILABLE' ? '#ECFDF5' : row.status === 'ASSIGNED' ? '#EFF6FF' : row.status === 'MAINTENANCE' ? '#FEF3C7' : '#FEF2F2',
                                  color: row.status === 'AVAILABLE' ? '#047857' : row.status === 'ASSIGNED' ? '#1D4ED8' : row.status === 'MAINTENANCE' ? '#B45309' : '#B91C1C'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#334155' }}>
                              {row.holderName ? `${row.holderName} (${row.department})` : row.department || 'Non affecté'}
                            </TableCell>
                          </>
                        )}

                        {activeReport === 'FINANCIAL' && (
                          <>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A2E' }}>{row.name}</TableCell>
                            <TableCell><Chip label={row.category} size="small" sx={{ fontWeight: 700, fontSize: '0.72rem' }} /></TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>{row.purchasePrice} DH</TableCell>
                            <TableCell align="center">{row.lifespanYears} ans</TableCell>
                            <TableCell align="center">{row.ageInMonths} mois</TableCell>
                            <TableCell align="right" sx={{ color: '#D97706', fontWeight: 700 }}>{row.cumulativeDepreciation} DH</TableCell>
                            <TableCell align="right" sx={{ color: '#059669', fontWeight: 900, fontSize: '0.95rem' }}>{row.vnc} DH</TableCell>
                          </>
                        )}

                        {activeReport === 'MAINTENANCE' && (
                          <>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A2E' }}>
                              {row.equipmentName}
                              <Typography variant="caption" sx={{ display: 'block', color: '#64748B', fontFamily: 'monospace' }}>SN: {row.serialNumber}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.type === 'CORRECTIVE' ? 'Corrective' : 'Préventive'}
                                size="small"
                                sx={{ fontWeight: 800, bgcolor: row.type === 'CORRECTIVE' ? '#FEF2F2' : '#EFF6FF', color: row.type === 'CORRECTIVE' ? '#DC2626' : '#2563EB' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.priority === 'CRITICAL' ? 'Critique' : row.priority === 'HIGH' ? 'Haute' : 'Normale'}
                                size="small"
                                sx={{ fontWeight: 800, bgcolor: row.priority === 'CRITICAL' ? '#FEE2E2' : '#FEF3C7', color: row.priority === 'CRITICAL' ? '#991B1B' : '#B45309' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.status === 'COMPLETED' ? 'Résolue' : row.status === 'IN_PROGRESS' ? 'En Cours' : 'En Attente'}
                                size="small"
                                sx={{ fontWeight: 800, bgcolor: row.status === 'COMPLETED' ? '#ECFDF5' : '#E0F2FE', color: row.status === 'COMPLETED' ? '#047857' : '#0284C7' }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.85rem' }}>{row.reporterName}</TableCell>
                            <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{row.technicianName}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: '#047857' }}>{row.cost ? `${row.cost} DH` : '0 DH'}</TableCell>
                          </>
                        )}

                        {activeReport === 'COMPLIANCE' && (
                          <>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A2E' }}>{row.equipmentName}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', color: '#64748B' }}>{row.serialNumber}</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>
                              {row.userName}
                              <Typography variant="caption" sx={{ display: 'block', color: '#64748B' }}>{row.userEmail}</Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.85rem' }}>{row.department}</TableCell>
                            <TableCell sx={{ fontSize: '0.85rem' }}>{row.startDate ? new Date(row.startDate).toLocaleDateString('fr-FR') : '-'}</TableCell>
                            <TableCell align="center">
                              {row.isSigned ? (
                                <Chip icon={<VerifiedIcon sx={{ fontSize: 16, color: '#059669 !important' }} />} label="Signé & Conforme" size="small" sx={{ fontWeight: 800, bgcolor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }} />
                              ) : (
                                <Chip icon={<ScheduleIcon sx={{ fontSize: 16, color: '#D97706 !important' }} />} label="En Attente" size="small" sx={{ fontWeight: 800, bgcolor: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }} />
                              )}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={filteredItems.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Lignes par page :"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`}
              sx={{ borderTop: '1px solid #E2E8F0', mt: 2 }}
            />

          </Paper>
        </>
      ) : null}

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2.5, fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
