import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { TRANSLATIONS } from '@/i18n/translations'

export function useTranslation() {
  const store = useAppStore()
  
  // 增加 Fallback 機制，萬一找不到語系，預設回傳 VN
  const t = computed(() => {
    return TRANSLATIONS[store.lang] || TRANSLATIONS['vi-VN']
  })
  
  return {
    t,
    lang: computed(() => store.lang),
    setLang: (newLang) => store.setLang(newLang)
  }
}