<template>
  <div class="flex flex-col items-center justify-center h-screen bg-slate-900">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-red-500 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-white mb-6">页面未找到</h2>
      <p class="text-slate-400 mb-8">您访问的页面不存在或已被移除</p>
      <div class="space-x-4">
        <button 
          @click="$router.go(-1)" 
          class="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          返回上一页
        </button>
        <button 
          @click="$router.push('/dashboard')" 
          class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 404页面
</script>