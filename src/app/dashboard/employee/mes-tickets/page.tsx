'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box, Typography, Paper, Chip, Skeleton, Avatar, Button,
  Dialog, DialogTitle, DialogContent, TextField, MenuItem,
  Select, FormControl, InputLabel, Snackbar, Alert,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import AddIcon from '@mui/icons-material/Add';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  REPORTED: { label: 'Déclaré', color: '#E65100', bgColor: '#FFF3E0', icon: <ScheduleIcon sx={{ fontSize: 18 }} /> },
  ASSIGNED: { label: 'Affecté', color: '#1565C0', bgColor: '#E3F2FD', icon: <BuildIcon sx={{ fontSize: 18 }} /> },
  IN_PROGRESS: { label: 'En cours', color: '#6A1B9A', bgColor: '#F3E5F5', icon: <BuildIcon sx={{ fontSize: 18 }} /> },
  COMPLETED: { label: 'Résolu', color: '#2E7D32', bgColor: '#E8F5E9', icon: <CheckCircleIcon sx={{ fontSize: 18 }} /> },
  CANCELLED: { label: 'Annulé', color: '#C62828', bgColor: '#FFEBEE', icon: <ErrorIcon sx={{ fontSize: 18 }} /> },
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  LOW: { label: 'Basse', color: '#1565C0', bgColor: '#E3F2FD' },
  MEDIUM: { label: 'Moyenne', color: '#E65100', bgColor: '#FFF3E0' },
  HIGH: { label: 'Haute', color: '#C62828', bgColor: '#FFEBEE' },
  CRITICAL: { label: 'Critique', color: '#B71C1C', bgColor: '#FFCDD2' },
};

export default function MesTicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/dashboard/employee-stats');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.recentMaintenances || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const pending = tickets.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const resolved = tickets.filter(t => t.status === 'COMPLETED');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Skeleton variant="rounded" height={80} />
        {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={100} />)}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 50%, #FFEAEA 100%)',
        borderRadius: 3, p: 4, color: '#1A1A2E',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(227, 30, 36, 0.08)',
        border: '1px solid rgba(227, 30, 36, 0.15)',
        borderLeft: '6px solid #E31E24',
      }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(227,30,36,0.12) 0%, rgba(196,16,24,0.03) 100%)' }} />
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1A2E', position: 'relative', zIndex: 1 }}>
          🎫 Mes Tickets de Maintenance
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: '#555555', fontWeight: 500, mt: 0.5, position: 'relative', zIndex: 1 }}>
          Suivez l'état de vos signalements et demandes de support
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Paper elevation={0} sx={{
          flex: '1 1 200px', borderRadius: 3, p: 3,
          borderLeft: '4px solid #FF9800',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#FFF3E0', color: '#E65100', width: 48, height: 48 }}>
              <ScheduleIcon />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#1A1A2E', lineHeight: 1 }}>
                {pending.length}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#999' }}>En cours</Typography>
            </Box>
          </Box>
        </Paper>
        <Paper elevation={0} sx={{
          flex: '1 1 200px', borderRadius: 3, p: 3,
          borderLeft: '4px solid #4CAF50',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', width: 48, height: 48 }}>
              <CheckCircleIcon />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#1A1A2E', lineHeight: 1 }}>
                {resolved.length}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#999' }}>Résolus</Typography>
            </Box>
          </Box>
        </Paper>
        <Paper elevation={0} sx={{
          flex: '1 1 200px', borderRadius: 3, p: 3,
          borderLeft: '4px solid #F44336',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#FFEBEE', color: '#C62828', width: 48, height: 48 }}>
              <WarningIcon />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#1A1A2E', lineHeight: 1 }}>
                {tickets.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL').length}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#999' }}>Priorité haute</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <Paper elevation={0} sx={{ borderRadius: 3, p: 6, textAlign: 'center' }}>
          <BuildIcon sx={{ fontSize: 60, color: '#ddd', mb: 2 }} />
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#999' }}>
            Aucun ticket pour le moment
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#bbb', mt: 0.5 }}>
            Vos signalements de problèmes apparaîtront ici
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Pending first, then resolved */}
          {[...pending, ...resolved].map((ticket: any, idx: number) => {
            const sc = statusConfig[ticket.status] || statusConfig.REPORTED;
            const pc = priorityConfig[ticket.priority] || priorityConfig.MEDIUM;
            return (
              <Paper key={ticket.id || idx} elevation={0} sx={{
                borderRadius: 3, overflow: 'hidden',
                borderLeft: `4px solid ${sc.color}`,
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateX(4px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
              }}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Avatar sx={{ bgcolor: sc.bgColor, color: sc.color, width: 36, height: 36 }}>
                          {sc.icon}
                        </Avatar>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A2E' }}>
                          {ticket.equipmentName}
                        </Typography>
                      </Box>
                      {ticket.description && (
                        <Typography sx={{ fontSize: '0.85rem', color: '#666', ml: 6.5, mb: 1 }}>
                          {ticket.description}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                      <Chip
                        label={sc.label}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: sc.bgColor, color: sc.color }}
                      />
                      <Chip
                        label={pc.label}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: pc.bgColor, color: pc.color }}
                      />
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#bbb', ml: 6.5, mt: 0.5 }}>
                    Créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
