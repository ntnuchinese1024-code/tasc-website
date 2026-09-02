#!/usr/bin/env python3
"""把一期電子報的 PDF 轉成網站要用的圖片＋壓縮版 PDF。

用法（在專案根目錄下）：

    python3 scripts/newsletter-images.py 某某電子報.pdf 2026-autumn

第二個參數是這一期的代號（會變成網址 /newsletter/2026-autumn）。
跑完會產生 public/newsletters/<代號>/ 底下：

    p01.webp … pNN.webp        每頁一張，寬 1400，翻書閱讀器用的
    thumbs/p01.webp …          縮圖，寬 260，目錄跟封面卡片用的
    台灣性諮商學會-<代號>.pdf    壓過的 PDF，給人下載用

為什麼不直接放原始 PDF？Canva 匯出的檔案常常是好幾十 MB，
放上網站訪客要等很久、Netlify 的流量也吃不消。壓過的版本大約 5 MB。
原始檔請自己留一份在雲端硬碟。

需要的工具：
    pdftoppm（poppler，`brew install poppler`）
    Pillow  （`pip3 install pillow`）
"""

import pathlib
import shutil
import subprocess
import sys
import tempfile

from PIL import Image

FULL_WIDTH = 1400
THUMB_WIDTH = 260
DPI = 150


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__)
        return 1

    pdf = pathlib.Path(sys.argv[1]).expanduser()
    slug = sys.argv[2]
    if not pdf.is_file():
        print(f"找不到檔案：{pdf}")
        return 1
    if not shutil.which("pdftoppm"):
        print("找不到 pdftoppm，請先安裝 poppler：brew install poppler")
        return 1

    out = pathlib.Path("public/newsletters") / slug
    (out / "thumbs").mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        tmpdir = pathlib.Path(tmp)
        subprocess.run(
            ["pdftoppm", "-r", str(DPI), "-png", str(pdf), str(tmpdir / "page")],
            check=True,
        )
        rendered = sorted(tmpdir.glob("page-*.png"))
        if not rendered:
            print("PDF 沒有轉出任何頁面")
            return 1

        full_pages = []
        for i, page in enumerate(rendered, 1):
            im = Image.open(page).convert("RGB")
            w, h = im.size
            full = im.resize((FULL_WIDTH, round(h * FULL_WIDTH / w)), Image.LANCZOS)
            full.save(out / f"p{i:02d}.webp", "WEBP", quality=82, method=6)
            thumb = im.resize((THUMB_WIDTH, round(h * THUMB_WIDTH / w)), Image.LANCZOS)
            thumb.save(out / "thumbs" / f"p{i:02d}.webp", "WEBP", quality=72, method=6)
            full_pages.append(full)

        download = out / f"台灣性諮商學會-{slug}.pdf"
        full_pages[0].save(
            download,
            save_all=True,
            append_images=full_pages[1:],
            quality=78,
            resolution=float(DPI),
        )

    size_mb = download.stat().st_size / 1024 / 1024
    print(f"完成：{len(rendered)} 頁 → {out}")
    print(f"下載用 PDF：{download.name}（{size_mb:.1f} MB）")
    print()
    print("接著到 src/data/newsletters.ts 的陣列最前面加一筆，填上：")
    print(f'  slug: "{slug}"')
    print(f"  pages: {len(rendered)}")
    print(f'  pdf: {{ file: "{download.name}", size: "{size_mb:.1f} MB" }}')
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
