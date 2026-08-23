// ============================================================
// Cathedis - Script de Seed
// Données de test réalistes pour la démonstration
// ============================================================

import { PrismaClient, Role, EquipmentStatus, MovementType } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || '3306'),
    user: parsed.username,
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace('/', ''),
  };
}

const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb(dbConfig);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Début du seed...');

  // ============================================================
  // 1. DÉPARTEMENTS
  // ============================================================
  console.log('📁 Création des départements...');
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Direction Générale',
        description: 'Direction générale de Cathedis',
        location: 'Bâtiment A - Étage 3',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Service Informatique',
        description: 'Service IT et support technique',
        location: 'Bâtiment A - Étage 1',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Logistique',
        description: 'Gestion de la chaîne logistique et distribution',
        location: 'Bâtiment B - RDC',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Transport',
        description: 'Planification et suivi des transports',
        location: 'Bâtiment B - Étage 1',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Ressources Humaines',
        description: 'Gestion des ressources humaines',
        location: 'Bâtiment A - Étage 2',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Comptabilité',
        description: 'Service comptable et financier',
        location: 'Bâtiment A - Étage 2',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Commercial',
        description: 'Service commercial et relation clients',
        location: 'Bâtiment C - RDC',
      },
    }),
  ]);

  // ============================================================
  // 2. CATÉGORIES
  // ============================================================
  console.log('🏷️ Création des catégories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Ordinateur Portable', description: 'Laptops et ultrabooks', icon: 'Laptop' },
    }),
    prisma.category.create({
      data: { name: 'Ordinateur Fixe', description: 'Postes de travail fixes', icon: 'DesktopWindows' },
    }),
    prisma.category.create({
      data: { name: 'Écran', description: 'Moniteurs et écrans', icon: 'Monitor' },
    }),
    prisma.category.create({
      data: { name: 'Imprimante', description: 'Imprimantes et multifonctions', icon: 'Print' },
    }),
    prisma.category.create({
      data: { name: 'Serveur', description: 'Serveurs physiques et rack', icon: 'Storage' },
    }),
    prisma.category.create({
      data: { name: 'Téléphone IP', description: 'Téléphones VoIP', icon: 'Phone' },
    }),
    prisma.category.create({
      data: { name: 'Équipement Réseau', description: 'Switchs, routeurs, points d\'accès', icon: 'Router' },
    }),
    prisma.category.create({
      data: { name: 'Scanner', description: 'Scanners de documents', icon: 'Scanner' },
    }),
    prisma.category.create({
      data: { name: 'Accessoire', description: 'Claviers, souris, casques, etc.', icon: 'Keyboard' },
    }),
    prisma.category.create({
      data: { name: 'Tablette', description: 'Tablettes et appareils mobiles', icon: 'TabletMac' },
    }),
  ]);

  // ============================================================
  // 3. FOURNISSEURS
  // ============================================================
  console.log('🏢 Création des fournisseurs...');
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Dell Technologies',
        contactName: 'Jean Dupont',
        email: 'commercial@dell-partner.fr',
        phone: '+33 1 44 55 66 77',
        address: '1 Rond-Point Benjamin Franklin, 34000 Montpellier',
        website: 'https://www.dell.com/fr',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'HP France',
        contactName: 'Marie Lambert',
        email: 'ventes@hp-partenaire.fr',
        phone: '+33 1 55 66 77 88',
        address: '20 Quai du Point du Jour, 92100 Boulogne-Billancourt',
        website: 'https://www.hp.com/fr',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Lenovo France',
        contactName: 'Pierre Martin',
        email: 'b2b@lenovo-france.fr',
        phone: '+33 1 66 77 88 99',
        address: '12 Rue de la Bourse, 75002 Paris',
        website: 'https://www.lenovo.com/fr',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'LDLC Pro',
        contactName: 'Sophie Leclerc',
        email: 'pro@ldlc.com',
        phone: '+33 4 27 46 60 00',
        address: '2 Rue des Erables, 69760 Limonest',
        website: 'https://www.ldlc-pro.com',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Cisco Systems',
        contactName: 'Thomas Bernard',
        email: 'sales@cisco-partner.fr',
        phone: '+33 1 77 88 99 00',
        address: '11 Rue Camille Desmoulins, 92130 Issy-les-Moulineaux',
        website: 'https://www.cisco.com/fr',
      },
    }),
  ]);

  // ============================================================
  // 4. UTILISATEURS
  // ============================================================
  console.log('👥 Création des utilisateurs...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    // Admin - Responsable IT
    prisma.user.create({
      data: {
        email: 'admin@cathedis.com',
        password: hashedPassword,
        firstName: 'Ahmed',
        lastName: 'Benali',
        phone: '+33 6 12 34 56 78',
        role: Role.ADMIN,
        departmentId: departments[1].id, // Service Informatique
      },
    }),
    // Technicien IT 1
    prisma.user.create({
      data: {
        email: 'technicien1@cathedis.com',
        password: hashedPassword,
        firstName: 'Karim',
        lastName: 'Hadid',
        phone: '+33 6 23 45 67 89',
        role: Role.TECHNICIAN,
        departmentId: departments[1].id,
      },
    }),
    // Technicien IT 2
    prisma.user.create({
      data: {
        email: 'technicien2@cathedis.com',
        password: hashedPassword,
        firstName: 'Sophie',
        lastName: 'Morel',
        phone: '+33 6 34 56 78 90',
        role: Role.TECHNICIAN,
        departmentId: departments[1].id,
      },
    }),
    // Employé - Direction
    prisma.user.create({
      data: {
        email: 'directeur@cathedis.com',
        password: hashedPassword,
        firstName: 'Philippe',
        lastName: 'Durand',
        phone: '+33 6 45 67 89 01',
        role: Role.EMPLOYEE,
        departmentId: departments[0].id,
      },
    }),
    // Employé - Logistique
    prisma.user.create({
      data: {
        email: 'logistique1@cathedis.com',
        password: hashedPassword,
        firstName: 'Fatima',
        lastName: 'Zahra',
        phone: '+33 6 56 78 90 12',
        role: Role.EMPLOYEE,
        departmentId: departments[2].id,
      },
    }),
    // Employé - Transport
    prisma.user.create({
      data: {
        email: 'transport1@cathedis.com',
        password: hashedPassword,
        firstName: 'Nicolas',
        lastName: 'Robert',
        phone: '+33 6 67 89 01 23',
        role: Role.EMPLOYEE,
        departmentId: departments[3].id,
      },
    }),
    // Employé - Commercial
    prisma.user.create({
      data: {
        email: 'commercial1@cathedis.com',
        password: hashedPassword,
        firstName: 'Amina',
        lastName: 'Khelifi',
        phone: '+33 6 78 90 12 34',
        role: Role.EMPLOYEE,
        departmentId: departments[6].id,
      },
    }),
  ]);

  // ============================================================
  // 5. ÉQUIPEMENTS
  // ============================================================
  console.log('💻 Création des équipements...');
  const equipments = await Promise.all([
    // Ordinateurs portables
    prisma.equipment.create({
      data: {
        inventoryNumber: 'CAT-2024-00001',
        name: 'Dell Latitude 5540',
        description: 'Ordinateur portable professionnel 15.6 pouces',
        brand: 'Dell',
        model: 'Latitude 5540',
        serialNumber: 'DELL-SN-2024-001',
        status: EquipmentStatus.ASSIGNED,
        purchaseDate: new Date('2024-01-15'),
        purchasePrice: 1250.00,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        departmentId: departments[0].id,
      },
    }),
    prisma.equipment.create({
      data: {
        inventoryNumber: 'CAT-2024-00002',
        name: 'Dell Latitude 5540',
        description: 'Ordinateur portable professionnel 15.6 pouces',
        brand: 'Dell',
        model: 'Latitude 5540',
        serialNumber: 'DELL-SN-2024-002',
        status: EquipmentStatus.AVAILABLE,
        purchaseDate: new Date('2024-01-15'),
        purchasePrice: 1250.00,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        departmentId: departments[1].id,
      },
    }),
    prisma.equipment.create({
      data: {
        inventoryNumber: 'CAT-2024-00003',
        name: 'HP EliteBook 840 G10',
        description: 'Ultrabook professionnel 14 pouces',
        brand: 'HP',
        model: 'EliteBook 840 G10',
        serialNumber: 'HP-SN-2024-001',
        status: EquipmentStatus.ASSIGNED,
        purchaseDate: new Date('2024-03-20'),
        purchasePrice: 1450.00,
        categoryId: categories[0].id,
        supplierId: suppliers[1].id,
        departmentId: departments[2].id,
      },
    }),
    prisma.equipment.create({
      data: {
        inventoryNumber: 'CAT-2024-00004',
        name: 'Lenovo ThinkPad T14s',
        description: 'Ordinateur portable ultraléger',
        brand: 'Lenovo',
        model: 'ThinkPad T14s Gen 4',
        serialNumber: 'LEN-SN-2024-001',
        status: EquipmentStatus.MAINTENANCE,
        purchaseDate: new Date('2023-11-10'),
        purchasePrice: 1380.00,
        categoryId: categories[0].id,
        supplierId: suppliers[2].id,
        departmentId: departments[1].id,
      },
    }),
    // Ordinateurs fixes
    prisma.equipment.create({
      data: {
        inventoryNumber: 'CAT-2024-00005',
        name: 'Dell OptiPlex 7010',
        description: 'Poste de travail fixe compact',
        brand: 'Dell',
        model: 'OptiPlex 7010',
        serialNumber: 'DELL-SN-2024-003',
        status: EquipmentStatus.ASSIGNED,
        purchaseDate: new Date('2024-02-01'),
        purchasePrice: 890.00,
        categoryId: categories[1].id,
        supplierId: suppliers[0].id,
        departmentId: departments[5].id,
      },
    }),
    // Écrans
    prisma.equipment.create({
      data: {
        inventoryNumber: 'CAT-2024-00006',
        name: 'Dell UltraSharp U2723QE',
        description: 'Écran 27 pouces 4K USB-C',
        brand: 'Dell',
        model: 'U2723QE',
        serialNumber: 'DELL-SN-2024-004',
        status: EquipmentStatus.ASSIGNED,
        purchaseDate: new Date('2024-01-15'),
        purchasePrice: 580.00,
        categoryId: categories[2].id,
        supplierId: suppliers[0].id,
        departmentId: departments[0].id,
      },
    }),
    prisma.equipment.create({
      data: {
        inventoryNumber: 'CAT-2024-00007',
        name: 'HP E24 G5',
        description: 'Écran 24 pouces Full HD',
        brand: 'HP',
        model: 'E24 G5',
        serialNumber: 'HP-SN-2024-002',
        status: EquipmentStatus.AVAILABLE,
        purchaseDate: new Date('2024-04-10'),
        purchasePrice: 280.00,
        categoryId: categories[2].id,
        supplierId: suppliers[1].id,
        departmentId: departments[1].id,
      },
    }),
    // Imprimantes
    prisma.equipment.create({
      data: {
        inventoryNumber: 'CAT-2024-00008',
        name: 'HP LaserJet Pro M404dn',
        description: 'Imprimante laser monochrome réseau',
        brand: 'HP',
        model: 'LaserJet Pro M404dn',
        serialNumber: 'HP-SN-2024-003',
        status: EquipmentStatus.AVAILABLE,
        purchaseDate: new Date('2023-09-05'),
        purchasePrice: 320.00,
        categoryId: categories[3].id,
        supplierId: suppliers[1].id,
        departmentId: departments[4].id,
      },
    }),
    // Serveur
    prisma.equipment.create({
      data: {
        inventoryNumber: 'CAT-2024-00009',
        name: 'Dell PowerEdge R750xs',
        description: 'Serveur rack 2U haute performance',
        brand: 'Dell',
        model: 'PowerEdge R750xs',
        serialNumber: 'DELL-SN-2024-005',
        status: EquipmentStatus.ASSIGNED,
        purchaseDate: new Date('2023-06-15'),
        purchasePrice: 8500.00,
        categoryId: categories[4].id,
        supplierId: suppliers[0].id,
        departmentId: departments[1].id,
      },
    }),
    // Équipement réseau
    prisma.equipment.create({
      data: {
        inventoryNumber: 'CAT-2024-00010',
        name: 'Cisco Catalyst 9200L',
        description: 'Switch réseau 48 ports PoE+',
        brand: 'Cisco',
        model: 'Catalyst 9200L-48P',
        serialNumber: 'CISCO-SN-2024-001',
        status: EquipmentStatus.ASSIGNED,
        purchaseDate: new Date('2023-08-20'),
        purchasePrice: 4200.00,
        categoryId: categories[6].id,
        supplierId: suppliers[4].id,
        departmentId: departments[1].id,
      },
    }),
    // Téléphone IP
    prisma.equipment.create({
      data: {
        inventoryNumber: 'CAT-2024-00011',
        name: 'Cisco IP Phone 8845',
        description: 'Téléphone IP avec écran vidéo',
        brand: 'Cisco',
        model: '8845',
        serialNumber: 'CISCO-SN-2024-002',
        status: EquipmentStatus.ASSIGNED,
        purchaseDate: new Date('2024-01-10'),
        purchasePrice: 350.00,
        categoryId: categories[5].id,
        supplierId: suppliers[4].id,
        departmentId: departments[0].id,
      },
    }),
    // Équipement réformé
    prisma.equipment.create({
      data: {
        inventoryNumber: 'CAT-2023-00012',
        name: 'Dell Latitude 5520 (Ancien)',
        description: 'Ordinateur portable - hors service',
        brand: 'Dell',
        model: 'Latitude 5520',
        serialNumber: 'DELL-SN-2022-001',
        status: EquipmentStatus.DECOMMISSIONED,
        purchaseDate: new Date('2021-05-10'),
        purchasePrice: 1100.00,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        departmentId: departments[1].id,
      },
    }),
  ]);

  // ============================================================
  // 6. GARANTIES
  // ============================================================
  console.log('🛡️ Création des garanties...');
  await Promise.all([
    prisma.warranty.create({
      data: {
        equipmentId: equipments[0].id,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2027-01-15'),
        provider: 'Dell ProSupport',
        terms: 'Garantie 3 ans sur site, intervention J+1',
      },
    }),
    prisma.warranty.create({
      data: {
        equipmentId: equipments[2].id,
        startDate: new Date('2024-03-20'),
        endDate: new Date('2027-03-20'),
        provider: 'HP Care Pack',
        terms: 'Garantie 3 ans, retour atelier',
      },
    }),
    prisma.warranty.create({
      data: {
        equipmentId: equipments[8].id,
        startDate: new Date('2023-06-15'),
        endDate: new Date('2026-06-15'),
        provider: 'Dell ProSupport Plus',
        terms: 'Garantie 3 ans serveur, intervention 4h',
      },
    }),
    // Garantie bientôt expirée (pour tester les alertes)
    prisma.warranty.create({
      data: {
        equipmentId: equipments[4].id,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2026-09-01'), // Expire bientôt
        provider: 'Dell Basic',
        terms: 'Garantie 2 ans, retour usine',
      },
    }),
  ]);

  // ============================================================
  // 7. MOUVEMENTS (historique)
  // ============================================================
  console.log('📋 Création des mouvements...');
  await Promise.all([
    // Achats
    prisma.movement.create({
      data: {
        type: MovementType.PURCHASE,
        equipmentId: equipments[0].id,
        performedById: users[0].id,
        toDepartmentId: departments[1].id,
        notes: 'Achat initial - Lot janvier 2024',
        date: new Date('2024-01-15'),
      },
    }),
    // Affectation
    prisma.movement.create({
      data: {
        type: MovementType.ASSIGNMENT,
        equipmentId: equipments[0].id,
        performedById: users[0].id,
        toDepartmentId: departments[0].id,
        notes: 'Affecté au directeur général',
        date: new Date('2024-01-20'),
      },
    }),
    // Maintenance
    prisma.movement.create({
      data: {
        type: MovementType.MAINTENANCE,
        equipmentId: equipments[3].id,
        performedById: users[1].id,
        notes: 'Problème d\'écran - envoyé en réparation',
        date: new Date('2024-06-15'),
      },
    }),
  ]);

  console.log('✅ Seed terminé avec succès !');
  console.log('');
  console.log('📧 Comptes de test :');
  console.log('   Admin:      admin@cathedis.com / password123');
  console.log('   Technicien: technicien1@cathedis.com / password123');
  console.log('   Employé:    directeur@cathedis.com / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
