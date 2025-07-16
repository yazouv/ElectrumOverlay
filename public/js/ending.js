/**
 * JavaScript spécifique à ending.html
 * Fonctionnalités personnalisées pour la page de fin de stream
 */

// Code spécifique à ending.html

function getStreamStats() {
    document.addEventListener('DOMContentLoaded', () => {
        fetch('/stream-stats')
            .then(response => response.json())
            .then(data => {
                const streamTimeMs = data.streamDurationMs || 0;
                const streamTimeSec = Math.floor(streamTimeMs / 1000);
                const streamTimeMin = Math.floor(streamTimeSec / 60);
                const streamTimeHours = Math.floor(streamTimeMin / 60);
                const streamTimeText = `${streamTimeHours}h ${streamTimeMin % 60}m ${streamTimeSec % 60}s`;
                document.getElementById('streamDurationText').innerText = streamTimeText;
                document.getElementById('totalMessages').innerText = data.chatMessages;
                document.getElementById('newFollowers').innerText = data.follows;
                document.getElementById('newSubs').innerText = data.subscribers;
            })
            .catch(error => {
                console.error('❌ Erreur lors de la récupération des statistiques du stream:', error);
            });
    });
}

setInterval(() => {
    getStreamStats();
}, 30000);
getStreamStats(); // Récupérer les stats du serveur
