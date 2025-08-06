const axios = require('axios');
const config = require('../config/config');
const TwitchAuth = require('./TwitchAuth');

/**
 * Classe pour gérer les abonnements EventSub
 */
class EventSubManager {
    constructor(auth) {
        this.auth = auth || new TwitchAuth();
        this.currentBroadcasterId = config.twitch.BROADCASTER_ID;
        this.activeSubscriptions = new Map();
    }

    /**
     * Créer un abonnement EventSub
     */
    async createSubscription(type, condition, version = '1', webhookUrl) {
        const accessToken = await this.auth.getAppAccessToken();
        console.log(`🔧 Tentative de création d'abonnement pour ${type}...`);

        // Vérifications spéciales pour les messages de chat
        if (type === 'channel.chat.message') {
            if (!this.auth.userAccessToken) {
                console.warn('⚠️  ATTENTION: Pour les messages de chat, l\'utilisateur doit avoir autorisé l\'application!');
                console.warn(`⚠️  Visitez: http://localhost:${config.server.PORT}/auth-url pour obtenir votre token`);
            }
        }

        try {
            console.log(`📡 Création de l'abonnement pour ${type} avec le callback : ${webhookUrl}`);
            const response = await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', {
                type: type,
                version: version,
                condition: condition,
                transport: {
                    method: 'webhook',
                    callback: webhookUrl,
                    secret: config.twitch.WEBHOOK_SECRET
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': config.twitch.CLIENT_ID,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`✅ Abonnement créé pour ${type}`);
            this.activeSubscriptions.set(response.data.data[0].id, {
                type,
                condition,
                ...response.data.data[0]
            });

            return response.data;
        } catch (error) {
            console.error(`❌ Erreur lors de la création de l'abonnement ${type}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Vérifier les abonnements existants
     */
    async checkExistingSubscriptions() {
        try {
            const accessToken = await this.auth.getAppAccessToken();

            const response = await axios.get('https://api.twitch.tv/helix/eventsub/subscriptions', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': config.twitch.CLIENT_ID
                }
            });

            console.log('📋 Vérification des abonnements existants...');

            if (response.data.data.length > 0) {
                console.log(`   - ${response.data.data.length} abonnements trouvés:`);
                response.data.data.forEach(sub => {
                    console.log(`     • ${sub.type} (${sub.status})`);
                    this.activeSubscriptions.set(sub.id, sub);
                });

                return response.data.data.map(sub => sub.type);
            } else {
                console.log('   - Aucun abonnement existant trouvé');
                return [];
            }
        } catch (error) {
            console.error('❌ Erreur lors de la vérification des abonnements:', error.response?.data || error.message);
            return [];
        }
    }

    /**
     * Configurer les abonnements pour une chaîne spécifique
     */
    async setupSubscriptionsForChannel(broadcasterId, webhookUrl) {
        console.log(`🔧 Configuration des abonnements EventSub pour la chaîne ID: ${broadcasterId}`);
        this.currentBroadcasterId = broadcasterId;

        try {
            const existingTypes = await this.checkExistingSubscriptions();

            // Préparer les abonnements de base
            const subscriptionsToTry = [
                ...config.eventTypes.basic.map(event => ({
                    ...event,
                    condition: event.condition || { broadcaster_user_id: broadcasterId }
                })),
                ...config.eventTypes.chat.map(event => ({
                    ...event,
                    condition: event.condition || {
                        broadcaster_user_id: broadcasterId,
                        user_id: config.twitch.BROADCASTER_ID
                    }
                }))
            ];

            // Filtrer les abonnements qui n'existent pas déjà
            const subscriptionsToCreate = subscriptionsToTry.filter(sub =>
                !existingTypes.includes(sub.type)
            );

            if (subscriptionsToCreate.length === 0) {
                console.log('✅ Tous les abonnements requis existent déjà !');
                return;
            }

            console.log(`📝 Création de ${subscriptionsToCreate.length} nouveaux abonnements...`);

            let successCount = 0;
            let totalAttempts = subscriptionsToCreate.length;

            for (const sub of subscriptionsToCreate) {
                try {
                    console.log(`🎯 Création d'abonnement aux ${sub.description}...`);
                    await this.createSubscription(sub.type, sub.condition, sub.version, webhookUrl);
                    successCount++;
                } catch (error) {
                    console.warn(`⚠️  Échec pour ${sub.type}: ${error.response?.data?.message || error.message}`);
                    continue;
                }
            }

            console.log('');
            console.log(`✅ Configuration terminée ! ${successCount}/${totalAttempts} nouveaux abonnements créés.`);
            console.log(`📊 Total: ${existingTypes.length + successCount} abonnements actifs.`);

        } catch (error) {
            console.error('❌ Erreur lors de la configuration des abonnements:', error.message);
            throw error;
        }
    }

    /**
     * Supprimer tous les abonnements
     */
    async cleanupSubscriptions() {
        console.log('\n🧹 Nettoyage des abonnements EventSub...');
        try {
            const accessToken = await this.auth.getAppAccessToken();

            // Récupérer tous les abonnements
            const response = await axios.get('https://api.twitch.tv/helix/eventsub/subscriptions', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': config.twitch.CLIENT_ID
                }
            });

            if (response.data.data.length > 0) {
                console.log(`🗑️  Suppression de ${response.data.data.length} abonnements...`);

                // Supprimer chaque abonnement
                for (const subscription of response.data.data) {
                    await axios.delete(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscription.id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Client-Id': config.twitch.CLIENT_ID
                        }
                    });
                    console.log(`🗑️  Supprimé: ${subscription.type}`);
                    this.activeSubscriptions.delete(subscription.id);
                }

                console.log('✅ Tous les abonnements ont été supprimés');
            } else {
                console.log('📭 Aucun abonnement à supprimer');
            }
        } catch (error) {
            console.error('❌ Erreur lors du nettoyage:', error.response?.data || error.message);
        }
    }

    /**
     * Obtenir la liste des abonnements actifs
     */
    getActiveSubscriptions() {
        return Array.from(this.activeSubscriptions.values());
    }

    /**
     * Changer la chaîne trackée
     */
    async changeChannel(username) {
        console.log(`🔄 Changement de chaîne vers: ${username}`);

        // Obtenir les infos du nouveau broadcaster
        const broadcasterData = await this.auth.getBroadcasterID(username);

        // Nettoyer les abonnements existants
        await this.cleanupSubscriptions();

        // Configurer pour la nouvelle chaîne
        await this.setupSubscriptionsForChannel(broadcasterData.id);

        console.log(`✅ Changement réussi ! Maintenant en train de tracker: ${username} (ID: ${broadcasterData.id})`);

        return broadcasterData;
    }
}

module.exports = EventSubManager;
