/**
 * 課程認證對照資料
 *
 * 來源：學會「性諮商師課程認證學分申請」表單的審核紀錄（2024/05 – 2026/07，共 28 件），
 * 由沛辰於 2026-08-18 提供 Excel 匯出檔。
 *
 * 已刻意「不」放進網站的欄位：申請人姓名、電子郵件、聯絡電話、講師學經歷、
 * 委員審核意見中的委員姓名。委員意見只保留與課程認定有關的內容，並改寫成中性敘述。
 *
 * 新增一筆已審核課程 → 在 approvedCourses 陣列最後加一筆即可，頁面會自動出現在
 * 「課程對照表」與「依類別反查」兩個區塊。
 */

export type BucketId = "A" | "B" | "T" | "S";

export interface Topic {
  no: number;
  /** 認證辦法原文的完整領域敘述 */
  title: string;
  /** 表格標籤用的短名 */
  short: string;
}

export interface Bucket {
  id: BucketId;
  /** 認證辦法的條次，例如「伍-A」 */
  code: string;
  name: string;
  shortName: string;
  hours: string;
  hoursNote: string;
  /** 每個主題的時數上下限規則 */
  rule: string;
  color: string;
  colorText: string;
  topics: Topic[];
}

export const buckets: Bucket[] = [
  {
    id: "A",
    code: "伍-A",
    name: "人類性學相關教育　A. 必修課程",
    shortName: "A 必修",
    hours: "36",
    hoursNote: "小時（與 B 選修合計 48 小時）",
    rule: "以下 11 個領域必須全部包含，每個主題最少 3 小時，單一主題最多認證 12 小時。",
    color: "var(--magenta)",
    colorText: "var(--magenta-deep)",
    topics: [
      { no: 1, title: "性諮商/性教育/性學研究之倫理守則與倫理行為", short: "倫理守則與倫理行為" },
      { no: 2, title: "生物-心理-社會觀點的全人性發展", short: "全人性發展" },
      { no: 3, title: "國家政策、社會文化、宗教信仰、性別角色/意識、家庭因素與性價值跟性行為的關聯", short: "社會文化與性價值" },
      { no: 4, title: "性取向、性別認同相關議題：性取向包含異性戀、同性戀、雙性戀、泛性戀、無性戀等，性別認同包含跨性別、多元性別等，性別氣質表達", short: "性取向與性別認同" },
      { no: 5, title: "兒童、青少年親職性教育/性諮詢的理論與應用", short: "兒少親職性教育" },
      { no: 6, title: "兒童、青少年性教育的理論與應用", short: "兒童、青少年性教育" },
      { no: 7, title: "性與生殖解剖生理學", short: "性與生殖解剖生理學" },
      { no: 8, title: "影響性健康相關醫學因子，如疾病、失能、藥物使用、心理健康、受孕與懷孕、生產與懷孕結束、避孕、後天人類免疫缺乏病毒/愛滋病、性傳染病、感染、性創傷與安全性行為", short: "影響性健康的醫學因子" },
      { no: 9, title: "性功能、性反應與性行為樣貌相關知識", short: "性功能、性反應與性行為" },
      { no: 10, title: "性功能障礙診斷標準", short: "性功能障礙診斷標準" },
      { no: 11, title: "親密關係、人際技巧與家庭動力相關知識", short: "親密關係與家庭動力" },
    ],
  },
  {
    id: "B",
    code: "伍-B",
    name: "人類性學相關教育　B. 選修課程",
    shortName: "B 選修",
    hours: "12",
    hoursNote: "小時（與 A 必修合計 48 小時）",
    rule: "以下 12 個領域至少選修 5 個主題，每個主題最少 2 小時，單一主題最多認證 6 小時。",
    color: "var(--blue)",
    colorText: "var(--blue-deep)",
    topics: [
      { no: 1, title: "多元性慾與生活型態，包含BDSM、戀物癖、多重性關係與其他性偏好等專題", short: "多元性慾與生活型態" },
      { no: 2, title: "性剝削，包含未成年性剝削、性虐待、性騷擾、性猥褻與性侵害、亂倫等行為人專題", short: "性剝削（行為人）" },
      { no: 3, title: "性創傷，包含性虐待、性騷擾、性猥褻與性侵害、亂倫等被行為人專題", short: "性創傷（被行為人）" },
      { no: 4, title: "性與生育，包含懷孕性專題、不孕症與性等專題", short: "性與生育" },
      { no: 5, title: "媒體、網路與性，包含情色影片與網站，網路與社交軟體中的性", short: "媒體、網路與性" },
      { no: 6, title: "性產業，包含性工作、性消費、社會文化經濟與法律等結構性影響", short: "性產業" },
      { no: 7, title: "性與物質使用/濫用、性成癮等專題", short: "性與物質使用、性成癮" },
      { no: 8, title: "性與法律，包含兒童與少年福利法、性侵害犯罪防治法與其他兒少、性侵與性別平等相關法律及通報流程，兒童證人司法偵訊、專家證人等專題", short: "性與法律" },
      { no: 9, title: "更年期與老年性專題", short: "更年期與老年性" },
      { no: 10, title: "疾病與障礙的性專題，包含：脊髓損傷、顏面傷殘、肢體或智能障礙、視障、聽障、自閉症、性傳染疾病等", short: "疾病與障礙的性" },
      { no: 11, title: "兒童/青少年/成人性教育演講訓練、性教育媒材專題", short: "性教育演講訓練與媒材" },
      { no: 12, title: "性學研究、理論、教育、諮商與治療等相關專業歷史與研究方法", short: "性學研究與研究方法" },
    ],
  },
  {
    id: "T",
    code: "陸",
    name: "性諮商訓練",
    shortName: "性諮商訓練",
    hours: "60",
    hoursNote: "小時",
    rule: "以下 10 個領域至少選修 8 個主題，每個主題最少 5 小時，單一主題最多認證 12 小時。",
    color: "var(--green)",
    colorText: "var(--green-deep)",
    topics: [
      { no: 1, title: "性諮商治療理論與方法", short: "性諮商治療理論與方法" },
      { no: 2, title: "性議題與性人格評估技巧", short: "性議題與性人格評估" },
      { no: 3, title: "性功能障礙的診斷與醫療介入方法", short: "性功能障礙診斷與醫療介入" },
      { no: 4, title: "性教練操作技巧與教導策略", short: "性教練操作技巧" },
      { no: 5, title: "性諮商技巧與演練", short: "性諮商技巧與演練" },
      { no: 6, title: "性諮商個案研究與性心理動力解析", short: "個案研究與性心理動力" },
      { no: 7, title: "性與伴侶關係評估與處遇", short: "性與伴侶關係評估與處遇" },
      { no: 8, title: "兒童親職性諮商理論與實務", short: "兒童親職性諮商" },
      { no: 9, title: "青少年性諮商理論與實務", short: "青少年性諮商" },
      { no: 10, title: "系統合作於性諮商的應用", short: "系統合作於性諮商" },
    ],
  },
  {
    id: "S",
    code: "柒",
    name: "性態度與性價值觀之相關訓練",
    shortName: "性態度訓練",
    hours: "56",
    hoursNote: "小時（50 小時團體＋6 小時 SAR）",
    rule: "至少 50 小時性自我探索與整合團體（含性多元媒材減敏感、性歷史整理、身體意象重建、性價值觀澄清等），另加至少 6 小時獨立專題 SAR 工作坊，兩者都要繳交上課證明與心得報告。這一類沒有再細分領域編號。",
    color: "var(--orange)",
    colorText: "var(--orange-deep)",
    topics: [],
  },
];

