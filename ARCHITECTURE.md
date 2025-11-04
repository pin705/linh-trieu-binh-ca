# Linh Triều Bình Ca - Architecture Documentation

## Project Overview

This is a modern full-stack card game built with Nuxt 3, MongoDB, and Mongoose. The game features a reactive UI, card collection mechanics, fusion system, and energy-based gameplay.

## Tech Stack

- **Framework**: Nuxt 3 (v3.14.0)
- **Database**: MongoDB
- **ODM**: Mongoose (via nuxt-mongoose)
- **Authentication**: nuxt-auth-utils
- **Runtime**: Node.js 20.x
- **Language**: TypeScript

## Architecture Principles

### 1. API-First Design
All game logic resides in `server/api/` endpoints. The client communicates with the server through these APIs using `useFetch` or `useAsyncData`.

### 2. Reactive UI
Vue 3 components update automatically without page reloads. State is managed through Nuxt's composables and the auth system.

### 3. Security
- All game-critical API routes must verify authentication
- Database operations are performed server-side only
- Client cannot directly manipulate game data

## Directory Structure

```
/home/runner/work/linh-trieu-binh-ca/linh-trieu-binh-ca/
├── app.vue                    # Main application component
├── nuxt.config.ts             # Nuxt configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
│
├── server/                    # Server-side code
│   ├── models/                # Mongoose schemas
│   │   ├── User.model.ts      # User + game profile
│   │   ├── CardTemplate.model.ts  # Card templates
│   │   ├── UserCard.model.ts  # Player-owned cards
│   │   └── README.md          # Models documentation
│   │
│   ├── api/                   # API endpoints
│   │   ├── admin/
│   │   │   └── seed.post.ts   # Database seeding
│   │   └── cards/
│   │       └── templates.get.ts  # Get card templates
│   │
│   └── utils/                 # Server utilities
│       └── seedCardTemplates.ts  # Initial data
│
├── components/                # Vue components (future)
│   └── [game UI components]
│
└── pages/                     # Nuxt pages (future)
    └── [game pages]
```

## Data Models

### User Model
Extends authentication with game-specific fields:
- **Profile**: email, username, passwordHash
- **Progression**: level, experience, gold
- **Energy System**: energy, maxEnergy, lastEnergyRefill
- **Methods**: Energy management (getCurrentEnergy, updateEnergy, consumeEnergy)

### CardTemplate Model
Master templates for all cards:
- **Identity**: name, description, imageUrl
- **Stats**: baseAttack, baseDefense
- **Classification**: rarity (5 levels), element (7 types)
- **Configuration**: cost, maxLevel, fusionMaterial
- **Methods**: Stat calculations based on level and rarity

### UserCard Model
Player-owned card instances:
- **Ownership**: owner (User ref), template (CardTemplate ref)
- **Current State**: currentAttack, currentDefense, level, experience
- **Management**: isLocked, isInDeck, deckPosition
- **History**: fusedCards array, obtainedFrom, lastUsedAt
- **Methods**: Enhancement, deck management, usage tracking

## Game Mechanics

### Energy System
- Players have a finite energy pool (default: 50)
- Energy regenerates at 1 point per 5 minutes
- Actions consume energy (battles, card fusion, etc.)
- Implementation: `User.model.ts` with auto-calculation methods

### Card Rarity System
Five tiers with stat multipliers:
- **Common**: 1.0x (common drops)
- **Uncommon**: 1.2x (moderate rarity)
- **Rare**: 1.5x (hard to obtain)
- **Epic**: 2.0x (very rare)
- **Legendary**: 3.0x (extremely rare)

