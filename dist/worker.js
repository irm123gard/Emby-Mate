var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/config/default-redirect-rule-terms.js
var DEFAULT_REDIRECT_RULE_TERMS;
var init_default_redirect_rule_terms = __esm({
  "src/config/default-redirect-rule-terms.js"() {
    DEFAULT_REDIRECT_RULE_TERMS = Object.freeze([
      "ap-cn01.emby.bangumi.ca",
      "ap-cn02.emby.bangumi.ca",
      "ap-cn03.emby.bangumi.ca",
      "quark.cn",
      "mini189.cn",
      "189.cn",
      "ctyunxs.cn",
      "ctyun.cn",
      "telecomjs.com",
      "xunlei.com",
      "115.com",
      "115cdn.com",
      "115cdn.net",
      "116cdn.cn",
      "116cdn.com",
      "116cdn.net",
      "anxia.com",
      "sq.cc",
      "uc.cn",
      "aliyundrive.com",
      "aliyundrive.net",
      "voicehub.top",
      "xiaoya.pro",
      "jianguoyun",
      "aliyundrive",
      "alipan",
      "alicloudccp",
      "aliyuncs",
      "myqcloud",
      "baidu",
      "baidupcs",
      "123pan",
      "qiniudn",
      "qbox.me",
      "myhuaweicloud",
      "139.com",
      "quark",
      "yun.uc.cn",
      "r2.cloudflarestorage",
      "volces.com",
      "tos-s3",
      "sharepoint.cn",
      "sharepoint.com"
    ]);
  }
});

// src/config/defaults.js
function normalizeRedirectWhitelistDomain(value) {
  let raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  raw = raw.replace(/^(?:https?|wss?):\/\//i, "");
  raw = raw.split("/")[0].split("?")[0].split("#")[0].trim();
  raw = raw.replace(/^\*\./, "").replace(/\.+$/, "");
  return raw;
}
function normalizeRedirectWhitelistDomains(list) {
  const deduped = [];
  for (const item of Array.isArray(list) ? list : []) {
    const candidate = item && typeof item === "object" && !Array.isArray(item) ? item.domain ?? item.host ?? item.value : item;
    const normalized = normalizeRedirectWhitelistDomain(candidate);
    if (!normalized || deduped.includes(normalized)) continue;
    deduped.push(normalized);
  }
  return deduped;
}
function isHostLikeRedirectRule(value) {
  return /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(String(value || "").trim());
}
function normalizeRedirectRuleValue(value) {
  const trimmed = String(value || "").trim().toLowerCase();
  if (!trimmed) return "";
  const host = normalizeRedirectWhitelistDomain(trimmed);
  if (isHostLikeRedirectRule(host)) return host;
  return trimmed;
}
function dedupeRedirectRuleValues(list) {
  const next = [];
  const seen = /* @__PURE__ */ new Set();
  for (const item of Array.isArray(list) ? list : []) {
    const normalized = normalizeRedirectRuleValue(item);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    next.push(normalized);
  }
  return next;
}
function normalizeRedirectWhitelistEntries(list) {
  const entries = [];
  for (const item of Array.isArray(list) ? list : []) {
    const raw = item && typeof item === "object" && !Array.isArray(item) ? item : { name: "", domain: item };
    const domain = normalizeRedirectWhitelistDomain(raw.domain ?? raw.host ?? raw.value);
    if (!domain || entries.some((entry) => entry.domain === domain)) continue;
    const fallbackName = String(raw.name ?? raw.label ?? "").trim();
    entries.push({
      id: String(raw.id || `redirect-${entries.length + 1}`),
      name: fallbackName,
      domain
    });
    if (entries.length >= MAX_REDIRECT_WHITELIST_RULES) break;
  }
  return entries;
}
var Config, DEFAULT_TCPING_CONFIG, DEFAULT_CF_METRICS_CONFIG, MAX_REDIRECT_WHITELIST_RULES, DEFAULT_REDIRECT_RULE_TERMS2, MANUAL_REDIRECT_DOMAINS;
var init_defaults = __esm({
  "src/config/defaults.js"() {
    init_default_redirect_rule_terms();
    Config = {
      Defaults: {
        JwtExpiry: 60 * 60 * 24 * 7,
        // JWT 有效期 7 天
        LoginLockDuration: 900,
        // 登录失败锁定时间 15 分钟
        MaxLoginAttempts: 5,
        // 最大登录尝试次数
        CacheTTL: 6e4,
        // 内存缓存时间 60 秒
        AdminApiMaxBodyBytes: 5 * 1024 * 1024,
        // 管理 API 请求体上限 5MB
        NodeActivityRefreshSeconds: 300
        // 站点卡片“最近使用”独立刷新周期（秒）
      }
    };
    DEFAULT_TCPING_CONFIG = {
      tcp: {
        count: 3,
        timeoutMs: 2500,
        latencyWarnLow: 80,
        latencyWarnHigh: 200
      },
      head: {
        count: 3,
        timeoutMs: 2500,
        latencyWarnLow: 300,
        latencyWarnHigh: 800
      }
    };
    DEFAULT_CF_METRICS_CONFIG = {
      accountId: "",
      apiToken: "",
      workerUrl: "",
      showCard: true,
      autoRefreshSeconds: 300
    };
    MAX_REDIRECT_WHITELIST_RULES = 20;
    DEFAULT_REDIRECT_RULE_TERMS2 = dedupeRedirectRuleValues(DEFAULT_REDIRECT_RULE_TERMS);
    MANUAL_REDIRECT_DOMAINS = DEFAULT_REDIRECT_RULE_TERMS2.filter(isHostLikeRedirectRule);
  }
});

// src/proxy/diagnostics/runtime-cache-cleanup.js
function createRuntimeCacheCleanupState() {
  return {
    phase: 0,
    iterators: {
      rate: null,
      redirect: null,
      redirectInflight: null,
      metadataPrewarm: null
    }
  };
}
function normalizePositiveInteger(value, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return fallback;
  return Math.max(1, Math.floor(num));
}
function cleanupMapChunk(map, shouldDelete, iteratorState, iteratorKey, startedAt, now, options) {
  if (!(map instanceof Map)) return;
  const chunkSize = normalizePositiveInteger(options?.chunkSize, DEFAULT_RUNTIME_CACHE_CLEANUP_CHUNK_SIZE);
  const budgetMs = normalizePositiveInteger(options?.budgetMs, DEFAULT_RUNTIME_CACHE_CLEANUP_BUDGET_MS);
  let iterator = iteratorState[iteratorKey];
  if (!iterator) {
    iterator = map.entries();
    iteratorState[iteratorKey] = iterator;
  }
  let scanned = 0;
  while (scanned < chunkSize && Date.now() - startedAt < budgetMs) {
    const next = iterator.next();
    if (next.done) {
      iteratorState[iteratorKey] = null;
      break;
    }
    scanned += 1;
    const [key, value] = next.value;
    if (!map.has(key)) continue;
    if (shouldDelete(value, now)) map.delete(key);
  }
}
function trimMapToMaxEntries(map, iteratorState, iteratorKey, startedAt, options, fallbackMaxEntries) {
  if (!(map instanceof Map)) return;
  const budgetMs = normalizePositiveInteger(options?.budgetMs, DEFAULT_RUNTIME_CACHE_CLEANUP_BUDGET_MS);
  const maxEntries = normalizePositiveInteger(options?.maxEntries, fallbackMaxEntries);
  if (map.size <= maxEntries) return;
  while (map.size > maxEntries && Date.now() - startedAt < budgetMs) {
    const oldestKey = map.keys().next().value;
    if (oldestKey == null) break;
    map.delete(oldestKey);
    iteratorState[iteratorKey] = null;
  }
}
function maybeCleanupRuntimeCaches(globals, options = {}) {
  if (!globals || typeof globals !== "object") return;
  const state = globals.RuntimeCacheCleanupState || createRuntimeCacheCleanupState();
  globals.RuntimeCacheCleanupState = state;
  const now = Number.isFinite(Number(options?.now)) ? Number(options.now) : Date.now();
  const startedAt = Date.now();
  if (state.phase === 0) {
    cleanupMapChunk(
      globals.RateLimitCache,
      (entry) => !entry || Number(entry.resetAt || 0) <= now,
      state.iterators,
      "rate",
      startedAt,
      now,
      options
    );
    trimMapToMaxEntries(
      globals.RateLimitCache,
      state.iterators,
      "rate",
      startedAt,
      {
        ...options,
        maxEntries: options?.rateLimitMaxEntries
      },
      DEFAULT_RATE_LIMIT_CACHE_MAX_ENTRIES
    );
    state.phase = 1;
    return;
  }
  if (state.phase === 1) {
    cleanupMapChunk(
      globals.ExternalRedirectCache,
      (entry) => !entry || Number(entry.exp || 0) <= now,
      state.iterators,
      "redirect",
      startedAt,
      now,
      options
    );
    trimMapToMaxEntries(
      globals.ExternalRedirectCache,
      state.iterators,
      "redirect",
      startedAt,
      {
        ...options,
        maxEntries: options?.redirectMaxEntries
      },
      DEFAULT_EXTERNAL_REDIRECT_CACHE_MAX_ENTRIES
    );
    state.phase = 2;
    return;
  }
  if (state.phase === 2) {
    cleanupMapChunk(
      globals.ExternalRedirectInflight,
      (entry) => {
        const ttlMs = normalizePositiveInteger(options?.externalRedirectInflightTtlMs, DEFAULT_EXTERNAL_REDIRECT_INFLIGHT_TTL_MS);
        return !entry || Number(entry.startedAt || 0) <= 0 || Number(entry.startedAt || 0) + ttlMs <= now;
      },
      state.iterators,
      "redirectInflight",
      startedAt,
      now,
      options
    );
    state.phase = 3;
    return;
  }
  cleanupMapChunk(
    globals.MetadataPrewarmInflight,
    (entry) => {
      const ttlMs = normalizePositiveInteger(options?.metadataPrewarmInflightTtlMs, DEFAULT_METADATA_PREWARM_INFLIGHT_TTL_MS);
      return Number(entry || 0) <= 0 || Number(entry || 0) + ttlMs <= now;
    },
    state.iterators,
    "metadataPrewarm",
    startedAt,
    now,
    options
  );
  state.phase = 0;
}
var DEFAULT_RUNTIME_CACHE_CLEANUP_BUDGET_MS, DEFAULT_RUNTIME_CACHE_CLEANUP_CHUNK_SIZE, DEFAULT_RATE_LIMIT_CACHE_MAX_ENTRIES, DEFAULT_EXTERNAL_REDIRECT_CACHE_MAX_ENTRIES, DEFAULT_EXTERNAL_REDIRECT_INFLIGHT_TTL_MS, DEFAULT_METADATA_PREWARM_INFLIGHT_TTL_MS;
var init_runtime_cache_cleanup = __esm({
  "src/proxy/diagnostics/runtime-cache-cleanup.js"() {
    DEFAULT_RUNTIME_CACHE_CLEANUP_BUDGET_MS = 1;
    DEFAULT_RUNTIME_CACHE_CLEANUP_CHUNK_SIZE = 64;
    DEFAULT_RATE_LIMIT_CACHE_MAX_ENTRIES = 2048;
    DEFAULT_EXTERNAL_REDIRECT_CACHE_MAX_ENTRIES = 2048;
    DEFAULT_EXTERNAL_REDIRECT_INFLIGHT_TTL_MS = 60 * 1e3;
    DEFAULT_METADATA_PREWARM_INFLIGHT_TTL_MS = 60 * 1e3;
  }
});

// src/proxy/diagnostics/runtime-state.js
function createPlaybackOptimizationStats() {
  return {
    updatedAt: "",
    redirect: {
      cache: 0,
      followed: 0
    },
    basepath: {
      cache: 0,
      fallback: 0
    },
    budget: {
      degraded: 0
    }
  };
}
function clonePlaybackOptimizationStats() {
  return createPlaybackOptimizationStats();
}
function createRuntimeGlobals() {
  return {
    NodeCache: /* @__PURE__ */ new Map(),
    NodeContextCache: /* @__PURE__ */ new Map(),
    StreamBasePathCache: /* @__PURE__ */ new Map(),
    ConfigCache: null,
    GeoCache: /* @__PURE__ */ new Map(),
    TcpingResultCache: /* @__PURE__ */ new Map(),
    TcpingInflight: /* @__PURE__ */ new Map(),
    CfMetricsSummaryCache: /* @__PURE__ */ new Map(),
    CfMetricsTopPathsCache: /* @__PURE__ */ new Map(),
    CfMetricsActivityCache: /* @__PURE__ */ new Map(),
    CfMetricsSummaryInflight: /* @__PURE__ */ new Map(),
    CfMetricsTopPathsInflight: /* @__PURE__ */ new Map(),
    CfMetricsActivityInflight: /* @__PURE__ */ new Map(),
    RecentNodeUsageCache: /* @__PURE__ */ new Map(),
    PlaybackTelemetryHosts: /* @__PURE__ */ new Map(),
    ExternalRedirectCache: /* @__PURE__ */ new Map(),
    ExternalRedirectInflight: /* @__PURE__ */ new Map(),
    PlaybackHeadWindowCache: /* @__PURE__ */ new Map(),
    PlaybackJumpWindowCache: /* @__PURE__ */ new Map(),
    PlaybackSessionHints: /* @__PURE__ */ new Map(),
    PlaybackSessionStopGuard: /* @__PURE__ */ new Map(),
    PlaybackContinuationLanes: /* @__PURE__ */ new Map(),
    PlaybackContinuationStalls: /* @__PURE__ */ new Map(),
    PlaybackWindowBytesTotal: 0,
    MetadataPrewarmInflight: /* @__PURE__ */ new Map(),
    RateLimitCache: /* @__PURE__ */ new Map(),
    RuntimeCacheCleanupState: createRuntimeCacheCleanupState(),
    PlaybackOptimizationStats: createPlaybackOptimizationStats(),
    resetPlaybackOptimizationStats() {
      this.PlaybackOptimizationStats = clonePlaybackOptimizationStats();
      return this.PlaybackOptimizationStats;
    },
    resetRuntimeCacheCleanupState() {
      this.RuntimeCacheCleanupState = createRuntimeCacheCleanupState();
      return this.RuntimeCacheCleanupState;
    },
    resetPlaybackWindowState() {
      this.PlaybackHeadWindowCache.clear();
      this.PlaybackJumpWindowCache.clear();
      this.PlaybackSessionHints.clear();
      this.PlaybackSessionStopGuard.clear();
      this.PlaybackContinuationLanes.clear();
      this.PlaybackContinuationStalls.clear();
      this.PlaybackWindowBytesTotal = 0;
    },
    CryptoKeyCache: /* @__PURE__ */ new Map(),
    Regex: {
      Streaming: /\.(?:mp4|m4v|m4s|m4a|ogv|webm|mkv|mov|avi|wmv|flv|ts|m3u8|mpd)$/i
    }
  };
}
var GLOBALS;
var init_runtime_state = __esm({
  "src/proxy/diagnostics/runtime-state.js"() {
    init_runtime_cache_cleanup();
    GLOBALS = createRuntimeGlobals();
  }
});

// src/admin/ui/page-shell.js
var UI_SHELL;
var init_page_shell = __esm({
  "src/admin/ui/page-shell.js"() {
    UI_SHELL = {
      getHead(title) {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <link rel="icon" href="https://emby.media/favicon.ico" type="image/x-icon">
    <title>${title}</title>
    <style>
        :root {
            --bg: #f5f7fa; --card: #ffffff; --text: #1f2937; --text-sec: #6b7280; --border: #e5e7eb;
            --primary: #3b82f6; --primary-light: #eff6ff; --danger: #ef4444;
            --shadow: 0 1px 3px rgba(0,0,0,0.05); --radius: 12px;
        }
        html.dark {
            --bg: #111827; --card: #1f2937; --text: #f3f4f6; --text-sec: #9ca3af; --border: #374151;
            --primary: #60a5fa; --primary-light: rgba(59,130,246,0.1); --danger: #f87171;
        }
        html, body { overflow-x: hidden; touch-action: pan-x pan-y; }
        body { background:var(--bg); color:var(--text); font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin:0; min-height:100vh; padding-bottom: 80px; }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

        .container { width: 100%; max-width:800px; margin:0 auto; padding:15px; transition: max-width 0.3s; overflow-x: hidden; }

        .card-grid { display:grid; grid-template-columns:1fr; gap:15px; width:100%; }
        .cf-card-container,
        .node-list { display:contents; }
        @media(min-width: 768px) {
            .container { max-width: 1400px; padding: 30px; }
            .card-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
        }

        .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; padding: 5px 0; }
        .header h2 { margin:0; font-size: 20px; font-weight: 700; display:flex; align-items:center; gap:8px; }
        .count-badge { font-size:14px; color:var(--text-sec); font-weight:400; }

        .icon-btn { background:transparent; border:none; color:var(--text); padding:8px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; transition: .2s; }
        .icon-btn:hover { background: rgba(0,0,0,0.05); }

        .card { background:var(--card); border-radius:var(--radius); padding:16px; box-shadow:var(--shadow); border:1px solid var(--border); max-width: 100%; overflow: hidden; }
        .card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .card-title { font-size:16px; font-weight:600; display:flex; align-items:center; gap:8px; overflow: hidden; flex-wrap: wrap; }
        .card-title > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tag { font-size:12px; padding:2px 8px; border-radius:10px; background:var(--primary-light); color:var(--primary); font-weight:500; flex-shrink: 0; }
        .card-actions { display:flex; gap:10px; flex-shrink: 0; }
        .action-icon { color:var(--text-sec); cursor:pointer; padding:4px; }
        .action-icon:hover { color:var(--primary); }
        .action-icon.del:hover { color:var(--danger); }
        .info-row { display:flex; align-items:center; font-size:13px; margin-bottom:6px; color:var(--text-sec); max-width: 100%; }
        .info-label { width: 70px; flex-shrink:0; }
        .info-val { flex:1; font-family:monospace; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-right:8px; min-width: 0; }
        .info-icon { padding:4px; color:var(--text-sec); cursor:pointer; flex-shrink: 0; }

        .fab { position:fixed; bottom:25px; right:25px; width:56px; height:56px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 12px rgba(37,99,235,0.3); border:none; cursor:pointer; z-index:10; transition: transform .2s; }
        .fab:active { transform: scale(0.95); }

        .popover { position:absolute; top: 100%; right:0; min-width:180px; width:max-content; max-width:none; background:var(--card); border-radius:8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); border:1px solid var(--border); z-index:100; display:none; animation: fadeIn .2s; overflow:hidden; }
        .popover.show { display:block; }
    .popover-item { padding:10px 16px; display:flex; align-items:center; gap:10px; width:100%; text-align:left; border:none; background:transparent; color:var(--text); font-size:14px; cursor:pointer; }
    .popover-item:hover { background: rgba(0,0,0,0.05); }
    .popover-item svg { width:18px; height:18px; flex-shrink:0; }
    .menu-wrapper { position:relative; }
    .popover-section{padding:12px 16px}
    .popover-section+.popover-section{border-top:1px solid var(--border)}
    .popover-sort-row{display:flex;align-items:center;gap:10px}
    .popover-sort-label{display:inline-flex;align-items:center;justify-content:center;color:var(--text);flex-shrink:0}
    .popover-sort-label svg{width:18px;height:18px;display:block}
    .popover-sort-segment{display:inline-flex;align-items:center;background:#eef2f7;border-radius:12px;padding:3px;gap:2px;flex:1;min-width:0}
    .popover-sort-option{flex:1;min-width:0;border:none;background:transparent;color:var(--text);font-size:14px;line-height:1.2;padding:10px 12px;border-radius:10px;cursor:pointer;white-space:nowrap}
    .popover-sort-option.active{background:#4a80e8;color:#fff}
    .popover-sort-option:hover:not(.active){background:rgba(74,128,232,.08)}

        @keyframes fadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }

        .modal-mask { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:none; align-items:center; justify-content:center; z-index:50; backdrop-filter:blur(3px); }
        .modal { background:var(--card); padding:24px; border-radius:var(--radius); width:90%; max-width:400px; max-height:min(88vh,820px); display:flex; flex-direction:column; transform:scale(0.95); opacity:0; transition:.2s; box-shadow:0 10px 25px rgba(0,0,0,0.1); }
        .modal.show { transform:scale(1); opacity:1; }
        .form-group { margin-bottom:16px; position:relative; }
        .form-group label { display:block; margin-bottom:12px; font-size:16px; opacity:0.8; font-weight:500; }
        .req { color: var(--danger); margin-right: 4px; vertical-align: middle; }
        .form-group input { width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg); color:var(--text); outline:none; font-size:14px; transition: border-color .2s; }
        .form-group input:focus { border-color: var(--primary); }

        .tag-wrapper { position: relative; }
        .tag-arrow { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: var(--text-sec); pointer-events: none; }
        .dropdown-list { position: absolute; top: 100%; left: 0; right: 0; background: var(--card); border: 1px solid var(--border); border-radius: 8px; margin-top: 4px; max-height: 150px; overflow-y: auto; z-index: 60; display: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .dropdown-list.show { display: block; }
        .dropdown-item { padding: 10px 12px; font-size: 14px; cursor: pointer; color: var(--text); }
        .dropdown-item:hover { background: rgba(0,0,0,0.05); }

        .mode-hint { font-size: 12px; color: var(--text-sec); margin-top: 6px; }

        .toast { position:fixed; bottom:30px; left:50%; transform:translateX(-50%) translateY(20px); background:var(--primary); color:#fff; padding:10px 24px; border-radius:50px; font-size:14px; opacity:0; transition:.3s; z-index:200; pointer-events:none; white-space:nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .toast.error { background:var(--danger); }
        .toast.warning { background:#f59e0b; }
        .toast.show { transform:translateX(-50%) translateY(0); opacity:1; bottom: 100px; }

        /* Pull to Refresh Styles */
        .pull-indicator { position:fixed; top:0; left:0; right:0; display:flex; align-items:center; justify-content:center; gap:8px; padding:12px; background:var(--primary); color:#fff; transform:translateY(-100%); transition:transform 0.3s ease; z-index:1000; font-size:14px; }
        .pull-indicator.show { transform:translateY(0); }
        .pull-indicator.refreshing .pull-spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .btn { padding:8px 16px; border-radius:8px; border:none; cursor:pointer; font-size:14px; font-weight:500; }
        .btn.primary { background:var(--primary); color:#fff; }
        .btn-text { background:transparent; color:var(--text-sec); }
        @media(max-width:767px){
            .modal-mask{align-items:flex-end;padding-top:max(16px,env(safe-area-inset-top));}
            .modal{width:100%;max-width:none;max-height:min(92vh,900px);padding:18px 16px calc(16px + env(safe-area-inset-bottom));border-radius:20px 20px 0 0;transform:translateY(24px)}
            .modal.show{transform:translateY(0)}
        }
    </style>
</head>
<body>
    \${body}
    <div id="toast" class="toast">Action Successful</div>
</body>
</html>`;
      },
      escapeHtml(unsafe) {
        if (!unsafe) return "";
        return String(unsafe).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
      },
      renderSmartError(request, msg, nodeName) {
        if (request.headers.get("Accept")?.includes("text/html")) {
          const body = `<div style="display:flex;justify-content:center;align-items:center;height:80vh"><div class="panel" style="padding:40px;text-align:center;background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow)"><h2>连接失败</h2><p>节点: <strong>${this.escapeHtml(nodeName)}</strong></p><p style="color:var(--danger);font-family:monospace;background:var(--bg);padding:10px;border-radius:4px;word-break:break-all">${this.escapeHtml(msg)}</p><button onclick="location.reload()" class="btn primary" style="padding:10px 24px;margin-top:15px">重试</button></div></div>`;
          return new Response(this.getHead("Error").replace("${body}", body), { status: 502, headers: { "Content-Type": "text/html;charset=utf-8" } });
        }
        return new Response(JSON.stringify({ error: msg, node: nodeName }), { status: 502, headers: { "Content-Type": "application/json" } });
      },
      renderLoginPage(error = "") {
        const body = `<div style="display:flex;justify-content:center;align-items:center;height:80vh"><div class="panel" style="padding:30px;width:300px;background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow)"><h3>Emby Mate欢迎您</h3><form method="POST"><input type="password" name="password" placeholder="Password" style="width:100%;padding:10px;margin-bottom:15px;box-sizing:border-box;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)" required>${error ? `<div style="color:var(--danger);font-size:12px;margin-bottom:10px;text-align:center">${this.escapeHtml(error)}</div>` : ""}<button class="btn primary" style="width:100%;padding:10px">登 录</button></form></div></div>`;
        return new Response(this.getHead("Emby Mate 登录").replace("${body}", body), { headers: { "Content-Type": "text/html" } });
      },
      renderLockedPage(ip) {
        const body = `<div style="display:flex;justify-content:center;align-items:center;height:80vh;text-align:center"><div><h1 style="color:var(--danger)">IP 已锁定</h1><p>IP: ${this.escapeHtml(ip)}</p><p>尝试次数过多，请 15 分钟后再试。</p></div></div>`;
        return new Response(this.getHead("Locked").replace("${body}", body), { status: 429, headers: { "Content-Type": "text/html" } });
      }
    };
  }
});

// src/admin/ui/icons.js
var ADMIN_ICONS;
var init_icons = __esm({
  "src/admin/ui/icons.js"() {
    ADMIN_ICONS = {
      plus: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
      moon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
      sun: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
      menu: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg>`,
      sort: `<svg width="20" height="20" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 11.5H29"></path><path d="M6 24.5H29"></path><path d="M36 11.5V37.5L42 30.5"></path><path d="M6 37.5H29"></path></svg>`,
      refresh: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"  stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M9.99999 18.3337C14.6024 18.3337 18.3333 14.6027 18.3333 10.0003C18.3333 5.39795 14.6024 1.66699 9.99999 1.66699C5.39761 1.66699 1.66666 5.39795 1.66666 10.0003C1.66666 14.6027 5.39761 18.3337 9.99999 18.3337Z" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.976 11.25C13.445 12.9405 11.8658 14.1667 10.0001 14.1667C8.13442 14.1667 6.55513 12.9405 6.02417 11.25V13.75" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.976 6.24967V8.74967C13.445 7.05922 11.8658 5.83301 10.0001 5.83301C8.13442 5.83301 6.55513 7.05922 6.02417 8.74967" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      download: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
      upload: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
      edit: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
      clone: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
      trash: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
      show: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M9.99999 15C14.6024 15 18.3333 10 18.3333 10C18.3333 10 14.6024 5 9.99999 5C5.39761 5 1.66666 10 1.66666 10C1.66666 10 5.39761 15 9.99999 15Z" stroke="#333333" stroke-linejoin="round"/><path d="M9.99999 12.0837C11.1506 12.0837 12.0833 11.1509 12.0833 10.0003C12.0833 8.84974 11.1506 7.91699 9.99999 7.91699C8.84941 7.91699 7.91666 8.84974 7.91666 10.0003C7.91666 11.1509 8.84941 12.0837 9.99999 12.0837Z" stroke="#333333" stroke-linejoin="round"/></svg>`,
      hide: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"  stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 6.66699C2.76447 7.17503 3.16519 7.64633 3.67615 8.06508C5.10875 9.2392 7.40792 10.0003 10 10.0003C12.5921 10.0003 14.8912 9.2392 16.3238 8.06508C16.8348 7.64633 17.2355 7.17503 17.5 6.66699" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.074 10L12.9367 13.2197" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.564 8.89746L17.921 11.2545" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.08337 11.2545L4.4404 8.89746" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.05322 13.2198L7.91593 10" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      copy: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"  stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M5 4.13659V2.91699C5 2.22664 5.55962 1.66699 6.25 1.66699H17.0833C17.7737 1.66699 18.3333 2.22664 18.3333 2.91699V13.7503C18.3333 14.4407 17.7737 15.0003 17.0833 15.0003H15.8406" stroke="#333333"/><path d="M14.5833 4.16699H2.91666C2.2263 4.16699 1.66666 4.72664 1.66666 5.41699V17.0837C1.66666 17.774 2.2263 18.3337 2.91666 18.3337H14.5833C15.2737 18.3337 15.8333 17.774 15.8333 17.0837V5.41699C15.8333 4.72664 15.2737 4.16699 14.5833 4.16699Z" stroke="#333333" stroke-linejoin="round"/><path d="M7.68307 9.62938L9.88828 7.33375C10.4931 6.72888 11.4871 6.74221 12.1084 7.3635C12.7297 7.98479 12.743 8.97879 12.1382 9.58363L11.3423 10.4265" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.61087 11.9775C5.39825 12.1902 4.95858 12.6147 4.95858 12.6147C4.35371 13.2196 4.33729 14.2977 4.95858 14.919C5.57987 15.5402 6.57383 15.5535 7.17871 14.9487L9.33046 12.9952" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.77609 11.8031C7.4875 11.5145 7.33009 11.1455 7.30488 10.7725C7.2758 10.3424 7.42242 9.90688 7.74634 9.58301" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.30054 10.7754C9.92183 11.3967 9.93516 12.3907 9.33029 12.9955" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      chevronDown: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
      more: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>`,
      clear: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.33325 2.46423H11.6666V5.79758H17.9166V9.13092H2.08325V5.79758H8.33325V2.46423Z" stroke="#EF4444" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.33325 16.6666H16.6666V9.16663H3.33325V16.6666Z" stroke="#EF4444" stroke-linejoin="round"/><path d="M6.66675 16.624V14.1309" stroke="#EF4444" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 16.624V14.124" stroke="#EF4444" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.3333 16.624V14.1309" stroke="#EF4444" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 16.6666H15" stroke="#EF4444" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      del: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.83337 5.83331L14.1667 14.1666" stroke="#EF4444" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.83337 14.1666L14.1667 5.83331" stroke="#EF4444" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      external: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h7v7"></path><path d="M10 14L21 3"></path><path d="M21 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path></svg>`,
      settings: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
      web: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M3.5 12h17"></path><path d="M12 3c2.6 2.4 4.1 5.6 4.1 9S14.6 18.6 12 21"></path><path d="M12 3C9.4 5.4 7.9 8.6 7.9 12s1.5 6.6 4.1 9"></path></svg>`,
      github: `<svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4ZM0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M19.1833 45.4716C18.9898 45.2219 18.9898 42.9973 19.1833 38.798C17.1114 38.8696 15.8024 38.7258 15.2563 38.3667C14.437 37.828 13.6169 36.1667 12.8891 34.9959C12.1614 33.8251 10.5463 33.64 9.89405 33.3783C9.24182 33.1165 9.07809 32.0496 11.6913 32.8565C14.3044 33.6634 14.4319 35.8607 15.2563 36.3745C16.0806 36.8883 18.0515 36.6635 18.9448 36.2519C19.8382 35.8403 19.7724 34.3078 19.9317 33.7007C20.1331 33.134 19.4233 33.0083 19.4077 33.0037C18.5355 33.0037 13.9539 32.0073 12.6955 27.5706C11.437 23.134 13.0581 20.2341 13.9229 18.9875C14.4995 18.1564 14.4485 16.3852 13.7699 13.6737C16.2335 13.3589 18.1347 14.1343 19.4734 16.0001C19.4747 16.0108 21.2285 14.9572 24.0003 14.9572C26.772 14.9572 27.7553 15.8154 28.5142 16.0001C29.2731 16.1848 29.88 12.7341 34.5668 13.6737C33.5883 15.5969 32.7689 18.0001 33.3943 18.9875C34.0198 19.9749 36.4745 23.1147 34.9666 27.5706C33.9614 30.5413 31.9853 32.3523 29.0384 33.0037C28.7005 33.1115 28.5315 33.2855 28.5315 33.5255C28.5315 33.8856 28.9884 33.9249 29.6465 35.6117C30.0853 36.7362 30.117 39.948 29.7416 45.247C28.7906 45.4891 28.0508 45.6516 27.5221 45.7347C26.5847 45.882 25.5669 45.9646 24.5669 45.9965C23.5669 46.0284 23.2196 46.0248 21.837 45.8961C20.9154 45.8103 20.0308 45.6688 19.1833 45.4716Z" fill="currentColor"></path></svg>`,
      data: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5.5" rx="7" ry="2.5"></ellipse><path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13"></path><path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"></path></svg>`,
      logout: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`
    };
  }
});

// src/app/version.js
function normalizeRepositoryUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "").replace(/\.git$/i, "");
}
function normalizeVersionString(value) {
  const normalized = String(value || "").trim().replace(/^v/i, "");
  return VERSION_PATTERN.test(normalized) ? normalized : "";
}
function formatVersionLabel(value) {
  const normalized = normalizeVersionString(value);
  return normalized ? `V${normalized}` : "V--";
}
function compareVersions(left, right) {
  const leftVersion = normalizeVersionString(left);
  const rightVersion = normalizeVersionString(right);
  if (!leftVersion || !rightVersion) return 0;
  const leftParts = leftVersion.split(".").map((item) => Number(item));
  const rightParts = rightVersion.split(".").map((item) => Number(item));
  const size = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < size; index += 1) {
    const leftPart = leftParts[index] || 0;
    const rightPart = rightParts[index] || 0;
    if (leftPart > rightPart) return 1;
    if (leftPart < rightPart) return -1;
  }
  return 0;
}
function parseWorkerVersionFromSource(source = "") {
  const text = String(source || "");
  const markerMatch = text.match(/EMBY_MATE_VERSION[:=]\s*([0-9]+(?:\.[0-9]+){1,3})/i);
  if (markerMatch) return normalizeVersionString(markerMatch[1]);
  const constantMatch = text.match(/WORKER_VERSION(?:_MARKER)?\s*=\s*["'`][^"'`]*?([0-9]+(?:\.[0-9]+){1,3})["'`]/i);
  if (constantMatch) return normalizeVersionString(constantMatch[1]);
  const uiMatch = text.match(/版本\s*V([0-9]+(?:\.[0-9]+){1,3})/i);
  if (uiMatch) return normalizeVersionString(uiMatch[1]);
  return "";
}
function buildGitHubWorkerDistRawUrl(repositoryUrl = GITHUB_REPOSITORY_URL, branch = GITHUB_REPOSITORY_BRANCH, distPath = GITHUB_REPOSITORY_DIST_PATH) {
  const normalizedRepositoryUrl = normalizeRepositoryUrl(repositoryUrl);
  const match = normalizedRepositoryUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)$/i);
  if (!match) return "";
  const owner = match[1];
  const repo = match[2];
  const normalizedBranch = String(branch || "").trim() || GITHUB_REPOSITORY_BRANCH;
  const normalizedPath = String(distPath || "").trim().replace(/^\/+/, "");
  if (!normalizedPath) return "";
  return `https://raw.githubusercontent.com/${owner}/${repo}/${normalizedBranch}/${normalizedPath}`;
}
function normalizeVersionStatusRecord(record = {}) {
  const currentVersion = normalizeVersionString(record.currentVersion) || WORKER_VERSION;
  const remoteVersion = normalizeVersionString(record.remoteVersion);
  const rawStatus = String(record.status || "").trim().toLowerCase();
  const status = rawStatus === "update-available" || rawStatus === "equal" || rawStatus === "error" ? rawStatus : "unknown";
  return {
    currentVersion,
    remoteVersion,
    status,
    checkedAt: String(record.checkedAt || "").trim(),
    error: String(record.error || "").trim(),
    repositoryUrl: normalizeRepositoryUrl(record.repositoryUrl) || GITHUB_REPOSITORY_URL,
    repositoryBranch: String(record.repositoryBranch || "").trim() || GITHUB_REPOSITORY_BRANCH,
    repositoryDistPath: String(record.repositoryDistPath || "").trim() || GITHUB_REPOSITORY_DIST_PATH,
    workerVersionMarker: String(record.workerVersionMarker || WORKER_VERSION_MARKER).trim() || WORKER_VERSION_MARKER
  };
}
var WORKER_VERSION, GITHUB_REPOSITORY_URL, GITHUB_REPOSITORY_BRANCH, GITHUB_REPOSITORY_DIST_PATH, WORKER_VERSION_MARKER, VERSION_STATUS_STORAGE_KEY, VERSION_PATTERN;
var init_version = __esm({
  "src/app/version.js"() {
    WORKER_VERSION = "2.4.10";
    GITHUB_REPOSITORY_URL = "https://github.com/irm123gard/Emby-Mate";
    GITHUB_REPOSITORY_BRANCH = "main";
    GITHUB_REPOSITORY_DIST_PATH = "dist/worker.js";
    WORKER_VERSION_MARKER = `EMBY_MATE_VERSION=${WORKER_VERSION}`;
    VERSION_STATUS_STORAGE_KEY = "sys:version-status";
    VERSION_PATTERN = /^\d+(?:\.\d+){0,3}$/;
  }
});

// src/admin/ui/node-path-phrase-map.js
var NODE_PATH_PHRASE_MAP;
var init_node_path_phrase_map = __esm({
  "src/admin/ui/node-path-phrase-map.js"() {
    NODE_PATH_PHRASE_MAP = Object.freeze({
      "熊猫": "xiongmao",
      "飞跃": "feiyue",
      "彩虹": "caihong",
      "肥牛": "feiniu",
      "见手青": "jsq",
      "灵境": "lingjing",
      "蘑菇": "mogu",
      "墨云阁": "moyunge",
      "桃子": "taozi",
      "起点": "qidian",
      "终点": "zhongdian",
      "兔子": "tuzi",
      "星云": "xingyun",
      "映月": "yingyue",
      "月饼": "yuebing",
      "月之轩": "yuezhixuan",
      "折纸": "zhezhi",
      "大V": "daiv",
      "小姨子": "xiaoyizi",
      "跑路": "paolu",
      "垃圾影音": "1111",
      "探花": "tanhua",
      "琴鸟": "qinniao",
      "憨豆": "handou",
      "喜鹊": "xique",
      "叔服": "shufu",
      "小虾米": "xiaoxiami",
      "稳健": "wenjiani",
      "叶子": "yezi",
      "云海": "yunhai",
      "纸片人": "zpr",
      "酥糖": "sutang",
      "西瓜": "xigua",
      "线路": "xianlu",
      "站点": "zhandian",
      "影音": "yingyin",
      "影视": "yingshi"
    });
  }
});

// src/proxy/media/metadata-cache.js
function getDefaultCacheHandle() {
  try {
    return typeof caches !== "undefined" ? caches.default : null;
  } catch (_) {
    return null;
  }
}
function normalizeWorkerCacheParamName(name = "") {
  return String(name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}
function shouldStripWorkerCacheQueryParam(name = "") {
  return WORKER_CACHE_DROP_QUERY_PARAMS.has(normalizeWorkerCacheParamName(name));
}
function normalizeMetadataCachePath(pathname = "") {
  const rawPath = String(pathname || "");
  const match = /\/(?:Videos|Audio)\/.+$/i.exec(rawPath);
  return match ? match[0] : rawPath;
}
function normalizeWorkerMetadataCacheUrl(url) {
  const normalizedUrl = url instanceof URL ? new URL(url.toString()) : new URL(String(url || ""));
  normalizedUrl.hash = "";
  const keptParams = [];
  for (const [key, value] of normalizedUrl.searchParams.entries()) {
    if (shouldStripWorkerCacheQueryParam(key)) continue;
    keptParams.push([key, value]);
  }
  keptParams.sort(([leftKey, leftValue], [rightKey, rightValue]) => {
    const normalizedLeftKey = String(leftKey || "").toLowerCase();
    const normalizedRightKey = String(rightKey || "").toLowerCase();
    if (normalizedLeftKey === normalizedRightKey) return String(leftValue).localeCompare(String(rightValue));
    return normalizedLeftKey.localeCompare(normalizedRightKey);
  });
  normalizedUrl.search = "";
  for (const [key, value] of keptParams) {
    normalizedUrl.searchParams.append(normalizeWorkerCacheParamName(key), value);
  }
  return normalizedUrl;
}
function isTranscodingManifestUrl(url) {
  try {
    const normalizedUrl = url instanceof URL ? new URL(url.toString()) : new URL(String(url || ""));
    for (const [key, value] of normalizedUrl.searchParams.entries()) {
      const lowerKey = String(key || "").toLowerCase();
      const lowerValue = String(value || "").toLowerCase();
      if (lowerKey.includes("transcod") || lowerValue.includes("transcod")) return true;
    }
    return false;
  } catch (_) {
    return true;
  }
}
function isWhitelistedMetadataManifestUrl(url) {
  try {
    const normalizedUrl = url instanceof URL ? new URL(url.toString()) : new URL(String(url || ""));
    const normalizedPath = normalizeMetadataCachePath(normalizedUrl.pathname || "");
    if (!MANIFEST_EXT_RE.test(normalizedPath)) return false;
    if (isTranscodingManifestUrl(normalizedUrl)) return false;
    if (!WORKER_METADATA_MANIFEST_ALLOWED_PATHS.some((rule) => rule.test(normalizedPath))) return false;
    for (const [key] of normalizedUrl.searchParams.entries()) {
      if (shouldStripWorkerCacheQueryParam(key)) continue;
      if (!WORKER_METADATA_MANIFEST_ALLOWED_PARAMS.has(normalizeWorkerCacheParamName(key))) return false;
    }
    return true;
  } catch (_) {
    return false;
  }
}
function shouldWorkerCacheMetadataUrl(url) {
  try {
    const normalizedUrl = url instanceof URL ? new URL(url.toString()) : new URL(String(url || ""));
    const pathname = normalizedUrl.pathname || "";
    if (EMBY_IMAGE_RE.test(pathname) || IMAGE_EXT_RE.test(pathname)) return true;
    if (SUBTITLE_EXT_RE.test(pathname)) return true;
    if (MANIFEST_EXT_RE.test(pathname)) return isWhitelistedMetadataManifestUrl(normalizedUrl);
    return false;
  } catch (_) {
    return false;
  }
}
function buildWorkerMetadataCacheKey(url) {
  try {
    return normalizeWorkerMetadataCacheUrl(url).toString();
  } catch (_) {
    return "";
  }
}
async function matchWorkerMetadataCache(url) {
  const cache = getDefaultCacheHandle();
  const cacheKey = buildWorkerMetadataCacheKey(url);
  if (!cache || !cacheKey) return null;
  try {
    return await cache.match(cacheKey);
  } catch (_) {
    return null;
  }
}
function buildMetadataCacheStorageResponse(response, requestState, options = {}) {
  const cacheHeaders = new Headers(response.headers);
  cacheHeaders.delete("Set-Cookie");
  if (requestState?.isImage === true) {
    cacheHeaders.set("Cache-Control", `public, max-age=${Math.max(0, Number(options.imageCacheMaxAge) || 0)}`);
  } else if (requestState?.isSubtitle === true) {
    cacheHeaders.set("Cache-Control", "public, max-age=86400");
  } else if (requestState?.isManifest === true) {
    cacheHeaders.set("Cache-Control", `public, max-age=${Math.max(0, Number(options.prewarmCacheTtl) || 0)}`);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: cacheHeaders
  });
}
async function storeWorkerMetadataCache(url, response, requestState, options = {}) {
  const cache = getDefaultCacheHandle();
  const cacheKey = buildWorkerMetadataCacheKey(url);
  if (!cache || !cacheKey || !response || Number(response.status) !== 200) return false;
  const sourceUrl = options.sourceUrl || requestState?.activeFinalUrl || url;
  if (!shouldWorkerCacheMetadataUrl(sourceUrl)) return false;
  try {
    await cache.put(
      cacheKey,
      buildMetadataCacheStorageResponse(response.clone(), requestState, options)
    );
    return true;
  } catch (_) {
    return false;
  }
}
var IMAGE_EXT_RE, EMBY_IMAGE_RE, MANIFEST_EXT_RE, SUBTITLE_EXT_RE, WORKER_CACHE_DROP_QUERY_PARAMS, WORKER_METADATA_MANIFEST_ALLOWED_PATHS, WORKER_METADATA_MANIFEST_ALLOWED_PARAMS;
var init_metadata_cache = __esm({
  "src/proxy/media/metadata-cache.js"() {
    IMAGE_EXT_RE = /\.(?:jpe?g|gif|png|svg|ico|webp)$/i;
    EMBY_IMAGE_RE = /\/(?:images|icons|branding|covers)\//i;
    MANIFEST_EXT_RE = /\.(?:m3u8|mpd)$/i;
    SUBTITLE_EXT_RE = /\.(?:srt|ass|vtt|sub)$/i;
    WORKER_CACHE_DROP_QUERY_PARAMS = /* @__PURE__ */ new Set([
      "apikey",
      "accesstoken",
      "token",
      "authorization",
      "xembytoken",
      "xembyauthorization",
      "deviceid",
      "xembydeviceid",
      "xembydevicename",
      "xembyclient",
      "xembyclientversion",
      "client",
      "clientid",
      "devicename",
      "userid",
      "playsessionid",
      "sessionid"
    ]);
    WORKER_METADATA_MANIFEST_ALLOWED_PATHS = [
      /^\/Videos\/[^/]+\/(?:main|master|stream)\.m3u8$/i,
      /^\/Videos\/[^/]+\/(?:manifest|main|master|stream)\.mpd$/i,
      /^\/Audio\/[^/]+\/(?:main|master|stream)\.m3u8$/i
    ];
    WORKER_METADATA_MANIFEST_ALLOWED_PARAMS = /* @__PURE__ */ new Set([
      "mediasourceid",
      "static",
      "tag",
      "audiostreamindex",
      "subtitlestreamindex",
      "subtitlemethod",
      "starttimeticks"
    ]);
  }
});

// src/proxy/media/static-cache.js
function shouldUseIndependentImagePath(requestState) {
  if (!requestState) return false;
  const method = String(requestState.method || "").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return false;
  if (requestState.rangeHeader) return false;
  if (requestState.direct307Mode === true) return false;
  return requestState.isImage === true;
}
function shouldUseIndependentMetadataPath(requestState) {
  if (!requestState) return false;
  const method = String(requestState.method || "").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return false;
  if (requestState.rangeHeader) return false;
  if (requestState.direct307Mode === true) return false;
  return requestState.isSubtitle === true || requestState.isManifest === true;
}
function shouldIgnoreImageCacheQueryParam(key) {
  return IMAGE_CACHE_NOISE_QUERY_KEYS.has(String(key || "").trim().toLowerCase());
}
function buildImageEdgeCacheKey(url) {
  let parsed = null;
  try {
    parsed = url instanceof URL ? new URL(url.toString()) : new URL(String(url || ""));
  } catch (_) {
    return "";
  }
  const searchEntries = [...parsed.searchParams.entries()].filter(([key]) => !shouldIgnoreImageCacheQueryParam(key)).sort(([leftKey, leftValue], [rightKey, rightValue]) => {
    if (leftKey === rightKey) return leftValue.localeCompare(rightValue);
    return leftKey.localeCompare(rightKey);
  });
  const canonicalUrl = new URL(parsed.toString());
  canonicalUrl.search = searchEntries.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
  canonicalUrl.hash = "";
  return canonicalUrl.toString();
}
function buildCloudflareFetchOptions(requestState) {
  if (!requestState) {
    return { cacheEverything: false, cacheTtl: 0 };
  }
  const canEdgeCacheImage = requestState.method === "GET" && !requestState.rangeHeader && requestState.isImage === true;
  const canEdgeCacheSubtitle = requestState.method === "GET" && !requestState.rangeHeader && requestState.isSubtitle === true;
  const canEdgeCacheManifest = false;
  if (!canEdgeCacheSubtitle && !canEdgeCacheImage && !canEdgeCacheManifest) {
    return { cacheEverything: false, cacheTtl: 0 };
  }
  const prewarmTtl = Math.max(0, Math.round(Number(requestState.prewarmCacheTtl) || 180));
  const cacheTtl = canEdgeCacheImage ? Math.max(0, Math.round(Number(requestState.imageCacheMaxAge) || 86400 * 30)) : requestState.isManifest === true ? shouldWorkerCacheMetadataUrl(requestState.activeFinalUrl) ? prewarmTtl : 0 : requestState.isMetadataPrewarm === true ? prewarmTtl : 86400;
  return {
    cacheEverything: canEdgeCacheImage || canEdgeCacheSubtitle,
    cacheTtl,
    ...canEdgeCacheImage ? { cacheKey: buildImageEdgeCacheKey(requestState.activeFinalUrl) } : {}
  };
}
var IMAGE_CACHE_NOISE_QUERY_KEYS;
var init_static_cache = __esm({
  "src/proxy/media/static-cache.js"() {
    init_metadata_cache();
    IMAGE_CACHE_NOISE_QUERY_KEYS = /* @__PURE__ */ new Set([
      "_",
      "cb",
      "cache_bust",
      "cachebust",
      "rand",
      "random",
      "r",
      "stamp",
      "t",
      "timestamp",
      "ts"
    ]);
  }
});

// src/proxy/shared/constants.js
var MAX_EXTERNAL_REDIRECT_HOPS, MEDIA_BASE_PATH_CACHE_TTL_MS, NODE_CONTEXT_CACHE_TTL_MS, EXTERNAL_REDIRECT_CACHE_TTL_MS, PLAYBACK_OPTIMIZATION_DEEP_RANGE_START_BYTES, PLAYBACK_OPTIMIZATION_MAX_BOUNDED_RANGE_BYTES, RETRYABLE_ORIGIN_STATUSES, LOGIN_COMPAT_AUTH;
var init_constants = __esm({
  "src/proxy/shared/constants.js"() {
    MAX_EXTERNAL_REDIRECT_HOPS = 3;
    MEDIA_BASE_PATH_CACHE_TTL_MS = 1e3 * 60 * 60 * 12;
    NODE_CONTEXT_CACHE_TTL_MS = 6e4;
    EXTERNAL_REDIRECT_CACHE_TTL_MS = 1e3 * 60 * 2;
    PLAYBACK_OPTIMIZATION_DEEP_RANGE_START_BYTES = 1024 * 1024 * 64;
    PLAYBACK_OPTIMIZATION_MAX_BOUNDED_RANGE_BYTES = 1024 * 1024 * 4;
    RETRYABLE_ORIGIN_STATUSES = /* @__PURE__ */ new Set([500, 502, 503, 504, 522, 523, 524, 525, 526, 530]);
    LOGIN_COMPAT_AUTH = 'Emby Client="Emby Mate", Device="Browser", DeviceId="proxy-login-patch", Version="2.4.10"';
  }
});

// src/proxy/upstream/upstream-headers.js
function resolveTargetBase(targetBaseOrHost) {
  if (targetBaseOrHost instanceof URL) return targetBaseOrHost;
  const raw = String(targetBaseOrHost || "").trim();
  if (!raw) return new URL("https://invalid.local");
  try {
    return new URL(raw);
  } catch (_) {
    return new URL(`https://${raw}`);
  }
}
function createReplayBodyAccessor(request, method) {
  const hasBody = method !== "GET" && method !== "HEAD";
  const replayRequest = hasBody ? request.clone() : null;
  let replayBodyBuffer = null;
  return {
    hasBody,
    getReplayBody: async () => {
      if (!hasBody) return null;
      if (replayBodyBuffer === null) {
        replayBodyBuffer = await replayRequest.arrayBuffer();
      }
      return replayBodyBuffer;
    }
  };
}
function parseCookieHeader(headerValue) {
  const result = /* @__PURE__ */ new Map();
  String(headerValue || "").split(";").map((part) => part.trim()).filter(Boolean).forEach((part) => {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) {
      result.set(part, "");
      return;
    }
    const key = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    if (key) result.set(key, value);
  });
  return result;
}
function serializeCookieMap(cookieMap) {
  const parts = [];
  for (const [key, value] of cookieMap.entries()) {
    parts.push(value === "" ? key : `${key}=${value}`);
  }
  return parts.join("; ");
}
function mergeAndSanitizeCookieHeaders(baseCookieHeader, extraCookieHeader, blockedCookieNames = ["auth_token"]) {
  const blocked = new Set(
    blockedCookieNames.map((name) => String(name || "").trim().toLowerCase()).filter(Boolean)
  );
  const merged = parseCookieHeader(baseCookieHeader);
  for (const key of [...merged.keys()]) {
    if (blocked.has(String(key || "").trim().toLowerCase())) {
      merged.delete(key);
    }
  }
  const extra = parseCookieHeader(extraCookieHeader);
  for (const [key, value] of extra.entries()) {
    if (blocked.has(String(key || "").trim().toLowerCase())) continue;
    merged.set(key, value);
  }
  const result = serializeCookieMap(merged);
  return result || null;
}
function normalizeEmbyAuthHeaders(headers, method = "GET", path = "") {
  const embyAuth = headers.get("X-Emby-Authorization")?.trim();
  const stdAuth = headers.get("Authorization")?.trim();
  const isEmbyStd = stdAuth?.toLowerCase().startsWith("emby ");
  let finalAuth = embyAuth || (isEmbyStd ? stdAuth : null);
  if (!finalAuth && String(method).toUpperCase() === "POST" && String(path).toLowerCase().includes("/users/authenticatebyname")) {
    finalAuth = LOGIN_COMPAT_AUTH;
  }
  if (!finalAuth) return;
  headers.set("X-Emby-Authorization", finalAuth);
  if (!stdAuth || isEmbyStd) {
    headers.set("Authorization", finalAuth);
  }
}
function applyCustomRequestHeaders(headers, customHeaders = {}) {
  const customHeaderNames = /* @__PURE__ */ new Set();
  let customCookie = null;
  if (!customHeaders || typeof customHeaders !== "object" || Array.isArray(customHeaders)) {
    return { customHeaderNames, customCookie };
  }
  for (const [rawKey, rawValue] of Object.entries(customHeaders)) {
    const key = String(rawKey || "").trim();
    const lowerKey = key.toLowerCase();
    if (!key || DROP_REQUEST_HEADERS.has(lowerKey)) continue;
    customHeaderNames.add(lowerKey);
    if (lowerKey === "cookie") {
      customCookie = String(rawValue ?? "");
      continue;
    }
    headers.set(key, String(rawValue ?? ""));
  }
  return { customHeaderNames, customCookie };
}
function normalizeRealClientIpHeaderMode(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "strip") return "strip";
  if (normalized === "disable" || normalized === "none") return "disable";
  return "forward";
}
function buildUpstreamHeaders(request, requestState, targetBaseOrHost, options = {}) {
  const targetBase = resolveTargetBase(targetBaseOrHost);
  const targetHost = targetBase.host;
  const targetOrigin = targetBase.origin;
  const headers = new Headers(request.headers);
  const { customHeaderNames, customCookie } = applyCustomRequestHeaders(headers, options.customHeaders);
  const mergedCookie = mergeAndSanitizeCookieHeaders(headers.get("Cookie"), customCookie, ["auth_token"]);
  if (mergedCookie) headers.set("Cookie", mergedCookie);
  else headers.delete("Cookie");
  normalizeEmbyAuthHeaders(
    headers,
    requestState?.method || request.method,
    requestState?.activeNormalizedPath || requestState?.lowerPath || ""
  );
  headers.set("Host", targetHost);
  const clientIP = request.headers.get("cf-connecting-ip") || "unknown";
  const realClientIpMode = normalizeRealClientIpHeaderMode(options.realClientIpMode);
  if (realClientIpMode === "forward" || realClientIpMode === "strip") {
    headers.set("X-Real-IP", clientIP);
  } else {
    headers.delete("X-Real-IP");
  }
  if (realClientIpMode === "forward") {
    headers.set("X-Forwarded-For", clientIP);
  } else {
    headers.delete("X-Forwarded-For");
  }
  headers.set("X-Forwarded-Host", requestState.requestHost);
  headers.set("X-Forwarded-Proto", new URL(request.url).protocol.replace(":", ""));
  if (requestState.isWsUpgrade === true) {
    headers.set("Upgrade", "websocket");
    headers.set("Connection", "Upgrade");
  } else if (options.forceH1 === true) {
    headers.set("Connection", "keep-alive");
  }
  ["cf-connecting-ip", "cf-ipcountry", "cf-ray", "cf-visitor", "cf-worker"].forEach((h) => headers.delete(h));
  if (headers.has("Origin") && !customHeaderNames.has("origin")) headers.set("Origin", targetOrigin);
  if ((requestState.isBigStream || requestState.isSegment || requestState.isManifest) && !customHeaderNames.has("referer")) headers.delete("Referer");
  else if (headers.has("Referer")) {
    if (!customHeaderNames.has("referer")) {
      try {
        const originalReferer = new URL(headers.get("Referer"));
        if (originalReferer.origin !== targetOrigin) {
          const safeReferer = new URL(originalReferer.pathname + originalReferer.search, targetOrigin);
          headers.set("Referer", safeReferer.toString());
        }
      } catch (_) {
        headers.set("Referer", `${targetOrigin}/`);
      }
    }
  }
  return headers;
}
var DROP_REQUEST_HEADERS;
var init_upstream_headers = __esm({
  "src/proxy/upstream/upstream-headers.js"() {
    init_constants();
    DROP_REQUEST_HEADERS = /* @__PURE__ */ new Set([
      "host",
      "x-real-ip",
      "x-forwarded-for",
      "x-forwarded-host",
      "x-forwarded-proto",
      "forwarded",
      "connection",
      "upgrade",
      "transfer-encoding",
      "te",
      "keep-alive",
      "proxy-authorization",
      "proxy-authenticate",
      "trailer",
      "expect"
    ]);
  }
});

// src/proxy/media/metadata-prewarm.js
function normalizeTargetBasePath(pathname = "/") {
  const raw = String(pathname || "").trim();
  if (!raw || raw === "/") return "";
  return raw.replace(/\/+$/, "");
}
function sanitizeProxyPath(pathname = "/") {
  const raw = String(pathname || "").trim();
  if (!raw) return "/";
  return (raw.startsWith("/") ? raw : `/${raw}`).replace(/\/{2,}/g, "/") || "/";
}
function buildUpstreamProxyUrl(targetBase, proxyPath = "/") {
  const baseUrl = targetBase instanceof URL ? new URL(targetBase.toString()) : new URL(String(targetBase || ""));
  const basePath = normalizeTargetBasePath(baseUrl.pathname);
  const safeProxyPath = sanitizeProxyPath(proxyPath);
  const resolvedPath = safeProxyPath === "/" ? basePath ? `${basePath}/` : "/" : `${basePath}${safeProxyPath}`;
  baseUrl.pathname = resolvedPath || "/";
  baseUrl.search = "";
  baseUrl.hash = "";
  return baseUrl;
}
function translateUpstreamUrlToProxyLocation(upstreamUrl, activeTargetBase, proxyPrefix) {
  try {
    const resolvedUrl = upstreamUrl instanceof URL ? new URL(upstreamUrl.toString()) : new URL(String(upstreamUrl || ""));
    const targetBase = activeTargetBase instanceof URL ? activeTargetBase : new URL(String(activeTargetBase || ""));
    if (resolvedUrl.origin !== targetBase.origin) return null;
    const basePath = normalizeTargetBasePath(targetBase.pathname);
    let proxyPath = resolvedUrl.pathname || "/";
    if (basePath) {
      if (proxyPath === basePath || proxyPath === `${basePath}/`) {
        proxyPath = "/";
      } else if (proxyPath.startsWith(`${basePath}/`)) {
        proxyPath = proxyPath.slice(basePath.length) || "/";
      } else {
        return null;
      }
    }
    proxyPath = sanitizeProxyPath(proxyPath);
    const prefix = sanitizeProxyPath(proxyPrefix || "/");
    return `${prefix}${proxyPath === "/" ? "/" : proxyPath}${resolvedUrl.search}${resolvedUrl.hash}`;
  } catch (_) {
    return null;
  }
}
function normalizePrewarmDepth(value) {
  return String(value || "").trim().toLowerCase() === "poster" ? "poster" : "poster_manifest";
}
function shouldAllowMetadataPrewarmPath(pathname = "") {
  const lowerPath = String(pathname || "").toLowerCase();
  if (!lowerPath) return false;
  return lowerPath.includes("/items/") || lowerPath.includes("/playbackinfo");
}
function isHeavyVideoBytePath(pathname = "") {
  const lowerPath = String(pathname || "").toLowerCase();
  if (!lowerPath) return false;
  if (HEAVY_VIDEO_EXT_RE.test(lowerPath)) return true;
  if (MANIFEST_EXT_RE2.test(lowerPath) || SUBTITLE_EXT_RE2.test(lowerPath)) return false;
  return HEAVY_VIDEO_ROUTE_RE.test(lowerPath);
}
function maybeAddMetadataUrlString(value, collector) {
  const safeCollector = collector instanceof Set ? collector : /* @__PURE__ */ new Set();
  const safeValue = String(value || "").trim();
  if (!safeValue || !/^(?:https?:\/\/|\/)/i.test(safeValue)) return safeCollector;
  const lowerValue = safeValue.toLowerCase();
  const matchTarget = lowerValue.split(/[?#]/, 1)[0] || lowerValue;
  if (EMBY_IMAGE_RE2.test(lowerValue) || IMAGE_EXT_RE2.test(matchTarget) || MANIFEST_EXT_RE2.test(matchTarget) || SUBTITLE_EXT_RE2.test(matchTarget)) {
    safeCollector.add(safeValue);
  }
  return safeCollector;
}
function collectMetadataUrlStrings(input, collector = /* @__PURE__ */ new Set(), depth = 0) {
  if (input === null || input === void 0 || depth > 5) return collector;
  if (typeof input === "string") {
    return maybeAddMetadataUrlString(input, collector);
  }
  if (Array.isArray(input)) {
    input.slice(0, 24).forEach((item) => collectMetadataUrlStrings(item, collector, depth + 1));
    return collector;
  }
  if (typeof input === "object") {
    Object.values(input).slice(0, 32).forEach((value) => collectMetadataUrlStrings(value, collector, depth + 1));
  }
  return collector;
}
function collectWhitelistedMediaSourceMetadataUrlStrings(mediaSource, collector = /* @__PURE__ */ new Set()) {
  if (!mediaSource || typeof mediaSource !== "object") return collector;
  DIRECT_MEDIA_SOURCE_METADATA_FIELDS.forEach((field) => {
    maybeAddMetadataUrlString(mediaSource?.[field], collector);
  });
  NESTED_MEDIA_SOURCE_METADATA_ARRAY_FIELDS.forEach((field) => {
    const items = Array.isArray(mediaSource?.[field]) ? mediaSource[field] : [];
    items.slice(0, 12).forEach((item) => {
      if (!item || typeof item !== "object") return;
      NESTED_MEDIA_SOURCE_METADATA_ITEM_FIELDS.forEach((nestedField) => {
        maybeAddMetadataUrlString(item?.[nestedField], collector);
      });
    });
  });
  return collector;
}
function findRequestedMediaSourcePayload(payload, requestedMediaSourceId = "") {
  const requestedId = String(requestedMediaSourceId || "").trim();
  if (!requestedId || !payload || typeof payload !== "object") return null;
  const mediaSources = Array.isArray(payload?.MediaSources) ? payload.MediaSources : Array.isArray(payload?.mediaSources) ? payload.mediaSources : [];
  return mediaSources.find((item) => {
    const sourceId = String(
      item?.Id || item?.id || item?.MediaSourceId || item?.mediaSourceId || ""
    ).trim();
    return sourceId && sourceId === requestedId;
  }) || null;
}
function createMetadataWarmRequestState(target, request, requestState, context) {
  const requestUrl = new URL(request.url);
  return {
    method: "GET",
    requestHost: requestUrl.host,
    isWsUpgrade: false,
    isBigStream: false,
    isSegment: false,
    isImage: EMBY_IMAGE_RE2.test(target.proxyPath) || IMAGE_EXT_RE2.test(target.proxyPath),
    isSubtitle: SUBTITLE_EXT_RE2.test(target.proxyPath),
    isManifest: MANIFEST_EXT_RE2.test(target.proxyPath),
    activeNormalizedPath: target.proxyPath,
    activeFinalUrl: target.upstreamUrl,
    prewarmCacheTtl: Number(requestState?.prewarmCacheTtl || context?.prewarmCacheTtl) || 180,
    imageCacheMaxAge: Number(requestState?.imageCacheMaxAge || context?.imageCacheMaxAge) || 86400 * 30
  };
}
function extractProxyItemId(proxyPath = "") {
  const match = /\/Items\/([^/]+)(?:\/|$)/i.exec(String(proxyPath || ""));
  if (!match) return "";
  try {
    return decodeURIComponent(match[1]).trim();
  } catch (_) {
    return String(match[1] || "").trim();
  }
}
function rankMetadataWarmPath(pathname = "") {
  const lowerPath = String(pathname || "").toLowerCase();
  if (EMBY_IMAGE_RE2.test(lowerPath) || IMAGE_EXT_RE2.test(lowerPath)) return 0;
  if (MANIFEST_EXT_RE2.test(lowerPath)) return 1;
  if (SUBTITLE_EXT_RE2.test(lowerPath)) return 2;
  return 3;
}
function resolveMetadataTarget(candidate, activeTargetBase, proxyPrefix) {
  const raw = String(candidate || "").trim();
  if (!raw) return null;
  let upstreamUrl = null;
  try {
    if (/^https?:\/\//i.test(raw)) {
      upstreamUrl = new URL(raw);
    } else {
      const relativeUrl = new URL(raw, "https://metadata-prewarm.invalid");
      upstreamUrl = buildUpstreamProxyUrl(activeTargetBase, relativeUrl.pathname || "/");
      upstreamUrl.search = relativeUrl.search || "";
      upstreamUrl.hash = relativeUrl.hash || "";
    }
  } catch (_) {
    return null;
  }
  if (isHeavyVideoBytePath(upstreamUrl.pathname)) return null;
  const proxyLocation = translateUpstreamUrlToProxyLocation(upstreamUrl, activeTargetBase, proxyPrefix);
  if (!proxyLocation) return null;
  let proxyUrl = null;
  try {
    proxyUrl = new URL(proxyLocation, "https://worker.invalid");
  } catch (_) {
    return null;
  }
  const pathname = proxyUrl.pathname || "/";
  if (!(EMBY_IMAGE_RE2.test(pathname) || IMAGE_EXT_RE2.test(pathname) || MANIFEST_EXT_RE2.test(pathname) || SUBTITLE_EXT_RE2.test(pathname))) {
    return null;
  }
  return { upstreamUrl, proxyLocation, proxyPath: pathname, proxySearch: proxyUrl.search || "" };
}
function buildMetadataPrewarmTargets(proxyPath, payload, activeTargetBase, proxyPrefix, prewarmDepth, requestedMediaSourceId = "") {
  const candidates = /* @__PURE__ */ new Map();
  const itemId = extractProxyItemId(proxyPath);
  if (itemId) {
    const posterTarget = resolveMetadataTarget(`/Items/${encodeURIComponent(itemId)}/Images/Primary`, activeTargetBase, proxyPrefix);
    if (posterTarget) candidates.set(`${posterTarget.proxyPath}${posterTarget.proxySearch}`, posterTarget);
  }
  if (normalizePrewarmDepth(prewarmDepth) !== "poster") {
    const targetedPayload = findRequestedMediaSourcePayload(payload, requestedMediaSourceId);
    const whitelistedValues = targetedPayload ? collectWhitelistedMediaSourceMetadataUrlStrings(targetedPayload) : null;
    const metadataValues = targetedPayload ? whitelistedValues?.size ? whitelistedValues : collectMetadataUrlStrings(targetedPayload) : collectMetadataUrlStrings(payload);
    metadataValues.forEach((value) => {
      const target = resolveMetadataTarget(value, activeTargetBase, proxyPrefix);
      if (!target) return;
      candidates.set(`${target.proxyPath}${target.proxySearch}`, target);
    });
  }
  return [...candidates.values()].sort((left, right) => rankMetadataWarmPath(left.proxyPath) - rankMetadataWarmPath(right.proxyPath)).slice(0, 4);
}
async function maybePrewarmMetadataResponse({
  request,
  response,
  requestState,
  context,
  executionContext
}) {
  if (typeof executionContext?.waitUntil !== "function") return;
  if (requestState?.isMetadataPrewarm === true) return;
  if (request?.method !== "GET" || requestState?.enablePrewarm !== true) return;
  if (requestState?.isImage === true || requestState?.isStaticFile === true || requestState?.isSubtitle === true || requestState?.isManifest === true || requestState?.isSegment === true || requestState?.isBigStream === true) return;
  if (!shouldAllowMetadataPrewarmPath(requestState?.activeNormalizedPath || "")) return;
  if (!(Number(response?.status) >= 200 && Number(response?.status) < 300)) return;
  const contentType = String(response?.headers?.get?.("Content-Type") || "").toLowerCase();
  if (!contentType.includes("json")) return;
  const contentLength = Number(response?.headers?.get?.("Content-Length") || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_METADATA_PREWARM_JSON_BYTES) return;
  let payload = null;
  try {
    payload = await response.clone().json();
  } catch (_) {
    return;
  }
  const targets = buildMetadataPrewarmTargets(
    requestState?.activeNormalizedPath || context?.path || context?.name || "",
    payload,
    requestState?.activeTargetBase || context?.primaryTarget?.targetBase || null,
    context?.proxyPrefix || "",
    requestState?.prewarmDepth,
    requestState?.requestedMediaSourceId
  );
  if (!targets.length) return;
  const prewarmTimeoutMs = Math.max(250, Math.min(1e4, Math.round(Number(context?.prewarmTimeoutMs) || DEFAULT_METADATA_PREWARM_TIMEOUT_MS)));
  executionContext.waitUntil((async () => {
    let nextIndex = 0;
    const runTarget = async (target) => {
      if (!shouldWorkerCacheMetadataUrl(target.upstreamUrl)) return;
      const cacheProbeUrl = new URL(target.proxyLocation, request.url);
      const existing = await matchWorkerMetadataCache(cacheProbeUrl);
      if (existing) return;
      const inflightKey = cacheProbeUrl.toString();
      if (GLOBALS.MetadataPrewarmInflight.has(inflightKey)) return;
      GLOBALS.MetadataPrewarmInflight.set(inflightKey, Date.now());
      const warmRequestState = createMetadataWarmRequestState(target, request, requestState, context);
      const headers = buildUpstreamHeaders(
        request,
        warmRequestState,
        requestState?.activeTargetBase || context?.primaryTarget?.targetBase,
        {
          forceH1: context?.forceH1 === true,
          customHeaders: context?.nodeHeaders,
          realClientIpMode: context?.realClientIpMode
        }
      );
      headers.delete("Range");
      headers.delete("If-Modified-Since");
      headers.delete("If-None-Match");
      headers.set("X-Metadata-Prewarm", "1");
      const controller = new AbortController();
      const timer = prewarmTimeoutMs > 0 ? setTimeout(() => controller.abort(), prewarmTimeoutMs) : null;
      try {
        const prewarmResponse = await fetch(target.upstreamUrl.toString(), {
          method: "GET",
          headers,
          cf: buildCloudflareFetchOptions(warmRequestState),
          signal: controller.signal
        });
        try {
          await storeWorkerMetadataCache(cacheProbeUrl, prewarmResponse, warmRequestState, {
            sourceUrl: target.upstreamUrl,
            prewarmCacheTtl: warmRequestState.prewarmCacheTtl,
            imageCacheMaxAge: warmRequestState.imageCacheMaxAge
          });
        } catch (_) {
        }
        try {
          prewarmResponse.body?.cancel?.();
        } catch (_) {
        }
      } catch (_) {
      } finally {
        GLOBALS.MetadataPrewarmInflight.delete(inflightKey);
        if (timer !== null) clearTimeout(timer);
      }
    };
    const workers = Array.from({
      length: Math.min(MAX_METADATA_PREWARM_CONCURRENCY, targets.length)
    }, async () => {
      while (nextIndex < targets.length) {
        const current = targets[nextIndex];
        nextIndex += 1;
        if (!current) break;
        await runTarget(current);
      }
    });
    await Promise.all(workers);
  })());
}
var IMAGE_EXT_RE2, EMBY_IMAGE_RE2, MANIFEST_EXT_RE2, SUBTITLE_EXT_RE2, HEAVY_VIDEO_EXT_RE, HEAVY_VIDEO_ROUTE_RE, DEFAULT_METADATA_PREWARM_TIMEOUT_MS, MAX_METADATA_PREWARM_JSON_BYTES, MAX_METADATA_PREWARM_CONCURRENCY, DIRECT_MEDIA_SOURCE_METADATA_FIELDS, NESTED_MEDIA_SOURCE_METADATA_ARRAY_FIELDS, NESTED_MEDIA_SOURCE_METADATA_ITEM_FIELDS;
var init_metadata_prewarm = __esm({
  "src/proxy/media/metadata-prewarm.js"() {
    init_static_cache();
    init_metadata_cache();
    init_upstream_headers();
    init_runtime_state();
    IMAGE_EXT_RE2 = /\.(?:jpe?g|gif|png|svg|ico|webp)$/i;
    EMBY_IMAGE_RE2 = /\/(?:images|icons|branding|covers)\//i;
    MANIFEST_EXT_RE2 = /\.(?:m3u8|mpd)$/i;
    SUBTITLE_EXT_RE2 = /\.(?:srt|ass|vtt|sub)$/i;
    HEAVY_VIDEO_EXT_RE = /\.(?:mp4|m4v|mkv|mov|avi|wmv|flv|ts|m4s)(?:$|[?#])/i;
    HEAVY_VIDEO_ROUTE_RE = /\/(?:videos|items)\/[^/]+\/(?:stream|original|download|file)\b/i;
    DEFAULT_METADATA_PREWARM_TIMEOUT_MS = 3e3;
    MAX_METADATA_PREWARM_JSON_BYTES = 512 * 1024;
    MAX_METADATA_PREWARM_CONCURRENCY = 2;
    DIRECT_MEDIA_SOURCE_METADATA_FIELDS = [
      "PosterUrl",
      "posterUrl",
      "ImageUrl",
      "imageUrl",
      "PrimaryImageUrl",
      "primaryImageUrl",
      "ThumbUrl",
      "thumbUrl",
      "LogoUrl",
      "logoUrl",
      "ManifestUrl",
      "manifestUrl",
      "SubtitleUrl",
      "subtitleUrl"
    ];
    NESTED_MEDIA_SOURCE_METADATA_ARRAY_FIELDS = [
      "Subtitles",
      "subtitles",
      "SubtitleStreams",
      "subtitleStreams",
      "MediaStreams",
      "mediaStreams",
      "Images",
      "images"
    ];
    NESTED_MEDIA_SOURCE_METADATA_ITEM_FIELDS = [
      "Url",
      "url",
      "DeliveryUrl",
      "deliveryUrl",
      "StreamUrl",
      "streamUrl",
      "PosterUrl",
      "posterUrl",
      "ImageUrl",
      "imageUrl",
      "ManifestUrl",
      "manifestUrl",
      "SubtitleUrl",
      "subtitleUrl"
    ];
  }
});

// src/admin/ui/settings-model.js
function clampInteger(value, fallback, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(num)));
}
function cloneTcpingConfig(input) {
  const defaults = {
    tcp: {
      count: 3,
      timeoutMs: 2500,
      latencyWarnLow: 80,
      latencyWarnHigh: 200
    },
    head: {
      count: 3,
      timeoutMs: 2500,
      latencyWarnLow: 300,
      latencyWarnHigh: 800
    }
  };
  const src = input && typeof input === "object" ? input : {};
  const isLegacy = ["count", "timeoutMs", "latencyWarnLow", "latencyWarnHigh"].some((key) => src[key] != null);
  const modern = isLegacy ? { tcp: src, head: {} } : src;
  const normalizeProbe = (probeInput = {}, defaults2 = {}) => {
    const count = Math.max(1, Math.min(10, Number(probeInput.count ?? defaults2.count)));
    const timeoutMs = Math.max(200, Math.min(1e4, Number(probeInput.timeoutMs ?? defaults2.timeoutMs)));
    const latencyWarnLow = Number(probeInput.latencyWarnLow ?? defaults2.latencyWarnLow);
    const latencyWarnHigh = Number(probeInput.latencyWarnHigh ?? defaults2.latencyWarnHigh);
    return {
      count: Number.isFinite(count) ? Math.round(count) : defaults2.count,
      timeoutMs: Number.isFinite(timeoutMs) ? Math.round(timeoutMs) : defaults2.timeoutMs,
      latencyWarnLow: Number.isFinite(latencyWarnLow) ? latencyWarnLow : defaults2.latencyWarnLow,
      latencyWarnHigh: Number.isFinite(latencyWarnHigh) ? latencyWarnHigh : defaults2.latencyWarnHigh
    };
  };
  const tcp = normalizeProbe(modern.tcp || {}, defaults.tcp);
  const head = normalizeProbe(modern.head || {}, defaults.head);
  if (tcp.latencyWarnLow > tcp.latencyWarnHigh) tcp.latencyWarnLow = tcp.latencyWarnHigh;
  if (head.latencyWarnLow > head.latencyWarnHigh) head.latencyWarnLow = head.latencyWarnHigh;
  return { tcp, head };
}
function normalizeRedirectRuleHost(value) {
  let raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  raw = raw.replace(/^(?:https?|wss?):\/\//i, "");
  raw = raw.split("/")[0].split("?")[0].split("#")[0].trim();
  raw = raw.replace(/^\*\./, "").replace(/\.+$/, "");
  return raw;
}
function isHostLikeRedirectRule2(value) {
  return /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(String(value || "").trim());
}
function normalizeSharedRedirectRuleValue(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const host = normalizeRedirectRuleHost(trimmed);
  if (isHostLikeRedirectRule2(host)) return host;
  return trimmed;
}
function normalizeSharedRedirectRuleEntries(list, maxEntries = MAX_SHARED_REDIRECT_RULES) {
  const entries = [];
  const seen = /* @__PURE__ */ new Set();
  for (const item of Array.isArray(list) ? list : []) {
    const raw = item && typeof item === "object" && !Array.isArray(item) ? item : { name: "", domain: item };
    const domain = normalizeSharedRedirectRuleValue(raw.domain ?? raw.host ?? raw.value);
    const name = String(raw.name ?? raw.label ?? "").trim();
    if (!domain) continue;
    const key = domain.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({
      id: String(raw.id || `redirect-${entries.length + 1}`),
      name,
      domain
    });
    if (entries.length >= maxEntries) break;
  }
  return entries;
}
function parseWangpanDirectTerms(raw) {
  const items = String(raw || "").split(/[\n\r,，;；|]+/).map((item) => normalizeSharedRedirectRuleValue(item)).filter(Boolean);
  const seen = /* @__PURE__ */ new Set();
  const next = [];
  for (const item of items) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    next.push(item);
  }
  return next;
}
function createSettingsDraftFromConfig(config = {}) {
  const base = Object(config && typeof config === "object" ? config : void 0);
  const {
    thirdPartyProxies = DEFAULT_SETTINGS_MODAL_CONFIG.thirdPartyProxies,
    tcping = DEFAULT_SETTINGS_MODAL_CONFIG.tcping,
    enableH2 = DEFAULT_SETTINGS_MODAL_CONFIG.enableH2,
    enableH3 = DEFAULT_SETTINGS_MODAL_CONFIG.enableH3,
    peakDowngrade = DEFAULT_SETTINGS_MODAL_CONFIG.peakDowngrade,
    protocolFallback = DEFAULT_SETTINGS_MODAL_CONFIG.protocolFallback,
    enablePrewarm = DEFAULT_SETTINGS_MODAL_CONFIG.enablePrewarm,
    prewarmDepth = DEFAULT_SETTINGS_MODAL_CONFIG.prewarmDepth,
    prewarmCacheTtl = DEFAULT_SETTINGS_MODAL_CONFIG.prewarmCacheTtl,
    directStaticAssets = DEFAULT_SETTINGS_MODAL_CONFIG.directStaticAssets,
    directHlsDash = DEFAULT_SETTINGS_MODAL_CONFIG.directHlsDash,
    sourceSameOriginProxy = DEFAULT_SETTINGS_MODAL_CONFIG.sourceSameOriginProxy,
    forceExternalProxy = DEFAULT_SETTINGS_MODAL_CONFIG.forceExternalProxy,
    debugProxyHeaders = DEFAULT_SETTINGS_MODAL_CONFIG.debugProxyHeaders,
    upstreamTimeoutMs = DEFAULT_SETTINGS_MODAL_CONFIG.upstreamTimeoutMs,
    upstreamRetryAttempts = DEFAULT_SETTINGS_MODAL_CONFIG.upstreamRetryAttempts
  } = base;
  return {
    thirdPartyProxies: Array.isArray(thirdPartyProxies) ? thirdPartyProxies.map((item) => ({ ...item })) : DEFAULT_SETTINGS_MODAL_CONFIG.thirdPartyProxies.map((item) => ({ ...item })),
    redirectWhitelistEntries: normalizeSharedRedirectRuleEntries(
      Array.isArray(base.redirectWhitelistEntries) && base.redirectWhitelistEntries.length ? base.redirectWhitelistEntries : base.redirectWhitelistDomains
    ).map((item) => ({ ...item })),
    tcping: cloneTcpingConfig(tcping),
    enableH2: enableH2 === true,
    enableH3: enableH3 === true,
    peakDowngrade: peakDowngrade !== false,
    protocolFallback: protocolFallback !== false,
    enablePrewarm: enablePrewarm !== false,
    prewarmDepth: normalizePrewarmDepth(prewarmDepth),
    prewarmCacheTtl: clampInteger(
      prewarmCacheTtl,
      DEFAULT_SETTINGS_MODAL_CONFIG.prewarmCacheTtl,
      0,
      3600
    ),
    directStaticAssets: directStaticAssets === true,
    directHlsDash: directHlsDash === true,
    sourceSameOriginProxy: sourceSameOriginProxy !== false,
    forceExternalProxy: forceExternalProxy !== false,
    debugProxyHeaders: debugProxyHeaders === true,
    upstreamTimeoutMs: clampInteger(
      upstreamTimeoutMs,
      DEFAULT_SETTINGS_MODAL_CONFIG.upstreamTimeoutMs,
      0,
      18e4
    ),
    upstreamRetryAttempts: clampInteger(
      upstreamRetryAttempts,
      DEFAULT_SETTINGS_MODAL_CONFIG.upstreamRetryAttempts,
      0,
      3
    )
  };
}
function buildConfigFromSettingsDraft(baseConfig = {}, draft = {}) {
  const nextDraft = createSettingsDraftFromConfig(draft);
  const sharedRules = normalizeSharedRedirectRuleEntries(nextDraft.redirectWhitelistEntries);
  const redirectWhitelistEntries = [];
  const redirectWhitelistDomains = [];
  const wangpanTerms = [];
  for (const item of sharedRules) {
    wangpanTerms.push(item.domain);
    if (!isHostLikeRedirectRule2(item.domain)) continue;
    redirectWhitelistEntries.push({
      id: String(item.id || `redirect-${redirectWhitelistEntries.length + 1}`),
      name: String(item.name || "").trim(),
      domain: normalizeRedirectRuleHost(item.domain)
    });
    redirectWhitelistDomains.push(normalizeRedirectRuleHost(item.domain));
  }
  return {
    ...baseConfig,
    thirdPartyProxies: nextDraft.thirdPartyProxies.map((item) => ({
      id: String(item.id || `proxy-${Date.now()}`),
      name: String(item.name || "").trim(),
      url: String(item.url || "").trim()
    })),
    redirectWhitelistEntries,
    redirectWhitelistDomains,
    wangpandirect: wangpanTerms.join(", "),
    tcping: cloneTcpingConfig(nextDraft.tcping),
    enableH2: nextDraft.enableH2 === true,
    enableH3: nextDraft.enableH3 === true,
    peakDowngrade: nextDraft.peakDowngrade !== false,
    protocolFallback: nextDraft.protocolFallback !== false,
    enablePrewarm: nextDraft.enablePrewarm !== false,
    prewarmDepth: normalizePrewarmDepth(nextDraft.prewarmDepth),
    prewarmCacheTtl: clampInteger(
      nextDraft.prewarmCacheTtl,
      DEFAULT_SETTINGS_MODAL_CONFIG.prewarmCacheTtl,
      0,
      3600
    ),
    directStaticAssets: nextDraft.directStaticAssets === true,
    directHlsDash: nextDraft.directHlsDash === true,
    sourceSameOriginProxy: nextDraft.sourceSameOriginProxy !== false,
    forceExternalProxy: nextDraft.forceExternalProxy !== false,
    debugProxyHeaders: nextDraft.debugProxyHeaders === true,
    upstreamTimeoutMs: clampInteger(
      nextDraft.upstreamTimeoutMs,
      DEFAULT_SETTINGS_MODAL_CONFIG.upstreamTimeoutMs,
      0,
      18e4
    ),
    upstreamRetryAttempts: clampInteger(
      nextDraft.upstreamRetryAttempts,
      DEFAULT_SETTINGS_MODAL_CONFIG.upstreamRetryAttempts,
      0,
      3
    )
  };
}
var DEFAULT_TCPING_SETTINGS, DEFAULT_SETTINGS_MODAL_CONFIG, MAX_SHARED_REDIRECT_RULES;
var init_settings_model = __esm({
  "src/admin/ui/settings-model.js"() {
    init_metadata_prewarm();
    DEFAULT_TCPING_SETTINGS = {
      tcp: {
        count: 3,
        timeoutMs: 2500,
        latencyWarnLow: 80,
        latencyWarnHigh: 200
      },
      head: {
        count: 3,
        timeoutMs: 2500,
        latencyWarnLow: 300,
        latencyWarnHigh: 800
      }
    };
    DEFAULT_SETTINGS_MODAL_CONFIG = Object.freeze({
      thirdPartyProxies: [],
      redirectWhitelistEntries: [],
      redirectWhitelistDomains: [],
      tcping: DEFAULT_TCPING_SETTINGS,
      enableH2: false,
      enableH3: false,
      peakDowngrade: true,
      protocolFallback: true,
      enablePrewarm: true,
      prewarmDepth: "poster_manifest",
      prewarmCacheTtl: 180,
      directStaticAssets: true,
      directHlsDash: true,
      sourceSameOriginProxy: true,
      forceExternalProxy: true,
      debugProxyHeaders: false,
      wangpandirect: "",
      upstreamTimeoutMs: 3e4,
      upstreamRetryAttempts: 1
    });
    MAX_SHARED_REDIRECT_RULES = 20;
  }
});

// src/storage/node-model.js
function normalizeTargetString(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return raw.replace(/\/+$/, "");
  } catch (_) {
    return "";
  }
}
function normalizeNodePath(pathValue, fallbackName = "") {
  const explicit = String(pathValue || "").trim();
  const fallback = explicit || String(fallbackName || "").trim();
  if (!fallback) return "";
  return fallback.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "-");
}
function isReservedNodePath(pathValue) {
  const normalized = String(pathValue || "").trim().toLowerCase();
  return !!normalized && RESERVED_NODE_PATHS.has(normalized);
}
function collectTargetCandidates(value, fallbackValue = "") {
  const primarySource = Array.isArray(value) ? value : String(value || "").trim() ? String(value || "").split(/[\n\r,，]+/) : [];
  const fallbackSource = primarySource.length ? [] : Array.isArray(fallbackValue) ? fallbackValue : String(fallbackValue || "").trim() ? String(fallbackValue || "").split(/[\n\r,，]+/) : [];
  return [...primarySource, ...fallbackSource].map((item) => String(item || "").trim()).filter(Boolean);
}
function normalizeTargetList(value, fallbackValue = "") {
  const seen = /* @__PURE__ */ new Set();
  const targets = [];
  const candidates = collectTargetCandidates(value, fallbackValue);
  for (const candidate of candidates) {
    const normalized = normalizeTargetString(candidate);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    targets.push(normalized);
  }
  return targets;
}
function sanitizeHeaders(headers) {
  if (!headers || typeof headers !== "object" || Array.isArray(headers)) return {};
  const normalized = {};
  for (const [rawKey, rawValue] of Object.entries(headers)) {
    const key = String(rawKey || "").trim();
    if (!key) continue;
    if (BLOCKED_HEADER_NAMES.has(key.toLowerCase())) continue;
    normalized[key] = String(rawValue ?? "");
  }
  return normalized;
}
function normalizeNodeRealClientIpMode(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "strip") return "strip";
  if (normalized === "disable" || normalized === "none") return "disable";
  return "forward";
}
function buildDefaultLineName(index) {
  return `线路${Number(index) + 1}`;
}
function normalizeLineId(value, fallbackIndex = 0) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || `line-${Number(fallbackIndex) + 1}`;
}
function normalizeIsoDatetime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
}
function normalizeLines(lines, fallbackTargets = []) {
  const sourceLines = Array.isArray(lines) && lines.length ? lines : normalizeTargetList(fallbackTargets).map((target, index) => ({
    id: `line-${index + 1}`,
    name: buildDefaultLineName(index),
    target
  }));
  if (!sourceLines.length) return [];
  const usedIds = /* @__PURE__ */ new Set();
  const normalized = [];
  sourceLines.forEach((rawLine, index) => {
    const line = rawLine && typeof rawLine === "object" && !Array.isArray(rawLine) ? rawLine : { target: rawLine };
    const target = normalizeTargetString(line?.target);
    if (!target) return;
    const baseId = normalizeLineId(line?.id, index);
    let nextId = baseId;
    let suffix = 2;
    while (usedIds.has(nextId)) {
      nextId = `${baseId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(nextId);
    const rawLatencyMs = line?.latencyMs;
    const latencyMs = rawLatencyMs === null || rawLatencyMs === void 0 || rawLatencyMs === "" ? Number.NaN : Number(rawLatencyMs);
    normalized.push({
      id: nextId,
      name: String(line?.name || "").trim() || buildDefaultLineName(index),
      target,
      latencyMs: Number.isFinite(latencyMs) && latencyMs >= 0 ? Math.round(latencyMs) : null,
      latencyUpdatedAt: normalizeIsoDatetime(line?.latencyUpdatedAt)
    });
  });
  return normalized;
}
function resolveActiveLineId(activeLineId, lines) {
  if (!Array.isArray(lines) || !lines.length) return "";
  const explicit = String(activeLineId || "").trim();
  if (explicit && lines.some((line) => line.id === explicit)) return explicit;
  return lines[0].id;
}
function getActiveNodeLine(node = {}) {
  const lines = Array.isArray(node?.lines) ? node.lines : [];
  if (!lines.length) return null;
  const activeLineId = resolveActiveLineId(node?.activeLineId, lines);
  return lines.find((line) => line.id === activeLineId) || lines[0];
}
function getOrderedNodeLines(node = {}) {
  const lines = Array.isArray(node?.lines) ? node.lines.slice() : [];
  if (lines.length <= 1) return lines;
  const activeLine = getActiveNodeLine(node);
  if (!activeLine) return lines;
  return [activeLine, ...lines.filter((line) => line.id !== activeLine.id)];
}
function sortNodeLinesByLatency(lines = []) {
  return (Array.isArray(lines) ? lines : []).map((line, index) => ({ line, index })).sort((left, right) => {
    const leftMs = Number.isFinite(left.line?.latencyMs) ? left.line.latencyMs : Number.POSITIVE_INFINITY;
    const rightMs = Number.isFinite(right.line?.latencyMs) ? right.line.latencyMs : Number.POSITIVE_INFINITY;
    if (leftMs !== rightMs) return leftMs - rightMs;
    return left.index - right.index;
  }).map((item) => item.line);
}
function isPingCacheFresh(line, cacheMinutes) {
  const latencyMs = Number(line?.latencyMs);
  const checkedAt = Date.parse(String(line?.latencyUpdatedAt || ""));
  if (!Number.isFinite(latencyMs) || !Number.isFinite(checkedAt)) return false;
  const ttlMs = Math.max(0, Number(cacheMinutes) || 0) * 60 * 1e3;
  if (ttlMs <= 0) return false;
  return Date.now() - checkedAt < ttlMs;
}
function normalizeNodeRecord(node = {}) {
  const source = Object(node && typeof node === "object" && !Array.isArray(node) ? node : {
    name: "",
    path: "",
    target: "",
    targets: [],
    lines: [],
    activeLineId: "",
    headers: {},
    remark: "",
    tag: "",
    redirectWhitelistEnabled: false,
    realClientIpMode: "forward",
    direct: false,
    sourceDirect: false,
    directSource: false,
    direct2xx: false
  });
  const { secret: _legacySecret, ...restNode } = source;
  const normalizedName = String(source.name || "").trim();
  const normalizedPath = normalizeNodePath(source.path || source.secret, normalizedName);
  const fallbackTargets = normalizeTargetList(source.targets, source.target);
  const lines = normalizeLines(source.lines, fallbackTargets);
  const targets = lines.length ? lines.map((line) => line.target) : fallbackTargets;
  return {
    ...restNode,
    name: normalizedName,
    path: normalizedPath,
    target: targets[0] || "",
    targets,
    lines,
    activeLineId: resolveActiveLineId(source.activeLineId, lines),
    headers: sanitizeHeaders(source.headers),
    remark: String(source.remark || ""),
    tag: String(source.tag || ""),
    redirectWhitelistEnabled: source.redirectWhitelistEnabled === true,
    realClientIpMode: normalizeNodeRealClientIpMode(source.realClientIpMode),
    direct: source.direct === true,
    sourceDirect: source.sourceDirect === true,
    directSource: source.directSource === true,
    direct2xx: source.direct2xx === true
  };
}
function createStoredNodeRecord(node = {}) {
  const normalized = normalizeNodeRecord(node);
  return {
    name: normalized.name,
    path: normalized.path,
    target: normalized.target,
    targets: normalized.targets,
    lines: normalized.lines,
    activeLineId: normalized.activeLineId,
    headers: normalized.headers,
    remark: normalized.remark,
    tag: normalized.tag,
    redirectWhitelistEnabled: normalized.redirectWhitelistEnabled,
    realClientIpMode: normalized.realClientIpMode,
    direct: normalized.direct === true,
    sourceDirect: normalized.sourceDirect === true,
    directSource: normalized.directSource === true,
    direct2xx: normalized.direct2xx === true
  };
}
function prepareNodesForStorage(nodes = []) {
  const preparedNodes = [];
  const usedPaths = /* @__PURE__ */ new Set();
  for (const rawNode of Array.isArray(nodes) ? nodes : []) {
    const name = String(rawNode?.name || "").trim();
    const path = normalizeNodePath(rawNode?.path, name);
    const rawTargets = collectTargetCandidates(rawNode?.targets, rawNode?.target);
    const normalizedNode = normalizeNodeRecord(rawNode);
    if (!name && !rawTargets.length && !normalizedNode.targets.length) continue;
    if (!name) {
      return { nodes: [], error: "节点名称不能为空" };
    }
    if (!path) {
      return { nodes: [], error: "站点路径不能为空" };
    }
    if (isReservedNodePath(path)) {
      return { nodes: [], error: "站点路径不能使用系统保留字" };
    }
    const pathKey = path.toLowerCase();
    if (usedPaths.has(pathKey)) {
      return { nodes: [], error: "站点路径不能重复" };
    }
    usedPaths.add(pathKey);
    if (!normalizedNode.targets.length) {
      return { nodes: [], error: "请至少填写 1 个目标地址" };
    }
    for (const candidate of rawTargets) {
      if (normalizeTargetString(candidate)) continue;
      return { nodes: [], error: "目标地址格式错误，必须以 http:// 或 https:// 开头" };
    }
    preparedNodes.push({
      ...normalizedNode,
      name,
      path
    });
  }
  return {
    nodes: preparedNodes,
    error: null
  };
}
var RESERVED_NODE_PATHS, BLOCKED_HEADER_NAMES_LIST, BLOCKED_HEADER_NAMES;
var init_node_model = __esm({
  "src/storage/node-model.js"() {
    RESERVED_NODE_PATHS = /* @__PURE__ */ new Set([
      "admin",
      "__client_rtt__",
      "favicon.ico",
      "robots.txt"
    ]);
    BLOCKED_HEADER_NAMES_LIST = Object.freeze([
      "host",
      "x-real-ip",
      "x-forwarded-for",
      "x-forwarded-host",
      "x-forwarded-proto",
      "forwarded",
      "connection",
      "upgrade",
      "transfer-encoding",
      "te",
      "keep-alive",
      "proxy-authorization",
      "proxy-authenticate",
      "trailer",
      "expect"
    ]);
    BLOCKED_HEADER_NAMES = new Set(BLOCKED_HEADER_NAMES_LIST);
  }
});

// src/admin/ui/admin-script.js
function buildAdminInlineScript(ICONS) {
  return `<script>
const ICONS=${JSON.stringify(ICONS)};
const WORKER_VERSION=${JSON.stringify(WORKER_VERSION)};
const GITHUB_REPOSITORY_URL=${JSON.stringify(GITHUB_REPOSITORY_URL)};
const DEFAULT_TCPING_CONFIG=${JSON.stringify(DEFAULT_TCPING_CONFIG)};
const DEFAULT_CF_METRICS_CONFIG=${JSON.stringify(DEFAULT_CF_METRICS_CONFIG)};
const DEFAULT_SETTINGS_MODAL_CONFIG=${JSON.stringify(DEFAULT_SETTINGS_MODAL_CONFIG)};
const NODE_ACTIVITY_REFRESH_SECONDS=${JSON.stringify(Config.Defaults.NodeActivityRefreshSeconds)};
const MAX_SHARED_REDIRECT_RULES=${JSON.stringify(MAX_SHARED_REDIRECT_RULES)};
const clampInteger=${clampInteger.toString()};
const cloneTcpingConfig=${cloneTcpingConfig.toString()};
const normalizeRedirectRuleHost=${normalizeRedirectRuleHost.toString()};
const isHostLikeRedirectRule=${isHostLikeRedirectRule2.toString()};
const normalizeSharedRedirectRuleValue=${normalizeSharedRedirectRuleValue.toString()};
const normalizeSharedRedirectRuleEntries=${normalizeSharedRedirectRuleEntries.toString()};
const parseWangpanDirectTerms=${parseWangpanDirectTerms.toString()};
const createSettingsDraftFromConfig=${createSettingsDraftFromConfig.toString()};
const buildConfigFromSettingsDraft=${buildConfigFromSettingsDraft.toString()};
const normalizePrewarmDepth=${normalizePrewarmDepth.toString()};
const VERSION_PATTERN=/^\\d+(?:\\.\\d+){0,3}$/;
const formatVersionLabel=${formatVersionLabel.toString()};
const normalizeVersionString=${normalizeVersionString.toString()};
const BLOCKED_HEADER_NAMES=new Set(${JSON.stringify(BLOCKED_HEADER_NAMES_LIST)});
const sanitizeNodeHeaders=${sanitizeHeaders.toString()};
const NODE_PATH_PHRASE_MAP=${JSON.stringify(NODE_PATH_PHRASE_MAP)};
const NODE_PATH_PHRASE_ENTRIES=Object.entries(NODE_PATH_PHRASE_MAP).sort((left,right)=>right[0].length-left[0].length);
const App={
    nodes:[],tags:new Set(),tagCandidates:[],nodeNames:new Set(),nodePaths:new Set(),editing:null,editingActiveLineId:'',targetDraft:[],nodeHeadersEnabled:false,nodePathTouched:false,filterText:'',sortMode:'path',config:{theme:'auto',...DEFAULT_SETTINGS_MODAL_CONFIG,redirectWhitelistEntries:[],redirectWhitelistDomains:[],tcping:cloneTcpingConfig(DEFAULT_TCPING_CONFIG),cfMetrics:{...DEFAULT_CF_METRICS_CONFIG}},settingsDraft:createSettingsDraftFromConfig({...DEFAULT_SETTINGS_MODAL_CONFIG,redirectWhitelistEntries:[],redirectWhitelistDomains:[],tcping:cloneTcpingConfig(DEFAULT_TCPING_CONFIG)}),settingsAdvancedOpen:false,cfSettingsDraft:{...DEFAULT_CF_METRICS_CONFIG},proxyDialogNode:null,proxyMode:'custom',activeCardMenu:null,tcpingCache:{},_tcpingRequestsByTarget:{},_tcpingFreshWindowMs:3000,visibleTargets:{},refreshPromise:null,clientRttPromise:null,clientRtt:{loading:false,medianMs:null,error:'',updatedAt:''},_clientRttFreshWindowMs:60000,_filterTimeout:null,_lastFilterSignature:'',cfMetricsData:null,_cfMetricsFreshWindowMs:60000,nodeActivityData:null,nodeActivityRefreshingPath:'',cfAutoRefreshTimer:null,nodeActivityRefreshTimer:null,nodeActivityLoading:false,_nodeActivityFreshWindowMs:60000,_lastNodeActivitySignature:'',configManage:{includeAll:false},modalScrollLocked:false,modalScrollTop:0,versionStatus:{currentVersion:WORKER_VERSION,remoteVersion:'',status:'unknown',checkedAt:'',error:'',repositoryUrl:GITHUB_REPOSITORY_URL},cfDns:{loading:false,hostname:location.hostname||'',zoneName:'',exists:false,mode:'domain',modePinned:false,records:[],status:{kind:'idle',text:'未读取'},domainInput:'',ipInputs:[''],activeIpIndex:0,domainSupport:{checked:false,ipv4:null,ipv6:null,loading:false},domainHistory:[],ipHistory:[],lastError:'',lastMessage:'',lookupTimer:null,lookupSeq:0,fetchSeq:0},
    normalizeVersionStatus(record={}){const currentVersion=normalizeVersionString(record.currentVersion)||WORKER_VERSION;const remoteVersion=normalizeVersionString(record.remoteVersion);const rawStatus=String(record.status||'').trim().toLowerCase();const status=rawStatus==='update-available'||rawStatus==='equal'||rawStatus==='error'?rawStatus:'unknown';return{currentVersion,remoteVersion,status,checkedAt:String(record.checkedAt||'').trim(),error:String(record.error||'').trim(),repositoryUrl:String(record.repositoryUrl||GITHUB_REPOSITORY_URL).trim()||GITHUB_REPOSITORY_URL};},
    syncVersionMenu(){const button=document.getElementById('version-menu-btn');const text=document.getElementById('version-menu-text');if(!button||!text)return;const status=this.normalizeVersionStatus(this.versionStatus);this.versionStatus=status;button.title=status.status==='update-available'&&status.remoteVersion?('当前 '+formatVersionLabel(status.currentVersion)+'，仓库最新 '+formatVersionLabel(status.remoteVersion)):'点击查看 GitHub 仓库';text.textContent=status.status==='update-available'&&status.remoteVersion?('发布新版了：'+formatVersionLabel(status.remoteVersion)):('版本 '+formatVersionLabel(status.currentVersion));},
    openRepositoryHome(event){event?.preventDefault?.();event?.stopPropagation?.();document.getElementById('main-menu')?.classList.remove('show');window.open((this.versionStatus&&this.versionStatus.repositoryUrl)||GITHUB_REPOSITORY_URL,'_blank','noopener');},
    async loadVersionStatus(force=false){const currentStatus=this.normalizeVersionStatus(this.versionStatus);if(!force&&currentStatus.checkedAt&&currentStatus.status!=='error')return currentStatus;try{const res=await fetch('/admin',{method:'POST',body:JSON.stringify({action:'versionStatus'})});const data=await res.json();if(!res.ok)throw new Error(data.error||'版本信息加载失败');this.versionStatus=this.normalizeVersionStatus(data);}catch(_){this.versionStatus=currentStatus;}this.syncVersionMenu();return this.versionStatus;},
    escapeHtml(str){if(str==null)return'';const map={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};return String(str).replace(/[&<>"']/g,m=>map[m]);},
    quoteJs(str){return JSON.stringify(String(str==null?'':str));},
    normalizeTarget(value){const raw=String(value||'').trim();if(!raw)return'';try{const url=new URL(raw);if(url.protocol!=='http:'&&url.protocol!=='https:')return'';let normalized=raw;while(normalized.endsWith('/'))normalized=normalized.slice(0,-1);return normalized;}catch(_){return'';}},
    collectTargetCandidates(value,fallbackValue=''){const splitSource=input=>{const source=Array.isArray(input)?input:[input];const items=[];source.forEach(entry=>{const normalized=String(entry||'').split('\\r').join('\\n').split('，').join(',');normalized.split('\\n').forEach(line=>{line.split(',').forEach(part=>{const text=String(part||'').trim();if(text)items.push(text);});});});return items;};const primary=splitSource(value);const fallback=primary.length?[]:splitSource(fallbackValue);return [...primary,...fallback];},
    normalizeTargetList(value,fallbackValue=''){const seen=new Set();const targets=[];this.collectTargetCandidates(value,fallbackValue).forEach(item=>{const normalized=this.normalizeTarget(item);if(!normalized||seen.has(normalized))return;seen.add(normalized);targets.push(normalized);});return targets;},
    normalizeNodePathValue(value){return String(value||'').trim().split('/').filter(Boolean).join('-').replace(/-+/g,'-');},
    buildSuggestedNodePath(value){
        const raw=String(value||'').trim();
        if(!raw)return'';
        let normalizedSource=raw;
        NODE_PATH_PHRASE_ENTRIES.forEach(([phrase,slug])=>{
            if(!normalizedSource.includes(phrase))return;
            normalizedSource=normalizedSource.split(phrase).join(slug+'-');
        });
        let output='';
        for(const char of normalizedSource){
            if(/[A-Za-z0-9]/.test(char)){output+=char.toLowerCase();continue;}
            if(/[s_-]/.test(char)){output+='-';continue;}
        }
        return this.normalizeNodePathValue(output.replace(/-+/g,'-').replace(/^-+|-+$/g,''));
    },
    setNodePathTouched(touched){this.nodePathTouched=touched===true;},
    handleNodeNameInput(value){
        const name=String(value||'');
        const currentPathInput=document.getElementById('in-path');
        if(!currentPathInput)return;
        if(!this.nodePathTouched||!String(currentPathInput.value||'').trim()){
            currentPathInput.value=this.buildSuggestedNodePath(name);
        }
    },
    handleNodePathInput(value){
        const input=document.getElementById('in-path');
        if(input&&input!==document.activeElement){
            input.value=this.normalizeNodePathValue(value);
        }
        this.setNodePathTouched(true);
    },
    normalizeRealClientIpMode(value){const normalized=String(value||'').trim().toLowerCase();if(normalized==='strip')return'strip';if(normalized==='disable'||normalized==='none')return'disable';return'forward';},
    normalizeLineDraftEntry(item,index=0){const line=item&&typeof item==='object'&&!Array.isArray(item)?item:{target:item};return{id:String(line?.id||('line-'+(index+1))),name:String(line?.name||''),target:String(line?.target??line?.url??'')};},
    createEmptyLineDraft(index=0){return this.normalizeLineDraftEntry({id:'line-'+(index+1),name:'',target:''},index);},
    normalizeNode(node){const restNode={...(node&&typeof node==='object'&&!Array.isArray(node)?node:{})};delete restNode.secret;const rawLines=Array.isArray(restNode?.lines)&&restNode.lines.length?restNode.lines:[];const normalizedLines=(rawLines.length?rawLines.map((line,index)=>this.normalizeLineDraftEntry(line,index)):this.normalizeTargetList(restNode?.targets,restNode?.target).map((target,index)=>this.normalizeLineDraftEntry({target,name:''},index))).map((line,index)=>({id:String(line.id||('line-'+(index+1))),name:String(line.name||'').trim(),target:this.normalizeTarget(line.target)})).filter(line=>line.target);const targets=normalizedLines.length?normalizedLines.map(line=>line.target):this.normalizeTargetList(restNode?.targets,restNode?.target);const activeLineId=String(restNode?.activeLineId||'').trim();const normalizedPath=this.normalizeNodePathValue(String(node?.path||node?.name||''));return{...restNode,name:String(restNode?.name||'').trim(),path:String(node?.path||node?.name||'')?normalizedPath:'',target:targets[0]||'',targets,lines:normalizedLines,activeLineId:normalizedLines.some(line=>line.id===activeLineId)?activeLineId:(normalizedLines[0]?.id||''),headers:sanitizeNodeHeaders(node?.headers),remark:String(restNode?.remark||''),tag:String(restNode?.tag||''),redirectWhitelistEnabled:restNode?.redirectWhitelistEnabled===true,realClientIpMode:this.normalizeRealClientIpMode(restNode?.realClientIpMode)};},
    getNodeTargets(node){return this.normalizeTargetList(node?.targets,node?.target);},
    getPrimaryTarget(node){return this.getNodeTargets(node)[0]||'';},
    setTargetDraft(list){const source=Array.isArray(list)&&list.length?list:[list];const next=source.map((item,index)=>this.normalizeLineDraftEntry(item,index));this.targetDraft=next.length?next:[this.createEmptyLineDraft(0)];this.renderTargetDraft();},
    addTargetDraft(value=''){const next=[...(Array.isArray(this.targetDraft)?this.targetDraft:[this.createEmptyLineDraft(0)])];next.push(this.normalizeLineDraftEntry(typeof value==='object'&&value?value:{target:value},next.length));this.targetDraft=next;this.renderTargetDraft();},
    updateTargetDraft(index,key,value){const next=[...(Array.isArray(this.targetDraft)?this.targetDraft:[this.createEmptyLineDraft(0)])];if(index<0||index>=next.length)return;next[index]={...this.normalizeLineDraftEntry(next[index],index),[key]:String(value||'')};this.targetDraft=next;},
    moveTargetDraft(index,offset){const next=[...(Array.isArray(this.targetDraft)?this.targetDraft:[this.createEmptyLineDraft(0)])];const targetIndex=index+offset;if(index<0||index>=next.length||targetIndex<0||targetIndex>=next.length)return;const [item]=next.splice(index,1);next.splice(targetIndex,0,item);this.targetDraft=next.map((entry,idx)=>this.normalizeLineDraftEntry(entry,idx));this.renderTargetDraft();},
    removeTargetDraft(index){const next=[...(Array.isArray(this.targetDraft)?this.targetDraft:[this.createEmptyLineDraft(0)])];if(index<0||index>=next.length)return;next.splice(index,1);this.targetDraft=(next.length?next:[this.createEmptyLineDraft(0)]).map((entry,idx)=>this.normalizeLineDraftEntry(entry,idx));this.renderTargetDraft();},
    getDraftTargetEntries(){const root=document.getElementById('target-list');if(!root)return(Array.isArray(this.targetDraft)?this.targetDraft:[this.createEmptyLineDraft(0)]).map((item,index)=>this.normalizeLineDraftEntry(item,index));return Array.from(root.querySelectorAll('[data-target-row]')).map((row,index)=>this.normalizeLineDraftEntry({id:row.getAttribute('data-target-id')||('line-'+(index+1)),name:row.querySelector('[data-target-name-index]')?.value||'',target:row.querySelector('[data-target-index]')?.value||''},index));},
    getDraftTargetInputs(){return this.getDraftTargetEntries().map(item=>item.target);},
    renderTargetDraft(){const root=document.getElementById('target-list');if(!root)return;const draft=(Array.isArray(this.targetDraft)&&this.targetDraft.length?this.targetDraft:[this.createEmptyLineDraft(0)]).map((item,index)=>this.normalizeLineDraftEntry(item,index));root.innerHTML=draft.map((value,idx)=>['<div class="target-item '+(idx===0?'is-primary':'')+'" data-target-row data-target-id="'+this.escapeHtml(value.id)+'">','<div class="target-inputs">','<input class="target-line-name" data-target-name-index="'+idx+'" placeholder="线路名称（选填）" value="'+this.escapeHtml(value.name)+'" oninput="App.updateTargetDraft('+idx+', &quot;name&quot;, this.value)">','<input data-target-index="'+idx+'" placeholder="请输入 http(s)://源站:端口" value="'+this.escapeHtml(value.target)+'" oninput="App.updateTargetDraft('+idx+', &quot;target&quot;, this.value)">','</div>','<div class="target-actions">','<button class="target-action-btn" type="button" aria-label="上移目标" onclick="App.moveTargetDraft('+idx+',-1)" '+(idx===0?'disabled':'')+'>↑</button>','<button class="target-action-btn" type="button" aria-label="下移目标" onclick="App.moveTargetDraft('+idx+',1)" '+(idx===draft.length-1?'disabled':'')+'>↓</button>','<button class="target-action-btn" type="button" aria-label="删除目标" onclick="App.removeTargetDraft('+idx+')" '+(draft.length===1?'disabled':'')+'>'+ICONS.del+'</button>','</div>','</div>'].join('')).join('');},
    readNodeHeaderDraftRows(){const root=document.getElementById('node-headers-list');if(!root)return[];return Array.from(root.querySelectorAll('[data-node-header-row]')).map(row=>({key:row.querySelector('[data-node-header-key]')?.value||'',value:row.querySelector('[data-node-header-value]')?.value||''}));},
    renderNodeHeaderList(rows=[]){const root=document.getElementById('node-headers-list');if(!root)return;const list=(Array.isArray(rows)?rows:[]).map(item=>({key:String(item?.key||''),value:String(item?.value??'')}));if(!list.length){root.innerHTML='<div class="redirect-whitelist-empty">暂无请求头</div>';return;}root.innerHTML=list.map((item,idx)=>'<div class="proxy-item" data-node-header-row><input data-node-header-key placeholder="Header Key" value="'+this.escapeHtml(item.key)+'"><input data-node-header-value placeholder="Header Value" value="'+this.escapeHtml(item.value)+'"><button class="icon-action-btn" type="button" aria-label="删除请求头" onclick="App.removeNodeHeaderRow('+idx+')">'+ICONS.del+'</button></div>').join('');},
    setNodeHeaderDraft(headers){const rows=Object.entries(sanitizeNodeHeaders(headers)).map(([key,value])=>({key,value}));this.renderNodeHeaderList(rows);},
    setNodeHeadersEnabled(enabled){const on=enabled===true;this.nodeHeadersEnabled=on;document.getElementById('in-node-headers-enabled').value=on?'1':'0';const sw=document.getElementById('in-node-headers-switch');const text=document.getElementById('in-node-headers-text');const content=document.getElementById('node-headers-content');sw?.classList.toggle('on',on);sw?.setAttribute('aria-pressed',on?'true':'false');content?.classList.toggle('hidden',!on);if(text){text.textContent=on?'开启':'关闭';text.classList.toggle('on',on);text.classList.toggle('off',!on);}if(on&&this.readNodeHeaderDraftRows().length===0)this.renderNodeHeaderList([{key:'',value:''}]);},
    addNodeHeaderRow(key='',value=''){const rows=this.readNodeHeaderDraftRows();rows.push({key:String(key||''),value:String(value??'')});this.renderNodeHeaderList(rows);},
    removeNodeHeaderRow(index){const rows=this.readNodeHeaderDraftRows().filter((_,idx)=>idx!==index);this.renderNodeHeaderList(rows);},
    collectNodeHeaderEntries(){if(document.getElementById('in-node-headers-enabled').value!=='1')return{};const headers={};this.readNodeHeaderDraftRows().forEach(item=>{const key=String(item?.key||'').trim();if(!key)return;headers[key]=String(item?.value??'');});return sanitizeNodeHeaders(headers);},
    emptyDomainSupport(){return{checked:false,ipv4:null,ipv6:null,loading:false};},
    createDefaultCfDnsState(){return{loading:false,hostname:location.hostname||'',zoneName:'',exists:false,mode:'domain',modePinned:false,records:[],status:{kind:'idle',text:'未读取'},domainInput:'',ipInputs:[''],activeIpIndex:0,domainSupport:this.emptyDomainSupport(),domainHistory:this.readPreferredHistory('domain'),ipHistory:this.readPreferredHistory('ip'),lastError:'',lastMessage:'',lookupTimer:null,lookupSeq:0,fetchSeq:0};},
    getPreferredHistoryKey(type){return type==='ip'?'emby-mate-preferred-ip-history':'emby-mate-preferred-domain-history';},
    readPreferredHistory(type){try{const raw=localStorage.getItem(this.getPreferredHistoryKey(type));const parsed=JSON.parse(raw||'[]');if(!Array.isArray(parsed))return[];return parsed.map(item=>String(item||'').trim()).filter(Boolean).slice(0,4);}catch(_){return[];}},
    writePreferredHistory(type,list){try{localStorage.setItem(this.getPreferredHistoryKey(type),JSON.stringify((Array.isArray(list)?list:[]).slice(0,4)));}catch(_){}},
    pushPreferredHistory(type,values){const incoming=(Array.isArray(values)?values:[values]).map(item=>String(item||'').trim()).filter(Boolean);if(!incoming.length)return;const next=[];for(const item of [...incoming,...this.readPreferredHistory(type)]){if(next.includes(item))continue;next.push(item);if(next.length>=4)break;}this.writePreferredHistory(type,next);if(type==='ip')this.cfDns.ipHistory=next;else this.cfDns.domainHistory=next;},
    async init(){const listPromise=this.requestNodeList();this.syncVersionMenu();await this.loadConfig();this.cfDns=this.createDefaultCfDnsState();this.setTheme(this.config.theme||localStorage.getItem('theme')||'auto');this.updateClientRttPill();try{this.applyNodeListPayload(await listPromise,true);this.scheduleInitialCfMetricsLoad();}catch(e){this.toast('加载失败: '+e.message,'error');}this.loadClientRtt(true).catch(()=>{});this.loadVersionStatus(false).catch(()=>{});this.updateSearchState();this.syncSortMenu();this.initPullToRefresh();this.syncCfAutoRefresh();this.syncNodeActivityAutoRefresh();document.addEventListener('click',e=>{if(!e.target.closest('.menu-wrapper'))document.getElementById('main-menu').classList.remove('show');if(!e.target.closest('.tag-wrapper'))document.getElementById('tag-list').classList.remove('show');if(!e.target.closest('.settings-depth-picker'))document.getElementById('settings-prewarm-depth-menu')?.classList.remove('show');if(!e.target.closest('.card-more'))this.closeCardMenus();});document.addEventListener('keydown',e=>this.handleGlobalKeydown(e));},
    async loadConfig(){try{const res=await fetch('/admin',{method:'POST',body:JSON.stringify({action:'loadConfig'})});const data=await res.json();const explicitRedirectEntries=normalizeSharedRedirectRuleEntries(Array.isArray(data.redirectWhitelistEntries)&&data.redirectWhitelistEntries.length?data.redirectWhitelistEntries:data.redirectWhitelistDomains,MAX_SHARED_REDIRECT_RULES);const explicitRedirectDomains=Array.from(new Set(explicitRedirectEntries.map(item=>normalizeRedirectRuleHost(item?.domain)).filter(domain=>isHostLikeRedirectRule(domain))));const baseConfig={theme:data.theme||'auto',...DEFAULT_SETTINGS_MODAL_CONFIG,thirdPartyProxies:Array.isArray(data.thirdPartyProxies)?data.thirdPartyProxies:[],redirectWhitelistEntries:explicitRedirectEntries,redirectWhitelistDomains:explicitRedirectDomains,tcping:cloneTcpingConfig(data.tcping||{}),enableH2:data.enableH2===true,enableH3:data.enableH3===true,peakDowngrade:data.peakDowngrade!==false,protocolFallback:data.protocolFallback!==false,enablePrewarm:data.enablePrewarm!==false,prewarmDepth:data.prewarmDepth,prewarmCacheTtl:data.prewarmCacheTtl,directStaticAssets:data.directStaticAssets!==false,directHlsDash:data.directHlsDash!==false,sourceSameOriginProxy:data.sourceSameOriginProxy!==false,forceExternalProxy:data.forceExternalProxy!==false,debugProxyHeaders:data.debugProxyHeaders===true,upstreamTimeoutMs:data.upstreamTimeoutMs,upstreamRetryAttempts:data.upstreamRetryAttempts,cfMetrics:{...DEFAULT_CF_METRICS_CONFIG,...(data.cfMetrics||{})}};this.settingsDraft=createSettingsDraftFromConfig(baseConfig);this.config=buildConfigFromSettingsDraft(baseConfig,this.settingsDraft);this.config.theme=baseConfig.theme;this.config.cfMetrics=baseConfig.cfMetrics;this.cfSettingsDraft={...this.config.cfMetrics};}catch(_){const fallbackConfig={theme:'auto',...DEFAULT_SETTINGS_MODAL_CONFIG,redirectWhitelistEntries:[],redirectWhitelistDomains:[],tcping:cloneTcpingConfig(DEFAULT_TCPING_CONFIG),cfMetrics:{...DEFAULT_CF_METRICS_CONFIG}};this.settingsDraft=createSettingsDraftFromConfig(fallbackConfig);this.config=buildConfigFromSettingsDraft(fallbackConfig,this.settingsDraft);this.config.theme=fallbackConfig.theme;this.config.cfMetrics=fallbackConfig.cfMetrics;this.cfSettingsDraft={...this.config.cfMetrics};}},
    async requestNodeList(){const res=await fetch('/admin',{method:'POST',body:JSON.stringify({action:'list'})});if(res.status===401){location.reload();throw new Error('未登录');}const data=await res.json().catch(()=>({}));if(!res.ok||data.error)throw new Error(data.error||'加载节点列表失败');return data;},
    applyNodeListPayload(data,silent=false){const nextActivityMap=(data&&typeof data.nodeActivity==='object')?data.nodeActivity:{};const nextAvailable=data.nodeActivityAvailable===true;this.nodes=(data.nodes||[]).map(n=>this.normalizeNode(n));this.updateTags();this._lastNodeActivitySignature=this.getNodeActivitySignature(nextActivityMap);this.nodeActivityData={nodeActivityAvailable:nextAvailable,nodeActivity:nextActivityMap,generatedAt:data.generatedAt||''};if(!this.hasCfMetricsConfig()||(this.config.cfMetrics||{}).showCard===false){this.cancelInitialCfMetricsLoad();this.cfMetricsData=null;}this.renderList();this.renderCfCardSlot();if(!silent)this.toast('列表已更新');},
    cancelInitialCfMetricsLoad(){if(this.initialCfMetricsTimer){clearTimeout(this.initialCfMetricsTimer);this.initialCfMetricsTimer=null;}},
    scheduleInitialCfMetricsLoad(){this.cancelInitialCfMetricsLoad();if(!this.hasCfMetricsConfig()||(this.config.cfMetrics||{}).showCard===false)return;this.initialCfMetricsTimer=setTimeout(()=>{this.initialCfMetricsTimer=null;this.loadCfMetrics(true).catch(()=>{});},180);},
    async refresh(silent=false){if(this.refreshPromise)return this.refreshPromise;this.refreshPromise=(async()=>{try{const data=await this.requestNodeList();this.applyNodeListPayload(data,silent);}catch(e){this.toast('加载失败: '+e.message,'error');}finally{this.refreshPromise=null;}})();return this.refreshPromise;},
    median(values){const sorted=(Array.isArray(values)?values:[]).filter(value=>Number.isFinite(value)).slice().sort((a,b)=>a-b);if(!sorted.length)return null;const mid=Math.floor(sorted.length/2);return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;},
    getTimestampAgeMs(input,now=Date.now()){const ts=Date.parse(String(input||''));return Number.isFinite(ts)?Math.max(0,now-ts):Infinity;},
    isFreshTimestamp(input,windowMs,now=Date.now()){const ttl=Number(windowMs);return Number.isFinite(ttl)&&ttl>0&&this.getTimestampAgeMs(input,now)<ttl;},
    getClientRttTone(value){const medianMs=Number(value);if(!Number.isFinite(medianMs)||medianMs<0)return{className:'',label:'--'};if(medianMs<=80)return{className:'excellent',label:'优秀'};if(medianMs<=150)return{className:'normal',label:'一般'};return{className:'poor',label:'较差'};},
    updateClientRttPill(){const pill=document.getElementById('client-rtt-pill');const valueEl=document.getElementById('client-rtt-value');const refreshBtn=document.getElementById('client-rtt-refresh');if(!pill||!valueEl||!refreshBtn)return;const state=this.clientRtt||{};const medianMs=Number(state.medianMs);const hasMedian=Number.isFinite(medianMs)&&medianMs>=0;const isLoading=state.loading===true;const error=String(state.error||'').trim();const tone=this.getClientRttTone(medianMs);pill.classList.toggle('loading',isLoading);pill.classList.toggle('error',!isLoading&&!!error);refreshBtn.classList.toggle('loading',isLoading);refreshBtn.disabled=isLoading;valueEl.classList.remove('excellent','normal','poor');if(hasMedian&&tone.className)valueEl.classList.add(tone.className);valueEl.textContent=isLoading?'测量中...':hasMedian?(Math.round(medianMs)+'ms'):'--';refreshBtn.title=isLoading?'正在测量 RTT':'刷新 RTT';pill.title=isLoading?'正在测量当前浏览器到 Cloudflare 边缘的往返时延':hasMedian?('当前浏览器到 Cloudflare 边缘的往返时延，中位数 '+Math.round(medianMs)+'ms（'+tone.label+'；<=80ms 优秀，81-150ms 一般，>150ms 较差）'):(error?('RTT 测量失败：'+error):'当前浏览器到 Cloudflare 边缘的往返时延');},
    async measureClientRttSample(timeoutMs=4000){const startedAt=performance.now();const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),timeoutMs);try{const res=await fetch('/__client_rtt__?_='+(Date.now())+'-'+Math.random().toString(16).slice(2),{method:'GET',cache:'no-store',credentials:'same-origin',headers:{'Cache-Control':'no-cache','Pragma':'no-cache'},signal:controller.signal});try{res.body?.cancel?.();}catch(_){}if(!res.ok&&res.status!==204)throw new Error('probe failed');return performance.now()-startedAt;}finally{clearTimeout(timeout);}},
    async loadClientRtt(force=false){if(this.clientRttPromise)return this.clientRttPromise;if(!force&&this.isFreshTimestamp(this.clientRtt?.updatedAt,this._clientRttFreshWindowMs)){this.updateClientRttPill();return this.clientRtt;}if(force===true||!this.clientRtt.updatedAt){this.clientRtt={...(this.clientRtt||{}),loading:true,error:''};this.updateClientRttPill();}this.clientRttPromise=(async()=>{try{const samples=[];for(let i=0;i<3;i+=1){const sample=await this.measureClientRttSample();if(Number.isFinite(sample))samples.push(sample);}const medianMs=this.median(samples);if(medianMs==null)throw new Error('未获取到有效样本');this.clientRtt={loading:false,medianMs,error:'',updatedAt:new Date().toISOString()};}catch(e){this.clientRtt={...(this.clientRtt||{}),loading:false,error:e.message||'测量失败',updatedAt:this.clientRtt?.updatedAt||''};}finally{this.clientRttPromise=null;this.updateClientRttPill();}return this.clientRtt;})();return this.clientRttPromise;},
    async refreshClientRtt(event){event?.preventDefault?.();event?.stopPropagation?.();await this.loadClientRtt(true);},
    async refreshDashboard(silent=false){await Promise.all([this.refresh(silent),this.loadClientRtt(true)]);},
    updateTags(){this.tags.clear();this.nodeNames.clear();this.nodePaths.clear();this.nodes.forEach(n=>{const tag=String(n.tag||'').trim();if(tag)this.tags.add(tag);if(n.name)this.nodeNames.add(n.name);if(n.path)this.nodePaths.add(n.path);});this.tagCandidates=Array.from(this.tags).sort((a,b)=>a.localeCompare(b,'zh'));},
    getTcpingMetricClass(value, low, high){if(value==null||Number.isNaN(value))return'';if(value<low)return'metric-good';if(value>high)return'metric-bad';return'metric-mid';},
    makeCardDomId(path){return 'card-'+encodeURIComponent(String(path||'')).replace(/%/g,'_');},
    getNodeRecentUsageTimestamp(node){const ts=Date.parse(String(this.getNodeActivity(node?.path)?.lastSeenAt||''));return Number.isFinite(ts)?ts:0;},
    getSortedNodes(list=this.nodes){
        const source=Array.isArray(list)?list.slice():[];
        if(this.sortMode==='recent'){
            source.sort((a,b)=>{
                const leftTs=this.getNodeRecentUsageTimestamp(a);
                const rightTs=this.getNodeRecentUsageTimestamp(b);
                const leftPath=String(a?.path||'');
                const rightPath=String(b?.path||'');
                return rightTs-leftTs||leftPath.localeCompare(rightPath,'zh');
            });
            return source;
        }
        source.sort((a,b)=>{
            const leftPath=String(a?.path||'');
            const rightPath=String(b?.path||'');
            return leftPath.localeCompare(rightPath,'zh');
        });
        return source;
    },
    getNormalizedFilterText(value){return String(value||'').trim();},
    getFilteredNodes(query=this.filterText){const t=String(query||'').trim().toLowerCase();const source=!t?this.nodes:this.nodes.filter(n=>String(n.name||'').toLowerCase().includes(t)||String(n.path||'').toLowerCase().includes(t)||(n.tag&&String(n.tag).toLowerCase().includes(t)));return this.getSortedNodes(source);},
    getFilteredNodesResult(query=this.filterText){const filtered=this.getFilteredNodes(query);return{filtered,signature:filtered.map(n=>String(n.path||'')).join('')};},
    getFilterSignature(query=this.filterText){return this.getFilteredNodesResult(query).signature;},
    getTcpingCacheKey(target){return this.normalizeTarget(target)||'';},
    isTcpingResultFresh(entry,target,now=Date.now()){return !!entry&&!entry.loading&&entry.target===target&&Number.isFinite(entry.updatedAtMs)&&now-entry.updatedAtMs<this._tcpingFreshWindowMs;},
    getFreshTcpingResult(target,now=Date.now()){
        const normalizedTarget=this.getTcpingCacheKey(target);
        if(!normalizedTarget)return null;
        for(const entry of Object.values(this.tcpingCache||{})){
            if(this.isTcpingResultFresh(entry,normalizedTarget,now))return entry;
        }
        return null;
    },
    getNodeCardRenderSignature(n){
        const path=String(n?.path||'');
        const ping=this.tcpingCache[path]||{};
        const activity=this.getNodeActivity(path);
        const tcpCfg=this.config.tcping?.tcp||DEFAULT_TCPING_CONFIG.tcp;
        const headCfg=this.config.tcping?.head||DEFAULT_TCPING_CONFIG.head;
        const recentUsageText=this.nodeActivityRefreshingPath===path?'刷新中...':(activity?this.formatRecentUsageTime(activity.lastSeenAt):'未观看');
        return JSON.stringify({
            name:String(n?.name||''),
            path,
            tag:String(n?.tag||''),
            remark:String(n?.remark||''),
            targets:this.getNodeTargets(n),
            targetVisible:this.visibleTargets[path]===true,
            menuOpen:this.activeCardMenu===path,
            pingLoading:ping.loading===true,
            ipLocation:String(ping.ipLocation||''),
            edgeTcpMs:ping.edgeTcpMs??null,
            edgeHeadMs:ping.edgeHeadMs??null,
            headMode:String(ping.headMode||''),
            note:String(ping.note||''),
            recentUsageText,
            tcpLow:Number(tcpCfg.latencyWarnLow),
            tcpHigh:Number(tcpCfg.latencyWarnHigh),
            headLow:Number(headCfg.latencyWarnLow),
            headHigh:Number(headCfg.latencyWarnHigh)
        });
    },
    createNodeCardElement(n,signature=''){
        const tpl=document.createElement('template');
        tpl.innerHTML=this.renderNodeCard(n);
        const next=tpl.content.firstElementChild;
        if(!next)return null;
        next.dataset.cardPath=String(n?.path||'');
        next.dataset.renderSignature=String(signature||this.getNodeCardRenderSignature(n));
        return next;
    },
    syncRenderedNodeCards(container,filtered){
        const visiblePaths=new Set(filtered.map(node=>String(node?.path||'')).filter(Boolean));
        Array.from(container.querySelectorAll('.card[data-card-path]')).forEach(card=>{if(!visiblePaths.has(String(card.dataset.cardPath||'')))card.remove();});
        const resolveReferenceNode=node=>{if(!node)return null;const children=Array.from(container?.children||container?.childNodes||[]);return children.includes(node)?node:null;};
        let cursor=container.firstElementChild;
        filtered.forEach(node=>{
            const path=String(node?.path||'');
            if(!path)return;
            const signature=this.getNodeCardRenderSignature(node);
            let referenceNode=resolveReferenceNode(cursor);
            let element=document.getElementById(this.makeCardDomId(path));
            if(!element){
                element=this.createNodeCardElement(node,signature);
                if(!element)return;
                container.insertBefore(element,referenceNode);
            }else if(element.dataset.renderSignature!==signature){
                const previousElement=element;
                const next=this.createNodeCardElement(node,signature);
                if(next){
                    element.replaceWith(next);
                    element=next;
                    if(cursor===previousElement)cursor=element;
                    referenceNode=resolveReferenceNode(cursor);
                }
            }
            if(element&&element!==referenceNode)container.insertBefore(element,referenceNode);
            cursor=element?element.nextElementSibling:referenceNode;
        });
        while(cursor){
            const next=cursor.nextElementSibling;
            if(cursor.classList?.contains('card')||cursor.classList?.contains('empty-hint'))cursor.remove();
            cursor=next;
        }
    },
    getLatencyTooltip(kind,ping){if(ping.loading)return'测试中，稍后查看';if(kind==='tcp'){if(ping.edgeTcpMs!=null)return'';if(ping.edgeHeadMs!=null)return'TCP 未连通，检查端口/回源策略';return'目标暂不可达，检查源站与端口';}if(ping.edgeHeadMs!=null)return'';if(ping.edgeTcpMs!=null)return'HEAD/Range 探测失败，可提高超时后重试';return'目标暂不可达，检查源站后重试';},
    renderNodeCard(n){
        const targets=this.getNodeTargets(n);
        const primaryTarget=targets[0]||'';
        const safeName=this.escapeHtml(n.name);
        const safePath=this.escapeHtml(n.path||'');
        const safeTag=this.escapeHtml(n.tag||'');
        const safeRemark=this.escapeHtml(n.remark||'');
        const quotedPath=this.quoteJs(n.path);
        const targetVisible=!!this.visibleTargets[n.path];
        const targetText=targetVisible?this.escapeHtml(primaryTarget):'******';
        const targetTitle=targetVisible?this.escapeHtml(targets.join('\\n')):'已隐藏';
        const ping=this.tcpingCache[n.path]||{};
        const ipLocation=this.escapeHtml(ping.loading?'定位中...':(ping.ipLocation||'--'));
        const tcpCfg=this.config.tcping?.tcp||DEFAULT_TCPING_CONFIG.tcp;
        const headCfg=this.config.tcping?.head||DEFAULT_TCPING_CONFIG.head;
        const getMetric=(value,low,high,tooltip)=>{
            if(ping.loading||value==null||Number.isNaN(value))return '<div class="tcping-value metric"'+(tooltip?' title="'+this.escapeHtml(tooltip)+'"':'')+'>--</div>';
            const cls=this.getTcpingMetricClass(value,Number(low),Number(high));
            return '<div class="tcping-value metric '+cls+'"><span>'+this.escapeHtml(String(value))+'</span><span class="ms">ms</span></div>';
        };
        const tcpMetric=getMetric(ping.edgeTcpMs,tcpCfg.latencyWarnLow,tcpCfg.latencyWarnHigh,this.getLatencyTooltip('tcp',ping));
        const headMetric=getMetric(ping.edgeHeadMs,headCfg.latencyWarnLow,headCfg.latencyWarnHigh,this.getLatencyTooltip('head',ping));
        const noteText=!ping.loading?(ping.note||''):'';
        const noteHtml=noteText?'<div class="tcping-note">'+this.escapeHtml(noteText)+'</div>':'';
        const proxyUrl=this.escapeHtml(this.getProxyAddressParts(n,'custom').full);
        const activity=this.getNodeActivity(n.path);
        const recentUsageText=this.nodeActivityRefreshingPath===n.path?'刷新中...':(activity?this.formatRecentUsageTime(activity.lastSeenAt):'未观看');
        const recentUsageHtml='<button class="recent-usage-btn" type="button" onclick=\\'App.refreshNodeUsage('+quotedPath+',event)\\' '+(this.nodeActivityRefreshingPath===n.path?'disabled':'')+'><span class="recent-usage-text">'+this.escapeHtml(recentUsageText)+'</span></button>';
        return '<div class="card" id="'+this.makeCardDomId(n.path)+'"><div class="card-top"><div class="card-pills">'+(n.tag?'<span class="tag">'+safeTag+'</span>':'')+'</div><div class="card-tools">'+recentUsageHtml+'<div class="card-more"><button class="icon-btn" onclick=\\'App.toggleCardMenu('+quotedPath+')\\'>'+ICONS.more+'</button><div class="card-menu '+(this.activeCardMenu===n.path?'show':'')+'" id="menu-'+safePath+'"><button onclick=\\'App.editNode('+quotedPath+')\\'>'+ICONS.edit+'编辑</button><button onclick=\\'App.cloneNode('+quotedPath+')\\'>'+ICONS.clone+'克隆</button><button class="danger" onclick=\\'App.del('+quotedPath+')\\'>'+ICONS.trash+'删除</button></div></div></div></div><div class="name-row"><div class="card-name-group"><div class="card-name" title="'+safeName+'">'+safeName+'</div><button class="card-path-inline" type="button" title="点击复制 /'+safePath+'" onclick=\\'App.copyNodePath('+quotedPath+',event)\\'>/'+safePath+'</button></div>'+(safeRemark?'<div class="card-remark" title="'+safeRemark+'">'+safeRemark+'</div>':'')+'</div><div class="target-metrics"><div class="info-row target-row"><span class="info-label">目标地址</span><span class="info-val '+(targetVisible?'':'hidden-value')+'" title="'+targetTitle+'">'+targetText+'</span><button class="inline-icon-btn" onclick=\\'App.toggleVis('+quotedPath+')\\'>'+(targetVisible?ICONS.show:ICONS.hide)+'</button></div><div class="tcping-panel"><div class="tcping-cell"><div class="tcping-value">'+ipLocation+'</div><div class="tcping-label">IP位置</div></div><div class="tcping-cell">'+tcpMetric+'<div class="tcping-label">边缘TCP</div></div><div class="tcping-cell">'+headMetric+'<div class="tcping-label">边缘HEAD</div></div><button class="tcping-refresh align-right '+(ping.loading?'loading':'')+'" onclick=\\'App.runTcping('+quotedPath+')\\'>'+ICONS.refresh+'</button>'+noteHtml+'</div></div><div class="info-row"><span class="info-label">代理地址</span><span class="info-val" title="'+proxyUrl+'">'+proxyUrl+'</span><button class="inline-icon-btn" onclick=\\'App.openProxyDialog('+quotedPath+')\\'>'+ICONS.copy+'</button></div></div>';
    },
    updateNodeCard(path){const node=this.getNode(path);const targetEl=document.getElementById(this.makeCardDomId(path));if(!node){if(targetEl)targetEl.remove();return;}if(!targetEl){if(this.getFilteredNodes().some(item=>String(item?.path||'')===String(path||'')))this.renderList();return;}const signature=this.getNodeCardRenderSignature(node);if(targetEl.dataset.renderSignature===signature)return;const next=this.createNodeCardElement(node,signature);if(next)targetEl.replaceWith(next);},
    renderList(filteredNodes=null,signature=''){const container=document.getElementById('list-container');document.getElementById('node-count').innerText=this.nodes.length+' 个站点';const result=Array.isArray(filteredNodes)?{filtered:filteredNodes,signature:String(signature||filteredNodes.map(n=>String(n.path||'')).join(''))}:this.getFilteredNodesResult();const filtered=result.filtered;this._lastFilterSignature=result.signature;if(!filtered.length){container.innerHTML='<div class="empty-hint">暂无站点</div>';return;}if(container.querySelector('.empty-hint'))container.innerHTML='';this.syncRenderedNodeCards(container,filtered);},
    getCfCardRenderSignature(){const cfg=this.config.cfMetrics||{};const data=this.cfMetricsData||{};const metrics=data.metrics||{};return JSON.stringify({showCard:cfg.showCard!==false,hasConfig:this.hasCfMetricsConfig(),workerUrl:String(cfg.workerUrl||''),loading:data.loading===true,error:String(data.error||''),requests:metrics.requests||null,trafficSummary:metrics.trafficSummary||null,topPaths:Array.isArray(metrics.topPaths)?metrics.topPaths:[]});},
    renderCfCardSlot(){const container=document.getElementById('cf-card-container');if(!container)return;const cfCard=this.renderCfMetricsCard();if(!cfCard){container.innerHTML='';container.dataset.renderSignature='';return;}const signature=this.getCfCardRenderSignature();if(container.dataset.renderSignature===signature&&container.innerHTML===cfCard)return;container.innerHTML=cfCard;container.dataset.renderSignature=signature;},
    hasCfMetricsConfig(){const cfg=this.config.cfMetrics||{};return !!(cfg.accountId&&cfg.apiToken&&cfg.workerUrl);},
    formatCfMetricValue(value,unit=''){if(value==null||Number.isNaN(value))return '--';const num=Number(value);if(unit==='MB'){if(num>1024)return (num/1024).toFixed(2)+' GB';return num.toFixed(2)+' MB';}const base=unit==='ms'?num<10?num.toFixed(2):num<100?num.toFixed(1):Math.round(num).toString():Math.round(num).toString();if(unit==='ms'&&num>=1000)return (num/1000).toFixed(num>=10000?0:1)+'k ms';return unit?base+' '+unit:base;},
    formatCfDataSize(bytes){if(bytes==null||Number.isNaN(bytes))return '--';const value=Math.max(0,Number(bytes)||0);if(value>=1024*1024*1024)return (value/(1024*1024*1024)).toFixed(2)+' GB';if(value>=1024*1024)return (value/(1024*1024)).toFixed(2)+' MB';if(value>=1024)return (value/1024).toFixed(2)+' KB';return Math.round(value)+' B';},
    splitCfDisplayValue(raw){const text=String(raw||'--');const match=text.match(/^([0-9.,-]+)s*(.*)$/);return{major:match?match[1]:text,unit:match?match[2]:''};},
    formatCfTrend(change){if(change==null||Number.isNaN(change))return{label:'',className:''};const sign=change>=0?'↗':'↘';return{label:\`\${sign} \${Math.abs(change).toFixed(2)}%\`,className:change>=0?'':'down'};},
    formatRelativeTime(input){const ts=Date.parse(String(input||''));if(!Number.isFinite(ts))return'';const diff=Math.max(0,Date.now()-ts);const minute=60*1000;const hour=60*minute;const day=24*hour;if(diff<minute)return'刚刚';if(diff<hour)return Math.floor(diff/minute)+'分钟前';if(diff<day)return Math.floor(diff/hour)+'小时前';return Math.floor(diff/day)+'天前';},
    formatRecentUsageTime(input){const ts=Date.parse(String(input||''));if(!Number.isFinite(ts))return'未观看';const diff=Math.max(0,Date.now()-ts);const hour=60*60*1000;const day=24*hour;if(diff<day)return Math.max(1,Math.floor(diff/hour))+'小时前';return Math.max(1,Math.floor(diff/day))+'天前';},
    getNodeActivity(path){const source=this.nodeActivityData?.nodeActivity;if(!source||typeof source!=='object')return null;const key=String(path||'');const direct=source[key];if(direct&&direct.lastSeenAt)return direct;const lower=key.toLowerCase();for(const [k,v] of Object.entries(source)){if(String(k).toLowerCase()===lower&&v?.lastSeenAt)return v;}return null;},
    renderCfPrimarySummaryRow(requestMetric,trafficMetric){
        const renderMetric=(label,valueText,changeValue,tone='')=>{
            const parts=this.splitCfDisplayValue(valueText);
            const trend=this.formatCfTrend(changeValue);
            const itemClass=tone?\`cf-primary-item \${tone}\`:'cf-primary-item';
            return \`<div class="\${itemClass}"><div class="cf-metric-top"><div class="cf-value"><strong>\${this.escapeHtml(parts.major)}</strong>\${parts.unit?\`<span class="cf-unit">\${this.escapeHtml(parts.unit)}</span>\`:''}</div>\${trend.label?\`<span class="cf-change \${trend.className}">\${this.escapeHtml(trend.label)}</span>\`:''}</div><div class="cf-label">\${this.escapeHtml(label)}</div></div>\`;
        };
        return \`<div class="cf-row cf-primary-row"><div class="cf-primary-grid">\${renderMetric('站点流量',this.formatCfDataSize(trafficMetric?.totalBytes),trafficMetric?.totalChange,'traffic')}\${renderMetric('请求数',this.formatCfMetricValue(requestMetric?.value,requestMetric?.unit||''),requestMetric?.change,'requests')}</div></div>\`;
    },
    renderCfTopPaths(paths){
        const rows=(Array.isArray(paths)?paths:[]).slice(0,10);
        if(!rows.length)return'';
        const renderItems=list=>list.map(item=>\`<div class="cf-top-item"><span class="cf-top-rank">\${this.escapeHtml(String(item.rank||0))}.</span><span class="cf-top-path" title="\${this.escapeHtml(item.path||'/')}">\${this.escapeHtml(item.path||'/')}</span><span class="cf-top-stats"><span class="cf-top-meta">\${this.escapeHtml(String(item.requests||0))} 次</span><span class="cf-top-size">\${this.escapeHtml(this.formatCfDataSize(item.bytes))}</span></span></div>\`).join('');
        if(rows.length<=2)return \`<div class="cf-top-paths"><div class="cf-top-title">Top10</div><div class="cf-top-scroll"><div class="cf-top-marquee static">\${renderItems(rows)}</div></div></div>\`;
        const rowHeight=24;
        const rowGap=6;
        const distance=rows.length*(rowHeight+rowGap);
        const duration=Math.max(rows.length*2.2,12).toFixed(1);
        const items=renderItems(rows);
        return \`<div class="cf-top-paths"><div class="cf-top-title">Top10</div><div class="cf-top-scroll"><div class="cf-top-marquee" style="--cf-top-scroll-distance:\${distance}px;--cf-top-scroll-duration:\${duration}s">\${items}\${items}</div></div></div>\`;
    },
    renderCfMetricsCard(){const cfg=this.config.cfMetrics||{};if(cfg.showCard===false||!this.hasCfMetricsConfig())return'';const data=this.cfMetricsData||{};const metrics=data.metrics||{};const hasError=!!data.error;const hasMetrics=!!(metrics.requests||metrics.trafficSummary);const topPathsHtml=this.renderCfTopPaths(metrics.topPaths);return \`<div class="card cf-card"><div class="cf-card-header"><div class="cf-card-title"><span class="cf-title-text">CF指标</span><span class="cf-range-pill">近24小时</span></div><div class="cf-card-actions"><button class="icon-btn \${data.loading?'loading':''}" onclick="App.refreshCfMetrics()">\${ICONS.refresh}</button><a href="\${this.escapeHtml((this.config.cfMetrics||{}).workerUrl||'#')}" target="_blank" rel="noopener noreferrer" class="icon-btn">\${ICONS.external}</a></div></div>\${hasError?\`<div class="cf-empty">\${this.escapeHtml(data.error)}</div>\`:hasMetrics?\`<div class="cf-stack">\${this.renderCfPrimarySummaryRow(metrics.requests,metrics.trafficSummary)}\${topPathsHtml}</div>\`:\`<div class="cf-empty">\${data.loading?'加载中...':'暂无指标数据'}</div>\`}</div>\`;},
    async loadCfMetrics(force=false){if(!this.hasCfMetricsConfig()){this.cfMetricsData=null;this.renderCfCardSlot();this.syncCfAutoRefresh();return null;}if((this.config.cfMetrics||{}).showCard===false){this.renderCfCardSlot();this.syncCfAutoRefresh();return this.cfMetricsData;}if(!force&&document.visibilityState==='hidden')return this.cfMetricsData;if(!force&&this.isFreshTimestamp(this.cfMetricsData?.updatedAt||this.cfMetricsData?.generatedAt,this._cfMetricsFreshWindowMs))return this.cfMetricsData;if(this.cfMetricsData?.loading&&!force)return this.cfMetricsData;this.cfMetricsData={...(this.cfMetricsData||{}),loading:true,error:''};this.renderCfCardSlot();try{const res=await fetch('/admin',{method:'POST',body:JSON.stringify({action:'cfMetrics',rangeKey:'24h',mode:'full'})});const data=await res.json();if(!res.ok)throw new Error(data.error||'CF指标加载失败');this.cfMetricsData={...data,loading:false,updatedAt:data.updatedAt||new Date().toISOString()};}catch(e){this.cfMetricsData={enabled:true,loading:false,error:e.message||'CF指标加载失败',metrics:this.cfMetricsData?.metrics||null,bandwidthHint:'',domainTrafficHint:'',playbackHint:'',recentDomainsHint:'',updatedAt:this.cfMetricsData?.updatedAt||''};}this.renderCfCardSlot();return this.cfMetricsData;},
    getNodeActivitySignature(map){if(!map||typeof map!=='object')return'';const entries=Object.entries(map).map(([k,v])=>[String(k),String(v?.lastSeenAt||''),Number(v?.requests)||0]).sort((a,b)=>a[0].localeCompare(b[0],'zh'));return JSON.stringify(entries);},
    getChangedNodeActivityPaths(previousMap,nextMap){const allKeys=new Set([...Object.keys(previousMap||{}),...Object.keys(nextMap||{})]);return Array.from(allKeys).filter(key=>{const prev=previousMap?.[key];const next=nextMap?.[key];return String(prev?.lastSeenAt||'')!==String(next?.lastSeenAt||'')||(Number(prev?.requests)||0)!==(Number(next?.requests)||0);});},
    async loadNodeActivity(force=false){if(!force&&document.visibilityState==='hidden')return this.nodeActivityData?.nodeActivity||null;if(!force&&this.isFreshTimestamp(this.nodeActivityData?.generatedAt,this._nodeActivityFreshWindowMs))return this.nodeActivityData?.nodeActivity||null;if(this.nodeActivityLoading&&!force)return this.nodeActivityData?.nodeActivity||null;this.nodeActivityLoading=true;try{const res=await fetch('/admin',{method:'POST',body:JSON.stringify({action:'cfMetrics',rangeKey:'24h',mode:'activity'})});const data=await res.json();if(!res.ok)throw new Error(data.error||'节点活跃数据加载失败');const nextMap=(data&&typeof data.nodeActivity==='object')?data.nodeActivity:{};const nextSig=this.getNodeActivitySignature(nextMap);const nextAvailable=data.nodeActivityAvailable===true;const hasLocalMap=this.nodeActivityData&&typeof this.nodeActivityData.nodeActivity==='object';const prevAvailable=this.nodeActivityData?.nodeActivityAvailable===true;const previousMap=hasLocalMap?this.nodeActivityData.nodeActivity:{};const changedPaths=this.getChangedNodeActivityPaths(previousMap,nextMap);if(nextSig!==this._lastNodeActivitySignature||!hasLocalMap||prevAvailable!==nextAvailable){this._lastNodeActivitySignature=nextSig;this.nodeActivityData={nodeActivityAvailable:nextAvailable,nodeActivity:nextMap,generatedAt:data.generatedAt||''};if(this.sortMode==='recent'){this.renderList();return nextMap;}if(!hasLocalMap||prevAvailable!==nextAvailable){this.renderList();return nextMap;}changedPaths.forEach(path=>this.updateNodeCard(path));}return nextMap;}catch(_){return null;}finally{this.nodeActivityLoading=false;}},
    async refreshNodeUsage(path,event){event?.preventDefault?.();event?.stopPropagation?.();if(!path||this.nodeActivityRefreshingPath===path)return;this.nodeActivityRefreshingPath=path;this.updateNodeCard(path);try{await this.loadNodeActivity(true);}finally{this.nodeActivityRefreshingPath='';this.updateNodeCard(path);}},
    copyNodePath(path,event){event?.preventDefault?.();event?.stopPropagation?.();if(!path)return;this.copy('/'+String(path||''));},
    async refreshCfMetrics(){await this.loadCfMetrics(true);},
    syncCfAutoRefresh(){clearInterval(this.cfAutoRefreshTimer);this.cfAutoRefreshTimer=null;const cfg=this.config.cfMetrics||{};const seconds=Math.max(30,Math.min(3600,Number(cfg.autoRefreshSeconds)||300));if(cfg.showCard!==false&&this.hasCfMetricsConfig())this.cfAutoRefreshTimer=setInterval(()=>{if(document.visibilityState==='hidden')return;this.loadCfMetrics(false);},seconds*1000);},
    syncNodeActivityAutoRefresh(){
        clearInterval(this.nodeActivityRefreshTimer);
        this.nodeActivityRefreshTimer=null;
        const seconds=Math.max(30,Number(NODE_ACTIVITY_REFRESH_SECONDS)||300);
        this.nodeActivityRefreshTimer=setInterval(()=>{if(document.visibilityState==='hidden')return;this.loadNodeActivity(false);},seconds*1000);
    },
    updateSearchState(){const wrapper=document.querySelector('.toolbar-search');const hasValue=!!this.filterText;wrapper.classList.toggle('has-value',hasValue);document.getElementById('search-clear').classList.toggle('show',hasValue);},
    filter(val){clearTimeout(this._filterTimeout);this._filterTimeout=setTimeout(()=>{const next=this.getNormalizedFilterText(val);if(next===this.filterText){this.updateSearchState();return;}const result=this.getFilteredNodesResult(next);this.filterText=next;this.updateSearchState();if(result.signature!==this._lastFilterSignature)this.renderList(result.filtered,result.signature);},120);},
    clearSearch(){const input=document.getElementById('search-input');if(input)input.value='';const next='';if(next===this.filterText){this.updateSearchState();input?.focus();return;}const result=this.getFilteredNodesResult(next);this.filterText=next;this.updateSearchState();if(result.signature!==this._lastFilterSignature)this.renderList(result.filtered,result.signature);input?.focus();},
    syncSortMenu(){const pathBtn=document.getElementById('menu-sort-path');const recentBtn=document.getElementById('menu-sort-recent');pathBtn?.classList.toggle('active',this.sortMode==='path');recentBtn?.classList.toggle('active',this.sortMode==='recent');},
    setSortMode(mode,event){event?.stopPropagation?.();const next=mode==='recent'?'recent':'path';if(this.sortMode!==next){this.sortMode=next;this.renderList();}this.syncSortMenu();},
    toggleMenu(){document.getElementById('main-menu').classList.toggle('show');this.syncSortMenu();},
    openCfSettingsModal(){this.cfSettingsDraft={...DEFAULT_CF_METRICS_CONFIG,...(this.config.cfMetrics||{})};this.cfDns=this.createDefaultCfDnsState();this.renderCfSettingsModal();document.getElementById('main-menu').classList.remove('show');document.getElementById('cf-settings-mask').style.display='flex';this.resetModalScrollPositions('cf-settings-mask','cf-settings-modal');this.syncModalScrollLock();setTimeout(()=>document.getElementById('cf-settings-modal').classList.add('show'),10);this.loadCurrentPreferredRecords(false).catch(()=>{});},
    closeCfSettingsModal(){clearTimeout(this.cfDns.lookupTimer);this.cfDns.lookupSeq=Number(this.cfDns.lookupSeq||0)+1;document.getElementById('cf-settings-modal').classList.remove('show');setTimeout(()=>{document.getElementById('cf-settings-mask').style.display='none';this.syncModalScrollLock();},180);},
    openConfigManageModal(){this.configManage.includeAll=false;const checkbox=document.getElementById('config-manage-include-all');if(checkbox)checkbox.checked=false;document.getElementById('main-menu').classList.remove('show');document.getElementById('config-manage-mask').style.display='flex';this.resetModalScrollPositions('config-manage-mask','config-manage-modal');this.syncModalScrollLock();setTimeout(()=>document.getElementById('config-manage-modal').classList.add('show'),10);},
    closeConfigManageModal(){document.getElementById('config-manage-modal').classList.remove('show');setTimeout(()=>{document.getElementById('config-manage-mask').style.display='none';this.syncModalScrollLock();},180);},
    setConfigManageIncludeAll(checked){this.configManage.includeAll=checked===true;},
    getConfigExportStamp(){const now=new Date();const pad=value=>String(value).padStart(2,'0');return String(now.getFullYear())+pad(now.getMonth()+1)+pad(now.getDate())+'-'+pad(now.getHours())+pad(now.getMinutes())+pad(now.getSeconds());},
    getConfigExportFilename(includeAll=false){const suffix=includeAll?'all':'site';return this.getConfigExportStamp()+'-'+suffix+'.json';},
    buildConfigExportPayload(includeAll=false){const nodes=(Array.isArray(this.nodes)?this.nodes:[]).map(item=>this.normalizeNode(item));if(!includeAll)return nodes;return{type:'emby-mate-all-config',exportedAt:new Date().toISOString(),nodes,config:JSON.parse(JSON.stringify(this.config||{}))};},
    async exportConfigBundle(){const includeAll=this.configManage.includeAll===true;const blob=new Blob([JSON.stringify(this.buildConfigExportPayload(includeAll),null,2)],{type:'application/json'});const link=document.createElement('a');const objectUrl=URL.createObjectURL(blob);link.href=objectUrl;link.download=this.getConfigExportFilename(includeAll);link.click();setTimeout(()=>URL.revokeObjectURL(objectUrl),0);this.closeConfigManageModal();},
    triggerConfigImport(){document.getElementById('file-in')?.click();},
    normalizeImportedNodes(list){return(Array.isArray(list)?list:[]).map(item=>this.normalizeNode({name:String(item?.name||'').trim(),path:String(item?.path||item?.secret||item?.name||'').trim(),targets:item?.targets,target:item?.target,lines:item?.lines,activeLineId:item?.activeLineId,headers:item?.headers,remark:String(item?.remark||'').trim(),tag:String(item?.tag||'').trim(),redirectWhitelistEnabled:item?.redirectWhitelistEnabled===true,realClientIpMode:item?.realClientIpMode})).filter(item=>item.name&&item.path&&item.target);},
    parseImportedPayload(raw){if(Array.isArray(raw))return{nodes:this.normalizeImportedNodes(raw),config:null};if(raw&&typeof raw==='object')return{nodes:this.normalizeImportedNodes(raw.nodes),config:raw.config&&typeof raw.config==='object'&&!Array.isArray(raw.config)?raw.config:null};throw new Error('配置文件格式错误');},
    toggleTheme(){const current=document.documentElement.className==='dark'?'dark':'light';this.setTheme(current==='dark'?'light':'dark');},
    syncThemeButtons(finalTheme){const themeIcon=finalTheme==='dark'?ICONS.sun:ICONS.moon;const btn=document.getElementById('theme-btn');if(btn)btn.innerHTML=themeIcon;const menuBtn=document.getElementById('theme-menu-btn');if(menuBtn)menuBtn.innerHTML=themeIcon+' 主题切换';},
    setTheme(theme){const finalTheme=theme==='auto'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):theme;document.documentElement.className=finalTheme;localStorage.setItem('theme',theme);this.config.theme=theme;this.syncThemeButtons(finalTheme);},
    showTagSuggestions(){const input=document.getElementById('in-tag');if(!input)return;this.renderTags(input.value||'');},
    renderTags(filter=''){const list=document.getElementById('tag-list');const key=String(filter||'').toLowerCase().trim();const source=Array.from(this.tags).sort((a,b)=>a.localeCompare(b,'zh'));const match=source.filter(t=>String(t).toLowerCase().includes(key));if(!match.length){list.classList.remove('show');list.innerHTML='';return;}this.tagCandidates=match;list.innerHTML=match.map((t,idx)=>\`<div class="dropdown-item" data-index="\${idx}" onmousedown="App.selectTagByIndex(\${idx});return false;">\${this.escapeHtml(t)}</div>\`).join('');list.classList.add('show');},
    filterTags(val){this.renderTags(val);},
    selectTagByIndex(index){const idx=Number(index);if(!Number.isInteger(idx)||idx<0||idx>=this.tagCandidates.length)return;document.getElementById('in-tag').value=this.tagCandidates[idx];document.getElementById('tag-list').classList.remove('show');},
    selectTag(tag){document.getElementById('in-tag').value=tag;document.getElementById('tag-list').classList.remove('show');},
    getPrewarmDepthOptions(){return[{value:'poster',label:'仅预热海报'},{value:'poster_manifest',label:'海报 + 索引'}];},
    getPrewarmDepthLabel(value){const normalized=normalizePrewarmDepth(value);return(this.getPrewarmDepthOptions().find(item=>item.value===normalized)||this.getPrewarmDepthOptions()[1]).label;},
    syncPrewarmDepthMenu(){const hiddenInput=document.getElementById('settings-prewarm-depth');const labelInput=document.getElementById('settings-prewarm-depth-label');const menu=document.getElementById('settings-prewarm-depth-menu');if(!hiddenInput||!labelInput||!menu)return;const normalized=normalizePrewarmDepth(this.settingsDraft.prewarmDepth);this.settingsDraft.prewarmDepth=normalized;hiddenInput.value=normalized;labelInput.value=this.getPrewarmDepthLabel(normalized);menu.innerHTML=this.getPrewarmDepthOptions().map(item=>\`<div class="dropdown-item \${item.value===normalized?'active':''}" onmousedown="App.selectPrewarmDepth('\${item.value}',event);return false;">\${this.escapeHtml(item.label)}</div>\`).join('');},
    togglePrewarmDepthMenu(event){event?.preventDefault?.();event?.stopPropagation?.();document.getElementById('settings-prewarm-depth-menu')?.classList.toggle('show');},
    selectPrewarmDepth(value,event){event?.preventDefault?.();event?.stopPropagation?.();this.updateSettingsValue('prewarmDepth',value);document.getElementById('settings-prewarm-depth-menu')?.classList.remove('show');},
    syncSettingsAdvancedToggle(){const button=document.getElementById('settings-advanced-toggle');const sections=document.getElementById('settings-advanced-sections');if(!button||!sections)return;button.classList.toggle('open',this.settingsAdvancedOpen===true);button.setAttribute('aria-expanded',this.settingsAdvancedOpen===true?'true':'false');sections.classList.toggle('hidden',this.settingsAdvancedOpen!==true);if(this.settingsAdvancedOpen!==true)document.getElementById('settings-prewarm-depth-menu')?.classList.remove('show');},
    toggleSettingsAdvanced(event){event?.preventDefault?.();event?.stopPropagation?.();this.settingsAdvancedOpen=this.settingsAdvancedOpen!==true;this.syncSettingsAdvancedToggle();},
    setRedirectWhitelistEnabled(enabled){const on=!!enabled;document.getElementById('in-redirect-whitelist-enabled').value=on?'1':'0';const sw=document.getElementById('in-redirect-whitelist-switch');const text=document.getElementById('in-redirect-whitelist-text');sw?.classList.toggle('on',on);sw?.setAttribute('aria-pressed',on?'true':'false');if(text){text.textContent=on?'开启':'关闭';text.classList.toggle('on',on);text.classList.toggle('off',!on);}},
    setRealClientIpMode(mode,event){event?.preventDefault?.();event?.stopPropagation?.();const normalized=this.normalizeRealClientIpMode(mode);const input=document.getElementById('in-real-client-ip-mode');const list=document.getElementById('real-client-ip-mode-list');if(input)input.value=normalized;list?.querySelectorAll?.('button[data-real-client-ip-mode]')?.forEach?.(button=>{const active=button.getAttribute('data-real-client-ip-mode')===normalized;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active?'true':'false');});},
    setSettingsSwitch(switchId,textId,enabled){const on=enabled===true;const sw=document.getElementById(switchId);const text=document.getElementById(textId);sw?.classList.toggle('on',on);sw?.setAttribute('aria-pressed',on?'true':'false');if(text){text.textContent=on?'开启':'关闭';text.classList.toggle('on',on);text.classList.toggle('off',!on);}},
    syncModalScrollLock(){const openMaskIds=['modal-mask','proxy-mask','settings-mask','cf-settings-mask','config-manage-mask'];const shouldLock=openMaskIds.some(id=>document.getElementById(id)?.style.display==='flex');if(shouldLock&&!this.modalScrollLocked){this.modalScrollTop=window.scrollY||window.pageYOffset||0;this.modalScrollLocked=true;document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';document.body.style.position='fixed';document.body.style.top='-'+this.modalScrollTop+'px';document.body.style.left='0';document.body.style.right='0';document.body.style.width='100%';}else if(!shouldLock&&this.modalScrollLocked){const scrollTop=this.modalScrollTop||0;this.modalScrollLocked=false;document.documentElement.style.overflow='';document.body.style.overflow='';document.body.style.position='';document.body.style.top='';document.body.style.left='';document.body.style.right='';document.body.style.width='';window.scrollTo(0,scrollTop);}},
    resetModalScrollPositions(maskId,modalId){const mask=document.getElementById(maskId);const modal=document.getElementById(modalId);if(mask)mask.scrollTop=0;if(modal){modal.scrollTop=0;modal.querySelectorAll?.('.modal-content').forEach?.(node=>{node.scrollTop=0;});}},
    getOpenModalCloseAction(){const modalActions=[['config-manage-mask',()=>this.closeConfigManageModal()],['cf-settings-mask',()=>this.closeCfSettingsModal()],['settings-mask',()=>this.closeSettingsModal()],['proxy-mask',()=>this.closeProxyDialog()],['modal-mask',()=>this.closeModal()]];for(const [maskId,close] of modalActions){if(document.getElementById(maskId)?.style.display==='flex')return close;}return null;},
    handleGlobalKeydown(event){if(event.key!=='Escape')return;const closeAction=this.getOpenModalCloseAction();if(!closeAction)return;event.preventDefault();closeAction();},
    /* openModal(nodePath=null){document.getElementById('in-path').value=node?.path||'';} */
    openModal(nodeName=null){const nodePath=nodeName;const found=nodePath?this.nodes.find(item=>item.path===nodePath):null;const node=found?this.normalizeNode(found):null;this.editing=node?node.path:null;this.editingActiveLineId=node?.activeLineId||'';this.setNodePathTouched(!!node);document.getElementById('modal-title').innerText=node?'编辑站点':'新建站点';document.getElementById('in-name').value=node?.name||'';document.getElementById('in-path').value=node?.path||'';document.getElementById('in-remark').value=node?.remark||'';document.getElementById('in-tag').value=node?.tag||'';this.setTargetDraft(node?.lines?.length?node.lines:(node?.targets||['']));this.setRedirectWhitelistEnabled(node?.redirectWhitelistEnabled===true);this.setNodeHeaderDraft(node?.headers);this.setNodeHeadersEnabled(Object.keys(node?.headers||{}).length>0);this.setRealClientIpMode(node?.realClientIpMode||'forward');document.getElementById('modal-mask').style.display='flex';this.resetModalScrollPositions('modal-mask','modal');this.syncModalScrollLock();setTimeout(()=>document.getElementById('modal').classList.add('show'),10);},
    editNode(path){this.closeCardMenus();this.openModal(path);},
    closeModal(){document.getElementById('modal').classList.remove('show');setTimeout(()=>{document.getElementById('modal-mask').style.display='none';this.syncModalScrollLock();},180);},
    async saveNode(){const oldNodes=[...this.nodes];const editingPath=this.editing;try{const name=document.getElementById('in-name').value.trim();const path=document.getElementById('in-path').value.trim();const normalizedPath=this.normalizeNodePathValue(path);document.getElementById('in-path').value=normalizedPath;const remark=document.getElementById('in-remark').value.trim();const tag=document.getElementById('in-tag').value.trim();const rawLines=this.getDraftTargetEntries().map((item,index)=>this.normalizeLineDraftEntry(item,index));const rawTargets=rawLines.map(item=>item.target);const invalidTarget=rawTargets.find(item=>String(item||'').trim()&&!this.normalizeTarget(item));const targets=this.normalizeTargetList(rawTargets);const headerPairs=this.collectNodeHeaderEntries();const redirectWhitelistEnabled=document.getElementById('in-redirect-whitelist-enabled').value==='1';const realClientIpMode=this.normalizeRealClientIpMode(document.getElementById('in-real-client-ip-mode').value);if(!name||!normalizedPath||!targets.length)return this.toast('请填写必填项','error');if(invalidTarget)return this.toast('目标地址格式错误，必须以 http:// 或 https:// 开头','error');if((!editingPath||editingPath!==normalizedPath)&&this.nodePaths.has(path))return this.toast('已存在相同路径的节点','error');if(path!==normalizedPath&&(!editingPath||editingPath!==normalizedPath)&&this.nodePaths.has(normalizedPath))return this.toast('已存在相同路径的节点','error');const nextActiveLineId=String(rawLines.find(item=>this.normalizeTarget(item.target))?.id||this.editingActiveLineId||'').trim();const newNode=this.normalizeNode({name,path:normalizedPath,remark,tag,target:targets[0],targets,lines:rawLines,activeLineId:nextActiveLineId,headers:headerPairs,redirectWhitelistEnabled,realClientIpMode});const response=await fetch('/admin',{method:'POST',body:JSON.stringify({action:'save',editing:editingPath,...newNode})});if(!response.ok){const error=await response.json();throw new Error(error.error||'保存失败');}if(editingPath&&editingPath!==normalizedPath)this.nodes=this.nodes.filter(n=>n.path!==editingPath);const idx=this.nodes.findIndex(n=>n.path===normalizedPath);if(idx>-1)this.nodes[idx]=newNode;else this.nodes.push(newNode);this.nodes=this.nodes.map(node=>this.normalizeNode(node));this.updateTags();try{this.renderList();}catch(renderError){console.error('saveNode renderList failed',renderError);this.refresh(true).catch(()=>{});}this.closeModal();this.toast('保存成功');}catch(e){this.nodes=oldNodes;this.updateTags();try{this.renderList();}catch(renderError){console.error('saveNode rollback renderList failed',renderError);}this.toast(e.message||'保存失败','error');}},
    toggleVis(path){this.visibleTargets[path]=!this.visibleTargets[path];this.updateNodeCard(path);},
    closeCardMenus(){const prev=this.activeCardMenu;this.activeCardMenu=null;if(prev)this.updateNodeCard(prev);},
    toggleCardMenu(path){const prev=this.activeCardMenu;const next=this.activeCardMenu===path?null:path;this.activeCardMenu=next;if(prev&&prev!==next)this.updateNodeCard(prev);if(next)this.updateNodeCard(next);},
    generateCloneName(baseName){let i=2;let candidate=baseName+i;while(this.nodeNames.has(candidate))i+=1,candidate=baseName+i;return candidate;},
    generateClonePath(basePath){let i=2;let candidate=\`\${String(basePath||'')}-\${i}\`;while(this.nodePaths.has(candidate))i+=1,candidate=\`\${String(basePath||'')}-\${i}\`;return candidate;},
    async cloneNode(path){const found=this.nodes.find(n=>n.path===path);const source=found?this.normalizeNode(found):null;if(!source)return;const cloned={...source,name:this.generateCloneName(source.name),path:this.generateClonePath(source.path),targets:[...(source.targets||[])],target:this.getPrimaryTarget(source),headers:{...(source.headers||{})}};this.closeCardMenus();const oldNodes=[...this.nodes];try{this.nodes.push(cloned);this.nodes=this.nodes.map(node=>this.normalizeNode(node));this.updateTags();this.renderList();const res=await fetch('/admin',{method:'POST',body:JSON.stringify({action:'save',...cloned})});if(!res.ok){const error=await res.json();throw new Error(error.error||'克隆失败');}this.toast('克隆成功');}catch(e){this.nodes=oldNodes;this.updateTags();this.renderList();this.toast(e.message||'克隆失败','error');}},
    async del(path){if(!confirm('确定要删除此节点吗？'))return;const oldNodes=[...this.nodes];try{this.nodes=this.nodes.filter(n=>n.path!==path);this.updateTags();this.renderList();const res=await fetch('/admin',{method:'POST',body:JSON.stringify({action:'delete',path})});if(!res.ok)throw new Error('删除失败');this.toast('删除成功','warning');}catch(_){this.nodes=oldNodes;this.updateTags();this.renderList();this.toast('删除失败','error');}},
    getNode(path){return this.nodes.find(item=>item.path===path);},
    async runTcping(path){
        const node=this.getNode(path);
        if(!node)return;
        const target=this.getTcpingCacheKey(this.getPrimaryTarget(node));
        if(!target)return;
        if(this.tcpingCache[path]?.loading)return;
        const now=Date.now();
        const fresh=this.getFreshTcpingResult(target,now);
        if(fresh){
            this.tcpingCache[path]={...fresh,loading:false,target,updatedAtMs:fresh.updatedAtMs||now};
            this.updateNodeCard(path);
            return;
        }
        const cacheKey=this.getTcpingCacheKey(target);
        const shared=this._tcpingRequestsByTarget[cacheKey];
        if(shared){
            this.tcpingCache[path]={...(this.tcpingCache[path]||{}),loading:true,target};
            this.updateNodeCard(path);
            try{
                const data=await shared;
                this.tcpingCache[path]={...data,loading:false,target,updatedAtMs:Date.now()};
            }catch(_){
                this.tcpingCache[path]={
                    loading:false,
                    ipLocation:'未知',
                    edgeTcpMs:null,
                    edgeHeadMs:null,
                    headMode:'none',
                    source:'failed',
                    note:'延迟测试失败',
                    target,
                    updatedAtMs:Date.now()
                };
            }
            this.updateNodeCard(path);
            return;
        }
        this.tcpingCache[path]={...(this.tcpingCache[path]||{}),loading:true,target};
        this.updateNodeCard(path);
        const requestPromise=(async()=>{
            const res=await fetch('/admin',{method:'POST',body:JSON.stringify({action:'tcping',target,force:true})});
            const data=await res.json();
            return {
                ipLocation:data.ipLocation||'未知',
                edgeTcpMs:data.edgeTcpMs??data.edgeMs??null,
                edgeHeadMs:data.edgeHeadMs??null,
                headMode:data.headMode||'none',
                source:data.source||'unknown',
                note:data.note||''
            };
        })();
        this._tcpingRequestsByTarget[cacheKey]=requestPromise;
        try{
            const data=await requestPromise;
            this.tcpingCache[path]={
                loading:false,
                ...data,
                target,
                updatedAtMs:Date.now()
            };
        }catch(_){
            this.tcpingCache[path]={
                loading:false,
                ipLocation:'未知',
                edgeTcpMs:null,
                edgeHeadMs:null,
                headMode:'none',
                source:'failed',
                note:'延迟测试失败',
                target,
                updatedAtMs:Date.now()
            };
        }finally{
            if(this._tcpingRequestsByTarget[cacheKey]===requestPromise)delete this._tcpingRequestsByTarget[cacheKey];
        }
        this.updateNodeCard(path);
    },
    getProxyModeOptions(){return [{key:'custom',name:'Cloudflare'},...(this.config.thirdPartyProxies||[]).map(item=>({key:item.id,name:item.name,url:item.url}))];},
    getProxyAddressParts(node,modeKey){if(modeKey==='custom'){const path='/' + String(node.path||'');return {full:location.origin+path,base:location.origin,path};}const proxy=(this.config.thirdPartyProxies||[]).find(item=>item.id===modeKey);const base=(proxy?.url||'').replace(/\\/$/,'');const target=this.getPrimaryTarget(node);return {full:base?base+'/'+target:target,base,path:target};},
    openProxyDialog(name){const path=name;this.proxyDialogNode=this.getNode(path);if(!this.proxyDialogNode)return;this.proxyMode='custom';this.renderProxyDialog();document.getElementById('proxy-mask').style.display='flex';this.resetModalScrollPositions('proxy-mask','proxy-modal');this.syncModalScrollLock();setTimeout(()=>document.getElementById('proxy-modal').classList.add('show'),10);},
    closeProxyDialog(){document.getElementById('proxy-modal').classList.remove('show');setTimeout(()=>{document.getElementById('proxy-mask').style.display='none';this.syncModalScrollLock();},180);},
    renderProxyDialog(){const node=this.proxyDialogNode;if(!node)return;const modeList=document.getElementById('proxy-mode-list');modeList.innerHTML=this.getProxyModeOptions().map(item=>\`<button class="\${this.proxyMode===item.key?'active':''}" onclick="App.selectProxyMode('\${item.key}')">\${this.escapeHtml(item.name)}</button>\`).join('');const parts=this.getProxyAddressParts(node,this.proxyMode);document.getElementById('proxy-address-list').innerHTML=[['完整地址',parts.full],['反代地址',parts.base],['反代路径',parts.path]].map(([label,val])=>\`<div class="proxy-line proxy-clickable" onclick='App.copy(\${this.quoteJs(val)})'><strong>\${label}</strong><div class="val" title="\${this.escapeHtml(val)}">\${this.escapeHtml(val)}</div><button class="link-btn" onclick='event.stopPropagation();App.copy(\${this.quoteJs(val)})'>点击复制</button></div>\`).join('');},
    selectProxyMode(mode){this.proxyMode=mode;this.renderProxyDialog();},
    openSettingsModal(){this.settingsDraft=createSettingsDraftFromConfig(this.config);this.settingsAdvancedOpen=false;this.renderSettingsList();document.getElementById('main-menu').classList.remove('show');document.getElementById('settings-mask').style.display='flex';this.resetModalScrollPositions('settings-mask','settings-modal');this.syncModalScrollLock();setTimeout(()=>document.getElementById('settings-modal').classList.add('show'),10);},
    closeSettingsModal(){document.getElementById('settings-modal').classList.remove('show');setTimeout(()=>{document.getElementById('settings-mask').style.display='none';this.syncModalScrollLock();},180);},
    resetSettingsModal(){const defaults={...DEFAULT_SETTINGS_MODAL_CONFIG,redirectWhitelistEntries:[],redirectWhitelistDomains:[],tcping:cloneTcpingConfig(DEFAULT_TCPING_CONFIG)};this.settingsDraft=createSettingsDraftFromConfig(defaults);this.settingsAdvancedOpen=false;this.renderSettingsList();this.toast('已恢复默认设置');},
    preserveDraftRedirectWhitelistEntries(list){return (Array.isArray(list)?list:[]).slice(0,MAX_SHARED_REDIRECT_RULES).map((item,idx)=>({id:String(item?.id||('redirect-'+(idx+1))),name:String(item?.name||''),domain:String(item?.domain||'')}));},
    renderSettingsList(){const draftRedirectEntries=this.preserveDraftRedirectWhitelistEntries(this.settingsDraft.redirectWhitelistEntries);this.settingsDraft=createSettingsDraftFromConfig({...DEFAULT_SETTINGS_MODAL_CONFIG,...this.settingsDraft});this.settingsDraft.redirectWhitelistEntries=draftRedirectEntries;const tcping=cloneTcpingConfig(this.settingsDraft.tcping||DEFAULT_TCPING_CONFIG);document.getElementById('tcping-tcp-count').value=tcping.tcp.count;document.getElementById('tcping-tcp-timeout').value=tcping.tcp.timeoutMs;document.getElementById('tcping-tcp-latency-low').value=tcping.tcp.latencyWarnLow;document.getElementById('tcping-tcp-latency-high').value=tcping.tcp.latencyWarnHigh;document.getElementById('tcping-head-count').value=tcping.head.count;document.getElementById('tcping-head-timeout').value=tcping.head.timeoutMs;document.getElementById('tcping-head-latency-low').value=tcping.head.latencyWarnLow;document.getElementById('tcping-head-latency-high').value=tcping.head.latencyWarnHigh;document.getElementById('settings-prewarm-cache-ttl').value=this.settingsDraft.prewarmCacheTtl;document.getElementById('settings-upstream-timeout-ms').value=this.settingsDraft.upstreamTimeoutMs;document.getElementById('settings-upstream-retry-attempts').value=this.settingsDraft.upstreamRetryAttempts;[['settings-enable-h2-switch','settings-enable-h2-text',this.settingsDraft.enableH2],['settings-enable-h3-switch','settings-enable-h3-text',this.settingsDraft.enableH3],['settings-peak-downgrade-switch','settings-peak-downgrade-text',this.settingsDraft.peakDowngrade],['settings-protocol-fallback-switch','settings-protocol-fallback-text',this.settingsDraft.protocolFallback],['settings-enable-prewarm-switch','settings-enable-prewarm-text',this.settingsDraft.enablePrewarm],['settings-direct-static-assets-switch','settings-direct-static-assets-text',this.settingsDraft.directStaticAssets],['settings-direct-hls-dash-switch','settings-direct-hls-dash-text',this.settingsDraft.directHlsDash],['settings-source-same-origin-proxy-switch','settings-source-same-origin-proxy-text',this.settingsDraft.sourceSameOriginProxy],['settings-force-external-proxy-switch','settings-force-external-proxy-text',this.settingsDraft.forceExternalProxy],['settings-debug-proxy-headers-switch','settings-debug-proxy-headers-text',this.settingsDraft.debugProxyHeaders]].forEach(([switchId,textId,enabled])=>this.setSettingsSwitch(switchId,textId,enabled));this.syncPrewarmDepthMenu();this.syncSettingsAdvancedToggle();const root=document.getElementById('settings-proxy-list');const proxyList=Array.isArray(this.settingsDraft.thirdPartyProxies)?this.settingsDraft.thirdPartyProxies:[];if(!proxyList.length)root.innerHTML='<div class="redirect-whitelist-empty">暂无记录</div>';else root.innerHTML=proxyList.map((item,idx)=>\`<div class="proxy-item settings-card-item" data-third-party-proxy-row data-third-party-proxy-id="\${this.escapeHtml(item.id||('proxy-'+(idx+1)))}"><input data-third-party-proxy-name placeholder="名称" value="\${this.escapeHtml(item.name||'')}" oninput="App.updateThirdPartyProxy(\${idx},'name',this.value)"><input data-third-party-proxy-url placeholder="https://example.com" value="\${this.escapeHtml(item.url||'')}" oninput="App.updateThirdPartyProxy(\${idx},'url',this.value)"><button class="icon-action-btn" aria-label="删除反代" onclick="App.removeThirdPartyProxy(\${idx})">\${ICONS.del}</button></div>\`).join('');this.renderRedirectWhitelistSettingsList();},
    renderRedirectWhitelistSettingsList(){const root=document.getElementById('settings-redirect-whitelist-list');if(!root)return;const list=Array.isArray(this.settingsDraft.redirectWhitelistEntries)?this.settingsDraft.redirectWhitelistEntries:[];if(!list.length)root.innerHTML='<div class="redirect-whitelist-empty">暂无记录</div>';else root.innerHTML=list.map((item,idx)=>\`<div class="proxy-item settings-card-item" data-redirect-rule-row data-redirect-rule-id="\${this.escapeHtml(item.id||('redirect-'+(idx+1)))}"><input data-redirect-rule-name placeholder="备注（可选）" value="\${this.escapeHtml(item.name||'')}" oninput="App.updateRedirectWhitelistEntry(\${idx},'name',this.value)"><input data-redirect-rule-domain placeholder="请输入域名或关键词" value="\${this.escapeHtml(item.domain||'')}" oninput="App.updateRedirectWhitelistEntry(\${idx},'domain',this.value)"><button class="icon-action-btn" aria-label="删除规则" onclick="App.removeRedirectWhitelistEntry(\${idx})">\${ICONS.del}</button></div>\`).join('');const addBtn=document.getElementById('settings-redirect-whitelist-add');if(addBtn){addBtn.disabled=false;addBtn.textContent=list.length>=MAX_SHARED_REDIRECT_RULES?'已达上限，删除后再新增':'添加规则';}},
    renderPreferredDnsSection(){const mode=this.cfDns.mode==='ip'?'ip':'domain';document.getElementById('cf-preferred-mode-domain')?.classList.toggle('active',mode==='domain');document.getElementById('cf-preferred-mode-ip')?.classList.toggle('active',mode==='ip');document.getElementById('cf-preferred-domain-panel')?.classList.toggle('hidden',mode!=='domain');document.getElementById('cf-preferred-ip-panel')?.classList.toggle('hidden',mode!=='ip');const preferredInput=document.getElementById('cf-preferred-domain');if(preferredInput&&preferredInput!==document.activeElement)preferredInput.value=this.cfDns.domainInput||'';this.renderPreferredIpList();this.renderPreferredDnsSupport();this.renderPreferredDnsHistory();},
    renderPreferredIpList(){const root=document.getElementById('cf-preferred-ip-list');if(!root)return;const inputs=Array.isArray(this.cfDns.ipInputs)&&this.cfDns.ipInputs.length?this.cfDns.ipInputs:[''];root.innerHTML=inputs.map((item,idx)=>\`<div class="settings-ip-row"><div class="preferred-dns-input"><input placeholder="请输入 IPv4 或 IPv6" value="\${this.escapeHtml(item||'')}" onfocus="App.focusPreferredIpInput(\${idx})" oninput="App.updatePreferredIpInput(\${idx}, this.value)"></div>\${inputs.length>1?\`<button class="icon-action-btn" type="button" aria-label="删除IP" onclick="App.removePreferredIpInput(\${idx})">\${ICONS.del}</button>\`:''}</div>\`).join('');},
    renderPreferredDnsSupport(){const root=document.getElementById('cf-dns-capabilities');if(!root)return;const domain=String(this.cfDns.domainInput||'').trim();if(this.cfDns.mode!=='domain'||!domain){root.innerHTML='';return;}const support=this.cfDns.domainSupport||this.emptyDomainSupport();let label='';let cls='';if(support.loading){label='检测中';cls='muted';}else if(support.checked&&support.ipv4&&support.ipv6)label='IPV4/IPV6';else if(support.checked&&support.ipv4)label='IPV4';else if(support.checked&&support.ipv6)label='IPV6';else if(support.checked){label='未解析';cls='warn';}if(!label){root.innerHTML='';return;}root.innerHTML=\`<div class="preferred-dns-meta-row"><span class="preferred-dns-meta-label">网络栈:</span><span class="preferred-dns-stack \${cls}">\${this.escapeHtml(label)}</span></div>\`;},
    renderPreferredDnsHistory(){const renderRow=(items,handler)=>{const list=(Array.isArray(items)?items:[]).map(item=>\`<button class="preferred-dns-history-btn" type="button" onclick='\${handler}(\${this.quoteJs(item)})'>\${this.escapeHtml(item)}</button>\`).join('');return list?\`<div class="preferred-dns-meta-row"><span class="preferred-dns-meta-label">历史记录:</span><div class="preferred-dns-history-list">\${list}</div></div>\`:'';};const domainRoot=document.getElementById('cf-domain-history');const ipRoot=document.getElementById('cf-ip-history');if(domainRoot)domainRoot.innerHTML=renderRow(this.cfDns.domainHistory,'App.usePreferredDomainHistory');if(ipRoot)ipRoot.innerHTML=renderRow(this.cfDns.ipHistory,'App.usePreferredIpHistory');},
    updateTcpingSetting(path,value){if(!this.settingsDraft.tcping||typeof this.settingsDraft.tcping!=='object')this.settingsDraft.tcping=cloneTcpingConfig(DEFAULT_TCPING_CONFIG);const parts=String(path||'').split('.');if(parts.length!==2)return;const [group,key]=parts;if(!this.settingsDraft.tcping[group])this.settingsDraft.tcping[group]={};this.settingsDraft.tcping[group][key]=value;},
    updateSettingsFlag(key,value){this.settingsDraft[key]=value===true;this.renderSettingsList();},
    toggleSettingsFlag(key){this.updateSettingsFlag(key,!this.settingsDraft[key]);},
    updateSettingsValue(key,value){this.settingsDraft[key]=key==='prewarmDepth'?normalizePrewarmDepth(value):value;if(key==='prewarmDepth')this.syncPrewarmDepthMenu();},
    readSettingsProxyDraftRows(){const fallback=(Array.isArray(this.settingsDraft.thirdPartyProxies)?this.settingsDraft.thirdPartyProxies:[]).map((item,idx)=>({id:String(item?.id||('proxy-'+(idx+1))),name:String(item?.name||''),url:String(item?.url||'')}));const root=document.getElementById('settings-proxy-list');if(!root?.querySelectorAll)return fallback;const rows=Array.from(root.querySelectorAll('[data-third-party-proxy-row]'));if(!rows.length)return fallback;return rows.map((row,idx)=>({id:String(row.getAttribute?.('data-third-party-proxy-id')||fallback[idx]?.id||('proxy-'+(idx+1))),name:String(row.querySelector?.('[data-third-party-proxy-name]')?.value||''),url:String(row.querySelector?.('[data-third-party-proxy-url]')?.value||'')}));},
    updateRedirectWhitelistEntry(index,key,value){if(!Array.isArray(this.settingsDraft.redirectWhitelistEntries))this.settingsDraft.redirectWhitelistEntries=[];if(!this.settingsDraft.redirectWhitelistEntries[index])return;this.settingsDraft.redirectWhitelistEntries[index][key]=String(value||'');},
    readRedirectWhitelistDraftRows(){const fallback=this.preserveDraftRedirectWhitelistEntries(this.settingsDraft.redirectWhitelistEntries);const root=document.getElementById('settings-redirect-whitelist-list');if(!root?.querySelectorAll)return fallback;const rows=Array.from(root.querySelectorAll('[data-redirect-rule-row]'));if(!rows.length)return fallback;return rows.map((row,idx)=>({id:String(row.getAttribute?.('data-redirect-rule-id')||fallback[idx]?.id||('redirect-'+(idx+1))),name:String(row.querySelector?.('[data-redirect-rule-name]')?.value||''),domain:String(row.querySelector?.('[data-redirect-rule-domain]')?.value||'')}));},
    syncSettingsDraftFromDom(){const nextDraft=createSettingsDraftFromConfig({...DEFAULT_SETTINGS_MODAL_CONFIG,...this.settingsDraft});nextDraft.thirdPartyProxies=this.readSettingsProxyDraftRows();nextDraft.redirectWhitelistEntries=this.readRedirectWhitelistDraftRows();nextDraft.tcping=cloneTcpingConfig({tcp:{count:document.getElementById('tcping-tcp-count')?.value??nextDraft.tcping?.tcp?.count,timeoutMs:document.getElementById('tcping-tcp-timeout')?.value??nextDraft.tcping?.tcp?.timeoutMs,latencyWarnLow:document.getElementById('tcping-tcp-latency-low')?.value??nextDraft.tcping?.tcp?.latencyWarnLow,latencyWarnHigh:document.getElementById('tcping-tcp-latency-high')?.value??nextDraft.tcping?.tcp?.latencyWarnHigh},head:{count:document.getElementById('tcping-head-count')?.value??nextDraft.tcping?.head?.count,timeoutMs:document.getElementById('tcping-head-timeout')?.value??nextDraft.tcping?.head?.timeoutMs,latencyWarnLow:document.getElementById('tcping-head-latency-low')?.value??nextDraft.tcping?.head?.latencyWarnLow,latencyWarnHigh:document.getElementById('tcping-head-latency-high')?.value??nextDraft.tcping?.head?.latencyWarnHigh}});const prewarmDepthInput=document.getElementById('settings-prewarm-depth');if(prewarmDepthInput)nextDraft.prewarmDepth=prewarmDepthInput.value||nextDraft.prewarmDepth;const prewarmCacheTtlInput=document.getElementById('settings-prewarm-cache-ttl');if(prewarmCacheTtlInput)nextDraft.prewarmCacheTtl=prewarmCacheTtlInput.value;const upstreamTimeoutInput=document.getElementById('settings-upstream-timeout-ms');if(upstreamTimeoutInput)nextDraft.upstreamTimeoutMs=upstreamTimeoutInput.value;const upstreamRetryInput=document.getElementById('settings-upstream-retry-attempts');if(upstreamRetryInput)nextDraft.upstreamRetryAttempts=upstreamRetryInput.value;this.settingsDraft=nextDraft;return nextDraft;},
    addRedirectWhitelistEntry(){const list=Array.isArray(this.settingsDraft.redirectWhitelistEntries)?this.settingsDraft.redirectWhitelistEntries:[];if(list.length>=MAX_SHARED_REDIRECT_RULES)return this.toast('跳转规则最多 20 条，请先删除一条再新增','warning');list.push({id:'redirect-'+Date.now(),name:'',domain:''});this.settingsDraft.redirectWhitelistEntries=list;this.renderSettingsList();},
    removeRedirectWhitelistEntry(index){if(!Array.isArray(this.settingsDraft.redirectWhitelistEntries))return;this.settingsDraft.redirectWhitelistEntries.splice(index,1);this.renderSettingsList();},
    renderCfSettingsModal(){const cfMetrics=this.cfSettingsDraft||DEFAULT_CF_METRICS_CONFIG;document.getElementById('cf-account-id').value=cfMetrics.accountId||'';document.getElementById('cf-api-token').value=cfMetrics.apiToken||'';document.getElementById('cf-worker-url').value=cfMetrics.workerUrl||'';document.getElementById('cf-auto-refresh').value=Number(cfMetrics.autoRefreshSeconds)||300;const show=cfMetrics.showCard!==false;document.getElementById('cf-show-card-show').classList.toggle('active',show);document.getElementById('cf-show-card-hide').classList.toggle('active',!show);this.cfDns.domainHistory=this.readPreferredHistory('domain');this.cfDns.ipHistory=this.readPreferredHistory('ip');this.renderPreferredDnsSection();this.renderCfDnsStatus();},
    setCfShowCard(show){this.cfSettingsDraft={...DEFAULT_CF_METRICS_CONFIG,...(this.cfSettingsDraft||this.config?.cfMetrics||{})};this.cfSettingsDraft.showCard=!!show;this.renderCfSettingsModal();},
    updateCfMetricSetting(key,value){this.cfSettingsDraft={...DEFAULT_CF_METRICS_CONFIG,...(this.cfSettingsDraft||this.config?.cfMetrics||{})};this.cfSettingsDraft[key]=value;},
    syncCfSettingsDraftFromDom(){const nextDraft={...DEFAULT_CF_METRICS_CONFIG,...(this.cfSettingsDraft||this.config?.cfMetrics||{})};const accountIdInput=document.getElementById('cf-account-id');const apiTokenInput=document.getElementById('cf-api-token');const workerUrlInput=document.getElementById('cf-worker-url');const autoRefreshInput=document.getElementById('cf-auto-refresh');if(accountIdInput)nextDraft.accountId=accountIdInput.value;if(apiTokenInput)nextDraft.apiToken=apiTokenInput.value;if(workerUrlInput)nextDraft.workerUrl=workerUrlInput.value;if(autoRefreshInput)nextDraft.autoRefreshSeconds=autoRefreshInput.value;const showBtn=document.getElementById('cf-show-card-show');const hideBtn=document.getElementById('cf-show-card-hide');if(hideBtn?.classList?.contains('active'))nextDraft.showCard=false;else if(showBtn?.classList?.contains('active'))nextDraft.showCard=true;this.cfSettingsDraft=nextDraft;return nextDraft;},
    clearCfMetricField(key){this.cfSettingsDraft={...DEFAULT_CF_METRICS_CONFIG,...(this.cfSettingsDraft||this.config?.cfMetrics||{})};this.cfSettingsDraft[key]='';this.renderCfSettingsModal();},
    getCfDnsApiToken(){return String(this.cfSettingsDraft?.apiToken||this.config?.cfMetrics?.apiToken||'').trim();},
    setPreferredDnsMode(mode){this.cfDns.mode=mode==='ip'?'ip':'domain';this.cfDns.modePinned=true;if(this.cfDns.mode==='ip'&&(!Array.isArray(this.cfDns.ipInputs)||!this.cfDns.ipInputs.length))this.cfDns.ipInputs=[''];this.cfDns.activeIpIndex=0;this.renderPreferredDnsSection();this.renderCfDnsStatus();Promise.resolve(this.loadCurrentPreferredRecords(true,{preserveMode:true,successMessage:'已获取当前 DNS 记录'})).catch(()=>{});},
    updatePreferredDomainInput(value){this.cfDns.domainInput=String(value||'');this.schedulePreferredDomainSupportLookup();},
    focusPreferredIpInput(index){this.cfDns.activeIpIndex=Math.max(0,Number(index)||0);},
    updatePreferredIpInput(index,value){if(!Array.isArray(this.cfDns.ipInputs)||!this.cfDns.ipInputs.length)this.cfDns.ipInputs=[''];this.cfDns.activeIpIndex=Math.max(0,Number(index)||0);this.cfDns.ipInputs[index]=String(value||'');},
    addPreferredIpInput(value=''){const next=Array.isArray(this.cfDns.ipInputs)?[...this.cfDns.ipInputs]:[];if(next.length>=10)return this.toast('最多添加 10 条 IP 记录','warning');next.push(String(value||''));this.cfDns.ipInputs=next;this.cfDns.activeIpIndex=Math.max(0,next.length-1);this.renderPreferredIpList();},
    removePreferredIpInput(index){const next=(Array.isArray(this.cfDns.ipInputs)?this.cfDns.ipInputs:[]).filter((_,idx)=>idx!==index);this.cfDns.ipInputs=next.length?next:[''];this.cfDns.activeIpIndex=Math.min(Math.max(0,Number(this.cfDns.activeIpIndex)||0),this.cfDns.ipInputs.length-1);this.renderPreferredIpList();},
    usePreferredDomainHistory(value){this.cfDns.mode='domain';this.cfDns.modePinned=true;this.cfDns.domainInput=String(value||'');this.renderPreferredDnsSection();this.schedulePreferredDomainSupportLookup();},
    usePreferredIpHistory(value){const normalized=String(value||'').trim();if(!normalized)return;this.cfDns.mode='ip';this.cfDns.modePinned=true;const next=Array.isArray(this.cfDns.ipInputs)&&this.cfDns.ipInputs.length?[...this.cfDns.ipInputs]:[''];const targetIndex=Math.min(Math.max(0,Number(this.cfDns.activeIpIndex)||0),next.length-1);next[targetIndex]=normalized;this.cfDns.ipInputs=next;this.renderPreferredDnsSection();},
    syncPreferredDnsState(data,{recordHistory=false,preserveMode=false}={}){const records=Array.isArray(data?.records)?data.records:[];const cnameRecord=records.find(item=>String(item?.type||'').toUpperCase()==='CNAME');const ipRecords=records.filter(item=>{const type=String(item?.type||'').toUpperCase();return type==='A'||type==='AAAA';});const keepMode=preserveMode===true||this.cfDns.modePinned===true;this.cfDns.loading=false;this.cfDns.lastError='';this.cfDns.hostname=data?.hostname||location.hostname||'';this.cfDns.zoneName=data?.zoneName||'';this.cfDns.exists=!!data?.exists;this.cfDns.records=records;this.cfDns.status=data?.status&&typeof data.status==='object'?data.status:{kind:this.cfDns.exists?'loaded':'empty',text:this.cfDns.exists?'已读取':'未创建'};this.cfDns.domainInput=cnameRecord?.content||'';this.cfDns.ipInputs=ipRecords.length?ipRecords.map(item=>item.content):[''];this.cfDns.activeIpIndex=0;this.cfDns.domainSupport=data?.domainSupport&&typeof data.domainSupport==='object'?{...this.emptyDomainSupport(),...data.domainSupport,loading:false}:this.emptyDomainSupport();if(!keepMode){if(cnameRecord)this.cfDns.mode='domain';else if(ipRecords.length)this.cfDns.mode='ip';else this.cfDns.mode='domain';}if(recordHistory){if(cnameRecord?.content)this.pushPreferredHistory('domain',cnameRecord.content);if(ipRecords.length)this.pushPreferredHistory('ip',ipRecords.map(item=>item.content));}this.cfDns.domainHistory=this.readPreferredHistory('domain');this.cfDns.ipHistory=this.readPreferredHistory('ip');},
    renderCfDnsStatus(){const el=document.getElementById('cf-dns-status');if(!el)return;let text='当前域名记录状态：未读取';let error=false;if(this.cfDns.loading){text='当前域名记录状态：读取/同步中...';}else if(this.cfDns.lastError){text='当前域名记录状态：'+this.cfDns.lastError;error=true;}else if(this.cfDns.hostname){const zonePart=this.cfDns.zoneName?' · Zone: '+this.cfDns.zoneName:'';const statusText=this.cfDns.status?.text||'未创建';const msgPart=this.cfDns.lastMessage?' · '+this.cfDns.lastMessage:'';text=this.cfDns.hostname+zonePart+' · '+statusText+msgPart;}el.className='settings-note'+(error?' error':'');el.textContent=text;},
    async loadCurrentPreferredRecords(showToast=false,options={}){const seq=Number(this.cfDns.fetchSeq||0)+1;this.cfDns.fetchSeq=seq;this.cfDns.loading=true;this.cfDns.lastError='';this.cfDns.lastMessage='';this.renderCfDnsStatus();try{const res=await fetch('/admin',{method:'POST',body:JSON.stringify({action:'cfDnsGetPreferredRecords',apiToken:this.getCfDnsApiToken()})});const data=await res.json();if(seq!==this.cfDns.fetchSeq)return false;if(!res.ok)throw new Error(data.error||'读取当前记录失败');this.syncPreferredDnsState(data,{recordHistory:true,preserveMode:options.preserveMode===true});this.cfDns.lastError='';this.cfDns.lastMessage=data?.exists?'已读取':'当前域名暂无同名记录';this.renderPreferredDnsSection();this.renderCfDnsStatus();if(this.cfDns.mode==='domain'&&this.cfDns.domainInput)this.schedulePreferredDomainSupportLookup();if(showToast)this.toast(options.successMessage||'已获取当前 DNS 记录','success');return true;}catch(e){if(seq!==this.cfDns.fetchSeq)return false;this.cfDns.loading=false;this.cfDns.lastError=e.message||'读取当前记录失败';this.renderCfDnsStatus();if(showToast)this.toast(this.cfDns.lastError,'error');return false;}},
    async applyPreferredRecords(){const mode=this.cfDns.mode==='ip'?'ip':'domain';const domain=String(this.cfDns.domainInput||'').trim();const ipRecords=(Array.isArray(this.cfDns.ipInputs)?this.cfDns.ipInputs:[]).map(item=>String(item||'').trim()).filter(Boolean);if(mode==='domain'&&!domain)return this.toast('请输入 CNAME 目标域名','error');if(mode==='ip'&&!ipRecords.length)return this.toast('请至少填写 1 条 IP 记录','error');this.cfDns.loading=true;this.cfDns.lastError='';this.cfDns.lastMessage='同步中...';this.renderCfDnsStatus();try{const payload={action:'cfDnsApplyPreferredRecords',mode,apiToken:this.getCfDnsApiToken()};if(mode==='domain')payload.content=domain;else payload.records=ipRecords.map(item=>({content:item}));const res=await fetch('/admin',{method:'POST',body:JSON.stringify(payload)});const data=await res.json();if(!res.ok)throw new Error(data.error||'同步记录失败');this.syncPreferredDnsState(data,{recordHistory:true});this.cfDns.lastError='';this.cfDns.lastMessage=data.operation==='create'?'已创建并同步':data.operation==='update'?'已更新并同步':'已同步';this.renderPreferredDnsSection();this.renderCfDnsStatus();this.toast(this.cfDns.lastMessage);}catch(e){this.cfDns.loading=false;this.cfDns.lastError=e.message||'同步记录失败';this.renderCfDnsStatus();this.toast(this.cfDns.lastError,'error');}},
    schedulePreferredDomainSupportLookup(){clearTimeout(this.cfDns.lookupTimer);const domain=String(this.cfDns.domainInput||'').trim();if(!domain){this.cfDns.domainSupport=this.emptyDomainSupport();this.renderPreferredDnsSupport();return;}const seq=Number(this.cfDns.lookupSeq||0)+1;this.cfDns.lookupSeq=seq;this.cfDns.domainSupport={...this.emptyDomainSupport(),loading:true};this.renderPreferredDnsSupport();this.cfDns.lookupTimer=setTimeout(()=>this.lookupPreferredDomainSupport(seq,domain),240);},
    async lookupPreferredDomainSupport(seq,domain){const current=String(domain||'').trim();if(!current)return;const [ipv4,ipv6]=await Promise.all([this.lookupDnsJsonRecord(current,'A',1),this.lookupDnsJsonRecord(current,'AAAA',28)]);if(seq!==this.cfDns.lookupSeq||current!==String(this.cfDns.domainInput||'').trim())return;this.cfDns.domainSupport={checked:true,ipv4,ipv6,loading:false};this.renderPreferredDnsSupport();},
    async lookupDnsJsonRecord(domain,type,code){try{const res=await fetch(\`https://cloudflare-dns.com/dns-query?name=\${encodeURIComponent(domain)}&type=\${encodeURIComponent(type)}\`,{headers:{'Accept':'application/dns-json'}});if(!res.ok)return false;const data=await res.json();return Array.isArray(data?.Answer)&&data.Answer.some(item=>Number(item?.type)===code&&item?.data);}catch(_){return false;}},
    updateThirdPartyProxy(index,key,value){this.settingsDraft.thirdPartyProxies[index][key]=value;},
    addThirdPartyProxy(){this.settingsDraft.thirdPartyProxies.push({id:'proxy-'+Date.now(),name:'',url:''});this.renderSettingsList();},
    removeThirdPartyProxy(index){this.settingsDraft.thirdPartyProxies.splice(index,1);this.renderSettingsList();},
    async saveConfig(){
        const settingsDraft=this.syncSettingsDraftFromDom();
        const proxies=settingsDraft.thirdPartyProxies.map(item=>({
            id:item.id||('proxy-'+Date.now()),
            name:(item.name||'').trim(),
            url:(item.url||'').trim()
        }));
        const names=new Set();
        for(const item of proxies){
            if(!item.name||!item.url)return this.toast('第三方反代名称和地址不能为空','error');
            if(!/^https?:\\/\\//.test(item.url))return this.toast('第三方反代地址格式错误','error');
            if(names.has(item.name))return this.toast('第三方反代名称不能重复','error');
            names.add(item.name);
        }

        const toProbe=(raw,label)=>{
            const count=Number(raw.count);
            const timeoutMs=Number(raw.timeoutMs);
            const latencyWarnLow=Number(raw.latencyWarnLow);
            const latencyWarnHigh=Number(raw.latencyWarnHigh);
            if(!Number.isInteger(count)||count<1||count>10)throw new Error(label+'测试次数需为 1-10 的整数');
            if(!Number.isInteger(timeoutMs)||timeoutMs<200||timeoutMs>10000)throw new Error(label+'超时时间需为 200-10000 的整数');
            if([latencyWarnLow,latencyWarnHigh].some(v=>Number.isNaN(v)))throw new Error(label+'响应时间阈值必须为数字');
            if(latencyWarnLow>latencyWarnHigh)throw new Error(label+'响应时间区间设置错误');
            return{count,timeoutMs,latencyWarnLow,latencyWarnHigh};
        };

        let tcping;
        try{
            const cfg=cloneTcpingConfig(settingsDraft.tcping||{});
            tcping={tcp:toProbe(cfg.tcp,'TCP'),head:toProbe(cfg.head,'HEAD')};
        }catch(e){
            return this.toast(e.message||'延迟测试设置错误','error');
        }

        const sharedRedirectEntries=(Array.isArray(settingsDraft.redirectWhitelistEntries)?settingsDraft.redirectWhitelistEntries:[]).map(item=>({id:item.id||('redirect-'+Date.now()),name:String(item.name||'').trim(),domain:normalizeSharedRedirectRuleValue(item.domain)})).filter(item=>item.name||item.domain);
        if(sharedRedirectEntries.length>MAX_SHARED_REDIRECT_RULES)return this.toast('跳转规则最多 20 条','error');
        const redirectRuleValues=new Set();
        for(const item of sharedRedirectEntries){
            if(!item.domain)return this.toast('跳转规则值不能为空','error');
            const key=item.domain.toLowerCase();
            if(redirectRuleValues.has(key))return this.toast('跳转规则不能重复','error');
            redirectRuleValues.add(key);
        }

        this.config=buildConfigFromSettingsDraft({...this.config,thirdPartyProxies:proxies,tcping},{...settingsDraft,thirdPartyProxies:proxies,tcping,redirectWhitelistEntries:sharedRedirectEntries});

        try{
            const res=await fetch('/admin',{method:'POST',body:JSON.stringify({action:'saveConfig',config:this.config})});
            if(!res.ok)throw new Error('设置保存失败');
            this.closeSettingsModal();
            if(this.proxyDialogNode)this.renderProxyDialog();
            this.renderList();
            this.toast('设置已保存');
        }catch(e){
            this.toast(e.message||'设置保存失败','error');
        }
    },
    async saveCfSettings(){
        const cfDraft=this.syncCfSettingsDraftFromDom();
        const cfMetrics={accountId:(cfDraft?.accountId||'').trim(),apiToken:(cfDraft?.apiToken||'').trim(),workerUrl:(cfDraft?.workerUrl||'').trim(),showCard:cfDraft?.showCard!==false,autoRefreshSeconds:Math.max(30,Math.min(3600,Number(cfDraft?.autoRefreshSeconds)||300))};
        if(cfMetrics.workerUrl&&!/^https?:\\/\\//.test(cfMetrics.workerUrl))return this.toast('Worker管理页地址格式错误','error');
        this.config={...this.config,cfMetrics};
        try{
            const res=await fetch('/admin',{method:'POST',body:JSON.stringify({action:'saveConfig',config:this.config})});
            if(!res.ok)throw new Error('CF设置保存失败');
            this.closeCfSettingsModal();
            if(!this.hasCfMetricsConfig()){this.cfMetricsData=null;this.nodeActivityData=null;}
            else{await this.loadNodeActivity(true);if((this.config.cfMetrics||{}).showCard!==false)await this.loadCfMetrics(true);else this.cfMetricsData=null;}
            this.syncCfAutoRefresh();
            this.syncNodeActivityAutoRefresh();
            this.renderList();
            this.renderCfCardSlot();
            this.toast('CF设置已保存');
        }catch(e){
            this.toast(e.message||'CF设置保存失败','error');
        }
    },
    async import(el){const file=el.files[0];if(!file)return;const includeAll=this.configManage.includeAll===true;const reader=new FileReader();reader.onload=async e=>{try{const imported=this.parseImportedPayload(JSON.parse(e.target.result));if(!imported.nodes.length&&!imported.config)throw new Error('配置文件内容为空');if(includeAll&&!imported.config)throw new Error('当前勾选了全部配置，但文件中不包含设置项');const payload={action:'import',nodes:imported.nodes};if(includeAll&&imported.config)payload.config=imported.config;const response=await fetch('/admin',{method:'POST',body:JSON.stringify(payload)});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'导入失败');await this.loadConfig();this.cfDns=this.createDefaultCfDnsState();await this.refresh(true);this.syncCfAutoRefresh();this.syncNodeActivityAutoRefresh();this.renderList();this.toast(includeAll&&imported.config?'导入全部配置成功':'导入站点信息成功');this.closeConfigManageModal();}catch(error){this.toast(error.message||'导入失败','error');}finally{el.value='';}};reader.readAsText(file);},
    async logout(){try{await fetch('/admin',{method:'POST',body:JSON.stringify({action:'logout'})});}catch(_){ }location.reload();},
    copy(text){navigator.clipboard.writeText(text).then(()=>this.toast('复制成功'));},
    toast(msg,type='success'){const el=document.getElementById('toast');el.innerText=msg;el.className='toast show '+type;setTimeout(()=>el.className='toast',3000);},
    initPullToRefresh(){let startY=0;let pulling=false;const threshold=80;const indicator=document.getElementById('pull-indicator');const text=document.getElementById('pull-text');document.addEventListener('touchstart',e=>{if(window.scrollY===0){startY=e.touches[0].clientY;pulling=true;}},{passive:true});document.addEventListener('touchmove',e=>{if(!pulling)return;const diff=e.touches[0].clientY-startY;if(diff>0&&window.scrollY===0){if(diff<threshold){indicator.style.transform='translateY('+(diff-60)+'px)';text.innerText='下拉刷新...';indicator.classList.remove('refreshing');}else{text.innerText='释放刷新';}}},{passive:true});document.addEventListener('touchend',async e=>{if(!pulling)return;pulling=false;const diff=e.changedTouches[0].clientY-startY;if(diff>threshold&&window.scrollY===0){indicator.classList.add('refreshing');indicator.style.transform='translateY(0)';text.innerText='刷新中...';await this.refreshDashboard();setTimeout(()=>{indicator.style.transform='';indicator.classList.remove('refreshing');},500);}else{indicator.style.transform='';}});}
};
App.init();
<\/script>`;
}
var init_admin_script = __esm({
  "src/admin/ui/admin-script.js"() {
    init_defaults();
    init_version();
    init_node_path_phrase_map();
    init_settings_model();
    init_metadata_prewarm();
    init_node_model();
  }
});

// src/admin/ui/admin-styles.js
var ADMIN_UI_STYLES;
var init_admin_styles = __esm({
  "src/admin/ui/admin-styles.js"() {
    ADMIN_UI_STYLES = `
    :root{
        --adm-control-h:40px;
        --adm-control-radius:8px;
        --adm-control-border:#d7dce5;
        --adm-control-bg:#f4f6fa;
        --adm-control-text:#1f2937;
        --adm-surface-card:#fff;
        --adm-surface-subtle:#f8fafc;
        --adm-surface-muted:#f3f6fb;
        --adm-surface-elevated:#fbfbfb;
        --adm-surface-accent:#eef4ff;
        --adm-surface-accent-soft:#eff6ff;
        --adm-surface-accent-muted:#f5f9ff;
        --adm-border-soft:#d7dce5;
        --adm-border-muted:#e5e7eb;
        --adm-border-accent:#cbdfff;
        --adm-border-accent-soft:#d9e7ff;
        --adm-border-accent-strong:#4a80e8;
        --adm-text-strong:#1f2937;
        --adm-text-main:#333;
        --adm-text-muted:#666;
        --adm-text-soft:#8c93a3;
        --adm-text-subtle:#a0a6b3;
        --adm-text-accent:#4a80e8;
        --adm-text-accent-strong:#2f68d8;
        --adm-text-accent-muted:#6e84ab;
        --adm-accent:#4a80e8;
        --adm-accent-strong:#3b82f6;
        --adm-accent-hover:#e8f1ff;
        --adm-accent-press:#dceafe;
        --adm-success:#16a34a;
        --adm-success-strong:#15803d;
        --adm-success-soft:#f0fdf4;
        --adm-warn:#f59e0b;
        --adm-warn-strong:#c2410c;
        --adm-warn-soft:#fff7ed;
        --adm-danger:#ef4444;
        --adm-btn-secondary-bg:#fff;
        --adm-btn-secondary-border:var(--adm-border-soft);
        --adm-btn-secondary-text:#4a5565;
        --adm-btn-primary-bg:var(--adm-accent);
        --adm-btn-primary-text:#fff;
        --adm-btn-tonal-bg:#6e84ab;
        --adm-btn-tonal-text:#fff;
        --adm-btn-h:var(--adm-control-h);
        --adm-btn-radius:var(--adm-control-radius);
        --adm-switch-bg:#cfd5e1;
        --adm-switch-text:#80889a;
        --adm-switch-text-active:var(--adm-text-accent);
        --adm-field-bg:var(--adm-control-bg);
        --adm-field-border:var(--adm-control-border);
        --adm-field-text:var(--adm-control-text);
        --adm-field-radius:var(--adm-control-radius);
        --adm-segmented-bg:var(--adm-control-bg);
        --adm-segmented-border:var(--adm-control-border);
        --adm-segmented-radius:var(--adm-control-radius);
        --adm-segmented-button-h:var(--adm-control-h);
        --adm-segmented-text:var(--adm-text-strong);
        --adm-segmented-active-bg:var(--adm-btn-primary-bg);
        --adm-segmented-active-text:var(--adm-btn-primary-text);
        --adm-panel-radius-md:10px;
        --adm-panel-radius-lg:12px;
        --adm-pill-radius:999px;
        --adm-pill-muted-bg:#f5f7fa;
        --adm-shadow-soft:0 8px 24px rgba(0,0,0,.12);
    }
    html.dark{
        --adm-control-border:#42506a;
        --adm-control-bg:#1f2937;
        --adm-control-text:#f3f4f6;
        --adm-surface-card:#111827;
        --adm-surface-subtle:rgba(255,255,255,.04);
        --adm-surface-muted:#243042;
        --adm-surface-elevated:#1f2937;
        --adm-surface-accent:#22314a;
        --adm-surface-accent-soft:#1d2a3f;
        --adm-surface-accent-muted:rgba(74,128,232,.16);
        --adm-border-soft:#42506a;
        --adm-border-muted:#374151;
        --adm-border-accent:#4569a9;
        --adm-border-accent-soft:#4869a7;
        --adm-border-accent-strong:#4b76bf;
        --adm-text-strong:#f3f4f6;
        --adm-text-main:#f3f4f6;
        --adm-text-muted:#aeb7c6;
        --adm-text-soft:#9aa6bb;
        --adm-text-subtle:#d7deea;
        --adm-text-accent:#7db1ff;
        --adm-text-accent-strong:#b6d4ff;
        --adm-text-accent-muted:#9fb8ef;
        --adm-accent:#4a80e8;
        --adm-accent-strong:#3b82f6;
        --adm-accent-hover:#2a3b58;
        --adm-accent-press:#31476a;
        --adm-success:#86efac;
        --adm-success-strong:#86efac;
        --adm-success-soft:#163323;
        --adm-warn:#fdba74;
        --adm-warn-strong:#fdba74;
        --adm-warn-soft:#3a2310;
        --adm-danger:#ff7b7b;
        --adm-btn-secondary-bg:#1f2937;
        --adm-btn-secondary-border:#42506a;
        --adm-btn-secondary-text:#d7deea;
        --adm-btn-primary-bg:var(--adm-accent-strong);
        --adm-btn-primary-text:#fff;
        --adm-btn-tonal-bg:#6e84ab;
        --adm-btn-tonal-text:#fff;
        --adm-switch-bg:#4b5568;
        --adm-switch-text:#aeb7c6;
        --adm-switch-text-active:#86b6ff;
        --adm-pill-muted-bg:#22314a;
        --adm-shadow-soft:0 8px 24px rgba(0,0,0,.32);
    }
    .header{display:grid;grid-template-columns:auto minmax(240px,1fr) auto;grid-template-areas:"title search actions";gap:12px;align-items:center}
    .header-title{grid-area:title;margin:0;font-size:20px;font-weight:700;display:flex;align-items:center;gap:8px;min-width:0}
    .header-actions{grid-area:actions;display:flex;align-items:center;gap:8px;justify-self:end}
    .header-status{display:flex;align-items:center;min-width:0}
    .client-rtt-pill,.cf-range-pill{display:inline-flex;align-items:center;border-radius:var(--adm-pill-radius);white-space:nowrap;box-sizing:border-box;}
    .client-rtt-pill{gap:0;height:36px;padding:0 8px;border:1px solid var(--adm-border-soft);background:var(--adm-surface-card);color:var(--adm-text-strong);font-size:12px}
    .client-rtt-pill.loading{opacity:.8}
    .client-rtt-pill.error{border-color:var(--adm-warn);color:var(--adm-warn-strong);background:var(--adm-warn-soft)}
    .client-rtt-label{color:var(--text-sec)}
    .client-rtt-value{font-weight:600;color:var(--text);min-width:42px;text-align:right}
    .client-rtt-value.excellent{color:var(--adm-success)}
    .client-rtt-value.normal{color:var(--adm-warn)}
    .client-rtt-value.poor{color:var(--adm-danger)}
    .client-rtt-refresh{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:none;border-radius:999px;background:transparent;color:var(--text-sec);cursor:pointer;transition:background .2s,color .2s}
    .client-rtt-refresh:hover{background:rgba(0,0,0,.05);color:var(--text)}
    .client-rtt-refresh.loading{opacity:.65;cursor:wait}
    .client-rtt-refresh svg{width:14px;height:14px}
    .mobile-menu-item{display:none}
    .desktop-action{display:flex}
    .header-search{grid-area:search;max-width:420px;width:100%}
    .toolbar-search{position:relative;flex:1 1 auto;min-width:0;width:100%}
    .toolbar-search input{width:100%;height:36px;padding:0 44px 0 12px;border-radius:10px;border:1px solid var(--adm-border-soft);background:var(--adm-surface-card);color:var(--adm-text-strong);box-shadow:none;font-size:13px}
    .toolbar-search input::placeholder{color:var(--adm-text-soft)}
    .toolbar-search.has-value input{background:var(--adm-surface-accent);border-color:var(--adm-border-accent)}
    .search-clear{position:absolute;right:10px;top:50%;transform:translateY(-50%);display:none;padding:4px}
    .search-clear.show{display:flex}
    .search-clear svg{display:block}
    .cf-card{padding:16px;border-radius:var(--adm-panel-radius-md);border:1px solid var(--adm-border-accent);background:var(--adm-surface-accent-soft)}
    .cf-card-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}
    .cf-card-title{display:flex;align-items:center;gap:8px;font-size:20px;font-weight:700;color:var(--adm-text-main)}
    .cf-title-text{font-size:20px;font-weight:700;color:var(--adm-text-main);line-height:32px}
    .cf-card-actions{display:flex;align-items:center;gap:16px}
    .cf-range-pill{padding:6px 10px;border:1px solid var(--adm-border-accent-soft);background:var(--adm-surface-accent-muted);color:var(--adm-text-accent);font-size:13px;font-weight:600;height:32px}
    .cf-stack{display:grid;gap:12px;width:100%}
    .cf-row{padding:8px 10px;background:var(--adm-surface-card);border-radius:8px;overflow:hidden}
    .cf-metric-top{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;min-width:0}
    .cf-value{display:inline-flex;align-items:baseline;gap:4px;min-width:0;font-size:16px;color:var(--adm-text-main);line-height:1.2}
    .cf-value strong{font-size:16px;font-weight:400}
    .cf-unit{font-size:12px;color:var(--adm-text-soft);white-space:nowrap}
    .cf-change{font-size:12px;color:var(--adm-accent-strong);white-space:nowrap}
    .cf-change.down{color:var(--adm-warn)}
    .cf-label{font-size:12px;color:var(--adm-text-soft)}
    .cf-primary-row{display:block}
    .cf-primary-grid{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(120px,.85fr);gap:8px 10px;width:100%;align-items:start}
    .cf-primary-item{display:grid;gap:2px;min-width:0}
    .cf-primary-item.traffic .cf-metric-top{flex-wrap:nowrap}
    .cf-top-paths{
        --cf-top-row-h:24px;
        --cf-top-gap:6px;
        display:grid;
        gap:8px;
        padding:10px;
        background:var(--adm-surface-card);
        border-radius:8px;
    }
    .cf-top-title{font-size:12px;color:var(--adm-text-soft)}
    .cf-top-scroll{
        height:calc(var(--cf-top-row-h) * 3 + var(--cf-top-gap));
        overflow:hidden;
        position:relative;
    }
    .cf-top-marquee{
        display:flex;
        flex-direction:column;
        gap:4px;
        animation:cf-top-scroll var(--cf-top-scroll-duration, 14s) linear infinite;
        will-change:transform;
    }
    .cf-top-scroll:hover .cf-top-marquee{animation-play-state:paused}
    .cf-top-marquee.static{animation:none}
    .cf-top-item{
        display:grid;
        grid-template-columns:24px minmax(0,1fr) auto;
        gap:6px;
        align-items:center;
        min-height:20px;
        font-size:12px;
        color:var(--adm-text-main);
    }
    .cf-top-rank{
        color:var(--adm-text-soft);
        font-variant-numeric:tabular-nums;
        text-align:left;
    }
    .cf-top-path{min-width:0;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--adm-text-muted)}
    .cf-top-stats{display:inline-flex;align-items:center;justify-self:end;gap:8px;min-width:max-content}
    .cf-top-meta{white-space:nowrap;color:var(--adm-accent-strong)}
    .cf-top-size{white-space:nowrap;color:var(--adm-text-soft)}
    @keyframes cf-top-scroll{
        from{transform:translateY(0)}
        to{transform:translateY(calc(-1 * var(--cf-top-scroll-distance, 0px)))}
    }
    .cf-empty{display:flex;align-items:center;justify-content:center;min-height:180px;color:var(--adm-text-soft);font-size:13px;text-align:center}
    .card{padding:16px;border-radius:14px}
    .card-top,.name-row,.card-tools,.card-pills,.card-name-group{display:flex;align-items:center;gap:8px}
    .card-tools{justify-content:flex-end;min-width:0}
    .card-top{justify-content:space-between;margin-bottom:10px}
    .name-row{margin-bottom:14px;min-width:0;justify-content:space-between}
    .card-name-group{min-width:0;flex:1}
    .card-name{font-size:17px;font-weight:700;line-height:1.2;color:var(--adm-text-main);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .card-path-inline{font-size:13px;line-height:1.2;color:var(--adm-text-accent);font-family:monospace;white-space:nowrap;flex-shrink:0;cursor:pointer;border:none;background:transparent;padding:0}
    .card-path-inline:hover{color:var(--adm-text-accent-strong)}
    .card-remark{font-size:14px;color:var(--adm-text-soft);font-weight:400;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .tag{font-size:12px;padding:4px 10px;border-radius:6px}
    .recent-usage-text{font-size:12px;color:var(--adm-text-subtle);line-height:1.4;white-space:nowrap}
    .recent-usage-btn{border:none;background:transparent;padding:0;color:var(--adm-text-subtle);font-size:12px;line-height:1.4;cursor:pointer;white-space:nowrap}
    .recent-usage-btn:hover{color:var(--adm-text-muted)}
    .recent-usage-btn:disabled{opacity:.7;cursor:default}
    .tcping-panel{display:grid;grid-template-columns:1.2fr 1fr 1fr 32px;gap:8px;align-items:center;padding:12px;background:var(--adm-surface-elevated);border-radius:var(--adm-panel-radius-md);margin-bottom:12px;border-bottom:1px solid var(--adm-surface-card)}
    .tcping-cell{text-align:left;min-width:0}
    .tcping-value{font-size:16px;color:var(--adm-text-main);line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .tcping-value.metric{font-size:18px;line-height:1}
    .tcping-value.metric .ms{font-size:12px;margin-left:1px}
    .tcping-value.metric-good{color:var(--adm-success)}
    .tcping-value.metric-mid{color:var(--adm-warn)}
    .tcping-value.metric-bad{color:var(--adm-danger)}
    .tcping-label{font-size:12px;color:var(--adm-text-subtle);margin-top:6px}
    .tcping-note{grid-column:1/-1;font-size:12px;line-height:1.2;color:var(--adm-text-soft)}
    .inline-icon-btn,.tcping-refresh,.icon-action-btn{border:none;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;flex-shrink:0}
    .tcping-refresh{border-radius:0;width:20px;height:20px;margin-left:auto}
    .tcping-refresh.loading{opacity:.6}
    .tcping-refresh.align-right{justify-self:end}
    .tcping-refresh svg{display:block}
    .info-row{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-sec);margin-bottom:10px;padding:11px 12px;background:var(--adm-surface-muted);border-radius:10px}
    .info-row:last-child{margin-bottom:0}
    .info-label{width:64px;flex-shrink:0;color:var(--adm-text-muted)}
    .info-val{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--adm-accent-strong);font-family:monospace}
    .info-row.target-row .info-val.hidden-value{color:var(--adm-text-main)}
    .target-metrics{border-radius:8px;overflow:hidden;margin-bottom:12px}
    .target-metrics .target-row{margin:0;padding:11px 12px;background:var(--adm-surface-accent-soft);border-radius:0}
    .target-metrics .target-row .info-label{width:auto}
    .target-metrics .tcping-panel{margin:0;border-radius:0;background:var(--adm-surface-elevated);border-bottom:0;padding:12px;grid-template-columns:1.2fr 1fr 1fr 20px}
    .target-metrics .target-row .inline-icon-btn,.target-metrics .tcping-panel .tcping-refresh{width:20px;height:20px}
    .card-more{position:relative}
    .card-menu{position:absolute;right:0;top:34px;width:140px;background:var(--card);border:1px solid var(--border);border-radius:10px;box-shadow:var(--adm-shadow-soft);display:none;z-index:30;overflow:hidden}
    .card-menu.show{display:block}
    .card-menu button{width:100%;padding:10px 14px;border:none;background:transparent;color:var(--text);text-align:left;display:flex;align-items:center;gap:8px;cursor:pointer}
    .card-menu button:hover{background:rgba(0,0,0,.05)}
    .card-menu .danger{color:var(--danger)}
    .modal-title{margin:0 0 20px}
    .modal.large{max-width:760px}
    .modal.wide{max-width:820px}
    .modal-content{flex:1 1 auto;min-height:0;max-height:min(70vh,680px);overflow:auto}
    .form-sections{display:grid;gap:24px}
    .form-section{display:grid;gap:12px}
    .form-section + .form-section{padding-top:24px;border-top:1px solid var(--adm-border-soft)}
    .form-section label {display:block; margin-bottom:12px; font-size:16px; opacity:0.8; font-weight:500;}
    .form-grid-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .form-grid-two .form-group{margin:0}
    .section-title{font-size:15px;color:var(--adm-text-main);margin:0 0 14px;font-weight:600}
    .section-desc{font-size:12px;color:var(--adm-text-soft);margin:8px 0 0}
    .target-list{display:grid;gap:10px;margin-bottom:12px}
    .target-item,.config-manage-option,.settings-card-item{border:1px solid var(--adm-border-soft);border-radius:var(--adm-panel-radius-lg);background:var(--adm-surface-subtle);}
    .proxy-line,.target-item.is-primary{border:1px solid var(--adm-border-accent-strong);border-radius:var(--adm-panel-radius-md);background:var(--adm-surface-accent);}
    .target-item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:10px}
    .target-inputs{display:grid;grid-template-columns:minmax(0,180px) minmax(0,1fr);gap:8px;min-width:0}
    .target-inputs .target-line-name{background:var(--adm-surface-card)}
    .target-inputs input{height:40px;border-radius:10px;border:1px solid var(--adm-control-border);background:var(--adm-surface-card);padding:0 12px;color:var(--adm-control-text)}
    .target-actions{display:flex;align-items:center;gap:6px}
    .target-action-btn,.ghost-btn,.primary-btn,.config-manage-btn,.preferred-dns-secondary,.preferred-dns-apply{display:inline-flex;align-items:center;justify-content:center;height:var(--adm-btn-h);border-radius:var(--adm-btn-radius);cursor:pointer;}
    .target-action-btn,.ghost-btn,.config-manage-btn,.preferred-dns-secondary{border:1px solid var(--adm-btn-secondary-border);background:var(--adm-btn-secondary-bg);color:var(--adm-btn-secondary-text);}
    .target-action-btn{width:36px;min-width:36px;padding:0}
    .target-action-btn svg{display:block}
    .target-action-btn:disabled{opacity:.45;cursor:not-allowed}
    .target-add-btn{min-width:120px;display:inline-flex;align-items:center;justify-content:center;gap:8px}
    .target-add-btn svg{display:block}
    .target-summary{margin:0 0 12px;font-size:12px;color:var(--adm-text-soft)}
    .target-summary strong{color:var(--adm-text-accent)}
    .whitelist-setting-row{display:flex;align-items:center;gap:10px;min-height:40px}
    .whitelist-switch{position:relative;width:52px;height:30px;border:none;border-radius:999px;background:var(--adm-switch-bg);cursor:pointer;transition:background .2s ease;padding:0}
    .whitelist-switch::after{content:'';position:absolute;left:3px;top:3px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .2s ease}
    .whitelist-switch.on{background:var(--adm-accent)}
    .whitelist-switch.on::after{transform:translateX(22px)}
    .whitelist-switch-text{font-size:13px;color:var(--adm-switch-text)}
    .whitelist-switch-text.on{color:var(--adm-switch-text-active);font-weight:600}
    .proxy-grid{display:grid;gap:12px}
    .proxy-mode-tabs{display:flex;flex-wrap:nowrap;gap:0;border-radius:10px;overflow-x:auto;overflow-y:hidden;background:var(--adm-pill-muted-bg);border:1px solid var(--adm-border-soft);white-space:nowrap}
    .proxy-mode-tabs.proxy-mode-tabs-fit{display:inline-flex;width:fit-content;max-width:100%;align-self:flex-start}
    .proxy-mode-tabs button{height:40px;min-width:76px;border:none;background:transparent;color:var(--adm-text-main);cursor:pointer;flex:0 0 auto}
    .proxy-mode-tabs button.active{background:var(--adm-btn-primary-bg);color:var(--adm-btn-primary-text)}
    .proxy-line{display:grid;grid-template-columns:72px 1fr auto;gap:10px;align-items:center;padding:12px}
    .proxy-line.proxy-clickable{cursor:pointer;transition:all .15s ease}
    .proxy-line.proxy-clickable:hover{background:var(--adm-accent-hover)}
    .proxy-line.proxy-clickable:active{background:var(--adm-accent-press)}
    .proxy-line strong{font-size:14px;color:var(--adm-text-muted);font-weight:400}
    .proxy-line .val{font-family:monospace;color:var(--adm-text-accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .link-btn{border:none;background:transparent;color:var(--adm-text-accent);cursor:pointer;padding:0}
    .modal-actions-center{display:flex;justify-content:center;gap:16px;margin-top:20px;flex-shrink:0}
    .ghost-btn,.primary-btn{min-width:96px}
    .primary-btn{border:none;background:var(--adm-btn-primary-bg);color:var(--adm-btn-primary-text)}
    .config-manage-content{display:grid;gap:16px}
    .config-manage-option{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:flex-start;padding:14px 16px;cursor:pointer}
    .config-manage-option input{width:18px;height:18px;margin-top:2px}
    .config-manage-option-title{font-size:14px;font-weight:600;color:var(--adm-text-strong)}
    .config-manage-option-desc{margin:4px 0 0;font-size:12px;line-height:1.5;color:var(--adm-text-muted)}
    .config-manage-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .redirect-whitelist-content{display:grid;gap:18px}
    .redirect-whitelist-list{display:grid;gap:10px}
    .redirect-whitelist-empty{padding:16px 12px;border:1px dashed var(--adm-border-soft);border-radius:12px;color:var(--adm-text-soft);font-size:13px;text-align:center}
    .settings-sections{display:grid;gap:28px}
    .settings-block{display:grid;gap:12px}
    .settings-row{display:grid;grid-template-columns:160px 1fr auto;gap:12px;align-items:center}
    .settings-row input,.proxy-item input,.settings-range input,.settings-card-item input,.settings-depth-input{
        height:var(--adm-control-h);
        border-radius:var(--adm-field-radius);
        border:1px solid var(--adm-field-border);
        background:var(--adm-field-bg);
        color:var(--adm-field-text);
        padding:0 12px;
    }
    .settings-row span,.proxy-item span{color:var(--adm-text-muted)}
    .settings-row > span:first-child{color:var(--adm-text-strong)}
    .settings-row-vertical{display:grid;grid-template-columns:160px 1fr;gap:12px;align-items:start}
    .settings-row-vertical.center-align{align-items:center}
    .settings-label-center{align-self:center;display:flex;align-items:center}
    .settings-label-top{align-self:start;display:flex;align-items:center;height:var(--adm-control-h)}
    .settings-field{display:grid;gap:8px}
    .settings-range{display:flex;align-items:center;gap:8px}
    .settings-range input{width:80px;padding:0 10px}
    .settings-note{margin:0;font-size:12px;line-height:1.4;color:var(--adm-text-muted)}
    .settings-note.error{color:var(--adm-danger)}
    .settings-checkbox-label{display:flex;align-items:flex-start;gap:10px;font-size:14px;font-weight:500;line-height:1.5;color:var(--adm-text-strong);cursor:pointer}
    .settings-checkbox-label input{width:16px;height:16px;margin:2px 0 0;accent-color:var(--adm-accent);flex-shrink:0}
    .settings-divider{height:1px;background:var(--adm-border-muted)}
    .settings-advanced-toggle{display:flex;align-items:center;justify-content:space-between;width:100%;padding:12px 14px;border:1px solid var(--adm-border-accent-soft);border-radius:12px;background:linear-gradient(180deg,#f7fbff 0%,#eef5ff 100%);color:var(--adm-text-strong);cursor:pointer}
    .settings-advanced-toggle .meta{display:grid;gap:4px;text-align:left}
    .settings-advanced-toggle .meta strong{font-size:14px;font-weight:600}
    .settings-advanced-toggle .meta small{font-size:12px;line-height:1.4;color:var(--adm-text-accent-muted)}
    .settings-advanced-toggle .arrow{display:inline-flex;align-items:center;justify-content:center;color:var(--adm-text-accent-muted);transition:transform .2s ease}
    .settings-advanced-toggle.open .arrow{transform:rotate(180deg)}
    .settings-advanced-sections{display:grid;gap:16px;padding:14px;border:1px solid var(--adm-border-accent-soft);border-radius:16px;background:linear-gradient(180deg,#fbfdff 0%,#f3f7ff 100%)}
    .settings-depth-picker{position:relative}
    .settings-depth-input{width:100%;height:var(--adm-control-h);padding:0 38px 0 12px;border-radius:var(--adm-field-radius);border:1px solid var(--adm-field-border);background:var(--adm-field-bg);color:var(--adm-field-text);outline:none;font-size:14px;cursor:pointer}
    .settings-depth-input:focus{border-color:var(--adm-accent)}
    .settings-depth-menu .dropdown-item.active{background:rgba(74,128,232,.1);color:var(--adm-text-accent);font-weight:600}
    .proxy-item{display:grid;grid-template-columns:160px 1fr auto;gap:10px;align-items:center;margin-bottom:10px}
    .proxy-item.single{grid-template-columns:minmax(0,1fr) auto}
    .proxy-item input{width:100%}
    .settings-card-item{padding:10px}
    .settings-list-actions{display:flex;align-items:center;gap:8px}
    .settings-clear-row{display:grid;grid-template-columns:160px 1fr;gap:10px;align-items:start}
    .settings-clear-row.center-align{align-items:center}
    .settings-input-with-action{
        display:flex;
        align-items:center;
        gap:8px;
        height:var(--adm-control-h);
        padding:0 8px 0 12px;
        border:1px solid var(--adm-field-border);
        background:var(--adm-field-bg);
        border-radius:var(--adm-field-radius);
    }
    .settings-input-with-action input{flex:1;min-width:0;height:100%;border:none;background:transparent;outline:none;padding:0;color:var(--adm-field-text)}
    .settings-toggle{
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        width:200px;
        border:1px solid var(--adm-segmented-border);
        background:var(--adm-segmented-bg);
        border-radius:var(--adm-segmented-radius);
        overflow:hidden;
    }
    .settings-toggle button{height:var(--adm-segmented-button-h);border:none;background:transparent;color:var(--adm-segmented-text);cursor:pointer;font-size:14px}
    .settings-toggle button.active{background:var(--adm-segmented-active-bg);color:var(--adm-segmented-active-text)}
    .settings-input-group{display:flex;align-items:center;gap:8px}
    .settings-input-group input{width:200px}
    .preferred-dns-panel{display:grid;gap:8px;width:100%}
    .preferred-dns-input-row{display:flex;align-items:center;gap:8px;width:100%}
    .preferred-dns-input{
        display:flex;
        align-items:center;
        flex:1;
        min-width:0;
        height:var(--adm-control-h);
        padding:0 12px;
        border:1px solid var(--adm-field-border);
        background:var(--adm-field-bg);
        border-radius:var(--adm-field-radius);
    }
    .preferred-dns-input input{
        flex:1;
        min-width:0;
        height:100%;
        border:none;
        background:transparent;
        outline:none;
        padding:0;
        color:var(--adm-field-text);
        font-size:14px;
        font-weight:400;
    }
    .preferred-dns-input input::placeholder{color:var(--adm-text-soft)}
    .preferred-dns-apply{width:96px;border:none;background:var(--adm-btn-tonal-bg);color:var(--adm-btn-tonal-text);font-size:14px;flex-shrink:0;}
    .preferred-dns-secondary{width:96px;font-size:14px;}
    .preferred-dns-actions{display:flex;align-items:center;gap:8px}
    .settings-ip-list{display:grid;gap:10px}
    .settings-ip-row{display:grid;grid-template-columns:minmax(0,1fr) 20px;align-items:center;gap:16px}
    .preferred-dns-meta-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .preferred-dns-meta-label{font-size:12px;line-height:16px;color:var(--adm-text-muted);white-space:nowrap}
    .preferred-dns-stack,.preferred-dns-history-btn{padding:2px 8px;border-radius:var(--adm-pill-radius);font-size:12px;line-height:16px;}
    .preferred-dns-stack{display:inline-flex;align-items:center;justify-content:center;background:var(--adm-success-soft);color:var(--adm-success-strong);}
    .preferred-dns-stack.warn{background:var(--adm-warn-soft);color:var(--adm-warn-strong)}
    .preferred-dns-stack.muted{background:var(--adm-pill-muted-bg);color:var(--adm-text-accent-muted)}
    .preferred-dns-history-list{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
    .preferred-dns-history-btn{display:inline-flex;align-items:center;justify-content:center;border:none;background:var(--adm-pill-muted-bg);color:var(--adm-text-accent-muted);cursor:pointer;}
    .preferred-dns-note{margin:0;font-size:12px;line-height:16px;color:var(--adm-text-muted)}
    .preferred-dns-note a{color:var(--adm-text-accent-muted);text-decoration:underline}
    .settings-more-line{display:block;margin-top:2px}
    .icon-action-btn{width:24px;height:24px}
    .icon-action-btn svg{display:block}
    .add-link{border:none;background:transparent;color:var(--adm-text-muted);cursor:pointer;padding:0;text-align:left}
    .empty-hint{text-align:center;padding:40px;color:var(--text-sec);grid-column:1/-1}
    .hidden{display:none !important}
    html.dark .popover-sort-segment{background:rgba(255,255,255,.08)}
    html.dark .popover-sort-option:hover:not(.active){background:rgba(255,255,255,.08)}
    html.dark .activity-pill{background:#22314a;border-color:#4b76bf}
    html.dark .activity-label{color:#9fb4d5}
    html.dark .activity-value{color:#7db1ff}
    html.dark .popover-item,
    html.dark .card-menu button,
    html.dark .section-title,
    html.dark .form-section-title{color:#f3f4f6}
    html.dark .settings-advanced-toggle{background:linear-gradient(180deg,rgba(62,103,177,.22) 0%,rgba(34,57,97,.26) 100%);border-color:#4869a7;color:#f3f4f6}
    html.dark .settings-advanced-sections{background:linear-gradient(180deg,rgba(20,31,52,.9) 0%,rgba(14,22,37,.96) 100%);border-color:#33476f}
    html.dark .settings-depth-menu .dropdown-item.active{background:rgba(125,177,255,.12);color:#7db1ff}
    html.dark .delete-link{color:#ff7b7b}
    html.dark .icon-action-btn svg [stroke="#EF4444"]{stroke:#ff7b7b}
    html.dark .popover-item svg [stroke="#333333"],
    html.dark .icon-btn svg [stroke="#333333"],
    html.dark .inline-icon-btn svg [stroke="#333333"],
    html.dark .tcping-refresh svg [stroke="#333333"]{stroke:#d7deea}
    html.dark .popover-item svg [fill="#333333"],
    html.dark .icon-btn svg [fill="#333333"],
    html.dark .inline-icon-btn svg [fill="#333333"],
    html.dark .tcping-refresh svg [fill="#333333"]{fill:#d7deea}
    html.dark .search-clear svg [stroke="#EF4444"]{stroke:#ff7b7b}
    html.dark .info-row.target-row .info-val.hidden-value{color:var(--adm-text-main)}
    @media(max-width:767px){
        .header{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"title actions" "search search";row-gap:10px}
        .header-title{font-size:18px}
        .header-search{max-width:none}
        .cf-card-title{width:100%;justify-content:space-between}
        .cf-primary-grid{grid-template-columns:minmax(0,1.5fr) minmax(84px,.7fr);gap:8px}
        .cf-top-paths{--cf-top-row-h:24px;--cf-top-gap:6px}
        .cf-top-item{grid-template-columns:22px minmax(0,1fr) auto;align-items:center;column-gap:8px;min-height:20px}
        .cf-top-rank{padding-top:0}
        .cf-top-stats{gap:6px;flex-wrap:nowrap}
        .cf-top-meta,.cf-top-size{font-size:11px}
        .proxy-line{grid-template-columns:1fr}
        .proxy-item{grid-template-columns:1fr}
        .settings-clear-row{grid-template-columns:1fr}
        .settings-row{grid-template-columns:1fr}
        .settings-row-vertical{grid-template-columns:1fr}
        .settings-range{flex-wrap:wrap}
        .settings-input-group input{width:100%}
        .form-grid-two{grid-template-columns:1fr}
        .target-item{grid-template-columns:1fr}
        .target-inputs{grid-template-columns:1fr}
        .card-top,.name-row{align-items:flex-start}
        .card-tools{gap:6px}
        .recent-usage-text{font-size:11px;white-space:normal}
        .tcping-panel{grid-template-columns:1fr 1fr;row-gap:12px}
        .proxy-mode-tabs{width:100%}
        .proxy-mode-tabs.proxy-mode-tabs-fit{width:fit-content;max-width:100%}
        .settings-ip-row{align-items:stretch}
        .preferred-dns-input-row{flex-wrap:wrap}
        .preferred-dns-actions{flex-wrap:wrap}
        .config-manage-actions{grid-template-columns:1fr}
        .modal-actions-center{gap:10px}
        .modal-actions-center>*{flex:1 1 140px}
        input,textarea,select{font-size:16px}
        .desktop-action{display:none}
        .mobile-menu-item{display:flex}
    }
`;
  }
});

// src/admin/ui/admin-template.js
function renderModalActions(actionsMarkup) {
  return `
        <div class="modal-actions-center">
${actionsMarkup}
        </div>`;
}
function renderSwitchControl({ buttonId, textId, onClick, hiddenInputId = "", hiddenValue = "0" }) {
  return `
                    ${hiddenInputId ? `<input id="${hiddenInputId}" type="hidden" value="${hiddenValue}">` : ""}
                    <div class="whitelist-setting-row">
                        <button id="${buttonId}" class="whitelist-switch" type="button" aria-pressed="false" onclick="${onClick}"></button>
                        <span id="${textId}" class="whitelist-switch-text off">关闭</span>
                    </div>`;
}
function renderSettingsToggleRow({ label, buttonId, textId, onClick, note }) {
  return `
                        <div class="settings-row-vertical">
                            <span>${label}</span>
                            <div class="settings-field">
                                <div class="whitelist-setting-row">
                                    <button id="${buttonId}" class="whitelist-switch" type="button" aria-pressed="false" onclick="${onClick}"></button>
                                    <span id="${textId}" class="whitelist-switch-text off">关闭</span>
                                </div>
                                <p class="settings-note">${note}</p>
                            </div>
                        </div>`;
}
function renderSettingsNumberRow({ label, inputId, min, max, onInput, unit, note }) {
  return `
                        <div class="settings-row">
                            <span>${label}</span>
                            <div class="settings-field">
                                <div class="settings-input-group">
                                    <input id="${inputId}" type="number" min="${min}" max="${max}" oninput="${onInput}">
                                    <span>${unit}</span>
                                </div>
                                ${note ? `<p class="settings-note">${note}</p>` : ""}
                            </div>
                            <span></span>
                        </div>`;
}
function renderDashboardShell(ICONS) {
  const versionLabel = formatVersionLabel(WORKER_VERSION);
  return `
<div class="pull-indicator" id="pull-indicator"><div class="pull-spinner">${ICONS.refresh}</div><span id="pull-text">下拉刷新...</span></div>
<div class="container">
    <div class="header">
        <h2 class="header-title">Emby Mate <span class="count-badge" id="node-count">0 个站点</span></h2>
        <div class="toolbar-search header-search">
            <input id="search-input" type="text" placeholder="输入名称或标签快速搜索" oninput="App.filter(this.value)">
            <button class="icon-btn search-clear" id="search-clear" onclick="App.clearSearch()">${ICONS.clear}</button>
        </div>
        <div class="header-actions">
            <div class="header-status">
                <div class="client-rtt-pill" id="client-rtt-pill" title="当前浏览器到 Cloudflare 边缘的往返时延">
                    <span class="client-rtt-label">RTT</span>
                    <span class="client-rtt-value" id="client-rtt-value">--</span>
                    <button class="client-rtt-refresh" id="client-rtt-refresh" type="button" onclick="App.refreshClientRtt(event)" aria-label="刷新 RTT" title="刷新 RTT">${ICONS.refresh}</button>
                </div>
            </div>
            <button class="icon-btn desktop-action" onclick="App.refreshDashboard()" title="刷新列表" aria-label="刷新列表">${ICONS.refresh}</button>
            <button class="icon-btn desktop-action" id="theme-btn" onclick="App.toggleTheme()">${ICONS.moon}</button>
            <div class="menu-wrapper">
                <button class="icon-btn" onclick="App.toggleMenu()">${ICONS.menu}</button>
                <div class="popover" id="main-menu">
                    <div class="popover-section">
                        <div class="popover-sort-row">
                            <span class="popover-sort-label" aria-hidden="true">${ICONS.sort}</span>
                            <div class="popover-sort-segment" role="group" aria-label="站点排序">
                                <button id="menu-sort-path" class="popover-sort-option active" type="button" onclick="App.setSortMode('path',event)">路径名称</button>
                                <button id="menu-sort-recent" class="popover-sort-option" type="button" onclick="App.setSortMode('recent',event)">最近使用</button>
                            </div>
                        </div>
                    </div>
                    <button class="popover-item mobile-menu-item" onclick="App.refreshDashboard();document.getElementById('main-menu').classList.remove('show')">${ICONS.refresh} 刷新列表</button>
                    <button id="theme-menu-btn" class="popover-item mobile-menu-item" onclick="App.toggleTheme();document.getElementById('main-menu').classList.remove('show')">${ICONS.moon} 主题切换</button>
                    <button class="popover-item" onclick="App.openSettingsModal()">${ICONS.settings} 设置</button>
                    <button class="popover-item" onclick="App.openCfSettingsModal()">${ICONS.web} CF设置</button>
                    <button class="popover-item" onclick="App.openConfigManageModal()">${ICONS.data} 配置管理</button>
                    <button id="version-menu-btn" class="popover-item" type="button" onclick="App.openRepositoryHome(event)">${ICONS.github} <span id="version-menu-text">版本 ${versionLabel}</span></button>
                    <div style="height:1px;background:var(--border);margin:4px 0"></div>
                    <button class="popover-item" onclick="App.logout()" style="color:var(--danger)">${ICONS.logout} 退出登录</button>
                </div>
            </div>
        </div>
    </div>
    <div class="card-grid">
        <div id="cf-card-container" class="cf-card-container"></div>
        <div id="list-container" class="node-list"></div>
    </div>
    <button class="fab" onclick="App.openModal()">${ICONS.plus}</button>
</div>`;
}
function renderNodeBasicSection(ICONS) {
  return `
            <section class="form-section">
                <label>基础设置</label>
                <div class="form-grid-two">
                    <div class="form-group"><label><span class="req">*</span>名称</label><input id="in-name" placeholder="可输入中文或英文名称" oninput="App.handleNodeNameInput(this.value)"></div>
                    <div class="form-group"><label><span class="req">*</span>路径</label><input id="in-path" placeholder="自动生成/手动填写，且唯一，如emby" oninput="App.handleNodePathInput(this.value)"></div>
                </div>
                <div class="form-grid-two">
                    <div class="form-group">
                        <label>标签</label>
                        <div class="tag-wrapper">
                            <input id="in-tag" placeholder="请输入或选择已有标签" onfocus="App.showTagSuggestions()" oninput="App.filterTags(this.value)">
                            <div class="tag-arrow">${ICONS.chevronDown}</div>
                            <div class="dropdown-list" id="tag-list"></div>
                        </div>
                    </div>
                    <div class="form-group"><label>备注</label><input id="in-remark" placeholder="请输入备注信息"></div>
                </div>
                <div class="form-group">
                    <label><span class="req">*</span>目标源站</label>
                    <div class="target-summary">可按顺序维护多条回源线路，保存后默认优先使用第一条，故障时再依次切换。</div>
                    <div id="target-list" class="target-list"></div>
                    <button class="ghost-btn target-add-btn" type="button" onclick="App.addTargetDraft()">${ICONS.plus} 添加目标</button>
                </div>
            </section>`;
}
function renderNodeAdvancedSection() {
  return `
            <section class="form-section">
                <label>高级设置</label>
                <div class="form-group">
                    <label>重定向白名单</label>
                    ${renderSwitchControl({
    hiddenInputId: "in-redirect-whitelist-enabled",
    buttonId: "in-redirect-whitelist-switch",
    textId: "in-redirect-whitelist-text",
    onClick: "App.setRedirectWhitelistEnabled(document.getElementById('in-redirect-whitelist-enabled').value!=='1')"
  }).trim()}
                    <p class="section-desc">建议网盘服/302服开启</p>
                </div>
                <div class="form-group">
                    <label>自定义请求头</label>
                    ${renderSwitchControl({
    hiddenInputId: "in-node-headers-enabled",
    buttonId: "in-node-headers-switch",
    textId: "in-node-headers-text",
    onClick: "App.setNodeHeadersEnabled(document.getElementById('in-node-headers-enabled').value!=='1')"
  }).trim()}
                    <div id="node-headers-content" class="redirect-whitelist-content hidden">
                        <div id="node-headers-list" class="redirect-whitelist-list"></div>
                        <div class="settings-list-actions">
                            <button id="node-headers-add" class="preferred-dns-secondary" type="button" onclick="App.addNodeHeaderRow()">添加请求头</button>
                        </div>
                    </div>
                    <p class="section-desc">支持覆盖或新增上游请求头，仅对当前站点的回源请求生效。自动忽略Host、X-Forwarded-*、Connection、Upgrade等禁止项。</p>
                </div>
                <div class="form-group">
                    <label>真实客户端 IP 透传</label>
                    <input id="in-real-client-ip-mode" type="hidden" value="forward">
                    <div id="real-client-ip-mode-list" class="proxy-mode-tabs proxy-mode-tabs-fit">
                        <button type="button" data-real-client-ip-mode="forward" onclick="App.setRealClientIpMode('forward', event)">默认透传</button>
                        <button type="button" data-real-client-ip-mode="strip" onclick="App.setRealClientIpMode('strip', event)">仅X-Real-IP</button>
                        <button type="button" data-real-client-ip-mode="disable" onclick="App.setRealClientIpMode('disable', event)">关闭透传</button>
                    </div>
                    <p class="section-desc">默认透传会同时补写 <code>X-Real-IP</code> 和 <code>X-Forwarded-For</code>；仅X-Real-IP 只保留 <code>X-Real-IP</code>；关闭透传会强制不回传这两个请求头。</p>
                </div>
            </section>`;
}
function renderNodeModal(ICONS) {
  return `
<div class="modal-mask" id="modal-mask">
    <div class="modal large" id="modal">
        <h3 id="modal-title" class="modal-title">新建站点</h3>
        <div class="modal-content form-sections">
${renderNodeBasicSection(ICONS)}
${renderNodeAdvancedSection()}
        </div>
${renderModalActions(`            <button class="ghost-btn" onclick="App.closeModal()">取消</button>
            <button class="primary-btn" onclick="App.saveNode()">保存</button>`)}
    </div>
</div>`;
}
function renderProxyModal() {
  return `
<div class="modal-mask" id="proxy-mask">
    <div class="modal large" id="proxy-modal">
        <h3 style="margin:0 0 18px">复制代理地址</h3>
        <div class="modal-content">
            <div class="form-group">
                <label>代理模式</label>
                <div id="proxy-mode-list" class="proxy-mode-tabs"></div>
            </div>
            <div class="form-group">
                <label>代理地址</label>
                <div class="proxy-grid" id="proxy-address-list"></div>
            </div>
        </div>
${renderModalActions(`            <button class="ghost-btn" onclick="App.closeProxyDialog()">关闭</button>`)}
    </div>
</div>`;
}
function renderLatencySettingsBlock() {
  return `
            <div class="settings-block">
                <h4 class="section-title">延迟测试</h4>
                <div class="settings-row">
                    <span>TCP测试次数</span>
                    <div class="settings-input-group">
                        <input id="tcping-tcp-count" type="number" min="1" max="10" oninput="App.updateTcpingSetting('tcp.count', this.value)">
                        <span>次</span>
                    </div>
                    <span></span>
                </div>
                <div class="settings-row">
                    <span>TCP超时时间</span>
                    <div class="settings-input-group">
                        <input id="tcping-tcp-timeout" type="number" min="200" max="10000" oninput="App.updateTcpingSetting('tcp.timeoutMs', this.value)">
                        <span>ms</span>
                    </div>
                    <span></span>
                </div>
                <div class="settings-row-vertical center-align">
                    <span class="settings-label-center">TCP响应时间</span>
                    <div class="settings-range">
                        <input id="tcping-tcp-latency-low" type="number" oninput="App.updateTcpingSetting('tcp.latencyWarnLow', this.value)">
                        <span>ms</span>
                        <span>~</span>
                        <input id="tcping-tcp-latency-high" type="number" oninput="App.updateTcpingSetting('tcp.latencyWarnHigh', this.value)">
                        <span>ms</span>
                    </div>
                </div>
                <div class="settings-row">
                    <span>HEAD测试次数</span>
                    <div class="settings-input-group">
                        <input id="tcping-head-count" type="number" min="1" max="10" oninput="App.updateTcpingSetting('head.count', this.value)">
                        <span>次</span>
                    </div>
                    <span></span>
                </div>
                <div class="settings-row">
                    <span>HEAD超时时间</span>
                    <div class="settings-input-group">
                        <input id="tcping-head-timeout" type="number" min="200" max="10000" oninput="App.updateTcpingSetting('head.timeoutMs', this.value)">
                        <span>ms</span>
                    </div>
                    <span></span>
                </div>
                <div class="settings-row-vertical center-align">
                    <span class="settings-label-center">HEAD响应时间</span>
                    <div class="settings-range">
                        <input id="tcping-head-latency-low" type="number" oninput="App.updateTcpingSetting('head.latencyWarnLow', this.value)">
                        <span>ms</span>
                        <span>~</span>
                        <input id="tcping-head-latency-high" type="number" oninput="App.updateTcpingSetting('head.latencyWarnHigh', this.value)">
                        <span>ms</span>
                    </div>
                </div>
                <div class="settings-row">
                    <span></span>
                    <p class="settings-note">边缘TCP与边缘HEAD独立阈值判定：绿色(优) / 橙色(中) / 红色(差)。样本取中位数以降低抖动。</p>
                    <span></span>
                </div>
            </div>`;
}
function renderThirdPartyProxyBlock() {
  return `
            <div class="settings-block">
                <h4 class="section-title">第三方反代</h4>
                <p class="settings-note">可添加第三方反代，如@liuer，通过复制反代地址更便捷地使用第三方反代</p>
                <div id="settings-proxy-list"></div>
                <div class="settings-list-actions"><button class="preferred-dns-secondary" type="button" onclick="App.addThirdPartyProxy()">添加反代</button></div>
            </div>`;
}
function renderRedirectWhitelistBlock() {
  return `
            <div class="settings-block">
                <h4 class="section-title">重定向白名单</h4>
                <p class="settings-note">给确定适合直连的域名或关键词开绿灯。命中后会尽量少绕一层代理，适合 302 分流、网盘服或国内跳转服。</p>
                <div id="settings-redirect-whitelist-list"></div>
                <div class="settings-list-actions"><button id="settings-redirect-whitelist-add" class="preferred-dns-secondary" type="button" onclick="App.addRedirectWhitelistEntry()">添加规则</button></div>
            </div>`;
}
function renderProtocolStrategyBlock() {
  return `
                    <div class="settings-block">
                        <h4 class="section-title">基础协议策略</h4>
                        <p class="settings-note">主要影响 Worker 和源站怎么握手、什么时候自动回退。普通用户一般不用动，遇到某个站点一直转圈、403 或忽快忽慢时再逐项试。</p>
${renderSettingsToggleRow({
    label: "优先启用 H2",
    buttonId: "settings-enable-h2-switch",
    textId: "settings-enable-h2-text",
    onClick: "App.toggleSettingsFlag('enableH2')",
    note: "部分源站走 H2 会更快；如果图片或视频偶尔转圈、报 52x/403，就先关掉再试。"
  })}
${renderSettingsToggleRow({
    label: "优先启用 HTTP/3 QUIC",
    buttonId: "settings-enable-h3-switch",
    textId: "settings-enable-h3-text",
    onClick: "App.toggleSettingsFlag('enableH3')",
    note: "适合网络质量好、源站也支持 QUIC 的场景；如果速度忽快忽慢或弱网更不稳，就关闭。"
  })}
${renderSettingsToggleRow({
    label: "峰值时自动降级",
    buttonId: "settings-peak-downgrade-switch",
    textId: "settings-peak-downgrade-text",
    onClick: "App.toggleSettingsFlag('peakDowngrade')",
    note: "高峰时自动退回更稳的回源方式，优先保住起播和持续播放，不去硬顶最快协议。"
  })}
${renderSettingsToggleRow({
    label: "协议回退 / 403 重试",
    buttonId: "settings-protocol-fallback-switch",
    textId: "settings-protocol-fallback-text",
    onClick: "App.toggleSettingsFlag('protocolFallback')",
    note: "第一次回源被拒绝、握手失败或遇到 403 时，自动换一种更稳的请求方式再试一次。"
  })}
                    </div>`;
}
function renderMetadataPrewarmBlock(ICONS) {
  return `
                    <div class="settings-block">
                        <h4 class="section-title">轻量级元数据预热</h4>
${renderSettingsToggleRow({
    label: "开启轻量级元数据预热",
    buttonId: "settings-enable-prewarm-switch",
    textId: "settings-enable-prewarm-text",
    onClick: "App.toggleSettingsFlag('enablePrewarm')",
    note: "播放前顺手把海报、播放列表和字幕先准备好，详情页和首播通常会更顺；不会去预热视频大文件。"
  })}
${renderSettingsNumberRow({
    label: "元数据预热缓存时长",
    inputId: "settings-prewarm-cache-ttl",
    min: "0",
    max: "3600",
    onInput: "App.updateSettingsValue('prewarmCacheTtl', this.value)",
    unit: "s",
    note: "预热结果在 Worker 里保留多久。时间越长，重复进入同一剧集越可能直接命中。"
  })}
                        <div class="settings-row-vertical">
                            <span>预热深度</span>
                            <div class="settings-field">
                                <div class="tag-wrapper settings-depth-picker" onclick="App.togglePrewarmDepthMenu(event)">
                                    <input id="settings-prewarm-depth-label" class="settings-depth-input" readonly placeholder="请选择预热深度">
                                    <span class="tag-arrow">${ICONS.chevronDown}</span>
                                    <div class="dropdown-list settings-depth-menu" id="settings-prewarm-depth-menu"></div>
                                </div>
                                <input id="settings-prewarm-depth" type="hidden">
                                <p class="settings-note">只想让页面图片更快，就选“仅预热海报”；想把播放列表和字幕也提前准备好，就选“海报 + 索引”。</p>
                            </div>
                        </div>
                    </div>`;
}
function renderDirectResourceBlock() {
  return `
                    <div class="settings-block">
                        <h4 class="section-title">资源直连分流</h4>
${renderSettingsToggleRow({
    label: "静态资源直连",
    buttonId: "settings-direct-static-assets-switch",
    textId: "settings-direct-static-assets-text",
    onClick: "App.toggleSettingsFlag('directStaticAssets')",
    note: "让 css、js、favicon 这类前端静态文件直接回源，不再绕完整代理链，通常能更快打开页面。"
  })}
${renderSettingsToggleRow({
    label: "HLS / DASH 资源直连",
    buttonId: "settings-direct-hls-dash-switch",
    textId: "settings-direct-hls-dash-text",
    onClick: "App.toggleSettingsFlag('directHlsDash')",
    note: "让 m3u8、mpd 和分片资源直接回源。适合已经确认“直连更快”的站点，不确定时保持默认即可。"
  })}
                    </div>`;
}
function renderRedirectStrategyBlock() {
  return `
                    <div class="settings-block">
                        <h4 class="section-title">跳转代理策略</h4>
${renderSettingsToggleRow({
    label: "同源跳转继续代理",
    buttonId: "settings-source-same-origin-proxy-switch",
    textId: "settings-source-same-origin-proxy-text",
    onClick: "App.toggleSettingsFlag('sourceSameOriginProxy')",
    note: "上游把你跳回同站地址时，是否仍让这个面板继续代转。开启更稳，关闭路径更短。"
  })}
${renderSettingsToggleRow({
    label: "强制外链继续代理",
    buttonId: "settings-force-external-proxy-switch",
    textId: "settings-force-external-proxy-text",
    onClick: "App.toggleSettingsFlag('forceExternalProxy')",
    note: "上游跳到外链后，是否仍由这个面板继续代转。开启兼容性更好，关闭时有些站可能更快。"
  })}
                    </div>`;
}
function renderDiagnosticsDebugBlock() {
  return `
                    <div class="settings-block">
                        <h4 class="section-title">代理调试诊断</h4>
${renderSettingsToggleRow({
    label: "附加异常代理诊断头",
    buttonId: "settings-debug-proxy-headers-switch",
    textId: "settings-debug-proxy-headers-text",
    onClick: "App.toggleSettingsFlag('debugProxyHeaders')",
    note: "仅在异常媒体响应上附加额外 X-Proxy-* 头，可能暴露上游 host/status，排障完成后建议关闭。"
  })}
                    </div>`;
}
function renderUpstreamProtectionBlock() {
  return `
                    <div class="settings-block">
                        <h4 class="section-title">上游请求防挂死保护</h4>
${renderSettingsNumberRow({
    label: "上游超时保护",
    inputId: "settings-upstream-timeout-ms",
    min: "0",
    max: "180000",
    onInput: "App.updateSettingsValue('upstreamTimeoutMs', this.value)",
    unit: "ms",
    note: "单次回源最多等多久就判定失败。太短容易误杀慢源，太长又会一直转圈。"
  })}
${renderSettingsNumberRow({
    label: "重试次数",
    inputId: "settings-upstream-retry-attempts",
    min: "0",
    max: "3",
    onInput: "App.updateSettingsValue('upstreamRetryAttempts', this.value)",
    unit: "次",
    note: "第一次回源失败后最多再试几次。次数越多容错越强，但出问题时等待也会更长。"
  })}
                    </div>`;
}
function renderAdvancedSettingsBlock(ICONS) {
  return `
            <div class="settings-block">
                <button id="settings-advanced-toggle" class="settings-advanced-toggle" type="button" onclick="App.toggleSettingsAdvanced(event)">
                    <span class="meta">
                        <strong>高级设置</strong>
                        <small>这些是底层网络策略。默认值已经按稳定优先调好，只有遇到特殊站点时才建议修改。</small>
                    </span>
                    <span class="arrow">${ICONS.chevronDown}</span>
                </button>
                <div id="settings-advanced-sections" class="settings-advanced-sections hidden">
${renderProtocolStrategyBlock()}
                    <div class="settings-divider"></div>
${renderMetadataPrewarmBlock(ICONS)}
                    <div class="settings-divider"></div>
${renderDirectResourceBlock()}
                    <div class="settings-divider"></div>
${renderRedirectStrategyBlock()}
                    <div class="settings-divider"></div>
${renderDiagnosticsDebugBlock()}
                    <div class="settings-divider"></div>
${renderUpstreamProtectionBlock()}
                </div>
            </div>`;
}
function renderSettingsModal(ICONS) {
  return `
<div class="modal-mask" id="settings-mask">
    <div class="modal wide" id="settings-modal">
        <h3 style="margin:0 0 18px">设置</h3>
        <div class="modal-content settings-sections">
${renderLatencySettingsBlock()}
            <div class="settings-divider"></div>
${renderThirdPartyProxyBlock()}
            <div class="settings-divider"></div>
${renderRedirectWhitelistBlock()}
            <div class="settings-divider"></div>
${renderAdvancedSettingsBlock(ICONS)}
        </div>
${renderModalActions(`            <button class="ghost-btn" onclick="App.resetSettingsModal()">重置</button>
            <button class="ghost-btn" onclick="App.closeSettingsModal()">关闭</button>
            <button class="primary-btn" onclick="App.saveConfig()">保存</button>`)}
    </div>
</div>`;
}
function renderCfSettingsBlock(ICONS) {
  return `
            <div class="settings-block">
                <h4 class="section-title">Cloudflare设置</h4>
                <div class="settings-row-vertical">
                    <span>首页CF指标卡片</span>
                    <div class="settings-field">
                        <div class="settings-toggle">
                            <button id="cf-show-card-show" type="button" onclick="App.setCfShowCard(true)">展示</button>
                            <button id="cf-show-card-hide" type="button" onclick="App.setCfShowCard(false)">隐藏</button>
                        </div>
                        <p class="settings-note">下方参数输入正确才能在正确展示</p>
                    </div>
                </div>
                <div class="settings-row">
                    <span>CF指标自动刷新</span>
                    <div class="settings-input-group">
                        <input id="cf-auto-refresh" type="number" min="30" max="3600" oninput="App.updateCfMetricSetting('autoRefreshSeconds', this.value)">
                        <span>s</span>
                    </div>
                    <span></span>
                </div>
                <div class="settings-clear-row center-align">
                    <span class="settings-label-center">Cloudflare账户ID</span>
                    <div class="settings-input-with-action">
                        <input id="cf-account-id" placeholder="ID为32位十六进制字符串" oninput="App.updateCfMetricSetting('accountId', this.value)">
                        <button class="icon-action-btn" aria-label="清空账户ID" onclick="App.clearCfMetricField('accountId')">${ICONS.clear}</button>
                    </div>
                </div>
                <div class="settings-row">
                    <span></span>
                    <p class="settings-note">Worker概览页右侧能查看到Account ID，更多获取方法查看 <a class="link-btn" target="_blank" rel="noopener noreferrer" href="https://docs.thorn.red/articles/6d89ow4vgfghgnn8#U-ULxqq3U1HqjwYqmFZpjF4">这里</a></p>
                    <span></span>
                </div>
                <div class="settings-clear-row center-align">
                    <span class="settings-label-center">Cloudflare API 令牌</span>
                    <div class="settings-input-with-action">
                        <input id="cf-api-token" placeholder="请输入token" oninput="App.updateCfMetricSetting('apiToken', this.value)">
                        <button class="icon-action-btn" aria-label="清空API令牌" onclick="App.clearCfMetricField('apiToken')">${ICONS.clear}</button>
                    </div>
                </div>
                <div class="settings-row">
                    <span></span>
                    <p class="settings-note">点击<a class="link-btn" target="_blank" rel="noopener noreferrer" href="https://dash.cloudflare.com/profile/api-tokens">这里</a>创建，建议按功能授权：<br><strong>[CF指标]</strong><br>A. <strong>账户 - 账户分析 - 读取（Account-Account Analytics:Read）</strong>：用于 GraphQL 分析查询。<br>B. <strong>区域 - 分析 - 读取（Zone-Analytics:Read）</strong>：用于近24小时站点流量、请求数和 Top10 路径。<br>C. <strong>区域 - 区域 - 读取（Zone-Zone:Read）</strong>：用于识别当前域名归属的 Zone。<br><strong>[优选域名/IP]</strong><br>D. <strong>区域 - DNS - 编辑（Zone-DNS:Edit）</strong>：用于读取并同步同名 DNS 记录。<br><strong>[账户资源]</strong><br>建议选择：<strong>包括 - 当前账户（或所有账户）</strong>。<br><strong>[区域资源]</strong><br>建议选择：<strong>包括 - 特定区域（Specific zone） - Emby Mate 使用的站点</strong>，减少误授权风险。</p>
                    <span></span>
                </div>
                <div class="settings-clear-row">
                    <span class="settings-label-center">Worker管理页</span>
                    <div class="settings-input-with-action">
                        <input id="cf-worker-url" placeholder="请输入该项目的worker页面，如https://dash.cloudflare.com/xxx/workers/services/view/xxx/production/metrics" oninput="App.updateCfMetricSetting('workerUrl', this.value)">
                        <button class="icon-action-btn" aria-label="清空Worker管理页" onclick="App.clearCfMetricField('workerUrl')">${ICONS.clear}</button>
                    </div>
                </div>
                <div class="settings-row-vertical">
                    <span class="settings-label-top">优选域名/IP</span>
                    <div class="settings-field">
                        <div class="settings-toggle preferred-mode-toggle">
                            <button id="cf-preferred-mode-domain" type="button" onclick="App.setPreferredDnsMode('domain')">域名</button>
                            <button id="cf-preferred-mode-ip" type="button" onclick="App.setPreferredDnsMode('ip')">IP</button>
                        </div>
                        <div id="cf-preferred-domain-panel" class="preferred-dns-panel">
                            <div class="preferred-dns-input-row">
                                <div class="preferred-dns-input">
                                    <input id="cf-preferred-domain" placeholder="请输入CNAME目标域名" oninput="App.updatePreferredDomainInput(this.value)">
                                </div>
                                <button class="preferred-dns-apply" type="button" onclick="App.applyPreferredRecords()">应用</button>
                            </div>
                            <div id="cf-dns-capabilities"></div>
                            <div id="cf-domain-history"></div>
                            <p class="preferred-dns-note">更多优选域名查看<a target="_blank" rel="noopener noreferrer" href="https://cf.090227.xyz/">这里</a></p>
                        </div>
                        <div id="cf-preferred-ip-panel" class="preferred-dns-panel hidden">
                            <div id="cf-preferred-ip-list" class="settings-ip-list"></div>
                            <div class="preferred-dns-actions">
                                <button class="preferred-dns-secondary" type="button" onclick="App.addPreferredIpInput()">添加IP</button>
                                <button class="preferred-dns-apply" type="button" onclick="App.applyPreferredRecords()">应用</button>
                            </div>
                            <div id="cf-ip-history"></div>
                        </div>
                    </div>
                </div>
                <div class="settings-row">
                    <span></span>
                    <p class="settings-note" id="cf-dns-status">当前域名记录状态：未读取</p>
                    <span></span>
                </div>
            </div>`;
}
function renderCfSettingsModal(ICONS) {
  return `
<div class="modal-mask" id="cf-settings-mask">
    <div class="modal wide" id="cf-settings-modal">
        <h3 style="margin:0 0 18px">CF设置</h3>
        <div class="modal-content settings-sections">
${renderCfSettingsBlock(ICONS)}
        </div>
${renderModalActions(`            <button class="ghost-btn" onclick="App.closeCfSettingsModal()">关闭</button>
            <button class="primary-btn" onclick="App.saveCfSettings()">保存</button>`)}
    </div>
</div>`;
}
function renderConfigManageModal(ICONS) {
  return `
<div class="modal-mask" id="config-manage-mask">
    <div class="modal" id="config-manage-modal">
        <h3 class="modal-title">配置导入/导出</h3>
        <div class="modal-content config-manage-content">
            <label class="config-manage-option">
                <input id="config-manage-include-all" type="checkbox" onchange="App.setConfigManageIncludeAll(this.checked)">
                <div>
                    <div class="config-manage-option-title">全部配置</div>
                    <p class="config-manage-option-desc">默认仅导入/导出站点信息。勾选后同时包含设置与 CF 设置中的全部字段信息。</p>
                </div>
            </label>
            <div class="config-manage-actions">
                <button class="config-manage-btn" type="button" onclick="App.exportConfigBundle()">${ICONS.download} 导出配置</button>
                <button class="config-manage-btn" type="button" onclick="App.triggerConfigImport()">${ICONS.upload} 导入配置</button>
            </div>
        </div>
${renderModalActions(`            <button class="ghost-btn" onclick="App.closeConfigManageModal()">关闭</button>`)}
    </div>
</div>`;
}
function renderAdminMarkup(ICONS) {
  return [
    renderDashboardShell(ICONS),
    renderNodeModal(ICONS),
    renderProxyModal(),
    renderSettingsModal(ICONS),
    renderCfSettingsModal(ICONS),
    renderConfigManageModal(ICONS),
    `<input type="file" id="file-in" hidden accept=".json" onchange="App.import(this)">`
  ].join("\n\n");
}
var init_admin_template = __esm({
  "src/admin/ui/admin-template.js"() {
    init_version();
  }
});

// src/admin/ui/admin-page.js
function renderAdminUI() {
  const body = [
    "<style>",
    ADMIN_UI_STYLES,
    "</style>",
    renderAdminMarkup(ADMIN_ICONS),
    buildAdminInlineScript(ADMIN_ICONS)
  ].join("\n");
  return new Response(this.getHead("Emby Mate 管理台").replace("${body}", body), ADMIN_RESPONSE_INIT);
}
var ADMIN_RESPONSE_INIT;
var init_admin_page = __esm({
  "src/admin/ui/admin-page.js"() {
    init_icons();
    init_admin_script();
    init_admin_styles();
    init_admin_template();
    ADMIN_RESPONSE_INIT = {
      headers: {
        "Content-Type": "text/html",
        "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self';"
      }
    };
  }
});

// src/admin/ui/page.js
var UI;
var init_page = __esm({
  "src/admin/ui/page.js"() {
    init_page_shell();
    init_admin_page();
    UI = {
      ...UI_SHELL,
      renderAdminUI
    };
  }
});

// src/admin/auth.js
var Auth;
var init_auth = __esm({
  "src/admin/auth.js"() {
    init_defaults();
    init_runtime_state();
    init_page();
    Auth = {
      /**
       * 智能获取 KV 绑定对象 (兼容多种环境变量命名)
       * @param {Object} env worker 环境变量
       * @returns {Object|null} KV 命名空间对象
       */
      getKV(env) {
        return env.ENI_KV || env.KV || env.EMBY_KV || env.EMBY_PROXY;
      },
      /**
       * 处理登录请求
       * @param {Request} request
       * @param {Object} env
       */
      async handleLogin(request, env) {
        const ip = request.headers.get("cf-connecting-ip") || "unknown";
        const kv = this.getKV(env);
        try {
          const formData = await request.formData();
          const passwordValue = formData.get("password");
          const password = typeof passwordValue === "string" ? passwordValue.trim() : "";
          const secret = env.JWT_SECRET || env.ADMIN_PASS;
          if (password === env.ADMIN_PASS) {
            if (kv) kv.delete(`fail:${ip}`).catch(() => {
            });
            const jwt = await this.generateJwt(secret, Config.Defaults.JwtExpiry);
            return new Response("Login Success", {
              status: 302,
              headers: {
                "Location": "/admin",
                "Set-Cookie": `auth_token=${jwt}; Path=/; Max-Age=${Config.Defaults.JwtExpiry}; HttpOnly; Secure; SameSite=Strict`
              }
            });
          }
          let count = 0;
          if (kv) {
            const failKey = `fail:${ip}`;
            const prev = await kv.get(failKey);
            count = prev ? parseInt(prev) + 1 : 1;
            if (count <= Config.Defaults.MaxLoginAttempts) {
              kv.put(failKey, count.toString(), { expirationTtl: Config.Defaults.LoginLockDuration }).catch(() => {
              });
            }
          }
          if (count >= Config.Defaults.MaxLoginAttempts) return UI.renderLockedPage(ip);
          return UI.renderLoginPage(`密码错误 (剩余次数: ${Config.Defaults.MaxLoginAttempts - count})`);
        } catch (e) {
          return UI.renderLoginPage("请求无效");
        }
      },
      async verifyRequest(request, env) {
        const cookie = request.headers.get("Cookie");
        if (!cookie) return false;
        const match = cookie.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;
        if (!token) return false;
        return await this.verifyJwt(token, env.JWT_SECRET || env.ADMIN_PASS);
      },
      verifyAdminPostOrigin(request) {
        const requestOrigin = new URL(request.url).origin;
        const secFetchSite = (request.headers.get("Sec-Fetch-Site") || "").toLowerCase();
        if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "none") return false;
        const origin = request.headers.get("Origin");
        if (origin && origin !== requestOrigin) return false;
        const referer = request.headers.get("Referer");
        if (!origin && referer) {
          try {
            if (new URL(referer).origin !== requestOrigin) return false;
          } catch (_) {
            return false;
          }
        }
        return true;
      },
      async generateJwt(secret, expiresIn) {
        const header = { alg: "HS256", typ: "JWT" };
        const payload = { sub: "admin", exp: Math.floor(Date.now() / 1e3) + expiresIn };
        const encHeader = this.base64UrlEncode(JSON.stringify(header));
        const encPayload = this.base64UrlEncode(JSON.stringify(payload));
        const signature = await this.sign(secret, `${encHeader}.${encPayload}`);
        return `${encHeader}.${encPayload}.${signature}`;
      },
      async verifyJwt(token, secret) {
        const parts = token.split(".");
        if (parts.length !== 3) return false;
        const [h, p, s] = parts;
        const expected = await this.sign(secret, `${h}.${p}`);
        if (!this.timingSafeEqual(s, expected)) return false;
        try {
          const payload = JSON.parse(this.base64UrlDecode(p));
          return payload.exp > Math.floor(Date.now() / 1e3);
        } catch (e) {
          return false;
        }
      },
      timingSafeEqual(a, b) {
        const s1 = String(a || "");
        const s2 = String(b || "");
        const maxLen = Math.max(s1.length, s2.length);
        let diff = s1.length ^ s2.length;
        for (let i = 0; i < maxLen; i++) {
          const c1 = i < s1.length ? s1.charCodeAt(i) : 0;
          const c2 = i < s2.length ? s2.charCodeAt(i) : 0;
          diff |= c1 ^ c2;
        }
        return diff === 0;
      },
      base64UrlEncode(str) {
        return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      },
      base64UrlDecode(str) {
        return atob(str.replace(/-/g, "+").replace(/_/g, "/"));
      },
      async sign(secret, data) {
        const enc = new TextEncoder();
        let key = GLOBALS.CryptoKeyCache.get(secret);
        if (!key) {
          key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
          GLOBALS.CryptoKeyCache.set(secret, key);
        }
        const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
        return this.base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
      }
    };
  }
});

// src/config/normalize.js
function clampInteger2(value, fallback, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(num)));
}
function normalizeNodeNameList(value) {
  const source = Array.isArray(value) ? value : String(value || "").split(/[\n\r,，]+/);
  const seen = /* @__PURE__ */ new Set();
  const names = [];
  for (const item of source) {
    const normalized = String(item || "").trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    names.push(normalized);
  }
  return names;
}
function normalizeConfig(config = {}) {
  const cfInput = config.cfMetrics || {};
  const sourceDirectNodes = normalizeNodeNameList(
    config.sourceDirectNodes ?? config.directSourceNodes ?? config.nodeDirectList ?? []
  );
  const redirectCachePersistenceEnabled = config.redirectCachePersistenceEnabled === true;
  const redirectCachePersistenceTtlSeconds = Math.max(
    60,
    Math.min(1800, Number(config.redirectCachePersistenceTtlSeconds) || 120)
  );
  const redirectWhitelistEntries = normalizeRedirectWhitelistEntries(
    Array.isArray(config.redirectWhitelistEntries) && config.redirectWhitelistEntries.length ? config.redirectWhitelistEntries : config.redirectWhitelistDomains
  );
  const autoRefreshSeconds = Math.max(
    30,
    Math.min(3600, Number(cfInput.autoRefreshSeconds) || DEFAULT_CF_METRICS_CONFIG.autoRefreshSeconds)
  );
  const rawTcping = config && typeof config.tcping === "object" && config.tcping ? config.tcping : {};
  const hasLegacyFlat = ["count", "timeoutMs", "latencyWarnLow", "latencyWarnHigh"].some((key) => rawTcping[key] != null);
  const tcpingInput = hasLegacyFlat ? {
    tcp: rawTcping,
    head: {}
  } : rawTcping;
  const normalizeProbe = (input = {}, defaults = {}) => {
    const count = Math.max(1, Math.min(10, Number(input.count ?? defaults.count)));
    const timeoutMs = Math.max(200, Math.min(1e4, Number(input.timeoutMs ?? defaults.timeoutMs)));
    const low = Number(input.latencyWarnLow ?? defaults.latencyWarnLow);
    const high = Number(input.latencyWarnHigh ?? defaults.latencyWarnHigh);
    return {
      count: Number.isFinite(count) ? Math.round(count) : defaults.count,
      timeoutMs: Number.isFinite(timeoutMs) ? Math.round(timeoutMs) : defaults.timeoutMs,
      latencyWarnLow: Number.isFinite(low) ? low : defaults.latencyWarnLow,
      latencyWarnHigh: Number.isFinite(high) ? high : defaults.latencyWarnHigh
    };
  };
  const tcpCfg = normalizeProbe(tcpingInput.tcp || {}, DEFAULT_TCPING_CONFIG.tcp);
  const headCfg = normalizeProbe(tcpingInput.head || {}, DEFAULT_TCPING_CONFIG.head);
  if (tcpCfg.latencyWarnLow > tcpCfg.latencyWarnHigh) tcpCfg.latencyWarnLow = tcpCfg.latencyWarnHigh;
  if (headCfg.latencyWarnLow > headCfg.latencyWarnHigh) headCfg.latencyWarnLow = headCfg.latencyWarnHigh;
  return {
    theme: config.theme || "auto",
    thirdPartyProxies: Array.isArray(config.thirdPartyProxies) ? config.thirdPartyProxies : [],
    redirectCachePersistenceEnabled,
    redirectCachePersistenceTtlSeconds: Number.isFinite(redirectCachePersistenceTtlSeconds) ? Math.round(redirectCachePersistenceTtlSeconds) : 120,
    redirectWhitelistEntries,
    redirectWhitelistDomains: normalizeRedirectWhitelistDomains(redirectWhitelistEntries),
    tcping: { tcp: tcpCfg, head: headCfg },
    cfMetrics: {
      accountId: String(cfInput.accountId || DEFAULT_CF_METRICS_CONFIG.accountId),
      apiToken: String(cfInput.apiToken || DEFAULT_CF_METRICS_CONFIG.apiToken),
      workerUrl: String(cfInput.workerUrl || DEFAULT_CF_METRICS_CONFIG.workerUrl),
      showCard: cfInput.showCard !== false,
      autoRefreshSeconds
    },
    enableH2: config.enableH2 === true,
    enableH3: config.enableH3 === true,
    peakDowngrade: config.peakDowngrade !== false,
    protocolFallback: config.protocolFallback !== false,
    enablePrewarm: config.enablePrewarm !== false,
    prewarmDepth: normalizePrewarmDepth(config.prewarmDepth),
    prewarmCacheTtl: clampInteger2(
      config.prewarmCacheTtl,
      DEFAULT_PREWARM_TTL,
      0,
      3600
    ),
    directStaticAssets: config.directStaticAssets !== false,
    directHlsDash: config.directHlsDash !== false,
    sourceSameOriginProxy: config.sourceSameOriginProxy !== false,
    forceExternalProxy: config.forceExternalProxy !== false,
    debugProxyHeaders: config.debugProxyHeaders === true,
    wangpandirect: String(config.wangpandirect || "").trim(),
    corsOrigins: String(config.corsOrigins || "").trim(),
    geoAllowlist: String(config.geoAllowlist || "").trim(),
    geoBlocklist: String(config.geoBlocklist || "").trim(),
    ipBlacklist: String(config.ipBlacklist || "").trim(),
    rateLimitRpm: Math.max(0, Math.floor(Number(config.rateLimitRpm) || 0)),
    sourceDirectNodes,
    pingTimeout: clampInteger2(
      config.pingTimeout,
      DEFAULT_PING_TIMEOUT_MS,
      1e3,
      18e4
    ),
    pingCacheMinutes: clampInteger2(
      config.pingCacheMinutes,
      DEFAULT_PING_CACHE_MINUTES,
      0,
      1440
    ),
    upstreamTimeoutMs: clampInteger2(config.upstreamTimeoutMs, 3e4, 0, 18e4),
    upstreamRetryAttempts: clampInteger2(config.upstreamRetryAttempts, 1, 0, 3),
    cacheTtlImages: clampInteger2(
      config.cacheTtlImages,
      DEFAULT_CACHE_TTL_IMAGES_DAYS,
      0,
      365
    )
  };
}
async function readNormalizedConfigFromKv(kv) {
  return normalizeConfig(await kv?.get(CONFIG_KEY, { type: "json" }) || {});
}
var CONFIG_KEY, DEFAULT_PREWARM_TTL, DEFAULT_PING_TIMEOUT_MS, DEFAULT_PING_CACHE_MINUTES, DEFAULT_CACHE_TTL_IMAGES_DAYS;
var init_normalize = __esm({
  "src/config/normalize.js"() {
    init_defaults();
    init_metadata_prewarm();
    CONFIG_KEY = "sys:theme";
    DEFAULT_PREWARM_TTL = 180;
    DEFAULT_PING_TIMEOUT_MS = 5e3;
    DEFAULT_PING_CACHE_MINUTES = 10;
    DEFAULT_CACHE_TTL_IMAGES_DAYS = 30;
  }
});

// src/probes/probe-shared.js
function normalizeProbeConfig(input = {}, defaults = {}) {
  const count = Math.max(1, Math.min(10, Number(input.count ?? defaults.count)));
  const timeoutMs = Math.max(200, Math.min(1e4, Number(input.timeoutMs ?? defaults.timeoutMs)));
  const latencyWarnLow = Number(input.latencyWarnLow ?? defaults.latencyWarnLow);
  const latencyWarnHigh = Number(input.latencyWarnHigh ?? defaults.latencyWarnHigh);
  return {
    count: Number.isFinite(count) ? Math.round(count) : defaults.count,
    timeoutMs: Number.isFinite(timeoutMs) ? Math.round(timeoutMs) : defaults.timeoutMs,
    latencyWarnLow: Number.isFinite(latencyWarnLow) ? latencyWarnLow : defaults.latencyWarnLow,
    latencyWarnHigh: Number.isFinite(latencyWarnHigh) ? latencyWarnHigh : defaults.latencyWarnHigh
  };
}
function medianProbeLatency(values) {
  const sorted = [...values].filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return Math.round(sorted[mid]);
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
var init_probe_shared = __esm({
  "src/probes/probe-shared.js"() {
  }
});

// src/probes/head-probe.js
async function runHeadFallback(targetUrl, samples, timeoutMs) {
  const latencyValues = [];
  const modeSet = /* @__PURE__ */ new Set();
  for (let i = 0; i < samples; i += 1) {
    const result = await probeHeadOnce(targetUrl, timeoutMs);
    if (result.ok && Number.isFinite(result.ms)) {
      latencyValues.push(result.ms);
      modeSet.add(result.mode);
    }
    if (i < samples - 1) {
      await sleep(HEAD_RETRY_DELAY_MS);
    }
  }
  const mode = modeSet.has("head") && modeSet.has("range-get") ? "mixed" : modeSet.has("range-get") ? "range-get" : modeSet.has("head") ? "head" : "none";
  return {
    successCount: latencyValues.length,
    medianMs: latencyValues.length ? medianProbeLatency(latencyValues) : null,
    mode
  };
}
async function probeHeadOnce(targetUrl, timeoutMs) {
  const probeUrl = new URL(targetUrl.toString());
  probeUrl.searchParams.set("_probe_ts", `${Date.now()}${Math.floor(Math.random() * 1e3)}`);
  const commonInit = {
    redirect: "follow",
    headers: {
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    }
  };
  const headResult = await probeFetch(probeUrl.toString(), {
    ...commonInit,
    method: "HEAD"
  }, timeoutMs);
  if (headResult.ok && !shouldFallbackHeadStatus(headResult.status)) {
    return { ok: true, ms: headResult.ms, mode: "head" };
  }
  const rangeResult = await probeFetch(probeUrl.toString(), {
    ...commonInit,
    method: "GET",
    headers: {
      ...commonInit.headers,
      "Range": "bytes=0-0"
    }
  }, timeoutMs);
  if (rangeResult.ok) {
    return { ok: true, ms: rangeResult.ms, mode: "range-get" };
  }
  return { ok: false, ms: null, mode: "none" };
}
function shouldFallbackHeadStatus(status) {
  return status === 405 || status === 501;
}
async function probeFetch(url, init, timeoutMs) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    try {
      response.body?.cancel?.();
    } catch (_) {
    }
    return {
      ok: true,
      status: response.status,
      ms: Date.now() - startedAt
    };
  } catch (_) {
    return {
      ok: false,
      status: 0,
      ms: null
    };
  } finally {
    clearTimeout(timeout);
  }
}
var HEAD_RETRY_DELAY_MS;
var init_head_probe = __esm({
  "src/probes/head-probe.js"() {
    init_defaults();
    init_probe_shared();
    HEAD_RETRY_DELAY_MS = 80;
  }
});

// src/probes/tcp-probe.js
var tcp_probe_exports = {};
__export(tcp_probe_exports, {
  TCPING_CACHE_TTL_MS: () => TCPING_CACHE_TTL_MS,
  handleTcpProbe: () => handleTcpProbe,
  normalizeTcpProbeConfig: () => normalizeTcpProbeConfig
});
function normalizeTcpProbeConfig(input = {}) {
  return normalizeProbeConfig(input, DEFAULT_TCPING_CONFIG.tcp);
}
async function handleTcpProbe(target, env, request, options = {}) {
  try {
    const primaryTarget = normalizeTargetList(target)[0];
    const url = new URL(primaryTarget);
    const hostname = url.hostname;
    const port = Number(url.port || (url.protocol === "https:" ? 443 : 80));
    if (!hostname || !port) throw new Error("INVALID_TARGET");
    const cacheKey = buildTcpProbeCacheKey(url);
    const force = options.force === true;
    if (!force) {
      const cached = getCachedTcpProbe(cacheKey);
      if (cached) return jsonResponse(cached);
    }
    const inflight = GLOBALS.TcpingInflight.get(cacheKey);
    if (inflight) {
      return jsonResponse(await inflight);
    }
    const probePromise = (async () => {
      const config = await getTcpingConfig(env);
      const tcpConfig = normalizeTcpProbeConfig(config?.tcp || {});
      const headConfig = normalizeProbeConfig(config?.head || {}, DEFAULT_TCPING_CONFIG.head);
      const tcpSamples = Math.max(1, Math.min(3, tcpConfig.count));
      const headSamples = Math.max(1, Math.min(3, headConfig.count));
      const ipLocationPromise = Promise.race([
        lookupLocation(hostname),
        new Promise((resolve) => setTimeout(() => resolve("未知"), 900))
      ]);
      const [ipLocation, tcpResult, headResult] = await Promise.all([
        ipLocationPromise,
        runSocketFallback(hostname, port, tcpSamples, tcpConfig.timeoutMs).catch(() => ({
          successCount: 0,
          medianMs: null
        })),
        runHeadFallback(url, headSamples, headConfig.timeoutMs).catch(() => ({
          successCount: 0,
          medianMs: null,
          mode: "none"
        }))
      ]);
      const edgeTcpMs = Number.isFinite(tcpResult?.medianMs) ? tcpResult.medianMs : null;
      const edgeHeadMs = Number.isFinite(headResult?.medianMs) ? headResult.medianMs : null;
      let source = "failed";
      if (edgeTcpMs != null && edgeHeadMs != null) source = "edge-dual";
      else if (edgeTcpMs != null) source = "edge-tcp-only";
      else if (edgeHeadMs != null) source = "edge-head-only";
      const noteItems = [];
      if (headResult?.mode === "range-get") {
        noteItems.push("HEAD不支持，已回退Range GET");
      } else if (headResult?.mode === "mixed") {
        noteItems.push("HEAD部分失败，已混合回退Range GET");
      }
      if (edgeTcpMs == null && edgeHeadMs == null) {
        noteItems.push("延迟测试失败");
      }
      return {
        success: edgeTcpMs != null || edgeHeadMs != null,
        source,
        carrierReliable: false,
        ipLocation,
        sourceRegion: "未知",
        telecomMs: null,
        unicomMs: null,
        mobileMs: null,
        edgeMs: edgeTcpMs,
        edgeTcpMs,
        edgeHeadMs,
        headMode: headResult?.mode || "none",
        note: noteItems.join("；")
      };
    })();
    GLOBALS.TcpingInflight.set(cacheKey, probePromise);
    try {
      const payload = await probePromise;
      setCachedTcpProbe(cacheKey, payload);
      return jsonResponse(payload);
    } finally {
      if (GLOBALS.TcpingInflight.get(cacheKey) === probePromise) {
        GLOBALS.TcpingInflight.delete(cacheKey);
      }
    }
  } catch (error) {
    return jsonResponse({
      success: false,
      source: "failed",
      carrierReliable: false,
      ipLocation: "未知",
      sourceRegion: "未知",
      telecomMs: null,
      unicomMs: null,
      mobileMs: null,
      edgeMs: null,
      edgeTcpMs: null,
      edgeHeadMs: null,
      headMode: "none",
      note: "",
      error: error.message || "tcping failed"
    });
  }
}
function buildTcpProbeCacheKey(url) {
  const protocol = String(url?.protocol || "https:").toLowerCase();
  const hostname = String(url?.hostname || "").toLowerCase();
  const port = Number(url?.port || (protocol === "https:" ? 443 : 80));
  const path = String(url?.pathname || "/").replace(/\/+$/, "") || "/";
  return `${protocol}//${hostname}:${port}${path}`;
}
function getCachedTcpProbe(cacheKey) {
  const now = Date.now();
  const cached = GLOBALS.TcpingResultCache.get(cacheKey);
  if (!cached) return null;
  if (cached.exp <= now) {
    GLOBALS.TcpingResultCache.delete(cacheKey);
    return null;
  }
  return cached.value;
}
function setCachedTcpProbe(cacheKey, value) {
  GLOBALS.TcpingResultCache.set(cacheKey, {
    exp: Date.now() + TCPING_CACHE_TTL_MS,
    value
  });
}
async function runSocketFallback(hostname, port, samples, timeoutMs) {
  const probes = Array.from({ length: samples }, () => probeTcpOnce(hostname, port, timeoutMs));
  const results = await Promise.all(probes);
  let successCount = 0;
  const values = [];
  for (const result of results) {
    if (result.ok) {
      successCount += 1;
      values.push(result.ms);
    }
  }
  return {
    successCount,
    medianMs: successCount > 0 ? medianProbeLatency(values) : null
  };
}
async function probeTcpOnce(hostname, port, timeoutMs) {
  const startedAt = Date.now();
  const closer = {
    run() {
    }
  };
  let timeoutId = null;
  try {
    const { connect } = await import("cloudflare:sockets");
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs);
    });
    const connectPromise = (async () => {
      const activeSocket = connect({ hostname, port });
      closer.run = () => activeSocket.close();
      if (activeSocket.opened) await activeSocket.opened;
      const writer = activeSocket.writable?.getWriter?.();
      if (writer) writer.releaseLock();
      return { ok: true, ms: Date.now() - startedAt };
    })();
    return await Promise.race([connectPromise, timeoutPromise]);
  } catch (_) {
    return { ok: false, ms: null };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    try {
      closer.run();
    } catch (_) {
    }
  }
}
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
async function getTcpingConfig(env) {
  let config = GLOBALS.ConfigCache;
  if (!config) {
    const kv = Auth.getKV(env);
    config = await readNormalizedConfigFromKv(kv);
    GLOBALS.ConfigCache = config;
  }
  return config.tcping || DEFAULT_TCPING_CONFIG;
}
async function lookupLocation(hostname) {
  try {
    const ip = await resolveHostnameToIp(hostname);
    if (!ip) return "未知";
    const cached = GLOBALS.GeoCache.get(ip);
    const now = Date.now();
    if (cached && cached.exp > now) return cached.value;
    const geoResponse = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
    if (!geoResponse.ok) throw new Error("GEO_LOOKUP_FAILED");
    const geo = await geoResponse.json();
    const toCountryCode = (value) => String(value || "").trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);
    const location = geo && geo.success !== false ? toCountryCode(geo.country_code) || toCountryCode(geo.countryCode) || "未知" : "未知";
    GLOBALS.GeoCache.set(ip, { value: location, exp: now + 1e3 * 60 * 30 });
    return location;
  } catch (_) {
    return "未知";
  }
}
async function resolveHostnameToIp(hostname) {
  try {
    const dnsUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`;
    const response = await fetch(dnsUrl, {
      headers: { "Accept": "application/dns-json" }
    });
    if (!response.ok) throw new Error("DNS_LOOKUP_FAILED");
    const json = await response.json();
    const answer = Array.isArray(json.Answer) ? json.Answer.find((item) => item.type === 1 && item.data) : null;
    return answer?.data || null;
  } catch (_) {
    return null;
  }
}
var TCPING_CACHE_TTL_MS;
var init_tcp_probe = __esm({
  "src/probes/tcp-probe.js"() {
    init_defaults();
    init_normalize();
    init_auth();
    init_node_model();
    init_runtime_state();
    init_head_probe();
    init_probe_shared();
    TCPING_CACHE_TTL_MS = 45 * 1e3;
  }
});

// src/app/admin-routes.js
init_defaults();
init_runtime_state();
init_auth();

// src/integrations/cf-analytics.js
init_defaults();
init_runtime_state();
init_normalize();
init_auth();

// src/integrations/cf-dns.js
init_defaults();
init_runtime_state();
init_normalize();
init_auth();
var CFDns = {
  API_BASE: "https://api.cloudflare.com/client/v4",
  json(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  },
  async handleGetPreferredRecords(data, request, env) {
    try {
      const hostname = this.normalizeHostname(data?.hostname || new URL(request.url).hostname);
      if (!hostname) return this.json({ error: "当前域名无效" }, 400);
      const token = await this.resolveApiToken(data, env);
      if (!token) return this.json({ error: "请先填写 Cloudflare API 令牌" }, 400);
      const zone = await this.resolveManagedZone(hostname, token);
      if (!zone) return this.json({ error: "未找到可管理 zone，请检查当前域名是否在该 Cloudflare 账户下" }, 404);
      const records = await this.getSameNameRecords(zone.id, hostname, token);
      const summary = this.summarizePreferredRecords(records);
      const domainTarget = summary.cnameRecords[0]?.content || "";
      const domainSupport = domainTarget ? await this.lookupDomainSupport(domainTarget) : this.emptyDomainSupport();
      return this.json({
        success: true,
        hostname,
        zoneId: zone.id,
        zoneName: zone.name,
        mode: summary.mode,
        exists: summary.exists,
        conflict: summary.conflict,
        records,
        status: this.buildPreferredStatus(summary),
        domainSupport
      });
    } catch (error) {
      return this.json({ error: error.message || "读取当前记录失败" }, this.normalizeStatus(error?.status));
    }
  },
  async handleApplyPreferredRecords(data, request, env) {
    try {
      const hostname = this.normalizeHostname(data?.hostname || new URL(request.url).hostname);
      if (!hostname) return this.json({ error: "当前域名无效" }, 400);
      const token = await this.resolveApiToken(data, env);
      if (!token) return this.json({ error: "请先填写 Cloudflare API 令牌" }, 400);
      const zone = await this.resolveManagedZone(hostname, token);
      if (!zone) return this.json({ error: "未找到可管理 zone，请检查当前域名是否在该 Cloudflare 账户下" }, 404);
      const mode = String(data?.mode || "domain") === "ip" ? "ip" : "domain";
      const existing = await this.getSameNameRecords(zone.id, hostname, token);
      const summary = this.summarizePreferredRecords(existing);
      let result;
      if (mode === "ip") {
        const targets = this.normalizeIpTargets(data?.records);
        if (!targets.length) return this.json({ error: "请至少填写 1 条有效 IP 记录" }, 400);
        result = await this.applyIpMode(zone.id, hostname, targets, token, summary);
      } else {
        const content = this.normalizeCnameContent(data?.content);
        if (!content) return this.json({ error: "请输入有效的 CNAME 目标域名" }, 400);
        if (content === hostname) return this.json({ error: "CNAME 目标域名不能与当前域名相同" }, 400);
        result = await this.applyDomainMode(zone.id, hostname, content, token, summary);
      }
      const nextSummary = this.summarizePreferredRecords(result.records);
      const domainTarget = nextSummary.cnameRecords[0]?.content || "";
      const domainSupport = domainTarget ? await this.lookupDomainSupport(domainTarget) : this.emptyDomainSupport();
      return this.json({
        success: true,
        hostname,
        zoneId: zone.id,
        zoneName: zone.name,
        mode,
        exists: result.records.length > 0,
        conflict: nextSummary.conflict,
        operation: result.operation,
        records: result.records,
        status: this.buildPreferredStatus(nextSummary),
        domainSupport
      });
    } catch (error) {
      return this.json({ error: error.message || "同步当前记录失败" }, this.normalizeStatus(error?.status));
    }
  },
  async handleGetCurrentCname(data, request, env) {
    return this.handleGetPreferredRecords(data, request, env);
  },
  async handleUpsertCurrentCname(data, request, env) {
    return this.handleApplyPreferredRecords({ ...data, mode: "domain" }, request, env);
  },
  async resolveApiToken(data, env) {
    const direct = String(data?.apiToken || "").trim();
    if (direct) return direct;
    let config = GLOBALS.ConfigCache;
    if (!config) {
      const kv = Auth.getKV(env);
      config = await readNormalizedConfigFromKv(kv);
      GLOBALS.ConfigCache = config;
    }
    return String(config?.cfMetrics?.apiToken || "").trim();
  },
  normalizeHostname(value) {
    let host = String(value || "").trim().toLowerCase();
    if (!host) return "";
    host = host.replace(/\.$/, "");
    if (!this.isValidDomain(host)) return "";
    return host;
  },
  normalizeCnameContent(value) {
    let content = String(value || "").trim().toLowerCase();
    if (!content) return "";
    content = content.replace(/\.$/, "");
    if (content.includes("://")) return "";
    if (this.isIpAddress(content)) return "";
    if (!this.isValidDomain(content)) return "";
    return content;
  },
  normalizeIpContent(value) {
    const raw = String(value || "").trim();
    if (!raw) return null;
    if (this.isIpv4Address(raw)) {
      const segments = raw.split(".").map((item) => Number(item));
      if (segments.some((item) => !Number.isInteger(item) || item < 0 || item > 255)) return null;
      return {
        type: "A",
        content: segments.join(".")
      };
    }
    if (this.isIpv6Address(raw)) {
      return {
        type: "AAAA",
        content: raw.toLowerCase()
      };
    }
    return null;
  },
  normalizeIpTargets(value) {
    const list = Array.isArray(value) ? value : [];
    const deduped = /* @__PURE__ */ new Map();
    for (const item of list) {
      const raw = typeof item === "string" ? item : item?.content;
      const parsed = this.normalizeIpContent(raw);
      if (!parsed) continue;
      deduped.set(`${parsed.type}|${parsed.content}`, parsed);
    }
    return Array.from(deduped.values());
  },
  isIpAddress(value) {
    return this.isIpv4Address(value) || this.isIpv6Address(value);
  },
  isIpv4Address(value) {
    return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(String(value || "").trim());
  },
  isIpv6Address(value) {
    const raw = String(value || "").trim();
    if (!raw.includes(":")) return false;
    if (!/^[0-9a-f:]+$/i.test(raw)) return false;
    if (raw.includes(":::")) return false;
    const pieces = raw.split(":");
    if (pieces.length < 3 || pieces.length > 8) return false;
    const emptyRuns = raw.match(/::/g) || [];
    if (emptyRuns.length > 1) return false;
    return pieces.every((item) => item === "" || /^[0-9a-f]{1,4}$/i.test(item));
  },
  isValidDomain(value) {
    if (!value || value.length > 253) return false;
    if (value.includes("..")) return false;
    if (!value.includes(".")) return false;
    const labels = value.split(".");
    return labels.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label));
  },
  normalizeStatus(status) {
    if (status === 401 || status === 403 || status === 404 || status === 409) return status;
    if (status === 400) return 400;
    return 502;
  },
  cfApiError(status, message) {
    return Object.assign(new Error(message || "Cloudflare API 调用失败"), {
      status: Number(status) || 502
    });
  },
  parseCfError(payload, fallback = "Cloudflare API 调用失败") {
    const first = Array.isArray(payload?.errors) ? payload.errors[0] : null;
    const text = first?.message || payload?.messages?.[0]?.message || fallback;
    return String(text || fallback);
  },
  async cfApi(path, token, init = {}) {
    const method = init.method || "GET";
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers || {}
    };
    const response = await fetch(`${this.API_BASE}${path}`, {
      method,
      headers,
      body: init.body ? JSON.stringify(init.body) : void 0
    });
    let payload = null;
    try {
      payload = await response.json();
    } catch (_) {
      payload = null;
    }
    if (!response.ok || payload?.success === false) {
      const msg = this.parseCfError(payload, `Cloudflare API 请求失败: ${response.status}`);
      throw this.cfApiError(response.status, msg);
    }
    return payload?.result;
  },
  async resolveManagedZone(hostname, token) {
    const labels = String(hostname || "").split(".").filter(Boolean);
    if (labels.length < 2) return null;
    for (let i = 0; i <= labels.length - 2; i += 1) {
      const candidate = labels.slice(i).join(".");
      const result = await this.cfApi(`/zones?name=${encodeURIComponent(candidate)}&status=active&match=all&per_page=1`, token);
      const zone = Array.isArray(result) ? result[0] : null;
      if (zone?.id && String(zone.name || "").toLowerCase() === candidate) {
        return { id: zone.id, name: zone.name };
      }
    }
    return null;
  },
  async getSameNameRecords(zoneId, hostname, token) {
    const result = await this.cfApi(`/zones/${encodeURIComponent(zoneId)}/dns_records?name=${encodeURIComponent(hostname)}&match=all&per_page=100`, token);
    return (Array.isArray(result) ? result : []).filter((item) => String(item?.name || "").toLowerCase() === hostname).map((item) => this.toRecordModel(item)).sort((a, b) => {
      const order = { CNAME: 0, A: 1, AAAA: 2 };
      const left = order[String(a?.type || "").toUpperCase()] ?? 9;
      const right = order[String(b?.type || "").toUpperCase()] ?? 9;
      return left - right || String(a?.content || "").localeCompare(String(b?.content || ""));
    });
  },
  summarizePreferredRecords(records) {
    const all = Array.isArray(records) ? records : [];
    const cnameRecords = all.filter((item) => String(item?.type || "").toUpperCase() === "CNAME");
    const ipRecords = all.filter((item) => {
      const type = String(item?.type || "").toUpperCase();
      return type === "A" || type === "AAAA";
    });
    const otherRecords = all.filter((item) => {
      const type = String(item?.type || "").toUpperCase();
      return type !== "CNAME" && type !== "A" && type !== "AAAA";
    });
    const conflict = cnameRecords.length > 1 || cnameRecords.length > 0 && (ipRecords.length > 0 || otherRecords.length > 0);
    let mode = "domain";
    if (!cnameRecords.length && ipRecords.length > 0) mode = "ip";
    else if (cnameRecords.length > 0) mode = "domain";
    return {
      exists: all.length > 0,
      mode,
      conflict,
      allRecords: all,
      cnameRecords,
      ipRecords,
      otherRecords
    };
  },
  buildPreferredStatus(summary) {
    if (!summary?.exists) return { kind: "empty", text: "未创建" };
    if (summary.conflict) {
      const types = Array.from(new Set(summary.allRecords.map((item) => item.type))).join("/");
      return { kind: "conflict", text: `存在冲突（${types}）` };
    }
    if (summary.cnameRecords.length) {
      return { kind: "domain", text: "CNAME 已读取" };
    }
    if (summary.ipRecords.length) {
      const v4 = summary.ipRecords.filter((item) => item.type === "A").length;
      const v6 = summary.ipRecords.filter((item) => item.type === "AAAA").length;
      const suffix = [v4 ? `A ${v4}` : "", v6 ? `AAAA ${v6}` : ""].filter(Boolean).join(" / ");
      return { kind: "ip", text: suffix ? `A/AAAA 已读取（${suffix}）` : "A/AAAA 已读取" };
    }
    if (summary.otherRecords.length) {
      const types = Array.from(new Set(summary.otherRecords.map((item) => item.type))).join("/");
      return { kind: "other", text: `存在其它记录（${types}）` };
    }
    return { kind: "empty", text: "未创建" };
  },
  async getSameNameCname(zoneId, hostname, token) {
    const rows = await this.getSameNameRecords(zoneId, hostname, token);
    const row = rows.find((item) => String(item?.type || "").toUpperCase() === "CNAME");
    return row ? this.toRecordModel(row) : null;
  },
  async getSameNameConflicts(zoneId, hostname, token) {
    const rows = await this.getSameNameRecords(zoneId, hostname, token);
    return rows.filter((item) => {
      const type = String(item?.type || "").toUpperCase();
      return type === "A" || type === "AAAA";
    });
  },
  async updateCnameRecord(zoneId, recordId, hostname, content, token) {
    return this.updateDnsRecord(zoneId, recordId, {
      type: "CNAME",
      name: hostname,
      content,
      proxied: false,
      ttl: 1
    }, token);
  },
  async createCnameRecord(zoneId, hostname, content, token) {
    return this.createDnsRecord(zoneId, {
      type: "CNAME",
      name: hostname,
      content,
      proxied: false,
      ttl: 1
    }, token);
  },
  async applyDomainMode(zoneId, hostname, content, token, summary) {
    if (summary.otherRecords.length) {
      const conflictTypes = Array.from(new Set(summary.otherRecords.map((item) => item.type))).join(", ");
      throw this.cfApiError(409, `同名记录冲突（${conflictTypes}），请先处理后再创建 CNAME`);
    }
    const primary = summary.cnameRecords[0] || null;
    const extraRecords = [
      ...summary.ipRecords,
      ...summary.cnameRecords.slice(1)
    ];
    if (extraRecords.length) {
      await Promise.all(extraRecords.map((item) => this.deleteDnsRecord(zoneId, item.id, token)));
    }
    let operation = "create";
    if (primary) {
      if (String(primary.content || "").toLowerCase() === content) {
        operation = extraRecords.length ? "sync" : "keep";
      } else {
        await this.updateDnsRecord(zoneId, primary.id, {
          type: "CNAME",
          name: hostname,
          content,
          proxied: false,
          ttl: 1
        }, token);
        operation = "update";
      }
    } else {
      await this.createDnsRecord(zoneId, {
        type: "CNAME",
        name: hostname,
        content,
        proxied: false,
        ttl: 1
      }, token);
    }
    return {
      operation,
      records: await this.getSameNameRecords(zoneId, hostname, token)
    };
  },
  async applyIpMode(zoneId, hostname, targets, token, summary) {
    const targetKeys = new Set(targets.map((item) => `${item.type}|${item.content}`));
    const seenExisting = /* @__PURE__ */ new Set();
    const recordsToDelete = [...summary.cnameRecords];
    for (const record of summary.ipRecords) {
      const key = `${record.type}|${record.content}`;
      if (!targetKeys.has(key) || seenExisting.has(key)) {
        recordsToDelete.push(record);
        continue;
      }
      seenExisting.add(key);
    }
    if (recordsToDelete.length) {
      await Promise.all(recordsToDelete.map((item) => this.deleteDnsRecord(zoneId, item.id, token)));
    }
    const missingTargets = targets.filter((item) => !seenExisting.has(`${item.type}|${item.content}`));
    if (missingTargets.length) {
      await Promise.all(missingTargets.map((item) => this.createDnsRecord(zoneId, {
        type: item.type,
        name: hostname,
        content: item.content,
        proxied: false,
        ttl: 1
      }, token)));
    }
    let operation = "sync";
    if (missingTargets.length && recordsToDelete.length) operation = "replace";
    else if (missingTargets.length) operation = "create";
    else if (recordsToDelete.length) operation = "trim";
    return {
      operation,
      records: await this.getSameNameRecords(zoneId, hostname, token)
    };
  },
  async updateDnsRecord(zoneId, recordId, body, token) {
    const result = await this.cfApi(`/zones/${encodeURIComponent(zoneId)}/dns_records/${encodeURIComponent(recordId)}`, token, {
      method: "PUT",
      body
    });
    return this.toRecordModel(result);
  },
  async createDnsRecord(zoneId, body, token) {
    const result = await this.cfApi(`/zones/${encodeURIComponent(zoneId)}/dns_records`, token, {
      method: "POST",
      body
    });
    return this.toRecordModel(result);
  },
  async deleteDnsRecord(zoneId, recordId, token) {
    await this.cfApi(`/zones/${encodeURIComponent(zoneId)}/dns_records/${encodeURIComponent(recordId)}`, token, {
      method: "DELETE"
    });
  },
  emptyDomainSupport() {
    return {
      checked: false,
      ipv4: null,
      ipv6: null
    };
  },
  async lookupDomainSupport(hostname) {
    const domain = this.normalizeCnameContent(hostname);
    if (!domain) return this.emptyDomainSupport();
    const [v4, v6] = await Promise.all([
      this.lookupDnsAnswer(domain, "A", 1),
      this.lookupDnsAnswer(domain, "AAAA", 28)
    ]);
    return {
      checked: true,
      ipv4: v4,
      ipv6: v6
    };
  },
  async lookupDnsAnswer(hostname, typeName, typeCode) {
    try {
      const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=${encodeURIComponent(typeName)}`, {
        headers: { "Accept": "application/dns-json" }
      });
      if (!response.ok) return false;
      const payload = await response.json();
      return Array.isArray(payload?.Answer) && payload.Answer.some((item) => Number(item?.type) === typeCode && item?.data);
    } catch (_) {
      return false;
    }
  },
  toRecordModel(record) {
    if (!record) return null;
    return {
      id: record.id || "",
      type: record.type || "CNAME",
      name: record.name || "",
      content: record.content || "",
      proxied: !!record.proxied,
      ttl: Number(record.ttl) || 1
    };
  }
};

// src/proxy/diagnostics/playback-telemetry.js
init_runtime_state();
var PlaybackTelemetry = {
  WINDOW_MS: 30 * 1e3,
  SESSION_IDLE_MS: 20 * 1e3,
  RETENTION_MS: 5 * 60 * 1e3,
  BUCKET_MS: 1e3,
  normalizeHost(hostname) {
    return String(hostname || "").trim().toLowerCase().split(":")[0] || "";
  },
  buildSessionKey(meta) {
    const host = this.normalizeHost(meta?.host);
    const playSessionId = String(meta?.playSessionId || "").trim();
    const mediaSourceId = String(meta?.mediaSourceId || "").trim();
    const deviceId = String(meta?.deviceId || "").trim();
    const itemId = String(meta?.itemId || "").trim();
    const path = String(meta?.path || "").trim();
    if (!host) return "";
    return [host, playSessionId || "nosession", mediaSourceId, deviceId, itemId || path].join("|");
  },
  getHostState(hostname) {
    const host = this.normalizeHost(hostname);
    if (!host) return null;
    let state = GLOBALS.PlaybackTelemetryHosts.get(host);
    if (!state) {
      state = {
        host,
        buckets: /* @__PURE__ */ new Map(),
        sessions: /* @__PURE__ */ new Map(),
        activeRequests: 0,
        lastByteAt: 0
      };
      GLOBALS.PlaybackTelemetryHosts.set(host, state);
    }
    return state;
  },
  getOrCreateSession(state, meta) {
    if (!state) return null;
    const key = this.buildSessionKey(meta);
    if (!key) return null;
    let session = state.sessions.get(key);
    if (!session) {
      session = {
        key,
        playSessionId: String(meta?.playSessionId || "").trim(),
        mediaSourceId: String(meta?.mediaSourceId || "").trim(),
        deviceId: String(meta?.deviceId || "").trim(),
        itemId: String(meta?.itemId || "").trim(),
        path: String(meta?.path || "").trim(),
        buckets: /* @__PURE__ */ new Map(),
        totalBytes: 0,
        activeRequests: 0,
        firstByteAt: 0,
        lastByteAt: 0
      };
      state.sessions.set(key, session);
    }
    return session;
  },
  recordRequestStart(meta, now = Date.now()) {
    const state = this.getHostState(meta?.host);
    if (!state) return;
    this.pruneHostState(state, now);
    state.activeRequests += 1;
    const session = this.getOrCreateSession(state, meta);
    if (session) {
      session.activeRequests += 1;
      if (!session.firstByteAt) session.firstByteAt = now;
      session.lastByteAt = Math.max(session.lastByteAt || 0, now);
    }
  },
  recordChunk(meta, byteLength, now = Date.now()) {
    const bytes = Math.max(0, Number(byteLength) || 0);
    if (!bytes) return;
    const state = this.getHostState(meta?.host);
    if (!state) return;
    this.pruneHostState(state, now);
    const bucket = Math.floor(now / this.BUCKET_MS) * this.BUCKET_MS;
    state.buckets.set(bucket, (state.buckets.get(bucket) || 0) + bytes);
    state.lastByteAt = now;
    const session = this.getOrCreateSession(state, meta);
    if (session) {
      session.totalBytes += bytes;
      if (!session.firstByteAt) session.firstByteAt = now;
      session.lastByteAt = now;
      session.buckets.set(bucket, (session.buckets.get(bucket) || 0) + bytes);
    }
  },
  recordRequestEnd(meta, now = Date.now()) {
    const state = this.getHostState(meta?.host);
    if (!state) return;
    state.activeRequests = Math.max(0, Number(state.activeRequests || 0) - 1);
    const session = this.getOrCreateSession(state, meta);
    if (session) {
      session.activeRequests = Math.max(0, Number(session.activeRequests || 0) - 1);
      session.lastByteAt = Math.max(session.lastByteAt || 0, now);
    }
    this.pruneHostState(state, now);
  },
  pruneHostState(state, now = Date.now()) {
    if (!state) return;
    const bucketExpireBefore = now - this.RETENTION_MS;
    for (const bucket of state.buckets.keys()) {
      if (bucket < bucketExpireBefore) state.buckets.delete(bucket);
    }
    for (const [key, session] of state.sessions.entries()) {
      for (const bucket of session.buckets.keys()) {
        if (bucket < bucketExpireBefore) session.buckets.delete(bucket);
      }
      const inactive = Number(session.activeRequests || 0) <= 0 && (!session.lastByteAt || session.lastByteAt < bucketExpireBefore);
      if (inactive) state.sessions.delete(key);
    }
    const shouldDeleteHost = Number(state.activeRequests || 0) <= 0 && (!state.lastByteAt || state.lastByteAt < bucketExpireBefore) && state.buckets.size === 0;
    if (shouldDeleteHost && state.host) {
      GLOBALS.PlaybackTelemetryHosts.delete(state.host);
    }
  },
  getHostSummary(hostname, now = Date.now()) {
    const host = this.normalizeHost(hostname);
    if (!host) return this.createUnavailableSummary();
    const state = GLOBALS.PlaybackTelemetryHosts.get(host);
    if (!state) return this.createUnavailableSummary();
    this.pruneHostState(state, now);
    const activeState = GLOBALS.PlaybackTelemetryHosts.get(host);
    if (!activeState) return this.createUnavailableSummary();
    const windowStart = now - this.WINDOW_MS;
    let totalBytes = 0;
    let peakBytesPerSecond = 0;
    for (const [bucket, bytes] of activeState.buckets.entries()) {
      if (bucket < windowStart) continue;
      const value = Math.max(0, Number(bytes) || 0);
      totalBytes += value;
      peakBytesPerSecond = Math.max(peakBytesPerSecond, value / (this.BUCKET_MS / 1e3));
    }
    const activeSessions = Array.from(activeState.sessions.values()).filter(
      (session) => Number(session.activeRequests || 0) > 0 || Number(session.lastByteAt || 0) >= now - this.SESSION_IDLE_MS
    ).length;
    if (totalBytes <= 0) {
      return {
        ...this.createUnavailableSummary(),
        activeRequests: Math.max(0, Number(activeState.activeRequests || 0)),
        activeSessions,
        windowMs: this.WINDOW_MS
      };
    }
    return {
      available: true,
      avgBytesPerSecond: totalBytes / (this.WINDOW_MS / 1e3),
      peakBytesPerSecond,
      activeRequests: Math.max(0, Number(activeState.activeRequests || 0)),
      activeSessions,
      windowMs: this.WINDOW_MS,
      lastByteAt: activeState.lastByteAt ? new Date(activeState.lastByteAt).toISOString() : ""
    };
  },
  createUnavailableSummary() {
    return {
      available: false,
      avgBytesPerSecond: null,
      peakBytesPerSecond: null,
      activeRequests: 0,
      activeSessions: 0,
      windowMs: this.WINDOW_MS,
      lastByteAt: ""
    };
  }
};
function shouldTrackPlaybackResponse({ method, lowerPath, contentType, status, body }) {
  if (String(method || "").toUpperCase() !== "GET") return false;
  if (!body) return false;
  if (![200, 206].includes(Number(status) || 0)) return false;
  const safePath = String(lowerPath || "");
  if (!safePath || safePath.includes("playbackinfo")) return false;
  const safeType = String(contentType || "").toLowerCase();
  if (/(?:application\/json|text\/|mpegurl|html|xml)/i.test(safeType)) return false;
  return /\/videos\/[^/]+\/(?:stream|original|master|main)|\/audio\/[^/]+\/stream|\/live\/|(?:\.mp4|\.m4v|\.m4s|\.m4a|\.mkv|\.webm|\.mov|\.avi|\.wmv|\.flv|\.ts|\.aac|\.flac|\.ogg|\.mp3)$/i.test(safePath);
}
function extractPlaybackTelemetryMeta(request, requestHost, nodeName, normalizedPath) {
  let url;
  try {
    url = new URL(request.url);
  } catch (_) {
    url = null;
  }
  const search = url?.searchParams;
  const itemMatch = String(normalizedPath || "").match(/\/videos\/([^/]+)\//i);
  return {
    host: requestHost || url?.host || "",
    nodeName: String(nodeName || "").trim(),
    path: String(normalizedPath || "").trim(),
    playSessionId: search?.get("PlaySessionId") || search?.get("PlaySessionID") || "",
    mediaSourceId: search?.get("MediaSourceId") || "",
    deviceId: search?.get("DeviceId") || "",
    itemId: search?.get("ItemId") || (itemMatch ? itemMatch[1] : "")
  };
}
function buildProxyResponseBody(body, { contentLength = null, telemetryMeta = null } = {}) {
  if (!body) return body;
  if (!telemetryMeta) return body;
  const normalizedLength = Number(contentLength);
  const shouldPreserveLength = Number.isFinite(normalizedLength) && normalizedLength > 0 && typeof FixedLengthStream === "function";
  if (!shouldPreserveLength) {
    return telemetryMeta ? wrapPlaybackTelemetryBody(body, telemetryMeta) : body;
  }
  const fixedLengthStream = new FixedLengthStream(normalizedLength);
  const telemetry = telemetryMeta ? createPlaybackTelemetryTransform(telemetryMeta) : null;
  const source = telemetry ? body.pipeThrough(telemetry.stream) : body;
  source.pipeTo(fixedLengthStream.writable).catch(() => {
  }).finally(() => {
    telemetry?.close();
  });
  return fixedLengthStream.readable;
}
function createPlaybackTelemetryTransform(meta) {
  let finished = false;
  const close = () => {
    if (finished) return;
    finished = true;
    PlaybackTelemetry.recordRequestEnd(meta);
  };
  PlaybackTelemetry.recordRequestStart(meta);
  return {
    stream: new TransformStream({
      transform(chunk, controller) {
        if (chunk?.byteLength) {
          PlaybackTelemetry.recordChunk(meta, chunk.byteLength);
        }
        controller.enqueue(chunk);
      },
      flush() {
        close();
      }
    }, void 0, void 0),
    close
  };
}
function wrapPlaybackTelemetryBody(body, meta) {
  if (!body) return body;
  const reader = body.getReader();
  let finished = false;
  const close = () => {
    if (finished) return;
    finished = true;
    PlaybackTelemetry.recordRequestEnd(meta);
  };
  PlaybackTelemetry.recordRequestStart(meta);
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          close();
          controller.close();
          return;
        }
        if (value?.byteLength) {
          PlaybackTelemetry.recordChunk(meta, value.byteLength);
        }
        controller.enqueue(value);
      } catch (error) {
        close();
        if (isBenignStreamTermination(error)) {
          safeCloseReadableController(controller);
          return;
        }
        controller.error(error);
      }
    },
    cancel(reason) {
      close();
      try {
        return reader.cancel(reason);
      } catch (_) {
        return void 0;
      }
    }
  });
}
function isBenignStreamTermination(error) {
  if (!error) return false;
  const name = String(error?.name || "").toLowerCase();
  const message = String(error?.message || error || "").toLowerCase();
  if (name === "aborterror") return true;
  return [
    "aborted",
    "abort",
    "cancelled",
    "canceled",
    "cancel",
    "terminated",
    "closed"
  ].some((keyword) => message.includes(keyword));
}
function safeCloseReadableController(controller) {
  try {
    controller.close();
  } catch (_) {
  }
}

// src/storage/node-repository.js
init_defaults();
init_auth();
init_runtime_state();
init_node_model();
var NODE_INDEX_STORAGE_KEY = "sys:nodes-index";
function normalizeNodeNames(names = []) {
  const seen = /* @__PURE__ */ new Set();
  const normalized = [];
  for (const rawName of names) {
    const name = String(rawName || "").trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    normalized.push(name);
  }
  return normalized;
}
function mapStoredNodeListEntry(value, fallbackPath = "") {
  const normalized = normalizeNodeRecord(value);
  const path = String(normalized.path || fallbackPath || normalized.name || "").trim();
  if (!path) return null;
  return {
    ...normalized,
    name: normalized.name || path,
    path
  };
}
function cacheListedNodes(nodes = []) {
  const now = Date.now();
  for (const node of Array.isArray(nodes) ? nodes : []) {
    const path = String(node?.path || "").trim();
    if (!path) continue;
    GLOBALS.NodeCache.set(path, {
      data: node,
      exp: now + Config.Defaults.CacheTTL
    });
  }
}
async function readStoredNodeIndex(kv) {
  if (!kv || typeof kv.get !== "function") return null;
  const raw = await kv.get(NODE_INDEX_STORAGE_KEY, { type: "json" });
  if (raw === null || raw === void 0) return null;
  if (!Array.isArray(raw)) return null;
  const seen = /* @__PURE__ */ new Set();
  const nodes = [];
  for (const entry of raw) {
    const mapped = mapStoredNodeListEntry(entry);
    if (!mapped) continue;
    const key = mapped.path.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    nodes.push(mapped);
  }
  return nodes;
}
async function writeStoredNodeIndex(kv, nodes = []) {
  if (!kv || typeof kv.put !== "function") return;
  const payload = [];
  const seen = /* @__PURE__ */ new Set();
  for (const node of Array.isArray(nodes) ? nodes : []) {
    const record = createStoredNodeRecord(node);
    const path = String(record.path || "").trim();
    if (!path) continue;
    const key = path.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    payload.push(record);
  }
  await kv.put(NODE_INDEX_STORAGE_KEY, JSON.stringify(payload));
}
async function listStoredNodesFromKvKeys(kv) {
  if (!kv || typeof kv.list !== "function" || typeof kv.get !== "function") return [];
  const list = await kv.list({ prefix: "node:" });
  const nodes = await Promise.all((list?.keys || []).map(async (key) => {
    try {
      const path = key.name.replace("node:", "");
      let value = GLOBALS.NodeCache.get(path)?.data;
      if (!value) value = await kv.get(key.name, { type: "json" });
      if (!value) return null;
      return mapStoredNodeListEntry(value, path);
    } catch (_) {
      return null;
    }
  }));
  return nodes.filter((node) => node);
}
async function getStoredNode(nodePath, env, ctx) {
  const kv = Auth.getKV(env);
  if (!kv) return null;
  const now = Date.now();
  const normalizedPath = String(nodePath || "").trim();
  const mem = GLOBALS.NodeCache.get(normalizedPath);
  if (mem && mem.exp > now) return normalizeNodeRecord(mem.data);
  const cache = caches.default;
  const cacheUrl = new URL(`https://internal-config-cache/node/${normalizedPath}`);
  const cachedResponse = await cache.match(cacheUrl);
  if (cachedResponse) {
    const data = normalizeNodeRecord(await cachedResponse.json());
    GLOBALS.NodeCache.set(normalizedPath, { data, exp: now + Config.Defaults.CacheTTL });
    return data;
  }
  try {
    const nodeData = await kv.get(`node:${normalizedPath}`, { type: "json" });
    if (!nodeData) return null;
    const normalizedNode = normalizeNodeRecord(nodeData);
    const cacheResponse = new Response(JSON.stringify(normalizedNode), {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=600" }
    });
    if (ctx?.waitUntil) {
      ctx.waitUntil(cache.put(cacheUrl, cacheResponse));
    } else {
      await cache.put(cacheUrl, cacheResponse);
    }
    GLOBALS.NodeCache.set(normalizedPath, { data: normalizedNode, exp: now + Config.Defaults.CacheTTL });
    return normalizedNode;
  } catch (err) {
    console.error(`KV Error: ${err}`);
    return null;
  }
}
async function listStoredNodes(env) {
  const kv = Auth.getKV(env);
  if (!kv) return [];
  const indexedNodes = await readStoredNodeIndex(kv);
  if (indexedNodes) {
    cacheListedNodes(indexedNodes);
    return indexedNodes;
  }
  const nodes = await listStoredNodesFromKvKeys(kv);
  cacheListedNodes(nodes);
  await writeStoredNodeIndex(kv, nodes);
  return nodes;
}
async function listStoredNodePaths(env) {
  const kv = Auth.getKV(env);
  if (!kv) return [];
  const indexedNodes = await readStoredNodeIndex(kv);
  if (indexedNodes) {
    return normalizeNodeNames(indexedNodes.map((node) => node.path));
  }
  const nodes = await listStoredNodesFromKvKeys(kv);
  await writeStoredNodeIndex(kv, nodes);
  cacheListedNodes(nodes);
  return normalizeNodeNames(nodes.map((node) => node.path));
}
async function isStoredNodePathAvailable(env, newPath, oldPath = "") {
  const normalizedNewPath = String(newPath || "").trim();
  if (!normalizedNewPath) return true;
  const normalizedOldPath = String(oldPath || "").trim();
  if (normalizedOldPath && normalizedNewPath === normalizedOldPath) return true;
  const kv = Auth.getKV(env);
  const exists = await kv?.get(`node:${normalizedNewPath}`);
  return !exists;
}
async function writeStoredNodes(env, nodes = [], { previousPath = "", invalidate = null } = {}) {
  const kv = Auth.getKV(env);
  if (!kv) return;
  const normalizedNodes = Array.isArray(nodes) ? nodes : [];
  const writtenPaths = normalizeNodeNames(normalizedNodes.map((node) => node?.path));
  await Promise.all(normalizedNodes.map(async (node) => {
    const path = String(node?.path || "").trim();
    if (!path) return;
    await kv.put(`node:${path}`, JSON.stringify(createStoredNodeRecord(node)));
    if (typeof invalidate === "function") await invalidate(path);
  }));
  const previous = String(previousPath || "").trim();
  if (previous && !writtenPaths.includes(previous)) {
    await kv.delete(`node:${previous}`);
    if (typeof invalidate === "function") await invalidate(previous);
  }
  const existingNodes = await readStoredNodeIndex(kv) || await listStoredNodesFromKvKeys(kv);
  const nextNodesByPath = new Map(existingNodes.map((node) => [String(node.path || "").toLowerCase(), node]));
  for (const node of normalizedNodes) {
    const mapped = mapStoredNodeListEntry(node);
    if (!mapped) continue;
    nextNodesByPath.set(mapped.path.toLowerCase(), mapped);
  }
  if (previous && !writtenPaths.includes(previous)) {
    nextNodesByPath.delete(previous.toLowerCase());
  }
  const nextNodes = [...nextNodesByPath.values()];
  cacheListedNodes(nextNodes);
  await writeStoredNodeIndex(kv, nextNodes);
}
async function deleteStoredNodes(env, names = [], invalidate = null) {
  const kv = Auth.getKV(env);
  if (!kv) return;
  const normalizedNames = normalizeNodeNames(Array.isArray(names) ? names : []);
  await Promise.all(normalizedNames.map(async (name) => {
    await kv.delete(`node:${name}`);
    if (typeof invalidate === "function") await invalidate(name);
  }));
  const existingNodes = await readStoredNodeIndex(kv) || await listStoredNodesFromKvKeys(kv);
  const removedKeys = new Set(normalizedNames.map((name) => name.toLowerCase()));
  const nextNodes = existingNodes.filter((node) => !removedKeys.has(String(node?.path || "").toLowerCase()));
  normalizedNames.forEach((name) => GLOBALS.NodeCache.delete(name));
  cacheListedNodes(nextNodes);
  await writeStoredNodeIndex(kv, nextNodes);
}
async function pingTarget(target, timeoutMs) {
  const controller = new AbortController();
  const startedAt = Date.now();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(target, {
      method: "HEAD",
      signal: controller.signal
    });
    return Date.now() - startedAt;
  } catch (_) {
    return 9999;
  } finally {
    clearTimeout(timeoutId);
  }
}
async function probeStoredNodeLines(nodeName, env, options = {}) {
  const normalizedName = String(nodeName || "").trim();
  const node = await getStoredNode(normalizedName, env, null);
  if (!node || !Array.isArray(node.lines) || !node.lines.length) {
    return {
      status: 404,
      body: { error: "节点不存在", code: "NOT_FOUND" }
    };
  }
  const timeoutMs = Math.max(1e3, Math.min(18e4, Math.floor(Number(options.timeoutMs) || 5e3)));
  const cacheMinutes = Math.max(0, Math.min(1440, Math.floor(Number(options.cacheMinutes) || 0)));
  const requestedLineId = String(options.lineId || "").trim();
  const forceRefresh = options.forceRefresh === true;
  const silent = options.silent === true && !!requestedLineId;
  const linesToProbe = requestedLineId ? node.lines.filter((line) => line.id === requestedLineId) : node.lines.slice();
  if (requestedLineId && !linesToProbe.length) {
    return {
      status: 404,
      body: { error: "线路不存在", code: "LINE_NOT_FOUND" }
    };
  }
  const probedLines = await Promise.all(linesToProbe.map(async (line) => {
    const useCache = !forceRefresh && isPingCacheFresh(line, cacheMinutes);
    if (useCache) return { ...line, usedCache: true };
    const ms = await pingTarget(line.target, timeoutMs);
    return {
      ...line,
      latencyMs: ms,
      latencyUpdatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      usedCache: false
    };
  }));
  const allUsedCache = probedLines.length > 0 && probedLines.every((line) => line.usedCache === true);
  let nextLines = node.lines.map((line) => {
    const updated = probedLines.find((item) => item.id === line.id);
    return updated ? {
      id: updated.id,
      name: updated.name,
      target: updated.target,
      latencyMs: updated.latencyMs,
      latencyUpdatedAt: updated.latencyUpdatedAt
    } : line;
  });
  let nextActiveLineId = resolveActiveLineId(node.activeLineId, nextLines);
  if (!silent) {
    nextLines = sortNodeLinesByLatency(nextLines);
    nextActiveLineId = nextLines[0]?.id || nextActiveLineId;
  }
  const normalizedNode = normalizeNodeRecord({
    ...node,
    lines: nextLines,
    activeLineId: nextActiveLineId
  });
  await writeStoredNodes(env, [{ ...normalizedNode, path: normalizedName }], {
    previousPath: normalizedName,
    invalidate: options.invalidate
  });
  const activeLine = getActiveNodeLine(normalizedNode);
  const matchedLine = requestedLineId ? normalizedNode.lines.find((line) => line.id === requestedLineId) : activeLine;
  return {
    status: 200,
    body: {
      ms: Number(matchedLine?.latencyMs ?? activeLine?.latencyMs ?? 9999),
      usedCache: allUsedCache,
      sorted: !silent,
      activeLineId: normalizedNode.activeLineId,
      activeLineName: activeLine?.name || "",
      line: matchedLine || null,
      node: { name: normalizedName, ...normalizedNode }
    }
  };
}

// src/proxy/diagnostics/recent-node-usage.js
var RECENT_NODE_USAGE_TTL_MS = 30 * 24 * 60 * 60 * 1e3;
function buildRecentNodeUsageCacheUrl(nodeName) {
  return new URL(`https://internal-runtime-cache/recent-node-usage/${encodeURIComponent(String(nodeName || "").trim())}`);
}
function normalizeRecentNodeUsageEntry(value) {
  const lastSeenAt = String(value?.lastSeenAt || "").trim();
  if (!lastSeenAt || !Number.isFinite(Date.parse(lastSeenAt))) return null;
  const requests = Math.max(0, Number(value?.requests) || 0);
  return {
    lastSeenAt,
    requests: requests || 1
  };
}
function getCachedRecentNodeUsage(globals, nodeName) {
  const key = String(nodeName || "").trim();
  if (!key) return null;
  const cached = globals?.RecentNodeUsageCache?.get?.(key);
  if (!cached) return null;
  if ((cached.exp || 0) <= Date.now()) {
    globals?.RecentNodeUsageCache?.delete?.(key);
    return null;
  }
  return normalizeRecentNodeUsageEntry(cached.value);
}
function setCachedRecentNodeUsage(globals, nodeName, entry) {
  const key = String(nodeName || "").trim();
  const normalized = normalizeRecentNodeUsageEntry(entry);
  if (!key || !normalized) return;
  globals?.RecentNodeUsageCache?.set?.(key, {
    exp: Date.now() + RECENT_NODE_USAGE_TTL_MS,
    value: normalized
  });
}
async function readRecentNodeUsage(nodeName) {
  const key = String(nodeName || "").trim();
  if (!key) return null;
  const response = await caches.default.match(buildRecentNodeUsageCacheUrl(key));
  if (!response) return null;
  try {
    return normalizeRecentNodeUsageEntry(await response.json());
  } catch (_) {
    return null;
  }
}
function shouldTrackRecentNodeUsage(request, requestState, response) {
  const status = Number(response?.status) || 0;
  if (status < 200 || status >= 400) return false;
  if (request?.headers?.get?.("X-Metadata-Prewarm") === "1") return false;
  if (requestState?.isMetadataPrewarm === true) return false;
  if (requestState?.isImage === true || requestState?.isStaticFile === true || requestState?.isSubtitle === true || requestState?.isManifest === true) return false;
  const lowerPath = String(requestState?.lowerPath || "").toLowerCase();
  if (lowerPath.includes("/playbackinfo")) return true;
  if (requestState?.looksLikeVideoRoute === true && String(requestState?.method || "").toUpperCase() === "GET") {
    return true;
  }
  return false;
}
async function rememberRecentNodeUsage(globals, nodeName, executionContext = null, observedAt = Date.now()) {
  const key = String(nodeName || "").trim();
  if (!key) return null;
  const iso = new Date(observedAt).toISOString();
  const entry = { lastSeenAt: iso, requests: 1 };
  setCachedRecentNodeUsage(globals, key, entry);
  const cacheWrite = caches.default.put(
    buildRecentNodeUsageCacheUrl(key),
    new Response(JSON.stringify(entry), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=2592000, stale-while-revalidate=86400"
      }
    })
  );
  if (typeof executionContext?.waitUntil === "function") {
    executionContext.waitUntil(cacheWrite);
  } else {
    await cacheWrite;
  }
  return entry;
}
async function readRecentNodeUsageMap(globals, nodeNames = [], options = {}) {
  const allowStorageReads = options?.allowStorageReads !== false;
  const output = {};
  for (const rawName of Array.isArray(nodeNames) ? nodeNames : []) {
    const nodeName = String(rawName || "").trim();
    if (!nodeName) continue;
    let entry = getCachedRecentNodeUsage(globals, nodeName);
    if (!entry && allowStorageReads) {
      entry = await readRecentNodeUsage(nodeName);
      if (entry) setCachedRecentNodeUsage(globals, nodeName, entry);
    }
    if (entry) output[nodeName] = entry;
  }
  return output;
}
function mergeNodeActivityWithRecentUsage(baseActivity = {}, recentUsage = {}) {
  const merged = {};
  const names = /* @__PURE__ */ new Set([
    ...Object.keys(baseActivity || {}),
    ...Object.keys(recentUsage || {})
  ]);
  for (const name of names) {
    const base = normalizeRecentNodeUsageEntry(baseActivity?.[name]) || null;
    const recent = normalizeRecentNodeUsageEntry(recentUsage?.[name]) || null;
    if (!base && !recent) continue;
    if (!base) {
      merged[name] = recent;
      continue;
    }
    if (!recent) {
      merged[name] = base;
      continue;
    }
    merged[name] = {
      lastSeenAt: Date.parse(recent.lastSeenAt) >= Date.parse(base.lastSeenAt) ? recent.lastSeenAt : base.lastSeenAt,
      requests: Math.max(base.requests || 0, recent.requests || 0)
    };
  }
  return merged;
}

// src/integrations/cf-analytics.js
var CFAnalytics = {
  FIXED_RANGE: { key: "24h", label: "近24小时", ms: 24 * 60 * 60 * 1e3, buckets: 24 },
  PART_TTL_MS: 300 * 1e3,
  TOP_PATHS_TIMEOUT_MS: 4500,
  STALE_GRACE_MS: 2 * 60 * 1e3,
  async handleMetrics(_rangeKey, env, mode = "full", request = null) {
    try {
      const config = await this.getConfig(env);
      const normalizedMode = mode === "activity" ? "activity" : "full";
      const range = this.FIXED_RANGE;
      if (normalizedMode === "activity" && !this.isConfigured(config)) {
        return this.json(await this.buildLocalActivityPayload(env, range, false));
      }
      if (!this.isConfigured(config)) {
        return this.json({ enabled: false, rangeKey: range.key, rangeLabel: range.label });
      }
      const scriptName = this.parseScriptName(config.workerUrl);
      if (normalizedMode === "activity" && !scriptName) {
        return this.json(await this.buildLocalActivityPayload(env, range, true, "无法从 Worker 管理页 URL 解析脚本名称"));
      }
      if (!scriptName) {
        return this.json({ enabled: false, error: "无法从 Worker 管理页 URL 解析脚本名称" }, 400);
      }
      const requestHost = this.getRequestHost(request);
      const topPathsFallbackResult = {
        value: this.createTopPathsMetricsPayload(
          this.createUnavailableTopPathsResult("QUERY_FAILED")
        ),
        cacheHit: false
      };
      const configuredNodePaths = await this.listConfiguredNodePaths(env);
      const nodePathSignature = this.buildNodePathSignature(configuredNodePaths);
      if (normalizedMode === "activity") {
        const activityResult = await this.getMetricPart({
          part: "activity",
          config,
          scriptName,
          requestHost,
          cacheKeySuffix: nodePathSignature,
          compute: () => this.computeActivityMetrics(config, scriptName, range, env, configuredNodePaths)
        });
        return this.json({ ...activityResult.value, cacheHit: activityResult.cacheHit });
      }
      const [summaryResult, topPathsResult] = await Promise.all([
        this.getMetricPart({
          part: "summary",
          config,
          scriptName,
          requestHost,
          cacheKeySuffix: nodePathSignature,
          compute: () => this.computeSummaryMetrics(config, scriptName, range, requestHost, configuredNodePaths)
        }),
        this.getMetricPart({
          part: "topPaths",
          config,
          scriptName,
          requestHost,
          cacheKeySuffix: nodePathSignature,
          compute: () => this.computeTopPathsMetrics(config, range, requestHost, configuredNodePaths)
        }).catch((error) => ({
          value: this.createTopPathsMetricsPayload(
            this.createUnavailableTopPathsResult(
              this.isTimeoutError(error) ? "TIMEOUT" : "QUERY_FAILED",
              error
            )
          ),
          cacheHit: false
        }))
      ]);
      const payload = this.attachPlaybackSummary(
        this.composeFullPayload(summaryResult.value, topPathsResult?.value || topPathsFallbackResult.value),
        requestHost
      );
      return this.json({
        ...payload,
        cacheHit: summaryResult.cacheHit && Boolean(topPathsResult?.cacheHit)
      });
    } catch (error) {
      return this.json({
        enabled: true,
        error: error.message || "CF_METRICS_FAILED",
        cacheHit: false,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }, 500);
    }
  },
  async computeSummaryMetrics(config, scriptName, range, requestHost = "", topPathNodes = []) {
    const now = Date.now();
    const currentUntil = new Date(now).toISOString();
    const currentSince = new Date(now - range.ms).toISOString();
    const previousUntil = currentSince;
    const previousSince = new Date(now - range.ms * 2).toISOString();
    const analyticsContext = await this.resolveAnalyticsContext(config, requestHost);
    const normalizedNodePaths = Array.from(new Set((Array.isArray(topPathNodes) ? topPathNodes : []).map((path) => String(path || "").trim()).filter(Boolean)));
    const currentZoneTrafficTask = analyticsContext.zone?.id ? this.fetchZoneNodeTrafficRows(config, analyticsContext.zone.id, analyticsContext.hostname, normalizedNodePaths, currentSince, currentUntil).catch((error) => this.createUnavailableZoneTrafficResult("QUERY_FAILED", error)) : Promise.resolve(this.createUnavailableZoneTrafficResult(analyticsContext.hostname ? "ZONE_UNAVAILABLE" : "HOST_UNAVAILABLE", analyticsContext.error));
    const previousZoneTrafficTask = analyticsContext.zone?.id ? this.fetchZoneNodeTrafficRows(config, analyticsContext.zone.id, analyticsContext.hostname, normalizedNodePaths, previousSince, previousUntil).catch((error) => this.createUnavailableZoneTrafficResult("QUERY_FAILED", error)) : Promise.resolve(this.createUnavailableZoneTrafficResult(analyticsContext.hostname ? "ZONE_UNAVAILABLE" : "HOST_UNAVAILABLE", analyticsContext.error));
    const [currentZoneTrafficResult, previousZoneTrafficResult] = await Promise.all([
      currentZoneTrafficTask,
      previousZoneTrafficTask
    ]);
    const currentStartTs = now - range.ms;
    const currentEndTs = now;
    const previousStartTs = now - range.ms * 2;
    const previousEndTs = now - range.ms;
    const currentZoneTrafficAggregate = currentZoneTrafficResult.available === true ? this.aggregateZoneTrafficRows(currentZoneTrafficResult.rows, range.ms, range.buckets, currentStartTs, currentEndTs) : null;
    const previousZoneTrafficAggregate = previousZoneTrafficResult.available === true ? this.aggregateZoneTrafficRows(previousZoneTrafficResult.rows, range.ms, range.buckets, previousStartTs, previousEndTs) : null;
    const currentDomainTrafficResult = currentZoneTrafficAggregate ? this.createDomainTrafficResult(currentZoneTrafficAggregate, false, "site-zone") : this.createDomainTrafficResult(null, false, "");
    const previousDomainTrafficResult = previousZoneTrafficAggregate ? this.createDomainTrafficResult(previousZoneTrafficAggregate, false, "site-zone") : this.createDomainTrafficResult(null, false, "");
    const bandwidthAvailable = currentZoneTrafficResult.available === true && previousZoneTrafficResult.available === true;
    const recentDomainsAvailable = false;
    const recentDomainsSource = "site-path";
    const recentDomainsHint = "已固定为近24小时，仅统计当前域名下已配置站点路径的访问。";
    const domainTrafficAvailable = !!currentDomainTrafficResult.aggregate;
    const currentTrafficSummary = this.buildTrafficSummary({
      aggregate: currentDomainTrafficResult.aggregate,
      zoneRows: currentZoneTrafficResult.available === true ? currentZoneTrafficResult.rows : [],
      rangeMs: range.ms,
      bucketCount: range.buckets,
      estimated: false
    });
    const generatedAt = new Date(now).toISOString();
    const bandwidthHint = bandwidthAvailable ? "" : "Cloudflare 当前未返回已配置站点路径的近24小时流量，请检查 Zone 分析权限或稍后重试。";
    let domainTrafficHint = "";
    if (domainTrafficAvailable) {
      domainTrafficHint = "仅统计当前域名下已配置站点路径的近24小时访问流量。";
    } else {
      domainTrafficHint = this.buildSiteTrafficUnavailableHint(
        [currentZoneTrafficResult],
        normalizedNodePaths
      );
    }
    const playbackHint = this.buildPlaybackHint(PlaybackTelemetry.createUnavailableSummary());
    return {
      enabled: true,
      mode: "full",
      rangeKey: range.key,
      rangeLabel: range.label,
      dashboardUrl: config.workerUrl,
      scriptName,
      updatedAt: generatedAt,
      generatedAt,
      bandwidthAvailable,
      bandwidthHint,
      domainTrafficHint,
      playbackHint,
      recentDomainsAvailable,
      recentDomainsSource,
      recentDomainsHint,
      metrics: this.buildMetricCards(null, null, {
        currentHostRequests: currentZoneTrafficAggregate,
        previousHostRequests: previousZoneTrafficAggregate,
        recentDomains: [],
        domainTrafficAvailable,
        trafficSummary: currentTrafficSummary,
        topPaths: [],
        currentDomainTraffic: currentDomainTrafficResult.aggregate,
        previousDomainTraffic: previousDomainTrafficResult.aggregate
      })
    };
  },
  async computeTopPathsMetrics(config, range, requestHost = "", topPathNodes = []) {
    const now = Date.now();
    const currentUntil = new Date(now).toISOString();
    const currentSince = new Date(now - range.ms).toISOString();
    const analyticsContext = await this.resolveAnalyticsContext(config, requestHost);
    let topPathsResult = analyticsContext.zone?.id ? this.createUnavailableTopPathsResult("ZONE_UNAVAILABLE") : this.createUnavailableTopPathsResult(analyticsContext.hostname ? "ZONE_UNAVAILABLE" : "HOST_UNAVAILABLE", analyticsContext.error);
    if (analyticsContext.zone?.id) {
      try {
        topPathsResult = await this.fetchZoneTopPaths(
          config,
          analyticsContext.zone.id,
          analyticsContext.hostname,
          currentSince,
          currentUntil,
          100,
          topPathNodes
        );
      } catch (error) {
        topPathsResult = this.createUnavailableTopPathsResult(
          this.isTimeoutError(error) ? "TIMEOUT" : "QUERY_FAILED",
          error
        );
      }
    }
    return this.createTopPathsMetricsPayload(topPathsResult);
  },
  async computeActivityMetrics(config, scriptName, range, env, configuredNodePaths = null) {
    const now = Date.now();
    const until = new Date(now).toISOString();
    const since = new Date(now - range.ms).toISOString();
    const result = await this.fetchActivityRows(config, scriptName, since, until);
    const activity = this.aggregateActivityRows(result.rows, now - range.ms, now);
    const recentUsage = await this.readRecentNodeActivity(env, configuredNodePaths);
    const mergedActivity = mergeNodeActivityWithRecentUsage(activity.nodeActivity || {}, recentUsage);
    const generatedAt = new Date(now).toISOString();
    return {
      enabled: true,
      mode: "activity",
      rangeKey: range.key,
      rangeLabel: range.label,
      dashboardUrl: config.workerUrl,
      scriptName,
      updatedAt: generatedAt,
      generatedAt,
      nodeActivityAvailable: result.pathFieldEnabled === true || Object.keys(mergedActivity).length > 0,
      nodeActivity: mergedActivity
    };
  },
  async buildLocalActivityPayload(env, range, enabled = false, error = "") {
    const generatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const recentUsage = await this.readRecentNodeActivity(env);
    return {
      enabled,
      mode: "activity",
      rangeKey: range.key,
      rangeLabel: range.label,
      updatedAt: generatedAt,
      generatedAt,
      nodeActivityAvailable: Object.keys(recentUsage).length > 0,
      nodeActivity: recentUsage,
      error: error || ""
    };
  },
  async readRecentNodeActivity(env, nodePaths = null) {
    const configuredNodePaths = Array.isArray(nodePaths) ? nodePaths : await this.listConfiguredNodePaths(env);
    return readRecentNodeUsageMap(GLOBALS, configuredNodePaths);
  },
  async listConfiguredNodePaths(env) {
    return listStoredNodePaths(env);
  },
  getRequestHost(request) {
    try {
      return new URL(request?.url || "").host || "";
    } catch (_) {
      return "";
    }
  },
  normalizeAnalyticsHostname(hostname) {
    const raw = String(hostname || "").trim().toLowerCase();
    if (!raw) return "";
    const plainHost = raw.split(":")[0];
    return CFDns.normalizeHostname(plainHost);
  },
  async resolveAnalyticsContext(config, requestHost = "") {
    const hostname = this.normalizeAnalyticsHostname(requestHost);
    if (!hostname) {
      return { hostname: "", zone: null, error: null };
    }
    try {
      const zone = await this.resolveAnalyticsZone(hostname, config.apiToken);
      return { hostname, zone, error: null };
    } catch (error) {
      return { hostname, zone: null, error };
    }
  },
  buildCacheKey(config, scriptName, mode, requestHost = "") {
    return `${config.accountId}|${scriptName}|${mode}|${String(requestHost || "").toLowerCase()}`;
  },
  buildMetricPartCacheKey(config, scriptName, part, requestHost = "", cacheKeySuffix = "") {
    const suffix = String(cacheKeySuffix || "").trim();
    const baseKey = `${this.buildCacheKey(config, scriptName, this.getModeForPart(part), requestHost)}|${part}`;
    return suffix ? `${baseKey}|${suffix}` : baseKey;
  },
  getModeForPart(part) {
    return part === "activity" ? "activity" : "full";
  },
  getPartCacheStore(part) {
    if (part === "summary") return GLOBALS.CfMetricsSummaryCache;
    if (part === "topPaths") return GLOBALS.CfMetricsTopPathsCache;
    if (part === "activity") return GLOBALS.CfMetricsActivityCache;
    throw new Error(`UNKNOWN_CF_METRICS_PART:${part}`);
  },
  getPartInflightStore(part) {
    if (part === "summary") return GLOBALS.CfMetricsSummaryInflight;
    if (part === "topPaths") return GLOBALS.CfMetricsTopPathsInflight;
    if (part === "activity") return GLOBALS.CfMetricsActivityInflight;
    throw new Error(`UNKNOWN_CF_METRICS_PART:${part}`);
  },
  getPartTtlMs() {
    return this.PART_TTL_MS;
  },
  getTopPathsTimeoutMs() {
    return this.TOP_PATHS_TIMEOUT_MS;
  },
  getCachedMetricPart(part, cacheKey) {
    const now = Date.now();
    const cached = this.getPartCacheStore(part).get(cacheKey);
    if (!cached) return null;
    const isFresh = cached.exp > now;
    const isStale = !isFresh && cached.staleUntil > now;
    if (!isFresh && !isStale) {
      this.getPartCacheStore(part).delete(cacheKey);
      return null;
    }
    return {
      value: cached.value,
      isFresh,
      isStale
    };
  },
  setCachedMetricPart(part, cacheKey, payload, ttlMs) {
    const now = Date.now();
    this.getPartCacheStore(part).set(cacheKey, {
      exp: now + ttlMs,
      staleUntil: now + ttlMs + this.STALE_GRACE_MS,
      value: payload
    });
  },
  async getMetricPart({ part, config, scriptName, requestHost = "", force = false, cacheKeySuffix = "", compute }) {
    const cacheKey = this.buildMetricPartCacheKey(config, scriptName, part, requestHost, cacheKeySuffix);
    const cacheStore = this.getPartCacheStore(part);
    const inflightStore = this.getPartInflightStore(part);
    const cached = this.getCachedMetricPart(part, cacheKey);
    if (cached?.isFresh) {
      return { value: cached.value, cacheHit: true };
    }
    if (!force && cached?.isStale) {
      this.refreshMetricPart({ part, cacheKey, inflightStore, compute }).catch(() => {
      });
      return { value: cached.value, cacheHit: true };
    }
    const inflight = inflightStore.get(cacheKey);
    if (inflight) {
      return { value: await inflight, cacheHit: false };
    }
    const ttlMs = this.getPartTtlMs();
    const computePromise = Promise.resolve().then(compute);
    inflightStore.set(cacheKey, computePromise);
    try {
      const value = await computePromise;
      this.setCachedMetricPart(part, cacheKey, value, ttlMs);
      return { value, cacheHit: false };
    } finally {
      if (inflightStore.get(cacheKey) === computePromise) {
        inflightStore.delete(cacheKey);
      }
      if (!cacheStore.get(cacheKey) && cached?.value) {
        this.setCachedMetricPart(part, cacheKey, cached.value, ttlMs);
      }
    }
  },
  async refreshMetricPart({ part, cacheKey, inflightStore, compute }) {
    if (inflightStore.get(cacheKey)) return;
    const ttlMs = this.getPartTtlMs();
    const computePromise = Promise.resolve().then(compute);
    inflightStore.set(cacheKey, computePromise);
    try {
      const value = await computePromise;
      this.setCachedMetricPart(part, cacheKey, value, ttlMs);
    } finally {
      if (inflightStore.get(cacheKey) === computePromise) {
        inflightStore.delete(cacheKey);
      }
    }
  },
  async getConfig(env) {
    let config = GLOBALS.ConfigCache;
    if (!config) {
      const kv = Auth.getKV(env);
      config = await readNormalizedConfigFromKv(kv);
      GLOBALS.ConfigCache = config;
    }
    return config.cfMetrics || DEFAULT_CF_METRICS_CONFIG;
  },
  isConfigured(config) {
    return !!(config && config.accountId && config.apiToken && config.workerUrl);
  },
  parseScriptName(workerUrl) {
    try {
      const url = new URL(workerUrl);
      const match = url.pathname.match(/\/workers\/services\/view\/([^/]+)/);
      return match ? decodeURIComponent(match[1]) : "";
    } catch (_) {
      return "";
    }
  },
  async resolveAnalyticsZone(hostname, token) {
    const normalized = this.normalizeAnalyticsHostname(hostname);
    if (!normalized) return null;
    return CFDns.resolveManagedZone(normalized, token);
  },
  async fetchZoneNodeTrafficRows(config, zoneId, hostname, nodePaths, since, until) {
    const normalizedHostname = this.normalizeAnalyticsHostname(hostname);
    const pathFilters = this.buildNodeTrafficPathFilters(nodePaths);
    if (!zoneId || !normalizedHostname) {
      return this.createUnavailableZoneTrafficResult(!normalizedHostname ? "HOST_UNAVAILABLE" : "ZONE_UNAVAILABLE");
    }
    if (!pathFilters.length) {
      return this.createUnavailableZoneTrafficResult("NO_NODES");
    }
    const query = `query GetZoneNodeTraffic($zoneTag: string!, $filter: filter) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      httpRequestsAdaptiveGroups(
        limit: 5000
        orderBy: [datetimeHour_ASC]
        filter: $filter
      ) {
        count
        dimensions {
          datetimeHour
        }
        sum {
          edgeResponseBytes
        }
      }
    }
  }
}`;
    const payload = await this.runQuery(config, query, {
      zoneTag: zoneId,
      filter: {
        AND: [
          {
            datetime_geq: since,
            datetime_lt: until
          },
          {
            clientRequestHTTPHost: normalizedHostname
          },
          {
            requestSource: "eyeball"
          },
          {
            OR: pathFilters
          }
        ]
      }
    });
    if (payload.errors?.length) {
      throw new Error(payload.errors[0].message || "CF Zone 站点流量查询失败");
    }
    const zoneData = payload?.data?.viewer?.zones?.[0];
    if (!zoneData) {
      return this.createUnavailableZoneTrafficResult("ZONE_UNAVAILABLE");
    }
    return {
      available: true,
      rows: zoneData.httpRequestsAdaptiveGroups || []
    };
  },
  createUnavailableZoneTrafficResult(reason, error = null) {
    return {
      available: false,
      rows: [],
      reason: String(reason || "UNKNOWN"),
      error: error || null
    };
  },
  buildNodeTrafficPathFilters(nodePaths = []) {
    const filters = [];
    const seen = /* @__PURE__ */ new Set();
    for (const rawPath of Array.isArray(nodePaths) ? nodePaths : []) {
      const path = String(rawPath || "").trim().replace(/^\/+|\/+$/g, "");
      if (!path || seen.has(path.toLowerCase())) continue;
      seen.add(path.toLowerCase());
      const normalizedPath = `/${path}`;
      filters.push({ clientRequestPath: normalizedPath });
      filters.push({ clientRequestPath_like: `${normalizedPath}/%` });
    }
    return filters;
  },
  async fetchZoneTopPaths(config, zoneId, hostname, since, until, limit = 100, topPathNodes = []) {
    const normalizedHostname = this.normalizeAnalyticsHostname(hostname);
    const pathFilters = this.buildNodeTrafficPathFilters(topPathNodes);
    if (!zoneId || !normalizedHostname) {
      return this.createUnavailableTopPathsResult(!normalizedHostname ? "HOST_UNAVAILABLE" : "ZONE_UNAVAILABLE");
    }
    if (!pathFilters.length) {
      return this.createUnavailableTopPathsResult("NO_NODES");
    }
    const safeLimit = Math.max(10, Math.min(200, Number(limit) || 100));
    const query = `query GetZoneTopPaths($zoneTag: string!, $filter: filter) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      topPaths: httpRequestsAdaptiveGroups(
        filter: $filter
        limit: ${safeLimit}
        orderBy: [sum_edgeResponseBytes_DESC]
      ) {
        count
        sum {
          edgeResponseBytes
        }
        dimensions {
          metric: clientRequestPath
        }
      }
    }
  }
}`;
    const payload = await this.runQuery(config, query, {
      zoneTag: zoneId,
      filter: {
        AND: [
          {
            datetime_geq: since,
            datetime_leq: until
          },
          {
            clientRequestHTTPHost: normalizedHostname
          },
          {
            requestSource: "eyeball"
          },
          {
            OR: pathFilters
          }
        ]
      }
    }, {
      timeoutMs: this.getTopPathsTimeoutMs()
    });
    if (payload.errors?.length) {
      throw new Error(payload.errors[0].message || "CF Zone Top 路径查询失败");
    }
    const zoneData = payload?.data?.viewer?.zones?.[0];
    if (!zoneData) {
      return this.createUnavailableTopPathsResult("ZONE_UNAVAILABLE");
    }
    return {
      available: true,
      paths: this.normalizeTopPaths(zoneData.topPaths || [], topPathNodes),
      reason: "",
      error: null
    };
  },
  createUnavailableTopPathsResult(reason, error = null) {
    return {
      available: false,
      paths: [],
      reason: String(reason || "UNKNOWN"),
      error: error || null
    };
  },
  createTopPathsMetricsPayload(result) {
    return {
      available: result?.available === true,
      paths: result?.available === true ? result.paths : [],
      reason: result?.reason || "",
      error: result?.error || null
    };
  },
  normalizeTopPaths(rows, topPathNodes = []) {
    const allowedNodes = this.createTopPathNodeMap(topPathNodes);
    const groups = /* @__PURE__ */ new Map();
    for (const row of Array.isArray(rows) ? rows : []) {
      const path = this.normalizeTopPathGroup(row?.dimensions?.metric, allowedNodes);
      if (!path) continue;
      const requests = Math.max(0, Number(row?.count) || 0);
      const bytes = Math.max(0, Number(row?.sum?.edgeResponseBytes) || 0);
      const prev = groups.get(path) || { path, requests: 0, bytes: 0 };
      prev.requests += requests;
      prev.bytes += bytes;
      groups.set(path, prev);
    }
    return Array.from(groups.values()).sort((a, b) => b.bytes - a.bytes || b.requests - a.requests || String(a.path || "").localeCompare(String(b.path || ""), "zh")).slice(0, 10).map((item, index) => ({ ...item, rank: index + 1 }));
  },
  normalizeTopPathGroup(pathname, allowedNodes = null) {
    const raw = String(pathname || "").trim();
    if (!raw || raw === "/") return "";
    const parts = (raw.startsWith("/") ? raw : `/${raw}`).split("/").filter(Boolean);
    if (!parts.length) return "";
    const segment = parts[0];
    let decoded = segment;
    try {
      decoded = decodeURIComponent(segment);
    } catch (_) {
      decoded = segment;
    }
    const normalized = String(decoded || "").trim();
    if (!normalized) return "";
    if (allowedNodes instanceof Map) {
      return allowedNodes.get(normalized.toLowerCase()) || "";
    }
    const lowered = normalized.toLowerCase();
    if (!lowered || lowered === "admin" || lowered === "__client_rtt__" || lowered === "favicon.ico" || lowered === "robots.txt") {
      return "";
    }
    return normalized;
  },
  createTopPathNodeMap(nodePaths = []) {
    const map = /* @__PURE__ */ new Map();
    for (const rawPath of Array.isArray(nodePaths) ? nodePaths : []) {
      const path = String(rawPath || "").trim();
      if (!path) continue;
      const key = path.toLowerCase();
      if (!map.has(key)) map.set(key, path);
    }
    return map;
  },
  buildNodePathSignature(nodePaths = []) {
    const normalized = Array.from(new Set((Array.isArray(nodePaths) ? nodePaths : []).map((path) => String(path || "").trim().toLowerCase()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "zh"));
    return normalized.length ? normalized.join(",") : "no-nodes";
  },
  buildSiteTrafficUnavailableHint(zoneResults, nodePaths = []) {
    const normalizedNodePaths = Array.from(new Set((Array.isArray(nodePaths) ? nodePaths : []).map((path) => String(path || "").trim()).filter(Boolean)));
    if (!normalizedNodePaths.length) {
      return "当前没有已配置站点，近24小时站点流量暂不可用。";
    }
    const zoneFailureText = this.describeZoneTrafficFailure(zoneResults);
    const zoneFailureDetail = this.extractZoneFailureDetail(zoneResults);
    if (zoneFailureText) {
      return zoneFailureDetail ? `${zoneFailureText} 当前无法统计已配置站点路径的近24小时流量。原始错误：${zoneFailureDetail}` : `${zoneFailureText} 当前无法统计已配置站点路径的近24小时流量。`;
    }
    return "Cloudflare 当前未返回已配置站点路径的近24小时流量。";
  },
  describeZoneTrafficFailure(zoneResults) {
    const failures = Array.isArray(zoneResults) ? zoneResults : [];
    if (!failures.length) return "";
    const messages = failures.map((item) => String(item?.error?.message || "").toLowerCase()).filter(Boolean);
    if (messages.some((msg) => /forbidden|permission|unauthorized|access denied|not authorized|authentication/.test(msg))) {
      return "Cloudflare Zone 级 host 流量不可用，请检查 API 令牌的 账户-账户分析-读取、区域-分析-读取、区域-区域-读取，并确认 Account Resources 与 Zone Resources 已包含当前账户和站点。";
    }
    if (failures.some((item) => item?.reason === "HOST_UNAVAILABLE")) {
      return "当前域名无效，访问流量暂不可用。";
    }
    if (failures.some((item) => item?.reason === "ZONE_UNAVAILABLE")) {
      return "未找到当前域名对应的 Cloudflare zone，或 API 令牌未包含该 zone。";
    }
    return "Cloudflare Zone 级 host 流量不可用，暂时无法获取当前域名的精确访问流量。";
  },
  extractZoneFailureDetail(zoneResults) {
    const message = (Array.isArray(zoneResults) ? zoneResults : []).map((item) => String(item?.error?.message || "").trim()).find(Boolean);
    if (!message) return "";
    return message.length > 160 ? `${message.slice(0, 157)}...` : message;
  },
  createDomainTrafficResult(aggregate = null, estimated = false, source = "") {
    return {
      aggregate: aggregate || null,
      estimated: estimated === true,
      source: String(source || "")
    };
  },
  async fetchActivityRows(config, scriptName, since, until) {
    const primaryQuery = `query GetWorkerActivity($accountTag: string!, $scriptName: string!, $since: Time!, $until: Time!) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      workersInvocationsAdaptive(
        limit: 5000
        orderBy: [datetime_ASC]
        filter: { scriptName: $scriptName, datetime_geq: $since, datetime_leq: $until }
      ) {
        dimensions {
          datetime
          clientRequestPath
        }
        sum {
          requests
        }
      }
    }
  }
}`;
    const fallbackQuery = `query GetWorkerActivityFallback($accountTag: string!, $scriptName: string!, $since: Time!, $until: Time!) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      workersInvocationsAdaptive(
        limit: 5000
        orderBy: [datetime_ASC]
        filter: { scriptName: $scriptName, datetime_geq: $since, datetime_leq: $until }
      ) {
        dimensions {
          datetime
        }
        sum {
          requests
        }
      }
    }
  }
}`;
    let payload = await this.runQuery(config, primaryQuery, { accountTag: config.accountId, scriptName, since, until });
    let pathFieldEnabled = true;
    if (payload.errors?.length) {
      payload = await this.runQuery(config, fallbackQuery, { accountTag: config.accountId, scriptName, since, until });
      pathFieldEnabled = false;
    }
    if (payload.errors?.length) {
      throw new Error(payload.errors[0].message || "CF GraphQL 返回错误");
    }
    return {
      rows: payload?.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive || [],
      pathFieldEnabled
    };
  },
  isTimeoutError(error) {
    const message = String(error?.message || "").toLowerCase();
    return error?.name === "AbortError" || message.includes("timeout");
  },
  async runQuery(config, query, variables, options = {}) {
    const timeoutMs = Math.max(0, Number(options?.timeoutMs) || 0);
    const controller = timeoutMs > 0 ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.apiToken}`
        },
        body: JSON.stringify({
          query,
          variables
        }),
        signal: controller?.signal
      });
      if (!response.ok) {
        throw new Error(`CF GraphQL 请求失败: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      if (controller?.signal?.aborted) {
        const timeoutError = new Error(`CF GraphQL 请求超时: ${timeoutMs}ms`);
        timeoutError.name = "AbortError";
        throw timeoutError;
      }
      throw error;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  },
  aggregateMetricRows(rows, rangeMs, bucketCount, startTs, endTs) {
    const bucketMs = Math.max(1, Math.floor(rangeMs / bucketCount));
    const buckets = Array.from({ length: bucketCount }, (_, idx) => ({
      ts: startTs + idx * bucketMs,
      requests: 0,
      subrequests: 0,
      errors: 0,
      bandwidthBytes: 0,
      cpuSum: 0,
      cpuWeight: 0,
      durationSum: 0,
      durationWeight: 0
    }));
    const totals = {
      requests: 0,
      subrequests: 0,
      errors: 0,
      bandwidthBytes: 0,
      cpuSum: 0,
      cpuWeight: 0,
      durationSum: 0,
      durationWeight: 0
    };
    for (const row of rows) {
      const time = Date.parse(row?.dimensions?.datetime || "");
      if (!Number.isFinite(time) || time < startTs || time > endTs) continue;
      const index = Math.min(bucketCount - 1, Math.max(0, Math.floor((time - startTs) / bucketMs)));
      const bucket = buckets[index];
      const requests = Number(row?.sum?.requests) || 0;
      const subrequests = Number(row?.sum?.subrequests) || 0;
      const errors = Number(row?.sum?.errors) || 0;
      const bandwidthBytes = Math.max(0, Number(row?.sum?.responseBodySize) || 0);
      const cpuTime = Number(row?.quantiles?.cpuTimeP50);
      const duration = Number(row?.quantiles?.wallTimeP50);
      const weight = Math.max(requests, 1);
      bucket.requests += requests;
      bucket.subrequests += subrequests;
      bucket.errors += errors;
      bucket.bandwidthBytes += bandwidthBytes;
      totals.requests += requests;
      totals.subrequests += subrequests;
      totals.errors += errors;
      totals.bandwidthBytes += bandwidthBytes;
      if (Number.isFinite(cpuTime)) {
        bucket.cpuSum += cpuTime * weight;
        bucket.cpuWeight += weight;
        totals.cpuSum += cpuTime * weight;
        totals.cpuWeight += weight;
      }
      if (Number.isFinite(duration)) {
        bucket.durationSum += duration * weight;
        bucket.durationWeight += weight;
        totals.durationSum += duration * weight;
        totals.durationWeight += weight;
      }
    }
    return {
      totals: {
        requests: totals.requests,
        subrequests: totals.subrequests,
        errors: totals.errors,
        bandwidthBytes: totals.bandwidthBytes,
        cpuTime: totals.cpuWeight ? totals.cpuSum / totals.cpuWeight : null,
        duration: totals.durationWeight ? totals.durationSum / totals.durationWeight : null
      },
      series: {
        requests: buckets.map((bucket) => bucket.requests),
        subrequests: buckets.map((bucket) => bucket.subrequests),
        errors: buckets.map((bucket) => bucket.errors),
        bandwidthBytes: buckets.map((bucket) => bucket.bandwidthBytes),
        cpuTime: buckets.map((bucket) => bucket.cpuWeight ? bucket.cpuSum / bucket.cpuWeight : 0),
        duration: buckets.map((bucket) => bucket.durationWeight ? bucket.durationSum / bucket.durationWeight : 0)
      }
    };
  },
  aggregateZoneTrafficRows(rows, rangeMs, bucketCount, startTs, endTs) {
    const normalizedRows = (Array.isArray(rows) ? rows : []).map((row) => ({
      dimensions: {
        datetime: row?.dimensions?.datetimeHour || row?.dimensions?.datetime || ""
      },
      sum: {
        requests: Number(row?.count) || 0,
        responseBodySize: Math.max(0, Number(row?.sum?.edgeResponseBytes) || 0)
      }
    }));
    return this.aggregateMetricRows(normalizedRows, rangeMs, bucketCount, startTs, endTs);
  },
  buildTrafficSummary(options = null) {
    const aggregate = options?.aggregate || null;
    const zoneRows = options?.zoneRows;
    const rangeMs = Number(options?.rangeMs) || 0;
    const bucketCount = Number(options?.bucketCount) || 0;
    const estimated = options?.estimated === true;
    if (!aggregate) return this.createUnavailableTrafficSummary();
    const totalBytes = Math.max(0, Number(aggregate?.totals?.bandwidthBytes) || 0);
    const avgBytesPerSecond = rangeMs > 0 ? totalBytes / (rangeMs / 1e3) : 0;
    let peakBytesPerSecond = 0;
    const safeZoneRows = Array.isArray(zoneRows) ? zoneRows : [];
    if (safeZoneRows.length) {
      peakBytesPerSecond = safeZoneRows.reduce((max, row) => {
        const bytes = Math.max(0, Number(row?.sum?.edgeResponseBytes) || 0);
        const bucketSeconds = this.getZoneTrafficBucketSeconds(row);
        if (bucketSeconds <= 0) return max;
        return Math.max(max, bytes / bucketSeconds);
      }, 0);
    } else {
      const bucketMs = Math.max(1, Math.floor(rangeMs / Math.max(1, Number(bucketCount) || 1)));
      peakBytesPerSecond = (aggregate?.series?.bandwidthBytes || []).reduce((max, value) => {
        const bytes = Math.max(0, Number(value) || 0);
        return Math.max(max, bytes / (bucketMs / 1e3));
      }, 0);
    }
    return {
      available: true,
      totalBytes,
      avgBytesPerSecond,
      peakBytesPerSecond,
      estimated
    };
  },
  getZoneTrafficBucketSeconds(row) {
    const dimensions = row?.dimensions || {};
    if (dimensions.datetimeMinute) return 60;
    if (dimensions.datetimeFiveMinutes) return 5 * 60;
    if (dimensions.datetimeHour) return 60 * 60;
    if (dimensions.date) return 24 * 60 * 60;
    return 60 * 60;
  },
  aggregateActivityRows(rows, startTs, endTs) {
    const nodeActivityMap = /* @__PURE__ */ new Map();
    for (const row of rows) {
      const time = Date.parse(row?.dimensions?.datetime || "");
      if (!Number.isFinite(time) || time < startTs || time > endTs) continue;
      const path = String(row?.dimensions?.clientRequestPath || "").trim();
      const requests = Number(row?.sum?.requests) || 0;
      const nodePath = this.extractNodeNameFromPath(path);
      if (!nodePath) continue;
      const prev = nodeActivityMap.get(nodePath) || { lastSeenAt: 0, requests: 0 };
      prev.lastSeenAt = Math.max(prev.lastSeenAt || 0, time);
      prev.requests += requests;
      nodeActivityMap.set(nodePath, prev);
    }
    return {
      nodeActivity: Object.fromEntries(
        Array.from(nodeActivityMap.entries()).map(([nodePath, info]) => [nodePath, {
          lastSeenAt: info.lastSeenAt ? new Date(info.lastSeenAt).toISOString() : "",
          requests: info.requests || 0
        }])
      )
    };
  },
  extractNodeNameFromPath(pathname) {
    const raw = String(pathname || "").trim();
    if (!raw.startsWith("/")) return "";
    const first = raw.split("/").filter(Boolean)[0] || "";
    if (!first) return "";
    const lowered = first.toLowerCase();
    if (["admin", "favicon.ico", "robots.txt"].includes(lowered)) return "";
    try {
      return decodeURIComponent(first);
    } catch (_) {
      return first;
    }
  },
  buildMetricCards(current, previous, options = {}) {
    const currentRequests = options.currentHostRequests?.totals?.requests;
    const previousRequests = options.previousHostRequests?.totals?.requests;
    const requestSeries = options.currentHostRequests?.series?.requests || [];
    const trafficTotalCurrent = options.currentDomainTraffic?.totals?.bandwidthBytes;
    const trafficTotalPrevious = options.previousDomainTraffic?.totals?.bandwidthBytes;
    const trafficTotalChange = this.calculateMetricChange(trafficTotalCurrent, trafficTotalPrevious);
    return {
      requests: options.currentHostRequests ? this.createMetric("请求数", currentRequests, previousRequests, requestSeries, "") : this.createUnavailableMetric("请求数", ""),
      trafficSummary: options.domainTrafficAvailable === false ? this.createUnavailableTrafficSummary() : this.createTrafficSummaryMetric({
        ...options.trafficSummary || {},
        totalChange: trafficTotalChange
      }),
      topPaths: Array.isArray(options.topPaths) ? options.topPaths : [],
      recentDomains: Array.isArray(options.recentDomains) ? options.recentDomains : []
    };
  },
  createUnavailableMetric(label, unit) {
    return {
      label,
      value: null,
      unit,
      change: null,
      trendUp: null,
      series: []
    };
  },
  createUnavailableTrafficSummary() {
    return {
      available: false,
      totalBytes: null,
      totalChange: null,
      avgBytesPerSecond: null,
      peakBytesPerSecond: null,
      playbackAvailable: false,
      playbackAvgBytesPerSecond: null,
      playbackPeakBytesPerSecond: null,
      playbackWindowMs: PlaybackTelemetry.WINDOW_MS,
      playbackActiveRequests: 0,
      playbackActiveSessions: 0,
      estimated: false
    };
  },
  createTrafficSummaryMetric(summary) {
    if (!summary || summary.available === false) return this.createUnavailableTrafficSummary();
    return {
      available: true,
      totalBytes: Number.isFinite(summary.totalBytes) ? summary.totalBytes : 0,
      totalChange: Number.isFinite(summary.totalChange) ? summary.totalChange : null,
      avgBytesPerSecond: Number.isFinite(summary.avgBytesPerSecond) ? summary.avgBytesPerSecond : 0,
      peakBytesPerSecond: Number.isFinite(summary.peakBytesPerSecond) ? summary.peakBytesPerSecond : 0,
      playbackAvailable: summary.playbackAvailable === true,
      playbackAvgBytesPerSecond: Number.isFinite(summary.playbackAvgBytesPerSecond) ? summary.playbackAvgBytesPerSecond : null,
      playbackPeakBytesPerSecond: Number.isFinite(summary.playbackPeakBytesPerSecond) ? summary.playbackPeakBytesPerSecond : null,
      playbackWindowMs: Number(summary.playbackWindowMs) > 0 ? Number(summary.playbackWindowMs) : PlaybackTelemetry.WINDOW_MS,
      playbackActiveRequests: Math.max(0, Number(summary.playbackActiveRequests) || 0),
      playbackActiveSessions: Math.max(0, Number(summary.playbackActiveSessions) || 0),
      estimated: summary.estimated === true
    };
  },
  calculateMetricChange(currentValue, previousValue) {
    const current = Number(currentValue);
    const previous = Number(previousValue);
    if (!Number.isFinite(current)) return null;
    if (!Number.isFinite(previous)) return current === 0 ? 0 : 100;
    if (previous === 0) return current === 0 ? 0 : 100;
    return (current - previous) / previous * 100;
  },
  attachPlaybackSummary(payload, requestHost = "") {
    if (!payload || payload.mode !== "full") return payload;
    const summary = PlaybackTelemetry.getHostSummary(requestHost);
    const trafficSummary = this.createTrafficSummaryMetric({
      ...payload.metrics?.trafficSummary || this.createUnavailableTrafficSummary(),
      playbackAvailable: summary.available === true,
      playbackAvgBytesPerSecond: summary.avgBytesPerSecond,
      playbackPeakBytesPerSecond: summary.peakBytesPerSecond,
      playbackWindowMs: summary.windowMs,
      playbackActiveRequests: summary.activeRequests,
      playbackActiveSessions: summary.activeSessions
    });
    return {
      ...payload,
      playbackHint: this.buildPlaybackHint(summary),
      metrics: {
        ...payload.metrics || {},
        trafficSummary
      }
    };
  },
  composeFullPayload(summaryPayload, topPathsPayload) {
    return {
      ...summaryPayload || {},
      metrics: {
        ...summaryPayload?.metrics || {},
        topPaths: Array.isArray(topPathsPayload?.paths) ? topPathsPayload.paths : []
      }
    };
  },
  buildPlaybackHint(summary) {
    const windowSeconds = Math.max(1, Math.round((Number(summary?.windowMs) || PlaybackTelemetry.WINDOW_MS) / 1e3));
    if (summary?.available === true) {
      const activeSessions = Math.max(0, Number(summary.activeSessions) || 0);
      return activeSessions > 0 ? `播放速度基于近${windowSeconds}秒真实拉流统计，当前活跃会话 ${activeSessions} 个。` : `播放速度基于近${windowSeconds}秒真实拉流统计。`;
    }
    return `播放速度基于近${windowSeconds}秒真实拉流统计，无活跃拉流时显示 --。`;
  },
  createMetric(label, currentValue, previousValue, series, unit) {
    const current = Number.isFinite(currentValue) ? currentValue : 0;
    const previous = Number.isFinite(previousValue) ? previousValue : 0;
    let change = 0;
    if (previous === 0) {
      change = current === 0 ? 0 : 100;
    } else {
      change = (current - previous) / previous * 100;
    }
    return {
      label,
      value: currentValue,
      unit,
      change,
      trendUp: change >= 0,
      series
    };
  },
  json(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// src/storage/version-status-repository.js
init_auth();
init_version();
async function readStoredVersionStatus(env) {
  const kv = Auth.getKV(env);
  const record = await kv?.get(VERSION_STATUS_STORAGE_KEY, { type: "json" });
  return normalizeVersionStatusRecord(record || {});
}
async function writeStoredVersionStatus(env, record = {}) {
  const normalizedRecord = normalizeVersionStatusRecord(record);
  const kv = Auth.getKV(env);
  await kv?.put(VERSION_STATUS_STORAGE_KEY, JSON.stringify(normalizedRecord));
  return normalizedRecord;
}

// src/proxy/media/response-size.js
function getResponseContentLength(headers) {
  const raw = headers.get("Content-Length");
  const length = Number(raw);
  if (!Number.isFinite(length) || length <= 0) return null;
  return length;
}

// src/proxy/media/range-windows.js
function parseSingleByteRangeHeader(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const match = raw.match(/^bytes=(\d+)-(\d*)$/i);
  if (!match) return null;
  const start = Number(match[1]);
  const endRaw = String(match[2] || "").trim();
  const end = endRaw ? Number(endRaw) : null;
  if (!Number.isFinite(start) || start < 0) return null;
  if (end !== null && (!Number.isFinite(end) || end < start)) return null;
  return {
    start,
    end,
    openEnded: end === null
  };
}
function parseResponseByteRange(headers, fallbackLength = null) {
  const contentRange = String(headers?.get?.("Content-Range") || "").trim();
  const match = contentRange.match(/^bytes\s+(\d+)-(\d+)\/(\d+|\*)$/i);
  if (match) {
    const start = Number(match[1]);
    const end = Number(match[2]);
    const totalSize = match[3] === "*" ? null : Number(match[3]);
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
      return {
        start,
        end,
        totalSize: Number.isFinite(totalSize) && totalSize > 0 ? totalSize : null
      };
    }
  }
  const normalizedLength = Number(fallbackLength);
  if (Number.isFinite(normalizedLength) && normalizedLength > 0) {
    return {
      start: 0,
      end: normalizedLength - 1,
      totalSize: normalizedLength
    };
  }
  return null;
}
function parseResponseByteRangeFromHeaders(headers) {
  return parseResponseByteRange(headers, getResponseContentLength(headers));
}
function concatUint8Arrays(chunks, totalLength) {
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of Array.isArray(chunks) ? chunks : []) {
    if (!chunk?.byteLength) continue;
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}

// src/proxy/diagnostics/playback-optimization.js
init_constants();
function touchPlaybackOptimizationStats(globals) {
  globals.PlaybackOptimizationStats.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
}
function bumpPlaybackOptimizationStat(globals, section, key, amount = 1) {
  const bucket = globals.PlaybackOptimizationStats?.[section];
  if (!bucket || typeof bucket[key] !== "number") return;
  bucket[key] += amount;
  touchPlaybackOptimizationStats(globals);
}
function recordPlaybackOptimizationRoute(globals, route) {
  const safeRoute = String(route || "").trim().toLowerCase();
  if (!safeRoute) return;
  if (safeRoute.includes("redirect-cache")) bumpPlaybackOptimizationStat(globals, "redirect", "cache");
  if (safeRoute.includes("followed")) bumpPlaybackOptimizationStat(globals, "redirect", "followed");
  if (safeRoute.includes("basepath-cache")) bumpPlaybackOptimizationStat(globals, "basepath", "cache");
  if (safeRoute.includes("basepath-fallback")) bumpPlaybackOptimizationStat(globals, "basepath", "fallback");
}
function getPlaybackOptimizationStats(globals) {
  return JSON.parse(JSON.stringify(globals.PlaybackOptimizationStats));
}
function createPlaybackOptimizationBudgetState(request, requestState) {
  const range = parseSingleByteRangeHeader(request?.headers?.get?.("Range"));
  const boundedSize = range && range.end !== null ? range.end - range.start + 1 : null;
  const isDeepRange = !!range && range.start >= PLAYBACK_OPTIMIZATION_DEEP_RANGE_START_BYTES;
  const allowDeepRangeRelaxation = requestState?.allowEarlyJumpBudgetRelaxation === true;
  const isLargeBoundedRange = Number.isFinite(boundedSize) && boundedSize > PLAYBACK_OPTIMIZATION_MAX_BOUNDED_RANGE_BYTES;
  const bypassForRange = isDeepRange && !allowDeepRangeRelaxation || isLargeBoundedRange;
  return {
    startedAt: Date.now(),
    degraded: bypassForRange,
    marked: false,
    reason: bypassForRange ? "range" : "",
    range,
    shouldBypassWindow: bypassForRange,
    shouldBypassPrime: bypassForRange
  };
}
function markPlaybackOptimizationBudgetDegraded(globals, state, reason = "budget") {
  if (!state) return;
  if (!state.degraded) {
    state.degraded = true;
    state.reason = String(reason || "budget");
  }
  if (state.marked) return;
  state.marked = true;
  bumpPlaybackOptimizationStat(globals, "budget", "degraded");
}
function decorateBudgetRoute(route, budgetDegraded) {
  const safeRoute = String(route || "passthrough");
  if (!budgetDegraded) return safeRoute;
  if (safeRoute.startsWith("budget-degraded")) return safeRoute;
  return `budget-degraded-${safeRoute}`;
}

// src/storage/config-repository.js
init_normalize();
init_auth();
init_runtime_state();
var CONFIG_STORAGE_KEY = "sys:theme";
function normalizeStoredConfig(config = {}) {
  return normalizeConfig(config);
}
async function readRuntimeConfig(env) {
  let config = GLOBALS.ConfigCache;
  if (config) return config;
  const kv = Auth.getKV(env);
  config = normalizeStoredConfig(await kv?.get(CONFIG_STORAGE_KEY, { type: "json" }) || {});
  GLOBALS.ConfigCache = config;
  return config;
}
async function writeRuntimeConfig(env, config = {}) {
  const normalizedConfig = normalizeStoredConfig(config);
  const kv = Auth.getKV(env);
  await kv?.put(CONFIG_STORAGE_KEY, JSON.stringify(normalizedConfig));
  GLOBALS.ConfigCache = normalizedConfig;
  return normalizedConfig;
}

// src/proxy/pipeline/handle.js
init_runtime_state();

// src/proxy/media/response-header-policy.js
function applyBaseProxySecurityHeaders(modifiedHeaders) {
  modifiedHeaders.set("Referrer-Policy", "origin-when-cross-origin");
  modifiedHeaders.set("Strict-Transport-Security", "max-age=15552000; preload");
  modifiedHeaders.set("X-Frame-Options", "SAMEORIGIN");
  modifiedHeaders.set("X-Content-Type-Options", "nosniff");
  modifiedHeaders.set("X-XSS-Protection", "1; mode=block");
  modifiedHeaders.delete("X-Powered-By");
}
var DEFAULT_CORS_ALLOW_METHODS = "GET, POST, PUT, DELETE, OPTIONS, HEAD";
var DEFAULT_CORS_ALLOW_HEADERS = "Content-Type, Authorization, X-Emby-Authorization, X-Emby-Token, X-Emby-Client, X-Emby-Device-Id, X-Emby-Device-Name, X-Emby-Client-Version";
var DEFAULT_CORS_EXPOSE_HEADERS = "Content-Length, Content-Range, X-Emby-Auth-Token";
function applyProxyCorsHeaders(modifiedHeaders, request, originOverride = null) {
  const reqOrigin = request?.headers?.get?.("Origin");
  const reqHeaders = request?.headers?.get?.("Access-Control-Request-Headers");
  const allowOrigin = originOverride || reqOrigin || "*";
  modifiedHeaders.set("Access-Control-Allow-Origin", allowOrigin);
  modifiedHeaders.set("Access-Control-Allow-Methods", DEFAULT_CORS_ALLOW_METHODS);
  modifiedHeaders.set("Access-Control-Expose-Headers", DEFAULT_CORS_EXPOSE_HEADERS);
  if (reqHeaders) {
    modifiedHeaders.set("Access-Control-Allow-Headers", reqHeaders);
    mergeVaryHeader(modifiedHeaders, "Access-Control-Request-Headers");
  } else {
    modifiedHeaders.set("Access-Control-Allow-Headers", DEFAULT_CORS_ALLOW_HEADERS);
  }
  if (allowOrigin !== "*") {
    mergeVaryHeader(modifiedHeaders, "Origin");
  }
}
function appendCorsExposeHeaders(modifiedHeaders, extraHeaders = []) {
  const current = String(modifiedHeaders.get("Access-Control-Expose-Headers") || DEFAULT_CORS_EXPOSE_HEADERS);
  const merged = current.split(",").map((item) => String(item || "").trim()).filter(Boolean);
  const extras = Array.isArray(extraHeaders) ? extraHeaders : [extraHeaders];
  for (const item of extras) {
    const normalized = String(item || "").trim();
    if (normalized && !merged.includes(normalized)) merged.push(normalized);
  }
  modifiedHeaders.set("Access-Control-Expose-Headers", merged.join(", "));
}
function applyStaticStreamingCacheHeaders(modifiedHeaders, requestState, upstreamCacheStatus = "", options = {}) {
  if (requestState.isImage || requestState.isStaticFile || requestState.isSubtitle) {
    const imageCacheMaxAge = Math.max(0, Math.round(Number(requestState.imageCacheMaxAge) || 86400 * 30));
    modifiedHeaders.set(
      "Cache-Control",
      requestState.isImage ? buildImageCacheControl(requestState, imageCacheMaxAge) : "public, max-age=86400"
    );
    if (upstreamCacheStatus) {
      modifiedHeaders.set("X-Emby-Proxy-Cache", upstreamCacheStatus);
    } else {
      modifiedHeaders.delete("X-Emby-Proxy-Cache");
    }
  } else if (requestState.isManifest) {
    modifiedHeaders.set("Cache-Control", "no-store");
  } else if (requestState.isBigStream || options.proxiedExternalRedirect === true) {
    modifiedHeaders.set("Cache-Control", "no-store");
  }
}
function buildImageCacheControl(requestState, imageCacheMaxAge) {
  const directives = [
    "public",
    `max-age=${imageCacheMaxAge}`,
    "stale-while-revalidate=86400"
  ];
  if (hasStableImageTag(requestState)) {
    directives.push("immutable");
  }
  return directives.join(", ");
}
function hasStableImageTag(requestState) {
  const candidates = [requestState?.activeFinalUrl, requestState?.requestUrl];
  for (const candidate of candidates) {
    if (!(candidate instanceof URL)) continue;
    if (String(candidate.searchParams.get("tag") || "").trim()) return true;
  }
  return false;
}
function mergeVaryHeader(headers, value) {
  const current = headers.get("Vary");
  if (!current) {
    headers.set("Vary", value);
    return;
  }
  const parts = current.split(",").map((part) => part.trim()).filter(Boolean);
  if (!parts.includes(value)) {
    parts.push(value);
  }
  headers.set("Vary", parts.join(", "));
}

// src/proxy/routing/redirect-policy.js
init_defaults();
function escapeRegexLiteral(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function parseKeywordTerms(raw = "") {
  return String(raw || "").split(/[\n\r,，;；|]+/).map((item) => normalizeRedirectRuleValue(item)).filter(Boolean);
}
function normalizeNodeNameList2(input) {
  const rawList = Array.isArray(input) ? input : String(input || "").split(/[\n\r,，;；|]+/);
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const item of rawList) {
    const value = String(item || "").trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}
function getRedirectWhitelistDomains(config) {
  return normalizeRedirectWhitelistDomains(config?.redirectWhitelistDomains);
}
function isManualRedirectHost(hostname, redirectWhitelistDomains = []) {
  const host = String(hostname || "").toLowerCase();
  return [...MANUAL_REDIRECT_DOMAINS, ...normalizeRedirectWhitelistDomains(redirectWhitelistDomains)].some((domain) => host === domain || host.endsWith(`.${domain}`));
}
function shouldDirectByWangpan(targetUrl, customKeywords = "") {
  let haystack = "";
  try {
    const url = targetUrl instanceof URL ? targetUrl : new URL(String(targetUrl));
    haystack = `${url.hostname} ${url.href}`;
  } catch (_) {
    haystack = String(targetUrl || "");
  }
  const seen = /* @__PURE__ */ new Set();
  const terms = [...DEFAULT_REDIRECT_RULE_TERMS2, ...parseKeywordTerms(customKeywords)].filter((item) => {
    const key = String(item || "").toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (!terms.length) return false;
  try {
    const matcher = new RegExp(terms.map(escapeRegexLiteral).join("|"), "i");
    return matcher.test(haystack);
  } catch (_) {
    return false;
  }
}
function isNodeDirectSourceEnabled(node, currentConfig = null, explicitNodeName = "") {
  const configuredDirectNodes = normalizeNodeNameList2(
    currentConfig?.sourceDirectNodes ?? currentConfig?.directSourceNodes ?? currentConfig?.nodeDirectList ?? []
  );
  const candidateNodeKeys = [
    explicitNodeName,
    node?.path,
    node?.name,
    node?.displayName
  ].map((item) => String(item || "").trim()).filter(Boolean);
  if (candidateNodeKeys.some((candidate) => configuredDirectNodes.some((item) => item.toLowerCase() === candidate.toLowerCase()))) {
    return true;
  }
  const proxyMode = String(node?.proxyMode || node?.mode || "").trim().toLowerCase();
  if (["direct", "source-direct", "origin-direct", "node-direct"].includes(proxyMode)) {
    return true;
  }
  if (node?.direct === true || node?.sourceDirect === true || node?.directSource === true || node?.direct2xx === true) {
    return true;
  }
  const explicitText = `${node?.tag || ""} ${node?.remark || ""}`;
  return /(?:^|[\s\[(【])(?:直连|source-direct|origin-direct|node-direct)(?:$|[\s\])】])/i.test(explicitText);
}

// src/proxy/routing/url-utils.js
var EXTERNAL_REDIRECT_CACHE_NOISE_QUERY_KEYS = /* @__PURE__ */ new Set([
  "_",
  "cb",
  "cache_bust",
  "cachebust",
  "client",
  "clientid",
  "deviceid",
  "devicename",
  "rand",
  "random",
  "r",
  "playsessionid",
  "starttimeticks",
  "stamp",
  "t",
  "timestamp",
  "ts",
  "xembyclient",
  "xembyclientversion",
  "xembydeviceid",
  "xembydevicename"
]);
function normalizeComparableHost(host) {
  const raw = String(host || "").trim().toLowerCase();
  if (!raw) return "";
  return raw.replace(/:443$|:80$/i, "");
}
function stripProxyPrefix(path, proxyPrefix) {
  const raw = String(path || "");
  if (!raw || !proxyPrefix) return null;
  if (raw === proxyPrefix) return "/";
  if (raw.startsWith(`${proxyPrefix}/`)) return raw.slice(proxyPrefix.length) || "/";
  return null;
}
function ensureBasePath(path, basePath) {
  const normalizedPath = String(path || "").startsWith("/") ? String(path || "") : `/${String(path || "")}`;
  if (!basePath) return normalizedPath || "/";
  if (normalizedPath === "/" || normalizedPath === "") return basePath;
  if (normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`)) return normalizedPath;
  return `${basePath}${normalizedPath}`;
}
function inferBasePathFromRequestPath(path) {
  const raw = String(path || "");
  const match = raw.match(/^\/([^/]+)(?:\/|$)/);
  if (!match) return "";
  const firstSegment = match[1];
  if (!firstSegment) return "";
  if (/^(emby|jellyfin)$/i.test(firstSegment)) {
    return `/${firstSegment}`;
  }
  return "";
}
function extractAbsolutePathnameFromMixedPath(value) {
  const raw = String(value || "");
  if (!raw) return "";
  const candidates = [raw];
  if (/%2f|%3a/i.test(raw)) {
    try {
      const decoded = decodeURIComponent(raw);
      if (decoded && decoded !== raw) candidates.push(decoded);
    } catch (_) {
    }
  }
  for (const candidate of candidates) {
    const absoluteStart = candidate.search(/https?:\/\//i);
    if (absoluteStart < 0) continue;
    try {
      const parsed = new URL(candidate.slice(absoluteStart));
      return parsed.pathname || "/";
    } catch (_) {
    }
  }
  return "";
}
function normalizeProxyArtifactPath(pathname, { extractAbsolute = false } = {}) {
  let normalized = String(pathname || "/").split("?")[0].split("#")[0] || "/";
  normalized = normalized.startsWith("/") ? normalized : `/${normalized}`;
  normalized = normalized.replace(/\/{2,}/g, "/");
  if (extractAbsolute) {
    const absolutePath = extractAbsolutePathnameFromMixedPath(normalized);
    if (absolutePath) {
      normalized = absolutePath;
    }
  }
  normalized = normalized.replace(/^\/(emby|jellyfin)\1(?=\/|$)/i, "/$1").replace(/^\/(emby|jellyfin)(videos|audio|live)(?=\/|$)/i, "/$1/$2").replace(/^\/(emby|jellyfin)\/[^/]+\/(?:emby|jellyfin)\/(?=(?:videos|audio|live)\/)/i, "/$1/");
  while (/^\/(emby|jellyfin)\/\1(?=\/|$)/i.test(normalized)) {
    normalized = normalized.replace(/^\/(emby|jellyfin)\/\1(?=\/|$)/i, "/$1");
  }
  return normalized || "/";
}
function normalizeExternalRedirectCachePath(pathname) {
  let normalized = normalizeProxyArtifactPath(pathname, { extractAbsolute: true });
  normalized = normalized.replace(/^\/(?:emby|jellyfin)(?=\/(?:videos|audio|live)\/)/i, "");
  return normalized || "/";
}
function normalizeExternalRedirectMethod(method) {
  const safeMethod = String(method || "GET").toUpperCase();
  if (safeMethod === "GET" || safeMethod === "HEAD") return "READ";
  return safeMethod;
}
function shouldIgnoreExternalRedirectQueryParam(key, noiseQueryKeys = null) {
  return !!noiseQueryKeys?.has(String(key || "").trim().toLowerCase());
}
function buildCanonicalExternalRedirectUrl(url, { noiseQueryKeys = null } = {}) {
  let parsed = null;
  try {
    parsed = url instanceof URL ? new URL(url.toString()) : new URL(String(url || ""), "https://redirect-cache.invalid");
  } catch (_) {
    return null;
  }
  const searchEntries = [...parsed.searchParams.entries()].filter(([key]) => !shouldIgnoreExternalRedirectQueryParam(key, noiseQueryKeys)).sort(([leftKey, leftValue], [rightKey, rightValue]) => {
    if (leftKey === rightKey) return leftValue.localeCompare(rightValue);
    return leftKey.localeCompare(rightKey);
  });
  return {
    host: normalizeComparableHost(parsed.host),
    pathname: normalizeExternalRedirectCachePath(parsed.pathname),
    search: searchEntries.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&")
  };
}
function buildExternalRedirectCacheKey(method, url, { noiseQueryKeys = null } = {}) {
  const normalizedMethod = normalizeExternalRedirectMethod(method);
  const canonicalUrl = buildCanonicalExternalRedirectUrl(url, { noiseQueryKeys });
  if (!canonicalUrl) return `${normalizedMethod}:${String(url || "")}`;
  const searchSuffix = canonicalUrl.search ? `?${canonicalUrl.search}` : "";
  return `${normalizedMethod}:${canonicalUrl.host}${canonicalUrl.pathname}${searchSuffix}`;
}
function hashCanonicalRedirectCacheKey(cacheKey) {
  const input = String(cacheKey || "");
  let hashA = 2166136261;
  let hashB = 3342144677;
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    hashA ^= code;
    hashA = Math.imul(hashA, 16777619);
    hashB ^= code;
    hashB = Math.imul(hashB, 2246822519);
  }
  const hexA = (hashA >>> 0).toString(16).padStart(8, "0");
  const hexB = (hashB >>> 0).toString(16).padStart(8, "0");
  return `${hexA}${hexB}`;
}
function buildExternalRedirectPersistenceStorageKey(cacheKey) {
  return `redirect:v1:${hashCanonicalRedirectCacheKey(cacheKey)}`;
}
function extractEmbeddedProxyPath(path, requestUrl, proxyPrefix) {
  const raw = String(path || "");
  const candidates = [raw];
  if (/%2f|%3a/i.test(raw)) {
    try {
      const decoded = decodeURIComponent(raw);
      if (decoded && decoded !== raw) candidates.push(decoded);
    } catch (_) {
    }
  }
  for (const candidate of candidates) {
    const absoluteStart = candidate.search(/https?:\/\//i);
    if (absoluteStart < 0) continue;
    try {
      const embeddedUrl = new URL(candidate.slice(absoluteStart));
      if (normalizeComparableHost(embeddedUrl.host) !== normalizeComparableHost(requestUrl.host)) continue;
      const embeddedPath = `${embeddedUrl.pathname}${embeddedUrl.search}${embeddedUrl.hash || ""}`;
      return stripProxyPrefix(embeddedPath, proxyPrefix) || embeddedPath;
    } catch (_) {
    }
  }
  return "";
}

// src/proxy/routing/incoming-path.js
function normalizeIncomingPath(path, requestUrl, targetBasePath, proxyPrefix) {
  const rawInput = String(path || "");
  const raw = normalizeProxyArtifactPath(rawInput, { extractAbsolute: false });
  const explicitBasePath = targetBasePath && targetBasePath !== "/" ? targetBasePath : "";
  const inferredBasePath = explicitBasePath ? "" : inferBasePathFromRequestPath(raw);
  const effectiveBasePath = explicitBasePath || inferredBasePath;
  if (!rawInput) return effectiveBasePath || "/";
  const embeddedProxyPath = extractEmbeddedProxyPath(rawInput, requestUrl, proxyPrefix);
  if (embeddedProxyPath) {
    const normalizedEmbeddedPath = normalizeProxyArtifactPath(embeddedProxyPath, { extractAbsolute: false });
    return ensureBasePath(normalizedEmbeddedPath, effectiveBasePath);
  }
  const duplicatedClientPath = collapseDuplicatedClientPath(raw, effectiveBasePath, proxyPrefix);
  if (duplicatedClientPath) {
    return normalizeIncomingPath(duplicatedClientPath, requestUrl, targetBasePath, proxyPrefix);
  }
  if (effectiveBasePath) {
    const duplicatedPrefix = `${effectiveBasePath}${proxyPrefix}`;
    if (raw === duplicatedPrefix || raw.startsWith(`${duplicatedPrefix}/`)) {
      const suffix = raw.slice(duplicatedPrefix.length) || "/";
      return ensureBasePath(suffix, effectiveBasePath);
    }
  }
  const strippedProxyPath = stripProxyPrefix(raw, proxyPrefix);
  if (strippedProxyPath !== null) {
    const normalizedStrippedPath = normalizeProxyArtifactPath(strippedProxyPath, { extractAbsolute: false });
    return ensureBasePath(normalizedStrippedPath, effectiveBasePath);
  }
  return raw;
}
function collapseDuplicatedClientPath(path, basePath, proxyPrefix) {
  const raw = normalizeProxyArtifactPath(String(path || ""), { extractAbsolute: false });
  if (!raw || !basePath || !proxyPrefix) return "";
  const clientBasePrefix = `${proxyPrefix}${basePath}`;
  const doubledClientBasePrefix = `${clientBasePrefix}${clientBasePrefix}`;
  if (raw === doubledClientBasePrefix || raw.startsWith(`${doubledClientBasePrefix}/`)) {
    return raw.slice(clientBasePrefix.length) || "/";
  }
  return "";
}

// src/proxy/pipeline/request-state.js
init_metadata_prewarm();

// src/proxy/routing/basepath-state.js
init_constants();
function normalizeMediaBasePath(basePath) {
  const raw = String(basePath || "").trim();
  if (!raw || raw === "/") return "";
  return raw.startsWith("/") ? raw.replace(/\/+$/, "") : `/${raw.replace(/\/+$/, "")}`;
}
function stripKnownApiBasePath(path) {
  const safePath = String(path || "").trim();
  if (!safePath) return "/";
  const normalized = safePath.startsWith("/") ? safePath : `/${safePath}`;
  return normalized.replace(/^\/(?:emby|jellyfin)(?=\/|$)/i, "") || "/";
}
function normalizeBasePathState(state = null) {
  return {
    mediaBasePath: normalizeMediaBasePath(state?.mediaBasePath || state?.basePath || ""),
    apiBasePath: normalizeMediaBasePath(state?.apiBasePath || "")
  };
}
function getCachedBasePathState(globals, nodeName) {
  const safeName = String(nodeName || "").trim();
  if (!safeName) return normalizeBasePathState();
  const now = Date.now();
  const mem = globals.StreamBasePathCache.get(safeName);
  if (mem && mem.exp > now) {
    return normalizeBasePathState(mem);
  }
  globals.StreamBasePathCache.delete(safeName);
  return normalizeBasePathState();
}
async function cacheLearnedBasePath(globals, nodeName, channel = "media", basePath) {
  const safeName = String(nodeName || "").trim();
  const normalized = normalizeMediaBasePath(basePath);
  if (!safeName || !normalized) return getCachedBasePathState(globals, safeName);
  const current = getCachedBasePathState(globals, safeName);
  const next = {
    ...current,
    mediaBasePath: channel === "media" ? normalized : current.mediaBasePath,
    apiBasePath: channel === "api" ? normalized : current.apiBasePath
  };
  const normalizedState = normalizeBasePathState(next);
  globals.StreamBasePathCache.set(safeName, {
    ...normalizedState,
    exp: Date.now() + MEDIA_BASE_PATH_CACHE_TTL_MS
  });
  syncNodeContextLearnedBasePaths(globals, safeName, normalizedState);
  return normalizedState;
}
async function clearCachedLearnedBasePath(globals, nodeName, channel = "") {
  const safeName = String(nodeName || "").trim();
  if (!safeName) return;
  if (!channel) {
    globals.StreamBasePathCache.delete(safeName);
    syncNodeContextLearnedBasePaths(globals, safeName, normalizeBasePathState());
  } else {
    const current = getCachedBasePathState(globals, safeName);
    const next = {
      ...current,
      mediaBasePath: channel === "media" ? "" : current.mediaBasePath,
      apiBasePath: channel === "api" ? "" : current.apiBasePath
    };
    if (!next.mediaBasePath && !next.apiBasePath) {
      globals.StreamBasePathCache.delete(safeName);
      syncNodeContextLearnedBasePaths(globals, safeName, normalizeBasePathState());
    } else {
      globals.StreamBasePathCache.set(safeName, {
        ...next,
        exp: Date.now() + MEDIA_BASE_PATH_CACHE_TTL_MS
      });
      syncNodeContextLearnedBasePaths(globals, safeName, next);
      return;
    }
  }
}
async function clearCachedNodeContext(globals, nodeName) {
  const safeName = String(nodeName || "").trim();
  if (!safeName) return;
  globals.NodeContextCache.delete(safeName);
}
function syncNodeContextLearnedBasePaths(globals, nodeName, state) {
  const safeName = String(nodeName || "").trim();
  if (!safeName) return;
  const cached = globals.NodeContextCache.get(safeName);
  if (!cached?.value) return;
  cached.value = {
    ...cached.value,
    learnedBasePaths: normalizeBasePathState(state)
  };
  globals.NodeContextCache.set(safeName, cached);
}
async function clearCachedNodeState(globals, nodeName) {
  await clearCachedNodeContext(globals, nodeName);
  await clearCachedLearnedBasePath(globals, nodeName);
}
function detectBasePathChannel(path) {
  const safePath = stripKnownApiBasePath(path).toLowerCase();
  if (/^(?:\/videos\/|\/audio\/|\/live\/)/i.test(safePath)) return "media";
  if (/(?:\/playbackinfo\b|^\/items\/|^\/sessions\/)/i.test(safePath)) return "api";
  return "";
}
function shouldApplyLearnedBasePath(path, channel = "") {
  const comparablePath = stripKnownApiBasePath(path);
  if (channel === "media") return /^(?:\/videos\/|\/audio\/|\/live\/)/i.test(comparablePath);
  if (channel === "api") return /(?:\/playbackinfo\b|^\/items\/|^\/sessions\/)/i.test(comparablePath);
  return false;
}
function shouldTryBasePathFallback(response, normalizedPath, targetBasePath, channel = "") {
  if (targetBasePath) return false;
  if (!response || Number(response.status) !== 404) return false;
  const safePath = String(normalizedPath || "").toLowerCase();
  if (!safePath || safePath.startsWith("/emby/") || safePath.startsWith("/jellyfin/")) return false;
  return !!(channel || detectBasePathChannel(safePath));
}
function getBasePathFallbacks(normalizedPath, _channel = "") {
  const safePath = String(normalizedPath || "").toLowerCase();
  const fallbacks = [];
  if (!safePath.startsWith("/emby/")) fallbacks.push("/emby");
  if (!safePath.startsWith("/jellyfin/")) fallbacks.push("/jellyfin");
  return fallbacks;
}

// src/proxy/pipeline/request-state.js
var STARTUP_MEDIA_FAST_PATH_MAX_START_BYTES = 1024 * 1024;
var STARTUP_MEDIA_FAST_PATH_MAX_BOUNDED_BYTES = 2 * 1024 * 1024;
function readRequestedMediaSourceIdFromUrl(requestUrl) {
  if (!(requestUrl instanceof URL)) return "";
  return String(
    requestUrl.searchParams.get("MediaSourceId") || requestUrl.searchParams.get("mediasourceid") || ""
  ).trim();
}
async function readRequestedMediaSourceId(request, path, requestUrl) {
  const requestedFromUrl = readRequestedMediaSourceIdFromUrl(requestUrl);
  if (requestedFromUrl) return requestedFromUrl;
  const method = String(request?.method || "GET").toUpperCase();
  const lowerPath = String(path || "").toLowerCase();
  if (method !== "POST" || !lowerPath.includes("/playbackinfo")) return "";
  const contentType = String(request?.headers?.get?.("Content-Type") || "").toLowerCase();
  if (!contentType.includes("application/json")) return "";
  try {
    const payload = await request.clone().json();
    const directId = String(payload?.MediaSourceId || payload?.mediaSourceId || "").trim();
    if (directId) return directId;
    const list = Array.isArray(payload?.MediaSourceIds) ? payload.MediaSourceIds : [];
    return String(list.find((item) => String(item || "").trim()) || "").trim();
  } catch (_) {
    return "";
  }
}
function classifyRequestTraits(globals, input = {}) {
  const activePath = String(input.path || "");
  const requestUrl = input.requestUrl instanceof URL ? input.requestUrl : new URL(String(input.requestUrl || "https://invalid.local"));
  const method = String(input.method || "GET").toUpperCase();
  const rangeHeader = input.rangeHeader ?? null;
  const isImage = /(?:\/images\/|\/icons\/|\/branding\/|\/emby\/covers\/|\.jpe?g$|\.gif$|\.png$|\.svg$|\.ico$|\.webp$)/i.test(activePath);
  const isStaticFile = /\.(?:js|css|woff2?|ttf|otf|map|webmanifest)$/i.test(activePath);
  const isSubtitle = /\.(?:srt|ass|vtt|sub)$/i.test(activePath);
  const isManifest = /\.(?:m3u8|mpd)$/i.test(activePath);
  const isSegment = /\.(?:ts|m4s)$/i.test(activePath);
  const isWsUpgrade = String(input.upgradeHeader || "").toLowerCase() === "websocket";
  const isSafeMethod = method === "GET" || method === "HEAD";
  const isPlaybackInfo = /\/playbackinfo\b/i.test(activePath);
  const looksLikeVideoRoute = globals.Regex.Streaming.test(activePath) || /\/videos\/[^/]+\/(?:stream|original|download|file)/i.test(activePath) || /\/items\/[^/]+\/download/i.test(activePath) || requestUrl.searchParams.get("Static") === "true" || requestUrl.searchParams.get("Download") === "true";
  const nodeDirectSource = input.nodeDirectSourceEnabled === true;
  const directStaticAssets = input.directStaticAssetsEnabled === true && isSafeMethod && isStaticFile;
  const directHlsDash = input.directHlsDashEnabled === true && isSafeMethod && (isManifest || isSegment);
  const direct307Mode = nodeDirectSource || directStaticAssets || directHlsDash;
  const enablePrewarm = input.enablePrewarmConfigured !== false && !direct307Mode;
  const prewarmDepth = normalizePrewarmDepth(input.prewarmDepthConfigured);
  const isMetadataPrewarm = input.metadataPrewarmConfigured === true;
  const isBigStream = looksLikeVideoRoute && !isManifest && !isSegment;
  return {
    rangeHeader,
    nodeDirectSource,
    enablePrewarm,
    prewarmDepth,
    isImage,
    isStaticFile,
    isSubtitle,
    isManifest,
    isSegment,
    isWsUpgrade,
    isPlaybackInfo,
    isMetadataPrewarm,
    looksLikeVideoRoute,
    isBigStream,
    directStaticAssets,
    directHlsDash,
    direct307Mode,
    isStatic: (isImage || isStaticFile || isSubtitle) && method === "GET"
  };
}
function shouldUseStartupMediaFastPath(requestState) {
  if (!requestState) return false;
  const method = String(requestState.method || "").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return false;
  if (requestState.isMetadataPrewarm === true) return false;
  if (requestState.isImage === true || requestState.isStaticFile === true || requestState.isSubtitle === true) return false;
  if (requestState.isManifest === true || requestState.isSegment === true || requestState.isWsUpgrade === true) return false;
  if (requestState.looksLikeVideoRoute !== true && requestState.isStreaming !== true) return false;
  const range = parseSingleByteRangeHeader(requestState.rangeHeader);
  if (!range) return true;
  if (range.start > STARTUP_MEDIA_FAST_PATH_MAX_START_BYTES) return false;
  if (range.end === null) return true;
  const boundedSize = range.end - range.start + 1;
  return boundedSize > 0 && boundedSize <= STARTUP_MEDIA_FAST_PATH_MAX_BOUNDED_BYTES;
}
function shouldUseContinuationMediaFastPath(requestState) {
  if (!requestState) return false;
  const method = String(requestState.method || "").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return false;
  if (requestState.isMetadataPrewarm === true) return false;
  if (requestState.isImage === true || requestState.isStaticFile === true || requestState.isSubtitle === true) return false;
  if (requestState.isManifest === true || requestState.isSegment === true || requestState.isWsUpgrade === true) return false;
  if (requestState.looksLikeVideoRoute !== true && requestState.isStreaming !== true) return false;
  const range = parseSingleByteRangeHeader(requestState.rangeHeader);
  return !!range && range.start > 0;
}
async function normalizeIncomingRequest(globals, request, path, context) {
  const baseState = await createRequestBaseState(request, path, context);
  return buildTargetRequestState(globals, baseState, context.primaryTarget, context.proxyPrefix);
}
async function normalizeIndependentImageRequest(globals, request, path, context) {
  const baseState = await createRequestBaseState(request, path, context);
  return buildTargetRequestState(
    globals,
    {
      ...baseState,
      enablePrewarmConfigured: false,
      metadataPrewarmConfigured: false,
      prewarmDepthConfigured: "poster_manifest"
    },
    context.primaryTarget,
    context.proxyPrefix,
    { disableBasePathLearning: true }
  );
}
async function normalizeIndependentMetadataRequest(globals, request, path, context) {
  const baseState = await createRequestBaseState(request, path, context);
  return buildTargetRequestState(
    globals,
    {
      ...baseState,
      enablePrewarmConfigured: false
    },
    context.primaryTarget,
    context.proxyPrefix,
    { disableBasePathLearning: false }
  );
}
async function createRequestBaseState(request, path, context) {
  const requestUrl = new URL(request.url);
  const requestHost = requestUrl.host;
  const method = request.method.toUpperCase();
  const requestedMediaSourceId = await readRequestedMediaSourceId(request, path, requestUrl);
  return {
    requestUrl,
    requestHost,
    method,
    requestedMediaSourceId,
    rangeHeader: request.headers.get("Range"),
    upgradeHeader: request.headers.get("Upgrade"),
    metadataPrewarmConfigured: request.headers.get("X-Metadata-Prewarm") === "1",
    prewarmCacheTtl: Number(context?.prewarmCacheTtl) || 180,
    prewarmDepthConfigured: context?.prewarmDepth,
    imageCacheMaxAge: Number(context?.imageCacheMaxAge) || 86400 * 30,
    nodeDirectSourceEnabled: context?.nodeDirectSource === true,
    enablePrewarmConfigured: context?.enablePrewarm !== false,
    directStaticAssetsEnabled: context?.directStaticAssets === true,
    directHlsDashEnabled: context?.directHlsDash === true,
    incomingPathRaw: String(path || ""),
    learnedBasePaths: context.learnedBasePaths || normalizeBasePathState()
  };
}
function buildTargetRequestState(globals, baseState, targetEntry, proxyPrefix, options = {}) {
  const normalizedPath = normalizeIncomingPath(
    baseState.incomingPathRaw,
    baseState.requestUrl,
    targetEntry.targetBasePath,
    proxyPrefix
  );
  const inferredBasePath = inferBasePathFromRequestPath(normalizedPath);
  const disableBasePathLearning = options.disableBasePathLearning === true;
  const basePathChannel = disableBasePathLearning ? "" : !targetEntry.targetBasePath ? detectBasePathChannel(normalizedPath) : "";
  const learnedBasePaths = baseState.learnedBasePaths || normalizeBasePathState();
  const learnedBasePath = basePathChannel ? basePathChannel === "api" ? learnedBasePaths.apiBasePath : learnedBasePaths.mediaBasePath : "";
  const applyLearnedBasePath = learnedBasePath && shouldApplyLearnedBasePath(normalizedPath, basePathChannel);
  const activeNormalizedPath = applyLearnedBasePath ? ensureBasePath(normalizedPath, learnedBasePath) : normalizedPath;
  const activeFinalUrl = new URL(activeNormalizedPath, targetEntry.targetBase);
  activeFinalUrl.search = baseState.requestUrl.search;
  const lowerPath = activeNormalizedPath.toLowerCase();
  const isStreamingPath = /\/videos\/[^/]+\/(?:stream|original|master|main|hls)|\/audio\/[^/]+\/stream|\/live\//.test(lowerPath);
  const classified = classifyRequestTraits(globals, {
    path: activeNormalizedPath,
    requestUrl: baseState.requestUrl,
    method: baseState.method,
    rangeHeader: baseState.rangeHeader,
    upgradeHeader: baseState.upgradeHeader,
    metadataPrewarmConfigured: baseState.metadataPrewarmConfigured,
    nodeDirectSourceEnabled: baseState.nodeDirectSourceEnabled,
    enablePrewarmConfigured: baseState.enablePrewarmConfigured,
    prewarmDepthConfigured: baseState.prewarmDepthConfigured,
    directStaticAssetsEnabled: baseState.directStaticAssetsEnabled,
    directHlsDashEnabled: baseState.directHlsDashEnabled
  });
  return {
    ...baseState,
    normalizedPath,
    inferredBasePath,
    basePathChannel,
    learnedBasePath,
    usedCachedBasePath: !!(applyLearnedBasePath && activeNormalizedPath !== normalizedPath),
    activeNormalizedPath,
    activeFinalUrl,
    activeRewriteBasePath: targetEntry.targetBasePath || learnedBasePath || inferredBasePath,
    lowerPath,
    activeTargetIndex: targetEntry.index,
    activeTargetTarget: targetEntry.target,
    activeTargetBase: targetEntry.targetBase,
    activeTargetHost: targetEntry.targetHost,
    activeTargetBasePath: targetEntry.targetBasePath,
    prewarmCacheTtl: baseState.prewarmCacheTtl,
    prewarmDepth: classified.prewarmDepth,
    imageCacheMaxAge: baseState.imageCacheMaxAge,
    ...classified,
    isStreaming: globals.Regex.Streaming.test(activeNormalizedPath) || isStreamingPath
  };
}

// src/proxy/pipeline/node-context.js
init_node_model();
init_constants();
async function prepareNodeContext(globals, node, nodePath, legacyKeyOrRuntimeConfig = null, runtimeConfig = null) {
  const safePath = String(nodePath || "").trim();
  const finalRuntimeConfig = typeof legacyKeyOrRuntimeConfig === "string" ? runtimeConfig : legacyKeyOrRuntimeConfig;
  const orderedLines = getOrderedNodeLines(node);
  const normalizedTargets = orderedLines.length ? orderedLines.map((line) => line.target) : normalizeTargetList(node?.targets, node?.target);
  const nodeHeaders = node?.headers && typeof node.headers === "object" && !Array.isArray(node.headers) ? { ...node.headers } : {};
  const signature = [
    normalizedTargets.join(","),
    String(node?.activeLineId || "").trim(),
    safePath,
    node?.redirectWhitelistEnabled === true ? "1" : "0",
    normalizeNodeRealClientIpMode(node?.realClientIpMode),
    JSON.stringify(Object.entries(nodeHeaders).sort(([a], [b]) => String(a).localeCompare(String(b))))
  ].join("|");
  const now = Date.now();
  const cached = globals.NodeContextCache.get(safePath);
  if (cached && cached.exp > now && cached.signature === signature) {
    return {
      ...cached.value,
      learnedBasePaths: getCachedBasePathState(globals, safePath),
      redirectWhitelistDomains: getRedirectWhitelistDomains(finalRuntimeConfig)
    };
  }
  const targetEntries = normalizedTargets.map((target, index) => {
    const targetBase = new URL(target);
    return {
      index,
      target,
      targetBase,
      targetHost: targetBase.host,
      targetBasePath: targetBase.pathname.replace(/\/$/, "")
    };
  });
  if (!targetEntries.length) {
    throw new Error("目标地址格式错误");
  }
  const primaryTarget = targetEntries[0];
  const displayName = String(node?.name || safePath).trim() || safePath;
  const context = {
    name: safePath,
    path: safePath,
    displayName,
    nodeTarget: primaryTarget.target,
    nodeTargets: normalizedTargets,
    nodeHeaders,
    nodeCustomHeaderNames: Object.keys(nodeHeaders).map((key) => String(key || "").trim().toLowerCase()).filter(Boolean),
    targetEntries,
    primaryTarget,
    targetBase: primaryTarget.targetBase,
    targetHost: primaryTarget.targetHost,
    targetBasePath: primaryTarget.targetBasePath,
    proxyPrefix: `/${safePath}`,
    redirectWhitelistEnabled: node?.redirectWhitelistEnabled === true,
    realClientIpMode: normalizeNodeRealClientIpMode(node?.realClientIpMode),
    learnedBasePaths: getCachedBasePathState(globals, safePath)
  };
  globals.NodeContextCache.set(safePath, {
    signature,
    exp: now + NODE_CONTEXT_CACHE_TTL_MS,
    value: context
  });
  return {
    ...context,
    redirectWhitelistDomains: getRedirectWhitelistDomains(finalRuntimeConfig)
  };
}
function normalizeRedirectCachePersistenceTtl(value) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) return 120;
  return Math.max(60, Math.min(1800, Math.round(normalized)));
}
function getRedirectCacheKvBinding(env) {
  if (!env || typeof env !== "object") return null;
  const kv = env.ENI_KV || env.KV || null;
  if (!kv) return null;
  return typeof kv.get === "function" && typeof kv.put === "function" && typeof kv.delete === "function" ? kv : null;
}

// src/proxy/diagnostics/diagnostics.js
var OPTIONAL_DEBUG_PROXY_HEADERS = [
  "X-Proxy-Final-Host",
  "X-Proxy-Upstream-Status",
  "X-Proxy-Upstream-Type",
  "X-Proxy-Upstream-Cache",
  "X-Proxy-Playback-Mode",
  "X-Proxy-Hops",
  "X-Proxy-Debug-Reason"
];
function createDiagnostics(path, requestState) {
  return {
    route: "passthrough",
    hops: 0,
    upstreamMs: 0,
    rewriteMs: 0,
    incomingPath: String(path || ""),
    normalizedPath: requestState.activeNormalizedPath,
    upstreamPath: requestState.activeFinalUrl.pathname || "/",
    targetHost: requestState.activeTargetHost || "",
    targetIndex: (requestState.activeTargetIndex || 0) + 1,
    targetCount: 1,
    failover: "0",
    failoverReason: "",
    finalHost: "",
    upstreamStatus: 0,
    upstreamContentType: "",
    upstreamCacheStatus: "",
    playbackMode: "",
    debugReason: "",
    debugProxyHeadersEnabled: requestState?.debugProxyHeaders === true,
    debugProxyHeadersEligible: requestState?.isBigStream === true || requestState?.isPlaybackInfo === true,
    skipPlaybackStats: requestState?.isMetadataPrewarm === true || requestState?.isImage === true || requestState?.isStaticFile === true || requestState?.isSubtitle === true || requestState?.isManifest === true
  };
}
function renderCors(request, originOverride = null) {
  const headers = new Headers();
  applyBaseProxySecurityHeaders(headers);
  applyProxyCorsHeaders(headers, request, originOverride);
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204, headers });
}
function shouldEmitOptionalDebugHeaders(diagnostics) {
  if (diagnostics?.debugProxyHeadersEnabled !== true) return false;
  if (diagnostics?.debugProxyHeadersEligible !== true) return false;
  const route = String(diagnostics?.route || "");
  const upstreamStatus = Number(diagnostics?.upstreamStatus) || 0;
  const playbackMode = String(diagnostics?.playbackMode || "").trim();
  const debugReason = String(diagnostics?.debugReason || "").trim();
  return route.includes("followed") || route.includes("redirect-cache") || route.startsWith("budget-degraded") || (Number(diagnostics?.hops) || 0) > 0 || upstreamStatus >= 400 || !!playbackMode || !!debugReason;
}
function applyDiagnosticsHeaders(headers, diagnostics, request) {
  const route = diagnostics?.route || "passthrough";
  headers.set("X-Proxy-Route", route);
  if (!shouldEmitOptionalDebugHeaders(diagnostics)) return [];
  const emitted = [];
  const finalHost = String(diagnostics?.finalHost || "").trim();
  const upstreamStatus = Number(diagnostics?.upstreamStatus) || 0;
  const upstreamContentType = String(diagnostics?.upstreamContentType || "").trim();
  const upstreamCacheStatus = String(diagnostics?.upstreamCacheStatus || "").trim();
  const playbackMode = String(diagnostics?.playbackMode || "").trim();
  const hops = Number(diagnostics?.hops) || 0;
  const debugReason = String(diagnostics?.debugReason || "").trim();
  if (finalHost) {
    headers.set("X-Proxy-Final-Host", finalHost);
    emitted.push("X-Proxy-Final-Host");
  }
  if (upstreamStatus > 0) {
    headers.set("X-Proxy-Upstream-Status", String(upstreamStatus));
    emitted.push("X-Proxy-Upstream-Status");
  }
  if (upstreamContentType) {
    headers.set("X-Proxy-Upstream-Type", upstreamContentType);
    emitted.push("X-Proxy-Upstream-Type");
  }
  if (upstreamCacheStatus) {
    headers.set("X-Proxy-Upstream-Cache", upstreamCacheStatus);
    emitted.push("X-Proxy-Upstream-Cache");
  }
  if (playbackMode) {
    headers.set("X-Proxy-Playback-Mode", playbackMode);
    emitted.push("X-Proxy-Playback-Mode");
  }
  if (hops > 0) {
    headers.set("X-Proxy-Hops", String(hops));
    emitted.push("X-Proxy-Hops");
  }
  if (debugReason) {
    headers.set("X-Proxy-Debug-Reason", debugReason);
    emitted.push("X-Proxy-Debug-Reason");
  }
  return emitted;
}
function finalizeProxyResponse(response, diagnostics, request) {
  const headers = new Headers(response.headers);
  const emittedHeaders = applyDiagnosticsHeaders(headers, diagnostics, request);
  if (emittedHeaders.length) {
    appendCorsExposeHeaders(headers, OPTIONAL_DEBUG_PROXY_HEADERS.filter((name) => emittedHeaders.includes(name)));
  }
  if (Number(response?.status) === 101 && response?.webSocket) {
    return new Response(null, {
      status: 101,
      statusText: response.statusText,
      headers,
      webSocket: response.webSocket
    });
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
function finalizeDiagnostics(globals, response, diagnostics, request) {
  if (diagnostics?.skipPlaybackStats !== true) {
    recordPlaybackOptimizationRoute(globals, diagnostics?.route);
  }
  return finalizeProxyResponse(response, diagnostics, request);
}

// src/proxy/pipeline/handle.js
init_runtime_cache_cleanup();

// src/proxy/upstream/dispatch-upstream.js
init_runtime_state();
init_static_cache();

// src/proxy/media/playback-windows.js
init_constants();
var PLAYBACK_HEAD_WINDOW_MAX_BYTES = 8 * 1024 * 1024;
var PLAYBACK_JUMP_WINDOW_MAX_BYTES = 4 * 1024 * 1024;
var PLAYBACK_EARLY_JUMP_MIN_START_BYTES = 8 * 1024 * 1024;
var PLAYBACK_WINDOW_TTL_MS = 20 * 1e3;
var PLAYBACK_EARLY_JUMP_ASSISTS = 2;
var PLAYBACK_WINDOW_GLOBAL_BUDGET_BYTES = 48 * 1024 * 1024;
function isEligiblePlaybackRequest(requestState) {
  const method = String(requestState?.method || "").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return false;
  if (requestState?.isBigStream !== true) return false;
  if (requestState?.isMetadataPrewarm === true) return false;
  if (requestState?.isImage === true || requestState?.isStaticFile === true || requestState?.isSubtitle === true) return false;
  if (requestState?.isManifest === true || requestState?.isSegment === true || requestState?.isWsUpgrade === true) return false;
  return true;
}
function getSearchParams(requestState) {
  if (requestState?.requestUrl instanceof URL) return requestState.requestUrl.searchParams;
  if (requestState?.activeFinalUrl instanceof URL) return requestState.activeFinalUrl.searchParams;
  return null;
}
function readPlaybackIdentifiers(requestState) {
  const searchParams = getSearchParams(requestState);
  const playSessionId = String(
    searchParams?.get("PlaySessionId") || searchParams?.get("PlaySessionID") || ""
  ).trim();
  const mediaSourceId = String(
    requestState?.requestedMediaSourceId || searchParams?.get("MediaSourceId") || searchParams?.get("mediasourceid") || ""
  ).trim();
  const canonicalMediaKey = requestState?.activeFinalUrl instanceof URL ? buildExternalRedirectCacheKey("GET", requestState.activeFinalUrl, {
    noiseQueryKeys: EXTERNAL_REDIRECT_CACHE_NOISE_QUERY_KEYS
  }) : "";
  return {
    canonicalMediaKey,
    playSessionId,
    mediaSourceId
  };
}
function buildPlaybackWindowSessionKey(requestState) {
  if (!isEligiblePlaybackRequest(requestState)) return "";
  const { canonicalMediaKey, playSessionId, mediaSourceId } = readPlaybackIdentifiers(requestState);
  if (!canonicalMediaKey || !playSessionId || !mediaSourceId) return "";
  return `${canonicalMediaKey}|${playSessionId}|${mediaSourceId}`;
}
function isExpired(entry, now = Date.now()) {
  return !entry || now - Number(entry.createdAt || 0) > PLAYBACK_WINDOW_TTL_MS;
}
function isExpiredHint(entry, now = Date.now()) {
  return !entry || now - Number(entry.startupSuccessAt || 0) > PLAYBACK_WINDOW_TTL_MS;
}
function prunePlaybackSessionHints(map, now = Date.now()) {
  for (const [key, entry] of map.entries()) {
    if (isExpiredHint(entry, now)) map.delete(key);
  }
}
function getPlaybackWindowEntryBytes(entry) {
  return Math.max(0, Number(entry?.byteLength) || 0);
}
function deletePlaybackWindowEntry(globals, map, key, entry = null) {
  const current = entry || map.get(key);
  if (!current) return false;
  map.delete(key);
  globals.PlaybackWindowBytesTotal = Math.max(0, Number(globals.PlaybackWindowBytesTotal || 0) - getPlaybackWindowEntryBytes(current));
  return true;
}
function setPlaybackWindowEntry(globals, map, key, entry) {
  const previous = map.get(key);
  if (previous) {
    globals.PlaybackWindowBytesTotal = Math.max(0, Number(globals.PlaybackWindowBytesTotal || 0) - getPlaybackWindowEntryBytes(previous));
  }
  map.set(key, entry);
  globals.PlaybackWindowBytesTotal = Math.max(0, Number(globals.PlaybackWindowBytesTotal || 0) + getPlaybackWindowEntryBytes(entry));
}
function prunePlaybackWindowMap(globals, map, now = Date.now()) {
  for (const [key, entry] of map.entries()) {
    if (isExpired(entry, now)) deletePlaybackWindowEntry(globals, map, key, entry);
  }
}
function prunePlaybackWindows(globals, now = Date.now()) {
  prunePlaybackWindowMap(globals, globals.PlaybackHeadWindowCache, now);
  prunePlaybackWindowMap(globals, globals.PlaybackJumpWindowCache, now);
  prunePlaybackSessionHints(globals.PlaybackSessionHints, now);
}
function findOldestPlaybackWindow(globals) {
  let victim = null;
  const consider = (map) => {
    for (const [key, entry] of map.entries()) {
      const at = Number(entry?.lastAccessAt || entry?.createdAt || 0);
      if (!victim || at < victim.at) {
        victim = { map, key, entry, at };
      }
    }
  };
  consider(globals.PlaybackHeadWindowCache);
  consider(globals.PlaybackJumpWindowCache);
  return victim;
}
function enforcePlaybackWindowBudget(globals, now = Date.now()) {
  prunePlaybackWindows(globals, now);
  let totalBytes = Math.max(0, Number(globals.PlaybackWindowBytesTotal || 0));
  while (totalBytes > PLAYBACK_WINDOW_GLOBAL_BUDGET_BYTES) {
    const victim = findOldestPlaybackWindow(globals);
    if (!victim) break;
    deletePlaybackWindowEntry(globals, victim.map, victim.key, victim.entry);
    totalBytes = Math.max(0, Number(globals.PlaybackWindowBytesTotal || 0));
  }
}
function rememberPlaybackWindow(globals, map, key, entry) {
  if (!key || !entry?.byteLength) return;
  setPlaybackWindowEntry(globals, map, key, entry);
  enforcePlaybackWindowBudget(globals, entry.createdAt || Date.now());
}
function rememberStartupSuccess(globals, sessionKey, now = Date.now()) {
  if (!sessionKey) return;
  globals.PlaybackSessionHints.set(sessionKey, {
    startupSuccessAt: now,
    remainingEarlyJumpAssists: PLAYBACK_EARLY_JUMP_ASSISTS,
    lastSeenAt: now
  });
}
function canServePlaybackWindow(entry, range) {
  if (!entry || !range) return false;
  if (range.start < entry.cachedStart || range.start > entry.cachedEnd) return false;
  if (range.end === null) return true;
  return range.end <= entry.cachedEnd;
}
function createWindowHitResponse(entry, range, method = "GET") {
  const end = range.end === null ? entry.cachedEnd : range.end;
  if (!Number.isFinite(end) || end < range.start) return null;
  const offsetStart = range.start - entry.cachedStart;
  const offsetEnd = end - entry.cachedStart + 1;
  const bodySlice = entry.bytes.subarray(offsetStart, offsetEnd);
  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-store",
    "Content-Length": String(bodySlice.byteLength),
    "Content-Range": `bytes ${range.start}-${end}/${Number.isFinite(entry.totalSize) && entry.totalSize > 0 ? entry.totalSize : "*"}`
  });
  if (entry.contentType) headers.set("Content-Type", entry.contentType);
  return new Response(String(method || "").toUpperCase() === "HEAD" ? null : bodySlice, {
    status: 206,
    headers
  });
}
function resolvePlaybackWindowHit(globals, map, sessionKey, range, route, method, now = Date.now()) {
  const entry = map.get(sessionKey);
  if (isExpired(entry, now)) {
    deletePlaybackWindowEntry(globals, map, sessionKey, entry);
    return null;
  }
  if (!canServePlaybackWindow(entry, range)) return null;
  entry.lastAccessAt = now;
  const response = createWindowHitResponse(entry, range, method);
  if (!response) return null;
  return { route, response };
}
function maybeServePlaybackWindowHit(globals, requestState) {
  if (!isEligiblePlaybackRequest(requestState)) return null;
  const range = parseSingleByteRangeHeader(requestState?.rangeHeader);
  if (!range) return null;
  const sessionKey = requestState?.playbackWindowSessionKey || buildPlaybackWindowSessionKey(requestState);
  if (!sessionKey) return null;
  const now = Date.now();
  prunePlaybackWindows(globals, now);
  return resolvePlaybackWindowHit(
    globals,
    globals.PlaybackHeadWindowCache,
    sessionKey,
    range,
    "head-window",
    requestState.method,
    now
  ) || resolvePlaybackWindowHit(
    globals,
    globals.PlaybackJumpWindowCache,
    sessionKey,
    range,
    "jump-window",
    requestState.method,
    now
  );
}
function beginPlaybackJumpAssist(globals, requestState) {
  if (!isEligiblePlaybackRequest(requestState)) {
    return { captureJumpWindow: false, allowDeepRangeBudgetRelaxation: false };
  }
  const range = parseSingleByteRangeHeader(requestState?.rangeHeader);
  if (!range || range.start < PLAYBACK_EARLY_JUMP_MIN_START_BYTES) {
    return { captureJumpWindow: false, allowDeepRangeBudgetRelaxation: false };
  }
  const sessionKey = requestState?.playbackWindowSessionKey || buildPlaybackWindowSessionKey(requestState);
  if (!sessionKey) {
    return { captureJumpWindow: false, allowDeepRangeBudgetRelaxation: false };
  }
  const now = Date.now();
  prunePlaybackWindows(globals, now);
  const hint = globals.PlaybackSessionHints.get(sessionKey);
  if (!hint || isExpiredHint(hint, now) || Number(hint.remainingEarlyJumpAssists || 0) <= 0) {
    globals.PlaybackSessionHints.delete(sessionKey);
    return { captureJumpWindow: false, allowDeepRangeBudgetRelaxation: false };
  }
  hint.remainingEarlyJumpAssists = Math.max(0, Number(hint.remainingEarlyJumpAssists || 0) - 1);
  hint.lastSeenAt = now;
  return {
    captureJumpWindow: true,
    allowDeepRangeBudgetRelaxation: range.start >= PLAYBACK_OPTIMIZATION_DEEP_RANGE_START_BYTES
  };
}
async function readPlaybackWindowBytes(readable, maxBytes) {
  const reader = readable.getReader();
  const chunks = [];
  let totalLength = 0;
  try {
    while (totalLength < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value?.byteLength) continue;
      const remaining = maxBytes - totalLength;
      const slice = value.byteLength > remaining ? value.subarray(0, remaining) : value;
      chunks.push(slice);
      totalLength += slice.byteLength;
      if (totalLength >= maxBytes) {
        try {
          await reader.cancel();
        } catch (_) {
        }
        break;
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch (_) {
    }
  }
  return totalLength > 0 ? concatUint8Arrays(chunks, totalLength) : new Uint8Array(0);
}
function shouldCaptureHeadWindow(requestState, response, sessionKey) {
  if (!sessionKey) return false;
  if (String(requestState?.method || "").toUpperCase() !== "GET") return false;
  if (![200, 206].includes(Number(response?.status) || 0)) return false;
  if (!response?.body) return false;
  const range = parseSingleByteRangeHeader(requestState?.rangeHeader);
  return !range || range.start === 0;
}
function shouldCaptureJumpWindow(requestState, response, sessionKey) {
  if (!sessionKey) return false;
  if (requestState?.playbackJumpAssist !== true) return false;
  if (String(requestState?.method || "").toUpperCase() !== "GET") return false;
  if (![200, 206].includes(Number(response?.status) || 0)) return false;
  return !!response?.body;
}
async function capturePlaybackWindow(globals, map, sessionKey, captureBody, response, maxBytes, now = Date.now()) {
  const bytes = await readPlaybackWindowBytes(captureBody, maxBytes);
  if (!bytes.byteLength) return;
  const responseRange = parseResponseByteRangeFromHeaders(response.headers);
  if (!responseRange) return;
  const cachedStart = Number(responseRange.start) || 0;
  const cachedEnd = cachedStart + bytes.byteLength - 1;
  rememberPlaybackWindow(globals, map, sessionKey, {
    bytes,
    byteLength: bytes.byteLength,
    contentType: String(response.headers.get("Content-Type") || "").trim(),
    totalSize: Number(responseRange.totalSize) || null,
    cachedStart,
    cachedEnd,
    createdAt: now,
    lastAccessAt: now
  });
}
function attachPlaybackWindowCapture(globals, { requestState, response, executionContext }) {
  if (!response?.body || !isEligiblePlaybackRequest(requestState)) {
    return response?.body || null;
  }
  const sessionKey = requestState?.playbackWindowSessionKey || buildPlaybackWindowSessionKey(requestState);
  if (!sessionKey) return response.body;
  const now = Date.now();
  let captureTarget = null;
  let captureMap = null;
  let captureLimit = 0;
  if (shouldCaptureHeadWindow(requestState, response, sessionKey)) {
    rememberStartupSuccess(globals, sessionKey, now);
    captureTarget = "head";
    captureMap = globals.PlaybackHeadWindowCache;
    captureLimit = PLAYBACK_HEAD_WINDOW_MAX_BYTES;
  } else if (shouldCaptureJumpWindow(requestState, response, sessionKey)) {
    captureTarget = "jump";
    captureMap = globals.PlaybackJumpWindowCache;
    captureLimit = PLAYBACK_JUMP_WINDOW_MAX_BYTES;
  }
  if (!captureTarget || !captureMap || captureLimit <= 0) return response.body;
  const [clientBody, captureBody] = response.body.tee();
  const captureTask = capturePlaybackWindow(globals, captureMap, sessionKey, captureBody, response, captureLimit, now).catch(() => {
  });
  if (typeof executionContext?.waitUntil === "function") executionContext.waitUntil(captureTask);
  return clientBody;
}

// src/proxy/upstream/failover-utils.js
function shouldAllowTargetFailover(requestState) {
  return !!requestState;
}
function shouldRetryMetadata404OnAlternateTarget(response, requestState) {
  if (!response || Number(response.status) !== 404) return false;
  if (!requestState || requestState.method !== "GET") return false;
  if (requestState.isStatic) return false;
  const lowerPath = String(requestState.lowerPath || "");
  if (!lowerPath) return false;
  if (/^\/(?:emby\/|jellyfin\/)?users\/[^/]+\/items\/[^/]+$/i.test(lowerPath)) return true;
  if (/^\/(?:emby\/|jellyfin\/)?shows\/[^/]+\/episodes$/i.test(lowerPath)) return true;
  return false;
}
function orderTargetEntries(targetEntries = [], preferredIndex = 0) {
  const list = Array.isArray(targetEntries) ? targetEntries : [];
  const normalizedPreferredIndex = Number(preferredIndex);
  if (!list.length || !Number.isInteger(normalizedPreferredIndex) || normalizedPreferredIndex <= 0 || normalizedPreferredIndex >= list.length) {
    return list;
  }
  return [
    list[normalizedPreferredIndex],
    ...list.slice(0, normalizedPreferredIndex),
    ...list.slice(normalizedPreferredIndex + 1)
  ];
}
function describeUpstreamFailure(input) {
  if (Number.isFinite(Number(input))) {
    return `status-${Number(input)}`;
  }
  const name = String(input?.name || "").trim();
  const message = String(input?.message || input || "").trim();
  return [name, message].filter(Boolean).join(": ").replace(/[\r\n]+/g, " ").slice(0, 160);
}

// src/proxy/upstream/dispatch-upstream.js
init_upstream_headers();

// src/proxy/upstream/upstream-attempt.js
init_runtime_state();

// src/proxy/routing/redirect-cache.js
init_constants();
function getRedirectCachePersistenceContext(context) {
  if (!context?.redirectCachePersistenceEnabled || !context?.redirectCacheKv) return null;
  return {
    kv: context.redirectCacheKv,
    ttlSeconds: normalizeRedirectCachePersistenceTtl(context.redirectCachePersistenceTtlSeconds),
    executionContext: context.executionContext || null
  };
}
function scheduleContextTask(context, promise) {
  if (!promise || typeof promise.then !== "function") return;
  if (typeof context?.executionContext?.waitUntil === "function") {
    context.executionContext.waitUntil(promise.catch(() => {
    }));
    return;
  }
  promise.catch(() => {
  });
}
async function resolveCachedExternalRedirectUrl(globals, method, url, context = null) {
  const memoryHit = getCachedExternalRedirectUrl(globals, method, url);
  if (memoryHit) return memoryHit;
  const persistence = getRedirectCachePersistenceContext(context);
  if (!persistence) return null;
  const cacheKey = buildExternalRedirectCacheKey(method, url, {
    noiseQueryKeys: EXTERNAL_REDIRECT_CACHE_NOISE_QUERY_KEYS
  });
  const storageKey = buildExternalRedirectPersistenceStorageKey(cacheKey);
  let stored = null;
  try {
    stored = await persistence.kv.get(storageKey, { type: "json" });
  } catch (_) {
    return null;
  }
  if (!stored || typeof stored !== "object") return null;
  if (String(stored.cacheKey || "") !== cacheKey || !stored.url) {
    scheduleContextTask(
      context,
      persistence.kv.delete(storageKey)
    );
    return null;
  }
  const expiresAt = Number(stored.expiresAt || 0);
  if (Number.isFinite(expiresAt) && expiresAt > 0 && expiresAt <= Date.now()) {
    scheduleContextTask(
      context,
      persistence.kv.delete(storageKey)
    );
    return null;
  }
  let redirectUrl = null;
  try {
    redirectUrl = new URL(String(stored.url));
  } catch (_) {
    scheduleContextTask(
      context,
      persistence.kv.delete(storageKey)
    );
    return null;
  }
  rememberExternalRedirectUrl(globals, method, url, redirectUrl, {
    context,
    persist: false
  });
  return redirectUrl;
}
function persistExternalRedirectUrl(_globals, method, url, redirectUrl, context = null) {
  const persistence = getRedirectCachePersistenceContext(context);
  if (!persistence || !url || !redirectUrl) return;
  const cacheKey = buildExternalRedirectCacheKey(method, url, {
    noiseQueryKeys: EXTERNAL_REDIRECT_CACHE_NOISE_QUERY_KEYS
  });
  const storageKey = buildExternalRedirectPersistenceStorageKey(cacheKey);
  const ttlSeconds = persistence.ttlSeconds;
  const payload = {
    cacheKey,
    url: String(redirectUrl),
    expiresAt: Date.now() + ttlSeconds * 1e3
  };
  scheduleContextTask(
    context,
    persistence.kv.put(storageKey, JSON.stringify(payload), { expirationTtl: ttlSeconds })
  );
}
function getCachedExternalRedirectUrl(globals, method, url) {
  const cacheKey = buildExternalRedirectCacheKey(method, url, {
    noiseQueryKeys: EXTERNAL_REDIRECT_CACHE_NOISE_QUERY_KEYS
  });
  const cached = globals.ExternalRedirectCache.get(cacheKey);
  if (!cached) return null;
  if ((cached.exp || 0) <= Date.now()) {
    globals.ExternalRedirectCache.delete(cacheKey);
    return null;
  }
  try {
    const redirectUrl = new URL(cached.url);
    globals.ExternalRedirectCache.delete(cacheKey);
    globals.ExternalRedirectCache.set(cacheKey, cached);
    return redirectUrl;
  } catch (_) {
    globals.ExternalRedirectCache.delete(cacheKey);
    return null;
  }
}
function rememberExternalRedirectUrl(globals, method, url, redirectUrl, options = null) {
  if (!url || !redirectUrl) return;
  const context = options?.context || null;
  const shouldPersist = options?.persist !== false;
  const cacheKey = buildExternalRedirectCacheKey(method, url, {
    noiseQueryKeys: EXTERNAL_REDIRECT_CACHE_NOISE_QUERY_KEYS
  });
  globals.ExternalRedirectCache.delete(cacheKey);
  globals.ExternalRedirectCache.set(cacheKey, {
    url: String(redirectUrl),
    exp: Date.now() + EXTERNAL_REDIRECT_CACHE_TTL_MS
  });
  if (shouldPersist) {
    persistExternalRedirectUrl(globals, method, url, redirectUrl, context);
  }
}
function clearExternalRedirectUrl(globals, method, url, context = null) {
  const cacheKey = buildExternalRedirectCacheKey(method, url, {
    noiseQueryKeys: EXTERNAL_REDIRECT_CACHE_NOISE_QUERY_KEYS
  });
  globals.ExternalRedirectCache.delete(cacheKey);
  const persistence = getRedirectCachePersistenceContext(context);
  if (!persistence) return;
  const storageKey = buildExternalRedirectPersistenceStorageKey(cacheKey);
  scheduleContextTask(
    context,
    persistence.kv.delete(storageKey)
  );
}
function claimExternalRedirectResolution(globals, method, url) {
  const cacheKey = buildExternalRedirectCacheKey(method, url, {
    noiseQueryKeys: EXTERNAL_REDIRECT_CACHE_NOISE_QUERY_KEYS
  });
  const existing = globals.ExternalRedirectInflight.get(cacheKey);
  if (existing?.promise) {
    return {
      owner: false,
      promise: existing.promise
    };
  }
  let resolvePromise = null;
  const promise = new Promise((resolve) => {
    resolvePromise = resolve;
  });
  globals.ExternalRedirectInflight.set(cacheKey, {
    promise,
    resolve: resolvePromise,
    startedAt: Date.now()
  });
  return {
    owner: true,
    promise
  };
}
function settleExternalRedirectResolution(globals, method, url, redirectUrl = null) {
  const cacheKey = buildExternalRedirectCacheKey(method, url, {
    noiseQueryKeys: EXTERNAL_REDIRECT_CACHE_NOISE_QUERY_KEYS
  });
  const existing = globals.ExternalRedirectInflight.get(cacheKey);
  if (!existing?.resolve) return;
  globals.ExternalRedirectInflight.delete(cacheKey);
  existing.resolve(String(redirectUrl || ""));
}

// src/proxy/routing/redirect-chain.js
init_runtime_state();
init_constants();
function buildExternalRedirectHeaders(baseHeaders, redirectUrl, options = {}) {
  const followHeaders = new Headers(baseHeaders);
  followHeaders.set("Host", redirectUrl.host);
  [
    "Authorization",
    "Proxy-Authorization",
    "Cookie",
    "X-Emby-Authorization",
    "X-Emby-Token",
    "X-MediaBrowser-Token"
  ].forEach((h) => followHeaders.delete(h));
  if (options.keepOrigin !== true) {
    followHeaders.delete("Origin");
  }
  if (options.keepReferer !== true) {
    followHeaders.delete("Referer");
  }
  return followHeaders;
}
async function fetchExternalRedirectHit(method, originUrl, baseHeaders, cf, redirectUrl, context = null, fetchAbsolute = null) {
  if (!redirectUrl) return null;
  try {
    const followHeaders = buildExternalRedirectHeaders(baseHeaders, redirectUrl, {
      keepOrigin: context?.nodeCustomHeaderNames?.includes?.("origin") === true,
      keepReferer: context?.nodeCustomHeaderNames?.includes?.("referer") === true
    });
    const response = fetchAbsolute ? await fetchAbsolute(redirectUrl, followHeaders, false) : await fetch(redirectUrl.toString(), {
      method,
      headers: followHeaders,
      redirect: "manual",
      cf
    });
    if (response.status >= 300 && response.status < 400) {
      clearExternalRedirectUrl(GLOBALS, method, originUrl, context);
      return null;
    }
    if ((Number(response.status) || 0) >= 400) {
      clearExternalRedirectUrl(GLOBALS, method, originUrl, context);
      return null;
    }
    return {
      response,
      errorResponse: null,
      route: "redirect-cache",
      hops: 1,
      resolvedRedirectUrl: redirectUrl.toString(),
      finalUrl: new URL(redirectUrl.toString())
    };
  } catch (_) {
    clearExternalRedirectUrl(GLOBALS, method, originUrl, context);
    return null;
  }
}
async function followRedirectChain({
  request = null,
  initialResponse,
  initialUrl,
  targetHost,
  redirectWhitelistEnabled,
  redirectWhitelistDomains,
  baseHeaders,
  method,
  hasBody,
  getReplayBody,
  cf,
  nodeName,
  nodeTarget,
  context = null,
  fetchAbsolute = null
}) {
  let response = initialResponse;
  let currentUrl = initialUrl;
  const originUrl = initialUrl;
  let hops = 0;
  let route = "passthrough";
  const visited = /* @__PURE__ */ new Set();
  while (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("Location");
    if (!location) break;
    let redirectUrl = null;
    try {
      redirectUrl = new URL(location, currentUrl);
    } catch (_) {
      break;
    }
    if (!redirectUrl || redirectUrl.host === targetHost) break;
    if (context?.forceExternalProxy === false) {
      const headers = new Headers(response.headers);
      headers.set("Location", redirectUrl.toString());
      headers.set("Cache-Control", "no-store");
      return {
        response: new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        }),
        errorResponse: null,
        route: "direct-external",
        hops,
        resolvedRedirectUrl: null
      };
    }
    const shouldDirectByRedirectWhitelist = redirectWhitelistEnabled && (isManualRedirectHost(redirectUrl.hostname, redirectWhitelistDomains) || shouldDirectByWangpan(redirectUrl, context?.wangpanDirectKeywords));
    if (shouldDirectByRedirectWhitelist) {
      const headers = new Headers(response.headers);
      headers.set("Location", redirectUrl.toString());
      headers.set("Cache-Control", "no-store");
      return {
        response: new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        }),
        errorResponse: null,
        route: "direct-whitelist",
        hops,
        resolvedRedirectUrl: null
      };
    }
    if (hops >= MAX_EXTERNAL_REDIRECT_HOPS) {
      clearExternalRedirectUrl(GLOBALS, method, originUrl, context);
      return {
        response: null,
        errorResponse: buildRedirectErrorResponse({
          code: "UPSTREAM_REDIRECT_TOO_MANY_HOPS",
          node: nodeName,
          target: nodeTarget,
          hops,
          location: redirectUrl.toString()
        }, request, context?.finalOrigin),
        route: "followed",
        hops,
        resolvedRedirectUrl: null
      };
    }
    const visitKey = `${method}:${redirectUrl.toString()}`;
    if (visited.has(visitKey)) {
      clearExternalRedirectUrl(GLOBALS, method, originUrl, context);
      return {
        response: null,
        errorResponse: buildRedirectErrorResponse({
          code: "UPSTREAM_REDIRECT_LOOP",
          node: nodeName,
          target: nodeTarget,
          hops,
          location: redirectUrl.toString()
        }, request, context?.finalOrigin),
        route: "followed",
        hops,
        resolvedRedirectUrl: null
      };
    }
    visited.add(visitKey);
    try {
      const followHeaders = buildExternalRedirectHeaders(baseHeaders, redirectUrl, {
        keepOrigin: context?.nodeCustomHeaderNames?.includes?.("origin") === true,
        keepReferer: context?.nodeCustomHeaderNames?.includes?.("referer") === true
      });
      const replayBody = hasBody ? await getReplayBody() : null;
      response = fetchAbsolute ? await fetchAbsolute(redirectUrl, followHeaders, false, replayBody ? replayBody.slice(0) : null) : await fetch(redirectUrl.toString(), {
        method,
        headers: followHeaders,
        body: replayBody ? replayBody.slice(0) : null,
        redirect: "manual",
        cf
      });
      rememberExternalRedirectUrl(GLOBALS, method, originUrl, redirectUrl, { context });
      currentUrl = redirectUrl;
      hops += 1;
      route = "followed";
    } catch (followError) {
      clearExternalRedirectUrl(GLOBALS, method, originUrl, context);
      return {
        response: null,
        errorResponse: buildRedirectErrorResponse({
          code: "UPSTREAM_REDIRECT_FOLLOW_FAILED",
          node: nodeName,
          target: nodeTarget,
          hops,
          detail: followError.message || "redirect follow failed"
        }, request, context?.finalOrigin),
        route: "followed",
        hops,
        resolvedRedirectUrl: null
      };
    }
  }
  return {
    response,
    errorResponse: null,
    route,
    hops,
    resolvedRedirectUrl: hops > 0 ? currentUrl.toString() : null
  };
}
function buildRedirectErrorResponse(payload, request = null, originOverride = null) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Proxy-Route": "followed"
  });
  const debugReason = String(payload?.code || "").trim();
  if (debugReason) {
    headers.set("X-Proxy-Debug-Reason", debugReason);
  }
  applyBaseProxySecurityHeaders(headers);
  applyProxyCorsHeaders(headers, request, originOverride);
  return new Response(JSON.stringify(payload), {
    status: 502,
    headers
  });
}

// src/proxy/upstream/upstream-attempt.js
init_constants();
function clampInteger3(value, fallback, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(num)));
}
function createFetchWithRedirectsHandlers({
  request,
  currentState,
  context,
  targetEntry,
  replay,
  cf,
  newHeaders
}) {
  const allowAutomaticRetry = !replay.hasBody && (currentState.method === "GET" || currentState.method === "HEAD");
  const maxExtraAttempts = allowAutomaticRetry ? clampInteger3(context?.upstreamRetryAttempts, 0, 0, 3) : 0;
  const upstreamTimeoutMs = clampInteger3(context?.upstreamTimeoutMs, 0, 0, 18e4);
  async function buildRequestInit(headersToUse, useOriginalBody = false, bodyOverride = void 0) {
    const requestInit = {
      method: currentState.method,
      headers: headersToUse,
      redirect: "manual",
      cf
    };
    if (replay.hasBody) {
      if (bodyOverride !== void 0) {
        requestInit.body = bodyOverride;
      } else if (useOriginalBody) {
        requestInit.body = request.body;
      } else {
        const replayBody = await replay.getReplayBody();
        requestInit.body = replayBody ? replayBody.slice(0) : null;
      }
    }
    return requestInit;
  }
  async function performFetchWithTimeout(urlToFetch, requestInit) {
    const timeoutMs = Math.max(0, upstreamTimeoutMs);
    let timeoutId = null;
    let controller = null;
    if (timeoutMs > 0) {
      controller = new AbortController();
      requestInit.signal = controller.signal;
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    }
    try {
      return await fetch(urlToFetch.toString(), requestInit);
    } catch (error) {
      if (timeoutMs > 0 && (error?.name === "AbortError" || String(error?.message || "").toLowerCase().includes("abort"))) {
        const timeoutError = Object.assign(
          new Error(`upstream_timeout_${timeoutMs}ms`),
          { code: "UPSTREAM_TIMEOUT" }
        );
        throw timeoutError;
      }
      throw error;
    } finally {
      if (timeoutId !== null) clearTimeout(timeoutId);
    }
  }
  async function fetchAbsoluteWithPolicies(urlToFetch, headersToUse, useOriginalBody = false, bodyOverride = void 0, options = {}) {
    const protocolFallbackRetried = options.protocolFallbackRetried === true;
    const totalPasses = Math.max(1, maxExtraAttempts + 1);
    let lastError = null;
    let lastResponse = null;
    for (let pass = 0; pass < totalPasses; pass += 1) {
      try {
        const requestInit = await buildRequestInit(headersToUse, useOriginalBody, bodyOverride);
        const response = await performFetchWithTimeout(urlToFetch, requestInit);
        if (Number(response?.status) === 403 && context?.protocolFallback === true && !protocolFallbackRetried && allowAutomaticRetry) {
          try {
            response.body?.cancel?.();
          } catch (_) {
          }
          const retryHeaders = new Headers(headersToUse);
          retryHeaders.delete("Authorization");
          retryHeaders.delete("X-Emby-Authorization");
          retryHeaders.set("Connection", "keep-alive");
          return fetchAbsoluteWithPolicies(
            urlToFetch,
            retryHeaders,
            useOriginalBody,
            bodyOverride,
            { ...options, protocolFallbackRetried: true }
          );
        }
        const isLastPass = pass === totalPasses - 1;
        if (!allowAutomaticRetry || !RETRYABLE_ORIGIN_STATUSES.has(Number(response?.status)) || isLastPass) {
          return response;
        }
        if (lastResponse) {
          try {
            lastResponse.body?.cancel?.();
          } catch (_) {
          }
        }
        lastResponse = response;
      } catch (error) {
        lastError = error;
        const isLastPass = pass === totalPasses - 1;
        if (!allowAutomaticRetry || isLastPass) {
          throw error;
        }
      }
    }
    if (lastResponse) return lastResponse;
    throw lastError || new Error("upstream_fetch_failed");
  }
  const fetchWithRedirectsWithHeaders = async (headersToUse, urlToFetch, useOriginalBody = false, options = {}) => {
    let redirectResolution = null;
    const cacheLookupUrl = urlToFetch || currentState.activeFinalUrl;
    if (!replay.hasBody && (currentState.method === "GET" || currentState.method === "HEAD")) {
      const cachedRedirectUrl = await resolveCachedExternalRedirectUrl(
        GLOBALS,
        currentState.method,
        cacheLookupUrl,
        context
      );
      if (cachedRedirectUrl) {
        const cachedResult = await fetchExternalRedirectHit(
          currentState.method,
          cacheLookupUrl,
          headersToUse,
          cf,
          cachedRedirectUrl,
          context,
          fetchAbsoluteWithPolicies
        );
        if (cachedResult) {
          return cachedResult;
        }
      }
      redirectResolution = claimExternalRedirectResolution(
        GLOBALS,
        currentState.method,
        cacheLookupUrl
      );
      if (!redirectResolution.owner) {
        const resolvedRedirectUrl = await redirectResolution.promise;
        if (resolvedRedirectUrl) {
          const waitedResult = await fetchExternalRedirectHit(
            currentState.method,
            cacheLookupUrl,
            headersToUse,
            cf,
            new URL(resolvedRedirectUrl),
            context,
            fetchAbsoluteWithPolicies
          );
          if (waitedResult) {
            return waitedResult;
          }
        }
      }
    }
    let chainResult = null;
    try {
      let response = await fetchAbsoluteWithPolicies(urlToFetch, headersToUse, useOriginalBody);
      chainResult = await followRedirectChain({
        request,
        initialResponse: response,
        initialUrl: urlToFetch,
        targetHost: targetEntry.targetHost,
        redirectWhitelistEnabled: context.redirectWhitelistEnabled,
        redirectWhitelistDomains: context.redirectWhitelistDomains,
        baseHeaders: headersToUse,
        method: currentState.method,
        hasBody: replay.hasBody,
        getReplayBody: replay.getReplayBody,
        cf,
        nodeName: context.name,
        nodeTarget: targetEntry.target,
        context,
        fetchAbsolute: fetchAbsoluteWithPolicies
      });
      if (chainResult.errorResponse) {
        return {
          response: null,
          errorResponse: chainResult.errorResponse,
          route: chainResult.route,
          hops: chainResult.hops,
          resolvedRedirectUrl: chainResult.resolvedRedirectUrl || null,
          finalUrl: chainResult.resolvedRedirectUrl ? new URL(chainResult.resolvedRedirectUrl) : urlToFetch instanceof URL ? new URL(urlToFetch.toString()) : new URL(String(urlToFetch))
        };
      }
      response = chainResult.response;
      return {
        response,
        errorResponse: null,
        route: chainResult.route,
        hops: chainResult.hops,
        resolvedRedirectUrl: chainResult.resolvedRedirectUrl || null,
        finalUrl: chainResult.resolvedRedirectUrl ? new URL(chainResult.resolvedRedirectUrl) : urlToFetch instanceof URL ? new URL(urlToFetch.toString()) : new URL(String(urlToFetch))
      };
    } finally {
      if (redirectResolution?.owner) {
        settleExternalRedirectResolution(
          GLOBALS,
          currentState.method,
          cacheLookupUrl,
          chainResult?.resolvedRedirectUrl || null
        );
      }
    }
  };
  const fetchWithRedirects = async (urlToFetch, useOriginalBody = false) => {
    return fetchWithRedirectsWithHeaders(newHeaders, urlToFetch, useOriginalBody);
  };
  return {
    fetchWithRedirectsWithHeaders,
    fetchWithRedirects
  };
}

// src/proxy/upstream/dispatch-upstream.js
init_constants();
var PLAYBACK_CONTINUATION_LANE_TTL_MS = 15 * 1e3;
var PLAYBACK_CONTINUATION_STALL_TTL_MS = 5 * 1e3;
var PLAYBACK_CONTINUATION_STALL_MAX_SMALL_ADVANCE_BYTES = 2 * 1024 * 1024;
var PLAYBACK_CONTINUATION_STALL_TRIGGER_STREAK = 2;
var PLAYBACK_CONTINUATION_STALL_RECOVERY_PROBE_TIMEOUT_MS = 2500;
function getPlaybackContinuationLaneKey(requestState) {
  if (!requestState) return "";
  const existing = String(requestState.playbackWindowSessionKey || "").trim();
  if (existing) return existing;
  const nextKey = buildPlaybackWindowSessionKey(requestState);
  if (nextKey) requestState.playbackWindowSessionKey = nextKey;
  return nextKey;
}
function readPlaybackContinuationLane(globals, requestState, now = Date.now()) {
  const laneKey = getPlaybackContinuationLaneKey(requestState);
  if (!laneKey) return { laneKey: "", laneEntry: null };
  const laneEntry = globals.PlaybackContinuationLanes.get(laneKey);
  if (!laneEntry) return { laneKey, laneEntry: null };
  if (now - Number(laneEntry.updatedAt || 0) > PLAYBACK_CONTINUATION_LANE_TTL_MS) {
    globals.PlaybackContinuationLanes.delete(laneKey);
    return { laneKey, laneEntry: null };
  }
  return { laneKey, laneEntry };
}
function rememberPlaybackContinuationLane(globals, laneKey, currentState, route, finalUrl, now = Date.now()) {
  if (!laneKey || !currentState) return;
  globals.PlaybackContinuationLanes.set(laneKey, {
    targetIndex: Number(currentState.activeTargetIndex) || 0,
    targetHost: String(currentState.activeTargetHost || "").trim(),
    route: String(route || "").trim(),
    finalUrl: finalUrl instanceof URL ? finalUrl.toString() : String(finalUrl || "").trim(),
    updatedAt: now
  });
}
function clearPlaybackContinuationLane(globals, laneKey) {
  if (!laneKey) return;
  globals.PlaybackContinuationLanes.delete(laneKey);
}
function getPlaybackContinuationStallRangeStart(requestState) {
  const range = parseSingleByteRangeHeader(requestState?.rangeHeader);
  if (!range || !Number.isFinite(range.start)) return null;
  if (range.start < PLAYBACK_OPTIMIZATION_DEEP_RANGE_START_BYTES) return null;
  return range.start;
}
function readPlaybackContinuationStall(globals, requestState, now = Date.now()) {
  const stallKey = getPlaybackContinuationLaneKey(requestState);
  if (!stallKey) return { stallKey: "", stallEntry: null };
  const stallEntry = globals.PlaybackContinuationStalls.get(stallKey);
  if (!stallEntry) return { stallKey, stallEntry: null };
  if (now - Number(stallEntry.updatedAt || 0) > PLAYBACK_CONTINUATION_STALL_TTL_MS) {
    globals.PlaybackContinuationStalls.delete(stallKey);
    return { stallKey, stallEntry: null };
  }
  return { stallKey, stallEntry };
}
function consumePlaybackContinuationStallRecovery(globals, requestState, now = Date.now()) {
  const { stallKey, stallEntry } = readPlaybackContinuationStall(globals, requestState, now);
  const armed = Number(stallEntry?.smallAdvanceStreak || 0) >= PLAYBACK_CONTINUATION_STALL_TRIGGER_STREAK;
  if (armed) {
    globals.PlaybackContinuationStalls.delete(stallKey);
  }
  return {
    stallKey,
    stallEntry,
    armed
  };
}
function rememberPlaybackContinuationStall(globals, stallKey, currentState, now = Date.now()) {
  if (!stallKey || !currentState) return;
  const rangeStart = getPlaybackContinuationStallRangeStart(currentState);
  if (!Number.isFinite(rangeStart)) {
    globals.PlaybackContinuationStalls.delete(stallKey);
    return;
  }
  const previousEntry = globals.PlaybackContinuationStalls.get(stallKey);
  const previousUpdatedAt = Number(previousEntry?.updatedAt || 0);
  const previousRangeStart = Number(previousEntry?.lastRangeStart);
  let smallAdvanceStreak = 0;
  if (Number.isFinite(previousUpdatedAt) && previousUpdatedAt > 0 && now - previousUpdatedAt <= PLAYBACK_CONTINUATION_STALL_TTL_MS && Number.isFinite(previousRangeStart)) {
    const advance = rangeStart - previousRangeStart;
    if (advance > 0 && advance < PLAYBACK_CONTINUATION_STALL_MAX_SMALL_ADVANCE_BYTES) {
      smallAdvanceStreak = Number(previousEntry?.smallAdvanceStreak || 0) + 1;
    }
  }
  globals.PlaybackContinuationStalls.set(stallKey, {
    lastRangeStart: rangeStart,
    targetIndex: Number(currentState.activeTargetIndex) || 0,
    updatedAt: now,
    smallAdvanceStreak
  });
}
function clearPlaybackContinuationStall(globals, stallKey) {
  if (!stallKey) return;
  globals.PlaybackContinuationStalls.delete(stallKey);
}
function resolvePlaybackContinuationRecoveryProbeTimeoutMs(context) {
  const configured = Number(context?.continuationRecoveryTimeoutMs);
  if (Number.isFinite(configured) && configured >= 0) {
    return Math.floor(configured);
  }
  return PLAYBACK_CONTINUATION_STALL_RECOVERY_PROBE_TIMEOUT_MS;
}
function applyPlaybackContinuationRecoveryProbeContext(context) {
  const probeTimeoutMs = resolvePlaybackContinuationRecoveryProbeTimeoutMs(context);
  if (!(probeTimeoutMs >= 0)) return context;
  const existingTimeoutMs = Number(context?.upstreamTimeoutMs);
  const nextTimeoutMs = Number.isFinite(existingTimeoutMs) && existingTimeoutMs >= 0 ? Math.min(existingTimeoutMs, probeTimeoutMs) : probeTimeoutMs;
  if (Number.isFinite(existingTimeoutMs) && existingTimeoutMs === nextTimeoutMs) {
    return context;
  }
  return {
    ...context,
    upstreamTimeoutMs: nextTimeoutMs
  };
}
function applyPlaybackContinuationLaneOrdering(targetEntries, laneEntry) {
  if (!Array.isArray(targetEntries) || targetEntries.length <= 1 || !laneEntry) return targetEntries;
  const targetIndex = Number(laneEntry.targetIndex);
  if (!Number.isFinite(targetIndex) || targetIndex < 0) return targetEntries;
  const lanePos = targetEntries.findIndex((entry) => Number(entry?.index) === targetIndex);
  if (lanePos <= 0) return targetEntries;
  const laneTarget = targetEntries[lanePos];
  if (!laneTarget) return targetEntries;
  return [laneTarget, ...targetEntries.slice(0, lanePos), ...targetEntries.slice(lanePos + 1)];
}
function shouldHydrateStartupSeededContinuationRedirect(requestState, laneEntry) {
  if (!requestState || !laneEntry) return false;
  if (!String(laneEntry.finalUrl || "").trim()) return false;
  const laneRoute = String(laneEntry.route || "").toLowerCase();
  if (!laneRoute.includes("followed") && !laneRoute.includes("redirect-cache")) return false;
  const range = parseSingleByteRangeHeader(requestState.rangeHeader);
  if (!range || !Number.isFinite(range.start)) return false;
  if (range.start <= 0) return false;
  return range.start < PLAYBACK_OPTIMIZATION_DEEP_RANGE_START_BYTES;
}
function hydrateStartupSeededContinuationRedirect(globals, requestState, context, laneEntry) {
  if (!shouldHydrateStartupSeededContinuationRedirect(requestState, laneEntry)) return false;
  if (Number(laneEntry.targetIndex) !== Number(requestState?.activeTargetIndex)) return false;
  try {
    rememberExternalRedirectUrl(
      globals,
      requestState.method,
      requestState.activeFinalUrl,
      new URL(String(laneEntry.finalUrl)),
      {
        context,
        persist: false
      }
    );
    return true;
  } catch (_) {
    return false;
  }
}
function applyPlaybackContinuationStallRecoveryOrdering(targetEntries, requestState, stallEntry) {
  if (!Array.isArray(targetEntries) || !targetEntries.length || !stallEntry) {
    return {
      targetEntries,
      failoverOffset: 0
    };
  }
  if (targetEntries.length <= 1) {
    return {
      targetEntries,
      failoverOffset: 0
    };
  }
  const stalledTargetIndex = Number(stallEntry.targetIndex);
  if (!Number.isFinite(stalledTargetIndex) || stalledTargetIndex < 0) {
    return {
      targetEntries,
      failoverOffset: 0
    };
  }
  const stalledPos = targetEntries.findIndex((entry) => Number(entry?.index) === stalledTargetIndex);
  if (stalledPos < 0) {
    return {
      targetEntries,
      failoverOffset: 0
    };
  }
  const reorderedTargets = [
    ...targetEntries.slice(0, stalledPos),
    ...targetEntries.slice(stalledPos + 1),
    targetEntries[stalledPos]
  ];
  return {
    targetEntries: reorderedTargets,
    failoverOffset: Number(reorderedTargets[0]?.index) !== Number(requestState?.activeTargetIndex) ? 1 : 0
  };
}
function captureUpstreamResponseDiagnostics(diagnostics, response, finalUrl) {
  if (!diagnostics || !response) return;
  const finalHost = finalUrl instanceof URL ? finalUrl.host : "";
  if (finalHost) diagnostics.finalHost = finalHost;
  diagnostics.upstreamStatus = Number(response.status) || 0;
  diagnostics.upstreamContentType = String(response.headers?.get?.("Content-Type") || "").trim();
  diagnostics.upstreamCacheStatus = String(response.headers?.get?.("CF-Cache-Status") || "").trim();
  if ((Number(response.status) || 0) < 500) {
    diagnostics.debugReason = "";
    return;
  }
  if (!String(diagnostics.debugReason || "").trim()) {
    diagnostics.debugReason = describeUpstreamFailure(response.status);
  }
}
async function dispatchUpstream({
  request,
  requestState,
  context,
  diagnostics
}) {
  const upstreamStartedAt = Date.now();
  const replay = createReplayBodyAccessor(request, requestState.method);
  const canFailover = !replay.hasBody && (requestState.method === "GET" || requestState.method === "HEAD") && shouldAllowTargetFailover(requestState);
  const orderedTargets = orderTargetEntries(context.targetEntries, requestState.activeTargetIndex);
  const candidateTargets = canFailover ? orderedTargets : orderedTargets.slice(0, 1);
  diagnostics.targetCount = context.targetEntries.length || 1;
  let lastResult = null;
  let lastFailureReason = "";
  for (let attemptIndex = 0; attemptIndex < candidateTargets.length; attemptIndex += 1) {
    const targetEntry = candidateTargets[attemptIndex];
    const currentState = attemptIndex === 0 ? requestState : buildTargetRequestState(GLOBALS, requestState, targetEntry, context.proxyPrefix);
    const budgetState = createPlaybackOptimizationBudgetState(request, currentState);
    const newHeaders = buildUpstreamHeaders(request, currentState, targetEntry.targetBase, {
      forceH1: context?.forceH1 === true,
      customHeaders: context?.nodeHeaders,
      realClientIpMode: context?.realClientIpMode
    });
    const cf = buildCloudflareFetchOptions(currentState);
    const { fetchWithRedirectsWithHeaders, fetchWithRedirects } = createFetchWithRedirectsHandlers({
      request,
      currentState,
      context,
      targetEntry,
      replay,
      cf,
      newHeaders
    });
    try {
      const fetchResult = await fetchWithRedirects(currentState.activeFinalUrl, attemptIndex === 0);
      const targetAwareRoute = attemptIndex === 0 ? fetchResult.route : fetchResult.route === "passthrough" ? "origin-failover" : `origin-failover-${fetchResult.route}`;
      const enrichedResult = {
        ...fetchResult,
        route: targetAwareRoute,
        requestState: currentState,
        budgetState,
        newHeaders,
        replay,
        cf,
        fetchWithRedirects,
        fetchWithRedirectsWithHeaders,
        upstreamStartedAt,
        budgetDegraded: budgetState.degraded
      };
      if (fetchResult.errorResponse) {
        if (budgetState.degraded) {
          markPlaybackOptimizationBudgetDegraded(GLOBALS, budgetState, budgetState.reason || "range");
        }
        diagnostics.upstreamMs = Date.now() - upstreamStartedAt;
        diagnostics.route = decorateBudgetRoute(targetAwareRoute, budgetState.degraded);
        diagnostics.hops = fetchResult.hops;
        diagnostics.targetHost = currentState.activeTargetHost;
        diagnostics.targetIndex = currentState.activeTargetIndex + 1;
        diagnostics.failover = attemptIndex > 0 ? "1" : "0";
        diagnostics.failoverReason = lastFailureReason;
        captureUpstreamResponseDiagnostics(diagnostics, fetchResult.response, fetchResult.finalUrl);
        return enrichedResult;
      }
      const shouldRetryOnAlternateTarget = fetchResult.response && (RETRYABLE_ORIGIN_STATUSES.has(Number(fetchResult.response.status)) || shouldRetryMetadata404OnAlternateTarget(fetchResult.response, currentState));
      if (!fetchResult.response || !shouldRetryOnAlternateTarget || attemptIndex === candidateTargets.length - 1) {
        if (budgetState.degraded) {
          markPlaybackOptimizationBudgetDegraded(GLOBALS, budgetState, budgetState.reason || "range");
        }
        diagnostics.targetHost = currentState.activeTargetHost;
        diagnostics.targetIndex = currentState.activeTargetIndex + 1;
        diagnostics.failover = attemptIndex > 0 ? "1" : "0";
        diagnostics.failoverReason = lastFailureReason;
        return enrichedResult;
      }
      lastFailureReason = describeUpstreamFailure(fetchResult.response.status);
      lastResult = enrichedResult;
    } catch (error) {
      lastFailureReason = describeUpstreamFailure(error);
      if (attemptIndex === candidateTargets.length - 1) {
        const targetAwareRoute = attemptIndex === 0 ? "passthrough" : "origin-failover";
        if (budgetState.degraded) {
          markPlaybackOptimizationBudgetDegraded(GLOBALS, budgetState, budgetState.reason || "range");
        }
        diagnostics.upstreamMs = Date.now() - upstreamStartedAt;
        diagnostics.route = decorateBudgetRoute(targetAwareRoute, budgetState.degraded);
        diagnostics.hops = 0;
        diagnostics.targetHost = currentState.activeTargetHost;
        diagnostics.targetIndex = currentState.activeTargetIndex + 1;
        diagnostics.failover = attemptIndex > 0 ? "1" : "0";
        diagnostics.failoverReason = lastFailureReason;
        return {
          response: null,
          errorResponse: buildBadGatewayErrorResponse(
            request,
            context?.finalOrigin,
            decorateBudgetRoute(
              attemptIndex === 0 ? "passthrough" : "origin-failover",
              budgetState.degraded
            )
          ),
          route: targetAwareRoute,
          hops: 0,
          requestState: currentState,
          budgetState,
          newHeaders,
          replay,
          cf,
          fetchWithRedirects,
          fetchWithRedirectsWithHeaders,
          upstreamStartedAt,
          budgetDegraded: budgetState.degraded
        };
      }
    }
  }
  if (lastResult) {
    if (lastResult.budgetState?.degraded) {
      markPlaybackOptimizationBudgetDegraded(
        GLOBALS,
        lastResult.budgetState,
        lastResult.budgetState.reason || "range"
      );
    }
    diagnostics.targetHost = lastResult.requestState?.activeTargetHost || diagnostics.targetHost;
    diagnostics.targetIndex = (lastResult.requestState?.activeTargetIndex || 0) + 1;
    diagnostics.failover = diagnostics.targetIndex > 1 ? "1" : "0";
    diagnostics.failoverReason = lastFailureReason;
    return lastResult;
  }
  return {
    response: null,
    errorResponse: buildBadGatewayErrorResponse(
      request,
      context?.finalOrigin,
      decorateBudgetRoute("passthrough", false)
    ),
    route: "passthrough",
    hops: 0,
    requestState,
    budgetState: null,
    newHeaders: new Headers(),
    replay,
    cf: buildCloudflareFetchOptions(requestState),
    fetchWithRedirects: async () => ({ response: null, errorResponse: null, route: "passthrough", hops: 0 }),
    fetchWithRedirectsWithHeaders: async () => ({ response: null, errorResponse: null, route: "passthrough", hops: 0 }),
    upstreamStartedAt,
    budgetDegraded: false
  };
}
async function dispatchIndependentImageUpstream({
  request,
  requestState,
  context,
  diagnostics
}) {
  return await dispatchFastPathUpstream({
    request,
    requestState,
    context,
    diagnostics,
    disableBasePathLearning: true
  });
}
async function dispatchIndependentMetadataUpstream({
  request,
  requestState,
  context,
  diagnostics
}) {
  return await dispatchFastPathUpstream({
    request,
    requestState,
    context,
    diagnostics,
    disableBasePathLearning: false
  });
}
async function dispatchStartupMediaUpstream({
  request,
  requestState,
  context,
  diagnostics
}) {
  const upstream = await dispatchFastPathUpstream({
    request,
    requestState,
    context,
    diagnostics,
    disableBasePathLearning: false,
    seedContinuationLane: true
  });
  if (!shouldFallbackStartupHtmlErrorToDirectExternal(upstream, context)) {
    return upstream;
  }
  const preservedFailureDiagnostics = {
    finalHost: String(diagnostics?.finalHost || "").trim(),
    upstreamStatus: Number(diagnostics?.upstreamStatus) || 0,
    upstreamContentType: String(diagnostics?.upstreamContentType || "").trim(),
    upstreamCacheStatus: String(diagnostics?.upstreamCacheStatus || "").trim(),
    debugReason: "startup-followed-html-4xx"
  };
  try {
    upstream.response?.body?.cancel?.();
  } catch (_) {
  }
  clearExternalRedirectUrl(
    GLOBALS,
    requestState?.method || request.method,
    requestState?.activeFinalUrl,
    context
  );
  const fallbackUpstream = await dispatchFastPathUpstream({
    request,
    requestState,
    context: {
      ...context,
      forceExternalProxy: false
    },
    diagnostics,
    disableBasePathLearning: false
  });
  diagnostics.finalHost = preservedFailureDiagnostics.finalHost || diagnostics.finalHost;
  diagnostics.upstreamStatus = preservedFailureDiagnostics.upstreamStatus || diagnostics.upstreamStatus;
  diagnostics.upstreamContentType = preservedFailureDiagnostics.upstreamContentType || diagnostics.upstreamContentType;
  diagnostics.upstreamCacheStatus = preservedFailureDiagnostics.upstreamCacheStatus || diagnostics.upstreamCacheStatus;
  diagnostics.debugReason = preservedFailureDiagnostics.debugReason;
  return fallbackUpstream;
}
async function dispatchContinuationMediaUpstream({
  request,
  requestState,
  context,
  diagnostics
}) {
  return await dispatchFastPathUpstream({
    request,
    requestState,
    context,
    diagnostics,
    disableBasePathLearning: false,
    preserveBudgetSemantics: true
  });
}
async function dispatchFastPathUpstream({
  request,
  requestState,
  context,
  diagnostics,
  disableBasePathLearning = false,
  preserveBudgetSemantics = false,
  seedContinuationLane = false
}) {
  const upstreamStartedAt = Date.now();
  const replay = createReplayBodyAccessor(request, requestState.method);
  const stallRecovery = preserveBudgetSemantics ? consumePlaybackContinuationStallRecovery(GLOBALS, requestState, upstreamStartedAt) : { stallKey: "", stallEntry: null, armed: false };
  const shouldUseContinuationLaneState = preserveBudgetSemantics || seedContinuationLane;
  const laneState = shouldUseContinuationLaneState ? readPlaybackContinuationLane(GLOBALS, requestState, upstreamStartedAt) : { laneKey: "", laneEntry: null };
  let orderedTargets = orderTargetEntries(context.targetEntries, requestState.activeTargetIndex);
  if (!stallRecovery.armed) {
    orderedTargets = applyPlaybackContinuationLaneOrdering(orderedTargets, laneState.laneEntry);
  }
  const stallOrderedTargets = stallRecovery.armed ? applyPlaybackContinuationStallRecoveryOrdering(orderedTargets, requestState, stallRecovery.stallEntry) : { targetEntries: orderedTargets, failoverOffset: 0 };
  orderedTargets = stallOrderedTargets.targetEntries;
  const recoveryFailoverOffset = Number(stallOrderedTargets.failoverOffset || 0);
  if (stallRecovery.armed) {
    clearExternalRedirectUrl(
      GLOBALS,
      requestState?.method || request.method,
      requestState?.activeFinalUrl,
      context
    );
  }
  diagnostics.targetCount = orderedTargets.length || 1;
  let lastFailureReason = "";
  let lastBudgetState = null;
  for (let attemptIndex = 0; attemptIndex < orderedTargets.length; attemptIndex += 1) {
    const targetEntry = orderedTargets[attemptIndex];
    const currentState = attemptIndex === 0 && Number(targetEntry?.index) === Number(requestState?.activeTargetIndex) ? requestState : buildTargetRequestState(
      GLOBALS,
      requestState,
      targetEntry,
      context.proxyPrefix,
      { disableBasePathLearning }
    );
    if (preserveBudgetSemantics && attemptIndex === 0) {
      hydrateStartupSeededContinuationRedirect(
        GLOBALS,
        currentState,
        context,
        laneState.laneEntry
      );
    }
    const budgetState = preserveBudgetSemantics ? createPlaybackOptimizationBudgetState(request, currentState) : null;
    lastBudgetState = budgetState;
    const fastPathContext = stallRecovery.armed && attemptIndex === 0 && recoveryFailoverOffset > 0 ? applyPlaybackContinuationRecoveryProbeContext(context) : context;
    const newHeaders = buildUpstreamHeaders(request, currentState, targetEntry.targetBase, {
      forceH1: context?.forceH1 === true,
      customHeaders: context?.nodeHeaders,
      realClientIpMode: context?.realClientIpMode
    });
    const cf = buildCloudflareFetchOptions(currentState);
    const { fetchWithRedirectsWithHeaders, fetchWithRedirects } = createFetchWithRedirectsHandlers({
      request,
      currentState,
      context: fastPathContext,
      targetEntry,
      replay,
      cf,
      newHeaders
    });
    try {
      let fetchResult = await fetchWithRedirects(currentState.activeFinalUrl, attemptIndex === 0);
      fetchResult = await maybeRecoverRetryableFastPathFailure({
        fetchResult,
        request,
        requestState: currentState,
        context,
        fetchWithRedirects,
        preserveBudgetSemantics,
        attemptIndex,
        targetCount: orderedTargets.length
      });
      const effectiveAttemptIndex = attemptIndex + recoveryFailoverOffset;
      const targetAwareRoute = effectiveAttemptIndex === 0 ? fetchResult.route : fetchResult.route === "passthrough" ? "origin-failover" : `origin-failover-${fetchResult.route}`;
      diagnostics.upstreamMs = Date.now() - upstreamStartedAt;
      diagnostics.route = decorateBudgetRoute(targetAwareRoute, budgetState?.degraded === true);
      diagnostics.hops = fetchResult.hops;
      diagnostics.targetHost = currentState.activeTargetHost;
      diagnostics.targetIndex = currentState.activeTargetIndex + 1;
      diagnostics.failover = effectiveAttemptIndex > 0 ? "1" : "0";
      diagnostics.failoverReason = lastFailureReason;
      captureUpstreamResponseDiagnostics(diagnostics, fetchResult.response, fetchResult.finalUrl);
      if (budgetState?.degraded) {
        markPlaybackOptimizationBudgetDegraded(GLOBALS, budgetState, budgetState.reason || "range");
      }
      if (fetchResult.errorResponse) {
        clearPlaybackContinuationLane(GLOBALS, laneState.laneKey);
        clearPlaybackContinuationStall(GLOBALS, stallRecovery.stallKey);
        return {
          ...fetchResult,
          route: targetAwareRoute,
          requestState: currentState,
          budgetState,
          newHeaders,
          replay,
          cf,
          fetchWithRedirects,
          fetchWithRedirectsWithHeaders,
          upstreamStartedAt,
          budgetDegraded: budgetState?.degraded === true
        };
      }
      if (fetchResult.response && RETRYABLE_ORIGIN_STATUSES.has(Number(fetchResult.response.status)) && attemptIndex < orderedTargets.length - 1) {
        lastFailureReason = describeUpstreamFailure(fetchResult.response.status);
        continue;
      }
      const safeStatus = Number(fetchResult.response?.status) || 0;
      if (safeStatus >= 500) {
        clearPlaybackContinuationLane(GLOBALS, laneState.laneKey);
        clearPlaybackContinuationStall(GLOBALS, stallRecovery.stallKey);
      } else if ((preserveBudgetSemantics || seedContinuationLane) && safeStatus >= 200 && safeStatus < 400) {
        const rememberedAt = Date.now();
        rememberPlaybackContinuationLane(
          GLOBALS,
          laneState.laneKey,
          currentState,
          targetAwareRoute,
          fetchResult.finalUrl,
          rememberedAt
        );
        if (preserveBudgetSemantics) {
          rememberPlaybackContinuationStall(
            GLOBALS,
            stallRecovery.stallKey,
            currentState,
            rememberedAt
          );
        }
      }
      return {
        ...fetchResult,
        route: targetAwareRoute,
        requestState: currentState,
        budgetState,
        newHeaders,
        replay,
        cf,
        fetchWithRedirects,
        fetchWithRedirectsWithHeaders,
        upstreamStartedAt,
        budgetDegraded: budgetState?.degraded === true
      };
    } catch (error) {
      lastFailureReason = describeUpstreamFailure(error);
      if (attemptIndex === orderedTargets.length - 1) {
        clearPlaybackContinuationLane(GLOBALS, laneState.laneKey);
        clearPlaybackContinuationStall(GLOBALS, stallRecovery.stallKey);
        diagnostics.upstreamMs = Date.now() - upstreamStartedAt;
        diagnostics.route = decorateBudgetRoute(
          attemptIndex + recoveryFailoverOffset === 0 ? "passthrough" : "origin-failover",
          budgetState?.degraded === true
        );
        diagnostics.hops = 0;
        diagnostics.targetHost = currentState.activeTargetHost;
        diagnostics.targetIndex = currentState.activeTargetIndex + 1;
        diagnostics.failover = attemptIndex + recoveryFailoverOffset > 0 ? "1" : "0";
        diagnostics.failoverReason = lastFailureReason;
        if (budgetState?.degraded) {
          markPlaybackOptimizationBudgetDegraded(GLOBALS, budgetState, budgetState.reason || "range");
        }
        return {
          response: null,
          errorResponse: buildBadGatewayErrorResponse(
            request,
            context?.finalOrigin,
            diagnostics.route
          ),
          route: diagnostics.route,
          hops: 0,
          requestState: currentState,
          budgetState,
          newHeaders,
          replay,
          cf,
          fetchWithRedirects,
          fetchWithRedirectsWithHeaders,
          upstreamStartedAt,
          budgetDegraded: budgetState?.degraded === true
        };
      }
    }
  }
  diagnostics.upstreamMs = Date.now() - upstreamStartedAt;
  diagnostics.route = decorateBudgetRoute("passthrough", lastBudgetState?.degraded === true);
  diagnostics.hops = 0;
  diagnostics.failover = "0";
  diagnostics.failoverReason = lastFailureReason;
  clearPlaybackContinuationLane(GLOBALS, laneState.laneKey);
  clearPlaybackContinuationStall(GLOBALS, stallRecovery.stallKey);
  if (lastBudgetState?.degraded) {
    markPlaybackOptimizationBudgetDegraded(GLOBALS, lastBudgetState, lastBudgetState.reason || "range");
  }
  return {
    response: null,
    errorResponse: buildBadGatewayErrorResponse(
      request,
      context?.finalOrigin,
      diagnostics.route
    ),
    route: "passthrough",
    hops: 0,
    requestState,
    budgetState: lastBudgetState,
    newHeaders: new Headers(),
    replay,
    cf: buildCloudflareFetchOptions(requestState),
    fetchWithRedirects: async () => ({ response: null, errorResponse: null, route: "passthrough", hops: 0 }),
    fetchWithRedirectsWithHeaders: async () => ({ response: null, errorResponse: null, route: "passthrough", hops: 0 }),
    upstreamStartedAt,
    budgetDegraded: lastBudgetState?.degraded === true
  };
}
function buildBadGatewayErrorResponse(request, originOverride = null, route = "passthrough") {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Proxy-Route": String(route || "passthrough")
  });
  applyBaseProxySecurityHeaders(headers);
  applyProxyCorsHeaders(headers, request, originOverride);
  return new Response(
    JSON.stringify({ error: "Bad Gateway", code: 502, message: "All proxy attempts failed." }),
    { status: 502, headers }
  );
}
async function maybeRecoverRetryableFastPathFailure({
  fetchResult,
  request,
  requestState,
  context,
  fetchWithRedirects,
  preserveBudgetSemantics,
  attemptIndex,
  targetCount
}) {
  const response = fetchResult?.response;
  const status = Number(response?.status) || 0;
  const method = String(requestState?.method || request?.method || "").toUpperCase();
  if (!preserveBudgetSemantics) return fetchResult;
  if (method !== "GET" && method !== "HEAD") return fetchResult;
  if (!RETRYABLE_ORIGIN_STATUSES.has(status)) return fetchResult;
  if (attemptIndex < Math.max(0, Number(targetCount || 0) - 1)) return fetchResult;
  try {
    response?.body?.cancel?.();
  } catch (_) {
  }
  clearExternalRedirectUrl(
    GLOBALS,
    requestState?.method || request?.method,
    requestState?.activeFinalUrl,
    context
  );
  try {
    const recovered = await fetchWithRedirects(requestState.activeFinalUrl, false);
    if (recovered?.response && !RETRYABLE_ORIGIN_STATUSES.has(Number(recovered.response.status) || 0)) {
      return recovered;
    }
    if (recovered?.errorResponse) {
      return recovered;
    }
    if (recovered?.response) {
      return recovered;
    }
  } catch (_) {
  }
  return fetchResult;
}
function shouldFallbackStartupHtmlErrorToDirectExternal(upstream, context) {
  if (context?.forceExternalProxy === false) return false;
  if (upstream?.route !== "followed") return false;
  const response = upstream?.response;
  if (!response) return false;
  const status = Number(response.status) || 0;
  if (status < 400 || status >= 500) return false;
  const contentType = String(response.headers?.get?.("Content-Type") || "").toLowerCase();
  return contentType.includes("text/html");
}

// src/proxy/upstream/fallback-strategy.js
init_runtime_state();
async function applyFallbackStrategy({
  request,
  requestState,
  context,
  upstreamState,
  diagnostics
}) {
  let nextState = { ...requestState };
  let nextUpstream = { ...upstreamState };
  if (nextState.usedCachedBasePath && nextUpstream.response && Number(nextUpstream.response.status) === 404) {
    await clearCachedLearnedBasePath(GLOBALS, context.name, nextState.basePathChannel);
    nextState.usedCachedBasePath = false;
    nextState.activeNormalizedPath = nextState.normalizedPath;
    nextState.activeRewriteBasePath = nextState.activeTargetBasePath || nextState.inferredBasePath;
    nextState.activeFinalUrl = new URL(nextState.activeNormalizedPath, nextState.activeTargetBase);
    nextState.activeFinalUrl.search = nextState.requestUrl.search;
    nextState.lowerPath = nextState.activeNormalizedPath.toLowerCase();
    diagnostics.normalizedPath = nextState.activeNormalizedPath;
    diagnostics.upstreamPath = nextState.activeFinalUrl.pathname || "/";
    nextUpstream = {
      ...nextUpstream,
      ...await nextUpstream.fetchWithRedirects(nextState.activeFinalUrl, false)
    };
    if (nextUpstream.errorResponse) {
      diagnostics.upstreamMs = Date.now() - nextUpstream.upstreamStartedAt;
      diagnostics.route = decorateBudgetRoute(nextUpstream.route, nextUpstream.budgetDegraded === true);
      diagnostics.hops = nextUpstream.hops;
      return { requestState: nextState, upstreamState: nextUpstream };
    }
  }
  if (shouldTryBasePathFallback(nextUpstream.response, nextState.normalizedPath, nextState.activeTargetBasePath, nextState.basePathChannel)) {
    for (const fallbackBasePath of getBasePathFallbacks(nextState.normalizedPath, nextState.basePathChannel)) {
      const fallbackNormalizedPath = ensureBasePath(nextState.normalizedPath, fallbackBasePath);
      const fallbackUrl = new URL(fallbackNormalizedPath, nextState.activeTargetBase);
      fallbackUrl.search = nextState.requestUrl.search;
      const fallbackResult = await nextUpstream.fetchWithRedirects(fallbackUrl, false);
      if (fallbackResult.errorResponse) continue;
      if (!fallbackResult.response || fallbackResult.response.status === 404) continue;
      nextUpstream = { ...nextUpstream, ...fallbackResult };
      nextState = {
        ...nextState,
        activeNormalizedPath: fallbackNormalizedPath,
        activeFinalUrl: fallbackUrl,
        activeRewriteBasePath: fallbackBasePath,
        lowerPath: fallbackNormalizedPath.toLowerCase(),
        usedCachedBasePath: false
      };
      const fallbackRoute = fallbackResult.route === "passthrough" ? "basepath-fallback" : `basepath-fallback-${fallbackResult.route}`;
      diagnostics.route = decorateBudgetRoute(fallbackRoute, nextUpstream.budgetDegraded === true);
      diagnostics.hops = fallbackResult.hops;
      diagnostics.normalizedPath = nextState.activeNormalizedPath;
      diagnostics.upstreamPath = nextState.activeFinalUrl.pathname || "/";
      await cacheLearnedBasePath(GLOBALS, context.name, nextState.basePathChannel, fallbackBasePath);
      break;
    }
  }
  if (!diagnostics.route || diagnostics.route === "passthrough") {
    const selectedRoute = nextState.usedCachedBasePath ? "basepath-cache" : nextUpstream.route;
    diagnostics.route = decorateBudgetRoute(selectedRoute, nextUpstream.budgetDegraded === true);
    diagnostics.hops = nextUpstream.hops;
  }
  diagnostics.upstreamMs = Date.now() - nextUpstream.upstreamStartedAt;
  return { requestState: nextState, upstreamState: nextUpstream };
}

// src/proxy/pipeline/handle.js
init_static_cache();
init_metadata_cache();

// src/proxy/pipeline/response-orchestrator.js
init_runtime_state();

// src/proxy/routing/location-rewrite.js
function rewriteLocation(headers, status, path, targetBase, options = {}) {
  if (status < 300 || status >= 400) return;
  const location = headers.get("Location");
  if (!location) return { direct: false };
  const prefix = `/${path}`;
  const sourceSameOriginProxy = options.sourceSameOriginProxy !== false;
  if (location.startsWith("/")) {
    if (!sourceSameOriginProxy) {
      headers.set("Location", new URL(location, targetBase).toString());
      return { direct: true };
    }
    const newLocation = `${prefix}${location}`;
    headers.set("Location", newLocation);
    return { direct: false };
  }
  try {
    const locUrl = new URL(location);
    if (locUrl.host === targetBase.host) {
      if (!sourceSameOriginProxy) {
        headers.set("Location", locUrl.toString());
        return { direct: true };
      }
      const newLocation = `${prefix}${locUrl.pathname}${locUrl.search}${locUrl.hash || ""}`;
      headers.set("Location", newLocation);
      return { direct: false };
    }
  } catch (_) {
    if (!location.startsWith("http://") && !location.startsWith("https://")) {
      if (!sourceSameOriginProxy) {
        headers.set("Location", new URL(location, targetBase).toString());
        return { direct: true };
      }
      const newLocation = location.startsWith("/") ? `${prefix}${location}` : `${prefix}/${location}`;
      headers.set("Location", newLocation);
    }
  }
  return { direct: false };
}

// src/proxy/pipeline/response-streaming.js
async function prepareStreamingResponseBody({
  responseBody
}) {
  return responseBody;
}
function buildTrackedStreamingResponse({
  request,
  requestState,
  context,
  response,
  modifiedHeaders,
  contentType,
  contentLength,
  responseBody
}) {
  const telemetryMeta = shouldTrackPlaybackResponse({
    method: requestState.method,
    lowerPath: requestState.lowerPath,
    contentType,
    status: response.status,
    body: responseBody
  }) ? extractPlaybackTelemetryMeta(request, requestState.requestHost, context.name, requestState.activeNormalizedPath) : null;
  const trackedBody = buildProxyResponseBody(responseBody, {
    contentLength,
    telemetryMeta
  });
  return new Response(trackedBody, {
    status: response.status,
    statusText: response.statusText,
    headers: modifiedHeaders
  });
}

// src/proxy/pipeline/response-orchestrator.js
init_metadata_prewarm();
init_metadata_cache();
async function maybeCapturePlaybackInfoDiagnostics(requestState, response, diagnostics) {
  if (diagnostics?.debugProxyHeadersEnabled !== true) return;
  if (requestState?.isPlaybackInfo !== true) return;
  if (!(Number(response?.status) >= 200 && Number(response?.status) < 300)) return;
  const contentType = String(response?.headers?.get?.("Content-Type") || "").toLowerCase();
  if (!contentType.includes("json")) return;
  try {
    const payload = await response.clone().json();
    const mediaSource = Array.isArray(payload?.MediaSources) ? payload.MediaSources[0] : null;
    if (!mediaSource || typeof mediaSource !== "object") return;
    const transcodeUrl = String(mediaSource.TranscodingUrl || "").trim();
    const supportsDirectPlay = mediaSource.SupportsDirectPlay === true;
    const supportsDirectStream = mediaSource.SupportsDirectStream === true;
    diagnostics.playbackMode = transcodeUrl ? "transcode" : supportsDirectPlay ? "direct_play" : supportsDirectStream ? "direct_stream" : "unknown";
  } catch (_) {
  }
}
async function rewriteProxyResponse({
  request,
  requestState,
  context,
  response,
  diagnostics,
  executionContext = null,
  upstreamState = null
}) {
  if (shouldTrackRecentNodeUsage(request, requestState, response)) {
    await rememberRecentNodeUsage(GLOBALS, context?.path || context?.name, executionContext);
  }
  const modifiedHeaders = new Headers(response.headers);
  const upstreamCacheStatus = response.headers.get("CF-Cache-Status");
  if (!diagnostics?.upstreamCacheStatus && upstreamCacheStatus) {
    diagnostics.upstreamCacheStatus = String(upstreamCacheStatus).trim();
  }
  applyBaseProxySecurityHeaders(modifiedHeaders);
  applyProxyCorsHeaders(modifiedHeaders, request, context?.finalOrigin || null);
  applyStaticStreamingCacheHeaders(modifiedHeaders, requestState, upstreamCacheStatus, {
    prewarmCacheTtl: context?.prewarmCacheTtl,
    proxiedExternalRedirect: upstreamState?.route === "followed" || upstreamState?.route === "redirect-cache"
  });
  if (context?.enableH3 !== true || context?.forceH1 === true) {
    modifiedHeaders.delete("Alt-Svc");
  }
  if (requestState.direct307Mode === true && response.status >= 200 && response.status < 300 && (requestState.method === "GET" || requestState.method === "HEAD")) {
    modifiedHeaders.set("Location", requestState.activeFinalUrl.toString());
    modifiedHeaders.set("Cache-Control", "no-store");
    const redirected = new Response(null, {
      status: 307,
      statusText: "Temporary Redirect",
      headers: modifiedHeaders
    });
    return finalizeDiagnostics(GLOBALS, redirected, diagnostics, request);
  }
  if (Number(response?.status) === 101 && response?.webSocket && requestState?.isWsUpgrade === true) {
    const upgraded = new Response(null, {
      status: 101,
      statusText: response.statusText,
      headers: modifiedHeaders,
      webSocket: response.webSocket
    });
    return finalizeDiagnostics(GLOBALS, upgraded, diagnostics, request);
  }
  const contentType = modifiedHeaders.get("Content-Type") || "";
  const contentLength = getResponseContentLength(modifiedHeaders);
  const locationRewrite = rewriteLocation(
    modifiedHeaders,
    response.status,
    context.path || context.name,
    requestState.activeTargetBase,
    {
      sourceSameOriginProxy: context?.sourceSameOriginProxy
    }
  );
  if (locationRewrite?.direct) {
    modifiedHeaders.set("Cache-Control", "no-store");
  }
  if (diagnostics?.route !== "metadata-cache" && requestState?.method === "GET" && (requestState?.isImage === true || requestState?.isSubtitle === true || requestState?.isManifest === true) && Number(response?.status) === 200) {
    const cacheWrite = storeWorkerMetadataCache(request.url, response, requestState, {
      sourceUrl: requestState?.activeFinalUrl,
      prewarmCacheTtl: context?.prewarmCacheTtl,
      imageCacheMaxAge: requestState?.imageCacheMaxAge || context?.imageCacheMaxAge
    });
    if (typeof executionContext?.waitUntil === "function") executionContext.waitUntil(cacheWrite);
    else await cacheWrite;
  }
  await maybePrewarmMetadataResponse({
    request,
    requestState,
    context,
    response,
    executionContext
  });
  await maybeCapturePlaybackInfoDiagnostics(requestState, response, diagnostics);
  const responseBody = await prepareStreamingResponseBody({
    responseBody: attachPlaybackWindowCapture(GLOBALS, {
      requestState,
      response,
      executionContext
    })
  });
  const output = buildTrackedStreamingResponse({
    request,
    requestState,
    context,
    response,
    modifiedHeaders,
    contentType,
    contentLength,
    responseBody
  });
  return finalizeDiagnostics(GLOBALS, output, diagnostics, request);
}
async function rewriteIndependentImageResponse({
  request,
  requestState,
  context,
  response,
  diagnostics,
  executionContext = null
}) {
  const modifiedHeaders = new Headers(response.headers);
  const upstreamCacheStatus = response.headers.get("CF-Cache-Status");
  applyBaseProxySecurityHeaders(modifiedHeaders);
  applyProxyCorsHeaders(modifiedHeaders, request, context?.finalOrigin || null);
  applyStaticStreamingCacheHeaders(modifiedHeaders, requestState, upstreamCacheStatus, {
    prewarmCacheTtl: context?.prewarmCacheTtl,
    proxiedExternalRedirect: false
  });
  if (context?.enableH3 !== true || context?.forceH1 === true) {
    modifiedHeaders.delete("Alt-Svc");
  }
  const locationRewrite = rewriteLocation(
    modifiedHeaders,
    response.status,
    context.path || context.name,
    requestState.activeTargetBase,
    {
      sourceSameOriginProxy: context?.sourceSameOriginProxy
    }
  );
  if (locationRewrite?.direct) {
    modifiedHeaders.set("Cache-Control", "no-store");
  }
  if (diagnostics?.route !== "metadata-cache" && requestState?.method === "GET" && (requestState?.isImage === true || requestState?.isSubtitle === true || requestState?.isManifest === true) && Number(response?.status) === 200) {
    const cacheWrite = storeWorkerMetadataCache(request.url, response, requestState, {
      sourceUrl: requestState?.activeFinalUrl,
      prewarmCacheTtl: context?.prewarmCacheTtl,
      imageCacheMaxAge: requestState?.imageCacheMaxAge || context?.imageCacheMaxAge
    });
    if (typeof executionContext?.waitUntil === "function") executionContext.waitUntil(cacheWrite);
    else await cacheWrite;
  }
  const output = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: modifiedHeaders
  });
  return finalizeDiagnostics(GLOBALS, output, diagnostics, request);
}

// src/proxy/pipeline/handle.js
var PLAYBACK_STOP_GUARD_TTL_MS = 10 * 1e3;
var Proxy2 = {
  /**
   * 核心代理处理函数
   * @param {Request} request 原始请求对象
   * @param {Object} node 节点配置对象
   * @param {string} path 请求路径
   * @param {string} nodePath 站点路径
   */
  async handle(request, node, path, nodePath, runtimeConfigOrLegacyKey = null, executionContextOrRuntimeConfig = null, envOrExecutionContext = null, legacyEnv = null) {
    const legacyCallShape = typeof runtimeConfigOrLegacyKey === "string";
    const runtimeConfig = legacyCallShape ? executionContextOrRuntimeConfig : runtimeConfigOrLegacyKey;
    const executionContext = legacyCallShape ? envOrExecutionContext : executionContextOrRuntimeConfig;
    const env = legacyCallShape ? legacyEnv : envOrExecutionContext;
    const finalOrigin = resolveCorsOrigin(runtimeConfig, request);
    let activeDiagnostics = null;
    try {
      if (String(request?.method || "").toUpperCase() === "OPTIONS") {
        return renderCors(request, finalOrigin);
      }
      maybeCleanupRuntimeCaches(GLOBALS);
      const blockedResponse = evaluateFirewall(request, runtimeConfig, finalOrigin);
      if (blockedResponse) {
        return blockedResponse;
      }
      const gatewayRequestTraits = classifyRequestTraits(GLOBALS, {
        path,
        requestUrl: new URL(request.url),
        method: request.method,
        rangeHeader: request.headers.get("Range"),
        nodeDirectSourceEnabled: isNodeDirectSourceEnabled(node, runtimeConfig, nodePath),
        enablePrewarmConfigured: runtimeConfig?.enablePrewarm !== false,
        prewarmDepthConfigured: runtimeConfig?.prewarmDepth,
        metadataPrewarmConfigured: request.headers.get("X-Metadata-Prewarm") === "1",
        directStaticAssetsEnabled: runtimeConfig?.directStaticAssets === true,
        directHlsDashEnabled: runtimeConfig?.directHlsDash === true
      });
      const independentImageGatewayState = {
        ...gatewayRequestTraits,
        method: request.method
      };
      const independentMetadataGatewayState = {
        ...gatewayRequestTraits,
        method: request.method
      };
      const rateLimitedResponse = applyRateLimit(GLOBALS, request, gatewayRequestTraits, runtimeConfig, finalOrigin);
      if (rateLimitedResponse) {
        return rateLimitedResponse;
      }
      const context = await prepareNodeContext(GLOBALS, node, nodePath, runtimeConfig);
      context.executionContext = executionContext;
      context.finalOrigin = finalOrigin;
      context.prewarmCacheTtl = Number(runtimeConfig?.prewarmCacheTtl) || 180;
      context.prewarmDepth = runtimeConfig?.prewarmDepth || "poster_manifest";
      context.prewarmTimeoutMs = Number(runtimeConfig?.prewarmTimeoutMs) || 3e3;
      context.imageCacheMaxAge = Math.max(0, Math.round(Number(runtimeConfig?.cacheTtlImages) || 30)) * 86400;
      context.nodeDirectSource = isNodeDirectSourceEnabled(node, runtimeConfig, nodePath);
      context.enableH2 = runtimeConfig?.enableH2 === true;
      context.enableH3 = runtimeConfig?.enableH3 === true;
      context.peakDowngrade = runtimeConfig?.peakDowngrade !== false;
      context.protocolFallback = runtimeConfig?.protocolFallback !== false;
      {
        const utc8Hour = ((/* @__PURE__ */ new Date()).getUTCHours() + 8) % 24;
        const isPeakHour = utc8Hour >= 20 && utc8Hour < 24;
        context.forceH1 = context.peakDowngrade && isPeakHour || !context.enableH2 && !context.enableH3;
      }
      context.enablePrewarm = runtimeConfig?.enablePrewarm !== false;
      context.upstreamTimeoutMs = Number(runtimeConfig?.upstreamTimeoutMs) || 0;
      context.upstreamRetryAttempts = Number(runtimeConfig?.upstreamRetryAttempts) || 0;
      context.directStaticAssets = runtimeConfig?.directStaticAssets === true;
      context.directHlsDash = runtimeConfig?.directHlsDash === true;
      context.sourceSameOriginProxy = runtimeConfig?.sourceSameOriginProxy !== false;
      context.forceExternalProxy = runtimeConfig?.forceExternalProxy !== false;
      context.debugProxyHeaders = runtimeConfig?.debugProxyHeaders === true;
      context.wangpanDirectKeywords = String(runtimeConfig?.wangpandirect || "").trim();
      context.redirectCachePersistenceEnabled = runtimeConfig?.redirectCachePersistenceEnabled === true;
      context.redirectCachePersistenceTtlSeconds = normalizeRedirectCachePersistenceTtl(
        runtimeConfig?.redirectCachePersistenceTtlSeconds
      );
      context.redirectCacheKv = getRedirectCacheKvBinding(env);
      const stoppedGuardResponse = await maybeHandlePlaybackSessionStopGuard({
        globals: GLOBALS,
        request,
        path,
        context,
        finalOrigin
      });
      if (stoppedGuardResponse) {
        return stoppedGuardResponse;
      }
      if (shouldUseIndependentImagePath(independentImageGatewayState)) {
        const imageRequestState = await normalizeIndependentImageRequest(GLOBALS, request, path, context);
        imageRequestState.debugProxyHeaders = context.debugProxyHeaders === true;
        const imageDiagnostics = createDiagnostics(path, imageRequestState);
        activeDiagnostics = imageDiagnostics;
        imageDiagnostics.skipPlaybackStats = true;
        const cachedImageResponse = await matchWorkerMetadataCache(request.url);
        if (cachedImageResponse) {
          imageDiagnostics.route = "metadata-cache";
          return await rewriteIndependentImageResponse({
            request,
            requestState: imageRequestState,
            context,
            response: cachedImageResponse,
            diagnostics: imageDiagnostics,
            executionContext
          });
        }
        const imageUpstreamState = await dispatchIndependentImageUpstream({
          request,
          requestState: imageRequestState,
          context,
          diagnostics: imageDiagnostics
        });
        if (imageUpstreamState.requestState) {
          imageDiagnostics.normalizedPath = imageUpstreamState.requestState.activeNormalizedPath;
          imageDiagnostics.upstreamPath = imageUpstreamState.requestState.activeFinalUrl.pathname || "/";
        }
        if (imageUpstreamState.errorResponse) {
          return finalizeDiagnostics(GLOBALS, imageUpstreamState.errorResponse, imageDiagnostics, request);
        }
        return await rewriteIndependentImageResponse({
          request,
          requestState: imageUpstreamState.requestState || imageRequestState,
          context,
          response: imageUpstreamState.response,
          diagnostics: imageDiagnostics,
          executionContext
        });
      }
      if (shouldUseIndependentMetadataPath(independentMetadataGatewayState)) {
        const metadataRequestState = await normalizeIndependentMetadataRequest(GLOBALS, request, path, context);
        metadataRequestState.debugProxyHeaders = context.debugProxyHeaders === true;
        const metadataDiagnostics = createDiagnostics(path, metadataRequestState);
        activeDiagnostics = metadataDiagnostics;
        metadataDiagnostics.skipPlaybackStats = true;
        const cachedMetadataResponse = await matchWorkerMetadataCache(request.url);
        if (cachedMetadataResponse) {
          metadataDiagnostics.route = "metadata-cache";
          return await rewriteIndependentImageResponse({
            request,
            requestState: metadataRequestState,
            context,
            response: cachedMetadataResponse,
            diagnostics: metadataDiagnostics,
            executionContext
          });
        }
        const metadataUpstreamState = await dispatchIndependentMetadataUpstream({
          request,
          requestState: metadataRequestState,
          context,
          diagnostics: metadataDiagnostics
        });
        if (metadataUpstreamState.requestState) {
          metadataDiagnostics.normalizedPath = metadataUpstreamState.requestState.activeNormalizedPath;
          metadataDiagnostics.upstreamPath = metadataUpstreamState.requestState.activeFinalUrl.pathname || "/";
        }
        if (metadataUpstreamState.errorResponse) {
          return finalizeDiagnostics(GLOBALS, metadataUpstreamState.errorResponse, metadataDiagnostics, request);
        }
        if (Number(metadataUpstreamState.response?.status) !== 404) {
          return await rewriteIndependentImageResponse({
            request,
            requestState: metadataUpstreamState.requestState || metadataRequestState,
            context,
            response: metadataUpstreamState.response,
            diagnostics: metadataDiagnostics,
            executionContext
          });
        }
        let recoveredMetadataRequestState = await normalizeIncomingRequest(GLOBALS, request, path, context);
        let recoveredMetadataUpstreamState = {
          ...metadataUpstreamState,
          requestState: recoveredMetadataRequestState
        };
        ({ requestState: recoveredMetadataRequestState, upstreamState: recoveredMetadataUpstreamState } = await applyFallbackStrategy({
          request,
          requestState: recoveredMetadataRequestState,
          context,
          upstreamState: recoveredMetadataUpstreamState,
          diagnostics: metadataDiagnostics
        }));
        if (recoveredMetadataUpstreamState.errorResponse) {
          return finalizeDiagnostics(GLOBALS, recoveredMetadataUpstreamState.errorResponse, metadataDiagnostics, request);
        }
        if (Number(recoveredMetadataUpstreamState.response?.status) !== 404) {
          return await rewriteIndependentImageResponse({
            request,
            requestState: recoveredMetadataRequestState,
            context,
            response: recoveredMetadataUpstreamState.response,
            diagnostics: metadataDiagnostics,
            executionContext
          });
        }
      }
      let requestState = await normalizeIncomingRequest(GLOBALS, request, path, context);
      requestState.debugProxyHeaders = context.debugProxyHeaders === true;
      requestState.playbackWindowSessionKey = buildPlaybackWindowSessionKey(requestState);
      const diagnostics = createDiagnostics(path, requestState);
      activeDiagnostics = diagnostics;
      const playbackWindowHit = maybeServePlaybackWindowHit(GLOBALS, requestState);
      if (playbackWindowHit) {
        diagnostics.route = playbackWindowHit.route;
        return await rewriteProxyResponse({
          request,
          requestState,
          context,
          response: playbackWindowHit.response,
          diagnostics,
          executionContext,
          upstreamState: {
            route: playbackWindowHit.route
          }
        });
      }
      const jumpAssist = beginPlaybackJumpAssist(GLOBALS, requestState);
      requestState.playbackJumpAssist = jumpAssist.captureJumpWindow === true;
      requestState.allowEarlyJumpBudgetRelaxation = jumpAssist.allowDeepRangeBudgetRelaxation === true;
      const useStartupMediaFastPath = shouldUseStartupMediaFastPath(requestState);
      const useContinuationMediaFastPath = !useStartupMediaFastPath && shouldUseContinuationMediaFastPath(requestState);
      let upstreamState = useStartupMediaFastPath ? await dispatchStartupMediaUpstream({
        request,
        requestState,
        context,
        diagnostics
      }) : useContinuationMediaFastPath ? await dispatchContinuationMediaUpstream({
        request,
        requestState,
        context,
        diagnostics
      }) : await dispatchUpstream({
        request,
        requestState,
        context,
        diagnostics
      });
      if (upstreamState.requestState) {
        requestState = upstreamState.requestState;
      }
      if (upstreamState.errorResponse) {
        rememberPlaybackSessionFailure(GLOBALS, context, requestState, upstreamState.errorResponse, diagnostics);
        return finalizeDiagnostics(GLOBALS, upstreamState.errorResponse, diagnostics, request);
      }
      ({ requestState, upstreamState } = await applyFallbackStrategy({
        request,
        requestState,
        context,
        upstreamState,
        diagnostics
      }));
      if (upstreamState.errorResponse) {
        rememberPlaybackSessionFailure(GLOBALS, context, requestState, upstreamState.errorResponse, diagnostics);
        return finalizeDiagnostics(GLOBALS, upstreamState.errorResponse, diagnostics, request);
      }
      rememberPlaybackSessionFailure(GLOBALS, context, requestState, upstreamState.response, diagnostics);
      if (shouldUseIndependentImagePath(requestState)) {
        return await rewriteIndependentImageResponse({
          request,
          requestState,
          context,
          response: upstreamState.response,
          diagnostics,
          executionContext
        });
      }
      return await rewriteProxyResponse({
        request,
        requestState,
        context,
        response: upstreamState.response,
        diagnostics,
        executionContext,
        upstreamState
      });
    } catch (err) {
      return buildHandleErrorResponse(request, err, finalOrigin, activeDiagnostics);
    }
  }
};
function splitCsvValues(value, transform = (item) => item) {
  return String(value || "").split(",").map((item) => transform(String(item || "").trim())).filter(Boolean);
}
function resolveCorsOrigin(runtimeConfig, request) {
  const reqOrigin = request?.headers?.get?.("Origin");
  const allowedOrigins = splitCsvValues(runtimeConfig?.corsOrigins);
  if (allowedOrigins.length > 0) {
    return reqOrigin && allowedOrigins.includes(reqOrigin) ? reqOrigin : allowedOrigins[0];
  }
  return reqOrigin || "*";
}
function buildEdgePolicyHeaders(request, originOverride = null, extra = {}) {
  const headers = new Headers({
    "Cache-Control": "no-store",
    ...extra
  });
  applyBaseProxySecurityHeaders(headers);
  applyProxyCorsHeaders(headers, request, originOverride);
  return headers;
}
function buildPlaybackStopGuardKey(contextPath, playSessionId) {
  const site = String(contextPath || "").trim();
  const session = String(playSessionId || "").trim();
  if (!site || !session) return "";
  return `${site}|${session}`;
}
function prunePlaybackSessionStopGuard(globals, now = Date.now()) {
  for (const [key, entry] of globals.PlaybackSessionStopGuard.entries()) {
    if (!entry || now - Number(entry.updatedAt || entry.recentFailureAt || 0) > PLAYBACK_STOP_GUARD_TTL_MS) {
      globals.PlaybackSessionStopGuard.delete(key);
    }
  }
}
async function readPlaybackSessionLifecyclePayload(request, path) {
  const method = String(request?.method || "").toUpperCase();
  if (method !== "POST") return null;
  const lowerPath = String(path || "").toLowerCase();
  let eventType = "";
  if (lowerPath.includes("/sessions/playing/progress")) {
    eventType = "progress";
  } else if (lowerPath.includes("/sessions/playing/stopped")) {
    eventType = "stopped";
  } else {
    return null;
  }
  const contentType = String(request?.headers?.get?.("Content-Type") || "").toLowerCase();
  if (!contentType.includes("application/json")) return null;
  try {
    const payload = await request.clone().json();
    return {
      eventType,
      playSessionId: String(payload?.PlaySessionId || payload?.PlaySessionID || "").trim(),
      positionTicks: Number(payload?.PositionTicks || 0) || 0,
      runTimeTicks: Number(payload?.RunTimeTicks || 0) || 0
    };
  } catch (_) {
    return null;
  }
}
function rememberPlaybackSessionProgress(globals, context, payload, now = Date.now()) {
  const key = buildPlaybackStopGuardKey(context?.path, payload?.playSessionId);
  if (!key) return;
  const previous = globals.PlaybackSessionStopGuard.get(key) || {};
  globals.PlaybackSessionStopGuard.set(key, {
    ...previous,
    lastProgressAt: now,
    lastRunTimeTicks: Number(payload?.runTimeTicks || 0) || Number(previous.lastRunTimeTicks || 0) || 0,
    lastPositionTicks: Number(payload?.positionTicks || 0) || 0,
    updatedAt: now
  });
}
function shouldTrackPlaybackStopGuardFailure(requestState, response) {
  if (requestState?.isBigStream !== true) return false;
  const range = parseSingleByteRangeHeader(requestState?.rangeHeader);
  if (!range || range.start <= 0) return false;
  const status = Number(response?.status) || 0;
  return status >= 500;
}
function rememberPlaybackSessionFailure(globals, context, requestState, response, diagnostics, now = Date.now()) {
  if (!shouldTrackPlaybackStopGuardFailure(requestState, response)) return;
  const playSessionId = String(
    requestState?.requestUrl?.searchParams?.get?.("PlaySessionId") || requestState?.requestUrl?.searchParams?.get?.("PlaySessionID") || ""
  ).trim();
  const key = buildPlaybackStopGuardKey(context?.path, playSessionId);
  if (!key) return;
  const previous = globals.PlaybackSessionStopGuard.get(key) || {};
  globals.PlaybackSessionStopGuard.set(key, {
    ...previous,
    recentFailureAt: now,
    failureStatus: Number(response?.status) || 0,
    failureRoute: String(diagnostics?.route || "").trim(),
    updatedAt: now
  });
}
function shouldSuppressPlaybackStopped(globals, context, payload, now = Date.now()) {
  const key = buildPlaybackStopGuardKey(context?.path, payload?.playSessionId);
  if (!key) return false;
  const entry = globals.PlaybackSessionStopGuard.get(key);
  if (!entry) return false;
  if (now - Number(entry.recentFailureAt || 0) > PLAYBACK_STOP_GUARD_TTL_MS) {
    globals.PlaybackSessionStopGuard.delete(key);
    return false;
  }
  const runtimeTicks = Math.max(
    Number(payload?.runTimeTicks || 0) || 0,
    Number(entry.lastRunTimeTicks || 0) || 0
  );
  const positionTicks = Number(payload?.positionTicks || 0) || 0;
  if (runtimeTicks <= 0 || positionTicks <= 0) return false;
  return positionTicks >= runtimeTicks;
}
async function maybeHandlePlaybackSessionStopGuard({ globals, request, path, context, finalOrigin }) {
  const payload = await readPlaybackSessionLifecyclePayload(request, path);
  if (!payload?.playSessionId) return null;
  const now = Date.now();
  prunePlaybackSessionStopGuard(globals, now);
  if (payload.eventType === "progress") {
    rememberPlaybackSessionProgress(globals, context, payload, now);
    return null;
  }
  if (!shouldSuppressPlaybackStopped(globals, context, payload, now)) {
    return null;
  }
  globals.PlaybackSessionStopGuard.delete(buildPlaybackStopGuardKey(context?.path, payload.playSessionId));
  return new Response(null, {
    status: 204,
    headers: buildEdgePolicyHeaders(request, finalOrigin, {
      "X-Proxy-Route": "playback-stop-guard"
    })
  });
}
function evaluateFirewall(request, runtimeConfig, finalOrigin) {
  const clientIp = request?.headers?.get?.("cf-connecting-ip") || "unknown";
  const country = String(request?.cf?.country || "UNKNOWN").toUpperCase();
  const ipBlacklist = splitCsvValues(runtimeConfig?.ipBlacklist);
  if (ipBlacklist.includes(clientIp)) {
    return new Response("Forbidden by IP Firewall", {
      status: 403,
      headers: buildEdgePolicyHeaders(request, finalOrigin)
    });
  }
  const geoAllow = splitCsvValues(runtimeConfig?.geoAllowlist, (item) => item.toUpperCase());
  const geoBlock = splitCsvValues(runtimeConfig?.geoBlocklist, (item) => item.toUpperCase());
  if (geoAllow.length > 0 && !geoAllow.includes(country) || geoBlock.length > 0 && geoBlock.includes(country)) {
    return new Response("Forbidden by Geo Firewall", {
      status: 403,
      headers: buildEdgePolicyHeaders(request, finalOrigin)
    });
  }
  return null;
}
function applyRateLimit(globals, request, requestState, runtimeConfig, finalOrigin) {
  const rpmLimit = Math.max(0, Math.floor(Number(runtimeConfig?.rateLimitRpm) || 0));
  const shouldRateLimit = rpmLimit > 0 && !(requestState?.isManifest || requestState?.isSegment || requestState?.isMetadataPrewarm || requestState?.isBigStream);
  if (!shouldRateLimit) {
    return null;
  }
  const clientIp = request?.headers?.get?.("cf-connecting-ip") || "unknown";
  const now = Date.now();
  let entry = globals.RateLimitCache.get(clientIp);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + 6e4 };
  }
  entry.count += 1;
  globals.RateLimitCache.delete(clientIp);
  globals.RateLimitCache.set(clientIp, entry);
  if (entry.count > rpmLimit) {
    return new Response("Rate Limit Exceeded", {
      status: 429,
      headers: buildEdgePolicyHeaders(request, finalOrigin)
    });
  }
  return null;
}
function buildHandleErrorResponse(request, error, originOverride = null, diagnostics = null) {
  if (error?.message === "目标地址格式错误") {
    const headers2 = buildEdgePolicyHeaders(request, originOverride, {
      "X-Proxy-Route": diagnostics?.route || "passthrough"
    });
    return new Response("Invalid Node Target", { status: 502, headers: headers2 });
  }
  const headers = buildEdgePolicyHeaders(request, originOverride, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Proxy-Route": diagnostics?.route || "passthrough"
  });
  return new Response(
    JSON.stringify({ error: "Bad Gateway", code: 502, message: "All proxy attempts failed." }),
    { status: 502, headers }
  );
}

// src/storage/import-export.js
init_runtime_state();
init_node_model();
async function invalidateStoredNodeCache(path) {
  GLOBALS.NodeCache.delete(path);
  await caches.default.delete(`https://internal-config-cache/node/${path}`);
  await clearCachedNodeState(GLOBALS, path);
}
async function saveAdminNodesPayload(data, env) {
  const nodesToSave = data.action === "save" ? [data] : Array.isArray(data.nodes) ? data.nodes : [];
  const { nodes: normalizedNodesToSave, error } = prepareNodesForStorage(nodesToSave);
  if (error) {
    return {
      success: false,
      status: 400,
      error
    };
  }
  if (data.action === "save" && normalizedNodesToSave.length === 1) {
    const newPath = normalizedNodesToSave[0].path;
    const oldPath = String(data.editing || "").trim();
    const available = await isStoredNodePathAvailable(env, newPath, oldPath);
    if (!available) {
      return {
        success: false,
        status: 409,
        error: "站点路径已存在"
      };
    }
  }
  await writeStoredNodes(env, normalizedNodesToSave, {
    previousPath: data.action === "save" ? data.editing : "",
    invalidate: invalidateStoredNodeCache
  });
  if (data.action === "import" && data.config && typeof data.config === "object" && !Array.isArray(data.config)) {
    await writeRuntimeConfig(env, data.config);
  }
  return {
    success: true,
    status: 200
  };
}
async function deleteAdminNodesPayload(data, env) {
  const names = data.action === "delete" ? [data.path || data.name] : Array.isArray(data.paths) ? data.paths : Array.isArray(data.names) ? data.names : [];
  await deleteStoredNodes(env, names, invalidateStoredNodeCache);
  return {
    success: true,
    status: 200
  };
}
async function listAdminNodesPayload(env) {
  const nodes = await listStoredNodes(env);
  const nodePaths = Array.from(new Set((Array.isArray(nodes) ? nodes : []).map((node) => String(node?.path || node?.name || "").trim()).filter(Boolean)));
  const nodeActivity = await readRecentNodeUsageMap(GLOBALS, nodePaths, {
    // Avoid doubling admin list subrequests on larger deployments.
    allowStorageReads: nodePaths.length <= 20
  });
  return {
    success: true,
    status: 200,
    nodes,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    nodeActivityAvailable: Object.keys(nodeActivity).length > 0,
    nodeActivity
  };
}

// src/app/admin-routes.js
init_page();
function jsonResponse2(value, init = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(value), {
    ...init,
    headers
  });
}
async function readAdminApiPayload(request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > Config.Defaults.AdminApiMaxBodyBytes) {
    return {
      errorResponse: jsonResponse2({ error: "请求体过大" }, { status: 413 })
    };
  }
  let data;
  try {
    data = await request.json();
  } catch (_) {
    return {
      errorResponse: jsonResponse2({ error: "请求体必须为 JSON" }, { status: 400 })
    };
  }
  if (!data || typeof data !== "object" || Array.isArray(data) || typeof data.action !== "string") {
    return {
      errorResponse: jsonResponse2({ error: "无效请求参数" }, { status: 400 })
    };
  }
  return { data };
}
async function handleAdminApiAction(data, { request, env }) {
  const kv = Auth.getKV(env);
  if (!kv) {
    return jsonResponse2({ error: "KV未绑定! 请检查变量名是否为 ENI_KV 或 KV" }, { status: 500 });
  }
  switch (data.action) {
    case "loadConfig":
      return jsonResponse2(await readRuntimeConfig(env));
    case "saveConfig":
      if (data.config) {
        await writeRuntimeConfig(env, data.config);
      }
      return jsonResponse2({ success: true });
    case "versionStatus":
      return jsonResponse2(await readStoredVersionStatus(env));
    case "tcping": {
      if (typeof data.name === "string" && data.name.trim()) {
        const runtimeConfig = await readRuntimeConfig(env);
        const result = await probeStoredNodeLines(data.name, env, {
          lineId: data.lineId,
          timeoutMs: data.timeout ?? runtimeConfig.pingTimeout,
          cacheMinutes: runtimeConfig.pingCacheMinutes,
          forceRefresh: data.forceRefresh === true || data.force === true,
          silent: data.silent === true,
          invalidate: invalidateStoredNodeCache
        });
        return jsonResponse2(result.body, { status: result.status });
      }
      const { handleTcpProbe: handleTcpProbe2 } = await Promise.resolve().then(() => (init_tcp_probe(), tcp_probe_exports));
      return handleTcpProbe2(data.target, env, request, { force: data.force === true });
    }
    case "cfMetrics":
      return CFAnalytics.handleMetrics(data.rangeKey, env, data.mode, request);
    case "playbackOptimizationStats":
      return jsonResponse2(getPlaybackOptimizationStats(GLOBALS));
    case "cfDnsGetPreferredRecords":
      return CFDns.handleGetPreferredRecords(data, request, env);
    case "cfDnsApplyPreferredRecords":
      return CFDns.handleApplyPreferredRecords(data, request, env);
    case "cfDnsGetCurrentCname":
      return CFDns.handleGetCurrentCname(data, request, env);
    case "cfDnsUpsertCurrentCname":
      return CFDns.handleUpsertCurrentCname(data, request, env);
    case "save":
    case "import": {
      const result = await saveAdminNodesPayload(data, env);
      return jsonResponse2(result.success ? { success: true } : { error: result.error }, { status: result.status });
    }
    case "delete":
    case "batchDelete": {
      const result = await deleteAdminNodesPayload(data, env);
      return jsonResponse2({ success: result.success }, { status: result.status });
    }
    case "list": {
      try {
        const result = await listAdminNodesPayload(env);
        return jsonResponse2({
          nodes: result.nodes,
          generatedAt: result.generatedAt || "",
          nodeActivityAvailable: result.nodeActivityAvailable === true,
          nodeActivity: result.nodeActivity || {}
        }, { status: result.status });
      } catch (error) {
        return jsonResponse2({ error: error.message || "读取节点列表失败" }, { status: 500 });
      }
    }
    case "logout":
      return jsonResponse2({ success: true }, {
        headers: {
          "Set-Cookie": "auth_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict"
        }
      });
    default:
      return new Response("Invalid Action", { status: 400 });
  }
}
async function handleAdminApiRequest(request, env) {
  const { data, errorResponse } = await readAdminApiPayload(request);
  if (errorResponse) return errorResponse;
  return handleAdminApiAction(data, { request, env });
}
async function handleAdminRouteRequest(request, env) {
  const contentType = request.headers.get("content-type") || "";
  if (request.method === "POST" && contentType.includes("form")) {
    return Auth.handleLogin(request, env);
  }
  if (!await Auth.verifyRequest(request, env)) {
    if (request.method === "POST") return new Response("Unauthorized", { status: 401 });
    return UI.renderLoginPage();
  }
  if (request.method === "POST") {
    if (!Auth.verifyAdminPostOrigin(request)) {
      return jsonResponse2({ error: "Forbidden Origin" }, { status: 403 });
    }
    return handleAdminApiRequest(request, env);
  }
  return UI.renderAdminUI();
}

// src/app/proxy-routes.js
init_page();
var WEB_RESTRICTED_STATIC_ASSET = /(?:\/images\/|\/icons\/|\/branding\/|\/emby\/covers\/|\.jpe?g$|\.gif$|\.png$|\.svg$|\.ico$|\.webp$|\.js$|\.css$|\.woff2?$|\.ttf$|\.otf$|\.map$|\.webmanifest$|\.json$|\.srt$|\.ass$|\.vtt$|\.sub$)/i;
async function forwardProxyRequest({
  request,
  nodeData,
  remaining,
  nodePath,
  ctx,
  env
}) {
  const runtimeConfig = await readRuntimeConfig(env);
  return Proxy2.handle(request, nodeData, remaining, nodePath, runtimeConfig, ctx, env);
}
function buildProxyPrefix(nodePath) {
  const encodedNodePath = encodeURIComponent(String(nodePath || ""));
  return `/${encodedNodePath}`;
}
function buildRemainingPath(request, strip) {
  const url = new URL(request.url);
  let cursor = 0;
  for (let i = 0; i < strip; i++) {
    if (url.pathname[cursor] === "/") cursor += 1;
    const nextSlash = url.pathname.indexOf("/", cursor);
    if (nextSlash === -1) {
      cursor = url.pathname.length;
      break;
    }
    cursor = nextSlash;
  }
  let remaining = cursor >= url.pathname.length ? "/" : url.pathname.slice(cursor) || "/";
  if (url.pathname.endsWith("/") && remaining !== "/" && !remaining.endsWith("/")) {
    remaining += "/";
  }
  return remaining || "/";
}
function maybeHandleRestrictedWebAccess(request, remaining) {
  const lowerPath = remaining.toLowerCase();
  const isStaticAsset = WEB_RESTRICTED_STATIC_ASSET.test(lowerPath);
  const isWebClient = lowerPath.startsWith("/web") && !lowerPath.includes("/emby/ping") && !lowerPath.includes("/emby/system/info") && !isStaticAsset;
  if (!isWebClient) return null;
  const url = new URL(request.url);
  const cookie = request.headers.get("Cookie") || "";
  if (url.searchParams.get("backup") === "1") {
    url.searchParams.delete("backup");
    return new Response(null, {
      status: 302,
      headers: {
        "Location": url.toString(),
        "Set-Cookie": "emby_web_bypass=1; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax"
      }
    });
  }
  if (cookie.includes("emby_web_bypass=1")) return null;
  const backupUrl = new URL(request.url);
  backupUrl.searchParams.set("backup", "1");
  const body = `
            <div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;text-align:center;padding:20px">
                <div class="panel" style="padding:40px;max-width:420px;box-shadow:0 10px 40px rgba(0,0,0,0.3)">
                    <div style="font-size:48px;margin-bottom:20px">🔒</div>
                    <h2 style="color:var(--t);margin:0 0 10px 0">API 优先模式</h2>
                    <p style="color:var(--ts);font-size:14px;line-height:1.6;margin-bottom:25px">
                        Web 客户端访问已被默认限制。<br>
                            请使用客户端以获得最佳体验。
                    </p>

                    <hr>
                        <a href="${backupUrl.href}" class="btn btn-p" style="display:block;width:100%;text-decoration:none;padding:12px;box-sizing:border-box">
                            启用 Web 备用模式 (24小时) </a>
                </div>
            </div>`;
  return new Response(UI.getHead("Web Access Restricted").replace("${body}", body), {
    status: 403,
    headers: { "Content-Type": "text/html;charset=utf-8" }
  });
}
async function handleProxyNodeRequest({
  request,
  nodePath = "",
  nodeName = "",
  segments = [],
  env,
  ctx
}) {
  const resolvedNodePath = String(nodePath || nodeName || "").trim();
  const nodeData = await getStoredNode(resolvedNodePath, env, ctx);
  if (!nodeData) return null;
  const remaining = buildRemainingPath(request, 1);
  if (remaining === "/" && request.method === "GET") {
    const prefix = buildProxyPrefix(resolvedNodePath);
    return new Response(null, {
      status: 302,
      headers: { "Location": `${prefix}/web/index.html` }
    });
  }
  const restrictedResponse = maybeHandleRestrictedWebAccess(request, remaining);
  if (restrictedResponse) return restrictedResponse;
  return forwardProxyRequest({
    request,
    nodeData,
    remaining,
    nodePath: resolvedNodePath,
    ctx,
    env
  });
}

// src/probes/rtt-probe.js
function handleClientRttProbe() {
  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

// src/integrations/version-check.js
init_version();
async function fetchRemoteWorkerVersion(fetchImpl = fetch) {
  const rawUrl = buildGitHubWorkerDistRawUrl(
    GITHUB_REPOSITORY_URL,
    GITHUB_REPOSITORY_BRANCH,
    GITHUB_REPOSITORY_DIST_PATH
  );
  if (!rawUrl) {
    throw new Error("仓库地址配置无效");
  }
  const response = await fetchImpl(rawUrl, {
    method: "GET",
    headers: {
      Accept: "application/javascript, text/plain;q=0.9, */*;q=0.1",
      "Cache-Control": "no-cache"
    }
  });
  if (!response.ok) {
    throw new Error(`GitHub 返回异常状态 ${response.status}`);
  }
  const source = await response.text();
  const remoteVersion = parseWorkerVersionFromSource(source);
  if (!remoteVersion) {
    throw new Error("未能解析仓库 dist/worker.js 版本");
  }
  return {
    remoteVersion,
    rawUrl
  };
}
async function compareRepositoryWorkerVersion({
  fetchImpl = fetch,
  now = /* @__PURE__ */ new Date()
} = {}) {
  const checkedAt = now instanceof Date ? now.toISOString() : new Date(now).toISOString();
  try {
    const { remoteVersion } = await fetchRemoteWorkerVersion(fetchImpl);
    const comparison = compareVersions(WORKER_VERSION, remoteVersion);
    return normalizeVersionStatusRecord({
      currentVersion: WORKER_VERSION,
      remoteVersion,
      status: comparison < 0 ? "update-available" : "equal",
      checkedAt,
      error: "",
      repositoryUrl: GITHUB_REPOSITORY_URL,
      repositoryBranch: GITHUB_REPOSITORY_BRANCH,
      repositoryDistPath: GITHUB_REPOSITORY_DIST_PATH
    });
  } catch (error) {
    return normalizeVersionStatusRecord({
      currentVersion: WORKER_VERSION,
      remoteVersion: "",
      status: "error",
      checkedAt,
      error: error?.message || "版本检查失败",
      repositoryUrl: GITHUB_REPOSITORY_URL,
      repositoryBranch: GITHUB_REPOSITORY_BRANCH,
      repositoryDistPath: GITHUB_REPOSITORY_DIST_PATH
    });
  }
}
async function runScheduledVersionCheck(env, options = {}) {
  const result = await compareRepositoryWorkerVersion(options);
  await writeStoredVersionStatus(env, result);
  return result;
}

// src/app/worker-routes.js
function decodePathSegments(pathname = "/") {
  return String(pathname || "/").split("/").filter(Boolean).map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch (_) {
      return segment;
    }
  });
}
async function handleWorkerRequest(request, env, ctx) {
  const url = new URL(request.url);
  if (url.pathname === "/__client_rtt__") {
    return handleClientRttProbe();
  }
  const segments = decodePathSegments(url.pathname);
  const root = segments[0];
  if (root === "admin") {
    return handleAdminRouteRequest(request, env);
  }
  if (root) {
    const response = await handleProxyNodeRequest({
      request,
      nodePath: root,
      segments,
      env,
      ctx
    });
    if (response) return response;
  }
  return new Response("Not Found", { status: 404 });
}
async function handleWorkerScheduled(controller, env, ctx) {
  const now = controller?.scheduledTime ? new Date(controller.scheduledTime) : /* @__PURE__ */ new Date();
  const task = runScheduledVersionCheck(env, { now });
  ctx?.waitUntil?.(task);
  return task;
}

// src/worker-entry.js
var worker_entry_default = {
  async fetch(request, env, ctx) {
    return handleWorkerRequest(request, env, ctx);
  },
  async scheduled(controller, env, ctx) {
    return handleWorkerScheduled(controller, env, ctx);
  }
};
export {
  worker_entry_default as default
};
