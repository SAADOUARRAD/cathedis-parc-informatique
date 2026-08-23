'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box, Typography, Paper, Chip, Button, Dialog, DialogTitle, DialogContent,
  TextField, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert,
  Skeleton, Avatar, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ComputerIcon from '@mui/icons-material/Computer';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  PENDING: { label: 'En attente', color: '#E65100', bgColor: '#FFF3E0', icon: <ScheduleIcon sx={{ fontSize: 18 }} /> },
  APPROVED: { label: 'Approuvée', color: '#2E7D32', bgColor: '#E8F5E9', icon: <CheckCircleIcon sx={{ fontSize: 18 }} /> },
  REJECTED: { label: 'Refusée', color: '#C62828', bgColor: '#FFEBEE', icon: <CancelIcon sx={{ fontSize: 18 }} /> },
  FULFILLED: { label: 'Livrée', color: '#1565C0', bgColor: '#E3F2FD', icon: <LocalShippingIcon sx={{ fontSize: 18 }} /> },
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  LOW: { label: 'Basse', color: '#1565C0', bgColor: '#E3F2FD' },
  MEDIUM: { label: 'Moyenne', color: '#E65100', bgColor: '#FFF3E0' },
  HIGH: { label: 'Haute', color: '#C62828', bgColor: '#FFEBEE' },
  CRITICAL: { label: 'Urgente', color: '#B71C1C', bgColor: '#FFCDD2' },
};

