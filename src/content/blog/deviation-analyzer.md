---
title: "电站偏差分析工具"
description: "基于 Python Flask + PyWebView + ECharts 的 HIL/PSCAD 电力系统仿真偏差分析桌面应用全流程技术分解"
pubDate: "Jun 1 2026"
heroImage: "/blog/deviation-analyzer/02.png"
badge: "项目"
tags: ["项目", "教程", "Python", "电力系统"]
---

# 偏差分析工具 (deviation-analyzer) 全流程技术分解

> 一个基于 Python Flask + PyWebView + ECharts 的 HIL/PSCAD 电力系统仿真偏差分析桌面应用

![工具主界面](/blog/deviation-analyzer/01.png)

---

## 一、项目背景与需求

### 1.1 做什么的？

在光伏逆变器等电力电子设备的研发验证中，有两套仿真体系：

- **HIL（Hardware-in-the-Loop，硬件在环仿真）**：将真实控制器接入实时仿真器，得到的是"半实物"数据
- **PSCAD（纯数字离线仿真）**：完全在计算机中建模运算，得到的是"纯数字"数据

两者对同一工况的仿真结果必然存在偏差。这个工具的核心任务就是：

> **输入一对 HIL 和 PSCAD 的时域波形 CSV，自动对齐时间轴、识别故障区间、计算各区间偏差、按国标判定合格/不合格，最后生成带图表截图的 Excel 报告。**

### 1.2 技术选型

| 层级   | 选型                         |  理由                                                                   |
| ------ | ----------------------------| ---------------------------------------------------------------------- |
| 后端   | Python 3.14 + Flask         | 数据处理（插值、统计算法）用 Python 生态写起来最快                         |
| 数据库 | SQLite3 (WAL 模式)           | 单机桌面工具无需独立数据库服务，WAL 保证读写并发                           |
| 前端   | 原生 HTML/CSS/JS + ECharts 5 | 无 Node.js 构建系统，零依赖编译，直接内联写在一个 HTML 文件里              |
| 桌面壳 | PyWebView                    | 用系统原生 WebView (Edge Chromium) 套 Flask 页面，省去 Electron 的体积   |
| 打包   | PyInstaller                  | 单文件 exe（27.8 MB），附带启动动画 MP4 和自定义图标                      |

**为什么不选 Electron？** 因为 Python 生态做数据处理（NumPy 级别）比 Node.js 舒服得多，而 PyWebView 可以直接复用系统自带的 Edge WebView2，不需要打包整个 Chromium。

---

## 二、架构全景
```
┌─────────────────────────────────────────────────────────────────┐
│                        PyInstaller                              │
│  ┌───────────────────────────────────────────────────────────┐  │ 
│  │                      PyWebView                            │  │ 
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              Edge Chromium WebView                  │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │         Flask  (127.0.0.1:5000)               │  │  │  │
│  │  │  │  ┌─────────┐ ┌─────────┐ ┌─────────────────┐  │  │  │  │
│  │  │  │  │ compare │ │ records │ │ stats │ limits  │  │  │  │  │
│  │  │  │  │  Blue   │ │  Blue   │ │ Blue  │ Blue    │  │  │  │  │
│  │  │  │  └────┬────┘ └────┬────┘ └───┬───┴───┬─────┘  │  │  │  │
│  │  │  │       └───────────┴──────────┴───────┘        │  │  │  │
│  │  │  │                    │ SQLite3                  │  │  │  │
│  │  │  │              data/database.db                 │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  │                                                     │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │          SPA (index.html~1700)                │  │  │  │
│  │  │  │  ┌──────────┐ ┌───────────┐  ┌─────────────┐  │  │  │  │
│  │  │  │  │ 波形对比）│ │单工况分析）│  │  跨工况对比  │  │  │  │  │
│  │  │  │  │ (tab1)   │ │ (tab2)    │  │  (tab3)     │  │  │  │  │
│  │  │  │  └──────────┘ └───────────┘  └─────────────┘  │  │  │  │
│  │  │  │  ┌──────────┐ ┌─────────────────────────┐     │  │  │  │
│  │  │  │  │ 阈值管理）│ │  数据管理 (含导入/删除））|     │  │  │  │
│  │  │  │  │ (tab4)   │ │  (tab4)                 |     │  │  │  │
│  │  │  │  └──────────┘ └─────────────────────────┘     │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```
### 启动流程

