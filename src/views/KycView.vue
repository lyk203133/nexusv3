<template>
  <div class="flex flex-col h-full bg-slate-900">
    <div class="p-4 flex items-center bg-slate-800 shadow-lg z-10">
      <button @click="$router.back()" class="p-2 mr-2">
        <ArrowLeft class="text-white" />
      </button>
      <div class="flex-1">
        <h2 class="text-white font-bold text-lg">{{ t.register.kycTitle }}</h2>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
      <p class="text-slate-400 text-sm">{{ t.common.loading }}</p>
    </div>

    <!-- Status Box -->
    <div v-else class="flex-1 overflow-y-auto p-5 pb-24 no-scrollbar">
      
      <!-- Display actual status -->
      <div class="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6 text-center shadow-lg relative overflow-hidden">
        <div v-if="kycInfo.status == 2" class="flex flex-col items-center">
          <div class="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle class="text-emerald-500" :size="32" />
          </div>
          <h3 class="text-emerald-400 font-bold text-lg mb-2">{{ t.account.status.verified }}</h3>
          <p class="text-slate-400 text-sm">{{ t.register.kycPassed }}</p>
        </div>
        
        <div v-else-if="kycInfo.status == 0" class="flex flex-col items-center">
          <div class="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <Clock class="text-blue-500" :size="32" />
          </div>
          <h3 class="text-blue-400 font-bold text-lg mb-2">{{ t.account.status.pending }}</h3>
          <p class="text-slate-400 text-sm">{{ t.register.kycPendingMsg }}</p>
        </div>
        
        <div v-else-if="kycInfo.status == 3" class="flex flex-col items-center">
          <div class="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-4">
            <XCircle class="text-rose-500" :size="32" />
          </div>
          <h3 class="text-rose-400 font-bold text-lg mb-2">{{ t.account.status.rejected }}</h3>
          <p v-if="kycInfo.reject_reason" class="text-rose-300 text-sm mt-2 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-left">
            {{ t.register.kycRejectReason }}: {{ kycInfo.reject_reason }}
          </p>
        </div>
      </div>

      <!-- Upload Form for Rejected Status -->
      <div v-if="kycInfo.status == 3" class="space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
        <section>
          <h3 class="text-emerald-400 text-sm font-bold mb-3 uppercase tracking-wider flex items-center">
            <User :size="16" class="mr-2"/> {{ t.register.kycReupload }} {{ t.register.idCard }}
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <input 
              type="file" 
              ref="cardFrontInput"
              accept="image/*, .heic, .heif" 
              @change="handleFileUpload('card_front', $event)"
              class="hidden"
            />
            <button 
              @click="$refs.cardFrontInput.click()"
              :class="`h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 transition-all ${uploads.card_front ? 'border-emerald-500 text-emerald-400' : 'border-slate-700'}`"
            >
              <img v-if="previews.card_front" :src="previews.card_front" class="h-full object-cover rounded-lg" />
              <div v-else class="flex flex-col items-center p-2 text-slate-400">
                <Camera class="mb-2 opacity-50" />
                <span class="text-xs text-center">{{ t.register.uploadFront }}</span>
              </div>
            </button>
            <input 
              type="file" 
              ref="cardBackInput"
              accept="image/*, .heic, .heif" 
              @change="handleFileUpload('card_back', $event)"
              class="hidden"
            />
            <button 
              @click="$refs.cardBackInput.click()"
              :class="`h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 transition-all ${uploads.card_back ? 'border-emerald-500 text-emerald-400' : 'border-slate-700'}`"
            >
              <img v-if="previews.card_back" :src="previews.card_back" class="h-full object-cover rounded-lg" />
              <div v-else class="flex flex-col items-center p-2 text-slate-400">
                <Camera class="mb-2 opacity-50" />
                <span class="text-xs text-center">{{ t.register.uploadBack }}</span>
              </div>
            </button>
          </div>
        </section>

        <section>
          <h3 class="text-emerald-400 text-sm font-bold mb-3 uppercase tracking-wider flex items-center">
            <CreditCard :size="16" class="mr-2"/> {{ t.register.bankCard }}
          </h3>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <input 
              type="file" 
              ref="bankFrontInput"
              accept="image/*, .heic, .heif" 
              @change="handleFileUpload('bank_front', $event)"
              class="hidden"
            />
            <button 
              @click="$refs.bankFrontInput.click()"
              :class="`h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:bg-slate-800 transition-all ${uploads.bank_front ? 'border-emerald-500 text-emerald-400' : 'border-slate-700'}`"
            >
              <img v-if="previews.bank_front" :src="previews.bank_front" class="h-full object-cover rounded-lg" />
              <div v-else class="flex flex-col items-center text-slate-400">
                <span class="text-xs">{{ t.register.bankCardFront }}</span>
              </div>
            </button>

            <input 
              type="file" 
              ref="bankBackInput"
              accept="image/*, .heic, .heif" 
              @change="handleFileUpload('bank_back', $event)"
              class="hidden"
            />
            <button 
              @click="$refs.bankBackInput.click()"
              :class="`h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:bg-slate-800 transition-all ${uploads.bank_back ? 'border-emerald-500 text-emerald-400' : 'border-slate-700'}`"
            >
              <img v-if="previews.bank_back" :src="previews.bank_back" class="h-full object-cover rounded-lg" />
              <div v-else class="flex flex-col items-center text-slate-400">
                <span class="text-xs">{{ t.register.bankCardBack }}</span>
              </div>
            </button>
          </div>
          
          <div style="margin-bottom: 10px;">
            <label class="text-xs text-slate-400 mb-1 block">{{ t.register.bankName }}</label>
            <select 
              v-model="formData.bank_code"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
            >
              <option v-for="bank in bankOptions" :key="bank.code" :value="bank.code">{{ bank.name }}</option>
            </select>
          </div>
          <InputField :icon="User" :placeholder="t.register.accountName" v-model="formData.accountName" />
          <InputField :icon="FileText" :placeholder="t.register.bankAcc" v-model="formData.bankAcc" />
        </section>

        <section class="bg-slate-800 p-4 rounded-xl border border-rose-900/50">
          <h3 class="text-rose-400 text-sm font-bold mb-3 uppercase tracking-wider flex items-center">
            <AlertTriangle :size="16" class="mr-2"/> {{ t.register.qrCode }}
          </h3>
          <p class="text-xs text-slate-400 mb-4">{{ t.register.qrDesc }}</p>
          <input 
              type="file" 
              ref="QRInput"
              accept="image/*, .heic, .heif" 
              @change="handleFileUpload('qr_upload', $event)"
              class="hidden"
            />
          <button 
            @click="$refs.QRInput.click()"
            :class="`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-rose-500 hover:bg-slate-800 transition-all bg-slate-900 ${uploads.qr_upload ? 'border-rose-500 text-rose-400' : 'border-slate-600'}`"
          >
            <Upload class="mb-2" />
            <img v-if="previews.qr_upload" :src="previews.qr_upload" class="h-full object-cover rounded-lg" />
              <div v-else class="flex flex-col items-center text-slate-400">
                <span class="text-xs font-bold">{{ t.register.uploadQR }}</span>
              </div>
          </button>
        </section>

        <NeonButton fullWidth class="mt-8" @click="handleSubmit" :loading="submitting" :disabled="submitting">
          {{ t.register.submitAudit }}
        </NeonButton>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, User, Camera, CheckCircle, XCircle, Clock, CreditCard, FileText, AlertTriangle, Upload } from 'lucide-vue-next'
