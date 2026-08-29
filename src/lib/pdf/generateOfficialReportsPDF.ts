import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PRIMARY_RED = [227, 30, 36]; // #E31E24
const DARK_SLATE = [26, 26, 46];   // #1A1A2E

async function loadLogoBase64(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/images/logo2.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Failed to load logo:', err);
    return null;
  }
}

function applyHeader(doc: jsPDF, title: string, subtitle: string, refCode: string, logoBase64: string | null) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Red Line
  doc.setFillColor(PRIMARY_RED[0], PRIMARY_RED[1], PRIMARY_RED[2]);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Logo or Fallback Text
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 14, 9, 42, 14);
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(PRIMARY_RED[0], PRIMARY_RED[1], PRIMARY_RED[2]);
      doc.text('CATHEDIS', 14, 18);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(PRIMARY_RED[0], PRIMARY_RED[1], PRIMARY_RED[2]);
    doc.text('CATHEDIS', 14, 18);
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('DIRECTION DES SYSTÈMES D\'INFORMATION • AUDIT IT', 14, 27);
  doc.text(`Édité le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 14, 31);

  // Badge Right
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(pageWidth - 85, 9, 71, 23, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(DARK_SLATE[0], DARK_SLATE[1], DARK_SLATE[2]);
  doc.text(title, pageWidth - 80, 15);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Réf: ${refCode}`, pageWidth - 80, 21);
  doc.text(subtitle, pageWidth - 80, 26);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(14, 35, pageWidth - 14, 35);
}

function applyFooter(doc: jsPDF, pageNumber: number, pageCount: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(140, 140, 140);
  doc.text('Cathedis S.A. • Système Intégré de Gestion de Flotte IT • Document Officiel Confidentiel', 14, pageHeight - 9);
  doc.text(`Page ${pageNumber} / ${pageCount}`, pageWidth - 32, pageHeight - 9);
}

