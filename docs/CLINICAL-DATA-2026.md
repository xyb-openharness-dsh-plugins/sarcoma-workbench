# 临床数据 2026 · 软组织肉瘤（STS）临床试验采集

> 文件：`docs/CLINICAL-DATA-2026.md`　｜　里程碑：M3（临床试验采集，多通道）
> 采集快照：`research/sarcoma/manifest.json`、`trials-2026.jsonl`、`sarcoma_cancer_trials_2026.sqlite`（生成于 2026-10-25T01:26:41Z）
> 本文只写采集到的事实与口径解释，不写任何评价、取舍或处置意见。所有数字均可用本文第 3 章与附录 A 的命令复算。

---

## 1. 一句话

本轮用 unified-trial-mcp（v0.3.1）在 6 个通道上跑了 21 个中英文检索词，按 2019-01-01 起的窗口采集，去重后落库 263 条软组织肉瘤相关登记记录；采集完成时间 2026-10-25 01:26 UTC，但各通道能看见的日期不同：CTV 本地索引记录最近更新 2026-10-14、ChiCTR 在线登记起始日最晚 2026-10-22、XYB 离线包数据截止 2026-09-29、ChinaDrugTrials 受控归档的 134 条记录没有任何日期字段（截止日不可知）；**ICTRP（FAILED）、ChiCTR 胰腺癌离线语料（NOT_CONFIGURED）、XYB ChinaDrugTrials 离线包（对肉瘤无覆盖）三条通道本次没有提供任何肉瘤数据**，另有 1 条通道（CTV）只覆盖本地索引的 1434 条子集。

---

## 2. 口径（怎么算一条）

### 2.1 什么算「一条」

- 唯一键是 `source + registry_id`（sqlite 表 `trials` 的主键）。
- 去重只发生在**同一来源内部**：同一个登记号被多个检索词命中时只保留一行。实测原始命中 381 条 → 去重后 263 条，差额 118 条全部是「同源同一登记号被多次命中」：CTV 131→95（-36）、ChiCTR 在线 69→32（-37）、ChinaDrugTrials 179→134（-45）。
- **跨来源不做身份合并**：去重键里含来源，因此两条来源里的同一项试验只要登记号不同，就会并排保留成两行。这与 `prompts/ZERO-TO-DEV.md` §1.3「多通道结果只在确认同一登记身份时合并，其余并排保留来源」一致——本轮**没有做**跨来源身份合并（见第 7 章）。实测跨来源同名标题只有 1 组（一项 ABSK021 生物利用度研究，`chinadrugtrials` 与 `xyb_chinadrugtrials_archive` 各 1 条），保留为 2 行。

### 2.2 去重顺序与优先级

`manifest.query.source_order` 为：`ictrp → ctv → chictr_online → chinadrugtrials → chictr_pancreatic_archive → xyb_chinadrugtrials_archive`。

需要说明的是：因为去重键带来源，这个顺序**不改变任何条数**——`counts.unique_before_window_by_source`（0 / 95 / 32 / 134 / 0 / 2）与 `counts.by_source_final` 逐项相同，说明不存在「多来源同时命中时算给谁」的取舍。该顺序在本次只决定输出排列与 `query_log` 的记录顺序，不能读成「先查到的来源覆盖后查到的来源」。

### 2.3 时间窗

- 窗口下限 2019-01-01；判定规则（`manifest.query.window.rule` 原文）：注册日期或最近更新 ≥ 2019-01-01；两者都缺失时保留并标记 `window_status=unknown`。
- `counts.window_excluded = 0`，`window_excluded` 为**空数组**（`[]`）。这只能读成**「本次没有任何记录因窗口规则被剔除」**，不能读成「263 条全部发生在 2019 年之后」。
- 实测 `window_status` 分布：`in_window` 129 条、`unknown` 134 条，合计 263。134 条 `unknown` 全部来自 `chinadrugtrials`（该来源的记录没有注册日期与更新日期字段）。因此「落在窗口内」这一判断只对 129 条成立，另 134 条的窗口状态是**未知但保留**。

### 2.4 `scope_tag` 三个取值的含义

判定依据字段是 `scope_basis`，取值只有三种：`title`（87 条）、`conditions`（106 条）、`none`（70 条）。`manifest.query.scope_rule` 原文：

> 标题优先、条件字段兜底：骨肉瘤/尤文/软骨肉瘤/GIST/硬纤维瘤/脊索瘤/其他骨肿瘤标为 out_of_scope_<type>；标题含软组织肉瘤或亚型词标为 in_scope_sts；标题只写软组织肿瘤标为 other_soft_tissue_only；标题没写但条件字段含肉瘤/软组织词标为 other_sarcoma_in_conditions；标题与条件都没有肉瘤/软组织词标为 out_of_scope_unrelated。不剔除任何命中结果。

对应到本数据集：

| `scope_tag` | 条数 | 判定依据 | 含义 |
| --- | --- | --- | --- |
| `in_scope_sts` | 60 | 标题含「软组织肉瘤」或亚型词（`scope_basis=title`） | 落在本轮工作台覆盖范围内 |
| `out_of_scope*` | 150 | 标题或条件字段命中骨/尤文/软骨/GIST/硬纤维瘤/脊索瘤/其他骨肿瘤/无关瘤种 | 与 SPEC 定下的「不含 GIST、骨肉瘤/骨巨细胞瘤、卡波西肉瘤、硬纤维瘤」一致，标记但不剔除 |
| `other_sarcoma_in_conditions` | 53 | 标题没写肉瘤词、条件字段含肉瘤/软组织词（`scope_basis=conditions`） | 归属待人工判定，本轮不并入范围 |
| `out_of_scope_unrelated` | 70 | 标题与条件都没有肉瘤词（`scope_basis=none`） | 检索词命中在其它字段（如干预措施），照实保留 |

两处必须照实记的边界情形：

1. `other_soft_tissue_only` 本次为 **0** 条（`counts.other_breakdown.soft_tissue_only = 0`），`other` 的 53 条全部是 `sarcoma_in_conditions`。
2. 关键词判定会产生归类偏差。例：`CTR20212696`（安罗替尼联合表柔比星对照安慰剂联合表柔比星一线治疗晚期软组织肉瘤的 III 期）标题写的是「软组织肉瘤」，但条件字段的括号里列举了被排除的「尤文肉瘤」，于是按「具体亚型优先」落到 `out_of_scope_ewing`（`scope_basis=conditions`）。这类偏差本轮**未纠正**，按原始标记保留。

---

## 3. 一致性断言

### 3.1 三处数量（自己跑的命令与输出）

```console
$ wc -l research/sarcoma/trials-2026.jsonl
263 research/sarcoma/trials-2026.jsonl

$ sqlite3 research/sarcoma/sarcoma_cancer_trials_2026.sqlite "SELECT count(*) FROM trials;"
263

$ python3 -c "import json;print(json.load(open('research/sarcoma/manifest.json'))['counts']['deduped_total'])"
263
```

结论：`manifest.counts.deduped_total` = `trials-2026.jsonl` 行数 = sqlite `trials` 行数 = **263**，三处一致。

