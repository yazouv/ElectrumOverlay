const axios = require('axios');
const qs = require('qs');
const config = require('../config/config');

/**
 * Classe pour gérer l'authentification Twitch
 */
class TwitchAuth {
    constructor() {
        this.appAccessToken = null;
        this.userAccessToken = config.twitch.USER_ACCESS_TOKEN;
    }

    /**
     * Obtenir un App Access Token
     */
    async getAppAccessToken() {
        if (this.appAccessToken) {
            return this.appAccessToken;
        }

        const data = qs.stringify({
            'client_id': config.twitch.CLIENT_ID,
            'client_secret': config.twitch.CLIENT_SECRET,
            'grant_type': 'client_credentials'
        });

        const requestConfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://id.twitch.tv/oauth2/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        try {
            const response = await axios.request(requestConfig);
            this.appAccessToken = response.data.access_token;
            console.log('✅ App Access Token obtenu:', this.appAccessToken);
            return this.appAccessToken;
        } catch (error) {
            console.error('❌ Erreur lors de la récupération du token d\'accès d\'application:', error.message);
            throw new Error('Erreur lors de la récupération du token d\'accès d\'application');
        }
    }

    /**
     * Vérifier les scopes du User Access Token
     */
    async verifyUserToken() {
        if (!this.userAccessToken) {
            console.warn('⚠️  USER_ACCESS_TOKEN non configuré ou invalide');
            return false;
        }

        try {
            const response = await axios.get('https://id.twitch.tv/oauth2/validate', {
                headers: {
                    'Authorization': `Bearer ${this.userAccessToken}`
                }
            });

            console.log('✅ Token utilisateur vérifié:');
            console.log(`   - Client ID: ${response.data.client_id}`);
            console.log(`   - User ID: ${response.data.user_id}`);
            console.log(`   - Scopes: ${response.data.scopes.join(', ')}`);

            // Vérifier si les scopes requis sont présents
            const hasAllScopes = config.twitch.SCOPES.every(scope =>
                response.data.scopes.includes(scope)
            );

            if (!hasAllScopes) {
                console.warn('⚠️  Scopes manquants pour les messages de chat');
                console.warn(`   - Requis: ${config.twitch.SCOPES.join(', ')}`);
                console.warn(`   - Présents: ${response.data.scopes.join(', ')}`);
            }

            return hasAllScopes;
        } catch (error) {
            console.error('❌ Erreur lors de la vérification du token utilisateur:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Générer l'URL d'autorisation OAuth
     */
    generateAuthUrl() {
        const params = new URLSearchParams({
            response_type: 'token',
            client_id: config.twitch.CLIENT_ID,
            redirect_uri: config.twitch.REDIRECT_URI,
            scope: config.twitch.SCOPES.join(' ')
        });

        return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
    }

    /**
     * Mettre à jour le User Access Token
     */
    setUserAccessToken(token) {
        this.userAccessToken = token;
    }

    /**
     * Obtenir l'ID d'un broadcaster par son nom d'utilisateur
     */
    async getBroadcasterID(username) {
        const accessToken = await this.getAppAccessToken();

        try {
            const response = await axios.get(`https://api.twitch.tv/helix/users?login=${username}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': config.twitch.CLIENT_ID
                }
            });

            if (response.data.data.length === 0) {
                throw new Error(`Utilisateur ${username} non trouvé`);
            }

            return response.data.data[0];
        } catch (error) {
            console.error('❌ Erreur lors de la récupération du Broadcaster ID:', error.message);
            throw error;
        }
    }

    /**
     * Vérifier si l'authentification est active
     */
    isAuthenticated() {
        return !!(this.userAccessToken);
    }
}

module.exports = TwitchAuth;
