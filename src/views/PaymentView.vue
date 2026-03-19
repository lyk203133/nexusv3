<template>
  <div class="flex flex-col h-full bg-slate-900">
    <div class="p-4 flex items-center bg-slate-800 shadow-lg z-10">
      <button  class="p-2 mr-2">
         
      </button>
      <h2 class="text-white font-bold text-lg">{{ t.trade.cashier }}</h2>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
      <p class="text-slate-400 text-sm">{{ t.common.loading }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center p-5">
      <div class="text-rose-500 mb-3 text-center">{{ error }}</div>
      <button 
        @click="fetchOrder"
        class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
      >
        {{ t.common.retry }}
      </button>
    </div>

    <!-- Order Content -->
    <div v-else-if="order" class="flex-1 overflow-y-auto p-5 pb-24 no-scrollbar">
      <!-- Time Counter -->
      <div class="bg-rose-900/30 border border-rose-500/50 rounded-lg p-3 flex items-center justify-between mb-6">
        <div class="flex items-center text-rose-400">
          <Clock :size="18" class="mr-2" />
          <span class="text-sm font-bold">{{ t.trade.timeLeft }}</span>
        </div>
        <div class="font-mono text-xl font-bold text-rose-500">{{ formatTime(timeLeft) }}</div>
      </div>
      
      <p class="text-xs text-center text-slate-500 mb-6">{{ t.trade.tips }}</p>
      
      <!-- Order Info Card -->
      <Card class="flex flex-col items-center mb-6">
        <!-- QR Code Section -->
        <div class="w-48 h-48 bg-white p-2 rounded-lg mb-4">
          <div class="w-full h-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
            <!-- QR Code Placeholder -->
            <div v-if="order.payment_qr_url" class="w-full h-full">
              <img :src="order.payment_qr_url" alt="QR Code"  crossorigin="anonymous" class="w-full h-full object-contain"  ref="qrImage" />
            </div>
            <div v-else class="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-1 p-2 opacity-80">
              <div 
                v-for="i in 36" 
                :key="i" 
                :class="`bg-black ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`"
              />
            </div>
            <div v-if="!order.payment_qr_url" class="z-10 bg-white p-1 rounded">
              <Wallet class="text-black" />
            </div>
          </div>
        </div>

        <!-- 保存按钮 -->
        <button 
          v-if="order.payment_qr_url "
           
          class="save-btn"
          :disabled="isSaving"
        >
          <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
          </svg>
          {{ isSaving ? 'save...' : t.trade.saveQR }}
        </button>
        
        <!-- Order Details -->
        <div class="w-full space-y-3">
          <!-- Bank Information -->
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">{{ t.trade.bankName }}</span>
            <span class="text-white font-mono">{{ order.payment.bank_name || '--' }}</span>
          </div>
          
          <!--div class="flex justify-between text-sm">
            <span class="text-slate-400">{{ t.trade.bankCode }}</span>
            <span class="text-white font-mono">{{ order.payment.bank_code || '--' }}</span>
          </div-->
          
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">{{ t.trade.bankAcc }}</span>
            <span class="text-white font-mono">{{ order.payment.bank_account || order.payment.account_number || '--' }}</span>
          </div>
          
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">{{ t.trade.accountName }}</span>
            <span class="text-white font-mono">{{ order.payment.account_name || '--' }}</span>
          </div>
          
          <!-- Amount -->
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">{{ t.trade.amount }}</span>
            <span class="text-emerald-400 font-mono font-bold">$ {{ formatAmount(order.amount_points) }}</span>
          </div>
          
          <!-- Order Reference/Memo -->
          <div class="bg-slate-900 p-2 rounded text-center">
            <span class="text-slate-500 text-xs block mb-1">{{ t.trade.memo }}</span>
            <span class="text-rose-500 font-mono font-bold text-lg select-all">{{ order.payment_ref_code || order.payment.content || 'TX9988' }}</span>
          </div>
          
          <!-- Order Status & Info -->
          <div v-if="order.status" class="mt-4 pt-4 border-t border-slate-700 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">{{ t.common.status }}</span>
              <span :class="`font-bold ${getStatusColor(order.status)}`">
                {{ getStatusText(order.status) }}
              </span>
            </div>
            
            <div v-if="order.created_at" class="flex justify-between text-sm">
              <span class="text-slate-400">{{ t.trade.createAt }}</span>
              <span class="text-slate-300">{{ formatDateTime(order.created_at) }}</span>
            </div>
            
            <div v-if="order.expires_at" class="flex justify-between text-sm">
              <span class="text-slate-400">{{ t.trade.expiresAt }}</span>
              <span class="text-rose-400">{{ formatDateTime(order.expires_at) }}</span>
            </div>
          </div>
        </div>
      </Card>
      
      
      <!-- Confirm Button -->
      <NeonButton 
        fullWidth 
        @click="handleComplete"
         
      >
        {{ t.trade.confirmPaid }}
      </NeonButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Clock, Wallet, Camera } from 'lucide-vue-next'
import Card from '@/components/Card.vue'
import NeonButton from '@/components/NeonButton.vue'
import { useTranslation } from '@/composables/useTranslation'
import { api } from '@/utils/api'
import { showToast } from '@/utils/notification'

const route = useRoute()
const router = useRouter()
const { t } = useTranslation()

// State
const loading = ref(true)
const error = ref('')
const order = ref(null)
const timeLeft = ref(180)
const receiptImage = ref(null)
const fileInput = ref(null)

