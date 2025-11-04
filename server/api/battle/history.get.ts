/**
 * API Endpoint: GET /api/battle/history
 * 
 * Get the user's battle history.
 * Requires authentication.
 * 
 * Query parameters:
 * - limit: Number of battles to return (default: 10, max: 50)
 * - skip: Number of battles to skip for pagination (default: 0)
 * - battleType: Filter by battle type ('pve' or 'pvp')
 * - winner: Filter by winner ('player', 'opponent', 'draw')
 */

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

    // Get query parameters
    const query = getQuery(event)
    const limit = Math.min(parseInt(String(query.limit || '10')), 50)
    const skip = parseInt(String(query.skip || '0'))
    const { battleType, winner } = query

    // Build filter
    const filter: any = { player: session.user.id }

    if (battleType) {
      filter.battleType = battleType
    }

    if (winner) {
      filter.winner = winner
    }

    // Fetch battles
    const battles = await BattleSchema.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-playerDeck -opponentDeck') // Exclude detailed deck info for list view
      .lean()

    // Get total count
    const total = await BattleSchema.countDocuments(filter)

    return {
      success: true,
      count: battles.length,
      total,
      data: battles,
      pagination: {
        limit,
        skip,
        hasMore: skip + battles.length < total,
      },
    }
  } catch (error: any) {
    console.error('Error fetching battle history:', error)

    // Re-throw already formatted errors
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch battle history',
    })
  }
})
