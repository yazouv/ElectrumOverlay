const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const config = require('./src/config/config');
const TwitchAuth = require('./src/services/TwitchAuth');
const EventSubManager = require('./src/services/EventSubManager');
const StreamStatsManager = require('./src/services/StreamStatsManager');
const WebhookHandler = require('./src/services/WebhookHandler');
const createRoutes = require('./src/routes/api');

/**
 * Classe principale de l'application
 */
class TwitchOverlayServer {
    constructor() {
        this.app = express();
        this.port = config.server.PORT;

        // Initialisation des services
        this.auth = new TwitchAuth();
        this.streamStats = new StreamStatsManager();
        this.eventSubManager = new EventSubManager(this.auth);
        this.webhookHandler = new WebhookHandler(this.streamStats, this.broadcastEvent.bind(this));

        this.setupMiddleware();
        this.setupRoutes();
        this.setupGracefulShutdown();
        this.setupWebSocket();
    }

    /**
     * Configuration des middlewares
     */
    setupMiddleware() {
        // Middleware pour servir les fichiers statiques
        this.app.use(express.static('public'));

        // Middleware JSON standard pour les routes API
        this.app.use(express.json());
    }

    /**
     * Configuration des routes
     */    setupRoutes() {
        // Route principale pour les webhooks EventSub
        this.app.post('/eventsub', express.raw({ type: 'application/json' }), (req, res) => {
            this.webhookHandler.handleWebhook(req, res);
        });

        // Routes API
        const apiRoutes = createRoutes(this.eventSubManager, this.streamStats, this.auth);
        this.app.use('/', apiRoutes);

        // Route par défaut
        this.app.get('/', (req, res) => {
            res.send(`
                <html>
                    <head>
                        <title>Twitch Overlay Server</title>
                        <style>
                            body { 
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                                padding: 30px; 
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                margin: 0;
                                min-height: 100vh;
                            }
                            .container { 
                                max-width: 800px; 
                                margin: 0 auto; 
                                background: rgba(255,255,255,0.1); 
                                padding: 40px; 
                                border-radius: 15px;
                                backdrop-filter: blur(10px);
                                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                            }
                            .link-grid {
                                display: grid;
                                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                                gap: 15px;
                                margin-top: 30px;
                            }
                            .link-card {
                                background: rgba(0,0,0,0.2);
                                padding: 20px;
                                border-radius: 10px;
                                text-decoration: none;
                                color: white;
                                transition: all 0.3s ease;
                                border-left: 4px solid #4ade80;
                            }
                            .link-card:hover {
                                background: rgba(0,0,0,0.3);
                                transform: translateY(-2px);
                            }
                            .status { 
                                background: rgba(34, 197, 94, 0.2); 
                                padding: 15px; 
                                border-radius: 8px; 
                                margin: 20px 0;
                                border-left: 4px solid #22c55e;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>🎮 Twitch Overlay Server v2.0</h1>
                            <div class="status">
                                <strong>✅ Serveur actif</strong> - Toutes les fonctionnalités sont opérationnelles
                            </div>
                            
                            <h2>🔗 Liens utiles :</h2>
                            <div class="link-grid">
                                <a href="/stream-stats-html" class="link-card">
                                    <h3>📊 Statistiques en temps réel</h3>
                                    <p>Interface visuelle des stats du stream</p>
                                </a>
                                <a href="/subscriptions" class="link-card">
                                    <h3>📋 Abonnements EventSub</h3>
                                    <p>Liste des webhooks actifs</p>
                                </a>
                                <a href="/auth-url" class="link-card">
                                    <h3>🔐 Autorisation Twitch</h3>
                                    <p>Configurer l'accès aux messages de chat</p>
                                </a>
                                <a href="/status" class="link-card">
                                    <h3>📈 Statut du serveur</h3>
                                    <p>Informations système et performance</p>
                                </a>
                            </div>

                            <h3>🛠️ API Endpoints :</h3>
                            <ul style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 8px;">
                                <li><code>/stream-stats</code> - Statistiques JSON</li>
                                <li><code>/change-channel/[username]</code> - Changer de chaîne</li>
                                <li><code>/channel-info/[username]</code> - Infos chaîne</li>
                                <li><code>/test-subscriptions</code> - Tester les abonnements</li>
                                <li><code>/clear-subscriptions</code> - Supprimer tous les abonnements</li>
                            </ul>
                        </div>
                    </body>
                </html>
            `);
        });

        // Route pour les statistiques de stream
        this.app.get('/api/stream-stats', async (req, res) => {
            try {
                const stats = await this.streamStats.getStats();
                res.json(stats);
            } catch (error) {
                console.error('❌ Erreur récupération stats:', error);
                res.status(500).json({ error: 'Erreur serveur' });
            }
        });

        // Route pour les informations du stream
        this.app.get('/api/stream-info', async (req, res) => {
            try {
                const info = await this.streamStats.getStreamInfo();
                res.json(info);
            } catch (error) {
                console.error('❌ Erreur récupération info stream:', error);
                res.status(500).json({ error: 'Erreur serveur' });
            }
        });
    }

    /**
     * Configuration de l'arrêt propre du serveur
     */
    setupGracefulShutdown() {
        const gracefulShutdown = async (signal) => {
            console.log(`\n🛑 Signal ${signal} reçu - Arrêt du serveur...`);

            try {
                await this.eventSubManager.cleanupSubscriptions();
                console.log('✅ Nettoyage terminé');
            } catch (error) {
                console.error('❌ Erreur lors du nettoyage:', error.message);
            }

            console.log('👋 Serveur arrêté proprement !');
            process.exit(0);
        };

        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

        // Gestion des erreurs non capturées
        process.on('uncaughtException', (error) => {
            console.error('\n⚠️  Erreur non capturée (le serveur continue):', error.message);
            console.error('Stack:', error.stack);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('\n⚠️  Promesse rejetée non gérée (le serveur continue):', reason);
        });
    }