import InputField from '@/components/InputField.vue'
import NeonButton from '@/components/NeonButton.vue'
import { useTranslation } from '@/composables/useTranslation'
import { api } from '@/utils/api'
import { showToast } from '@/utils/notification'
import { normalizeName, isValidAcc } from '@/utils/validators'

const router = useRouter()
const { t } = useTranslation()

const loading = ref(true)
const submitting = ref(false)

const kycInfo = ref({
  status: null,
  reject_reason: ''
})

const bankOptions = [
    { code: "ACB", name: "ACB", bin: 970416 },
    { code: "Eximbank", name: "EIB", bin: 970431 },
    { code: "MBBank", name: "MB", bin: 970422 },
    { code: "MSB", name: "MSB", bin: 970426 },
    { code: "OCB", name: "OCB", bin: 970448 },
    { code: "PGBank", name: "PGB", bin: 970430 },
    { code: "SeABank", name: "SEAB", bin: 970440 },
    { code: "Vietcombank", name: "VCB", bin: 970436 },
    { code: "VietinBank", name: "ICB", bin: 970415 },
    { code: "VPBank", name: "VPB", bin: 970432 }
]

const formData = ref({
  bankName: '',
  bank_code: '',
  accountName: '',
  bankAcc: ''
})

const uploads = ref({
  card_front: false,
  card_back: false,
  bank_front: false,
  bank_back: false,
  qr_upload: false
})

const previews = ref({
  card_front: '',
  card_back: '',
  bank_front: '',
  bank_back: '',
  qr_upload: ''
})

onMounted(() => {
  fetchKycStatus()
})

