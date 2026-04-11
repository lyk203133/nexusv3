<template>
  <div class="flex flex-col h-full bg-slate-900">
    <div class="p-4 border-b border-slate-800 flex items-center">
      <button @click="handleBack" class="p-2">
        <ArrowLeft class="text-slate-300" />
      </button>
      <span class="ml-2 font-bold text-white">{{ step === 1 ? t.register.title : t.register.kycTitle }}</span>
    </div>
    <div class="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">
      <div v-if="step === 1" class="space-y-4 animate-in fade-in slide-in-from-right duration-300">
        <InputField :icon="User" :label="t.register.accLabel" v-model="formData.account" />
        <InputField 
          :icon="Lock" 
          :isSecure="true" 
          :label="t.register.passLabel" 
          v-model="formData.password"
        />
        <InputField 
          :icon="Lock" 
          :isSecure="true" 
          :label="t.register.passConfirmLabel" 
          v-model="formData.confirmPassword"
        />
        
        <!-- Phone & SMS Section -->
        <div>
          <label class="block text-slate-400 text-xs mb-1 uppercase tracking-wider">{{ t.register.phoneLabel }}</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Smartphone class="h-5 w-5 text-emerald-500" />
            </div>
            <input 
              type="tel" 
              v-model="formData.phone" 
              class="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-3 placeholder-slate-500 transition-colors" 
            />
          </div>
        </div>

        <div>
          <label class="block text-slate-400 text-xs mb-1 uppercase tracking-wider">{{ t.register.smsLabel }}</label>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-5 w-5 text-emerald-500" />
              </div>
              <input 
                type="text" 
                v-model="formData.smsCode" 
                class="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-3 placeholder-slate-500 transition-colors" 
              />
            </div>
            <button 
              @click="handleGetSms" 
              :disabled="countdown > 0" 
              :class="`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all ${countdown > 0 ? 'bg-slate-700 text-slate-500' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`"
            >
              {{ countdown > 0 ? `${countdown} ${t.register.resendSms}` : t.register.getSms }}
            </button>
          </div>
        </div>

        <!-- Captcha Section -->
        <div>
          <label class="block text-slate-400 text-xs mb-1 uppercase tracking-wider">{{ t.register.captchaLabel }}</label>
          <div class="flex gap-2 items-center">
            <div class="relative flex-1">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield class="h-5 w-5 text-emerald-500" />
              </div>
              <input 
                type="text" 
                v-model="captchaInput" 
                :placeholder="t.register.captchaPlaceholder" 
                class="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-3 placeholder-slate-500 transition-colors" 
              />
            </div>
            <div 
              @click="refreshCaptcha" 
              class="bg-slate-700 px-4 py-3 rounded-lg text-white font-mono font-bold tracking-widest cursor-pointer hover:bg-slate-600 select-none flex items-center gap-2" 
              title="點擊刷新"
            >
              {{ generatedCaptcha }} <RefreshCcw :size="14" />
            </div>
          </div>
        </div>

        <!-- Invitation Code Section -->
        <InputField 
          :icon="Ticket" 
          :label="t.register.inviteLabel" 
          :placeholder="t.register.invitePlaceholder" 
          v-model="formData.inviteCode"
        />

        <InputField 
          :icon="Shield" 
          :isSecure="true" 
          :label="t.register.txPassLabel" 
          :subLabel="t.register.txPassSub" 
          v-model="formData.txPass"
        />
        <NeonButton fullWidth class="mt-8" @click="handleNextStep">{{ t.register.next }}</NeonButton>
      </div>

      <!-- Step 2: KYC -->
      <div v-else class="space-y-6 animate-in fade-in slide-in-from-right duration-300">
        <section>
          <h3 class="text-emerald-400 text-sm font-bold mb-3 uppercase tracking-wider flex items-center">
            <User :size="16" class="mr-2"/> {{ t.register.idCard }}
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
              <img v-if="previews.card_front" :src="previews.card_front" class="h-full object-cover" />
              <div v-else class="flex flex-col items-center text-slate-400">
                <Camera class="mb-2 opacity-50" />
                <span class="text-xs">{{ t.register.uploadFront }}</span>
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
              <img v-if="previews.card_back" :src="previews.card_back" class="h-full object-cover" />
              <div v-else class="flex flex-col items-center text-slate-400">
                <Camera class="mb-2 opacity-50" />
                <span class="text-xs">{{ t.register.uploadBack }}</span>
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
              <img v-if="previews.bank_front" :src="previews.bank_front" class="h-full object-cover" />
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
              <img v-if="previews.bank_back" :src="previews.bank_back" class="h-full object-cover" />
              <div v-else class="flex flex-col items-center text-slate-400">
                <span class="text-xs">{{ t.register.bankCardBack }}</span>
              </div>
            </button>

          </div>
          <!--InputField :icon="FileText" :placeholder="t.register.bankName" v-model="formData.bankName" /-->
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
            <img v-if="previews.qr_upload" :src="previews.qr_upload" class="h-full object-cover" />
              <div v-else class="flex flex-col items-center text-slate-400">
                <span class="text-xs font-bold">{{ t.register.uploadQR }}</span>
              </div>
          </button>
        </section>

        <NeonButton fullWidth class="mt-8" @click="handleSubmit()">{{ t.register.submitAudit }}</NeonButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Smartphone, Mail, Shield, RefreshCcw, Ticket, Camera, CreditCard, FileText, AlertTriangle, Upload, ArrowLeft } from 'lucide-vue-next'