```
run_app.py
  │
  ├─ 启动守护线程: Flask 在 127.0.0.1:5000 运行
  │    └─ init_db() + seed_data()
  │
  ├─ 创建 PyWebView 窗口, URL 指向 splash.html
  │    └─ 播放启动动画 (2倍速 MP4, 可点击跳过)
  │    └─ 视频结束 → window.location = http://127.0.0.1:5000
  │
  └─ Flask 返回 index.html (完整 SPA)
```

---

## 三、核心算法：波形对比全流程

这是整个工具的灵魂，实现在 `backend/routes/compare.py` 的 `/api/compare/upload` 接口中。

### 3.1 流程概览

```
CSV上传 → 解析 → 统一时间轴 → 线性插值对齐 → 故障区间检测 → 偏差计算 → 落库 → 返回 JSON
```

### 3.2 CSV 解析 (`load_csv_data`)

输入文件格式（HIL 和 PSCAD 各一个）：

```csv
t,U,P,Q,Id,Iq
0.0,1.0,0.5,0.1,0.5,0.1
0.0001,1.0001,0.5005,0.1001,0.5003,0.10005
...
```

- 用 `utf-8-sig` 解码（兼容带 BOM 的 CSV）
- 每行解析为 `{t: float, U: float, P: float, Q: float, Id: float, Iq: float}`

### 3.3 统一时间轴

HIL 和 PSCAD 采样率不同（通常 HIL 更密），需要生成统一的时间轴：

```python
dt = (pscad[-1]['t'] - pscad[0]['t']) / (len(pscad) - 1)  # 用PSCAD的步长
t_start = max(hil[0]['t'], pscad[0]['t'])                  # 取交集
t_end = min(hil[-1]['t'], pscad[-1]['t'])

# 前端绘图最多2000个点
step = max(1, total_points // 2000)
```

**为什么用 PSCAD 的步长而不是 HIL 的？** PSCAD 采样更稀疏，用它做基准步长既保证精度又避免不必要的插值计算。

### 3.4 线性插值 (`interpolate`)

核心技巧：**利用 `lo_hint` 参数做顺序扫描加速**。

因为 `timeline` 是单调递增的，上一个时间点找到的位置大概率是下一个时间点的附近。函数返回 `(插值结果, 下次搜索的起始索引)`，省去每次二分查找的 O(log n) 开销：

```python
def interpolate(data, t, lo_hint=0):
    if t <= data[0]['t']:
        return ..., 0
    if t >= data[-1]['t']:
        return ..., len(data) - 2

    lo = max(0, lo_hint)
    # 顺序向前找
    if data[lo]['t'] <= t:
        while lo + 1 < len(data) and data[lo + 1]['t'] <= t:
            lo += 1
        hi = lo + 1
        # 线性插值
        ratio = (t - t0) / (t1 - t0)
        ...
    else:
        # 回溯到二分查找
        ...
```

### 3.5 故障区间检测 (`detect_intervals`)

这是整个算法中最有领域知识的部分。基于 **HIL 电压的跌落与恢复** 自动划分五个区段：

```
 1.0 ─────────────────────────────────────────────
     │ 前稳态  │ 暂态  │ 故障稳态 │ 暂态 │ 后稳态 │
     │  (A)    │ (B1)  │   (B2)   │ (C1) │  (C2) │
 0.5 ─         ────────                    ───────
     │               ───                   
 0.0 ─               ─────────────────────
     ↑               ↑         ↑         ↑
   t_start        u_min     recovery   t_end
```

**检测步骤：**

