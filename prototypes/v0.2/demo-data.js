/* 由 demo/build-demo-data.mjs 生成，请勿手改（演示数据唯一源）。 */
window.DEMO = {
  "meta": {
    "brand": {
      "zh": "小肉宝",
      "en": "SarcoPal",
      "tag": "软组织肉瘤患者工作台"
    },
    "version": "0.1.0",
    "build": "2026-10-25",
    "channel": "prototype",
    "channelLabel": "交互原型 · 未接入 DSH",
    "guideNote": "展示的指南口径为 NCCN 患者版 2025（据专业版 1.2025 改写）；专业版原文未取得。",
    "oncologyNote": "本工作台只做信息整理，不提供诊断、治疗建议或预后判断。",
    "sites": [
      "肢体",
      "腹膜后",
      "头颈",
      "躯干",
      "内脏"
    ],
    "depths": [
      "皮下",
      "筋膜下",
      "未写明"
    ]
  },
  "profiles": [
    {
      "id": "p1",
      "name": "陈女士",
      "short": "陈",
      "role": "patient",
      "birthYear": 1988,
      "site": "肢体",
      "depthText": "深部（筋膜下，报告原文：侵及深筋膜）",
      "recorder": "patient",
      "recorderLabel": "本人记录",
      "in_use": 1,
      "subtype": {
        "name": "滑膜肉瘤（双相型）",
        "en": "Synovial sarcoma, biphasic",
        "whoPage": "p.290",
        "grade": "FNCLCC G2",
        "gradeSource": "术后病理报告原文（2025-05-08，市肿瘤医院病理科）",
        "stageText": "医生记录：IIIA 期（四肢）",
        "stageNote": "分期由医生给出，本工作台不计算。",
        "ihc": [
          {
            "k": "SS18-SSX1",
            "v": "阳性（FISH）",
            "note": "融合基因检测"
          },
          {
            "k": "EMA",
            "v": "部分阳性",
            "note": "上皮标记"
          },
          {
            "k": "CK",
            "v": "局灶阳性",
            "note": "上皮标记"
          },
          {
            "k": "CD99",
            "v": "阳性",
            "note": "膜蛋白"
          },
          {
            "k": "INI1",
            "v": "保留表达",
            "note": "SMARCB1 未见缺失"
          }
        ],
        "molecular": [
          {
            "k": "SS18::SSX1 融合",
            "v": "检出",
            "method": "FISH / RT-PCR"
          },
          {
            "k": "MDM2 扩增",
            "v": "未检出",
            "method": "FISH"
          }
        ],
        "consult": [
          {
            "date": "2025-04-25",
            "hospital": "市肿瘤医院",
            "text": "建议新辅助后广泛切除，必要时联合放疗。",
            "kind": "本院"
          },
          {
            "date": "2025-04-28",
            "hospital": "省肿瘤医院",
            "text": "意见一致：先行新辅助，再评估切缘。",
            "kind": "外院会诊"
          }
        ]
      },
      "pathologies": [
        {
          "visibility": "shared",
          "id": "pa1",
          "date": "2025-04-18",
          "kind": "穿刺活检",
          "subtypeText": "滑膜肉瘤，双相型",
          "gradeText": "未分级（活检标本）",
          "site": "肢体",
          "depthText": "深部",
          "marginText": "—（活检）",
          "source": "市肿瘤医院病理科 · 病理号 A25-04118",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "pa2",
          "date": "2025-05-08",
          "kind": "术后病理（广泛切除）",
          "subtypeText": "滑膜肉瘤，双相型",
          "gradeText": "FNCLCC G2（分化 2 + 核分裂 1 + 坏死 1 = 4 分）",
          "site": "肢体",
          "depthText": "深部",
          "marginText": "R0（切缘未见肿瘤）",
          "source": "市肿瘤医院病理科 · 病理号 A25-05007",
          "recorder": "patient",
          "in_use": 1
        }
      ],
      "imaging": [
        {
          "visibility": "shared",
          "id": "im1",
          "date": "2025-04-10",
          "site": "肢体",
          "modality": "MRI（右大腿）",
          "baseline": 0,
          "comparedTo": "",
          "wording": "右股外侧肌群内见 48×31 mm 异常信号灶，边界欠清，增强后明显强化。",
          "source": "市肿瘤医院影像科 · 报告号 MR2504102",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "im2",
          "date": "2025-06-02",
          "site": "肢体",
          "modality": "MRI（右大腿）",
          "baseline": 1,
          "comparedTo": "",
          "wording": "右大腿术后改变，术区未见明确残留病灶；周围软组织肿胀。",
          "source": "市肿瘤医院影像科 · 报告号 MR2506021",
          "recorder": "patient",
          "baselineNote": "术后首次复查，被设为基线",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "im3",
          "date": "2025-06-02",
          "site": "内脏",
          "modality": "胸部 CT",
          "baseline": 1,
          "comparedTo": "",
          "wording": "双肺未见明确结节影。",
          "source": "市肿瘤医院影像科 · 报告号 CT2506021",
          "recorder": "patient",
          "baselineNote": "肺转移筛查基线",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "im4",
          "date": "2025-09-15",
          "site": "肢体",
          "modality": "MRI（右大腿）",
          "baseline": 0,
          "comparedTo": "MR2506021（2025-06-02，基线）",
          "wording": "与 2025-06-02 片比较：术区软组织肿胀较前减轻；未见明确新发异常信号。",
          "source": "市肿瘤医院影像科 · 报告号 MR2509151",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "im5",
          "date": "2025-09-15",
          "site": "内脏",
          "modality": "胸部 CT",
          "baseline": 0,
          "comparedTo": "CT2506021（2025-06-02，基线）",
          "wording": "与 2025-06-02 片比较：双肺未见明确结节。",
          "source": "市肿瘤医院影像科 · 报告号 CT2509151",
          "recorder": "patient",
          "in_use": 1
        }
      ],
      "local": [
        {
          "visibility": "shared",
          "id": "lo1",
          "kind": "surgery",
          "title": "广泛切除（右大腿）",
          "dateStart": "2025-05-02",
          "dateEnd": "2025-05-02",
          "detail": "右股外侧肌群广泛切除 + 局部肌瓣修复；术中冰冻切缘阴性。",
          "margin": "R0",
          "status": "已完成",
          "recorder": "patient",
          "complications": [
            {
              "date": "2025-05-09",
              "text": "伤口少量渗液，换药 2 次/日。"
            },
            {
              "date": "2025-05-16",
              "text": "渗液减少，伤口对合良好。"
            }
          ],
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "lo2",
          "kind": "rt",
          "title": "术后放疗（右大腿瘤床）",
          "dateStart": "2025-06-10",
          "dateEnd": "2025-07-22",
          "detail": "瘤床 + 安全边 60 Gy / 30 次，三维适形。",
          "margin": "",
          "status": "已完成",
          "recorder": "patient",
          "complications": [
            {
              "date": "2025-06-28",
              "text": "照射区皮肤发红、脱屑，自述灼痛。"
            },
            {
              "date": "2025-07-20",
              "text": "皮肤反应减轻，遗留色素沉着。"
            }
          ],
          "in_use": 1
        }
      ],
      "systemic": [
        {
          "visibility": "shared",
          "id": "sy1",
          "lineNo": 1,
          "regimen": "多柔比星 + 异环磷酰胺（+ 美司钠）",
          "dateStart": "2025-08-05",
          "dateEnd": "",
          "cycleNo": 3,
          "cyclePlan": "计划 6 周期",
          "status": "进行中",
          "recorder": "patient",
          "reasonText": "术后辅助，医生记录为「高危因素，建议辅助化疗」。",
          "cycles": [
            {
              "d": "2025-08-05",
              "n": 1,
              "note": "第 1 周期第 1 天"
            },
            {
              "d": "2025-08-26",
              "n": 2,
              "note": "第 2 周期第 1 天"
            },
            {
              "d": "2025-09-16",
              "n": 3,
              "note": "第 3 周期第 1 天"
            }
          ],
          "in_use": 1
        }
      ],
      "functionLog": [
        {
          "visibility": "shared",
          "id": "fu1",
          "domain": "lymphedema",
          "date": "2025-06-05",
          "measure": "右大腿周径（髌上 10 cm）",
          "value": 45,
          "unit": "cm",
          "side": "患侧",
          "text": "",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "fu2",
          "domain": "lymphedema",
          "date": "2025-07-10",
          "measure": "右大腿周径（髌上 10 cm）",
          "value": 47.2,
          "unit": "cm",
          "side": "患侧",
          "text": "",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "fu3",
          "domain": "lymphedema",
          "date": "2025-09-15",
          "measure": "右大腿周径（髌上 10 cm）",
          "value": 48.5,
          "unit": "cm",
          "side": "患侧",
          "text": "",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "fu4",
          "domain": "function",
          "date": "2025-06-05",
          "measure": "连续步行距离（自述）",
          "value": 800,
          "unit": "m",
          "side": "",
          "text": "平地，可耐受",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "fu5",
          "domain": "function",
          "date": "2025-09-15",
          "measure": "连续步行距离（自述）",
          "value": 500,
          "unit": "m",
          "side": "",
          "text": "走到 500 m 时大腿发沉，需休息",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "fu6",
          "domain": "wound",
          "date": "2025-09-15",
          "measure": "",
          "value": null,
          "unit": "",
          "side": "",
          "text": "术区皮肤偏硬，偶有牵拉感；无破溃。",
          "recorder": "patient",
          "in_use": 1
        }
      ],
      "metrics": [
        {
          "visibility": "shared",
          "id": "m1",
          "name": "白细胞计数 WBC",
          "value": 4.8,
          "unit": "×10⁹/L",
          "ref": "3.5–9.5",
          "date": "2025-08-05",
          "source": "血常规 · 化验单 2025-08-05",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "m2",
          "name": "白细胞计数 WBC",
          "value": 2.8,
          "unit": "×10⁹/L",
          "ref": "3.5–9.5",
          "date": "2025-08-29",
          "source": "血常规 · 化验单 2025-08-29",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "m3",
          "name": "白细胞计数 WBC",
          "value": 3.1,
          "unit": "×10⁹/L",
          "ref": "3.5–9.5",
          "date": "2025-09-18",
          "source": "血常规 · 化验单 2025-09-18",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "m4",
          "name": "中性粒细胞绝对值 ANC",
          "value": 1.2,
          "unit": "×10⁹/L",
          "ref": "1.8–6.3",
          "date": "2025-08-29",
          "source": "血常规 · 化验单 2025-08-29",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "m5",
          "name": "中性粒细胞绝对值 ANC",
          "value": 1.9,
          "unit": "×10⁹/L",
          "ref": "1.8–6.3",
          "date": "2025-09-18",
          "source": "血常规 · 化验单 2025-09-18",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "m6",
          "name": "血红蛋白 HGB",
          "value": 108,
          "unit": "g/L",
          "ref": "115–150",
          "date": "2025-08-29",
          "source": "血常规 · 化验单 2025-08-29",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "m7",
          "name": "血红蛋白 HGB",
          "value": 116,
          "unit": "g/L",
          "ref": "115–150",
          "date": "2025-09-18",
          "source": "血常规 · 化验单 2025-09-18",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "m8",
          "name": "丙氨酸氨基转移酶 ALT",
          "value": 32,
          "unit": "U/L",
          "ref": "7–40",
          "date": "2025-08-29",
          "source": "肝功能 · 化验单 2025-08-29",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "m9",
          "name": "丙氨酸氨基转移酶 ALT",
          "value": 78,
          "unit": "U/L",
          "ref": "7–40",
          "date": "2025-09-18",
          "source": "肝功能 · 化验单 2025-09-18",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "m10",
          "name": "左室射血分数 LVEF",
          "value": 62,
          "unit": "%",
          "ref": "≥50",
          "date": "2025-08-04",
          "source": "心脏超声 · 报告 2025-08-04",
          "recorder": "patient",
          "in_use": 1
        }
      ],
      "visits": [
        {
          "visibility": "shared",
          "id": "v1",
          "date": "2025-09-20",
          "purpose": "化疗第 3 周期前评估",
          "questions": [
            "白细胞降到 2.8，下一次化疗还能按时打吗？",
            "ALT 从 32 升到 78，需要停药吗？",
            "右腿越来越肿，和放疗有关吗？"
          ],
          "summaryText": "医生：白细胞可升白后按期；ALT 需复查，暂观察。",
          "recorder": "patient",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "v2",
          "date": "2025-12-18",
          "purpose": "术后半年复查",
          "questions": [
            "下次 MRI 什么时候做？",
            "步行距离下降要不要看康复科？"
          ],
          "summaryText": "",
          "recorder": "patient",
          "planned": 1,
          "in_use": 1
        }
      ],
      "trials": [
        {
          "visibility": "shared",
          "id": "tr1",
          "registryId": "NCT04719156",
          "title": "滑膜肉瘤术后辅助治疗研究（示例）",
          "phase": "II 期",
          "statusText": "招募中",
          "siteText": "北京 / 上海",
          "channel": "clinicaltrials.gov",
          "fetchedAt": "2026-10-25",
          "matchNote": "按亚型「滑膜肉瘤」命中",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "tr2",
          "registryId": "ChiCTR2300000000",
          "title": "晚期软组织肉瘤靶向治疗真实世界研究（示例）",
          "phase": "观察性",
          "statusText": "未查过",
          "siteText": "—",
          "channel": "chictr_online",
          "fetchedAt": "2026-10-25",
          "matchNote": "通道未取回，状态未知",
          "in_use": 1
        }
      ],
      "viewpoint": [
        {
          "visibility": "private",
          "id": "vp1",
          "date": "2025-09-18",
          "mood": "很怕",
          "text": "每次复查前一周都睡不好，总担心片子有问题。",
          "recorder": "patient",
          "domain": "fear",
          "in_use": 1
        },
        {
          "visibility": "private",
          "id": "vp2",
          "date": "2025-07-01",
          "mood": "犹豫",
          "text": "医生提过化疗可能影响生育，我想问清楚但不知道怎么开口。",
          "recorder": "patient",
          "domain": "fertility",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "vp3",
          "date": "2025-08-10",
          "mood": "平稳",
          "text": "放疗结束后皮肤好多了，能自己下楼走走。",
          "recorder": "patient",
          "domain": "daily",
          "in_use": 1
        }
      ],
      "fertility": [
        {
          "visibility": "shared",
          "id": "fe1",
          "date": "2025-04-26",
          "item": "医生是否提过生育力保存",
          "value": "是",
          "note": "化疗前门诊提到，建议咨询生殖中心。",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "fe2",
          "date": "2025-05-20",
          "item": "是否已完成生育力咨询",
          "value": "是",
          "note": "生殖中心咨询 1 次，记录已留存。",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "fe3",
          "date": "2025-08-01",
          "item": "康复评估",
          "value": "不记得",
          "note": "",
          "in_use": 1
        }
      ],
      "documents": [
        {
          "visibility": "shared",
          "id": "d1",
          "name": "术后病理报告.pdf",
          "kind": "病理",
          "date": "2025-05-08",
          "parseStatus": "已解析",
          "source": "本机导入",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "d2",
          "name": "MRI 报告 2025-09-15.pdf",
          "kind": "影像",
          "date": "2025-09-15",
          "parseStatus": "已解析",
          "source": "本机导入",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "d3",
          "name": "化疗知情同意书.jpg",
          "kind": "知情同意",
          "date": "2025-08-05",
          "parseStatus": "未解析",
          "source": "本机导入",
          "in_use": 1
        }
      ],
      "candidates": [
        {
          "visibility": "shared",
          "id": "c1",
          "entityType": "metric",
          "status": "pending",
          "source": "PDF 解析（2025-09-18 血常规）",
          "payload": {
            "name": "白细胞计数 WBC",
            "value": 3.1,
            "unit": "×10⁹/L",
            "ref": "3.5–9.5",
            "date": "2025-09-18"
          },
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "c2",
          "entityType": "imaging",
          "status": "pending",
          "source": "PDF 解析（2025-09-15 MRI）",
          "payload": {
            "date": "2025-09-15",
            "modality": "MRI（右大腿）",
            "comparedTo": "MR2506021"
          },
          "in_use": 1
        }
      ]
    },
    {
      "id": "p2",
      "name": "王先生",
      "short": "王",
      "role": "patient",
      "birthYear": 1957,
      "site": "腹膜后",
      "depthText": "未写明（腹膜后）",
      "recorder": "caregiver",
      "recorderLabel": "女儿代记",
      "in_use": 1,
      "subtype": {
        "name": "去分化脂肪肉瘤",
        "en": "Dedifferentiated liposarcoma",
        "whoPage": "p.39",
        "grade": "FNCLCC G3",
        "gradeSource": "术后病理报告原文（2024-11-28，省肿瘤医院病理科）",
        "stageText": "医生记录：IIIB 期（腹膜后）",
        "stageNote": "同一 TNM 在腹膜后与四肢的分期组不同，本工作台不计算。",
        "ihc": [
          {
            "k": "MDM2",
            "v": "扩增（FISH）",
            "note": "12q15 扩增"
          },
          {
            "k": "CDK4",
            "v": "扩增",
            "note": "与 MDM2 共扩增常见"
          },
          {
            "k": "S100",
            "v": "阴性",
            "note": ""
          },
          {
            "k": "CD34",
            "v": "阴性",
            "note": ""
          },
          {
            "k": "INI1",
            "v": "保留表达",
            "note": ""
          }
        ],
        "molecular": [
          {
            "k": "MDM2 扩增",
            "v": "检出",
            "method": "FISH"
          },
          {
            "k": "SS18::SSX",
            "v": "未检出",
            "method": "FISH"
          }
        ],
        "consult": [
          {
            "date": "2024-11-12",
            "hospital": "省肿瘤医院",
            "text": "腹膜后巨大肿块，建议完整切除，必要时联合脏器切除。",
            "kind": "本院"
          },
          {
            "date": "2026-08-20",
            "hospital": "外院线上会诊",
            "text": "复发后建议系统治疗，可考虑参加研究。",
            "kind": "外院会诊"
          }
        ]
      },
      "pathologies": [
        {
          "visibility": "shared",
          "id": "pb1",
          "date": "2024-11-05",
          "kind": "穿刺活检",
          "subtypeText": "高分化脂肪肉瘤 / 非典型脂肪瘤性肿瘤",
          "gradeText": "未分级（活检）",
          "site": "腹膜后",
          "depthText": "未写明",
          "marginText": "—（活检）",
          "source": "省肿瘤医院病理科 · 病理号 B24-11005",
          "recorder": "caregiver",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "pb2",
          "date": "2024-11-28",
          "kind": "术后病理（腹膜后肿瘤切除）",
          "subtypeText": "去分化脂肪肉瘤（去分化成分占约 60%）",
          "gradeText": "FNCLCC G3",
          "site": "腹膜后",
          "depthText": "未写明",
          "marginText": "R1（镜下切缘阳性，见报告原文）",
          "source": "省肿瘤医院病理科 · 病理号 B24-11089",
          "recorder": "caregiver",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "pb3",
          "date": "2026-09-02",
          "kind": "复发灶穿刺",
          "subtypeText": "去分化脂肪肉瘤",
          "gradeText": "FNCLCC G3",
          "site": "腹膜后",
          "depthText": "未写明",
          "marginText": "—（活检）",
          "source": "省肿瘤医院病理科 · 病理号 B26-09011",
          "recorder": "caregiver",
          "in_use": 1
        }
      ],
      "imaging": [
        {
          "visibility": "shared",
          "id": "in1",
          "date": "2024-12-15",
          "site": "腹膜后",
          "modality": "腹盆腔 CT",
          "baseline": 1,
          "comparedTo": "",
          "wording": "腹膜后术区，左肾缺如（术后）；未见明确残留肿块。",
          "source": "省肿瘤医院影像科 · CT2412150",
          "recorder": "caregiver",
          "baselineNote": "术后基线",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "in2",
          "date": "2024-12-15",
          "site": "内脏",
          "modality": "胸部 CT",
          "baseline": 1,
          "comparedTo": "",
          "wording": "双肺未见明确结节。",
          "source": "省肿瘤医院影像科 · CT2412151",
          "recorder": "caregiver",
          "baselineNote": "肺基线",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "in3",
          "date": "2025-03-20",
          "site": "腹膜后",
          "modality": "腹盆腔 CT",
          "baseline": 0,
          "comparedTo": "CT2412150（2024-12-15，基线）",
          "wording": "与 2024-12-15 片比较：术区未见明确新发肿块。",
          "source": "省肿瘤医院影像科 · CT2503204",
          "recorder": "caregiver",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "in4",
          "date": "2025-07-10",
          "site": "腹膜后",
          "modality": "腹盆腔 CT",
          "baseline": 0,
          "comparedTo": "CT2503204（2025-03-20）",
          "wording": "与 2025-03-20 片比较：左侧腰大肌前方见 22×18 mm 软组织结节，较前为新发。",
          "source": "省肿瘤医院影像科 · CT2507102",
          "recorder": "caregiver",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "in5",
          "date": "2025-10-08",
          "site": "腹膜后",
          "modality": "腹盆腔 CT",
          "baseline": 0,
          "comparedTo": "CT2507102（2025-07-10）",
          "wording": "与 2025-07-10 片比较：上述结节增至 31×24 mm，边缘强化。",
          "source": "省肿瘤医院影像科 · CT2510083",
          "recorder": "caregiver",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "in6",
          "date": "2026-09-10",
          "site": "腹膜后",
          "modality": "腹盆腔 MRI",
          "baseline": 0,
          "comparedTo": "CT2510083（2025-10-08）",
          "wording": "与 2025-10-08 片比较：腹膜后多发结节，最大 46×33 mm。",
          "source": "省肿瘤医院影像科 · MR2609101",
          "recorder": "caregiver",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "in7",
          "date": "2026-09-10",
          "site": "内脏",
          "modality": "胸部 CT",
          "baseline": 0,
          "comparedTo": "CT2412151（2024-12-15，基线）",
          "wording": "与 2024-12-15 片比较：右肺下叶见 5 mm 微小结节，建议随访。",
          "source": "省肿瘤医院影像科 · CT2609102",
          "recorder": "caregiver",
          "in_use": 1
        }
      ],
      "local": [
        {
          "visibility": "shared",
          "id": "lp1",
          "kind": "surgery",
          "title": "腹膜后肿瘤切除 + 左肾切除",
          "dateStart": "2024-11-20",
          "dateEnd": "2024-11-20",
          "detail": "腹膜后肿瘤（约 18 cm）完整切除，联合左肾切除；术中见与腰大肌粘连。",
          "margin": "R1（镜下）",
          "status": "已完成",
          "recorder": "caregiver",
          "complications": [
            {
              "date": "2024-12-02",
              "text": "伤口愈合良好，术后第 12 天出院。"
            },
            {
              "date": "2025-01-08",
              "text": "左下腹偶有牵拉痛，自述可忍。"
            }
          ],
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "lp2",
          "kind": "surgery",
          "title": "复发灶探查（未切除）",
          "dateStart": "2026-09-18",
          "dateEnd": "2026-09-18",
          "detail": "腹腔镜探查，见腹膜后多发结节包绕血管，未行切除。",
          "margin": "",
          "status": "已完成",
          "recorder": "caregiver",
          "complications": [
            {
              "date": "2026-09-21",
              "text": "术后腹胀，第 3 天缓解。"
            }
          ],
          "in_use": 1
        }
      ],
      "systemic": [
        {
          "visibility": "shared",
          "id": "sp1",
          "lineNo": 1,
          "regimen": "多柔比星 + 异环磷酰胺（+ 美司钠）",
          "dateStart": "2025-01-06",
          "dateEnd": "2025-06-20",
          "cycleNo": 6,
          "cyclePlan": "计划 6 周期",
          "status": "已结束",
          "recorder": "caregiver",
          "reasonText": "术后辅助，医生记录为「R1 切除，建议辅助化疗」。",
          "cycles": [
            {
              "d": "2025-01-06",
              "n": 1,
              "note": "第 1 周期"
            },
            {
              "d": "2025-02-03",
              "n": 2,
              "note": "第 2 周期"
            },
            {
              "d": "2025-03-03",
              "n": 3,
              "note": "第 3 周期"
            },
            {
              "d": "2025-04-01",
              "n": 4,
              "note": "第 4 周期"
            },
            {
              "d": "2025-05-06",
              "n": 5,
              "note": "第 5 周期"
            },
            {
              "d": "2025-06-03",
              "n": 6,
              "note": "第 6 周期"
            }
          ],
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "sp2",
          "lineNo": 2,
          "regimen": "帕唑帕尼 800 mg qd",
          "dateStart": "2025-11-02",
          "dateEnd": "",
          "cycleNo": 0,
          "cyclePlan": "连续口服",
          "status": "已换线",
          "recorder": "caregiver",
          "reasonText": "医生原话：「影像上结节在长，先换口服靶向，化疗先停。」",
          "cycles": [
            {
              "d": "2025-11-02",
              "n": 1,
              "note": "开始口服"
            }
          ],
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "sp3",
          "lineNo": 3,
          "regimen": "临床试验（登记号见试验页）",
          "dateStart": "2026-07-15",
          "dateEnd": "",
          "cycleNo": 2,
          "cyclePlan": "按方案",
          "status": "进行中",
          "recorder": "caregiver",
          "reasonText": "医生原话：「可以试试这个研究，符合条件的话入组。」",
          "cycles": [
            {
              "d": "2026-07-15",
              "n": 1,
              "note": "首次给药"
            },
            {
              "d": "2026-08-12",
              "n": 2,
              "note": "第 2 周期"
            }
          ],
          "in_use": 1
        }
      ],
      "functionLog": [
        {
          "visibility": "shared",
          "id": "fp1",
          "domain": "wound",
          "date": "2025-01-08",
          "measure": "",
          "value": null,
          "unit": "",
          "side": "",
          "text": "腹部切口愈合，偶有牵拉痛。",
          "recorder": "caregiver",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "fp2",
          "domain": "lymphedema",
          "date": "2026-09-20",
          "measure": "双下肢踝上 10 cm 周径",
          "value": 24.5,
          "unit": "cm",
          "side": "左",
          "text": "左下肢轻度水肿",
          "recorder": "caregiver",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "fp3",
          "domain": "function",
          "date": "2026-09-20",
          "measure": "连续步行距离（自述）",
          "value": 300,
          "unit": "m",
          "side": "",
          "text": "饭后散步，走到 300 m 需坐一会",
          "recorder": "caregiver",
          "in_use": 1
        }
      ],
      "metrics": [
        {
          "visibility": "shared",
          "id": "mp1",
          "name": "肌酐 CREA",
          "value": 96,
          "unit": "µmol/L",
          "ref": "57–97",
          "date": "2024-11-18",
          "source": "肾功能 · 化验单 2024-11-18",
          "recorder": "caregiver",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "mp2",
          "name": "肌酐 CREA",
          "value": 118,
          "unit": "µmol/L",
          "ref": "57–97",
          "date": "2025-03-20",
          "source": "肾功能 · 化验单 2025-03-20",
          "recorder": "caregiver",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "mp3",
          "name": "肌酐 CREA",
          "value": 132,
          "unit": "µmol/L",
          "ref": "57–97",
          "date": "2025-10-08",
          "source": "肾功能 · 化验单 2025-10-08",
          "recorder": "caregiver",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "mp4",
          "name": "肌酐 CREA",
          "value": 141,
          "unit": "µmol/L",
          "ref": "57–97",
          "date": "2026-09-10",
          "source": "肾功能 · 化验单 2026-09-10",
          "recorder": "caregiver",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "mp5",
          "name": "丙氨酸氨基转移酶 ALT",
          "value": 24,
          "unit": "U/L",
          "ref": "7–40",
          "date": "2025-10-08",
          "source": "肝功能 · 化验单 2025-10-08",
          "recorder": "caregiver",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "mp6",
          "name": "丙氨酸氨基转移酶 ALT",
          "value": 58,
          "unit": "U/L",
          "ref": "7–40",
          "date": "2026-09-10",
          "source": "肝功能 · 化验单 2026-09-10",
          "recorder": "caregiver",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "mp7",
          "name": "甲状腺促激素 TSH",
          "value": 2.1,
          "unit": "mIU/L",
          "ref": "0.27–4.2",
          "date": "2026-09-10",
          "source": "甲功 · 化验单 2026-09-10",
          "recorder": "caregiver",
          "in_use": 1
        }
      ],
      "visits": [
        {
          "visibility": "shared",
          "id": "vp2_1",
          "date": "2026-09-25",
          "purpose": "复发后方案讨论",
          "questions": [
            "口服靶向效果不好，还有什么选择？",
            "肾功能在下降，和单肾有关吗？",
            "临床试验入组需要什么条件？"
          ],
          "summaryText": "医生：可考虑研究入组，肾功能需每月复查。",
          "recorder": "caregiver",
          "in_use": 1
        }
      ],
      "trials": [
        {
          "visibility": "shared",
          "id": "trp1",
          "registryId": "NCT05555555",
          "title": "去分化脂肪肉瘤 MDM2 靶向研究（示例）",
          "phase": "I/II 期",
          "statusText": "招募中",
          "siteText": "上海 / 广州",
          "channel": "clinicaltrials.gov",
          "fetchedAt": "2026-10-25",
          "matchNote": "按亚型 + 分子「MDM2 扩增」命中",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "trp2",
          "registryId": "ChiCTR2400000000",
          "title": "腹膜后肉瘤多学科随访研究（示例）",
          "phase": "观察性",
          "statusText": "未取回",
          "siteText": "—",
          "channel": "chictr_online",
          "fetchedAt": "2026-10-25",
          "matchNote": "通道超时，未取回",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "trp3",
          "registryId": "—",
          "title": "（药物临床试验登记平台）",
          "phase": "—",
          "statusText": "未查过",
          "siteText": "—",
          "channel": "chinadrugtrials",
          "fetchedAt": "2026-10-25",
          "matchNote": "通道未配置，未查过",
          "in_use": 1
        }
      ],
      "viewpoint": [
        {
          "visibility": "private",
          "id": "vpp1",
          "date": "2026-09-12",
          "mood": "累",
          "text": "第三次住院了，不知道还能撑几轮，家里人都瞒着他说。",
          "recorder": "caregiver",
          "domain": "fear",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "vpp2",
          "date": "2026-09-12",
          "mood": "平稳",
          "text": "他今天能自己下床走几步，比上周好。",
          "recorder": "caregiver",
          "domain": "daily",
          "in_use": 1
        }
      ],
      "fertility": [
        {
          "visibility": "shared",
          "id": "fep1",
          "date": "2026-09-25",
          "item": "康复评估",
          "value": "是",
          "note": "营养科 + 康复科会诊各 1 次。",
          "in_use": 1
        }
      ],
      "documents": [
        {
          "visibility": "shared",
          "id": "dp1",
          "name": "术后病理报告 2024-11-28.pdf",
          "kind": "病理",
          "date": "2024-11-28",
          "parseStatus": "已解析",
          "source": "本机导入",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "dp2",
          "name": "腹盆腔 CT 2026-09-10.pdf",
          "kind": "影像",
          "date": "2026-09-10",
          "parseStatus": "已解析",
          "source": "本机导入",
          "in_use": 1
        },
        {
          "visibility": "shared",
          "id": "dp3",
          "name": "出院记录 2026-09-21.pdf",
          "kind": "出院记录",
          "date": "2026-09-21",
          "parseStatus": "待解析",
          "source": "本机导入",
          "in_use": 1
        }
      ],
      "candidates": [
        {
          "visibility": "shared",
          "id": "cp1",
          "entityType": "metric",
          "status": "pending",
          "source": "PDF 解析（2026-09-10 肾功能）",
          "payload": {
            "name": "肌酐 CREA",
            "value": 141,
            "unit": "µmol/L",
            "ref": "57–97",
            "date": "2026-09-10"
          },
          "in_use": 1
        }
      ]
    }
  ],
  "followupRef": {
    "肢体": {
      "months": [
        3,
        6
      ],
      "years": "前 3 年，之后每年",
      "source": "NCCN 患者版 2025 p.27（患者版转述）"
    },
    "腹膜后": {
      "months": [
        3,
        6
      ],
      "years": "3–6 个月×3 年 → 6 个月×2 年 → 每年",
      "source": "NCCN 患者版 2025 p.38（患者版转述）"
    },
    "头颈": {
      "months": [
        3,
        6
      ],
      "years": "前 3 年，之后每年",
      "source": "NCCN 患者版 2025 p.27（患者版转述）"
    },
    "躯干": {
      "months": [
        3,
        6
      ],
      "years": "前 3 年，之后每年",
      "source": "NCCN 患者版 2025 p.27（患者版转述）"
    },
    "内脏": {
      "months": [
        3,
        6
      ],
      "years": "按原发部位路径",
      "source": "NCCN 患者版 2025（患者版转述）"
    }
  },
  "imagingTerms": [
    {
      "word": "较前增大 / 较前缩小 / 较前相仿",
      "layer": "与既往检查的对比",
      "explain": "这次测得的尺寸与前一次检查相比变大/变小/差不多；\"前\"指哪一次，报告里通常会写日期。"
    },
    {
      "word": "新发结节 / 新出现",
      "layer": "新增病灶",
      "explain": "这次检查看到了上次没有描述的结节。"
    },
    {
      "word": "边缘强化 / 环形强化",
      "layer": "增强扫描后的表现",
      "explain": "打造影剂后病灶某一部分更亮；描述的是对比剂分布，不是良恶性结论。"
    },
    {
      "word": "边界清 / 边界不清",
      "layer": "形态描述",
      "explain": "病灶与周围组织的分界是否容易分辨。"
    },
    {
      "word": "信号不均 / 混杂信号",
      "layer": "MRI 信号描述",
      "explain": "MRI 上病灶内部亮度不一致。"
    },
    {
      "word": "靶病灶 / 非靶病灶",
      "layer": "RECIST 研究口径",
      "explain": "研究里被选中用于测量的一组病灶 vs 其余病灶。"
    },
    {
      "word": "CR / PR / SD / PD",
      "layer": "RECIST 研究口径",
      "explain": "完全缓解/部分缓解/疾病稳定/疾病进展，按统一规则算出的分类，见于研究场景。"
    },
    {
      "word": "基线",
      "layer": "对比参照",
      "explain": "治疗前或随访开始时那次检查，后续都拿它作参照。"
    },
    {
      "word": "未见明确 / 不除外",
      "layer": "报告的确定性措辞",
      "explain": "\"没看清\"与\"不能排除\"是两种不同的不确定，需医生结合其他资料。"
    }
  ],
  "glossary": [
    {
      "k": "肉瘤 vs 癌",
      "v": "癌来自上皮（皮肤、器官内壁/腺体），肉瘤来自间叶组织（肌肉、脂肪、血管、神经、纤维、骨）。所以肉瘤不叫\"某某癌\"。"
    },
    {
      "k": "分级 vs 分期",
      "v": "分级看显微镜下细胞有多恶性（FNCLCC G1–G3）；分期看肿瘤多大、到没到淋巴结、有没有远处转移（TNM+G）。两者不能互相换算。"
    },
    {
      "k": "亚型 vs 部位",
      "v": "亚型回答\"是哪一种肿瘤\"（组织学类型）；部位回答\"长在哪里\"（四肢/腹膜后/头颈）。同一个亚型可以长在不同部位。"
    },
    {
      "k": "R0 / R1 / R2",
      "v": "切缘的写法：R0 切缘未见肿瘤；R1 肿瘤达切缘（镜下）；R2 肉眼残留。以病理报告原文为准。"
    },
    {
      "k": "FNCLCC",
      "v": "病理科的分级体系，按分化、核分裂数、坏死三项打分：2–3 分 G1，4–5 分 G2，6–8 分 G3。"
    },
    {
      "k": "INI1 / SMARCB1",
      "v": "一个抑癌基因/蛋白。报告写\"保留表达\"或\"缺失\"，是病理科用于分类的检测结果。"
    }
  ]
};
