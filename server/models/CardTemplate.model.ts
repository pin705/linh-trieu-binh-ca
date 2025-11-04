import { defineMongooseModel } from '#nuxt/mongoose'

/**
 * CardTemplate Schema - Mẫu thẻ bài gốc
 * Chứa các thông tin cơ bản của từng loại thẻ
 */
export const CardTemplateSchema = defineMongooseModel({
  name: 'CardTemplate',
  schema: {
    // Thông tin cơ bản
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    
    // Chỉ số cơ bản
    baseAttack: {
      type: Number,
      required: true,
      min: 1,
      max: 1000
    },
    baseDefense: {
      type: Number,
      required: true,
      min: 1,
      max: 1000
    },
    
    // Độ hiếm của thẻ
    rarity: {
      type: String,
      enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'],
      default: 'Common',
      required: true
    },
    
    // Hình ảnh
    imageUrl: {
      type: String,
      default: '/images/cards/default.png'
    },
    
    // Chi phí và giá trị
    cost: {
      type: Number,
      default: 100, // Giá mua thẻ
      min: 0
    },
    sellPrice: {
      type: Number,
      default: 50, // Giá bán lại
      min: 0
    },
    
    // Yêu cầu level để sở hữu
    requiredLevel: {
      type: Number,
      default: 1,
      min: 1
    },
    
    // Thuộc tính đặc biệt
    element: {
      type: String,
      enum: ['Fire', 'Water', 'Earth', 'Wind', 'Light', 'Dark', 'Neutral'],
      default: 'Neutral'
    },
    
    // Metadata
    isActive: {
      type: Boolean,
      default: true // Có thể bị vô hiệu hóa bởi admin
    },
    createdAt: {
      type: Date,
      default: () => new Date()
    }
  },
  options: {
    timestamps: true
  },
  hooks(schema) {
    // Index để tối ưu query
    schema.index({ rarity: 1 })
    schema.index({ element: 1 })
    schema.index({ requiredLevel: 1 })
    schema.index({ isActive: 1 })
    
    // Virtual: Tổng chỉ số
    schema.virtual('totalStats').get(function() {
      return this.baseAttack + this.baseDefense
    })
    
    // Virtual: Hệ số độ hiếm (để tính toán drop rate)
    schema.virtual('rarityMultiplier').get(function() {
      const multipliers = {
        'Common': 1,
        'Uncommon': 1.5,
        'Rare': 2,
        'Epic': 3,
        'Legendary': 5
      }
      return multipliers[this.rarity] || 1
    })
    
    // Static method: Lấy thẻ theo độ hiếm
    schema.statics.findByRarity = function(rarity: string) {
      return this.find({ rarity, isActive: true })
    }
    
    // Static method: Lấy thẻ random cho gacha
    schema.statics.getRandomCard = async function(userLevel: number) {
      // Lọc thẻ phù hợp với level người chơi
      const availableCards = await this.find({
        isActive: true,
        requiredLevel: { $lte: userLevel }
      })
      
      if (availableCards.length === 0) return null
      
      // Random với xác suất dựa trên độ hiếm
      const rarityWeights = {
        'Common': 50,
        'Uncommon': 30,
        'Rare': 15,
        'Epic': 4,
        'Legendary': 1
      }
      
      const weightedCards = availableCards.flatMap(card => 
        Array(rarityWeights[card.rarity] || 1).fill(card)
      )
      
      const randomIndex = Math.floor(Math.random() * weightedCards.length)
      return weightedCards[randomIndex]
    }
  }
})
