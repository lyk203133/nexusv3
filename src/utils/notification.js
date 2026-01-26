/**
 * 純 JS + Tailwind 實現的輕量級 Toast
 */
export function showToast(options) {
  const { type = 'info', message, duration = 3000 } = options

  // 1. 建立容器 (如果不存在)
  let container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    // 固定在螢幕上方中間
    container.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90%] max-w-xs pointer-events-none'
    document.body.appendChild(container)
  }

  // 2. 建立 Toast 元素
  const toast = document.createElement('div')
  
  // 根據類型設定顏色
  const bgColor = type === 'error' ? 'bg-rose-500/95' : 'bg-emerald-500/95'
  
  toast.className = `${bgColor} text-white px-4 py-3 rounded-xl shadow-2xl flex items-center transition-all duration-300 opacity-0 -translate-y-2 pointer-events-auto font-bold text-sm`
  
  // 設定內容 (這裡簡單用文字，如果需要圖示也可以)
  toast.innerHTML = `
    <span class="flex-1">${message}</span>
  `

  container.appendChild(toast)

  // 3. 動畫進場
  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', '-translate-y-2')
  })

  // 4. 定時移除
  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2')
    setTimeout(() => {
      if (toast.parentNode) container.removeChild(toast)
      // 如果容器空了就移除容器
      if (container.childNodes.length === 0) {
        document.body.removeChild(container)
      }
    }, 300)
  }, duration)
}