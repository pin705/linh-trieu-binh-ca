/**
 * API Endpoint: POST /api/admin/seed
 * 
 * Seeds the database with initial card templates.
 * This is a utility endpoint for setting up the game for the first time.
 * 
 * Body parameters:
 * - force: If true, will clear existing templates and reseed (default: false)
 * 
 * Note: In production, this endpoint should be protected with admin authentication.
 */

import { CardTemplateSchema } from '~/server/models/CardTemplate.model'
import { seedCardTemplates, reseedCardTemplates } from '~/server/utils/seedCardTemplates'

export default defineEventHandler(async (event) => {
  try {
    // TODO: Add authentication check here
    // const session = await requireUserSession(event)
    // if (!session.user.isAdmin) {
    //   throw createError({ statusCode: 403, message: 'Admin access required' })
    // }

    // Read body to check if force reseed is requested
    const body = await readBody(event).catch(() => ({}))
    const { force = false } = body

    let count: number
    
    if (force) {
      // Clear and reseed
      count = await reseedCardTemplates(CardTemplateSchema)
      
      return {
        success: true,
        message: `Successfully reseeded database with ${count} card templates`,
        count,
        action: 'reseed',
      }
    } else {
      // Only seed if empty
      count = await seedCardTemplates(CardTemplateSchema)
      
      if (count === 0) {
        return {
          success: true,
          message: 'Database already seeded, no action taken',
          count: 0,
          action: 'skip',
        }
      }
      
      return {
        success: true,
        message: `Successfully seeded database with ${count} card templates`,
        count,
        action: 'seed',
      }
    }
  } catch (error: any) {
    console.error('Error seeding database:', error)
    
    return {
      success: false,
      error: 'Failed to seed database',
      message: error.message,
    }
  }
})
