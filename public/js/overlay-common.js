/**
 * JavaScript commun pour les overlays Twitch
 * Contient toutes les fonctions partagées entre starting.html, index.html et ending.html
 */

// Variables globales
const alertQueue = [];
let isProcessingAlerts = false; // Variable pour éviter les traitements parallèles
const badgeUrlMapping = {
    'broadcaster': {},
    'subscriber': {},
    'global': {}
};

// ========== GESTION DES ALERTES ==========

function showAlert(type, username, message = '', amount = '') {
    return new Promise((resolve) => {
        const alertContainer = document.getElementById('alertContainer');
        const alertIcon = document.getElementById('alertIcon');
        const alertTitle = document.getElementById('alertTitle');
        const alertUsername = document.getElementById('alertUsername');
        const alertMessage = document.getElementById('alertMessage');
        const alertAmount = document.getElementById('alertAmount');

        // Utiliser la config pour les types d'alertes
        const config = OVERLAY_CONFIG.alerts.types[type] || OVERLAY_CONFIG.alerts.types.follow;

        // Configuration de l'alerte
        alertIcon.innerHTML = config.icon;
        alertTitle.textContent = config.title;
        alertUsername.textContent = username || 'Anonymous';
        alertMessage.textContent = message || config.defaultMessage;

        alertContainer.style.background = config.gradient;
        alertContainer.style.borderColor = config.border;

        if (amount) {
            alertAmount.textContent = amount;
            alertAmount.style.display = 'block';
        } else {
            alertAmount.style.display = 'none';
        }

        // Afficher l'alerte
        alertContainer.classList.remove('hide');
        alertContainer.classList.add('show');
        alertContainer.style.opacity = 1;

        // Ajouter l'effet de confettis avec la config
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: OVERLAY_CONFIG.alerts.confettiParticles,
                startVelocity: OVERLAY_CONFIG.alerts.confettiVelocity,
                spread: OVERLAY_CONFIG.alerts.confettiSpread,
                ticks: OVERLAY_CONFIG.alerts.confettiTicks,
                origin: { y: 0.5 }
            });
        }

        // Cacher l'alerte après la durée configurée
        setTimeout(() => {
            alertContainer.classList.add('hide');
            alertContainer.style.opacity = 0;
            setTimeout(resolve, 600);
        }, OVERLAY_CONFIG.alerts.duration);
    });
}

function processAlertQueue() {
    // Si on traite déjà des alertes ou qu'il n'y en a pas, on arrête
    if (isProcessingAlerts || alertQueue.length === 0) {
        return;
    }

    isProcessingAlerts = true;
    const currentAlert = alertQueue.shift();

    showAlert(...currentAlert).then(() => {
        isProcessingAlerts = false;

        // Traiter la prochaine alerte après un petit délai
        setTimeout(() => {
            processAlertQueue();
        }, 500); // 500ms entre chaque alerte
    });
}

function addAlertsToQueue(type, username, message = '', amount = '') {
    alertQueue.push([type, username, message, amount]);

    // Démarrer le traitement seulement si on ne traite pas déjà
    if (!isProcessingAlerts) {
        processAlertQueue();
    }
}

// ========== GESTION DU CHAT ==========

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addChatMessage(username, message, color, badgeUrls) {
    const container = document.getElementById('chatContainer');
    if (!container) return;

    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    messageElement.innerHTML = `
        <div class="chat-username" style="color: ${color || '#3b82f6'};">
            ${badgeUrls ? Object.entries(badgeUrls).map(([key, url]) => `<img src="${url}" alt="${key} badge" class="chat-badge">`).join('') : ''}
            ${escapeHtml(username || 'Anonymous')}
        </div>
        <div class="chat-text">${escapeHtml(message || '')}</div>
    `;
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight;
}

// ========== GESTION DES BADGES ==========

async function fetchBadges(broadcasterId) {
    try {
        const response = await fetch(`http://localhost:8080/badges/${broadcasterId}`);
        const responseGlobal = await fetch(`http://localhost:8080/badgesglobal`);

        const data = await response.json();

        // Traitement des badges pour le diffuseur
        data.data.forEach(badgeSet => {
            const setId = badgeSet.set_id;
            badgeSet.versions.forEach(badge => {
                badgeUrlMapping[setId] = badgeUrlMapping[setId] || {};
                badgeUrlMapping[setId][badge.id] = badge.image_url_1x;
            });
        });

        const globalData = await responseGlobal.json();

        // Traitement des badges globaux
        globalData.data.forEach(badgeSet => {
            const setId = badgeSet.set_id;
            badgeSet.versions.forEach(badge => {
                badgeUrlMapping.global[`${setId}/${badge.id}`] = badge.image_url_1x;
            });
        });
    } catch (error) {
        console.error('Erreur lors du chargement des badges:', error);
    }
}

// ========== WEBSOCKET ==========