分来源一致性（`sqlite_verification.by_source` 与 sqlite 实测、jsonl 实测三方）：`ctv` 95、`chictr_online` 32、`chinadrugtrials` 134、`xyb_chinadrugtrials_archive` 2，合计 263，与 `counts.by_source_final` 一致。

### 3.2 `source_status` 6 行与 `manifest.sources[]` 6 条一一对应

```console
$ python3 - <<'EOF'
import json,sqlite3
m=json.load(open('research/sarcoma/manifest.json'))
db=sqlite3.connect('research/sarcoma/sarcoma_cancer_trials_2026.sqlite')
rows=db.execute("SELECT source,status,count,note FROM source_status ORDER BY source").fetchall()
src={s['source']:s for s in m['sources']}
ok=True
for s,st,c,n in rows:
    ms=src.get(s); same=bool(ms) and ms['status']==st and ms['count']==c and ms['note']==n
    ok &= same; print(('OK ' if same else 'DIFF'), s, st, c)
print('逐行一致:',ok,'| sqlite:',len(rows),'| manifest:',len(m['sources']))
EOF
OK  chictr_online SUCCESS 32
OK  chictr_pancreatic_archive NOT_CONFIGURED 0
OK  chinadrugtrials SUCCESS 134
OK  ctv SUCCESS 95
OK  ictrp FAILED 0
OK  xyb_chinadrugtrials_archive NO_COVERAGE_INCIDENTAL 2
逐行一致: True | sqlite: 6 | manifest: 6
```

结论：来源 ID、状态、条数、覆盖声明四项逐行相同，6 对 6 无多无缺。

### 3.3 文件 sha256（记录于 2026-10-25）

```console
$ shasum -a 256 research/sarcoma/trials-2026.jsonl research/sarcoma/sarcoma_cancer_trials_2026.sqlite research/sarcoma/manifest.json scripts/fetch-sarcoma-trials-2026.mjs
47bea3350bacb8f4cd40fc7cacc01bfc69d2173b366bce33c7cb08e742e3de80  research/sarcoma/trials-2026.jsonl
6f650ff4037a43530d97dd5e466e66b9ee7dc113b98296066952c00e0b9c431c  research/sarcoma/sarcoma_cancer_trials_2026.sqlite
6d093cc08cbf234adeb40ba2a866d26c7e3c16861ab3fef72b53ca9197eb32bd  research/sarcoma/manifest.json
f469151b1030cfeb25abcb3d5cd6a5f68343b91498d2c6983548bb7c49a08ef4  scripts/fetch-sarcoma-trials-2026.mjs
```

| 文件 | 字节 | sha256（本次实算，2026-10-25） | 与 manifest 记录是否一致 |
| --- | --- | --- | --- |
| `research/sarcoma/trials-2026.jsonl` | 525545 | `47bea335…e3de80` | 一致（`files[0].sha256`） |
| `research/sarcoma/sarcoma_cancer_trials_2026.sqlite` | 610304 | `6f650ff4…9c431c` | 一致（`files[1].sha256`） |
| `scripts/fetch-sarcoma-trials-2026.mjs` | 30635 | `f469151b…a08ef4` | 一致（`files[2].sha256`） |
| `research/sarcoma/manifest.json` | 90219 | `6d093cc0…eb32bd` | manifest 不自记自身 hash，无对照项 |

注：`manifest.json` 用于比对的三项 hash 与实际文件逐字节一致；`manifest.json` 自身不含自己的 sha256，故第四行为空对照，不是不一致。

### 3.4 三分区对账（`counts.reconciliation`）

```console
$ python3 - <<'EOF'
import json,collections
rows=[json.loads(l) for l in open('research/sarcoma/trials-2026.jsonl')]
c=collections.Counter(r['scope_tag'] for r in rows)
ins=sum(v for k,v in c.items() if k=='in_scope_sts')
out=sum(v for k,v in c.items() if k.startswith('out_of_scope'))
oth=sum(v for k,v in c.items() if k.startswith('other'))
print('in_scope_sts =',ins); print('out_of_scope* =',out); print('other* =',oth)
print('合计 =',ins+out+oth,'| 总行数 =',len(rows))
print('out_of_scope 明细 =',{k:v for k,v in sorted(c.items()) if k.startswith('out_of_scope')})
EOF
in_scope_sts = 60
out_of_scope* = 150
other* = 53
合计 = 263 | 总行数 = 263
out_of_scope 明细 = {'out_of_scope_bone_other': 1, 'out_of_scope_chordoma': 1, 'out_of_scope_desmoid': 2, 'out_of_scope_ewing': 7, 'out_of_scope_gist': 52, 'out_of_scope_kaposi': 5, 'out_of_scope_osteosarcoma': 12, 'out_of_scope_unrelated': 70}
```

三个数是怎么切出来的：

- **60（`in_scope_sts`）**：标题里出现「软组织肉瘤」或亚型词（脂肪肉瘤、平滑肌肉瘤、滑膜肉瘤、横纹肌肉瘤、血管肉瘤、纤维肉瘤、上皮样肉瘤等）。
- **150（`out_of_scope*`）**：按主标签分两段——① 具体亚型/部位 80 条（GIST 52 + 骨肉瘤 12 + 尤文 7 + 卡波西 5 + 硬纤维瘤 2 + 其他骨肿瘤 1 + 脊索瘤 1 = 80，即 `out_of_scope_specific_total`）；② 与肉瘤无关的命中 70 条（`out_of_scope_unrelated`，`scope_basis=none`，按 `out_of_scope_unrelated_by_category` 再分为 实体瘤泛称 21 / 肺 17 / 其他 13 / 血液 5 / 乳腺 5 / 结直肠 4 / 妇科 3 / 肾 2）。80 + 70 = 150。
- **53（`other`）**：标题没写肉瘤词、条件字段含肉瘤或软组织词（`sarcoma_in_conditions`）；`soft_tissue_only` 为 0。
- 校验：60 + 150 + 53 = 263 = 总行数，`reconciliation.equals_deduped_total = true`，与实测一致。
- 交叉校验（标题维度，不与上面三分区互推）：`title_has_sarcoma_term = 80`，其中 60 条在 `in_scope_sts`、20 条在 `out_of_scope*`（`title_has_sarcoma_term_in_scope = 60`、`title_has_sarcoma_term_out_of_scope = 20`）。两个维度会重叠，因此对账口径以三分区为准，`manifest.counts.reconciliation.note` 已注明。

---

## 4. 通道覆盖表

### 4.1 逐来源状态

