<template>
  <div class="flex flex-col h-full bg-slate-900">
    <div class="p-4 flex items-center bg-slate-800 shadow-lg z-10">
      <button @click="handleBack" class="p-2 mr-2">
        <ArrowLeft class="text-white" />
      </button>
      <div class="flex-1">
        <h2 class="text-white font-bold text-lg">
          {{ isEditing ? (editingId ? '編輯' : t.account.add) : t.profile.account }}
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
        <div 
          v-for="item in accountList" 
          :key="item.id" 
          :class="[
            'bg-slate-800 rounded-xl p-4 border transition-all cursor-pointer relative overflow-hidden ',
             'border-slate-700'
          ]"
        >
          
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
            <button @click.stop="startEditing(item)" class="text-emerald-400 text-xs flex items-center hover:opacity-80">
              <Edit3 :size="14" class="mr-1" /> {{ t.account.edit }}
            </button>
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
              <input type="file" :ref="el => setFileRef(el, type)" accept="image/*, .heic, .heif" @change="handleFileUpload(type, $event)" class="hidden" />
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
import { ArrowLeft, Clock, Edit3, Building2, Upload, User, CreditCard, Hash, MapPin, Trash2, XCircle, Image, Check } from 'lucide-vue-next'
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
const accountList = ref([])
const bankOptions = ['VIB', 'PG BANK', 'VTB', 'MB', 'VCB', 'MSB', 'ACB', 'SEA', 'EIB', 'OCB', 'VIKKI']
const formData = ref({ bank_name: 'VIB', account_name: '', account_number: '', bank_code: '', branch_name: '' })
const uploads = ref({ card_front: null, card_back: null, qr_code: null })
const previews = ref({ card_front: '', card_back: '', qr_code: '' })
const fileInputRefs = {}

// --- Methods ---

const setFileRef = (el, type) => { if (el) fileInputRefs[type] = el }
const triggerFileClick = (type) => { fileInputRefs[type].click() }

async function fetchAccountList() {
  if (!authStore.isAuthenticated) return router.push('/login')
  loading.value = true
  try {
    const response = await api.get('/payment-accounts')
    if (response.data.success) {
      accountList.value = Array.isArray(response.data.data) ? response.data.data : []
    }
  } catch (err) {
    error.value = t.value.common.networkError
  } finally {
    loading.value = false
  }
}

// 設定預設卡片邏輯
async function handleSetDefault(id) {
  // 如果已經是預設，就不重複請求
  const target = accountList.value.find(item => item.id === id)
  if (!target || target.is_default == 1 || target.is_verified != 1) {
    if (target?.is_verified != 1) showToast({ type: 'error', message: t.value.account.verify_can_use })
    return
  }

  try {
    const res = await api.post('/payment-account-default', { id })
    if (res.data.success) {
      showToast({ type: 'success', message: t.value.account.success })
      // 前端直接更新狀態，減少閃爍
      accountList.value.forEach(item => {
        item.is_default = (item.id === id ? 1 : 0)
      })
    }
  } catch (err) {
    showToast({ type: 'error', message: t.value.account.error })
  }
}

// 模式與表單處理 (保持你原本的邏輯)
function startCreate() {
  editingId.value = null
  resetFormData()
  isEditing.value = true
}

function startEditing(item) {
  editingId.value = item.id
  formData.value = { ...item }
  previews.value = { card_front: item.card_front_url || '', card_back: item.card_back_url || '', qr_code: item.qr_code_url || '' }
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  resetFormData()
}

function resetFormData() {
  formData.value = { bank_name: 'VIB', account_name: '', account_number: '', bank_code: '', branch_name: '' }
  uploads.value = { card_front: null, card_back: null, qr_code: null }
  previews.value = { card_front: '', card_back: '', qr_code: '' }
}

function handleFileUpload(type, event) {
  const file = event.target.files[0]
  if (!file) return

  // 驗證文件類型
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', "image/heic", "image/heif", "image/pjpeg", "image/x-png", "image/bmp"]
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!validTypes.includes(file.type)) {
    showToast({
      type: 'error',
      title: t.value.common.uploadError || '上傳錯誤',
      message: t.value.account.invalidImageType || '不支援的圖片格式'
    })
    return
  }

  if (file.size > maxSize) {
    showToast({
      type: 'error',
      title: t.value.common.uploadError || '上傳錯誤',
      message: (t.value.account.imageTooLarge || '檔案太大') + ' (最大 10MB)'
    })
    return
  }

  uploads.value[type] = file
  previews.value[type] = URL.createObjectURL(file)
}

// 1. 強制轉大寫並去除越南語聲調
const normalizeName = (str) => {
  if (!str) return '';
  let res = str.toUpperCase();
  res = res.replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, "A");
  res = res.replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, "E");
  res = res.replace(/[ÌÍỊỈĨ]/g, "I");
  res = res.replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, "O");
  res = res.replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, "U");
  res = res.replace(/[ỲÝỴỶỸ]/g, "Y");
  res = res.replace(/Đ/g, "D");
  res = res.replace(/[^A-Z\s]/g, ""); // 僅保留英文字母與空格
  return res.replace(/\s+/g, " ").trim();
};

// 2. 檢查帳號是否為 5-15 位純數字
const isValidAcc = (acc) => /^[0-9]{6,18}$/.test(acc);

async function handleSubmit() {
  // A. 自動校正姓名格式 (自動幫會員轉大寫去聲調)
  const originalName = formData.value.account_name;
  const fixedName = normalizeName(originalName);
  formData.value.account_name = fixedName;

  // B. 檢查帳號位數
  if (!isValidAcc(formData.value.account_number)) {
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

const isFormValid = computed(() => formData.value.bank_name && formData.value.account_name && formData.value.account_number)

function formatAccountNumber(no) {
  if (!no) return '**** **** ****'
  return no.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function handleBack() {
  isEditing.value ? (isEditing.value = false) : router.push('/profile')
}

onMounted(fetchAccountList)
</script>