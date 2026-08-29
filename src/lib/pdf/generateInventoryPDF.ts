import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InventoryPDFData {
  inventoryId: string;
  sessionName: string;
  description?: string;
  adminName: string;
  startDate: string;
  endDate: string;
  durationFormatted: string;
  stats: {
    totalItems: number;
    found: number;
    notFound: number;
    damaged: number;
    surplus: number;
  };
  items: Array<{
    equipmentName: string;
    serialNumber: string;
    category?: string;
    status: 'FOUND' | 'NOT_FOUND' | 'DAMAGED' | 'SURPLUS';
    notes?: string;
  }>;
}

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

export async function generateInventoryPDF(data: InventoryPDFData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryRed = [227, 30, 36]; // #E31E24
  const darkSlate = [26, 26, 46];    // #1A1A2E

  // --- Header Banner ---
  doc.setFillColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Load Logo2 (Aspect ratio 3:1 -> 45mm x 15mm)
  const logoBase64 = await loadLogoBase64();
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 15, 10, 45, 15);
    } catch (e) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
      doc.text('CATHEDIS', 15, 20);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.text('CATHEDIS', 15, 20);
  }

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('RAPPORT AUDIT & INVENTAIRE DU PARC INFORMATIQUE', 15, 29);
  doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}`, 15, 33);

  // Document Badge Right
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(pageWidth - 90, 11, 75, 23, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('RAPPORT D’INVENTAIRE', pageWidth - 85, 17);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Réf: INV-${data.inventoryId.slice(-8).toUpperCase()}`, pageWidth - 85, 23);
  doc.text(`Durée: ${data.durationFormatted}`, pageWidth - 85, 28);

  // Horizontal Divider Line
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(15, 38, pageWidth - 15, 38);

  // --- Section 1: Informations de la Session ---
  let y = 45;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('1. DÉTAILS DE LA SESSION D’INVENTAIRE', 15, y);

  y += 4;
  autoTable(doc, {
    startY: y,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1.8 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [100, 100, 100], cellWidth: 40 },
      1: { textColor: [15, 23, 42] },
    },
    body: [
      ['Session :', data.sessionName],
      ['Superviseur IT :', data.adminName],
      ['Date Début :', data.startDate],
      ['Date Clôture :', data.endDate],
      ['Durée totale :', data.durationFormatted],
    ],
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 8;

  // --- Section 2: Synthèse Statistiques ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('2. SYNTHÈSE DES CONTRÔLES', 15, y);

  const complianceRate = data.stats.totalItems > 0
    ? Math.round((data.stats.found / data.stats.totalItems) * 100)
    : 0;

  y += 4;
  autoTable(doc, {
    startY: y,
    head: [['Total Contrôlés', 'Présents (Conformes)', 'Absents (Manquants)', 'État Critique / Panne', 'Taux de Conformité']],
    body: [
      [
        data.stats.totalItems.toString(),
        data.stats.found.toString(),
        data.stats.notFound.toString(),
        data.stats.damaged.toString(),
        `${complianceRate}%`,
      ],
    ],
    headStyles: {
      fillColor: [26, 26, 46],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9.5,
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      halign: 'center',
    },
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 10;

  // --- Section 3: Tableau Détaillé des Équipements ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('3. DÉTAIL DES ÉQUIPEMENTS CONTRÔLÉS', 15, y);

  y += 4;

  const tableBody = data.items.map((item) => {
    let statusLabel = 'Présent';
    if (item.status === 'NOT_FOUND') statusLabel = 'ABSENT';
    if (item.status === 'DAMAGED') statusLabel = 'CRITIQUE / PANNE';
    if (item.status === 'SURPLUS') statusLabel = 'SURPLUS';

    return [
      item.equipmentName,
      item.serialNumber || '-',
      item.category || 'Matériel Informatique',
      statusLabel,
      item.notes || '-',
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Équipement', 'N° de Série (S/N)', 'Catégorie', 'Statut Contrôle', 'Anomalie / Remarque']],
    body: tableBody,
    headStyles: {
      fillColor: [227, 30, 36],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      3: { fontStyle: 'bold' },
    },
  });

  // --- Footer ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
      `CATHEDIS Maroc • Document d'Audit Officiel • Page ${i} sur ${pageCount}`,
      pageWidth / 2,
      287,
      { align: 'center' }
    );
  }

  return doc;
}
