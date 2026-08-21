// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // 網站的正式網址。設定它之後，Astro 才知道怎麼組出「完整網址」，
  // 給 canonical 標籤（告訴 Google 哪一個網址才是正版）等用途使用。
  // 主網址是不含 www 的版本，跟 Netlify 上設定的 Primary domain 一致。
  // www.tasctaiwan.tw 會由 Netlify 自動 301 轉過來。
  // 若日後把 Netlify 的 Primary domain 改成 www 版，這裡也要一起改，兩邊必須相同。
  site: 'https://tasctaiwan.tw',
});
