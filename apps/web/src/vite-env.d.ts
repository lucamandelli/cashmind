/// <reference types="vite/client" />

// SVG files imported as URLs (Vite's default ?url behavior is implicit for
// image imports; declare the module so TypeScript resolves them as strings).
declare module "*.svg" {
  const src: string;
  export default src;
}
