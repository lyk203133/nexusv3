<template>
  <div 
    class="w-full h-[100dvh] bg-black text-slate-200 font-sans flex items-center justify-center bg-fixed overflow-hidden"
    style="background-image: radial-gradient(circle at 50% 120%, #1e293b 10%, #000000 80%)"
  >
    <div class="w-full h-full md:w-[400px] md:h-[92vh] md:max-h-[920px] md:rounded-[3rem] md:border-[8px] md:border-slate-800 bg-slate-900 overflow-hidden relative shadow-2xl flex flex-col transition-all duration-300">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/utils/api'

const authStore = useAuthStore()
let heartbeatTimer = null

// 心跳刷新函数
async function refreshAuthToken() {
  const refreshToken = authStore.refreshToken
  
  if (!refreshToken) {
    console.log('🟡 无 refresh token，跳过刷新')
    return
  }

  try {
    console.log('🔄 正在刷新 token...')
    
    const response = await api.post('/auth/refresh', {
      refresh_token: refreshToken
    }, {
      headers: {
        Authorization: null // 不发送原 token
      }
    })

    if (response.data.success) {
      const { token: newToken, refresh_token: newRefreshToken, user: userData } = response.data.data
      
      // 更新 store 中的 token
      authStore.token = newToken
      authStore.refreshToken = newRefreshToken
      
      // 保存到 localStorage
      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('refresh_token', newRefreshToken)
      
      // 更新 api 默认头部
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      console.log('✅ Token 刷新成功')
    } else {
      console.log('⚠️ Token 刷新失败:', response.data.message)
    }
  } catch (error) {
    console.log('❌ 刷新 token 出错:', error.message)
  }
}

// 启动心跳
function startHeartbeat() {
  // 每分钟检查一次是否需要刷新
  heartbeatTimer = setInterval(() => {
    if (authStore.isAuthenticated) {
      refreshAuthToken()
    }
  }, 15000) // 15秒
}

// 停止心跳
function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

// 初始化
onMounted(() => {
  console.log('onMounted')
  // 如果用户已登录，启动心跳
  if (authStore.isAuthenticated) {
    //startHeartbeat()
  }
})

// 清理
onUnmounted(() => {
  console.log('stop heartbeat')
  stopHeartbeat()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>