| 来源 ID | 显示名 | 本次状态 | 原始条数 | 去重后条数 | 该来源自己的覆盖声明（照抄 `sources[].note`） |
| --- | --- | --- | --- | --- | --- |
| `ictrp` | WHO ICTRP | FAILED | 0 | 0 | 上游 ictrp_search 返回 isError：FileNotFoundError: [Errno 2] No such file or directory（sidecar 缺陷，非"无结果"）。首次失败后停止后续 20 个检索词。 统一层解释：ictrp_search 上游返回错误：上游工具返回 isError，但未提供错误详情。 |
| `ctv` | ClinicalTrials.gov（CTV 本地索引） | SUCCESS | 131 | 95 | CTV 上游入口可用；检索基于本地子集索引，零命中只代表本地索引未命中。 |
| `chictr_online` | ChiCTR 在线 | SUCCESS | 69 | 32 | ChiCTR 在线入口可用；检索受上游缓存与访问限流约束。 |
| `chinadrugtrials` | ChinaDrugTrials（受控归档） | SUCCESS | 179 | 134 | 已配置会话 Cookie，且存在本地归档；查询优先使用本地归档，避免不必要的在线抓取。 |
| `chictr_pancreatic_archive` | ChiCTR 胰腺癌离线语料 | NOT_CONFIGURED | 0 | 0 | 路径不存在：/nonexistent/x.db。该语料按设计仅覆盖胰腺癌，对肉瘤无覆盖；本次 0 条不是"没有肉瘤试验"。 |
| `xyb_chinadrugtrials_archive` | XYB ChinaDrugTrials 数据包（只读离线） | NO_COVERAGE_INCIDENTAL | 2 | 2 | 离线数据包仅覆盖胰腺癌（139 条，数据截止 2026-09-29）。本次命中 2 条为语料内偶然含"肉瘤"字样的记录，不构成肉瘤覆盖。 |

合计：原始 381 条，去重后 263 条。状态定义按 MCP 返回：只有 `SUCCESS` / `NO_RESULTS` 才算真正查询过；`FAILED` / `NOT_CONFIGURED` / `NO_COVERAGE_INCIDENTAL` 的缺失不得解读为「不存在相关试验」。

### 4.2 已知缺口（四条硬约束，原文保留，不得改写）

- ICTRP 本次 FAILED（sidecar FileNotFoundError），**不能把它的 0 条读成「没有试验」**。
- ChiCTR 胰腺癌离线语料路径不存在，且设计上只覆盖胰腺癌，对肉瘤无覆盖。
- XYB ChinaDrugTrials 离线包只有胰腺癌 139 条，本次命中 2 条属语料内偶然含「肉瘤」字样的记录，**不构成肉瘤覆盖**。
- CTV 是本地索引，零命中只代表本地索引未命中，不代表 ClinicalTrials.gov 全量没有该试验。

这四条各自排除的具体误读：

1. ICTRP 是 6 条通道里唯一的全球登记库聚合通道（`prompts/ZERO-TO-DEV.md` §1.3 记其定位为「全球广度」）。它本次在**第 1 个检索词就失败**（`ictrp:soft tissue sarcoma`，`reason_code=UPSTREAM_UNKNOWN_ERROR`），随后 20 个检索词未执行。因此本轮**没有任何 ICTRP 数据**，任何「全球范围内没有某项试验」的表述都缺少该通道支撑。
2. ChiCTR 离线语料是「胰腺癌专题」语料，不是 ChiCTR 全量；且本次配置的路径 `/nonexistent/x.db` 不存在（`reason_code=PATH_MISSING`）。它对本病种在**设计和配置两层**都不覆盖。
3. XYB 离线包 139 条记录、数据截止 2026-09-29、抓取区间 2026-08-14 至 2026-09-29；本次命中 2 条是关键词在包内偶然出现「肉瘤」字样的记录。这 2 条计入总数，但**不能当作肉瘤通道覆盖**。
4. CTV 通道基于本地子集索引（`query_log` 的告警原文：「结果来自本地子集索引（覆盖 1434 条，其中 1434 条有完整详情），不代表 ctv.veeva.com 全集。」）。零命中只说明本地 1434 条子集里没有，不能外推到 ClinicalTrials.gov 全量。

### 4.3 其它会影响读数的采集参数（照实记）

- 检索词 21 个（`manifest.query.terms`）：英文 12 个 + 中文 9 个，含 `desmoid` 与 `GIST` 两个本轮范围外词，故 150 条 `out_of_scope*` 属预期内命中，不是采集错误。
- 单来源上限 `per_source_limit`：ctv / ictrp / chinadrugtrials / 两个离线语料各 200，`chictr_online` 100。ChiCTR 在线单次最多 100 条且**无分页参数**（`limitations[4]`），若某词命中超过 100 条只能记录截断。实测本次 ChiCTR 21 个词单次最大返回 10 条、`truncated` 全为 false；CTV 单次最大 84 条、`truncated` 全为 false——即本轮**没有发生截断**，但该上限客观存在。
- 各来源查询次数：`ictrp` 1 次（1 失败）、其余各 21 次（`chictr_pancreatic_archive` 21 次全部失败）。

---

## 5. 关键药物卡片

以下 8 张卡片的登记号均已在本轮 `trials-2026.jsonl` 内逐条核到（核法见附录 A 第 4 段）。每张卡的「登记字段」表只抄登记记录本身；`phase` / `sponsor` / 日期在 ChinaDrugTrials 记录里**全部为空**（该来源的 canonical 记录不含这三类字段），故一律写「登记页未列」，不补猜。

统一说明：`status` 是**登记状态，未核实**；中国获批状态一律为**获批状态未核实**（本轮未取得任何药品注册批件原件）。所有「全球最高阶段」均据二次来源，未取得审评报告或说明书原件。

### 5.1 安罗替尼（Anlotinib，盐酸安罗替尼胶囊）

**1. 药物属性**

- 类型：小分子多靶点受体酪氨酸激酶（RTK）抑制剂。
- 剂型：胶囊（登记记录 `interventions` 原文：盐酸安罗替尼胶囊；规格 8 mg / 10 mg / 12 mg 见二次来源）。
- 给药方案：登记记录未列。二次来源载「每次 12 mg，每日 1 次，早餐前口服，连服 2 周停 1 周，21 天 1 周期」——该剂量对应非小细胞肺癌适应证，**不能直接套到肉瘤剂量**，本卡不据此写肉瘤给药方案。

**2. 治疗原理**

- 靶点：VEGFR1-3、FGFR1-4、PDGFR-β、c-Kit 的激酶活性。
- 机制一句话：抑制上述受体酪氨酸激酶，经抗血管生成（VEGFR/FGFR/PDGFR）与抑制增殖（c-Kit）两条通路发挥作用。

**3. 研发阶段**

- 全球最高阶段：二次来源载 2018 年 NMPA 公告批准其胶囊用于非小细胞肺癌；**批件原件本轮未取得，中国获批状态未核实**，肉瘤相关适应证同样为获批状态未核实。
- 关键试验登记号（本轮数据内，均为 `in_scope_sts` 或已标注）：

