<template>
  <div class="flex flex-col h-full bg-slate-900">
    <div class="p-4 flex items-center justify-between bg-slate-800 border-b border-slate-700 shadow-lg z-20">
      <div class="flex items-center">
        <button @click="handleBack" class="p-2 mr-2 hover:bg-slate-700 rounded-full">
          <ArrowLeft class="text-white" :size="20" />
        </button>
        <div>
          <h2 class="text-white font-bold text-lg">{{ t.common.inviteBonus}}</h2>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <!-- Filter Button -->
        <button 
          @click="showFilter = !showFilter"
          class="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-white border border-slate-600"
        >
          <Filter :size="14" />
          <span>{{ t.history.filter }}</span>
        </button>
        <!-- Export Button -->
         
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !transactions.length" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
      <p class="text-slate-400 text-sm">{{ t.common.loading }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !transactions.length" class="flex flex-col items-center justify-center py-12 px-4">
      <div class="text-rose-500 mb-3 text-center">{{ error }}</div>
      <button 
        @click="fetchTransactions"
        class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
      >
        {{ t.common.retry }}
      </button>
    </div>

    <div class="flex-1 overflow-y-auto no-scrollbar">
      <!-- Filter Panel -->
      <div v-if="showFilter" class="bg-slate-800/80 p-4 border-b border-slate-700">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
           
          <div>
            <label class="text-xs text-slate-400 mb-1 block">{{ t.history.startDate }}</label>
            <input 
              type="date" 
              v-model="filters.startDate"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
            />
          </div>
          <div>
            <label class="text-xs text-slate-400 mb-1 block">{{ t.history.endDate }}</label>
            <input 
              type="date" 
              v-model="filters.endDate"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
            />
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button 
            @click="setYesterday"
            class="px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            {{ t.common.yesterday }}
          </button>
          <button 
            @click="setToday"
            class="px-4 py-2 text-sm text-slate-400 hover:text-white"
          > {{ t.common.today }}
          </button>

          <button 
            @click="resetFilters"
            class="px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            {{ t.common.cancel }}
          </button>
          <button 
            @click="applyFilters"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg"
          >
            {{ t.common.confirm }}
          </button>
        </div>
      </div>

      <!-- Statistics -->
      <div class="bg-slate-800/50 p-4 grid grid-cols-4 gap-4 border-b border-slate-700">
        <div class="flex flex-col">
          <span class="text-[10px] text-slate-400 mb-1">{{ t.history.stats.count }}</span>
          <span class="text-lg font-mono font-bold text-blue-400">{{ stats.totalCount || 0 }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-[10px] text-slate-400 mb-1">{{ t.history.stats.points }}</span>
          <span class="text-lg font-mono font-bold text-white">{{ (stats.totalAmount || 0).toLocaleString() }}</span>
        </div>
        
      </div>
      
      <!-- Transactions List -->
      <div v-if="!loading && transactions.length === 0" class="flex flex-col items-center justify-center py-12">
        <div class="text-slate-500 mb-3">{{ t.history.noData }}</div>
        <button 
          @click="fetchTransactions"
          class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          {{ t.common.refresh }}
        </button>
      </div>

      <div v-else class="p-4">
        <!-- Loading more indicator -->
        <div v-if="loadingMore" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>

        <!-- Transactions -->
        <div class="bg-slate-800 rounded-xl border border-slate-700/50 overflow-hidden">
  <!-- 表格頭 -->
  <div class="grid grid-cols-4 gap-2 p-4 bg-slate-900/50 border-b border-slate-700/50 text-xs font-bold text-slate-400">
    <div>{{ t.common.orderNo }}</div>
    <div>{{ t.profile.account }}</div>
    <div>{{ t.common.amount }}</div>
    <div>{{ t.common.inviteBonus }}</div>
  </div>
  
  <!-- 表格內容 -->
  <div class="divide-y divide-slate-700/50">
    <div 
      v-for="tx in transactions" 
      :key="tx.id"
      class="grid grid-cols-4 gap-2 p-4 hover:bg-slate-700/30 transition-colors cursor-pointer items-center"
    >
      <!-- 編號 -->
      <div>
        <div class="flex items-center gap-4" style="word-break: break-all;">
          <span class="text-xs font-mono text-emerald-400" @click="copySymbol(tx.order_no)">{{ tx.order_no || tx.id }}</span>
          
        </div>
        <p class="text-xs text-slate-500 mt-1">{{ formatDate(tx.completed_at) }}</p>
      </div>
      
      <!-- 帳號 -->
      <div class="text-sm text-white" style="word-break: break-all;">
        {{ tx.username || tx.target_id || '-' }}
      </div>
      
      <!-- 金額 -->
      <div style="word-break: break-all;">
        <span class="font-mono text-emerald-400 font-bold">
          {{ tx.amount_points.toLocaleString() }}
        </span>
         
      </div>
      
      <!-- 邀請碼紅利 -->
      <div style="word-break: break-all;">
        <span class="font-mono text-emerald-400 font-bold">
          {{ tx.inviteBonus.toLocaleString() }}
        </span>
       
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
 
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download, Filter, X } from 'lucide-vue-next'
import { useTranslation } from '@/composables/useTranslation'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/utils/api'
import { showToast } from '@/utils/notification'
const route = useRoute()
const router = useRouter()
 
const { t } = useTranslation()
const authStore = useAuthStore()

// State
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const showFilter = ref(false)
const showDetailModal = ref(false)
const selectedTransaction = ref(null)

// Data
const viewUserId = route.query.userId
const transactions = ref([])
const stats = ref({})
const pagination = ref({})
const filters = ref({
  type: 'all',
  status: 'all',
  startDate: '',
  endDate: '',
  viewUserId:viewUserId,
  page: 1,
  limit: 15
})
const hasMore = ref(true)

// Methods
async function fetchTransactions(reset = true) {
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
    // Prepare query params
    const params = {
      page: filters.value.page,
      limit: filters.value.limit,
      viewUserId:viewUserId
    }
    
    // Add filters if not 'all'
    if (filters.value.type !== 'all') {
      params.type = filters.value.type
    }
    
    if (filters.value.status !== 'all') {
      params.status = filters.value.status
    }
    
    if (filters.value.startDate) {
      params.start_date = filters.value.startDate
    }
    
    if (filters.value.endDate) {
      params.end_date = filters.value.endDate
    }

    const response = await api.get('/user/invite-code-bonus', { params })
    
    if (response.data.success) {
      const data = response.data.data
      
      if (reset) {
        transactions.value = data.orders || []
        stats.value = data.stats || {}
      } else {
        const combined = [...transactions.value, ...(data.orders || [])];
        transactions.value = [...new Map(combined.map(item => 
          [item.id, item] // 假設每個項目有唯一 id
        )).values()];
      }
      
      // Check if has more data
      const total = data.stats?.totalCount || 0
      const loaded = transactions.value.length
      hasMore.value =  data.pagination.has_more;// loaded < total
      
      // Update stats
      if (reset) {
        stats.value = data.stats || {}
      }
    } else {
      error.value = response.data.message || t.value.common.requestFailed
    }
  } catch (err) {
    console.error('Fetch transactions error:', err)
    error.value = err.response?.data?.message || err.message || t.value.common.networkError
    
    // If token expired, redirect to login
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
  await fetchTransactions(false)
}

function applyFilters() {
  showFilter.value = false
  transactions.value =[]
  fetchTransactions(true)
}

function resetFilters() {
  transactions.value =[]
  filters.value = {
    type: 'all',
    status: 'all',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  }
  fetchTransactions(true)
}


function setYesterday() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  
  filters.value.startDate = `${year}-${month}-${day}`;
  filters.value.endDate = `${year}-${month}-${day}`;

   filters.value = { ...filters.value };
}

function setToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  filters.value.startDate = `${year}-${month}-${day}`;
  filters.value.endDate = `${year}-${month}-${day}`;
   filters.value = { ...filters.value };
}

  

function handleBack() {
  router.push('/invite-code-bonus')
}

function formatDate(dateString) {
  if (!dateString) return '--'
  const date = new Date(dateString)
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatDateTime(dateString) {
  if (!dateString) return '--'
  const date = new Date(dateString)
  return date.toLocaleString([], { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
 
// Lifecycle
let intervalId = null;
onMounted(() => {
  fetchTransactions(true)
  intervalId = setInterval(async ()=>{
    await fetchTransactions(true)
  },5000)
})

onUnmounted(()=>{
  if(intervalId)clearInterval(intervalId);
})

// Optional: Auto-refresh when page becomes visible
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && authStore.isAuthenticated) {
      fetchTransactions(true)
    }
  })
}

function copySymbol(symbol) {
  navigator.clipboard.writeText(symbol)
    .then(() => alert('copy: ' + symbol))
    .catch(err => {
      // 降級方案
      const textArea = document.createElement('textarea');
      textArea.value = symbol;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('copy: ' + symbol);
    });
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