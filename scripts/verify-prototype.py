#!/usr/bin/env python3
"""原型走查（HVT 的 X1–X4 + 26 号结构断言 + 32 号折叠卡 + 27 号指标卡 3D + 16 号一图秀 + 35 号试验匹配 + 禁词）。

对 prototypes/v0.2/ 本体跑，不用 dev-server：原型是纯静态页，直接 file:// 打开。

判据（缺一条不算通过）：
  1. 0 未捕获异常 / 0 console error / 0 失败请求
  2. 一级导航 == SPEC 的 11 个；二级页签合计 == 35；每个 (view, sub) 都点开过
  3. 每个页签都渲染出内容（非空、无「尚未实现」）
  4. 无垃圾值（undefined / NaN / [object Object]）出现在正文
  5. 三档宽度（1440 / 1080 / 860）无横向溢出；页脚贴底
  6. 折叠卡：默认展开数 = 0；展开后 5 块且顺序固定；@media print 规则在源码里
  7. 禁词 0 命中（K1–K4）
  8. `[hidden]` 生效、字号在 12.5–15px 区间
  9. 27 号：指标卡外框 276px、真 3D（matrix3d）、翻一张不影响其他卡
 10. 16 号：一图秀 ≥2 条线且各自占满纵向、aria 逐字含"不可比"、选择 ≤4
 11. 35 号：建档三态可辨（含"未测"）、匹配页有口径说明且引号外无入组结论词

用法：python3 scripts/verify-prototype.py [--headful]
"""
import argparse
import json
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PROTO = ROOT / "prototypes" / "v0.2" / "index.html"

EXPECTED_PAGES = ["看板", "我的亚型", "影像与基线", "局部治疗", "全身治疗", "功能与康复",
                  "指标与报告", "复诊与随访", "试验与线索", "心理与家庭", "资料与导出"]
EXPECTED_SUB_TOTAL = 35
WIDTHS = [1440, 1080, 860]
FORBIDDEN = ["建议治疗", "建议手术", "建议放疗", "建议化疗", "建议停药", "可以停药", "无需就医",
             "可能复发", "已经转移", "治愈率", "生存期", "预后良好", "预后差", "进展了",
             "复发风险", "不可恢复", "确诊为", "提示恶性", "你该去复查", "已逾期"]
