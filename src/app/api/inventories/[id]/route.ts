import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { InventoryStatus, InventoryItemStatus } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const inventory = await prisma.inventory.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true },
        },
        items: {
          include: {
            equipment: {
              select: { name: true, inventoryNumber: true, status: true },
            },
          },
          orderBy: { scannedAt: 'desc' },
        },
      },
    });

    if (!inventory) {
      return NextResponse.json({ error: "Inventaire non trouvé" }, { status: 404 });
    }

    const totalItems = inventory.items.length;
    const found = inventory.items.filter(i => i.status === 'FOUND').length;
    const notFound = inventory.items.filter(i => i.status === 'NOT_FOUND').length;
    const surplus = inventory.items.filter(i => i.status === 'SURPLUS').length;
    const damaged = inventory.items.filter(i => i.status === 'DAMAGED').length;

    return NextResponse.json({
      ...inventory,
      stats: {
        totalItems,
        found,
        notFound,
        surplus,
        damaged
      }
    });
  } catch (error: any) {
    console.error("GET /api/inventories/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération de l'inventaire" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, ...data } = body;

    const inventory = await prisma.inventory.findUnique({ where: { id } });
    if (!inventory) {
      return NextResponse.json({ error: "Inventaire non trouvé" }, { status: 404 });
    }

    let updatedInventory;

    switch (action) {
      case 'start':
        updatedInventory = await prisma.inventory.update({
          where: { id },
          data: { status: 'IN_PROGRESS' as InventoryStatus, startDate: new Date() },
        });
        await logAudit(session.user.id, "UPDATE", "Inventory");
        break;

      case 'complete':
        updatedInventory = await prisma.inventory.update({
          where: { id },
          data: { status: 'COMPLETED' as InventoryStatus, endDate: new Date() },
        });
        await logAudit(session.user.id, "UPDATE", "Inventory");
        break;

      case 'cancel':
        updatedInventory = await prisma.inventory.update({
          where: { id },
          data: { status: 'CANCELLED' as InventoryStatus },
        });
        await logAudit(session.user.id, "UPDATE", "Inventory");
        break;

      case 'add-item': {
        const { equipmentId, itemStatus, notes } = data;
        await prisma.inventoryItem.create({
          data: {
            inventoryId: id,
            equipmentId,
            status: itemStatus as InventoryItemStatus,
            notes,
            scannedAt: new Date(),
          }
        });
        updatedInventory = await prisma.inventory.findUnique({ where: { id } });
        await logAudit(session.user.id, "CREATE", "Inventory");
        break;
      }

      case 'update-item': {
        const { itemId, itemStatus, notes } = data;
        await prisma.inventoryItem.update({
          where: { id: itemId },
          data: {
            status: itemStatus as InventoryItemStatus,
            notes,
            scannedAt: new Date(),
          }
        });
        updatedInventory = await prisma.inventory.findUnique({ where: { id } });
        break;
      }

      case 'auto-populate': {
        const existingItems = await prisma.inventoryItem.findMany({
          where: { inventoryId: id },
          select: { equipmentId: true }
        });
        const existingEquipIds = existingItems.map(i => i.equipmentId).filter(Boolean) as string[];

        const equipments = await prisma.equipment.findMany({
          where: { id: { notIn: existingEquipIds } },
          select: { id: true }
        });

        if (equipments.length > 0) {
          const itemsData = equipments.map(eq => ({
            inventoryId: id,
            equipmentId: eq.id,
            status: 'NOT_FOUND' as InventoryItemStatus,
            scannedAt: new Date(),
          }));
          await prisma.inventoryItem.createMany({ data: itemsData });
          await logAudit(session.user.id, "UPDATE", "Inventory");
        }
        return NextResponse.json({ count: equipments.length });
      }

      default:
        updatedInventory = await prisma.inventory.update({
          where: { id },
          data: {
            name: data.name,
            description: data.description,
          },
        });
        break;
    }

    return NextResponse.json(updatedInventory || { success: true });
  } catch (error: any) {
    console.error("PUT /api/inventories/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour de l'inventaire" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const inventory = await prisma.inventory.findUnique({ where: { id } });
    if (!inventory) {
      return NextResponse.json({ error: "Inventaire non trouvé" }, { status: 404 });
    }

    if (inventory.status !== 'PLANNED' && inventory.status !== 'CANCELLED') {
      return NextResponse.json({ error: "Seuls les inventaires planifiés ou annulés peuvent être supprimés" }, { status: 400 });
    }

    await prisma.inventoryItem.deleteMany({ where: { inventoryId: id } });
    await prisma.inventory.delete({ where: { id } });

    await logAudit(session.user.id, "DELETE", "Inventory");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/inventories/[id] error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression de l'inventaire" }, { status: 500 });
  }
}
