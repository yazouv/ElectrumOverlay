# 🔒 Politique de Sécurité - Electrum Overlay

Ce document décrit les mesures de sécurité en place et les procédures pour signaler des vulnérabilités dans Electrum Overlay.

> This security policy is also available in [English](#english-version).

## 📋 Table des matières

- [🛡️ Versions supportées](#️-versions-supportées)
- [🚨 Signaler une vulnérabilité](#-signaler-une-vulnérabilité)
- [🔐 Mesures de sécurité](#-mesures-de-sécurité)
- [⚠️ Bonnes pratiques](#️-bonnes-pratiques)
- [🔧 Configuration sécurisée](#-configuration-sécurisée)
- [🔍 Audit de sécurité](#-audit-de-sécurité)
- [📚 Ressources](#-ressources)

## 🛡️ Versions supportées

Nous fournissons des mises à jour de sécurité pour les versions suivantes :

| Version | Support         | Statut |
| ------- | --------------- | ------ |
| 1.x.x   | ✅ Supportée   | Stable |
| < 1.0   | ❌ Non supportée | EOL    |

**Note :** Seule la dernière version majeure reçoit des correctifs de sécurité.

## 🚨 Signaler une vulnérabilité

### 📧 Contact Responsable

Pour signaler une vulnérabilité de sécurité, **NE CRÉEZ PAS** d'issue publique. Contactez-nous directement :

- **Email sécurisé** : [sécurité à signaler via GitHub]
- **GitHub Security Advisory** : [Créer un advisory privé](../../security/advisories/new)
- **Délai de réponse** : 48-72 heures maximum

### 📝 Informations à inclure

Votre rapport doit contenir :

```markdown
**Type de vulnérabilité**
[OWASP Top 10, CWE, CVE, etc.]

**Description**
Description claire et concise de la vulnérabilité.

**Impact**
Quel est l'impact potentiel de cette vulnérabilité ?

**Étapes de reproduction**
1. Configuration nécessaire
2. Étapes détaillées pour reproduire
3. Commandes/URLs utilisées
4. Résultat observé

**Environnement**
- Version d'Electrum Overlay: [e.g. v1.0.0]
- Node.js: [e.g. v18.17.0]
- OS: [e.g. Windows 11, Ubuntu 22.04]
- Configuration: [e.g. production, développement]

**Preuve de concept**
Code ou captures d'écran démontrant la vulnérabilité.

**Solution suggérée**
Si vous avez une idée de correction.
```

### ⏱️ Timeline de réponse

| Délai | Action |
|-------|--------|
| 72h | Accusé de réception et évaluation initiale |
| 7 jours | Analyse complète et classification |
| 14 jours | Développement du correctif |
| 30 jours | Publication du correctif et advisory |

## 🔐 Mesures de sécurité

### 🔑 Authentification et Autorisation

#### Tokens Twitch
- **App Access Token** : Utilisé pour les API publiques
- **User Access Token** : Nécessaire pour EventSub et données sensibles
- **Rotation automatique** : Tokens régénérés si expirés
- **Scopes minimaux** : Seuls les scopes nécessaires sont demandés

```javascript
// Scopes requis minimaux
const REQUIRED_SCOPES = [
    'user:read:chat',      // Lecture messages chat
    'user:bot',            // Actions bot utilisateur
    'channel:bot',         // Actions bot sur la chaîne
    'channel:read:subscriptions', // Lecture abonnements
    'moderator:read:followers'    // Lecture followers
];
```

#### Sécurisation des tokens
- ❌ **Jamais** de tokens dans le code source
- ✅ **Variables d'environnement** ou fichiers de config
- ✅ **Gitignore** pour `src/config/config.js`
- ✅ **Exemple de configuration** fourni

### 🌐 Sécurité WebSocket

#### Validation des connexions
```javascript
// Validation des messages WebSocket
ws.on('message', (message) => {
    try {
        const data = JSON.parse(message);
        validateWebSocketMessage(data);
    } catch (error) {
        ws.close(1003, 'Invalid message format');
    }
});
```

#### Protection contre les attaques
- **Rate limiting** sur les connexions WebSocket
- **Validation** stricte des messages JSON
- **Timeout** automatique des connexions inactives
- **Origine** vérifiée pour les connexions cross-origin

### 🕷️ Sécurité des Webhooks

#### Vérification HMAC
```javascript
// Vérification de signature Twitch EventSub
const hmac = crypto
    .createHmac('sha256', webhookSecret)
    .update(message)
    .digest('hex');

const isValid = crypto.timingSafeEqual(
    Buffer.from(`sha256=${hmac}`),
    Buffer.from(signature)
);
```

#### Protection des endpoints
- **Signature HMAC** obligatoire en production
- **Rate limiting** sur `/eventsub`
- **Logs** détaillés des tentatives d'accès
- **Validation** stricte des headers Twitch

### 🏠 Sécurité du serveur local

#### Configuration réseau
- **Localhost uniquement** par défaut (127.0.0.1)
- **Ports non-privilégiés** (8080, 8081)
- **CORS** désactivé pour les origines externes
- **Firewall** recommandé en production

#### Gestion des erreurs
```javascript
// Pas d'exposition d'informations sensibles
app.use((error, req, res, next) => {
    console.error('Internal error:', error);
    res.status(500).json({ 
        error: 'Internal server error' 
    });
});
```

## ⚠️ Bonnes pratiques

### 🔧 Pour les développeurs

#### Configuration
```javascript
// ❌ MAUVAIS
const config = {
    clientSecret: "abc123secret",  // Token en dur
    webhookSecret: "secret123"     // Secret faible
};

// ✅ BON
const config = {
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    webhookSecret: crypto.randomBytes(32).toString('hex')
};
```

#### Gestion des secrets
- **Environnement séparé** pour développement/production
- **Secrets forts** (32+ caractères aléatoires)
- **Rotation régulière** des secrets
- **Backup sécurisé** des configurations

### 📡 Pour l'exposition publique

#### Tunnels (ngrok, CloudFlare, etc.)
```bash
# Sécurisation ngrok
ngrok http 8080 --auth="user:password" --bind-tls=true
```

#### Reverse proxy recommandé
```nginx
# Configuration Nginx sécurisée
server {
    listen 443 ssl;
    server_name overlay.votre-domaine.com;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
    
    # Headers de sécurité
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    location /eventsub {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 🖥️ Pour l'utilisation en streaming

#### OBS Studio
- **Sources locales** uniquement (`http://localhost:8080`)
- **Pas d'URLs publiques** dans les Browser Sources
- **Refresh sécurisé** des sources entre les streams
- **Backup** de la configuration OBS

#### Isolation réseau
- **VLAN séparé** pour le streaming si possible
- **Firewall applicatif** activé
- **Monitoring** des connexions réseau
- **VPN** pour l'accès distant

## 🔧 Configuration sécurisée

### 📁 Structure des fichiers

```
src/config/
├── config.example.js    # ✅ Versionné (template)
├── config.js           # ❌ Gitignore (secrets)
└── .env.example        # ✅ Template environnement
```

### 🔐 Exemple de configuration sécurisée

```javascript
// src/config/config.js (ne pas versionner)
const crypto = require('crypto');

module.exports = {
    server: {
        PORT: parseInt(process.env.PORT) || 8080,
        WS_PORT: parseInt(process.env.WS_PORT) || 8081,
        HOST: process.env.HOST || '127.0.0.1', // Localhost uniquement
    },
    twitch: {
        CLIENT_ID: process.env.TWITCH_CLIENT_ID,
        CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
        BROADCASTER_ID: process.env.TWITCH_BROADCASTER_ID,
        USER_ACCESS_TOKEN: process.env.TWITCH_USER_TOKEN,
        WEBHOOK_URL: process.env.WEBHOOK_URL,
        WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || crypto.randomBytes(32).toString('hex'),
        REDIRECT_URI: process.env.REDIRECT_URI || 'http://localhost:8080/auth-callback',
        SCOPES: [
            'user:read:chat',
            'user:bot',
            'channel:bot',
            'channel:read:subscriptions',
            'moderator:read:followers'
        ]
    },
    security: {
        ENABLE_HMAC_VERIFICATION: process.env.NODE_ENV === 'production',
        RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
        RATE_LIMIT_MAX: 100, // Requêtes par fenêtre
        SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    }
};
```

### 🛡️ Variables d'environnement

```bash
# .env (ne pas versionner)
NODE_ENV=production
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
TWITCH_BROADCASTER_ID=your_broadcaster_id_here
TWITCH_USER_TOKEN=your_user_token_here
WEBHOOK_URL=https://your-tunnel-url.ngrok.io/eventsub
WEBHOOK_SECRET=your_32_char_random_secret_here
PORT=8080
WS_PORT=8081
HOST=127.0.0.1
```

## 🔍 Audit de sécurité

### 📊 Checklist de sécurité

#### ✅ Configuration
- [ ] Tokens Twitch configurés et valides
- [ ] Secrets forts (32+ caractères)
- [ ] Gitignore configuré pour les secrets
- [ ] Variables d'environnement utilisées
- [ ] HMAC activé en production

#### ✅ Réseau
- [ ] Serveur local uniquement (127.0.0.1)
- [ ] Ports non-privilégiés utilisés
- [ ] Tunnel sécurisé pour webhooks
- [ ] Rate limiting configuré
- [ ] Headers de sécurité ajoutés

#### ✅ Application
- [ ] Validation des entrées utilisateur
- [ ] Gestion sécurisée des erreurs
- [ ] Logs sans informations sensibles
- [ ] Timeouts configurés
- [ ] Dependencies à jour

### 🔄 Vérifications automatiques

```bash
# Audit de sécurité npm
npm audit

# Vérification des vulnérabilités
npm audit --audit-level high

# Mise à jour automatique (patch)
npm audit fix

# Mise à jour manuelle (breaking changes)
npm audit fix --force
```

### 📈 Monitoring

#### Logs à surveiller
```bash
# Connexions suspectes
grep "403\|401\|429" server.log

# Tentatives d'accès webhook
grep "webhook" server.log

# Erreurs d'authentification
grep "❌.*auth" server.log

# WebSocket anormales
grep "WebSocket.*error" server.log
```

#### Métriques importantes
- **Taux d'erreur** des webhooks (< 1%)
- **Latence** WebSocket (< 100ms)
- **Connexions** simultanées (monitoring)
- **Rate limiting** activations

## 📚 Ressources

### 🔗 Documentation de sécurité

- [Twitch EventSub Security](https://dev.twitch.tv/docs/eventsub/#verify-the-signature)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

### 🛠️ Outils recommandés

```bash
# Scan de vulnérabilités
npm install -g npm-audit-resolver
npm install -g snyk

# Analyse statique
npm install -g eslint-plugin-security
npm install -g jshint

# Monitoring
npm install helmet           # Headers de sécurité
npm install express-rate-limit # Rate limiting
npm install cors             # CORS sécurisé
```

### 📖 Guides complémentaires

- **[Securing Node.js Applications](https://nodejs.org/en/docs/guides/getting-started-guide/)**
- **[WebSocket Security](https://devcenter.heroku.com/articles/websocket-security)**
- **[Twitch Developer Guidelines](https://dev.twitch.tv/docs/authentication/)**

---

## English Version

# 🔒 Security Policy - Electrum Overlay

This document describes the security measures in place and procedures for reporting vulnerabilities in Electrum Overlay.

## 🛡️ Supported Versions

We provide security updates for the following versions:

| Version | Support         | Status |
| ------- | --------------- | ------ |
| 1.x.x   | ✅ Supported   | Stable |
| < 1.0   | ❌ Not supported | EOL    |

**Note:** Only the latest major version receives security patches.

## 🚨 Reporting a Vulnerability

### 📧 Responsible Contact

To report a security vulnerability, **DO NOT CREATE** a public issue. Contact us directly:

- **Secure Email**: [security to be reported via GitHub]
- **GitHub Security Advisory**: [Create a private advisory](../../security/advisories/new)
- **Response Time**: 48-72 hours maximum

### 📝 Information to Include

Your report should contain:

```markdown
**Vulnerability Type**
[OWASP Top 10, CWE, CVE, etc.]

**Description**
Clear and concise description of the vulnerability.

**Impact**
What is the potential impact of this vulnerability?

**Reproduction Steps**
1. Required configuration
2. Detailed steps to reproduce
3. Commands/URLs used
4. Observed result

**Environment**
- Electrum Overlay Version: [e.g. v1.0.0]
- Node.js: [e.g. v18.17.0]
- OS: [e.g. Windows 11, Ubuntu 22.04]
- Configuration: [e.g. production, development]

**Proof of Concept**
Code or screenshots demonstrating the vulnerability.

**Suggested Solution**
If you have an idea for a fix.
```

### ⏱️ Response Timeline

| Timeline | Action |
|----------|--------|
| 72h | Acknowledgment and initial assessment |
| 7 days | Complete analysis and classification |
| 14 days | Fix development |
| 30 days | Fix release and advisory publication |

## 🔐 Security Measures

### 🔑 Authentication and Authorization

#### Twitch Tokens
- **App Access Token**: Used for public APIs
- **User Access Token**: Required for EventSub and sensitive data
- **Automatic rotation**: Tokens regenerated if expired
- **Minimal scopes**: Only necessary scopes are requested

#### Token Security
- ❌ **Never** tokens in source code
- ✅ **Environment variables** or config files
- ✅ **Gitignore** for `src/config/config.js`
- ✅ **Configuration example** provided

### 🌐 WebSocket Security

#### Connection validation
- **Rate limiting** on WebSocket connections
- **Strict validation** of JSON messages
- **Automatic timeout** for inactive connections
- **Origin verification** for cross-origin connections

### 🕷️ Webhook Security

#### HMAC Verification
- **HMAC signature** mandatory in production
- **Rate limiting** on `/eventsub`
- **Detailed logs** of access attempts
- **Strict validation** of Twitch headers

### 🏠 Local Server Security

#### Network configuration
- **Localhost only** by default (127.0.0.1)
- **Non-privileged ports** (8080, 8081)
- **CORS** disabled for external origins
- **Firewall** recommended in production

## ⚠️ Best Practices

### 🔧 For Developers

#### Secure Configuration
- **Separate environment** for development/production
- **Strong secrets** (32+ random characters)
- **Regular rotation** of secrets
- **Secure backup** of configurations

### 📡 For Public Exposure

#### Tunnels (ngrok, CloudFlare, etc.)
- Use authentication when possible
- Enable HTTPS/TLS only
- Monitor access logs

### 🖥️ For Streaming Use

#### OBS Studio
- **Local sources only** (`http://localhost:8080`)
- **No public URLs** in Browser Sources
- **Secure refresh** of sources between streams
- **Backup** OBS configuration

## 🔧 Secure Configuration

### 🔐 Secure Configuration Example

```javascript
// src/config/config.js (do not version)
module.exports = {
    server: {
        PORT: process.env.PORT || 8080,
        HOST: '127.0.0.1', // Localhost only
    },
    twitch: {
        CLIENT_ID: process.env.TWITCH_CLIENT_ID,
        CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
        // ... other secure configuration
    },
    security: {
        ENABLE_HMAC_VERIFICATION: process.env.NODE_ENV === 'production',
        RATE_LIMIT_WINDOW: 15 * 60 * 1000,
        RATE_LIMIT_MAX: 100,
    }
};
```

## 🔍 Security Audit

### 📊 Security Checklist

#### ✅ Configuration
- [ ] Twitch tokens configured and valid
- [ ] Strong secrets (32+ characters)
- [ ] Gitignore configured for secrets
- [ ] Environment variables used
- [ ] HMAC enabled in production

#### ✅ Network
- [ ] Local server only (127.0.0.1)
- [ ] Non-privileged ports used
- [ ] Secure tunnel for webhooks
- [ ] Rate limiting configured
- [ ] Security headers added

#### ✅ Application
- [ ] User input validation
- [ ] Secure error handling
- [ ] Logs without sensitive information
- [ ] Timeouts configured
- [ ] Dependencies up to date

### 🔄 Automatic Checks

```bash
# npm security audit
npm audit

# Check for vulnerabilities
npm audit --audit-level high

# Automatic update (patches)
npm audit fix
```

## 📚 Resources

### 🔗 Security Documentation

- [Twitch EventSub Security](https://dev.twitch.tv/docs/eventsub/#verify-the-signature)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

### 🛠️ Recommended Tools

```bash
# Vulnerability scanning
npm install -g npm-audit-resolver
npm install -g snyk

# Static analysis
npm install -g eslint-plugin-security

# Security middleware
npm install helmet
npm install express-rate-limit
npm install cors
```

---

**Merci de nous aider à maintenir Electrum Overlay sécurisé ! 🔒✨**

**Thank you for helping keep Electrum Overlay secure! 🔒✨**
