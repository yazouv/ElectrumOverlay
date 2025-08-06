# 🎮 Electrum Overlay - Twitch Overlay System with EventSub

A complete overlay system for Twitch with EventSub integration, real-time animations and stream statistics.

> Ce readme est également disponible en [français](README.md).

## 📋 Table of Contents

- [🚀 Features](#-features)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🔧 Twitch Configuration](#-twitch-configuration)
- [🌐 Webhook Tunnel (ngrok)](#-webhook-tunnel-ngrok)
- [🚛 TruckyApp Integration](#-truckyapp-integration)
- [🏃‍♂️ Launch](#️-launch)
- [📹 OBS Overlays](#-obs-overlays)
- [🧪 Tests](#-tests)
- [📷 Preview/Gallery](#-previewgallery)
- [🎨 Customization](#-customization)
- [🛠️ Development](#️-development)
- [❗ Troubleshooting](#-troubleshooting)

## 🚀 Features

### ✨ Real-time alerts
- **New followers** with animations
- **New subscribers** and renewals
- **Subscription gifts** (sub gifts)
- **Incoming raids** with special effects
- **Bits donations** with confetti
- **Alert queue** to avoid overlaps

### 🎭 Animated overlays
- **Starting page**: Countdown before stream
- **Main page**: Real-time statistics + alerts
- **Ending page**: End of stream screen
- **Pause page**: Stream break screen
- **Advanced CSS animations** with particles
- **Responsive design** for all screens

### 📊 Real-time statistics
- Follower count
- Subscriber count
- Current viewers
- Automatic updates via WebSocket

## 📦 Installation

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** (included with Node.js)
- **Twitch account**
- **ngrok** (integrated) or optional manual installation ([Download](https://ngrok.com/))

<!-- Blue info box -->
<div style="border-left: 4px solid #007bff; padding-left: 10px; margin-bottom: 20px;">
    <strong>Information:</strong> Get the free version: <a>https://ngrok.com/pricing</a>
    <br>
    <i>"Run your pre-release versions or internal apps on ngrok. Free forever."</i>
</div>

### 1. Clone the project
```bash
git clone https://github.com/yazouv/ElectrumOverlay.git
cd electrum-overlay
```

### 2. Install dependencies
```bash
npm install
```

### 3. Prepare configuration
```bash
cp src/config/config.example.js src/config/config.js
```

### 4. Project structure
```
electrum-overlay/
├── 📁 src/
│   ├── 📁 config/
│   │   └── config.js          # Backend configuration (sensitive)
│   ├── 📁 routes/
│   │   └── api.js             # Main API routes
│   └── 📁 services/
│       ├── EventSubManager.js # EventSub management
│       ├── TwitchAuth.js      # Twitch authentication
│       ├── WebhookHandler.js  # Webhook processing
│       └── StreamStatsManager.js # Stream statistics
├── 📁 public/
│   ├── index.html             # Main overlay
│   ├── starting.html          # Starting page
│   ├── ending.html            # Ending page
│   ├── pause.html             # Pause page
│   ├── 📁 js/
│   │   ├── config.js          # Frontend configuration (public)
│   │   ├── overlay-common.js  # Common functions
│   │   ├── index.js           # Main page logic
│   │   ├── starting.js        # Starting logic
│   │   ├── ending.js          # Ending logic
│   │   └── pause.js           # Pause logic
│   └── 📁 css/
│       ├── overlay-common.css # Common styles
│       ├── index.css          # Main page styles
│       ├── starting.css       # Starting styles
│       ├── ending.css         # Ending styles
│       └── pause.css          # Pause styles
├── package.json
├── server.js                  # Main server
├── ConfigOBS.json             # OBS configuration
```

## ⚙️ Configuration

The system uses **two separate configuration files**:

### 📋 1. Backend Configuration (`src/config/config.js`)
**⚠️ SENSITIVE - Do not share publicly**

#### 🔐 WEBHOOK_SECRET Generation
The `WEBHOOK_SECRET` is a cryptographic secret used to secure Twitch EventSub webhooks. **You must generate it yourself**:

```javascript
// In Node.js (console or script)
const crypto = require('crypto');
const webhookSecret = crypto.randomBytes(32).toString('hex');
console.log('WEBHOOK_SECRET:', webhookSecret);
```

**Important characteristics:**
- **32 characters minimum** (64 hexadecimal characters recommended)
- **Random and unique** for your application
- **Never share** or commit to Git
- **Used to verify** that webhooks actually come from Twitch

#### ⚙️ EventSub Events Configuration
Don't forget to configure conditions for certain events in `src/config/config.js` (line 50-51):

```javascript
"condition": {
    "broadcaster_user_id": "197983290",     // Your User ID
    "moderator_user_id": "197983290"        // Same User ID to be moderator
}
```

**Important:** Replace `"197983290"` with your own Twitch User ID obtained in the next step.

### 🌐 2. Frontend Configuration (`public/js/config.js`)
**✅ PUBLIC - Can be shared**

## 🔧 Twitch Configuration

### 1. 🏗️ Create a Twitch application

1. Go to [Twitch Developers Console](https://dev.twitch.tv/console)
2. Click on **"Register Your Application"**
3. Fill in the information:
   - **Name**: `My Twitch Overlay`
   - **OAuth Redirect URLs**: `http://localhost:8080/auth-callback`
   - **Category**: `Application Integration`
   - **Client Type**: Confidential
4. Click **"Create"**
5. Note your **Client ID** and **Client Secret** and put them in `src/config/config.js`

### 2. 🆔 Get your User ID

1. Get your User ID from: [StreamWeasels](https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/)
2. Put it in `public/js/config.js` > OVERLAY_CONFIG.twitch.broadcasterId
3. Also put it in `src/config/config.js` > twitch.BROADCASTER_ID

### 3. 🔑 Get an Access Token

#### Method 1: OAuth Flow (Recommended)
1. Start the server: `npm start`
2. Go to `http://localhost:8080/auth-url`
3. Authorize the application
4. The token will be displayed in the console
5. Put it in `src/config/config.js` > twitch.USER_ACCESS_TOKEN

#### Method 2: Token Generator
1. Go to [Twitch Token Generator](https://twitchtokengenerator.com/)
2. Select the necessary scopes
3. Generate the token
4. Put it in `src/config/config.js` > twitch.USER_ACCESS_TOKEN

## 🌐 Webhook Tunnel (ngrok)

EventSub webhooks require a public HTTPS URL. **ngrok is integrated and enabled by default** in ElectrumOverlay:

### 🔄 Automatic mode (default)
The system automatically starts ngrok and configures the webhook URL. In `src/config/config.js`:
```javascript
"ngrok": {
    "ENABLED": true,  // ngrok enabled by default
},
```

**Advantages:**
- ✅ Automatic configuration
- ✅ No need to manually manage ngrok
- ✅ Webhook URL updated automatically

### ⚙️ Manual mode (optional)
If you prefer to manage ngrok manually, disable automatic mode:

#### 1. 🔧 Disable automatic ngrok
In `src/config/config.js`:
```javascript
"ngrok": {
    "ENABLED": false,  // Disable automatic ngrok
},
```

#### 2. 📥 Install ngrok
- Download from [ngrok.com](https://ngrok.com/)
- Or via npm: `npm install -g ngrok`

#### 3. 🚀 Start the tunnel
```bash
# In a separate terminal
ngrok http 8080
```

#### 4. 📋 Copy the URL
Ngrok will display something like:
```
Forwarding  https://abcdefgijkl.ngrok-free.app -> http://localhost:8080
```

#### 5. ⚙️ Configure the webhook URL
In `src/config/config.js`:
```javascript
WEBHOOK_URL: "https://abcdefgijkl.ngrok-free.app/eventsub"
```

#### 6. ⚠️ Important note
- The ngrok URL changes with each restart (free version)
- Remember to update the configuration after each restart

## 🚛 TruckyApp Integration

ElectrumOverlay includes **TruckyApp integration enabled by default** for trucking simulation streamers:

### 🔄 Enabled mode (default)
TruckyApp integration automatically fetches your game statistics. In `src/config/config.js`:
```javascript
"trucky": {
    "enable": true,                    // TruckyApp enabled by default
    "USER_ID": "90694",               // Replace with your Trucky user ID
},
```

**Features:**
- ✅ Automatic user data retrieval
- ✅ Display of last completed job
- ✅ Company statistics (if applicable)
- ✅ Seamless integration with overlays

### ⚙️ TruckyApp Configuration

#### 1. 🆔 Get your TruckyApp User ID
1. Go to [TruckyApp](https://truckyapp.com/)
2. Log in to your account
3. Go to your profile
4. The user ID is found in the URL: `https://truckyapp.com/user/[YOUR_ID]`

#### 2. 🔧 Configure the ID
In `src/config/config.js`, replace `"90694"` with your ID:
```javascript
"trucky": {
    "enable": true,
    "USER_ID": "YOUR_TRUCKY_ID",
},
```

### 🚫 Disable TruckyApp (optional)
If you don't play trucking simulation games, you can disable this feature:

In `src/config/config.js`:
```javascript
"trucky": {
    "enable": false,              // Disable TruckyApp
    "USER_ID": "90694",
},
```

**Note:** Even when disabled, this configuration doesn't affect other system functionalities.

## 🏃‍♂️ Launch

### 🚀 Complete startup

The system automatically starts ngrok by default. If ngrok is enabled:

1. **Start the server**:
```bash
npm start
```

2. **Access the overlays**:
   - Main: `http://localhost:8080`
   - Starting: `http://localhost:8080/starting.html`
   - Ending: `http://localhost:8080/ending.html`
   - Pause: `http://localhost:8080/pause.html`

If you have disabled ngrok (manual mode):

1. **Start ngrok** (terminal 1):
```bash
ngrok http 8080
```

2. **Update webhook URL** in `src/config/config.js`

3. **Start the server** (terminal 2):
```bash
npm start
```

4. **Access the overlays**:
   - Main: `http://localhost:8080`
   - Starting: `http://localhost:8080/starting.html`
   - Ending: `http://localhost:8080/ending.html`
   - Pause: `http://localhost:8080/pause.html`

### 📊 Available commands

```bash
npm start          # Start the server
npm run dev        # Development mode (nodemon)
npm run clean      # Clean EventSub subscriptions
npm run setup      # Configuration assistant
npm run config     # Update configuration
```

## 📹 OBS Overlays
Use the `ConfigOBS.json` file to configure overlays in OBS:

> This contains pre-configured scenes for overlays, with necessary sources.

## 🧪 Tests

### 🔧 With Twitch CLI

1. **Install Twitch CLI**:
   - [Installation Guide](https://dev.twitch.tv/docs/cli/)

2. **Configure**:
```bash
twitch configure
```

3. **Test events**:
```bash
# Test follow
twitch event trigger channel.follow --to-user-id=YOUR_USER_ID --from-user-id=123456

# Test subscription
twitch event trigger channel.subscribe --to-user-id=YOUR_USER_ID --user-id=123456

# Test raid
twitch event trigger channel.raid --to-user-id=YOUR_USER_ID --from-user-id=123456

# Test bits
twitch event trigger channel.cheer --to-user-id=YOUR_USER_ID --user-id=123456
```

### 🌐 Test via API

```bash
# Test webhook directly
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

## 📷 Preview/Gallery
> Starting page
  
![Starting](./readme/starting.gif)

> Intermission screen

![Intermission](./readme/pause.gif)

> Ending screen

![Ending](./readme/ending.gif)

<div style="border-left: 4px solid #007bff; padding-left: 10px; margin-bottom: 20px;">
    <strong>Note:</strong> Overlays are designed to be used with OBS or any other compatible streaming software.
</div>

## 🎨 Customization

### 🎨 Modify colors

In `public/js/config.js`:

```javascript
theme: {
    primary: '#3b82f6',      // Primary color
    secondary: '#10b981',    // Secondary color
    accent: '#f59e0b',       // Accent color
    background: '#1f2937',   // Background
    text: '#f9fafb'         // Text
}
```

### ✨ Customize alerts

```javascript
alerts: {
    types: {
        follow: {
            icon: '<i class="fas fa-heart"></i>',          // Icon
            title: 'NEW FOLLOW',                           // Title
            gradient: 'linear-gradient(...)',              // Gradient
            border: '#3b82f6',                             // Border color
            defaultMessage: 'Thanks for the follow!'       // Default message
        }
    }
}
```

### 🎭 Modify animations

In `public/css/overlay-common.css`:

```css
/* Alert appearance animation */
.alert-container.show {
    animation: slideInFromTop 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Particle animation */
.particle {
    animation: particleFloat 3s infinite ease-in-out;
}
```

### 📊 Configure panels

In `public/js/config.js`:

```javascript
panels: {
    followers: {
        enabled: true,           // Enable/disable
        position: 'top-left',    // Position
        updateInterval: 5000,    // Update interval (ms)
        animationDuration: 300   // Animation duration (ms)
    }
}
```

## 🛠️ Development

### 🔧 Development mode

```bash
npm run dev
```

The server automatically restarts when changes are made.

### 📁 Code structure

#### Backend (`src/`)
- **`services/`**: Business services
  - `EventSubManager.js`: EventSub subscription management
  - `TwitchAuth.js`: Twitch authentication
  - `WebhookHandler.js`: Webhook processing
  - `StreamStatsManager.js`: Real-time statistics

- **`routes/`**: Express routes
  - `api.js`: Main API
  - `api-fixed.js`: API with fixed data

- **`config/`**: Configuration
  - `config.js`: Sensitive backend configuration

#### Frontend (`public/`)
- **`js/`**: JavaScript scripts
  - `config.js`: Public configuration
  - `overlay-common.js`: Shared functions
  - `index.js`, `starting.js`, `ending.js`, `pause.js`: Page-specific logic

- **`css/`**: CSS styles
  - `overlay-common.css`: Shared styles
  - Page-specific CSS files

### 🔌 API Endpoints

```javascript
GET  /                          // Main page
GET  /starting.html             // Starting page
GET  /ending.html               // Ending page
GET  /pause.html                // Pause page
GET  /auth                      // Twitch authentication
GET  /auth-callback             // OAuth callback
POST /eventsub                  // EventSub webhooks
GET  /api/stream-stats          // Stream statistics in JSON
GET  /api/stream-stats-html     // Stream statistics in HTML
```

### 🔄 WebSocket Events

```javascript
// Client side
socket.on('alert', (data) => {
    // New alert received
});

socket.on('stats-update', (data) => {
    // Statistics update
});

// Server side
wss.broadcast('alert', alertData);
wss.broadcast('stats-update', statsData);
```

## ❗ Troubleshooting

### 🚫 Common errors

#### 1. "ECONNREFUSED" on startup
```
Cause: Port already in use
Solution: Change port in config.js or stop the process
```

#### 2. Webhooks not received
```
Cause: Incorrect or expired ngrok URL
Solution: 
1. Check that ngrok is working
2. Update WEBHOOK_URL in config.js
3. Restart the server
```

#### 3. Alerts not displayed
```
Cause: EventSub or WebSocket configuration
Solution:
1. Check server logs
2. Test with Twitch CLI
3. Check token scopes
```

#### 4. "Token expired" or "401 Unauthorized"
```
Cause: Expired access token
Solution: Generate a new access token
```

### 📋 Health checks

#### 1. Check configuration
```bash
# Test configuration
npm run config
```

#### 2. Check EventSub subscriptions
```bash
# List active subscriptions
curl -X GET 'https://api.twitch.tv/helix/eventsub/subscriptions' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
-H 'Client-Id: YOUR_CLIENT_ID'
```

#### 3. Clean subscriptions
```bash
# Remove all subscriptions
npm run clean
```

#### 4. Detailed logs

Enable logs in `public/js/config.js`:
```javascript
debug: {
    enabled: true,              // Enable debug logs
    websocket: true,            // WebSocket logs
    alerts: true,               // Alert logs
    api: true                   // API logs
}
```

### 🔧 Debugging tools

#### 1. Browser console
- Open F12 → Console
- Check JavaScript errors
- View WebSocket messages

#### 2. Server logs
- Logs appear in the terminal
- Format: `[TIMESTAMP] [LEVEL] Message`

#### 3. Manual endpoint testing
```bash
# Test stats API
curl http://localhost:8080/api/stats

# Test webhook
curl -X POST http://localhost:8080/eventsub \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### 📞 Support

1. **Check logs** to identify the error
2. **Consult Twitch documentation**: [EventSub Guide](https://dev.twitch.tv/docs/eventsub/)
3. **Clean and restart**: `npm run clean` then restart

---

## 📄 License

MIT License - See the `LICENSE` file for more details.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the project
2. Create a branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**🎮 Happy streaming! 🚀**