### Card Fusion (Enhancement)
- Sacrifice one card to enhance another
- Base card gains 10% of sacrifice card's stats
- Level increases by 1 (up to template's maxLevel)
- History tracked in fusedCards array
- Implementation: `UserCard.enhance()` method

### Element System
Seven elements for strategic gameplay:
- Fire, Water, Earth, Wind, Light, Dark, Neutral
- Can be used for type advantages (future implementation)

## API Endpoints

### Public Endpoints

#### GET /api/cards/templates
Get all card templates with optional filters.

**Query Parameters:**
- `rarity`: Filter by rarity level
- `element`: Filter by element type
- `isActive`: Show only active cards (default: true)

**Response:**
```json
{
  "success": true,
  "count": 11,
  "data": [/* array of card templates */]
}
```

### Admin Endpoints

#### POST /api/admin/seed
Seed database with initial card templates.

**Body:**
```json
{
  "force": false  // true to clear and reseed
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully seeded...",
  "count": 11,
  "action": "seed"
}
```

## Initial Card Templates

The game ships with 11 card templates:

| Name | Rarity | Element | Attack | Defense | Cost |
|------|--------|---------|--------|---------|------|
| Chiến Binh Tân Binh | Common | Neutral | 10 | 8 | 1 |
| Cung Thủ Rừng Xanh | Common | Wind | 12 | 6 | 1 |
| Phù Thủy Lửa | Common | Fire | 15 | 5 | 2 |
| Kiếm Sĩ Thép | Uncommon | Earth | 18 | 15 | 2 |
| Đạo Sĩ Băng Giá | Uncommon | Water | 20 | 12 | 2 |
| Hiệp Sĩ Rồng | Rare | Fire | 28 | 22 | 3 |
| Pháp Sư Giông Bão | Rare | Wind | 32 | 18 | 3 |
| Tướng Quân Thần Thánh | Epic | Light | 40 | 35 | 4 |
| Ám Sát Bóng Đêm | Epic | Dark | 45 | 25 | 4 |
| Thần Rồng Lửa | Legendary | Fire | 60 | 50 | 5 |
| Đế Vương Ánh Sáng | Legendary | Light | 55 | 55 | 5 |

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/linh-trieu-binh-ca

# Auth Settings
AUTH_SECRET=your-secret-key-change-this-in-production

# Game Settings
ENERGY_REGEN_MINUTES=5
MAX_ENERGY_DEFAULT=50
STARTING_GOLD=1000
```

### Nuxt Configuration

The `nuxt.config.ts` file configures:
- MongoDB connection via nuxt-mongoose
- Authentication via nuxt-auth-utils
- Models directory location
- Runtime configuration

## Development Workflow

### Initial Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your MongoDB URI

# Generate types
npm run postinstall

# Start development server
npm run dev
```

### Seeding the Database
```bash
# Start the dev server
npm run dev

# In another terminal, seed the database
curl -X POST http://localhost:3000/api/admin/seed
```

### Building for Production
```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## Database Indexes

For optimal query performance, indexes are created on:

**User:**
- `email` (unique)
- `username` (unique)

**CardTemplate:**
- `name` (unique)
- `rarity`
- `element`
- `isActive`

**UserCard:**
- `owner`
- `template`
- `owner + isInDeck`
- `owner + level` (descending)
- `owner + currentAttack` (descending)
- `owner + deckPosition` (sparse)

## Future Development

### Next Features to Implement

1. **Authentication System**
   - User registration endpoint
   - Login/logout endpoints
   - Session management with nuxt-auth-utils
   - Password hashing and validation

2. **Card Management APIs**
   - Get user's card collection
   - Fuse/enhance cards
   - Add/remove cards from deck
   - Lock/unlock cards

3. **Battle System**
   - Battle initiation endpoint
   - Battle calculation logic
   - Rewards distribution
   - Battle history

4. **UI Components**
   - Login/register forms
   - User dashboard
   - Card collection viewer
   - Deck builder
   - Battle interface

5. **Advanced Features**
   - Card trading/marketplace
   - Guilds/clans
   - PvP matchmaking
   - Daily quests
   - Achievement system

## Performance Considerations

### Database Optimization
- Indexes on frequently queried fields
- Lean queries for read-only operations
- Sparse indexes for optional fields
- Compound indexes for multi-field queries

### Caching Strategy
- Cache card templates (rarely change)
- Cache user session data
- Invalidate user cache on game actions

### Energy Regeneration
- Calculate on-demand (no background jobs needed)
- Only update database when energy is consumed
- Efficient timestamp-based calculation

## Security Best Practices

### Current Implementation
- Server-side validation for all operations
- MongoDB ObjectId references prevent data leaks
- Environment variables for sensitive config

### Future Recommendations
- Rate limiting on API endpoints
- Input validation and sanitization
- CSRF protection
- Admin route authentication
- Encrypted password storage (bcrypt/argon2)
- JWT token expiration

## Testing Strategy

### Recommended Tests
1. **Model Tests**: Validate schema methods and virtuals
2. **API Tests**: Test all endpoints with various inputs
3. **Integration Tests**: Test complete user flows
4. **Performance Tests**: Ensure queries are optimized

## Deployment

### Prerequisites
- Node.js 20.x or higher
- MongoDB instance (local or cloud)
- Environment variables configured

### Production Checklist
- [ ] Set strong AUTH_SECRET
- [ ] Use production MongoDB URI
- [ ] Enable MongoDB authentication
- [ ] Configure proper CORS settings
- [ ] Set up logging and monitoring
- [ ] Configure rate limiting
- [ ] Set up automatic backups
- [ ] Use HTTPS
- [ ] Protect admin endpoints

## Support and Documentation

- **Models Documentation**: `server/models/README.md`
- **Nuxt 3 Docs**: https://nuxt.com/docs
- **Mongoose Docs**: https://mongoosejs.com/docs
- **nuxt-mongoose**: https://github.com/dxup/nuxt-mongoose
- **nuxt-auth-utils**: https://github.com/atinux/nuxt-auth-utils

## License

See LICENSE file for details.
