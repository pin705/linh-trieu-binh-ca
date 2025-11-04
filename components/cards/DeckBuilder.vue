<template>
  <div class="max-w-7xl mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800">Xây Dựng Đội Hình</h2>
      <button 
        @click="$emit('back')"
        class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
      >
        ← Quay Lại
      </button>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-500">
      Đang tải đội hình...
    </div>

    <div v-else-if="error" class="text-center py-12 text-red-600">
      {{ error }}
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow-xl p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">Đội Hình Hiện Tại ({{ deckCards.length }} linh bài)</h3>
        
        <div v-if="deckCards.length === 0" class="text-center py-8 text-gray-500">
          Đội hình trống. Thêm linh bài từ bảo khố!
        </div>
        
        <div v-else class="space-y-3 mb-6">
          <div
            v-for="card in deckCards"
            :key="card._id"
            class="bg-gray-50 rounded-lg p-4 relative"
          >
            <span class="absolute top-3 right-3 bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
              {{ card.deckPosition }}
            </span>
            <h4 class="font-bold text-gray-800 mb-2 pr-10">{{ card.template.name }}</h4>
            <div class="flex gap-4 text-sm text-gray-600 mb-3">
              <span>⚔️ {{ card.currentAttack }}</span>
              <span>🛡️ {{ card.currentDefense }}</span>
            </div>
            <button
              @click="removeFromDeck(card)"
              class="w-full bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Loại Bỏ
            </button>
          </div>
        </div>

        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-4">
          <div class="flex justify-between py-2 border-b border-white/20">
            <span>Tổng Tấn Công:</span>
            <strong class="text-lg">{{ totalAttack }}</strong>
          </div>
          <div class="flex justify-between py-2 border-b border-white/20">
            <span>Tổng Phòng Thủ:</span>
            <strong class="text-lg">{{ totalDefense }}</strong>
          </div>
          <div class="flex justify-between py-2">
            <span>Tổng Sức Mạnh:</span>
            <strong class="text-xl">{{ totalAttack + totalDefense }}</strong>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-xl p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">Linh Bài Khả Dụng</h3>
        
        <div v-if="availableCards.length === 0" class="text-center py-8 text-gray-500">
          Tất cả linh bài đã có trong đội hình!
        </div>
        
        <div v-else class="space-y-3 max-h-[600px] overflow-y-auto pr-2" role="list" aria-label="Danh sách linh bài khả dụng">
          <div
            v-for="card in availableCards"
            :key="card._id"
            class="bg-gray-50 rounded-lg p-4"
          >
            <h4 class="font-bold text-gray-800 mb-2">{{ card.template.name }}</h4>
            <div class="flex gap-3 mb-2 text-sm">
              <span 
                class="px-2 py-1 rounded text-xs font-bold uppercase text-white"
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
              <span class="text-gray-600">Cấp {{ card.level }}</span>
            </div>
            <div class="flex gap-4 text-sm text-gray-600 mb-3">
              <span>⚔️ {{ card.currentAttack }}</span>
              <span>🛡️ {{ card.currentDefense }}</span>
            </div>
            <button
              @click="addToDeck(card)"
              :disabled="card.isLocked"
              class="w-full py-2 rounded-lg text-sm font-medium transition-colors"
              :class="card.isLocked 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-500 text-white hover:bg-green-600'"
            >
              {{ card.isLocked ? '🔒 Đã Khóa' : 'Thêm Vào Đội Hình' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['back'])

const deckCards = ref<any[]>([])
const availableCards = ref<any[]>([])
const loading = ref(false)
const error = ref('')

const totalAttack = computed(() =>
  deckCards.value.reduce((sum, card) => sum + card.currentAttack, 0)
)

const totalDefense = computed(() =>
  deckCards.value.reduce((sum, card) => sum + card.currentDefense, 0)
)

const loadCards = async () => {
  loading.value = true
  error.value = ''

  try {
    // Load all cards
    const response = await $fetch('/api/user/cards', {
      params: { sortBy: 'level', sortOrder: 'desc' },
    })

    if (response.success) {
      // Separate deck and available cards
      deckCards.value = response.data
        .filter((card: any) => card.isInDeck)
        .sort((a: any, b: any) => a.deckPosition - b.deckPosition)
      
      availableCards.value = response.data.filter((card: any) => !card.isInDeck)
    } else {
      error.value = 'Không thể tải linh bài'
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Không thể tải linh bài'
  } finally {
    loading.value = false
  }
}

const addToDeck = async (card: any) => {
  try {
    // Find next available position
    const maxPosition = deckCards.value.length > 0
      ? Math.max(...deckCards.value.map(c => c.deckPosition))
      : 0
    const position = maxPosition + 1

    const response = await $fetch(`/api/user/cards/${card._id}/deck`, {
      method: 'PUT',
      body: { action: 'add', position },
    })

    if (response.success) {
      // Reload cards
      await loadCards()
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Không thể thêm linh bài vào đội hình'
  }
}

const removeFromDeck = async (card: any) => {
  try {
    const response = await $fetch(`/api/user/cards/${card._id}/deck`, {
      method: 'PUT',
      body: { action: 'remove' },
    })

    if (response.success) {
      // Reload cards
      await loadCards()
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Không thể loại bỏ linh bài khỏi đội hình'
  }
}

onMounted(() => {
  loadCards()
})
</script>

