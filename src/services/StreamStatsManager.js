/**
 * Classe pour gérer les statistiques du stream en temps réel
 */
class StreamStatsManager {
    constructor() {
        this.stats = this.getDefaultStats();
    }

    /**
     * Obtenir les statistiques par défaut
     */
    getDefaultStats() {
        return {
            isLive: false,
            startTime: null,
            follows: 0,
            subscribers: 0,
            chatMessages: 0,
            title: '',
            game: '',
            viewerCount: 0
        };
    }

    /**
     * Réinitialiser les statistiques
     */
    reset() {
        console.log('📊 Réinitialisation des statistiques du stream');
        this.stats = this.getDefaultStats();
    }

    /**
     * Marquer le stream comme commencé
     */
    startStream(streamData) {
        this.reset();
        this.stats.isLive = true;
        this.stats.startTime = streamData.started_at || new Date().toISOString();
        this.stats.title = streamData.title || '';
        this.stats.game = streamData.category_name || streamData.game_name || '';

        console.log('🔴 Stream démarré - Statistiques initialisées');
        this.display();
    }

    /**
     * Marquer le stream comme terminé
     */
    endStream() {
        console.log('⚫ Stream terminé - Statistiques finales:');
        this.display();
        this.stats.isLive = false;
    }

    /**
     * Mettre à jour les informations du stream
     */
    updateStreamInfo(title, game) {
        if (this.stats.isLive) {
            this.stats.title = title || this.stats.title;
            this.stats.game = game || this.stats.game;
            console.log('📊 Informations du stream mises à jour');
        }
    }

    /**
     * Ajouter un nouveau follow
     */
    addFollow() {
        this.stats.follows++;
        console.log(`📊 +1 Follow ! Total: ${this.stats.follows}`);
    }

    /**
     * Ajouter un nouvel abonné
     */
    addSubscriber(count = 1) {
        this.stats.subscribers += count;
        const message = count > 1 ?
            `📊 +${count} Abonnés ! Total: ${this.stats.subscribers}` :
            `📊 +1 Abonné ! Total: ${this.stats.subscribers}`;
        console.log(message);
    }

    /**
     * Ajouter un message de chat
     */
    addChatMessage() {
        this.stats.chatMessages++;

        // Afficher les stats seulement tous les 10 messages pour éviter le spam
        if (this.stats.chatMessages % 10 === 0) {
            console.log(`📊 Messages de chat: ${this.stats.chatMessages}`);
        }
    }

    /**
     * Mettre à jour le nombre de viewers
     */
    updateViewerCount(count) {
        this.stats.viewerCount = count;
    }

    /**
     * Calculer la durée du stream
     */
    getStreamDuration() {
        if (!this.stats.isLive || !this.stats.startTime) {
            return "Stream hors ligne";
        }

        const now = new Date();
        const start = new Date(this.stats.startTime);
        const diffMs = now - start;

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Obtenir les statistiques complètes
     */
    getStats() {
        return {
            ...this.stats,
            streamDuration: this.getStreamDuration(),
            streamDurationMs: this.stats.isLive && this.stats.startTime ?
                new Date() - new Date(this.stats.startTime) : 0
        };
    }

    /**
     * Obtenir les informations du stream (alias pour getStats)
     */
    getStreamInfo() {
        return this.getStats();
    }

    /**
     * Afficher les statistiques actuelles
     */
    display() {
        console.log('\n📊 === STATISTIQUES DU STREAM ===');
        console.log(`🔴 Statut: ${this.stats.isLive ? 'EN DIRECT' : 'HORS LIGNE'}`);

        if (this.stats.isLive) {
            console.log(`⏱️  Durée: ${this.getStreamDuration()}`);
            console.log(`📺 Titre: ${this.stats.title || 'Non défini'}`);
            console.log(`🎮 Jeu: ${this.stats.game || 'Non défini'}`);
            if (this.stats.viewerCount > 0) {
                console.log(`👥 Viewers: ${this.stats.viewerCount}`);
            }
        }

        console.log(`💙 Nouveaux follows: ${this.stats.follows}`);
        console.log(`⭐ Nouveaux abonnés: ${this.stats.subscribers}`);
        console.log(`💬 Messages de chat: ${this.stats.chatMessages}`);
        console.log('=====================================\n');
    }

    /**
     * Générer une page HTML des statistiques
     */
    generateHTMLStats() {
        const duration = this.getStreamDuration();
        const stats = this.stats;

        return `
        <html>
            <head>
                <title>Statistiques du Stream</title>
                <meta http-equiv="refresh" content="5">
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        padding: 20px; 
                        background: linear-gradient(135deg, #1a1a2e, #16213e); 
                        color: white; 
                        margin: 0;
                    }
                    .container { max-width: 800px; margin: 0 auto; }
                    .stat-card { 
                        background: rgba(45, 45, 45, 0.8); 
                        padding: 20px; 
                        margin: 15px 0; 
                        border-radius: 12px; 
                        border-left: 4px solid #5352ed;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                    }
                    .live { color: #ff4757; font-weight: bold; }
                    .offline { color: #747d8c; }
                    .number { 
                        font-size: 32px; 
                        font-weight: bold; 
                        color: #5352ed; 
                        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    }
                    .header { text-align: center; margin-bottom: 30px; }
                    .status-indicator {
                        display: inline-block;
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        margin-right: 8px;
                        background: ${stats.isLive ? '#ff4757' : '#747d8c'};
                        animation: ${stats.isLive ? 'pulse 2s infinite' : 'none'};
                    }
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 15px;
                        margin-top: 20px;
                    }
                    .mini-card {
                        background: rgba(83, 82, 237, 0.1);
                        padding: 15px;
                        border-radius: 8px;
                        text-align: center;
                        border: 1px solid rgba(83, 82, 237, 0.3);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📊 Statistiques du Stream en Temps Réel</h1>
                    </div>
                    
                    <div class="stat-card">
                        <h2>
                            <span class="status-indicator"></span>
                            Statut du Stream
                        </h2>
                        <p class="${stats.isLive ? 'live' : 'offline'}">
                            ${stats.isLive ? 'EN DIRECT' : 'HORS LIGNE'}
                        </p>
                        ${stats.isLive ? `
                            <p><strong>⏱️ Durée:</strong> ${duration}</p>
                            <p><strong>📺 Titre:</strong> ${stats.title || 'Non défini'}</p>
                            <p><strong>🎮 Jeu:</strong> ${stats.game || 'Non défini'}</p>
                            ${stats.viewerCount > 0 ? `<p><strong>👥 Viewers:</strong> ${stats.viewerCount}</p>` : ''}
                        ` : ''}
                    </div>
                    
                    <div class="stat-card">
                        <h2>📈 Statistiques de ce Stream</h2>
                        <div class="grid">
                            <div class="mini-card">
                                <div class="number">${stats.follows}</div>
                                <div>💙 Nouveaux follows</div>
                            </div>
                            <div class="mini-card">
                                <div class="number">${stats.subscribers}</div>
                                <div>⭐ Nouveaux abonnés</div>
                            </div>
                            <div class="mini-card">
                                <div class="number">${stats.chatMessages}</div>
                                <div>💬 Messages de chat</div>
                            </div>
                        </div>
                    </div>
                    
                    <p style="text-align: center; opacity: 0.7; margin-top: 30px;">
                        <small>🔄 Page actualisée automatiquement toutes les 5 secondes</small>
                    </p>
                </div>
            </body>
        </html>
        `;
    }
}

module.exports = StreamStatsManager;
