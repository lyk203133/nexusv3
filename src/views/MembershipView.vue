<template>
  <div class="flex flex-col h-full bg-slate-900">
    <div class="p-4 flex items-center bg-slate-800 shadow-lg z-10">
      <button @click="$router.push('/profile')" class="p-2 mr-2">
        <ArrowLeft class="text-white" />
      </button>
      <div>
        <h2 class="text-white font-bold text-lg">{{ t.membership.title }}</h2>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto p-5 pb-24 no-scrollbar">
      <!-- Current Level Card -->
      <div class="bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(234,179,8,0.2)] mb-8 relative overflow-hidden border border-yellow-400/30">
        <div class="relative z-10 text-white">
          <div class="flex justify-between items-start mb-6">
            <div>
              <p class="text-yellow-100/70 text-[10px] font-bold uppercase tracking-wider mb-1">{{ t.membership.current }}</p>
              <h1 class="text-3xl font-black italic tracking-tighter flex items-center gap-2 drop-shadow-md">
                <Award :size="36" class="text-yellow-200" /> 
                <template v-if="userLevel.code === 'bronze'">
                  {{ t.membership.levels.bronze }}
                </template>
                <template v-else-if="userLevel.code === 'silver'">
                  {{ t.membership.levels.silver }}
                </template>
                <template v-else-if="userLevel.code === 'gold'">
                  {{ t.membership.levels.gold }}
                </template>
                <template v-else-if="userLevel.code === 'platinum'">
                  {{ t.membership.levels.platinum }}
                </template>
              </h1>
            </div>
            <!--div class="bg-black/40 backdrop-blur-xl px-4 py-1.5 rounded-2xl text-[10px] font-black border border-white/20 shadow-inner">LV. 3 VIP</div-->
          </div>
          
          <!-- Progress Section -->
          <div class="bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div class="mb-3 flex justify-between items-end">
              <div>
                <span class="text-[10px] font-bold text-yellow-100/80 block uppercase mb-0.5">{{ t.membership.expLabel }}</span>
                <span class="text-xl font-mono font-black text-white tracking-tight">{{ userLevel.totalPay }} <span class="text-xs text-yellow-200/60 font-normal">/ {{ userLevel.nextLevel_totalPay }}</span></span>
              </div>
              <span class="text-[10px] font-black text-yellow-100 uppercase bg-white/10 px-2 py-1 rounded-lg border border-white/10">{{ userLevel.levelPercent }}%</span>
            </div>
            <div class="w-full h-3 bg-black/40 rounded-full overflow-hidden p-[2px] border border-white/5">
              <div :style="`width: ${userLevel.levelPercent}%`" class="h-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-white w-[36.5%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000"></div>
            </div>

            <template v-if="userLevel.code === 'bronze'">
              <p class="mt-3 text-center text-[10px] font-bold text-yellow-500 bg-black/40 py-1 rounded-lg tracking-widest">
                {{ t.membership.next }}: {{ t.membership.levels.silver }}
              </p>
            </template>
            <template v-else-if="userLevel.code === 'silver'">
              <p class="mt-3 text-center text-[10px] font-bold text-yellow-500 bg-black/40 py-1 rounded-lg tracking-widest">
                {{ t.membership.next }}: {{ t.membership.levels.gold }}
              </p>
            </template>
            <template v-else-if="userLevel.code === 'gold'">
              <p class="mt-3 text-center text-[10px] font-bold text-yellow-500 bg-black/40 py-1 rounded-lg tracking-widest">
                {{ t.membership.next }}: {{ t.membership.levels.platinum }}
              </p>
            </template>
            
          </div>
        </div>
        <!-- Decorative background element -->
        <div class="absolute -bottom-16 -right-16 text-white/5 rotate-12 transition-transform hover:scale-110 duration-700">
          <Crown :size="240" />
        </div>
      </div>

      <!-- Exclusive Privileges Icons -->
      <!--div class="grid grid-cols-4 gap-3 mb-8">
        <div class="flex flex-col items-center gap-2">
          <div class="w-12 h-12 bg-slate-800 rounded-2xl border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-lg">
            <Zap :size="22" />
          </div>
          <span class="text-[10px] font-bold text-slate-400 text-center">{{ t.membership.privilege.fast }}</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <div class="w-12 h-12 bg-slate-800 rounded-2xl border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-lg">
            <Headphones :size="22" />
          </div>
          <span class="text-[10px] font-bold text-slate-400 text-center">{{ t.membership.privilege.support }}</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <div class="w-12 h-12 bg-slate-800 rounded-2xl border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-lg">
            <Star :size="22" />
          </div>
          <span class="text-[10px] font-bold text-slate-400 text-center">{{ t.membership.privilege.event }}</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <div class="w-12 h-12 bg-slate-800 rounded-2xl border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-lg">
            <Gift :size="22" />
          </div>
          <span class="text-[10px] font-bold text-slate-400 text-center">{{ t.membership.privilege.limited }}</span>
        </div>
      </div-->

      <h3 class="text-white font-black text-sm mb-4 flex items-center gap-2 uppercase tracking-tighter">
        <div class="w-1 h-4 bg-yellow-500 rounded-full"></div>
        {{ t.membership.benefit }}
      </h3>
      
      <div class="space-y-4 mb-10">
        <div 
          v-for="lvl in membershipLevels" 
          :key="lvl.name" 
          :class="`bg-slate-800/40 border rounded-2xl p-5 relative overflow-hidden transition-all hover:bg-slate-800/60 ${lvl.border}`"
        >
          <div class="flex justify-between items-center mb-4">
            <h4 :class="`font-black text-lg italic tracking-tight uppercase ${lvl.color}`">{{ t.membership.levels[lvl.name] }}</h4>
            <span v-if="lvl.name === userLevel.code" class="text-[10px] bg-yellow-500 text-black px-3 py-1 rounded-full font-black shadow-[0_0_15px_rgba(234,179,8,0.4)] animate-pulse">CURRENT</span>
            <span v-else class="text-[10px] text-slate-500 font-bold">{{ lvl.exp }} EXP</span>
          </div>
          <div class=" grid-cols-3 gap-3" style="text-align: center;">
            <!--div class="bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <p class="text-slate-500 text-[9px] font-bold uppercase mb-1">{{ t.membership.table.fee }}</p>
              <p class="text-white font-mono font-black text-sm tracking-tight">{{ lvl.fee }}</p>
            </div>
            <div class="bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <p class="text-slate-500 text-[9px] font-bold uppercase mb-1">{{ t.membership.table.limit }}</p>
              <p class="text-white font-mono font-black text-sm tracking-tight">{{ lvl.limit }}</p>
            </div-->
            <div class="bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <p class="text-slate-500 text-[9px] font-bold uppercase mb-1">{{ t.membership.table.bonus }}</p>
              <p class="text-emerald-400 font-mono font-black text-sm tracking-tight">+{{ lvl.bonus }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch,defineExpose, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Award, Crown, Zap, Headphones, Star, Gift } from 'lucide-vue-next'
