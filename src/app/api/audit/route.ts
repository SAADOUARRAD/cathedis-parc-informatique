import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action') || '';
    const entity = searchParams.get('entity') || '';
    const limit = Number(searchParams.get('limit')) || 250;

    const whereClause: any = {};

    if (action && action !== 'ALL') {
      whereClause.action = { contains: action };
    }

    if (entity && entity !== 'ALL') {
      whereClause.entity = { contains: entity };
    }

    if (search) {
      whereClause.OR = [
        { action: { contains: search } },
        { entity: { contains: search } },
        { details: { contains: search } },
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [logs, totalCount, createCount, updateCount, deleteCount, securityCount] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.auditLog.count(),
      prisma.auditLog.count({ where: { action: { contains: 'CREATE' } } }),
      prisma.auditLog.count({ where: { action: { contains: 'UPDATE' } } }),
      prisma.auditLog.count({ where: { action: { contains: 'DELETE' } } }),
      prisma.auditLog.count({
        where: {
          OR: [
            { action: { contains: 'LOGIN' } },
            { action: { contains: 'PASSWORD' } },
            { action: { contains: 'AUTH' } },
            { action: { contains: 'SECURITY' } },
          ]
        }
      }),
    ]);

    return NextResponse.json({
      logs,
      stats: {
        totalCount,
        createCount,
        updateCount,
        deleteCount,
        securityCount,
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: "Erreur lors de la récupération du journal d'audit" }, { status: 500 });
  }
}
