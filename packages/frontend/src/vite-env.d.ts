/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
