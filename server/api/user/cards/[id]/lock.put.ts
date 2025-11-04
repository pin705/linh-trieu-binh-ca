/**
 * API Endpoint: PUT /api/user/cards/:id/lock
 * 
 * Lock or unlock a card to prevent accidental fusion/deletion.
 * Requires authentication.
 * 
 * Body parameters:
 * - locked: true to lock, false to unlock
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

    const cardId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { locked } = body

    // Validate input
    if (typeof locked !== 'boolean') {
      throw createError({
        statusCode: 400,
        message: 'locked field must be a boolean',
      })
    }

    // Fetch card
    const card = await UserCardSchema.findById(cardId)

    if (!card) {
      throw createError({
        statusCode: 404,
        message: 'Card not found',
      })
    }

    // Verify card belongs to the user
    if (card.owner.toString() !== session.user.id) {
      throw createError({
        statusCode: 403,
        message: 'You do not own this card',
      })
    }

    // Update lock status
    card.isLocked = locked
    await card.save()

    // Reload card
    const updatedCard = await UserCardSchema.findById(cardId)
      .populate('template')
      .lean()

    return {
      success: true,
      message: locked ? 'Card locked' : 'Card unlocked',
      card: updatedCard,
    }
  } catch (error: any) {
    console.error('Lock management error:', error)

    // Re-throw already formatted errors
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Lock management failed',
    })
  }
})
