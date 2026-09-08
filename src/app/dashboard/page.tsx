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

const NAVY_PRIMARY = '#0F172A';
const NAVY_LIGHT = '#1E293B';
const NAVY_BORDER = '#334155';

const CHART_COLORS = ['#0F172A', '#1E293B', '#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0'];

const movementTypeLabels: Record<string, { label: string; color: string; bg: string }> = {
  PURCHASE: { label: 'Achat', color: '#0F172A', bg: '#F1F5F9' },
  ASSIGNMENT: { label: 'Affectation', color: '#0F172A', bg: '#F1F5F9' },
  RETURN: { label: 'Restitution', color: '#0F172A', bg: '#F1F5F9' },
  TRANSFER: { label: 'Transfert', color: '#0F172A', bg: '#F1F5F9' },
  MAINTENANCE: { label: 'Maintenance', color: '#0F172A', bg: '#F1F5F9' },
  DECOMMISSION: { label: 'Réforme', color: '#64748B', bg: '#F8FAFC' },
};

const maintenanceStatusLabels: Record<string, { label: string; color: string; bg: string }> = {
  REPORTED: { label: 'En attente', color: '#0F172A', bg: '#F1F5F9' },
  ASSIGNED: { label: 'Assignée', color: '#0F172A', bg: '#F1F5F9' },
  IN_PROGRESS: { label: 'En cours', color: '#0F172A', bg: '#F1F5F9' },
  COMPLETED: { label: 'Résolue', color: '#0F172A', bg: '#F1F5F9' },
  CANCELLED: { label: 'Annulée', color: '#64748B', bg: '#F8FAFC' },
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
      icon: <ComputerIcon sx={{ fontSize: 24 }} />,
      color: '#0F172A',
      gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      link: '/dashboard/equipments',
      progress: availPercent,
      progressLabel: 'Disponibilité'
    },
    {
      title: 'Dotations & Affectations',
      value: kpis.activeAssignments || 0,
      sub: `Sur ${kpis.totalUsers || 0} collaborateurs rattachés`,
      icon: <AssignmentIcon sx={{ fontSize: 24 }} />,
      color: '#0F172A',
      gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      link: '/dashboard/assignments',
      progress: assignedPercent,
      progressLabel: 'Taux de déploiement'
    },
    {
      title: 'Pannes & Maintenances',
      value: kpis.maintenanceCount || 0,
      sub: `${maintenance.reported || 0} en attente • ${maintenance.inProgress || 0} en atelier`,
      icon: <BuildIcon sx={{ fontSize: 24 }} />,
      color: '#0F172A',
      gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      link: '/dashboard/maintenances',
      progress: maintenance.reported > 0 ? 100 : 0,
      progressLabel: 'SLA Support'
    },
    {
      title: 'Valorisation Totale du Parc',
      value: formatCurrency(kpis.totalValue || 0),
      sub: `Actifs matériels inventoriés`,
      icon: <MoneyIcon sx={{ fontSize: 24 }} />,
      color: '#0F172A',
      gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      link: '/dashboard/equipments',
      progress: 100,
      progressLabel: 'Budget maîtrisé',
      isText: true
    },
  ];

  const quickNavTiles = [
    { label: 'Utilisateurs & RBAC', count: kpis.totalUsers || 0, icon: <PeopleIcon />, color: '#0F172A', link: '/dashboard/users' },
    { label: 'Départements & Sites', count: kpis.totalDepartments || 0, icon: <BusinessIcon />, color: '#0F172A', link: '/dashboard/departments' },
    { label: 'Familles Matérielles', count: kpis.totalCategories || 0, icon: <CategoryIcon />, color: '#0F172A', link: '/dashboard/categories' },
    { label: 'Fournisseurs Agréés', count: kpis.totalSuppliers || 0, icon: <LocalShippingIcon />, color: '#0F172A', link: '/dashboard/suppliers' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: { xs: 1.5, md: 3 } }}>
      
      {/* 🌟 1. BANNIÈRE EXÉCUTIVE CADRÉE EN BLEU MARINE 🌟 */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3.5,
          p: { xs: 2.5, sm: 3, md: 3.5 },
          bgcolor: '#FFFFFF',
          border: '2px solid #0F172A', // Cadre bleu marine foncé net et élégant
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 3,
        }}
      >
        {/* Left: Greeting & System Status */}
        <Box sx={{ maxWidth: 720 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                px: 1.2,
                py: 0.35,
                borderRadius: 1.5,
                bgcolor: '#F1F5F9',
                border: '1px solid #E2E8F0',
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: '#10B981',
                  boxShadow: '0 0 6px #10B981',
                }}
              />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Système Opérationnel
              </Typography>
            </Box>

            <Typography sx={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Typography>
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#0F172A',
              fontSize: { xs: '1.45rem', sm: '1.75rem', md: '1.95rem' },
              letterSpacing: '-0.02em',
              mb: 0.6,
            }}
          >
            Bonjour, {session?.user?.name || 'Administrateur'}
          </Typography>

          <Typography sx={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.55 }}>
            Supervision globale, gestion du cycle de vie et suivi en temps réel du parc informatique Cathedis.
          </Typography>
        </Box>

        {/* Right: Live Stat Badges */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1.2,
            px: 2.5,
            borderRadius: 2.5,
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
          }}
        >
          <Box sx={{ textAlign: 'center', pr: 2.5, borderRight: '1px solid #E2E8F0' }}>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
              {kpis.totalEquipments || 0}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', mt: 0.3 }}>
              Équipements
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', pl: 2.5 }}>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981', lineHeight: 1.1 }}>
              {availPercent}%
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', mt: 0.3 }}>
              Disponibilité
            </Typography>
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
                boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)',
                borderColor: '#0F172A',
              }
            }}
          >
            <Box sx={{ height: 4, position: 'absolute', top: 0, left: 0, right: 0, background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)' }} />
            
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  {card.title}
                </Typography>
                <Avatar sx={{ width: 42, height: 42, bgcolor: '#F1F5F9', color: '#0F172A', border: '1px solid #E2E8F0' }}>
                  {card.icon}
                </Avatar>
              </Box>

              <Typography sx={{ fontSize: card.isText ? '1.55rem' : '2.1rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
                {card.value}
              </Typography>

              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, mt: 0.8, display: 'block' }}>
                {card.sub}
              </Typography>
            </Box>

            <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.75rem' }}>
                {card.progressLabel} : {card.progress}%
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: 16, color: '#0F172A' }} />
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
                borderColor: '#0F172A',
                transform: 'translateX(3px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 38, height: 38, bgcolor: '#F1F5F9', color: '#0F172A', border: '1px solid #E2E8F0' }}>
                {React.cloneElement(tile.icon, { sx: { fontSize: 20 } })}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F172A' }}>
                  {tile.label}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                  {tile.count} enregistrés
                </Typography>
              </Box>
            </Box>
            <ArrowForwardIcon sx={{ fontSize: 16, color: '#0F172A' }} />
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
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                  Flux d'Activité du Parc & Maintenances
                </Typography>
                <Chip label="Derniers 6 Mois" size="small" sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: '#F1F5F9', color: '#0F172A' }} />
              </Box>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Entrées en stock vs interventions techniques clôturées
              </Typography>
            </Box>
            <TrendingUpIcon sx={{ color: '#0F172A' }} />
          </Box>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={charts.monthlyData || []}>
              <defs>
                <linearGradient id="colorEquip" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F172A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMaint" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#475569" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} allowDecimals={false} />
              <RechartsTooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
              <Legend />
              <Area type="monotone" dataKey="equipments" name="Nouvelles Acquisitions" stroke="#0F172A" fill="url(#colorEquip)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="maintenances" name="Maintenances Réalisées" stroke="#475569" fill="url(#colorMaint)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>

        {/* Status Distribution Donut */}
        <Paper elevation={0} sx={{ borderRadius: 3.5, p: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
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
                  {(charts.statusData || []).map((_: any, index: number) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
                sx={{ bgcolor: '#F1F5F9', color: '#0F172A', fontWeight: 800, fontSize: '0.72rem', border: '1px solid #E2E8F0' }}
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
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                Densité Matérielle par Catégorie
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Typologies de machines en parc
              </Typography>
            </Box>
            <CategoryIcon sx={{ color: '#0F172A' }} />
          </Box>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.categoryData || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#0F172A', fontWeight: 600 }} width={130} />
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
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#F1F5F9', color: '#0F172A', border: '1px solid #E2E8F0' }}>
                  <ShieldIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                  Centre de Veille & Alertes SLA
                </Typography>
              </Box>
              <Chip label="Surveillance Active" size="small" sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: '#F1F5F9', color: '#0F172A', border: '1px solid #E2E8F0' }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Maintenance Alert */}
              {maintenance.reported > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.8, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderLeft: '4px solid #0F172A' }}>
                  <WarningAmberIcon sx={{ color: '#0F172A' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                      {maintenance.reported} incident(s) en attente d'attribution IT
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Nécessite la prise en charge par un technicien
                    </Typography>
                  </Box>
                  <Button component={Link} href="/dashboard/maintenances" size="small" sx={{ fontWeight: 800, color: '#0F172A', textTransform: 'none' }}>
                    Traiter ➔
                  </Button>
                </Box>
              ) : null}

              {/* Warranty Expiry */}
              {warranties.expiring > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.8, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderLeft: '4px solid #475569' }}>
                  <SecurityIcon sx={{ color: '#0F172A' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                      {warranties.expiring} garantie(s) expirent sous 30 jours
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Penser au renouvellement constructeur
                    </Typography>
                  </Box>
                  <Button component={Link} href="/dashboard/warranties" size="small" sx={{ fontWeight: 800, color: '#0F172A', textTransform: 'none' }}>
                    Voir ➔
                  </Button>
                </Box>
              ) : null}

              {/* All clear fallback */}
              {maintenance.reported === 0 && warranties.expiring === 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2.5, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderLeft: '4px solid #0F172A' }}>
                  <CheckCircleIcon sx={{ color: '#0F172A', fontSize: 28 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                      Parc 100% Conforme & Opérationnel !
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
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
              <Paper elevation={0} sx={{ p: 1, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Typography sx={{ fontWeight: 900, color: '#0F172A', fontSize: '1.1rem' }}>{maintenance.reported || 0}</Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 700 }}>Signalées</Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 1, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Typography sx={{ fontWeight: 900, color: '#0F172A', fontSize: '1.1rem' }}>{maintenance.inProgress || 0}</Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 700 }}>En Atelier</Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 1, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Typography sx={{ fontWeight: 900, color: '#0F172A', fontSize: '1.1rem' }}>{maintenance.completed || 0}</Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 700 }}>Résolues</Typography>
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
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#F1F5F9', color: '#0F172A', border: '1px solid #E2E8F0' }}>
                <SwapHorizIcon />
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                  Derniers Mouvements du Parc
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Traçabilité en direct des affectations et transferts
                </Typography>
              </Box>
            </Box>

            <Button component={Link} href="/dashboard/movements" size="small" endIcon={<ArrowForwardIcon />} sx={{ textTransform: 'none', fontWeight: 800, color: '#0F172A' }}>
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
                const mt = movementTypeLabels[m.type] || { label: m.type, color: '#0F172A', bg: '#F1F5F9' };

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
                      borderLeft: '4px solid #0F172A',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#FFFFFF', boxShadow: '0 4px 14px rgba(15,23,42,0.05)', transform: 'translateX(3px)', borderColor: '#E2E8F0' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Chip
                        label={mt.label}
                        size="small"
                        sx={{ fontWeight: 900, fontSize: '0.7rem', bgcolor: mt.bg, color: mt.color, minWidth: 85, border: '1px solid #E2E8F0' }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
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
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>
                        {formatDate(m.createdAt)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem' }}>
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
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#F1F5F9', color: '#0F172A', border: '1px solid #E2E8F0' }}>
                <BuildIcon />
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                  Tickets Récents
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Incidents signalés par les collaborateurs
                </Typography>
              </Box>
            </Box>

            <Button component={Link} href="/dashboard/maintenances" size="small" endIcon={<ArrowForwardIcon />} sx={{ textTransform: 'none', fontWeight: 800, color: '#0F172A' }}>
              Tous les tickets
            </Button>
          </Box>

          {(stats?.recentMaintenances || []).length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#F8FAFC', borderRadius: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#0F172A', mb: 1 }} />
              <Typography sx={{ fontWeight: 700, color: '#64748B' }}>Aucun incident récent</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {(stats?.recentMaintenances || []).slice(0, 5).map((m: any) => {
                const ms = maintenanceStatusLabels[m.status] || { label: m.status, color: '#0F172A', bg: '#F1F5F9' };

                return (
                  <Box
                    key={m.id}
                    sx={{
                      p: 1.8,
                      borderRadius: 2.5,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #F1F5F9',
                      borderLeft: '4px solid #0F172A',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                        {m.equipmentName}
                      </Typography>
                      <Chip
                        label={ms.label}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: ms.bg, color: ms.color, border: '1px solid #E2E8F0' }}
                      />
                    </Box>

                    {m.description && (
                      <Typography sx={{ fontSize: '0.78rem', color: '#475569', mb: 0.8, lineHeight: 1.3 }} noWrap>
                        {m.description}
                      </Typography>
                    )}

                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem' }}>
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
