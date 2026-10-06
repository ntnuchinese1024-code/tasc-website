// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // 網站的正式網址。設定它之後，Astro 才知道怎麼組出「完整網址」，
  // 給 canonical 標籤（告訴 Google 哪一個網址才是正版）等用途使用。
  // 主網址是不含 www 的版本。www.tasctaiwan.tw 也掛在同一個 Cloudflare Worker 上。
  // 這個值同時決定 canonical 與 sitemap 裡的網址，改了要跟部署設定一起改。
  site: 'https://tasctaiwan.tw',

  integrations: [
    sitemap({
      // /anniversary 是一個轉址通道，本身設了 noindex（正版內容在報名系統那邊）。
      // 既然請 Google 不要收錄，就不該同時把它列在 sitemap 裡要求收錄——
      // 那會在 Search Console 留下一則「已提交的網址標記為 noindex」的警告，
      // 久了會讓真正該注意的錯誤被雜訊蓋掉。
      filter: (page) => !page.includes("/anniversary"),
    }),
  ],
});