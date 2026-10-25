# 软组织肉瘤（STS）患者信息工作台 · 医学事实约束

> 用途：为工作台的**名词、结构、口径**提供可核验的公开事实。工作台只做信息整理，**不做诊断、不做治疗推荐、不给预后或生存率判断**。
> 本文所有条目均为"某份公开文件写了什么"，不等于对任何患者的适用结论。
> 采集日期：2026-10-25（Asia/Shanghai）。采集方式：直接抓取原始网页 / 原始 PDF 并逐字比对；仅读摘要的条目已单独标注。

## 0. 核验口径（先读这一节）

| 标记 | 含义 |
| --- | --- |
| **已核** | 本次已打开原始页面/原始 PDF，逐字比对过引文 |
| **已核（摘要）** | 只读到 PubMed/期刊摘要或网页表格，未读全文 |
| **二手** | 非指南/非原始文件，属综述、患者版、百科或患教材料 |
| **未核实** | 本次未取得可核验原文；**这是"没查到"，不是"不存在"** |
| **冲突** | 两个来源表述不一致，已并列写出 |

三条硬约束（写给后续开发者）：

1. 任何一条事实进界面时，必须能追到本文的"来源"行；追不到就不进。
2. **患者版指南 ≠ 指南原文**。NCCN 患者版是依据专业版改写的科普件，引用时必须写明"患者版"。
3. 中国获批状态本次**大面积未核实**（原因见 §11），界面不得把"未核实"渲染成"未获批"。

---

## 1. WHO 软组织与骨肿瘤分类（2020 第 5 版）

### 1.1 版本与书目信息（已核）

- **结论**：现行分类为《WHO Classification of Tumours, 5th Edition, Volume 3: Soft Tissue and Bone Tumours》，WHO Classification of Tumours Editorial Board 编，IARC 出版，2020 年，ISBN-13 978-92-832-4502-5。
- 来源：*Soft Tissue and Bone Tumours — WHO Classification of Tumours, 5th Edition, Volume 3* https://publications.iarc.fr/Book-And-Report-Series/Who-Classification-Of-Tumours/Soft-Tissue-And-Bone-Tumours-2020 2020（IARC 官方书目页）
- 核验：**已核**

### 1.2 结构：12 个软组织类别 + 1 个单列章节（已核）

- **结论**：第 1 章"Soft tissue tumours"按分化方向分为 12 类：脂肪细胞性、成纤维细胞/肌成纤维细胞性、所谓纤维组织细胞性、血管性、血管周细胞性（pericytic）、平滑肌、骨骼肌、胃肠间质瘤（GIST）、软骨-骨性、外周神经鞘、分化不确定的肿瘤、未分化肉瘤；第 2 章把"未分化小圆细胞肉瘤"单列（Ewing 肉瘤、EWSR1-non-ETS、CIC 重排、BCOR 改变）。
- 来源：*Soft Tissue and Bone Tumours* 官方目录 PDF https://publications.iarc.fr/download/ToC_STB5.pdf 2020（第 1–2 章章名与页码）
- 核验：**已核**

### 1.3 "亚型数量"：没有单一官方数字（已核 + 二手）

- **结论 A（重要）**：WHO 蓝皮书**不公布一个"STS 亚型总数"**。官方目录是按类别逐条列实体（良性、中间型、恶性都列），因此"多少个亚型"取决于是否计入良性/中间型/变异型，不同数法结果不同。
- 来源：同上官方目录 PDF（逐条实体+页码，无总数栏） https://publications.iarc.fr/download/ToC_STB5.pdf 2020
- 核验：**已核**
- **结论 B**：文献中最常被引用的口径是"软组织恶性肿瘤可再分为**约 70 个亚型**"。这是综述作者的概括，不是 WHO 的官方计数。
- 来源：Sbaraglia M, Bellan E, Dei Tos AP. *The 2020 WHO Classification of Soft Tissue Tumours: news and perspectives.* Pathologica 2021;113(2):70–84（"subclassified in approximately 70 subtypes"）https://pmc.ncbi.nlm.nih.gov/articles/PMC8167394/ 2021
- 核验：**已核**（原文逐字）；**二手**（综述，非 WHO 原文）
- **结论 C（给工作台的口径建议）**：界面写"WHO 2020 将软组织肿瘤分为 12 类、文献常称约 70 种恶性亚型；本书不设单一亚型总数"，比写一个精确数字更稳。

### 1.4 患者会遇到的成人常见亚型 → WHO 2020 条目与页码（已核）

页码取自 IARC 官方目录 PDF，可直接回溯到蓝皮书正文页。

| 患者看到的名称 | WHO 2020 条目（英文） | 起始页 |
| --- | --- | --- |
| 未分化多形性肉瘤（UPS） | Undifferentiated sarcoma（下含 pleomorphic / spindle cell / round cell 未分化肉瘤） | 318 |
| 高分化脂肪肉瘤 / 非典型脂肪瘤性肿瘤 | Atypical lipomatous tumour / well-differentiated liposarcoma | 36 |
| 去分化脂肪肉瘤 | Dedifferentiated liposarcoma | 39 |
| 黏液样脂肪肉瘤 | Myxoid liposarcoma | 42 |
| 多形性脂肪肉瘤 | Pleomorphic liposarcoma | 45 |
| 黏液样多形性脂肪肉瘤（2020 新增） | Myxoid pleomorphic liposarcoma | 47 |
| 平滑肌肉瘤 | Leiomyosarcoma | 195 |
| 滑膜肉瘤 | Synovial sarcoma | 290 |
| 恶性外周神经鞘膜瘤（MPNST） | Malignant peripheral nerve sheath tumour | 254 |
| 血管肉瘤 | Angiosarcoma | 176 |
| 成人纤维肉瘤 | Adult fibrosarcoma | 122 |
| 上皮样肉瘤 | Epithelioid sarcoma | 294 |
| 透明细胞肉瘤 | Clear cell sarcoma of soft tissue | 300 |
| 腺泡状软组织肉瘤（ASPS） | Alveolar soft part sarcoma | 297 |
| 隆突性皮肤纤维肉瘤（DFSP） | Dermatofibrosarcoma protuberans（含 fibrosarcomatous 型） | 100 |
| 横纹肌肉瘤（胚胎型/腺泡型/多形型/梭形-硬化型） | Embryonal / Alveolar / Pleomorphic / Spindle cell–sclerosing rhabdomyosarcoma | 201 / 205 / 209 / 211 |

