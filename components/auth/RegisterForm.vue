<template>
  <div class="register-form">
    <h2>Register</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          placeholder="Enter your email"
          required
        />
      </div>

      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="formData.username"
          type="text"
          placeholder="Choose a username (3-20 chars)"
          required
          minlength="3"
          maxlength="20"
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="formData.password"
          type="password"
          placeholder="Choose a password (min 8 chars)"
          required
          minlength="8"
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="formData.confirmPassword"
          type="password"
          placeholder="Confirm your password"
          required
          minlength="8"
        />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Creating Account...' : 'Register' }}
      </button>
    </form>

    <p class="switch-form">
      Already have an account? 
      <a @click="$emit('switch-to-login')">Login here</a>
    </p>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['register-success', 'switch-to-login'])

const formData = ref({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  loading.value = true
  error.value = ''

  // Validate passwords match
  if (formData.value.password !== formData.value.confirmPassword) {
    error.value = 'Passwords do not match'
    loading.value = false
    return
  }

  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        email: formData.value.email,
        username: formData.value.username,
        password: formData.value.password,
      },
    })

    if (response.success) {
      emit('register-success', response.user)
    } else {
      error.value = 'Registration failed. Please try again.'
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-form {
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
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #229954;
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
