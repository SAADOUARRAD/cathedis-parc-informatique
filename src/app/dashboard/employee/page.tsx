'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Typography, Paper, Chip, Avatar, Skeleton } from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const movementLabels: Record<string, { label: string; color: string }> = {
  PURCHASE: { label: 'Achat', color: '#4CAF50' },
  ASSIGNMENT: { label: 'Affectation', color: '#2196F3' },
  RETURN: { label: 'Restitution', color: '#00BCD4' },
  TRANSFER: { label: 'Transfert', color: '#FF9800' },
  MAINTENANCE: { label: 'Maintenance', color: '#9C27B0' },
  DECOMMISSION: { label: 'Réforme', color: '#F44336' },
};

const statusColors: Record<string, string> = {
  AVAILABLE: '#4CAF50', ASSIGNED: '#2196F3', MAINTENANCE: '#FF9800', DECOMMISSIONED: '#F44336',
};

const ticketStatusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  REPORTED: { label: 'Signalé', color: '#E65100', bgColor: '#FFF3E0' },
  ASSIGNED: { label: 'Assigné', color: '#1565C0', bgColor: '#E3F2FD' },
  IN_PROGRESS: { label: 'En cours', color: '#6A1B9A', bgColor: '#F3E5F5' },
  COMPLETED: { label: 'Résolu', color: '#2E7D32', bgColor: '#E8F5E9' },
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  LOW: { label: 'Basse', color: '#1565C0', bgColor: '#E3F2FD' },
  MEDIUM: { label: 'Moyenne', color: '#E65100', bgColor: '#FFF3E0' },
  HIGH: { label: 'Haute', color: '#C62828', bgColor: '#FFEBEE' },
  CRITICAL: { label: 'Critique', color: '#B71C1C', bgColor: '#FFCDD2' },
};

