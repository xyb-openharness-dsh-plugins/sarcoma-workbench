# 变更记录

只增不删；每条写清"改了什么 + 为什么 + 用户可见结果"。版本号与 VERSION、package.json 三处必须一致。

## 0.1.1 — 2026-11-11

从「只有注册骨架 + /health」补到可装机运行的工作台外壳。此前装进 Desktop 看到的是骨架卡片：没有业务界面，也没有任何 AI 对话入口。

- 新：`scripts/build-public.mjs` 把 `prototypes/v0.2/`（7 件）生成到 `public/`，只替换 title 里的版本字面量；业务前端仍是原型那一份代码。
- 新：`dsh/static.js`（`createStaticHandler` / `resolveStatic`）+ `dsh/index.js` 注册 `/api/sarcoma-workbench/ui` 前缀路由：只从 `public/` 出文件，`..`、绝对路径、符号链接逃逸一律 404。
- 新：`lib/client.js` 换成家族 A 形态外壳——自建顶栏（品牌 + 版本 chip + 状态 + 「AI 对话」+ 重新加载）、业务区 iframe、1px 可拖分隔线（25%–45%，键盘 ←/→ 步进）、右侧原生会话常挂载（隐藏走 display，不卸载输入树）、窄于 760px 改覆盖式抽屉、宽度写 localStorage。
- 新：`lib/layout.js` 为面板参数唯一来源，`scripts/build-version.mjs` 注入客户端布局块并生成 `lib/version.js`。
- 新：会话契约按 9 条落地——`ownsSession(currentSession())` 判会话、无会话点按钮走 `newSession(workspaceId)`（workspaceId 取 `defaultWorkspace()`）、取消目录不留空会话、创建失败在工作台内报原因、订阅 `subscribe` 重渲染、草稿只填入不发送。
- 校验：`npm run check` 纳入 `build-version --check`、`build-public --check`、`check-agent-pane-contract`、`node --test`；`files` 白名单补 `public`。
- 实测证据（本机 stub 宿主起服务，非 Desktop）：`/ui/` 200 text/html、`/ui/app.js` 200 text/javascript、`/ui/style.css` 200 text/css、`/ui/../../package.json` 404、health version=0.1.1、storage.ready=true。
- 已知缺口（如实）：①疾病概要 primer（顶栏「?」整页四段）未实现——原型 v0.2 里也没有 primer 文件，需先补内容再做；②本仓没有文案红线检查器，`dsh-wb-cli audit` 的 `check/文案红线` 仍为 fail；③实机点击（面板是否出现、取消目录是否留空会话）未验证，需装机后人工走查。

## 0.1.0 — 2026-10-25

- 由社区脚手架 dsh-wb-cli@1.5.4 (1541b8a) 初始化，仅有注册骨架与健康接口，无业务功能。
