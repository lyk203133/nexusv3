import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // Language state
  // 初始化時：優先讀取緩存 
  const savedLang = localStorage.getItem('app_lang')  
  const lang = ref(savedLang || 'zh-TW')
  
  // User info
  const userInfo = ref({
    nickname: 'Player_99',
    avatar: null
  })

  // Mock data
  const assetBalance = ref(15000)
  const frozenBalance = ref(20000)
  const totalAssets = ref(35000)

  const todayStats = ref({
    buy: 2500,
    sell: 1800,
    buyRate: "+15.5%",
    sellStatus: "Trading"
  })

  const walletStats = ref({
    totalDeposit: 150000,
    totalWithdraw: 0,
    totalFees: 250
  })

  // Methods
  function setLang(newLang) {
    lang.value = newLang
    // 同步到本地儲存
    localStorage.setItem('app_lang', newLang)
  }

  function updateUserInfo(info) {
    userInfo.value = { ...userInfo.value, ...info }
  }

  return {
    lang,
    userInfo,
    assetBalance,
    frozenBalance,
    totalAssets,
    todayStats,
    walletStats,
    setLang,
    updateUserInfo
  }
})

