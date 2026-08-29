'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Box, Typography, Paper, Chip, Avatar, Skeleton, Button, IconButton,
  Divider, Tooltip
} from '@mui/material';
import {
  Computer as ComputerIcon,
  LaptopMac as LaptopIcon,
  DesktopWindows as MonitorIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  SwapHoriz as SwapHorizIcon,
  FlashOn as FlashIcon,
  Draw as DrawIcon,
  ArrowForward as ArrowForwardIcon,
  Shield as ShieldIcon,
  QrCode2 as QrCodeIcon,
  Speed as SpeedIcon,
  AssignmentTurnedIn as AssignmentIcon,
  LocalShipping as LocalShippingIcon,
  Info as InfoIcon,
  AutoAwesome as SparklesIcon,
  Psychology as BrainIcon
} from '@mui/icons-material';
import AIDiagnosticModal from '@/components/shared/AIDiagnosticModal';

const movementLabels: Record<string, { label: string; color: string; bg: string }> = {
  PURCHASE: { label: 'Achat', color: '#059669', bg: '#ECFDF5' },
  ASSIGNMENT: { label: 'Affectation', color: '#2563EB', bg: '#EFF6FF' },
  RETURN: { label: 'Restitution', color: '#0284C7', bg: '#E0F2FE' },
  TRANSFER: { label: 'Transfert', color: '#D97706', bg: '#FFFBEB' },
  MAINTENANCE: { label: 'Maintenance', color: '#7C3AED', bg: '#F5F3FF' },
  DECOMMISSION: { label: 'Réforme', color: '#DC2626', bg: '#FEF2F2' },
};

