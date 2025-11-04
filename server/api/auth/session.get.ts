/**
 * API Endpoint: GET /api/auth/session
 * 
 * Get current user session information.
 * Returns user data if authenticated, or null if not.
 */

import { UserSchema } from '~/server/models/User.model'

export default defineEventHandler(async (event) => {
  try {
    // Get user session using nuxt-auth-utils
    const session = await getUserSession(event)

    if (!session || !session.user) {
      return {
        success: true,
        authenticated: false,
        user: null,
      }
    }

    // Fetch full user data from database
    const user = await UserSchema.findById(session.user.id)

    if (!user) {
      // Session exists but user not found, clear session
      await clearUserSession(event)
      return {
        success: true,
        authenticated: false,
        user: null,
      }
    }

    // Update energy (regenerate based on time)
    await user.updateEnergy()

    // Return user data
    return {
      success: true,
      authenticated: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        level: user.level,
        gold: user.gold,
        energy: user.getCurrentEnergy(),
        maxEnergy: user.maxEnergy,
        experience: user.experience,
        lastLoginAt: user.lastLoginAt,
      },
    }
  } catch (error: any) {
    console.error('Session error:', error)

    return {
      success: false,
      authenticated: false,
      user: null,
      error: error.message,
    }
  }
})