| 登记号 | 登记状态 | 期别 | 申办者 | 起始 / 更新 | 适应症（登记原文） |
| --- | --- | --- | --- | --- | --- |
| CTR20130324 | 已完成 | 登记页未列 | 登记页未列 | 登记页未列 | 晚期软组织肉瘤 |
| CTR20150531 | 已完成 | 登记页未列 | 登记页未列 | 登记页未列 | 软组织肉瘤 |
| CTR20190938 | 进行中 招募中 | 登记页未列 | 登记页未列 | 登记页未列 | 晚期软组织肉瘤（TQB2450 联合） |
| CTR20220006 | 进行中 招募中 | 登记页未列（标题载 Ib/II 期） | 登记页未列 | 登记页未列 | 局部晚期/转移/复发难治软组织肉瘤（LVGN6051 联合） |
| CTR20260890 | 进行中 招募中 | 登记页未列（标题载 II 期） | 登记页未列 | 登记页未列 | 腺泡状软组织肉瘤（贝莫苏拜单抗联合） |
| CTR20212696 | 进行中 招募完成 | 登记页未列（标题载 III 期） | 登记页未列 | 登记页未列 | 晚期软组织肉瘤；本记录 `scope_tag=out_of_scope_ewing`（条件字段列举了被排除的尤文肉瘤，见 §2.4） |
| 318285（ChiCTR2600122719） | 登记页未列 | 登记页未列 | 复旦大学附属中山医院 | 2026-04-16 / 登记页未列 | 非皮肤血管肉瘤（白蛋白紫杉醇+吉西他滨+安罗替尼） |
| 321593（ChiCTR2600124228） | 登记页未列 | 登记页未列（标题载 II 期） | 山东第一医科大学附属肿瘤医院 | 2026-05-09 / 登记页未列 | 晚期非特指型软组织肉瘤二线（优替德隆联合） |
| 328746（ChiCTR2600134813） | 登记页未列 | 登记页未列（标题载 II 期） | 浙江省肿瘤医院 | 2026-10-21 / 登记页未列 | 不可切除的复发或转移性去分化脂肪肉瘤一线（艾帕洛利托沃瑞利单抗+表柔比星联合） |

- 中国中心情况：ChinaDrugTrials 与 ChiCTR 记录均无「参加机构」字段，**登记页未列**。

**4. 历史已发布数据**

- 本次未核到公开发表的**软组织肉瘤** ORR / PFS / OS / DCR 数值；本轮也未取得任何会议摘要或期刊原文。故本卡不写疗效数字。
- 可核到的只有登记事实：`CTR20130324`、`CTR20150531` 登记状态为「已完成」，`CTR20212696` 为「进行中 招募完成」。**「已完成」是登记状态，不是结果公布**，两者不可互推。

**来源**：国家药品监督管理局药品审评中心（CDE）药物临床试验登记与信息公示平台 · CTR20130324 / CTR20150531 / CTR20190938 / CTR20220006 / CTR20260890 / CTR20212696 登记页 · 2026-10-25 采集快照 · 未取得原件，据二次来源 · 登记号见上表；机制部分：国家药品监督管理局 2018 年安罗替尼胶囊获批上市公告（转载于正大天晴官网）· 未取得原件，据二次来源 · 页码待核；ChiCTR 登记：ChiCTR 三级登记平台 proj=318285 / 321593 / 328746 · 2026-10-25 采集快照 · 未取得原件，据二次来源。

### 5.2 曲贝替定（Trabectedin）

**1. 药物属性**

- 类型：海洋来源生物碱类细胞毒药物（烷化剂类抗肿瘤药，ATC L01CX01）。
- 剂型：注射用冻干粉末（静脉输注用浓缩液用粉末；二次来源载 0.25 mg / 1 mg 两种规格）。
- 给药方案：登记记录未列。二次来源载两种方案：1.5 mg/m² 24 小时静脉输注、每 3 周 1 次；或 0.58 mg/m² 每周 1 次、3 小时输注、4 周周期内用 3 周。

**2. 治疗原理**

- 靶点：DNA 小沟（minor groove）。
- 机制一句话：结合 DNA 小沟并使螺旋向大沟方向弯曲，进而影响转录因子、DNA 结合蛋白与 DNA 修复通路，扰乱细胞周期。

**3. 研发阶段**

- 全球最高阶段：二次来源载欧盟 2007-09-17 批准 Yondelis、澳大利亚 TGA 2021-04 批准；**批件原件本轮均未取得，欧盟/澳大利亚/中国的获批状态一律未核实**。
- 关键试验登记号：

| 登记号 | 登记状态 | 期别 | 申办者 | 起始 / 更新 | 适应症（登记原文） |
| --- | --- | --- | --- | --- | --- |
| CTR20132040 | 已完成 | 登记页未列（记录 `interventions` 原文含「第1和第2阶段」） | 登记页未列 | 登记页未列 | L型软组织肉瘤（标题：晚期脂肪肉瘤或平滑肌肉瘤） |

- 中国中心情况：**登记页未列**。

**4. 历史已发布数据**

- 已公布数据（来自欧盟 SmPC 第 5.1 节，针对既往接受过蒽环类与异环磷酰胺治疗的晚期脂肪肉瘤/平滑肌肉瘤随机试验）：
  - 至疾病进展时间（TTP）：24 小时 q3wk 组中位 3.7 个月（CI 2.1–5.4），3 小时 qwk 组 2.3 个月（CI 2.0–3.5），P=0.0302，风险比 HR 0.734（CI 0.554–0.974）。
  - 总生存：原文载两组未检出差异；24 小时 q3wk 组中位 OS 13.9 个月（CI 12.5–18.6），1 年生存率 60.2%（CI 52.0–68.5）。
  - ORR / DCR：本次核到的 SmPC 摘录未列，**未核到**。
- 上述为**境外说明书**收录的数据，**不是** `CTR20132040` 这一中国登记试验的结果；两者不可互推。

**来源**：欧盟委员会 · Yondelis（曲贝替定）Summary of Product Characteristics · 2007 年 9 月 17 日集中审批版本 · 未取得原件，据二次来源（EC 公开 PDF）· 第 5.1 节，页码待核；澳大利亚 TGA · Yondelis 产品与注册信息页 · 2021 · 未取得原件，据二次来源；中国登记：CDE 药物临床试验登记与信息公示平台 · CTR20132040 登记页 · 2026-10-25 采集快照 · 未取得原件，据二次来源。

### 5.3 BI 907828（brigimadlin）

**1. 药物属性**

- 类型：小分子 MDM2–p53 拮抗剂（口服）。
- 剂型：片剂（登记记录 `interventions` 原文：BI 907828 片；二次来源载 10 mg / 30 mg / 45 mg 规格）。
- 给药方案：登记记录未列。二次来源载 Brightline-1 方案：每 21 天第 1 天口服 1 次，起始 30 mg 或 45 mg。

**2. 治疗原理**

- 靶点：MDM2 与 p53 的蛋白–蛋白相互作用。
- 机制一句话：抑制 MDM2 对 p53 的结合与降解，恢复 p53 活性。

**3. 研发阶段**

- 全球最高阶段：III 期（Brightline-1，NCT05218499，Phase 2/Phase 3，实际入组 400 例，2022-03-31 起始，主要完成 2024-04-16，研究完成 2026-01-26；二次来源 ClinicalTrials.gov 记录）。
- 关键试验登记号：

