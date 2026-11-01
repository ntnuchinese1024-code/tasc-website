/**
 * 合格性諮商師名單、執業資料表單用的清單。
 *
 * - 名單頁（/counselors）：合格名單＋地圖＋搜尋
 * - 資料填寫頁（/counselors/profile）：工作地區、專長範本、服務對象範本
 *
 * ⚠️ 工作地區的 code 存在報名系統的資料庫裡，**不要改名**。
 *    要增減地區，三個地方要一起改：這裡、報名系統的 lib/types/counselor-profile.ts、
 *    報名系統 018 migration 的 counselor_region_codes()。地圖的縣市代碼在 scripts/build-taiwan-map.mjs。
 *
 * 專長與服務對象的範本只在這裡，可以自由增減（報名系統收的是自由字串）。
 */

/** 合格性諮商師名單（依《性諮商師認證辦法》第十條列入名錄者）。 */
export const ROSTER = [
  "呂嘉惠", "邱雅沂", "黃怡禎", "江欣怡", "王嘉琪", "李竹薇",
  "李翊平", "陳姿曄", "楊舒聿", "朱柏翰", "黃柏嘉", "劉承駿",
  "薛卉芝", "謝宜潔", "張維真", "簡苑玲", "許庭韶",
];

export const ROSTER_UPDATED = "2024年9月更新";

export type RegionGroup = "北部" | "中部" | "南部" | "東部" | "離島" | "線上";

export interface Region {
  code: string;
  label: string;
  /** 地圖上的短名稱 */
  short: string;
  group: RegionGroup;
}

export const REGIONS: Region[] = [
  { code: "keelung", label: "基隆市", short: "基隆", group: "北部" },
  { code: "taipei", label: "臺北市", short: "臺北", group: "北部" },
  { code: "new-taipei", label: "新北市", short: "新北", group: "北部" },
  { code: "taoyuan", label: "桃園市", short: "桃園", group: "北部" },
  { code: "hsinchu-city", label: "新竹市", short: "竹市", group: "北部" },
  { code: "hsinchu-county", label: "新竹縣", short: "新竹", group: "北部" },
  { code: "yilan", label: "宜蘭縣", short: "宜蘭", group: "北部" },
  { code: "miaoli", label: "苗栗縣", short: "苗栗", group: "中部" },
  { code: "taichung", label: "臺中市", short: "臺中", group: "中部" },
  { code: "changhua", label: "彰化縣", short: "彰化", group: "中部" },
  { code: "nantou", label: "南投縣", short: "南投", group: "中部" },
  { code: "yunlin", label: "雲林縣", short: "雲林", group: "中部" },
  { code: "chiayi-city", label: "嘉義市", short: "嘉市", group: "南部" },
  { code: "chiayi-county", label: "嘉義縣", short: "嘉義", group: "南部" },
  { code: "tainan", label: "臺南市", short: "臺南", group: "南部" },
  { code: "kaohsiung", label: "高雄市", short: "高雄", group: "南部" },
  { code: "pingtung", label: "屏東縣", short: "屏東", group: "南部" },
  { code: "hualien", label: "花蓮縣", short: "花蓮", group: "東部" },
  { code: "taitung", label: "臺東縣", short: "臺東", group: "東部" },
  { code: "penghu", label: "澎湖縣", short: "澎湖", group: "離島" },
  { code: "kinmen", label: "金門縣", short: "金門", group: "離島" },
  { code: "lienchiang", label: "連江縣（馬祖）", short: "馬祖", group: "離島" },
  { code: "online", label: "線上諮商", short: "線上", group: "線上" },
];

export const REGION_GROUPS: RegionGroup[] = ["北部", "中部", "南部", "東部", "離島", "線上"];

export const REGION_BY_CODE: Record<string, Region> = Object.fromEntries(REGIONS.map((r) => [r.code, r]));

/** 每位最多選幾項專長（範本＋自填合計），跟報名系統的上限一致。 */
export const MAX_SPECIALTIES = 12;
export const MAX_AUDIENCES = 8;

/**
 * 專長範本，依常見的性諮商議題分類。
 *
 * 參考 DSM-5／ICD-11 的性功能障礙與性健康分類、美國性教育諮商治療師協會（AASECT）
 * 認證性治療師常見的服務項目，再依台灣的實務用語整理。用語盡量去病理化、去污名。
 */
export const SPECIALTY_TEMPLATES: { group: string; items: string[] }[] = [
  {
    group: "性功能與性反應",
    items: [
      "性慾低落",
      "伴侶性慾差異",
      "勃起困難",
      "早洩／射精控制",
      "延遲射精",
      "性高潮困難",
      "性交疼痛",
      "陰道痙攣",
      "性表現焦慮",
      "無性婚姻／性迴避",
    ],
  },
  {
    group: "伴侶與親密關係",
    items: [
      "伴侶性溝通",
      "外遇與關係修復",
      "開放式關係／多重伴侶",
      "婚前與新婚性諮詢",
      "備孕、不孕與生殖醫療中的性",
      "懷孕與產後的親密關係",
    ],
  },
  {
    group: "性別與多元性傾向",
    items: [
      "同志與雙性戀議題",
      "性別認同與跨性別",
      "無性戀光譜",
      "出櫃與家庭關係",
      "BDSM 與非典型性興趣",
    ],
  },
  {
    group: "性行為與使用困擾",
    items: [
      "強迫性性行為（CSBD）／性成癮",
      "色情內容使用困擾",
      "藥物助性（Chemsex）",
      "網路性愛與數位親密",
    ],
  },
  {
    group: "創傷、暴力與界線",
    items: [
      "性創傷復原",
      "童年性侵害經驗",
      "性騷擾與性霸凌",
      "親密關係暴力",
      "性同意與界線",
    ],
  },
  {
    group: "身心健康與生命階段",
    items: [
      "慢性病、癌症與性",
      "身心障礙者的性",
      "更年期與熟齡性生活",
      "身體意象",
      "性傳染病與 HIV 相關心理支持",
      "藥物對性功能的影響",
    ],
  },
  {
    group: "性教育與發展",
    items: [
      "兒童性發展與家長諮詢",
      "青少年性教育",
      "親職性教育",
      "性價值觀與宗教羞恥感",
      "性知識與性健康教育",
    ],
  },
];

export const AUDIENCE_TEMPLATES = [
  "個人",
  "伴侶／配偶",
  "家庭",
  "兒童",
  "青少年",
  "大專學生",
  "中高齡／熟齡",
  "LGBTQ+",
  "身心障礙者",
  "專業人員督導",
];

/** 名單頁的篩選：專長依範本的順序排，自填的排在最後。 */
export const SPECIALTY_ORDER: string[] = SPECIALTY_TEMPLATES.flatMap((g) => g.items);
