'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Avatar,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Business as BusinessIcon,
  LaptopMac as LaptopIcon,
  DesktopWindows as DesktopIcon,
  Tv as ScreenIcon,
  Headphones as HeadphoneIcon,
  Router as RouterIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Storage as StorageIcon,
  LocalShipping as ShippingIcon,
  Verified as VerifiedIcon,
  QrCode2 as QrCodeIcon,
  Draw as DrawIcon,
  PictureAsPdf as PdfIcon,
  Add as AddIcon,
  SwapHoriz as TransferIcon,
  Reply as ReturnIcon,
  Person as PersonIcon,
  Chair as ChairIcon,
  Coffee as CoffeeIcon,
  LocalFlorist as PlantIcon
} from '@mui/icons-material';

interface VisualFleetMapProps {
  equipments: any[];
  departments?: any[];
  assignments?: any[];
  onOpenDetails?: (equipment: any) => void;
  onOpenQr?: (equipment: any) => void;
  onAssignDesk?: (deskInfo: any) => void;
  onSignPV?: (assignment: any) => void;
  onDownloadPV?: (assignment: any) => void;
  onReturnEquipment?: (assignment: any) => void;
}

type SiteType = 'SIEGE_CASA' | 'HUB_LOGISTIQUE' | 'DATACENTER';

/* =========================================================================
   🎨 REALISTIC TOP-DOWN / ISOMETRIC WORKSTATION SVG COMPONENT 🎨
   Represents a true physical office desk, chair, sitting employee & devices
   ========================================================================= */
