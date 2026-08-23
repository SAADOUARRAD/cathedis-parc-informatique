'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorIcon from '@mui/icons-material/Error';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: 'error' | 'warning' | 'info';
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  severity = 'warning',
}: ConfirmDialogProps) {
  
  const getSeverityStyles = () => {
    switch (severity) {
      case 'error':
        return { color: '#EF4444', bg: '#FEE2E2', icon: <ErrorIcon fontSize="large" sx={{ color: '#EF4444' }} /> };
      case 'info':
        return { color: '#3B82F6', bg: '#DBEAFE', icon: <InfoOutlinedIcon fontSize="large" sx={{ color: '#3B82F6' }} /> };
      case 'warning':
      default:
        return { color: '#F59E0B', bg: '#FEF3C7', icon: <WarningAmberIcon fontSize="large" sx={{ color: '#F59E0B' }} /> };
    }
  };

  const styles = getSeverityStyles();

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: 1,
            animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            '@keyframes scaleIn': {
              from: { transform: 'scale(0.95)', opacity: 0 },
              to: { transform: 'scale(1)', opacity: 1 }
            }
          }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 1, pt: 3 }}>
        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: styles.bg, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
          {styles.icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', textAlign: 'center' }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pb: 3 }}>
        <Typography variant="body1" sx={{ color: '#64748B', textAlign: 'center' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3, px: 3 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
          sx={{
            flex: 1,
            borderRadius: 8,
            color: '#64748B',
            borderColor: '#CBD5E1',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' }
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          sx={{
            flex: 1,
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
            boxShadow: '0 4px 14px 0 rgba(227,30,36,0.39)',
            '&:hover': {
              background: 'linear-gradient(90deg, #C41018 0%, #a00b12 100%)',
            }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
