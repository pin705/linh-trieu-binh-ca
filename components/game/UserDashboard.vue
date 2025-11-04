<template>
  <div class="max-w-4xl mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800">Điện Hạ {{ user.username }}</h2>
      <button 
        @click="handleLogout"
        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
      >
        Rút Lui
      </button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div class="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
        <div class="text-3xl">⚡</div>
        <div class="flex-1">
          <div class="text-xs text-gray-600">Khí Lực</div>
          <div class="text-lg font-bold text-gray-800">{{ user.energy }}/{{ user.maxEnergy }}</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
        <div class="text-3xl">💰</div>
        <div class="flex-1">
          <div class="text-xs text-gray-600">Hoàng Kim</div>
          <div class="text-lg font-bold text-gray-800">{{ user.gold }}</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
        <div class="text-3xl">⭐</div>
        <div class="flex-1">
          <div class="text-xs text-gray-600">Phẩm Cấp</div>
          <div class="text-lg font-bold text-gray-800">{{ user.level }}</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
        <div class="text-3xl">📈</div>
        <div class="flex-1">
          <div class="text-xs text-gray-600">Kinh Nghiệm</div>
          <div class="text-lg font-bold text-gray-800">{{ user.experience }}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button 
        @click="$emit('navigate', 'cards')"
        class="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-6 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-purple-800 transform hover:-translate-y-1 transition-all shadow-lg"
      >
        🃏 Bảo Khố Linh Bài
      </button>
      <button 
        @click="$emit('navigate', 'deck')"
        class="bg-gradient-to-br from-pink-600 to-rose-700 text-white p-6 rounded-lg font-bold text-lg hover:from-pink-700 hover:to-rose-800 transform hover:-translate-y-1 transition-all shadow-lg"
      >
        📋 Xây Dựng Đội Hình
      </button>
      <button 
        @click="$emit('navigate', 'battle')"
        class="bg-gradient-to-br from-orange-500 to-yellow-500 text-white p-6 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-yellow-600 transform hover:-translate-y-1 transition-all shadow-lg"
      >
        ⚔️ Tranh Đấu
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  user: {
    username: string
    level: number
    gold: number
    energy: number
    maxEnergy: number
    experience: number
  }
}>()

const emit = defineEmits(['navigate', 'logout'])

const handleLogout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    emit('logout')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>


