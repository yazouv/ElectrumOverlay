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
        duration: 6000,           // Durée d'affichage des alertes (ms)
        queueDelay: 500,          // Délai entre chaque alerte (ms)
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
        particles: {
            count: 30,
            duration: [5, 8]
        },
        stars: {
            count: 80,
            duration: [1.5, 2.5]
        },
        meteors: {
            count: 8,
            duration: [2, 3]
        },
        circuitLines: {
            horizontal: 10,
            vertical: 8,
            duration: 6
        },
        dvdLogo: {
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
            interval: 300000,    // 5 minutes
            duration: 15000,     // 15 secondes
            firstDelay: 30000    // Première popup après 30s
        },
        bottom: {
            interval: 180000,    // 3 minutes
            duration: 20000,     // 20 secondes
            firstDelay: 10000    // Première popup après 10s
        }
    },

    // ========== STATISTIQUES (ENDING.HTML) ==========
    stats: {
        animationDuration: 1000,    // Durée animation compteurs
        updateInterval: 30000,      // Mise à jour toutes les 30s
        simulateData: true          // Simuler des données pour les tests
    },

    // ========== THÈMES COULEURS ==========
    themes: {
        starting: {
            primary: '#60a5fa',
            secondary: '#3b82f6',
            accent: '#1d4ed8'
        },
        index: {
            primary: '#60a5fa',
            secondary: '#3b82f6',
            accent: '#1e293b'
        },
        ending: {
            primary: '#3b82f6',
            secondary: '#60a5fa',
            accent: '#93c5fd'
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

// Export pour les modules ES6 si supporté
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OVERLAY_CONFIG;
}