async function fetchKycStatus() {
  loading.value = true
  try {
    const response = await api.get('/user/kyc-info')
    if (response.data && response.data.success) {
      kycInfo.value = {
        status: response.data.data.kyc_status,
        reject_reason: response.data.data.reject_reason || ''
      }
    } else {
      kycInfo.value = response.data?.data || { status: 3, reject_reason: '無法取得狀態' }
    }
  } catch (error) {
    console.error('Failed to fetch KYC status', error)
    showToast({
      type: 'error',
      message: t.value.common.networkError
    })
    // For safety, show upload form so user doesn't get totally blocked if API error exists
    kycInfo.value = { status: 3, reject_reason: '' }
  } finally {
    loading.value = false
  }
}

function handleFileUpload(type, event) {
  const file = event.target.files[0]
  if (!file) return

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', "image/heic", "image/heif", "image/pjpeg", "image/x-png", "image/bmp"]
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!validTypes.includes(file.type)) {
    showToast({
      type: 'error',
      title: t.value.common.uploadError || 'Upload Error',
      message: t.value.account?.invalidImageType || 'Invalid image format'
    })
    return
  }

  if (file.size > maxSize) {
    showToast({
      type: 'error',
      title: t.value.common.uploadError || 'Upload Error',
      message: (t.value.account?.imageTooLarge || 'File too large') + ' (Max 10MB)'
    })
    return
  }

  uploads.value[type] = file
  previews.value[type] = URL.createObjectURL(file)
}



async function handleSubmit() {
  // A. 自動校正姓名格式 (自動幫會員轉大寫去聲調)
  const originalName = formData.value.accountName;
  const fixedName = normalizeName(originalName);
  formData.value.accountName = fixedName;

  const bank_code = formData.value.bank_code;
  const bankName = bankOptions.find(b=>b.code == bank_code)?.name;
  formData.value.bankName = bankName;

  // B. 檢查帳號位數
  if (!isValidAcc(formData.value.bankAcc)) {
    showToast({
      type: 'error',
      title: 'Validation Error',
      message: t.value.account.account_number_error
    });
    return; // 攔截，不發送 API
  }

  // C. 檢查姓名是否有效 (至少包含姓與名)
  if (!fixedName.includes(' ')) {
    showToast({
      type: 'error',
      title: 'Validation Error',
      message: t.value.account.account_name_error
    });
    return; // 攔截
  }

  if (!formData.value.bankName) {
    showToast({ type: 'error', message: '請輸入銀行名稱' })
    return
  }
  if (!formData.value.accountName) {
    showToast({ type: 'error', message: '請輸入姓名' })
    return
  }
  if (!formData.value.bankAcc) {
    showToast({ type: 'error', message: '請輸入銀行帳號' })
    return
  }
  if (!uploads.value.card_front) {
    showToast({ type: 'error', message: '請上傳身分證件正面' })
    return
  } 
  if (!uploads.value.card_back) {
    showToast({ type: 'error', message: '請上傳身分證件反面' })
    return
  }
  if (!uploads.value.bank_front) {
    showToast({ type: 'error', message: '請上傳銀行帳戶正面' })
    return
  }
  if (!uploads.value.bank_back) {
    showToast({ type: 'error', message: '請上傳銀行帳戶反面' })
    return
  }
  if (!uploads.value.qr_upload) {
    showToast({ type: 'error', message: '請上傳收款 QR Code' })
    return
  }

  submitting.value = true
  try {
    const formDataToSend = new FormData()

    Object.keys(formData.value).forEach(key => {
      if (formData.value[key]) {
        formDataToSend.append(key, formData.value[key])
      }
    })

    formDataToSend.append('card_front', uploads.value.card_front)
    formDataToSend.append('card_back', uploads.value.card_back)
    formDataToSend.append('bank_front', uploads.value.bank_front)
    formDataToSend.append('bank_back', uploads.value.bank_back)
    formDataToSend.append('qr_upload', uploads.value.qr_upload)

    const response = await api.post('/auth/kyc-update', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data && response.data.success) {
      showToast({
        type: 'success',
        message: '上傳成功，請等待審核'
      })
      fetchKycStatus()
      uploads.value = { card_front: false, card_back: false, bank_front: false, bank_back: false, qr_upload: false }
      previews.value = { card_front: '', card_back: '', bank_front: '', bank_back: '', qr_upload: '' }
      formData.value = { bankName: '', bank_code: '', accountName: '', bankAcc: '' }
    } else {
      showToast({
        type: 'error',
        message: response.data?.message || '上傳失敗'
      })
    }
  } catch (error) {
    console.error('KYC upload error', error)
    showToast({
      type: 'error',
      message: error.response?.data?.message || t.value.common.networkError
    })
  } finally {
    submitting.value = false
  }
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
