/**
 * 網站目前的狀態。
 *
 * IS_PREVIEW = true  →  給理監事審閱的預覽版：
 *   1. 網頁上方會出現一條「這是預覽版」的提示條
 *   2. 網站會請 Google 等搜尋引擎不要收錄（避免跟舊的 Weebly 站在搜尋結果打架）
 *
 * IS_PREVIEW = false →  正式上線版：上面兩件事都會自動消失。
 *
 * 👉 正式對外公開的那一天，把下面這行的 true 改成 false，重新發布一次就好，
 *    其他檔案都不用動。
 */
export const IS_PREVIEW = true;

/** 預覽版提示條上寫的回饋方式 */
export const PREVIEW_FEEDBACK_EMAIL = "tasc.tw@gmail.com";
