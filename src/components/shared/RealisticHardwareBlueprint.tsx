'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

interface HardwareBlueprintProps {
  categoryName?: string;
  equipmentName?: string;
  brand?: string;
  model?: string;
  status?: string;
  height?: number | string;
  interactive?: boolean;
}

export default function RealisticHardwareBlueprint({
  categoryName = '',
  equipmentName = '',
  brand = '',
  model = '',
  status = 'AVAILABLE',
  height = 160,
  interactive = true
}: HardwareBlueprintProps) {
  const normalized = (categoryName + ' ' + equipmentName + ' ' + brand + ' ' + model).toLowerCase();

  // Determine hardware family
  const isLaptop = normalized.includes('portable') || normalized.includes('laptop') || normalized.includes('macbook') || normalized.includes('thinkpad') || normalized.includes('elitebook') || normalized.includes('probook');
  const isDesktop = normalized.includes('fixe') || normalized.includes('desktop') || normalized.includes('tour') || normalized.includes('ecran') || normalized.includes('écran') || normalized.includes('unité centrale') || normalized.includes('workstation');
  const isHeadset = normalized.includes('casque') || normalized.includes('audio') || normalized.includes('headset') || normalized.includes('écouteur') || normalized.includes('jabber') || normalized.includes('jabra') || normalized.includes('poly');
  const isPrinter = normalized.includes('imprimante') || normalized.includes('printer') || normalized.includes('scanner') || normalized.includes('copieur') || normalized.includes('laserjet');
  const isNetwork = normalized.includes('routeur') || normalized.includes('switch') || normalized.includes('réseau') || normalized.includes('serveur') || normalized.includes('cisco') || normalized.includes('fortinet') || normalized.includes('firewall') || normalized.includes('point d\'accès') || normalized.includes('wifi');
  const isPhone = normalized.includes('téléphone') || normalized.includes('phone') || normalized.includes('smartphone') || normalized.includes('pda') || normalized.includes('terminal') || normalized.includes('zebra');

  // Status colors
  const isMaintenance = status === 'MAINTENANCE';
  const isAssigned = status === 'ASSIGNED';
  const statusGlow = isMaintenance ? '#DC2626' : isAssigned ? '#2563EB' : '#059669';

  return (
    <Box
      sx={{
        width: '100%',
        height: height,
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2.5,
        overflow: 'hidden',
        background: isMaintenance
          ? 'linear-gradient(135deg, #180D0D 0%, #2A1414 100%)'
          : 'linear-gradient(135deg, #0D0F1D 0%, #161B33 100%)',
        border: `1px solid ${isMaintenance ? 'rgba(220, 38, 38, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
        boxShadow: `inset 0 0 20px rgba(0,0,0,0.6), 0 4px 14px ${statusGlow}22`,
        transition: 'all 0.3s ease',
        '&:hover': interactive ? {
          boxShadow: `inset 0 0 25px rgba(0,0,0,0.4), 0 8px 24px ${statusGlow}44`,
          borderColor: statusGlow
        } : {}
      }}
    >
      {/* Background blueprint grid lines */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          opacity: 0.6,
          pointerEvents: 'none'
        }}
      />

      {/* 💻 1. REALISTIC LAPTOP BLUEPRINT */}
      {isLaptop && (
        <svg viewBox="0 0 240 150" style={{ width: '85%', height: '85%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="laptopChassis" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <linearGradient id="laptopScreen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <linearGradient id="cathedisScreenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E31E24" />
              <stop offset="100%" stopColor="#7B0000" />
            </linearGradient>
          </defs>

          {/* Screen Bezel in Perspective */}
          <polygon
            points="45,15 195,15 210,88 30,88"
            fill="url(#laptopChassis)"
            stroke="#64748B"
            strokeWidth="1.5"
            filter="drop-shadow(0 6px 12px rgba(0,0,0,0.5))"
          />

          {/* Glowing Display Panel */}
          <polygon
            points="50,20 190,20 203,83 37,83"
            fill="url(#laptopScreen)"
            stroke="#0284C7"
            strokeWidth="0.8"
          />

          {/* Cathedis Logo Wallpaper on Laptop Screen */}
          <polygon
            points="95,40 145,40 140,65 90,65"
            fill="url(#cathedisScreenGlow)"
            opacity="0.85"
            filter="drop-shadow(0 0 6px rgba(227, 30, 36, 0.8))"
          />
          <text x="118" y="55" fill="#FFFFFF" fontSize="9" fontWeight="900" textAnchor="middle" letterSpacing="1">CATHEDIS</text>

          {/* Mock lines of UI on screen */}
          <line x1="55" y1="30" x2="85" y2="30" stroke="#38BDF8" strokeWidth="1.5" opacity="0.7" />
          <line x1="55" y1="36" x2="75" y2="36" stroke="#94A3B8" strokeWidth="1" opacity="0.5" />
          <line x1="160" y1="30" x2="185" y2="30" stroke="#22C55E" strokeWidth="1.5" opacity="0.8" />

          {/* Webcam dot */}
          <circle cx="120" cy="18" r="1.5" fill="#0284C7" />

          {/* Bottom Keyboard Base / Lower Chassis */}
          <polygon
            points="30,88 210,88 235,135 5,135"
            fill="url(#laptopChassis)"
            stroke="#64748B"
            strokeWidth="1.5"
            filter="drop-shadow(0 10px 20px rgba(0,0,0,0.6))"
          />

          {/* Chamfered front lip */}
          <polygon points="5,135 235,135 230,138 10,138" fill="#CBD5E1" opacity="0.4" />

          {/* Backlit Keyboard Area */}
          <polygon
            points="42,92 198,92 215,116 25,116"
            fill="#0F172A"
            stroke="#334155"
            strokeWidth="0.8"
          />

          {/* Key Rows Grid (Backlit Neon Grid) */}
          <line x1="38" y1="97" x2="202" y2="97" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />
          <line x1="34" y1="103" x2="206" y2="103" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />
          <line x1="30" y1="109" x2="210" y2="109" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />

          {/* Glass Trackpad */}
          <polygon
            points="95,120 145,120 150,133 90,133"
            fill="#1E293B"
            stroke="#64748B"
            strokeWidth="1"
          />

          {/* Pulsing Power / Battery Status LED */}
          <circle cx="218" cy="98" r="2" fill={statusGlow}>
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      )}

      {/* 🖥️ 2. REALISTIC DESKTOP TOWER & CURVED SCREEN BLUEPRINT */}
      {isDesktop && !isLaptop && (
        <svg viewBox="0 0 240 150" style={{ width: '85%', height: '85%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="monitorScreen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="100%" stopColor="#1C2541" />
            </linearGradient>
            <linearGradient id="pcCase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>

          {/* === 🖥️ 27" CURVED MONITOR (Left/Center) === */}
          {/* Monitor Stand Base */}
          <ellipse cx="90" cy="132" rx="35" ry="6" fill="#475569" stroke="#64748B" strokeWidth="1" />
          <rect x="86" y="85" width="8" height="48" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />

          {/* Monitor Frame */}
          <rect
            x="15"
            y="15"
            width="150"
            height="85"
            rx="8"
            fill="url(#monitorScreen)"
            stroke="#475569"
            strokeWidth="2"
            filter="drop-shadow(0 6px 14px rgba(0,0,0,0.6))"
          />

          {/* Screen Inner Display */}
          <rect x="20" y="20" width="140" height="75" rx="5" fill="#0A0E1A" />
          
          {/* Screen Header Bar & Graph */}
          <rect x="25" y="25" width="130" height="8" rx="2" fill="#1E293B" />
          <circle cx="30" cy="29" r="2" fill="#EF4444" />
          <circle cx="36" cy="29" r="2" fill="#F59E0B" />
          <circle cx="42" cy="29" r="2" fill="#10B981" />

          {/* Holographic Data Waves on Screen */}
          <path d="M 28 65 Q 45 40 65 60 T 105 50 T 145 70" fill="none" stroke="#38BDF8" strokeWidth="2" filter="drop-shadow(0 0 4px #38BDF8)" />
          <path d="M 28 75 Q 45 55 65 70 T 105 65 T 145 78" fill="none" stroke="#E31E24" strokeWidth="1.5" opacity="0.8" />

          {/* Monitor Ambient Neon Halo Glow */}
          <rect x="18" y="18" width="144" height="79" rx="6" fill="none" stroke="#38BDF8" strokeWidth="1" opacity="0.4" />

          {/* === 🗄️ PC TOWER CASE (Right) === */}
          <rect
            x="175"
            y="25"
            width="55"
            height="112"
            rx="6"
            fill="url(#pcCase)"
            stroke="#64748B"
            strokeWidth="1.5"
            filter="drop-shadow(0 8px 16px rgba(0,0,0,0.7))"
          />

          {/* Tempered Glass Window */}
          <rect x="180" y="32" width="45" height="98" rx="4" fill="#050811" stroke="#334155" strokeWidth="1" />

          {/* Fan 1 (Top RGB Fan with Animated Spin) */}
          <circle cx="202" cy="55" r="16" fill="#0A1128" stroke="#0284C7" strokeWidth="1.5" filter="drop-shadow(0 0 6px #0284C7)" />
          <circle cx="202" cy="55" r="5" fill="#38BDF8" />
          <path d="M 202 39 L 202 71 M 186 55 L 218 55" stroke="#38BDF8" strokeWidth="2">
            <animateTransform attributeName="transform" type="rotate" from="0 202 55" to="360 202 55" dur="3s" repeatCount="indefinite" />
          </path>

          {/* Fan 2 (Bottom RGB Fan with Animated Spin) */}
          <circle cx="202" cy="98" r="16" fill="#0A1128" stroke="#E31E24" strokeWidth="1.5" filter="drop-shadow(0 0 6px #E31E24)" />
          <circle cx="202" cy="98" r="5" fill="#FF4D4D" />
          <path d="M 202 82 L 202 114 M 186 98 L 218 98" stroke="#FF4D4D" strokeWidth="2">
            <animateTransform attributeName="transform" type="rotate" from="0 202 98" to="360 202 98" dur="3s" repeatCount="indefinite" />
          </path>
        </svg>
      )}

      {/* 🎧 3. REALISTIC HEADSET / AUDIO BLUEPRINT */}
      {isHeadset && (
        <svg viewBox="0 0 240 150" style={{ width: '85%', height: '85%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="headband" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <linearGradient id="earcup" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>

          {/* Headband Arch */}
          <path
            d="M 60 85 C 60 20, 180 20, 180 85"
            fill="none"
            stroke="url(#headband)"
            strokeWidth="12"
            strokeLinecap="round"
            filter="drop-shadow(0 6px 12px rgba(0,0,0,0.6))"
          />
          {/* Padded Cushion on Inner Headband */}
          <path
            d="M 75 60 C 95 35, 145 35, 165 60"
            fill="none"
            stroke="#1E293B"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Left Earcup Slider & Cushion */}
          <g>
            <rect x="52" y="80" width="16" height="42" rx="8" fill="url(#earcup)" stroke="#64748B" strokeWidth="1.5" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))" />
            <rect x="44" y="84" width="10" height="34" rx="4" fill="#0F172A" />
            {/* Metallic Ring Accent */}
            <circle cx="60" cy="101" r="5" fill="#E31E24" />
          </g>

          {/* Right Earcup Slider & Cushion */}
          <g>
            <rect x="172" y="80" width="16" height="42" rx="8" fill="url(#earcup)" stroke="#64748B" strokeWidth="1.5" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))" />
            <rect x="186" y="84" width="10" height="34" rx="4" fill="#0F172A" />
            <circle cx="180" cy="101" r="5" fill="#E31E24" />
          </g>

          {/* Flexible Microphone Boom */}
          <path
            d="M 60 110 Q 75 142 120 138"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Microphone Head with LED */}
          <rect x="120" y="133" width="14" height="10" rx="4" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
          <circle cx="132" cy="138" r="2" fill="#22C55E">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
          </circle>

          {/* Sound Waves from Microphone */}
          <path d="M 140 133 Q 145 138 140 143" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.8">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" />
          </path>
          <path d="M 145 129 Q 152 138 145 147" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.5">
            <animate attributeName="opacity" values="0.1;0.8;0.1" dur="1.2s" begin="0.3s" repeatCount="indefinite" />
          </path>
        </svg>
      )}

      {/* 🖨️ 4. REALISTIC PRINTER / SCANNER BLUEPRINT */}
      {isPrinter && (
        <svg viewBox="0 0 240 150" style={{ width: '85%', height: '85%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="printerBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>

          {/* Printer Main Heavy Duty Body */}
          <rect
            x="40"
            y="45"
            width="160"
            height="85"
            rx="10"
            fill="url(#printerBody)"
            stroke="#475569"
            strokeWidth="2"
            filter="drop-shadow(0 10px 20px rgba(0,0,0,0.6))"
          />

          {/* Top Scanner Bed Cover */}
          <polygon
            points="45,45 195,45 185,25 55,25"
            fill="#334155"
            stroke="#64748B"
            strokeWidth="1.5"
          />
          <rect x="65" y="28" width="110" height="12" rx="2" fill="#1E293B" />

          {/* LCD Status Touchscreen */}
          <rect x="155" y="55" width="35" height="22" rx="3" fill="#0F172A" stroke="#0284C7" strokeWidth="1" />
          <text x="172" y="68" fill="#38BDF8" fontSize="6" fontWeight="900" textAnchor="middle">READY</text>
          <circle cx="185" cy="60" r="1.5" fill="#22C55E" />

          {/* Output Paper Slot */}
          <rect x="55" y="80" width="90" height="8" rx="2" fill="#1E293B" />

          {/* Animated Printed Document Coming Out */}
          <g>
            <rect x="60" y="84" width="80" height="35" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.2))">
              <animate attributeName="height" values="20;35;20" dur="4s" repeatCount="indefinite" />
            </rect>
            <line x1="68" y1="92" x2="110" y2="92" stroke="#E31E24" strokeWidth="2" />
            <line x1="68" y1="98" x2="130" y2="98" stroke="#64748B" strokeWidth="1" />
            <line x1="68" y1="104" x2="120" y2="104" stroke="#94A3B8" strokeWidth="1" />
          </g>

          {/* CMYK Ink Level Gauges */}
          <g transform="translate(155, 88)">
            <rect x="0" y="0" width="6" height="25" rx="2" fill="#0891B2" />
            <rect x="9" y="0" width="6" height="25" rx="2" fill="#DB2777" />
            <rect x="18" y="0" width="6" height="25" rx="2" fill="#FACC15" />
            <rect x="27" y="0" width="6" height="25" rx="2" fill="#0F172A" />
          </g>
        </svg>
      )}

      {/* 🌐 5. REALISTIC NETWORK SWITCH / ROUTER / SERVER RACK */}
      {(isNetwork || (!isLaptop && !isDesktop && !isHeadset && !isPrinter && !isPhone)) && (
        <svg viewBox="0 0 240 150" style={{ width: '85%', height: '85%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="switchChassis" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>

          {/* 1U Rackmount Metallic Chassis */}
          <rect
            x="20"
            y="45"
            width="200"
            height="60"
            rx="6"
            fill="url(#switchChassis)"
            stroke="#64748B"
            strokeWidth="2"
            filter="drop-shadow(0 10px 20px rgba(0,0,0,0.7))"
          />

          {/* Left & Right Rack Mount Ears with Screws */}
          <rect x="10" y="45" width="10" height="60" fill="#475569" stroke="#64748B" strokeWidth="1" />
          <circle cx="15" cy="55" r="2.5" fill="#1E293B" stroke="#94A3B8" strokeWidth="1" />
          <circle cx="15" cy="95" r="2.5" fill="#1E293B" stroke="#94A3B8" strokeWidth="1" />

          <rect x="220" y="45" width="10" height="60" fill="#475569" stroke="#64748B" strokeWidth="1" />
          <circle cx="225" cy="55" r="2.5" fill="#1E293B" stroke="#94A3B8" strokeWidth="1" />
          <circle cx="225" cy="95" r="2.5" fill="#1E293B" stroke="#94A3B8" strokeWidth="1" />

          {/* Brand & Status Banner */}
          <rect x="30" y="55" width="45" height="15" rx="2" fill="#0F172A" />
          <text x="52" y="66" fill="#FFFFFF" fontSize="7" fontWeight="900" textAnchor="middle" letterSpacing="0.8">CATHEDIS</text>

          {/* Master Power & System Health LEDs */}
          <circle cx="35" cy="85" r="2.5" fill="#22C55E" filter="drop-shadow(0 0 4px #22C55E)" />
          <circle cx="43" cy="85" r="2.5" fill="#38BDF8" filter="drop-shadow(0 0 4px #38BDF8)" />
          <circle cx="51" cy="85" r="2.5" fill="#EAB308" />

          {/* 16 RJ45 Gigabit Ethernet Ports in 2 Rows with Live Traffic LEDs */}
          <g transform="translate(85, 55)">
            {Array.from({ length: 8 }).map((_, i) => (
              <g key={i} transform={`translate(${i * 15}, 0)`}>
                {/* Port Top */}
                <rect x="0" y="0" width="12" height="16" rx="2" fill="#0F172A" stroke="#475569" strokeWidth="0.8" />
                <circle cx="6" cy="-4" r="1.5" fill={i % 2 === 0 ? '#22C55E' : '#38BDF8'}>
                  <animate attributeName="opacity" values="1;0.2;1" dur={`${0.4 + (i * 0.15)}s`} repeatCount="indefinite" />
                </circle>
                
                {/* Port Bottom */}
                <rect x="0" y="20" width="12" height="16" rx="2" fill="#0F172A" stroke="#475569" strokeWidth="0.8" />
                <circle cx="6" cy="40" r="1.5" fill={i % 3 === 0 ? '#EAB308' : '#22C55E'}>
                  <animate attributeName="opacity" values="0.3;1;0.3" dur={`${0.6 + (i * 0.1)}s`} repeatCount="indefinite" />
                </circle>
              </g>
            ))}
          </g>

          {/* Dual High-Gain Antennas (WiFi / SD-WAN) */}
          <line x1="40" y1="45" x2="25" y2="15" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="25" cy="15" r="3" fill="#E31E24" />

          <line x1="200" y1="45" x2="215" y2="15" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="215" cy="15" r="3" fill="#E31E24" />
        </svg>
      )}

      {/* 📱 6. REALISTIC SMARTPHONE / PDA LOGISTIQUE BLUEPRINT */}
      {isPhone && (
        <svg viewBox="0 0 240 150" style={{ width: '85%', height: '85%', overflow: 'visible' }}>
          {/* Rugged Phone Chassis */}
          <rect
            x="85"
            y="15"
            width="70"
            height="120"
            rx="12"
            fill="#1E293B"
            stroke="#F97316"
            strokeWidth="2.5"
            filter="drop-shadow(0 8px 16px rgba(0,0,0,0.7))"
          />

          {/* Display Screen */}
          <rect x="92" y="25" width="56" height="92" rx="6" fill="#0B132B" stroke="#334155" strokeWidth="1" />

          {/* Barcode Scanner View on PDA */}
          <rect x="100" y="45" width="40" height="30" rx="3" fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="95" y1="60" x2="145" y2="60" stroke="#EF4444" strokeWidth="2" filter="drop-shadow(0 0 4px #EF4444)">
            <animate attributeName="y1" values="50;70;50" dur="2s" repeatCount="indefinite" />
            <animate attributeName="y2" values="50;70;50" dur="2s" repeatCount="indefinite" />
          </line>

          {/* Top Laser Scanner Bumper */}
          <rect x="105" y="10" width="30" height="8" rx="2" fill="#F97316" />
          <circle cx="120" cy="14" r="2" fill="#EF4444" />
        </svg>
      )}

      {/* Dynamic Model & Status Ribbon at Bottom */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 6,
          left: 10,
          right: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none'
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 800,
            fontSize: '0.68rem',
            color: 'rgba(255, 255, 255, 0.75)',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            px: 1,
            py: 0.2,
            borderRadius: 1,
            backdropFilter: 'blur(4px)'
          }}
        >
          {brand ? `${brand} ${model || ''}` : 'Cathedis Hardware'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: statusGlow,
              boxShadow: `0 0 8px ${statusGlow}`
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              fontSize: '0.65rem',
              color: statusGlow,
              textTransform: 'uppercase',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              px: 0.8,
              py: 0.2,
              borderRadius: 1,
              backdropFilter: 'blur(4px)'
            }}
          >
            {status === 'AVAILABLE' ? 'Stock Prêt' : status === 'ASSIGNED' ? 'En Service' : status === 'MAINTENANCE' ? 'En Atelier' : 'Réformé'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
