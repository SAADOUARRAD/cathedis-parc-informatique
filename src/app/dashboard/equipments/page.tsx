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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Button,
  Divider,
  Avatar,
  Tooltip,
  CircularProgress,
  ButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Devices as DevicesIcon,
  CheckCircle as AvailableIcon,
  AssignmentInd as AssignedIcon,
  Build as MaintenanceIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  QrCode2 as QrCodeIcon,
  LaptopMac as LaptopIcon,
  DesktopWindows as DesktopIcon,
  Headphones as HeadphoneIcon,
  Keyboard as KeyboardIcon,
  Tv as ScreenIcon,
  Print as PrinterIcon,
  Router as NetworkIcon,
  PhoneAndroid as PhoneIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  MonetizationOn as MoneyIcon,
  SettingsSuggest as SettingsIcon,
  Memory as MemoryIcon,
  Fingerprint as MacIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ViewList as TableViewIcon,
  ViewModule as GridViewIcon,
  CameraAlt as CameraIcon,
  FileDownload as ExportIcon,
  Visibility as InspectIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  FlashOn as FlashIcon,
  Print as PrintIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import StatusChip from '@/components/shared/StatusChip';
import AssetTagQRModal from '@/components/shared/AssetTagQRModal';
import RealisticHardwareBlueprint from '@/components/shared/RealisticHardwareBlueprint';

