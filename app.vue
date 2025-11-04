<template>
  <div id="app" class="min-h-screen flex flex-col bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
    <div class="text-center py-6 px-4 text-white">
      <h1 class="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">🎴 Linh Triều Bình Ca</h1>
      <p class="text-lg md:text-xl opacity-90">Thiên Hạ Anh Hùng - Quyết Đấu Giang Hồ</p>
    </div>

    <div class="flex-1 px-4 py-6">
      <!-- Authentication Screen -->
      <div v-if="!user && currentView === 'auth'" class="flex justify-center items-center min-h-[400px]">
        <LoginForm
          v-if="authMode === 'login'"
          @login-success="handleLoginSuccess"
          @switch-to-register="authMode = 'register'"
        />
        <RegisterForm
          v-else
          @register-success="handleRegisterSuccess"
          @switch-to-login="authMode = 'login'"
        />
      </div>

      <!-- Main Game Interface -->
      <div v-else-if="user" class="max-w-7xl mx-auto">
        <!-- Dashboard -->
        <UserDashboard
          v-if="currentView === 'dashboard'"
          :user="user"
          @navigate="handleNavigate"
          @logout="handleLogout"
        />

        <!-- Card Collection -->
        <CardCollection
          v-else-if="currentView === 'cards'"
          @back="currentView = 'dashboard'"
          @add-to-deck="handleAddToDeck"
          @remove-from-deck="handleRemoveFromDeck"
        />

        <!-- Deck Builder -->
        <DeckBuilder
          v-else-if="currentView === 'deck'"
          @back="currentView = 'dashboard'"
        />

        <!-- Battle Interface -->
        <BattleInterface
          v-else-if="currentView === 'battle'"
          @back="currentView = 'dashboard'"
        />
      </div>

      <!-- Loading State -->
      <div v-else class="flex flex-col justify-center items-center min-h-[400px] text-white">
        <div class="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        <p class="mt-4">Đang tải...</p>
      </div>
    </div>

    <footer class="text-center py-6 text-white/80 text-sm">
      <p>© 2024 Linh Triều Bình Ca | Xây dựng với Nuxt 3 & MongoDB</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '~/components/auth/LoginForm.vue'
import RegisterForm from '~/components/auth/RegisterForm.vue'
import UserDashboard from '~/components/game/UserDashboard.vue'
import CardCollection from '~/components/cards/CardCollection.vue'
import DeckBuilder from '~/components/cards/DeckBuilder.vue'
import BattleInterface from '~/components/game/BattleInterface.vue'

const user = ref<any>(null)
const currentView = ref<'auth' | 'dashboard' | 'cards' | 'deck' | 'battle'>('auth')
const authMode = ref<'login' | 'register'>('login')

// Check session on mount
onMounted(async () => {
  try {
    const response = await $fetch('/api/auth/session')
    if (response.authenticated && response.user) {
      user.value = response.user
      currentView.value = 'dashboard'
    }
  } catch (error) {
    console.error('Session check failed:', error)
  }
})

const handleLoginSuccess = (userData: any) => {
  user.value = userData
  currentView.value = 'dashboard'
}

const handleRegisterSuccess = (userData: any) => {
  // After registration, switch to login
  authMode.value = 'login'
}

const handleLogout = () => {
  user.value = null
  currentView.value = 'auth'
  authMode.value = 'login'
}

const handleNavigate = (view: string) => {
  currentView.value = view as any
}

const handleAddToDeck = async (card: any) => {
  // This will be handled by the CardCollection component
  console.log('Add to deck:', card)
}

const handleRemoveFromDeck = async (card: any) => {
  // This will be handled by the CardCollection component
  console.log('Remove from deck:', card)
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
