/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production'
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}