let timer = null

// Get order ID from route
const orderId = route.query.order_no
let intervalId = null;


const qrImage = ref(null);
const isSaving = ref(false);
const isLoading = ref(true);
const imageLoaded = ref(false);
const imageError = ref(false);
const saveFailed = ref(false);

// Methods
async function fetchOrder(isloading = true) {
  if(isloading)loading.value = true
  error.value = ''
  
  try {
    const response = await api.get(`/third/order?order_no=${orderId}`)
    
    if (response.data.success) {
      order.value = response.data.data
      
      // Calculate time left if expires_at is available
      if (order.value.expires_at) {
        const expires = new Date(order.value.expires_at)
        const now = new Date()
        timeLeft.value = Math.max(0, Math.floor((expires - now) / 1000))
      }
    } else {
      error.value = response.data.message || t.value.common.requestFailed
    }
  } catch (err) {
    console.error('Fetch order error:', err)
    error.value = err.response?.data?.message || err.message || t.value.common.networkError
  } finally {
    if(isloading)loading.value = false
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function formatAmount(amount) {
  if (!amount) return '0'
  return parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
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

function getStatusColor(status) {
  const colors = {
    pending: 'text-yellow-400',
    paid: 'text-emerald-400',
    completed: 'text-emerald-400',
    expired: 'text-rose-400',
    cancelled: 'text-slate-400',
    failed: 'text-rose-500'
  }
  return colors[status] || 'text-white'
}

function getStatusText(status) {
  return t.value.mall.status[status] || status
}
 

function triggerFileInput() {
  fileInput.value.click()
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // 驗證文件類型
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', "image/heic", "image/heif", "image/pjpeg", "image/x-png", "image/bmp"]
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!validTypes.includes(file.type)) {
    showToast({
      type: 'error',
      title: t.value.common.error || '錯誤',
      message: t.value.trade.invalidImageType || '不支援的圖片格式'
    })
    return
  }

  if (file.size > maxSize) {
    showToast({
      type: 'error',
      title: t.value.common.error || '錯誤',
      message: (t.value.trade.fileTooLarge || '檔案太大') + ' (最大 10MB)'
    })
    return
  }

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    receiptImage.value = e.target.result
  }
  reader.readAsDataURL(file)

  // Reset file input
  event.target.value = ''
}

function removeReceipt() {
  receiptImage.value = null
}

async function handleComplete() {
   history.back()
}

// Helper function to convert data URL to Blob
function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new Blob([u8arr], { type: mime })
}

// 保存二维码的主要方法
const saveQRCode = async () => {
  if (!order.value.payment_qr_url  ) {
    alert('二维码未加载完成');
    return;
  }
  
  isSaving.value = true;
  saveFailed.value = false;
  
 
    try {
      // 方法2：使用 canvas 处理（处理跨域）
      await downloadViaCanvas();
      
    } catch (canvasError) {
      console.error('Canvas 方法也失败:', canvasError);
      
      
    }
    finally {
      isSaving.value = false;
    }
  }

// 方法1：直接下载（适用于支持 CORS 的第三方）
const downloadDirect = () => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('a');
    link.href = order.value.payment_qr_url;
    link.download = `qrcode_${Date.now()}.png`;
    link.target = '_blank'; // 新窗口打开，避免页面跳转
    
    // 添加事件监听
    link.onclick = () => {
      setTimeout(() => {
        resolve();
      }, 100);
    };
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 如果 2 秒后还没触发点击事件，认为失败
    setTimeout(() => {
      reject(new Error('下载超时'));
    }, 2000);
  });
};

// 方法2：通过 canvas 处理（处理跨域和图片处理）
const downloadViaCanvas = () => {
  return new Promise((resolve, reject) => {
    if (!qrImage.value) {
      reject(new Error('图片元素不存在'));
      return;
    }
    
    const img = qrImage.value;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置 canvas 尺寸为图片原始尺寸或固定尺寸
    const width = img.naturalWidth || 300;
    const height = img.naturalHeight || 300;
    
    canvas.width = width;
    canvas.height = height;
    
    // 先绘制白色背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 设置图片平滑处理
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    try {
      // 尝试绘制图片
      ctx.drawImage(img, 0, 0, width, height);
      
      // 转换为 data URL
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('无法生成图片文件'));
          return;
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `payment_qrcode_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理 URL 对象
        setTimeout(() => {
          URL.revokeObjectURL(url);
          resolve();
        }, 100);
        
      }, 'image/png', 1.0); // 最高质量
      
    } catch (error) {
      reject(new Error(`Canvas 绘制失败: ${error.message}`));
    }
  });
};

// Lifecycle
onMounted(async () => {
  await fetchOrder()
  if(intervalId)clearInterval(intervalId)
    setInterval(async ()=>{
        await fetchOrder(false)
    
        if(order.value.status == 2)clearInterval(intervalId)
    },3000);
  
  // Start timer
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      // Time's up - refresh order status
      //fetchOrder()
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.select-all {
  user-select: all;
  -webkit-user-select: all;
  -moz-user-select: all;
  -ms-user-select: all;
}

.save-btn {
  @apply inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 
         text-white font-medium py-2.5 px-6 rounded-lg hover:from-green-600 hover:to-green-700 
         transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
         shadow-md hover:shadow-lg w-48;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .save-btn {
    @apply w-full max-w-xs py-3;
  }
}
</style>