import InputField from '@/components/InputField.vue'
import NeonButton from '@/components/NeonButton.vue'
import { useTranslation } from '@/composables/useTranslation'
import { post } from '@/utils/api'
import { showToast } from '@/utils/notification'

const router = useRouter()
const { t } = useTranslation()

const step = ref(1)
const countdown = ref(0)
const captchaInput = ref('')
const generatedCaptcha = ref('')
const isClick = ref(false)

const bankOptions = [
    {
        "code": "ACB",
        "name": "ACB",
        "bin": 970416
    },
    {
        "code": "Eximbank",
        "name": "EIB",
        "bin": 970431
    },
    {
        "code": "MBBank",
        "name": "MB",
        "bin": 970422
    },
    {
        "code": "MSB",
        "name": "MSB",
        "bin": 970426
    },
    {
        "code": "OCB",
        "name": "OCB",
        "bin": 970448
    },
    {
        "code": "PGBank",
        "name": "PGB",
        "bin": 970430
    },
    {
        "code": "SeABank",
        "name": "SEAB",
        "bin": 970440
    },
    {
        "code": "Vietcombank",
        "name": "VCB",
        "bin": 970436
    },
    {
        "code": "VietinBank",
        "name": "ICB",
        "bin": 970415
    }
]

const formData = ref({
  account: '',
  password: '',
  confirmPassword: '',
  phone: '',
  smsCode: '',
  inviteCode: '',
  txPass: '',
  bankName: '',
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
// 1. 統一管理所有圖片的預覽網址與檔案物件
const previews = ref({
  card_front: '',
  card_back: '',
  bank_front: '',
  bank_back: '',
  qr_upload: ''
})



let timer = null

onMounted(() => {
  refreshCaptcha()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function getErrorMessage(err, fallback = '操作失敗，請稍後再試') {
  console.error('RegisterView request failed:', err)
  return err?.response?.data?.message || err?.message || fallback
}

function refreshCaptcha() {
  generatedCaptcha.value = Math.random().toString(36).substring(2, 6).toUpperCase()
}

async function handleGetSms() {
  if (!formData.value.phone) {
    showToast({
      type: 'error',
      message: '請輸入手機號碼'
    })
    return
  }
  if (isClick.value) {
    return
  }
  isClick.value = true
  if (countdown.value === 0) {
    
    try {
      const response = await post('/auth/send-sms', {
        'phone': formData.value.phone,
        'type': 'register'
      })

      isClick.value = false
      if (response.data.success) {
        countdown.value = 60
        showToast({
          type: 'success',
          message: '驗證碼已發送'
        })
        timer = setInterval(() => {
          if (countdown.value > 0) {
            countdown.value--
          } else {
            clearInterval(timer)
          }
        }, 1000)
      }
    } catch (err) {
      isClick.value = false
      showToast({
        type: 'error',
        message: getErrorMessage(err, '簡訊發送失敗')
      })
    }


    
  }
}

async function handleNextStep() {
  if (captchaInput.value.toUpperCase() !== generatedCaptcha.value) {
    showToast({
      type: 'error',
      message: t.value.register.errCaptcha
    })
    return
  }
  if (!formData.value.smsCode) {
    showToast({
      type: 'error',
      message: t.value.register.errSms
    })
    return
  }
  if (!formData.value.account) {
    showToast({
      type: 'error',
      message: '請輸入帳號'
    })
    return
  }
  if (!formData.value.password) {
    showToast({
      type: 'error',
      message: '請輸入密碼'
    })
    return
  }
  if (!formData.value.phone) {
    showToast({
      type: 'error',
      message: '請輸入手機號碼'
    })
    return
  }
  if (!formData.value.smsCode) {
    showToast({
      type: 'error',
      message: '請輸入簡訊驗證碼'
    })
    return
  }
  if (!formData.value.txPass) {
    showToast({
      type: 'error',
      message: '請輸入交易密碼'
    })
    return
  }
  if (isClick.value) {
    return
  }
  isClick.value = true
  try {
    const response = await post('/auth/register-verify', formData.value)

    console.log(response)
    if (response.data.success) {
      step.value = 2
    }
  } catch (err) {
    showToast({
      type: 'error',
      message: getErrorMessage(err, '驗證失敗')
    })
  }
  isClick.value = false
  
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
      title: t.common.uploadError,
      message: t.account.invalidImageType
    })
    return
  }

  if (file.size > maxSize) {
    showToast({
      type: 'error',
      title: t.common.uploadError,
      message: t.account.imageTooLarge + ' (最大 10MB)'
    })
    return
  }

  // 存下檔案，之後 handleSubmitAudit 要用
  uploads.value[type] = file
  // 生成預覽網址 (這就是最快的方法)
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
const isValidAcc = (acc) => /^[0-9]{5,15}$/.test(acc);

async function handleSubmit() {
  // A. 自動校正姓名格式 (自動幫會員轉大寫去聲調)
  const originalName = formData.value.accountName;
  const fixedName = normalizeName(originalName);
  formData.value.accountName = fixedName;

  const bank_code = formData.value.bank_code;
  const bankName = bankOptions.find(b=>b.code == bank_code)?.name;
  formData.value.bankName = bankName;
  console.log(formData.value)

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
    showToast({
      type: 'error',
      message: '請輸入銀行名稱'
    })
    return
  }
  if (!formData.value.accountName) {
    showToast({
      type: 'error',
      message: '請輸入姓名'
    })
    return
  }
  if (!formData.value.bankAcc) {
    showToast({
      type: 'error',
      message: '請輸入銀行帳號'
    })
    return
  }
  if (!uploads.value.card_front) {
    showToast({
      type: 'error',
      message: '請上傳身分證件正面'
    })
    return
  } 
  if (!uploads.value.card_back) {
    showToast({
      type: 'error',
      message: '請上傳身分證件反面'
    })
    return
  }
  if (!uploads.value.bank_front) {
    showToast({
      type: 'error',
      message: '請上傳銀行帳戶正面'
    })
    return
  }
  if (!uploads.value.bank_back) {
    showToast({
      type: 'error',
      message: '請上傳銀行帳戶反面'
    })
    return
  }
  if (!uploads.value.qr_upload) {
    showToast({
      type: 'error',
      message: '請上傳收款 QR Code'
    })
    return
  }
  if (isClick.value) {
    return
  }
  isClick.value = true

  try {
    // 創建 FormData 用於文件上傳
    const formDataToSend = new FormData()
    
    

    // 添加表單數據
    Object.keys(formData.value).forEach(key => {
      if (formData.value[key]) {
        formDataToSend.append(key, formData.value[key])
      }
    })
    // 添加文件

    formDataToSend.append('card_front', uploads.value.card_front)
    formDataToSend.append('card_back', uploads.value.card_back)
    formDataToSend.append('bank_front', uploads.value.bank_front)
    formDataToSend.append('bank_back', uploads.value.bank_back)
    formDataToSend.append('qr_upload', uploads.value.qr_upload)

    let response = await post('/auth/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

    isClick.value = false
    if (response.data.success) {
      showToast({
        type: 'success',
        message: '註冊成功'
      })
      router.push('/login')
    }
  } catch (err) {
    isClick.value = false
    showToast({
      type: 'error',
      message: getErrorMessage(err, '註冊失敗')
    })
  }
}

function handleBack() {
  if (step.value === 1) {
    router.push('/login')
  } else {
    step.value = 1
  }
}
</script>

