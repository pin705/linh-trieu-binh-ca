/**
 * API Endpoint: POST /api/auth/logout
 * 
 * Logout the current user.
 * Clears the user session.
 */

export default defineEventHandler(async (event) => {
  try {
    // Clear user session using nuxt-auth-utils
    await clearUserSession(event)

    return {
      success: true,
      message: 'Logout successful',
    }
  } catch (error: any) {
    console.error('Logout error:', error)

    throw createError({
      statusCode: 500,
      message: 'Logout failed',
    })
  }
})
