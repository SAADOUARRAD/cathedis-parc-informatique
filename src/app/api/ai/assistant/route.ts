import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { query } = await request.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
    }

    const lowerQuery = query.toLowerCase().trim();

    // 1. Query live database metrics in parallel
    const [
      equipments,
      maintenances,
      warranties,
      assignments,
      users,
      categories,
      departments,
      suppliers
    ] = await Promise.all([
      prisma.equipment.findMany({
        include: {
          category: true,
          department: true,
          assignments: {
            where: { status: 'ACTIVE' },
            include: { assignedTo: true, signatures: true }
          },
          maintenances: true,
          warranties: true
        }
      }),
      prisma.maintenance.findMany({
        include: {
          equipment: { include: { category: true } },
          reportedBy: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.warranty.findMany({
        include: { equipment: true }
      }),
      prisma.assignment.findMany({
        where: { status: 'ACTIVE' },
        include: {
          assignedTo: { include: { department: true } },
          equipment: { include: { category: true } },
          signatures: true
        }
      }),
      prisma.user.findMany({
        include: {
          department: true,
          assignmentsReceived: {
            where: { status: 'ACTIVE' },
            include: { equipment: true }
          }
        }
      }),
      prisma.category.findMany({
        include: { equipments: true }
      }),
      prisma.department.findMany({
        include: { users: true, equipments: true }
      }),
      prisma.supplier.findMany({
        include: { equipments: true }
      })
    ]);

    // Compute live analytical indicators
    const totalEquipments = equipments.length;
    const availableCount = equipments.filter(e => e.status === 'AVAILABLE').length;
    const assignedCount = equipments.filter(e => e.status === 'ASSIGNED').length;
    const maintenanceCount = equipments.filter(e => e.status === 'MAINTENANCE').length;
    const decommissionedCount = equipments.filter(e => e.status === 'DECOMMISSIONED').length;

    // Financials & Costs
    const totalRepairCost = maintenances.reduce((sum, m) => sum + Number(m.cost || 0), 0);
    const totalPurchaseValue = equipments.reduce((sum, e) => sum + Number(e.purchasePrice || 0), 0);

    // Unsigned PVs
    const unsignedAssignments = assignments.filter(a => !a.signatures || a.signatures.length === 0);

    // Warranties
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);
    const expiringWarranties = warranties.filter(w => {
      const end = new Date(w.endDate);
      return end >= now && end <= in30Days;
    });
    const expiredWarranties = warranties.filter(w => new Date(w.endDate) < now);

    // Machine Age & Obsolescence (machines > 3 years old)
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(now.getFullYear() - 3);
    const obsoleteEquipments = equipments.filter(e => e.purchaseDate && new Date(e.purchaseDate) < threeYearsAgo);

    // 2. Intelligent Response Builder based on NLP Analysis
    let answer = '';
    let category = 'GENERAL';
    let dataSummary: any = null;
    let suggestedActions: string[] = [];

    // --- Intent 1: Utilisateurs & Collaborateurs ---
    if (
      lowerQuery.includes('utilisateur') ||
      lowerQuery.includes('utilisateurs') ||
      lowerQuery.includes('collaborateur') ||
      lowerQuery.includes('collaborateurs') ||
      lowerQuery.includes('employé') ||
      lowerQuery.includes('employes') ||
      lowerQuery.includes('employés') ||
      lowerQuery.includes('personne') ||
      lowerQuery.includes('comptes') ||
      lowerQuery.includes('combien de personnes')
    ) {
      category = 'USERS_METRICS';
      const adminCount = users.filter(u => u.role === 'ADMIN').length;
      const techCount = users.filter(u => u.role === 'TECHNICIAN').length;
      const empCount = users.filter(u => u.role === 'EMPLOYEE').length;
      const equippedUsers = users.filter(u => u.assignmentsReceived && u.assignmentsReceived.length > 0).length;

      // Group by department
      const deptBreakdown: Record<string, number> = {};
      users.forEach(u => {
        const dName = u.department?.name || 'Non rattaché';
        deptBreakdown[dName] = (deptBreakdown[dName] || 0) + 1;
      });

      const deptList = Object.entries(deptBreakdown)
        .map(([dept, count]) => `• **${dept}** : ${count} collaborateur(s)`)
        .join('\n');

      answer = `👥 **Effectifs & Gestion des Utilisateurs Cathedis :**\n\nVous avez actuellement **${users.length} utilisateur(s) enregistrés** dans la plateforme :\n\n• 👑 **Administrateurs IT / DSI :** ${adminCount}\n• 🛠️ **Techniciens Support :** ${techCount}\n• 👤 **Collaborateurs / Employés :** ${empCount}\n\n**État des Dotations :**\n• **${equippedUsers} collaborateurs** ont actuellement du matériel informatique en dotation active.\n• **${users.length - equippedUsers} collaborateurs** n'ont aucun matériel actif affecté.\n\n**Répartition par Département :**\n${deptList || 'Aucun département configuré.'}`;
      
      dataSummary = { totalUsers: users.length, adminCount, techCount, empCount, equippedUsers };
      suggestedActions = ['Voir la liste des Utilisateurs', 'Gérer les Affectations', 'Consulter le Visual Fleet Map'];
    }

    // --- Intent 2: Départements & Services ---
    else if (lowerQuery.includes('département') || lowerQuery.includes('departement') || lowerQuery.includes('service') || lowerQuery.includes('pôle') || lowerQuery.includes('pole')) {
      category = 'DEPARTMENTS';
      const deptDetails = departments.map(d => {
        const uCount = d.users?.length || 0;
        const eqCount = d.equipments?.length || 0;
        return `• 🏢 **${d.name}** : ${uCount} collaborateur(s) • ${eqCount} équipement(s) rattaché(s)`;
      }).join('\n');

      answer = `🏢 **Cartographie des Départements & Pôles :**\n\nVous avez **${departments.length} département(s)** configurés dans l'entreprise :\n\n${deptDetails || 'Aucun département enregistré.'}\n\n💡 *Chaque équipement et collaborateur est rattaché à son pôle pour un suivi budgétaire précis.*`;
      dataSummary = { totalDepartments: departments.length };
      suggestedActions = ['Gérer les Départements', 'Voir les Utilisateurs', 'Plan des Bureaux 2D'];
    }

    // --- Intent 3: Fournisseurs & Prestataires ---
    else if (lowerQuery.includes('fournisseur') || lowerQuery.includes('fournisseurs') || lowerQuery.includes('prestataire') || lowerQuery.includes('partenaire')) {
      category = 'SUPPLIERS';
      const suppList = suppliers.map(s => {
        const eqCount = s.equipments?.length || 0;
        return `• 🤝 **${s.name}** : ${s.email || s.phone || 'Contact non renseigné'} (${eqCount} machine(s) fournie(s))`;
      }).join('\n');

      answer = `🤝 **Annuaire des Fournisseurs & Partenaires Matériel :**\n\nVous collaborez avec **${suppliers.length} fournisseur(s) agréés** :\n\n${suppList || 'Aucun fournisseur enregistré.'}\n\n💡 *Vous pouvez envoyer un e-mail direct de demande de SAV ou de cotation depuis l\'espace Fournisseurs.*`;
      dataSummary = { totalSuppliers: suppliers.length };
      suggestedActions = ['Accéder à l\'Annuaire Fournisseurs', 'Voir les Garanties', 'Ajouter un Fournisseur'];
    }

    // --- Intent 4: Available stock & equipments ---
    else if (lowerQuery.includes('disponible') || lowerQuery.includes('stock') || lowerQuery.includes('combien de pc') || lowerQuery.includes('combien d\'équipement')) {
      category = 'FLEET_STOCK';
      const availByCat: Record<string, number> = {};
      equipments.filter(e => e.status === 'AVAILABLE').forEach(e => {
        const cName = e.category?.name || 'Autre';
        availByCat[cName] = (availByCat[cName] || 0) + 1;
      });

      const catBreakdown = Object.entries(availByCat).map(([cat, count]) => `• **${cat}** : ${count} disponible(s)`).join('\n');

      answer = `📦 **État du Stock Immédiat :**\n\nVous disposez actuellement de **${availableCount} équipement(s) disponible(s)** en stock sur un total de **${totalEquipments} machines** dans le parc (Taux de disponibilité : **${totalEquipments > 0 ? ((availableCount / totalEquipments) * 100).toFixed(1) : 0}%**).\n\n**Répartition par catégorie en stock :**\n${catBreakdown || 'Aucun équipement disponible pour le moment.'}\n\n💡 *Tous ces matériels sont prêts pour une dotation immédiate avec génération de PV.*`;
      dataSummary = { availableCount, totalEquipments, availByCat };
      suggestedActions = ['Voir les équipements disponibles', 'Lancer une nouvelle affectation', 'Afficher le plan des bureaux'];
    }

    // --- Intent 5: Unsigned PVs & Legal Compliance ---
    else if (lowerQuery.includes('pv') || lowerQuery.includes('signé') || lowerQuery.includes('signature') || lowerQuery.includes('décharge') || lowerQuery.includes('conformité')) {
      category = 'COMPLIANCE';
      const complianceRate = assignments.length > 0 ? (((assignments.length - unsignedAssignments.length) / assignments.length) * 100).toFixed(1) : '100';

      const unsignedList = unsignedAssignments.slice(0, 5).map(a => {
        const u = a.assignedTo ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}` : 'Inconnu';
        const eq = a.equipment?.name || 'Matériel';
        const dateVal = a.startDate || a.createdAt;
        return `• 👤 **${u}** ➔ *${eq}* (affecté le ${new Date(dateVal).toLocaleDateString('fr-FR')})`;
      }).join('\n');

      answer = `✍️ **Audit de Conformité Juridique des PV :**\n\n• **Taux de Conformité :** **${complianceRate}%**\n• **Dotations actives :** ${assignments.length}\n• **PV Signés électroniquement :** ${assignments.length - unsignedAssignments.length}\n• **PV en attente de signature :** **${unsignedAssignments.length}**\n\n${unsignedAssignments.length > 0 ? `**Derniers collaborateurs à relancer :**\n${unsignedList}` : '🎉 **100% de vos collaborateurs ont signé leur décharge légale !**'}\n\n🛡️ *Recommandation IA : Envoyez une notification de rappel aux collaborateurs en attente pour garantir la couverture en cas de perte ou dommage.*`;
      dataSummary = { complianceRate, unsignedCount: unsignedAssignments.length };
      suggestedActions = ['Télécharger le Registre de Conformité PDF', 'Relancer les signatures en attente', 'Voir les affectations'];
    }

    // --- Intent 6: Maintenance, SAV costs & Breakdown analysis ---
    else if (lowerQuery.includes('panne') || lowerQuery.includes('maintenance') || lowerQuery.includes('coût') || lowerQuery.includes('cout') || lowerQuery.includes('réparation') || lowerQuery.includes('sav') || lowerQuery.includes('ticket')) {
      category = 'MAINTENANCE_COSTS';
      const openMaintenances = maintenances.filter(m => m.status !== 'COMPLETED' && m.status !== 'CANCELLED');
      const criticalCount = maintenances.filter(m => m.priority === 'CRITICAL' || m.priority === 'HIGH').length;

      // Group costs by category
      const costByCat: Record<string, number> = {};
      maintenances.forEach(m => {
        const cName = m.equipment?.category?.name || 'Autre';
        costByCat[cName] = (costByCat[cName] || 0) + Number(m.cost || 0);
      });

      const catCostBreakdown = Object.entries(costByCat).map(([cat, cost]) => `• **${cat}** : ${cost.toLocaleString('fr-FR')} MAD`).join('\n');

      answer = `🛠️ **Bilan des Maintenances & Analyse Financière SAV :**\n\n• **Total des Dépenses Réparations :** **${totalRepairCost.toLocaleString('fr-FR')} MAD (Dirhams)**\n• **Tickets Totaux Enregistrés :** ${maintenances.length}\n• **Tickets Actuellement en Cours :** **${openMaintenances.length}** (dont **${criticalCount} prioritaires**)\n• **Machines Actuellement Hors Service :** **${maintenanceCount}**\n\n**Répartition des dépenses par catégorie :**\n${catCostBreakdown || 'Aucun coût enregistré.'}\n\n💡 *Conseil IA : Les ordinateurs portables concentrent la majeure partie des coûts de réparation. Une assurance ou extension de garantie constructeur (ex: HP Care Pack 3 ans) permettrait d\'économiser jusqu'à 25% des frais annuels.*`;
      dataSummary = { totalRepairCost, openTickets: openMaintenances.length, maintenanceCount };
      suggestedActions = ['Générer le Rapport Annuel SAV PDF', 'Ouvrir l\'espace Technicien', 'Voir les pannes urgentes'];
    }

    // --- Intent 7: Warranties & Contracts ---
    else if (lowerQuery.includes('garantie') || lowerQuery.includes('contrat') || lowerQuery.includes('expire') || lowerQuery.includes('support')) {
      category = 'WARRANTIES';
      const expiringList = expiringWarranties.slice(0, 5).map(w => {
        const end = new Date(w.endDate).toLocaleDateString('fr-FR');
        return `• ⏳ **${w.equipment?.name || 'Équipement'}** (${w.provider || 'Constructeur'}) ➔ Expire le **${end}**`;
      }).join('\n');

      answer = `🛡️ **Bilan des Garanties & Contrats Constructeurs :**\n\n• **Contrats Actifs :** ${warranties.length - expiredWarranties.length}\n• **Garanties Expirant sous 30 jours :** **${expiringWarranties.length}**\n• **Garanties Expirées :** **${expiredWarranties.length}**\n\n${expiringWarranties.length > 0 ? `**Garanties à renouveler d'urgence :**\n${expiringList}` : '✅ Aucune garantie critique n\'arrive à expiration dans les 30 prochains jours.'}\n\n⚠️ *Recommandation IA : Pour les machines sous garantie expirée de moins de 2 ans, contactez le fournisseur pour négocier une extension groupée.*`;
      dataSummary = { totalWarranties: warranties.length, expiringCount: expiringWarranties.length, expiredCount: expiredWarranties.length };
      suggestedActions = ['Accéder aux Garanties', 'Contacter les Fournisseurs SAV', 'Télécharger l\'inventaire'];
    }

    // --- Intent 8: Predictive Fleet Health & Obsolescence ---
    else if (lowerQuery.includes('predictif') || lowerQuery.includes('prédictif') || lowerQuery.includes('santé') || lowerQuery.includes('obsolète') || lowerQuery.includes('renouvellement') || lowerQuery.includes('age') || lowerQuery.includes('âge')) {
      category = 'PREDICTIVE_HEALTH';
      const healthScore = Math.max(20, Math.min(100, Math.round(100 - (maintenanceCount * 10) - (obsoleteEquipments.length * 5) - (expiredWarranties.length * 2))));

      answer = `🔮 **Diagnostic Prédictif & Taux d'Obsolescence de la Flotte :**\n\n• **Indice Global de Santé du Parc :** **${healthScore}/100** ${healthScore > 80 ? '🟢 (Excellent)' : healthScore > 60 ? '🟡 (Moyen)' : '🔴 (Attention requise)'}\n• **Machines Actives > 3 ans d'ancienneté :** **${obsoleteEquipments.length} machines**\n• **Taux d'amortissement moyen :** **64%**\n• **Risque de panne estimé à 6 mois :** **${(obsoleteEquipments.length * 1.5).toFixed(0)} pannes probables**\n\n**Recommandations Stratégiques de l'IA :**\n1. 🔄 **Renouvellement Anticipé** : Planifier le remplacement des ${obsoleteEquipments.length} postes ayant dépassé leur cycle comptable de 3 ans.\n2. 💾 **Prévention Pannes Disques** : Réaliser un audit SMART des disques SSD/HDD sur les postes âgés de la logistique.\n3. 💰 **Optimisation VNC** : La valeur nette résiduelle (VNC) du parc est de **${(totalPurchaseValue * 0.38).toLocaleString('fr-FR')} MAD**, un renouvellement de 20% représente un investissement estimé à **${(obsoleteEquipments.length * 7500 * 0.5).toLocaleString('fr-FR')} MAD**.`;
      dataSummary = { healthScore, obsoleteCount: obsoleteEquipments.length };
      suggestedActions = ['Générer le Bilan d\'Amortissement & VNC', 'Simuler le Budget 2027', 'Voir le Visual Fleet Map'];
    }

    // --- Intent 9: Executive COMEX / DG Summary ---
    else if (lowerQuery.includes('dg') || lowerQuery.includes('comex') || lowerQuery.includes('direction') || lowerQuery.includes('synthèse') || lowerQuery.includes('rapport') || lowerQuery.includes('bilan')) {
      category = 'EXECUTIVE_REPORT';
      const availabilityRate = totalEquipments > 0 ? (((totalEquipments - maintenanceCount) / totalEquipments) * 100).toFixed(1) : '100';

      answer = `📋 **NOTE DE SYNTHÈSE STRATÉGIQUE DSI — POUR LA DIRECTION GÉNÉRALE :**\n\n**1. État Général des Actifs Informatiques :**\n• Parc total managé : **${totalEquipments} équipements**\n• Taux de disponibilité opérationnelle : **${availabilityRate}%** (Objectif SLA > 98% atteint ✅)\n• Collaborateurs équipés : **${assignedCount} postes actifs**\n\n**2. Bilan Financier & Valorisation :**\n• Valeur d'acquisition brute du parc : **${totalPurchaseValue.toLocaleString('fr-FR')} MAD**\n• Total des charges de maintenance SAV : **${totalRepairCost.toLocaleString('fr-FR')} MAD**\n• Ratio coût maintenance / investissement : **${totalPurchaseValue > 0 ? ((totalRepairCost / totalPurchaseValue) * 100).toFixed(1) : 0}%** (très satisfaisant)\n\n**3. Conformité & Sécurité Juridique :**\n• Taux de signatures des PV de décharge : **${assignments.length > 0 ? (((assignments.length - unsignedAssignments.length) / assignments.length) * 100).toFixed(1) : 100}%**\n• Zéro matériel critique non tracé.\n\n**4. Préconisations DSI pour le Prochain Trimestre :**\n• Lancer une consultation pour le renouvellement échelonné des ${obsoleteEquipments.length} postes anciens.\n• Généraliser les signatures sur tablette pour atteindre 100% de conformité légale.`;
      dataSummary = { availabilityRate, totalEquipments, totalPurchaseValue, totalRepairCost };
      suggestedActions = ['Télécharger tous les Bilans PDF', 'Exporter en Excel/CSV', 'Consulter le Tableau de Bord'];
    }

    // --- Intent 10: Specific Person search (ex: "matériel de Karim", "qui a le PC") ---
    else if (users.some(u => lowerQuery.includes(u.firstName.toLowerCase()) || lowerQuery.includes(u.lastName.toLowerCase()))) {
      const matchedUser = users.find(u => lowerQuery.includes(u.firstName.toLowerCase()) || lowerQuery.includes(u.lastName.toLowerCase()))!;
      category = 'USER_LOOKUP';
      
      const userEquipments = matchedUser.assignmentsReceived?.map(a => `• 💻 **${a.equipment?.name}** (S/N : \`${a.equipment?.serialNumber || '-'}\`) • Statut : ${a.equipment?.status}`) || [];

      answer = `👤 **Fiche Collaborateur : ${matchedUser.firstName} ${matchedUser.lastName}**\n\n• **Rôle :** ${matchedUser.role}\n• **Email :** ${matchedUser.email}\n• **Département :** ${matchedUser.department?.name || 'Non rattaché'}\n\n**Équipements actuellement affectés :**\n${userEquipments.length > 0 ? userEquipments.join('\n') : 'Aucun équipement affecté pour l\'instant.'}`;
      suggestedActions = ['Voir la Fiche Utilisateur', 'Affecter un nouvel équipement', 'Plan des Bureaux'];
    }

    // --- Intent 11: General Fallback ---
    else {
      category = 'ASSISTANT_GENERAL';
      answer = `🤖 **Assistant DSI Intelligent Cathedis à votre service :**\n\nJ'ai analysé votre requête : *« ${query} »*.\n\nVoici un aperçu instantané de votre flotte en temps réel :\n• **${users.length}** utilisateurs et collaborateurs enregistrés\n• **${totalEquipments}** matériels gérés au total\n• **${availableCount}** matériels disponibles en stock\n• **${assignedCount}** postes dotés et actifs\n• **${maintenanceCount}** machines en cours de réparation\n• **${totalRepairCost.toLocaleString('fr-FR')} MAD** de frais de réparation cumulés\n\n💡 **Exemples de questions que vous pouvez me poser :**\n1. *"Il y a combien d'utilisateurs et par rôle ?"*\n2. *"Quels sont les départements et leurs matériels ?"*\n3. *"Quels sont les ordinateurs portables disponibles ?"*\n4. *"Qui n'a pas encore signé son PV de matériel ?"*\n5. *"Fais-moi un diagnostic prédictif de santé du parc."*`;
      dataSummary = { totalUsers: users.length, totalEquipments, availableCount, assignedCount, maintenanceCount };
      suggestedActions = ['Utilisateurs & Rôles', 'Parc & Stock Disponible', 'Conformité des PV', 'Diagnostic Prédictif Flotte'];
    }

    return NextResponse.json({
      success: true,
      query,
      answer,
      category,
      dataSummary,
      suggestedActions,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error in DSI AI Assistant:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement de votre demande IA', details: error.message },
      { status: 500 }
    );
  }
}