import { useTranslation } from '@/composables/useTranslation'
import { useAuthStore } from '@/stores/auth'
import { api, post } from '@/utils/api'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useTranslation()

const membershipLevels = ref([
  { level: 'bronze', name: 'bronze', limit: '500,000', bonus: '0', color: 'text-amber-600', border: 'border-amber-600/50', exp: '0' },
  { level: 'silver', name: 'silver', limit: '1,000,000', bonus: '0.1', color: 'text-slate-300', border: 'border-slate-400/50', exp: '5,000' },
  { level: 'gold', name: 'gold', limit: '5,000,000', bonus: '0.2', color: 'text-yellow-400', border: 'border-yellow-400/50', exp: '15,000' },
  { level: 'platinum', name: 'platinum', limit: 'Unlimited', bonus: '0.5', color: 'text-cyan-400', border: 'border-cyan-400/50', exp: '50,000' },
])

const userLevel = ref({})

async function fetchLevelData() {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }


  try {
    const response = await api.get('/user/level-data')
    
    if (response.data.success) {
      userLevel.value = response.data.data.userLevel
      let level = response.data.data.level
      
      level.forEach((item, index) => {
        membershipLevels.value[index].bonus = item.commission_rate
        membershipLevels.value[index].exp = item.pay_volume
      });

    } 
  } catch (err) {
    console.error(' error:', err)
    
    // 如果 token 失效，清除登录状态
    if (err.response?.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  } finally {
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  fetchLevelData()

})
</script>