- 来源：https://publications.iarc.fr/download/ToC_STB5.pdf 2020（逐条页码）；类别归属另见 §1.2 同一目录
- 核验：**已核**

### 1.5 一个容易写错的细节（已核）

- **结论**："UPS"这个名字在第 5 版里**不再作为软组织的主条目名**：软组织侧写作 "Undifferentiated sarcoma"（其下再分多形性/梭形/圆细胞），而 "Undifferentiated pleomorphic sarcoma" 这个名字出现在**骨肿瘤**章节（p.480）。患者端仍普遍看到 "UPS" 这个旧称。
- 来源：同上目录 PDF（p.318 与 p.480 两处条目名） https://publications.iarc.fr/download/ToC_STB5.pdf 2020
- 核验：**已核**

---

## 2. AJCC 第 8 版 STS 分期

### 2.1 分期按解剖部位分设（已核）

- **结论**：AJCC 第 8 版对软组织肉瘤**按原发部位分设不同的 T 定义与分期组**，至少包括：头颈、躯干与四肢、腹膜后、腹部与胸腔内脏器官，另有"少见组织学类型与部位"一章。这是"同一个 TNMG 在不同部位得到不同分期"的出处。
- 来源：NCI PDQ® *Adult Soft Tissue Sarcoma Treatment* — "Stage Information for Soft Tissue Sarcoma / American Joint Committee on Cancer (AJCC) Staging System" https://www.cancer.gov/types/soft-tissue-sarcoma/hp/adult-soft-tissue-treatment-pdq （页面引用 AJCC Cancer Staging Manual, 8th ed., Springer 2017, pp. 489–496）2025 在线版
- 核验：**已核**
- 旁证（摘要级）：Tanaka K, Ozaki T. *New TNM classification (AJCC eighth edition) of bone and soft tissue sarcomas.* Jpn J Clin Oncol 2019;49(2):103–107 —— 摘要明确写软组织肉瘤分 4 个部位（躯干与四肢 / 腹膜后 / 头颈 / 内脏）。https://pubmed.ncbi.nlm.nih.gov/30423153/ 2019
- 核验：**已核（摘要）**

### 2.2 T：大小分层（已核）

躯干、四肢、腹膜后共用一套 T（单位 cm，最大径）：

| T | 定义 |
| --- | --- |
| TX | 无法评估 |
| T0 | 无原发肿瘤证据 |
| T1 | ≤ 5 cm |
| T2 | > 5 cm 且 ≤ 10 cm |
| T3 | > 10 cm 且 ≤ 15 cm |
| T4 | > 15 cm |

头颈另用一套：T1 ≤2 cm；T2 >2–4 cm；T3 >4 cm；T4 侵犯邻近结构（T4a 眼眶/颅底/硬脑膜/中央区脏器/面骨/翼肌；T4b 脑实质/颈动脉包绕/椎前肌/神经周围播散至中枢）。
腹部与胸腔内脏器官用另一套：T1 局限于器官；T2 侵出器官（T2a 侵及浆膜/脏层腹膜，T2b 超出浆膜/肠系膜）；T3 侵犯另一器官；T4 多灶（T4a 2 处、T4b 3–5 处、T4c >5 处）。

- 来源：NCI PDQ® 同上页面 Table 1 "Definitions of Primary Tumor (T) for Soft Tissue Sarcoma of the Trunk, Extremities, and Retroperitoneum; Head and Neck; and Abdomen and Thoracic Visceral Organs" https://www.cancer.gov/types/soft-tissue-sarcoma/hp/adult-soft-tissue-treatment-pdq 2025 在线版
- 核验：**已核**

### 2.3 深浅（superficial/deep）：第 8 版已取消 a/b（已核，且是常见误解点）

- **结论**：第 8 版躯干/四肢/腹膜后的 T 分类**不再按"深筋膜浅/深"分 a、b**。第 7 版的 T1a/T1b（≤5 cm 浅/深）、T2a/T2b（>5 cm 浅/深）写法在第 8 版不存在。若产品要展示"深浅"，必须标为"第 7 版口径"或"影像/手术描述"，不能挂在第 8 版 T 上。
- 来源：NCI PDQ® 同上 Table 1（T 栏无 a/b 深浅行） https://www.cancer.gov/types/soft-tissue-sarcoma/hp/adult-soft-tissue-treatment-pdq 2025；旁证 JCOG 综述摘要 "the notation about the depth of the tumor … has been eliminated" https://pubmed.ncbi.nlm.nih.gov/30423153/ 2019
- 核验：**已核**（PDQ 表）+ **已核（摘要）**（JCOG）

### 2.4 N、M、G（已核）

- N：N0 = 无区域淋巴结转移或状态未知；N1 = 有区域淋巴结转移。
- M：M0 = 无远处转移；M1 = 有远处转移。
- G：采用 FNCLCC 三级（GX / G1 / G2 / G3），定义见 §3。
- 来源：NCI PDQ® 同上 Table 2、Table 3、Table 6 https://www.cancer.gov/types/soft-tissue-sarcoma/hp/adult-soft-tissue-treatment-pdq 2025
- 核验：**已核**

### 2.5 分期组（已核，含"同 TNMG 不同分期"）

| 分期 | T | N | M | G |
| --- | --- | --- | --- | --- |
| IA | T1 | N0 | M0 | GX, G1 |
| IB | T2–T4 | N0 | M0 | GX, G1 |
| II | T1 | N0 | M0 | G2, G3 |
| IIIA | T2 | N0 | M0 | G2, G3 |
| IIIB | T3, T4 | N0 | M0 | G2, G3 |
| IIIB / IV（看部位） | 任何 T | N1 | M0 | 任何 G |
| IV | 任何 T | 任何 N | M1 | 任何 G |

关键差异：**同样"任何T N1 M0"，腹膜后记为 IIIB，躯干与四肢记为 IV**。

- 来源：NCI PDQ® 同上 Table 7 及脚注 b（"Stage IIIB for soft tissue sarcoma of the retroperitoneum; stage IV for soft tissue sarcoma of the trunk and extremities"） https://www.cancer.gov/types/soft-tissue-sarcoma/hp/adult-soft-tissue-treatment-pdq 2025；旁证 JCOG 摘要同句 https://pubmed.ncbi.nlm.nih.gov/30423153/ 2019
- 核验：**已核**

### 2.6 出处引用格式（可直接用于界面"出处"行）

