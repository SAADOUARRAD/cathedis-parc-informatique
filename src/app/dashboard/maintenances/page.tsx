"use client";

import { useState, useEffect } from "react";
import { 
  Box, Typography, Paper, MenuItem, Select, FormControl, InputLabel,
  TextField, Button, Chip, Snackbar, Alert, Card, CardContent, CircularProgress
} from "@mui/material";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import FormDialog from "@/components/shared/FormDialog";
import StatusChip from "@/components/shared/StatusChip";
import { z } from "zod";

type Maintenance = {
  id: string;
  type: string;
  status: string;
  priority: string;
  description: string;
  reportedDate: string;
  equipment: { name: string; inventoryNumber: string };
  reportedBy: { firstName: string; lastName: string };
  technician?: { firstName: string; lastName: string };
};

const statusMap = {
  REPORTED: { label: "Déclarée", color: "#FB8C00", bgColor: "#FFF3E0" },
  ASSIGNED: { label: "Assignée", color: "#1E88E5", bgColor: "#E3F2FD" },
  IN_PROGRESS: { label: "En cours", color: "#7B1FA2", bgColor: "#F3E5F5" },
  COMPLETED: { label: "Terminée", color: "#43A047", bgColor: "#E8F5E9" },
  CANCELLED: { label: "Annulée", color: "#757575", bgColor: "#F5F5F5" },
};