| 登记号 | 登记状态 | 期别 | 申办者 | 起始 / 更新 | 适应症（登记原文） |
| --- | --- | --- | --- | --- | --- |
| CTR20222584 | 已完成 | 登记页未列（标题载 II/III 期、随机、开放标签、多中心） | 登记页未列 | 登记页未列 | 晚期去分化脂肪肉瘤（对照多柔比星，一线） |

- 中国中心情况：**登记页未列**。二次来源（台湾临床试验主持人数据库）显示该研究在台湾有多家医院参与，中国大陆中心本轮未核到，不作推断。

**4. 历史已发布数据**

- 本次**未核到** Brightline-1 的 ORR / PFS / OS / DCR 数值，也未核到该研究结果发表于哪次会议。`CTR20222584` 登记状态为「已完成」，但**「已完成」不等于结果已公布**。
- 可核到的只有一项设计类文献（Future Oncol 2023，Brightline-1 设计与 rationale，PMID 36987836），其中不含疗效结果数值。

**来源**：ClinicalTrials.gov · NCT05218499（Brightline-1）研究记录 · 2026-10-25 读取 · 未取得原件，据二次来源；PubMed · Future Oncol 2023; doi:10.2217/fon-2022-1291 · PMID 36987836 · 未取得原件，据二次来源 · 页码待核；中国登记：CDE 药物临床试验登记与信息公示平台 · CTR20222584 登记页 · 2026-10-25 采集快照 · 未取得原件，据二次来源。

### 5.4 优替德隆（Utidelone，UTD2 为胶囊剂型代号）

**1. 药物属性**

- 类型：埃博霉素（epothilone）B 衍生物，非紫杉类微管稳定剂（化疗药）。
- 剂型：胶囊（在研口服剂型 UTD2，本卡涉及的软组织肉瘤试验用的是胶囊）与注射液（另一剂型；据二次来源 2021 年获 NMPA 批准，获批状态未核实）。
- 给药方案：登记记录未列。二次来源只载「口服胶囊剂型处于关键注册临床阶段」，**具体剂量与周期本次未核到**；`UTN000611954` 标题载「胶囊（UTD2）联合多柔比星，用于晚期软组织肉瘤」。

**2. 治疗原理**

- 靶点：β-微管蛋白。
- 机制一句话：促进微管蛋白聚合并稳定微管，阻断解聚，使细胞周期阻滞于 G2/M 期并触发凋亡。

**3. 研发阶段**

- 全球最高阶段：二次来源载注射液 2021 年获 NMPA 批准（联合卡培他滨，用于既往接受过含蒽环类或紫杉类方案的复发/转移性乳腺癌）；**批件原件未取得，获批状态未核实**。胶囊剂型处于临床研究阶段（二次来源载 2026-06-11 其乳腺癌 III 期获 NMPA 临床试验批准——此为**注册节点，不是疗效进展**）。
- 关键试验登记号：

| 登记号 | 登记状态 | 期别 | 申办者 | 起始 / 更新 | 适应症（登记原文） |
| --- | --- | --- | --- | --- | --- |
| 321593（ChiCTR2600124228） | 登记页未列 | 登记页未列（标题载 II 期） | 山东第一医科大学附属肿瘤医院 | 2026-05-09 / 登记页未列 | 晚期非特指型软组织肉瘤二线（联合安罗替尼） |
| UTN000611954（NCT07842276） | Not yet recruiting（登记状态，未核实） | Phase 2 | Beijing Biostar Pharmaceuticals | 2026-10-18 / 2026-09-25 | 晚期软组织肉瘤（胶囊联合多柔比星） |

- 中国中心情况：`UTN000611954` 的 `countries` 字段为 China（国家层面，具体中心未列）；ChiCTR 记录的申办者为医院，**具体参加机构未列**。

**4. 历史已发布数据**

- 本次未核到**具体数值**。可核到的只有出处线索（均据二次来源，未取得原件）：乳腺癌 III 期结果两次入选 ASCO 年会口头报告，并发表于 Lancet Oncology 与 Annals of Oncology。ORR / PFS / OS / DCR 数值与页码**本次未核到**，故不写数字。
- **软组织肉瘤**：本次未核到任何公开发表的疗效数据。

**来源**：北京华昊中天生物医药股份有限公司 · 优替帝（优替德隆注射液）产品与合作公告 · 2022 · 未取得原件，据二次来源 · 页码待核；中国登记：ChiCTR proj=321593 · 2026-10-25 采集快照 · 未取得原件，据二次来源；ClinicalTrials.gov / CTV · NCT07842276（UTN000611954）研究记录 · 2026-10-25 采集快照 · 未取得原件，据二次来源。

### 5.5 HS-20093（Risvutatug Rezetecan，GSK5764227）

**1. 药物属性**

- 类型：抗体偶联药物（ADC），靶向 B7-H3（CD276）。
- 剂型：注射用冻干制剂（登记记录 `interventions` 原文：注射用 HS-20093）。
- 给药方案：登记记录未列。二次来源载 12 mg/kg、每 3 周 1 次（Q3W）；DAR 约 4。

**2. 治疗原理**

- 靶点：肿瘤细胞表面 B7-H3（CD276）；载荷为拓扑异构酶 I 抑制剂（TOPOi）。
- 机制一句话：全人源抗 B7-H3 单抗结合后内化，连接子断裂释放拓扑异构酶 I 抑制剂，抑制 DNA 复制与转录。

**3. 研发阶段**

- 全球最高阶段：III 期（中国骨肉瘤等适应证；2023 年 12 月授权 GSK 中国以外权益，二次来源载 GSK 在海外推进 I–III 期）。**获批状态未核实**。
- 关键试验登记号：

| 登记号 | 登记状态 | 期别 | 申办者 | 起始 / 更新 | 适应症（登记原文） | 本轮 `scope_tag` |
| --- | --- | --- | --- | --- | --- | --- |
| CTR20230946 | 进行中 招募完成 | 登记页未列 | 登记页未列 | 登记页未列 | 复发或难治性骨与软组织肉瘤 | `in_scope_sts` |
| CTR20244477 | 主动终止 | 登记页未列（标题载 Ib 期） | 登记页未列 | 登记页未列 | 晚期骨与软组织肉瘤（联合治疗） | `in_scope_sts` |
| CTR20251474 | 进行中 招募完成 | 登记页未列（标题载 III 期） | 登记页未列 | 登记页未列 | 骨肉瘤（对照吉西他滨+多西他赛，二线后） | `out_of_scope_osteosarcoma` |
| UTN000451360（NCT05830123，ARTEMIS-002） | Recruiting（登记状态，未核实） | Phase 2 | Hansoh Pharma | 2023-06-08 / 2024-08-23 | 复发或难治性骨肉瘤及其他肉瘤 | `out_of_scope_osteosarcoma` |

- 中国中心情况：ChinaDrugTrials 记录**登记页未列**；`UTN000451360` 的 `countries` 为 China（国家层面，具体中心未列）。

**4. 历史已发布数据**

