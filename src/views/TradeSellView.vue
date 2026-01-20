<template>
  <div class="flex flex-col h-full bg-slate-900">
    <div class="p-4 flex items-center bg-slate-800 shadow-lg">
      <button @click="$router.push('/dashboard')" class="p-2 mr-2">
        <ArrowLeft class="text-white" />
      </button>
      <h2 class="text-rose-400 font-bold text-lg">{{ t.trade.sellTitle }}</h2>
    </div>
    <div class="flex-1 p-6 flex flex-col items-center justify-center">
      <div class="text-center w-full max-w-xs">
        <div class="w-24 h-24 mx-auto mb-6 relative">
          <div class="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
        <h3 class="text-white font-bold text-xl mb-2">{{ t.trade.waitingMerchant }}</h3>
        <p class="text-slate-400 text-sm mb-6">{{ t.trade.lockSuccess }}</p>
        <NeonButton fullWidth @click="$router.push('/dashboard')">{{ t.trade.backHome }}</NeonButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import NeonButton from '@/components/NeonButton.vue'
import { useTranslation } from '@/composables/useTranslation' 
import { api } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const { t } = useTranslation()

// 定時器變數
let timer = null

// Get order ID from route
const orderId = route.query.id

// 獲取狀態的函數
async function checkStatus() {
  
  try {
    const response = await api.get(`/orders?id=${orderId}`)
    
    if (response.data.success && response.data.data.status == 2) {
      alert('交易成功')
      router.push('/dashboard')
      
    } 
  } catch (err) {
    console.error('Fetch order error:', err)
  } finally {
    // 無論成功或失敗，都設定下一次 10 秒後的執行
    // 這樣可以保證在組件還掛載時持續執行
    startPolling()
  }
}

// 開始輪詢
const startPolling = () => {
  // 清除舊的避免重複
  if (timer) clearTimeout(timer)
  
  timer = setTimeout(() => {
    checkStatus()
  }, 10000) // 10000 毫秒 = 10 秒
}

onMounted(() => {
  // 組件掛載後立即執行第一次檢查
  checkStatus()
})

onUnmounted(() => {
  // 組件卸載時務必清除定時器，防止記憶體洩漏與背景請求
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
})
</script>