export default function EmployeeDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/employee-stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Skeleton variant="rounded" height={100} />
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={120} sx={{ flex: '1 1 200px' }} />)}
        </Box>
        <Skeleton variant="rounded" height={300} />
      </Box>
    );
  }

  const myEquipments = stats?.myEquipments || [];
  const recentMaintenances = stats?.recentMaintenances || [];
  const recentMovements = stats?.recentMovements || [];
  const kpis = stats?.stats || {};

  const kpiCards = [
    {
      title: 'Mes Équipements',
      value: kpis.totalEquipments || 0,
      icon: <ComputerIcon />,
      gradient: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
    },
    {
      title: 'Tickets en cours',
      value: kpis.pendingMaintenances || 0,
      icon: <BuildIcon />,
      gradient: 'linear-gradient(135deg, #FF9800 0%, #E65100 100%)',
    },
    {
      title: 'Résolus',
      value: kpis.completedMaintenances || 0,
      icon: <CheckCircleIcon />,
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Welcome Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 50%, #FFEAEA 100%)',
        borderRadius: 3, p: 4, color: '#1A1A2E',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(227, 30, 36, 0.08)',
        border: '1px solid rgba(227, 30, 36, 0.15)',
        borderLeft: '6px solid #E31E24',
      }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(227,30,36,0.12) 0%, rgba(196,16,24,0.03) 100%)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: 100, width: 160, height: 160, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(227,30,36,0.08) 0%, rgba(255,255,255,0) 100%)' }} />
        <Typography sx={{ fontSize: '1.68rem', fontWeight: 800, color: '#1A1A2E', position: 'relative', zIndex: 1 }}>
          Bonjour, <Box component="span" sx={{ background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{session?.user?.name || 'Employé'}</Box> 👋
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: '#555555', fontWeight: 500, mt: 0.5, position: 'relative', zIndex: 1 }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — Voici votre espace personnel
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {kpiCards.map((card, idx) => (
          <Paper key={idx} elevation={0} sx={{
            flex: '1 1 200px', borderRadius: 3, overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' },
          }}>
            <Box sx={{ height: 4, background: card.gradient }} />
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: '0.8rem', color: '#999', fontWeight: 500 }}>{card.title}</Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#1A1A2E', lineHeight: 1, mt: 0.5 }}>{card.value}</Typography>
              </Box>
              <Avatar sx={{ width: 50, height: 50, background: card.gradient, '& svg': { fontSize: 26 } }}>
                {card.icon}
              </Avatar>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* My Equipments */}
        <Paper elevation={0} sx={{ flex: '2 1 500px', borderRadius: 3, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <ComputerIcon sx={{ color: '#2196F3' }} />
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A2E' }}>
              Mes Équipements
            </Typography>
          </Box>
          {myEquipments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ComputerIcon sx={{ fontSize: 50, color: '#ddd', mb: 1 }} />
              <Typography sx={{ color: '#999' }}>Aucun équipement affecté</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {myEquipments.map((eq: any, idx: number) => (
                <Box key={idx} sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  p: 2, borderRadius: 2, bgcolor: '#fafafa',
                  borderLeft: `4px solid ${statusColors[eq.status] || '#999'}`,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#f5f5f5', transform: 'translateX(4px)' },
                }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A1A2E' }}>{eq.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      {eq.category && (
                        <Chip label={eq.category} size="small" sx={{ fontSize: '0.7rem', bgcolor: '#E3F2FD', color: '#1565C0', fontWeight: 600 }} />
                      )}
                      <Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#999' }}>
                        SN: {eq.serialNumber || '-'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip
                      label={eq.status === 'ASSIGNED' ? 'Affecté' : eq.status === 'MAINTENANCE' ? 'Maintenance' : eq.status}
                      size="small"
                      sx={{
                        fontWeight: 700, fontSize: '0.65rem',
                        bgcolor: `${statusColors[eq.status] || '#999'}15`,
                        color: statusColors[eq.status] || '#999',
                      }}
                    />
                    {eq.assignedAt && (
                      <Typography sx={{ fontSize: '0.7rem', color: '#bbb', mt: 0.5 }}>
                        Depuis le {formatDate(eq.assignedAt)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>

        {/* Recent Activities */}
        <Paper elevation={0} sx={{ flex: '1 1 300px', borderRadius: 3, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <SwapHorizIcon sx={{ color: '#E31E24' }} />
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A2E' }}>
              Dernières Activités
            </Typography>
          </Box>
          {recentMovements.length === 0 ? (
            <Typography sx={{ textAlign: 'center', color: '#999', py: 3 }}>Aucune activité récente</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {recentMovements.slice(0, 6).map((m: any, idx: number) => {
                const ml = movementLabels[m.type] || { label: m.type, color: '#666' };
                return (
                  <Box key={m.id || idx} sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    p: 1.5, borderRadius: 2, bgcolor: '#fafafa',
                  }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: ml.color, flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Chip label={ml.label} size="small" sx={{
                        fontSize: '0.65rem', fontWeight: 700, height: 20,
                        bgcolor: `${ml.color}15`, color: ml.color,
                      }} />
                      <Typography noWrap sx={{ fontSize: '0.8rem', color: '#666', mt: 0.3 }}>
                        {m.equipmentName}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.65rem', color: '#bbb', flexShrink: 0 }}>
                      {formatDate(m.createdAt)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Maintenance Tickets */}
      <Paper elevation={0} sx={{ borderRadius: 3, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <BuildIcon sx={{ color: '#FF9800' }} />
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A2E' }}>
            Mes Tickets de Maintenance
          </Typography>
        </Box>
        {recentMaintenances.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 50, color: '#4CAF50', mb: 1, opacity: 0.4 }} />
            <Typography sx={{ color: '#999' }}>Aucun ticket — Tout fonctionne bien !</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {recentMaintenances.map((t: any, idx: number) => {
              const sc = ticketStatusConfig[t.status] || ticketStatusConfig.REPORTED;
              const pc = priorityConfig[t.priority] || priorityConfig.MEDIUM;
              return (
                <Box key={t.id || idx} sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  p: 2, borderRadius: 2, bgcolor: '#fafafa',
                  borderLeft: `4px solid ${sc.color}`,
                  flexWrap: 'wrap', gap: 1,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#1A1A2E' }}>
                      {t.equipmentName}
                    </Typography>
                    {t.description && (
                      <Typography noWrap sx={{ fontSize: '0.8rem', color: '#888', mt: 0.3 }}>
                        {t.description}
                      </Typography>
                    )}
                    <Typography sx={{ fontSize: '0.7rem', color: '#bbb', mt: 0.5 }}>
                      <ScheduleIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                      {formatDate(t.createdAt)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Chip label={sc.label} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', bgcolor: sc.bgColor, color: sc.color }} />
                    <Chip label={pc.label} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', bgcolor: pc.bgColor, color: pc.color }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
