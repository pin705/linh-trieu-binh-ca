/**
 * API Endpoint: POST /api/auth/login
 * 
 * Login with email/username and password.
 * Uses nuxt-auth-utils for session management.
 * 
 * Body parameters:
 * - login: Email or username
 * - password: User's password
 */

import bcrypt from 'bcrypt'
import { UserSchema } from '~/server/models/User.model'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { login, password } = body

    // Validate input
    if (!login || !password) {
      throw createError({
        statusCode: 400,
        message: 'Login and password are required',
      })
    }

    // Find user by email or username
    const user = await UserSchema.findOne({
      $or: [
        { email: login.toLowerCase() },
        { username: login },
      ],
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials',
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials',
      })
    }

    // Update last login time and energy
    user.lastLoginAt = new Date()
    await user.updateEnergy() // Regenerate energy based on time
    await user.save()

    // Create session using nuxt-auth-utils
    await setUserSession(event, {
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
      },
    })

    // Return user data
    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        level: user.level,
        gold: user.gold,
        energy: user.getCurrentEnergy(),
        maxEnergy: user.maxEnergy,
        experience: user.experience,
      },
    }
  } catch (error: any) {
    console.error('Login error:', error)

    // Re-throw already formatted errors
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Login failed',
    })
  }
})
