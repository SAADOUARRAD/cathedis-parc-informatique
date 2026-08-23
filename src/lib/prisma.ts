// ============================================================
// Cathedis - Client Prisma Singleton (Lazy)
// Le client est créé uniquement lors du premier accès réel
// pour éviter les erreurs en Edge Runtime (middleware)
// ============================================================

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let _prismaInstance: PrismaClient | null = null;

function getOrCreatePrisma(): PrismaClient {
  if (_prismaInstance) return _prismaInstance;
  if (globalForPrisma.prisma) {
    _prismaInstance = globalForPrisma.prisma;
    return _prismaInstance;
  }

  // Import dynamique du driver adapter — ne fonctionne qu'en Node.js (pas Edge)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
    
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL non défini');
    }
    
    const parsed = new URL(url);
    const dbConfig = {
      host: parsed.hostname,
      port: parseInt(parsed.port || '3306'),
      user: parsed.username,
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace('/', ''),
    };
    
    const adapter = new PrismaMariaDb(dbConfig);
    _prismaInstance = new PrismaClient({ adapter });
  } catch {
    // Fallback si le driver n'est pas disponible (Edge Runtime)
    console.warn('⚠️ Prisma adapter non disponible — utilisation du client de base');
    _prismaInstance = new PrismaClient();
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = _prismaInstance;
  }

  return _prismaInstance;
}

// Proxy qui délègue tous les appels au client réel, créé à la demande
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getOrCreatePrisma();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