- AJCC Cancer Staging Manual, 8th ed. (Amin MB, Edge SB, Greene FL, et al., eds.), Springer, 2017；软组织肉瘤总论 pp. 489–496，头颈 STS pp. 499–505（页码来自 PDQ 表注，非本次直接翻书）。
- 来源：PDQ 页面 Table 4/Table 6 表注 https://www.cancer.gov/types/soft-tissue-sarcoma/hp/adult-soft-tissue-treatment-pdq 2025
- 核验：**已核**（页码转引自 PDQ 表注；**未直接持有 AJCC 原书**）

---

## 3. FNCLCC 分级：三要素与阈值

### 3.1 三要素与打分（已核）

| 要素 | 1 分 | 2 分 | 3 分 |
| --- | --- | --- | --- |
| 肿瘤分化 | 近似正常成人间叶组织（如低级别脂肪肉瘤） | 组织学类型明确（如黏液样/圆细胞脂肪肉瘤） | 胚胎性/未分化、类型存疑、滑膜肉瘤、软组织骨肉瘤、软组织 Ewing |
| 核分裂数（/10 HPF） | 0–9 | 10–19 | ≥ 20 |
| 肿瘤坏死 | 0 分：无坏死 | 1 分：< 50% | 2 分：≥ 50% |

### 3.2 总分 → G（已核）

| 总分 | 级别 |
| --- | --- |
| 2–3 | G1 |
| 4–5 | G2 |
| 6–8 | G3 |
| — | GX：无法评估 |

- 来源：NCI PDQ® 同上 Table 5 "Determinants of FNCLCC Histological Grade" 与 Table 6 "Definition of FNCLCC Histological Grade (G)" https://www.cancer.gov/types/soft-tissue-sarcoma/hp/adult-soft-tissue-treatment-pdq 2025
- 核验：**已核**
- 旁证：UK guidelines for the management of soft tissue sarcomas, *Clin Sarcoma Res* 2016;6:20，Table 1 https://pmc.ncbi.nlm.nih.gov/articles/PMC5109663/ 2016
- 核验：**已核**
- **冲突（轻微，需在界面留意）**：UK 2016 表 1 排版把三级写成 "Grade 1 = 2 or 3; Grade 2 = 4 or 5; Grade 3 = 6"（G3 只写 6），与 PDQ/AJCC 的 "6, 7, or 8" 不完全一致。按 AJCC 第 8 版口径应写 **6–8**；UK 那处疑为排版截断。
- 来源：同上两条并列；核验：**冲突已记录**

### 3.3 患者端常见写法（已核）

- 病理报告里常见的写法是 "FNCLCC G2"、"G3"、"高级别/低级别"；CAP 报告模板把分级字段固定为 G1/G2/G3/未分级四个选项（见 §7）。
- 来源：CAP *Protocol for the Examination of Resection Specimens From Patients With Soft Tissue Tumors*, Version 4.2.0.0, June 2024, "Histologic Grade (FNCLCC)" 字段 https://www.cap.org/wp-content/uploads/protocols/Soft.Tissue_4.2.0.0.REL_CAPCP.pdf 2024
- 核验：**已核**

---

## 4. 治疗相关"名词与顺序"（只记名词，不含推荐）

> 本节只回答"患者会在病历/指南里看到哪些词、这些词在文本中的先后关系"。**任何一项都不构成对某位患者该不该做。**

### 4.1 手术与切缘（已核）

- 手术方式名词（CAP 报告模板的固定选项）：excisional biopsy / intralesional resection（病灶内）/ marginal resection（边缘）/ wide resection（广泛）/ radical resection（根治）。
- 来源：CAP 同上 2024，SPECIMEN → Procedure 字段 https://www.cap.org/wp-content/uploads/protocols/Soft.Tissue_4.2.0.0.REL_CAPCP.pdf 2024
- 核验：**已核**
- 切缘 R 分级（英国指南给出的"务实定义"）：
  - **R0** = 切缘处无肿瘤；
  - **R1** = 肿瘤达切缘（镜下）；
  - **R2** = 肉眼残留。
- 来源：UK guidelines for the management of soft tissue sarcomas, *Clin Sarcoma Res* 2016;6:20（"R0—no tumour at the cut edge. R1—tumour extends to cut edge. R2—macroscopic residual tumour."）https://pmc.ncbi.nlm.nih.gov/articles/PMC5109663/ 2016
- 核验：**已核**
- 患者版说法：NCCN 患者版把 R0 类结果写成 "negative margin / complete resection"，R1 类写成 "positive margin"，并说明阳性切缘可能对应"再次手术或放疗"这一**文本路径**（不是建议）。
- 来源：NCCN Guidelines for Patients® *Soft Tissue Sarcoma*, 2025（基于 NCCN Guidelines Version 1.2025, May 2, 2025），pp. 27、38 https://www.nccn.org/patients/guidelines/content/PDF/sarcoma-patient.pdf 2025
- 核验：**已核**（**患者版**，非专业版原文）

### 4.2 放疗：术前 / 术后（已核）

- 名词：**术前放疗**（文本中也写 neoadjuvant / preoperative radiation）、**术后放疗**（adjuvant / postoperative）。PDQ 的治疗选项表里对应写法是 "Surgery with radiation therapy"、"Radiation therapy and/or chemotherapy followed by surgery"。
- 来源：NCI PDQ® 同上 Table 8 "Treatment Options for Soft Tissue Sarcoma" https://www.cancer.gov/types/soft-tissue-sarcoma/hp/adult-soft-tissue-treatment-pdq 2025；NCCN 患者版 2025 p.27（"radiation therapy … before surgery" / "after surgery"）https://www.nccn.org/patients/guidelines/content/PDF/sarcoma-patient.pdf 2025
- 核验：**已核**（PDQ 专业版表 + NCCN 患者版）

### 4.3 化疗：蒽环类 + 异环磷酰胺（已核）

- 名词与组合（NCCN 2025 患者版 Guide 1 原文列举）：Doxorubicin、Epirubicin、Ifosfamide + mesna、Liposomal doxorubicin；联合方案写作 "Doxorubicin, ifosfamide, mesna"、"Ifosfamide, epirubicin, mesna"、"Doxorubicin, dacarbazine"；后线写作 "Gemcitabine and docetaxel"。
- 来源：NCCN 患者版 2025, Guide 1（p.29）https://www.nccn.org/patients/guidelines/content/PDF/sarcoma-patient.pdf 2025
- 核验：**已核**（**患者版**）

### 4.4 靶向/其他药物：名词存在性（已核）+ 中国获批（未核实）

下表"指南文本中出现的位置"是本次逐字核对的结果；"中国获批/适应证"**一律未核实**，原因见 §11.2。

