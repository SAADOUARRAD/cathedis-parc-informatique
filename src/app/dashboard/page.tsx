'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box, Typography, Paper, Skeleton, Chip, Avatar, LinearProgress,
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BuildIcon from '@mui/icons-material/Build';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SecurityIcon from '@mui/icons-material/Security';
import InventoryIcon from '@mui/icons-material/Inventory';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CategoryIcon from '@mui/icons-material/Category';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import EuroIcon from '@mui/icons-material/Euro';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';

import { useRouter } from 'next/navigation';

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#FF5722', '#607D8B'];

const movementTypeLabels: Record<string, { label: string; color: string }> = {
  PURCHASE: { label: 'Achat', color: '#4CAF50' },
  ASSIGNMENT: { label: 'Affectation', color: '#2196F3' },
  RETURN: { label: 'Restitution', color: '#00BCD4' },
  TRANSFER: { label: 'Transfert', color: '#FF9800' },
  MAINTENANCE: { label: 'Maintenance', color: '#9C27B0' },
  DECOMMISSION: { label: 'Réforme', color: '#F44336' },
};

const maintenanceStatusLabels: Record<string, { label: string; color: string }> = {
  REPORTED: { label: 'Déclarée', color: '#FF9800' },
  ASSIGNED: { label: 'Affectée', color: '#2196F3' },
  IN_PROGRESS: { label: 'En cours', color: '#9C27B0' },
  COMPLETED: { label: 'Terminée', color: '#4CAF50' },
  CANCELLED: { label: 'Annulée', color: '#F44336' },
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Skeleton variant="rounded" height={80} />
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} variant="rounded" height={140} sx={{ flex: '1 1 200px' }} />
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Skeleton variant="rounded" height={350} sx={{ flex: 2 }} />
          <Skeleton variant="rounded" height={350} sx={{ flex: 1 }} />
        </Box>
      </Box>
    );
  }

  const kpis = stats?.kpis || {};
  const charts = stats?.charts || {};
  const maintenance = stats?.maintenance || {};
  const warranties = stats?.warranties || {};

  // KPI cards data
  const kpiCards = [
    {
      title: 'Total Équipements',
      value: kpis.totalEquipments || 0,
      icon: <ComputerIcon />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      sub: `${kpis.availableCount || 0} disponibles`,
    },
    {
      title: 'Affectations Actives',
      value: kpis.activeAssignments || 0,
      icon: <AssignmentIcon />,
      gradient: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
      sub: `${kpis.assignedCount || 0} équipements affectés`,
    },
    {
      title: 'En Maintenance',
      value: kpis.maintenanceCount || 0,
      icon: <BuildIcon />,
      gradient: 'linear-gradient(135deg, #FF9800 0%, #E65100 100%)',
      sub: `${maintenance.reported || 0} en attente`,
    },
    {
      title: 'Valeur du Parc',
      value: formatCurrency(kpis.totalValue || 0),
      icon: <EuroIcon />,
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
      sub: `${kpis.totalEquipments || 0} actifs`,
      isText: true,
    },
  ];

  // Secondary stats
  const secondaryCards = [
    { label: 'Utilisateurs', value: kpis.totalUsers || 0, icon: <PeopleIcon sx={{ fontSize: 20 }} />, color: '#2196F3' },
    { label: 'Départements', value: kpis.totalDepartments || 0, icon: <BusinessIcon sx={{ fontSize: 20 }} />, color: '#9C27B0' },
    { label: 'Catégories', value: kpis.totalCategories || 0, icon: <CategoryIcon sx={{ fontSize: 20 }} />, color: '#FF9800' },
    { label: 'Fournisseurs', value: kpis.totalSuppliers || 0, icon: <LocalShippingIcon sx={{ fontSize: 20 }} />, color: '#4CAF50' },
  ];

  const availPercent = kpis.totalEquipments > 0
    ? Math.round((kpis.availableCount / kpis.totalEquipments) * 100)
    : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Welcome Header */}
      {session?.user?.role === 'TECHNICIAN' ? (
        <Box sx={{
          background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
          borderRadius: 3, p: 4, color: '#fff', position: 'relative', overflow: 'hidden',
          borderLeft: '6px solid #0EA5E9', boxShadow: '0 4px 20px rgba(14, 165, 233, 0.15)',
        }}>
          <Box sx={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(14, 165, 233, 0.15)' }} />
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, mb: 0.5, position: 'relative', zIndex: 1 }}>
            Bonjour, {session?.user?.name || 'Technicien'} 🛠️
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', position: 'relative', zIndex: 1 }}>
            Espace Technicien — Résumé des maintenances et équipements ({new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })})
          </Typography>
        </Box>
      ) : (
        <Box sx={{
          background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
          borderRadius: 3, p: 4, color: '#fff', position: 'relative', overflow: 'hidden',
          borderLeft: '6px solid #E31E24', boxShadow: '0 4px 20px rgba(227, 30, 36, 0.15)',
        }}>
          <Box sx={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(227,30,36,0.15)' }} />
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, mb: 0.5, position: 'relative', zIndex: 1 }}>
            Bonjour, {session?.user?.name || 'Administrateur'} 👑
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', position: 'relative', zIndex: 1 }}>
            Espace Administration — Résumé du parc informatique ({new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })})
          </Typography>
        </Box>
      )}

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {kpiCards.map((card, idx) => (
          <Paper key={idx} elevation={0} sx={{
            flex: '1 1 220px',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' },
          }}>
            <Box sx={{ height: 4, background: card.gradient }} />
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography sx={{ fontSize: '0.85rem', color: '#888', fontWeight: 500 }}>
                  {card.title}
                </Typography>
                <Avatar sx={{
                  width: 42, height: 42,
                  background: card.gradient,
                  '& svg': { fontSize: 22 },
                }}>
                  {card.icon}
                </Avatar>
              </Box>
              <Typography sx={{ fontSize: card.isText ? '1.5rem' : '2rem', fontWeight: 800, color: '#1A1A2E', lineHeight: 1 }}>
                {card.value}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#999', mt: 1 }}>
                {card.sub}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Secondary Stats + Availability */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Mini Cards */}
        <Paper elevation={0} sx={{ flex: '2 1 400px', borderRadius: 3, p: 3 }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A1A2E', mb: 2 }}>
            Aperçu Rapide
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {secondaryCards.map((sc, idx) => (
              <Box key={idx} sx={{
                flex: '1 1 120px',
                display: 'flex', alignItems: 'center', gap: 1.5,
                p: 2, borderRadius: 2, bgcolor: '#f8f9fc',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#f0f1f5' },
              }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: `${sc.color}15`, color: sc.color }}>
                  {sc.icon}
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A1A2E', lineHeight: 1 }}>
                    {sc.value}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#999' }}>{sc.label}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Availability Rate */}
        <Paper elevation={0} sx={{ flex: '1 1 250px', borderRadius: 3, p: 3 }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A1A2E', mb: 2 }}>
            Taux de Disponibilité
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <Box sx={{
                width: 90, height: 90, borderRadius: '50%',
                background: `conic-gradient(#4CAF50 ${availPercent * 3.6}deg, #f0f0f0 0deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Box sx={{
                  width: 70, height: 70, borderRadius: '50%', bgcolor: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#4CAF50' }}>
                    {availPercent}%
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#4CAF50' }} />
                <Typography sx={{ fontSize: '0.8rem', color: '#666' }}>
                  Disponible: {kpis.availableCount || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2196F3' }} />
                <Typography sx={{ fontSize: '0.8rem', color: '#666' }}>
                  Affecté: {kpis.assignedCount || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FF9800' }} />
                <Typography sx={{ fontSize: '0.8rem', color: '#666' }}>
                  Maintenance: {kpis.maintenanceCount || 0}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Charts Row */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Monthly Activity Chart */}
        <Paper elevation={0} sx={{ flex: '2 1 500px', borderRadius: 3, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A1A2E' }}>
                Activité Mensuelle
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#999' }}>
                Équipements ajoutés et maintenances sur 6 mois
              </Typography>
            </Box>
            <TrendingUpIcon sx={{ color: '#E31E24' }} />
          </Box>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={charts.monthlyData || []}>
              <defs>
                <linearGradient id="colorEquip" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMaint" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF9800" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF9800" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Area type="monotone" dataKey="equipments" name="Équipements" stroke="#667eea" fill="url(#colorEquip)" strokeWidth={2} />
              <Area type="monotone" dataKey="maintenances" name="Maintenances" stroke="#FF9800" fill="url(#colorMaint)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>

        {/* Status Distribution Pie */}
        <Paper elevation={0} sx={{ flex: '1 1 300px', borderRadius: 3, p: 3 }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A1A2E', mb: 2 }}>
            Répartition par Statut
          </Typography>
          <ResponsiveContainer width="100%" height={220}>
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
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {(charts.statusData || []).map((entry: any, idx: number) => (
              <Chip
                key={idx}
                label={`${entry.name}: ${entry.value}`}
                size="small"
                sx={{ bgcolor: `${entry.color}15`, color: entry.color, fontWeight: 600, fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Category & Alerts Row */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Category Bar Chart */}
        <Paper elevation={0} sx={{ flex: '1 1 400px', borderRadius: 3, p: 3 }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A1A2E', mb: 3 }}>
            Équipements par Catégorie
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={charts.categoryData || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} width={120} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="value" name="Équipements" radius={[0, 6, 6, 0]} barSize={20}>
                {(charts.categoryData || []).map((_: any, index: number) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Alerts Panel */}
        <Paper elevation={0} sx={{ flex: '1 1 300px', borderRadius: 3, p: 3 }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A1A2E', mb: 2 }}>
            ⚡ Alertes & Notifications
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Maintenance alerts */}
            {(maintenance.reported > 0) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: '#FFF3E0' }}>
                <WarningAmberIcon sx={{ color: '#FF9800' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#E65100' }}>
                    {maintenance.reported} maintenance(s) en attente
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#F57C00' }}>
                    Nécessite une intervention
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Warranty alerts */}
            {(warranties.expiring > 0) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: '#FFEBEE' }}>
                <SecurityIcon sx={{ color: '#F44336' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#C62828' }}>
                    {warranties.expiring} garantie(s) expirent bientôt
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#E53935' }}>
                    Dans les 30 prochains jours
                  </Typography>
                </Box>
              </Box>
            )}

            {warranties.expired > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: '#FCE4EC' }}>
                <SecurityIcon sx={{ color: '#E91E63' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#880E4F' }}>
                    {warranties.expired} garantie(s) expirée(s)
                  </Typography>
                </Box>
              </Box>
            )}

            {kpis.decommissionedCount > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: '#F3E5F5' }}>
                <ComputerIcon sx={{ color: '#9C27B0' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#6A1B9A' }}>
                    {kpis.decommissionedCount} équipement(s) réformé(s)
                  </Typography>
                </Box>
              </Box>
            )}

            {/* All good */}
            {maintenance.reported === 0 && warranties.expiring === 0 && warranties.expired === 0 && kpis.decommissionedCount === 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: '#E8F5E9' }}>
                <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#2E7D32' }}>
                  Tout est en ordre ! Aucune alerte.
                </Typography>
              </Box>
            )}

            {/* Maintenance Progress */}
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1A1A2E', mb: 1 }}>
                Maintenances
              </Typography>
              {[
                { label: 'En attente', value: maintenance.reported, color: '#FF9800' },
                { label: 'En cours', value: maintenance.inProgress, color: '#2196F3' },
                { label: 'Terminées', value: maintenance.completed, color: '#4CAF50' },
              ].map((m, idx) => {
                const total = (maintenance.reported || 0) + (maintenance.inProgress || 0) + (maintenance.completed || 0);
                const pct = total > 0 ? Math.round((m.value / total) * 100) : 0;
                return (
                  <Box key={idx} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>{m.label}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: m.color }}>{m.value || 0}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 6, borderRadius: 3, bgcolor: '#f0f0f0',
                        '& .MuiLinearProgress-bar': { bgcolor: m.color, borderRadius: 3 },
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Recent Activity */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Recent Movements */}
        <Paper elevation={0} sx={{ flex: '1 1 500px', borderRadius: 3, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <SwapHorizIcon sx={{ color: '#E31E24' }} />
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A1A2E' }}>
              Derniers Mouvements
            </Typography>
          </Box>
          {(stats?.recentMovements || []).length === 0 ? (
            <Typography sx={{ textAlign: 'center', color: '#999', py: 3 }}>Aucun mouvement récent</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {(stats?.recentMovements || []).slice(0, 6).map((m: any) => {
                const mt = movementTypeLabels[m.type] || { label: m.type, color: '#666' };
                return (
                  <Box key={m.id} sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    p: 1.5, borderRadius: 2, bgcolor: '#fafafa',
                    borderLeft: `3px solid ${mt.color}`,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}>
                    <Chip label={mt.label} size="small" sx={{
                      fontWeight: 700, fontSize: '0.7rem', minWidth: 85,
                      bgcolor: `${mt.color}15`, color: mt.color,
                    }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography noWrap sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1A1A2E' }}>
                        {m.equipmentName}
                      </Typography>
                      {m.notes && (
                        <Typography noWrap sx={{ fontSize: '0.75rem', color: '#999' }}>{m.notes}</Typography>
                      )}
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: '#999' }}>{formatDate(m.createdAt)}</Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: '#bbb' }}>{formatTime(m.createdAt)}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Paper>

        {/* Recent Maintenances */}
        <Paper elevation={0} sx={{ flex: '1 1 400px', borderRadius: 3, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <BuildIcon sx={{ color: '#FF9800' }} />
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A1A2E' }}>
              Maintenances Récentes
            </Typography>
          </Box>
          {(stats?.recentMaintenances || []).length === 0 ? (
            <Typography sx={{ textAlign: 'center', color: '#999', py: 3 }}>Aucune maintenance récente</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {(stats?.recentMaintenances || []).map((m: any) => {
                const ms = maintenanceStatusLabels[m.status] || { label: m.status, color: '#666' };
                return (
                  <Box key={m.id} sx={{
                    p: 2, borderRadius: 2, bgcolor: '#fafafa',
                    borderLeft: `3px solid ${ms.color}`,
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1A1A2E' }}>
                        {m.equipmentName}
                      </Typography>
                      <Chip label={ms.label} size="small" sx={{
                        fontWeight: 700, fontSize: '0.65rem',
                        bgcolor: `${ms.color}15`, color: ms.color,
                      }} />
                    </Box>
                    {m.description && (
                      <Typography sx={{ fontSize: '0.75rem', color: '#888', mb: 0.5 }} noWrap>{m.description}</Typography>
                    )}
                    <Typography sx={{ fontSize: '0.7rem', color: '#bbb' }}>
                      {m.assignedTo !== '-' ? `Technicien: ${m.assignedTo}` : ''} · {formatDate(m.createdAt)}
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
