<template>
  <div class="flex flex-col h-full bg-slate-900 relative">
    <div class="p-6 bg-slate-800 pb-10 rounded-b-[2rem] shadow-lg mb-4">
      <div class="flex justify-between items-start">
        <button @click="$router.push('/dashboard')">
          <ArrowLeft class="text-white" />
        </button>
        <LanguageSwitcher v-model:currentLang="lang" @update:currentLang="setLang" />
      </div>
      
      <!-- Avatar Section -->
      <div class="flex flex-col items-center mt-[-20px]">
        <div class="relative group cursor-pointer" @click="handleAvatarClick">
          <div class="w-24 h-24 rounded-full border-4 border-slate-900 p-1 bg-gradient-to-tr from-emerald-500 to-slate-700 shadow-xl overflow-hidden relative">
            <img 
              v-if="userInfo.avatar"
              :src="userInfo.avatar" 
              alt="avatar" 
              class="w-full h-full rounded-full object-cover bg-slate-900" 
            />
            <img 
              v-else-if="authStore.user?.avatar"
              :src="authStore.user.avatar" 
              alt="avatar" 
              class="w-full h-full rounded-full object-cover bg-slate-900" 
            />
            <img 
              v-else
              :src="defaultAvatar" 
              alt="avatar" 
              class="rounded-full bg-slate-900 w-full h-full" 
            />
            <!-- Overlay Hint -->
            <div class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera class="text-white" :size="24" />
            </div>
          </div>
          <input type="file" ref="fileInputRef" @change="handleFileChange" hidden accept="image/*" />
        </div>

        <!-- Nickname Section -->
        <div class="mt-3 flex items-center justify-center gap-2 h-8">
          <div v-if="isEditingName" class="flex items-center bg-slate-900 rounded-full px-2 border border-emerald-500 animate-in fade-in duration-200">
            <input 
              v-model="tempName" 
              type="text"
              class="bg-transparent text-white text-sm font-bold w-32 outline-none text-center"
              @keyup.enter="handleNameSave"
              @blur="handleNameSave"
              autofocus
            />
            <button @click="handleNameSave" class="p-1 text-emerald-400 hover:text-white">
              <Check :size="16"/>
            </button>
            <button @click="isEditingName = false" class="p-1 text-rose-400 hover:text-white">
              <X :size="16"/>
            </button>
          </div>
          <template v-else>
            <h2 class="text-xl font-bold text-white">{{ displayName }}</h2>
            <button @click="startEditName" class="text-slate-500 hover:text-emerald-400 transition-colors">
              <Edit3 :size="16" />
            </button>
          </template>
        </div>
        <p class="text-slate-400 text-xs mt-1" v-if="authStore.user?.userId">
          UID: {{ authStore.user.userId }}
        </p>
        <p class="text-slate-400 text-xs mt-1" v-else-if="authStore.user?.username">
          账号: {{ authStore.user.username }}
        </p>
        <p class="text-slate-400 text-xs mt-1" v-else-if="authStore.user?.id">
          ID: {{ authStore.user.id }}
        </p>
      </div>

      <!-- 用户统计信息 -->
      <div class="flex justify-around mt-6">
        <div class="text-center">
          <div class="text-lg font-mono font-bold text-white">
            {{ authStore.user?.totalOrders || '0' }}
          </div>
          <div class="text-[10px] text-slate-500 uppercase">{{ t.profile.totalOrders }}</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-mono font-bold text-emerald-400">
            {{ authStore.user?.successRate || '99%' }}
          </div>
          <div class="text-[10px] text-slate-500 uppercase">{{ t.profile.rate }}</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-mono font-bold text-white">
            {{ authStore.user?.level || 'Level 1' }}
          </div>
          <div class="text-[10px] text-slate-500 uppercase">{{ t.profile.level }}</div>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto no-scrollbar">
      <!-- 交易相关 -->
      <div class="mx-4 bg-slate-900 rounded-xl overflow-hidden mb-4">
        <p class="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{{ t.profile.groupTrans }}</p>
        <MenuItem :icon="FileText" :label="t.profile.record" @click="$router.push('/transaction-history')" />
        <MenuItem :icon="CreditCard" :label="t.profile.account" @click="$router.push('/payment-account')" />
      </div>
      
      <!-- 会员中心 -->
      <div class="mx-4 bg-slate-900 rounded-xl overflow-hidden mb-4">
        <p class="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Member Center</p>
        <MenuItem :icon="Users" :label="t.profile.referral" @click="$router.push('/referral-center')" />
        <MenuItem :icon="Crown" :label="t.profile.membership" @click="$router.push('/membership')" />
      </div>

      <!-- 系统设置 -->
      <div class="mx-4 bg-slate-900 rounded-xl overflow-hidden mb-4">
        <p class="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{{ t.profile.groupSys }}</p>
        <MenuItem :icon="Shield" :label="t.profile.security" @click="$router.push('/security-center')" />
        <MenuItem :icon="Bell" :label="t.profile.notifications" @click="$router.push('/notifications')" />
        <MenuItem :icon="Gift" :label="t.profile.pointsMall" @click="$router.push('/points-mall')" />
        <MenuItem :icon="Wallet" :label="t.profile.myWallet" @click="$router.push('/my-wallet')" />
      </div>

      <!-- 账户与安全 -->
      <div class="mx-4 bg-slate-900 rounded-xl overflow-hidden">
        <p class="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{{ t.profile.accountSecurity }}</p>
        <MenuItem :icon="Lock" :label="t.profile.changePassword" @click="$router.push('/change-password')" />
        <MenuItem :icon="Key" :label="t.profile.changePin" @click="$router.push('/change-pin')" />
        <MenuItem :icon="HelpCircle" :label="t.profile.service" @click="$router.push('/customer-service')" />
        
        <!-- 退出登录按钮 -->
        <div class="p-4 mt-4">
          <NeonButton 
            variant="outline" 
            fullWidth 
            @click="handleLogout"
            :loading="loading"
            :disabled="loading"
          >
            <LogOut :size="16" class="mr-2" />{{ t.profile.logout }}
          </NeonButton>
        </div>
      </div>
    </div>

    <!-- 退出确认对话框 -->
    <div v-if="showLogoutConfirm" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 rounded-2xl p-6 w-full max-w-sm mx-auto border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-4">{{ t.profile.confirmLogout }}</h3>
        <p class="text-slate-400 text-sm mb-6">{{ t.profile.logoutConfirmMessage }}</p>
        <div class="flex space-x-3">
          <button 
            @click="showLogoutConfirm = false"
            class="flex-1 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            {{ t.common.cancel }}
          </button>
          <button 
            @click="confirmLogout"
            class="flex-1 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-500 transition-colors"
          >
            {{ t.common.confirm }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Camera, 
  Check, 
  X, 
  Edit3, 
  FileText, 
  CreditCard, 
  Users, 
  Crown, 
  Shield, 
  User, 
  LogOut,
  Bell,
  Gift,
  Wallet,
  Lock,
  Key,
  HelpCircle
} from 'lucide-vue-next'
import NeonButton from '@/components/NeonButton.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import MenuItem from '@/components/MenuItem.vue'
import { useTranslation } from '@/composables/useTranslation'
import { useAuthStore } from '@/stores/auth'
import { showToast } from '@/utils/notification'

