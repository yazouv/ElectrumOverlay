const crypto = require('crypto');
const config = require('../config/config');

/**
 * Classe pour gérer les webhooks EventSub
 */
class WebhookHandler {
    constructor(streamStats, broadcastFunction = null) {
        this.streamStats = streamStats;
        this.broadcastEvent = broadcastFunction;
        this.webhookSecret = config.twitch.WEBHOOK_SECRET;

        // Headers des notifications
        this.headers = {
            MESSAGE_ID: 'Twitch-Eventsub-Message-Id'.toLowerCase(),
            MESSAGE_TIMESTAMP: 'Twitch-Eventsub-Message-Timestamp'.toLowerCase(),
            MESSAGE_SIGNATURE: 'Twitch-Eventsub-Message-Signature'.toLowerCase(),
            MESSAGE_TYPE: 'Twitch-Eventsub-Message-Type'.toLowerCase()
        };

        // Types de messages
        this.messageTypes = {
            VERIFICATION: 'webhook_callback_verification',
            NOTIFICATION: 'notification',
            REVOCATION: 'revocation'
        };

        this.HMAC_PREFIX = 'sha256=';
    }

    /**
     * Construire le message pour le HMAC
     */
    buildHmacMessage(request) {
        // Convertir le body en string selon son type
        let bodyString;
        if (Buffer.isBuffer(request.body)) {
            bodyString = request.body.toString();
        } else if (typeof request.body === 'string') {
            bodyString = request.body;
        } else if (typeof request.body === 'object') {
            bodyString = JSON.stringify(request.body);
        } else {
            bodyString = String(request.body);
        }

        const message = (
            request.headers[this.headers.MESSAGE_ID] +
            request.headers[this.headers.MESSAGE_TIMESTAMP] +
            bodyString
        );

        return message;
    }

    /**
     * Générer le HMAC
     */
    generateHmac(secret, message) {
        return crypto.createHmac('sha256', secret)
            .update(message)
            .digest('hex');
    }

    /**
     * Vérifier la signature du message
     */
    verifySignature(hmac, signature) {
        // Si pas de signature (test local), on autorise
        if (!signature) {
            console.log('⚠️ Pas de signature trouvée (test local?)');
            return true;
        }

        try {
            return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
        } catch (error) {
            console.log('❌ Erreur lors de la vérification de signature:', error.message);
            return false;
        }
    }

    /**
     * Traiter un événement de stream en ligne
     */
    handleStreamOnline(event) {
        console.log(`🔴 ${event.broadcaster_user_name} a commencé un stream: "${event.type}"`);

        this.streamStats.startStream({
            started_at: event.started_at,
            title: event.title,
            category_name: event.category_name,
            game_name: event.game_name
        });
        this.streamStats.reset();

        // Diffuser l'événement via WebSocket
        if (this.broadcastEvent) {
            this.broadcastEvent({
                type: 'stream.online',
                data: event
            });
        }
    }

    /**
     * Traiter un événement de stream hors ligne
     */
    handleStreamOffline(event) {
        console.log(`⚫ ${event.broadcaster_user_name} a terminé son stream`);
        this.streamStats.endStream();

        // Diffuser l'événement via WebSocket
        if (this.broadcastEvent) {
            this.broadcastEvent({
                type: 'stream.offline',
                data: event
            });
        }
    }

    /**
     * Traiter une mise à jour de chaîne
     */
    handleChannelUpdate(event) {
        console.log(`📝 ${event.broadcaster_user_name} a mis à jour sa chaîne: "${event.title}"`);
        this.streamStats.updateStreamInfo(event.title, event.category_name || event.game_name);

        // Diffuser l'événement via WebSocket
        if (this.broadcastEvent) {
            this.broadcastEvent({
                type: 'channel.update',
                data: event
            });
        }
    }

    /**
     * Traiter un nouveau follow
     */
    handleChannelFollow(event) {
        console.log(`💙 ${event.user_name} a suivi ${event.broadcaster_user_name}!`);
        this.streamStats.addFollow();
        this.streamStats.display();

        // Diffuser l'événement via WebSocket
        if (this.broadcastEvent) {
            this.broadcastEvent({
                type: 'channel.follow',
                data: event
            });
        }
    }

    /**
     * Traiter un nouvel abonnement
     */
    handleChannelSubscribe(event) {
        console.log(`⭐ ${event.user_name} s'est abonné à ${event.broadcaster_user_name}!`);
        this.streamStats.addSubscriber();
        this.streamStats.display();

        // Diffuser l'événement via WebSocket
        if (this.broadcastEvent) {
            this.broadcastEvent({
                type: 'channel.subscribe',
                data: event
            });
        }
    }