| 药物 | 在 NCCN 2025 患者版 / PDQ 中的位置（已核） | 中国获批/适应证 |
| --- | --- | --- |
| 帕唑帕尼 pazopanib | NCCN Guide 1「后线」；Guide 2 用于 ASPS、孤立性纤维性肿瘤、硬纤维瘤 | **未核实** |
| 曲贝替定 trabectedin | NCCN Guide 1「后线」，原文注 "especially for liposarcoma and leiomyosarcoma" | **未核实** |
| 艾立布林 eribulin | NCCN Guide 1「后线」，原文注 "especially for liposarcoma" | **未核实** |
| 安罗替尼 anlotinib | **NCCN 2025 患者版全文检索不到该词**（2026-10-25 检索）；不能据此推断专业版是否收录 | **未核实** |
| tazemetostat | PDQ Table 9 列为上皮样肉瘤（epithelioid sarcoma）用药；**NCCN 2025 患者版全文检索不到该词** | **未核实** |
| 伊马替尼 imatinib（DFSP） | NCCN Guide 2 "DFSP with fibrosarcomatous transformation — Imatinib"；PDQ Table 9 "Dermatofibrosarcoma protuberans — Imatinib" | **未核实** |
| NTRK 抑制剂 | NCCN Guide 1「NTRK 融合阳性肉瘤专用」：larotrectinib、entrectinib、repotrectinib；PDQ Table 9：larotrectinib | **未核实** |
| 临床试验 | NCCN 患者版有独立章节 "Clinical trials"（p.22），写明参加试验不收费、可随时退出等程序性说明 | 不适用 |

- 来源（表内已核部分）：
  - NCCN 患者版 2025, Guide 1 / Guide 2 / p.22 https://www.nccn.org/patients/guidelines/content/PDF/sarcoma-patient.pdf 2025
  - NCI PDQ® 同上 Table 9 "Sarcoma Subtypes With Higher Sensitivity to Specific Agents" https://www.cancer.gov/types/soft-tissue-sarcoma/hp/adult-soft-tissue-treatment-pdq 2025
- 核验：**已核**（名词与位置）；中国列 **未核实**

### 4.5 关于"顺序"的准确表述（已核）

- 指南文本里的先后是**路径分支**，不是推荐序列：可手术 → 手术（±放疗）；不可手术/需缩小 → 术前治疗再评估；转移性 → 系统治疗。工作台如展示顺序，应写成"指南文本中的路径分支"，并保留"具体到人由医生判断"。
- 来源：NCCN 患者版 2025 pp.26–32 https://www.nccn.org/patients/guidelines/content/PDF/sarcoma-patient.pdf 2025；PDQ Table 8 同上
- 核验：**已核**

---

## 5. 随访复查节奏（公开口径）

### 5.1 先说清楚拿到了什么（核验状态的关键）

- **NCCN 专业版 STS 1.2025 原文：未取得**（nccn.org 指南正文需登录，本次无法下载 PDF）。
- **已取得**：NCCN 面向患者的改写版 *NCCN Guidelines for Patients® Soft Tissue Sarcoma, 2025*，其扉页明确写"based on the NCCN Clinical Practice Guidelines in Oncology (NCCN Guidelines®) for Soft Tissue Sarcoma, **Version 1.2025 — May 2, 2025**"。
- 因此下表的性质是：**患者版转述（二手），不是专业版原文页码**。界面引用必须写"NCCN 患者版 2025（据专业版 1.2025 改写）"。

### 5.2 患者版给出的间隔（已核，逐字）

| 场景 | 病史体检 | 影像 |
| --- | --- | --- |
| 四肢、躯干外侧、头颈（p.27） | 治疗后前 3 年每 **3–6 个月**；之后**每年 1 次** | 治疗结束时做一次基线；术后部位"定期"影像，频率取决于复发风险；若易肺转移则"定期"查胸 |
| 腹腔/腹膜后（p.38） | 前 3 年每 **3–6 个月**；随后 2 年每 **6 个月**；之后**每年 1 次** | 同节奏；腹部首选 **CT**，**MRI** 为可选；部分情况 PET 联合 CT；肺转移风险高者加胸部影像 |
| 转移性（IV 期）（p.32） | 前 2–3 年每 **2–6 个月**；随后 2–3 年每 **6 个月**；之后**每年 1 次** | 治疗结束时基线；胸部及已知转移部位影像 |
| 硬纤维瘤（p.44） | — | CT 或 MRI 每 **3–6 个月 × 3 年**；之后 **2 年内每 6 个月**；按部位可加超声做长期随访 |
| 非典型脂肪瘤性肿瘤/高分化脂肪肉瘤（p.51） | 前 2 年每 **6–12 个月**；之后**每年 1 次** | 原文写：若未发生去分化，**不推荐**常规胸部影像；去分化时按相应路径处理 |

- 来源：NCCN Guidelines for Patients® *Soft Tissue Sarcoma*, 2025（据 NCCN Guidelines Version 1.2025, May 2, 2025），pp. 27 / 32 / 38 / 44 / 51 https://www.nccn.org/patients/guidelines/content/PDF/sarcoma-patient.pdf 2025
- 核验：**已核（患者版）**；专业版原文 **未取得**

### 5.3 另一份"指南原文"级别的旁证（已核）

- 英国指南明确指出：STS 随访**缺乏高质量证据**，各中心做法差异大；其"标准随访"由病史、体检（必要时超声/MRI）、胸片（异常再 CT）、迟发效应监测组成，未给固定月数。
- 来源：UK guidelines for the management of soft tissue sarcomas, *Clin Sarcoma Res* 2016;6:20, "Prognosis and follow-up for primary disease" https://pmc.ncbi.nlm.nih.gov/articles/PMC5109663/ 2016
- 核验：**已核**（原文）
- 对工作台的含义：**"每 3–6 个月"这类数字只能标成"某指南版本的建议"，不能标成"医学共识"**；英国指南恰好证明"没有统一节奏"。

### 5.4 未取得的部分（如实记录）

- ESMO–EURACAN–GENTURIS 2021 指南（*Ann Oncol* 2021;32(11):1348–1365, DOI 10.1016/j.annonc.2021.07.006）全文被出版商反爬拦截（HTTP 403），**未取得原文**，故本文不引其具体间隔。
- 来源记录：https://pubmed.ncbi.nlm.nih.gov/34303806/ 2021（仅题录）
- 核验：**未核实**

---

