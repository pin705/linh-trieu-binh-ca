# Getting Started with Linh Triều Bình Ca

Quick start guide to get the game running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js 20.x or higher** - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** package manager

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/pin705/linh-trieu-binh-ca.git
cd linh-trieu-binh-ca
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Nuxt 3 (latest)
- nuxt-mongoose (MongoDB integration)
- nuxt-auth-utils (authentication)
- All required dependencies

### 3. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
# On macOS with Homebrew:
brew services start mongodb-community

# On Ubuntu/Debian:
sudo systemctl start mongod

# On Windows:
# MongoDB runs as a service automatically after installation
```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 4. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your preferred editor
nano .env
# or
code .env
```

Update the following in `.env`:

```env
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/linh-trieu-binh-ca

# For MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/linh-trieu-binh-ca

# Generate a random secret for authentication:
AUTH_SECRET=your-very-secure-random-secret-key-here

# Game configuration (optional, uses defaults if not set):
ENERGY_REGEN_MINUTES=5
MAX_ENERGY_DEFAULT=50
STARTING_GOLD=1000
```

**Pro Tip**: Generate a secure AUTH_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Start Development Server

```bash
npm run dev
```

The application will start at: **http://localhost:3000**

You should see:
```
✔ Nuxt 3 ready
✔ Local:    http://localhost:3000
✔ Network:  use --host to expose
```

### 6. Seed the Database

In a new terminal window (keep the dev server running):

```bash
# Seed the database with initial 11 card templates
curl -X POST http://localhost:3000/api/admin/seed
```

Expected response:
```json
{
  "success": true,
  "message": "Successfully seeded database with 11 card templates",
  "count": 11,
  "action": "seed"
}
```

### 7. Access the Game UI

Open your browser and navigate to: **http://localhost:3000**

You should see the game's beautiful login/register interface!

**First Time Setup:**
1. Click "Register here" to create an account
2. Fill in email, username (3-20 chars), and password (min 8 chars)
3. After registration, login with your credentials
4. You'll see the user dashboard with your stats

### 8. Test the API (Optional)

If you want to test the API directly:

**Get all card templates:**
```bash
curl http://localhost:3000/api/cards/templates
```

**Register a user via API:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

## Verify Installation

Visit these URLs in your browser:

1. **Main page**: http://localhost:3000
   - Should show the game UI with login/register forms
   - Beautiful gradient background with card game theme

2. **Card Templates API**: http://localhost:3000/api/cards/templates
   - Should return JSON with 11 card templates

3. **Test the game flow:**
   - Register a new account
   - Login to see your dashboard
   - View your stats: Energy (50/50), Gold (1000), Level (1)
   - Note: You won't have any cards yet - they need to be granted through battles or admin commands

## Common Issues and Solutions

### Issue: "Cannot connect to MongoDB"

**Solution:**
- Check if MongoDB is running: `mongo` (for local) or test Atlas connection
- Verify MONGODB_URI in `.env` file
- For Atlas, ensure your IP is whitelisted in Network Access

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Use a different port
PORT=3001 npm run dev
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .nuxt
npm install
```

### Issue: Database seed returns "already seeded"

**Solution:**
```bash
# Force reseed
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

## Development Workflow

### Project Structure

```
linh-trieu-binh-ca/
├── server/
│   ├── models/           # Mongoose schemas (User, CardTemplate, UserCard)
│   ├── api/              # API endpoints
│   │   ├── admin/        # Admin routes (seed, etc.)
│   │   └── cards/        # Card-related routes
│   └── utils/            # Server utilities
├── components/           # Vue components (future)
├── pages/                # Nuxt pages (future)
├── app.vue               # Main app component
└── nuxt.config.ts        # Configuration
```

### Making Changes

1. **Edit files** - Changes are hot-reloaded automatically
2. **Server files** (server/*) - Server restarts automatically
3. **Vue components** - UI updates instantly

### Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview

# Start production server
node .output/server/index.mjs
```

## Next Steps

Now that you have the foundation running, explore:

1. **Models Documentation**: `server/models/README.md`
2. **Architecture Guide**: `ARCHITECTURE.md`
3. **API Documentation**: See README.md for endpoint details

### Playing the Game

Now you can enjoy the full game experience:

1. ✅ **Register & Login** - Create your account and login
2. 🎴 **Card Collection** - View and manage your cards (need to grant yourself cards via admin tools or win battles)
3. 📋 **Deck Builder** - Build your battle deck with your favorite cards
4. ⚔️ **Battle** - Fight AI opponents in PvE mode
5. 📊 **View History** - Check your battle records and stats

### Game Features Available

- **Energy System**: Regenerates 1 point every 5 minutes (max 50)
- **Card Fusion**: Combine cards to make them stronger (costs 5 energy)
- **PvE Battles**: Fight AI opponents (costs 10 energy)
- **PvP Battles**: Challenge other players (costs 10 energy)
- **Deck Management**: Build decks up to any size
- **Card Locking**: Protect important cards from fusion

## Need Help?

- **Documentation**: Check ARCHITECTURE.md for detailed information
- **Models**: See server/models/README.md for schema details
- **Issues**: Create an issue on GitHub
- **Nuxt 3 Docs**: https://nuxt.com/docs
- **Mongoose Docs**: https://mongoosejs.com/docs

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Database
curl -X POST localhost:3000/api/admin/seed              # Seed database
curl -X POST localhost:3000/api/admin/seed -d '{"force": true}'  # Force reseed
curl localhost:3000/api/cards/templates                 # List all cards

# Utilities
npm run postinstall     # Regenerate Nuxt types
```

## Success! 🎉

You're now playing the Linh Triều Bình Ca game!

**What's Included:**
- ✅ Full authentication system (register/login/logout)
- ✅ User dashboard with live stats
- ✅ Card collection viewer with filtering
- ✅ Deck builder with drag-and-drop style
- ✅ Battle system (PvE and PvP)
- ✅ Battle history tracking
- ✅ Energy regeneration system
- ✅ Card fusion/enhancement mechanics
- ✅ Responsive and beautiful UI
- ✅ 11 initial card templates
- ✅ Complete REST API

**Game Models:**
- User (authentication, stats, energy)
- CardTemplate (master card data)
- UserCard (player-owned cards)
- Battle (battle history and results)

**API Endpoints:**
- `/api/auth/*` - Authentication
- `/api/cards/*` - Card templates
- `/api/user/cards/*` - User cards
- `/api/battle/*` - Battle system
- `/api/admin/*` - Admin tools

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

Happy gaming! 🚀
