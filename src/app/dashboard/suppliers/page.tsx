'use client';

import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
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
  TableRow
} from '@mui/material';
import {
  Storefront as StoreIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as ActiveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as WebIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  MonetizationOn as MoneyIcon,
  Receipt as InvoiceIcon,
  Devices as DevicesIcon,
  Send as SendIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Help as HelpIcon,
  PictureAsPdf as PdfIcon,
  Assignment as OrderIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormDialog from '@/components/shared/FormDialog';
import StatusChip from '@/components/shared/StatusChip';

const supplierSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  contactName: z.string().optional(),
  email: z.string().email("Format d'email invalide").optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export default function SuppliersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  // 360° Supplier Modal State
  const [modal360Open, setModal360Open] = useState(false);
  const [selectedSupplier360, setSelectedSupplier360] = useState<any>(null);
  const [loading360, setLoading360] = useState(false);
  const [tab360, setTab360] = useState(0);

  // Contact Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTargetSupplier, setEmailTargetSupplier] = useState<any>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('DEVIS');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Add Invoice / Bon de Commande State
  const [addInvoiceOpen, setAddInvoiceOpen] = useState(false);
  const [invoiceRef, setInvoiceRef] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState('PAYÉ');
  const [invoiceDescription, setInvoiceDescription] = useState('');

  // Filters
  const [searchFilter, setSearchFilter] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        const json = await res.json();
        setData(json || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open 360° Modal
  const handleOpen360 = async (supplier: any) => {
    setModal360Open(true);
    setLoading360(true);
    setTab360(0);
    try {
      const res = await fetch(`/api/suppliers/${supplier.id}`);
      if (res.ok) {
        const fullData = await res.json();
        setSelectedSupplier360(fullData);
      } else {
        setSelectedSupplier360(supplier);
      }
    } catch {
      setSelectedSupplier360(supplier);
    } finally {
      setLoading360(false);
    }
  };

  // Open Contact Email Modal
  const handleOpenEmail = (supplier: any, defaultType: string = 'DEVIS') => {
    setEmailTargetSupplier(supplier);
    setEmailTemplate(defaultType);
    applyEmailTemplate(defaultType, supplier);
    setEmailModalOpen(true);
  };

  const applyEmailTemplate = (type: string, supplier: any) => {
    const suppName = supplier?.name || 'Fournisseur';
    const contact = supplier?.contactName ? `M./Mme ${supplier.contactName}` : `l'équipe commerciale ${suppName}`;

    if (type === 'DEVIS') {
      setEmailSubject(`[CATHEDIS IT] Demande de Devis pour Matériel Informatique`);
      setEmailMessage(
        `Bonjour ${contact},\n\n` +
        `Dans le cadre du renouvellement et de l'extension de notre parc informatique chez CATHEDIS, nous souhaiterions recevoir votre meilleure offre de prix et délais de livraison pour le matériel suivant :\n\n` +
        `- 5x Ordinateurs Portables Professionnels (i7, 16Go RAM, 512Go SSD)\n` +
        `- 5x Écrans 24" Full HD avec connectique HDMI/DP\n` +
        `- 5x Packs Clavier / Souris sans fil\n\n` +
        `Merci de nous faire parvenir votre devis chiffré (en MAD TTC) avec les conditions de garantie.\n\n` +
        `Cordialement,\nService Achat & Parc Informatique • Cathedis`
      );
    } else if (type === 'SAV') {
      setEmailSubject(`[CATHEDIS IT] Demande de Prise en Charge SAV / Garantie Matériel`);
      setEmailMessage(
        `Bonjour ${contact},\n\n` +
        `Nous avons constaté une anomalie matérielle sur un équipement acheté auprès de votre établissement :\n\n` +
        `- Matériel : [Nom du matériel]\n` +
        `- Numéro de Série (S/N) : [Numéro de série]\n` +
        `- Date d'achat : [Date]\n` +
        `- Description de la panne : [Description]\n\n` +
        `L'équipement étant sous garantie, merci de nous communiquer la procédure de retour ou le passage d'un technicien sur site.\n\n` +
        `Bien cordialement,\nSupport Technique Informatique • Cathedis`
      );
    } else if (type === 'SUIVI') {
      setEmailSubject(`[CATHEDIS IT] Suivi de Livraison & Commande en Cours`);
      setEmailMessage(
        `Bonjour ${contact},\n\n` +
        `Nous revenons vers vous concernant notre commande en cours auprès de votre société.\n\n` +
        `Pourriez-vous nous confirmer la date estimée de livraison à notre siège à Casablanca ?\n\n` +
        `Merci d'avance pour votre réactivité.\n\n` +
        `Cordialement,\nDépartement IT • Cathedis`
      );
    } else if (type === 'FACTURE') {
      setEmailSubject(`[CATHEDIS IT] Demande de Facture / Rapprochement Comptable`);
      setEmailMessage(
        `Bonjour ${contact},\n\n` +
        `Dans le cadre du bilan comptable de notre parc informatique, nous vous prions de bien vouloir nous transmettre le duplicata de la facture relative à notre dernière livraison.\n\n` +
        `Merci pour votre collaboration.\n\n` +
        `Cordialement,\nService Comptabilité & IT • Cathedis`
      );
    }
  };

  const handleSendEmail = async () => {
    if (!emailTargetSupplier?.email) {
      setSnackbar({ open: true, message: "Ce fournisseur n'a pas d'adresse email enregistrée.", severity: 'error' });
      return;
    }

    setSendingEmail(true);
    try {
      const res = await fetch(`/api/suppliers/${emailTargetSupplier.id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTargetSupplier.email,
          subject: emailSubject,
          message: emailMessage,
          templateType: emailTemplate,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSnackbar({ open: true, message: `Email officiel expédié avec succès à ${emailTargetSupplier.email} ! 📬`, severity: 'success' });
        setEmailModalOpen(false);
      } else {
        throw new Error(result.error || "Erreur lors de l'envoi de l'email.");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur d'envoi d'email.", severity: 'error' });
    } finally {
      setSendingEmail(false);
    }
  };

  // Add Invoice to Supplier
  const handleAddInvoice = async () => {
    if (!invoiceRef || !invoiceAmount || !selectedSupplier360) {
      setSnackbar({ open: true, message: "La référence et le montant sont obligatoires.", severity: 'error' });
      return;
    }

    const newInvoice = {
      id: `BC-${Date.now()}`,
      ref: invoiceRef.trim(),
      date: invoiceDate,
      amount: Number(invoiceAmount),
      status: invoiceStatus,
      description: invoiceDescription.trim() || `Bon de commande informatique (${selectedSupplier360.name})`,
      equipments: [],
      itemsCount: 1,
    };

    const currentInvoices = selectedSupplier360.invoices || [];
    const updatedInvoices = [newInvoice, ...currentInvoices];

    try {
      const res = await fetch(`/api/suppliers/${selectedSupplier360.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedSupplier360,
          invoices: updatedInvoices,
        }),
      });

      if (res.ok) {
        setSelectedSupplier360({
          ...selectedSupplier360,
          invoices: updatedInvoices,
        });
        setAddInvoiceOpen(false);
        setInvoiceRef('');
        setInvoiceAmount('');
        setInvoiceDescription('');
        setSnackbar({ open: true, message: "Bon de commande / Facture enregistré avec succès !", severity: 'success' });
        fetchData();
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Erreur lors de l'enregistrement du document.", severity: 'error' });
    }
  };

  const openForm = (item?: any) => {
    setEditItem(item || null);
    if (item) {
      setValue('name', item.name || '');
      setValue('contactName', item.contactName || '');
      setValue('email', item.email || '');
      setValue('phone', item.phone || '');
      setValue('address', item.address || '');
      setValue('website', item.website || '');
    } else {
      reset({ name: '', contactName: '', email: '', phone: '', address: '', website: '' });
    }
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditItem(null);
    reset();
  };

  const onSubmit = async (formData: SupplierFormData) => {
    setSaving(true);
    try {
      const url = editItem ? `/api/suppliers/${editItem.id}` : '/api/suppliers';
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSnackbar({ open: true, message: editItem ? "Fournisseur mis à jour avec succès !" : "Nouveau fournisseur ajouté avec succès !", severity: 'success' });
        closeForm();
        fetchData();
      } else {
        throw new Error("Erreur de sauvegarde");
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
      const res = await fetch(`/api/suppliers/${deleteItem.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSnackbar({ open: true, message: "Fournisseur supprimé", severity: 'success' });
        setDeleteConfirmOpen(false);
        fetchData();
      } else {
        const json = await res.json();
        throw new Error(json.error || "Erreur de suppression");
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur lors de la suppression", severity: 'error' });
    } finally {
      setSaving(false);
      setDeleteItem(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Fournisseur',
      render: (row: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#E31E2415', color: '#E31E24', fontWeight: 800, width: 38, height: 38, fontSize: '0.9rem' }}>
            {row.name.slice(0, 2).toUpperCase()}
          </Avatar>
          <Box>
            <Typography
              onClick={() => handleOpen360(row)}
              sx={{ fontWeight: 800, color: '#1A1A2E', cursor: 'pointer', '&:hover': { color: '#E31E24', textDecoration: 'underline' } }}
            >
              {row.name}
            </Typography>
            {row.website && (
              <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <WebIcon sx={{ fontSize: 13 }} /> {row.website.replace(/^https?:\/\//, '')}
              </Typography>
            )}
          </Box>
        </Box>
      )
    },
    {
      key: 'contact',
      label: 'Interlocuteur & Téléphone',
      render: (row: any) => (
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>
            {row.contactName || '-'}
          </Typography>
          {row.phone && (
            <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PhoneIcon sx={{ fontSize: 13, color: '#2563EB' }} /> {row.phone}
            </Typography>
          )}
        </Box>
      )
    },
    {
      key: 'email',
      label: 'Email & Contact Direct',
      render: (row: any) => row.email ? (
        <Button
          size="small"
          onClick={() => handleOpenEmail(row, 'DEVIS')}
          startIcon={<EmailIcon sx={{ fontSize: 15 }} />}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.78rem',
            color: '#E31E24',
            bgcolor: '#FFF1F1',
            borderRadius: 2,
            px: 1.2,
            '&:hover': { bgcolor: '#FFE4E4' }
          }}
        >
          {row.email}
        </Button>
      ) : (
        <Typography variant="caption" sx={{ color: '#94A3B8' }}>Non renseigné</Typography>
      )
    },
    {
      key: 'spending',
      label: 'Dépenses Cathedis (MAD)',
      render: (row: any) => (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1.5, py: 0.5, borderRadius: 2, bgcolor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
          <MoneyIcon sx={{ fontSize: 17, color: '#059669' }} />
          <Typography sx={{ fontWeight: 800, color: '#065F46', fontSize: '0.88rem' }}>
            {Number(row.totalSpending || 0).toLocaleString('fr-FR')} DH
          </Typography>
        </Box>
      )
    },
    {
      key: 'equipments',
      label: 'Équipements Fournis',
      render: (row: any) => (
        <Chip
          label={`${row.equipmentsCount || 0} machines`}
          size="small"
          onClick={() => handleOpen360(row)}
          sx={{
            fontWeight: 800,
            bgcolor: (row.equipmentsCount || 0) > 0 ? '#EFF6FF' : '#F1F5F9',
            color: (row.equipmentsCount || 0) > 0 ? '#1D4ED8' : '#64748B',
            cursor: 'pointer'
          }}
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: any) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Fiche Fournisseur 360° (Dépenses, Factures, Équipements)">
            <IconButton onClick={() => handleOpen360(row)} size="small" sx={{ color: '#E31E24', bgcolor: '#FFF1F1', '&:hover': { bgcolor: '#FFE2E2' } }}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Envoyer un Email via Gmail">
            <IconButton onClick={() => handleOpenEmail(row)} size="small" sx={{ color: '#2563EB', bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}>
              <EmailIcon fontSize="small" />
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
      )
    }
  ];

  const totalSuppliers = data.length;
  const activeSuppliers = data.filter(d => (d.equipmentsCount || 0) > 0).length;
  const totalEquipments = data.reduce((acc, curr) => acc + (curr.equipmentsCount || 0), 0);
  const totalGlobalSpending = data.reduce((acc, curr) => acc + (Number(curr.totalSpending) || 0), 0);

  const filteredData = data.filter(d => {
    const search = searchFilter.toLowerCase();
    return !search ||
      d.name.toLowerCase().includes(search) ||
      (d.contactName && d.contactName.toLowerCase().includes(search)) ||
      (d.email && d.email.toLowerCase().includes(search)) ||
      (d.phone && d.phone.includes(search));
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, p: { xs: 1.5, md: 3 } }}>
      <PageHeader
        title="Fournisseurs & Prestataires"
        subtitle="Fiche 360°, suivi des dépenses Cathedis, bons de commande & factures"
        actionLabel="Nouveau Fournisseur"
        onAction={() => openForm()}
      />

      {/* KPI Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {[
          { label: "Total Fournisseurs", number: totalSuppliers, icon: <StoreIcon />, color: '#1A1A2E' },
          { label: "Fournisseurs Partenaires Actifs", number: activeSuppliers, icon: <ActiveIcon />, color: '#2563EB' },
          { label: "Équipements Fournis au Parc", number: totalEquipments, icon: <ShippingIcon />, color: '#7C3AED' },
          { label: "Total Dépensé Parc (MAD)", number: `${Number(totalGlobalSpending).toLocaleString('fr-FR')} DH`, icon: <MoneyIcon />, color: '#059669' },
        ].map((stat, i) => (
          <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' } }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: typeof stat.number === 'string' && stat.number.length > 8 ? '1.25rem' : '1.55rem', lineHeight: 1.1 }}>
                {loading ? <Skeleton width={60} /> : stat.number}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, mt: 0.5, display: 'block' }}>{stat.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Main Table Paper */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', p: 2.5, bgcolor: '#FFFFFF' }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Rechercher un fournisseur par nom, contact, email, téléphone..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment> } }}
            sx={{ flex: '1 1 300px' }}
          />
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
            {filteredData.length} fournisseur(s) répertorié(s)
          </Typography>
        </Box>
        <DataTable columns={columns} data={filteredData} loading={loading} />
      </Paper>

      {/* 🌟 1. FICHE FOURNISSEUR 360° MODAL DIALOG 🌟 */}
      <Dialog
        open={modal360Open}
        onClose={() => setModal360Open(false)}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.2)'
            }
          }
        }}
      >
        {selectedSupplier360 && (
          <>
            {/* 360° Header Banner */}
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
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#E31E24', color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 900, boxShadow: '0 4px 12px rgba(227,30,36,0.5)' }}>
                  {selectedSupplier360.name.slice(0, 2).toUpperCase()}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFFFFF' }}>
                      {selectedSupplier360.name}
                    </Typography>
                    <Chip label="Partenaire Agréé" size="small" sx={{ bgcolor: 'rgba(76, 175, 80, 0.25)', color: '#A7F3D0', fontWeight: 800, border: '1px solid rgba(76, 175, 80, 0.5)' }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    {selectedSupplier360.contactName && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <PersonIcon sx={{ fontSize: 16, color: '#FF8A80' }} /> Contact: {selectedSupplier360.contactName}
                      </span>
                    )}
                    {selectedSupplier360.phone && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <PhoneIcon sx={{ fontSize: 16, color: '#90CAF9' }} /> {selectedSupplier360.phone}
                      </span>
                    )}
                    {selectedSupplier360.email && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <EmailIcon sx={{ fontSize: 16, color: '#FFD54F' }} /> {selectedSupplier360.email}
                      </span>
                    )}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleOpenEmail(selectedSupplier360)}
                  startIcon={<EmailIcon />}
                  sx={{
                    background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 2,
                    boxShadow: '0 4px 12px rgba(227,30,36,0.4)'
                  }}
                >
                  ✉️ Contacter par Email
                </Button>
                <IconButton onClick={() => setModal360Open(false)} sx={{ color: '#FFFFFF' }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            {/* 360° Financial & Equipment KPIs */}
            <Box sx={{ p: 2.5, px: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              <Box sx={{ p: 2, bgcolor: '#ECFDF5', borderRadius: 2.5, border: '1px solid #A7F3D0' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#065F46', textTransform: 'uppercase' }}>
                  💰 Total Dépensé par Cathedis
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#047857', mt: 0.5 }}>
                  {Number(selectedSupplier360.stats?.totalSpending || selectedSupplier360.totalSpending || 0).toLocaleString('fr-FR')} DH
                </Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: '#EFF6FF', borderRadius: 2.5, border: '1px solid #BFDBFE' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase' }}>
                  💻 Équipements Fournis
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#1D4ED8', mt: 0.5 }}>
                  {selectedSupplier360.equipments?.length || selectedSupplier360.equipmentsCount || 0} machines
                </Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: 2.5, border: '1px solid #BBF7D0' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                  🟢 En Service Actif
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#15803D', mt: 0.5 }}>
                  {(selectedSupplier360.stats?.availableCount || 0) + (selectedSupplier360.stats?.assignedCount || 0)} postes
                </Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: '#FFFBEB', borderRadius: 2.5, border: '1px solid #FDE68A' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#92400E', textTransform: 'uppercase' }}>
                  🧾 Bons de Commande & Factures
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#B45309', mt: 0.5 }}>
                  {selectedSupplier360.invoices?.length || 0} documents
                </Typography>
              </Box>
            </Box>

            {/* Navigation Tabs */}
            <Box sx={{ px: 3, bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
              <Tabs
                value={tab360}
                onChange={(_, v) => setTab360(v)}
                textColor="inherit"
                sx={{
                  '& .MuiTabs-indicator': { bgcolor: '#E31E24', height: 3 },
                  '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', fontSize: '0.92rem', minHeight: 48 },
                  '& .Mui-selected': { color: '#E31E24' }
                }}
              >
                <Tab icon={<DevicesIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Équipements du Parc (${selectedSupplier360.equipments?.length || 0})`} />
                <Tab icon={<InvoiceIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Bons de Commande & Factures (${selectedSupplier360.invoices?.length || 0})`} />
                <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Fiche d'Identité & Coordonnées" />
              </Tabs>
            </Box>

            {/* Modal Body Content */}
            <DialogContent dividers sx={{ p: 3, bgcolor: '#FAFAFA', overflowY: 'auto', flex: 1 }}>
              
              {/* TAB 0: EQUIPMENTS LIST */}
              {tab360 === 0 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1A1A2E' }}>
                      💻 Inventaire des Équipements Achetés chez {selectedSupplier360.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                      Valorisation totale : {Number(selectedSupplier360.stats?.totalSpending || 0).toLocaleString('fr-FR')} DH
                    </Typography>
                  </Box>

                  {(!selectedSupplier360.equipments || selectedSupplier360.equipments.length === 0) ? (
                    <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                      <DevicesIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                      <Typography sx={{ fontWeight: 700, color: '#64748B' }}>Aucun équipement lié à ce fournisseur pour le moment.</Typography>
                    </Paper>
                  ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: '#F1F5F9' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>N° Inventaire</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Matériel / Nom</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Catégorie</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>N° de Série (S/N)</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Date d'Achat</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Prix d'Achat</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#1E293B' }}>Statut</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedSupplier360.equipments.map((eq: any) => (
                            <TableRow key={eq.id} hover>
                              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#E31E24' }}>
                                {eq.inventoryNumber || '-'}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700, color: '#1A1A2E' }}>
                                {eq.name}
                                {eq.brand && <Typography variant="caption" sx={{ display: 'block', color: '#64748B' }}>{eq.brand} {eq.model}</Typography>}
                              </TableCell>
                              <TableCell>
                                <Chip label={eq.category?.name || 'Général'} size="small" sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
                              </TableCell>
                              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569' }}>
                                {eq.serialNumber || '-'}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                                {eq.purchaseDate ? new Date(eq.purchaseDate).toLocaleDateString('fr-FR') : '-'}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 800, color: '#047857' }}>
                                {eq.purchasePrice ? `${Number(eq.purchasePrice).toLocaleString('fr-FR')} DH` : '-'}
                              </TableCell>
                              <TableCell>
                                <StatusChip status={eq.status} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}

              {/* TAB 1: INVOICES & PURCHASE ORDERS */}
              {tab360 === 1 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1A1A2E' }}>
                        🧾 Bons de Commande & Factures Fournisseur
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Historique des commandes d'achat et pièces justificatives enregistrées
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => setAddInvoiceOpen(true)}
                      sx={{
                        background: 'linear-gradient(90deg, #1A1A2E 0%, #2A1B28 100%)',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        borderRadius: 2,
                        textTransform: 'none'
                      }}
                    >
                      + Ajouter un Bon de Commande / Facture
                    </Button>
                  </Box>

                  {(!selectedSupplier360.invoices || selectedSupplier360.invoices.length === 0) ? (
                    <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                      <InvoiceIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                      <Typography sx={{ fontWeight: 700, color: '#64748B', mb: 1.5 }}>Aucun bon de commande enregistré pour ce fournisseur.</Typography>
                      <Button variant="outlined" size="small" onClick={() => setAddInvoiceOpen(true)} startIcon={<AddIcon />}>
                        Enregistrer la première facture
                      </Button>
                    </Paper>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {selectedSupplier360.invoices.map((inv: any, idx: number) => (
                        <Paper key={inv.id || idx} elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#FFF1F1', color: '#E31E24', width: 44, height: 44 }}>
                              <OrderIcon />
                            </Avatar>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1rem' }}>
                                  Réf. {inv.ref}
                                </Typography>
                                <Chip label={inv.status || 'PAYÉ'} size="small" sx={{ fontWeight: 800, bgcolor: inv.status === 'EN_ATTENTE' ? '#FFFBEB' : '#ECFDF5', color: inv.status === 'EN_ATTENTE' ? '#B45309' : '#047857' }} />
                              </Box>
                              <Typography variant="body2" sx={{ color: '#475569', mt: 0.3 }}>
                                {inv.description || "Commande de matériel informatique"}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                                Date d'émission : {new Date(inv.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#047857' }}>
                              {Number(inv.amount || 0).toLocaleString('fr-FR')} DH TTC
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<PdfIcon sx={{ color: '#E31E24' }} />}
                              sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', color: '#475569', mt: 0.5 }}
                              onClick={() => setSnackbar({ open: true, message: `Consultation du bon de commande ${inv.ref} certifiée.`, severity: 'info' })}
                            >
                              Aperçu Document PDF
                            </Button>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              {/* TAB 2: IDENTITY & FULL DETAILS */}
              {tab360 === 2 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StoreIcon sx={{ color: '#E31E24' }} /> Coordonnées Commerciales
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Raison Sociale</Typography>
                        <Typography sx={{ fontWeight: 800, color: '#1A1A2E' }}>{selectedSupplier360.name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Interlocuteur Principal (Account Manager)</Typography>
                        <Typography sx={{ fontWeight: 700, color: '#334155' }}>{selectedSupplier360.contactName || 'Non spécifié'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Adresse Email Officielle</Typography>
                        <Typography sx={{ fontWeight: 700, color: '#2563EB' }}>{selectedSupplier360.email || 'Non renseignée'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Ligne Téléphonique</Typography>
                        <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>{selectedSupplier360.phone || 'Non renseigné'}</Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon sx={{ color: '#2563EB' }} /> Localisation & Web
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Adresse Physique / Siège</Typography>
                        <Typography sx={{ fontWeight: 700, color: '#334155' }}>{selectedSupplier360.address || 'Non spécifiée'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Site Web</Typography>
                        <Typography sx={{ fontWeight: 700, color: '#E31E24' }}>{selectedSupplier360.website || 'Non renseigné'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Date d'Enregistrement dans Cathedis</Typography>
                        <Typography sx={{ fontWeight: 700, color: '#475569' }}>
                          {new Date(selectedSupplier360.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              )}

            </DialogContent>

            <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between', flexShrink: 0 }}>
              <Button onClick={() => setModal360Open(false)} variant="outlined" sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B' }}>
                Fermer la Fiche 360°
              </Button>
              <Button
                variant="contained"
                onClick={() => handleOpenEmail(selectedSupplier360)}
                startIcon={<EmailIcon />}
                sx={{
                  background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  borderRadius: 2.5,
                  px: 3,
                  textTransform: 'none'
                }}
              >
                ✉️ Envoyer un Email au Fournisseur
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 🌟 2. MODALE « ENVOYER UN EMAIL AU FOURNISSEUR » (Gmail Direct) 🌟 */}
      <Dialog
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        {emailTargetSupplier && (
          <>
            <DialogTitle sx={{
              background: 'linear-gradient(135deg, #1A1A2E 0%, #2A1B28 50%, #7B0000 100%)',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2.5,
              px: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: '#E31E24', color: '#FFFFFF' }}>
                  <SendIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#FFFFFF' }}>
                    Contacter {emailTargetSupplier.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    Expédition officielle par Gmail SMTP vers : {emailTargetSupplier.email || 'Email non configuré'}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setEmailModalOpen(false)} sx={{ color: '#FFFFFF' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              
              {/* Quick Template Selector */}
              <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#1A1A2E', display: 'block', mb: 1 }}>
                  ⚡ Choisissez un modèle rapide d'email :
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {[
                    { id: 'DEVIS', label: '💼 Demande de Devis' },
                    { id: 'SAV', label: '🛠️ Prise en Charge SAV / Garantie' },
                    { id: 'SUIVI', label: '🚚 Suivi de Livraison' },
                    { id: 'FACTURE', label: '🧾 Demande de Facture' },
                  ].map((tpl) => (
                    <Chip
                      key={tpl.id}
                      label={tpl.label}
                      clickable
                      onClick={() => {
                        setEmailTemplate(tpl.id);
                        applyEmailTemplate(tpl.id, emailTargetSupplier);
                      }}
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        bgcolor: emailTemplate === tpl.id ? '#E31E24' : '#FFFFFF',
                        color: emailTemplate === tpl.id ? '#FFFFFF' : '#334155',
                        border: '1px solid',
                        borderColor: emailTemplate === tpl.id ? '#E31E24' : '#CBD5E1',
                        '&:hover': { bgcolor: emailTemplate === tpl.id ? '#C41018' : '#F1F5F9' }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Email Form */}
              <TextField
                label="Destinataire (Email Fournisseur)"
                fullWidth
                value={emailTargetSupplier.email || ''}
                disabled
                slotProps={{
                  input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#94A3B8' }} /></InputAdornment> }
                }}
              />

              <TextField
                label="Objet du message *"
                fullWidth
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                required
              />

              <TextField
                label="Corps de votre message *"
                fullWidth
                multiline
                rows={8}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                required
              />
            </DialogContent>

            <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
              <Button onClick={() => setEmailModalOpen(false)} variant="outlined" sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B' }}>
                Annuler
              </Button>
              <Button
                variant="contained"
                onClick={handleSendEmail}
                disabled={sendingEmail || !emailSubject.trim() || !emailMessage.trim() || !emailTargetSupplier.email}
                startIcon={<SendIcon />}
                sx={{
                  background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  borderRadius: 2.5,
                  px: 3.5,
                  py: 1.1,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(227, 30, 36, 0.35)'
                }}
              >
                {sendingEmail ? 'Expédition via Gmail en cours...' : 'Envoyer l\'Email Maintenant'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 🌟 3. MODALE AJOUTER UN BON DE COMMANDE / FACTURE 🌟 */}
      <Dialog
        open={addInvoiceOpen}
        onClose={() => setAddInvoiceOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 1 }}>
          <InvoiceIcon sx={{ color: '#E31E24' }} /> Enregistrer un Bon de Commande / Facture
        </DialogTitle>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Numéro / Référence de Facture ou BC *"
            placeholder="ex: FACT-2026-089 ou BC-CAT-04"
            fullWidth
            value={invoiceRef}
            onChange={(e) => setInvoiceRef(e.target.value)}
            required
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Montant Total TTC (MAD) *"
              type="number"
              placeholder="ex: 45000"
              fullWidth
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value)}
              slotProps={{
                input: { startAdornment: <InputAdornment position="start">DH</InputAdornment> }
              }}
              required
            />
            <TextField
              label="Date d'émission"
              type="date"
              fullWidth
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>

          <FormControl fullWidth>
            <InputLabel>Statut du Document</InputLabel>
            <Select value={invoiceStatus} label="Statut du Document" onChange={(e) => setInvoiceStatus(e.target.value)}>
              <MenuItem value="PAYÉ">🟢 Payé / Réglé</MenuItem>
              <MenuItem value="EN_ATTENTE">🟠 En attente de paiement</MenuItem>
              <MenuItem value="VALIDÉ">🔵 Validé / Bon à payer</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Désignation / Matériels concernés"
            placeholder="ex: Achat de 5 PC Portables Dell Latitude 5540 et 5 Écrans HP 24 pouces"
            fullWidth
            multiline
            rows={3}
            value={invoiceDescription}
            onChange={(e) => setInvoiceDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
          <Button onClick={() => setAddInvoiceOpen(false)} variant="outlined" sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, color: '#64748B' }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleAddInvoice}
            disabled={!invoiceRef.trim() || !invoiceAmount}
            sx={{
              background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: 2.5,
              px: 3,
              textTransform: 'none'
            }}
          >
            Enregistrer la Facture
          </Button>
        </DialogActions>
      </Dialog>

      {/* Standard Create / Edit Supplier Dialog */}
      <FormDialog 
        open={formOpen} 
        onClose={closeForm} 
        title={editItem ? "Modifier le Fournisseur" : "Nouveau Fournisseur"}
        loading={saving}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField 
            label="Raison Sociale / Nom de l'entreprise *" 
            fullWidth 
            {...register('name')} 
            error={!!errors.name} 
            helperText={errors.name?.message} 
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField 
              label="Nom de l'interlocuteur (Contact)" 
              fullWidth 
              {...register('contactName')} 
            />
            <TextField 
              label="Téléphone" 
              fullWidth 
              {...register('phone')} 
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField 
              label="Email" 
              fullWidth 
              {...register('email')} 
              error={!!errors.email} 
              helperText={errors.email?.message} 
            />
            <TextField 
              label="Site Web" 
              placeholder="ex: https://www.fournisseur.com"
              fullWidth 
              {...register('website')} 
            />
          </Box>
          <TextField 
            label="Adresse / Siège social" 
            fullWidth 
            multiline 
            rows={2} 
            {...register('address')} 
          />
        </Box>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog 
        open={deleteConfirmOpen} 
        onCancel={() => setDeleteConfirmOpen(false)} 
        onConfirm={handleDelete}
        title="Supprimer ce fournisseur ?"
        message="Cette action est irréversible. Vous ne pouvez pas supprimer un fournisseur s'il contient des équipements affectés dans le parc."
        loading={saving}
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
