<template>
  <div class="card-collection">
    <div class="collection-header">
      <h2>Card Collection</h2>
      <button class="back-btn" @click="$emit('back')">← Back</button>
    </div>

    <div class="filters">
      <select v-model="filters.sortBy" @change="loadCards">
        <option value="obtainedAt">Sort by: Obtained Date</option>
        <option value="level">Sort by: Level</option>
        <option value="currentAttack">Sort by: Attack</option>
        <option value="currentDefense">Sort by: Defense</option>
      </select>

      <label class="filter-checkbox">
        <input type="checkbox" v-model="filters.inDeckOnly" @change="loadCards" />
        In Deck Only
      </label>

      <label class="filter-checkbox">
        <input type="checkbox" v-model="filters.lockedOnly" @change="loadCards" />
        Locked Only
      </label>
    </div>

    <div v-if="loading" class="loading">Loading cards...</div>

    <div v-else-if="error" class="error-message">{{ error }}</div>

    <div v-else-if="cards.length === 0" class="no-cards">
      You don't have any cards yet. Complete battles or purchase card packs!
    </div>

    <div v-else class="cards-grid">
      <div
        v-for="card in cards"
        :key="card._id"
        class="card-item"
        :class="{ locked: card.isLocked, 'in-deck': card.isInDeck }"
      >
        <div class="card-header">
          <span class="card-rarity" :class="card.template.rarity">
            {{ card.template.rarity }}
          </span>
          <span v-if="card.isLocked" class="lock-icon">🔒</span>
          <span v-if="card.isInDeck" class="deck-icon">📋</span>
        </div>

        <h3>{{ card.template.name }}</h3>
        
        <div class="card-stats">
          <div class="stat">
            <span class="stat-label">⚔️ Attack</span>
            <span class="stat-value">{{ card.currentAttack }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">🛡️ Defense</span>
            <span class="stat-value">{{ card.currentDefense }}</span>
          </div>
        </div>

        <div class="card-info">
          <div class="info-row">
            <span>Level: {{ card.level }}</span>
            <span>Element: {{ card.template.element }}</span>
          </div>
        </div>

        <div class="card-actions">
          <button
            @click="toggleLock(card)"
            :class="card.isLocked ? 'unlock' : 'lock'"
          >
            {{ card.isLocked ? 'Unlock' : 'Lock' }}
          </button>
          <button
            v-if="!card.isInDeck"
            @click="$emit('add-to-deck', card)"
            class="add-deck"
          >
            Add to Deck
          </button>
          <button
            v-else
            @click="$emit('remove-from-deck', card)"
            class="remove-deck"
          >
            Remove from Deck
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
      error.value = 'Failed to load cards'
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load cards'
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

<style scoped>
.card-collection {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.collection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.collection-header h2 {
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

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filters select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.loading, .error-message, .no-cards {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.error-message {
  color: #e74c3c;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card-item {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  border: 2px solid transparent;
}

.card-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-item.locked {
  border-color: #f39c12;
}

.card-item.in-deck {
  border-color: #3498db;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-rarity {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.card-rarity.common {
  background: #95a5a6;
  color: white;
}

.card-rarity.uncommon {
  background: #27ae60;
  color: white;
}

.card-rarity.rare {
  background: #3498db;
  color: white;
}

.card-rarity.epic {
  background: #9b59b6;
  color: white;
}

.card-rarity.legendary {
  background: #f39c12;
  color: white;
}

.lock-icon, .deck-icon {
  font-size: 1.2rem;
}

.card-item h3 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.card-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat {
  background: #ecf0f1;
  padding: 0.75rem;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2c3e50;
}

.card-info {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.card-actions button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: opacity 0.2s;
}

.card-actions button:hover {
  opacity: 0.8;
}

.lock {
  background: #f39c12;
  color: white;
}

.unlock {
  background: #95a5a6;
  color: white;
}

.add-deck {
  background: #3498db;
  color: white;
}

.remove-deck {
  background: #e74c3c;
  color: white;
}
</style>
