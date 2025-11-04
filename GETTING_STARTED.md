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

### 7. Test the API

**Get all card templates:**
```bash
curl http://localhost:3000/api/cards/templates
```

**Get only legendary cards:**
```bash
curl http://localhost:3000/api/cards/templates?rarity=legendary
```

**Get fire element cards:**
```bash
curl http://localhost:3000/api/cards/templates?element=fire
```

## Verify Installation

Visit these URLs in your browser:

1. **Main page**: http://localhost:3000
   - Should show "Linh Triều Bình Ca - Coming Soon"

2. **Card Templates API**: http://localhost:3000/api/cards/templates
   - Should return JSON with 11 card templates

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

### Suggested Learning Path

1. ✅ You've completed: Basic setup and seeding
2. 📚 Read: ARCHITECTURE.md to understand the system
3. 🔍 Explore: The three model files to understand data structure
4. 🛠️ Next: Implement authentication (register/login)
5. 🎮 Then: Build card management features
6. ⚔️ Finally: Create the battle system

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

You're now ready to start developing the Linh Triều Bình Ca game!

The foundation is set with:
- ✅ Nuxt 3 framework
- ✅ MongoDB connection
- ✅ Three core models (User, CardTemplate, UserCard)
- ✅ API endpoints for cards
- ✅ 11 initial card templates
- ✅ Energy regeneration system
- ✅ Card fusion mechanics

Happy coding! 🚀
