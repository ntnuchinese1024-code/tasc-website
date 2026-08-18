import type { APIRoute } from "astro";
import { IS_PREVIEW } from "../lib/site";

// 預覽期間請搜尋引擎不要收錄整個網站；正式上線後（IS_PREVIEW 改成 false）自動開放。
export const GET: APIRoute = () => {
  const body = IS_PREVIEW
    ? "User-agent: *\nDisallow: /\n"
    : "User-agent: *\nAllow: /\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