- **软组织肉瘤**：本次未核到任何公开发表的 ORR / PFS / OS / DCR 数据。
- **骨肉瘤**（本轮范围外，列在此仅为不混淆）：据翰森制药 2026-07-28 公告（二次来源，未取得原件），ARTEMIS-011 关键性 III 期在独立评审委员会（IRC）评估的 PFS 主要终点上达到主要终点，次要终点观察到同方向结果；**具体数值原文载「将在即将召开的医学大会公布」，即尚无数字**。该公告为**公司声明**，不是经同行评议的发表，也不是本工作台核过的数据。
- `CTR20244477` 登记状态为「主动终止」，属登记状态事实，本卡不对原因作任何说明（采集记录未载原因）。

**来源**：美国国家癌症研究所 · NCI Drug Dictionary（anti-B7-H3 antibody-drug conjugate HS-20093）· 2026 读取 · 未取得原件，据二次来源；翰森制药 · HS-20093 骨肉瘤 III 期 ARTEMIS-011 公告 · 2026-07-28 · 未取得原件，据二次来源 · 页码待核；中国登记：CDE 药物临床试验登记与信息公示平台 · CTR20230946 / CTR20244477 / CTR20251474 登记页 · 2026-10-25 采集快照 · 未取得原件，据二次来源；ClinicalTrials.gov / CTV · NCT05830123（UTN000451360）· 2026-10-25 采集快照 · 未取得原件，据二次来源。

### 5.6 TAEST16001

**1. 药物属性**

- 类型：TCR-T 细胞治疗产品（自体 T 细胞经基因改造后回输）。
- 剂型：注射液（细胞悬液；登记记录 `interventions` 原文：TAEST16001 注射液）。
- 给药方案：登记记录未列。二次来源载制备与给药流程：患者 T 细胞经慢病毒转染 NY-ESO-1 特异性 TCR 基因，体外扩增至约 1×10⁹–2×10¹⁰ 个细胞，清淋预处理后回输。

**2. 治疗原理**

- 靶点：NY-ESO-1 癌睾抗原（患者需 HLA-A*02:01 阳性且肿瘤表达 NY-ESO-1）。
- 机制一句话：导入 NY-ESO-1 特异性 TCR 的自体 T 细胞经扩增后回输，识别表达该抗原的肿瘤细胞并杀伤。

**3. 研发阶段**

- 全球最高阶段：II 期 / 确证性临床研究（中国）；二次来源称其为国内首个获 IND 批件的 TCR-T 产品，并已纳入 CDE「突破性治疗品种」名单（**注册节点，不是疗效进展**；该名称是 CDE 的审批通道，不是疗效评价）。**获批状态未核实**。
- 关键试验登记号：

| 登记号 | 登记状态 | 期别 | 申办者 | 起始 / 更新 | 适应症（登记原文） | 本轮 `scope_tag` |
| --- | --- | --- | --- | --- | --- | --- |
| CTR20192611 | 进行中 招募完成 | 登记页未列（标题载 I 期） | 登记页未列 | 登记页未列 | 以软组织肉瘤为主的晚期恶性实体瘤 | `other_sarcoma_in_conditions`（标题未写肉瘤词，条件字段含） |
| CTR20221312 | 进行中 招募完成 | 登记页未列（标题载 II 期） | 登记页未列 | 登记页未列 | 晚期软组织肉瘤 | `in_scope_sts` |
| CTR20262246 | 进行中 招募中 | 登记页未列（标题载确证性临床研究） | 登记页未列 | 登记页未列 | 晚期软组织肉瘤 | `in_scope_sts` |

- 中国中心情况：ChinaDrugTrials 记录**登记页未列**。二次来源（申办方官网新闻）载 II 期由中山大学肿瘤防治中心与北京大学肿瘤医院牵头、多家机构参与——此为**二次来源，未取得方案原件**，具体中心名单待核。

**4. 历史已发布数据**

- I 期：ORR 41.7%（据申办方 2022 年 7 月新闻，ASCO 2022 年会肉瘤专场口头报告；**样本量、PFS、OS、DCR 本次未核到**，未取得摘要原件）。
- II 期：本次未核到公开发表的具体数值。二次来源仅有「已完成 I 期与 II 期第一阶段研究」的表述，**不含数字**。
- 上述 ORR 出自 I 期剂量递增与拓展研究（对应 `CTR20192611`），**不能**读成 II 期或确证性研究的结果。

**来源**：香雪生命科学（广东香雪精准医疗技术有限公司）· TAEST16001 产品与临床研究新闻 · 2022–2023 · 未取得原件，据二次来源 · 页码待核；中国证券网 · 香雪制药公告报道（CDE 突破性治疗品种）· 2023-07 · 未取得原件，据二次来源；中国登记：CDE 药物临床试验登记与信息公示平台 · CTR20192611 / CTR20221312 / CTR20262246 登记页 · 2026-10-25 采集快照 · 未取得原件，据二次来源。

### 5.7 HH2853（艾普美妥司他）

**1. 药物属性**

- 类型：小分子 EZH1/2 双靶抑制剂（表观遗传靶向药）。
- 剂型：片剂（登记记录 `interventions` 原文：HH2853 片；二次来源载 100 mg 规格）。
- 给药方案：登记记录未列。二次来源载 400 mg 每日 2 次、21 天 1 周期（该剂量出自上皮样肉瘤 I/II 期研究，`CTR20255213` 为 III 期，剂量未在登记页核到）。

**2. 治疗原理**

- 靶点：EZH2 与 EZH1（组蛋白甲基转移酶，PRC2 复合物催化亚基）。
- 机制一句话：同时抑制 EZH2 与 EZH1，降低细胞内 H3K27me3 水平，解除对抑癌基因的沉默。

**3. 研发阶段**

- 全球最高阶段：III 期（中国）+ 上市申请已获 CDE 受理（2026-04-03，据二次来源；此前纳入优先审评）。**「受理」是注册节点，不是获批，也不是疗效结果**；获批状态未核实。
- 关键试验登记号：

| 登记号 | 登记状态 | 期别 | 申办者 | 起始 / 更新 | 适应症（登记原文） |
| --- | --- | --- | --- | --- | --- |
| CTR20255213 | 进行中 招募中 | 登记页未列（标题载 III 期、随机对照） | 登记页未列 | 登记页未列 | 晚期上皮样肉瘤初治（对照研究者选择的标准治疗） |

- 中国中心情况：**登记页未列**（二次来源称「全国多中心」，无中心名单，待核）。

**4. 历史已发布数据**

- 已公布数据（2023 年 ASCO 年会，上皮样肉瘤首次人体 I/II 期研究的 I 期部分；据二次来源转述，未取得摘要原件）：
  - 人群：32 例上皮样肉瘤，400 / 600 / 800 mg 每日 2 次三个剂量组，前线治疗中位数 2 线，96.9% 经本地免疫组化确认 INI1 表达缺失。
  - ORR（RECIST 1.1，研究者评估）28.1%；DCR 78.1%；中位至缓解时间 1.9 个月；400 mg BID 组 ORR 36.4%、DCR 81.8%。
  - 1 例 CR 自首次缓解起持续 273 天。
  - PFS / OS：本次未核到。
