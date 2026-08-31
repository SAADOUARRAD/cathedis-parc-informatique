'use client';

import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { QRCodeSVG } from 'qrcode.react';

interface AssetTagQRModalProps {
  open: boolean;
  onClose: () => void;
  equipment: {
    id: string;
    name: string;
    inventoryNumber?: string;
    serialNumber?: string;
    category?: { name: string } | string;
    department?: { name: string } | string;
    status?: string;
    purchaseDate?: string;
    brand?: string;
    model?: string;
  } | null;
}

export default function AssetTagQRModal({ open, onClose, equipment }: AssetTagQRModalProps) {
  const qrRef = useRef<SVGSVGElement>(null);
  const [copied, setCopied] = useState(false);

  if (!equipment) return null;

  const categoryName = typeof equipment.category === 'string'
    ? equipment.category
    : equipment.category?.name || 'Matériel Informatique';

  const departmentName = typeof equipment.department === 'string'
    ? equipment.department
    : equipment.department?.name || 'Direction IT Cathedis';

  const invNum = equipment.inventoryNumber || 'CAT-' + equipment.id.slice(0, 8).toUpperCase();
  const serialNum = equipment.serialNumber || 'SN-' + equipment.id.slice(-6).toUpperCase();

  // Payload encoded in the QR Code
  const qrData = JSON.stringify({
    inv: invNum,
    id: equipment.id,
    sn: serialNum,
    name: equipment.name,
    brand: equipment.brand || '',
    model: equipment.model || '',
    owner: 'CATHEDIS',
    dept: departmentName
  });

  const handleCopyData = () => {
    navigator.clipboard.writeText(`[CATHEDIS ASSET]\nN° Inventaire: ${invNum}\nMatériel: ${equipment.name}\nS/N: ${serialNum}\nService: ${departmentName}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    const svgElement = qrRef.current;
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `QR_CATHEDIS_${invNum}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: '#FAFAFA',
            boxShadow: '0 20px 48px rgba(0,0,0,0.12)'
          }
        }
      }}
    >
      {/* Clean Modal Header */}
      <DialogTitle
        sx={{
          bgcolor: '#1A1A2E',
          color: '#FFFFFF',
          py: 2,
          px: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <QrCode2Icon sx={{ color: '#E31E24', fontSize: 22 }} />
          <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', color: '#FFFFFF' }}>
            Étiquette QR Code
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
        
        {/* 🏷️✨ Sleek Modern Asset Tag Card ✨🏷️ */}
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            p: 3,
            borderRadius: 3.5,
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#CBD5E1',
              boxShadow: '0 14px 36px rgba(0,0,0,0.09)'
            }
          }}
        >
          {/* Subtle Top Red Accent Line */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              bgcolor: '#E31E24'
            }}
          />

          {/* Logo & Category Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pt: 0.5 }}>
            <Box
              component="img"
              src="/images/logo1.png"
              alt="Cathedis"
              sx={{ height: 26, width: 'auto', display: 'block' }}
            />
            <Chip
              label={categoryName}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.68rem',
                fontWeight: 700,
                bgcolor: '#F1F5F9',
                color: '#334155',
                border: '1px solid #E2E8F0'
              }}
            />
          </Box>

          {/* Center QR Code */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: '#FFFFFF',
              borderRadius: 3,
              border: '1px solid #E2E8F0',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              my: 0.5
            }}
          >
            <QRCodeSVG
              ref={qrRef}
              value={qrData}
              size={135}
              bgColor="#FFFFFF"
              fgColor="#1A1A2E"
              level="H"
            />
          </Box>

          {/* Asset Information Summary */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8, width: '100%', textAlign: 'center' }}>
            
            {/* Inventory Number Pill */}
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontWeight: 900,
                fontSize: '0.92rem',
                color: '#E31E24',
                letterSpacing: 1,
                bgcolor: '#FFF1F1',
                px: 1.5,
                py: 0.3,
                borderRadius: 1.5,
                border: '1px solid #FFE2E2',
                display: 'inline-block'
              }}
            >
              {invNum}
            </Typography>

            {/* Equipment Name */}
            <Typography
              sx={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#0F172A',
                lineHeight: 1.2
              }}
            >
              {equipment.name}
            </Typography>

            {/* Serial Number & Department */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mt: 0.2 }}>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#475569',
                  bgcolor: '#F8FAFC',
                  px: 0.8,
                  py: 0.2,
                  borderRadius: 1,
                  border: '1px solid #E2E8F0'
                }}
              >
                S/N: {serialNum}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.72rem' }}>
                • {departmentName}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Clean Action Buttons (Copier + Télécharger SVG) */}
        <Box sx={{ display: 'flex', gap: 1.5, width: '100%', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={copied ? <CheckIcon sx={{ color: '#059669' }} /> : <ContentCopyIcon />}
            onClick={handleCopyData}
            sx={{
              flex: 1,
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.82rem',
              color: copied ? '#059669' : '#1A1A2E',
              borderColor: copied ? '#059669' : '#CBD5E1',
              bgcolor: '#FFFFFF',
              py: 1,
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' }
            }}
          >
            {copied ? 'Copié !' : 'Copier Infos'}
          </Button>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadSVG}
            sx={{
              flex: 1,
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.82rem',
              py: 1,
              background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
              boxShadow: '0 4px 14px rgba(227, 30, 36, 0.3)',
              color: '#FFFFFF',
              '&:hover': { background: 'linear-gradient(90deg, #C41018 0%, #991B1B 100%)' }
            }}
          >
            Télécharger SVG
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
