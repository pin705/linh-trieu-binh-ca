import { defineMongooseModel } from '#nuxt/mongoose'

/**
 * UserCard Schema - Player-owned card instances
 * This is the most important collection as it represents the actual cards that players own.
 * Each UserCard is an instance of a CardTemplate with its own current stats that can be
 * modified through fusion, leveling, and other game mechanics.
 * 
 * Key concepts:
 * - Each UserCard references a CardTemplate (the base card design)
 * - Current stats can differ from base stats due to leveling/fusion
 * - Multiple players can own instances of the same CardTemplate
 * - Cards can be locked to prevent accidental fusion/deletion
 */
export const UserCardSchema = defineMongooseModel({
  name: 'UserCard',
  schema: {
    // Owner reference - who owns this card
    owner: {
      type: 'ObjectId',
      ref: 'User',
      required: true,
    },
    
    // Template reference - what type of card is this
    template: {
      type: 'ObjectId',
      ref: 'CardTemplate',
      required: true,
    },
    
    // Current stats (modified by leveling/fusion)
    currentAttack: {
      type: 'number',
      required: true,
      min: 1,
    },
    currentDefense: {
      type: 'number',
      required: true,
      min: 1,
    },
    
    // Card progression
    level: {
      type: 'number',
      default: 1,
      min: 1,
      required: true,
    },
    experience: {
      type: 'number',
      default: 0,
      min: 0,
    },
    
    // Card state
    isLocked: {
      type: 'boolean',
      default: false, // Locked cards can't be fused or deleted
    },
    isInDeck: {
      type: 'boolean',
      default: false, // Is this card currently in a battle deck?
    },
    deckPosition: {
      type: 'number',
      default: null, // Position in deck (1-n), null if not in deck
      min: null,
    },
    
    // Enhancement history
    timesEnhanced: {
      type: 'number',
      default: 0,
      min: 0,
    },
    
    // Fusion tracking
    fusedCards: {
      type: [
        {
          templateId: {
            type: 'ObjectId',
            ref: 'CardTemplate',
          },
          level: {
            type: 'number',
            default: 1,
          },
          fusedAt: {
            type: 'date',
            default: () => new Date(),
          },
        },
      ],
      default: [],
    },
    
    // Acquisition metadata
    obtainedFrom: {
      type: 'string',
      enum: ['starter', 'purchase', 'reward', 'fusion', 'event', 'gacha'],
      default: 'starter',
    },
    obtainedAt: {
      type: 'date',
      default: () => new Date(),
      required: true,
    },
    
    // Timestamps
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
    lastUsedAt: {
      type: 'date',
      default: null,
    },
  },
  options: {
    timestamps: true,
  },
  hooks(schema) {
    // Indexes for efficient queries
    schema.index({ owner: 1 });
    schema.index({ template: 1 });
    schema.index({ owner: 1, isInDeck: 1 });
    schema.index({ owner: 1, level: -1 }); // Sort by level descending
    schema.index({ owner: 1, currentAttack: -1 }); // Sort by attack power
    
    // Compound index for deck management
    schema.index({ owner: 1, deckPosition: 1 }, { sparse: true });
    
    // Pre-save hook
    schema.pre('save', function(next) {
      this.updatedAt = new Date();
      
      // If not in deck, clear deck position
      if (!this.isInDeck) {
        this.deckPosition = null;
      }
      
      next();
    });
    
    // Virtual field for total power
    schema.virtual('totalPower').get(function() {
      return this.currentAttack + this.currentDefense;
    });
    
    // Method to enhance card (level up through fusion)
    schema.methods.enhance = async function(sacrificeCard: any, CardTemplate: any) {
      // Get the template to check max level
      const template = await CardTemplate.findById(this.template);
      
      if (!template) {
        throw new Error('Card template not found');
      }
      
      if (this.level >= template.maxLevel) {
        throw new Error('Card is already at maximum level');
      }
      
      // Calculate stat increase based on sacrifice card
      const attackGain = Math.floor(sacrificeCard.currentAttack * 0.1);
      const defenseGain = Math.floor(sacrificeCard.currentDefense * 0.1);
      
      // Apply enhancements
      this.currentAttack += attackGain;
      this.currentDefense += defenseGain;
      this.level += 1;
      this.timesEnhanced += 1;
      
      // Track fusion history
      this.fusedCards.push({
        templateId: sacrificeCard.template,
        level: sacrificeCard.level,
        fusedAt: new Date(),
      });
      
      await this.save();
      return this;
    };
    
    // Method to add card to deck
    schema.methods.addToDeck = async function(position: number) {
      this.isInDeck = true;
      this.deckPosition = position;
      await this.save();
      return this;
    };
    
    // Method to remove card from deck
    schema.methods.removeFromDeck = async function() {
      this.isInDeck = false;
      this.deckPosition = null;
      await this.save();
      return this;
    };
    
    // Method to lock/unlock card
    schema.methods.toggleLock = async function() {
      this.isLocked = !this.isLocked;
      await this.save();
      return this;
    };
    
    // Method to record card usage
    schema.methods.recordUsage = async function() {
      this.lastUsedAt = new Date();
      await this.save();
      return this;
    };
  },
})

export type UserCard = typeof UserCardSchema