1. **找电压跌落点** — HIL 电压 < 0.95 pu 的第一个时刻
2. **向前回溯** — 从跌落点向前找电压偏离 1.0 pu 不超过 0.003 pu 的点（前 500 个采样点内），即故障起点
3. **找最低点** — 从故障起点向后 5000 点范围内找电压最小值（故障稳态中心）
4. **找恢复点** — 从最低点向后找电压 > 0.95 pu 的点
5. **找恢复完成点** — 从恢复点向后找电压回到 1.0 pu ± 0.005 的点（后 1000 点内）
6. **添加 margin** — 各边界加上 0.01~0.05 秒的容差，定义五个区段

**代码细节：**

```python
# 找电压跌落的开始
drop_idx = None
for i in range(n):
    if hil_u[i] < 0.95:
        drop_idx = i
        break

# 向前找起始点 (最多回溯500点)
start_idx = drop_idx
for i in range(drop_idx, max(0, drop_idx - 500), -1):
    if abs(hil_u[i] - u0) < 0.003:
        start_idx = i + 1
        break

# 找电压最低点 (最多向前5000点)
for i in range(start_idx, min(start_idx + 5000, n)):
    if hil_u[i] < u_min:
        u_min = hil_u[i]
        u_min_idx = i
```

最终返回五个区间的定义：

```python
intervals = [
    ('区间A(前稳态)', 0, t_start - 0.05),
    ('区间B1(暂态)',  t_start - 0.01, t_min + 0.03),
    ('区间B2(稳态)',  t_min + 0.03,   t_recover - 0.03),
    ('区间C1(暂态)',  t_recover - 0.03, t_end + 0.03),
    ('区间C2(后稳态)', t_end + 0.03,    timeline[-1]),
]
```

### 3.6 偏差计算

对每个区间，遍历所有参数（U, P, Q, Id, Iq），计算：

- **最大偏差**：`max(|HIL(t) - PSCAD(t)|)` for t in 区间
- **平均偏差**：`avg(|HIL(t) - PSCAD(t)|)` for t in 区间
- **加权偏差**：`(最大偏差 + 平均偏差) / 2`

### 3.7 国标判定

基于 GB/T 32892 定义的四种允许阈值：

| 阈值代号 | 含义             | 适用场景                 |
| -------- | ---------------- | ------------------------ |
| F1max    | 稳态平均允许偏差 | 稳态区间的平均偏差       |
| F2max    | 暂态平均允许偏差 | 暂态区间的平均偏差       |
| F3max    | 稳态最大允许偏差 | 稳态区间的最大偏差       |
| FGmax    | 加权总允许偏差   | 所有区间加权偏差的总判定 |

默认阈值（可在"阈值管理"页面调整）：

| 电气量   | F1max | F2max | F3max | FGmax |
| -------- | ----- | ----- | ----- | ----- |
| 电压     | 0.02  | 0.05  | 0.05  | 0.05  |
| 有功电流 | 0.10  | 0.20  | 0.15  | 0.15  |
| 有功功率 | 0.10  | 0.20  | 0.15  | 0.15  |
| 无功功率 | 0.10  | 0.20  | 0.15  | 0.15  |
| 无功电流 | 0.10  | 0.20  | 0.15  | 0.15  |

---

## 四、后端 API 体系

Flask Blueprint 路由结构：

```
/api/compare/upload    POST   — 上传一对CSV, 返回完整对比结果
/api/records           GET    — 分页查询偏差记录 (支持按工况/区间/类型筛选)
/api/records           POST   — 新增单条记录
/api/records/<id>      PUT    — 更新单条记录
/api/records/<id>      DELETE — 删除单条记录
/api/records/test_cases GET   — 获取所有工况名称列表
/api/records/intervals  GET   — 获取所有区间名称列表
/api/records/export     GET   — 导出CSV
/api/records/import     POST  — 导入CSV
/api/stats/summary     GET    — 统计概览 (含超限计数)
/api/stats/comparison  GET    — 跨工况对比 (支持多选)
/api/stats/heatmap     GET    — 热力图数据
/api/limits            GET    — 获取允许阈值
/api/limits            PUT    — 批量更新允许阈值
/api/limits/check      POST   — 执行超限检查
```

