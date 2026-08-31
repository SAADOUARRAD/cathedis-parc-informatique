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
  Paper,
  Tooltip,
  ButtonGroup
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
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
  const [tagFormat, setTagFormat] = useState<'STANDARD' | 'COMPACT' | 'LARGE'>('STANDARD');
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
    owner: 'CATHEDIS EXPRESS S.A.',
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
    downloadLink.download = `ETIQUETTE_CATHEDIS_${invNum}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svgString = qrRef.current ? new XMLSerializer().serializeToString(qrRef.current) : '';

    const widthMm = tagFormat === 'COMPACT' ? '60mm' : tagFormat === 'LARGE' ? '95mm' : '80mm';
    const heightMm = tagFormat === 'COMPACT' ? '35mm' : tagFormat === 'LARGE' ? '55mm' : '48mm';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Étiquette Haute Sécurité - ${equipment.name}</title>
          <style>
            @page {
              size: ${widthMm} ${heightMm};
              margin: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              box-sizing: border-box;
              background-color: #ffffff;
            }
            .label-card {
              width: ${widthMm};
              height: ${heightMm};
              background: #ffffff;
              border: 1.5px solid #CBD5E1;
              border-radius: 6px;
              box-sizing: border-box;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
            }
            .top-band {
              background: #E31E24;
              color: #ffffff;
              padding: 4px 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .brand-name {
              font-size: 11px;
              font-weight: 900;
              letter-spacing: 1.2px;
            }
            .top-badge {
              font-size: 7px;
              font-weight: 800;
              background: rgba(255,255,255,0.25);
              padding: 1px 5px;
              border-radius: 3px;
              letter-spacing: 0.5px;
            }
            .main-content {
              display: flex;
              align-items: center;
              padding: 6px 8px;
              gap: 8px;
              flex: 1;
            }
            .qr-wrapper {
              background: #ffffff;
              padding: 2px;
              border: 1px solid #E2E8F0;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .details {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
            .inv-code {
              font-family: 'Courier New', monospace;
              font-weight: 900;
              font-size: 11px;
              color: #E31E24;
              letter-spacing: 0.5px;
            }
            .name {
              font-size: 9.5px;
              font-weight: 800;
              color: #0F172A;
              line-height: 1.1;
              max-width: 140px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .sn-box {
              font-family: 'Courier New', monospace;
              font-size: 7.5px;
              font-weight: bold;
              color: #334155;
              background: #F1F5F9;
              padding: 1px 4px;
              border-radius: 2px;
              display: inline-block;
              border: 1px solid #E2E8F0;
            }
            .dept-info {
              font-size: 7px;
              color: #64748B;
              font-weight: 600;
            }
            .bottom-bar {
              border-top: 1px solid #E2E8F0;
              padding: 3px 8px;
              background: #F8FAFC;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .barcode {
              display: flex;
              gap: 1px;
              height: 8px;
              align-items: center;
            }
            .bar {
              height: 100%;
              background: #0F172A;
            }
            .security-text {
              font-size: 6px;
              font-weight: 800;
              color: #64748B;
              letter-spacing: 0.3px;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="top-band">
              <span class="brand-name">CATHEDIS</span>
              <span class="top-badge">ACTIF OFFICIEL</span>
            </div>

            <div class="main-content">
              <div class="qr-wrapper">
                ${svgString}
              </div>
              <div class="details">
                <div class="inv-code">${invNum}</div>
                <div class="name">${equipment.name}</div>
                <div><span class="sn-box">S/N: ${serialNum}</span></div>
                <div class="dept-info">${categoryName} • ${departmentName}</div>
              </div>
            </div>

            <div class="bottom-bar">
              <div class="barcode">
                <div class="bar" style="width:2px;"></div>
                <div class="bar" style="width:1px;"></div>
                <div class="bar" style="width:3px;"></div>
                <div class="bar" style="width:1px;"></div>
                <div class="bar" style="width:2px;"></div>
                <div class="bar" style="width:1px;"></div>
                <div class="bar" style="width:3px;"></div>
                <div class="bar" style="width:2px;"></div>
                <div class="bar" style="width:1px;"></div>
                <div class="bar" style="width:2px;"></div>
                <div class="bar" style="width:3px;"></div>
              </div>
              <div class="security-text">TRAÇABILITÉ DSI • NE PAS RETIRER</div>
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
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4.5,
            overflow: 'hidden',
            bgcolor: '#FAFAFC',
            boxShadow: '0 25px 60px rgba(0,0,0,0.18)'
          }
        }
      }}
    >
      {/* 🌟 Modal Top Header 🌟 */}
      <DialogTitle
        sx={{
          bgcolor: '#1A1A2E',
          color: '#FFFFFF',
          p: 2.2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #E31E24'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: 'rgba(227, 30, 36, 0.2)',
              border: '1px solid #E31E24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#E31E24'
            }}
          >
            <QrCode2Icon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#FFFFFF', lineHeight: 1.2 }}>
              Étiquette d'Actif Haute Définition
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              Générateur d'étiquette d'inventaire sécurisée Cathedis
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        
        {/* Format Selector Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Format d'étiquette :
          </Typography>
          <ButtonGroup size="small" variant="outlined">
            {[
              { id: 'COMPACT', label: 'Compact (60x35mm)' },
              { id: 'STANDARD', label: 'Standard (80x48mm)' },
              { id: 'LARGE', label: 'Grand (95x55mm)' }
            ].map((fmt) => (
              <Button
                key={fmt.id}
                onClick={() => setTagFormat(fmt.id as any)}
                variant={tagFormat === fmt.id ? 'contained' : 'outlined'}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  borderRadius: 2,
                  bgcolor: tagFormat === fmt.id ? '#1A1A2E' : '#FFFFFF',
                  color: tagFormat === fmt.id ? '#FFFFFF' : '#475569',
                  borderColor: '#CBD5E1',
                  '&:hover': { bgcolor: tagFormat === fmt.id ? '#2A1B28' : '#F1F5F9' }
                }}
              >
                {fmt.label}
              </Button>
            ))}
          </ButtonGroup>
        </Box>

        {/* 🏷️✨ MASTER EXTRAORDINARY ASSET LABEL CARD ✨🏷️ */}
        <Box
          sx={{
            width: '100%',
            maxWidth: tagFormat === 'COMPACT' ? 380 : tagFormat === 'LARGE' ? 470 : 430,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '2px solid #E2E8F0',
            boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            position: 'relative',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 20px 48px rgba(227, 30, 36, 0.15)',
              borderColor: '#E31E24'
            }
          }}
        >
          {/* Top Premium Red Header Band */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #E31E24 0%, #B91C1C 100%)',
              color: '#FFFFFF',
              px: 2.2,
              py: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(227, 30, 36, 0.3)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#FFFFFF', letterSpacing: 1.5 }}>
                CATHEDIS
              </Typography>
            </Box>
            <Chip
              icon={<VerifiedUserIcon sx={{ fontSize: 13, color: '#FFFFFF !important' }} />}
              label="ACTIF SÉCURISÉ IT"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 900,
                bgcolor: 'rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.4)',
                letterSpacing: 0.5
              }}
            />
          </Box>

          {/* Holographic Security Foil Strip (Subtle iridescent light effect) */}
          <Box
            sx={{
              height: 4,
              width: '100%',
              background: 'linear-gradient(90deg, #ff0000 0%, #ff9a00 20%, #d0de21 40%, #4ff0e6 60%, #a600ff 80%, #ff0077 100%)',
              opacity: 0.75
            }}
          />

          {/* Main Label Body */}
          <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2.2 }}>
            
            {/* High-Precision QR Code with Optical Corner Targets */}
            <Box
              sx={{
                p: 1.2,
                bgcolor: '#FFFFFF',
                borderRadius: 2.5,
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                flexShrink: 0
              }}
            >
              {/* Corner Targeting Marks */}
              <Box sx={{ position: 'absolute', top: 3, left: 3, width: 8, height: 8, borderTop: '2px solid #E31E24', borderLeft: '2px solid #E31E24' }} />
              <Box sx={{ position: 'absolute', top: 3, right: 3, width: 8, height: 8, borderTop: '2px solid #E31E24', borderRight: '2px solid #E31E24' }} />
              <Box sx={{ position: 'absolute', bottom: 3, left: 3, width: 8, height: 8, borderBottom: '2px solid #E31E24', borderLeft: '2px solid #E31E24' }} />
              <Box sx={{ position: 'absolute', bottom: 3, right: 3, width: 8, height: 8, borderBottom: '2px solid #E31E24', borderRight: '2px solid #E31E24' }} />

              <QRCodeSVG
                ref={qrRef}
                value={qrData}
                size={tagFormat === 'COMPACT' ? 95 : tagFormat === 'LARGE' ? 130 : 115}
                bgColor="#FFFFFF"
                fgColor="#0F172A"
                level="H"
              />
            </Box>

            {/* Hardware Information Details */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
              
              {/* Inventory Number in High-Tech Red Badge */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 900,
                    fontSize: '1rem',
                    color: '#E31E24',
                    letterSpacing: 1,
                    bgcolor: '#FFF1F1',
                    px: 1,
                    py: 0.2,
                    borderRadius: 1,
                    border: '1px solid #FFE2E2',
                    display: 'inline-block'
                  }}
                >
                  {invNum}
                </Typography>
              </Box>

              {/* Equipment Full Name */}
              <Typography
                noWrap
                sx={{
                  fontSize: '1rem',
                  fontWeight: 900,
                  color: '#0F172A',
                  lineHeight: 1.2
                }}
              >
                {equipment.name}
              </Typography>

              {/* Serial Number S/N */}
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    color: '#1E293B',
                    bgcolor: '#F1F5F9',
                    px: 1,
                    py: 0.3,
                    borderRadius: 1.5,
                    border: '1px solid #CBD5E1',
                    display: 'inline-block'
                  }}
                >
                  S/N: {serialNum}
                </Typography>
              </Box>

              {/* Department & Location */}
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                🏢 {departmentName} • {categoryName}
              </Typography>
            </Box>
          </Box>

          {/* Bottom Security Bar with Code-128 Barcode */}
          <Box
            sx={{
              px: 2.2,
              py: 1,
              bgcolor: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            {/* High Density Barcode */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5px', height: 14 }}>
              {[2,1,3,1,1,2,3,1,2,1,3,2,1,1,3,2,1,3,1,2,1,3,2,1,2,1,3].map((w, i) => (
                <Box key={i} sx={{ width: w, height: '100%', bgcolor: '#0F172A' }} />
              ))}
            </Box>

            <Typography
              variant="caption"
              sx={{
                fontSize: '0.62rem',
                fontWeight: 800,
                color: '#64748B',
                letterSpacing: 0.5,
                textTransform: 'uppercase'
              }}
            >
              🔒 INVIOLABLE • TRACÉ PAR CATHEDIS DSI
            </Typography>
          </Box>
        </Box>

        {/* 🚀 Action Buttons Bar 🚀 */}
        <Box sx={{ display: 'flex', gap: 1.5, width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
          
          <Button
            variant="outlined"
            startIcon={copied ? <CheckIcon sx={{ color: '#059669' }} /> : <ContentCopyIcon />}
            onClick={handleCopyData}
            sx={{
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none',
              color: copied ? '#059669' : '#1A1A2E',
              borderColor: copied ? '#059669' : '#CBD5E1',
              bgcolor: '#FFFFFF',
              px: 2,
              '&:hover': { bgcolor: '#F8FAFC' }
            }}
          >
            {copied ? 'Copié !' : 'Copier les Données'}
          </Button>

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
              bgcolor: '#FFFFFF',
              px: 2,
              '&:hover': { bgcolor: '#F8FAFC' }
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
              fontWeight: 900,
              textTransform: 'none',
              px: 3,
              py: 1,
              background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
              boxShadow: '0 4px 16px rgba(227, 30, 36, 0.4)',
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
