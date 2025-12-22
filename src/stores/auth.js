import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user_info') || 'null'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    loading.value = true
    error.value = null
    
    try {
      // 使用 api.post 而不是 axios.post
      const response = await api.post('/auth/login', credentials)
      
      if (response.data.success) {
        const { token: authToken, user: userData } = response.data.data
        
        // 保存 token 和用户信息
        token.value = authToken
        user.value = userData
        
        // 存储到 localStorage
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('user_info', JSON.stringify(userData))
        
        return true
      } else {
        error.value = response.data.message || '登录失败'
        return false
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || '网络错误，请稍后重试'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
    // 清除 axios 默认头部
    delete api.defaults.headers.common['Authorization']
  }

  function updateUserInfo(userData) {
    user.value = userData
    localStorage.setItem('user_info', JSON.stringify(userData))
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    updateUserInfo
  }
})