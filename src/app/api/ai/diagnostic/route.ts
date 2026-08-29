import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

interface DiagnosticRule {
  keywords: string[];
  cause: string;
  steps: { title: string; action: string; tip?: string }[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const KNOWLEDGE_BASE: DiagnosticRule[] = [
  {
    keywords: ['lent', 'ralenti', 'rame', 'freeze', 'bloque', 'lenteur', 'chargement'],
    cause: 'Saturation de la mémoire vive (RAM), trop d\'applications en arrière-plan ou disque encombré.',
    steps: [
      {
        title: 'Redémarrage complet du système',
        action: 'Cliquez sur Démarrer ➔ Marche/Arrêt ➔ "Redémarrer" (ne faites pas juste "Arrêter", le redémarrage vide complètement la mémoire cache).',
        tip: 'Un redémarrage libère immédiatement la mémoire vive accumulée.'
      },
      {
        title: 'Fermer les processus lourds dans le Gestionnaire des tâches',
        action: 'Appuyez simultanément sur Ctrl + Maj + Échap. Dans l\'onglet "Processus", triez par Mémoire / Processeur et fermez les onglets de navigateur ou logiciels inutilisés.',
      },
      {
        title: 'Désactiver les programmes au démarrage',
        action: 'Dans le Gestionnaire des tâches ➔ Onglet "Applications de démarrage", faites un clic droit puis "Désactiver" sur les logiciels non essentiels (Spotify, Teams, etc.).',
      },
      {
        title: 'Nettoyer l\'espace disque temporaire',
        action: 'Appuyez sur Win + R, tapez "cleanmgr" et validez pour nettoyer les fichiers temporaires du système.',
      }
    ],
    priority: 'MEDIUM'
  },
  {
    keywords: ['écran', 'ecran', 'scintille', 'noir', 'clignote', 'affichage', 'moniteur', 'display', 'hdmi'],
    cause: 'Mauvais contact du câble vidéo (HDMI/DisplayPort), pilote graphique désynchronisé ou fréquence d\'affichage incorrecte.',
    steps: [
      {
        title: 'Réinitialiser le pilote graphique Windows à chaud',
        action: 'Appuyez simultanément sur les touches Win + Ctrl + Maj + B. L\'écran va émettre un bip court et clignoter 1 seconde pour redémarrer le circuit vidéo.',
        tip: 'Ce raccourci magique résout 80% des gels et scintillements d\'écran !'
      },
      {
        title: 'Débrancher et reconnecter fermement les câbles',
        action: 'Débranchez le câble HDMI/USB-C côté ordinateur et côté écran, soufflez légèrement sur le connecteur et rebranchez-le fermement.',
      },
      {
        title: 'Vérifier la source d\'entrée de l\'écran',
        action: 'Appuyez sur le bouton physique "Source / Input" sur le moniteur pour vous assurer qu\'il est bien réglé sur "HDMI 1" ou "Auto".',
      },
      {
        title: 'Tester sur un autre port ou écran',
        action: 'Si vous avez une station d\'accueil (Dock) ou un 2ème port, testez un branchement direct sur le PC portable.',
      }
    ],
    priority: 'HIGH'
  },
  {
    keywords: ['wifi', 'wi-fi', 'internet', 'réseau', 'reseau', 'connexion', 'déconnecte', 'deconnecte', 'dns', 'vpn'],
    cause: 'Bail DHCP expiré, adaptateur réseau Wi-Fi en veille ou conflit de proxy / DNS.',
    steps: [
      {
        title: 'Basculer le Mode Avion',
        action: 'Activez le "Mode Avion" dans la barre des tâches pendant 10 secondes, puis désactivez-le pour forcer la reconnexion au Wi-Fi Cathedis.',
      },
      {
        title: 'Oublier le réseau Wi-Fi et se reconnecter',
        action: 'Allez dans Paramètres ➔ Réseau et Internet ➔ Wi-Fi ➔ Gérer les réseaux connus ➔ Cliquez sur votre réseau puis "Oublier". Reconnectez-vous en entrant le mot de passe.',
      },
      {
        title: 'Réinitialiser la pile réseau TCP/IP',
        action: 'Ouvrez le menu Démarrer, tapez "cmd", faites un clic droit "Exécuter en tant qu\'administrateur" et tapez : "netsh winsock reset" puis redémarrez le PC.',
        tip: 'Cette commande réinitialise tous les protocoles réseau d\'origine.'
      },
      {
        title: 'Vérifier le câble RJ45 / Ethernet',
        action: 'Si vous êtes branché en filaire, vérifiez que les voyants vert et orange clignotent sur le port réseau à l\'arrière du PC.',
      }
    ],
    priority: 'HIGH'
  },
  {
    keywords: ['casque', 'audio', 'son', 'micro', 'microphone', 'ecouteur', 'haut-parleur', 'mute'],
    cause: 'Périphérique de sortie par défaut mal configuré, micro muet dans les paramètres de confidentialité ou faux contact Jack/USB.',
    steps: [
      {
        title: 'Sélectionner le bon périphérique de sortie audio',
        action: 'Cliquez sur l\'icône Haut-parleur en bas à droite ➔ Cliquez sur la flèche à côté du volume ➔ Sélectionnez explicitement votre Casque au lieu des haut-parleurs internes.',
      },
      {
        title: 'Vérifier le bouton "Mute" physique sur le câble',
        action: 'Assurez-vous que l\'interrupteur de micro sur la télécommande du fil du casque n\'est pas en position "Rouge / Mute".',
      },
      {
        title: 'Autoriser l\'accès au microphone sous Windows',
        action: 'Allez dans Paramètres ➔ Confidentialité et sécurité ➔ Microphone ➔ Vérifiez que "Autoriser les applications à accéder à votre microphone" est bien activé.',
      },
      {
        title: 'Tester sur un autre port USB',
        action: 'Débranchez le récepteur ou câble USB et branchez-le sur un port USB situé directement sur l\'unité centrale ou sur le côté du laptop.',
      }
    ],
    priority: 'MEDIUM'
  },
  {
    keywords: ['batterie', 'charge', 'chargeur', 'secteur', 'allume', 'demarre', 'alimente', 'chauffe'],
    cause: 'Sécurité de surchauffe déclenchée, adaptateur secteur défectueux ou cycle de charge bloqué.',
    steps: [
      {
        title: 'Effectuer une réinitialisation électrique (Hard Reset)',
        action: 'Débranchez le chargeur et tous les périphériques USB. Maintenez le bouton Marche/Arrêt enfoncé pendant 30 secondes complètes, puis rebranchez le chargeur et allumez.',
        tip: 'Le Hard Reset décharge les condensateurs de la carte mère et relance le contrôleur d\'alimentation.'
      },
      {
        title: 'Vérifier le voyant LED du bloc d\'alimentation',
        action: 'Assurez-vous que la petite LED sur le chargeur ou sur la prise du PC est bien allumée (blanche ou ambre).',
      },
      {
        title: 'Tester une autre prise murale directe',
        action: 'Branchez le chargeur directement sur une prise murale sans passer par une multiprise surchargée.',
      },
      {
        title: 'Laisser reposer 15 minutes si l\'appareil est très chaud',
        action: 'Les PC portables modernes coupent la charge automatique en cas de température trop élevée pour préserver la batterie.',
      }
    ],
    priority: 'CRITICAL'
  },
  {
    keywords: ['imprimante', 'impression', 'spouleur', 'papier', 'imprimer', 'toner'],
    cause: 'Spouleur d\'impression Windows bloqué ou file d\'attente saturée.',
    steps: [
      {
        title: 'Vider la file d\'attente des impressions bloquées',
        action: 'Allez dans Paramètres ➔ Périphériques ➔ Imprimantes ➔ Cliquez sur votre imprimante ➔ "Ouvrir la file d\'attente" ➔ Menu Imprimante ➔ "Annuler tous les documents".',
      },
      {
        title: 'Redémarrer le service Spouleur d\'impression',
        action: 'Appuyez sur Win + R, tapez "services.msc". Cherchez "Spouleur d\'impression" ➔ Clic droit ➔ "Redémarrer".',
        tip: 'Cette manipulation débloque 90% des impressions en attente.'
      },
      {
        title: 'Vérifier le bac à papier et l\'état des voyants',
        action: 'Assurez-vous que le bac est correctement chargé et qu\'aucun voyant rouge/orange d\'erreur n\'est allumé sur l\'imprimante.',
      }
    ],
    priority: 'LOW'
  }
];

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { equipmentName, category, symptoms } = await req.json();

    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 3) {
      return NextResponse.json({ error: 'Veuillez préciser vos symptômes pour le diagnostic.' }, { status: 400 });
    }

