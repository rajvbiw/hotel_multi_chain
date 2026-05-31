/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_GATEWAY_URL?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
