<template>
  <div class="login-form">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="login">Email or Username</label>
        <input
          id="login"
          v-model="formData.login"
          type="text"
          placeholder="Enter email or username"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="formData.password"
          type="password"
          placeholder="Enter password"
          required
          minlength="8"
        />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>

    <p class="switch-form">
      Don't have an account? 
      <a @click="$emit('switch-to-register')">Register here</a>
    </p>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['login-success', 'switch-to-register'])

const formData = ref({
  login: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: formData.value,
    })

    if (response.success) {
      emit('login-success', response.user)
    } else {
      error.value = 'Login failed. Please try again.'
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #34495e;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #3498db;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #2980b9;
}

button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.error-message {
  padding: 0.75rem;
  background: #fee;
  color: #c00;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.switch-form {
  text-align: center;
  margin-top: 1rem;
  color: #7f8c8d;
}

.switch-form a {
  color: #3498db;
  cursor: pointer;
  text-decoration: underline;
}

.switch-form a:hover {
  color: #2980b9;
}
</style>
