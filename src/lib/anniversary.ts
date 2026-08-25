/**
 * 會慶「凱道辦桌・時光留言席」的狀態查詢。
 *
 * 留言頁本體住在報名系統（需要資料庫），官網這邊只負責兩件事：
 * 首頁橫幅要顯示什麼、以及把訪客導過去。
 *
 * 跟 registration-api.ts 同樣的原則：**抓不到絕對不能讓官網建置失敗**。
 * 這裡回 null，橫幅就整塊不顯示——首頁少一條橫幅沒有人會受傷，
 * 但官網發布不出去是大事。
 */

import { REGISTRATION_ORIGIN } from "./registration-api";

export type AnniversaryMode = "closed" | "active" | "archived";

export interface AnniversaryState {
  mode: AnniversaryMode;
  /** 目前總席次（不受回傳筆數限制影響）。 */
  total: number;
}

/** 官網只要數字與狀態，所以 limit=1：不必把幾百則留言整包搬過來。 */
const STATE_URL = `${REGISTRATION_ORIGIN}/api/anniversary/messages?limit=1`;

export async function getAnniversaryState(): Promise<AnniversaryState | null> {
  try {
    const res = await fetch(STATE_URL, { headers: { accept: "application/json" } });
    if (!res.ok) {
      console.warn(`[anniversary] 查詢會慶狀態失敗（HTTP ${res.status}），首頁橫幅將不顯示。`);
      return null;
    }

    const data = (await res.json()) as { mode?: string; total?: number; count?: number };
    const mode = data.mode;
    if (mode !== "closed" && mode !== "active" && mode !== "archived") return null;

    // total 是後來才加的欄位，萬一報名系統還沒更新就退回用 count
    return { mode, total: data.total ?? data.count ?? 0 };
  } catch (error) {
    console.warn("[anniversary] 連不上報名系統，首頁橫幅將不顯示：", error);
    return null;
  }
}