    /**
     * Traiter des abonnements offerts
     */
    handleChannelSubscriptionGift(event) {
        const giftCount = event.total || 1;
        console.log(`🎁 ${event.user_name} a offert ${giftCount} abonnements à ${event.broadcaster_user_name}!`);
        this.streamStats.addSubscriber(giftCount);
        this.streamStats.display();

        // Diffuser l'événement via WebSocket
        if (this.broadcastEvent) {
            this.broadcastEvent({
                type: 'channel.subscription.gift',
                data: event
            });
        }
    }

    /**
     * Traiter un don de bits
     */
    handleChannelCheer(event) {
        console.log(`💎 ${event.user_name} a donné ${event.bits} bits avec le message: "${event.message}"`);

        // Diffuser l'événement via WebSocket
        if (this.broadcastEvent) {
            this.broadcastEvent({
                type: 'channel.cheer',
                data: event
            });
        }
    }

    handleChannelRaid(event) {
        console.log(`🚨 ${event.from_broadcaster_user_name} a lancé un raid vers ${event.to_broadcaster_user_name}`);

        // Diffuser l'événement via WebSocket
        if (this.broadcastEvent) {
            this.broadcastEvent({
                type: 'channel.raid',
                data: event
            });
        }
    }

    /**
     * Traiter un message de chat
     */
    handleChatMessage(event) {
        console.log(`💬 ${event.chatter_user_name}: ${event.message.text}`);
        this.streamStats.addChatMessage();

        // Convertir les badges Twitch au format attendu par l'overlay
        const badgesFormatted = {};
        if (event.badges && Array.isArray(event.badges)) {
            event.badges.forEach(badge => {
                badgesFormatted[badge.set_id] = badge.id;
            });
        }

        // Diffuser l'événement via WebSocket au format adapté pour le chat
        if (this.broadcastEvent) {
            const messageData = {
                type: 'message',
                username: event.chatter_user_name,
                message: event.message.text,
                color: event.color || '#ffffff',
                badges: badgesFormatted,
                emotes: event.message.emotes || [],
                timestamp: new Date().toISOString(),
                userId: event.chatter_user_id,
                displayName: event.chatter_user_name
            };

            this.broadcastEvent(messageData);
        }
    }

    /**
     * Router les événements vers les bonnes méthodes
     */
    routeEvent(eventType, eventData) {
        const handlers = {
            'stream.online': this.handleStreamOnline.bind(this),
            'stream.offline': this.handleStreamOffline.bind(this),
            'channel.update': this.handleChannelUpdate.bind(this),
            'channel.follow': this.handleChannelFollow.bind(this),
            'channel.subscribe': this.handleChannelSubscribe.bind(this),
            'channel.subscription.gift': this.handleChannelSubscriptionGift.bind(this),
            'channel.cheer': this.handleChannelCheer.bind(this),
            'channel.chat.message': this.handleChatMessage.bind(this),
            'channel.raid': this.handleChannelRaid.bind(this),
            'channel.subscription.message': this.handleChannelSubscribe.bind(this),
        };

        const handler = handlers[eventType];
        if (handler) {
            console.log(`📦 Événement: ${eventType}`);
            handler(eventData);
        } else {
            console.log(`⚠️ Type d'événement non géré: ${eventType}`);
        }
    }

    /**
     * Traiter une requête webhook
     */
    handleWebhook(req, res) {
        const message = this.buildHmacMessage(req);
        const hmac = this.HMAC_PREFIX + this.generateHmac(this.webhookSecret, message);
        const receivedSignature = req.headers[this.headers.MESSAGE_SIGNATURE];

        // Vérification de signature (plus permissive pour les tests)
        if (!this.verifySignature(hmac, receivedSignature)) {
            console.log('❌ Signature webhook invalide');
            return res.sendStatus(403);
        }

        try {
            // Le body peut être déjà parsé par Express ou être un Buffer/string
            let notification;
            if (typeof req.body === 'object' && req.body !== null && !Buffer.isBuffer(req.body)) {
                notification = req.body;
            } else {
                const bodyString = Buffer.isBuffer(req.body) ? req.body.toString() : req.body;
                notification = JSON.parse(bodyString);
            }

            const messageType = req.headers[this.headers.MESSAGE_TYPE];

            switch (messageType) {
                case this.messageTypes.NOTIFICATION:
                    this.routeEvent(notification.subscription.type, notification.event);
                    res.sendStatus(204);
                    break;

                case this.messageTypes.VERIFICATION:
                    console.log('🔐 Vérification webhook');
                    res.set('Content-Type', 'text/plain')
                        .status(200)
                        .send(notification.challenge);
                    break;

                case this.messageTypes.REVOCATION:
                    console.log(`🚫 Abonnement révoqué: ${notification.subscription.type}`);
                    res.sendStatus(204);
                    break;

                default:
                    console.log(`❓ Type de message inconnu: ${messageType}`);
                    res.sendStatus(204);
                    break;
            }
        } catch (error) {
            console.error('❌ Erreur webhook:', error.message);
            res.sendStatus(500);
        }
    }
}

module.exports = WebhookHandler;
