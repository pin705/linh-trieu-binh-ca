<template>
  <div class="max-w-4xl mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800">Trường Chiến Tranh Đấu</h2>
      <button 
        @click="$emit('back')"
        class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
      >
        ← Quay Lại
      </button>
    </div>

    <div v-if="!battleStarted" class="bg-white rounded-lg shadow-xl p-6">
      <h3 class="text-xl font-bold text-center text-gray-800 mb-6">Khởi Động Trận Chiến</h3>
      
      <div class="grid grid-cols-2 gap-4 mb-6">
        <button
          @click="battleType = 'pve'"
          class="p-4 border-2 rounded-lg font-medium transition-all"
          :class="battleType === 'pve' 
            ? 'bg-blue-500 text-white border-blue-500' 
            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'"
        >
          ⚔️ Đấu Với Ma Quân
        </button>
        <button
          @click="battleType = 'pvp'"
          class="p-4 border-2 rounded-lg font-medium transition-all"
          :class="battleType === 'pvp' 
            ? 'bg-blue-500 text-white border-blue-500' 
            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'"
        >
          🗡️ Đấu Với Anh Hùng
        </button>
      </div>

      <div v-if="battleType === 'pvp'" class="mb-6">
        <label for="opponentId" class="block text-sm font-medium text-gray-700 mb-2">
          Mã Hiệu Đối Thủ:
        </label>
        <input
          id="opponentId"
          v-model="opponentId"
          type="text"
          placeholder="Nhập mã hiệu đối thủ"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p class="mt-2 text-xs text-gray-500 italic">
          💡 Mẹo: Tìm mã hiệu từ lịch sử chiến đấu hoặc danh sách bằng hữu.
        </p>
      </div>

      <div class="bg-yellow-50 text-center py-3 rounded-lg mb-6 font-semibold text-yellow-800">
        ⚡ Tiêu Hao Khí Lực: 10
      </div>

      <button
        @click="startBattle"
        :disabled="loading || (battleType === 'pvp' && !opponentId)"
        class="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {{ loading ? 'Đang chuẩn bị...' : 'Bắt Đầu Chiến Đấu' }}
      </button>

      <div v-if="error" class="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
        {{ error }}
      </div>
    </div>

    <div v-else class="bg-white rounded-lg shadow-xl p-6">
      <div 
        class="text-center py-8 rounded-lg mb-6"
        :class="{
          'bg-gradient-to-r from-green-500 to-emerald-600 text-white': result.winner === 'player',
          'bg-gradient-to-r from-red-500 to-rose-600 text-white': result.winner === 'opponent',
          'bg-gradient-to-r from-yellow-400 to-orange-500 text-white': result.winner === 'draw'
        }"
      >
        <h3 class="text-3xl font-bold">
          <span v-if="result.winner === 'player'">🎉 Đại Thắng!</span>
          <span v-else-if="result.winner === 'draw'">🤝 Hòa Cục!</span>
          <span v-else>💀 Thua Trận!</span>
        </h3>
      </div>

      <div class="flex justify-around items-center mb-6">
        <div class="text-center">
          <h4 class="text-sm text-gray-600 mb-2">Điểm Số Của Bạn</h4>
          <div class="text-4xl font-bold text-gray-800">{{ result.playerScore }}</div>
        </div>
        <div class="text-2xl font-bold text-gray-400">VS</div>
        <div class="text-center">
          <h4 class="text-sm text-gray-600 mb-2">Điểm Đối Thủ</h4>
          <div class="text-4xl font-bold text-gray-800">{{ result.opponentScore }}</div>
        </div>
      </div>

      <div class="text-center text-gray-600 mb-6">
        <p>Số Hiệp Đấu: {{ result.rounds }}</p>
      </div>

      <div class="mb-6">
        <h4 class="font-bold text-gray-800 mb-3">Phần Thưởng</h4>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-green-50 p-4 rounded-lg flex justify-between items-center">
            <span class="text-gray-700">💰 Hoàng Kim:</span>
            <strong class="text-green-600 text-lg">+{{ result.rewards.gold }}</strong>
          </div>
          <div class="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
            <span class="text-gray-700">📈 Kinh Nghiệm:</span>
            <strong class="text-blue-600 text-lg">+{{ result.rewards.experience }}</strong>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h4 class="font-bold text-gray-800 mb-3">Chỉ Số Hiện Tại</h4>
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-gray-50 p-3 rounded-lg flex justify-between items-center text-sm">
            <span class="text-gray-600">⚡ Khí Lực:</span>
            <strong class="text-gray-800">{{ result.player.energy }}</strong>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg flex justify-between items-center text-sm">
            <span class="text-gray-600">💰 Hoàng Kim:</span>
            <strong class="text-gray-800">{{ result.player.gold }}</strong>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg flex justify-between items-center text-sm">
            <span class="text-gray-600">📈 Kinh Nghiệm:</span>
            <strong class="text-gray-800">{{ result.player.experience }}</strong>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <button 
          @click="resetBattle"
          class="bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Chiến Đấu Tiếp
        </button>
        <button 
          @click="viewHistory"
          class="bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
        >
          Xem Lịch Sử
        </button>
      </div>
    </div>

    <div v-if="showHistory" class="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-800">Lịch Sử Chiến Đấu</h3>
          <button 
            @click="showHistory = false"
            class="text-2xl text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div class="p-6">
          <div v-if="historyLoading" class="text-center py-8 text-gray-500">
            Đang tải...
          </div>
          <div v-else-if="history.length === 0" class="text-center py-8 text-gray-500">
            Chưa có lịch sử chiến đấu.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="battle in history"
              :key="battle._id"
              class="p-4 rounded-lg border-l-4"
              :class="{
                'bg-green-50 border-green-500': battle.winner === 'player',
                'bg-red-50 border-red-500': battle.winner === 'opponent',
                'bg-yellow-50 border-yellow-500': battle.winner === 'draw'
              }"
            >
              <div class="flex justify-between mb-2">
                <span class="font-bold text-gray-800">{{ battle.battleType.toUpperCase() }}</span>
                <span class="text-sm text-gray-500">
                  {{ formatDate(battle.createdAt) }}
                </span>
              </div>
              <div class="text-lg font-bold text-gray-800 mb-1">
                {{ battle.playerScore }} - {{ battle.opponentScore }}
              </div>
              <div class="text-sm text-gray-600">
                {{ battle.winner === 'player' ? 'Đại Thắng' : battle.winner === 'draw' ? 'Hòa Cục' : 'Thua Trận' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['back'])

const battleType = ref<'pve' | 'pvp'>('pve')
const opponentId = ref('')
const battleStarted = ref(false)
const loading = ref(false)
const error = ref('')
const result = ref<any>(null)
const showHistory = ref(false)
const history = ref<any[]>([])
const historyLoading = ref(false)

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('vi-VN')
  } catch {
    return new Date(dateString).toLocaleDateString()
  }
}

const startBattle = async () => {
  loading.value = true
  error.value = ''

  try {
    const body: any = { battleType: battleType.value }
    
    if (battleType.value === 'pvp') {
      body.opponentId = opponentId.value
    }

    const response = await $fetch('/api/battle/start', {
      method: 'POST',
      body,
    })

    if (response.success) {
      battleStarted.value = true
      result.value = response.battle
      result.value.player = response.player
    } else {
      error.value = 'Chiến đấu thất bại'
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Chiến đấu thất bại'
  } finally {
    loading.value = false
  }
}

const resetBattle = () => {
  battleStarted.value = false
  result.value = null
  error.value = ''
  opponentId.value = ''
}

const viewHistory = async () => {
  showHistory.value = true
  historyLoading.value = true

  try {
    const response = await $fetch('/api/battle/history', {
      params: { limit: 20 },
    })

    if (response.success) {
      history.value = response.data
    }
  } catch (err) {
    console.error('Failed to load history:', err)
  } finally {
    historyLoading.value = false
  }
}
</script>

