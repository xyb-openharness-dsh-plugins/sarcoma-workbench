#!/usr/bin/env python3
"""为 README 出实渲截图（doc 33）：从**原型本体**截，不从 dev-server 截。

输出到 docs/screenshots/，文件名带版本号，README 直接引用。
要求（doc 33）：≥4 张，含折叠卡的收/展两态。
"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PROTO = ROOT / "prototypes" / "v0.2" / "index.html"
OUT = ROOT / "docs" / "screenshots"

SHOTS = [
    ("01-dashboard", "#dashboard", 1440, None),
    ("02-subtype-grade", "#subtype/1", 1440, None),
    ("03-imaging-baseline", "#imaging/0", 1440, None),
    ("04-systemic-foldout-collapsed", "#systemic/0", 1440, None),
    ("05-systemic-foldout-expanded", "#systemic/0", 1440, "open-foldouts"),
    ("06-metrics-trend", "#metrics/2", 1440, None),
    ("07-trials", "#trials/0", 1440, None),
    ("08-mind-private-masked", "#mind/1", 1440, None),
    ("09-dashboard-860", "#dashboard", 860, None),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    made = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 1100}, device_scale_factor=2)
        page = ctx.new_page()
        for name, hash_, width, action in SHOTS:
            page.set_viewport_size({"width": width, "height": 1100})
            page.goto(PROTO.as_uri() + hash_)
            page.wait_for_selector(".workspace", timeout=15000)
            page.wait_for_timeout(180)
            if action == "open-foldouts":
                page.evaluate("() => document.querySelectorAll('.phase-fold').forEach(c => c.open = true)")
                page.wait_for_timeout(180)
            path = OUT / f"{name}.png"
            page.screenshot(path=str(path), full_page=False)
            made.append({"name": name, "path": str(path.relative_to(ROOT)), "bytes": path.stat().st_size})
        browser.close()
    print(json.dumps({"ok": True, "count": len(made), "shots": made}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
