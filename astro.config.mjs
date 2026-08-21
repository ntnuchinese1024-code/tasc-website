// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // 網站的正式網址。設定它之後，Astro 才知道怎麼組出「完整網址」，
  // 給 canonical 標籤（告訴 Google 哪一個網址才是正版）等用途使用。
  // 主網址選 www 版：tasctaiwan.tw 會由 Netlify 自動 301 轉過來。
  site: 'https://www.tasctaiwan.tw',
});
