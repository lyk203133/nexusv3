<template>
  <div 
    ref="container"
    class="w-full h-[100dvh] bg-black text-slate-200 font-sans flex items-center justify-center bg-fixed overflow-hidden touch-pan-y"
    style="background-image: radial-gradient(circle at 50% 120%, #1e293b 10%, #000000 80%)"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- 下拉刷新指示器 -->
    <div 
      ref="refreshIndicator"
      class="absolute top-0 left-0 right-0 flex flex-col items-center justify-center overflow-hidden transition-transform duration-300 ease-out z-50"
      :style="{ transform: `translateY(${pullDistance}px)`, height: '60px',zIndex:-1 }"
    >
      <div class="flex items-center justify-center space-x-2">
        <div 
          v-if="isRefreshing"
          class="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"
        ></div>
        <span class="text-sm text-slate-300 font-medium">
          {{ refreshText }}
        </span>
      </div>
      <div 
        class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"
      ></div>
    </div>
    
    <!-- 主要内容容器 -->
    <div class="w-full h-full md:w-[400px] md:h-[92vh] md:max-h-[920px] md:rounded-[3rem] md:border-[8px] md:border-slate-800 bg-slate-900 overflow-hidden relative shadow-2xl flex flex-col transition-all duration-300">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" ref="currentComponent" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const container = ref(null)
const refreshIndicator = ref(null)
const currentComponent = ref(null)
const route = useRoute()

// 下拉刷新状态
const pullDistance = ref(0)
const startY = ref(0)
const currentY = ref(0)
const isPulling = ref(false)
const isRefreshing = ref(false)
const canRefresh = ref(false)
const refreshText = ref('')

// 刷新阈值
const REFRESH_THRESHOLD = 80
const MAX_PULL_DISTANCE = 120

// 触摸开始
const onTouchStart = (e) => {
  // 只有页面在顶部时才允许下拉刷新
  if (container.value.scrollTop > 0) return
  
  startY.value = e.touches[0].clientY
  currentY.value = startY.value
  isPulling.value = true
  canRefresh.value = false
}

// 触摸移动
const onTouchMove = (e) => {
  if (!isPulling.value) return
  
  currentY.value = e.touches[0].clientY
  const diff = currentY.value - startY.value
  
  // 只允许下拉，不允许上拉触发刷新
  if (diff > 0) {
    e.preventDefault()
    
    // 限制最大下拉距离
    pullDistance.value = Math.min(diff * 0.5, MAX_PULL_DISTANCE)
    
    // 更新刷新状态文本
    if (pullDistance.value > REFRESH_THRESHOLD) {
      canRefresh.value = true
      refreshText.value = ''
    } else {
      canRefresh.value = false
      refreshText.value = ''
    }
  }
}

// 触摸结束
const onTouchEnd = async () => {
  if (!isPulling.value) return
  
  if (canRefresh.value && !isRefreshing.value) {
    // 触发刷新
    isRefreshing.value = true
    refreshText.value = 'loading...'
    
    // 保持刷新状态
    pullDistance.value = REFRESH_THRESHOLD
    
    try {
      // 调用当前页面的刷新方法（如果存在）
      if (currentComponent.value && typeof currentComponent.value.refresh === 'function') {
        await currentComponent.value.refresh()
      } else {
        // 否则直接刷新页面
        await refreshPage()
      }
      
      refreshText.value = ''
      
      // 短暂显示成功状态
      setTimeout(() => {
        isRefreshing.value = false
        pullDistance.value = 0
        refreshText.value = ''
      }, 800)
    } catch (error) {
      refreshText.value = 'error'
      setTimeout(() => {
        isRefreshing.value = false
        pullDistance.value = 0
        refreshText.value = ''
      }, 1500)
    }
  } else {
    // 未达到阈值，回弹
    pullDistance.value = 0
    refreshText.value = ''
  }
  
  isPulling.value = false
  canRefresh.value = false
}

// 页面刷新函数
const refreshPage = async () => {
  // 这里可以根据需要执行不同的刷新逻辑
  // 例如：重新获取数据、重新加载页面等
  
  // 如果是订单页面，可能需要重新获取订单数据
  if (route.path.includes('orders')) {
    console.log('刷新订单数据')
    // 触发订单刷新事件
    window.dispatchEvent(new CustomEvent('refresh-orders'))
  }
  
  // 模拟网络请求延迟
  return new Promise(resolve => {
    setTimeout(resolve, 800)
  })
}

// 监听键盘刷新快捷键（Cmd+R 或 Ctrl+R）
const onKeyDown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
    e.preventDefault()
    triggerRefresh()
  }
}

// 手动触发刷新
const triggerRefresh = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  pullDistance.value = REFRESH_THRESHOLD
  refreshText.value = '刷新中...'
  
  try {
    if (currentComponent.value && typeof currentComponent.value.refresh === 'function') {
      await currentComponent.value.refresh()
    } else {
      await refreshPage()
    }
    
    refreshText.value = '刷新成功'
    setTimeout(() => {
      isRefreshing.value = false
      pullDistance.value = 0
    }, 800)
  } catch (error) {
    refreshText.value = '刷新失败'
    setTimeout(() => {
      isRefreshing.value = false
      pullDistance.value = 0
    }, 1500)
  }
}

// 添加全局刷新方法
const setupGlobalRefresh = () => {
  window.__refreshApp = triggerRefresh
}

onMounted(() => {
  setupGlobalRefresh()
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.touch-pan-y {
  touch-action: pan-y;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 刷新指示器动画 */
.refresh-indicator-enter-active,
.refresh-indicator-leave-active {
  transition: all 0.3s ease;
}

.refresh-indicator-enter-from,
.refresh-indicator-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>