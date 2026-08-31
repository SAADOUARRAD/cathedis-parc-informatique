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
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import VerifiedIcon from '@mui/icons-material/Verified';
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
  const tagCardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt interactive rotation state
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  if (!equipment) return null;

  const categoryName = typeof equipment.category === 'string'
    ? equipment.category
    : equipment.category?.name || 'Matériel Informatique';

  const departmentName = typeof equipment.department === 'string'
    ? equipment.department
    : equipment.department?.name || 'Direction IT Cathedis';

  const invNum = equipment.inventoryNumber || 'CAT-' + equipment.id.slice(0, 8).toUpperCase();
  const serialNum = equipment.serialNumber || 'SN-CATHEDIS-' + equipment.id.slice(-6).toUpperCase();

  // Payload encoded in the QR Code
  const qrData = JSON.stringify({
    inv: invNum,
    id: equipment.id,
    sn: serialNum,
    name: equipment.name,
    owner: 'CATHEDIS EXPRESS S.A.',
    dept: departmentName
  });

  // Handle 3D Mouse Movement for Realistic Metal Reflection & Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tagCardRef.current) return;
    const rect = tagCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Smooth subtle tilt
    setRotateX(-(y / rect.height) * 16);
    setRotateY((x / rect.width) * 16);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const handleDownloadSVG = () => {
    const svgElement = qrRef.current;
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `MACARON_${invNum}.svg`;
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
          <title>Macaron d'Inventaire Métallique - ${equipment.name}</title>
          <style>
            @page {
              size: 85mm 54mm;
              margin: 0;
            }
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              box-sizing: border-box;
              background-color: #f1f5f9;
            }
            .metal-tag {
              width: 82mm;
              height: 50mm;
              background: linear-gradient(135deg, #e2e8f0 0%, #ffffff 40%, #cbd5e1 70%, #94a3b8 100%);
              border: 2px solid #64748b;
              border-radius: 6px;
              padding: 10px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
              box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            }
            .rivet {
              width: 5px;
              height: 5px;
              background: radial-gradient(circle, #334155 30%, #94a3b8 80%);
              border-radius: 50%;
              position: absolute;
            }
            .rivet.tl { top: 4px; left: 4px; }
            .rivet.tr { top: 4px; right: 4px; }
            .rivet.bl { bottom: 4px; left: 4px; }
            .rivet.br { bottom: 4px; right: 4px; }
            
            .tag-header {
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
              letter-spacing: 1.5px;
            }
            .badge {
              font-size: 8px;
              font-weight: bold;
              background: #1e293b;
              color: #ffffff;
              padding: 2px 6px;
              border-radius: 3px;
              letter-spacing: 0.5px;
            }
            .tag-body {
              display: flex;
              align-items: center;
              gap: 12px;
              margin: 4px 0;
            }
            .qr-box {
              background: #ffffff;
              padding: 3px;
              border: 1px solid #94a3b8;
              border-radius: 4px;
            }
            .info {
              flex: 1;
            }
            .inv-num {
              font-family: monospace;
              font-weight: 900;
              font-size: 12px;
              color: #0f172a;
              letter-spacing: 1px;
            }
            .eq-name {
              font-size: 11px;
              font-weight: bold;
              color: #1e293b;
              margin: 2px 0;
            }
            .eq-sn {
              font-family: monospace;
              font-size: 9px;
              color: #475569;
              background: rgba(255,255,255,0.7);
              padding: 2px 4px;
              border-radius: 2px;
              display: inline-block;
            }
            .tag-footer {
              font-size: 6.5px;
              font-weight: bold;
              color: #475569;
              text-align: center;
              border-top: 1px solid #cbd5e1;
              padding-top: 3px;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          <div class="metal-tag">
            <div class="rivet tl"></div>
            <div class="rivet tr"></div>
            <div class="rivet bl"></div>
            <div class="rivet br"></div>

            <div class="tag-header">
              <div class="brand">CATHEDIS</div>
              <div class="badge">PROPRIÉTÉ INFORMATIQUE</div>
            </div>

            <div class="tag-body">
              <div class="qr-box">
                ${svgString}
              </div>
              <div class="info">
                <div class="inv-num">${invNum}</div>
                <div class="eq-name">${equipment.name}</div>
                <div class="eq-sn">S/N: ${serialNum}</div>
                <div style="font-size: 8px; color: #64748b; margin-top: 2px;">${categoryName} • ${departmentName}</div>
              </div>
            </div>

            <div class="tag-footer">
              PROPRIÉTÉ EXCLUSIVE CATHEDIS EXPRESS — ACTIF GÉOLOCALISÉ & AUDITÉ
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
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: '#0B0F19',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(227, 30, 36, 0.15) 0%, transparent 70%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
          }
        }
      }}
    >
      {/* Dark Futuristic Header */}
      <DialogTitle
        sx={{
          color: '#FFFFFF',
          p: 2.5,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
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
              color: '#E31E24',
              boxShadow: '0 0 14px rgba(227, 30, 36, 0.4)'
            }}
          >
            <QrCode2Icon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFFFFF', fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
              Macaron d'Actif Métallique 3D
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
              Plaque d'inventaire industrielle gravée au laser • Inviolable
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#FFFFFF' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3.5 }}>
        
        {/* 🌟 3D PERSPECTIVE BRUSHED METAL ASSET TAG CONTAINER 🌟 */}
        <Box
          sx={{
            perspective: 1200,
            width: '100%',
            maxWidth: 440,
            cursor: 'grab'
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
        >
          <Box
            ref={tagCardRef}
            sx={{
              width: '100%',
              borderRadius: '12px',
              p: 3,
              position: 'relative',
              overflow: 'hidden',
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.03 : 1})`,
              transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transformStyle: 'preserve-3d',

              // Brushed Aluminium metallic background with realistic multi-layered shine
              background: 'linear-gradient(135deg, #E2E8F0 0%, #FFFFFF 20%, #CBD5E1 45%, #94A3B8 65%, #F8FAFC 85%, #CBD5E1 100%)',
              border: '2px solid #64748B',
              boxShadow: isHovered
                ? '0 25px 50px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.3)'
                : '0 15px 35px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.25)'
            }}
          >
            {/* Metallic Brush Texture Overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0px, rgba(0,0,0,0.05) 1px, rgba(255,255,255,0.15) 2px)',
                opacity: 0.7,
                pointerEvents: 'none'
              }}
            />

            {/* 4 Realistic Industrial Rivets / Screws at Corners */}
            {[
              { top: 8, left: 8 },
              { top: 8, right: 8 },
              { bottom: 8, left: 8 },
              { bottom: 8, right: 8 }
            ].map((pos, idx) => (
              <Box
                key={idx}
                sx={{
                  position: 'absolute',
                  ...pos,
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #94A3B8 0%, #334155 70%, #0F172A 100%)',
                  border: '1px solid #1E293B',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&::after': {
                    content: '""',
                    width: 5,
                    height: 1,
                    bgcolor: '#1E293B'
                  }
                }}
              />
            ))}

            {/* 🏷️ Top Header: Red Laser-Engraved Cathedis Banner */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2.5px solid #E31E24',
                pb: 1.2,
                mb: 2,
                position: 'relative',
                zIndex: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  component="span"
                  sx={{
                    fontWeight: 900,
                    fontSize: '1.25rem',
                    color: '#E31E24',
                    letterSpacing: 2,
                    textShadow: '0 1px 2px rgba(255,255,255,0.8), 0 -1px 1px rgba(0,0,0,0.3)'
                  }}
                >
                  CATHEDIS
                </Box>
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: 13, color: '#059669 !important' }} />}
                  label="CERTIFIÉ IT"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    bgcolor: 'rgba(5, 150, 105, 0.15)',
                    color: '#065F46',
                    border: '1px solid rgba(5, 150, 105, 0.3)'
                  }}
                />
              </Box>

              <Typography
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  color: '#1E293B',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  bgcolor: 'rgba(255,255,255,0.6)',
                  px: 1,
                  py: 0.3,
                  borderRadius: 1,
                  border: '1px solid #94A3B8'
                }}
              >
                PROPRIÉTÉ EXCLUSIVE
              </Typography>
            </Box>

            {/* 🏷️ Center: Laser-Engraved QR Code & Hardware Specs */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, position: 'relative', zIndex: 2 }}>
              
              {/* Laser-cut QR Code Container */}
              <Box
                sx={{
                  p: 1.2,
                  bgcolor: '#FFFFFF',
                  borderRadius: 2.5,
                  border: '2px solid #475569',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <QRCodeSVG
                  ref={qrRef}
                  value={qrData}
                  size={120}
                  bgColor="#FFFFFF"
                  fgColor="#0F172A"
                  level="H"
                />
              </Box>

              {/* Hardware Data Blocks */}
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                
                {/* Inventory Badge */}
                <Box>
                  <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    N° Actif / Inventaire
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 900,
                      fontSize: '1.05rem',
                      color: '#0F172A',
                      letterSpacing: 1.2,
                      textShadow: '0 1px 1px rgba(255,255,255,0.8)'
                    }}
                  >
                    {invNum}
                  </Typography>
                </Box>

                {/* Machine Name */}
                <Box>
                  <Typography
                    noWrap
                    sx={{
                      fontSize: '0.95rem',
                      fontWeight: 900,
                      color: '#1E293B',
                      lineHeight: 1.2
                    }}
                  >
                    {equipment.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>
                    {categoryName}
                  </Typography>
                </Box>

                {/* Serial Number in Engraved Recessed Box */}
                <Box
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.75)',
                    p: 0.6,
                    px: 1,
                    borderRadius: 1.5,
                    border: '1px solid #94A3B8',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '0.58rem', fontWeight: 800, color: '#64748B', display: 'block' }}>
                    S/N SÉRIE CONSTRUCTEUR
                  </Typography>
                  <Typography
                    noWrap
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 900,
                      fontSize: '0.75rem',
                      color: '#1D4ED8'
                    }}
                  >
                    {serialNum}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* 🏷️ Bottom Industrial Barcode & Security Disclaimer */}
            <Box
              sx={{
                mt: 2,
                pt: 1.2,
                borderTop: '1px solid #CBD5E1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                zIndex: 2
              }}
            >
              {/* Simulated Industrial Code 128 Barcode */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', height: 16 }}>
                {[3,1,2,1,3,2,1,2,3,1,1,3,2,1,3,1,2,3,1,2,1,3,2,1,3].map((w, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: w,
                      height: '100%',
                      bgcolor: '#0F172A'
                    }}
                  />
                ))}
              </Box>

              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.58rem',
                  fontWeight: 800,
                  color: '#475569',
                  letterSpacing: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <SecurityIcon sx={{ fontSize: 10, color: '#E31E24' }} />
                NE PAS RETIRER CETTE ÉTIQUETTE
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Action Controls & Interactive Hint */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            💡 Survolez la plaque métallique pour observer les reflets d'aluminium 3D en temps réel.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadSVG}
              sx={{
                borderRadius: 2.5,
                color: '#FFFFFF',
                borderColor: 'rgba(255,255,255,0.25)',
                fontWeight: 800,
                textTransform: 'none',
                px: 2.5,
                py: 1,
                bgcolor: 'rgba(255,255,255,0.05)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.12)',
                  borderColor: '#FFFFFF'
                }
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
                background: 'linear-gradient(90deg, #E31E24 0%, #B91C1C 100%)',
                boxShadow: '0 4px 18px rgba(227, 30, 36, 0.4)',
                color: '#FFFFFF',
                '&:hover': {
                  background: 'linear-gradient(90deg, #B91C1C 0%, #991B1B 100%)'
                }
              }}
            >
              Imprimer le Macaron (85x54mm)
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
