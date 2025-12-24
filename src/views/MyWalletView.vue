<template>
  <div class="flex flex-col h-full bg-slate-900">
    <div class="p-4 flex items-center bg-slate-800 shadow-lg z-10">
      <button @click="$router.push('/dashboard')" class="p-2 mr-2">
        <ArrowLeft class="text-white" />
      </button>
      <div>
        <h2 class="text-white font-bold text-lg">{{ t.wallet.title }}</h2>
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
        @click="fetchWalletData"
        class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
      >
        {{ t.common.retry }}
      </button>
    </div>
    
    <!-- Content -->
    <div v-else class="flex-1 overflow-y-auto p-5 pb-24 no-scrollbar">
      <!-- Balance Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
          <p class="text-slate-400 text-xs font-bold mb-1">{{ t.dashboard.avail }}</p>
          <h3 class="text-2xl font-mono font-bold text-blue-400 mb-2">
            {{ walletData.balance ? parseFloat(walletData.balance).toLocaleString() : '0' }}
          </h3>
        </div>
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
          <p class="text-slate-400 text-xs font-bold mb-1">{{ t.dashboard.frozen }}</p>
          <h3 class="text-2xl font-mono font-bold text-white mb-2">
            {{ walletData.frozen_balance ? parseFloat(walletData.frozen_balance).toLocaleString() : '0' }}
          </h3>
        </div>
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
          <p class="text-slate-400 text-xs font-bold mb-1">{{ t.dashboard.assets }}</p>
          <h3 class="text-2xl font-mono font-bold text-white mb-2">
            {{ totalAssets.toLocaleString() }}
          </h3>
        </div>
      </div>
      
      <!-- Statistics -->
      <div class="grid grid-cols-2 gap-3 mb-6">
        <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
          <span class="text-xs text-slate-400">{{ t.wallet.totalDeposit }}</span><br/>
          <span class="text-lg font-mono font-bold text-emerald-400">
            +{{ (walletData.totalDeposit || 0).toLocaleString() }}
          </span>
        </div>
        <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
          <span class="text-xs text-slate-400">{{ t.wallet.totalWithdraw }}</span><br/>
          <span class="text-lg font-mono font-bold text-rose-400">
            {{ (walletData.totalWithdraw || 0).toLocaleString() }}
          </span>
        </div>
        <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700 col-span-2 flex justify-between items-center">
          <span class="text-xs text-slate-400">{{ t.wallet.totalFees }}</span>
          <span class="text-lg font-mono font-bold text-white">
            {{ (walletData.totalFees || 0).toLocaleString() }}
          </span>
        </div>
      </div>
      
     
      <!-- Action Buttons -->
      <div class="space-y-3">
        <button 
          @click="$router.push('/withdraw')" 
          class="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 transition-all"
        >
          <ArrowUpRight :size="20" /> {{ t.wallet.withdraw }}
        </button>
        <button 
          @click="$router.push('/points-mall')" 
          class="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-slate-300 font-bold flex items-center justify-center gap-2 transition-all"
        >
          <ArrowDownLeft :size="20" class="text-emerald-400" /> {{ t.wallet.deposit }}
        </button>
      </div>
      
      <!-- Recent Transactions -->
      <div v-if="recentTransactions.length > 0" class="mt-8">
        <h3 class="text-white font-bold mb-3 flex items-center">
          <span class="w-1 h-3 bg-blue-500 mr-2 rounded-full"></span>
          {{ t.wallet.recentTransactions }}
        </h3>
        <div class="space-y-2">
          <div 
            v-for="transaction in recentTransactions" 
            :key="transaction.id"
            class="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="text-white font-bold text-sm">{{ transaction.type }}</div>
                <div class="text-xs text-slate-400">{{ formatDate(transaction.created_at) }}</div>
              </div>
              <div :class="`text-lg font-mono font-bold ${transaction.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`">
                {{ transaction.amount >= 0 ? '+' : '' }}{{ transaction.amount.toLocaleString() }}
              </div>
            </div>
            <div v-if="transaction.remark" class="text-xs text-slate-500 mt-2">
              {{ transaction.remark }}
            </div>
          </div>
        </div>
        <button 
          @click="$router.push('/transaction-history')" 
          class="w-full mt-3 py-2 text-center text-sm text-slate-400 hover:text-white transition-colors"
        >
          {{ t.wallet.viewAll }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-vue-next'
import { useTranslation } from '@/composables/useTranslation'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/utils/api'

const router = useRouter()
const { t } = useTranslation()
const authStore = useAuthStore()

// State
const loading = ref(false)
const error = ref('')
const walletData = ref({})
const todayStats = ref({})
const recentTransactions = ref([])

// Computed
const totalAssets = computed(() => {
  const balance = parseFloat(walletData.value.balance || 0)
  const frozenBalance = parseFloat(walletData.value.frozen_balance || 0)
  return balance + frozenBalance
})

// Methods
async function fetchWalletData() {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Fetch wallet data
    const walletResponse = await api.get('/wallet')
    
    if (walletResponse.data.success) {
      const data = walletResponse.data.data
      walletData.value = data.wallet || {}
      todayStats.value = data.todayStats || {}
      
      // Add missing properties with default values
      walletData.value = {
        balance: '0',
        frozen_balance: '0',
        totalDeposit: 0,
        totalWithdraw: 0,
        totalFees: 0,
        ...walletData.value
      }
      
      todayStats.value = {
        buy: 0,
        buyRate: 0,
        sell: 0,
        sellRate: 0,
        ...todayStats.value
      }
      
      // Fetch recent transactions
      //await fetchRecentTransactions()
    } else {
      error.value = walletResponse.data.message || t.common.requestFailed
    }
  } catch (err) {
    console.error('Fetch wallet data error:', err)
    error.value = err.response?.data?.message || err.message || t.common.networkError
    
    // If token expired, redirect to login
    if (err.response?.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

async function fetchRecentTransactions() {
  try {
    const response = await api.get('/wallet/transactions', {
      params: {
        limit: 5,
        page: 1
      }
    })
    
    if (response.data.success) {
      recentTransactions.value = response.data.data.transactions || []
    }
  } catch (err) {
    console.error('Fetch transactions error:', err)
    // Don't show error for transactions, just log it
  }
}

function formatDate(dateString) {
  if (!dateString) return '--'
  
  const date = new Date(dateString)
  
  // Check if it's today
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }
}

// Lifecycle
onMounted(() => {
  fetchWalletData()
})

// Optional: Refresh data when page becomes visible
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && authStore.isAuthenticated) {
      fetchWalletData()
    }
  })
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