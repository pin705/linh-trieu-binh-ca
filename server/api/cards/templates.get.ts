/**
 * API Endpoint: GET /api/cards/templates
 * 
 * Returns all available card templates.
 * This endpoint is public and does not require authentication.
 * 
 * Query parameters:
 * - rarity: Filter by rarity (common, uncommon, rare, epic, legendary)
 * - element: Filter by element type
 * - isActive: Filter by active status (default: true)
 */

import { CardTemplateSchema } from '~/server/models/CardTemplate.model'

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event)
    const { rarity, element, isActive = 'true' } = query

    // Build filter object
    const filter: any = {}
    
    if (rarity) {
      filter.rarity = rarity
    }
    
    if (element) {
      filter.element = element
    }
    
    // Only show active cards by default
    if (isActive === 'true') {
      filter.isActive = true
    }

    // Fetch card templates from database
    const templates = await CardTemplateSchema.find(filter)
      .select('-__v') // Exclude version key
      .sort({ rarity: 1, name: 1 }) // Sort by rarity, then name
      .lean() // Return plain JavaScript objects for better performance

    return {
      success: true,
      count: templates.length,
      data: templates,
    }
  } catch (error: any) {
    console.error('Error fetching card templates:', error)
    
    return {
      success: false,
      error: 'Failed to fetch card templates',
      message: error.message,
    }
  }
})
