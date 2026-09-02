import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Resolve current user ID reliably (via session id or email)
    let currentUserId = session.user.id;
    if (!currentUserId && session.user.email) {
      const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (dbUser) currentUserId = dbUser.id;
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    // 1. If targetUserId is provided, return conversation history with this user
    if (targetUserId && currentUserId) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: currentUserId },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });

      // Mark received messages as read
      await prisma.message.updateMany({
        where: {
          senderId: targetUserId,
          receiverId: currentUserId,
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json({ messages });
    }

    // 2. Otherwise, return list of all active users in the company
    const users = await prisma.user.findMany({
      where: {
        ...(currentUserId ? { id: { not: currentUserId } } : {}),
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
        department: {
          select: { name: true },
        },
      },
      orderBy: [{ role: 'asc' }, { firstName: 'asc' }],
    });

    // Fetch last messages and unread counts for each contact
    const contactsWithMeta = await Promise.all(
      users.map(async (u) => {
        let lastMsg = null;
        let unreadCount = 0;

        if (currentUserId) {
          try {
            lastMsg = await prisma.message.findFirst({
              where: {
                OR: [
                  { senderId: currentUserId, receiverId: u.id },
                  { senderId: u.id, receiverId: currentUserId },
                ],
              },
              orderBy: { createdAt: 'desc' },
            });

            unreadCount = await prisma.message.count({
              where: {
                senderId: u.id,
                receiverId: currentUserId,
                read: false,
              },
            });
          } catch (e) {
            console.error('Error fetching meta for contact:', u.id, e);
          }
        }

        return {
          id: u.id,
          name: `${u.firstName} ${u.lastName}`.trim(),
          email: u.email,
          role: u.role,
          avatar: u.avatar,
          department: u.department?.name || 'Cathedis',
          lastMessage: lastMsg?.content || null,
          lastMessageAt: lastMsg?.createdAt || null,
          lastMessageIsMine: lastMsg?.senderId === currentUserId,
          unreadCount,
        };
      })
    );

    // Sort contacts: unread messages first, then recent messages, then alphabetically
    contactsWithMeta.sort((a, b) => {
      if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
      if (a.lastMessageAt && b.lastMessageAt) {
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      }
      if (a.lastMessageAt) return -1;
      if (b.lastMessageAt) return 1;
      return a.name.localeCompare(b.name);
    });

    let totalUnreadCount = 0;
    if (currentUserId) {
      try {
        totalUnreadCount = await prisma.message.count({
          where: {
            receiverId: currentUserId,
            read: false,
          },
        });
      } catch (e) {
        console.error('Error counting total unread:', e);
      }
    }

    return NextResponse.json({
      contacts: contactsWithMeta,
      totalUnreadCount,
    });
  } catch (error) {
    console.error('Erreur API Messages GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    let senderId = session.user.id;
    if (!senderId && session.user.email) {
      const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (dbUser) senderId = dbUser.id;
    }

    if (!senderId) {
      return NextResponse.json({ error: 'Expéditeur introuvable' }, { status: 400 });
    }

    const body = await request.json();
    const { receiverId, content } = body;

    if (!receiverId || !content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Destinataire et contenu requis' }, { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content: content.trim(),
      },
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error('Erreur API Messages POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    let currentUserId = session.user.id;
    if (!currentUserId && session.user.email) {
      const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (dbUser) currentUserId = dbUser.id;
    }

    const body = await request.json();
    const { senderId } = body;

    if (!senderId || !currentUserId) {
      return NextResponse.json({ error: 'senderId requis' }, { status: 400 });
    }

    await prisma.message.updateMany({
      where: {
        senderId,
        receiverId: currentUserId,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API Messages PATCH:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
