/**
 * Utilitaires pour la plateforme Cathedis
 */

/**
 * Formate une date en français (jj/mm/aaaa)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Formate une date et heure en français
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Formate un montant en euros
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Génère un numéro d'inventaire unique au format CAT-AAAA-XXXXX
 */
export function generateInventoryNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `CAT-${year}-${random.toString().padStart(5, '0')}`;
}

/**
 * Concatène des noms de classes CSS (filtre les valeurs falsy)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Traduit le statut d'un équipement en français
 */
export function getEquipmentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    AVAILABLE: 'Disponible',
    ASSIGNED: 'Affecté',
    MAINTENANCE: 'En maintenance',
    DECOMMISSIONED: 'Réformé',
  };
  return labels[status] || status;
}

/**
 * Traduit le type de mouvement en français
 */
export function getMovementTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PURCHASE: 'Achat',
    ASSIGNMENT: 'Affectation',
    RETURN: 'Restitution',
    TRANSFER: 'Transfert',
    MAINTENANCE: 'Maintenance',
    DECOMMISSION: 'Réforme',
  };
  return labels[type] || type;
}

/**
 * Retourne la couleur MUI associée à un statut d'équipement
 */
export function getEquipmentStatusColor(status: string): 'success' | 'primary' | 'warning' | 'error' | 'default' {
  const colors: Record<string, 'success' | 'primary' | 'warning' | 'error' | 'default'> = {
    AVAILABLE: 'success',
    ASSIGNED: 'primary',
    MAINTENANCE: 'warning',
    DECOMMISSIONED: 'error',
  };
  return colors[status] || 'default';
}

/**
 * Retourne la couleur MUI associée à une priorité de maintenance
 */
export function getMaintenancePriorityColor(priority: string): 'success' | 'info' | 'warning' | 'error' | 'default' {
  const colors: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
    LOW: 'success',
    MEDIUM: 'info',
    HIGH: 'warning',
    CRITICAL: 'error',
  };
  return colors[priority] || 'default';
}

/**
 * Traduit le rôle en français
 */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: 'Responsable IT',
    TECHNICIAN: 'Technicien',
    EMPLOYEE: 'Employé',
  };
  return labels[role] || role;
}

