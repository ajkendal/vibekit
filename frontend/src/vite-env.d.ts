/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GF_API_KEY?: string
  readonly VITE_DELETE_PASSWORD?: string
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
