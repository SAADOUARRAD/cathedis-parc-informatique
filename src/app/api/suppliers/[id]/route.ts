import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { auth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        equipments: {
          include: {
            category: true,
            department: true,
            warranties: true,
            maintenances: {
              where: { status: { in: ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'] } }
            }
          },
          orderBy: { purchaseDate: 'desc' }
        },
        _count: {
          select: { equipments: true }
        }
      }
    });

    if (!supplier) {
      return NextResponse.json({ error: "Fournisseur non trouvé" }, { status: 404 });
    }

    const totalSpending = supplier.equipments.reduce((sum, eq) => sum + (Number(eq.purchasePrice) || 0), 0);
    const availableCount = supplier.equipments.filter(e => e.status === 'AVAILABLE').length;
    const assignedCount = supplier.equipments.filter(e => e.status === 'ASSIGNED').length;
    const maintenanceCount = supplier.equipments.filter(e => e.status === 'MAINTENANCE').length;
    const decommissionedCount = supplier.equipments.filter(e => e.status === 'DECOMMISSIONED').length;

    // Parse invoices/purchase orders if stored in notes as JSON or provide structured list
    let invoices: any[] = [];
    if (supplier.notes) {
      try {
        const parsed = JSON.parse(supplier.notes);
        if (Array.isArray(parsed.invoices)) {
          invoices = parsed.invoices;
        }
      } catch {
        // notes is regular text
      }
    }

    // Auto-generate purchase order summaries from equipment purchase dates if no manual invoices
    if (invoices.length === 0 && supplier.equipments.length > 0) {
      const datesMap = new Map<string, any>();
      supplier.equipments.forEach(eq => {
        const dateStr = eq.purchaseDate ? new Date(eq.purchaseDate).toISOString().split('T')[0] : '2026-01-15';
        const price = Number(eq.purchasePrice) || 0;
        if (!datesMap.has(dateStr)) {
          datesMap.set(dateStr, {
            id: `BC-${dateStr.replace(/-/g, '')}-${supplier.id.slice(-4).toUpperCase()}`,
            ref: `BC-${dateStr.slice(0, 7).replace('-', '')}-${supplier.id.slice(-4).toUpperCase()}`,
            date: dateStr,
            amount: 0,
            status: 'PAYÉ',
            itemsCount: 0,
            description: `Achat d'équipements informatiques (${supplier.name})`,
            equipments: []
          });
        }
        const bc = datesMap.get(dateStr);
        bc.amount += price;
        bc.itemsCount += 1;
        bc.equipments.push(eq.name);
      });
      invoices = Array.from(datesMap.values());
    }

    return NextResponse.json({
      ...supplier,
      stats: {
        totalSpending,
        totalEquipments: supplier.equipments.length,
        availableCount,
        assignedCount,
        maintenanceCount,
        decommissionedCount,
      },
      invoices,
    });
  } catch (error) {
    console.error('Error fetching supplier 360:', error);
    return NextResponse.json({ error: "Erreur lors de la récupération du fournisseur" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, contactName, email, phone, address, website, notes, invoices } = body;

    let finalNotes = notes;
    if (invoices && Array.isArray(invoices)) {
      finalNotes = JSON.stringify({
        textNotes: notes || '',
        invoices: invoices,
      });
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        contactName,
        email,
        phone,
        address,
        website,
        notes: finalNotes
      }
    });

    await logAudit('UPDATE_SUPPLIER', `Fournisseur mis à jour: ${supplier.name}`, session.user.id);

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du fournisseur" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: { equipments: true }
        }
      }
    });

    if (!supplier) {
      return NextResponse.json({ error: "Fournisseur non trouvé" }, { status: 404 });
    }

    if (supplier._count.equipments > 0) {
      return NextResponse.json({ error: "Impossible de supprimer ce fournisseur car il contient des équipements" }, { status: 409 });
    }

    await prisma.supplier.delete({ where: { id } });

    await logAudit('DELETE_SUPPLIER', `Fournisseur supprimé: ${supplier.name}`, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ error: "Erreur lors de la suppression du fournisseur" }, { status: 500 });
  }
}
