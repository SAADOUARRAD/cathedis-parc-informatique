'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Box,
  Divider
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface FormDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  loading?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  submitLabel?: string;
}

export default function FormDialog({
  open,
  title,
  onClose,
  onSubmit,
  loading = false,
  maxWidth = 'sm',
  children,
  submitLabel = "Enregistrer"
}: FormDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            animation: 'fadeInUp 0.3s ease-out',
            '@keyframes fadeInUp': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' }
            }
          }
        }
      }}
    >
      <Box sx={{ height: 4, width: '100%', background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)', position: 'absolute', top: 0, left: 0 }} />
      
      <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={loading}
          sx={{
            color: '#94A3B8',
            '&:hover': { color: '#1E293B', bgcolor: '#F1F5F9' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ p: 3 }}>
        {children}
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: 8,
            color: '#64748B',
            borderColor: '#CBD5E1',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' }
          }}
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading}
          sx={{
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
            boxShadow: '0 4px 14px 0 rgba(227,30,36,0.39)',
            '&:hover': {
              background: 'linear-gradient(90deg, #C41018 0%, #a00b12 100%)',
            }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