- 上述为该研究的 **I 期部分**，与 `CTR20255213`（III 期、初治人群）不是同一试验、不是同一人群，**不可互推**。

**来源**：上海海和药物研究开发股份有限公司 · HH2853（艾普美妥司他）纳入优先审评公告 · 2026-02-25 · 未取得原件，据二次来源 · 页码待核；新浪财经 · HH2853 上市申请获受理报道（含 2023 ASCO I 期数据转述）· 2026-04-04 · 未取得原件，据二次来源 · 页码待核；中国登记：CDE 药物临床试验登记与信息公示平台 · CTR20255213 登记页 · 2026-10-25 采集快照 · 未取得原件，据二次来源。

### 5.8 艾帕洛利托沃瑞利单抗（Iparomlimab and Tuvonralimab，QL1706）

**1. 药物属性**

- 类型：PD-1 / CTLA-4 双功能组合抗体（MabPair 平台；由靶向 PD-1 的 IgG4 艾帕洛利单抗与靶向 CTLA-4 的 IgG1 托沃瑞利单抗按固定比例组成）。
- 剂型：注射液（二次来源载 50 mg（2 ml）/ 瓶）。
- 给药方案：登记记录未列。本卡涉及的 2 项肉瘤试验均为联合方案（见下表适应症列），具体剂量与周期**登记页未列**。

**2. 治疗原理**

- 靶点：PD-1 与 CTLA-4 两条免疫检查点通路。
- 机制一句话：同时阻断 PD-1/PD-L1 与 CTLA-4/B7-1、B7-2，解除两条通路对 T 淋巴细胞的抑制。

**3. 研发阶段**

- 全球最高阶段：二次来源载 NMPA 于 2024-09-30 公告附条件批准其注射液（适应证为既往含铂化疗失败的复发或转移性宫颈癌，公告日期 2024-09-30、批准日期 2024-09-26）；**本轮未取得注册批件原件，亦未核到批件号，中国获批状态未核实**。肉瘤适应证处于 II 期。
- 关键试验登记号：

| 登记号 | 登记状态 | 期别 | 申办者 | 起始 / 更新 | 适应症（登记原文） |
| --- | --- | --- | --- | --- | --- |
| 328746（ChiCTR2600134813） | 登记页未列 | 登记页未列（标题载 II 期） | 浙江省肿瘤医院 | 2026-10-21 / 登记页未列 | 不可切除的复发或转移性去分化脂肪肉瘤一线（联合表柔比星与安罗替尼） |
| 333106（ChiCTR2600129927） | 登记页未列 | 登记页未列（标题载 II 期） | 复旦大学附属肿瘤医院 | 2026-08-11 / 登记页未列 | 晚期未分化多形性肉瘤与去分化脂肪肉瘤一线（联合 AI 化疗，原文简称未展开） |

- 中国中心情况：两项 ChiCTR 记录的申办者为医院，**具体参加机构未列**。
- 需说明一处与派工清单不一致：派工清单把 `317708` 列为该药的另 1 条登记。核对该记录，标题为「OVV-01 注射液联合 AK112 注射液治疗晚期软组织肉瘤（STS）……」，**全文未出现本药**，故不计入本卡，也不计为本药证据（详见附录 B）。

**4. 历史已发布数据**

- **软组织肉瘤**：本次未核到任何公开发表的 ORR / PFS / OS / DCR 数据。
- 宫颈癌关键 II 期（QL1706-301）：二次来源仅称「阳性结果」，**具体数值本次未核到**，不写数字。

**来源**：国家药品监督管理局 · 附条件批准艾帕洛利托沃瑞利单抗注射液上市公告 · 2024-09-30 · 未取得原件，据二次来源（NMPA 官网）· 页码待核；济南市科学技术局 · 该产品获批与 MabPair 平台说明 · 2024 · 未取得原件，据二次来源；中国登记：ChiCTR proj=328746 / 333106 · 2026-10-25 采集快照 · 未取得原件，据二次来源。

### 数据缺口汇总（八张卡片，此节不是药物卡片）

| 药物 | 机制是否披露 | 软组织肉瘤公开疗效数据 | 主要缺口 |
| --- | --- | --- | --- |
| 安罗替尼 | 已披露（靶点层面） | 未核到 | 无 STS 的 ORR/PFS/OS 数值；登记页无期别/申办者/日期/中心 |
| 曲贝替定 | 已披露 | 有（境外 SmPC，属脂肪肉瘤/平滑肌肉瘤随机试验） | 中国登记试验本身无结果；ORR/DCR 未核到 |
| BI 907828 | 已披露 | 未核到 | Brightline-1 结果未核到；中国登记记录完成状态无对应结果 |
| 优替德隆 | 已披露 | 未核到（任何瘤种的具体数值都未核到） | 仅有出处线索，无数值；STS 无数据 |
| HS-20093 | 已披露 | 未核到（STS 无；骨肉瘤仅有公司公告「达到主要终点」，无数字） | 公告数值未公布；`CTR20244477` 主动终止原因未载 |
| TAEST16001 | 已披露 | 部分（I 期 ORR 41.7%，ASCO 2022；样本量与 PFS/OS 未核到） | II 期/确证性研究结果未核到 |
| HH2853 | 已披露 | 有（I 期 ORR 28.1%、DCR 78.1%，2023 ASCO） | III 期结果未核到；PFS/OS 未核到 |
| 艾帕洛利托沃瑞利单抗 | 已披露 | 未核到 | STS 无数据；宫颈癌 II 期只有「阳性」表述，无数值 |

八张卡片共同的缺口（不是某一家的问题）：**全部机制的「原件」都没取得**——机制一段均据说明书、监管公告、公司公告或 NCI 词典等二次来源，本轮未取得任何一份药品说明书、审评报告或会议摘要原件；因此所有页码一律「页码待核」。**未出现「机制未披露」的药**：8 个药的靶点与机制在二次来源里都有明确表述，故按表格照实写；若后续要求只用原件，这 8 段的机制部分需全部重做。

---

## 6. 覆盖与缺口（逐来源终态）

结论先行：**本轮 6 条通道没有一条能单独支撑「有没有这个试验」的判断**。下表逐条给出原因。

