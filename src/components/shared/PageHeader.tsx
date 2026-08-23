'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon = <AddIcon />,
}: PageHeaderProps) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        animation: 'slideIn 0.4s ease-out',
        '@keyframes slideIn': {
          from: { transform: 'translateY(-10px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 }
        }
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A1A2E', mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      
      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          startIcon={actionIcon}
          sx={{
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
            background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
            boxShadow: '0 4px 14px 0 rgba(227,30,36,0.39)',
            '&:hover': {
              background: 'linear-gradient(90deg, #C41018 0%, #a00b12 100%)',
              boxShadow: '0 6px 20px rgba(227,30,36,0.23)'
            }
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