const statusColors: Record<string, { label: string; color: string; bg: string; border: string }> = {
  AVAILABLE: { label: 'Disponible', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  ASSIGNED: { label: 'Affecté', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  MAINTENANCE: { label: 'Maintenance', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  DECOMMISSIONED: { label: 'Déclassé', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

const ticketStatusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  REPORTED: { label: 'Signalé', color: '#D97706', bgColor: '#FEF3C7' },
  ASSIGNED: { label: 'Pris en charge', color: '#2563EB', bgColor: '#DBEAFE' },
  IN_PROGRESS: { label: 'En cours', color: '#7C3AED', bgColor: '#F5F3FF' },
  COMPLETED: { label: 'Résolu', color: '#059669', bgColor: '#D1FAE5' },
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  LOW: { label: 'Basse', color: '#0284C7', bgColor: '#E0F2FE', icon: '🟢' },
  MEDIUM: { label: 'Moyenne', color: '#D97706', bgColor: '#FEF3C7', icon: '🟠' },
  HIGH: { label: 'Haute', color: '#EA580C', bgColor: '#FFEDD5', icon: '🔴' },
  CRITICAL: { label: 'Critique', color: '#DC2626', bgColor: '#FEE2E2', icon: '⚡' },
};

export default function EmployeeDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/employee-stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching employee dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  const getEquipmentIcon = (categoryName?: string) => {
    const cat = categoryName?.toLowerCase() || '';
    if (cat.includes('laptop') || cat.includes('portable')) return <LaptopIcon sx={{ fontSize: 22, color: '#E31E24' }} />;
    if (cat.includes('écran') || cat.includes('ecran') || cat.includes('moniteur')) return <MonitorIcon sx={{ fontSize: 22, color: '#E31E24' }} />;
    return <ComputerIcon sx={{ fontSize: 22, color: '#E31E24' }} />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 1.5, md: 3 } }}>
        <Skeleton variant="rounded" height={160} sx={{ borderRadius: 4 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={110} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
          <Skeleton variant="rounded" height={340} sx={{ borderRadius: 4 }} />
          <Skeleton variant="rounded" height={340} sx={{ borderRadius: 4 }} />
        </Box>
      </Box>
    );
  }

  const myEquipments = stats?.myEquipments || [];
  const recentMaintenances = stats?.recentMaintenances || [];
  const recentMovements = stats?.recentMovements || [];
  const kpis = stats?.stats || {};

  const signedCount = myEquipments.filter((e: any) => e.signatures && e.signatures.length > 0).length;

  const kpiCards = [
    {
      title: 'Mes Équipements',
      value: kpis.totalEquipments || myEquipments.length || 0,
      icon: <ComputerIcon sx={{ fontSize: 26 }} />,
      color: '#2563EB',
      gradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
      subtext: 'Matériels actifs affectés',
      link: '/dashboard/employee/mes-equipements'
    },
    {
      title: 'PV Numériques Signés',
      value: `${signedCount} / ${myEquipments.length}`,
      icon: <DrawIcon sx={{ fontSize: 26 }} />,
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      subtext: 'Décharges enregistrées',
      link: '/dashboard/employee/mes-equipements'
    },
    {
      title: 'Tickets en Cours',
      value: kpis.pendingMaintenances || 0,
      icon: <BuildIcon sx={{ fontSize: 26 }} />,
      color: '#D97706',
      gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
      subtext: 'Pannes en traitement',
      link: '/dashboard/employee/mes-tickets'
    },
    {
      title: 'Incidents Résolus',
      value: kpis.completedMaintenances || 0,
      icon: <CheckCircleIcon sx={{ fontSize: 26 }} />,
      color: '#E31E24',
      gradient: 'linear-gradient(135deg, #E31E24 0%, #C41018 100%)',
      subtext: 'Réparations terminées',
      link: '/dashboard/employee/mes-tickets'
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
      
      {/* 1. Hero Banner */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1A1A2E 0%, #2A1B28 50%, #7B0000 100%)',
        borderRadius: 4,
        p: { xs: 3, md: 4 },
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(227, 30, 36, 0.15)',
        border: '1px solid rgba(227, 30, 36, 0.25)',
      }}>
        {/* Glow Spheres */}
        <Box sx={{ position: 'absolute', top: -50, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.35) 0%, rgba(227,30,36,0) 70%)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: 200, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ maxWidth: 650 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.8, py: 0.6, borderRadius: 10, bgcolor: 'rgba(227, 30, 36, 0.25)', border: '1px solid rgba(227, 30, 36, 0.5)', mb: 1.5 }}>
              <ShieldIcon sx={{ fontSize: 16, color: '#FF8A80' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFCDD2', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Espace Personnel Collaborateur • Cathedis
              </Typography>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', fontSize: { xs: '1.6rem', md: '2.1rem' }, letterSpacing: '-0.02em', mb: 1 }}>
              Bonjour, {session?.user?.name || 'Collaborateur'} 👋
            </Typography>

            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — Bienvenue sur votre tableau de bord du parc informatique.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/dashboard/employee/demandes"
              variant="contained"
              startIcon={<FlashIcon />}
              sx={{
                background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                color: '#FFFFFF',
                borderRadius: 3,
                px: 3,
                py: 1.2,
                fontWeight: 800,
                fontSize: '0.9rem',
                textTransform: 'none',
                boxShadow: '0 6px 20px rgba(227, 30, 36, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #C41018 0%, #E31E24 100%)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Demander du Matériel
            </Button>

            <Button
              component={Link}
              href="/dashboard/employee/mes-equipements"
              variant="outlined"
              sx={{
                color: '#FFFFFF',
                borderColor: 'rgba(255,255,255,0.4)',
                bgcolor: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                px: 2.5,
                py: 1.2,
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#FFFFFF',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Mes Équipements & PV
            </Button>
          </Box>
        </Box>
      </Box>

      {/* 2. KPI Cards Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {kpiCards.map((card, idx) => (
          <Paper
            key={idx}
            component={Link}
            href={card.link}
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
                borderColor: card.color,
              }
            }}
          >
            <Box sx={{ height: 4, position: 'absolute', top: 0, left: 0, right: 0, background: card.gradient }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  {card.title}
                </Typography>
                <Typography sx={{ fontSize: '1.9rem', fontWeight: 900, color: '#1A1A2E', lineHeight: 1.2, mt: 0.5 }}>
                  {card.value}
                </Typography>
              </Box>

              <Avatar sx={{ width: 46, height: 46, background: card.gradient, color: '#FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {card.icon}
              </Avatar>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #F1F5F9' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                {card.subtext}
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: 16, color: card.color }} />
            </Box>
          </Paper>
        ))}
      </Box>

      {/* 3. Main Two-Column Layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.7fr 1fr' }, gap: 3 }}>
        
        {/* Left Column: My Equipment Summary */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3.5,
            p: { xs: 2.5, md: 3 },
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(227,30,36,0.08)' }}>
                  <ComputerIcon sx={{ color: '#E31E24', fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A1A2E' }}>
                    Mes Équipements Actifs
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Matériel actuellement sous votre responsabilité
                  </Typography>
                </Box>
              </Box>

              <Button
                component={Link}
                href="/dashboard/employee/mes-equipements"
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{ textTransform: 'none', fontWeight: 800, color: '#E31E24' }}
              >
                Tout voir
              </Button>
            </Box>

            {myEquipments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5, bgcolor: '#F8FAFC', borderRadius: 3, border: '2px dashed #E2E8F0' }}>
                <ComputerIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1 }} />
                <Typography sx={{ fontWeight: 700, color: '#64748B' }}>Aucun équipement affecté</Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Faites une demande pour obtenir votre matériel</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {myEquipments.slice(0, 4).map((eq: any, idx: number) => {
                  const st = statusColors[eq.status] || statusColors.ASSIGNED;
                  const isSigned = eq.signatures && eq.signatures.length > 0;

                  return (
                    <Box
                      key={eq.id || idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: '#F8FAFC',
                        border: '1px solid #F1F5F9',
                        borderLeft: `4px solid #E31E24`,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: '#FFFFFF',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                          transform: 'translateX(3px)',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                          {getEquipmentIcon(eq.category)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '0.95rem' }}>
                            {eq.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                            <Chip
                              label={eq.category || 'Matériel'}
                              size="small"
                              sx={{ fontSize: '0.68rem', fontWeight: 700, height: 20, bgcolor: '#EFF6FF', color: '#2563EB' }}
                            />
                            <Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748B' }}>
                              SN: {eq.serialNumber || '-'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        {isSigned ? (
                          <Chip
                            label="PV Signé ✓"
                            size="small"
                            sx={{ fontSize: '0.68rem', fontWeight: 800, bgcolor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}
                          />
                        ) : (
                          <Chip
                            label="PV à Signer ✍️"
                            size="small"
                            sx={{ fontSize: '0.68rem', fontWeight: 800, bgcolor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}
                          />
                        )}
                        {eq.assignedAt && (
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                            Depuis le {formatDate(eq.assignedAt)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Paper>

        {/* Right Column: Recent Activities & Movements */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3.5,
            p: { xs: 2.5, md: 3 },
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(37, 99, 235, 0.08)' }}>
                <SwapHorizIcon sx={{ color: '#2563EB', fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A1A2E' }}>
                  Activités Récentes
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Historique de vos dotations et transferts
                </Typography>
              </Box>
            </Box>

            {recentMovements.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5, bgcolor: '#F8FAFC', borderRadius: 3, border: '2px dashed #E2E8F0' }}>
                <SwapHorizIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
                <Typography sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.85rem' }}>Aucun mouvement récent</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {recentMovements.slice(0, 5).map((m: any, idx: number) => {
                  const ml = movementLabels[m.type] || { label: m.type, color: '#64748B', bg: '#F8FAFC' };

                  return (
                    <Box
                      key={m.id || idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#F8FAFC',
                        border: '1px solid #F1F5F9',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: ml.color, flexShrink: 0 }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Chip
                            label={ml.label}
                            size="small"
                            sx={{ fontSize: '0.68rem', fontWeight: 800, height: 20, bgcolor: ml.bg, color: ml.color }}
                          />
                          <Typography noWrap sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', mt: 0.3 }}>
                            {m.equipmentName}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem', flexShrink: 0, ml: 1 }}>
                        {formatDate(m.createdAt)}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* 4. Maintenance Tickets Section */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3.5,
          p: { xs: 2.5, md: 3 },
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(217, 119, 6, 0.08)' }}>
              <BuildIcon sx={{ color: '#D97706', fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A1A2E' }}>
                Mes Tickets de Support & Pannes
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Suivi des incidents et réparations de votre matériel
              </Typography>
            </Box>
          </Box>

          <Button
            component={Link}
            href="/dashboard/employee/mes-tickets"
            size="small"
            endIcon={<ArrowForwardIcon />}
            sx={{ textTransform: 'none', fontWeight: 800, color: '#E31E24' }}
          >
            Tous les tickets
          </Button>
        </Box>

        {recentMaintenances.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#F8FAFC', borderRadius: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 44, color: '#059669', mb: 1, opacity: 0.7 }} />
            <Typography sx={{ fontWeight: 800, color: '#1A1A2E' }}>Parc 100% Opérationnel !</Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>Aucun incident de maintenance en cours sur vos appareils.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            {recentMaintenances.slice(0, 4).map((t: any, idx: number) => {
              const sc = ticketStatusConfig[t.status] || ticketStatusConfig.REPORTED;
              const pc = priorityConfig[t.priority] || priorityConfig.MEDIUM;

              return (
                <Paper
                  key={t.id || idx}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderLeft: `4px solid ${sc.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.92rem', fontWeight: 800, color: '#1A1A2E' }}>
                        {t.equipmentName}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Chip label={sc.label} size="small" sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: sc.bgColor, color: sc.color }} />
                        <Chip label={`${pc.icon} ${pc.label}`} size="small" sx={{ fontWeight: 700, fontSize: '0.68rem', bgcolor: pc.bgColor, color: pc.color }} />
                      </Box>
                    </Box>

                    {t.description && (
                      <Typography sx={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4, mb: 1 }}>
                        {t.description}
                      </Typography>
                    )}
                  </Box>

                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon sx={{ fontSize: 13 }} />
                    Signalé le {formatDate(t.createdAt)}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        )}
      </Paper>
      {/* 🤖 AI Diagnostic Modal */}
      <AIDiagnosticModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        equipments={myEquipments.map((eq: any) => ({
          id: eq.id,
          name: eq.name,
          serialNumber: eq.serialNumber,
          category: eq.category,
        }))}
        userId={session?.user?.id}
        onTicketCreated={() => {
          fetchStats();
        }}
      />
    </Box>
  );
}
