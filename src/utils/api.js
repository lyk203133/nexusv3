import axios from 'axios'

export const api = axios.create({
  // 使用 import.meta.env 代替 process.env
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // 处理 401 未授权错误
    if (error.response?.status === 401) {
      // 清除认证信息
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      
      // 如果当前不是登录页，跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// 导出常用的请求方法
export const get = (url, config = {}) => api.get(url, config)
export const post = (url, data, config = {}) => api.post(url, data, config)
export const put = (url, data, config = {}) => api.put(url, data, config)
export const del = (url, config = {}) => api.delete(url, config)
export const patch = (url, data, config = {}) => api.patch(url, data, config)