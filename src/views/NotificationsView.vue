<template>
  <div class="flex flex-col h-full bg-slate-900">
    <div class="p-4 flex items-center justify-between bg-slate-800 border-b border-slate-700 shadow-lg z-10">
      <div class="flex items-center">
        <button @click="$router.push('/dashboard')" class="p-2 mr-2 hover:bg-slate-700 rounded-full">
          <ArrowLeft class="text-white" :size="20" />
        </button>
        <h2 class="text-white font-bold text-lg">{{ t.notification.title }}</h2>
        <span v-if="unreadCount > 0" class="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
          {{ unreadCount }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click="markAllRead" 
          class="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 rounded-full" 
          :title="t.notification.markAll"
          :disabled="loading || unreadCount === 0"
        >
          <CheckCheck :size="18" />
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
      <p class="text-slate-400 text-sm">{{ t.common.loading }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-12 px-4">
      <div class="text-rose-500 mb-3 text-center">{{ error }}</div>
      <button 
        @click="fetchNotifications"
        class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
      >
        {{ t.common.retry }}
      </button>
    </div>

    <div v-else class="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
      <div v-if="notifications.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-600">
        <Bell :size="40" class="mb-2 opacity-50" />
        <p>{{ t.notification.empty }}</p>
      </div>
      
      <div 
        v-for="note in notifications" 
        :key="note.id" 
        :class="`bg-slate-800/50 border rounded-xl p-4 relative group hover:bg-slate-800 transition-all cursor-pointer ${note.is_read ? 'border-slate-800' : 'border-slate-700'}`"
        @click="handleNotificationClick(note)"
      >
        <div v-if="!note.is_read" class="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
        <div class="flex gap-4">
          <div class="mt-1">
            <component :is="getIcon(note.type)" :class="getIconColor(note.type)" :size="20" />
          </div>
          <div class="flex-1">
            <h3 :class="`font-bold text-sm mb-1 ${note.is_read ? 'text-slate-400' : 'text-white'}`">
              {{ getTypeTitle(note.type) }}
            </h3>
            <p class="text-xs text-slate-400 mb-2 leading-relaxed">{{ note.content }}</p>
            <div class="flex justify-between items-center">
              <span class="text-[10px] text-slate-500">{{ formatTime(note.created_at) }}</span>
              <div class="flex gap-3">
                <button 
                  v-if="!note.is_read" 
                  @click.stop="markOneRead(note.id)" 
                  class="flex items-center text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors"
                  :disabled="markingAsRead === note.id"
                >
                  <Check :size="12" class="mr-1" />
                  <span v-if="markingAsRead === note.id">{{ t.common.processing }}</span>
                  <span v-else>{{ t.notification.markRead }}</span>
                </button>
              </div>
            </div>
            
            <!-- Metadata -->
            <div v-if="note.related_id" class="mt-3 pt-3 border-t border-slate-700/30">
              <div class="flex flex-wrap gap-2">
                <span 
                  class="text-[10px] px-2 py-0.5 bg-slate-900/50 rounded text-slate-400"
                >
                  關聯ID: {{ note.related_id }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Load More Button -->
      <div v-if="hasMore" class="text-center mt-4">
        <button 
          @click="loadMore"
          class="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-sm"
          :disabled="loadingMore"
        >
          <span v-if="loadingMore">{{ t.common.loading }}...</span>
          <span v-else>{{ t.common.loadMore }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Bell, CheckCheck, Check, CheckCircle, Clock, AlertTriangle, DollarSign, Upload, FileCheck, AlertCircle } from 'lucide-vue-next'
import { useTranslation } from '@/composables/useTranslation'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/utils/api'
import { showToast } from '@/utils/notification'

const router = useRouter()
const { t } = useTranslation()
const authStore = useAuthStore()

// State
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const markingAsRead = ref(null)

// Data
const notifications = ref([])
const filters = ref({
  page: 1,
  limit: 20
})
const hasMore = ref(true)

// Computed
const unreadCount = computed(() => {
  return notifications.value.filter(note => note.is_read === 0).length
})

// Methods
async function fetchNotifications(reset = true) {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (reset) {
    loading.value = true
    filters.value.page = 1
    hasMore.value = true
  } else {
    loadingMore.value = true
  }
  
  error.value = ''

  try {
    const params = {
      page: filters.value.page,
      limit: filters.value.limit
    }

    const response = await api.get('/notifications', { params })
    
    if (response.data.success) {
      const data = response.data.data
      
      if (reset) {
        notifications.value = data.notifications || []
      } else {
        notifications.value = [...notifications.value, ...(data.notifications || [])]
      }
      
      // Check if has more data
      const total = data.pagination?.total_items || 0
      const loaded = notifications.value.length
      hasMore.value = loaded < total
    } else {
      error.value = response.data.message || t.common.requestFailed
    }
  } catch (err) {
    console.error('Fetch notifications error:', err)
    error.value = err.response?.data?.message || err.message || t.common.networkError
    
    if (err.response?.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  
  filters.value.page++
  await fetchNotifications(false)
}

async function markAllRead() {
  if (unreadCount.value === 0) return

  try {
    const response = await api.post('/notifications/mark-all-read')
    
    if (response.data.success) {
      showToast({
        type: 'success',
        title: t.notification.markAllSuccess,
        message: t.notification.allMarkedAsRead
      })
      
      // Update local state
      notifications.value = notifications.value.map(note => ({
        ...note,
        is_read: 1
      }))
    } else {
      showToast({
        type: 'error',
        title: t.notification.markAllFailed,
        message: response.data.message || t.common.requestFailed
      })
    }
  } catch (err) {
    console.error('Mark all read error:', err)
    showToast({
      type: 'error',
      title: t.notification.markAllFailed,
      message: err.response?.data?.message || t.common.networkError
    })
  }
}

async function markOneRead(id) {
  markingAsRead.value = id

  try {
    const response = await api.post(`/notifications/${id}/read`)
    
    if (response.data.success) {
      // Update local state
      const index = notifications.value.findIndex(note => note.id === id)
      if (index !== -1) {
        notifications.value[index].is_read = 1
        notifications.value[index].read_at = new Date().toISOString()
      }
    } else {
      showToast({
        type: 'error',
        title: t.notification.markOneFailed,
        message: response.data.message || t.common.requestFailed
      })
    }
  } catch (err) {
    console.error('Mark one read error:', err)
    showToast({
      type: 'error',
      title: t.notification.markOneFailed,
      message: err.response?.data?.message || t.common.networkError
    })
  } finally {
    markingAsRead.value = null
  }
}

function handleNotificationClick(note) {
  // Mark as read if not already read
  if (note.is_read === 0) {
    markOneRead(note.id)
  }
  
  // Handle click based on notification type
  switch (note.type) {
    case 'CONTINUOUS_FAILURE':
      // 連續失敗通知
      router.push('/transaction-history')
      break
      
    case 'MERCHANT_PAYOUT':
      // 商家出款通知
      router.push('/my-wallet')
      break
      
    case 'BUY_ORDER':
      // 購買訂單通知
      router.push('/trade-buy')
      break
      
    case 'QR_UPLOAD':
      // 上傳QR碼通知
      router.push('/points-mall')
      break
      
    case 'KYC_REVIEW':
      // KYC審核通知
      router.push('/profile')
      break
      
    case 'UNREVIEWED_ORDER':
      // 未審核訂單通知
      router.push('/transaction-history')
      break
      
    default:
      break
  }
}

function getIcon(type) {
  switch (type) {
    case 'CONTINUOUS_FAILURE': return AlertCircle
    case 'MERCHANT_PAYOUT': return DollarSign
    case 'BUY_ORDER': return CheckCircle
    case 'QR_UPLOAD': return Upload
    case 'KYC_REVIEW': return FileCheck
    case 'UNREVIEWED_ORDER': return AlertTriangle
    default: return Bell
  }
}

function getIconColor(type) {
  switch (type) {
    case 'CONTINUOUS_FAILURE': return 'text-rose-400'
    case 'MERCHANT_PAYOUT': return 'text-emerald-400'
    case 'BUY_ORDER': return 'text-blue-400'
    case 'QR_UPLOAD': return 'text-yellow-400'
    case 'KYC_REVIEW': return 'text-purple-400'
    case 'UNREVIEWED_ORDER': return 'text-orange-400'
    default: return 'text-slate-400'
  }
}

function getTypeTitle(type) {
  const typeMap = {
    'CONTINUOUS_FAILURE': '連續交易失敗',
    'MERCHANT_PAYOUT': '商家出款通知',
    'BUY_ORDER': '購買訂單通知',
    'QR_UPLOAD': 'QR碼上傳通知',
    'KYC_REVIEW': 'KYC審核通知',
    'UNREVIEWED_ORDER': '未審核訂單'
  }
  return typeMap[type] || type
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return t.notification.justNow
  if (diffMins < 60) return `${diffMins}${t.notification.minutesAgo}`
  if (diffHours < 24) return `${diffHours}${t.notification.hoursAgo}`
  if (diffDays < 7) return `${diffDays}${t.notification.daysAgo}`
  
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

// Lifecycle
onMounted(() => {
  fetchNotifications(true)
})

// Optional: Auto-refresh notifications every 30 seconds
if (typeof document !== 'undefined') {
  setInterval(() => {
    if (document.visibilityState === 'visible' && authStore.isAuthenticated) {
      fetchNotifications(true)
    }
  }, 30000) // 30 seconds
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>