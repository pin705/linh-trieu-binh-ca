import { defineMongooseModel } from '#nuxt/mongoose'
import { Schema } from 'mongoose'

/**
 * UserCard Schema - Thẻ bài người chơi sở hữu
 * Đây là collection quan trọng nhất, lưu trữ các thẻ bài cụ thể của người chơi
 */
export const UserCardSchema = defineMongooseModel({
  name: 'UserCard',
  schema: {
    // Chủ sở hữu (Reference đến User)
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    // Template thẻ bài (Reference đến CardTemplate)
    template: {
      type: Schema.Types.ObjectId,
      ref: 'CardTemplate',
      required: true,
      index: true
    },
    
    // Chỉ số hiện tại (có thể thay đổi khi ép bài)
    currentAttack: {
      type: Number,
      required: true,
      min: 1
    },
    currentDefense: {
      type: Number,
      required: true,
      min: 1
    },
    
    // Level của thẻ (tăng khi ép bài)
    cardLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 50
    },
    
    // Kinh nghiệm của thẻ
    experience: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Số lần đã ép bài
    fuseCount: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Trạng thái thẻ
    isLocked: {
      type: Boolean,
      default: false // Khóa thẻ để tránh ép nhầm
    },
    isFavorite: {
      type: Boolean,
      default: false // Đánh dấu yêu thích
    },
    isInDeck: {
      type: Boolean,
      default: false // Đang trong deck chiến đấu
    },
    
    // Thống kê chiến đấu
    battlesWon: {
      type: Number,
      default: 0
    },
    battlesLost: {
      type: Number,
      default: 0
    },
    totalDamageDealt: {
      type: Number,
      default: 0
    },
    
    // Thời gian
    acquiredAt: {
      type: Date,
      default: () => new Date()
    },
    lastUsedAt: {
      type: Date,
      default: null
    }
  },
  options: {
    timestamps: true
  },
  hooks(schema) {
    // Compound indexes để tối ưu query
    schema.index({ owner: 1, isInDeck: 1 })
    schema.index({ owner: 1, isFavorite: 1 })
    schema.index({ owner: 1, cardLevel: -1 })
    
    // Virtual: Tổng chỉ số hiện tại
    schema.virtual('totalStats').get(function() {
      return this.currentAttack + this.currentDefense
    })
    
    // Virtual: Tỷ lệ thắng của thẻ
    schema.virtual('winRate').get(function() {
      const totalBattles = this.battlesWon + this.battlesLost
      if (totalBattles === 0) return 0
      return (this.battlesWon / totalBattles * 100).toFixed(2)
    })
    
    // Virtual: Experience cần để lên level
    schema.virtual('experienceToNextLevel').get(function() {
      // Công thức: 100 * level^1.5
      return Math.floor(100 * Math.pow(this.cardLevel, 1.5))
    })
    
    // Pre-save hook: Khởi tạo chỉ số từ template khi tạo thẻ mới
    schema.pre('save', async function(next) {
      // Chỉ chạy khi thẻ mới được tạo
      if (this.isNew && !this.currentAttack && !this.currentDefense) {
        // Populate template để lấy baseAttack và baseDefense
        const CardTemplate = this.model('CardTemplate')
        const template = await CardTemplate.findById(this.template)
        
        if (template) {
          this.currentAttack = template.baseAttack
          this.currentDefense = template.baseDefense
        }
      }
      next()
    })
    
    // Method: Ép bài (fuse) - Tăng chỉ số
    schema.methods.fuse = function(sacrificeCard: any) {
      // Tăng chỉ số dựa trên thẻ bị hy sinh
      const attackGain = Math.floor(sacrificeCard.currentAttack * 0.1)
      const defenseGain = Math.floor(sacrificeCard.currentDefense * 0.1)
      
      this.currentAttack += attackGain
      this.currentDefense += defenseGain
      this.fuseCount += 1
      this.experience += 50
      
      // Kiểm tra level up
      this.checkLevelUp()
      
      return {
        attackGain,
        defenseGain,
        newAttack: this.currentAttack,
        newDefense: this.currentDefense
      }
    }
    
    // Method: Kiểm tra và level up
    schema.methods.checkLevelUp = function() {
      const expNeeded = this.experienceToNextLevel
      
      if (this.experience >= expNeeded && this.cardLevel < 50) {
        this.cardLevel += 1
        this.experience -= expNeeded
        
        // Bonus chỉ số khi lên level
        this.currentAttack += 5
        this.currentDefense += 5
        
        return true
      }
      
      return false
    }
    
    // Method: Ghi nhận chiến thắng
    schema.methods.recordWin = function(damageDealt: number) {
      this.battlesWon += 1
      this.totalDamageDealt += damageDealt
      this.experience += 20
      this.lastUsedAt = new Date()
      this.checkLevelUp()
    }
    
    // Method: Ghi nhận thua cuộc
    schema.methods.recordLoss = function(damageDealt: number) {
      this.battlesLost += 1
      this.totalDamageDealt += damageDealt
      this.experience += 5
      this.lastUsedAt = new Date()
    }
    
    // Static method: Lấy deck của người chơi
    schema.statics.getUserDeck = function(userId: string) {
      return this.find({ owner: userId, isInDeck: true })
        .populate('template')
        .sort({ cardLevel: -1 })
    }
    
    // Static method: Lấy tất cả thẻ của người chơi
    schema.statics.getUserCards = function(userId: string, options: any = {}) {
      const query = this.find({ owner: userId })
        .populate('template')
      
      // Sắp xếp
      if (options.sortBy === 'level') {
        query.sort({ cardLevel: -1 })
      } else if (options.sortBy === 'attack') {
        query.sort({ currentAttack: -1 })
      } else if (options.sortBy === 'defense') {
        query.sort({ currentDefense: -1 })
      } else {
        query.sort({ acquiredAt: -1 })
      }
      
      return query
    }
  }
})
