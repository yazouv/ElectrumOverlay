# 🤝 Contribuer à Electrum Overlay

Merci de votre intérêt pour contribuer à Electrum Overlay ! Ce guide vous explique comment participer au développement de ce système d'overlay Twitch.

> This contributing guide is also available in [English](#english-version).

## 📋 Table des matières

- [🚀 Comment contribuer](#-comment-contribuer)
- [🐛 Signaler un bug](#-signaler-un-bug)
- [💡 Proposer une fonctionnalité](#-proposer-une-fonctionnalité)
- [🔧 Configuration de l'environnement](#-configuration-de-lenvironnement)
- [📝 Standards de code](#-standards-de-code)
- [🔄 Workflow Git](#-workflow-git)
- [✅ Tests](#-tests)
- [📚 Documentation](#-documentation)
- [🏷️ Conventions de nommage](#️-conventions-de-nommage)
- [🔍 Review process](#-review-process)
- [🍵 Buy me a coffee](#-buy-me-a-coffee)

## 🚀 Comment contribuer

Il existe plusieurs façons de contribuer au projet :

- 🐛 **Signaler des bugs** via les issues
- 💡 **Proposer des améliorations** ou nouvelles fonctionnalités
- 📝 **Améliorer la documentation**
- 🎨 **Créer de nouveaux thèmes** d'overlay
- 🔧 **Corriger des bugs** existants
- ⚡ **Optimiser les performances**
- 🌐 **Ajouter des traductions**

## 🐛 Signaler un bug

Avant de signaler un bug, assurez-vous qu'il n'a pas déjà été signalé en consultant les [issues existantes](../../issues).

### Template de bug report

```markdown
**Description du bug**
Une description claire et concise du problème.

**Étapes pour reproduire**
1. Allez à '...'
2. Cliquez sur '...'
3. Faites défiler jusqu'à '...'
4. Voyez l'erreur

**Comportement attendu**
Description claire de ce qui devrait se passer.

**Captures d'écran**
Si applicable, ajoutez des captures d'écran.

**Environnement :**
- OS: [e.g. Windows 11, macOS 14, Ubuntu 22.04]
- Node.js: [e.g. v18.17.0]
- Version du projet: [e.g. v1.0.0]
- Navigateur: [e.g. Chrome 119, Firefox 118]
- Version OBS: [e.g. 30.0.0]

**Logs d'erreur**
```
Collez ici les logs d'erreur pertinents
```

**Contexte additionnel**
Toute autre information qui pourrait aider.
```

## 💡 Proposer une fonctionnalité

Pour proposer une nouvelle fonctionnalité :

1. Vérifiez qu'elle n'existe pas déjà dans les issues
2. Créez une nouvelle issue avec le label `enhancement`
3. Décrivez clairement la fonctionnalité souhaitée
4. Expliquez pourquoi elle serait utile
5. Proposez une implémentation si possible

### Template de feature request

```markdown
**Résumé de la fonctionnalité**
Description courte et claire de la fonctionnalité.

**Motivation**
Pourquoi cette fonctionnalité est-elle nécessaire ?

**Description détaillée**
Description complète du comportement souhaité.

**Alternatives considérées**
Autres solutions envisagées pour résoudre le problème.

**Maquettes/Exemples**
Si applicable, ajoutez des maquettes ou exemples.
```

## 🔧 Configuration de l'environnement

### Prérequis

- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **Git** ([Télécharger](https://git-scm.com/))
- **Éditeur** recommandé : VS Code avec extensions :
  - ESLint
  - Prettier
  - Live Server

### Installation

1. **Forkez** le repository
2. **Clonez** votre fork :
   ```bash
   git clone https://github.com/VOTRE_USERNAME/ElectrumOverlay.git
   cd ElectrumOverlay
   ```

3. **Installez** les dépendances :
   ```bash
   npm install
   ```

4. **Configurez** l'environnement :
   ```bash
   cp src/config/config.example.js src/config/config.js
   ```

5. **Configurez** vos tokens Twitch dans `src/config/config.js`

6. **Lancez** en mode développement :
   ```bash
   npm run dev
   ```

### Structure du projet

```
src/
├── config/          # Configuration
├── routes/          # Routes API Express
├── services/        # Services métier
│   ├── EventSubManager.js    # Gestion EventSub Twitch
│   ├── StreamStatsManager.js # Statistiques de stream
│   ├── TwitchAuth.js         # Authentification Twitch
│   └── WebhookHandler.js     # Gestion des webhooks
public/
├── css/             # Styles des overlays
├── js/              # Scripts front-end
├── fonts/           # Polices personnalisées
└── *.html           # Pages d'overlay
```

## 📝 Standards de code

### JavaScript

- **ES6+** moderne
- **Const/let** au lieu de `var`
- **Arrow functions** quand approprié
- **Async/await** pour les promesses
- **JSDoc** pour la documentation des fonctions

```javascript
/**
 * Gère l'authentification avec l'API Twitch
 * @param {string} clientId - ID client Twitch
 * @param {string} clientSecret - Secret client Twitch
 * @returns {Promise<string>} Token d'accès
 */
async function authenticateWithTwitch(clientId, clientSecret) {
    // Implementation...
}
```

### CSS

- **BEM** methodology pour le nommage des classes
- **CSS Variables** pour les thèmes
- **Mobile-first** approach
- **Animations** fluides avec `transform` et `opacity`

```css
/* BEM Naming */
.alert-card {}
.alert-card__title {}
.alert-card__content {}
.alert-card--highlight {}

/* CSS Variables */
:root {
    --primary-color: #9146ff;
    --animation-duration: 300ms;
}
```

### HTML

- **Semantic** HTML5
- **Accessibility** (ARIA labels, alt texts)
- **Valid** HTML5

## 🔄 Workflow Git

### Branches

- `main` : Version stable en production
- `develop` : Développement en cours
- `feature/nom-fonctionnalité` : Nouvelles fonctionnalités
- `fix/nom-bug` : Corrections de bugs
- `hotfix/nom-correction` : Corrections urgentes

### Commits

Utilisez des messages de commit clairs suivant la convention [Conventional Commits](https://www.conventionalcommits.org/) :

```
type(scope): description

feat(eventsub): ajout support des raids entrants
fix(overlay): correction animation des alerts
docs(readme): mise à jour installation
style(css): amélioration responsive design
refactor(api): restructuration routes
test(webhooks): ajout tests EventSub
```

### Pull Requests

1. **Créez** une branche depuis `develop`
2. **Implémentez** vos changements
3. **Testez** localement
4. **Documentez** si nécessaire
5. **Créez** la PR vers `develop`

#### Template de PR

```markdown
## 📝 Description
Description claire des changements apportés.

## 🔗 Issue liée
Closes #123

## 🧪 Tests effectués
- [ ] Tests locaux passent
- [ ] Testé sur différents navigateurs
- [ ] Testé avec OBS Studio
- [ ] Testé les webhooks Twitch

## 📷 Captures d'écran
Si applicable, ajoutez des captures.

## ✅ Checklist
- [ ] Code respecte les standards du projet
- [ ] Documentation mise à jour
- [ ] Tests ajoutés/mis à jour
- [ ] Changements testés localement
```

## ✅ Tests

### Tests manuels

Avant de soumettre une PR, testez :

1. **Démarrage** du serveur sans erreurs
2. **Connexion** aux API Twitch
3. **Affichage** correct des overlays
4. **Fonctionnement** des webhooks
5. **Animations** fluides
6. **Responsive** design

### Tests automatisés

Nous encourageons l'ajout de tests unitaires :

```javascript
// Exemple de test pour un service
describe('TwitchAuth', () => {
    test('should authenticate successfully', async () => {
        const auth = new TwitchAuth();
        const token = await auth.getAccessToken();
        expect(token).toBeDefined();
    });
});
```

## 📚 Documentation

### Code

- **Commentez** le code complexe
- **Documentez** les fonctions publiques avec JSDoc
- **Maintenez** le README à jour

### Commits

- Mettez à jour la documentation si vos changements l'affectent
- Ajoutez des exemples pour les nouvelles fonctionnalités

## 🏷️ Conventions de nommage

### Fichiers et dossiers

- **kebab-case** pour les fichiers CSS et HTML
- **PascalCase** pour les classes JavaScript
- **camelCase** pour les fonctions et variables

### Variables et fonctions

```javascript
// Constants
const API_BASE_URL = 'https://api.twitch.tv';

// Functions
function handleNewFollower() {}
async function fetchUserData() {}

// Classes
class EventSubManager {}
class TwitchAuth {}
```

## 🔍 Review process

### Critères de review

- ✅ **Fonctionnalité** : Le code fait ce qu'il doit faire
- ✅ **Standards** : Respecte les conventions du projet
- ✅ **Performance** : N'introduit pas de régression
- ✅ **Sécurité** : Pas de vulnérabilités introduites
- ✅ **Documentation** : Code bien documenté

### Timeline

- **24-48h** : Premier review d'un maintainer
- **72h** : Résolution des commentaires
- **1 semaine** : Merge après validation finale

## 🌟 Reconnaissance

Les contributeurs sont listés dans :
- Section Contributors du README
- Releases notes pour les contributions majeures
- Hall of Fame pour les contributeurs réguliers

## 📞 Support

Besoin d'aide ? N'hésitez pas à :

- 💬 Créer une **discussion** pour les questions générales
- 🐛 Ouvrir une **issue** pour les bugs
- 📧 Contacter les **maintainers** pour les questions urgentes

---

## 🍵 Buy me a coffee

Si vous appréciez notre travail et souhaitez nous soutenir, vous pouvez nous offrir un café :

[![Buy Me A Coffee](https://s3-eu-west-1.amazonaws.com/tpd/logos/5c58570cfdd26f0001068f06/0x0.png)](https://coff.ee/yazouv)

**Merci de contribuer à Electrum Overlay ! 🎮✨**

## English Version

# 🤝 Contributing to Electrum Overlay

Thank you for your interest in contributing to Electrum Overlay! This guide explains how to participate in the development of this Twitch overlay system.

## 🚀 How to contribute

There are several ways to contribute to the project:

- 🐛 **Report bugs** via issues
- 💡 **Suggest improvements** or new features
- 📝 **Improve documentation**
- 🎨 **Create new overlay themes**
- 🔧 **Fix existing bugs**
- ⚡ **Optimize performance**
- 🌐 **Add translations**

## 🔧 Environment setup

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

### Installation

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ElectrumOverlay.git
   cd ElectrumOverlay
   ```

3. **Install** dependencies:
   ```bash
   npm install
   ```

4. **Configure** environment:
   ```bash
   cp src/config/config.example.js src/config/config.js
   ```

5. **Set up** your Twitch tokens in `src/config/config.js`

6. **Run** in development mode:
   ```bash
   npm run dev
   ```

## 📝 Code standards

### JavaScript

- **ES6+** modern syntax
- **Const/let** instead of `var`
- **Arrow functions** when appropriate
- **Async/await** for promises
- **JSDoc** for function documentation

### CSS

- **BEM** methodology for class naming
- **CSS Variables** for theming
- **Mobile-first** approach
- **Smooth animations** with `transform` and `opacity`

## 🔄 Git workflow

### Branches

- `main`: Stable production version
- `develop`: Ongoing development
- `feature/feature-name`: New features
- `fix/bug-name`: Bug fixes
- `hotfix/fix-name`: Urgent fixes

### Commits

Use clear commit messages following [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(eventsub): add support for incoming raids
fix(overlay): fix alert animations
docs(readme): update installation guide
```

## 📞 Support

Need help? Feel free to:

- 💬 Create a **discussion** for general questions
- 🐛 Open an **issue** for bugs
- 📧 Contact **maintainers** for urgent questions

---

## 🍵 Buy me a coffee

If you appreciate our work and want to support us, you can buy us a coffee:

[![Buy Me A Coffee](https://s3-eu-west-1.amazonaws.com/tpd/logos/5c58570cfdd26f0001068f06/0x0.png)](https://coff.ee/yazouv)

**Thank you for contributing to Electrum Overlay! 🎮✨**
