'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Chip,
  Avatar,
  LinearProgress,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  Computer as ComputerIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  TrendingUp as TrendingUpIcon,
  WarningAmber as WarningAmberIcon,
  Security as SecurityIcon,
  Inventory as InventoryIcon,
  SwapHoriz as SwapHorizIcon,
  CheckCircle as CheckCircleIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  LocalShipping as LocalShippingIcon,
  ArrowForward as ArrowForwardIcon,
  MonetizationOn as MoneyIcon,
  Add as AddIcon,
  AutoAwesome as SparklesIcon,
  QrCode2 as QrCodeIcon,
  Speed as SpeedIcon,
  Shield as ShieldIcon,
  Error as CriticalIcon,
  Layers as LayersIcon,
  Psychology as BrainIcon,
  LaptopMac as LaptopIcon,
  DesktopWindows as MonitorIcon,
  History as HistoryIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';

const CHART_COLORS = ['#059669', '#2563EB', '#D97706', '#DC2626', '#7C3AED', '#0284C7', '#EA580C', '#64748B'];

const movementTypeLabels: Record<string, { label: string; color: string; bg: string }> = {
  PURCHASE: { label: 'Achat', color: '#059669', bg: '#ECFDF5' },
  ASSIGNMENT: { label: 'Affectation', color: '#2563EB', bg: '#EFF6FF' },
  RETURN: { label: 'Restitution', color: '#0284C7', bg: '#E0F2FE' },
  TRANSFER: { label: 'Transfert', color: '#D97706', bg: '#FFFBEB' },
  MAINTENANCE: { label: 'Maintenance', color: '#7C3AED', bg: '#F5F3FF' },
  DECOMMISSION: { label: 'Réforme', color: '#DC2626', bg: '#FEF2F2' },
};

