<template>
  <div class="max-w-md w-full mx-auto bg-white rounded-lg shadow-xl p-8">
    <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Đăng Nhập Trang Quan</h2>
    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label for="login" class="block text-sm font-medium text-gray-700 mb-1">
          Danh Hiệu hoặc Thư Tín
        </label>
        <input
          id="login"
          v-model="formData.login"
          type="text"
          placeholder="Nhập danh hiệu hoặc thư tín"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        />
      </div>
      
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          Ấn Tín Mật
        </label>
        <input
          id="password"
          v-model="formData.password"
          type="password"
          placeholder="Nhập ấn tín mật"
          required
          minlength="8"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        />
      </div>

      <div v-if="error" class="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
        {{ error }}
      </div>

      <button 
        type="submit" 
        :disabled="loading"
        class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {{ loading ? 'Đang xác thực...' : 'Tiến Vào Triều Đình' }}
      </button>
    </form>

    <p class="text-center mt-6 text-gray-600 text-sm">
      Chưa có trang quan? 
      <a @click="$emit('switch-to-register')" class="text-purple-600 hover:text-purple-800 cursor-pointer underline">
        Đăng ký ngay
      </a>
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


