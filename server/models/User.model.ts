import { defineMongooseModel } from '#nuxt/mongoose'
import { Schema } from 'mongoose'

/**
 * User Schema - Mở rộng từ nuxt-auth-utils
 * Chứa thông tin game của người chơi
 */
export const UserSchema = defineMongooseModel({
  name: 'User',
  schema: {
    // Thông tin xác thực (tương thích với nuxt-auth-utils)
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      select: false // Không trả về password khi query
    },
    
    // Thông tin game
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 100
    },
    gold: {
      type: Number,
      default: 1000, // Vàng khởi đầu
      min: 0
    },
    energy: {
      type: Number,
      default: 100, // Năng lượng tối đa ban đầu
      min: 0
    },
    maxEnergy: {
      type: Number,
      default: 100,
      min: 0
    },
    lastEnergyRefill: {
      type: Date,
      default: () => new Date()
    },
    
    // Thống kê game
    totalBattles: {
      type: Number,
      default: 0
    },
    wins: {
      type: Number,
      default: 0
    },
    losses: {
      type: Number,
      default: 0
    },
    
    // Timestamps
    createdAt: {
      type: Date,
      default: () => new Date()
    },
    lastLogin: {
      type: Date,
      default: () => new Date()
    }
  },
  options: {
    timestamps: true
  },
  hooks(schema) {
    // Index để tối ưu query
    schema.index({ username: 1 })
    schema.index({ email: 1 })
    
    // Virtual field: Tỷ lệ thắng
    schema.virtual('winRate').get(function() {
      if (this.totalBattles === 0) return 0
      return (this.wins / this.totalBattles * 100).toFixed(2)
    })
    
    // Method: Cập nhật năng lượng dựa trên thời gian
    schema.methods.refillEnergy = function() {
      const now = new Date()
      const lastRefill = this.lastEnergyRefill
      const minutesPassed = Math.floor((now.getTime() - lastRefill.getTime()) / (1000 * 60))
      
      // Hồi 1 năng lượng mỗi 5 phút
      const energyToRefill = Math.floor(minutesPassed / 5)
      
      if (energyToRefill > 0) {
        this.energy = Math.min(this.energy + energyToRefill, this.maxEnergy)
        this.lastEnergyRefill = now
      }
      
      return this.energy
    }
    
    // Method: Tiêu hao năng lượng
    schema.methods.consumeEnergy = function(amount: number) {
      if (this.energy < amount) {
        return false
      }
      this.energy -= amount
      return true
    }
    
    // Method: Thêm vàng
    schema.methods.addGold = function(amount: number) {
      this.gold += amount
      return this.gold
    }
    
    // Method: Trừ vàng
    schema.methods.spendGold = function(amount: number) {
      if (this.gold < amount) {
        return false
      }
      this.gold -= amount
      return true
    }
  }
})
