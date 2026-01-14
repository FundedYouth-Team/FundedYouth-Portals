/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USER_PORTAL_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
