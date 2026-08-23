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
  SelectChangeEvent
} from '@mui/material';
import {
  Computer,
  ReportProblem,
  Category as CategoryIcon,
  Info,
  QrCode2 as QrCodeIcon,
  Draw as DrawIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import AssetTagQRModal from '@/components/shared/AssetTagQRModal';
import SignatureCanvasModal from '@/components/shared/SignatureCanvasModal';
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
}

export default function MesEquipementsPage() {
  const { data: session } = useSession();
  const [equipments, setEquipments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  
  // QR Modal state
  const [qrOpen, setQrOpen] = useState(false);
  const [qrEquipment, setQrEquipment] = useState<Equipment | null>(null);

  // Signature Modal state
  const [sigOpen, setSigOpen] = useState(false);
  const [sigAssignment, setSigAssignment] = useState<Assignment | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSaveSignature = async (signatureBase64: string) => {
    if (!sigAssignment) return;
    try {
      const res = await fetch(`/api/assignments/${sigAssignment.id}/signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureData: signatureBase64 }),
      });

      if (!res.ok) throw new Error("Erreur d'enregistrement de la signature");

      const pdf = generateAssignmentPDF({
        assignmentId: sigAssignment.id,
        recipientName: session?.user?.name || "Employé",
        recipientEmail: session?.user?.email || undefined,
        recipientDepartment: sigAssignment.equipment.category,
        equipmentName: sigAssignment.equipment.name,
        serialNumber: sigAssignment.equipment.serialNumber,
        categoryName: sigAssignment.equipment.category,
        assignedBy: "Administration Cathedis IT",
        assignedDate: new Date(sigAssignment.assignedAt).toLocaleDateString('fr-FR'),
        signatureBase64,
      });

      pdf.save(`PV_Affectation_${sigAssignment.equipment.name}.pdf`);
      setSnackbar({ open: true, message: "Procès-verbal signé avec succès !", severity: "success" });
      fetchEquipments();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur lors de la signature", severity: "error" });
    }
  };

  const handleDownloadPDF = (assignment: any) => {
    const signatureBase64 = assignment.signatures && assignment.signatures.length > 0
      ? assignment.signatures[0].signatureData
      : undefined;

    const pdf = generateAssignmentPDF({
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

  useEffect(() => {
    fetchEquipments();
  }, []);

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

  const handleOpenDialog = (eq: Equipment) => {
    setSelectedEq(eq);
    setPriority('MEDIUM');
    setDescription('');
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (description.length < 10) {
      setSnackbar({ open: true, message: 'La description doit faire au moins 10 caractères.', severity: 'error' });
      return;
    }

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
        setSnackbar({ open: true, message: 'Votre signalement a été envoyé avec succès !', severity: 'success' });
        setOpen(false);
      } else {
        setSnackbar({ open: true, message: 'Erreur lors de l\'envoi du signalement.', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors de l\'envoi du signalement.', severity: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#4caf50';
      case 'ASSIGNED': return '#2196f3';
      case 'MAINTENANCE': return '#ff9800';
      case 'DECOMMISSIONED': return '#E31E24';
      default: return '#757575';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Disponible';
      case 'ASSIGNED': return 'Affecté';
      case 'MAINTENANCE': return 'En Maintenance';
      case 'DECOMMISSIONED': return 'Déclassé';
      default: return status;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ color: '#1A1A2E', fontWeight: 'bold', mb: 4 }}>
        Mes Équipements
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} variant="rounded" sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' }, height: 250, borderRadius: 4 }} />
          ))}
        </Box>
      ) : equipments.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: '#f8f9fa' }}>
          <Computer sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Aucun équipement ne vous est affecté pour le moment.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {equipments.map((assignment: any) => {
            const eq = assignment.equipment || assignment;
            if (!eq) return null;
            const statusColor = getStatusColor(eq.status);
            
            return (
              <Paper
                key={assignment.id}
                sx={{
                  width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' },
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ height: 4, bgcolor: statusColor, width: '100%' }} />
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1A1A2E', flex: 1, mr: 1, wordBreak: 'break-word' }}>
                      {eq.name}
                    </Typography>
                    <Chip 
                      label={getStatusLabel(eq.status)} 
                      size="small" 
                      sx={{ bgcolor: `${statusColor}22`, color: statusColor, fontWeight: 'bold' }} 
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                    <CategoryIcon sx={{ fontSize: 18, mr: 1 }} />
                    <Typography variant="body2">{eq.category}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                    <Info sx={{ fontSize: 18, mr: 1 }} />
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      SN: {eq.serialNumber}
                    </Typography>
                  </Box>

                  <Typography variant="caption" sx={{ display: 'block', mb: 3, color: 'text.disabled' }}>
                    Affecté le : {new Date(assignment.assignedAt).toLocaleDateString('fr-FR')}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {assignment.signatures && assignment.signatures.length > 0 ? (
                        <Chip
                          label="PV Signé ✓"
                          color="success"
                          sx={{
                            flex: 1,
                            height: 36,
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            bgcolor: '#E8F5E9',
                            color: '#2E7D32',
                            border: '1px solid #A5D6A7',
                          }}
                        />
                      ) : (
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<DrawIcon />}
                          onClick={() => { setSigAssignment(assignment); setSigOpen(true); }}
                          sx={{ 
                            background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)', 
                            color: '#FFF',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(227, 30, 36, 0.3)'
                            }
                          }}
                        >
                          Signer mon PV
                        </Button>
                      )}

                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => handleDownloadPDF(assignment)}
                        sx={{ 
                          color: '#1A1A2E', 
                          borderColor: '#CBD5E1',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          '&:hover': {
                            bgcolor: '#F8FAFC',
                            borderColor: '#1A1A2E'
                          }
                        }}
                      >
                        PV PDF
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<QrCodeIcon />}
                        onClick={() => { setQrEquipment(eq); setQrOpen(true); }}
                        sx={{ 
                          color: '#64748B', 
                          borderColor: '#E2E8F0',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
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
                        startIcon={<ReportProblem />}
                        onClick={() => handleOpenDialog(eq)}
                        sx={{ 
                          color: '#E31E24', 
                          borderColor: '#E31E24',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          '&:hover': {
                            bgcolor: '#fff0f0',
                            borderColor: '#E31E24'
                          }
                        }}
                      >
                        Signaler
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        <DialogTitle sx={{ color: '#1A1A2E', fontWeight: 'bold' }}>
          Signaler un Problème
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Équipement"
              value={selectedEq?.name || ''}
              disabled
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel id="priority-label">Priorité</InputLabel>
              <Select
                labelId="priority-label"
                value={priority}
                label="Priorité"
                onChange={(e: SelectChangeEvent) => setPriority(e.target.value)}
              >
                <MenuItem value="LOW">Basse</MenuItem>
                <MenuItem value="MEDIUM">Moyenne</MenuItem>
                <MenuItem value="HIGH">Haute</MenuItem>
                <MenuItem value="CRITICAL">Critique</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description détaillée"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              fullWidth
              helperText="Min. 10 caractères"
              error={description.length > 0 && description.length < 10}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'text.secondary' }}>Annuler</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained" 
            disabled={description.length < 10}
            sx={{ bgcolor: '#E31E24', '&:hover': { bgcolor: '#c61a1f' } }}
          >
            Envoyer le signalement
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Asset Tag QR Modal */}
      <AssetTagQRModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        equipment={qrEquipment}
      />

      {/* Signature Canvas Modal */}
      {sigAssignment && (
        <SignatureCanvasModal
          open={sigOpen}
          onClose={() => setSigOpen(false)}
          recipientName={session?.user?.name || "Employé"}
          equipmentName={sigAssignment.equipment.name}
          serialNumber={sigAssignment.equipment.serialNumber}
          onSaveSignature={handleSaveSignature}
        />
      )}
    </Box>
  );
}