---

## 五、前端 SPA 架构

### 5.1 单文件设计

整个前端压缩在 `index.html` 一个文件中（约 1693 行），包含：

- **内联 CSS（~125 行）**：CSS 变量、卡片组件、表格、弹窗、响应式
- **内联 JS（~1360 行）**：Tab 路由、四个功能模块、ECharts 图表、XLSX 导出

这样做的好处：无需 webpack/vite 构建，直接打开即用；PyInstaller 打包时只需包含一个 HTML 文件。

### 5.2 懒加载策略

ECharts、SheetJS、JSZip 三个大库均为懒加载：

```javascript
function loadEcharts(cb) {
    if (typeof echarts !== 'undefined') { cb(); return; }
    var s = document.createElement('script');
    s.src = '/lib/echarts.min.js';
    s.onload = cb;
    document.head.appendChild(s);
}
```

首次打开时只加载 HTML 骨架，进入对应 Tab 时才按需加载 JS 库。

### 5.3 四个功能模块

| 模块           | Tab ID           | 核心功能                                                                                                    |
| -------------- | ---------------- | ----------------------------------------------------------------------------------------------------------- |
| **波形对比**   | `tab-compare`    | 文件拖拽上传 → 双曲线图 + 区间背景色 + 标记线 → 偏差统计卡片 → 合格判定表 → 一键导出 XLSX（6个Sheet含截图） |
| **单工况分析** | `tab-analysis`   | 柱状图对比 + 雷达图 + 趋势折线 + 热力图 + 暂态vs稳态箱线图 + 原始数据表                                     |
| **跨工况对比** | `tab-comparison` | 多工况柱状图/折线图/热力图/数据对比表                                                                       |
| **阈值管理**   | `tab-limits`     | 允许偏差阈值编辑 + 超限检查 + 数据管理（打开/删除）                                                         |

![波形对比界面](/blog/deviation-analyzer/02.png)

![单工况分析](/blog/deviation-analyzer/03.png)

### 5.4 ECharts 图表技巧

**波形对比图** 包含了几个精妙的设计：

1. **区间背景色** — 用 `markArea` 为五个区间染上不同颜色（绿/橙/红/橙/绿）
2. **区间分界线** — 用 `markLine` 在每个区间边界画虚线
3. **区间名标注** — 在区间底部居中显示简化的区间名
4. **ECharts 内置缩放** — `dataZoom` 组件支持滚轮缩放 X 轴 + 底部滑块调范围
5. **双击还原** — 监听 `dblclick` 事件 dispatch `restore` action

```javascript
markArea: {
    silent: true,
    data: ints.map(function(iv) {
        return [
            {xAxis: iv.start, itemStyle: {color: INTV_COLORS[iv.name]}},
            {xAxis: iv.end}
        ];
    })
}
```

![跨工况对比](/blog/deviation-analyzer/04.png)

### 5.5 XLSX 导出实现

一键导出是最复杂的前端功能，生成 6 个 Sheet 的 Excel：

1. **偏差分析汇总** — 各区间、各参数的最大/平均/加权偏差 + 合格判定
2. **5 个参数独立 Sheet** — 各自的波形数据表 + ECharts 生成的 PNG 图表截图嵌入

**图表截图嵌入 XLSX 的核心技巧**：

```javascript
// 1. 切换参数 → 等待图表渲染完成
cmpParam = k;
cmpChart.on('finished', handler);
cmpDrawChart();

// 2. 获取 PNG DataURL
var imgUrl = cmpChart.getDataURL({type: 'png', pixelRatio: 2, backgroundColor: '#fff'});

// 3. 用 JSZip 手动将 PNG 写入 XLSX 的 Open XML 结构中
//    修改 xl/drawings/drawingN.xml + xl/worksheets/_rels/sheetN.xml.rels
//    更新 [Content_Types].xml 注册 PNG 和 drawing
```

