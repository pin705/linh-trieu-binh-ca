# Database Models - Linh Triều Bình Ca

This directory contains the Mongoose schemas for the game's database models. All models are defined using the `nuxt-mongoose` module.

## Models Overview

### 1. User Model (`User.model.ts`)

The User model extends basic authentication to include game-specific data.

**Key Features:**
- Authentication fields (email, username, passwordHash)
- Game progression (level, experience, gold)
- Energy system (energy, maxEnergy, lastEnergyRefill)
- Automatic energy regeneration (1 energy per 5 minutes)
- Methods for energy management

**Example Usage:**
```typescript
// Get current energy with auto-regeneration
const currentEnergy = await user.getCurrentEnergy();

// Update energy (applies regeneration)
await user.updateEnergy();

// Consume energy for an action
const success = await user.consumeEnergy(10);
```

### 2. CardTemplate Model (`CardTemplate.model.ts`)

Master template for all card types. Each template represents a unique card design.

**Key Features:**
- Base stats (baseAttack, baseDefense)
- Rarity system (common, uncommon, rare, epic, legendary)
- Element types (fire, water, earth, wind, light, dark, neutral)
- Maximum level and fusion settings
- Methods to calculate stats at different levels

**Rarity Multipliers:**
- Common: 1.0x
- Uncommon: 1.2x
- Rare: 1.5x
- Epic: 2.0x
- Legendary: 3.0x

**Example Usage:**
```typescript
// Calculate stats at level 5
const stats = cardTemplate.getStatsAtLevel(5);
console.log(stats.attack, stats.defense);

// Get rarity multiplier
const multiplier = cardTemplate.getRarityMultiplier();
```

### 3. UserCard Model (`UserCard.model.ts`)

The most important model - represents cards owned by players.

**Key Features:**
- Owner and template references (ObjectId)
- Current stats (modified through leveling/fusion)
- Card progression (level, experience)
- State management (locked, in deck, deck position)
- Fusion history tracking
- Methods for enhancement, deck management, and usage tracking

**Example Usage:**
```typescript
// Enhance a card (fusion)
await userCard.enhance(sacrificeCard, CardTemplate);

// Add to deck
await userCard.addToDeck(1); // Position 1

// Remove from deck
await userCard.removeFromDeck();

// Lock/unlock card
await userCard.toggleLock();

// Record usage in battle
await userCard.recordUsage();
```

## Database Indexes

All models include optimized indexes for common queries:

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
- `owner + isInDeck` (compound)
- `owner + level` (compound, descending)
- `owner + currentAttack` (compound, descending)
- `owner + deckPosition` (compound, sparse)

## Virtual Fields

### User
- `energyRegenTime` - Seconds since last energy refill

### CardTemplate
- `powerRating` - Sum of baseAttack + baseDefense

### UserCard
- `totalPower` - Sum of currentAttack + currentDefense

## Energy System

Energy regenerates automatically at a rate of **1 energy per 5 minutes**.

The energy system is handled by:
1. `lastEnergyRefill` timestamp tracks when energy was last updated
2. `getCurrentEnergy()` calculates current energy without modifying the database
3. `updateEnergy()` updates the database with regenerated energy
4. `consumeEnergy(amount)` checks availability and consumes energy

## Fusion System

Cards can be enhanced by fusing them with other cards:

1. A base card receives the enhancement
2. A sacrifice card is consumed in the process
3. Base card gains stats: 10% of sacrifice card's current stats
4. Base card level increases by 1 (up to maxLevel from template)
5. Fusion history is tracked in the `fusedCards` array

## Next Steps

After setting up these models, you can:

1. Create API routes in `server/api/` for:
   - User registration and authentication
   - Card management (list, equip, enhance)
   - Battle system
   - Energy system

2. Create Vue components for:
   - User dashboard
   - Card collection viewer
   - Deck builder
   - Battle interface

3. Seed the database with initial CardTemplates

## Configuration

MongoDB connection is configured in `nuxt.config.ts`:
```typescript
mongoose: {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/linh-trieu-binh-ca',
  modelsDir: 'server/models',
}
```

Set your MongoDB URI in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/linh-trieu-binh-ca
```
