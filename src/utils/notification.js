export function showToast(options) {
  // 这里可以使用你喜欢的 toast 库，如 vue-toastification
  // 或者使用浏览器原生 alert/自定义组件
  
  const { type = 'info', title, message } = options
  
  if (typeof window !== 'undefined' && window.toast) {
    window.toast[type](message)
  } else {
    // 简单的浏览器提示
    alert(`${title}: ${message}`)
  }
}