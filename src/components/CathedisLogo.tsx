'use client';

import { Box, Typography } from '@mui/material';

interface CathedisLogoProps {
  variant?: 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
  showSubtitle?: boolean;
}

export default function CathedisLogo({ variant = 'light', size = 'medium', showSubtitle = false }: CathedisLogoProps) {
  const sizes = {
    small: { fontSize: '1.2rem', arrowSize: 20, gap: 0.5 },
    medium: { fontSize: '1.6rem', arrowSize: 28, gap: 0.75 },
    large: { fontSize: '2.8rem', arrowSize: 48, gap: 1 },
  };

  const s = sizes[size];
  const textColor = variant === 'light' ? '#FFFFFF' : '#1A1A2E';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: s.gap }}>
        <Typography
          sx={{
            fontSize: s.fontSize,
            fontWeight: 900,
            fontStyle: 'italic',
            color: textColor,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            fontFamily: "'Arial Black', 'Impact', sans-serif",
          }}
        >
          CATHEDIS
        </Typography>
        {/* Red Arrow Mark */}
        <svg width={s.arrowSize} height={s.arrowSize} viewBox="0 0 40 40" fill="none">
          <path d="M8 4L28 4L36 18L20 18L32 36L12 36L4 22L20 22Z" fill="#E31E24" />
          <path d="M14 0L34 0L42 14L26 14L38 32L18 32L10 18L26 18Z" fill="#C41018" opacity="0.7" />
        </svg>
      </Box>
      {showSubtitle && (
        <Typography
          sx={{
            fontSize: s.fontSize === '2.8rem' ? '0.7rem' : '0.55rem',
            color: variant === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            mt: 0.5,
            fontWeight: 500,
          }}
        >
          Gestion du Parc Informatique
        </Typography>
      )}
    </Box>
  );
}
