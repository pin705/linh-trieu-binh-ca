/**
 * API Endpoint: POST /api/user/cards/fuse
 * 
 * Fuse/enhance a card using another card as material.
 * The base card gains stats and levels up, the sacrifice card is destroyed.
 * Requires authentication.
 * 
 * Body parameters:
 * - baseCardId: ID of the card to enhance
 * - sacrificeCardId: ID of the card to sacrifice
 */

import { UserCardSchema } from '~/server/models/UserCard.model'
import { CardTemplateSchema } from '~/server/models/CardTemplate.model'
import { UserSchema } from '~/server/models/User.model'

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
    const { baseCardId, sacrificeCardId } = body

    // Validate input
    if (!baseCardId || !sacrificeCardId) {
      throw createError({
        statusCode: 400,
        message: 'Both baseCardId and sacrificeCardId are required',
      })
    }

    if (baseCardId === sacrificeCardId) {
      throw createError({
        statusCode: 400,
        message: 'Cannot fuse a card with itself',
      })
    }

    // Fetch both cards
    const baseCard = await UserCardSchema.findById(baseCardId)
    const sacrificeCard = await UserCardSchema.findById(sacrificeCardId)

    // Verify both cards exist
    if (!baseCard || !sacrificeCard) {
      throw createError({
        statusCode: 404,
        message: 'One or both cards not found',
      })
    }

    // Verify both cards belong to the user
    if (baseCard.owner.toString() !== session.user.id || sacrificeCard.owner.toString() !== session.user.id) {
      throw createError({
        statusCode: 403,
        message: 'You do not own these cards',
      })
    }

    // Check if base card is locked
    if (baseCard.isLocked) {
      throw createError({
        statusCode: 400,
        message: 'Base card is locked and cannot be enhanced',
      })
    }

    // Check if sacrifice card is locked
    if (sacrificeCard.isLocked) {
      throw createError({
        statusCode: 400,
        message: 'Sacrifice card is locked and cannot be used',
      })
    }

    // Check if cards are in deck
    if (baseCard.isInDeck || sacrificeCard.isInDeck) {
      throw createError({
        statusCode: 400,
        message: 'Cannot fuse cards that are in a deck',
      })
    }

    // Get template to check max level and fusion material
    const baseTemplate = await CardTemplateSchema.findById(baseCard.template)
    const sacrificeTemplate = await CardTemplateSchema.findById(sacrificeCard.template)

    if (!baseTemplate || !sacrificeTemplate) {
      throw createError({
        statusCode: 404,
        message: 'Card template not found',
      })
    }

    // Check if base card is at max level
    if (baseCard.level >= baseTemplate.maxLevel) {
      throw createError({
        statusCode: 400,
        message: 'Base card is already at maximum level',
      })
    }

    // Check if sacrifice card can be used as fusion material
    if (!sacrificeTemplate.fusionMaterial) {
      throw createError({
        statusCode: 400,
        message: 'Sacrifice card cannot be used as fusion material',
      })
    }

    // Check energy requirement (fusion costs 5 energy)
    const user = await UserSchema.findById(session.user.id)
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    const hasEnergy = await user.consumeEnergy(5)
    if (!hasEnergy) {
      throw createError({
        statusCode: 400,
        message: 'Not enough energy. Need 5 energy for fusion.',
      })
    }

    // Perform enhancement
    await baseCard.enhance(sacrificeCard, CardTemplateSchema)

    // Delete sacrifice card
    await UserCardSchema.findByIdAndDelete(sacrificeCardId)

    // Reload base card with template data
    const updatedCard = await UserCardSchema.findById(baseCardId)
      .populate('template')
      .lean()

    return {
      success: true,
      message: 'Card fusion successful',
      card: updatedCard,
      energyRemaining: user.getCurrentEnergy(),
    }
  } catch (error: any) {
    console.error('Card fusion error:', error)

    // Re-throw already formatted errors
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Card fusion failed',
    })
  }
})