| 来源 | 拿到什么 | 没拿到什么 | 这一轮能不能用来判断「有没有这个试验」 |
| --- | --- | --- | --- |
| `ictrp`（WHO ICTRP） | 无。第 1 个检索词即失败，`reason_code=UPSTREAM_UNKNOWN_ERROR`，上游为 sidecar `FileNotFoundError` | 全球登记库聚合结果，一条都没有 | **不能**。通道 FAILED，0 条是故障产物，不是检索结果；其余 20 个词根本没执行 |
| `ctv`（CTV 本地索引） | 131 条命中 → 95 条，含 NCT/UTN 双登记号、状态、期别、国家、日期 | ClinicalTrials.gov 全量；本地索引只覆盖 1434 条子集，且未同步的记录不可见 | **不能**。零命中只代表本地子集未命中；也覆盖不到索引同步之后新登记的试验 |
| `chictr_online`（ChiCTR 在线） | 69 条 → 32 条，含登记号、标题、申办机构、起始日期 | 招募状态、期别、条件字段（多为空）；单次上限 100 条且无分页 | **不能**。只能证明「本次在线查询在该词下命中/未命中」，且状态与期别字段缺失，无法据以判断试验是否在招募、处于哪一期 |
| `chinadrugtrials`（受控归档） | 179 条 → 134 条，含登记号、标题、登记状态、干预措施、条件 | 期别、申办者、起始/更新日期、参加机构、入组数（该来源记录全部为空）；归档同步时点外的记录不可见 | **不能**。虽为条数最多的来源，但零命中只表示本地受控归档无该词命中；且 134 条全部无日期，无法界定时间覆盖 |
| `chictr_pancreatic_archive`（ChiCTR 胰腺癌离线语料） | 无。`reason_code=PATH_MISSING`，21 次查询全部失败 | 任何肉瘤记录 | **不能**。路径不存在（设计缺陷层），且该语料按设计仅覆盖胰腺癌（设计层）——两层都不覆盖本病种 |
| `xyb_chinadrugtrials_archive`（XYB 离线包） | 2 条（语料内偶然含「肉瘤」字样的记录） | 肉瘤覆盖。包内仅胰腺癌 139 条，数据截止 2026-09-29 | **不能**。2 条是偶然命中，不构成覆盖；截止日之后登记的试验在包内不可见 |

补充两条会影响「能不能判断」的共性事实：

1. **263 条里没有一条带 `enrollment`**（实测 `SELECT count(*) FROM trials WHERE enrollment IS NOT NULL` 返回 0）。因此任何涉及入组规模的判断都无据。
2. **134 条没有日期**，`window_status=unknown`。因此「某项试验是不是 2019 年之后登记的」对其中一半记录无法回答。

---

## 7. 本轮明确未做的清单

1. **未逐条调用 `get_trial_detail`**。`search_trials` 的 canonical 记录不含入组数，故 `enrollment` 列 263 条全空（实测非空 0 条）。要补该字段须逐条调详情接口，本轮未做，任何「入组多少人」的表述都缺依据。
2. **未取得任何指南原件**（CSCO《骨与软组织肿瘤诊疗指南》2025 版、NCCN STS 均未取得）。因此本文档与界面均**不出现「指南如何说」的表述**，G1 出处层 / G2 节奏层 / G3 分级层本轮均未做——这一点与 `docs/DEV-PLAN.md`、`docs/DEV-REQUIREMENTS-2026-10-25.md` §四一致。
3. **未核中国获批状态**。8 张卡片一律标「获批状态未核实」，本轮未取得任何药品注册批件、进口注册证或附条件批准通知书原件；二次来源里出现的「附条件批准」「已上市」表述只作线索记录，不作结论。
4. **未做亚型专属切分**。60 条 `in_scope_sts` 未按脂肪肉瘤 / 平滑肌肉瘤 / 滑膜肉瘤 / 血管肉瘤 / 上皮样肉瘤等再分组；同理未按部位（肢体、腹膜后、内脏、头颈）切分，未按线数（一线/二线）切分。
5. **未做跨来源身份合并**。同一试验在不同登记库（如 CTR 与 NCT）若登记号不同，本轮保留为多行，未做「同一试验」归并（见 §2.1）。
6. **未重试 ICTRP**，也未补跑其失败的 20 个检索词；`ictrp` 本轮终态即为 FAILED。
7. **未取得任何会议摘要、期刊全文或公司公告原件**。第 5 章「历史已发布数据」中的每个数值都来自二次来源转述，页码一律「页码待核」；未做与原始摘要的逐字比对。
8. **未核 `scope_tag` 的逐条正确性**。仅抽查发现 1 处关键词归类偏差（`CTR20212696`，见 §2.4），其余 262 条按脚本原始标记保留，未人工复核。
9. **未做疗效、安全性、可及性的任何比较**，也未写任何用药、就医、方案选择的意见。本文档不含判断句。

---

## 附录 A · 本文数字的复核命令

```console
# 1) 三处数量
wc -l research/sarcoma/trials-2026.jsonl
sqlite3 research/sarcoma/sarcoma_cancer_trials_2026.sqlite "SELECT count(*) FROM trials;"
python3 -c "import json;print(json.load(open('research/sarcoma/manifest.json'))['counts']['deduped_total'])"

# 2) 分来源条数
sqlite3 research/sarcoma/sarcoma_cancer_trials_2026.sqlite \
  "SELECT source,count(*) FROM trials GROUP BY source ORDER BY source;"

# 3) 三分区与窗口分布
python3 - <<'EOF'
import json,collections
rows=[json.loads(l) for l in open('research/sarcoma/trials-2026.jsonl')]
print(collections.Counter(r['scope_tag'] for r in rows))
print(collections.Counter(r['window_status'] for r in rows))
print('scope_basis', collections.Counter(r['scope_basis'] for r in rows))
print('title_has_sarcoma_term', collections.Counter(r['title_has_sarcoma_term'] for r in rows))
EOF

# 4) 第 5 章 8 张卡片的登记号是否都在本数据集内
python3 - <<'EOF'
import json
ids={'CTR20130324','CTR20150531','CTR20190938','CTR20220006','CTR20260890','CTR20212696',
     'CTR20132040','CTR20222584','CTR20255213',
     '321593','UTN000611954','CTR20230946','CTR20244477','CTR20251474','UTN000451360',
     'CTR20192611','CTR20221312','CTR20262246','328746','333106','318285','317708'}
rows=[json.loads(l) for l in open('research/sarcoma/trials-2026.jsonl')]
have={r['registry_id'] for r in rows}
print('卡片引用登记号:',len(ids),'| 命中:',len(ids&have),'| 缺失:',sorted(ids-have))
EOF

# 5) 文件指纹
shasum -a 256 research/sarcoma/trials-2026.jsonl research/sarcoma/sarcoma_cancer_trials_2026.sqlite
```

注：本文另做过一次评价性用语自检（词表按 6 类固定表述逐条比对，本次命中 0 条），因该词表本身若要写进命令会与待检文件同词，故不在本文内重复列出；复检时以同一词表对本文件执行检索即可。

## 附录 B · 与派工清单对不上的一处

派工清单把 `317708` 列为「艾帕洛利托沃瑞利单抗」的另 1 条登记。核对 `trials-2026.jsonl` 中该记录：

- 标题：「一项评价 OVV-01 注射液联合 AK112 注射液治疗晚期软组织肉瘤（STS）受试者安全性及有效性的单臂、开放、多中心临床研究」
- 申办者：中国医学科学院肿瘤医院；起始日期：2026-04-15；`interventions` 为空；`scope_tag=in_scope_sts`
- 全文字段（含 `raw_json`）**未出现「艾帕洛利」「托沃瑞利」「QL1706」**。

故本卡未收录该登记号。若后续确认该研究确含本药，应以登记页原件为准再补，而不是据派工清单回填。
