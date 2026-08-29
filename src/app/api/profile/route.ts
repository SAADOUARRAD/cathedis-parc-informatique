import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        department: true,
        assignmentsReceived: {
          where: { status: 'ACTIVE' },
          include: {
            equipment: {
              include: { category: true }
            },
            signatures: true
          }
        },
        maintenancesReported: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        equipmentRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const totalEquipments = user.assignmentsReceived.length;
    const signedPVCount = user.assignmentsReceived.filter(a => a.signatures && a.signatures.length > 0).length;
    const pendingTicketsCount = user.maintenancesReported.filter(m => m.status !== 'COMPLETED' && m.status !== 'CANCELLED').length;
    const totalRequestsCount = user.equipmentRequests.length;

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
      department: user.department ? {
        id: user.department.id,
        name: user.department.name,
        location: user.department.location
      } : null,
      stats: {
        totalEquipments,
        signedPVCount,
        pendingTicketsCount,
        totalRequestsCount
      },
      assignments: user.assignmentsReceived.map(a => ({
        id: a.id,
        assignedAt: a.startDate,
        isSigned: a.signatures && a.signatures.length > 0,
        equipment: {
          id: a.equipment.id,
          name: a.equipment.name,
          serialNumber: a.equipment.serialNumber,
          category: a.equipment.category?.name || 'Matériel',
          status: a.equipment.status
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const updateData: any = {};

    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (phone !== undefined) updateData.phone = phone.trim();

    // Password change verification
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Le mot de passe actuel est requis pour changer de mot de passe." }, { status: 400 });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: "Le mot de passe actuel est incorrect." }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      include: { department: true }
    });

    await logAudit(session.user.id, 'UPDATE', 'User', updatedUser.id, {
      fieldsUpdated: Object.keys(updateData)
    });

    return NextResponse.json({
      message: "Profil mis à jour avec succès",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