const router = useRouter()
const authStore = useAuthStore()
const { t, lang, setLang } = useTranslation()

// 响应式数据
const isEditingName = ref(false)
const tempName = ref('')
const fileInputRef = ref(null)
const showLogoutConfirm = ref(false)
const loading = ref(false)

// 计算属性
const userInfo = computed(() => {
  // 从本地存储和认证存储中合并用户信息
  const localUserInfo = JSON.parse(localStorage.getItem('user_info') || '{}')
  return {
    ...localUserInfo,
    ...authStore.user
  }
})

const displayName = computed(() => {
  return userInfo.value.nickname || 
         userInfo.value.username || 
         userInfo.value.name || 
         t.value.profile.defaultName
})

const defaultAvatar = computed(() => {
  const seed = userInfo.value.username || 
              userInfo.value.nickname || 
              userInfo.value.userId || 
              'User'
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
})

// 方法
function startEditName() {
  tempName.value = displayName.value
  isEditingName.value = true
}

function handleNameSave() {
  if (tempName.value.trim()) {
    // 更新认证存储中的用户信息
    authStore.updateUserInfo({ nickname: tempName.value.trim() })
    showToast({
      type: 'success',
      title: t.value.profile.updateSuccess,
      message: t.value.profile.nameUpdated
    })
  }
  isEditingName.value = false
}

function handleAvatarClick() {
  fileInputRef.value.click()
}

function handleFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    // 验证文件类型和大小
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 2 * 1024 * 1024 // 2MB
    
    if (!validTypes.includes(file.type)) {
      showToast({
        type: 'error',
        title: t.value.profile.uploadError,
        message: t.value.profile.invalidImageType
      })
      return
    }
    
    if (file.size > maxSize) {
      showToast({
        type: 'error',
        title: t.value.profile.uploadError,
        message: t.value.profile.imageTooLarge
      })
      return
    }
    
    const reader = new FileReader()
    reader.onloadend = () => {
      // 更新用户头像
      authStore.updateUserInfo({ avatar: reader.result })
      showToast({
        type: 'success',
        title: t.value.profile.updateSuccess,
        message: t.value.profile.avatarUpdated
      })
    }
    reader.onerror = () => {
      showToast({
        type: 'error',
        title: t.value.profile.uploadError,
        message: t.value.profile.uploadFailed
      })
    }
    reader.readAsDataURL(file)
  }
}

function handleLogout() {
  showLogoutConfirm.value = true
}

async function confirmLogout() {
  loading.value = true
  
  try {
    // 调用认证存储的 logout 方法
    authStore.logout()
    
    // 显示退出成功提示
    showToast({
      type: 'success',
      title: t.value.profile.logoutSuccess,
      message: t.value.profile.logoutSuccessMessage
    })
    
    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    showToast({
      type: 'error',
      title: t.value.profile.logoutError,
      message: t.value.profile.logoutErrorMessage
    })
  } finally {
    loading.value = false
    showLogoutConfirm.value = false
  }
}

// 组件挂载时检查登录状态
onMounted(() => {
  if (!authStore.isAuthenticated) {
    // 如果未登录，重定向到登录页
    router.push('/login')
  }
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

.animate-in {
  animation-duration: 200ms;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-in {
  animation-name: fadeIn;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>