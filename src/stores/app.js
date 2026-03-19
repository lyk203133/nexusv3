import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // Language mapping
  const langMap = {
    'vn': 'vi-VN',
    'vi-VN': 'vi-VN',
    'tw': 'zh-TW',
    'zh-TW': 'zh-TW',
    'zh': 'zh-TW',
    'en': 'en-US',
    'en-US': 'en-US'
  }

  // Get lang from URL parameter if present
  const urlParams = new URLSearchParams(window.location.search)
  const queryLang = urlParams.get('lang')
  let initialLang = null

  if (queryLang && langMap[queryLang.toLowerCase()]) {
    initialLang = langMap[queryLang.toLowerCase()]
    localStorage.setItem('app_lang', initialLang)
  }

  // Language state
  // 初始化時：優先從 URL 讀取，再讀取緩存，最後默認 VN
  const savedLang = localStorage.getItem('app_lang')  
  const lang = ref(initialLang || savedLang || 'vi-VN')
  
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

