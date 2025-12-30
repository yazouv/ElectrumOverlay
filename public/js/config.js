/**
 * Configuration pour le frontend des overlays
 * Paramètres publics et non-sensibles
 */
const OVERLAY_CONFIG = {
    // ========== SERVEUR ==========
    server: {
        host: 'localhost',
        port: 8080,
        wsPort: 8081
    },

    // ========== TWITCH ==========
    twitch: {
        broadcasterId: "437020746", // Remplacez par votre ID de diffuseur (User ID)
    },

    // ========== ALERTES ==========
    alerts: {
        enabled: true,
        duration: 6000,           // Durée d'affichage des alertes (ms)
        queueDelay: 500,          // Délai entre chaque alerte (ms)
        confettiEnabled: true,
        confettiParticles: 300,   // Nombre de confettis
        confettiSpread: 360,      // Étendue des confettis
        confettiVelocity: 50,     // Vitesse des confettis
        confettiTicks: 250,       // Durée des confettis

        // Types d'alertes et leurs configurations
        types: {
            follow: {
                icon: '<i class="fas fa-heart"></i>',
                title: 'NOUVEAU FOLLOW',
                gradient: 'linear-gradient(135deg, #3B83F6A1 0%, #2563eb 100%)',
                border: '#3b82f6',
                defaultMessage: 'Merci pour le follow !'
            },
            sub: {
                icon: '<i class="fas fa-star"></i>',
                title: 'NOUVEAU SUB',
                gradient: 'linear-gradient(135deg, #10B9819D 0%, #065f46 100%)',
                border: '#10b981',
                defaultMessage: 'Merci pour le sub !'
            },
            subs_gift: {
                icon: '<i class="fas fa-gift"></i>',
                title: 'SUBS GIFT',
                gradient: 'linear-gradient(135deg, #10B9819D 0%, #065f46 100%)',
                border: '#10b981',
                defaultMessage: 'Merci pour les sub gifts !'
            },
            raid: {
                icon: '<i class="fas fa-users"></i>',
                title: 'RAID',
                gradient: 'linear-gradient(135deg, #DC262696 0%, #b91c1c 100%)',
                border: '#dc2626',
                defaultMessage: 'Merci pour le raid !'
            },
            bits: {
                icon: '<i class="fas fa-gem"></i>',
                title: 'BITS',
                gradient: 'linear-gradient(135deg, #9233EA9C 0%, #7e22ce 100%)',
                border: '#9333ea',
                defaultMessage: 'Merci pour les bits !'
            }
        }
    },

    // ========== ANIMATIONS ==========
    animations: {
        enabled: true,
        particles: {
            enabled: true,
            count: 30,
            duration: [5, 8]
        },
        stars: {
            enabled: true,
            count: 80,
            duration: [1.5, 2.5]
        },
        meteors: {
            enabled: true,
            count: 8,
            duration: [2, 3]
        },
        circuitLines: {
            enabled: true,
            horizontal: 10,
            vertical: 8,
            duration: 6
        },
        dvdLogo: {
            enabled: true,
            speed: 2,
            updateInterval: 16
        }
    },

    // ========== CHAT ==========
    chat: {
        maxMessages: 50,        // Nombre max de messages affichés
        scrollBehavior: 'smooth',
        defaultColor: '#3b82f6',
        badgeSize: '2vh'
    },

    // ========== PANNEAUX (INDEX.HTML) ==========
    panels: {
        left: {
            enabled: true,
            interval: 300000,    // 5 minutes
            duration: 15000,     // 15 secondes
            firstDelay: 30000    // Première popup après 30s
        },
        bottom: {
            enabled: true,
            interval: 180000,    // 3 minutes
            duration: 20000,     // 20 secondes
            firstDelay: 10000,   // Première popup après 10s

            // Contenu de la bottom bar (centralisé)
            // Remarque: l'ordre correspond à l'ordre d'affichage dans les HTML.
            content: {
                infoTexts: [
                    'twitch.tv/arkyan_',
                    'discord.electrumvtc.fr',
                    'electrumvtc.fr'
                ],
                scrollingText: '🚛 ELECTRUM VTC recrute ! • Convois organisés • Ambiance conviviale • !electrum pour plus d\'infos • discord.electrumvtc.fr • Rejoignez-nous ! ⚡'
            }
        }
    },

    // ========== STATISTIQUES (ENDING.HTML) ==========
    stats: {
        animationDuration: 1000,    // Durée animation compteurs
        updateInterval: 30000,      // Mise à jour toutes les 30s
        simulateData: true          // Simuler des données pour les tests
    },

    // ========== THÈMES COULEURS ==========
    // Chaque page (starting / index / pause / ending) applique automatiquement SON thème.
    // Ces couleurs sont converties en variables CSS (ex: --theme-primary, --theme-bg, --theme-panel-bg...).
    //
    // Clés principales :
    // - primary: couleur principale (titres, glow, éléments mis en avant)
    // - secondary: couleur secondaire (accents, bordures, variations)
    // - accent: couleur d'accent/fallback (utilisée si un champ plus précis n'est pas fourni)
    //
    // Champs étendus (plus précis) :
    // - background: fond global de la page (body)
    // - surface: couleur “surface” (cartes/blocks) si utilisée par certains styles
    // - text: couleur de texte principale
    // - mutedText: texte atténué (labels, sous-titres)
    // - panelBg: fond des panneaux (chat/panels/indicateurs) quand supporté
    // - panelBorder: bordures des panneaux (chat/panels/indicateurs) quand supporté
    themes: {
        starting: {
            // Page: starting.html (écran d'attente)
            primary: '#a855f7',
            secondary: '#8b45f6',
            accent: '#7c3aed',

            // Contrôle fin des éléments UI
            background: '#1e1b4b',
            surface: '#1e293b',
            text: '#e2e8f0',
            mutedText: '#94a3b8',
            panelBg: '#0f172a',
            panelBorder: '#8b45f6'
        },
        index: {
            // Page: index.html (overlay principal)
            primary: '#a855f7',
            secondary: '#8b45f6',
            accent: '#1e293b',

            // Contrôle fin des éléments UI
            background: '#0f172a',
            surface: '#1e293b',
            text: '#e2e8f0',
            mutedText: '#94a3b8',
            panelBg: '#111827',
            panelBorder: '#8b45f6'
        },
        pause: {
            // Page: pause.html (écran de pause)
            primary: '#a855f7',
            secondary: '#8b45f6',
            accent: '#7c3aed',

            // Contrôle fin des éléments UI
            background: '#0f172a',
            surface: '#111827',
            text: '#e2e8f0',
            mutedText: '#94a3b8',
            panelBg: '#0b1220',
            panelBorder: '#a855f7'
        },
        ending: {
            // Page: ending.html (écran de fin)
            primary: '#c084fc',
            secondary: '#a855f7',
            accent: '#8b45f6',

            // Contrôle fin des éléments UI
            background: '#0f172a',
            surface: '#1e293b',
            text: '#e2e8f0',
            mutedText: '#94a3b8',
            panelBg: '#0b1220',
            panelBorder: '#c084fc'
        }
    },

    // ========== DEBUG ==========
    debug: {
        enabled: true,
        logLevel: 'info',        // 'error', 'warn', 'info', 'debug'
        showWebSocketLogs: true,
        showAlertLogs: true
    }
};

// Exposer la config au navigateur (accès inter-scripts fiable)
try {
    if (typeof globalThis !== 'undefined') {
        globalThis.OVERLAY_CONFIG = OVERLAY_CONFIG;
    }
} catch (_) {
    // no-op
}

// Export pour les modules ES6 si supporté
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OVERLAY_CONFIG;
}