export interface Credit {
  bucket: BucketId;
  /** S 類沒有領域編號，用 null */
  topic: number | null;
  /** 認證通過的時數；表單未載明時為 null */
  hours: number | null;
}

export type CourseStatus = "approved" | "note" | "pending";

export interface ApprovedCourse {
  title: string;
  org: string;
  instructor: string;
  date: string;
  format: string;
  /** 課程總時數（不等於認證時數） */
  totalHours: string;
  credits: Credit[];
  note?: string;
  status: CourseStatus;
}

const TASC = "台灣性諮商學會";
const HG = "荷光性諮商專業訓練中心";

export const approvedCourses: ApprovedCourse[] = [
  {
    title: "青少女情感教育增能團體的帶領動力設計與系統合作實務分享——以觸法少女為例",
    org: TASC,
    instructor: "黃怡禛、郭晏汝",
    date: "2024/06/22",
    format: "實體",
    totalHours: "2 小時",
    credits: [
      { bucket: "T", topic: 9, hours: 1 },
      { bucket: "T", topic: 10, hours: 1 },
    ],
    note: "委員認為課程領域的歸類沒有問題，但認證時數需再確認；實際認列時數請以認證委員會最後認定為準。",
    status: "note",
  },
  {
    title: "青少年數位性影像暴力與性創傷",
    org: TASC,
    instructor: "洪雅莉、許玉玲",
    date: "2024/06/22",
    format: "實體",
    totalHours: "2 小時",
    credits: [{ bucket: "B", topic: 5, hours: 2 }],
    status: "approved",
  },
  {
    title: "當代LGBTQ+青少年的發展、挑戰與新的可能",
    org: TASC,
    instructor: "彭治鏐、李翊平",
    date: "2024/06/22",
    format: "實體",
    totalHours: "2 小時",
    credits: [{ bucket: "A", topic: 4, hours: 2 }],
    status: "approved",
  },
  {
    title: "Z世代的情感和性別關鍵字：大學老師的理論與實作",
    org: TASC,
    instructor: "陳維平",
    date: "2024/10/06",
    format: "視訊",
    totalHours: "2 小時",
    credits: [{ bucket: "B", topic: 11, hours: 2 }],
    status: "approved",
  },
  {
    title: "成人性教練 Level One",
    org: `${TASC}、${HG}`,
    instructor: "李竹薇",
    date: "2024/07–09（六次，視訊四次＋現場兩次）",
    format: "視訊＋實體專業培訓課程",
    totalHours: "28 小時",
    credits: [
      { bucket: "A", topic: 9, hours: 1 },
      { bucket: "A", topic: 11, hours: 1 },
      { bucket: "B", topic: 11, hours: 14 },
      { bucket: "T", topic: 4, hours: 12 },
    ],
    note: "長時數培訓課程會拆分到多個認證類別，四個類別的時數相加不等於課程總時數。",
    status: "approved",
  },
  {
    title: "能力建構取向性諮商與性發展概論",
    org: `${TASC}、${HG}`,
    instructor: "呂嘉惠",
    date: "2024（一月班／四月班，各十次）",
    format: "視訊專業培訓課程",
    totalHours: "15 小時",
    credits: [
      { bucket: "A", topic: 2, hours: 8 },
      { bucket: "A", topic: 3, hours: 2 },
      { bucket: "T", topic: 1, hours: 5 },
    ],
    status: "approved",
  },
  {
    title: "AV騙很大？你看得很爽的都是假的？",
    org: TASC,
    instructor: "金派經紀人 CL",
    date: "2025/03/09",
    format: "視訊",
    totalHours: "2 小時",
    credits: [{ bucket: "B", topic: 5, hours: null }],
    note: "申請表單上的認證時數欄位未填寫，認列時數請洽認證委員會確認。",
    status: "note",
  },
  {
    title: "跟蹤騷擾防制法的大小事－騷擾態樣與上路後的實務現況",
    org: TASC,
    instructor: "柯萱如",
    date: "2025/03/30",
    format: "視訊",
    totalHours: "2 小時",
    credits: [{ bucket: "B", topic: 8, hours: 2 }],
    status: "approved",
  },
  {
    title: "Z世代的情感和性別關鍵字：大學老師的理論與實作",
    org: TASC,
    instructor: "陳維平",
    date: "2025/04/13",
    format: "視訊",
    totalHours: "2 小時",
    credits: [{ bucket: "B", topic: 11, hours: 2 }],
    status: "approved",
  },
  {
    title: "伴侶性諮商初探－以性慾不對等為例",
    org: TASC,
    instructor: "陳姿曄",
    date: "2025/06/21",
    format: "實體演講",
    totalHours: "2 小時",
    credits: [{ bucket: "T", topic: 7, hours: 2 }],
    status: "approved",
  },
  {
    title: "女性性成癮：性慾望與性自我認同",
    org: TASC,
    instructor: "李竹薇",
    date: "2025/06/21",
    format: "實體演講",
    totalHours: "2 小時",
    credits: [{ bucket: "T", topic: 6, hours: 2 }],
    status: "approved",
  },
  {
    title: "在情感與慾望的流動中：當代助人者對開放式關係的理解與實踐",
    org: TASC,
    instructor: "林伯聰",
    date: "2025/06/21",
    format: "實體演講",
    totalHours: "2 小時",
    credits: [{ bucket: "B", topic: 1, hours: null }],
    note: "申請表單的時數填在別欄，認證時數以認證委員會認定為準（課程總時數為 2 小時）。",
    status: "note",
  },
  {
    title: "燒燙傷性重建：當身體經歷創傷，性還有可能嗎？",
    org: TASC,
    instructor: "簡苑玲",
    date: "2025/06/21",
    format: "實體工作坊",
    totalHours: "2 小時",
    credits: [{ bucket: "B", topic: 10, hours: 2 }],
    note: "課程宣傳時數為 1 小時 50 分、申請認證 2 小時，委員審核時原則上接受。",
    status: "note",
  },
  {
    title: "在情感與慾望的流動中－當代助人者對BDSM文化的理解與實踐",
    org: TASC,
    instructor: "林伯聰",
    date: "2025/08/23",
    format: "實體",
    totalHours: "2.5 小時",
    credits: [{ bucket: "B", topic: 1, hours: 2.5 }],
    status: "approved",
  },
  {
    title: "色情教學與實務操作之交流分享",
    org: TASC,
    instructor: "陳明媚",
    date: "2025/09/07",
    format: "視訊",
    totalHours: "1.5 小時",
    credits: [{ bucket: "B", topic: 5, hours: 1.5 }],
    status: "approved",
  },
  {
    title: "《關於兒少性剝削－如何用超廣角鏡頭認識性剝削兒少的完整/多元處境》",
    org: TASC,
    instructor: "温易珊",
    date: "2025/10/26",
    format: "視訊",
    totalHours: "2 小時",
    credits: [{ bucket: "B", topic: 2, hours: 2 }],
    status: "approved",
  },
  {
    title: "你想要、我不想要──當性需求不同步時該怎麼辦",
    org: TASC,
    instructor: "許庭韶",
    date: "2026/01/11",
    format: "視訊",
    totalHours: "2 小時",
    credits: [{ bucket: "T", topic: 7, hours: 2 }],
    note: "審核時有委員建議改列人類性學 A 必修 (11) 親密關係、人際技巧與家庭動力，但維持原申請類別亦可。",
    status: "note",
  },
  {
    title: "《性諮商倫理的藝術與邊界：實務工作者的互動沙龍》",
    org: TASC,
    instructor: "薛卉芝、李翊平、林榮哲、林沛辰、陳慧珊",
    date: "2026/04/19",
    format: "視訊",
    totalHours: "3 小時",
    credits: [{ bucket: "A", topic: 1, hours: 3 }],
    status: "approved",
  },
  {
    title: "從問題解決到能力建構：面對心智障礙者性議題的不同可能性",
    org: TASC,
    instructor: "張維真",
    date: "2026/06/06",
    format: "實體工作坊",
    totalHours: "2 小時",
    credits: [{ bucket: "B", topic: 10, hours: 2 }],
    status: "approved",
  },
  {
    title: "性侵受害者可以享受性嗎？——創傷、欲望與主體性",
    org: TASC,
    instructor: "彭仁郁",
    date: "2026/06/06",
    format: "實體工作坊",
    totalHours: "2 小時",
    credits: [{ bucket: "B", topic: 3, hours: 2 }],
    status: "approved",
  },
  {
    title: "個案・性產業探索：性諮商實務中需面對的真實世界之一",
    org: TASC,
    instructor: "力巧玲",
    date: "2026/05/03",
    format: "視訊",
    totalHours: "2 小時",
    credits: [{ bucket: "B", topic: 6, hours: 2 }],
    status: "approved",
  },
  {
    title: "當代性別事件行為人諮商處遇實務經驗分享交流",
    org: TASC,
    instructor: "龍冠華",
    date: "2026/08/16",
    format: "視訊",
    totalHours: "2 小時",
    credits: [{ bucket: "B", topic: 2, hours: 2 }],
    status: "approved",
  },
  {
    title: "夜遊林森北路：從四大鬼樓反思性產業與性相關法規",
    org: TASC,
    instructor: "金派經紀人 CL、李翊平",
    date: "2026/08/22",
    format: "實體走讀",
    totalHours: "3 小時",
    credits: [{ bucket: "B", topic: 6, hours: 3 }],
    status: "approved",
  },
  {
    title: "夜遊三流艋舺：流氓、流鶯、流浪漢",
    org: TASC,
    instructor: "金派經紀人 CL、李翊平",
    date: "2026/08/07",
    format: "實體走讀",
    totalHours: "3 小時",
    credits: [{ bucket: "B", topic: 6, hours: 3 }],
    status: "approved",
  },
  {
    title: "當身體遇見社會：讓月經，被好好說出來──臺灣月經平權的推廣與現況",
    org: TASC,
    instructor: "鄭涵馨",
    date: "2026/09/05",
    format: "視訊",
    totalHours: "3 小時",
    credits: [{ bucket: "A", topic: 6, hours: 3 }],
    status: "approved",
  },
  {
    title: "成人性教練 Level One",
    org: HG,
    instructor: "呂嘉惠",
    date: "2026/03–07（線上六次＋現場演練一次）",
    format: "視訊＋實體專業培訓課程",
    totalHours: "18 小時",
    credits: [
      { bucket: "A", topic: 9, hours: 1 },
      { bucket: "A", topic: 11, hours: 1 },
      { bucket: "B", topic: 11, hours: 4 },
      { bucket: "T", topic: 4, hours: 12 },
    ],
    status: "approved",
  },
  {
    title: "能力建構取向性諮商與性發展概論",
    org: HG,
    instructor: "呂嘉惠",
    date: "2026/06–08（十次）",
    format: "視訊專業培訓課程",
    totalHours: "15 小時",
    credits: [
      { bucket: "A", topic: 2, hours: 10 },
      { bucket: "A", topic: 3, hours: 5 },
      { bucket: "S", topic: null, hours: 15 },
    ],
    note: "此梯次於 2026/08/15 修改過申請內容（原申請 A 必修 (2) 8 小時＋(3) 2 小時＋性諮商訓練 (1) 5 小時，改為 A 必修 (2) 10 小時＋(3) 5 小時、性諮商訓練不申請，並新增申請性態度與性價值觀訓練 15 小時）。審核紀錄目前只有一位委員回覆，最終認定請洽認證委員會。",
    status: "pending",
  },
  {
    title: "《寄養家庭中的性議題》寄養家庭性議題中的理解、陪伴與合作實務",
    org: TASC,
    instructor: "王嘉琪",
    date: "2026/08/15",
    format: "實體工作坊",
    totalHours: "6 小時",
    credits: [{ bucket: "A", topic: 5, hours: 6 }],
    status: "approved",
  },
];

/** 資料涵蓋範圍，顯示在頁面上讓會員知道這份對照表的時間界線。 */
export const dataCoverage = {
  from: "2024 年 5 月",
  to: "2026 年 7 月",
  count: approvedCourses.length,
};