function initWebSocket() {
    const ws = new WebSocket(`ws://localhost:8081`);

    ws.onopen = function () {
        console.log('WebSocket connecté');
    };

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.type === 'message') {
            if (data.message.startsWith('!')) {
                if (data.message === '!info' && typeof showInfoPanel === 'function') {
                    showInfoPanel();
                }
                return;
            } else {
                const userBadges = data.badges;
                const badgeUrls = {};

                for (const [badgeKey, badgeValue] of Object.entries(userBadges)) {
                    if (badgeUrlMapping[badgeKey] && badgeUrlMapping[badgeKey][badgeValue]) {
                        badgeUrls[badgeKey] = badgeUrlMapping[badgeKey][badgeValue];
                    } else if (badgeUrlMapping.global && badgeUrlMapping.global[`${badgeKey}/${badgeValue}`]) {
                        badgeUrls[badgeKey] = badgeUrlMapping.global[`${badgeKey}/${badgeValue}`];
                    } else {
                        console.warn(`Badge non trouvé pour ${badgeKey}/${badgeValue}`);
                    }
                }

                addChatMessage(data.username, data.message, data.color, badgeUrls);
            }
        }
        else if (data.type === 'channel.raid') {
            const raidMessage = `Raid de ${data.data.from_broadcaster_user_name}`;
            const raidAmount = data.data.viewers ? ` Bienvenue au ${data.data.viewers} viewers` : '';
            addAlertsToQueue('raid', raidMessage, '', raidAmount);
        }
        else if (data.type === 'channel.subscribe' && !data.data.is_gift) {
            const message = data.data.message ? data.data.message.text || '' : '';
            const subMessage = data.data.cumulative_months ? `Merci pour le resub ! ${data.data.cumulative_months} mois` : 'Merci pour le sub !';
            addAlertsToQueue('sub', data.data.user_name, subMessage, message);
        }
        else if (data.type === 'channel.subscribe' && data.data.is_gift) {
            addAlertsToQueue('sub', data.data.user_name, `Merci pour le sub gift !`, '');
        }
        else if (data.type === 'channel.subscription.gift') {
            addAlertsToQueue('subs_gift', data.data.user_name, `Merci pour les ${data.data.total} sub gifts !`, '');
        }
        else if (data.type === 'channel.cheer') {
            var cheerUserName = data.data.is_anonymous ? 'Anonymous' : data.data.user_name;
            addAlertsToQueue('bits', cheerUserName, `Merci pour les  ${data.data.bits} bits !`, data.data.message ? data.data.message : '');
        }
        else if (data.type === 'channel.follow') {
            addAlertsToQueue('follow', data.data.user_name, `Merci pour le follow !`);
        }
    };

    ws.onerror = function (error) {
        console.error('Erreur WebSocket:', error);
    };

    ws.onclose = function () {
        console.log('WebSocket fermé');
    };

    return ws;
}

// ========== ANIMATIONS COMMUNES ==========

function createParticles(count = 30, duration = [5, 8]) {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * duration[1] + 's';
        particle.style.animationDuration = (Math.random() * (duration[1] - duration[0]) + duration[0]) + 's';
        particlesContainer.appendChild(particle);
    }
}

function createStars(count = 80) {
    const starsContainer = document.getElementById('stars');
    if (!starsContainer) return;

    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 2 + 's';
        star.style.animationDuration = (Math.random() * 1 + 1.5) + 's';
        starsContainer.appendChild(star);
    }
}

function createMeteors(count = 8) {
    const meteorsContainer = document.getElementById('meteors');
    if (!meteorsContainer) return;

    for (let i = 0; i < count; i++) {
        const meteor = document.createElement('div');
        meteor.className = 'meteor';
        meteor.style.left = Math.random() * 100 + '%';
        meteor.style.animationDelay = Math.random() * 3 + 's';
        meteor.style.animationDuration = (Math.random() * 1 + 2) + 's';
        meteorsContainer.appendChild(meteor);
    }
}

function createCircuitLines() {
    const circuitContainer = document.getElementById('circuitLines');
    if (!circuitContainer) return;

    // Lignes horizontales
    for (let i = 0; i < 10; i++) {
        const line = document.createElement('div');
        line.className = 'circuit-line horizontal';
        line.style.top = Math.random() * 100 + '%';
        line.style.left = Math.random() * 80 + '%';
        line.style.animationDelay = Math.random() * 6 + 's';
        circuitContainer.appendChild(line);
    }

    // Lignes verticales
    for (let i = 0; i < 8; i++) {
        const line = document.createElement('div');
        line.className = 'circuit-line vertical';
        line.style.left = Math.random() * 100 + '%';
        line.style.top = Math.random() * 80 + '%';
        line.style.animationDelay = Math.random() * 6 + 's';
        circuitContainer.appendChild(line);
    }
}

// ========== LOGO DVD ANIMATION ==========

function initDVDLogo() {
    const logoContainer = document.getElementById('logoContainer');
    const dvdLogo = document.getElementById('dvdLogo');

    if (!logoContainer || !dvdLogo) return;

    const rectWidth = 1916;
    const rectHeight = 1075;
    const rectTop = 0;
    const rectLeft = 0;
    const logoWidth = 50;
    const logoHeight = 71.88;

    let posX = Math.random() * (rectWidth - logoWidth) + rectLeft;
    let posY = Math.random() * (rectHeight - logoHeight) + rectTop;
    let deltaX = 2;
    let deltaY = 2;

    function moveLogo() {
        posX += deltaX;
        posY += deltaY;

        if (posX <= rectLeft || posX >= rectWidth + rectLeft - logoWidth) {
            deltaX = -deltaX;
        }
        if (posY <= rectTop || posY >= rectHeight + rectTop - logoHeight) {
            deltaY = -deltaY;
        }

        logoContainer.style.transform = `translate(${posX}px, ${posY}px)`;
    }

    setInterval(moveLogo, 16);
}

// ========== ANIMATION COMPTEURS ==========

function animateCounter(element, start, end, duration) {
    if (!element) return;

    const startTime = Date.now();

    function updateCounter() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.round(start + (end - start) * easeOutQuart);

        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }

    updateCounter();
}

// ========== INITIALISATION ==========

function initCommonOverlay() {
    // Charger les badges
    fetchBadges(OVERLAY_CONFIG.twitch.broadcasterId);

    // Initialiser WebSocket
    initWebSocket();

    // Créer les animations de base
    createParticles();
    createStars();

    // Initialiser le logo DVD
    initDVDLogo();
}

// Auto-initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', initCommonOverlay);