## 6. 影像复查：模态与报告里的"看不懂的词"

### 6.1 常用模态与用途（已核）

- 原发部位：**MRI 和/或 CT**（肢体/躯干软组织首选描述为 MRI）。
- 胸部：**胸部 CT**，用于高 grade 肉瘤的肺转移筛查（肺是最常见远处转移部位）。
- 腹部/腹膜后：**腹盆腔 CT**（NCCN 患者版：腹部病变影像"一般首选 CT，MRI 也是推荐选项"，部分情况 PET-CT）。
- 其他：PET；圆细胞/黏液样脂肪肉瘤加做腹盆腔 CT 与**全脊柱 MRI**（这类组织学可发生非肺部位转移）；血管肉瘤、上皮样肉瘤、ASPS 可考虑脑影像。
- 来源：NCI PDQ® 同上 "Staging Evaluation" 段 https://www.cancer.gov/types/soft-tissue-sarcoma/hp/adult-soft-tissue-treatment-pdq 2025；NCCN 患者版 2025 p.38 https://www.nccn.org/patients/guidelines/content/PDF/sarcoma-patient.pdf 2025
- 核验：**已核**

### 6.2 "RECIST"是什么层面的词（已核，摘要级）

- **结论**：RECIST 1.1 是**临床试验/研究里评估肿瘤负荷变化的统一标准**（可测量病灶如何选、如何算缓解/进展），不是临床报告必须使用的判读结论。患者报告里出现"按 RECIST 评价"，说明该次评估采用了研究口径。
- 来源：Eisenhauer EA, et al. *New response evaluation criteria in solid tumours: revised RECIST guideline (version 1.1).* Eur J Cancer 2009;45(2):228–247 https://pubmed.ncbi.nlm.nih.gov/19097774/ 2009
- 核验：**已核（摘要）**

### 6.3 报告里患者会看到、但看不懂的词（术语表，**编辑归纳**）

> 说明：以下是**措辞清单 + 通俗释义**，属于工作台编辑归纳，**不是任何指南原文**，也不含判读规则。所有释义只解释"这个词在描述什么"，不解释"意味着好转还是恶化"。

| 报告里的词 | 它描述的是哪一层 | 通俗解释（不含判断） |
| --- | --- | --- |
| 较前增大 / 较前缩小 / 较前相仿 | 与既往检查的**对比** | 这次测得的尺寸与前一次检查相比变大/变小/差不多；"前"指哪一次，报告里通常会写日期 |
| 新发结节 / 新出现 | **新增病灶** | 这次检查看到了上次没有描述的结节 |
| 边缘强化 / 环形强化 / 明显强化 | **增强扫描后的表现** | 打造影剂后，病灶的某一部分变得更亮；"强化"描述的是血供/对比剂分布，不是良恶性结论 |
| 边界清 / 边界不清 | **形态描述** | 病灶与周围组织的分界是否容易分辨 |
| 信号不均 / 混杂信号 | **MRI 信号描述** | MRI 上病灶内部亮度不一致 |
| 分叶状 / 不规则 | **形态描述** | 病灶外形不是光滑的圆形 |
| 靶病灶 / 非靶病灶 | **RECIST 研究口径** | 研究里被选中用于测量的一组病灶 vs 其余病灶 |
| CR / PR / SD / PD | **RECIST 研究口径** | 完全缓解/部分缓解/疾病稳定/疾病进展，按统一规则算出的分类 |
| 基线 | **对比参照** | 治疗前或随访开始时那次检查，后续都拿它作参照 |
| 累及 / 侵犯 | **范围描述** | 病灶到达或进入了某个邻近结构 |
| 未见明确 / 不除外 | **报告的确定性措辞** | "没看清"与"不能排除"是两种不同的不确定，需医生结合其他资料 |

- 来源：以上为工作台编辑归纳（对照 §6.1、§6.2 的模态与 RECIST 出处整理）；**无单份指南逐条定义这些中文措辞**
- 核验：**归纳（未核）**——界面必须标"词义解释，不构成判读"
- 边界：工作台**不做**"较前增大 = 进展"这类映射；这类映射属于医生判读。

---

## 7. 病理报告里的关键字段

### 7.1 一份权威模板把这些字段固定成了"必填项"（已核）

CAP《软组织肿瘤切除标本病理报告模板》Version 4.2.0.0（2024 年 6 月发布，2025 年 3 月起用于认可）把下列内容列为报告字段，可作为"患者会看到哪些行"的权威依据：

| 报告字段 | CAP 模板中的位置 | 这一项是什么层面的信息 |
| --- | --- | --- |
| 组织学类型（Histologic Type） | "TUMOR → Histologic Type"，选项直接取自 WHO 第 5 版 | **诊断/分类层面**：这是"哪一个亚型" |
| 分级（FNCLCC G1/G2/G3/未分级） | "Histologic Grade (FNCLCC)" | **恶性程度评分层面**：由三要素加总得到（§3） |
| 核分裂率 | "Mitotic Rate" | 分级三要素之一 |
| 坏死（有无、范围、%） | "Necrosis / Extent of Necrosis" | 分级三要素之一；也用于记录治疗后改变 |
| 切缘（状态、最近切缘、距离、是否累及） | "MARGINS" | **手术-病理交界层面**：肿瘤离切缘多远、切缘有没有肿瘤 |
| 脉管/淋巴管侵犯（LVI） | "Lymphatic and/or Vascular Invasion" | **镜下播散层面**：是否在血管/淋巴管腔内看到肿瘤；2024 版把它从"可选"升为"必填" |
| 免疫组化（IHC） | "SPECIAL STUDIES → Immunohistochemistry" | **蛋白层面**：用抗体检测某蛋白是否表达 |
| 细胞遗传学 / 分子检测 | "Cytogenetics / Molecular Studies" | **基因层面**：融合、扩增、缺失等 |
| pTNM | "pTNM Classification (AJCC 8th Edition)" | **分期层面**（需与临床分期区分） |

- 来源：CAP *Protocol for the Examination of Resection Specimens From Patients With Soft Tissue Tumors*, Version 4.2.0.0, June 2024 https://www.cap.org/wp-content/uploads/protocols/Soft.Tissue_4.2.0.0.REL_CAPCP.pdf 2024
- 核验：**已核**
- 补充（已核）：该模板同时说明 WHO 把软组织肿瘤分为 benign / intermediate (locally aggressive) / intermediate (rarely metastasizing) / malignant 四类——这解释了为什么患者会看到"中间型""低度恶性"这类词。
- 来源：同上，"WHO Classification of Tumors" 说明段 2024

