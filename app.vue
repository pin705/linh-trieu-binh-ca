<template>
  <div id="app">
    <div class="app-header">
      <h1>🎴 Linh Triều Bình Ca</h1>
      <p class="tagline">Modern Card Battle Game</p>
    </div>

    <div class="app-container">
      <!-- Authentication Screen -->
      <div v-if="!user && currentView === 'auth'" class="auth-container">
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
      <div v-else-if="user" class="game-container">
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
      <div v-else class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    </div>

    <footer class="app-footer">
      <p>© 2024 Linh Triều Bình Ca | Built with Nuxt 3 & MongoDB</p>
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  text-align: center;
  padding: 2rem 1rem 1rem;
  color: white;
}

.app-header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.tagline {
  font-size: 1.2rem;
  opacity: 0.9;
}

.app-container {
  flex: 1;
  padding: 1rem;
}

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.game-container {
  max-width: 1400px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.app-footer {
  text-align: center;
  padding: 1.5rem;
  color: white;
  opacity: 0.8;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 2rem;
  }
  
  .tagline {
    font-size: 1rem;
  }
}
</style>
