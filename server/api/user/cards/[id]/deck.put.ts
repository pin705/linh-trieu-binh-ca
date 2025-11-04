/**
 * API Endpoint: PUT /api/user/cards/:id/deck
 * 
 * Add or remove a card from the user's battle deck.
 * Requires authentication.
 * 
 * Body parameters:
 * - action: 'add' or 'remove'
 * - position: Deck position (1-n) when adding, optional when removing
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
    const { action, position } = body

    // Validate input
    if (!action || !['add', 'remove'].includes(action)) {
      throw createError({
        statusCode: 400,
        message: 'Action must be either "add" or "remove"',
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

    if (action === 'add') {
      // Validate position
      if (!position || position < 1) {
        throw createError({
          statusCode: 400,
          message: 'Valid deck position (1 or higher) is required',
        })
      }

      // Check if card is already in deck
      if (card.isInDeck) {
        throw createError({
          statusCode: 400,
          message: 'Card is already in deck',
        })
      }

      // Check if position is already taken
      const existingCard = await UserCardSchema.findOne({
        owner: session.user.id,
        isInDeck: true,
        deckPosition: position,
      })

      if (existingCard) {
        throw createError({
          statusCode: 400,
          message: 'Deck position is already occupied',
        })
      }

      // Add card to deck
      await card.addToDeck(position)

      // Reload card
      const updatedCard = await UserCardSchema.findById(cardId)
        .populate('template')
        .lean()

      return {
        success: true,
        message: 'Card added to deck',
        card: updatedCard,
      }
    } else {
      // Remove from deck
      if (!card.isInDeck) {
        throw createError({
          statusCode: 400,
          message: 'Card is not in deck',
        })
      }

      await card.removeFromDeck()

      // Reload card
      const updatedCard = await UserCardSchema.findById(cardId)
        .populate('template')
        .lean()

      return {
        success: true,
        message: 'Card removed from deck',
        card: updatedCard,
      }
    }
  } catch (error: any) {
    console.error('Deck management error:', error)

    // Re-throw already formatted errors
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Deck management failed',
    })
  }
})
