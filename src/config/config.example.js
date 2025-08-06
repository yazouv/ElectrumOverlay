/**
 * Configuration générée automatiquement
 * Modifiez ce fichier selon vos besoins
 */
module.exports = {
    "server": {
        "PORT": 8080,
        "WS_PORT": 8081,
        "HOST": "localhost"
    },
    "twitch": {
        "CLIENT_ID": "YOUR_CLIENT_ID",
        "CLIENT_SECRET": "YOUR_CLIENT_SECRET",
        "BROADCASTER_ID": "YOUR_BROADCASTER_ID",
        "USER_ACCESS_TOKEN": "YOUR_USER_ACCESS_TOKEN",
        "WEBHOOK_URL": "YOUR_WEBHOOK_URL", // NE PAS MODIFIER SI VOUS UTILISEZ NGROK EN AUTOMATIQUE (par défaut)
        "WEBHOOK_SECRET": "YOUR_WEBHOOK_SECRET",
        "REDIRECT_URI": "http://localhost:8080/auth-callback", // NE PAS MODIFIER
        "SCOPES": [
            "user:read:chat",
            "user:bot",
            "channel:bot",
            "channel:read:subscriptions",
            "moderator:read:followers",
            "chat:read",
            "chat:edit",
        ]
    },
    "trucky": {
        "enable": true,
        "USER_ID": "90694", // Remplacez par votre ID utilisateur Trucky
    },
    "ngrok": {
        "ENABLED": true,
    },
    "features": {
        "AUTO_SUBSCRIBE_EVENTS": true,
        "CLEANUP_ON_EXIT": true,
        "HEARTBEAT_INTERVAL": 30000,
        "MAX_RETRIES": 3
    },
    "eventTypes": {
        "basic": [
            {
                "type": "stream.online",
                "description": "notifications de début de stream"
            },
            {
                "type": "stream.offline",
                "description": "notifications de fin de stream"
            },
            {
                "type": "channel.follow",
                "version": "2",
                "description": "nouveaux followers",
                "condition": {
                    "broadcaster_user_id": "197983290",
                    "moderator_user_id": "197983290"
                }
            },
            {
                "type": "channel.subscribe",
                "description": "nouveaux abonnés"
            },
            {
                "type": "channel.subscription.gift",
                "description": "cadeaux d'abonnements"
            },
            {
                "type": "channel.subscription.message",
                "description": "nouveaux renouvellements d'abonnement",
            },
            {
                "type": "channel.raid",
                "description": "raids entrants",
                "condition": {
                    "to_broadcaster_user_id": "197983290",
                }
            },
        ],
        "chat": [
            {
                "type": "channel.chat.message",
                "description": "messages du chat"
            }
        ]
    }
};
