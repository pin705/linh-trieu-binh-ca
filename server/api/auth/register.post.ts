/**
 * API Endpoint: POST /api/auth/register
 * 
 * Register a new user account.
 * Creates a new user with hashed password and initial game stats.
 * 
 * Body parameters:
 * - email: User's email (must be unique)
 * - username: User's username (must be unique, 3-20 chars)
 * - password: User's password (min 8 chars)
 */

import bcrypt from 'bcrypt'
import { UserSchema } from '~/server/models/User.model'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, username, password } = body

    // Validate input
    if (!email || !username || !password) {
      throw createError({
        statusCode: 400,
        message: 'Email, username, and password are required',
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid email format',
      })
    }

    // Validate username length
    if (username.length < 3 || username.length > 20) {
      throw createError({
        statusCode: 400,
        message: 'Username must be between 3 and 20 characters',
      })
    }

    // Validate password length
    if (password.length < 8) {
      throw createError({
        statusCode: 400,
        message: 'Password must be at least 8 characters',
      })
    }

    // Check if email already exists
    const existingEmail = await UserSchema.findOne({ email: email.toLowerCase() })
    if (existingEmail) {
      throw createError({
        statusCode: 409,
        message: 'Email already registered',
      })
    }

    // Check if username already exists
    const existingUsername = await UserSchema.findOne({ username })
    if (existingUsername) {
      throw createError({
        statusCode: 409,
        message: 'Username already taken',
      })
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create new user
    const user = await UserSchema.create({
      email: email.toLowerCase(),
      username,
      passwordHash,
      level: 1,
      gold: 1000, // Starting gold
      energy: 50, // Starting energy
      maxEnergy: 50,
      experience: 0,
      lastEnergyRefill: new Date(),
      lastLoginAt: new Date(),
    })

    // Return user data (without password hash)
    return {
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        level: user.level,
        gold: user.gold,
        energy: user.energy,
        maxEnergy: user.maxEnergy,
      },
    }
  } catch (error: any) {
    console.error('Registration error:', error)

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      throw createError({
        statusCode: 400,
        message: 'Validation error',
        data: error.errors,
      })
    }

    // Re-throw already formatted errors
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Registration failed',
    })
  }
})
