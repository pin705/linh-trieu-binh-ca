<template>
  <div class="deck-builder">
    <div class="builder-header">
      <h2>Deck Builder</h2>
      <button class="back-btn" @click="$emit('back')">← Back</button>
    </div>

    <div v-if="loading" class="loading">Loading deck...</div>

    <div v-else-if="error" class="error-message">{{ error }}</div>

    <div v-else class="builder-content">
      <div class="current-deck">
        <h3>Current Deck ({{ deckCards.length }} cards)</h3>
        <div v-if="deckCards.length === 0" class="empty-deck">
          Your deck is empty. Add cards from your collection!
        </div>
        <div v-else class="deck-cards">
          <div
            v-for="card in deckCards"
            :key="card._id"
            class="deck-card"
          >
            <div class="card-mini">
              <span class="position-badge">{{ card.deckPosition }}</span>
              <h4>{{ card.template.name }}</h4>
              <div class="mini-stats">
                <span>⚔️ {{ card.currentAttack }}</span>
                <span>🛡️ {{ card.currentDefense }}</span>
              </div>
              <button
                @click="removeFromDeck(card)"
                class="remove-btn"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <div class="deck-stats">
          <div class="stat">
            <span>Total Attack:</span>
            <strong>{{ totalAttack }}</strong>
          </div>
          <div class="stat">
            <span>Total Defense:</span>
            <strong>{{ totalDefense }}</strong>
          </div>
          <div class="stat">
            <span>Power Rating:</span>
            <strong>{{ totalAttack + totalDefense }}</strong>
          </div>
        </div>
      </div>

      <div class="available-cards">
        <h3>Available Cards</h3>
        <div v-if="availableCards.length === 0" class="no-cards">
          All your cards are already in the deck!
        </div>
        <div v-else class="cards-list">
          <div
            v-for="card in availableCards"
            :key="card._id"
            class="available-card"
          >
            <h4>{{ card.template.name }}</h4>
            <div class="card-details">
              <span class="rarity" :class="card.template.rarity">
                {{ card.template.rarity }}
              </span>
              <span>Lvl {{ card.level }}</span>
            </div>
            <div class="mini-stats">
              <span>⚔️ {{ card.currentAttack }}</span>
              <span>🛡️ {{ card.currentDefense }}</span>
            </div>
            <button
              @click="addToDeck(card)"
              class="add-btn"
              :disabled="card.isLocked"
            >
              {{ card.isLocked ? '🔒 Locked' : 'Add to Deck' }}
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
      error.value = 'Failed to load cards'
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load cards'
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
    error.value = err.data?.message || 'Failed to add card to deck'
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
    error.value = err.data?.message || 'Failed to remove card from deck'
  }
}

onMounted(() => {
  loadCards()
})
</script>

<style scoped>
.deck-builder {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.builder-header h2 {
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

.loading, .error-message {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.error-message {
  color: #e74c3c;
}

.builder-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.current-deck, .available-cards {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h3 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.empty-deck, .no-cards {
  text-align: center;
  padding: 2rem;
  color: #95a5a6;
}

.deck-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.deck-card {
  position: relative;
}

.card-mini {
  background: #ecf0f1;
  padding: 1rem;
  border-radius: 4px;
  position: relative;
}

.position-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #3498db;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

.card-mini h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.mini-stats {
  display: flex;
  gap: 1rem;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.remove-btn, .add-btn {
  width: 100%;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.remove-btn {
  background: #e74c3c;
  color: white;
}

.remove-btn:hover {
  background: #c0392b;
}

.add-btn {
  background: #27ae60;
  color: white;
}

.add-btn:hover:not(:disabled) {
  background: #229954;
}

.add-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.deck-stats {
  padding: 1rem;
  background: #3498db;
  color: white;
  border-radius: 4px;
}

.deck-stats .stat {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.deck-stats .stat:last-child {
  border-bottom: none;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 600px;
  overflow-y: auto;
}

.available-card {
  background: #ecf0f1;
  padding: 1rem;
  border-radius: 4px;
}

.available-card h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.card-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.rarity {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
}

.rarity.common {
  background: #95a5a6;
  color: white;
}

.rarity.uncommon {
  background: #27ae60;
  color: white;
}

.rarity.rare {
  background: #3498db;
  color: white;
}

.rarity.epic {
  background: #9b59b6;
  color: white;
}

.rarity.legendary {
  background: #f39c12;
  color: white;
}

@media (max-width: 768px) {
  .builder-content {
    grid-template-columns: 1fr;
  }
}
</style>