    const lowerSymptoms = symptoms.toLowerCase();
    const lowerCategory = (category || '').toLowerCase();

    // Match best rule based on keywords
    let matchedRule: DiagnosticRule | null = null;
    let maxMatches = 0;

    for (const rule of KNOWLEDGE_BASE) {
      const matchCount = rule.keywords.filter(kw => lowerSymptoms.includes(kw) || lowerCategory.includes(kw)).length;
      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        matchedRule = rule;
      }
    }

    // Fallback if no specific rule matches
    if (!matchedRule || maxMatches === 0) {
      matchedRule = {
        keywords: ['generique'],
        cause: `Anomalie de fonctionnement détectée sur votre équipement (${equipmentName || 'Matériel informatique'}).`,
        steps: [
          {
            title: 'Redémarrage complet de l\'équipement',
            action: 'Éteignez l\'appareil, attendez 15 secondes, puis rallumez-le pour forcer la réinitialisation des pilotes et processus système.',
            tip: 'Le redémarrage permet de réinitialiser les composants matériels et logiciels.'
          },
          {
            title: 'Vérification physique des connecteurs et câbles',
            action: 'Vérifiez que tous les câbles d\'alimentation, USB ou réseau sont solidement branchés et non endommagés.',
          },
          {
            title: 'Recherche des mises à jour Windows Update',
            action: 'Allez dans Paramètres ➔ Windows Update ➔ Cliquez sur "Rechercher des mises à jour" pour installer les correctifs récents.',
          },
          {
            title: 'Test sur une autre application ou utilisateur',
            action: 'Vérifiez si le problème se produit également sur une autre application ou après fermeture de votre session.',
          }
        ],
        priority: 'MEDIUM'
      };
    }

    return NextResponse.json({
      success: true,
      analysis: {
        equipment: equipmentName || 'Équipement',
        probableCause: matchedRule.cause,
        priority: matchedRule.priority,
        troubleshootingSteps: matchedRule.steps,
        technicianSummary: `[AUTO-DIAGNOSTIC IA RÉALISÉ PAR L'EMPLOYÉ]\n• Symptômes déclarés : ${symptoms}\n• Cause estimée : ${matchedRule.cause}\n• Résultat : Les ${matchedRule.steps.length} étapes de dépannage guidé ont été testées sans succès par le collaborateur. Intervention technique requise.`
      }
    });

  } catch (err: any) {
    console.error('Error in AI diagnostic:', err);
    return NextResponse.json({ error: 'Erreur lors de l\'analyse IA' }, { status: 500 });
  }
}
