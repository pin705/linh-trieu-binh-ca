<template>
  <div class="user-dashboard">
    <div class="dashboard-header">
      <h2>{{ user.username }}'s Dashboard</h2>
      <button class="logout-btn" @click="handleLogout">Logout</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-info">
          <div class="stat-label">Energy</div>
          <div class="stat-value">{{ user.energy }} / {{ user.maxEnergy }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <div class="stat-label">Gold</div>
          <div class="stat-value">{{ user.gold }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-info">
          <div class="stat-label">Level</div>
          <div class="stat-value">{{ user.level }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <div class="stat-label">Experience</div>
          <div class="stat-value">{{ user.experience }}</div>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <button @click="$emit('navigate', 'cards')" class="action-btn cards">
        🃏 Card Collection
      </button>
      <button @click="$emit('navigate', 'deck')" class="action-btn deck">
        📋 Deck Builder
      </button>
      <button @click="$emit('navigate', 'battle')" class="action-btn battle">
        ⚔️ Battle
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

<style scoped>
.user-dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h2 {
  color: #2c3e50;
  margin: 0;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.logout-btn:hover {
  background: #c0392b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info {
  flex: 1;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: bold;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  padding: 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.action-btn.cards {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-btn.deck {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.action-btn.battle {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}
</style>