export default function DemandesEquipementPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const fetchData = async () => {
    try {
      const [reqRes, catRes] = await Promise.all([
        fetch('/api/equipment-requests'),
        fetch('/api/categories'),
      ]);
      if (reqRes.ok) setRequests(await reqRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setTitle(''); setDescription(''); setPriority('MEDIUM');
    setQuantity(1); setReason(''); setCategoryId('');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setSnackbar({ open: true, message: 'Titre et description requis', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/equipment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority, quantity, reason, categoryId: categoryId || null }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: 'Demande envoyée avec succès !', severity: 'success' });
        setDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        setSnackbar({ open: true, message: 'Erreur lors de l\'envoi', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Erreur réseau', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/equipment-requests/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSnackbar({ open: true, message: 'Demande supprimée', severity: 'success' });
        fetchData();
      }
    } catch {
      setSnackbar({ open: true, message: 'Erreur', severity: 'error' });
    }
  };

  const pending = requests.filter(r => r.status === 'PENDING');
  const others = requests.filter(r => r.status !== 'PENDING');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Skeleton variant="rounded" height={100} />
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
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2,
      }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(227,30,36,0.12) 0%, rgba(196,16,24,0.03) 100%)' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1A2E' }}>
            📋 Demandes d'Équipement
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: '#555555', fontWeight: 500, mt: 0.5 }}>
            Demandez un nouvel équipement pour votre poste de travail
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{
            background: 'linear-gradient(90deg, #E31E24, #C41018)',
            borderRadius: '12px', textTransform: 'none', fontWeight: 700,
            px: 3, py: 1.2,
            boxShadow: '0 4px 14px rgba(227, 30, 36, 0.35)',
            '&:hover': { boxShadow: '0 6px 20px rgba(227, 30, 36, 0.5)' },
            position: 'relative', zIndex: 1,
          }}
        >
          Nouvelle Demande
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {Object.entries(statusConfig).map(([key, sc]) => {
          const count = requests.filter(r => r.status === key).length;
          return (
            <Paper key={key} elevation={0} sx={{
              flex: '1 1 150px', borderRadius: 3, p: 2.5,
              borderLeft: `4px solid ${sc.color}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: sc.bgColor, color: sc.color, width: 40, height: 40 }}>
                  {sc.icon}
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1A2E', lineHeight: 1 }}>{count}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#999' }}>{sc.label}</Typography>
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Paper elevation={0} sx={{ borderRadius: 3, p: 6, textAlign: 'center' }}>
          <ComputerIcon sx={{ fontSize: 60, color: '#ddd', mb: 2 }} />
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#999' }}>
            Aucune demande pour le moment
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#bbb', mt: 0.5 }}>
            Cliquez sur "Nouvelle Demande" pour commencer
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...pending, ...others].map((req) => {
            const sc = statusConfig[req.status] || statusConfig.PENDING;
            const pc = priorityConfig[req.priority] || priorityConfig.MEDIUM;
            return (
              <Paper key={req.id} elevation={0} sx={{
                borderRadius: 3, overflow: 'hidden',
                borderLeft: `4px solid ${sc.color}`,
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateX(4px)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
              }}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Avatar sx={{ bgcolor: sc.bgColor, color: sc.color, width: 36, height: 36 }}>
                          {sc.icon}
                        </Avatar>
                        <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#1A1A2E' }}>
                          {req.title}
                        </Typography>
                        {req.quantity > 1 && (
                          <Chip label={`x${req.quantity}`} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: '#f0f0f0' }} />
                        )}
                      </Box>
                      <Typography sx={{ fontSize: '0.85rem', color: '#666', ml: 6.5 }}>
                        {req.description}
                      </Typography>
                      {req.adminResponse && (
                        <Box sx={{ ml: 6.5, mt: 1, p: 1.5, borderRadius: 2, bgcolor: req.status === 'APPROVED' ? '#E8F5E9' : req.status === 'REJECTED' ? '#FFEBEE' : '#f5f5f5' }}>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#555' }}>
                            💬 Réponse : {req.adminResponse}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
                      <Chip label={sc.label} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', bgcolor: sc.bgColor, color: sc.color }} />
                      <Chip label={pc.label} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', bgcolor: pc.bgColor, color: pc.color }} />
                      {req.categoryName && (
                        <Chip label={req.categoryName} size="small" sx={{ fontSize: '0.65rem', bgcolor: '#f0f0f0' }} />
                      )}
                      {req.status === 'PENDING' && (
                        <IconButton size="small" onClick={() => handleDelete(req.id)} sx={{ color: '#ccc', '&:hover': { color: '#F44336' } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.7rem', color: '#bbb', ml: 6.5, mt: 1 }}>
                    Créée le {new Date(req.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    {req.handledAt && ` · Traitée le ${new Date(req.handledAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`}
                    {req.handledBy && ` par ${req.handledBy}`}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* New Request Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SendIcon sx={{ color: '#E31E24' }} />
          Nouvelle Demande d'Équipement
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Titre de la demande"
              placeholder="Ex: Ordinateur portable pour développement"
              fullWidth value={title} onChange={(e) => setTitle(e.target.value)}
              required
            />
            <TextField
              label="Description détaillée"
              placeholder="Décrivez précisément l'équipement dont vous avez besoin..."
              fullWidth multiline rows={3}
              value={description} onChange={(e) => setDescription(e.target.value)}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Priorité</InputLabel>
                <Select value={priority} label="Priorité" onChange={(e) => setPriority(e.target.value)}>
                  <MenuItem value="LOW">Basse</MenuItem>
                  <MenuItem value="MEDIUM">Moyenne</MenuItem>
                  <MenuItem value="HIGH">Haute</MenuItem>
                  <MenuItem value="CRITICAL">Urgente</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Quantité"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                sx={{ width: 120 }}
                slotProps={{ input: { inputProps: { min: 1 } } }}
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Catégorie (optionnel)</InputLabel>
              <Select value={categoryId} label="Catégorie (optionnel)" onChange={(e) => setCategoryId(e.target.value)}>
                <MenuItem value="">Aucune</MenuItem>
                {categories.map((cat: any) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Justification (optionnel)"
              placeholder="Pourquoi avez-vous besoin de cet équipement ?"
              fullWidth multiline rows={2}
              value={reason} onChange={(e) => setReason(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saving || !title.trim() || !description.trim()}
              startIcon={<SendIcon />}
              sx={{
                background: 'linear-gradient(90deg, #E31E24, #C41018)',
                borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.3,
                '&:hover': { boxShadow: '0 6px 20px rgba(227, 30, 36, 0.4)' },
                '&.Mui-disabled': { background: 'rgba(0,0,0,0.12)' },
              }}
            >
              {saving ? 'Envoi en cours...' : 'Envoyer la demande'}
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
