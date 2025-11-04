<template>
  <div class="max-w-7xl mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800">Bảo Khố Linh Bài</h2>
      <button 
        @click="$emit('back')"
        class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
      >
        ← Quay Lại
      </button>
    </div>

    <div class="flex flex-wrap gap-3 mb-6">
      <select 
        v-model="filters.sortBy" 
        @change="loadCards"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        <option value="obtainedAt">Sắp xếp: Ngày nhận</option>
        <option value="level">Sắp xếp: Cấp độ</option>
        <option value="currentAttack">Sắp xếp: Tấn công</option>
        <option value="currentDefense">Sắp xếp: Phòng thủ</option>
      </select>

      <label class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
        <input type="checkbox" v-model="filters.inDeckOnly" @change="loadCards" class="w-4 h-4" />
        <span class="text-sm text-gray-700">Chỉ trong đội hình</span>
      </label>

      <label class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
        <input type="checkbox" v-model="filters.lockedOnly" @change="loadCards" class="w-4 h-4" />
        <span class="text-sm text-gray-700">Chỉ đã khóa</span>
      </label>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-500">
      Đang tải linh bài...
    </div>

    <div v-else-if="error" class="text-center py-12 text-red-600">
      {{ error }}
    </div>

    <div v-else-if="cards.length === 0" class="text-center py-12 text-gray-500">
      Chưa có linh bài. Chiến đấu để nhận thưởng hoặc mua gói bài!
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="card in cards"
        :key="card._id"
        class="bg-white rounded-lg shadow-md p-4 border-2 transition-all hover:-translate-y-1 hover:shadow-lg"
        :class="{
          'border-yellow-400': card.isLocked,
          'border-blue-400': card.isInDeck && !card.isLocked,
          'border-transparent': !card.isLocked && !card.isInDeck
        }"
      >
        <div class="flex justify-between items-center mb-3">
          <span 
            class="px-3 py-1 rounded-full text-xs font-bold uppercase text-white"
            :class="{
              'bg-gray-500': card.template.rarity === 'common',
              'bg-green-500': card.template.rarity === 'uncommon',
              'bg-blue-500': card.template.rarity === 'rare',
              'bg-purple-500': card.template.rarity === 'epic',
              'bg-yellow-500': card.template.rarity === 'legendary'
            }"
          >
            {{ card.template.rarity }}
          </span>
          <div class="flex gap-1 text-lg">
            <span v-if="card.isLocked">🔒</span>
            <span v-if="card.isInDeck">📋</span>
          </div>
        </div>

        <h3 class="text-lg font-bold text-gray-800 mb-3">{{ card.template.name }}</h3>
        
        <div class="grid grid-cols-2 gap-2 mb-3">
          <div class="bg-gray-50 p-3 rounded-lg text-center">
            <div class="text-xs text-gray-600 mb-1">⚔️ Tấn Công</div>
            <div class="text-xl font-bold text-gray-800">{{ card.currentAttack }}</div>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg text-center">
            <div class="text-xs text-gray-600 mb-1">🛡️ Phòng Thủ</div>
            <div class="text-xl font-bold text-gray-800">{{ card.currentDefense }}</div>
          </div>
        </div>

        <div class="flex justify-between text-sm text-gray-600 mb-3">
          <span>Cấp độ: {{ card.level }}</span>
          <span>Nguyên tố: {{ card.template.element }}</span>
        </div>

        <div class="flex gap-2">
          <button
            @click="toggleLock(card)"
            class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="card.isLocked 
              ? 'bg-gray-500 text-white hover:bg-gray-600' 
              : 'bg-yellow-500 text-white hover:bg-yellow-600'"
          >
            {{ card.isLocked ? 'Mở Khóa' : 'Khóa Lại' }}
          </button>
          <button
            v-if="!card.isInDeck"
            @click="$emit('add-to-deck', card)"
            class="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Vào Đội Hình
          </button>
          <button
            v-else
            @click="$emit('remove-from-deck', card)"
            class="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Rời Đội Hình
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['back', 'add-to-deck', 'remove-from-deck'])

const cards = ref<any[]>([])
const loading = ref(false)
const error = ref('')

const filters = ref({
  sortBy: 'obtainedAt',
  inDeckOnly: false,
  lockedOnly: false,
})

const loadCards = async () => {
  loading.value = true
  error.value = ''

  try {
    const params: any = {
      sortBy: filters.value.sortBy,
      sortOrder: 'desc',
    }

    if (filters.value.inDeckOnly) {
      params.inDeck = 'true'
    }

    if (filters.value.lockedOnly) {
      params.isLocked = 'true'
    }

    const response = await $fetch('/api/user/cards', { params })
    
    if (response.success) {
      cards.value = response.data
    } else {
      error.value = 'Không thể tải linh bài'
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Không thể tải linh bài'
  } finally {
    loading.value = false
  }
}

const toggleLock = async (card: any) => {
  try {
    const response = await $fetch(`/api/user/cards/${card._id}/lock`, {
      method: 'PUT',
      body: { locked: !card.isLocked },
    })

    if (response.success) {
      // Update the card in the list
      const index = cards.value.findIndex(c => c._id === card._id)
      if (index !== -1) {
        cards.value[index] = response.card
      }
    }
  } catch (err) {
    console.error('Failed to toggle lock:', err)
  }
}

onMounted(() => {
  loadCards()
})
</script>

