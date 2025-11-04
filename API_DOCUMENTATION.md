# API Documentation

Complete API reference for Linh Triều Bình Ca game server.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication

Most endpoints require authentication using session cookies managed by `nuxt-auth-utils`.

### Register

**Endpoint:** `POST /api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "myusername",
  "password": "mypassword123"
}
```

**Validation:**
- Email: Valid email format, unique
- Username: 3-20 characters, unique
- Password: Minimum 8 characters

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "email": "user@example.com",
    "username": "myusername",
    "level": 1,
    "gold": 1000,
    "energy": 50,
    "maxEnergy": 50
  }
}
```

### Login

**Endpoint:** `POST /api/auth/login`

Login with email/username and password.

**Request Body:**
```json
{
  "login": "user@example.com",
  "password": "mypassword123"
}
```

**Note:** `login` can be either email or username.

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "email": "user@example.com",
    "username": "myusername",
    "level": 1,
    "gold": 1000,
    "energy": 50,
    "maxEnergy": 50,
    "experience": 0
  }
}
```

### Logout

**Endpoint:** `POST /api/auth/logout`

Logout the current user.

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Get Session

**Endpoint:** `GET /api/auth/session`

Get current user session information.

**Response (authenticated):**
```json
{
  "success": true,
  "authenticated": true,
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "email": "user@example.com",
    "username": "myusername",
    "level": 1,
    "gold": 1000,
    "energy": 50,
    "maxEnergy": 50,
    "experience": 0,
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (not authenticated):**
```json
{
  "success": true,
  "authenticated": false,
  "user": null
}
```

## Card Templates

### Get Card Templates

**Endpoint:** `GET /api/cards/templates`

Get all available card templates.

**Query Parameters:**
- `rarity`: Filter by rarity (common, uncommon, rare, epic, legendary)
- `element`: Filter by element (fire, water, earth, wind, light, dark, neutral)
- `isActive`: Filter by active status (default: true)

**Example:**
```
GET /api/cards/templates?rarity=legendary&element=fire
```

**Response:**
```json
{
  "success": true,
  "count": 11,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Thần Rồng Lửa",
      "description": "Rồng huyền thoại kiểm soát ngọn lửa địa ngục...",
      "baseAttack": 60,
      "baseDefense": 50,
      "rarity": "legendary",
      "element": "fire",
      "cost": 5,
      "maxLevel": 25,
      "imageUrl": "/images/cards/fire-dragon-god.png",
      "isActive": true
    }
  ]
}
```

## User Cards

All user card endpoints require authentication.

### Get User's Cards

**Endpoint:** `GET /api/user/cards`

Get the current user's card collection.

**Query Parameters:**
- `inDeck`: Filter by deck status (true/false)
- `isLocked`: Filter by lock status (true/false)
- `sortBy`: Sort field (level, currentAttack, currentDefense, obtainedAt)
- `sortOrder`: Sort order (asc/desc, default: desc)

**Example:**
```
GET /api/user/cards?sortBy=level&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "owner": "64f1a2b3c4d5e6f7g8h9i0j2",
      "template": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
        "name": "Chiến Binh Tân Binh",
        "rarity": "common",
        "element": "neutral"
      },
      "currentAttack": 12,
      "currentDefense": 10,
      "level": 2,
      "experience": 0,
      "isLocked": false,
      "isInDeck": true,
      "deckPosition": 1,
      "timesEnhanced": 1,
      "obtainedFrom": "starter",
      "obtainedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Fuse Cards

**Endpoint:** `POST /api/user/cards/fuse`

Fuse/enhance a card using another card as material.

**Request Body:**
```json
{
  "baseCardId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "sacrificeCardId": "64f1a2b3c4d5e6f7g8h9i0j2"
}
```

**Requirements:**
- Both cards must belong to the user
- Neither card can be locked
- Neither card can be in a deck
- Base card must not be at max level
- Sacrifice card must be fusionMaterial enabled
- Costs 5 energy

**Response:**
```json
{
  "success": true,
  "message": "Card fusion successful",
  "card": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "currentAttack": 15,
    "currentDefense": 12,
    "level": 3,
    "timesEnhanced": 2
  },
  "energyRemaining": 45
}
```

### Add/Remove Card from Deck

**Endpoint:** `PUT /api/user/cards/:id/deck`

Add or remove a card from the battle deck.

**Request Body (Add):**
```json
{
  "action": "add",
  "position": 1
}
```

**Request Body (Remove):**
```json
{
  "action": "remove"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Card added to deck",
  "card": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "isInDeck": true,
    "deckPosition": 1
  }
}
```

### Lock/Unlock Card

**Endpoint:** `PUT /api/user/cards/:id/lock`

Lock or unlock a card to prevent accidental fusion/deletion.

**Request Body:**
```json
{
  "locked": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Card locked",
  "card": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "isLocked": true
  }
}
```

## Battle System

All battle endpoints require authentication.

### Start Battle

**Endpoint:** `POST /api/battle/start`

Start a battle with the user's current deck.

**Request Body (PvE):**
```json
{
  "battleType": "pve"
}
```

**Request Body (PvP):**
```json
{
  "battleType": "pvp",
  "opponentId": "64f1a2b3c4d5e6f7g8h9i0j1"
}
```

**Requirements:**
- Must have at least one card in deck
- Costs 10 energy
- For PvP: opponent must exist and have cards in deck

**Response:**
```json
{
  "success": true,
  "message": "Battle won!",
  "battle": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "winner": "player",
    "playerScore": 150,
    "opponentScore": 120,
    "rounds": 5,
    "rewards": {
      "gold": 55,
      "experience": 28,
      "cards": []
    }
  },
  "player": {
    "energy": 40,
    "gold": 1055,
    "experience": 28
  }
}
```

**Battle Calculation:**
- Total deck attack + defense is calculated
- Random variance of ±20% is applied
- Winner is determined by highest score
- Rewards scale with player level

### Get Battle History

**Endpoint:** `GET /api/battle/history`

Get the user's battle history.

**Query Parameters:**
- `limit`: Number of battles to return (default: 10, max: 50)
- `skip`: Number of battles to skip for pagination (default: 0)
- `battleType`: Filter by type (pve, pvp)
- `winner`: Filter by winner (player, opponent, draw)

**Example:**
```
GET /api/battle/history?limit=20&battleType=pve
```

**Response:**
```json
{
  "success": true,
  "count": 20,
  "total": 45,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "battleType": "pve",
      "winner": "player",
      "playerScore": 150,
      "opponentScore": 120,
      "rounds": 5,
      "rewards": {
        "gold": 55,
        "experience": 28
      },
      "energyCost": 10,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "skip": 0,
    "hasMore": true
  }
}
```

## Admin Endpoints

### Seed Database

**Endpoint:** `POST /api/admin/seed`

Seed the database with initial card templates.

**Request Body:**
```json
{
  "force": false
}
```

**Note:** Set `force: true` to clear and reseed all templates.

**Response:**
```json
{
  "success": true,
  "message": "Successfully seeded database with 11 card templates",
  "count": 11,
  "action": "seed"
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request",
  "message": "Error description",
  "data": {}
}
```

**Common Status Codes:**
- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Duplicate entry
- `500`: Internal Server Error - Server error

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing:
- Authentication endpoints: 5 requests per minute
- Battle endpoints: 10 requests per minute
- Other endpoints: 60 requests per minute

## WebSocket Support

Currently not implemented. Future versions may include:
- Real-time PvP battles
- Live notifications
- Chat system