const RealisticWorkstation = ({
  desk,
  health,
  equipments = [],
  onClick
}: {
  desk: any;
  health: { status: string; label: string; color: string; bg: string; border: string };
  equipments: any[];
  onClick: () => void;
}) => {
  const isAlert = health.status === 'ALERT';
  const isOccupied = desk.user && desk.user !== 'Poste Libre' && desk.user !== 'Guichet Tournées';
  const hasLaptop = equipments.some(e => (e.category?.name || e.name || '').toLowerCase().includes('portable') || (e.category?.name || e.name || '').toLowerCase().includes('laptop')) || isOccupied;
  const hasScreen = equipments.some(e => (e.category?.name || e.name || '').toLowerCase().includes('écran') || (e.category?.name || e.name || '').toLowerCase().includes('ecran') || (e.category?.name || e.name || '').toLowerCase().includes('fixe')) || isOccupied;

  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        borderRadius: 3.5,
        p: 2,
        bgcolor: '#FFFFFF',
        border: `2px solid ${isAlert ? '#DC2626' : health.border}`,
        boxShadow: isAlert
          ? '0 0 18px rgba(220, 38, 38, 0.35)'
          : '0 8px 24px rgba(15, 23, 42, 0.06)',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: isAlert
          ? 'linear-gradient(180deg, #FEF2F2 0%, #FFFFFF 100%)'
          : 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.01)',
          boxShadow: '0 14px 32px rgba(15, 23, 42, 0.12)',
          borderColor: health.color
        }
      }}
    >
      {/* Desk ID & Status Ribbon */}
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: health.color, boxShadow: `0 0 8px ${health.color}` }} />
          <Typography sx={{ fontWeight: 900, fontFamily: 'monospace', fontSize: '0.8rem', color: '#1E293B' }}>
            #{desk.id}
          </Typography>
        </Box>
        <Chip
          label={health.label}
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: '0.65rem',
            height: 20,
            bgcolor: health.bg,
            color: health.color,
            border: `1px solid ${health.border}`
          }}
        />
      </Box>

      {/* 🏢 REALISTIC OFFICE DESK SCENOGRAPHY (SVG) 🏢 */}
      <Box sx={{ width: '100%', height: 170, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', my: 0.5 }}>
        <svg viewBox="0 0 240 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            {/* Wood Texture Gradient for Desk */}
            <linearGradient id={`deskWood-${desk.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>

            {/* Leather Desk Mat Gradient */}
            <linearGradient id={`deskMat-${desk.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* Screen Glow */}
            <linearGradient id={`screenGlow-${desk.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            
            {/* Chair Cushion */}
            <radialGradient id={`chairGradient-${desk.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1E293B" />
            </radialGradient>
          </defs>

          {/* 🪵 1. THE MAIN PHYSICAL DESK (Plateau de bureau ergonomique) */}
          <rect
            x="20"
            y="20"
            width="200"
            height="85"
            rx="12"
            fill={`url(#deskWood-${desk.id})`}
            stroke="#94A3B8"
            strokeWidth="1.5"
            filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.08))"
          />

          {/* Chamfered Desk Edge highlight */}
          <rect x="23" y="23" width="194" height="6" rx="3" fill="#FFFFFF" opacity="0.6" />

          {/* Cable Grommet (Passe-câbles de bureau) */}
          <circle cx="40" cy="35" r="4" fill="#64748B" stroke="#475569" strokeWidth="1" />
          <circle cx="40" cy="35" r="2" fill="#1E293B" />

          {/* 🖤 2. LEATHER DESK MAT (Sous-main de protection) */}
          <rect
            x="60"
            y="35"
            width="120"
            height="62"
            rx="6"
            fill={`url(#deskMat-${desk.id})`}
            stroke="#334155"
            strokeWidth="1"
          />

          {/* 🖥️ 3. DUAL MONITOR OR SCREEN (Écran incurvé 27") */}
          {hasScreen && (
            <g>
              {/* Stand Base */}
              <ellipse cx="120" cy="40" rx="14" ry="4" fill="#475569" />
              <rect x="117" y="30" width="6" height="10" fill="#334155" />
              {/* Screen Bar */}
              <rect
                x="80"
                y="26"
                width="80"
                height="8"
                rx="3"
                fill={`url(#screenGlow-${desk.id})`}
                stroke="#0F172A"
                strokeWidth="1.5"
                filter="drop-shadow(0 0 6px rgba(56, 189, 248, 0.6))"
              />
            </g>
          )}

          {/* 💻 4. LAPTOP & KEYBOARD (PC Portable & Clavier) */}
          {hasLaptop ? (
            <g>
              {/* Laptop Body */}
              <rect x="95" y="52" width="50" height="34" rx="4" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />
              {/* Keyboard Grid */}
              <rect x="100" y="56" width="40" height="18" rx="2" fill="#1E293B" />
              {/* Trackpad */}
              <rect x="112" y="77" width="16" height="7" rx="1.5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.5" />
            </g>
          ) : (
            <g>
              {/* Slim Keyboard */}
              <rect x="92" y="60" width="44" height="16" rx="2" fill="#334155" />
              {/* Mouse */}
              <ellipse cx="155" cy="68" rx="5" ry="8" fill="#475569" stroke="#334155" strokeWidth="0.8" />
            </g>
          )}

          {/* 🖱️ Mouse on desk mat */}
          <ellipse cx="162" cy="70" rx="4" ry="7" fill="#64748B" stroke="#334155" strokeWidth="0.5" />

          {/* ☕ 5. COFFEE MUG & PLANT POT (Accessoires de bureau chaleureux) */}
          {/* Coffee Mug */}
          <circle cx="195" cy="45" r="5" fill="#E31E24" stroke="#991B1B" strokeWidth="1" />
          <circle cx="195" cy="45" r="3.5" fill="#78350F" />
          <path d="M 200 43 Q 204 45 200 47" stroke="#E31E24" strokeWidth="1.2" fill="none" />

          {/* Plant Pot */}
          <circle cx="42" cy="75" r="6" fill="#F97316" />
          <circle cx="40" cy="73" r="3" fill="#15803D" />
          <circle cx="44" cy="74" r="3" fill="#22C55E" />
          <circle cx="42" cy="77" r="3" fill="#16A34A" />

          {/* 💺 6. ERGONOMIC OFFICE CHAIR (Fauteuil ergonomique de bureau) */}
          <g>
            {/* Chair Base Wheel Spiders */}
            <path d="M 120 125 L 105 145 M 120 125 L 135 145 M 120 125 L 120 150 M 120 125 L 95 125 M 120 125 L 145 125" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Chair Cushion Seat */}
            <rect
              x="98"
              y="98"
              width="44"
              height="36"
              rx="10"
              fill={`url(#chairGradient-${desk.id})`}
              stroke="#0F172A"
              strokeWidth="2"
              filter="drop-shadow(0px 6px 10px rgba(0,0,0,0.25))"
            />
            
            {/* Left & Right Armrests */}
            <rect x="90" y="104" width="6" height="22" rx="3" fill="#475569" />
            <rect x="144" y="104" width="6" height="22" rx="3" fill="#475569" />

            {/* Mesh Backrest */}
            <path d="M 98 128 Q 120 135 142 128" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" fill="none" />
          </g>

          {/* 👤 7. THE HUMAN PERSON SITTING AT DESK (Collaborateur / Collaboratrice) */}
          {isOccupied ? (
            <g>
              {/* Shoulders & Business Shirt */}
              <path
                d="M 96 122 C 96 108, 144 108, 144 122 Z"
                fill={isAlert ? '#EF4444' : '#2563EB'}
                stroke="#1E3A8A"
                strokeWidth="1.5"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
              />
              
              {/* Shirt Collar Accent */}
              <polygon points="120,118 114,109 126,109" fill="#FFFFFF" />

              {/* Head & Hair */}
              <ellipse cx="120" cy="100" rx="11" ry="12" fill="#FBCFE8" stroke="#DB2777" strokeWidth="0.8" />
              <path d="M 109 98 Q 120 86 131 98 Q 120 92 109 98 Z" fill="#1E293B" />

              {/* Headset on Person */}
              <path d="M 108 98 Q 120 86 132 98" stroke="#1E293B" strokeWidth="2.5" fill="none" />
              <circle cx="108" cy="100" r="3" fill="#1E293B" />
              <circle cx="132" cy="100" r="3" fill="#1E293B" />
              <path d="M 132 100 L 126 108" stroke="#1E293B" strokeWidth="1.5" />
            </g>
          ) : (
            /* Empty Desk Avatar Placeholder */
            <g opacity="0.4">
              <circle cx="120" cy="112" r="10" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M 105 130 Q 120 120 135 130" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
            </g>
          )}
        </svg>
      </Box>

      {/* 👤 OCCUPANT CARD / BADGE FOOTER */}
      <Box sx={{ width: '100%', mt: 1, pt: 1.2, borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: isOccupied ? (isAlert ? '#DC2626' : '#1A1A2E') : '#94A3B8',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.8rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
          >
            {isOccupied ? desk.user.charAt(0) : '?'}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '0.85rem' }}>
              {desk.user}
            </Typography>
            <Typography noWrap variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>
              {desk.role}
            </Typography>
          </Box>
        </Box>

        <Button
          size="small"
          variant="outlined"
          sx={{
            minWidth: 0,
            px: 1.2,
            py: 0.3,
            borderRadius: 2,
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'none',
            color: '#1A1A2E',
            borderColor: '#CBD5E1',
            '&:hover': { bgcolor: '#F1F5F9', borderColor: '#E31E24' }
          }}
        >
          Fiche 360°
        </Button>
      </Box>
    </Box>
  );
};

