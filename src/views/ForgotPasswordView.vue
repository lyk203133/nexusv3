<template>
  <div class="flex flex-col h-full bg-slate-900 justify-center px-6 relative">
    <div class="absolute top-6 left-4">
      <button @click="$router.push('/login')" class="p-2 bg-slate-800 rounded-full border border-slate-700 hover:border-emerald-500 transition-all">
        <ArrowLeft class="text-slate-300" :size="20" />
      </button>
    </div>
    <div class="z-10 w-full max-w-sm mx-auto">
      <div class="animate-in fade-in slide-in-from-bottom duration-500">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-white mb-2">{{ step === 1 ? t.forgot.verifyTitle : t.forgot.resetTitle }}</h2>
        </div>
        
        <div v-if="step === 1" class="space-y-4">
          <div>
            <label class="block text-slate-400 text-xs mb-1 uppercase tracking-wider">{{ t.forgot.phoneLabel }}</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Smartphone class="h-5 w-5 text-emerald-500" />
              </div>
              <input 
                type="tel" 
                v-model="phone" 
                class="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-3 placeholder-slate-500 transition-colors" 
              />
            </div>
          </div>
          <div>
            <label class="block text-slate-400 text-xs mb-1 uppercase tracking-wider">{{ t.forgot.smsLabel }}</label>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail class="h-5 w-5 text-emerald-500" />
                </div>
                <input 
                  type="text" 
                  v-model="smsCode" 
                  class="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-3 placeholder-slate-500 transition-colors" 
                />
              </div>
              <button 
                @click="handleGetSms" 
                :disabled="countdown > 0" 
                :class="`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all ${countdown > 0 ? 'bg-slate-700 text-slate-500' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`"
              >
                {{ countdown > 0 ? `${countdown}s` : t.forgot.getSms }}
              </button>
            </div>
          </div>
          <NeonButton fullWidth class="mt-4" @click="handleVerify">{{ t.forgot.next }}</NeonButton>
        </div>

        <div v-else class="space-y-4">
          <InputField 
            :icon="Lock" 
            :isSecure="true" 
            :placeholder="t.register.passLabel" 
            v-model="newPass"
          />
          <InputField 
            :icon="Lock" 
            :isSecure="true" 
            :placeholder="t.register.passConfirmLabel" 
            v-model="confirmPass"
          />
          <NeonButton fullWidth class="mt-6" @click="handleReset">{{ t.forgot.done }}</NeonButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Smartphone, Mail, Lock } from 'lucide-vue-next'
import InputField from '@/components/InputField.vue'
import NeonButton from '@/components/NeonButton.vue'
import { useTranslation } from '@/composables/useTranslation'
import { showToast } from '@/utils/notification'
import { post } from '@/utils/api'

const router = useRouter()
const { t } = useTranslation()

const step = ref(1)
const phone = ref('')
const smsCode = ref('')
const newPass = ref('')
const confirmPass = ref('')
const countdown = ref(0)
const isClick = ref(false)

let timer = null

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

async function handleGetSms() {
  if (!phone.value) {
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
        'phone': phone.value,
        'type': 'forget-password'
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
        message: err.response?.data?.message
      })
    }


    
  }
}

async function handleVerify() {
  if (isClick.value) {
    return
  }
  isClick.value = true
  try {
    const response = await post('/auth/forget-password-verify', {
      'phone': phone.value,
      'smsCode': smsCode.value
    })

    console.log(response)
    if (response.data.success) {
      step.value = 2
    }
  } catch (err) {
    showToast({
      type: 'error',
      message: err.response?.data?.message
    })
  }
  isClick.value = false
}

async function handleReset() {
  if (!newPass.value || !confirmPass.value) return
  if (newPass.value !== confirmPass.value) {
    showToast({
      type: 'error',
      message: t.value.forgot.errMatch
    })
    return
  }

  try {
    const response = await post('/auth/reset-password',{
      phone: phone.value,
      newPass: newPass.value,
      confirmPass: confirmPass.value
    })

    console.log(response)
    if (response.data.success) {
      showToast({
        type: 'success',
        message: t.value.common.success
      })
      router.push('/login')
    }
  } catch (err) {
    showToast({
      type: 'error',
      message: err.response?.data?.message
    })
  }
}
</script>

