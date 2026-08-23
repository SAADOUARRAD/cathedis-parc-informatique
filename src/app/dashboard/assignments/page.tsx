"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CircularProgress, Snackbar, Alert, Button, IconButton, TextField, MenuItem, Chip } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReplyIcon from "@mui/icons-material/Reply";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import DrawIcon from "@mui/icons-material/Draw";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SignatureCanvasModal from "@/components/shared/SignatureCanvasModal";
import { generateAssignmentPDF } from "@/lib/pdf/generateAssignmentPDF";
import DataTable from "@/components/shared/DataTable";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import FormDialog from "@/components/shared/FormDialog";
import StatusChip from "@/components/shared/StatusChip";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  equipmentId: z.string().min(1, "L'équipement est requis"),
  assignedToId: z.string().min(1, "L'utilisateur est requis"),
  notes: z.string().optional(),
});

const transferSchema = z.object({
  newUserId: z.string().min(1, "Le nouvel utilisateur est requis"),
});

const statusMap = {
  ACTIVE: { label: "Active", color: "#43A047", bgColor: "#E8F5E9" },
  RETURNED: { label: "Restituée", color: "#1E88E5", bgColor: "#E3F2FD" },
  TRANSFERRED: { label: "Transférée", color: "#FB8C00", bgColor: "#FFF3E0" },
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [sigModalOpen, setSigModalOpen] = useState(false);
  const [sigAssignment, setSigAssignment] = useState<any>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const { register: registerTransfer, handleSubmit: handleTransferSubmit, formState: { errors: transferErrors }, reset: resetTransfer } = useForm({
    resolver: zodResolver(transferSchema),
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock API calls
      const assignmentsRes = await fetch("/api/assignments");
      const assignmentsData = assignmentsRes.ok ? await assignmentsRes.json() : [];
      setAssignments(assignmentsData);

      const eqRes = await fetch("/api/equipments?status=AVAILABLE");
      const eqData = eqRes.ok ? await eqRes.json() : [];
      setEquipments(eqData);

      const usersRes = await fetch("/api/users");
      const usersData = usersRes.ok ? await usersRes.json() : [];
      setUsers(usersData);
    } catch (err) {
      setError("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (data: any) => {
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur création");
      setSnackbar({ open: true, message: "Affectation créée avec succès", severity: "success" });
      setCreateDialogOpen(false);
      reset();
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: "Erreur lors de la création", severity: "error" });
    }
  };

  const handleReturn = async (id: string) => {
    try {
      const res = await fetch(`/api/assignments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "return" }),
      });
      if (!res.ok) throw new Error("Erreur restitution");
      setSnackbar({ open: true, message: "Équipement restitué", severity: "success" });
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: "Erreur lors de la restitution", severity: "error" });
    }
  };

  const submitTransfer = async (data: any) => {
    if (!selectedAssignment) return;
    try {
      const res = await fetch(`/api/assignments/${selectedAssignment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "transfer", newUserId: data.newUserId }),
      });
      if (!res.ok) throw new Error("Erreur transfert");
      setSnackbar({ open: true, message: "Équipement transféré", severity: "success" });
      setTransferDialogOpen(false);
      resetTransfer();
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: "Erreur lors du transfert", severity: "error" });
    }
  };

  const handleSaveSignature = async (signatureBase64: string) => {
    if (!sigAssignment) return;
    try {
      const res = await fetch(`/api/assignments/${sigAssignment.id}/signature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureData: signatureBase64 }),
      });

      if (!res.ok) throw new Error("Erreur lors de l'enregistrement de la signature");

      // Generate & Save PDF
      const pdf = generateAssignmentPDF({
        assignmentId: sigAssignment.id,
        recipientName: sigAssignment.assignedTo ? `${sigAssignment.assignedTo.firstName} ${sigAssignment.assignedTo.lastName}` : "Employé",
        recipientEmail: sigAssignment.assignedTo?.email,
        recipientDepartment: sigAssignment.assignedTo?.department?.name || sigAssignment.equipment?.department?.name,
        equipmentName: sigAssignment.equipment?.name || "Équipement",
        serialNumber: sigAssignment.equipment?.serialNumber || sigAssignment.equipment?.inventoryNumber,
        categoryName: sigAssignment.equipment?.category?.name,
        assignedBy: "Administration Cathedis IT",
        assignedDate: sigAssignment.startDate ? new Date(sigAssignment.startDate).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR"),
        signatureBase64,
      });

      pdf.save(`PV_Affectation_${sigAssignment.equipment?.name || 'Equipement'}_${sigAssignment.assignedTo?.lastName || ''}.pdf`);

      setSnackbar({ open: true, message: "Procès-verbal signé et téléchargeable avec succès !", severity: "success" });
      fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Erreur lors de la signature", severity: "error" });
    }
  };

  const handleDownloadPDF = (row: any) => {
    const signatureBase64 = row.signatures && row.signatures.length > 0 ? row.signatures[0].signatureData : undefined;
    const pdf = generateAssignmentPDF({
      assignmentId: row.id,
      recipientName: row.assignedTo ? `${row.assignedTo.firstName} ${row.assignedTo.lastName}` : "Employé",
      recipientEmail: row.assignedTo?.email,
      recipientDepartment: row.assignedTo?.department?.name || row.equipment?.department?.name,
      equipmentName: row.equipment?.name || "Équipement",
      serialNumber: row.equipment?.serialNumber || row.equipment?.inventoryNumber,
      categoryName: row.equipment?.category?.name,
      assignedBy: "Administration Cathedis IT",
      assignedDate: row.startDate ? new Date(row.startDate).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR"),
      signatureBase64,
    });

    pdf.save(`PV_Affectation_${row.equipment?.name || 'Equipement'}_${row.assignedTo?.lastName || ''}.pdf`);
  };

  const columns = [
    { 
      key: "equipment", 
      label: "Équipement", 
      render: (row: any) => (
        <Box>
          <Typography sx={{ fontWeight: "bold" }}>{row.equipment?.name || "Inconnu"}</Typography>
          <Typography variant="body2" color="textSecondary">{row.equipment?.inventoryNumber || ""}</Typography>
        </Box>
      )
    },
    { 
      key: "assignedTo", 
      label: "Affecté à", 
      render: (row: any) => row.assignedTo ? `${row.assignedTo.firstName} ${row.assignedTo.lastName}` : "-" 
    },
    { 
      key: "startDate", 
      label: "Date début", 
      render: (row: any) => row.startDate ? new Date(row.startDate).toLocaleDateString("fr-FR") : "-" 
    },
    { 
      key: "endDate", 
      label: "Date fin", 
      render: (row: any) => row.endDate ? new Date(row.endDate).toLocaleDateString("fr-FR") : "-" 
    },
    { 
      key: "status", 
      label: "Statut", 
      render: (row: any) => <StatusChip status={row.status} statusMap={statusMap} /> 
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => {
        const hasSignature = row.signatures && row.signatures.length > 0;
        return (
          <Box sx={{ display: "flex", gap: 0.8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              label={hasSignature ? "PV Signé ✓" : "Non Signé"}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.72rem',
                bgcolor: hasSignature ? '#E8F5E9' : '#FFF3E0',
                color: hasSignature ? '#2E7D32' : '#E65100',
                border: '1px solid',
                borderColor: hasSignature ? '#A5D6A7' : '#FFE0B2',
              }}
            />
            <Button
              size="small"
              variant="outlined"
              startIcon={<PictureAsPdfIcon />}
              onClick={() => handleDownloadPDF(row)}
              sx={{
                color: '#1A1A2E',
                borderColor: '#CBD5E1',
                fontSize: '0.75rem',
                textTransform: 'none',
                fontWeight: 700,
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#1A1A2E' }
              }}
            >
              PDF PV
            </Button>
            {row.status === "ACTIVE" && (
              <>
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="success" 
                  onClick={() => handleReturn(row.id)}
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  Restituer
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="info" 
                  onClick={() => {
                    setSelectedAssignment(row);
                    setTransferDialogOpen(true);
                  }}
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  Transférer
                </Button>
              </>
            )}
          </Box>
        );
      }
    }
  ];

  const total = assignments.length;
  const actives = assignments.filter((a) => a.status === "ACTIVE").length;
  const returned = assignments.filter((a) => a.status === "RETURNED").length;
  const transferred = assignments.filter((a) => a.status === "TRANSFERRED").length;

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader 
        title="Gestion des affectations" 
        actionLabel="Nouvelle Affectation" 
        onAction={() => setCreateDialogOpen(true)} 
      />

      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        {[
          { title: "Total Affectations", value: total, icon: <AssignmentIcon />, color: "#1A1A2E", bg: "#F8F9FC" },
          { title: "Actives", value: actives, icon: <CheckCircleIcon />, color: "#4caf50", bg: "#e8f5e9" },
          { title: "Restituées", value: returned, icon: <ReplyIcon />, color: "#2196f3", bg: "#e3f2fd" },
          { title: "Transférées", value: transferred, icon: <SwapHorizIcon />, color: "#ff9800", bg: "#fff3e0" },
        ].map((stat, i) => (
          <Card key={i} sx={{ flex: 1, minWidth: 200, p: 2, display: "flex", alignItems: "center", borderRadius: 4, boxShadow: 1 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: stat.bg, color: stat.color, mr: 2 }}>
              {stat.icon}
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">{stat.title}</Typography>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>{stat.value}</Typography>
            </Box>
          </Card>
        ))}
      </Box>

      <DataTable 
        data={assignments} 
        columns={columns} 
      />

      <FormDialog 
        open={createDialogOpen} 
        title="Nouvelle Affectation" 
        onClose={() => setCreateDialogOpen(false)} 
        onSubmit={handleSubmit(handleCreate)}
        submitLabel="Créer"
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            select
            label="Équipement"
            fullWidth
            {...register("equipmentId")}
            error={!!errors.equipmentId}
            helperText={errors.equipmentId?.message as string}
          >
            {equipments.map((eq) => (
              <MenuItem key={eq.id} value={eq.id}>{eq.name} ({eq.inventoryNumber})</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Utilisateur"
            fullWidth
            {...register("assignedToId")}
            error={!!errors.assignedToId}
            helperText={errors.assignedToId?.message as string}
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>{user.firstName} {user.lastName}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={3}
            {...register("notes")}
          />
        </Box>
      </FormDialog>

      <FormDialog 
        open={transferDialogOpen} 
        title="Transférer l'équipement" 
        onClose={() => setTransferDialogOpen(false)} 
        onSubmit={handleTransferSubmit(submitTransfer)}
        submitLabel="Transférer"
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            select
            label="Nouvel utilisateur"
            fullWidth
            {...registerTransfer("newUserId")}
            error={!!transferErrors.newUserId}
            helperText={transferErrors.newUserId?.message as string}
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>{user.firstName} {user.lastName}</MenuItem>
            ))}
          </TextField>
        </Box>
      </FormDialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>

      {/* Signature Canvas Modal */}
      {sigAssignment && (
        <SignatureCanvasModal
          open={sigModalOpen}
          onClose={() => setSigModalOpen(false)}
          recipientName={sigAssignment.assignedTo ? `${sigAssignment.assignedTo.firstName} ${sigAssignment.assignedTo.lastName}` : "Employé"}
          equipmentName={sigAssignment.equipment?.name || "Équipement"}
          serialNumber={sigAssignment.equipment?.serialNumber || sigAssignment.equipment?.inventoryNumber}
          onSaveSignature={handleSaveSignature}
        />
      )}
    </Box>
  );
}
