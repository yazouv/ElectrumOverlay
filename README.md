# 🎮 Electrum Overlay - Système d'overlay Twitch avec EventSub

Un système complet d'overlay pour Twitch avec intégration EventSub, animations en temps réel et statistiques de stream.

> This readme is also available in [English](README-EN.md).

## 📋 Table des matières

- [🚀 Fonctionnalités](#-fonctionnalités)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🔧 Configuration Twitch](#-configuration-twitch)
- [🌐 Tunnel Webhook (ngrok)](#-tunnel-webhook-ngrok)
- [🏃‍♂️ Lancement](#️-lancement)
- [📹 Overlays OBS](#-overlays-obs)
- [🧪 Tests](#-tests)
- [📷 Preview/Gallerie](#-previewgallerie)
- [🎨 Personnalisation](#-personnalisation)
- [🛠️ Développement](#️-développement)
- [❗ Dépannage](#-dépannage)

## 🚀 Fonctionnalités

### ✨ Alertes en temps réel
- **Nouveaux followers** avec animations
- **Nouveaux abonnés** et renouvellements
- **Cadeaux d'abonnements** (sub gifts)
- **Raids entrants** avec effet spéciaux
- **Donations de bits** avec confettis
- **Queue d'alertes** pour éviter les chevauchements

### 🎭 Overlays animés
- **Page de démarrage** : Compte à rebours avant stream
- **Page principale** : Statistiques en temps réel + alertes
- **Page de fin** : Écran de fin de stream
- **Animations CSS** avancées avec particules
- **Responsive design** pour tous les écrans

### 📊 Statistiques en temps réel
- Nombre de followers
- Nombre d'abonnés
- Spectateurs actuels
- Mise à jour automatique via WebSocket

## 📦 Installation

### Prérequis
- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **npm** (inclus avec Node.js)
- **Compte Twitch**
- **ngrok** pour les webhooks ([Télécharger](https://ngrok.com/))

<!-- mettre un info avec un trait bleu -->
<div style="border-left: 4px solid #007bff; padding-left: 10px; margin-bottom: 20px;">
    <strong>Information :</strong> Prendre la version gratuite : <a>https://ngrok.com/pricing</a>
    <br>
    <i>"Run your pre-release versions or internal apps on ngrok. Free forever."</i>
</div>

### 1. Cloner le projet
```bash
git clone https://github.com/yazouv/electrum-overlay.git
cd electrum-overlay
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Préparer la configuration
```bash
cp src/config/config.example.js src/config/config.js
```

### 4. Structure du projet
```
electrum-overlay/
├── 📁 src/
│   ├── 📁 config/
│   │   └── config.js          # Configuration backend (sensible)
│   ├── 📁 routes/
│   │   └── api.js             # API routes principales
│   └── 📁 services/
│       ├── EventSubManager.js # Gestion EventSub
│       ├── TwitchAuth.js      # Authentification Twitch
│       ├── WebhookHandler.js  # Traitement webhooks
│       └── StreamStatsManager.js # Statistiques stream
├── 📁 public/
│   ├── index.html             # Overlay principal
│   ├── starting.html          # Page de démarrage
│   ├── ending.html            # Page de fin
│   ├── 📁 js/
│   │   ├── config.js          # Configuration frontend (public)
│   │   ├── overlay-common.js  # Fonctions communes
│   │   ├── index.js           # Logique page principale
│   │   ├── starting.js        # Logique démarrage
│   │   └── ending.js          # Logique fin
│   └── 📁 css/
│       ├── overlay-common.css # Styles communs
│       ├── index.css          # Styles page principale
│       ├── starting.css       # Styles démarrage
│       └── ending.css         # Styles fin
├── package.json
├── server.js                  # Serveur principal
├── ConfigOBS.json             # Configuration OBS
```

## ⚙️ Configuration

Le système utilise **deux fichiers de configuration** séparés :

### 📋 1. Configuration Backend (`src/config/config.js`)
**⚠️ SENSIBLE - Ne pas partager publiquement**

### 🌐 2. Configuration Frontend (`public/js/config.js`)
**✅ PUBLIC - Peut être partagé**

## 🔧 Configuration Twitch

### 1. 🏗️ Créer une application Twitch

1. Allez sur [Twitch Developers Console](https://dev.twitch.tv/console)
2. Cliquez sur **"Enregistrer votre application"**
3. Remplissez les informations :
   - **Nom** : `Mon Overlay Twitch`
   - **URL de redirection OAuth** : `http://localhost:8080/auth-callback`
   - **Catégorie** : `Application Integration`
   - **Type de client** : Confidentiel
4. Cliquez sur **"Créer"**
5. Notez votre **Client ID** et **Client Secret** et mettez le dans le `src/config/config.js`

### 2. 🆔 Obtenir votre User ID

1. Récuperez votre User ID sur : [StreamWeasels](https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/)
2. Mettez le dans le `public/js/config.js` > OVERLAY_CONFIG.twitch.broadcasterId
3. Mettez le aussi dans `src/config/config.js` > twitch.BROADCASTER_ID

### 3. 🔑 Obtenir un Access Token

#### Méthode 1 : Flow OAuth (Recommandé)
1. Démarrez le serveur : `npm start`
2. Allez sur `http://localhost:8080/auth-url`
3. Autorisez l'application
4. Le token sera affiché dans la console
5. Mettez le dans `src/config/config.js` > twitch.USER_ACCESS_TOKEN

#### Méthode 2 : Token Generator
1. Allez sur [Twitch Token Generator](https://twitchtokengenerator.com/)
2. Sélectionnez les scopes nécessaires
3. Générez le token
4. Mettez le dans `src/config/config.js` > twitch.USER_ACCESS_TOKEN

## 🌐 Tunnel Webhook (ngrok)

Les webhooks EventSub nécessitent une URL HTTPS publique. Utilisez ngrok :

### 1. 📥 Installer ngrok
- Téléchargez depuis [ngrok.com](https://ngrok.com/)
- Ou via npm : `npm install -g ngrok`

### 2. 🚀 Démarrer le tunnel
```bash
# Dans un terminal séparé
ngrok http 8080
```

### 3. 📋 Copier l'URL
Ngrok va afficher quelque chose comme :
```
Forwarding  https://abcdefgijkl.ngrok-free.app -> http://localhost:8080
```

### 4. ⚙️ Configurer l'URL webhook
Dans `src/config/config.js` :
```javascript
WEBHOOK_URL: "https://abcdefgijkl.ngrok-free.app/eventsub"
```

### 5. ⚠️ Note importante
- L'URL ngrok change à chaque redémarrage (version gratuite)
- Pensez à mettre à jour la configuration après chaque redémarrage

## 🏃‍♂️ Lancement

### 🚀 Démarrage complet

1. **Démarrer ngrok** (terminal 1) :
```bash
ngrok http 8080
```

2. **Mettre à jour l'URL webhook** dans `src/config/config.js`

3. **Démarrer le serveur** (terminal 2) :
```bash
npm start
```

4. **Accéder aux overlays** :
   - Principal : `http://localhost:8080`
   - Démarrage : `http://localhost:8080/starting.html`
   - Fin : `http://localhost:8080/ending.html`
   - Pause : `http://localhost:8080/pause.html`

### 📊 Commandes disponibles

```bash
npm start          # Démarrer le serveur
npm run dev        # Mode développement (nodemon)
npm run clean      # Nettoyer les abonnements EventSub
npm run setup      # Assistant de configuration
npm run config     # Mettre à jour la configuration
```

## 📹 Overlays OBS
Utilisez le fichier `ConfigOBS.json` pour configurer les overlays dans OBS :

> Celui-ci contient les scènes préconfigurées pour les overlays, avec les sources nécessaires.

## 🧪 Tests

### 🔧 Avec Twitch CLI

1. **Installer Twitch CLI** :
   - [Guide d'installation](https://dev.twitch.tv/docs/cli/)

2. **Configurer** :
```bash
twitch configure
```

3. **Tester les événements** :
```bash
# Test follow
twitch event trigger channel.follow --to-user-id=197983290 --from-user-id=123456

# Test subscription
twitch event trigger channel.subscribe --to-user-id=197983290 --user-id=123456

# Test raid
twitch event trigger channel.raid --to-user-id=197983290 --from-user-id=123456

# Test bits
twitch event trigger channel.cheer --to-user-id=197983290 --user-id=123456
```

### 🌐 Test via API

```bash
# Test webhook directement
curl -X POST http://localhost:8080/eventsub \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "type": "channel.follow",
      "version": "1"
    },
    "event": {
      "user_name": "TestUser",
      "user_display_name": "TestUser"
    }
  }'
```

## 📷 Preview/Gallerie
![Starting](./readme/starting.gif)

![Pause](./readme/pause.gif)

![Ending](./readme/ending.gif)

<div style="border-left: 4px solid #007bff; padding-left: 10px; margin-bottom: 20px;">
    <strong>Note :</strong> Les overlays sont conçus pour être utilisés avec OBS ou tout autre logiciel de streaming compatible.
</div>

## 🎨 Personnalisation

### 🎨 Modifier les couleurs

Dans `public/js/config.js` :

```javascript
theme: {
    primary: '#3b82f6',      // Couleur principale
    secondary: '#10b981',    // Couleur secondaire
    accent: '#f59e0b',       // Couleur d'accent
    background: '#1f2937',   // Fond
    text: '#f9fafb'         // Texte
}
```

### ✨ Personnaliser les alertes

```javascript
alerts: {
    types: {
        follow: {
            icon: '<i class="fas fa-heart"></i>',          // Icône
            title: 'NOUVEAU FOLLOW',                        // Titre
            gradient: 'linear-gradient(...)',               // Dégradé
            border: '#3b82f6',                             // Couleur bordure
            defaultMessage: 'Merci pour le follow !'       // Message par défaut
        }
    }
}
```

### 🎭 Modifier les animations

Dans `public/css/overlay-common.css` :

```css
/* Animation d'apparition des alertes */
.alert-container.show {
    animation: slideInFromTop 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Animation de particules */
.particle {
    animation: particleFloat 3s infinite ease-in-out;
}
```

### 📊 Configurer les panneaux

Dans `public/js/config.js` :

```javascript
panels: {
    followers: {
        enabled: true,           // Activer/désactiver
        position: 'top-left',    // Position
        updateInterval: 5000,    // Intervalle de mise à jour (ms)
        animationDuration: 300   // Durée animation (ms)
    }
}
```

## 🛠️ Développement

### 🔧 Mode développement

```bash
npm run dev
```

Le serveur redémarre automatiquement lors des modifications.

### 📁 Structure du code

#### Backend (`src/`)
- **`services/`** : Services métier
  - `EventSubManager.js` : Gestion des abonnements EventSub
  - `TwitchAuth.js` : Authentification Twitch
  - `WebhookHandler.js` : Traitement des webhooks
  - `StreamStatsManager.js` : Statistiques en temps réel

- **`routes/`** : Routes Express
  - `api.js` : API principale
  - `api-fixed.js` : API avec données fixes

- **`config/`** : Configuration
  - `config.js` : Configuration sensible backend

#### Frontend (`public/`)
- **`js/`** : Scripts JavaScript
  - `config.js` : Configuration publique
  - `overlay-common.js` : Fonctions partagées
  - `index.js`, `starting.js`, `ending.js` : Logique par page

- **`css/`** : Styles CSS
  - `overlay-common.css` : Styles partagés
  - Page-specific CSS files

### 🔌 API Endpoints

```javascript
GET  /                          // Page principale
GET  /starting.html             // Page de démarrage
GET  /ending.html               // Page de fin
GET  /auth                      // Authentification Twitch
GET  /auth-callback             // Callback OAuth
POST /eventsub                  // Webhooks EventSub
GET  /api/stream-stats          // Statistiques de stream en json
GET  /api/stream-stats-html     // Statistiques de stream en html
```

### 🔄 WebSocket Events

```javascript
// Côté client
socket.on('alert', (data) => {
    // Nouvelle alerte reçue
});

socket.on('stats-update', (data) => {
    // Mise à jour des statistiques
});

// Côté serveur
wss.broadcast('alert', alertData);
wss.broadcast('stats-update', statsData);
```

## ❗ Dépannage

### 🚫 Erreurs communes

#### 1. "ECONNREFUSED" lors du démarrage
```
Cause : Port déjà utilisé
Solution : Changer le port dans config.js ou arrêter le processus
```

#### 2. Webhooks non reçus
```
Cause : URL ngrok incorrecte ou expirée
Solution : 
1. Vérifier que ngrok fonctionne
2. Mettre à jour WEBHOOK_URL dans config.js
3. Redémarrer le serveur
```

#### 3. Alertes non affichées
```
Cause : Configuration EventSub ou WebSocket
Solution :
1. Vérifier les logs serveur
2. Tester avec Twitch CLI
3. Vérifier les scopes du token
```

#### 4. "Token expired" ou "401 Unauthorized"
```
Cause : Access token expiré
Solution : Générer un nouveau token d'accès
```

### 📋 Vérifications de santé

#### 1. Vérifier la configuration
```bash
# Tester la configuration
npm run config
```

#### 2. Vérifier les abonnements EventSub
```bash
# Lister les abonnements actifs
curl -X GET 'https://api.twitch.tv/helix/eventsub/subscriptions' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
-H 'Client-Id: YOUR_CLIENT_ID'
```

#### 3. Nettoyer les abonnements
```bash
# Supprimer tous les abonnements
npm run clean
```

#### 4. Logs détaillés

Activer les logs dans `public/js/config.js` :
```javascript
debug: {
    enabled: true,              // Activer les logs debug
    websocket: true,            // Logs WebSocket
    alerts: true,               // Logs alertes
    api: true                   // Logs API
}
```

### 🔧 Outils de débogage

#### 1. Console navigateur
- Ouvrir F12 → Console
- Vérifier les erreurs JavaScript
- Voir les messages WebSocket

#### 2. Logs serveur
- Les logs s'affichent dans le terminal
- Format : `[TIMESTAMP] [LEVEL] Message`

#### 3. Test manual des endpoints
```bash
# Tester l'API stats
curl http://localhost:8080/api/stats

# Tester le webhook
curl -X POST http://localhost:8080/eventsub \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### 📞 Support

1. **Vérifier les logs** pour identifier l'erreur
2. **Consulter la documentation Twitch** : [EventSub Guide](https://dev.twitch.tv/docs/eventsub/)
4. **Nettoyer et recommencer** : `npm run clean` puis redémarrer

---

## 📄 Licence

MIT License - Voir le fichier `LICENSE` pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

---

**🎮 Bon streaming ! 🚀**