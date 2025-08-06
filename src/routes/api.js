const express = require('express');
const config = require('../config/config');
const TruckyApi = require('../services/TruckyApi');

/**
 * Créer les routes pour l'API
 */
function createRoutes(eventSubManager, streamStats, auth) {
    const router = express.Router();

    // Route pour favicon (éviter les erreurs 404)
    router.get('/favicon.ico', (req, res) => {
        res.status(204).send(); // No Content
    });

    // Route pour supprimer tous les abonnements
    router.get('/clear-subscriptions', async (req, res) => {
        try {
            await eventSubManager.cleanupSubscriptions();
            res.json({ message: 'Tous les abonnements ont été supprimés' });
        } catch (error) {
            console.error('❌ Erreur lors de la suppression des abonnements:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression' });
        }
    });

    router.get('/api/info-panel', async (req, res) => {
        try {
            const truckyapi = new TruckyApi();
            if (config.trucky.enable) {
                try {
                    console.log('🔌 Initialisation de l\'API Trucky...');
                    const userData = await truckyapi.getUserData();
                    if (!userData) {
                        console.log('⚠️ Aucun utilisateur trouvé pour l\'API Trucky.');
                        return;
                    }
                    const lastJobData = await truckyapi.getUserLastJob();
                    if (!lastJobData) {
                        console.log('⚠️ Aucun job trouvé pour l\'utilisateur Trucky.');
                        return;
                    }
                    
                    var companyStats;
                    var companyDetails;
                    if (!userData.company_id) {
                        console.log('⚠️ L\'utilisateur Trucky n\'a pas de société associée.');
                        companyStats = null;
                    } else {
                        companyStats = await truckyapi.getCompanyStats(userData.company_id);
                        companyDetails = await truckyapi.getCompanyDetails(userData.company_id);
                    }
                    return res.json({
                        userData: userData,
                        lastJob: lastJobData,
                        companyStats: companyStats,
                        companyDetails: companyDetails
                    });
                } catch (error) {
                    console.error('❌ Erreur lors de l\'initialisation de l\'API Trucky:', error.message);
                }
            }
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des données du panneau d\'information:', error.message);
            return res.status(500).json({ error: 'Erreur lors de la récupération des données' });
        }
    });

    // Route pour lister tous les abonnements
    router.get('/subscriptions', async (req, res) => {
        try {
            const subscriptions = eventSubManager.getActiveSubscriptions();

            res.json({
                total: subscriptions.length,
                subscriptions: subscriptions.map(sub => ({
                    id: sub.id,
                    type: sub.type,
                    status: sub.status,
                    condition: sub.condition,
                    created_at: sub.created_at
                }))
            });
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des abonnements:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération' });
        }
    });

    // Route pour obtenir l'URL d'autorisation
    router.get('/auth-url', (req, res) => {
        const authUrl = auth.generateAuthUrl();

        res.send(`
            <html>
                <head>
                    <title>Autorisation Twitch</title>
                    <style>
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            padding: 30px; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            line-height: 1.6;
                        }
                        .container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            background: rgba(255,255,255,0.1); 
                            padding: 40px; 
                            border-radius: 15px;
                            backdrop-filter: blur(10px);
                            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                        }
                        .auth-button {
                            display: inline-block;
                            background: #9146FF;
                            color: white;
                            padding: 15px 30px;
                            text-decoration: none;
                            border-radius: 8px;
                            font-size: 18px;
                            font-weight: bold;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 15px rgba(145, 70, 255, 0.4);
                        }
                        .auth-button:hover {
                            background: #7928ca;
                            transform: translateY(-2px);
                            box-shadow: 0 6px 20px rgba(145, 70, 255, 0.6);
                        }
                        .scope-list {
                            background: rgba(0,0,0,0.2);
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .steps {
                            background: rgba(0,0,0,0.2);
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .steps ol { margin: 0; padding-left: 20px; }
                        .steps li { margin: 8px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🔐 Autorisation Twitch Requise</h1>
                        <p>Pour utiliser EventSub avec les messages de chat, vous devez autoriser l'application avec les bons scopes.</p>
                        
                        <div class="scope-list">
                            <h3>🎯 Scopes requis :</h3>
                            <ul>
                                <li><code>user:read:chat</code> - Lire les messages de chat</li>
                                <li><code>user:bot</code> - Agir en tant que bot utilisateur</li>
                                <li><code>channel:bot</code> - Agir en tant que bot sur la chaîne</li>
                            </ul>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${authUrl}" target="_blank" class="auth-button">
                                👉 Autoriser l'application Twitch
                            </a>
                        </div>

                        <div class="steps">
                            <h3>📝 Instructions :</h3>
                            <ol>
                                <li>Cliquez sur le bouton ci-dessus</li>
                                <li>Connectez-vous à Twitch si nécessaire</li>
                                <li>Autorisez l'application en cliquant sur "Autoriser"</li>
                                <li>Copiez le token depuis l'URL de redirection</li>
                                <li>Remplacez USER_ACCESS_TOKEN dans la configuration</li>
                                <li>Redémarrez le serveur</li>
                            </ol>
                        </div>

                        <p><small>Après autorisation, vous serez redirigé automatiquement.</small></p>
                    </div>
                </body>
            </html>
        `);
    });

    // Route alternative pour le callback (compatibilité)
    router.get('/auth/callback', (req, res) => {
        res.redirect('/auth-callback' + (req.url.includes('#') ? req.url.split('#')[1] : ''));
    });

    // Route de callback pour récupérer le token
    router.get('/auth-callback', (req, res) => {
        res.send(`
            <html>
                <head>
                    <title>Autorisation Réussie</title>
                    <style>
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            padding: 30px; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            line-height: 1.6;
                        }
                        .container { 
                            max-width: 700px; 
                            margin: 0 auto; 
                            background: rgba(255,255,255,0.1); 
                            padding: 40px; 
                            border-radius: 15px;
                            backdrop-filter: blur(10px);
                            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                        }
                        .token-display {
                            background: rgba(0,0,0,0.3);
                            padding: 20px;
                            margin: 20px 0;
                            border-radius: 8px;
                            word-break: break-all;
                            font-family: 'Courier New', monospace;
                            border-left: 4px solid #4ade80;
                        }
                        .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="success-icon">✅</div>
                        <h1>Autorisation Réussie !</h1>
                        <p>Votre token d'accès a été généré avec succès.</p>
                        <p><strong>📋 Copiez le token ci-dessous et remplacez USER_ACCESS_TOKEN dans votre configuration :</strong></p>
                        <div id="token-container"></div>
                        <p><strong>⚠️ Important :</strong> Gardez ce token secret et ne le partagez jamais !</p>
                    </div>
                    <script>
                        // Extraire le token de l'URL
                        const hash = window.location.hash.substring(1);
                        const params = new URLSearchParams(hash);
                        const token = params.get('access_token');
                        const container = document.getElementById('token-container');
                        
                        if (token) {
                            container.innerHTML = '<div class="token-display"><strong>Votre token :</strong><br>' + token + '</div>';
                        } else {
                            container.innerHTML = '<p style="color: #ef4444;">❌ Aucun token trouvé dans l\\'URL. Vérifiez que l\\'autorisation s\\'est bien déroulée.</p>';
                        }
                    </script>
                </body>
            </html>
        `);
    });

    // Route pour obtenir les statistiques du stream
    router.get('/stream-stats', (req, res) => {
        res.json(streamStats.getStats());
    });

    // Route pour obtenir les statistiques formatées en HTML
    router.get('/stream-stats-html', (req, res) => {
        res.send(streamStats.generateHTMLStats());
    });

    // Route pour obtenir le statut du serveur
    router.get('/status', async (req, res) => {
        try {
            const twitchAuthenticated = auth.isAuthenticated();
            const subscriptions = eventSubManager.getActiveSubscriptions();

            res.json({
                status: 'online',
                twitchAuthenticated,
                subscriptionsCount: subscriptions.length,
                serverTime: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ error: 'Erreur serveur' });
        }
    });

    router.get('/auth/status', (req, res) => {
        res.json({ authenticated: auth.isAuthenticated() });
    })

    // Routes pour les badges Twitch
    router.get('/badges/:broadcasterId', async (req, res) => {
        try {
            const broadcasterId = req.params.broadcasterId;

            // Essayer d'abord avec le User Token, sinon App Token
            let accessToken;
            try {
                // Vérifier si on a un User Token valide
                if (await auth.isAuthenticated()) {
                    accessToken = auth.userAccessToken;
                } else {
                    accessToken = await auth.getAppAccessToken();
                }
            } catch (error) {
                accessToken = await auth.getAppAccessToken();
            }

            const response = await require('axios').get(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${broadcasterId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': config.twitch.CLIENT_ID
                }
            });

            res.json(response.data);
        } catch (error) {
            console.error('❌ Erreur récupération badges broadcaster:', error.message);
            res.status(500).json({ error: 'Erreur récupération badges', data: { data: [] } });
        }
    });
    router.get('/badgesglobal', async (req, res) => {
        try {
            // Essayer d'abord avec le User Token, sinon App Token
            let accessToken;
            try {
                // Vérifier si on a un User Token valide
                if (await auth.isAuthenticated()) {
                    accessToken = auth.userAccessToken;
                } else {
                    accessToken = await auth.getAppAccessToken();
                }
            } catch (authError) {
                accessToken = await auth.getAppAccessToken();
            }

            const response = await require('axios').get('https://api.twitch.tv/helix/chat/badges/global', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': config.twitch.CLIENT_ID
                }
            });

            res.json(response.data);
        } catch (error) {
            console.log('🌍 [DEBUG] Erreur récupération badges globaux:', error);
            console.error('❌ Erreur récupération badges globaux:', error.response?.data || error.message);
            res.status(500).json({ error: 'Erreur récupération badges', data: { data: [] } });
        }
    });

    return router;
}

module.exports = createRoutes;
