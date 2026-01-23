<template>
  <div class="flex flex-col h-full bg-slate-900">
    <div class="p-4 flex items-center bg-slate-800 shadow-lg z-10">
      <button @click="handleBack" class="p-2 mr-2">
        <ArrowLeft class="text-white" />
      </button>
      <div class="flex-1">
        <h2 class="text-white font-bold text-lg">
          {{ isEditing ? (editingId ? '編輯' : t.account.add) : t.account.title }}
        </h2>
      </div>
      <button 
        v-if="!isEditing && !loading" 
        @click="startCreate"
        class="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
      >
        + {{ t.account.add }}
      </button>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
      <p class="text-slate-400 text-sm">{{ t.common.loading }}</p>
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center py-12 px-4">
      <div class="text-rose-500 mb-3 text-center">{{ error }}</div>
      <button @click="fetchAccountList" class="px-4 py-2 bg-slate-800 text-white rounded-lg">
        {{ t.common.retry }}
      </button>
    </div>

    <div v-else class="flex-1 overflow-y-auto p-5 pb-24 no-scrollbar">
      
      <div v-if="!isEditing" class="space-y-4">
        <div v-for="item in accountList" :key="item.id" class="bg-slate-800 rounded-xl p-4 border border-slate-700 relative overflow-hidden">
          <div v-if="item.is_verified == 1" class="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">
            {{ t.account.status.verified }}
          </div>
          <div v-else-if="item.is_verified == -1" class="absolute top-0 right-0 bg-red-500 text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">
            {{ t.account.status.rejected }}
          </div>
          <div v-if="item.is_verified == 0" class="absolute top-0 right-0 bg-gray-500 text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">
            {{ t.account.status.pending }}
          </div>

          <div class="mb-4">
            <p class="text-xs text-slate-400 mb-1">{{ t.account.bankName }}</p>
            <p class="text-white font-bold">{{ item.bank_name }}</p>
          </div>
          <div class="mb-4">
            <p class="text-xs text-slate-400 mb-1">{{ t.account.accountName }}</p>
            <p class="text-white font-bold">{{ item.account_name }}</p>
          </div>
          <div class="mb-4">
            <p class="text-xs text-slate-400 mb-1">{{ t.account.accNo }}</p>
            <p class="text-white font-mono text-lg font-bold">{{ formatAccountNumber(item.account_number) }}</p>
          </div>
          
          <div class="flex gap-4 pt-3 border-t border-slate-700/50">
            <button @click="startEditing(item)" class="text-emerald-400 text-xs flex items-center">
              <Edit3 :size="14" class="mr-1" /> {{ t.account.edit }}
            </button>
            <!--button @click="handleDelete(item.id)" class="text-rose-500 text-xs flex items-center">
              <Trash2 :size="14" class="mr-1" /> {{ t.common.delete || '刪除' }}
            </button-->
          </div>

          <p v-if="item.status === 'rejected' && item.reject_reason" class="text-[10px] text-rose-400 mt-2 italic">
            * {{ item.reject_reason }}
          </p>
        </div>
      </div>

      <div v-else class="animate-in fade-in slide-in-from-bottom duration-300 space-y-6">
        
        <div class="space-y-4">
          <div>
            <label class="text-xs text-slate-400 mb-1 block">{{ t.account.bankName }}</label>
            <select v-model="formData.bank_name" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-emerald-500">
              <option v-for="bank in bankOptions" :key="bank" :value="bank">{{ bank }}</option>
            </select>
          </div>

          <InputField :icon="User" :placeholder="t.account.accountName" v-model="formData.account_name" required />
          <InputField :icon="CreditCard" :placeholder="t.account.accNo" v-model="formData.account_number" required />
          
          <div class="grid grid-cols-2 gap-4">
            <InputField :icon="Hash" :placeholder="t.account.bankCode" v-model="formData.bank_code" class="col-span-1" />
            <InputField :icon="MapPin" :placeholder="t.account.branchName" v-model="formData.branch_name" class="col-span-1" />
          </div>
        </div>

        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p class="text-xs text-slate-400 mb-3">{{ t.account.cardUpload }} <span class="text-rose-400">*</span></p>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="type in ['card_front', 'card_back', 'qr_code']" :key="type">
              <label v-if="type === 'card_front'" class="block text-xs text-slate-400 mb-2">{{ t.account.cardFront }}</label>
              <label v-if="type === 'card_back'" class="block text-xs text-slate-400 mb-2">{{ t.account.cardBack }}</label>
              <label v-if="type === 'qr_code'" class="block text-xs text-slate-400 mb-2">{{ t.account.qr }}</label>
              <input type="file" :ref="el => setFileRef(el, type)" accept="image/*" @change="handleFileUpload(type, $event)" class="hidden" />
              <button 
                @click="triggerFileClick(type)" 
                :class="`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-slate-900 transition-all ${uploads[type] ? 'border-emerald-500 text-emerald-400' : 'border-slate-600 text-slate-400'}`"
              >
                <img v-if="previews[type]" :src="previews[type]" class="w-full h-full object-cover rounded-lg" />
                <template v-else>
                  <Upload class="mb-2" />
                  <span class="text-[10px]">{{ t.common.upload }}</span>
                </template>
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <NeonButton fullWidth @click="handleSubmit" :loading="submitting" :disabled="!isFormValid || submitting">
            {{ t.account.submit }}
          </NeonButton>
          <button @click="cancelEditing" class="w-full text-center text-slate-500 text-xs py-2 hover:text-white">
            {{ t.common.cancel }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Clock, Edit3, Building2, Upload, User, CreditCard, Hash, MapPin, Trash2, XCircle, Image } from 'lucide-vue-next'
