import { defineMongooseModel } from '#nuxt/mongoose'

/**
 * User Schema - Extended to include game-specific fields
 * This schema extends the basic user authentication with game mechanics:
 * - level: Player's current level in the game
 * - gold: In-game currency
 * - energy: Current energy points (used for actions)
 * - maxEnergy: Maximum energy capacity (increases with level)
 * - lastEnergyRefill: Timestamp for calculating energy regeneration
 */
export const UserSchema = defineMongooseModel({
  name: 'User',
  schema: {
    // Authentication fields (compatible with nuxt-auth-utils)
    email: {
      type: 'string',
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: 'string',
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    passwordHash: {
      type: 'string',
      required: true,
    },
    
    // Game-specific fields
    level: {
      type: 'number',
      default: 1,
      min: 1,
      required: true,
    },
    gold: {
      type: 'number',
      default: 1000, // Starting gold
      min: 0,
      required: true,
    },
    energy: {
      type: 'number',
      default: 50,
      min: 0,
      required: true,
    },
    maxEnergy: {
      type: 'number',
      default: 50, // Base max energy
      min: 1,
      required: true,
    },
    lastEnergyRefill: {
      type: 'date',
      default: () => new Date(),
      required: true,
    },
    
    // Experience system
    experience: {
      type: 'number',
      default: 0,
      min: 0,
      required: true,
    },
    
    // Account metadata
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
    lastLoginAt: {
      type: 'date',
      default: () => new Date(),
    },
  },
  options: {
    timestamps: true, // Automatically manage createdAt and updatedAt
  },
  hooks(schema) {
    // Index for faster queries
    schema.index({ email: 1 });
    schema.index({ username: 1 });
    
    // Pre-save hook to update timestamps
    schema.pre('save', function(next) {
      this.updatedAt = new Date();
      next();
    });
    
    // Virtual field for energy regeneration calculation
    schema.virtual('energyRegenTime').get(function() {
      if (!this.lastEnergyRefill) return 0;
      const now = new Date();
      const timeDiff = now.getTime() - this.lastEnergyRefill.getTime();
      return Math.floor(timeDiff / 1000); // Return seconds since last refill
    });
    
    // Method to calculate current energy with regeneration
    schema.methods.getCurrentEnergy = function() {
      const minutesSinceRefill = this.energyRegenTime / 60;
      const energyRegained = Math.floor(minutesSinceRefill / 5); // 1 energy per 5 minutes
      const currentEnergy = Math.min(this.energy + energyRegained, this.maxEnergy);
      return currentEnergy;
    };
    
    // Method to update energy after regeneration
    schema.methods.updateEnergy = async function() {
      const minutesSinceRefill = this.energyRegenTime / 60;
      const energyRegained = Math.floor(minutesSinceRefill / 5);
      
      if (energyRegained > 0) {
        this.energy = Math.min(this.energy + energyRegained, this.maxEnergy);
        this.lastEnergyRefill = new Date();
        await this.save();
      }
      
      return this.energy;
    };
    
    // Method to consume energy
    schema.methods.consumeEnergy = async function(amount: number) {
      await this.updateEnergy(); // Update energy first
      
      if (this.energy < amount) {
        return false; // Not enough energy
      }
      
      this.energy -= amount;
      await this.save();
      return true;
    };
  },
})

export type User = typeof UserSchema
