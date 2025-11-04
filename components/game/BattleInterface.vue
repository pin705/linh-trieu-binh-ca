<template>
  <div class="battle-interface">
    <div class="battle-header">
      <h2>Battle Arena</h2>
      <button class="back-btn" @click="$emit('back')">← Back</button>
    </div>

    <div v-if="!battleStarted" class="battle-setup">
      <h3>Start a Battle</h3>
      
      <div class="battle-type-selector">
        <button
          @click="battleType = 'pve'"
          class="type-btn"
          :class="{ active: battleType === 'pve' }"
        >
          ⚔️ PvE (vs AI)
        </button>
        <button
          @click="battleType = 'pvp'"
          class="type-btn"
          :class="{ active: battleType === 'pvp' }"
        >
          🗡️ PvP (Player vs Player)
        </button>
      </div>

      <div v-if="battleType === 'pvp'" class="opponent-input">
        <label for="opponentId">Opponent User ID:</label>
        <input
          id="opponentId"
          v-model="opponentId"
          type="text"
          placeholder="Enter opponent's user ID"
        />
        <p class="input-hint">
          💡 Tip: You can find user IDs from your battle history or friends list.
          For now, PvP requires knowing the opponent's ID.
        </p>
      </div>

      <div class="energy-cost">
        ⚡ Energy Cost: 10
      </div>

      <button
        @click="startBattle"
        class="start-battle-btn"
        :disabled="loading || (battleType === 'pvp' && !opponentId)"
      >
        {{ loading ? 'Starting Battle...' : 'Start Battle' }}
      </button>

      <div v-if="error" class="error-message">{{ error }}</div>
    </div>

    <div v-else class="battle-result">
      <div class="result-header" :class="result.winner">
        <h3 v-if="result.winner === 'player'">🎉 Victory!</h3>
        <h3 v-else-if="result.winner === 'draw'">🤝 Draw!</h3>
        <h3 v-else>💀 Defeat!</h3>
      </div>

      <div class="score-display">
        <div class="score player-score">
          <h4>Your Score</h4>
          <div class="score-value">{{ result.playerScore }}</div>
        </div>
        <div class="vs">VS</div>
        <div class="score opponent-score">
          <h4>Opponent Score</h4>
          <div class="score-value">{{ result.opponentScore }}</div>
        </div>
      </div>

      <div class="battle-info">
        <p>Rounds: {{ result.rounds }}</p>
      </div>

      <div class="rewards-section">
        <h4>Rewards</h4>
        <div class="rewards">
          <div class="reward">
            <span>💰 Gold:</span>
            <strong>+{{ result.rewards.gold }}</strong>
          </div>
          <div class="reward">
            <span>📈 Experience:</span>
            <strong>+{{ result.rewards.experience }}</strong>
          </div>
        </div>
      </div>

      <div class="player-stats">
        <h4>Updated Stats</h4>
        <div class="stats-grid">
          <div class="stat">
            <span>⚡ Energy:</span>
            <strong>{{ result.player.energy }}</strong>
          </div>
          <div class="stat">
            <span>💰 Gold:</span>
            <strong>{{ result.player.gold }}</strong>
          </div>
          <div class="stat">
            <span>📈 Experience:</span>
            <strong>{{ result.player.experience }}</strong>
          </div>
        </div>
      </div>

      <div class="battle-actions">
        <button @click="resetBattle" class="action-btn">
          Battle Again
        </button>
        <button @click="viewHistory" class="action-btn secondary">
          View History
        </button>
      </div>
    </div>

    <div v-if="showHistory" class="battle-history-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Battle History</h3>
          <button @click="showHistory = false" class="close-btn">✕</button>
        </div>
        <div v-if="historyLoading" class="loading">Loading...</div>
        <div v-else-if="history.length === 0" class="no-history">
          No battle history yet.
        </div>
        <div v-else class="history-list">
          <div
            v-for="battle in history"
            :key="battle._id"
            class="history-item"
            :class="battle.winner"
          >
            <div class="history-header">
              <span class="battle-type">{{ battle.battleType.toUpperCase() }}</span>
              <span class="battle-date">
                {{ new Date(battle.createdAt).toLocaleDateString() }}
              </span>
            </div>
            <div class="history-score">
              {{ battle.playerScore }} - {{ battle.opponentScore }}
            </div>
            <div class="history-result">
              {{ battle.winner === 'player' ? 'Victory' : battle.winner === 'draw' ? 'Draw' : 'Defeat' }}
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
      error.value = 'Battle failed'
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Battle failed'
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

<style scoped>
.battle-interface {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.battle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.battle-header h2 {
  color: #2c3e50;
  margin: 0;
}

.back-btn {
  padding: 0.5rem 1rem;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.back-btn:hover {
  background: #7f8c8d;
}

.battle-setup {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.battle-setup h3 {
  color: #2c3e50;
  margin-top: 0;
  text-align: center;
}

.battle-type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.type-btn {
  padding: 1rem;
  border: 2px solid #ddd;
  background: white;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.type-btn:hover {
  border-color: #3498db;
}

.type-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.opponent-input {
  margin-bottom: 1.5rem;
}

.opponent-input label {
  display: block;
  margin-bottom: 0.5rem;
  color: #34495e;
  font-weight: 500;
}

.opponent-input input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.input-hint {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #7f8c8d;
  font-style: italic;
}

.energy-cost {
  text-align: center;
  padding: 1rem;
  background: #fff3cd;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  font-weight: bold;
}

.start-battle-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.start-battle-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.start-battle-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee;
  color: #c00;
  border-radius: 4px;
  text-align: center;
}

.battle-result {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-header {
  text-align: center;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.result-header.player {
  background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
  color: white;
}

.result-header.opponent {
  background: linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%);
  color: white;
}

.result-header.draw {
  background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
  color: white;
}

.result-header h3 {
  margin: 0;
  font-size: 2rem;
}

.score-display {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 2rem;
}

.score {
  text-align: center;
}

.score h4 {
  margin: 0 0 0.5rem 0;
  color: #7f8c8d;
}

.score-value {
  font-size: 3rem;
  font-weight: bold;
  color: #2c3e50;
}

.vs {
  font-size: 1.5rem;
  font-weight: bold;
  color: #95a5a6;
}

.battle-info {
  text-align: center;
  margin-bottom: 2rem;
  color: #7f8c8d;
}

.rewards-section, .player-stats {
  margin-bottom: 2rem;
}

.rewards-section h4, .player-stats h4 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1rem;
}

.rewards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.reward {
  padding: 1rem;
  background: #e8f5e9;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat {
  padding: 1rem;
  background: #ecf0f1;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.battle-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.action-btn {
  padding: 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  background: #3498db;
  color: white;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 0.8;
}

.action-btn.secondary {
  background: #95a5a6;
}

.battle-history-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #95a5a6;
}

.close-btn:hover {
  color: #7f8c8d;
}

.loading, .no-history {
  text-align: center;
  padding: 2rem;
  color: #95a5a6;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #95a5a6;
}

.history-item.player {
  background: #e8f5e9;
  border-left-color: #27ae60;
}

.history-item.opponent {
  background: #ffebee;
  border-left-color: #e74c3c;
}

.history-item.draw {
  background: #fff8e1;
  border-left-color: #f39c12;
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.battle-type {
  font-weight: bold;
  color: #2c3e50;
}

.battle-date {
  color: #7f8c8d;
  font-size: 0.85rem;
}

.history-score {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.history-result {
  color: #7f8c8d;
}
</style>