### 7.2 分子检测：每个缩写对应哪个亚型（已核，来自 CAP 模板 Table 1）

CAP 模板 Table 1 标题为 "Subset of Soft Tissue Tumors that Carry Diagnostic Molecular/Genetic Findings"，逐条列出"肿瘤—最常见分子发现"：

| 患者看到的写法 | CAP 表 1 原文 | 对应亚型 |
| --- | --- | --- |
| SS18-SSX（SS18::SSX1/2/4） | "Synovial sarcoma — SS18::SSX1/2/4 fusion" | 滑膜肉瘤 |
| DDIT3（FUS/EWSR1::DDIT3） | "Myxoid liposarcoma — FUS/EWSR1::DDIT3 fusion" | 黏液样脂肪肉瘤 |
| MDM2（扩增） | "Atypical lipomatous tumor/well-differentiated liposarcoma — MDM2 amplification"；"Dedifferentiated liposarcoma — MDM2 amplification" | 高分化/去分化脂肪肉瘤 |
| EWSR1（EWSR1::ATF1/CREB1） | "Clear cell sarcoma of soft tissue — EWSR1::ATF1/CREB1 fusion" | 透明细胞肉瘤 |
| NTRK（NTRK1/2/3 融合） | "NTRK-fusion tumor — NTRK1/2/3 fusion"；"Infantile fibrosarcoma — ETV6::NTRK3 fusion" | NTRK 重排肿瘤 / 婴儿型纤维肉瘤 |
| PDGFB（COL1A1::PDGFB） | "Dermatofibrosarcoma protuberans — COL1A1::PDGFB fusion" | DFSP（含纤维肉瘤样型） |
| INI1 / SMARCB1（缺失） | "Epithelioid sarcoma — SMARCB1 deletion"；"Extrarenal rhabdoid tumor — SMARCB1 deletion" | 上皮样肉瘤 / 肾外横纹肌样瘤 |
| EZH2 | **不在 CAP 表 1 中**（表 1 只列诊断性分子发现） | 见下条 |

- 来源：CAP 同上，Table 1（pp. 17–19 区段）2024
- 核验：**已核**
- **EZH2 的口径提醒**：EZH2 在文献里主要作为**上皮样肉瘤（INI1 缺失型）的药物治疗靶点**出现，不是诊断字段；诊断字段是 SMARCB1/INI1 缺失。本次未取得 EZH2 说明书的逐字原文，故"EZH2 = 靶点"这一句标 **未核实（二手语境）**。旁证（药物存在性）：PDQ Table 9 将 tazemetostat 列于上皮样肉瘤 https://www.cancer.gov/types/soft-tissue-sarcoma/hp/adult-soft-tissue-treatment-pdq 2025
- 核验：**未核实**

### 7.3 免疫组化缩写（SMA、desmin、CD34、S100、SOX10、EMA、CK）

- **结论（层面说明，已核）**：这些是"抗体名"，报告里以"阳性/阴性/部分阳性"呈现，属于**蛋白表达层面**的辅助信息；它们**单独不能定亚型**，需要与形态学、分子检测合并判断——这是 WHO 分类方法学的基本表述（"Pathologic diagnosis represents the integration of morphologic, immunohistochemical and molecular characteristics"）。
- 来源：Sbaraglia M, et al. *Pathologica* 2021;113(2):70–84（摘要原句）https://pmc.ncbi.nlm.nih.gov/articles/PMC8167394/ 2021
- 核验：**已核**
- **每个缩写指向哪类分化（编辑归纳，未逐条回读教科书）**：
  - SMA、desmin → 肌源性分化（平滑肌/骨骼肌方向）
  - CD34 → 血管内皮及部分成纤维性肿瘤
  - S100、SOX10 → 神经嵴/黑素细胞与神经鞘方向
  - EMA、CK（细胞角蛋白）→ 上皮性分化
- 核验：**归纳（未核）**；本条只可用于"这个词大概在说什么"，不可用于判读阴阳性意义。界面须标注"术语解释"。

---

## 8. 中国流行病学：STS 年新发规模

### 8.1 可引用的公开口径（已核，摘要级）

- **结论**：基于全国肿瘤登记处数据的研究估算，**2014 年中国新发软组织肉瘤约 39,900 例**，占全部恶性肿瘤的 **1.05%**，粗发病率 **2.91/100,000**；该统计**包含 GIST**（GIST 为最常见组织学类型）。数据来自 339 个合格登记处，按 ICD-O 形态学与部位编码提取。
- 来源：Yang Z, Zheng R, Zhang S, Zeng H, Li H, Chen W. *Incidence, distribution of histological subtypes and primary sites of soft tissue sarcoma in China.* Cancer Biol Med 2019;16(3):565–574 https://pubmed.ncbi.nlm.nih.gov/31565485/ 2019
- 核验：**已核（摘要）**——数字与限定条件均来自摘要原文
- **使用限制（必须随数字一起出现）**：① 数据年份为 2014；② 含 GIST，与"仅 STS 不含 GIST"的口径不可直接比较；③ 这是**期刊论文**，不是《中国肿瘤登记年报》原文。

### 8.2 《中国肿瘤登记年报》原文：未取得

- **结论**：本次**未取得**《中国肿瘤登记年报》可核验的电子原文/公开摘要页，因此**无法**给出"年报口径下的 STS 新发数"。
- 核验：**未核实**
- 说明：国家癌症中心/卫健委相关站点在本环境返回 412 拦截，未能检索。

### 8.3 全球口径（可作背景，非中国数据）

- 综述给出的肉瘤总体发病率约 **5 例/10 万**（"approximately 5 cases/100,000"），用于说明"罕见肿瘤"的定义。
- 来源：Sbaraglia M, et al. *Pathologica* 2021;113(2):70–84 https://pmc.ncbi.nlm.nih.gov/articles/PMC8167394/ 2021
- 核验：**已核**（综述表述，非中国数据，非登记年报）

### 8.4 结论写法

- 若产品需要一句话：**"中国 STS 年新发规模无权威公开的统一口径；可引用的公开估算是 2019 年一篇基于登记处数据的研究（2014 年约 3.99 万例，含 GIST）。"**
- 不得写成"中国每年新发 X 万"，也不得省略"含 GIST/2014 年/研究估算"三个限定。

---

## 9. 患者最常混淆的三组概念

> **性质声明**：本节三组对比是工作台**编辑归纳**，用于患教文案，**不是研究结论**，也不是任何指南的定义原文。各组"区别是什么"一句给到可直接上界面的程度。