export default function EquipmentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'TABLE' or 'GRID'
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // General & Category Fields
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [departmentId, setDepartmentId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [notes, setNotes] = useState('');

  // Specific Dynamic Fields
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [cpuRamStorage, setCpuRamStorage] = useState('');
  const [macAddress, setMacAddress] = useState('');
  
  // Desktop specific (Associated Screen)
  const [screenBrand, setScreenBrand] = useState('');
  const [screenModel, setScreenModel] = useState('');

  // Headset & Accessories specific
  const [connectionType, setConnectionType] = useState('');
  const [accessoryType, setAccessoryType] = useState('');

  // Network & Printer specific
  const [ipAddress, setIpAddress] = useState('');
  const [locationRack, setLocationRack] = useState('');

  // Details 360° Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDetailsEquipment, setSelectedDetailsEquipment] = useState<any>(null);

  // Deletion & History State
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyEquipment, setHistoryEquipment] = useState<string>('');
  const [historyLoading, setHistoryLoading] = useState(false);

  // QR Modal
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrEquipment, setSelectedQrEquipment] = useState<any>(null);

  // Live Camera Scanner State
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualScanCode, setManualScanCode] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Filters & Search
  const [filters, setFilters] = useState({ status: 'ALL', category: 'ALL', department: 'ALL', search: '' });
  const [activeCategoryTab, setActiveCategoryTab] = useState('ALL');

  // Pagination for Table view
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resEq, resCat, resDept, resSup] = await Promise.all([
        fetch('/api/equipments'),
        fetch('/api/categories'),
        fetch('/api/departments'),
        fetch('/api/suppliers')
      ]);

      if (resEq.ok) setData(await resEq.json() || []);
      if (resCat.ok) setCategories(await resCat.json() || []);
      if (resDept.ok) setDepartments(await resDept.json() || []);
      if (resSup.ok) setSuppliers(await resSup.json() || []);
    } catch (err) {
      console.error('Error loading equipments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category Detection Helper
  const getSelectedCategoryType = (catIdParam?: string) => {
    const targetId = catIdParam || categoryId;
    const cat = categories.find(c => c.id === targetId);
    const catName = cat?.name?.toLowerCase() || '';
    if (catName.includes('portable') || catName.includes('laptop')) return 'LAPTOP';
    if (catName.includes('fixe') || catName.includes('desktop') || catName.includes('bureau')) return 'DESKTOP';
    if (catName.includes('casque') || catName.includes('audio') || catName.includes('headset')) return 'HEADSET';
    if (catName.includes('accessoire') || catName.includes('clavier') || catName.includes('souris') || catName.includes('dock')) return 'ACCESSORY';
    if (catName.includes('écran') || catName.includes('ecran') || catName.includes('moniteur')) return 'SCREEN';
    if (catName.includes('imprimante') || catName.includes('scanner') || catName.includes('print')) return 'PRINTER';
    if (catName.includes('réseau') || catName.includes('reseau') || catName.includes('switch') || catName.includes('routeur')) return 'NETWORK';
    if (catName.includes('téléphone') || catName.includes('telephone') || catName.includes('mobile') || catName.includes('tablette')) return 'MOBILE';
    return 'OTHER';
  };

  const currentCatType = getSelectedCategoryType();

  const getCategoryIcon = (catName?: string, size: number = 20) => {
    const c = catName?.toLowerCase() || '';
    if (c.includes('portable') || c.includes('laptop')) return <LaptopIcon sx={{ fontSize: size, color: '#E31E24' }} />;
    if (c.includes('fixe') || c.includes('desktop')) return <DesktopIcon sx={{ fontSize: size, color: '#2563EB' }} />;
    if (c.includes('casque') || c.includes('audio')) return <HeadphoneIcon sx={{ fontSize: size, color: '#7C3AED' }} />;
    if (c.includes('écran') || c.includes('ecran')) return <ScreenIcon sx={{ fontSize: size, color: '#059669' }} />;
    if (c.includes('imprimante') || c.includes('scanner')) return <PrinterIcon sx={{ fontSize: size, color: '#D97706' }} />;
    if (c.includes('réseau') || c.includes('reseau')) return <NetworkIcon sx={{ fontSize: size, color: '#0891B2' }} />;
    return <DevicesIcon sx={{ fontSize: size, color: '#64748B' }} />;
  };

  // Open Form
  const openForm = (item?: any) => {
    setEditItem(item || null);
    if (item) {
      setCategoryId(item.categoryId || '');
      setName(item.name || '');
      setBrand(item.brand || '');
      setModel(item.model || '');
      setSerialNumber(item.serialNumber || '');
      setStatus(item.status || 'AVAILABLE');
      setDepartmentId(item.departmentId || '');
      setSupplierId(item.supplierId || '');
      setPurchasePrice(item.purchasePrice ? String(item.purchasePrice) : '');
      setPurchaseDate(item.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : '');

      const desc = item.description || '';
      const configMatch = desc.match(/Config:\s*([^\n|]+)/i);
      const macMatch = desc.match(/MAC:\s*([^\n|]+)/i);
      const screenMatch = desc.match(/Écran:\s*([^\n|]+)/i);
      const connMatch = desc.match(/Connectique:\s*([^\n|]+)/i);
      const notesMatch = desc.match(/Notes:\s*(.+)$/is);

      setCpuRamStorage(configMatch ? configMatch[1].trim() : '');
      setMacAddress(macMatch ? macMatch[1].trim() : '');
      if (screenMatch) {
        const parts = screenMatch[1].split('-');
        setScreenBrand(parts[0]?.trim() || '');
        setScreenModel(parts[1]?.trim() || '');
      } else {
        setScreenBrand('');
        setScreenModel('');
      }
      setConnectionType(connMatch ? connMatch[1].trim() : '');
      setNotes(notesMatch ? notesMatch[1].trim() : (!configMatch && !macMatch ? desc : ''));
    } else {
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setName('');
      setBrand('');
      setModel('');
      setSerialNumber('');
      setStatus('AVAILABLE');
      setDepartmentId('');
      setSupplierId('');
      setPurchasePrice('');
      setPurchaseDate('');
      setCpuRamStorage('');
      setMacAddress('');
      setScreenBrand('');
      setScreenModel('');
      setConnectionType('Sans-fil Bluetooth & Dongle USB');
      setAccessoryType('Pack Clavier / Souris');
      setIpAddress('');
      setLocationRack('');
      setNotes('');
    }
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditItem(null);
  };

  const handleAutoFillName = () => {
    const cat = categories.find(c => c.id === categoryId);
    const catPrefix = cat?.name || 'Matériel';
    if (brand && model) {
      setName(`${catPrefix} ${brand} ${model}`.trim());
    } else if (brand) {
      setName(`${catPrefix} ${brand}`.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) {
      setSnackbar({ open: true, message: 'Le nom et la catégorie sont obligatoires.', severity: 'error' });
      return;
    }

    setSaving(true);

    const descParts: string[] = [];
    if (cpuRamStorage) descParts.push(`Config: ${cpuRamStorage}`);
    if (macAddress) descParts.push(`MAC: ${macAddress}`);
    if (screenBrand || screenModel) descParts.push(`Écran: ${screenBrand} ${screenModel}`.trim());
    if (connectionType) descParts.push(`Connectique: ${connectionType}`);
    if (ipAddress) descParts.push(`IP: ${ipAddress}`);
    if (locationRack) descParts.push(`Emplacement: ${locationRack}`);
    if (notes) descParts.push(`Notes: ${notes}`);

    const finalDescription = descParts.join(' | ');

    const payload = {
      name: name.trim(),
      brand: brand.trim() || null,
      model: model.trim() || null,
      serialNumber: serialNumber.trim() || null,
      categoryId,
      departmentId: departmentId || null,
      supplierId: supplierId || null,
      status,
      purchasePrice: purchasePrice ? Number(purchasePrice) : null,
      purchaseDate: purchaseDate || null,
      description: finalDescription || null,
    };

    try {
      const url = editItem ? `/api/equipments/${editItem.id}` : '/api/equipments';
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSnackbar({
          open: true,
          message: editItem ? "Équipement mis à jour avec succès !" : "Nouvel équipement ajouté au parc avec succès !",
          severity: 'success'
        });
        closeForm();
        fetchData();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur de sauvegarde");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Une erreur est survenue", severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/equipments/${deleteItem.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSnackbar({ open: true, message: "Équipement supprimé du parc.", severity: 'success' });
        setDeleteConfirmOpen(false);
        fetchData();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur de suppression");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur lors de la suppression", severity: 'error' });
    } finally {
      setSaving(false);
      setDeleteItem(null);
    }
  };

  const fetchHistory = async (equipmentId: string, equipmentName: string) => {
    setHistoryEquipment(equipmentName);
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/movements?equipmentId=${equipmentId}`);
      const movements = await res.json();
      setHistoryData(movements);
    } catch {
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenDetails = (equipment: any) => {
    setSelectedDetailsEquipment(equipment);
    setDetailsModalOpen(true);
  };

  // Camera Live Scanner Handlers
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraActive(false);
      setSnackbar({ open: true, message: "Impossible d'accéder à la caméra. Vérifiez les autorisations de votre navigateur.", severity: 'error' });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const openScanner = () => {
    setScannerOpen(true);
    setManualScanCode('');
    setTimeout(() => startCamera(), 200);
  };

  const closeScanner = () => {
    stopCamera();
    setScannerOpen(false);
  };

  const handleManualScanSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = manualScanCode.trim().toLowerCase();
    if (!query) return;

    const matched = data.find(eq => 
      (eq.inventoryNumber && eq.inventoryNumber.toLowerCase() === query) ||
      (eq.serialNumber && eq.serialNumber.toLowerCase() === query) ||
      (eq.name && eq.name.toLowerCase().includes(query))
    );

    if (matched) {
      closeScanner();
      handleOpenDetails(matched);
      setSnackbar({ open: true, message: `Équipement identifié : ${matched.name} (${matched.inventoryNumber})`, severity: 'success' });
    } else {
      setSnackbar({ open: true, message: `Aucun équipement trouvé pour le code : "${manualScanCode}"`, severity: 'error' });
    }
  };

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = ["N° Inventaire", "Nom", "Marque", "Modèle", "N° Série", "Catégorie", "Département", "Statut", "Prix Achat (DH)", "Date Achat", "Fournisseur", "Description"];
    const rows = data.map(eq => [
      eq.inventoryNumber || '',
      `"${(eq.name || '').replace(/"/g, '""')}"`,
      `"${eq.brand || ''}"`,
      `"${eq.model || ''}"`,
      `"${eq.serialNumber || ''}"`,
      `"${eq.category?.name || ''}"`,
      `"${eq.department?.name || 'Stock Général'}"`,
      `"${eq.status}"`,
      eq.purchasePrice || '',
      eq.purchaseDate ? new Date(eq.purchaseDate).toISOString().split('T')[0] : '',
      `"${eq.supplier?.name || ''}"`,
      `"${(eq.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventaire_parc_cathedis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({ open: true, message: "Exportation du parc informatique au format CSV réussie !", severity: 'success' });
  };

  const filteredData = data.filter(d => {
    const matchStatus = filters.status === 'ALL' || d.status === filters.status;
    const matchCat = (filters.category === 'ALL' && activeCategoryTab === 'ALL') || 
                     (activeCategoryTab !== 'ALL' && d.categoryId === activeCategoryTab) ||
                     (filters.category !== 'ALL' && d.categoryId === filters.category);
    const matchDept = filters.department === 'ALL' || d.departmentId === filters.department;
    const matchSearch = filters.search === '' ||
      d.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (d.serialNumber && d.serialNumber.toLowerCase().includes(filters.search.toLowerCase())) ||
      (d.brand && d.brand.toLowerCase().includes(filters.search.toLowerCase())) ||
      (d.model && d.model.toLowerCase().includes(filters.search.toLowerCase())) ||
      (d.inventoryNumber && d.inventoryNumber.toLowerCase().includes(filters.search.toLowerCase())) ||
      (d.description && d.description.toLowerCase().includes(filters.search.toLowerCase()));
    return matchStatus && matchCat && matchDept && matchSearch;
  });

  const total = data.length;
  const available = data.filter(d => d.status === 'AVAILABLE').length;
  const assigned = data.filter(d => d.status === 'ASSIGNED').length;
  const maintenance = data.filter(d => d.status === 'MAINTENANCE').length;
  const totalValuation = data.reduce((sum, eq) => sum + (Number(eq.purchasePrice) || 0), 0);

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
              <DevicesIcon sx={{ fontSize: 34, color: '#FFFFFF' }} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                  Parc & Équipements Informatiques
                </Typography>
                <Chip
                  icon={<FlashIcon sx={{ fontSize: 16, color: '#FFD54F !important' }} />}
                  label="Inventaire Intelligent & QR Tags"
                  size="small"
                  sx={{ bgcolor: 'rgba(255, 213, 79, 0.2)', color: '#FFD54F', border: '1px solid rgba(255, 213, 79, 0.4)', fontWeight: 800 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.6, maxWidth: 680 }}>
                Gestion complète du cycle de vie du matériel, fiches techniques configurables, QR codes imprimables et traçabilité des affectations.
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
              onClick={openScanner}
              startIcon={<CameraIcon />}
              sx={{
                background: 'linear-gradient(90deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                px: 2.2,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                '&:hover': { background: 'linear-gradient(90deg, #1D4ED8 0%, #2563EB 100%)' }
              }}
            >
              📷 Scanner Caméra
            </Button>

            <Button
              variant="contained"
              onClick={() => openForm()}
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
              + Nouvel Équipement
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 📊 2. FOUR GLASSMORPHIС KPI CARDS 📊 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {[
          { label: "Total Équipements", number: total, sub: `Valeur : ${totalValuation.toLocaleString('fr-FR')} DH`, icon: <DevicesIcon />, color: '#1A1A2E' },
          { label: "Disponibles en Stock", number: available, sub: `${total > 0 ? Math.round((available/total)*100) : 0}% du parc`, icon: <AvailableIcon />, color: '#059669' },
          { label: "Affectés aux Équipes", number: assigned, sub: `${total > 0 ? Math.round((assigned/total)*100) : 0}% en service actif`, icon: <AssignedIcon />, color: '#2563EB' },
          { label: "En Maintenance / Atelier", number: maintenance, sub: "Suivi technique IT", icon: <MaintenanceIcon />, color: '#D97706' },
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

      {/* 🏷️ 3. INTERACTIVE CATEGORY FILTER CHIPS 🏷️ */}
      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', gap: 1, alignItems: 'center', overflowX: 'auto', '&::-webkit-scrollbar': { height: 4 } }}>
        <Chip
          label={`🌐 Tout le Parc (${total})`}
          clickable
          onClick={() => setActiveCategoryTab('ALL')}
          sx={{
            fontWeight: 800,
            fontSize: '0.82rem',
            px: 1,
            bgcolor: activeCategoryTab === 'ALL' ? '#1A1A2E' : '#F1F5F9',
            color: activeCategoryTab === 'ALL' ? '#FFFFFF' : '#334155',
            '&:hover': { bgcolor: activeCategoryTab === 'ALL' ? '#1A1A2E' : '#E2E8F0' }
          }}
        />
        {categories.map((c) => {
          const count = data.filter(d => d.categoryId === c.id).length;
          const isSelected = activeCategoryTab === c.id;
          return (
            <Chip
              key={c.id}
              icon={getCategoryIcon(c.name, 16)}
              label={`${c.name} (${count})`}
              clickable
              onClick={() => setActiveCategoryTab(c.id)}
              sx={{
                fontWeight: 800,
                fontSize: '0.82rem',
                px: 1,
                bgcolor: isSelected ? '#E31E24' : '#F8FAFC',
                color: isSelected ? '#FFFFFF' : '#334155',
                border: '1px solid',
                borderColor: isSelected ? '#E31E24' : '#E2E8F0',
                '&:hover': { bgcolor: isSelected ? '#C41018' : '#F1F5F9' }
              }}
            />
          );
        })}
      </Paper>

      {/* 🔍 4. SEARCH, FILTERS & VIEW MODE CONTROLLER 🔍 */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', p: 2.5, bgcolor: '#FFFFFF' }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <Box sx={{ display: 'flex', gap: 2, flex: '1 1 500px', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Rechercher par nom, marque, modèle, S/N, n° inventaire, config..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> } }}
              sx={{ flex: '1 1 260px' }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Statut</InputLabel>
              <Select value={filters.status} label="Statut" onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}>
                <MenuItem value="ALL">Tous les statuts</MenuItem>
                <MenuItem value="AVAILABLE">🟢 Disponible</MenuItem>
                <MenuItem value="ASSIGNED">🔵 Affecté</MenuItem>
                <MenuItem value="MAINTENANCE">🟠 Maintenance</MenuItem>
                <MenuItem value="DECOMMISSIONED">🔴 Déclassé</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Département</InputLabel>
              <Select value={filters.department} label="Département" onChange={(e) => setFilters(f => ({ ...f, department: e.target.value }))}>
                <MenuItem value="ALL">Tous les services</MenuItem>
                {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          {/* View Mode Toggle Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>
              {filteredData.length} équipement(s)
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
                  borderColor: '#CBD5E1'
                }}
              >
                Tableau
              </Button>
              <Button
                variant={viewMode === 'GRID' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('GRID')}
                startIcon={<GridViewIcon />}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: viewMode === 'GRID' ? '#1A1A2E' : 'transparent',
                  color: viewMode === 'GRID' ? '#FFFFFF' : '#64748B',
                  borderColor: '#CBD5E1'
                }}
              >
                Cartes
              </Button>
            </ButtonGroup>
          </Box>
        </Box>

        {/* 📋 VIEW 1: DATA TABLE VIEW */}
        {viewMode === 'TABLE' ? (
          <>
            <TableContainer>
              <Table size="medium">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>N° Inventaire</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Matériel & Spécifications</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Catégorie</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Emplacement / Service</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Prix (MAD)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#1E293B' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton width={100} /></TableCell>
                        <TableCell><Skeleton width={180} /></TableCell>
                        <TableCell><Skeleton width={110} /></TableCell>
                        <TableCell><Skeleton width={130} /></TableCell>
                        <TableCell><Skeleton width={90} /></TableCell>
                        <TableCell><Skeleton width={80} /></TableCell>
                        <TableCell align="center"><Skeleton width={120} /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center' }}>
                        <DevicesIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                        <Typography sx={{ fontWeight: 700, color: '#64748B' }}>
                          Aucun équipement trouvé correspondant à vos filtres.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row) => (
                      <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                        {/* Inventory Number */}
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, color: '#1A1A2E', fontSize: '0.88rem' }}>
                            {row.inventoryNumber || '-'}
                          </Typography>
                        </TableCell>

                        {/* Name & Hardware Details */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#F1F5F9', border: '1px solid #E2E8F0', mt: 0.2 }}>
                              {getCategoryIcon(row.category?.name, 20)}
                            </Avatar>
                            <Box>
                              <Typography
                                onClick={() => handleOpenDetails(row)}
                                sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '0.92rem', cursor: 'pointer', '&:hover': { color: '#E31E24', textDecoration: 'underline' } }}
                              >
                                {row.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.3, flexWrap: 'wrap' }}>
                                {row.brand && (
                                  <Chip label={row.brand} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, bgcolor: '#EFF6FF', color: '#1D4ED8' }} />
                                )}
                                {row.model && (
                                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>
                                    {row.model}
                                  </Typography>
                                )}
                                {row.serialNumber && (
                                  <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                                    • S/N: {row.serialNumber}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Category */}
                        <TableCell>
                          <Chip
                            label={row.category?.name || 'Général'}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}
                          />
                        </TableCell>

                        {/* Department */}
                        <TableCell>
                          <Typography sx={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>
                            {row.department?.name || 'Stock Général'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                            {row.department?.location || 'Siège Cathedis'}
                          </Typography>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <StatusChip status={row.status} />
                        </TableCell>

                        {/* Purchase Price */}
                        <TableCell>
                          {row.purchasePrice ? (
                            <Typography sx={{ fontWeight: 900, color: '#047857', fontSize: '0.88rem' }}>
                              {Number(row.purchasePrice).toLocaleString('fr-FR')} DH
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>-</Typography>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="Fiche Technique 360°">
                              <IconButton onClick={() => handleOpenDetails(row)} size="small" sx={{ color: '#2563EB', bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}>
                                <InspectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Étiquette QR Code">
                              <IconButton onClick={() => { setSelectedQrEquipment(row); setQrModalOpen(true); }} size="small" sx={{ color: '#E31E24', bgcolor: '#FFF1F1', '&:hover': { bgcolor: '#FFE2E2' } }}>
                                <QrCodeIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Modifier">
                              <IconButton onClick={() => openForm(row)} size="small" color="primary">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton onClick={() => { setDeleteItem(row); setDeleteConfirmOpen(true); }} size="small" color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredData.length}
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
        ) : (
          /* 🔲 VIEW 2: VISUAL GRID CARDS VIEW WITH REALISTIC HARDWARE BLUEPRINTS */
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 3, pt: 1 }}>
            {paginatedData.map((row) => (
              <Card
                key={row.id}
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: '1px solid #E2E8F0',
                  bgcolor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 16px 36px rgba(0,0,0,0.1)',
                    borderColor: '#CBD5E1'
                  }
                }}
              >
                {/* 🌟 1. Real Hardware Isometric Blueprint Visualizer 🌟 */}
                <Box sx={{ p: 1.5, pb: 0 }}>
                  <RealisticHardwareBlueprint
                    categoryName={row.category?.name}
                    equipmentName={row.name}
                    brand={row.brand}
                    model={row.model}
                    status={row.status}
                    height={155}
                  />
                </Box>

                <CardContent sx={{ p: 2.5, pt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 900, color: '#E31E24', display: 'block' }}>
                        {row.inventoryNumber}
                      </Typography>
                      <Typography
                        onClick={() => handleOpenDetails(row)}
                        sx={{
                          fontWeight: 900,
                          color: '#1A1A2E',
                          fontSize: '1.05rem',
                          lineHeight: 1.3,
                          cursor: 'pointer',
                          '&:hover': { color: '#E31E24', textDecoration: 'underline' }
                        }}
                      >
                        {row.name}
                      </Typography>
                    </Box>
                    <StatusChip status={row.status} />
                  </Box>

                  <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Catégorie</Typography>
                      <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 800 }}>{row.category?.name || 'Général'}</Typography>
                    </Box>
                    {row.serialNumber && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>S/N</Typography>
                        <Typography variant="caption" sx={{ color: '#2563EB', fontFamily: 'monospace', fontWeight: 800 }}>{row.serialNumber}</Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      📍 {row.department?.name || 'Stock Général'}
                    </Typography>
                    {row.purchasePrice && (
                      <Typography sx={{ fontWeight: 900, color: '#047857', fontSize: '0.95rem' }}>
                        {Number(row.purchasePrice).toLocaleString('fr-FR')} DH
                      </Typography>
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 1.5, px: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    startIcon={<InspectIcon />}
                    onClick={() => handleOpenDetails(row)}
                    sx={{ textTransform: 'none', fontWeight: 800, color: '#2563EB', borderRadius: 2 }}
                  >
                    Détails 360°
                  </Button>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Macaron & QR Code">
                      <IconButton size="small" onClick={() => { setSelectedQrEquipment(row); setQrModalOpen(true); }} sx={{ color: '#E31E24', bgcolor: '#FFF1F1', '&:hover': { bgcolor: '#FFE2E2' } }}>
                        <QrCodeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => openForm(row)} color="primary" sx={{ bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Paper>

      {/* 📷 5. LIVE CAMERA QR CODE SCANNER MODAL DIALOG 📷 */}
      <Dialog
        open={scannerOpen}
        onClose={closeScanner}
        maxWidth="sm"
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
            <Avatar sx={{ bgcolor: '#2563EB', color: '#FFFFFF' }}>
              <CameraIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                Scanner QR Code & Caméra Live
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Pointez la caméra vers l'étiquette QR collée sur la machine
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={closeScanner} sx={{ color: '#FFFFFF' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, alignItems: 'center', bgcolor: '#FAFAFA' }}>
          
          {/* Video Stream Container with Laser Overlay */}
          <Box sx={{
            width: '100%',
            height: 280,
            bgcolor: '#000000',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #334155'
          }}>
            <video
              ref={videoRef}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              playsInline
              muted
            />

            {/* Futuristic Target Laser Overlay */}
            <Box sx={{
              position: 'absolute',
              width: 180,
              height: 180,
              border: '2px solid #22C55E',
              borderRadius: 2,
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Box sx={{
                width: '100%',
                height: 2,
                bgcolor: '#EF4444',
                boxShadow: '0 0 10px #EF4444',
                animation: 'scanLaser 2s infinite ease-in-out'
              }} />
            </Box>

            <style>{`
              @keyframes scanLaser {
                0% { transform: translateY(-80px); }
                50% { transform: translateY(80px); }
                100% { transform: translateY(-80px); }
              }
            `}</style>
          </Box>

          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textAlign: 'center' }}>
            💡 Vous pouvez aussi entrer directement le N° d'inventaire ou N° de Série ci-dessous :
          </Typography>

          {/* Manual Input Fallback */}
          <Box component="form" onSubmit={handleManualScanSubmit} sx={{ width: '100%', display: 'flex', gap: 1.5 }}>
            <TextField
              size="small"
              placeholder="ex: CAT-2026-00001 ou 7X88KV3"
              fullWidth
              value={manualScanCode}
              onChange={(e) => setManualScanCode(e.target.value)}
              slotProps={{
                input: { startAdornment: <InputAdornment position="start"><QrCodeIcon sx={{ color: '#E31E24' }} /></InputAdornment> }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                borderRadius: 2,
                px: 3,
                textTransform: 'none'
              }}
            >
              Identifier
            </Button>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'flex-end' }}>
          <Button onClick={closeScanner} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700, color: '#64748B' }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔍 6. FICHE TECHNIQUE 360° DU MATÉRIEL MODAL DIALOG 🔍 */}
      <Dialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        {selectedDetailsEquipment && (
          <>
            <DialogTitle sx={{
              background: 'linear-gradient(135deg, #1A1A2E 0%, #2A1B28 50%, #7B0000 100%)',
              color: '#FFFFFF',
              p: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexShrink: 0
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#E31E24', color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 900, boxShadow: '0 8px 20px rgba(227,30,36,0.4)' }}>
                  {getCategoryIcon(selectedDetailsEquipment.category?.name, 30)}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFFFFF' }}>
                      {selectedDetailsEquipment.name}
                    </Typography>
                    <StatusChip status={selectedDetailsEquipment.status} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#FFCDD2', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.85rem' }}>
                    N° Inventaire : {selectedDetailsEquipment.inventoryNumber}
                  </Typography>
                </Box>
              </Box>

              <IconButton onClick={() => setDetailsModalOpen(false)} sx={{ color: '#FFFFFF' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3, bgcolor: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* 🌟 Master Hardware Interactive Blueprint Showcase 🌟 */}
              <Box sx={{ width: '100%', borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                <RealisticHardwareBlueprint
                  categoryName={selectedDetailsEquipment.category?.name}
                  equipmentName={selectedDetailsEquipment.name}
                  brand={selectedDetailsEquipment.brand}
                  model={selectedDetailsEquipment.model}
                  status={selectedDetailsEquipment.status}
                  height={190}
                />
              </Box>

              {/* Specs Breakdown Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                
                {/* Tech Specs */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1A1A2E', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MemoryIcon sx={{ color: '#E31E24' }} /> Spécifications Matérielles
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Marque & Modèle</Typography>
                      <Typography sx={{ fontWeight: 800, color: '#1E293B' }}>{selectedDetailsEquipment.brand || '-'} {selectedDetailsEquipment.model || ''}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Numéro de Série (S/N)</Typography>
                      <Typography sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#2563EB' }}>{selectedDetailsEquipment.serialNumber || 'Non renseigné'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Catégorie</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#475569' }}>{selectedDetailsEquipment.category?.name || '-'}</Typography>
                    </Box>
                    {selectedDetailsEquipment.description && (
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Détails / Configuration</Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#334155', bgcolor: '#F8FAFC', p: 1, borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                          {selectedDetailsEquipment.description}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>

                {/* Assignment & Purchase */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1A1A2E', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon sx={{ color: '#2563EB' }} /> Affectation & Données d'Achat
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Département / Service</Typography>
                      <Typography sx={{ fontWeight: 800, color: '#1E293B' }}>{selectedDetailsEquipment.department?.name || 'Stock IT Général'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Fournisseur Achat</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#475569' }}>{selectedDetailsEquipment.supplier?.name || 'Non spécifié'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Prix d'Achat</Typography>
                      <Typography sx={{ fontWeight: 900, color: '#047857', fontSize: '1rem' }}>
                        {selectedDetailsEquipment.purchasePrice ? `${Number(selectedDetailsEquipment.purchasePrice).toLocaleString('fr-FR')} DH` : '-'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Date d'Achat</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#475569' }}>
                        {selectedDetailsEquipment.purchaseDate ? new Date(selectedDetailsEquipment.purchaseDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between', flexShrink: 0 }}>
              <Button onClick={() => setDetailsModalOpen(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700, color: '#64748B' }}>
                Fermer
              </Button>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<QrCodeIcon />}
                  onClick={() => {
                    setSelectedQrEquipment(selectedDetailsEquipment);
                    setDetailsModalOpen(false);
                    setQrModalOpen(true);
                  }}
                  sx={{
                    background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Imprimer Étiquette QR Tag
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setDetailsModalOpen(false);
                    openForm(selectedDetailsEquipment);
                  }}
                  sx={{
                    background: 'linear-gradient(90deg, #1A1A2E 0%, #2A1B28 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Modifier
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* SMART DYNAMIC EQUIPMENT FORM DIALOG */}
      <Dialog
        open={formOpen}
        onClose={closeForm}
        maxWidth="md"
        fullWidth
        scroll="paper"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.2)'
            }
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1A1A2E 0%, #2A1B28 50%, #7B0000 100%)',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2.5,
          px: 3,
          flexShrink: 0
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(227, 30, 36, 0.3)', border: '1px solid rgba(227,30,36,0.6)', color: '#FFFFFF' }}>
              <SettingsIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#FFFFFF' }}>
                {editItem ? "Modifier la Fiche Équipement" : "Ajouter un Nouvel Équipement au Parc"}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Formulaire dynamique intelligent avec spécifications techniques selon la catégorie
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={closeForm} sx={{ color: '#FFFFFF', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <DialogContent
            dividers
            sx={{
              p: { xs: 2.5, md: 3.5 },
              display: 'flex',
              flexDirection: 'column',
              gap: 3.5,
              overflowY: 'auto',
              flex: 1,
              '&::-webkit-scrollbar': { width: '8px' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#CBD5E1', borderRadius: '4px' }
            }}
          >
            
            {/* STEP 1: CATEGORY SELECTION */}
            <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A1A2E', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon sx={{ color: '#E31E24', fontSize: 20 }} /> 1. Sélection de la Catégorie d'Équipement *
              </Typography>
              
              <FormControl fullWidth required>
                <InputLabel>Choisissez la catégorie de matériel *</InputLabel>
                <Select
                  value={categoryId}
                  label="Choisissez la catégorie de matériel *"
                  onChange={(e) => setCategoryId(e.target.value)}
                  sx={{ bgcolor: '#FFFFFF', borderRadius: 2 }}
                >
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                      {getCategoryIcon(c.name)}
                      <Typography sx={{ fontWeight: 700 }}>{c.name}</Typography>
                      {c.description && (
                        <Typography variant="caption" sx={{ color: '#94A3B8', ml: 1 }}>
                          ({c.description})
                        </Typography>
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* STEP 2: DYNAMIC TECHNICAL CHARACTERISTICS */}
            <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: '5px solid #E31E24' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MemoryIcon sx={{ color: '#E31E24', fontSize: 20 }} /> 2. Spécifications & Caractéristiques Techniques
                </Typography>
                <Button size="small" onClick={handleAutoFillName} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', color: '#E31E24' }}>
                  ⚡ Générer Nom Automatique
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                
                <TextField
                  label="Nom de l'équipement (Nom d'hôte / Libellé officiel) *"
                  placeholder={
                    currentCatType === 'LAPTOP' ? "ex: PC-PORTABLE-PHILIPPE ou Laptop Dell Latitude 5540" :
                    currentCatType === 'DESKTOP' ? "ex: PC-FIXE-COMPTA-01 ou Desktop HP ProDesk 400" :
                    currentCatType === 'HEADSET' ? "ex: Casque Jabra Evolve2 65 - Direction" :
                    "ex: Équipement Cathedis"
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label={currentCatType === 'DESKTOP' ? "Marque Unité Centrale *" : "Marque *"}
                    placeholder={
                      currentCatType === 'LAPTOP' || currentCatType === 'DESKTOP' ? "ex: Dell, Lenovo, HP, Apple..." :
                      currentCatType === 'HEADSET' ? "ex: Jabra, Logitech, Poly..." :
                      currentCatType === 'SCREEN' ? "ex: HP, Dell, Samsung, LG..." : "ex: Marque"
                    }
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label={currentCatType === 'DESKTOP' ? "Modèle Unité Centrale *" : "Modèle *"}
                    placeholder={
                      currentCatType === 'LAPTOP' ? "ex: Latitude 5540, ThinkPad T14..." :
                      currentCatType === 'DESKTOP' ? "ex: OptiPlex 7010, ThinkCentre M70s..." :
                      currentCatType === 'HEADSET' ? "ex: Evolve 40, Zone Wireless..." : "ex: Modèle"
                    }
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    fullWidth
                  />
                </Box>

                {/* Case 1: LAPTOP SPECIFIC */}
                {currentCatType === 'LAPTOP' && (
                  <>
                    <TextField
                      label="Configuration Technique (Processeur, RAM, Stockage, OS) *"
                      placeholder="ex: Intel Core i7-1365U, 16 Go RAM DDR5, 512 Go SSD NVMe, Windows 11 Pro"
                      value={cpuRamStorage}
                      onChange={(e) => setCpuRamStorage(e.target.value)}
                      fullWidth
                    />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                      <TextField
                        label="Adresse MAC (Wi-Fi / Ethernet)"
                        placeholder="ex: 00:1A:2B:3C:4D:5E"
                        value={macAddress}
                        onChange={(e) => setMacAddress(e.target.value)}
                        fullWidth
                        slotProps={{
                          input: { startAdornment: <InputAdornment position="start"><MacIcon sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment> }
                        }}
                      />
                      <TextField
                        label="Numéro de Série (S/N Laptop) *"
                        placeholder="ex: 7X88KV3"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        fullWidth
                      />
                    </Box>
                  </>
                )}

                {/* Case 2: DESKTOP SPECIFIC */}
                {currentCatType === 'DESKTOP' && (
                  <>
                    <TextField
                      label="Configuration Unité Centrale (CPU, RAM, Disque, Carte Graphique, OS) *"
                      placeholder="ex: Intel Core i5-13500, 16 Go RAM, 512 Go SSD + 1 To HDD, Windows 11 Pro"
                      value={cpuRamStorage}
                      onChange={(e) => setCpuRamStorage(e.target.value)}
                      fullWidth
                    />
                    <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#2563EB', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                        <ScreenIcon sx={{ fontSize: 18 }} /> Écran Associé au Poste Fixe :
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <TextField
                          label="Marque de l'écran"
                          placeholder="ex: HP, Dell, Samsung..."
                          value={screenBrand}
                          onChange={(e) => setScreenBrand(e.target.value)}
                          fullWidth
                          size="small"
                        />
                        <TextField
                          label="Modèle & Taille de l'écran"
                          placeholder="ex: HP E24 G5 24 pouces Full HD"
                          value={screenModel}
                          onChange={(e) => setScreenModel(e.target.value)}
                          fullWidth
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                      <TextField
                        label="Adresse MAC (Ethernet LAN)"
                        placeholder="ex: A4:BB:6D:88:12:00"
                        value={macAddress}
                        onChange={(e) => setMacAddress(e.target.value)}
                        fullWidth
                        slotProps={{
                          input: { startAdornment: <InputAdornment position="start"><MacIcon sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment> }
                        }}
                      />
                      <TextField
                        label="Numéro de Série Unité Centrale (S/N) *"
                        placeholder="ex: CZC4321ABC"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        fullWidth
                      />
                    </Box>
                  </>
                )}

                {/* Case 3: HEADSET */}
                {currentCatType === 'HEADSET' && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Type de Connectique</InputLabel>
                      <Select
                        value={connectionType || 'USB-A & USB-C'}
                        label="Type de Connectique"
                        onChange={(e) => setConnectionType(e.target.value)}
                      >
                        <MenuItem value="USB-A & USB-C">USB-A & USB-C Filaire</MenuItem>
                        <MenuItem value="Sans-fil Bluetooth & Dongle">Sans-fil Bluetooth & Dongle USB</MenuItem>
                        <MenuItem value="Prise Jack 3.5mm">Prise Jack 3.5mm</MenuItem>
                        <MenuItem value="Sans-fil DECT">Sans-fil DECT (Longue Portée)</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Numéro de Série (S/N Casque)"
                      placeholder="ex: JAB-883492"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      fullWidth
                    />
                  </Box>
                )}

                {/* Case 4: ACCESSORIES */}
                {currentCatType === 'ACCESSORY' && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Type d'Accessoire</InputLabel>
                      <Select
                        value={accessoryType || 'Pack Clavier / Souris'}
                        label="Type d'Accessoire"
                        onChange={(e) => setAccessoryType(e.target.value)}
                      >
                        <MenuItem value="Pack Clavier / Souris">Pack Clavier & Souris</MenuItem>
                        <MenuItem value="Station d'accueil / Dock USB-C">Station d'accueil / Dock USB-C</MenuItem>
                        <MenuItem value="Webcam HD">Webcam Haute Définition</MenuItem>
                        <MenuItem value="Onduleur / UPS">Onduleur / Protection Électrique</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Numéro de Série (S/N)"
                      placeholder="ex: ACC-992120"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      fullWidth
                    />
                  </Box>
                )}

                {/* Case 5: SCREEN ONLY */}
                {currentCatType === 'SCREEN' && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      label="Taille & Résolution"
                      placeholder="ex: 24 pouces Full HD (1920x1080) IPS 75Hz"
                      value={cpuRamStorage}
                      onChange={(e) => setCpuRamStorage(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Numéro de Série (S/N Écran)"
                      placeholder="ex: CN4481029"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      fullWidth
                    />
                  </Box>
                )}

                {/* Case 6: PRINTER */}
                {currentCatType === 'PRINTER' && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                    <TextField
                      label="Adresse IP Imprimante"
                      placeholder="ex: 192.168.1.150"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Adresse MAC Réseau"
                      placeholder="ex: 00:25:B3:A1:00:11"
                      value={macAddress}
                      onChange={(e) => setMacAddress(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Numéro de Série (S/N)"
                      placeholder="ex: CNB882901"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      fullWidth
                    />
                  </Box>
                )}

                {/* Case 7: NETWORK */}
                {currentCatType === 'NETWORK' && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      label="Adresse IP de Gestion"
                      placeholder="ex: 10.0.0.1"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Numéro de Série (S/N)"
                      placeholder="ex: FCW221008"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      fullWidth
                    />
                  </Box>
                )}

                {/* Fallback */}
                {currentCatType === 'OTHER' || currentCatType === 'MOBILE' ? (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      label="Adresse MAC / IMEI"
                      placeholder="ex: 35489009812..."
                      value={macAddress}
                      onChange={(e) => setMacAddress(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Numéro de Série (S/N) *"
                      placeholder="ex: SN-998811"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      fullWidth
                    />
                  </Box>
                ) : null}

              </Box>
            </Box>

            {/* STEP 3: ASSIGNMENT, STATUS & FINANCE */}
            <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A1A2E', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon sx={{ color: '#2563EB', fontSize: 20 }} /> 3. Statut, Affectation & Achat
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Département / Emplacement</InputLabel>
                    <Select value={departmentId} label="Département / Emplacement" onChange={(e) => setDepartmentId(e.target.value)}>
                      <MenuItem value="">Stock IT Général (Non affecté)</MenuItem>
                      {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name} ({d.location || 'Siège'})</MenuItem>)}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Statut Initial</InputLabel>
                    <Select value={status} label="Statut Initial" onChange={(e) => setStatus(e.target.value)}>
                      <MenuItem value="AVAILABLE">🟢 Disponible au stock</MenuItem>
                      <MenuItem value="ASSIGNED">🔵 Affecté à un utilisateur</MenuItem>
                      <MenuItem value="MAINTENANCE">🟠 En Maintenance / Atelier</MenuItem>
                      <MenuItem value="DECOMMISSIONED">🔴 Déclassé / Réformé</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Fournisseur</InputLabel>
                    <Select value={supplierId} label="Fournisseur" onChange={(e) => setSupplierId(e.target.value)}>
                      <MenuItem value="">Aucun fournisseur lié</MenuItem>
                      {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Prix d'achat (MAD / DH)"
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    fullWidth
                    slotProps={{
                      input: { startAdornment: <InputAdornment position="start"><MoneyIcon sx={{ fontSize: 18, color: '#059669' }} /></InputAdornment> }
                    }}
                  />

                  <TextField
                    label="Date d'achat"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Box>

                <TextField
                  label="Observations / Notes d'inventaire"
                  placeholder="ex: Garantie 3 ans sur site, livré avec chargeur 65W et housse..."
                  fullWidth
                  multiline
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Box>
            </Box>

          </DialogContent>

          <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between', flexShrink: 0 }}>
            <Button onClick={closeForm} variant="outlined" sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B', borderColor: '#CBD5E1' }}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving || !name.trim() || !categoryId}
              sx={{
                background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                color: '#FFFFFF',
                borderRadius: 2.5,
                px: 4,
                py: 1.2,
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(227, 30, 36, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)',
                }
              }}
            >
              {saving ? 'Enregistrement en cours...' : (editItem ? 'Enregistrer les Modifications' : 'Créer l\'Équipement')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 📱 QR Code Tag Modal */}
      {selectedQrEquipment && (
        <AssetTagQRModal
          open={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          equipment={selectedQrEquipment}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer cet équipement ?"
        message="Cette action est irréversible et supprimera la fiche de l'équipement du parc."
        loading={saving}
      />

      {/* Equipment History Dialog */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3.5 } } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, background: 'linear-gradient(135deg, #1A1A2E 0%, #7B0000 100%)', color: '#FFFFFF' }}>
          <HistoryIcon sx={{ color: '#FF8A80' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Historique & Mouvements</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>{historyEquipment}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#E31E24' }} />
            </Box>
          ) : historyData.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: '#94A3B8' }}>
              <HistoryIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1 }} />
              <Typography sx={{ fontWeight: 700 }}>Aucun mouvement enregistré pour cet équipement.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
              {historyData.map((m: any, idx: number) => (
                <Box key={m.id || idx} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderLeft: '4px solid #E31E24' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Chip label={m.type || 'MOUVEMENT'} size="small" sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: '#EFF6FF', color: '#2563EB' }} />
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                      {new Date(m.date || m.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.85rem', color: '#334155' }}>
                    {m.notes || 'Opération effectuée'}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2.5, fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
