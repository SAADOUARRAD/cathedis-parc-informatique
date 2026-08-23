'use client';

import React, { useRef, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, Typography, Button,
  IconButton, Paper, Alert, CircularProgress, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DrawIcon from '@mui/icons-material/Draw';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SignatureCanvas from 'react-signature-canvas';

interface SignatureCanvasModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  recipientName: string;
  equipmentName: string;
  serialNumber?: string;
  onSaveSignature: (signatureBase64: string) => Promise<void> | void;
}

export default function SignatureCanvasModal({
  open,
  onClose,
  title = "Signature Électronique du Procès-Verbal",
  recipientName,
  equipmentName,
  serialNumber,
  onSaveSignature,
}: SignatureCanvasModalProps) {
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleClear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const handleEnd = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      setIsEmpty(false);
    }
  };

  const handleConfirm = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) return;

    // Get signature as Base64 PNG image string
    const signatureBase64 = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    setLoading(true);
    try {
      await onSaveSignature(signatureBase64);
      onClose();
    } catch (err) {
      console.error('Error saving signature:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 4, overflow: 'hidden' }
        }
      }}
    >
      <DialogTitle sx={{
        bgcolor: '#1A1A2E', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DrawIcon sx={{ color: '#E31E24' }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
            {title}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Document Information Summary */}
        <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px solid #E2E8F0' }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
            Engagement du Bénéficiaire
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
            {recipientName}
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#334155', mt: 0.5 }}>
            Matériel : <strong>{equipmentName}</strong> {serialNumber ? `(S/N: ${serialNumber})` : ''}
          </Typography>
        </Paper>

        {/* Legal Engagement Terms Notice */}
        <Typography sx={{ fontSize: '0.78rem', color: '#475569', bgcolor: '#FFF5F5', p: 1.8, borderRadius: 2, borderLeft: '4px solid #E31E24', lineHeight: 1.5 }}>
          Je soussigné(e) <strong>{recipientName}</strong>, confirme avoir reçu en parfait état de fonctionnement l'équipement ci-dessus désigné. Je m'engage à l'utiliser dans le cadre professionnel et à le restituer à Cathedis à la fin de mon contrat ou sur demande.
        </Typography>

        {/* Signature Pad Canvas Container */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DrawIcon fontSize="small" sx={{ color: '#E31E24' }} /> Tracez votre signature ci-dessous :
            </Typography>
            <Button
              size="small"
              startIcon={<DeleteIcon fontSize="small" />}
              onClick={handleClear}
              disabled={isEmpty}
              sx={{ color: '#64748B', textTransform: 'none', fontSize: '0.75rem' }}
            >
              Effacer
            </Button>
          </Box>

          <Paper
            elevation={0}
            sx={{
              border: '2px dashed #CBD5E1',
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              overflow: 'hidden',
              cursor: 'crosshair',
              position: 'relative',
              '&:hover': { borderColor: '#E31E24' },
            }}
          >
            <SignatureCanvas
              ref={sigCanvas}
              penColor="#0F172A"
              canvasProps={{
                width: 500,
                height: 180,
                className: 'signature-canvas',
                style: { width: '100%', height: '180px' }
              }}
              onEnd={handleEnd}
            />
            {isEmpty && (
              <Typography sx={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#94A3B8', fontSize: '0.85rem', pointerEvents: 'none',
                userSelect: 'none',
              }}>
                Signez avec votre souris, doigt ou stylet ici
              </Typography>
            )}
          </Paper>
        </Box>

        {/* Date & Timestamp Info */}
        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', textAlign: 'center' }}>
          Horodatage numérique : {new Date().toLocaleString('fr-FR')} • Traçabilité enregistrée
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, borderColor: '#CBD5E1', color: '#475569' }}
          >
            Annuler
          </Button>

          <Button
            fullWidth
            variant="contained"
            disabled={isEmpty || loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            onClick={handleConfirm}
            sx={{
              background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
              borderRadius: 2.5, textTransform: 'none', fontWeight: 700, py: 1.2,
              boxShadow: '0 4px 14px rgba(227, 30, 36, 0.3)',
              '&:hover': { boxShadow: '0 6px 20px rgba(227, 30, 36, 0.45)' },
            }}
          >
            {loading ? 'Génération...' : 'Valider & Signer le PV'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