### 9.1 肉瘤（sarcoma） vs 癌（carcinoma）

- **区别一句话**：**癌来自上皮（皮肤、器官内壁/腺体），肉瘤来自间叶组织（肌肉、脂肪、血管、神经、纤维组织、骨）**；两者是"起源细胞类型"不同的两大类恶性肿瘤，所以肉瘤不叫"某某癌"。
- 来源（患教）：NHS *Soft tissue sarcoma* —— "a rare type of cancer that starts in soft tissue, such as muscle and fat" https://www.nhs.uk/conditions/soft-tissue-sarcoma/ 2025 在线版；American Cancer Society *Soft Tissue Sarcomas* —— "Sarcomas are an uncommon type of cancer that start from bone or soft tissues, like muscle, fat, nerves, fibrous tissue, or blood vessels" https://www.cancer.org/cancer/types/soft-tissue-sarcoma.html 2026 在线版
- 核验：**二手（患教）**；概念本身与 WHO 分类的"间叶来源"一致（§1.2）
- 常见误写：把"脂肪肉瘤"写成"脂肪癌"、把"平滑肌肉瘤"当成"平滑肌瘤"（后者多为良性，属不同实体，见 §1.4 表）。

### 9.2 分级（grade） vs 分期（stage）

- **区别一句话**：**分级看显微镜下"细胞有多恶性"（FNCLCC G1–G3），分期看"肿瘤长多大、到没到淋巴结、有没有远处转移"，并把分级作为其中一项一起算（TNM+G）**。所以同一分期可以是不同分级，同一分级也可以是不同分期。
- 来源：分级 → §3（PDQ Table 5/6；CAP 模板）；分期 → §2.5（PDQ Table 7，分期组含 G 列）
- 核验：**已核**（两套定义分别可回溯）；"一句话对比"为编辑归纳
- 提示：报告里 "G2" 是分级；"IIIA 期"是分期。两个字母不要混。

### 9.3 亚型（subtype） vs 部位（site）

- **区别一句话**：**亚型回答"这是哪一种肿瘤"（组织学类型，WHO 分类，如滑膜肉瘤、去分化脂肪肉瘤）；部位回答"长在哪里"（原发解剖位置，如四肢、腹膜后、头颈）**。同一个亚型可以长在不同部位，同一个部位可以有多种亚型；AJCC 第 8 版正是按**部位**分设不同分期系统。
- 来源：亚型 → WHO 2020 目录（§1.2、§1.4）https://publications.iarc.fr/download/ToC_STB5.pdf 2020；部位 → PDQ 分期章节（按部位分设 T 与分期组，§2.1、§2.5）https://www.cancer.gov/types/soft-tissue-sarcoma/hp/adult-soft-tissue-treatment-pdq 2025
- 核验：**已核**（两侧结构）；"一句话对比"为编辑归纳

---

## 10. 生育与功能保留：只记录"存在这一议题 + 公开出处"

> 本节**不含**任何"应该/建议/可以考虑"的表述。只说明：这些问题在权威文件里被明确列为需要讨论的议题。

### 10.1 生育力：ASCO 指南明确要求"在治疗前讨论"

- **结论**：ASCO 现行指南为 *Fertility Preservation in People With Cancer: ASCO Guideline Update*（J Clin Oncol 2025;43(12):1488–1515）。其建议包括：在诊断时与治疗期间评估并告知**生殖风险**；对有意愿或不确定的患者转诊生殖专科；**在开始抗肿瘤治疗前**讨论生育力保存方案（精子/卵母细胞/胚胎/卵巢组织冻存等），并记录该讨论。
- 来源：Su HI, et al. *Fertility Preservation in People With Cancer: ASCO Guideline Update.* J Clin Oncol 2025;43(12):1488–1515, DOI 10.1200/JCO-24-02782 https://pubmed.ncbi.nlm.nih.gov/40106739/ 2025
- 核验：**已核（摘要）**
- 版本沿革（可核）：上一版为 Oktay K, et al. *Fertility Preservation in Patients With Cancer: ASCO Clinical Practice Guideline Update.* J Clin Oncol 2018;36(19):1994–2001 https://pubmed.ncbi.nlm.nih.gov/29620997/ 2018（**已核（摘要）**）
- 边界：ASCO 指南是**泛癌种**文件，未针对肉瘤单列；"肉瘤患者生育力"的专科文献本次未逐条核验（**未核实**）。

### 10.2 肢体功能：手术相关功能影响被明确写进患者版指南

- **结论**：NCCN 患者版明确写：切除软组织肉瘤的手术**存在造成一定肢体/身体功能障碍的风险**，因此"应接受康复服务评估"（作业治疗/物理治疗）。这是"功能保留是需要被讨论的议题"的公开出处。
- 来源：NCCN Guidelines for Patients® *Soft Tissue Sarcoma*, 2025, p.27 https://www.nccn.org/patients/guidelines/content/PDF/sarcoma-patient.pdf 2025
- 核验：**已核（患者版）**
- 放疗与功能：本次**未取得**专门论述"放疗对肢体功能影响"的指南条目原文 → **未核实**。不得据本文写"放疗会影响功能"这类因果句。

### 10.3 工作台可以怎么用（仅信息结构）

- 可以设"是否被医生提过生育力保存/康复评估"这类**记录字段**（是/否/不记得），并挂上 §10.1、§10.2 的出处链接；
- **不可以**输出"你应当去保存生育力/你应当做康复"这类句子。

---

## 11. 调研限制（如实记录没查到什么）

### 11.1 未取得原文的权威文件

| 文件 | 状态 | 原因 |
| --- | --- | --- |
| NCCN Clinical Practice Guidelines in Oncology: Soft Tissue Sarcoma, Version 1.2025（**专业版**） | 未取得 | nccn.org 指南正文需登录/授权，无法下载 PDF。仅取得其**患者版**（扉页注明据 1.2025 / May 2, 2025 改写） |
| AJCC Cancer Staging Manual, 8th ed. 原书 | 未持有 | 商业出版物；T/N/M/G 与分期组均转引自 NCI PDQ 的表格（其表注给出原书页码 pp.489–496、499–505） |
| ESMO–EURACAN–GENTURIS 2021 STS 指南全文 | 未取得 | 出版商页面反爬（HTTP 403）；仅有题录 |
| 中国《软组织肉瘤诊疗指南》/CSCO 指南原文 | 未取得 | 国家级站点（nhc.gov.cn / nmpa.gov.cn）在本环境返回 412 拦截 |
| 《中国肿瘤登记年报》原文 | 未取得 | 同上；改用期刊论文（Cancer Biol Med 2019）作为替代口径，并标注三项限制 |

