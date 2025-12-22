<template>
  <div class="flex flex-col h-full justify-center px-6 relative overflow-hidden">
    <div class="absolute top-[-10%] left-[-10%] w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-60 h-60 bg-rose-500/10 rounded-full blur-3xl"></div>
    <div class="absolute top-6 right-6 z-20">
      <LanguageSwitcher v-model:currentLang="lang" @update:currentLang="setLang" />
    </div>
    <div class="z-10 w-full max-w-sm mx-auto">
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-4">
          <Shield :size="40" class="text-emerald-400" />
        </div>
        <h1 class="text-3xl font-bold text-white tracking-widest">{{ t.appName }}</h1>
        <p class="text-slate-400 text-sm mt-2">{{ t.appSub }}</p>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p class="text-red-400 text-sm">{{ errorMessage }}</p>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="mb-4 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <p class="text-slate-400 text-sm mt-2">{{ t.login.loading }}</p>
      </div>
      
      <div class="space-y-4">
        <InputField 
          :icon="User" 
          :placeholder="t.login.accPlaceholder" 
          v-model="account" 
          :disabled="loading"
        />
        <InputField 
          :icon="Lock" 
          :isSecure="true" 
          :placeholder="t.login.passPlaceholder" 
          v-model="password"
          :disabled="loading"
        />
        <InputField 
          :icon="Key" 
          :isSecure="true" 
          :placeholder="t.login.captchaPlaceholder" 
          v-model="captcha"
          :disabled="loading"
        />
        <NeonButton 
          fullWidth 
          @click="handleLogin"
          :loading="loading"
          :disabled="loading || !isFormValid"
        >
          {{ t.login.loginBtn }}
        </NeonButton>
        <div class="flex justify-between text-xs text-slate-400 mt-4">
          <button 
            @click="$router.push('/register')" 
            class="hover:text-emerald-400 underline decoration-slate-600"
            :disabled="loading"
          >
            {{ t.login.register }}
          </button>
          <button 
            @click="$router.push('/forgot-password')" 
            class="hover:text-emerald-400 hover:underline decoration-slate-600 transition-all"
            :disabled="loading"
          >
            {{ t.login.forgotPass }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed ,watch} from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Key, Shield } from 'lucide-vue-next'
import InputField from '@/components/InputField.vue'
import NeonButton from '@/components/NeonButton.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useTranslation } from '@/composables/useTranslation'
import { useAuthStore } from '@/stores/auth'
import { showToast } from '@/utils/notification'

const router = useRouter()
const authStore = useAuthStore()
const { t, lang, setLang } = useTranslation()

const account = ref('')
const password = ref('')
const captcha = ref('')
const loading = ref(false)
const errorMessage = ref('')

// 表单验证
const isFormValid = computed(() => {
  return account.value.trim() && password.value.trim() && captcha.value.trim()
})

async function handleLogin() {
  // 表单验证
  if (!isFormValid.value) {
    errorMessage.value = t.login.validation.allFieldsRequired
    return
  }

  // 清除之前的错误信息
  errorMessage.value = ''
  loading.value = true

  try {
    // 调用登录方法
    const success = await authStore.login({
      account: account.value.trim(),
      password: password.value,
      captcha: captcha.value.trim()
    })

    if (success) {
      // 登录成功，显示提示并跳转
      showToast({
        type: 'success',
        title: t.value.login.success,
        message: t.value.login.welcomeBack
      })
      
      // 跳转到首页或仪表板
      router.push('/dashboard')
    } else {
      // 登录失败，显示错误信息
      errorMessage.value = authStore.error || t.value.login.failed
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = t.value.login.networkError
  } finally {
    loading.value = false
  }
}

// 监听输入变化，清除错误信息
function clearError() {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
}

// 为输入框添加监听
watch(account, clearError)
watch(password, clearError)
watch(captcha, clearError)
</script>