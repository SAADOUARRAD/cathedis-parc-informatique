'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Dialog, DialogTitle, DialogContent,
  TextField, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert,
  Skeleton, Avatar, IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'En attente', color: '#E65100', bgColor: '#FFF3E0' },
  APPROVED: { label: 'Approuvée', color: '#2E7D32', bgColor: '#E8F5E9' },
  REJECTED: { label: 'Refusée', color: '#C62828', bgColor: '#FFEBEE' },
  FULFILLED: { label: 'Livrée', color: '#1565C0', bgColor: '#E3F2FD' },
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  LOW: { label: 'Basse', color: '#1565C0', bgColor: '#E3F2FD' },
  MEDIUM: { label: 'Moyenne', color: '#E65100', bgColor: '#FFF3E0' },
  HIGH: { label: 'Haute', color: '#C62828', bgColor: '#FFEBEE' },
  CRITICAL: { label: 'Urgente', color: '#B71C1C', bgColor: '#FFCDD2' },
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [actionStatus, setActionStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/equipment-requests?status=${filter}`);
      if (res.ok) setRequests(await res.json());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const handleAction = (req: any, status: string) => {
    setSelectedRequest(req);
    setActionStatus(status);
    setAdminResponse('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedRequest) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/equipment-requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: actionStatus, adminResponse }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: `Demande ${actionStatus === 'APPROVED' ? 'approuvée' : actionStatus === 'REJECTED' ? 'refusée' : 'livrée'} !`, severity: 'success' });
        setDialogOpen(false);
        fetchRequests();
      }
    } catch {
      setSnackbar({ open: true, message: 'Erreur', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={100} />)}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A2E' }}>
            Demandes d'Équipement
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>
            {pendingCount} demande{pendingCount > 1 ? 's' : ''} en attente de traitement
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'FULFILLED'].map((s) => (
            <Chip
              key={s}
              label={s === 'ALL' ? 'Toutes' : statusConfig[s]?.label}
              onClick={() => setFilter(s)}
              sx={{
                fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                bgcolor: filter === s ? (s === 'ALL' ? '#1A1A2E' : statusConfig[s]?.bgColor) : 'transparent',
                color: filter === s ? (s === 'ALL' ? '#fff' : statusConfig[s]?.color) : '#999',
                border: filter === s ? 'none' : '1px solid #eee',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Requests */}
      {requests.length === 0 ? (
        <Paper elevation={0} sx={{ borderRadius: 3, p: 6, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 60, color: '#ddd', mb: 2 }} />
          <Typography sx={{ color: '#999' }}>Aucune demande</Typography>
        </Paper>
      ) : (
        requests.map((req) => {
          const sc = statusConfig[req.status] || statusConfig.PENDING;
          const pc = priorityConfig[req.priority] || priorityConfig.MEDIUM;
          return (
            <Paper key={req.id} elevation={0} sx={{
              borderRadius: 3, p: 3, borderLeft: `4px solid ${sc.color}`,
              transition: 'all 0.2s',
              '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#1A1A2E' }}>{req.title}</Typography>
                    {req.quantity > 1 && <Chip label={`x${req.quantity}`} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />}
                  </Box>
                  <Typography sx={{ fontSize: '0.85rem', color: '#666', mb: 1 }}>{req.description}</Typography>
                  {req.reason && (
                    <Typography sx={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic', mb: 1 }}>
                      📝 Justification : {req.reason}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip label={sc.label} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', bgcolor: sc.bgColor, color: sc.color }} />
                    <Chip label={pc.label} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', bgcolor: pc.bgColor, color: pc.color }} />
                    {req.categoryName && <Chip label={req.categoryName} size="small" sx={{ fontSize: '0.65rem' }} />}
                    <Typography sx={{ fontSize: '0.7rem', color: '#bbb' }}>
                      par {req.requestedBy} · {new Date(req.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Typography>
                  </Box>
                  {req.adminResponse && (
                    <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: req.status === 'APPROVED' ? '#E8F5E9' : '#FFEBEE' }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#555' }}>
                        💬 {req.adminResponse}
                      </Typography>
                    </Box>
                  )}
                </Box>
                {req.status === 'PENDING' && (
                  <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                    <Button
                      variant="contained" size="small"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleAction(req, 'APPROVED')}
                      sx={{ bgcolor: '#4CAF50', borderRadius: 2, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#388E3C' } }}
                    >
                      Approuver
                    </Button>
                    <Button
                      variant="outlined" size="small" color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => handleAction(req, 'REJECTED')}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                      Refuser
                    </Button>
                  </Box>
                )}
                {req.status === 'APPROVED' && (
                  <Button
                    variant="contained" size="small"
                    startIcon={<LocalShippingIcon />}
                    onClick={() => handleAction(req, 'FULFILLED')}
                    sx={{ bgcolor: '#1565C0', borderRadius: 2, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#0D47A1' } }}
                  >
                    Marquer livrée
                  </Button>
                )}
              </Box>
            </Paper>
          );
        })
      )}

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>
          {actionStatus === 'APPROVED' ? '✅ Approuver la demande' : actionStatus === 'REJECTED' ? '❌ Refuser la demande' : '📦 Marquer comme livrée'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Typography sx={{ fontWeight: 700, color: '#1A1A2E' }}>{selectedRequest?.title}</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#666', mt: 0.5 }}>par {selectedRequest?.requestedBy}</Typography>
            </Paper>
            <TextField
              label="Réponse (optionnel)"
              placeholder="Ajoutez un commentaire pour l'employé..."
              fullWidth multiline rows={3}
              value={adminResponse} onChange={(e) => setAdminResponse(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saving}
              sx={{
                bgcolor: actionStatus === 'APPROVED' ? '#4CAF50' : actionStatus === 'REJECTED' ? '#F44336' : '#1565C0',
                borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.3,
                '&:hover': { opacity: 0.9 },
              }}
            >
              {saving ? 'Traitement...' : actionStatus === 'APPROVED' ? 'Confirmer l\'approbation' : actionStatus === 'REJECTED' ? 'Confirmer le refus' : 'Confirmer la livraison'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