### 11.2 中国获批状态：为什么整列都是"未核实"

- 本次尝试访问国家药品监督管理局（nmpa.gov.cn）的药品查询与公告页，均被 WAF 拦截（HTTP 412），**未取得任何批件/说明书原文**。
- 因此对帕唑帕尼、曲贝替定、艾立布林、安罗替尼、tazemetostat、伊马替尼（DFSP）、NTRK 抑制剂，**中国是否获批、批的是哪个适应证，一律写"未核实"**。
- 这是**信息缺口**，不是"未获批"的证据。任何界面文案不得把"未核实"写成"国内没有"。
- 若后续要补齐，最小核验路径：NMPA 药品查询（境内生产/进口药品）→ 输入通用名 → 记录批准文号、批准日期、说明书"适应证"原文；或取得国家卫健委《新型抗肿瘤药物临床应用指导原则》相应版本原文。

### 11.3 其他未核项

- **影像报告中文措辞**（"较前增大""边缘强化"等）没有单份指南逐条定义；本文的释义是编辑归纳，界面须标"词义解释，不构成判读"。
- **免疫组化各标记对应哪类分化**（SMA/desmin/CD34/S100/SOX10/EMA/CK）：仅给出"术语层面"的归纳，未逐条回读教科书/综述原文（相应综述全文接口返回 500）。
- **EZH2 作为靶点**的说明书级表述未取得原文。
- **肉瘤专项生育力/性腺毒性**文献未逐条核验。
- **中国 STS 分亚型发病构成**：Cancer Biol Med 2019 摘要只给出"GIST 最常见，其次神经鞘瘤/MPNST、平滑肌肉瘤、脂肪肉瘤、纤维肉瘤"，未取得全文表格，故不列具体百分比。
- 本文**不含**任何生存率、预后、疗效数字；**不含**治疗推荐。

---

## 附录：来源清单（按首次出现顺序）

| # | 标题 | URL | 版本/年份 | 性质 | 核验 |
| --- | --- | --- | --- | --- | --- |
| S1 | WHO Classification of Tumours, 5th ed., Vol.3: Soft Tissue and Bone Tumours（书目页） | https://publications.iarc.fr/Book-And-Report-Series/Who-Classification-Of-Tumours/Soft-Tissue-And-Bone-Tumours-2020 | 2020, ISBN 978-92-832-4502-5 | 原始书目 | 已核 |
| S2 | 同上，官方目录 PDF（章名、实体名、页码） | https://publications.iarc.fr/download/ToC_STB5.pdf | 2020 | 原始文件 | 已核 |
| S3 | Sbaraglia M, Bellan E, Dei Tos AP. The 2020 WHO Classification of Soft Tissue Tumours: news and perspectives. *Pathologica* | https://pmc.ncbi.nlm.nih.gov/articles/PMC8167394/ | 2021;113(2):70–84 | 综述（二手） | 已核 |
| S4 | NCI PDQ® Adult Soft Tissue Sarcoma Treatment（含 AJCC 8 表 1/2/3/6/7/9、FNCLCC 表 5） | https://www.cancer.gov/types/soft-tissue-sarcoma/hp/adult-soft-tissue-treatment-pdq | 2025 在线版 | 专业版摘要性综述 | 已核 |
| S5 | Tanaka K, Ozaki T. New TNM classification (AJCC 8th) of bone and soft tissue sarcomas. *Jpn J Clin Oncol* | https://pubmed.ncbi.nlm.nih.gov/30423153/ | 2019;49(2):103–107 | 期刊综述 | 已核（摘要） |
| S6 | UK guidelines for the management of soft tissue sarcomas. *Clin Sarcoma Res* | https://pmc.ncbi.nlm.nih.gov/articles/PMC5109663/ | 2016;6:20 | 指南原文 | 已核 |
| S7 | CAP Protocol: Resection, Soft Tissue Tumors, Version 4.2.0.0 | https://www.cap.org/wp-content/uploads/protocols/Soft.Tissue_4.2.0.0.REL_CAPCP.pdf | 2024-06（2025-03 起认可用） | 病理报告模板 | 已核 |
| S8 | NCCN Guidelines for Patients® Soft Tissue Sarcoma（据专业版 1.2025 / 2025-05-02 改写） | https://www.nccn.org/patients/guidelines/content/PDF/sarcoma-patient.pdf | 2025 | **患者版**（二手转述） | 已核 |
| S9 | Eisenhauer EA, et al. RECIST 1.1. *Eur J Cancer* | https://pubmed.ncbi.nlm.nih.gov/19097774/ | 2009;45(2):228–247 | 方法学原文 | 已核（摘要） |
| S10 | Su HI, et al. Fertility Preservation in People With Cancer: ASCO Guideline Update. *J Clin Oncol* | https://pubmed.ncbi.nlm.nih.gov/40106739/ | 2025;43(12):1488–1515 | 指南 | 已核（摘要） |
| S11 | Oktay K, et al. Fertility Preservation in Patients With Cancer: ASCO Guideline Update（上一版）. *J Clin Oncol* | https://pubmed.ncbi.nlm.nih.gov/29620997/ | 2018;36(19):1994–2001 | 指南 | 已核（摘要） |
| S12 | Yang Z, et al. Incidence … of soft tissue sarcoma in China. *Cancer Biol Med* | https://pubmed.ncbi.nlm.nih.gov/31565485/ | 2019;16(3):565–574 | 登记处数据研究 | 已核（摘要） |
| S13 | NHS. Soft tissue sarcoma（患教页） | https://www.nhs.uk/conditions/soft-tissue-sarcoma/ | 2025 在线版 | 患教（二手） | 已核 |
| S14 | American Cancer Society. Soft Tissue Sarcomas（患教页） | https://www.cancer.org/cancer/types/soft-tissue-sarcoma.html | 2026 在线版 | 患教（二手） | 已核 |
| S15 | ESMO–EURACAN–GENTURIS 2021 STS 指南（**仅题录，全文未取得**） | https://pubmed.ncbi.nlm.nih.gov/34303806/ | 2021;32(11):1348–1365 | 指南 | 未核实 |

---

*本文件为信息整理用的公开事实汇编，不含诊断、治疗建议、预后判断或生存率数据。所有"未核实"项在补证前不得在界面呈现为确定结论。*
