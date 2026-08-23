import { prisma } from "@/lib/prisma";

/**
 * Enregistre une action dans le journal d'audit.
 * 
 * @param userId L'ID de l'utilisateur ayant effectué l'action
 * @param action Le type d'action effectuée
 * @param entity Le type d'entité concernée
 * @param entityId L'ID de l'entité concernée (optionnel)
 * @param details Détails supplémentaires sur l'action (optionnel)
 */
export async function logAudit(
  userId: string,
  action: string,
  entity: string,
  entityId?: string,
  details?: any
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : undefined,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'audit :", error);
  }
}
