import { defineMongooseModel } from '#nuxt/mongoose'

/**
 * Battle Schema - Records battle history and results
 * Stores information about battles between players or against AI.
 * 
 * Battle Types:
 * - pve: Player vs Environment (AI)
 * - pvp: Player vs Player
 */
export const BattleSchema = defineMongooseModel({
  name: 'Battle',
  schema: {
    // Battle participants
    player: {
      type: 'ObjectId',
      ref: 'User',
      required: true,
    },
    opponent: {
      type: 'ObjectId',
      ref: 'User',
      required: false, // null for AI battles
    },
    
    // Battle type
    battleType: {
      type: 'string',
      enum: ['pve', 'pvp'],
      default: 'pve',
      required: true,
    },
    
    // Player deck (snapshot of cards used)
    playerDeck: {
      type: [
        {
          cardId: {
            type: 'ObjectId',
            ref: 'UserCard',
          },
          templateId: {
            type: 'ObjectId',
            ref: 'CardTemplate',
          },
          level: 'number',
          attack: 'number',
          defense: 'number',
        },
      ],
      required: true,
    },
    
    // Opponent deck (for PvP or AI)
    opponentDeck: {
      type: [
        {
          cardId: {
            type: 'ObjectId',
            ref: 'UserCard',
          },
          templateId: {
            type: 'ObjectId',
            ref: 'CardTemplate',
          },
          level: 'number',
          attack: 'number',
          defense: 'number',
        },
      ],
      required: true,
    },
    
    // Battle results
    winner: {
      type: 'string',
      enum: ['player', 'opponent', 'draw'],
      required: true,
    },
    
    // Battle stats
    playerScore: {
      type: 'number',
      default: 0,
      required: true,
    },
    opponentScore: {
      type: 'number',
      default: 0,
      required: true,
    },
    
    // Battle rounds/turns
    rounds: {
      type: 'number',
      default: 1,
      required: true,
    },
    
    // Rewards
    rewards: {
      gold: {
        type: 'number',
        default: 0,
      },
      experience: {
        type: 'number',
        default: 0,
      },
      cards: {
        type: [
          {
            type: 'ObjectId',
            ref: 'UserCard',
          },
        ],
        default: [],
      },
    },
    
    // Energy cost
    energyCost: {
      type: 'number',
      default: 10,
      required: true,
    },
    
    // Timestamps
    startedAt: {
      type: 'date',
      default: () => new Date(),
      required: true,
    },
    completedAt: {
      type: 'date',
      required: true,
    },
  },
  options: {
    timestamps: true,
  },
  hooks(schema) {
    // Indexes for efficient queries
    schema.index({ player: 1, createdAt: -1 })
    schema.index({ opponent: 1, createdAt: -1 })
    schema.index({ battleType: 1 })
    schema.index({ winner: 1 })
    
    // Virtual field for duration
    schema.virtual('duration').get(function() {
      if (!this.startedAt || !this.completedAt) return 0
      return this.completedAt.getTime() - this.startedAt.getTime()
    })
  },
})

export type Battle = typeof BattleSchema