export default function VisualFleetMap({
  equipments = [],
  departments = [],
  assignments = [],
  onOpenDetails,
  onOpenQr,
  onAssignDesk,
  onSignPV,
  onDownloadPV,
  onReturnEquipment
}: VisualFleetMapProps) {
  const [selectedSite, setSelectedSite] = useState<SiteType>('SIEGE_CASA');
  const [selectedDesk, setSelectedDesk] = useState<any>(null);
  const [deskModalOpen, setDeskModalOpen] = useState(false);

  // Group equipments by department / user keywords for dynamic floor mapping
  const findEquipmentsForDesk = (deskUser: string, deptKey: string) => {
    // Check if we have assignments for this user
    const directAssignments = assignments.filter(a => {
      const uName = a.assignedTo ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}`.toLowerCase() : '';
      return uName.includes(deskUser.toLowerCase().split(' ')[0]);
    });

    if (directAssignments.length > 0) {
      return directAssignments.map(a => ({
        ...a.equipment,
        assignment: a,
        hasSignature: a.signatures && a.signatures.length > 0
      }));
    }

    // Fallback to department matching
    return equipments.filter(eq => {
      const deptName = (eq.department?.name || eq.assignments?.[0]?.assignedTo?.department?.name || '').toLowerCase();
      return deptName.includes(deptKey.toLowerCase());
    }).slice(0, 2);
  };

  const getDeskHealth = (eqList: any[]) => {
    if (eqList.length === 0) return { status: 'EMPTY', label: 'Poste Libre', color: '#94A3B8', bg: '#F8FAFC', border: '#E2E8F0' };
    const hasMaintenance = eqList.some(e => e.status === 'MAINTENANCE');
    if (hasMaintenance) return { status: 'ALERT', label: 'Incident Actif', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' };
    return { status: 'OK', label: 'Conforme & Actif', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' };
  };

  // Pre-configured zones for Siège Casablanca
  const siegeZones = [
    {
      id: 'dir',
      title: 'Direction Générale & Cadres',
      icon: <BusinessIcon sx={{ color: '#E31E24' }} />,
      deptKey: 'Direction',
      desks: [
        { id: 'DIR-01', label: 'Bureau DG (Philippe Durand)', user: 'Philippe Durand', role: 'Directeur Général', dept: 'Direction Générale' },
        { id: 'DIR-02', label: 'Bureau Secrétariat Général', user: 'Fatima Zohra', role: 'Assistante DSI', dept: 'Direction Générale' },
      ]
    },
    {
      id: 'it',
      title: 'Pôle DSI & Support Technique IT',
      icon: <StorageIcon sx={{ color: '#2563EB' }} />,
      deptKey: 'Information',
      desks: [
        { id: 'IT-01', label: 'Poste Responsable DSI', user: 'Ahmed Benali', role: 'Administrateur DSI', dept: 'Systèmes d\'Information' },
        { id: 'IT-02', label: 'Poste Support IT #1', user: 'Karim Tazi', role: 'Technicien Support', dept: 'Systèmes d\'Information' },
        { id: 'IT-03', label: 'Poste Support IT #2', user: 'Yassine Mansouri', role: 'Technicien Réseau', dept: 'Systèmes d\'Information' },
        { id: 'IT-04', label: 'Banc de Test & Diagnostic', user: 'Poste Atelier', role: 'Atelier Hardware', dept: 'Systèmes d\'Information' },
      ]
    },
    {
      id: 'fin',
      title: 'Pôle Administratif, RH & Finance',
      icon: <VerifiedIcon sx={{ color: '#059669' }} />,
      deptKey: 'Finance',
      desks: [
        { id: 'FIN-01', label: 'Poste Chef Comptable', user: 'Sara Alami', role: 'Responsable Comptabilité', dept: 'Finance & Comptabilité' },
        { id: 'FIN-02', label: 'Poste Contrôle de Gestion', user: 'Mehdi Bennani', role: 'Contrôleur de Gestion', dept: 'Finance & Comptabilité' },
        { id: 'RH-01', label: 'Poste Ressources Humaines', user: 'Nadia Idrissi', role: 'Responsable RH', dept: 'Ressources Humaines' },
        { id: 'RH-02', label: 'Poste Recrutement & Paie', user: 'Hassan Berrada', role: 'Chargé RH', dept: 'Ressources Humaines' },
      ]
    },
    {
      id: 'log',
      title: 'Pôle Exploitation Logistique & Dispatch',
      icon: <ShippingIcon sx={{ color: '#D97706' }} />,
      deptKey: 'Logistique',
      desks: [
        { id: 'LOG-01', label: 'Poste Dispatching Express', user: 'Omar El Amrani', role: 'Chef Dispatcher', dept: 'Exploitation Logistique' },
        { id: 'LOG-02', label: 'Poste Suivi Flotte & Livraisons', user: 'Rachid Chaoui', role: 'Coordinateur Flotte', dept: 'Exploitation Logistique' },
        { id: 'LOG-03', label: 'Poste Service Client & Réclamations', user: 'Salma Ouazzani', role: 'Opératrice SAV', dept: 'Exploitation Logistique' },
        { id: 'LOG-04', label: 'Poste Accueil Chauffeurs', user: 'Guichet Tournées', role: 'Agent d\'Accueil', dept: 'Exploitation Logistique' },
      ]
    }
  ];

  // Pre-configured zones for Hub Logistique Nouaceur
  const hubZones = [
    {
      id: 'quay',
      title: 'Quais de Chargement & Réception Colis',
      icon: <ShippingIcon sx={{ color: '#D97706' }} />,
      deptKey: 'Logistique',
      desks: [
        { id: 'HUB-Q1', label: 'Poste Terminal Quai A (Nord)', user: 'Terminal Durci #1', role: 'Réception Colis', dept: 'Exploitation Logistique' },
        { id: 'HUB-Q2', label: 'Poste Terminal Quai B (Sud)', user: 'Terminal Durci #2', role: 'Chargement Camions', dept: 'Exploitation Logistique' },
        { id: 'HUB-TRI', label: 'Poste Ligne de Tri Automatisée', user: 'Scanner Haute Cadence', role: 'Tri National', dept: 'Exploitation Logistique' },
      ]
    },
    {
      id: 'hub_admin',
      title: 'Bureau Exploitation & Sécurité Hub',
      icon: <BusinessIcon sx={{ color: '#2563EB' }} />,
      deptKey: 'Logistique',
      desks: [
        { id: 'HUB-CHEF', label: 'Bureau Chef d\'Exploitation Hub', user: 'Mustapha Radi', role: 'Directeur Hub', dept: 'Exploitation Logistique' },
        { id: 'HUB-SEC', label: 'Poste PC Sécurité & Vidéosurveillance', user: 'Poste Surveillance 24/7', role: 'Sécurité Site', dept: 'Exploitation Logistique' },
      ]
    }
  ];

  // Pre-configured Datacenter Server Rack
  const rackUnits = [
    { u: '42U', name: 'Onduleur Principal APC Smart-UPS 3000VA', type: 'POWER', ip: '192.168.1.250' },
    { u: '40U', name: 'Serveur NAS Synology RackStation (Sauvegardes DSI)', type: 'STORAGE', ip: '192.168.1.200' },
    { u: '38U', name: 'Serveur de Virtualisation Dell PowerEdge R740', type: 'SERVER', ip: '192.168.1.10' },
    { u: '36U', name: 'Switch de Cœur Cisco Catalyst 48 Ports PoE (Étage 1 & 2)', type: 'SWITCH', ip: '192.168.1.2' },
    { u: '34U', name: 'Switch de Distribution Baie DSI & WiFi Ubiquiti UniFi', type: 'SWITCH', ip: '192.168.1.3' },
    { u: '32U', name: 'Firewall Fortinet FortiGate 100F (VPN & Sécurité)', type: 'ROUTER', ip: '192.168.1.1' },
    { u: '30U', name: 'Routeur Fibre Optique Maroc Telecom Pro (SD-WAN)', type: 'ROUTER', ip: '192.168.1.254' },
    { u: '24U', name: 'Panneau de Brassage RJ45 Cat6A (48 Ports)', type: 'PATCH', ip: '-' },
    { u: '20U', name: 'Tiroir Optique 24 Fibres (Liaison Hub & Agences)', type: 'FIBER', ip: '-' },
    { u: '12U', name: 'Onduleur Secondaire Redondant Eaton 1500VA', type: 'POWER', ip: '192.168.1.251' }
  ];

  const currentZones = selectedSite === 'SIEGE_CASA' ? siegeZones : selectedSite === 'HUB_LOGISTIQUE' ? hubZones : [];

  const handleDeskClick = (desk: any, deptKey: string) => {
    const matchedEquipments = findEquipmentsForDesk(desk.user, deptKey);
    setSelectedDesk({
      ...desk,
      equipments: matchedEquipments,
      health: getDeskHealth(matchedEquipments)
    });
    setDeskModalOpen(true);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        p: { xs: 2, md: 3 }
      }}
    >
      {/* 🌟 Top Navigation Bar & Site Selector 🌟 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#E31E24', width: 50, height: 50, boxShadow: '0 4px 14px rgba(227, 30, 36, 0.35)' }}>
            <LocationIcon />
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#1A1A2E', lineHeight: 1.2 }}>
                Visual Fleet Map • Vue Physique des Bureaux & Personnes
              </Typography>
              <Chip label="Jumeau Numérique 2D Réaliste" size="small" sx={{ fontWeight: 800, bgcolor: '#EFF6FF', color: '#2563EB', fontSize: '0.68rem' }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              Représentation fidèle des postes de travail physiques, chaises ergonomiques, ordinateurs installés et personnes assises.
            </Typography>
          </Box>
        </Box>

        {/* Site Switcher Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {[
            { id: 'SIEGE_CASA' as SiteType, label: 'Siège Casablanca (Bureaux)', icon: <BusinessIcon sx={{ fontSize: 16 }} /> },
            { id: 'HUB_LOGISTIQUE' as SiteType, label: 'Hub Logistique Nouaceur', icon: <ShippingIcon sx={{ fontSize: 16 }} /> },
            { id: 'DATACENTER' as SiteType, label: 'Baie Serveurs 42U (DSI)', icon: <StorageIcon sx={{ fontSize: 16 }} /> },
          ].map((site) => (
            <Button
              key={site.id}
              variant={selectedSite === site.id ? 'contained' : 'outlined'}
              onClick={() => setSelectedSite(site.id)}
              startIcon={site.icon}
              sx={{
                fontWeight: 800,
                fontSize: '0.8rem',
                textTransform: 'none',
                borderRadius: 2.5,
                px: 2,
                bgcolor: selectedSite === site.id ? '#1A1A2E' : '#FFFFFF',
                color: selectedSite === site.id ? '#FFFFFF' : '#475569',
                borderColor: '#CBD5E1',
                '&:hover': { bgcolor: selectedSite === site.id ? '#1A1A2E' : '#F8FAFC' }
              }}
            >
              {site.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* 🗺️ Interactive Floor Plan Layout 🗺️ */}
      {selectedSite === 'DATACENTER' ? (
        /* ================= 🗄️ VUE RACK DATACENTER 42U ================= */
        <Box sx={{ bgcolor: '#0D0F1D', p: { xs: 2, md: 4 }, borderRadius: 3.5, color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFFFFF' }}>
                🗄️ Baie de Brassage Principale DSI • 42U Server Rack
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Salle Technique Datacenter • Climatisation 19°C • Alimentation Ondulée Double Ligne
              </Typography>
            </Box>
            <Chip label="● 100% Opérationnel • Zéro Coupure" size="small" sx={{ fontWeight: 800, bgcolor: 'rgba(5,150,105,0.25)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.5)' }} />
          </Box>

          <Box sx={{ maxWidth: 850, mx: 'auto', bgcolor: '#16192E', p: 3, borderRadius: 3, border: '2px solid #2D3748', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {rackUnits.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1.8,
                    borderRadius: 2,
                    bgcolor: '#1E243D',
                    border: '1px solid #333C61',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#262E4E', borderColor: '#0284C7', transform: 'translateX(4px)' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip label={item.u} size="small" sx={{ bgcolor: '#0F1322', color: '#94A3B8', fontWeight: 900, fontFamily: 'monospace', fontSize: '0.75rem' }} />
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(2,132,199,0.2)', color: '#38BDF8' }}>
                      <RouterIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#F8FAFC' }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace' }}>
                        IP: {item.ip}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
                      <Typography variant="caption" sx={{ color: '#4ADE80', fontWeight: 800 }}>En Ligne</Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            bgcolor: '#F8FAFC',
            p: { xs: 2, md: 3 },
            borderRadius: 3.5,
            border: '1px solid #E2E8F0',
            backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        >
          {/* ↔️ Horizontal Scroll Floor Plan Layout ↔️ */}
          <Box
            sx={{
              display: 'flex',
              gap: 3.5,
              overflowX: 'auto',
              pb: 2.5,
              pt: 0.5,
              px: 0.5,
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': { height: 9 },
              '&::-webkit-scrollbar-track': { bgcolor: '#F1F5F9', borderRadius: 6, border: '1px solid #E2E8F0' },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 6, '&:hover': { bgcolor: '#94A3B8' } }
            }}
          >
            {currentZones.map((zone) => {
              return (
                <Paper
                  key={zone.id}
                  elevation={0}
                  sx={{
                    flex: '0 0 auto',
                    minWidth: { xs: 320, sm: 460, md: 520 },
                    maxWidth: 580,
                    p: 2.5,
                    borderRadius: 3.5,
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Zone Header with Department Badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, pb: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: '#F8FAFC', width: 38, height: 38, border: '1px solid #E2E8F0' }}>
                        {zone.icon}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '0.95rem', lineHeight: 1.2 }}>
                          {zone.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Espace de travail collaboratif Cathedis
                        </Typography>
                      </Box>
                    </Box>
                    <Chip label={`${zone.desks.length} Bureaux`} size="small" sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: '#F1F5F9', color: '#1E293B' }} />
                  </Box>

                  {/* Physical Desks Grid in this Zone */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                    {zone.desks.map((desk) => {
                      const matchedEq = findEquipmentsForDesk(desk.user, zone.deptKey);
                      const health = getDeskHealth(matchedEq);

                      return (
                        <RealisticWorkstation
                          key={desk.id}
                          desk={desk}
                          health={health}
                          equipments={matchedEq}
                          onClick={() => handleDeskClick(desk, zone.deptKey)}
                        />
                      );
                    })}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>
      )}

      {/* 🔍 360° DESK INSPECTOR MODAL 🔍 */}
      <Dialog
        open={deskModalOpen}
        onClose={() => setDeskModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        {selectedDesk && (
          <>
            <DialogTitle sx={{
              background: 'linear-gradient(135deg, #0D0F1D 0%, #1A1A2E 45%, #7B0000 100%)',
              color: '#FFFFFF',
              p: 2.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: '#E31E24', color: '#FFFFFF' }}>
                  <LocationIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2 }}>
                    Poste de Travail #{selectedDesk.id}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {selectedDesk.label}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setDeskModalOpen(false)} sx={{ color: '#FFFFFF' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, bgcolor: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              
              {/* Occupant Card */}
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: '#1A1A2E', color: '#FFFFFF', fontWeight: 900, fontSize: '1.2rem' }}>
                  {selectedDesk.user.charAt(0)}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 900, color: '#1A1A2E', fontSize: '1.05rem' }}>
                    {selectedDesk.user}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>
                    {selectedDesk.role} • {selectedDesk.dept}
                  </Typography>
                  <Chip
                    label={selectedDesk.health.label}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.68rem', mt: 0.5, bgcolor: selectedDesk.health.bg, color: selectedDesk.health.color }}
                  />
                </Box>
              </Paper>

              {/* Hardware on this Desk */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                  Équipements Physiques Installés :
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {selectedDesk.equipments && selectedDesk.equipments.length > 0 ? (
                    selectedDesk.equipments.map((eq: any) => (
                      <Paper
                        key={eq.id}
                        elevation={0}
                        sx={{
                          p: 1.8,
                          borderRadius: 2,
                          border: '1px solid #E2E8F0',
                          bgcolor: '#FFFFFF',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: '#EFF6FF', color: '#2563EB' }}>
                            <LaptopIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#1A1A2E' }}>
                              {eq.name}
                            </Typography>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748B', display: 'block' }}>
                              SN: {eq.serialNumber || '-'}
                            </Typography>
                            {eq.assignment && (
                              <Chip
                                label={eq.hasSignature ? '✓ PV Signé' : '⏳ En attente de signature'}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  bgcolor: eq.hasSignature ? '#ECFDF5' : '#FFFBEB',
                                  color: eq.hasSignature ? '#059669' : '#D97706',
                                  mt: 0.3
                                }}
                              />
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 0.8 }}>
                          {eq.assignment && onDownloadPV && (
                            <Tooltip title="Télécharger PV PDF">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDeskModalOpen(false);
                                  onDownloadPV(eq.assignment);
                                }}
                                sx={{ color: '#E31E24', bgcolor: '#FFF5F5' }}
                              >
                                <PdfIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {eq.assignment && !eq.hasSignature && onSignPV && (
                            <Tooltip title="Signer le PV">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDeskModalOpen(false);
                                  onSignPV(eq.assignment);
                                }}
                                sx={{ color: '#059669', bgcolor: '#ECFDF5' }}
                              >
                                <DrawIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {onOpenDetails && (
                            <Button
                              size="small"
                              onClick={() => {
                                setDeskModalOpen(false);
                                onOpenDetails(eq);
                              }}
                              sx={{ fontWeight: 800, fontSize: '0.72rem', textTransform: 'none' }}
                            >
                              Fiche
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    ))
                  ) : (
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                      <LaptopIcon sx={{ fontSize: 32, color: '#CBD5E1', mb: 0.5 }} />
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>
                        Aucun matériel affecté pour l'instant.
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Box>

            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
              <Button onClick={() => setDeskModalOpen(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700, color: '#64748B' }}>
                Fermer
              </Button>
              {onAssignDesk && (
                <Button
                  variant="contained"
                  onClick={() => {
                    setDeskModalOpen(false);
                    onAssignDesk(selectedDesk);
                  }}
                  startIcon={<AddIcon />}
                  sx={{
                    background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                    color: '#FFFFFF',
                    borderRadius: 2,
                    fontWeight: 800,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(227, 30, 36, 0.4)'
                  }}
                >
                  + Affecter un Matériel sur ce Poste
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

    </Paper>
  );
}
