/**
 * Utility to seed the database with initial card templates
 * This should be run once when setting up the database for the first time
 */

import type { CardTemplate } from '../models/CardTemplate.model'

export interface CardTemplateData {
  name: string
  description: string
  baseAttack: number
  baseDefense: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  element: 'fire' | 'water' | 'earth' | 'wind' | 'light' | 'dark' | 'neutral'
  cost: number
  maxLevel: number
  imageUrl: string
}

export const initialCardTemplates: CardTemplateData[] = [
  // Common Cards
  {
    name: 'Chiến Binh Tân Binh',
    description: 'Một chiến binh trẻ tuổi, mới bắt đầu hành trình trở thành anh hùng.',
    baseAttack: 10,
    baseDefense: 8,
    rarity: 'common',
    element: 'neutral',
    cost: 1,
    maxLevel: 10,
    imageUrl: '/images/cards/warrior-recruit.png',
  },
  {
    name: 'Cung Thủ Rừng Xanh',
    description: 'Cung thủ thiện xạ từ rừng sâu, mỗi mũi tên đều chính xác.',
    baseAttack: 12,
    baseDefense: 6,
    rarity: 'common',
    element: 'wind',
    cost: 1,
    maxLevel: 10,
    imageUrl: '/images/cards/forest-archer.png',
  },
  {
    name: 'Phù Thủy Lửa',
    description: 'Người sử dụng phép thuật lửa cơ bản, nguy hiểm với kẻ thù gần.',
    baseAttack: 15,
    baseDefense: 5,
    rarity: 'common',
    element: 'fire',
    cost: 2,
    maxLevel: 10,
    imageUrl: '/images/cards/fire-mage.png',
  },

  // Uncommon Cards
  {
    name: 'Kiếm Sĩ Thép',
    description: 'Chiến binh được trang bị giáp thép, phòng thủ vững chắc.',
    baseAttack: 18,
    baseDefense: 15,
    rarity: 'uncommon',
    element: 'earth',
    cost: 2,
    maxLevel: 12,
    imageUrl: '/images/cards/steel-swordsman.png',
  },
  {
    name: 'Đạo Sĩ Băng Giá',
    description: 'Sử dụng sức mạnh băng tuyết để làm chậm và tấn công đối thủ.',
    baseAttack: 20,
    baseDefense: 12,
    rarity: 'uncommon',
    element: 'water',
    cost: 2,
    maxLevel: 12,
    imageUrl: '/images/cards/ice-priest.png',
  },

  // Rare Cards
  {
    name: 'Hiệp Sĩ Rồng',
    description: 'Hiệp sĩ tinh nhuệ, được ban phước bởi sức mạnh của rồng.',
    baseAttack: 28,
    baseDefense: 22,
    rarity: 'rare',
    element: 'fire',
    cost: 3,
    maxLevel: 15,
    imageUrl: '/images/cards/dragon-knight.png',
  },
  {
    name: 'Pháp Sư Giông Bão',
    description: 'Chủ nhân của sấm sét, có thể triệu hồi giông bão mạnh mẽ.',
    baseAttack: 32,
    baseDefense: 18,
    rarity: 'rare',
    element: 'wind',
    cost: 3,
    maxLevel: 15,
    imageUrl: '/images/cards/storm-wizard.png',
  },

  // Epic Cards
  {
    name: 'Tướng Quân Thần Thánh',
    description: 'Vị tướng huyền thoại, lãnh đạo quân đội với sức mạnh phi thường.',
    baseAttack: 40,
    baseDefense: 35,
    rarity: 'epic',
    element: 'light',
    cost: 4,
    maxLevel: 20,
    imageUrl: '/images/cards/divine-general.png',
  },
  {
    name: 'Ám Sát Bóng Đêm',
    description: 'Sát thủ bí ẩn trong bóng tối, đòn tấn công chí mạng.',
    baseAttack: 45,
    baseDefense: 25,
    rarity: 'epic',
    element: 'dark',
    cost: 4,
    maxLevel: 20,
    imageUrl: '/images/cards/shadow-assassin.png',
  },

  // Legendary Cards
  {
    name: 'Thần Rồng Lửa',
    description: 'Rồng huyền thoại kiểm soát ngọn lửa địa ngục, sức mạnh tuyệt đối.',
    baseAttack: 60,
    baseDefense: 50,
    rarity: 'legendary',
    element: 'fire',
    cost: 5,
    maxLevel: 25,
    imageUrl: '/images/cards/fire-dragon-god.png',
  },
  {
    name: 'Đế Vương Ánh Sáng',
    description: 'Người cai trị với ánh sáng thiêng liêng, mang lại hy vọng và sức mạnh.',
    baseAttack: 55,
    baseDefense: 55,
    rarity: 'legendary',
    element: 'light',
    cost: 5,
    maxLevel: 25,
    imageUrl: '/images/cards/emperor-of-light.png',
  },
]

/**
 * Seeds the database with initial card templates
 * Returns the number of cards created
 */
export async function seedCardTemplates(CardTemplateModel: typeof CardTemplate): Promise<number> {
  try {
    // Check if templates already exist
    const existingCount = await CardTemplateModel.countDocuments()
    
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} card templates. Skipping seed.`)
      return 0
    }

    // Insert all templates
    const created = await CardTemplateModel.insertMany(initialCardTemplates)
    
    console.log(`Successfully seeded ${created.length} card templates!`)
    return created.length
  } catch (error) {
    console.error('Error seeding card templates:', error)
    throw error
  }
}

/**
 * Clears all card templates and reseeds (use with caution!)
 */
export async function reseedCardTemplates(CardTemplateModel: typeof CardTemplate): Promise<number> {
  try {
    // Delete all existing templates
    await CardTemplateModel.deleteMany({})
    console.log('Cleared existing card templates')

    // Insert new templates
    const created = await CardTemplateModel.insertMany(initialCardTemplates)
    
    console.log(`Successfully reseeded ${created.length} card templates!`)
    return created.length
  } catch (error) {
    console.error('Error reseeding card templates:', error)
    throw error
  }
}
