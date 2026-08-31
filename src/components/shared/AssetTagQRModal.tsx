'use client';

import React, { useRef } from 'react';
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
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import QrCode2Icon from '@mui/icons-material/QrCode2';
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
  } | null;
}

export default function AssetTagQRModal({ open, onClose, equipment }: AssetTagQRModalProps) {
  const qrRef = useRef<SVGSVGElement>(null);

  if (!equipment) return null;

  const categoryName = typeof equipment.category === 'string'
    ? equipment.category
    : equipment.category?.name || 'Matériel Informatique';

  const departmentName = typeof equipment.department === 'string'
    ? equipment.department
    : equipment.department?.name;

  const invNum = equipment.inventoryNumber || 'CAT-' + equipment.id.slice(0, 8).toUpperCase();
  const serialNum = equipment.serialNumber || 'N/A';

  // The payload encoded into the QR Code
  const qrData = JSON.stringify({
    id: equipment.id,
    inv: invNum,
    sn: serialNum,
    name: equipment.name,
  });

  const handleDownloadSVG = () => {
    const svgElement = qrRef.current;
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `QR_${serialNum !== 'N/A' ? serialNum : equipment.name}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svgString = qrRef.current ? new XMLSerializer().serializeToString(qrRef.current) : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Étiquette Équipement - ${equipment.name}</title>
          <style>
            @page {
              size: 80mm 50mm;
              margin: 0;
            }
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 10px;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              box-sizing: border-box;
              background-color: #fff;
            }
            .asset-tag {
              width: 75mm;
              height: 45mm;
              border: 2px solid #E31E24;
              border-radius: 8px;
              padding: 8px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: #ffffff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #E31E24;
              padding-bottom: 4px;
            }
            .brand {
              font-weight: 900;
              font-size: 14px;
              color: #E31E24;
              letter-spacing: 1px;
            }
            .tag-title {
              font-size: 9px;
              color: #555;
              text-transform: uppercase;
              font-weight: bold;
            }
            .content {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-top: 4px;
            }
            .info {
              flex: 1;
            }
            .eq-name {
              font-size: 13px;
              font-weight: bold;
              color: #1A1A2E;
              margin-bottom: 3px;
            }
            .eq-sn {
              font-family: monospace;
              font-size: 10px;
              color: #444;
              background: #f0f0f0;
              padding: 2px 4px;
              border-radius: 4px;
              display: inline-block;
            }
            .eq-cat {
              font-size: 9px;
              color: #666;
              margin-top: 4px;
            }
            .footer {
              font-size: 8px;
              color: #888;
              text-align: center;
              border-top: 1px dashed #ccc;
              padding-top: 2px;
            }
          </style>
        </head>
        <body>
          <div class="asset-tag">
            <div class="header">
              <div class="brand">CATHEDIS</div>
              <div class="tag-title">Propriété Cathedis</div>
            </div>
            <div class="content">
              <div class="qr-code">
                ${svgString}
              </div>
              <div class="info">
                <div class="eq-name">${equipment.name}</div>
                <div class="eq-sn">S/N: ${serialNum}</div>
                <div class="eq-cat">${categoryName}</div>
              </div>
            </div>
            <div class="footer">
              Ne pas retirer cette étiquette — Contact Support IT
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
    >
      <DialogTitle
        sx={{
          bgcolor: '#1A1A2E',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCode2Icon sx={{ color: '#E31E24' }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#FFFFFF' }}>
            Étiquette QR Code
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
        {/* Physical Tag Preview Card (Premier Style d'origine) */}
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            p: 2.5,
            borderRadius: 3,
            border: '2px solid #E31E24',
            bgcolor: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(227, 30, 36, 0.08)',
          }}
        >
          {/* Tag Top Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E31E24', pb: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box component="span" sx={{ fontWeight: 900, fontSize: '1rem', color: '#E31E24', letterSpacing: 1 }}>
                CATHEDIS
              </Box>
            </Box>
            <Chip
              label="ACTIF INFORMATIQUE"
              size="small"
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#FFEBEE', color: '#C62828' }}
            />
          </Box>

          {/* QR Code & Information */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1,
                bgcolor: '#fff',
                borderRadius: 2,
                border: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QRCodeSVG
                ref={qrRef}
                value={qrData}
                size={110}
                bgColor="#FFFFFF"
                fgColor="#1A1A2E"
                level="H"
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: '1rem', fontWeight: 800, color: '#1A1A2E' }}>
                {equipment.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  bgcolor: '#F1F5F9',
                  color: '#334155',
                  px: 1,
                  py: 0.3,
                  borderRadius: 1,
                  display: 'inline-block',
                  mt: 0.5,
                  fontWeight: 700
                }}
              >
                S/N: {serialNum}
              </Typography>
              {categoryName && (
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mt: 0.8 }}>
                  Catégorie : <strong>{categoryName}</strong>
                </Typography>
              )}
              {departmentName && (
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Dépt : <strong>{departmentName}</strong>
                </Typography>
              )}
            </Box>
          </Box>

          {/* Tag Footer Notice */}
          <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8', textAlign: 'center', borderTop: '1px dashed #E2E8F0', pt: 1, mt: 2 }}>
            Propriété exclusive de Cathedis • Ne pas retirer
          </Typography>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, width: '100%', mt: 1 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              background: 'linear-gradient(90deg, #E31E24, #C41018)',
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 700,
              py: 1.2,
              boxShadow: '0 4px 14px rgba(227, 30, 36, 0.3)',
              color: '#FFFFFF',
              '&:hover': { boxShadow: '0 6px 20px rgba(227, 30, 36, 0.45)' },
            }}
          >
            Imprimer l'étiquette
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadSVG}
            sx={{
              borderColor: '#1A1A2E',
              color: '#1A1A2E',
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 700,
              py: 1.2,
              '&:hover': { bgcolor: '#F1F5F9', borderColor: '#1A1A2E' },
            }}
          >
            Télécharger SVG
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