const maintenanceStatusLabels: Record<string, { label: string; color: string; bg: string }> = {
  REPORTED: { label: 'En attente', color: '#D97706', bg: '#FEF3C7' },
  ASSIGNED: { label: 'Assignée', color: '#2563EB', bg: '#DBEAFE' },
  IN_PROGRESS: { label: 'En cours', color: '#7C3AED', bg: '#F5F3FF' },
  COMPLETED: { label: 'Résolue', color: '#059669', bg: '#D1FAE5' },
  CANCELLED: { label: 'Annulée', color: '#64748B', bg: '#F1F5F9' },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === 'EMPLOYEE') {
      router.replace('/dashboard/employee');
    } else if (session?.user?.role === 'TECHNICIAN') {
      router.replace('/dashboard/technician');
    }
  }, [session, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(val);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
        <Skeleton variant="rounded" height={180} sx={{ borderRadius: 4 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} variant="rounded" height={130} sx={{ borderRadius: 3.5 }} />
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
          <Skeleton variant="rounded" height={360} sx={{ borderRadius: 4 }} />
          <Skeleton variant="rounded" height={360} sx={{ borderRadius: 4 }} />
        </Box>
      </Box>
    );
  }

  const kpis = stats?.kpis || {};
  const charts = stats?.charts || {};
  const maintenance = stats?.maintenance || {};
  const warranties = stats?.warranties || {};

  const availPercent = kpis.totalEquipments > 0
    ? Math.round((kpis.availableCount / kpis.totalEquipments) * 100)
    : 0;

  const assignedPercent = kpis.totalEquipments > 0
    ? Math.round((kpis.assignedCount / kpis.totalEquipments) * 100)
    : 0;

  const kpiCards = [
    {
      title: 'Parc Informatique Global',
      value: kpis.totalEquipments || 0,
      sub: `${kpis.availableCount || 0} disponibles • ${kpis.assignedCount || 0} affectés`,
      icon: <ComputerIcon sx={{ fontSize: 26 }} />,
      color: '#2563EB',
      gradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
      link: '/dashboard/equipments',
      progress: availPercent,
      progressLabel: 'Disponibilité'
    },
    {
      title: 'Dotations & Affectations',
      value: kpis.activeAssignments || 0,
      sub: `Sur ${kpis.totalUsers || 0} collaborateurs rattachés`,
      icon: <AssignmentIcon sx={{ fontSize: 26 }} />,
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      link: '/dashboard/assignments',
      progress: assignedPercent,
      progressLabel: 'Taux de déploiement'
    },
    {
      title: 'Pannes & Maintenances',
      value: kpis.maintenanceCount || 0,
      sub: `${maintenance.reported || 0} en attente • ${maintenance.inProgress || 0} en atelier`,
      icon: <BuildIcon sx={{ fontSize: 26 }} />,
      color: '#D97706',
      gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
      link: '/dashboard/maintenances',
      progress: maintenance.reported > 0 ? 100 : 0,
      progressLabel: 'SLA Support'
    },
    {
      title: 'Valorisation Totale du Parc',
      value: formatCurrency(kpis.totalValue || 0),
      sub: `Actifs matériels inventoriés`,
      icon: <MoneyIcon sx={{ fontSize: 26 }} />,
      color: '#E31E24',
      gradient: 'linear-gradient(135deg, #E31E24 0%, #C41018 100%)',
      link: '/dashboard/equipments',
      progress: 100,
      progressLabel: 'Budget maîtrisé',
      isText: true
    },
  ];

  const quickNavTiles = [
    { label: 'Utilisateurs & RBAC', count: kpis.totalUsers || 0, icon: <PeopleIcon />, color: '#2563EB', link: '/dashboard/users' },
    { label: 'Départements & Sites', count: kpis.totalDepartments || 0, icon: <BusinessIcon />, color: '#7C3AED', link: '/dashboard/departments' },
    { label: 'Familles Matérielles', count: kpis.totalCategories || 0, icon: <CategoryIcon />, color: '#D97706', link: '/dashboard/categories' },
    { label: 'Fournisseurs Agréés', count: kpis.totalSuppliers || 0, icon: <LocalShippingIcon />, color: '#059669', link: '/dashboard/suppliers' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
      
      {/* 🌟 1. GRAND MASTER HERO BANNER DSI 🌟 */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          background: 'linear-gradient(135deg, #0D0F1D 0%, #1A1A2E 40%, #7B0000 100%)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(26, 26, 46, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        {/* Glow Spheres */}
        <Box sx={{ position: 'absolute', top: -50, right: -40, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(227,30,36,0.35) 0%, rgba(227,30,36,0) 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -60, right: 260, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(37,99,235,0) 70%)', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ maxWidth: 720 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.8, py: 0.6, borderRadius: 10, bgcolor: 'rgba(227, 30, 36, 0.25)', border: '1px solid rgba(227, 30, 36, 0.5)', mb: 1.5 }}>
              <ShieldIcon sx={{ fontSize: 16, color: '#FF8A80' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFCDD2', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Centre de Commandement DSI • Cathedis IT Fleet
              </Typography>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', fontSize: { xs: '1.7rem', md: '2.3rem' }, letterSpacing: '-0.02em', mb: 1 }}>
              Bonjour, {session?.user?.name || 'Administrateur'} 👑
            </Typography>

            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — Bienvenue sur le tableau de bord exécutif du parc informatique. Supervision globale, arbitrages et alertes en direct.
            </Typography>
          </Box>

          {/* Telemetry HUD Mini Cards */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Paper elevation={0} sx={{ px: 3, py: 2, borderRadius: 3.5, bgcolor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                {kpis.totalEquipments || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700, mt: 0.5, display: 'block' }}>
                Machines Actives
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ px: 3, py: 2, borderRadius: 3.5, bgcolor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#4ADE80', lineHeight: 1 }}>
                {availPercent}%
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700, mt: 0.5, display: 'block' }}>
                Disponibilité
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Paper>

      {/* 📊 2. FOUR IMPERIAL KPI CARDS 📊 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {kpiCards.map((card, idx) => (
          <Paper
            key={idx}
            component={Link}
            href={card.link}
            elevation={0}
            sx={{
              borderRadius: 3.5,
              p: 2.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.25s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 14px 30px rgba(0,0,0,0.08)',
                borderColor: card.color,
              }
            }}
          >
            <Box sx={{ height: 4, position: 'absolute', top: 0, left: 0, right: 0, background: card.gradient }} />
            
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  {card.title}
                </Typography>
                <Avatar sx={{ width: 44, height: 44, background: card.gradient, color: '#FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
                  {card.icon}
                </Avatar>
              </Box>

              <Typography sx={{ fontSize: card.isText ? '1.55rem' : '2.1rem', fontWeight: 900, color: '#1A1A2E', lineHeight: 1.1 }}>
                {card.value}
              </Typography>

              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, mt: 0.8, display: 'block' }}>
                {card.sub}
              </Typography>
            </Box>

            <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: card.color, fontWeight: 800, fontSize: '0.75rem' }}>
                {card.progressLabel} : {card.progress}%
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: 16, color: card.color }} />
            </Box>
          </Paper>
        ))}
      </Box>

      {/* 🏢 3. QUICK SERVICE TILES (SHORTCUTS) 🏢 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {quickNavTiles.map((tile, idx) => (
          <Paper
            key={idx}
            component={Link}
            href={tile.link}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: '#F8FAFC',
                borderColor: tile.color,
                transform: 'translateX(3px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 38, height: 38, bgcolor: `${tile.color}15`, color: tile.color }}>
                {React.cloneElement(tile.icon, { sx: { fontSize: 20 } })}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#1A1A2E' }}>
                  {tile.label}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                  {tile.count} enregistrés
                </Typography>
              </Box>
            </Box>
            <ArrowForwardIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
          </Paper>
        ))}
      </Box>

      {/* 📈 4. ANALYTICS ROW 1: ACTIVITY TIMELINE & STATUS DONUT 📈 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.8fr 1fr' }, gap: 3 }}>
        
        {/* Monthly Activity Area Chart */}
        <Paper elevation={0} sx={{ borderRadius: 3.5, p: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A1A2E' }}>
                  Flux d'Activité du Parc & Maintenances
                </Typography>
                <Chip label="Derniers 6 Mois" size="small" sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: '#EFF6FF', color: '#2563EB' }} />
              </Box>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Entrées en stock vs interventions techniques clôturées
              </Typography>
            </Box>
            <TrendingUpIcon sx={{ color: '#E31E24' }} />
          </Box>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={charts.monthlyData || []}>
              <defs>
                <linearGradient id="colorEquip" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMaint" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E31E24" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#E31E24" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} allowDecimals={false} />
              <RechartsTooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
              <Legend />
              <Area type="monotone" dataKey="equipments" name="Nouvelles Acquisitions" stroke="#2563EB" fill="url(#colorEquip)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="maintenances" name="Maintenances Réalisées" stroke="#E31E24" fill="url(#colorMaint)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>

        {/* Status Distribution Donut */}
        <Paper elevation={0} sx={{ borderRadius: 3.5, p: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A1A2E' }}>
              Répartition par Statut
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              État opérationnel des équipements
            </Typography>
          </Box>

          <Box sx={{ height: 210, width: '100%', my: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusData || []}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts.statusData || []).map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {(charts.statusData || []).map((entry: any, idx: number) => (
              <Chip
                key={idx}
                label={`${entry.name} : ${entry.value}`}
                size="small"
                sx={{ bgcolor: `${entry.color}15`, color: entry.color, fontWeight: 800, fontSize: '0.72rem', border: `1px solid ${entry.color}30` }}
              />
            ))}
          </Box>
        </Paper>

      </Box>

      {/* 📊 5. ANALYTICS ROW 2: CATEGORY DENSITY & WATCHTOWER ALERTS 📊 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        
        {/* Category Breakdown Horizontal Bar Chart */}
        <Paper elevation={0} sx={{ borderRadius: 3.5, p: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A1A2E' }}>
                Densité Matérielle par Catégorie
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Typologies de machines en parc
              </Typography>
            </Box>
            <CategoryIcon sx={{ color: '#2563EB' }} />
          </Box>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.categoryData || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#1E293B', fontWeight: 600 }} width={130} />
              <RechartsTooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
              <Bar dataKey="value" name="Nombre d'appareils" radius={[0, 8, 8, 0]} barSize={22}>
                {(charts.categoryData || []).map((_: any, index: number) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Watchtower Security & Warranties Center */}
        <Paper elevation={0} sx={{ borderRadius: 3.5, p: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#FEF2F2', color: '#DC2626' }}>
                  <ShieldIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A1A2E' }}>
                  Centre de Veille & Alertes SLA
                </Typography>
              </Box>
              <Chip label="Surveillance Active" size="small" sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: '#ECFDF5', color: '#059669' }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Maintenance Alert */}
              {maintenance.reported > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.8, borderRadius: 2.5, bgcolor: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <WarningAmberIcon sx={{ color: '#D97706' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#B45309' }}>
                      {maintenance.reported} incident(s) en attente d'attribution IT
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#D97706' }}>
                      Nécessite la prise en charge par un technicien
                    </Typography>
                  </Box>
                  <Button component={Link} href="/dashboard/maintenances" size="small" sx={{ fontWeight: 800, color: '#B45309', textTransform: 'none' }}>
                    Traiter ➔
                  </Button>
                </Box>
              ) : null}

              {/* Warranty Expiry */}
              {warranties.expiring > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.8, borderRadius: 2.5, bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <SecurityIcon sx={{ color: '#DC2626' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#991B1B' }}>
                      {warranties.expiring} garantie(s) expirent sous 30 jours
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#DC2626' }}>
                      Penser au renouvellement constructeur
                    </Typography>
                  </Box>
                  <Button component={Link} href="/dashboard/warranties" size="small" sx={{ fontWeight: 800, color: '#991B1B', textTransform: 'none' }}>
                    Voir ➔
                  </Button>
                </Box>
              ) : null}

              {/* All clear fallback */}
              {maintenance.reported === 0 && warranties.expiring === 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2.5, borderRadius: 2.5, bgcolor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                  <CheckCircleIcon sx={{ color: '#059669', fontSize: 28 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#065F46' }}>
                      Parc 100% Conforme & Opérationnel !
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#047857' }}>
                      Aucune alerte critique ou rupture de SLA en cours.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Maintenance Progress Jauges */}
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #F1F5F9' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 1 }}>
              Avancement des Résolutions :
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, textAlign: 'center' }}>
              <Paper elevation={0} sx={{ p: 1, borderRadius: 2, bgcolor: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <Typography sx={{ fontWeight: 900, color: '#D97706', fontSize: '1.1rem' }}>{maintenance.reported || 0}</Typography>
                <Typography variant="caption" sx={{ color: '#92400E', fontSize: '0.68rem', fontWeight: 700 }}>Signalées</Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 1, borderRadius: 2, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <Typography sx={{ fontWeight: 900, color: '#2563EB', fontSize: '1.1rem' }}>{maintenance.inProgress || 0}</Typography>
                <Typography variant="caption" sx={{ color: '#1E40AF', fontSize: '0.68rem', fontWeight: 700 }}>En Atelier</Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 1, borderRadius: 2, bgcolor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                <Typography sx={{ fontWeight: 900, color: '#059669', fontSize: '1.1rem' }}>{maintenance.completed || 0}</Typography>
                <Typography variant="caption" sx={{ color: '#065F46', fontSize: '0.68rem', fontWeight: 700 }}>Résolues</Typography>
              </Paper>
            </Box>
          </Box>
        </Paper>

      </Box>

      {/* 🔄 6. RECENT ACTIVITIES & MOVEMENTS FEED 🔄 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.3fr 1fr' }, gap: 3 }}>
        
        {/* Recent Movements */}
        <Paper elevation={0} sx={{ borderRadius: 3.5, p: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#FFF5F5', color: '#E31E24' }}>
                <SwapHorizIcon />
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A1A2E' }}>
                  Derniers Mouvements du Parc
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Traçabilité en direct des affectations et transferts
                </Typography>
              </Box>
            </Box>

            <Button component={Link} href="/dashboard/movements" size="small" endIcon={<ArrowForwardIcon />} sx={{ textTransform: 'none', fontWeight: 800, color: '#E31E24' }}>
              Historique complet
            </Button>
          </Box>

          {(stats?.recentMovements || []).length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#F8FAFC', borderRadius: 3 }}>
              <SwapHorizIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
              <Typography sx={{ fontWeight: 700, color: '#64748B' }}>Aucun mouvement récent enregistré</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {(stats?.recentMovements || []).slice(0, 5).map((m: any) => {
                const mt = movementTypeLabels[m.type] || { label: m.type, color: '#64748B', bg: '#F8FAFC' };

                return (
                  <Box
                    key={m.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.8,
                      borderRadius: 2.5,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #F1F5F9',
                      borderLeft: `4px solid ${mt.color}`,
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#FFFFFF', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', transform: 'translateX(3px)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Chip
                        label={mt.label}
                        size="small"
                        sx={{ fontWeight: 900, fontSize: '0.7rem', bgcolor: mt.bg, color: mt.color, minWidth: 85 }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#1A1A2E' }}>
                          {m.equipmentName}
                        </Typography>
                        {m.notes && (
                          <Typography noWrap sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {m.notes}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1.5 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B' }}>
                        {formatDate(m.createdAt)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem' }}>
                        {formatTime(m.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Paper>

        {/* Recent Maintenance Tickets */}
        <Paper elevation={0} sx={{ borderRadius: 3.5, p: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#FFFBEB', color: '#D97706' }}>
                <BuildIcon />
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A1A2E' }}>
                  Tickets Récents
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Incidents signalés par les collaborateurs
                </Typography>
              </Box>
            </Box>

            <Button component={Link} href="/dashboard/maintenances" size="small" endIcon={<ArrowForwardIcon />} sx={{ textTransform: 'none', fontWeight: 800, color: '#D97706' }}>
              Tous les tickets
            </Button>
          </Box>

          {(stats?.recentMaintenances || []).length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#F8FAFC', borderRadius: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#059669', mb: 1 }} />
              <Typography sx={{ fontWeight: 700, color: '#64748B' }}>Aucun incident récent</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {(stats?.recentMaintenances || []).slice(0, 5).map((m: any) => {
                const ms = maintenanceStatusLabels[m.status] || { label: m.status, color: '#64748B', bg: '#F8FAFC' };

                return (
                  <Box
                    key={m.id}
                    sx={{
                      p: 1.8,
                      borderRadius: 2.5,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #F1F5F9',
                      borderLeft: `4px solid ${ms.color}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#1A1A2E' }}>
                        {m.equipmentName}
                      </Typography>
                      <Chip
                        label={ms.label}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: ms.bg, color: ms.color }}
                      />
                    </Box>

                    {m.description && (
                      <Typography sx={{ fontSize: '0.78rem', color: '#475569', mb: 0.8, lineHeight: 1.3 }} noWrap>
                        {m.description}
                      </Typography>
                    )}

                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                      {m.assignedTo && m.assignedTo !== '-' ? `Technicien : ${m.assignedTo} • ` : ''}{formatDate(m.createdAt)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Paper>

      </Box>

    </Box>
  );
}