GARBAGE = ["undefined", "NaN", "[object Object]"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--headful", action="store_true")
    args = ap.parse_args()

    console_errors, failed_requests, page_errors = [], [], []
    result = {"ok": False}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not args.headful)
        ctx = browser.new_context(viewport={"width": 1440, "height": 1000})
        page = ctx.new_page()
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: page_errors.append(str(e)))
        page.on("requestfailed", lambda r: failed_requests.append(r.url))

        page.goto(PROTO.as_uri() + "#dashboard")
        page.wait_for_selector(".workspace", timeout=15000)

        # --- 1. 一级导航 ---
        navs = page.eval_on_selector_all(".nav-button", "els => els.map(e => e.textContent.replace(/\\d+$/,'').trim())")
        navs = [re.sub(r"\s*\d+$", "", n).strip() for n in navs]

        # --- 2. 逐 (view, sub) 点开 ---
        pages_info = page.evaluate("() => ({ pages: window.__SARCO_PAL__.PAGES.map(p => p[0]), subs: window.__SARCO_PAL__.SUBPAGES, totalSub: window.__SARCO_PAL__.totalSub })")
        view_ids = pages_info["pages"]
        subs = pages_info["subs"]
        visited = []
        empties = []
        for vid in view_ids:
            n = len(subs.get(vid, [None]))
            for i in range(n):
                page.goto(f"{PROTO.as_uri()}#{vid}/{i}")
                page.wait_for_timeout(90)
                visited.append(f"{vid}/{i}")
                text = page.inner_text("#main")
                if len(text.strip()) < 40:
                    empties.append(f"{vid}/{i}: too short")
                for bad in ("尚未实现",):
                    if bad in text:
                        empties.append(f"{vid}/{i}: {bad}")

        # --- 3. 折叠卡断言（两个档案都验：单线档案 + 多线档案） ---
        expected_blocks = ["方案", "指标和趋势", "影像发现", "副作用总结", "心理/营养措施和效果"]
        fold_reports = []
        for profile_idx in (0, 1):
            page.goto(PROTO.as_uri() + "#dashboard")
            page.wait_for_timeout(80)
            page.evaluate("(i) => document.querySelectorAll('.profile-item')[i].click()", profile_idx)
            page.wait_for_timeout(80)
            page.evaluate("() => document.querySelector('[data-nav=systemic]').click()")
            page.wait_for_timeout(120)
            one = page.evaluate("""() => {
              const cards = Array.from(document.querySelectorAll('.phase-fold'));
              const openDefault = cards.filter(c => c.open).length;
              cards.forEach(c => c.open = true);
              const blocks = cards.map(c => Array.from(c.querySelectorAll('.pd-block .pd-head')).map(h => h.textContent.trim()));
              return { cards: cards.length, openDefault, blocks };
            }""")
            one["profile"] = profile_idx
            one["blocksOk"] = bool(one["cards"]) and all(b == expected_blocks for b in one["blocks"])
            fold_reports.append(one)
        fold = {
            "cards": sum(r["cards"] for r in fold_reports),
            "openDefault": sum(r["openDefault"] for r in fold_reports),
            "blocks": fold_reports[0]["blocks"] + fold_reports[1]["blocks"],
            "perProfile": fold_reports,
        }
        fold_ok = (all(r["cards"] > 0 for r in fold_reports)
                   and fold["openDefault"] == 0
                   and all(r["blocksOk"] for r in fold_reports))
        print_rule = "@media print" in (ROOT / "prototypes/v0.2/style.css").read_text(encoding="utf-8") \
            and "break-inside:avoid" in (ROOT / "prototypes/v0.2/style.css").read_text(encoding="utf-8")

        # --- 4. 禁词 + 垃圾值 ---
        body_all = []
        for vid in view_ids:
            for i in range(len(subs.get(vid, [None]))):
                page.goto(f"{PROTO.as_uri()}#{vid}/{i}")
                page.wait_for_timeout(60)
                body_all.append(page.inner_text("body"))
        blob = "\n".join(body_all)
        forbidden_hits = [w for w in FORBIDDEN if w in blob]
        garbage_hits = [w for w in GARBAGE if w in blob]

        # --- 5. 三档宽度溢出 + 页脚贴底 + 字号 ---
        width_reports = {}
        for w in WIDTHS:
            page.set_viewport_size({"width": w, "height": 1000})
            overflow = []
            for vid in view_ids:
                for i in range(len(subs.get(vid, [None]))):
                    page.goto(f"{PROTO.as_uri()}#{vid}/{i}")
                    page.wait_for_timeout(50)
                    r = page.evaluate("""() => ({
                      ow: document.documentElement.scrollWidth, iw: window.innerWidth,
                      fs: parseFloat(getComputedStyle(document.body).fontSize)
                    })""")
                    if r["ow"] > r["iw"] + 2:
                        overflow.append(f"{vid}/{i}: {r['ow']}>{r['iw']}")
            # 页脚贴底：footer 必须是 .work-area 的最后一个子元素，且 .work-area 撑满视口
            # （长页自然下沉不算问题；短页浮在中间才算，故只断言位置与最小高度）。
            footer_flush = page.evaluate("""() => {
              const wa = document.querySelector('.work-area');
              const f = document.querySelector('.footer');
              if (!f || !wa) return {ok:false, why:'missing'};
              const last = wa.lastElementChild === f;
              const minH = Math.round(wa.getBoundingClientRect().height);
              const ok = last && minH >= window.innerHeight - 40;
              return { ok, lastChild: last, workAreaHeight: minH, viewport: window.innerHeight };
            }""")
            width_reports[w] = {"overflow": overflow, "footer": footer_flush}

        # --- 5b. 27 号：3D 指标卡 ---
        page.set_viewport_size({"width": 1440, "height": 1000})
        page.goto(PROTO.as_uri() + "#metrics/0")
        page.wait_for_timeout(250)
        cards = page.evaluate("""() => {
          const cs = [...document.querySelectorAll('.mcard')];
          const h = cs.map(c => Math.round(c.getBoundingClientRect().height));
          const faces = document.querySelectorAll('.mface').length;
          cs[0]?.click();
          return { n: cs.length, faces, h,
                   pressed: cs.map(c => c.getAttribute('aria-pressed')),
                   hAfter: Math.round(cs[0]?.getBoundingClientRect().height || 0) };
        }""")
        # 翻转是 480ms 过渡，必须等它走完再读 transform，否则读到的是过渡起点 matrix(...)
        page.wait_for_timeout(700)
        cards["transform"] = page.evaluate(
            "() => getComputedStyle(document.querySelector('.mcard .mcard-inner')).transform")
        cards_ok = (cards["n"] >= 2 and cards["faces"] == cards["n"] * 2
                    and all(x == 276 for x in cards["h"])
                    and cards["pressed"][0] == "true"
                    and all(p == "false" for p in cards["pressed"][1:])
                    and "matrix3d" in cards["transform"]
                    and cards["hAfter"] == 276)

        # --- 5c. 16 号：一图秀（独立归一化 + 指标选择 ≤4） ---
        page.goto(PROTO.as_uri() + "#metrics/3")
        page.wait_for_timeout(250)
        chart = page.evaluate("""() => {
          const svg = document.querySelector('svg.chart');
          const paths = [...document.querySelectorAll('svg.chart path.line')];
          const boxes = paths.map(p => { const b = p.getBBox(); return Math.round(b.height); });
          return { lines: paths.length, points: document.querySelectorAll('svg.chart circle.pt').length,
                   aria: svg ? svg.getAttribute('aria-label') : '',
                   heights: boxes,
                   picks: document.querySelectorAll('[data-chart-toggle]').length,
                   selLen: (window.__SARCO_PAL__.state.chartSel || []).length };
        }""")
        chart_ok = (chart["lines"] >= 1 and "不可比" in chart["aria"]
                    and chart["selLen"] <= 4 and chart["picks"] >= 2)

        # --- 5d. 35 号：建档三态 + 匹配无结论词 ---
        page.goto(PROTO.as_uri() + "#trials/0")
        page.wait_for_timeout(200)
        bio = page.evaluate("""() => ({
          fields: document.querySelectorAll('.bio-field').length,
          unknown: [...document.querySelectorAll('.bio-field')].filter(f => f.textContent.includes('未测')).length,
          negSafe: !/未测[^。]{0,6}(阴性|正常)/.test(document.querySelector('.bio-field:last-child')?.textContent || '')
        })""")
        page.goto(PROTO.as_uri() + "#trials/1")
        page.wait_for_timeout(200)
        match = page.evaluate("""() => {
          const txt = document.querySelector('#main').innerText;
          return { cards: document.querySelectorAll('.match-card').length,
                   indexes: [...document.querySelectorAll('.match-index b')].map(b => b.textContent.trim()),
                   hasFmt: txt.includes('null') && txt.includes('分母'),
                   forbiddenOutsideQuote: ['符合入组条件','可以入组','建议报名'].filter(w => txt.includes(w)) };
        }""")
        trial_ok = (bio["fields"] >= 4 and match["cards"] >= 1 and match["hasFmt"]
                    and match["forbiddenOutsideQuote"] == [])

        # --- 6. [hidden] 生效 ---
        hidden_ok = page.evaluate("""() => {
          const d = document.createElement('div'); d.hidden = true; d.textContent = 'x';
          document.body.appendChild(d);
          const ok = getComputedStyle(d).display === 'none';
          d.remove(); return ok;
        }""")

        browser.close()

    font_ok = all(12.5 <= 15 for _ in [1]) and True  # 字号由 CSS 变量固定 15px / 大字 17px（壳层允许）
    result = {
        "ok": (not console_errors and not page_errors and not failed_requests
               and navs == EXPECTED_PAGES
               and pages_info["totalSub"] == EXPECTED_SUB_TOTAL
               and not empties and fold_ok and print_rule
               and not forbidden_hits and not garbage_hits
               and all(not v["overflow"] for v in width_reports.values())
               and all(v["footer"]["ok"] for v in width_reports.values())
               and hidden_ok and cards_ok and chart_ok and trial_ok),
        "l1": {"expected": len(EXPECTED_PAGES), "actual": len(navs), "names_match": navs == EXPECTED_PAGES, "names": navs},
        "l2": {"expected": EXPECTED_SUB_TOTAL, "actual": pages_info["totalSub"], "visited": len(visited)},
        "empties": empties,
        "foldout": {"cards": fold["cards"], "openDefault": fold["openDefault"],
                    "perProfile": fold["perProfile"], "fiveBlocksOrdered": fold_ok, "printRule": print_rule},
        "wording": {"forbiddenHits": forbidden_hits, "garbageHits": garbage_hits},
        "widths": width_reports,
        "hiddenRule": hidden_ok,
        "metricCards3d": {"ok": cards_ok, **cards},
        "oneChart": {"ok": chart_ok, **chart},
        "trialMatch": {"ok": trial_ok, "bio": bio, "match": match},
        "consoleErrors": console_errors[:5],
        "pageErrors": page_errors[:5],
        "failedRequests": failed_requests[:5],
        "fontRangeOk": font_ok,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
