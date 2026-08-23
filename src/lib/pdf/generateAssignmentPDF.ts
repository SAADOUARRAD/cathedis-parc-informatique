import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface AssignmentPDFData {
  assignmentId: string;
  recipientName: string;
  recipientEmail?: string;
  recipientDepartment?: string;
  equipmentName: string;
  serialNumber?: string;
  categoryName?: string;
  assignedBy?: string;
  assignedDate: string;
  signatureBase64?: string;
}

export function generateAssignmentPDF(data: AssignmentPDFData) {
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

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.text('CATHEDIS', 15, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('LIVRAISON EXPRESS & LOGISTIQUE', 15, 25);
  doc.text('Gestion du Parc Informatique', 15, 29);

  // Document Title Badge Right
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(pageWidth - 85, 12, 70, 20, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text("BON D'AFFECTATION", pageWidth - 80, 19);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Réf: PV-AFF-${data.assignmentId.slice(-8).toUpperCase()}`, pageWidth - 80, 24);
  doc.text(`Date: ${data.assignedDate}`, pageWidth - 80, 28);

  // Horizontal Divider Line
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(15, 35, pageWidth - 15, 35);

  // --- Section 1: Informations du Bénéficiaire ---
  let y = 43;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('1. INFORMATIONS DU BÉNÉFICIAIRE', 15, y);

  y += 5;
  autoTable(doc, {
    startY: y,
    theme: 'plain',
    styles: { fontSize: 9.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [100, 100, 100], cellWidth: 40 },
      1: { textColor: [15, 23, 42] },
    },
    body: [
      ['Nom & Prénom :', data.recipientName],
      ['Email professionnel :', data.recipientEmail || 'Non renseigné'],
      ['Département / Service :', data.recipientDepartment || 'Général'],
    ],
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 8;

  // --- Section 2: Équipement Affecté ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('2. ÉQUIPEMENT INFORMATIQUE AFFECTÉ', 15, y);

  y += 4;
  autoTable(doc, {
    startY: y,
    head: [['Équipement', 'Numéro de Série (S/N)', 'Catégorie', "Date d'affectation"]],
    body: [
      [
        data.equipmentName,
        data.serialNumber || 'N/A',
        data.categoryName || 'Matériel Informatique',
        data.assignedDate,
      ],
    ],
    headStyles: {
      fillColor: [227, 30, 36],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9.5,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [15, 23, 42],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 10;

  // --- Section 3: Engagements et Responsabilité ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('3. ENGAGEMENTS & CONDITIONS D’UTILISATION', 15, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);

  const termsText = [
    '• Le bénéficiaire reconnaît avoir reçu le matériel informatique ci-dessus mentionné en parfait état de fonctionnement.',
    '• Ce matériel reste la propriété exclusive de CATHEDIS et doit être utilisé uniquement dans le cadre professionnel.',
    '• Le bénéficiaire s’engage à conserver le matériel avec soin, à ne pas le prêter à des tiers non autorisés et à signaler toute panne immédiatement au Support IT Cathedis.',
    '• En cas de départ de l’entreprise ou à la demande du responsable IT, l’équipement doit être restitué sans délai dans son état d’origine.',
  ];

  termsText.forEach((line) => {
    const splitLines = doc.splitTextToSize(line, pageWidth - 30);
    doc.text(splitLines, 15, y);
    y += splitLines.length * 4.5;
  });

  y += 8;

  // --- Section 4: Signatures ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('4. SIGNATURES & VALIDATION', 15, y);

  y += 5;

  // Signature Box Left: Responsable IT
  const boxWidth = 85;
  const boxHeight = 45;

  doc.setDrawColor(220, 225, 230);
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(15, y, boxWidth, boxHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Pour CATHEDIS (Responsable IT)', 20, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Par: ${data.assignedBy || 'Administration IT'}`, 20, y + 12);
  doc.text(`Date: ${data.assignedDate}`, 20, y + 17);

  // Cachet / Stamp Mock Text
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(227, 30, 36);
  doc.text('[ CATHEDIS - IT DEPT ]', 20, y + 32);

  // Signature Box Right: Bénéficiaire
  const rightBoxX = pageWidth - 15 - boxWidth;
  doc.setDrawColor(220, 225, 230);
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(rightBoxX, y, boxWidth, boxHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Le Bénéficiaire (Signature)', rightBoxX + 5, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(data.recipientName, rightBoxX + 5, y + 12);

  // Embed Base64 Signature Image if available!
  if (data.signatureBase64) {
    try {
      doc.addImage(
        data.signatureBase64,
        'PNG',
        rightBoxX + 5,
        y + 15,
        boxWidth - 10,
        22
      );
    } catch (e) {
      console.error('Failed to embed signature image in PDF:', e);
      doc.setTextColor(150, 150, 150);
      doc.text('(Signature Numérique Enregistrée)', rightBoxX + 5, y + 25);
    }
  } else {
    doc.setTextColor(150, 150, 150);
    doc.text('(En attente de signature)', rightBoxX + 5, y + 25);
  }

  // --- Footer ---
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(
    'CATHEDIS Maroc • Document généré automatiquement et sécurisé numériquement',
    pageWidth / 2,
    285,
    { align: 'center' }
  );

  return doc;
}