// ============================================================
// 1. 📦 Bilan d'Inventaire Général PDF
// ============================================================
export async function generateInventoryReportPDF(data: any) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const logoBase64 = await loadLogoBase64();
  const pageWidth = doc.internal.pageSize.getWidth();

  applyHeader(doc, 'BILAN INVENTAIRE', 'État Global du Parc', `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`, logoBase64);

  // KPI Summary Cards
  const stats = data.stats;
  const startY = 40;
  const cardW = (pageWidth - 28 - 9) / 4;

  const kpis = [
    { label: 'Total Machines', val: stats.total, color: [37, 99, 235] },
    { label: 'Disponibles', val: stats.available, color: [5, 150, 105] },
    { label: 'Affectées', val: stats.assigned, color: [2, 132, 199] },
    { label: 'En Panne', val: stats.maintenance, color: [217, 119, 6] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardW + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, startY, cardW, 16, 2, 2, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label.toUpperCase(), x + 4, startY + 6);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(String(kpi.val), x + 4, startY + 13);
  });

  // Table
  const tableRows = data.items.map((it: any) => [
    it.inventoryNumber || '-',
    it.name || '-',
    it.category || '-',
    it.serialNumber || '-',
    it.status === 'AVAILABLE' ? 'Disponible' : it.status === 'ASSIGNED' ? 'Affecté' : it.status === 'MAINTENANCE' ? 'En Panne' : 'Réformé',
    it.holderName || it.department || 'Non affecté'
  ]);

  autoTable(doc, {
    startY: 61,
    head: [['N° INV', 'ÉQUIPEMENT', 'FAMILLE', 'N° SÉRIE', 'STATUT', 'AFFECTATION / SERVICE']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 26, 46],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 2.2
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85],
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14, bottom: 20 }
  });

  // Page Numbers
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    applyFooter(doc, i, totalPages);
  }

  doc.save(`cathedis_bilan_inventaire_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ============================================================
// 2. 💰 Rapport d'Amortissement & VNC PDF
// ============================================================
export async function generateFinancialReportPDF(data: any) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const logoBase64 = await loadLogoBase64();
  const pageWidth = doc.internal.pageSize.getWidth();

  applyHeader(doc, 'VALORISATION & VNC', 'Bilan Comptable & TCO', `FIN-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`, logoBase64);

  const stats = data.stats;
  const startY = 40;
  const cardW = (pageWidth - 28 - 9) / 4;

  const kpis = [
    { label: 'Valeur Acquisition', val: `${stats.totalAcquisitionValue} DH`, color: [26, 26, 46] },
    { label: 'Amortissement', val: `${stats.totalCumulativeDepreciation} DH`, color: [217, 119, 6] },
    { label: 'Valeur Nette (VNC)', val: `${stats.totalResidualVNC} DH`, color: [5, 150, 105] },
    { label: 'Dépenses SAV', val: `${stats.totalMaintenanceSpent} DH`, color: [227, 30, 36] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardW + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, startY, cardW, 16, 2, 2, 'FD');

    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label.toUpperCase(), x + 3.5, startY + 5.5);

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.val, x + 3.5, startY + 12.5);
  });

  const tableRows = data.items.map((it: any) => [
    it.name || '-',
    it.category || '-',
    `${it.purchasePrice} DH`,
    `${it.lifespanYears} ans`,
    `${it.ageInMonths} mois`,
    `${it.cumulativeDepreciation} DH`,
    `${it.vnc} DH`
  ]);

  autoTable(doc, {
    startY: 61,
    head: [['MATÉRIEL', 'FAMILLE', 'PRIX ACHAT', 'DURÉE', 'ÂGE', 'AMORTISSEMENT', 'VNC ACTUELLE']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [227, 30, 36],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 2.2
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85],
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14, bottom: 20 }
  });

  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    applyFooter(doc, i, totalPages);
  }

  doc.save(`cathedis_bilan_amortissement_vnc_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ============================================================
// 3. 🛠️ Rapport Annuel de Maintenance PDF
// ============================================================
export async function generateMaintenanceReportPDF(data: any) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const logoBase64 = await loadLogoBase64();
  const pageWidth = doc.internal.pageSize.getWidth();

  applyHeader(doc, 'BILAN MAINTENANCES', 'Rapport SAV & SLA', `SAV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`, logoBase64);

  const stats = data.stats;
  const startY = 40;
  const cardW = (pageWidth - 28 - 9) / 4;

  const kpis = [
    { label: 'Total Pannes', val: stats.total, color: [26, 26, 46] },
    { label: 'Correctives', val: stats.corrective, color: [220, 38, 38] },
    { label: 'Résolues', val: `${stats.completed} (${stats.resolutionRate}%)`, color: [5, 150, 105] },
    { label: 'Coût Réparations', val: `${stats.totalCost} DH`, color: [217, 119, 6] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardW + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, startY, cardW, 16, 2, 2, 'FD');

    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label.toUpperCase(), x + 3.5, startY + 5.5);

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(String(kpi.val), x + 3.5, startY + 12.5);
  });

  const tableRows = data.items.map((it: any) => [
    it.equipmentName || '-',
    it.type === 'CORRECTIVE' ? 'Corrective' : 'Préventive',
    it.priority === 'CRITICAL' ? 'Critique' : it.priority === 'HIGH' ? 'Haute' : 'Normale',
    it.status === 'COMPLETED' ? 'Résolue' : it.status === 'IN_PROGRESS' ? 'En Cours' : 'En Attente',
    it.reporterName || '-',
    it.technicianName || 'Non assigné',
    it.cost ? `${it.cost} DH` : '0 DH'
  ]);

  autoTable(doc, {
    startY: 61,
    head: [['MATÉRIEL', 'TYPE', 'PRIORITÉ', 'STATUT', 'DEMANDEUR', 'TECHNICIEN', 'COÛT']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [2, 132, 199],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 2.2
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85],
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14, bottom: 20 }
  });

  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    applyFooter(doc, i, totalPages);
  }

  doc.save(`cathedis_rapport_maintenances_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ============================================================
// 4. ✍️ Registre de Conformité Légale (PV Signés) PDF
// ============================================================
export async function generateComplianceReportPDF(data: any) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const logoBase64 = await loadLogoBase64();
  const pageWidth = doc.internal.pageSize.getWidth();

  applyHeader(doc, 'CONFORMITÉ DES PV', 'Décharges Numériques', `PV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`, logoBase64);

  const stats = data.stats;
  const startY = 40;
  const cardW = (pageWidth - 28 - 9) / 4;

  const kpis = [
    { label: 'Dotations Actives', val: stats.activeAssignments, color: [37, 99, 235] },
    { label: 'PV Signés', val: stats.signedPV, color: [5, 150, 105] },
    { label: 'En Attente Sign.', val: stats.pendingSignature, color: [217, 119, 6] },
    { label: 'Conformité', val: `${stats.complianceRate}%`, color: stats.complianceRate >= 80 ? [5, 150, 105] : [220, 38, 38] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardW + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, startY, cardW, 16, 2, 2, 'FD');

    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label.toUpperCase(), x + 3.5, startY + 5.5);

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(String(kpi.val), x + 3.5, startY + 12.5);
  });

  const tableRows = data.items.map((it: any) => [
    it.equipmentName || '-',
    it.serialNumber || '-',
    it.userName || '-',
    it.department || '-',
    it.startDate ? new Date(it.startDate).toLocaleDateString('fr-FR') : '-',
    it.isSigned ? 'SIGNE ET CONFORME' : 'EN ATTENTE'
  ]);

  autoTable(doc, {
    startY: 61,
    head: [['ÉQUIPEMENT', 'N° SÉRIE', 'COLLABORATEUR', 'DÉPARTEMENT', 'DATE DOTATION', 'DÉCHARGE NUMÉRIQUE']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 2.2
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85],
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14, bottom: 20 }
  });

  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    applyFooter(doc, i, totalPages);
  }

  doc.save(`cathedis_registre_conformite_pv_${new Date().toISOString().split('T')[0]}.pdf`);
}
