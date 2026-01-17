/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DASHBOARD_API_KEY: string;
  readonly VITE_CF_ACCOUNT_HASH: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_SUBTITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