这个实现绕过了 SheetJS 原生不支持插入图片的限制，直接操作 XLSX 内部的 Open XML ZIP 结构。

![阈值管理与数据管理](/blog/deviation-analyzer/05.png)

### 5.6 PyWebView 桥接

前端通过 `window.pywebview.api` 调用 Python 后端能力：

```javascript
// 保存文件 (弹系统原生保存对话框)
await window.pywebview.api.save_file(b64data, 'report.xlsx');

// 检测 X 按钮关闭
window.pywebview.api.is_closing();  // → 弹出确认对话框

// 确认退出
window.pywebview.api.do_exit();
```

Python 端实现（`run_app.py` 的 `JsApi` 类）：

```python
class JsApi:
    def save_file(self, data_b64, default_name='export.xlsx'):
        result = webview.windows[0].create_file_dialog(
            webview.SAVE_DIALOG, save_filename=default_name
        )
        if result:
            with open(result, 'wb') as f:
                f.write(base64.b64decode(data_b64))
            return 'ok'
```

### 5.7 退出确认机制

PyWebView 的 `confirm_close=False` 配合 JS 轮询实现优雅退出：

```python
# Python: 设置 confirm_close=False，阻止直接关闭
window = webview.create_window(..., confirm_close=False)

def on_closing():
    if _exit_ok:
        return True   # 允许关闭
    api._closing = True  # 通知前端弹窗
    return False         # 阻止关闭
```

```javascript
// JS: 每300ms轮询 is_closing()
setInterval(function() {
    window.pywebview.api.is_closing().then(function(result) {
        if (result) {
            // 显示确认弹窗 → 用户点"确认退出" → do_exit()
            document.getElementById('exit-confirm-overlay').classList.add('active');
        }
    });
}, 300);
```

---

## 六、数据库设计

```sql
-- 偏差记录表
CREATE TABLE deviation_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_case TEXT NOT NULL,       -- 工况名称 (从文件名提取)
    interval_name TEXT NOT NULL,    -- 区间名 (如"区间B2(稳态)")
    deviation_type TEXT NOT NULL,   -- 类型: 最大偏差/平均偏差/加权偏差
    voltage REAL,                   -- 电压偏差值
    active_current REAL,            -- 有功电流偏差值
    active_power REAL,              -- 有功功率偏差值
    reactive_power REAL,            -- 无功功率偏差值
    reactive_current REAL,          -- 无功电流偏差值
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 允许阈值表 (种子数据)
CREATE TABLE allowable_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    param_name TEXT NOT NULL UNIQUE,  -- 电压/有功电流/有功功率/无功功率/无功电流
    F1_max REAL,                     -- 稳态平均允许值
    F2_max REAL,                     -- 暂态平均允许值
    F3_max REAL,                     -- 稳态最大允许值
    FG_max REAL                      -- 加权总偏差允许值
);
```

每次上传对比后，每个区间 × 每种偏差类型 × 5 个参数 = 最多 5区间 × 3类型 = 15 条记录（加上"整体"区间则是 17 条）。插入前先 `DELETE` 同名工况旧数据，避免重复累积。

---

## 七、打包与分发

### PyInstaller 配置

```python
# 偏差分析工具.spec
a = Analysis(
    ['run_app.py'],
    datas=[
        ('frontend', 'frontend'),          # 前端文件打包进 exe
        ('backend', 'backend'),            # 后端代码打包
    ],
    ...
)
```

### 路径兼容处理

打包后 `sys._MEIPASS` 指向解压目录，开发时用 `__file__` 相对路径：

```python
if getattr(sys, 'frozen', False):
    BASE_DIR = sys._MEIPASS           # PyInstaller
    DB_DIR = os.path.join(sys.executable, 'data')  # exe同目录
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # 源码目录
    DB_DIR = os.path.join(BASE_DIR, 'data')
```

