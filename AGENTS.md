## Project context

台灣性諮商學會（TASC）官網。取代原本到期的 Weebly 網站。核心原則：內容與程式碼要能完全脫離任何平台獨立搬遷（見 `README.md`），未來維護者不一定有工程背景，可能透過 AI 協作編輯內容（見 `docs/維護手冊.md`）。舊站完整內容備份於 `archive/weebly-content/`。這個專案跟同一台機器上的 `sexpsy-website` 完全獨立，不共用 repo、不共用網域、不共用內容——不要把兩者的檔案或設定混在一起。

**動手前先讀 `docs/開發決策與踩坑紀錄.md`**：裡面寫了部署架構（Cloudflare）、刻意的設計、被否決過的提案、踩過的坑。

### 專案知識一律寫進 repo（重要）

這個專案會由不同的人、不同的 Claude 帳號、不同的電腦接手。**任何關於本專案的決策、慣例、踩坑、待辦，一律寫進這個 repo**（本檔、`docs/開發決策與踩坑紀錄.md`、`docs/維護手冊.md`），**不要寫進 Claude 的個人／自動記憶（memory）**。個人記憶只存在某一台電腦的某一個帳號裡，換人換機器就消失。
寫之前先記得：這個 repo 是**公開的**，不能寫入金鑰、hook 網址、個人資料。這類資訊只能放在 Cloudflare／GitHub secrets，或寫在私有的 `tasc-registration` repo 的文件裡（只寫「放在哪裡」，不寫值）。

### 跟報名系統的關係

官網部署在 Cloudflare Worker `tasctaiwan`（不是 Netlify，`netlify` 相關的舊文件都已過時）。
報名、問卷、會員、後台在另一個 repo `tasc-registration`（Next.js + Supabase，`tasc-registration.vercel.app`）。
官網建置時抓它的 `/api/events`（課程與報導）；官網上的表單用 fetch POST 到它的 `/api/...`；秘書處在它的 `/admin/*` 管理。
**學會要做表單、問卷、報名，一律做進這兩個 repo，不要用 Google 表單。**
報導的 slug 要跟報名系統那場活動一致（例：`event-260820-f2nk`），後台補寫的報導才會覆蓋這裡的同一篇。

換電腦、換帳號或交接時，照 `tasc-registration/docs/搬遷與交接清單.md` 走。推到 `main` 會直接上線，做到一半的內容請推到別的分支。

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Commit 規則（重要）

**這個 repo 的 commit 訊息不要加 `Co-Authored-By` 尾註。**

（以下是當年部署在 Netlify 時的原因。2026-08-21 已搬到 Cloudflare，但慣例維持不變。）

網站當時部署在 Netlify，免費方案對私有 repo 只允許一位 Git 貢獻者，
而 Netlify 會把 commit 訊息裡的 co-author 也算成一位貢獻者。
加了那一行，建置就會失敗並顯示 "unrecognized Git contributor"，
而且失敗訊息不會提到 co-author，很難聯想到原因（2026-08-19 實際踩過，
官網因此有一整天沒能成功更新，線上停在更早的版本）。

作者身分統一用 repo 既有的 `Drlin <ntnuchinese1024@gmail.com>`。
