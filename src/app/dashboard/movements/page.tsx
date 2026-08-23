"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CircularProgress, Chip, MenuItem, TextField } from "@mui/material";
import TimelineIcon from "@mui/icons-material/Timeline";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ReplyIcon from "@mui/icons-material/Reply";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import DataTable from "@/components/shared/DataTable";
import PageHeader from "@/components/shared/PageHeader";

const getTypeColor = (type: string) => {
  switch (type) {
    case "PURCHASE": return "success";
    case "ASSIGNMENT": return "info";
    case "RETURN": return "secondary"; // teal equivalent
    case "TRANSFER": return "warning";
    case "MAINTENANCE": return "secondary"; // purple equivalent in some themes
    case "DECOMMISSION": return "error";
    default: return "default";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "PURCHASE": return "Achat";
    case "ASSIGNMENT": return "Affectation";
    case "RETURN": return "Restitution";
    case "TRANSFER": return "Transfert";
    case "MAINTENANCE": return "Maintenance";
    case "DECOMMISSION": return "Réforme";
    default: return type;
  }
};

export default function MovementsPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");

  const fetchData = async (type: string) => {
    setLoading(true);
    try {
      const url = type === "ALL" ? "/api/movements" : `/api/movements?type=${type}`;
      const res = await fetch(url);
      const data = res.ok ? await res.json() : [];
      setMovements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filterType);
  }, [filterType]);

  const columns = [
    { 
      key: "date", 
      label: "Date", 
      render: (row: any) => row.date ? new Date(row.date).toLocaleString("fr-FR") : "-" 
    },
    { 
      key: "type", 
      label: "Type", 
      render: (row: any) => (
        <Chip 
          label={getTypeLabel(row.type)} 
          color={getTypeColor(row.type) as any} 
          size="small" 
        />
      )
    },
    { 
      key: "equipment", 
      label: "Équipement", 
      render: (row: any) => row.equipment?.name || "-" 
    },
    { 
      key: "performedBy", 
      label: "Effectué par", 
      render: (row: any) => row.performedBy ? `${row.performedBy.firstName} ${row.performedBy.lastName}` : "-" 
    },
    { 
      key: "fromDepartment", 
      label: "De", 
      render: (row: any) => row.fromDepartment?.name || "-" 
    },
    { 
      key: "toDepartment", 
      label: "Vers", 
      render: (row: any) => row.toDepartment?.name || "-" 
    },
    { 
      key: "notes", 
      label: "Notes", 
      render: (row: any) => row.notes ? (row.notes.length > 50 ? row.notes.substring(0, 50) + "..." : row.notes) : "-" 
    },
  ];

  const total = movements.length;
  const achats = movements.filter((m) => m.type === "PURCHASE").length;
  const affectations = movements.filter((m) => m.type === "ASSIGNMENT").length;
  const restitutions = movements.filter((m) => m.type === "RETURN").length;
  const transferts = movements.filter((m) => m.type === "TRANSFER").length;

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Historique des mouvements" />

      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        {[
          { title: "Total", value: total, icon: <TimelineIcon />, color: "#1A1A2E", bg: "#F8F9FC" },
          { title: "Achats", value: achats, icon: <ShoppingCartIcon />, color: "#4caf50", bg: "#e8f5e9" },
          { title: "Affectations", value: affectations, icon: <AssignmentIcon />, color: "#2196f3", bg: "#e3f2fd" },
          { title: "Restitutions", value: restitutions, icon: <ReplyIcon />, color: "#009688", bg: "#e0f2f1" },
          { title: "Transferts", value: transferts, icon: <SwapHorizIcon />, color: "#ff9800", bg: "#fff3e0" },
        ].map((stat, i) => (
          <Card key={i} sx={{ flex: 1, minWidth: 150, p: 2, display: "flex", alignItems: "center", borderRadius: 4, boxShadow: 1 }}>
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

      <Box sx={{ mb: 3, maxWidth: 300 }}>
        <TextField
          select
          label="Filtrer par type"
          fullWidth
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          size="small"
        >
          <MenuItem value="ALL">Tous</MenuItem>
          <MenuItem value="PURCHASE">Achat</MenuItem>
          <MenuItem value="ASSIGNMENT">Affectation</MenuItem>
          <MenuItem value="RETURN">Restitution</MenuItem>
          <MenuItem value="TRANSFER">Transfert</MenuItem>
          <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
          <MenuItem value="DECOMMISSION">Réforme</MenuItem>
        </TextField>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>
      ) : (
        <DataTable data={movements} columns={columns} />
      )}
    </Box>
  );
}