const createSchema = z.object({
  equipmentId: z.string().min(1, "L'équipement est requis"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  type: z.string(),
  priority: z.string(),
});

export default function MaintenancesPage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  
  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  
  // Forms & Actions
  const [selectedMaintenance, setSelectedMaintenance] = useState<string | null>(null);
  const [equipments, setEquipments] = useState<{id: string, name: string}[]>([]);
  const [technicians, setTechnicians] = useState<{id: string, firstName: string, lastName: string}[]>([]);
  
  const [formData, setFormData] = useState({ equipmentId: "", description: "", type: "CORRECTIVE", priority: "MEDIUM" });
  const [assignData, setAssignData] = useState({ technicianId: "" });
  const [completeData, setCompleteData] = useState({ diagnosis: "", solution: "", cost: "" });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchMaintenances();
  }, [statusFilter, priorityFilter, typeFilter]);

  useEffect(() => {
    if (createOpen) fetchEquipments();
    if (assignOpen) fetchTechnicians();
  }, [createOpen, assignOpen]);

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (typeFilter) params.append("type", typeFilter);
      
      const res = await fetch(`/api/maintenances?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMaintenances(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipments = async () => {
    try {
      const res = await fetch('/api/equipments');
      if (res.ok) setEquipments(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await fetch('/api/users?role=TECHNICIAN');
      if (res.ok) setTechnicians(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      createSchema.parse(formData);
      setFormLoading(true);
      const res = await fetch('/api/maintenances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Erreur lors de la création");
      setSuccess("Ticket de maintenance créé");
      setCreateOpen(false);
      setFormData({ equipmentId: "", description: "", type: "CORRECTIVE", priority: "MEDIUM" });
      fetchMaintenances();
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAction = async (action: string, id: string, data?: any) => {
    try {
      setFormLoading(true);
      const res = await fetch(`/api/maintenances/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'action");
      setSuccess("Action effectuée avec succès");
      
      if (action === 'assign') setAssignOpen(false);
      if (action === 'complete') setCompleteOpen(false);
      
      fetchMaintenances();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const stats = {
    total: maintenances.length,
    reported: maintenances.filter(m => m.status === 'REPORTED').length,
    inProgress: maintenances.filter(m => ['ASSIGNED', 'IN_PROGRESS'].includes(m.status)).length,
    completed: maintenances.filter(m => m.status === 'COMPLETED').length,
    critical: maintenances.filter(m => ['CRITICAL', 'HIGH'].includes(m.priority)).length,
  };

  const columns = [
    { key: 'equipment', label: "Équipement", render: (m: Maintenance) => m.equipment.name },
    { key: 'type', label: "Type", render: (m: Maintenance) => (
      <Chip size="small" label={m.type === 'CORRECTIVE' ? "Corrective" : "Préventive"} 
            sx={{ bgcolor: m.type === 'CORRECTIVE' ? '#FFF3E0' : '#E3F2FD', 
                  color: m.type === 'CORRECTIVE' ? '#E65100' : '#1565C0' }} />
    )},
    { key: 'priority', label: "Priorité", render: (m: Maintenance) => {
      const p = m.priority;
      if (p === 'LOW') return <Chip size="small" label="Basse" sx={{ bgcolor: '#F5F5F5', color: '#757575' }} />;
      if (p === 'MEDIUM') return <Chip size="small" label="Moyenne" sx={{ bgcolor: '#E3F2FD', color: '#1E88E5' }} />;
      if (p === 'HIGH') return <Chip size="small" label="Haute" sx={{ bgcolor: '#FFF3E0', color: '#FB8C00' }} />;
      return <Chip size="small" label="Critique" sx={{ bgcolor: '#FFEBEE', color: '#E53935', animation: 'pulse 2s infinite' }} />;
    }},
    { key: 'status', label: "Statut", render: (m: Maintenance) => (
      <StatusChip status={m.status} statusMap={statusMap as any} />
    )},
    { key: 'reportedBy', label: "Déclaré par", render: (m: Maintenance) => `${m.reportedBy.firstName} ${m.reportedBy.lastName}` },
    { key: 'technician', label: "Technicien", render: (m: Maintenance) => m.technician ? `${m.technician.firstName} ${m.technician.lastName}` : '-' },
    { key: 'reportedDate', label: "Date", render: (m: Maintenance) => new Date(m.reportedDate).toLocaleDateString("fr-FR") },
    { key: 'actions', label: "Actions", render: (m: Maintenance) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        {m.status === 'REPORTED' && (
          <Button size="small" variant="contained" sx={{ bgcolor: '#1E88E5' }}
                  onClick={() => { setSelectedMaintenance(m.id); setAssignOpen(true); }}>
            Assigner
          </Button>
        )}
        {m.status === 'ASSIGNED' && (
          <Button size="small" variant="contained" sx={{ bgcolor: '#7B1FA2' }}
                  onClick={() => handleAction('start', m.id)}>
            Démarrer
          </Button>
        )}
        {m.status === 'IN_PROGRESS' && (
          <Button size="small" variant="contained" color="success"
                  onClick={() => { setSelectedMaintenance(m.id); setCompleteOpen(true); }}>
            Terminer
          </Button>
        )}
        {!['COMPLETED', 'CANCELLED'].includes(m.status) && (
          <Button size="small" variant="outlined" color="error"
                  onClick={() => handleAction('cancel', m.id)}>
            Annuler
          </Button>
        )}
      </Box>
    )}
  ];

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader 
        title="Gestion de la Maintenance" 
        actionLabel="Nouveau Ticket"
        onAction={() => setCreateOpen(true)}
      />

      {/* Stats row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        {[
          { label: "Total Tickets", value: stats.total, color: "#757575" },
          { label: "Déclarées", value: stats.reported, color: "#FB8C00" },
          { label: "En cours", value: stats.inProgress, color: "#1E88E5" },
          { label: "Terminées", value: stats.completed, color: "#43A047" },
          { label: "Critiques", value: stats.critical, color: "#E53935" },
        ].map((stat, idx) => (
          <Card key={idx} sx={{ flex: 1, minWidth: 150 }}>
            <CardContent>
              <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>{stat.label}</Typography>
              <Typography sx={{ color: stat.color, fontSize: 24, fontWeight: 'bold' }}>
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Statut</InputLabel>
          <Select value={statusFilter} label="Statut" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="REPORTED">Déclarée</MenuItem>
            <MenuItem value="ASSIGNED">Assignée</MenuItem>
            <MenuItem value="IN_PROGRESS">En cours</MenuItem>
            <MenuItem value="COMPLETED">Terminée</MenuItem>
            <MenuItem value="CANCELLED">Annulée</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Priorité</InputLabel>
          <Select value={priorityFilter} label="Priorité" onChange={(e) => setPriorityFilter(e.target.value)}>
            <MenuItem value="">Toutes</MenuItem>
            <MenuItem value="LOW">Basse</MenuItem>
            <MenuItem value="MEDIUM">Moyenne</MenuItem>
            <MenuItem value="HIGH">Haute</MenuItem>
            <MenuItem value="CRITICAL">Critique</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)}>
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="CORRECTIVE">Corrective</MenuItem>
            <MenuItem value="PREVENTIVE">Préventive</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
        ) : (
          <DataTable columns={columns} data={maintenances} />
        )}
      </Paper>

      {/* Create Dialog */}
      <FormDialog open={createOpen} title="Nouveau Ticket" onClose={() => setCreateOpen(false)} onSubmit={handleCreate} loading={formLoading}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Équipement</InputLabel>
            <Select value={formData.equipmentId} label="Équipement" onChange={(e) => setFormData({...formData, equipmentId: e.target.value})}>
              {equipments.map(eq => <MenuItem key={eq.id} value={eq.id}>{eq.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={formData.type} label="Type" onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <MenuItem value="CORRECTIVE">Corrective</MenuItem>
                <MenuItem value="PREVENTIVE">Préventive</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priorité</InputLabel>
              <Select value={formData.priority} label="Priorité" onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                <MenuItem value="LOW">Basse</MenuItem>
                <MenuItem value="MEDIUM">Moyenne</MenuItem>
                <MenuItem value="HIGH">Haute</MenuItem>
                <MenuItem value="CRITICAL">Critique</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TextField fullWidth label="Description" multiline rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
        </Box>
      </FormDialog>

      {/* Assign Dialog */}
      <FormDialog open={assignOpen} title="Assigner un Technicien" onClose={() => setAssignOpen(false)} 
                  onSubmit={() => { if (selectedMaintenance) handleAction('assign', selectedMaintenance, assignData); }} loading={formLoading}>
        <Box sx={{ pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Technicien</InputLabel>
            <Select value={assignData.technicianId} label="Technicien" onChange={(e) => setAssignData({ technicianId: e.target.value })}>
              {technicians.map(t => <MenuItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </FormDialog>

      {/* Complete Dialog */}
      <FormDialog open={completeOpen} title="Clôturer la Maintenance" onClose={() => setCompleteOpen(false)} 
                  onSubmit={() => { if (selectedMaintenance) handleAction('complete', selectedMaintenance, completeData); }} loading={formLoading}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField fullWidth label="Diagnostic" multiline rows={3} value={completeData.diagnosis} onChange={(e) => setCompleteData({...completeData, diagnosis: e.target.value})} />
          <TextField fullWidth label="Solution" multiline rows={3} value={completeData.solution} onChange={(e) => setCompleteData({...completeData, solution: e.target.value})} />
          <TextField fullWidth label="Coût" type="number" slotProps={{ input: { startAdornment: '€ ' } }} value={completeData.cost} onChange={(e) => setCompleteData({...completeData, cost: e.target.value})} />
        </Box>
      </FormDialog>

      {/* Add keyframes for critical pulse */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}
