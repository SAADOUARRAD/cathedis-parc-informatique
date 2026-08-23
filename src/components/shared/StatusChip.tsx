'use client';

import React from 'react';
import { Chip, Box } from '@mui/material';

interface StatusChipProps {
  status: string;
  statusMap?: Record<string, { label: string; color: string; bgColor: string; icon?: React.ReactNode }>;
}

const defaultStatusMap: Record<string, { label: string; color: string; bgColor: string; icon?: React.ReactNode }> = {
  'AVAILABLE': { label: 'Disponible', color: '#43A047', bgColor: '#E8F5E9' },
  'ACTIVE': { label: 'Actif', color: '#43A047', bgColor: '#E8F5E9' },
  'ASSIGNED': { label: 'Assigné', color: '#1E88E5', bgColor: '#E3F2FD' },
  'IN_PROGRESS': { label: 'En cours', color: '#1E88E5', bgColor: '#E3F2FD' },
  'MAINTENANCE': { label: 'En maintenance', color: '#FB8C00', bgColor: '#FFF3E0' },
  'REPORTED': { label: 'Signalé', color: '#FB8C00', bgColor: '#FFF3E0' },
  'DECOMMISSIONED': { label: 'Déclassé', color: '#E53935', bgColor: '#FFEBEE' },
  'CANCELLED': { label: 'Annulé', color: '#E53935', bgColor: '#FFEBEE' },
  'COMPLETED': { label: 'Terminé', color: '#00897B', bgColor: '#E0F2F1' },
};

export default function StatusChip({ status, statusMap = defaultStatusMap }: StatusChipProps) {
  const config = statusMap[status] || { label: status, color: '#64748B', bgColor: '#F1F5F9' };

  return (
    <Chip
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: config.color }} />
          <span>{config.label}</span>
        </Box>
      }
      sx={{
        bgcolor: config.bgColor,
        color: config.color,
        fontWeight: 700,
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        height: 24,
        borderRadius: 4,
        '& .MuiChip-label': { px: 1.5 }
      }}
    />
  );
}