import InputField from '@/components/InputField.vue'
import NeonButton from '@/components/NeonButton.vue'
import { useTranslation } from '@/composables/useTranslation'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/utils/api'
import { showToast } from '@/utils/notification'

const router = useRouter()
const { t } = useTranslation()
const authStore = useAuthStore()

// State
const loading = ref(false)
const error = ref('')
const submitting = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

// Data
const accountList = ref([]) // 多張銀行卡列表
const bankOptions = ['VIB', 'PG BANK', 'VTB', 'MB', 'VCB', 'MSB', 'ACB', 'SEA', 'EIB', 'OCB', 'VIKKI']

const formData = ref({
  bank_name: 'VIB',
  account_name: '',
  account_number: '',
  bank_code: '',
  branch_name: ''
})

const uploads = ref({ card_front: null, qr_code: null })
const previews = ref({ card_front: '', qr_code: '' })
const fileInputRefs = {}

// --- Methods ---

const setFileRef = (el, type) => { if (el) fileInputRefs[type] = el }
const triggerFileClick = (type) => { fileInputRefs[type].click() }

async function fetchAccountList() {
  if (!authStore.isAuthenticated) return router.push('/login')
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/payment-accounts')
    // 這裡後端回傳改為陣列
    if (response.data.success) {
      accountList.value = Array.isArray(response.data.data) ? response.data.data : (response.data.data ? [response.data.data] : [])
    }
  } catch (err) {
    error.value = t.value.common.networkError
  } finally {
    loading.value = false
  }
}

function startCreate() {
  editingId.value = null
  resetFormData()
  isEditing.value = true
}

function startEditing(item) {
  editingId.value = item.id
  formData.value = {
    bank_name: item.bank_name || 'VIB',
    account_name: item.account_name || '',
    account_number: item.account_number || '',
    bank_code: item.bank_code || '',
    branch_name: item.branch_name || ''
  }
  // 如果編輯時需要顯示原本的圖，後端需提供 URL 並在這裡賦值給 previews
  previews.value = { card_front: item.card_front_url || '', qr_code: item.qr_code_url || '' }
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  resetFormData()
}

function resetFormData() {
  formData.value = { bank_name: 'VIB', account_name: '', account_number: '', bank_code: '', branch_name: '' }
  uploads.value = { card_front: null, qr_code: null }
  previews.value = { card_front: '', qr_code: '' }
}

function handleFileUpload(type, event) {
  const file = event.target.files[0]
  if (!file) return
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) return showToast({ type: 'error', message: t.value.account.imageTooLarge })

  uploads.value[type] = file
  previews.value[type] = URL.createObjectURL(file) // 使用更精簡的 URL.createObjectURL
}

async function handleSubmit() {
  if (!isFormValid.value) return
  submitting.value = true
  try {
    const fd = new FormData()
    Object.keys(formData.value).forEach(key => fd.append(key, formData.value[key]))
    if (uploads.value.card_front) fd.append('card_front', uploads.value.card_front)
    if (uploads.value.card_back) fd.append('card_back', uploads.value.card_back)
    if (uploads.value.qr_code) fd.append('qr_code', uploads.value.qr_code)


    let response
    if (editingId.value) {
      // 更新現有帳戶
      response = await api.post(`/payment-account-update?id=${editingId.value}`, fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } else {
      // 創建新帳戶
      response = await api.post('/payment-account-update', fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }

    if (response.data.success) {
      showToast({
        type: 'success',
        title: t.value.account.submitSuccess,
        message: response.data.message || t.value.account.submitSuccessMessage
      })

      isEditing.value = false
      fetchAccountList()
    } else {
      showToast({
        type: 'error',
        title: t.value.account.submitFailed,
        message: response.data.message || t.value.common.requestFailed
      })
    }
  } catch (err) {
    console.error('Submit account error:', err)
    showToast({
      type: 'error',
      title: t.value.account.submitFailed,
      message: err.response?.data?.message || err.message || t.value.common.networkError
    })
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id) {
  if (!confirm(t.value.account.confirmDelete)) return
  try {
    const response = await api.delete(`/payment-account-delete/${id}`)
    if (response.data.success) {
      showToast({ type: 'success', message: t.value.account.deleteSuccess })
      fetchAccountList()
    }
  } catch (err) {
    showToast({ type: 'error', message: t.value.common.networkError })
  }
}

// Helper Functions
const isFormValid = computed(() => formData.value.bank_name && formData.value.account_name && formData.value.account_number)

function getStatusStyle(status) {
  const styles = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    verified: 'bg-emerald-500/20 text-emerald-500',
    rejected: 'bg-rose-500/20 text-rose-400'
  }
  return styles[status] || 'bg-slate-700 text-slate-400'
}

function getStatusText(status) {
  return t.value.account.status[status] || status
}

function formatAccountNumber(no) {
  if (!no) return '**** **** ****'
  return no.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function handleBack() {
  isEditing.value ? (isEditing.value = false) : router.push('/profile')
}

onMounted(fetchAccountList)
</script>