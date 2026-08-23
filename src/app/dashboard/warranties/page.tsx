"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CircularProgress, Chip, LinearProgress, Snackbar, Alert, TextField, MenuItem } from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import DataTable from "@/components/shared/DataTable";
import PageHeader from "@/components/shared/PageHeader";
import FormDialog from "@/components/shared/FormDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  equipmentId: z.string().min(1, "L'équipement est requis"),
  provider: z.string().min(1, "Le fournisseur est requis"),
  startDate: z.string().min(1, "La date de début est requise"),
  endDate: z.string().min(1, "La date de fin est requise"),
  conditions: z.string().optional(),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: "La date de fin doit être après la date de début",
  path: ["endDate"],
});

export default function WarrantiesPage() {
  const [warranties, setWarranties] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const wRes = await fetch("/api/warranties");
      const wData = wRes.ok ? await wRes.json() : [];
      setWarranties(wData);

      const eqRes = await fetch("/api/equipments");
      const eqData = eqRes.ok ? await eqRes.json() : [];
      setEquipments(eqData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (data: any) => {
    try {
      const res = await fetch("/api/warranties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur création");
      setSnackbar({ open: true, message: "Garantie créée avec succès", severity: "success" });
      setCreateDialogOpen(false);
      reset();
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: "Erreur lors de la création", severity: "error" });
    }
  };

  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  const columns = [
    { key: "equipment", label: "Équipement", render: (row: any) => row.equipment?.name || "-" },
    { key: "provider", label: "Fournisseur garantie", render: (row: any) => row.provider || "-" },
    { key: "startDate", label: "Début", render: (row: any) => row.startDate ? new Date(row.startDate).toLocaleDateString("fr-FR") : "-" },
    { key: "endDate", label: "Fin", render: (row: any) => row.endDate ? new Date(row.endDate).toLocaleDateString("fr-FR") : "-" },
    { 
      key: "daysRemaining", 
      label: "Jours restants", 
      render: (row: any) => {
        if (!row.endDate) return "-";
        const days = getDaysRemaining(row.endDate);
        if (days < 0) return <Chip label="Expirée" color="default" size="small" />;
        if (days < 30) return <Chip label={`${days}j`} color="error" size="small" />;
        if (days <= 90) return <Chip label={`${days}j`} color="warning" size="small" />;
        return <Chip label={`${days}j`} color="success" size="small" />;
      } 
    },
    {
      key: "progress",
      label: "Progression",
      render: (row: any) => {
        if (!row.startDate || !row.endDate) return "-";
        const start = new Date(row.startDate).getTime();
        const end = new Date(row.endDate).getTime();
        const now = new Date().getTime();
        const total = end - start;
        const elapsed = now - start;
        let percentage = (elapsed / total) * 100;
        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;
        const remaining = 100 - percentage;
        
        let color: "success" | "warning" | "error" = "success";
        if (remaining < 20) color = "error";
        else if (remaining <= 50) color = "warning";

        return (
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Box sx={{ width: "100%", mr: 1 }}>
              <LinearProgress variant="determinate" value={percentage} color={color} />
            </Box>
          </Box>
        );
      }
    }
  ];

  const now = new Date().getTime();
  const total = warranties.length;
  const actives = warranties.filter((w) => new Date(w.endDate).getTime() > now && getDaysRemaining(w.endDate) >= 30).length;
  const expiringSoon = warranties.filter((w) => {
    const days = getDaysRemaining(w.endDate);
    return days >= 0 && days < 30;
  }).length;
  const expired = warranties.filter((w) => new Date(w.endDate).getTime() <= now).length;

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader 
        title="Gestion des garanties" 
        actionLabel="Nouvelle Garantie" 
        onAction={() => setCreateDialogOpen(true)} 
      />

      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        {[
          { title: "Total Garanties", value: total, icon: <SecurityIcon />, color: "#1A1A2E", bg: "#F8F9FC" },
          { title: "Actives", value: actives, icon: <CheckCircleIcon />, color: "#4caf50", bg: "#e8f5e9" },
          { title: "Expire bientôt", value: expiringSoon, icon: <WarningIcon />, color: "#ff9800", bg: "#fff3e0" },
          { title: "Expirées", value: expired, icon: <ErrorIcon />, color: "#f44336", bg: "#ffebee" },
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

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>
      ) : (
        <DataTable data={warranties} columns={columns} />
      )}

      <FormDialog 
        open={createDialogOpen} 
        title="Nouvelle Garantie" 
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
              <MenuItem key={eq.id} value={eq.id}>{eq.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Fournisseur"
            fullWidth
            {...register("provider")}
            error={!!errors.provider}
            helperText={errors.provider?.message as string}
          />
          <TextField
            label="Date début"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            {...register("startDate")}
            error={!!errors.startDate}
            helperText={errors.startDate?.message as string}
          />
          <TextField
            label="Date fin"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            {...register("endDate")}
            error={!!errors.endDate}
            helperText={errors.endDate?.message as string}
          />
          <TextField
            label="Conditions"
            fullWidth
            multiline
            rows={3}
            {...register("conditions")}
          />
        </Box>
      </FormDialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
