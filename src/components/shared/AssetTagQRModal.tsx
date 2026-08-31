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
  Paper,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ComputerIcon from '@mui/icons-material/Computer';
import SecurityIcon from '@mui/icons-material/Security';
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
    : equipment.department?.name || 'Direction IT Cathedis';

  const invNum = equipment.inventoryNumber || 'CAT-' + equipment.id.slice(0, 8).toUpperCase();
  const serialNum = equipment.serialNumber || 'SN-' + equipment.id.slice(-6).toUpperCase();

  // Payload encoded in the QR Code
  const qrData = JSON.stringify({
    inv: invNum,
    id: equipment.id,
    sn: serialNum,
    name: equipment.name,
    owner: 'CATHEDIS',
    dept: departmentName
  });

  const handleDownloadSVG = () => {
    const svgElement = qrRef.current;
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `ETIQUETTE_${invNum}.svg`;
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
          <title>Étiquette Inventaire - ${equipment.name}</title>
          <style>
            @page {
              size: 80mm 50mm;
              margin: 0;
            }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              box-sizing: border-box;
              background-color: #ffffff;
            }
            .asset-tag {
              width: 76mm;
              height: 46mm;
              border: 2px solid #E31E24;
              border-radius: 8px;
              padding: 8px 10px;
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
            .tag-type {
              font-size: 8px;
              font-weight: 800;
              color: #1A1A2E;
              background: #F1F5F9;
              padding: 2px 6px;
              border-radius: 4px;
              border: 1px solid #CBD5E1;
              text-transform: uppercase;
            }
            .body {
              display: flex;
              align-items: center;
              gap: 10px;
              margin: 4px 0;
            }
            .qr-box {
              background: #ffffff;
              padding: 2px;
            }
            .info {
              flex: 1;
            }
            .inv-num {
              font-family: monospace;
              font-weight: 900;
              font-size: 12px;
              color: #E31E24;
            }
            .eq-name {
              font-size: 11px;
              font-weight: bold;
              color: #1A1A2E;
              margin: 1px 0;
            }
            .eq-sn {
              font-family: monospace;
              font-size: 8.5px;
              color: #475569;
              background: #F8FAFC;
              padding: 1px 4px;
              border-radius: 3px;
              display: inline-block;
              border: 1px solid #E2E8F0;
            }
            .eq-dept {
              font-size: 7.5px;
              color: #64748B;
              margin-top: 2px;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px dashed #CBD5E1;
              padding-top: 3px;
            }
            .barcode {
              display: flex;
              align-items: center;
              gap: 1.5px;
              height: 10px;
            }
            .bar {
              height: 100%;
              background: #1A1A2E;
            }
            .warning {
              font-size: 6.5px;
              font-weight: 700;
              color: #64748B;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="asset-tag">
            <div class="header">
              <div class="brand">CATHEDIS</div>
              <div class="tag-type">Propriété IT</div>
            </div>

            <div class="body">
              <div class="qr-box">
                ${svgString}
              </div>
              <div class="info">
                <div class="inv-num">${invNum}</div>
                <div class="eq-name">${equipment.name}</div>
                <div class="eq-sn">S/N: ${serialNum}</div>
                <div class="eq-dept">${categoryName} • ${departmentName}</div>
              </div>
            </div>

            <div class="footer">
              <div class="barcode">
                <div class="bar" style="width:2px;"></div>
                <div class="bar" style="width:1px;"></div>
                <div class="bar" style="width:3px;"></div>
                <div class="bar" style="width:1px;"></div>
                <div class="bar" style="width:2px;"></div>
                <div class="bar" style="width:3px;"></div>
                <div class="bar" style="width:1px;"></div>
                <div class="bar" style="width:2px;"></div>
                <div class="bar" style="width:1px;"></div>
                <div class="bar" style="width:3px;"></div>
                <div class="bar" style="width:2px;"></div>
                <div class="bar" style="width:1px;"></div>
                <div class="bar" style="width:2px;"></div>
              </div>
              <div class="warning">Ne pas retirer cette étiquette</div>
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
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }
        }
      }}
    >
      {/* Clean Modal Header */}
      <DialogTitle
        sx={{
          bgcolor: '#1A1A2E',
          color: '#FFFFFF',
          p: 2,
          px: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <QrCode2Icon sx={{ color: '#E31E24', fontSize: 24 }} />
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#FFFFFF' }}>
            Étiquette d'Inventaire
          </Typography>
        </Box>

        <IconButton size="small" onClick={onClose} sx={{ color: '#FFFFFF', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
        
        {/* 🏷️ Modern & Clean Asset Tag Preview 🏷️ */}
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            p: 2.5,
            borderRadius: 3,
            border: '2px solid #E31E24',
            bgcolor: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(227, 30, 36, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.8
          }}
        >
          {/* Tag Top Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E31E24', pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#E31E24', letterSpacing: 1.5 }}>
                CATHEDIS
              </Typography>
            </Box>
            <Chip
              label="PROPRIÉTÉ IT"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 800,
                bgcolor: '#F1F5F9',
                color: '#1E293B',
                border: '1px solid #CBD5E1'
              }}
            />
          </Box>

          {/* QR Code & Information */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1,
                bgcolor: '#FFFFFF',
                borderRadius: 2,
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
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

            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 900, color: '#E31E24' }}>
                {invNum}
              </Typography>
              <Typography noWrap sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#1A1A2E' }}>
                {equipment.name}
              </Typography>
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontFamily: 'monospace', bgcolor: '#F8FAFC', color: '#334155', px: 0.8, py: 0.2, borderRadius: 1, display: 'inline-block', fontWeight: 700, border: '1px solid #E2E8F0' }}>
                  S/N: {serialNum}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.72rem' }}>
                {categoryName} • {departmentName}
              </Typography>
            </Box>
          </Box>

          {/* Tag Footer */}
          <Box sx={{ pt: 1, borderTop: '1px dashed #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Barcode Mock */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5px', height: 12 }}>
              {[2,1,3,1,2,3,1,2,1,3,2,1,2,1,3,2,1,3,1,2].map((w, i) => (
                <Box key={i} sx={{ width: w, height: '100%', bgcolor: '#1A1A2E' }} />
              ))}
            </Box>

            <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
              Ne pas retirer cette étiquette
            </Typography>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, width: '100%', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadSVG}
            sx={{
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none',
              color: '#1A1A2E',
              borderColor: '#CBD5E1',
              px: 2,
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' }
            }}
          >
            Télécharger SVG
          </Button>

          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none',
              px: 2.5,
              background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
              boxShadow: '0 4px 14px rgba(227, 30, 36, 0.35)',
              color: '#FFFFFF',
              '&:hover': { background: 'linear-gradient(90deg, #C41018 0%, #991B1B 100%)' }
            }}
          >
            Imprimer l'Étiquette
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
