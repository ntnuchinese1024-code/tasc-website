## Project context

台灣性諮商學會（TASC）官網。取代原本到期的 Weebly 網站。核心原則：內容與程式碼要能完全脫離任何平台獨立搬遷（見 `README.md`），未來維護者不一定有工程背景，可能透過 AI 協作編輯內容（見 `docs/維護手冊.md`）。舊站完整內容備份於 `archive/weebly-content/`。這個專案跟同一台機器上的 `sexpsy-website` 完全獨立，不共用 repo、不共用網域、不共用內容——不要把兩者的檔案或設定混在一起。

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
