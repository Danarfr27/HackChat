# HACKER CHAT v2.0.4

![Hacker Chat](https://img.shields.io/badge/HACKER-CHAT-00ff41?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.0.4-00ffff?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-ff0000?style=for-the-badge)

A secure, terminal-style chat application with 24-hour auto-deleting messages. Built with vanilla HTML, CSS, and JavaScript.

![Terminal Theme](https://i.imgur.com/placeholder.png)

## Features

- **Terminal Interface**: Green-on-black hacker theme with CRT effects
- **Secure Login**: Multi-user authentication system
- **24h Auto-Delete**: All messages automatically expire after 24 hours
- **Local Storage**: Messages stored locally in browser
- **Multi-Tab Support**: Real-time sync across browser tabs
- **Encrypted Connection**: Simulated AES-256 encryption display
- **Command System**: Built-in commands (/help, /clear, /stats, etc.)
- **Responsive Design**: Works on desktop and mobile

## Default Credentials

| Username | Password | Access Code | Role |
|----------|----------|-------------|------|
| admin | hacker123 | 1337 | ADMIN |
| operator | secureshell | 4242 | OPERATOR |
| guest | guestpass | 0000 | GUEST |

## File Structure

```
hacker-chat/
├── login.html          # Login page
├── index.html          # Main chat page
├── css/
│   └── style.css       # Terminal theme styles
├── js/
│   ├── login.js        # Authentication logic
│   └── chat.js         # Chat functionality
└── README.md           # This file
```

## Deployment Guide

### 1. Deploy to Vercel (Recommended)

#### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `hacker-chat`
3. Make it public or private

#### Step 2: Push Code to GitHub

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Hacker Chat v2.0.4"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/hacker-chat.git

# Push
git push -u origin main
```

#### Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (leave empty)
   - **Output Directory**: `./`

5. Add Environment Variables (optional):
   ```
   CHAT_USERNAME=your_username
   CHAT_PASSWORD=your_password
   CHAT_ACCESS_CODE=your_code
   ```

6. Click "Deploy"

7. Your site will be live at: `https://your-project.vercel.app`

### 2. Deploy to GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" > "Pages"
3. Source: Deploy from a branch
4. Branch: `main` / `root`
5. Click "Save"
6. Your site will be at: `https://your-username.github.io/hacker-chat`

### 3. Deploy to Netlify

1. Go to [Netlify](https://netlify.com)
2. Drag and drop your project folder
3. Site will be live instantly

## Customization

### Change Login Credentials

Edit `js/login.js`:

```javascript
const CONFIG = {
    users: [
        { username: 'yourname', password: 'yourpass', accessCode: '1234', role: 'ADMIN' },
        // Add more users...
    ]
};
```

### Change Message Expiry Time

Edit `js/chat.js`:

```javascript
const CHAT_CONFIG = {
    messageExpiry: 24 * 60 * 60 * 1000, // 24 hours (change this)
};
```

### Change Theme Colors

Edit `css/style.css`:

```css
:root {
    --terminal-green: #00ff41;  /* Change to your color */
    --bg-primary: #0a0a0a;      /* Background color */
}
```

## Available Commands

| Command | Description |
|---------|-------------|
| `/help` | Show all commands |
| `/clear` | Clear chat history |
| `/stats` | Show chat statistics |
| `/time` | Show current time |
| `/users` | Show online users |
| `/me <action>` | Send action message |
| `/quit` | Logout |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Ctrl + L` | Clear screen |
| `↑ / ↓` | Navigate message history |

## Security Notes

- This is a demo application for educational purposes
- Credentials are stored in plain JavaScript (not secure for production)
- For production use:
  - Implement server-side authentication
  - Use HTTPS
  - Store credentials securely (database + hashing)
  - Add rate limiting

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT License - Feel free to use and modify!

---

**Created with by Hacker Chat Team**

```
╔══════════════════════════════════════╗
║  ENCRYPTED CONNECTION ESTABLISHED    ║
║  Protocol: TLS 1.3                   ║
║  Status: SECURE                      ║
╚══════════════════════════════════════╝
```