### 启动动画

`splash.html` 嵌入 MP4 视频，以 2 倍速播放，点击跳过或播完自动进入主界面。有 30 秒超时保护防止卡住。

---

## 八、项目结构总览

```
deviation-analyzer/
├── run_app.py                     # 入口: 启动Flask线程 + PyWebView窗口
├── 偏差分析工具.spec               # PyInstaller配置
├── 偏差分析工具.exe                # 编译产物 (27.8 MB)
├── data/
│   └── database.db                # SQLite运行时数据
├── build/                         # PyInstaller中间产物
├── backend/
│   ├── app.py                     # Flask应用 (Blueprint注册 + 静态文件路由)
│   ├── database.py                # SQLite初始化、建表、种子数据
│   ├── routes/
│   │   ├── compare.py             # 波形上传分析API (插值+区间检测+偏差计算)
│   │   ├── records.py             # 偏差记录CRUD + CSV导入导出
│   │   ├── stats.py               # 统计摘要 + 对比分组 + 热力图
│   │   └── limits.py              # 阈值管理 + 超限检查
│   └── utils/
│       ├── compare_csv.py         # 命令行版对比脚本 (可独立运行)
│       └── batch_compare.py       # 批量对比脚本 (自动配对hil/pscad文件)
└── frontend/
    ├── splash.html                # 启动动画页
    ├── index.html                 # 主应用SPA (~1700行)
    ├── assets/
    │   ├── splash-animation.mp4   # 启动视频
    │   ├── app.ico
    │   └── logo.png
    ├── lib/
    │   ├── echarts.min.js         # ECharts 5
    │   ├── xlsx.full.min.js       # SheetJS
    │   └── jszip.min.js           # JSZip
    ├── pages/                     # 早期独立页面 (已弃用)
    ├── js/                        # 早期独立JS (已弃用)
    └── css/                       # 早期独立CSS (已弃用)
```

![项目文件结构](/blog/deviation-analyzer/06.png)

---

## 九、设计亮点

1. **顺序索引加速插值** — `interpolate()` 的 `lo_hint` 参数让每次插值从上次找到的位置继续搜索，将平均复杂度从 O(n·log n) 降到 O(n)

2. **自动故障区间检测** — 不用手动标注区间，仅靠算法自动识别电压跌落/恢复的五个阶段

3. **区间手动微调** — 自动检测后可打开"区间设置"弹窗手动修改边界时间，修改后前端本地重算偏差（不走后端），响应即时

4. **单文件 SPA** — 所有 CSS/JS 内联在一个 HTML 中，零构建步骤，PyInstaller 打包无烦恼

5. **XLSX 图表截图嵌入** — 直接操作 Open XML ZIP 结构将 ECharts 的 PNG 截图嵌入 Excel 的各个 Sheet，绕过 SheetJS 能力边界

6. **懒加载大型依赖** — ECharts/SheetJS/JSZip 三个大库按需加载，首屏只渲染 HTML+CSS

7. **离线命令行工具** — `compare_csv.py` 和 `batch_compare.py` 可脱离 GUI 直接在命令行批量处理

8. **PyWebView 优雅退出** — `confirm_close=False` + JS 轮询 + 确认弹窗，防止误关闭导致数据丢失

![导出报告预览](/blog/deviation-analyzer/07.png)

---

## 十、可改进方向

- **添加 Git 版本控制** — 当前无版本管理
- **测试覆盖** — 目前无自动化测试，对 CSV 解析和区间检测逻辑尤其需要单元测试
- **PSCAD 高密度数据性能** — 当前限制 2000 个绘图点，超大数据集可考虑 Web Worker 做插值
- **支持更多文件格式** — COMTRADE (.cfg/.dat) 是电力行业标准格式，值得支持
- **区间检测鲁棒性** — 当前算法依赖硬编码阈值 (0.95, 0.003, 0.005)，对非标工况可能失效
