/**
 * API Endpoint: GET /api/user/cards
 * 
 * Get the current user's card collection.
 * Requires authentication.
 * 
 * Query parameters:
 * - inDeck: Filter by cards in deck (true/false)
 * - isLocked: Filter by locked cards (true/false)
 * - sortBy: Sort field (level, currentAttack, currentDefense, obtainedAt)
 * - sortOrder: Sort order (asc/desc, default: desc)
 */

import { UserCardSchema } from '~/server/models/UserCard.model'

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
    const { inDeck, isLocked, sortBy = 'obtainedAt', sortOrder = 'desc' } = query

    // Build filter object
    const filter: any = { owner: session.user.id }
    
    if (inDeck !== undefined) {
      filter.isInDeck = inDeck === 'true'
    }
    
    if (isLocked !== undefined) {
      filter.isLocked = isLocked === 'true'
    }

    // Build sort object
    const sortField = String(sortBy)
    const sortDirection = sortOrder === 'asc' ? 1 : -1
    const sort: any = { [sortField]: sortDirection }

    // Fetch user's cards with template data
    const cards = await UserCardSchema.find(filter)
      .populate('template', '-__v') // Include template data
      .sort(sort)
      .lean()

    return {
      success: true,
      count: cards.length,
      data: cards,
    }
  } catch (error: any) {
    console.error('Error fetching user cards:', error)

    // Re-throw already formatted errors
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch cards',
    })
  }
})