    /**
     * Démarrer le serveur
     */
    async start() {
        // démarrer ngrok si configuré
        var WEBHOOK_URL;
        if (config.ngrok.ENABLED) {
            const NgrokManager = require('./src/services/NgrokManager');
            this.ngrokManager = new NgrokManager();
            WEBHOOK_URL = await this.ngrokManager.start();
        } else {
            WEBHOOK_URL = config.twitch.WEBHOOK_URL;
        }

        this.app.listen(this.port, async () => {
            console.log('🚀 ================================');
            console.log('🎮 Twitch Overlay Server v1.0');
            console.log('🚀 ================================');
            console.log(`🌐 Serveur: http://localhost:${this.port}`);
            console.log(`📊 Stats: http://localhost:${this.port}/stream-stats-html`);
            console.log(`🔐 Auth: http://localhost:${this.port}/auth-url`);
            console.log(`📋 API: http://localhost:${this.port}/status`);
            console.log(`🔌 Webhook: ${WEBHOOK_URL}`);
            console.log('');
            console.log(`🎯 Chaîne: ID ${this.eventSubManager.currentBroadcasterId}`);
            console.log('🟢 Serveur prêt ! Appuyez sur Ctrl+C pour arrêter.');
            console.log('');

            // Heartbeat pour maintenir le processus actif
            this.startHeartbeat();

            // Initialisation des services Twitch
            await this.initializeTwitchServices(WEBHOOK_URL);
        });
    }

    /**
     * Démarrer le heartbeat
     */
    startHeartbeat() {
        setInterval(() => {
            // Heartbeat silencieux pour maintenir le processus actif
        }, 30000);
    }

    /**
     * Initialiser les services Twitch
     */
    async initializeTwitchServices(WEBHOOK_URL) {
        setTimeout(async () => {
            try {
                console.log('🔍 Vérification du User Access Token...');
                await this.auth.verifyUserToken();
                console.log('');

                console.log('⚡ Configuration des abonnements EventSub...');
                await this.eventSubManager.setupSubscriptionsForChannel(
                    this.eventSubManager.currentBroadcasterId,
                    WEBHOOK_URL
                );

                console.log('');
                console.log('✅ Initialisation terminée ! Le serveur est maintenant pleinement opérationnel.');
                console.log('🔄 En attente des webhooks Twitch...');

            } catch (error) {
                console.error('❌ Erreur lors de l\'initialisation:', error.message);
                console.log('⚠️  Le serveur continue de fonctionner malgré cette erreur.');
                console.log('🔄 Vous pouvez utiliser les routes HTTP normalement.');
            }
        }, 2000);
    }

    /**
     * Support WebSocket pour les communications temps réel
     */
    setupWebSocket() {
        try {
            // Vérifier si le port WebSocket est déjà utilisé
            const net = require('net');
            const testServer = net.createServer();

            testServer.listen(config.server.WS_PORT || 8081, () => {
                testServer.close();

                // Port disponible, créer le serveur WebSocket
                this.wss = new WebSocket.Server({ port: config.server.WS_PORT || 8081 });

                this.wss.on('connection', (ws) => {
                    console.log('✅ Nouvelle connexion WebSocket');

                    ws.on('message', (message) => {
                        try {
                            const data = JSON.parse(message);
                            this.handleWebSocketMessage(ws, data);
                        } catch (error) {
                            console.error('❌ Erreur message WebSocket:', error);
                        }
                    });

                    ws.on('close', () => {
                        console.log('❌ Connexion WebSocket fermée');
                    });

                    // Envoyer un message de bienvenue
                    ws.send(JSON.stringify({
                        type: 'connected',
                        message: 'Connexion WebSocket établie'
                    }));
                });

                console.log(`🌐 Serveur WebSocket démarré sur le port ${config.server.WS_PORT || 8081}`);
            });

            testServer.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    console.log(`⚠️  Port WebSocket ${config.server.WS_PORT || 8081} déjà utilisé - WebSocket désactivé`);
                } else {
                    console.error('❌ Erreur démarrage WebSocket:', error);
                }
            });

        } catch (error) {
            console.error('❌ Erreur démarrage WebSocket:', error);
        }
    }

    handleWebSocketMessage(ws, data) {
        switch (data.type) {
            case 'ping':
                ws.send(JSON.stringify({ type: 'pong' }));
                break;
            case 'subscribe':
                // Abonner le client aux événements
                ws.eventTypes = data.events || ['all'];
                break;
            default:
                console.log('Message WebSocket non géré:', data.type);
        }
    }    // Diffuser un événement à tous les clients WebSocket connectés
    broadcastEvent(event) {
        if (this.wss) {
            this.wss.clients.forEach((client) => {
                if (client.readyState === client.OPEN) {
                    try {
                        client.send(JSON.stringify(event));
                    } catch (error) {
                        console.error('❌ Erreur diffusion WebSocket:', error);
                    }
                }
            });
        }
    }
}

// Démarrage de l'application
if (require.main === module) {
    const server = new TwitchOverlayServer();
    server.start().catch(error => {
        console.error('❌ Erreur fatale lors du démarrage:', error);
        process.exit(1);
    });
}

module.exports = TwitchOverlayServer;
