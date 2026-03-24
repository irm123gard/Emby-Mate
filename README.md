# Emby Mate

![Version](https://img.shields.io/badge/version-v2.4.10-blue)
![Cloudflare Workers](https://img.shields.io/badge/platform-Cloudflare%20Workers-F38020)
![Single File](https://img.shields.io/badge/architecture-single--file-0ea5e9)

一个面向 Emby 使用场景的 Cloudflare Workers 反代管理面板。

- 当前稳定版本：`v2.4.10`
- 正式构建入口：`dist/worker.js`
- 默认 KV 绑定名：`ENI_KV`
- 部署配置：`wrangler.jsonc`
- GitHub 版本对比固定以仓库内 `dist/worker.js` 为准

## 快速入口

- 更新日志：[`CHANGELOG.md`](./CHANGELOG.md)
- 构建产物：[`dist/worker.js`](./dist/worker.js)
- 部署配置：[`wrangler.jsonc`](./wrangler.jsonc)

## v2.4.10 发布重点

- 右上角菜单新增版本入口：默认显示当前版本，点击直接跳转 GitHub 仓库主页。
- Worker 新增版本常量与定时版本比对，固定按仓库内 `dist/worker.js` 做每日版本检查。
- 站点高级设置新增“真实客户端 IP 透传”三态模式：`默认透传 / 仅X-Real-IP / 关闭透传`。
- GitHub 仓库发布口径统一到 `dist/worker.js`，根目录 `worker-vx.x.x.js` 不再提交。

## 目录

- [3分钟上手](#3分钟上手)
- [v2410-发布重点](#v2410-发布重点)
- [部署入口说明](#部署入口说明)
- [项目来源](#项目来源)
- [为什么选择-emby-mate](#为什么选择-emby-mate)
- [功能亮点展开版](#功能亮点展开版)
- [快速部署新手](#快速部署新手)
- [新手上手最短闭环](#新手上手最短闭环)
- [进阶使用](#进阶使用)
- [当前仓库内容仅-5-个文件](#当前仓库内容仅-5-个文件)
- [一键部署仓库建议](#一键部署仓库建议)
- [常见问题](#常见问题)
- [安全建议](#安全建议)

---

## 3分钟上手

如果你希望最快看到可用结果，按这 5 步执行：

1. 在 Cloudflare 创建 Worker，直接粘贴 `dist/worker.js` 内容走 Dashboard 部署，或用 `dist/worker.js` 走 Wrangler 工程化部署。
2. 绑定 KV，名称必须是 `ENI_KV`。
3. 添加环境变量：`ADMIN_PASS`（必填），`JWT_SECRET`（建议）。
4. 部署后访问 `https://你的域名/admin` 登录。
5. 新建一个站点（名称 + 目标地址），保存后直接复制代理地址测试播放。

完成以上步骤后，再看本文“进阶使用”部分做指标和 DNS 联动配置。  

---

## 部署入口说明

- `dist/worker.js`
  - 正式构建产物
  - `wrangler.jsonc` 默认入口
  - 适合 Cloudflare Dashboard 粘贴部署、工程化构建、测试和 CLI 部署

GitHub 仓库版本对比、发布目录和后续 CI/CD 都固定以 `dist/worker.js` 为准。根目录 `worker-vx.x.x.js` 仅保留本地可选快照用途，不再提交到 GitHub。

---

## 项目来源

Emby Mate fork 自 [axuitomo/CF-EMBY-PROXY-UI](https://github.com/axuitomo/CF-EMBY-PROXY-UI)，并在此基础上持续迭代。

当前 GitHub 仓库的版本比较与发布口径统一以 `dist/worker.js` 为准。

---

## 为什么选择 Emby Mate

### 1) 单文件部署，维护成本低
- 当前仓库直接提供可部署 Worker 文件。
- 对个人用户和小团队友好，不需要复杂后端体系。

### 2) 管理后台开箱即用，降低运维门槛
- 内置 `/admin` 可视化管理页，不需要单独再搭前端项目。
- 新手可以先跑通，再逐步做进阶配置。

### 3) 播放稳定优先的链路策略
- 核心设计目标不是“参数堆叠”，而是“尽量避免播放失败和卡住”。
- 在多目标回切、重定向缓存、URL 重写、响应处理上做了兼容与降级。

### 4) 可观测能力内建
- 延迟测试、客户端 RTT、Cloudflare 指标、最近使用提示都在同一界面可看。
- 方便你快速判断是“源站慢、链路慢、还是配置问题”。

---

## 功能亮点（展开版）

### 1) 多站点可视化管理
支持新建、编辑、克隆、删除、导入、导出站点。

优势：
- 多个源站统一入口管理，减少手工配置出错。
- 克隆站点可快速复制参数模板，开新站更快。
- 导入导出便于备份、迁移和多人协作。

### 2) 站点信息结构清晰
每个站点支持：名称、目标地址列表、密钥、标签、备注。

优势：
- 名称和标签便于筛选与分组。
- 可维护主源和备用源顺序，切换策略更可控。
- 密钥路径可降低未授权探测风险。
- 备注可记录线路用途、节点来源、故障历史。

### 3) 站点级“重定向白名单”开关
每个站点独立控制是否启用白名单直连策略，白名单记录在“设置”弹窗统一维护。

优势：
- 默认关闭更稳妥，行为可预期。
- 按站点启用，避免“一刀切”影响全部节点。
- 更适合混合场景：部分站点追求直连速度，部分站点追求统一代理链路。

说明：
- 出于安全与滥用风险考虑，README 不公开内置白名单明细。

### 4) 延迟测试与客户端 RTT
首页卡片展示：`IP位置`、`边缘TCP`、`边缘HEAD`；右上角展示：`客户端RTT`。

优势：
- 相比单一指标，双指标更容易判断问题层级。
- `边缘TCP` 更侧重连通性与握手速度。
- `边缘HEAD` 更接近真实请求链路（TCP+TLS+HTTP）。
- `客户端RTT` 更接近当前管理端设备的真实体感延迟。

适用场景：
- 判断源站是否异常抖动。
- 对比多个站点目标地址的整体可达性与响应变化。
- 区分“客户端到边缘慢”还是“边缘到源站慢”。

### 5) Cloudflare 指标卡（近24小时站点流量 / 请求数 / Top10）
当前主线固定为近 24 小时口径，只统计“当前访问域名下、已配置站点路径”的访问数据。

优势：
- 同页查看当前域名的近24小时站点流量、请求数与 Top10 路径，不必频繁切回 Cloudflare 控制台。
- 指标只聚焦已配置站点路径，更适合排查实际业务入口，而不是整个 Worker 的杂项流量。
- 便于快速观察异常流量、热点路径和访问活跃度。

### 6) 站点卡片“最近使用”提示
卡片右上角可展示“最近使用 x 分钟/小时前”。

优势：
- 一眼识别近期活跃节点。
- 帮助定位“当前在用站点”和“长期闲置站点”。

刷新机制：
- 独立定时器自动刷新（默认 5 分钟）。
- 与 CF 指标卡自动刷新参数分离，互不干扰。

### 7) 播放器兼容与起播链路优化
当前主线已针对常见播放器差异做专门处理。

优势：
- 对 `Forward`、`EplayerX`、`Lenna` 等播放器返回更适合的 `DirectStreamUrl` 形式，减少重复拼接路径和无效 404。
- 外部重定向支持缓存、并发去重、等价 URL 复用和 `PlaybackInfo` 阶段保守预热，提升首播前几条媒体请求命中率。
- 播放响应对已知长度内容保留固定长度语义，降低部分播放器对 `206` 的兼容问题。

### 8) Cloudflare DNS CNAME 读取与同步
CF 设置弹窗支持：读取当前访问域名同名 CNAME，并一键应用修改。

优势：
- 不用再手动来回切控制台，提高改动效率。
- 对小规模域名运维非常实用。
- 冲突会直接提示（例如同名 A/AAAA），避免误覆盖。

### 9) 安全基础能力
- 后台登录基于 Cookie + JWT（支持 `JWT_SECRET`）
- Admin POST 请求来源校验（Origin/Referer/Sec-Fetch-Site）
- 代理请求敏感头清理，减少凭据泄露风险

优势：
- 在“可用性优先”前提下，提供了必要的安全底线。

### 10) 体验与可用性
- 深色模式
- 移动端适配
- 搜索与卡片操作优化
- 复制代理地址支持整行点击
- 设置弹窗与 `CF设置` 分离，管理入口更清晰

优势：
- 日常高频操作更顺手，手机端应急也可用。

---

## 快速部署（新手）

这部分只讲最短路径，目标是尽快跑通。

### 方式 A：Cloudflare Dashboard（推荐）

1. 创建 KV Namespace（名称任意）。
2. 创建 Worker，并粘贴 `dist/worker.js` 全部内容。
3. 在 `Settings -> Variables` 绑定 KV：
   - Variable name：`ENI_KV`
   - Namespace：你创建的 KV
4. 添加环境变量：
   - `ADMIN_PASS`（必填，后台登录密码）
   - `JWT_SECRET`（建议，增强登录安全）
5. 保存并部署。
6. 打开：`https://你的域名/admin` 登录。

### 方式 B：Wrangler CLI

```bash
npx wrangler login
npx wrangler deploy
```

部署前请确认：
- `wrangler.jsonc` 的 `main` 指向 `dist/worker.js`
- KV 绑定名是 `ENI_KV`
- 当前仓库已包含 `dist/worker.js`，不需要额外构建源码

### GitHub 发布基准（4 个关键文件）

GitHub 对外发布与一键部署，至少需要保留下列 4 个关键文件：

- `README.md`
- `CHANGELOG.md`
- `wrangler.jsonc`
- `dist/worker.js`

### 一键部署仓库建议

如果你希望别人通过 Cloudflare 的 **Deploy to Cloudflare** 按钮一键部署：

1. 直接使用当前这个发布仓库，或 fork 一份同样结构的仓库。
2. 确保仓库根目录保留这 4 个关键文件，并让 `wrangler.jsonc` 的 `main` 指向 `dist/worker.js`。
3. 使用下面这个 Cloudflare 官方一键部署链接：

```text
https://deploy.workers.cloudflare.com/?url=https://github.com/<你的GitHub用户名>/<你的仓库名>
```

例如：

```text
https://deploy.workers.cloudflare.com/?url=https://github.com/example/emby-mate-worker
```

说明：
- Cloudflare 的一键部署按钮支持的是 **Public GitHub / GitLab 仓库**。
- **不支持** 直接用单个文件 URL，例如 `raw.githubusercontent.com/.../worker.js`、网盘直链、普通网页地址。
- 如果只是你自己部署，不需要一键分享，继续用 Cloudflare Dashboard 直接粘贴 `dist/worker.js` 会更省事。

---

## 新手上手（最短闭环）

1. 登录 `/admin`
2. 新建站点（至少填写名称 + 目标地址）
3. 保存后在首页复制代理地址
4. 客户端使用代理地址测试播放
5. 回到首页观察延迟与指标变化

---

## 进阶使用

### 1) Cloudflare API 令牌权限（中文解释）

建议直接按下面模板创建 Token：

**[CF 指标]**
A. **账户 - 账户分析 - 读取（Account - Account Analytics:Read）**
B. **区域 - 分析 - 读取（Zone - Analytics:Read）**
C. **区域 - 区域 - 读取（Zone - Zone:Read）**

**[优选域名/IP]**
D. **区域 - DNS - 编辑（Zone - DNS:Edit）**

**[账户资源]**
建议选择：**包括 - 当前账户（或所有账户）**。

**[区域资源]**
建议选择：**包括 - 特定区域（Specific zone） - Emby Mate 使用的站点**。

补充说明：
- A 权限用于 Cloudflare GraphQL 分析查询入口。
- B 权限用于当前 host 的请求数、总流量、Top10 路径等 Zone 级指标。
- C 权限用于识别当前域名归属的 Zone，否则无法正确定位可查询区域。
- D 权限用于“优选域名/IP”读取当前同名记录并执行同步。
- 如果只看 CF 指标，不改 DNS，可不授予 D。
- 如果只改 DNS，不看 CF 指标，可不授予 A / B。
- 不建议使用“全部区域（All zones）”，容易造成误授权，推荐始终用 `Specific zone`。

术语对照：
- `Zone` = 区域（一个域名所在管理单元）
- `Specific zone` = 特定区域（只授权某个或某些域名）
- `Account` = 账户
- `Account Analytics` = 账户分析
- `Analytics / Zone Analytics` = 区域分析

### 2) 设置项建议

- `Cloudflare账户ID`：填你的账户 ID
- `Cloudflare API 令牌`：填具备上述权限的 Token
- `Worker管理页`：Cloudflare 控制台中的 Worker 管理 URL
- `CF指标自动刷新(s)`：仅影响“近24小时 CF 指标卡”的刷新频率

说明：
- “最近使用”刷新频率由独立预设参数控制，不与 CF 指标自动刷新混用。

### 3) 延迟阈值怎么调

建议先使用默认值，观察一天后再调整：
- 源站质量稳定：可适当收紧阈值
- 跨区链路波动大：可适当放宽阈值

---

## 常见问题

### 1) 提示 KV 未绑定
检查 Worker 变量中是否存在名为 `ENI_KV` 的 KV Binding。

### 2) CF 指标不显示 / 近24小时站点流量为空
优先检查：
- `Cloudflare账户ID` 是否正确
- Token 是否有 `Account Analytics:Read`、`Analytics:Read / Zone Analytics Read`、`Zone:Read`
- Token 的 `Account Resources` 是否包含当前账户
- Token 的 `Zone Resources` 是否包含当前站点所在主域
- `Worker管理页` URL 是否可解析脚本

### 3) DNS 同步失败
常见原因：
- Token 缺少 `Zone:Read` / `DNS:Edit`
- 当前域名不在 Token 管理范围
- 同名 A/AAAA 冲突（系统会提示并停止）

### 4) 播放出现 404 / 5xx
建议依次排查：
- 目标地址和端口是否正确
- 密钥路径是否一致
- 源站是否可直接访问
- 是否需要调整重定向白名单开关

---

## 安全建议

- 必填强密码：`ADMIN_PASS`
- 强烈建议设置：`JWT_SECRET`
- Cloudflare Token 遵循最小权限原则
- Token 资源范围优先使用 `Specific zone`

---

## 致谢

- 原项目作者与社区：`axuitomo/CF-EMBY-PROXY-UI`
- UI/交互设计协作：Figma + Figma MCP
- 工程实现协作：Codex
