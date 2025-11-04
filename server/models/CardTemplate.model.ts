import { defineMongooseModel } from '#nuxt/mongoose'

/**
 * CardTemplate Schema - Master template for all card types
 * This schema defines the base properties of cards that can be collected in the game.
 * Each template represents a unique card design with fixed base stats.
 * 
 * Rarity levels:
 * - common: Most frequently obtained cards
 * - uncommon: Moderately rare cards
 * - rare: Difficult to obtain cards
 * - epic: Very rare and powerful cards
 * - legendary: Extremely rare and most powerful cards
 */
export const CardTemplateSchema = defineMongooseModel({
  name: 'CardTemplate',
  schema: {
    name: {
      type: 'string',
      required: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: 'string',
      default: '',
      maxlength: 500,
    },
    
    // Base stats - these are the starting values for new cards
    baseAttack: {
      type: 'number',
      required: true,
      min: 1,
      default: 10,
    },
    baseDefense: {
      type: 'number',
      required: true,
      min: 1,
      default: 10,
    },
    
    // Rarity affects drop rates and fusion potential
    rarity: {
      type: 'string',
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      required: true,
      default: 'common',
    },
    
    // Visual and metadata
    imageUrl: {
      type: 'string',
      default: '/images/cards/default.png',
      trim: true,
    },
    
    // Card element/type for game mechanics (optional)
    element: {
      type: 'string',
      enum: ['fire', 'water', 'earth', 'wind', 'light', 'dark', 'neutral'],
      default: 'neutral',
    },
    
    // Cost to use this card in battle (energy/mana cost)
    cost: {
      type: 'number',
      default: 1,
      min: 0,
    },
    
    // Maximum level this card can reach through fusion
    maxLevel: {
      type: 'number',
      default: 10,
      min: 1,
    },
    
    // Fusion mechanics
    fusionMaterial: {
      type: 'boolean',
      default: true, // Can this card be used as fusion material?
    },
    
    // Game balance
    isActive: {
      type: 'boolean',
      default: true, // Is this card available in the game?
    },
    
    // Metadata
    createdAt: {
      type: 'date',
      default: () => new Date(),
      required: true,
    },
    updatedAt: {
      type: 'date',
      default: () => new Date(),
      required: true,
    },
  },
  options: {
    timestamps: true,
  },
  hooks(schema) {
    // Indexes for common queries
    schema.index({ rarity: 1 });
    schema.index({ element: 1 });
    schema.index({ isActive: 1 });
    schema.index({ name: 1 }, { unique: true });
    
    // Pre-save hook
    schema.pre('save', function(next) {
      this.updatedAt = new Date();
      next();
    });
    
    // Virtual field for power rating
    schema.virtual('powerRating').get(function() {
      return this.baseAttack + this.baseDefense;
    });
    
    // Method to calculate rarity multiplier
    schema.methods.getRarityMultiplier = function() {
      const multipliers = {
        common: 1.0,
        uncommon: 1.2,
        rare: 1.5,
        epic: 2.0,
        legendary: 3.0,
      };
      return multipliers[this.rarity] || 1.0;
    };
    
    // Method to calculate stats at a given level
    schema.methods.getStatsAtLevel = function(level: number) {
      const multiplier = this.getRarityMultiplier();
      const levelBonus = (level - 1) * 0.1; // 10% increase per level
      
      return {
        attack: Math.floor(this.baseAttack * multiplier * (1 + levelBonus)),
        defense: Math.floor(this.baseDefense * multiplier * (1 + levelBonus)),
      };
    };
  },
})

export type CardTemplate = typeof CardTemplateSchema
