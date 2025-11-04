/**
 * API Endpoint: POST /api/battle/start
 * 
 * Start a battle with the user's current deck.
 * Implements simple battle calculation logic.
 * Requires authentication.
 * 
 * Body parameters:
 * - battleType: 'pve' or 'pvp' (default: 'pve')
 * - opponentId: Required for PvP battles
 */

import { UserCardSchema } from '~/server/models/UserCard.model'
import { CardTemplateSchema } from '~/server/models/CardTemplate.model'
import { UserSchema } from '~/server/models/User.model'
import { BattleSchema } from '~/server/models/Battle.model'

export default defineEventHandler(async (event) => {
  try {
    // Check authentication
    const session = await getUserSession(event)
    if (!session || !session.user) {
      throw createError({
        statusCode: 401,
        message: 'Authentication required',
      })
    }

    const body = await readBody(event)
    const { battleType = 'pve', opponentId } = body

    // Validate battle type
    if (!['pve', 'pvp'].includes(battleType)) {
      throw createError({
        statusCode: 400,
        message: 'Battle type must be either "pve" or "pvp"',
      })
    }

    // Validate opponent for PvP
    if (battleType === 'pvp' && !opponentId) {
      throw createError({
        statusCode: 400,
        message: 'Opponent ID is required for PvP battles',
      })
    }

    // Get player
    const player = await UserSchema.findById(session.user.id)
    if (!player) {
      throw createError({
        statusCode: 404,
        message: 'Player not found',
      })
    }

    // Check energy (battle costs 10 energy)
    const hasEnergy = await player.consumeEnergy(10)
    if (!hasEnergy) {
      throw createError({
        statusCode: 400,
        message: 'Not enough energy. Need 10 energy for battle.',
      })
    }

    // Get player's deck
    const playerDeck = await UserCardSchema.find({
      owner: session.user.id,
      isInDeck: true,
    })
      .populate('template')
      .sort({ deckPosition: 1 })
      .lean()

    if (playerDeck.length === 0) {
      // Refund energy
      player.energy += 10
      await player.save()
      
      throw createError({
        statusCode: 400,
        message: 'You must have at least one card in your deck',
      })
    }

    // Get opponent deck
    let opponentDeck: any[] = []
    let opponent = null

    if (battleType === 'pvp') {
      // PvP: Get real opponent's deck
      opponent = await UserSchema.findById(opponentId)
      if (!opponent) {
        // Refund energy
        player.energy += 10
        await player.save()
        
        throw createError({
          statusCode: 404,
          message: 'Opponent not found',
        })
      }

      opponentDeck = await UserCardSchema.find({
        owner: opponentId,
        isInDeck: true,
      })
        .populate('template')
        .sort({ deckPosition: 1 })
        .lean()

      if (opponentDeck.length === 0) {
        // Refund energy
        player.energy += 10
        await player.save()
        
        throw createError({
          statusCode: 400,
          message: 'Opponent has no cards in their deck',
        })
      }
    } else {
      // PvE: Generate AI opponent deck
      opponentDeck = await generateAIDeck(player.level)
    }

    // Calculate battle results
    const battleResult = calculateBattle(playerDeck, opponentDeck)

    // Prepare deck snapshots
    const playerDeckSnapshot = playerDeck.map((card: any) => ({
      cardId: card._id,
      templateId: card.template._id,
      level: card.level,
      attack: card.currentAttack,
      defense: card.currentDefense,
    }))

    const opponentDeckSnapshot = opponentDeck.map((card: any) => ({
      cardId: card._id || null,
      templateId: card.template?._id || card.templateId,
      level: card.level,
      attack: card.currentAttack || card.attack,
      defense: card.currentDefense || card.defense,
    }))

    // Calculate rewards
    const rewards = calculateRewards(battleResult.winner, player.level)

    // Award rewards to player
    if (battleResult.winner === 'player') {
      player.gold += rewards.gold
      player.experience += rewards.experience
      await player.save()
    }

    // Create battle record
    const battle = await BattleSchema.create({
      player: session.user.id,
      opponent: battleType === 'pvp' ? opponentId : null,
      battleType,
      playerDeck: playerDeckSnapshot,
      opponentDeck: opponentDeckSnapshot,
      winner: battleResult.winner,
      playerScore: battleResult.playerScore,
      opponentScore: battleResult.opponentScore,
      rounds: battleResult.rounds,
      rewards,
      energyCost: 10,
      startedAt: new Date(),
      completedAt: new Date(),
    })

    return {
      success: true,
      message: `Battle ${battleResult.winner === 'player' ? 'won' : battleResult.winner === 'draw' ? 'drawn' : 'lost'}!`,
      battle: {
        id: battle._id,
        winner: battle.winner,
        playerScore: battle.playerScore,
        opponentScore: battle.opponentScore,
        rounds: battle.rounds,
        rewards: battle.rewards,
      },
      player: {
        energy: player.getCurrentEnergy(),
        gold: player.gold,
        experience: player.experience,
      },
    }
  } catch (error: any) {
    console.error('Battle error:', error)

    // Re-throw already formatted errors
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Battle failed',
    })
  }
})

/**
 * Simple battle calculation logic
 * Compares total attack and defense of both decks
 */
function calculateBattle(playerDeck: any[], opponentDeck: any[]) {
  // Calculate total stats for each deck
  const playerAttack = playerDeck.reduce((sum, card) => sum + card.currentAttack, 0)
  const playerDefense = playerDeck.reduce((sum, card) => sum + card.currentDefense, 0)
  const playerTotal = playerAttack + playerDefense

  const opponentAttack = opponentDeck.reduce((sum, card) => sum + (card.currentAttack || card.attack), 0)
  const opponentDefense = opponentDeck.reduce((sum, card) => sum + (card.currentDefense || card.defense), 0)
  const opponentTotal = opponentAttack + opponentDefense

  // Add some randomness (±20%)
  const playerScore = Math.floor(playerTotal * (0.8 + Math.random() * 0.4))
  const opponentScore = Math.floor(opponentTotal * (0.8 + Math.random() * 0.4))

  // Determine winner
  let winner: 'player' | 'opponent' | 'draw'
  if (playerScore > opponentScore) {
    winner = 'player'
  } else if (opponentScore > playerScore) {
    winner = 'opponent'
  } else {
    winner = 'draw'
  }

  return {
    winner,
    playerScore,
    opponentScore,
    rounds: Math.min(playerDeck.length, opponentDeck.length),
  }
}

/**
 * Generate AI opponent deck based on player level
 */
async function generateAIDeck(playerLevel: number) {
  // Get random cards from templates
  const templates = await CardTemplateSchema.find({ isActive: true })
    .limit(5)
    .lean()

  // Scale AI cards to player level
  const aiDeck = templates.map((template: any) => {
    const levelMultiplier = 1 + (playerLevel - 1) * 0.1
    return {
      templateId: template._id,
      template,
      level: Math.min(playerLevel, template.maxLevel),
      attack: Math.floor(template.baseAttack * levelMultiplier),
      defense: Math.floor(template.baseDefense * levelMultiplier),
    }
  })

  return aiDeck
}

/**
 * Calculate battle rewards
 */
function calculateRewards(winner: string, playerLevel: number) {
  if (winner !== 'player') {
    return {
      gold: 0,
      experience: 10, // Consolation experience
      cards: [],
    }
  }

  // Victory rewards scale with player level
  const baseGold = 50
  const baseExp = 25

  return {
    gold: Math.floor(baseGold * (1 + playerLevel * 0.1)),
    experience: Math.floor(baseExp * (1 + playerLevel * 0.15)),
    cards: [],
  }
}
