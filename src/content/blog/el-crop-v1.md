---
title: "光伏组件EL裁剪工具"
description: "基于实际项目源码的案例分析教程，详解EL太阳能电池板检测中的计算机视觉、Flask后端和工程部署"
pubDate: "May 20 2026"
heroImage: "/blog/el-crop-v1/webpe.png"
badge: "教程"
tags: ["项目", "教程", "Python"]
---

# 光伏组件EL裁剪工具

> 基于实际项目源码的案例分析教程
> 项目路径：[`EL裁剪工具/`](https://github.com/AChengLinus/EL_cropped)

---

## 目录

1. [项目背景与业务需求](#1-项目背景与业务需求)
2. [整体架构概览](#2-整体架构概览)
3. [目录结构详解](#3-目录结构详解)
4. [技术栈分析](#4-技术栈分析)
5. [计算机视觉核心算法](#5-计算机视觉核心算法)
6. [后端 API 设计](#6-后端-api-设计)
7. [前端界面设计](#7-前端界面设计)
8. [启动器与部署系统](#8-启动器与部署系统)
9. [用户认证与权限管理](#9-用户认证与权限管理)
10. [学习系统（偏差累积）](#10-学习系统偏差累积)
11. [无人机拍摄模式](#11-无人机拍摄模式)
12. [项目亮点与可借鉴设计](#12-项目亮点与可借鉴设计)

---

## 1. 项目背景与业务需求

### 1.1 什么是 EL 检测？

**EL（电致发光，Electroluminescence）** 检测是太阳能电池板生产质检的关键环节。向电池板通电后，缺陷区域（隐裂、断栅、黑心等）会呈现暗区，通过高感光相机拍摄即可发现。

下图是一张实际的 EL 检测照片样本，可以看到电池片在通电后发出暗红色的 EL 光：

![EL检测样本照片](/blog/el-crop-v1/S0003627.JPG)

*图：太阳能电池板 EL 检测照片（原始拍摄）*

### 1.2 为什么需要裁剪工具？

实际拍摄时存在两个问题：

| 问题 | 描述 | 后果 |
|------|------|------|
| **透视畸变** | 相机无法正对面板拍摄，照片中的面板呈梯形/平行四边形 | 无法直接用于缺陷检测算法 |
| **多面板拼接** | 无人机拍摄一张图包含多块并排面板 | 需分割为单面板再检测 |

**裁剪工具**的作用：自动检测照片中面板的四个角点，通过**透视变换**矫正为标准矩形。下面是矫正后的效果：

| 原始EL照片（透视畸变） | 裁剪矫正后（标准矩形） |
|:---:|:---:|
| ![原始照片](/blog/el-crop-v1/S0003712.JPG) | ![裁剪结果](/blog/el-crop-v1/sample_el.jpg) |

*图：左侧为原始拍摄（存在透视畸变），右侧为裁剪程序自动检测角点并矫正后的标准矩形结果*

### 1.3 核心工作流程

```
拍摄 EL 照片 → 上传到工具 → 自动检测四角 → 透视变换矫正 → 下载结果
                                  ↑ 检测失败时手动修正
                                  ↑ 修正记录存入学习系统，优化后续检测
```

---

## 2. 整体架构概览

![系统架构图](/blog/el-crop-v1/diagram_architecture.png)

*图：系统整体架构 — 浏览器（前端）→ Flask（后端）→ OpenCV（视觉计算）三层分离*

```
┌─────────────────────────────────────────────────────────┐
│                    浏览器 (Web UI)                       │
│             纯 HTML/JavaScript 单页应用                  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP :15789
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Python Flask 服务端                      │
│  ┌──────────┐  ┌────────────┐  ┌───────────────────┐   │
│  │ 用户认证  │  │  检测内核  │  │   学习系统         │   │
│  │ users.json│  │ v4.0+Hough│  │ corrections.json   │   │
│  └──────────┘  └────────────┘  └───────────────────┘   │
│  ┌──────────┐  ┌────────────┐                           │
│  │ 会话持久  │  │  批量处理  │                           │
│  │ sessions/ │  │ batch_*   │                           │
│  └──────────┘  └────────────┘                           │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                OpenCV 计算机视觉库                       │
│  Hough直线检测 → Canny边缘检测 → fitLine精确化 → 透视变换 │
└─────────────────────────────────────────────────────────┘
```

### 各层职责

| 层级 | 技术 | 职责 |
|------|------|------|
| **前端** | HTML + JavaScript | 图片上传/预览、角点编辑、结果展示 |
| **后端** | Python Flask | 认证鉴权、图像处理调度、学习系统、会话管理 |
| **视觉** | OpenCV | Hough直线检测、Canny边缘检测、透视变换计算 |
| **存储** | JSON 文件系统 | 用户数据、学习样本、会话缓存、日志 |

---

## 3. 目录结构详解

下面是项目的实际文件目录截图：

![项目目录结构](/blog/el-crop-v1/00_directory_structure.png)

*图：项目根目录的实际文件列表*

```
华矩EL裁剪工具V1.1服务端/
│
├── 1_download_python.bat       # 步骤①：下载 Python 3.8 嵌入式环境
├── 2_install_libraries.bat     # 步骤②：安装 numpy/opencv/flask 依赖
├── 3_start_tool.bat            # 步骤③：启动服务 + 打开浏览器
├── start_server_headless.bat   # 后台静默启动（无窗口）
│
├── install_libs.py             # 依赖安装脚本（pip 离线安装逻辑）
├── users.json                  # 用户账号数据（SHA256 加密存储）
├── server.log                  # 服务运行日志
├── .launcher_prefs             # 启动器偏好设置
│
├── launcher.cs                 # 启动器源码（C# WinForms）
├── EL组件裁剪服务端_v4.exe      # 编译后的启动器可执行文件
│
├── runtime/                    # Python 3.8.10 嵌入式运行时（自动下载）
│
├── app/                        # 核心应用目录
│   ├── app.py                  # ★ 主程序 ~2048 行（核心检测 + API）
│   ├── index.html              # Web 前端界面 ~180KB
│   ├── batch_drone.py          # 无人机模式批量处理脚本
│   ├── corrections.json        # 普通模式学习样本库（~100KB）
│   ├── corrections_drone.json  # 无人机模式学习样本库
│   ├── logo.ico / logo.png     # 网站图标
│   └── sessions/               # 会话持久化目录（每会话一个子目录）
│       ├── {uuid}/
│       │   ├── meta.json       # 会话元数据
│       │   └── img_*.jpg       # 已处理图片缓存
│       └── ...
│
├── /blog/el-crop-v1/                # 本教程的截图和示意图
│
└── .claude/                    # Claude AI 配置文件
```

### 关键文件说明

| 文件 | 行数 | 作用 |
|------|------|------|
| `app.py` | ~2048 | 一切核心所在：检测算法 + Flask API + 学习系统 |
| `launcher.cs` | ~553 | C# 启动器，提供可视化窗口管理服务 |
| `index.html` | ~180KB | 前端 UI，内含全部 CSS/JS（单页应用） |
| `batch_drone.py` | ~117 | 无人机模式命令行批量处理脚本 |

---

## 4. 技术栈分析

### 4.1 后端

| 技术 | 用途 | 版本 |
|------|------|------|
| **Python** | 编程语言 | 3.8.10 |
| **Flask** | Web 框架 | 最新稳定版 |
| **OpenCV** | 计算机视觉 | 4.x |
| **NumPy** | 数值计算 | 最新稳定版 |

### 4.2 前端

- **纯 HTML/CSS/JavaScript** — 无任何框架依赖
- 单页应用（所有逻辑在 `index.html` 内）
- 通过 `fetch` API 与后端交互
- Canvas 绘制角点标记支持手动拖拽

### 4.3 启动器

- **C# WinForms** — 编译为独立 `.exe`
- 使用 `.NET Framework` 4.0+ 编译
- 嵌入 `logo.ico` 作为程序图标

### 4.4 关键依赖关系

```python
# app.py 中的导入逻辑
import numpy as np          # 数组运算
import cv2                  # OpenCV 图像处理
from flask import Flask     # Web 服务
import concurrent.futures   # 多线程批量处理
```

---

## 5. 计算机视觉核心算法

这是项目最精华的部分，**检测内核 v4.0**。

### 5.1 算法总流程图

![Hough直线检测原理](/blog/el-crop-v1/diagram_hough_lines.png)

*图：Hough直线检测法示意图。红色=顶边、蓝色=底边、黄色=左边、紫色=右边。内部短线条为电池片栅线（被跳过），仅保留跨越面板的边框长线。橙色圆点为检测到的四个角点。*

```
输入图片
    │
    ├─ 预处理：缩放 + 灰度 + 高斯去噪
    │
    ├─ 主检测：[H] Hough 直线检测法 ★
    │   ├─ Canny 边缘检测
    │   ├─ HoughLinesP 找线段
    │   ├─ 分类为水平线/垂直线
    │   ├─ 筛选"长线"（>35%宽度的水平线，>15%高度的垂直线）
    │   │   └─ 策略：底边从亮区中心向下找第一条长线
    │   │   └─ 跳过内部栅线（短），定位到面板边框
    │   ├─ 四线求交得到四个角点
    │   └─ 宽高比验证（1.4 ~ 3.5）
    │
    ├─ 备用：[B] 亮度 Otsu 阈值法
    │   ├─ 多阈值尝试 × 9（100%~35%）
    │   ├─ 形态学开闭运算去噪
    │   ├─ 最大连通区域 → 凸包 → 四边形逼近
    │   └─ 评分选择最优四边形
    │
    ├─ 后处理：fitLine 亚像素精确化
    │   ├─ 对每条边附近的边缘点做直线拟合
    │   └─ 四线重新求交得到精确角点
    │
    ├─ 叠加学习偏差（≥3条修正记录时生效）
    │
    ├─ 外扩黑边（pad_pct 默认 0.5%~3%）
    │
    └─ 透视变换 → 输出矫正后的矩形图片
```

### 5.2 核心代码逐段解读

#### 5.2.1 角点排序（`order_corners`）

![角点检测与透视变换](/blog/el-crop-v1/diagram_corner_detection.png)

*图：左侧为原始畸变图像中的四个角点（橙色圆点），右侧为经过透视变换矫正后的标准矩形。TL=左上、TR=右上、BR=右下、BL=左下。*

```python
def order_corners(pts):
    """将四个角点规范化为 [TL, TR, BR, BL] 顺序"""
    pts = pts[np.argsort(pts[:, 1])]     # 按 y 排序，上半为 top
    top = pts[:2][np.argsort(pts[:2, 0])] # top 中按 x 排序 → TL, TR
    bot = pts[2:][np.argsort(pts[2:, 0])] # bottom 按 x 排序 → BL, BR
    return np.array([top[0], top[1], bot[1], bot[0]], dtype=np.float32)
```

**教学要点**：
- NumPy 数组操作：`argsort` 排序、切片取子集
- 坐标系：图像坐标中 y 轴向下，y 值小 = 上方
- OpenCV 角点顺序约定：TL → TR → BR → BL

#### 5.2.2 Hough 直线检测（主算法）

```python
def _method_hough(gray, sh, sw, bcx, bcy):
    """Hough 直线检测法 — 找面板边框的四条直线"""

    # 1. 边缘检测
    blur = cv2.GaussianBlur(gray, (15, 15), 0)
    edges = cv2.Canny(blur, 20, 60)
    edges = cv2.dilate(edges, k, iterations=1)  # 膨胀连接断线

    # 2. Hough 概率直线检测
    min_ll = int(min(sw, sh) * 0.10)  # 最小线段长度 = 较短边的10%
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=40,
                            minLineLength=min_ll, maxLineGap=25)

    # 3. 分类：水平线 vs 垂直线
    h_lines, v_lines = [], []
    for x1, y1, x2, y2 in lines_arr:
        angle = abs(np.degrees(np.arctan2(y2 - y1, x2 - x1)))
        if angle < 20 or angle > 160:
            h_lines.append(...)   # 水平线
        elif 70 < angle < 110:
            v_lines.append(...)  # 垂直线

    # 4. 筛选面板边框（跳过内部栅线）
    long_h = sw * 0.35   # 面板边框是跨越 >35% 宽度的水平线
    long_v = sh * 0.15   # 面板边框是跨越 >15% 高度的垂直线

    # 5. 四条关键线的定位策略
    # 底边：从亮区中心向下，取第一条长水平线 → 定位到面板底边框
    # 顶边：从亮区中心向上，取第一条长水平线
    # 左边：取最外侧（最小 x）的长竖线
    # 右边：取最外侧（最大 x）的长竖线
```

**为什么要这样筛选？**

EL 照片中，面板内部有密集的电池片栅线（短线），真正的面板边框是四条长线。
- 内部栅线：短，不到面板宽度 35%
- 面板边框：长，跨越整个面板宽度
- 底边特殊：下方可能有平台，必须从亮区中心往下找

#### 5.2.3 四线求交

```python
def seg_to_line(x1, y1, x2, y2):
    """将线段转换为标准直线表示 [vx, vy, x0, y0]"""
    vx, vy = x2 - x1, y2 - y1
    ln = max(np.hypot(vx, vy), 1e-6)
    return [vx / ln, vy / ln, (x1 + x2) / 2, (y1 + y2) / 2]

def line_intersect(l1, l2):
    """计算两条直线交点（参数方程法）"""
    vx1, vy1, x1, y1 = l1
    vx2, vy2, x2, y2 = l2
    d = vx1 * vy2 - vy1 * vx2    # 叉积判断是否平行
    if abs(d) < 1e-6:
        return None
    t = ((x2 - x1) * vy2 - (y2 - y1) * vx2) / d
    return np.array([x1 + t * vx1, y1 + t * vy1], dtype=np.float32)
```

**数学原理**：
- 直线参数方程：$P = P_0 + t \cdot \vec{v}$
- 两直线交点解：对 $\vec{v_1}$ 和 $\vec{v_2}$ 联立求解
- $d = \vec{v_1} \times \vec{v_2}$ 判断平行（三维叉积的 z 分量）

#### 5.2.4 fitLine 亚像素精确化

```python
def _refine_corners_by_lines(gray, rough_pts, sw, sh):
    """Canny + fitLine 使角点精确到亚像素级别"""
    edges = cv2.Canny(blur, 25, 75)

    for i in range(4):
        p1, p2 = o[i], o[(i + 1) % 4]  # 当前边的两个端点

        # 在边的法线方向 ± margin_n 范围内收集边缘点
        tx, ty = dx / length, dy / length   # 切向单位向量
        nx, ny = -ty, tx                     # 法向单位向量

        # 筛选带状区域内的点
        sel = (np.abs(d_n) < margin_n) & \
              (d_t > -margin_t) & (d_t < length + margin_t)
        side_pts = pts_arr[sel]

        # fitLine 拟合直线
        line = cv2.fitLine(side_pts, cv2.DIST_L2, 0, 0.01, 0.01).flatten()
```

**原理**：
1. HoughLinesP 检测到的线段精度有限（像素级）
2. 在线段附近的带状区域收集所有边缘点
3. 对所有边缘点做最小二乘直线拟合 → 亚像素精度
4. 四条边重新求交，获得比原始 Hough 更精确的角点

#### 5.2.5 透视变换

```python
def warp_image(img, pts, target_w=None, target_h=None):
    tl, tr, br, bl = pts

    # 计算目标尺寸
    dw = int(max(np.linalg.norm(tr - tl), np.linalg.norm(br - bl)))
    dh = int(max(np.linalg.norm(bl - tl), np.linalg.norm(br - tr)))

    # 构造目标矩形
    dst = np.array([[0, 0], [dw, 0], [dw, dh], [0, dh]], dtype=np.float32)

    # 计算透视变换矩阵
    M = cv2.getPerspectiveTransform(pts.astype(np.float32), dst)

    # 执行变换
    return cv2.warpPerspective(img, M, (dw, dh))
```

**核心理解**：
- `getPerspectiveTransform`：已知四边形四点 → 估算 3×3 变换矩阵
- `warpPerspective`：将每个像素映射到新位置（双线性插值）
- 目标尺寸取四边的最大长度，保证无信息丢失

### 5.3 实际运行效果

在真实场景中运行裁剪工具的处理效果：

| 步骤 | 说明 |
|------|------|
| **原始EL照片** | 透视畸变的太阳能电池板照片 |
| **自动检测角点** | Hough 算法自动定位四个角点 |
| **透视变换矫正** | 将梯形矫正为标准矩形 |
| **裁剪结果** | 输出规整的矩形面板图像 |

从实际裁剪结果可以看到，矫正后的图像中电池片的栅线变得横平竖直，可直接用于后续的缺陷检测分析。

---

## 6. 后端 API 设计

### 6.1 API 列表

| 端点 | 方法 | 用途 | 需认证 |
|------|------|------|--------|
| `/` | GET | 返回前端页面 | 否 |
| `/health` | GET | 健康检查 | 否 |
| `/info` | GET | 服务信息（GPU/版本/样本数） | 是 |
| `/auth/login` | POST | 登录 | 否 |
| `/auth/logout` | POST | 登出 | 是 |
| `/auth/status` | GET | 登录状态 | 是 |
| `/auth/users` | GET | 列出用户（管理员） | 是 |
| `/auth/users/add` | POST | 添加用户 | 是 |
| `/auth/users/delete` | POST | 删除用户 | 是 |
| `/auth/users/password` | POST | 修改密码 | 是 |
| `/process` | POST | 普通模式：裁剪一张图 | 是 |
| `/batch` | POST | 批量处理多张图 | 是 |
| `/process_drone` | POST | 无人机模式：一张图分三面板 | 是 |
| `/process_drone_single` | POST | 无人机单面板重裁 | 是 |
| `/correction` | POST | 保存手动修正记录 | 是 |
| `/corrections/list` | GET | 列出学习样本 | 是 |
| `/correction/delete` | POST | 删除学习样本 | 是 |
| `/session/save` | POST | 保存会话 | 是 |
| `/session/load/<sid>` | GET | 恢复会话 | 是 |

### 6.2 认证装饰器模式

```python
AUTH_FREE_PATHS = {'/', '/logo', '/health', '/auth/status',
                   '/auth/login', '/auth/logout', ...}

@app.before_request
def require_login():
    if request.path in AUTH_FREE_PATHS:
        return None                 # 放行
    if session.get('logged_in') is True:
        return None                 # 已认证，放行
    return jsonify({'ok': False, 'auth': False, 'error': 'login required'}), 401
```

**教学价值**：Flask 的 `before_request` 钩子实现全局认证，简洁高效。

### 6.3 图片处理接口设计

```python
@app.route('/process', methods=['POST'])
def process():
    f = request.files.get('image')
    pad     = float(request.form.get('pad', 0.005))
    forced  = json.loads(request.form['corners']) if ... else None
    img_name = request.form.get('name', None)

    jpeg, corners, err = process_image(f.read(), pad, forced, img_name)

    return jsonify({
        'ok': True,
        'jpeg_b64': base64.b64encode(jpeg).decode(),  # Base64 传输图片
        'corners': corners,                            # 角点坐标
        'ms': round((time.time()-t0)*1000)             # 耗时
    })
```

**设计要点**：
- 图片通过 `multipart/form-data` 上传
- 返回用 Base64 编码 JPEG，前端直接显示
- 支持 `forced` 参数传递手动角点（跳过自动检测）
- 返回处理耗时（ms）供前端展示

### 6.4 多线程批量处理

```python
WORKERS = min(os.cpu_count() or 4, 8)
pool = concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS)

def proc(f, name):
    return process_image(f.read(), pad, forced, name, ...)

futures = {pool.submit(proc, f, n): i for i, (f, n) in enumerate(zip(fs, names))}
for fut, idx in futures.items():
    jpeg, corners, err = fut.result()
    results[idx] = ...  # 保持原始顺序
```

**教学价值**：`ThreadPoolExecutor` 的典型使用模式，注意用 `dict` 保持任务与结果的对应关系。

---

## 7. 前端界面设计

### 7.1 技术选型

- **零框架**：纯 HTML + CSS + JavaScript
- **单页应用**：所有逻辑在 `index.html` 中
- **交互方式**：
  - 拖拽上传图片
  - Canvas 绘制裁剪预览
  - 拖拽角点进行手动修正

### 7.2 登录页面

![登录页面](/blog/el-crop-v1/01_login_page.png)

*图：工具启动后打开的登录页面，输入用户名和密码即可登录。*

### 7.3 已登录主界面

![主界面](/blog/el-crop-v1/Logged-in-interface.png)

*图：登录后的主界面。包含图片上传区、裁剪预览区域、参数设置等核心功能模块。*

### 7.4 主要功能页面

| 页面/模块 | 功能 |
|-----------|------|
| 登录页 | 用户名/密码登录 |
| 上传区 | 拖拽或点击选择图片 |
| 预览区 | 显示自动检测结果（角点标记 + 矫正预览） |
| 编辑区 | 拖拽 4 个橙色角点进行手动修正 |
| 结果页 | 下载裁剪后的图片 |
| 用户管理（管理员） | 添加/删除用户，修改密码/角色 |
| 学习系统看板 | 查看偏差数据、样本列表 |

### 7.5 与后端交互方式

```javascript
// 上传图片（fetch API）
async function uploadImage(file, pad, corners) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('pad', pad);
    if (corners) formData.append('corners', JSON.stringify(corners));

    const resp = await fetch('/process', { method: 'POST', body: formData });
    const data = await resp.json();

    if (data.ok) {
        // data.jpeg_b64 → 直接显示
        // data.corners → 在 Canvas 上绘制
        // data.ms → 显示处理耗时
    }
}
```

---

## 8. 启动器与部署系统

### 8.1 三步部署设计

极具工程实用价值的设计——完全不懂编程的用户也能用：

```
步骤1：1_download_python.bat     → 下载 Python 3.8.10 嵌入式环境到 runtime/
步骤2：2_install_libraries.bat   → 通过 pip 安装 numpy + opencv + flask
步骤3：3_start_tool.bat          → 启动 Flask 服务 + 打开浏览器
```

### 8.2 嵌入式 Python

```bat
:: 下载 Python 嵌入式发行版（~8MB）
set PY_URL=https://www.python.org/ftp/python/3.8.10/python-3.8.10-embed-amd64.zip
curl -k -L --retry 3 --progress-bar -o "%PY_ZIP%" "%PY_URL%"

:: 解压到 runtime/
powershell -Command "Expand-Archive -Path '%PY_ZIP%' -DestinationPath '%PYDIR%' -Force"
```

**嵌入式 Python 的特点**：
- 体积小（~8MB vs 完整安装 ~30MB）
- 免安装，解压即用
- 不依赖系统 Python，和项目捆绑

### 8.3 pip 离线安装

```python
# install_libs.py 中的代理清理和 SSL 处理
for k in ['HTTP_PROXY', 'HTTPS_PROXY', ...]:
    os.environ.pop(k, None)

# 自定义下载器（处理 SSL 证书问题）
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
```

**为什么需要这些？**
- 工厂/企业内部网络可能有代理
- 老旧 Windows 系统 SSL 证书可能过期
- 多重下载策略保证成功率

### 8.4 C# 启动器（launcher.cs）

启动器提供可视化管理界面（如下图所示），功能包括：

![启动器界面](/blog/el-crop-v1/00_launcher_file.png)  *(实际启动器程序图标和位置)*

| 功能 | 技术实现 |
|------|---------|
| 启动/停止服务 | Process 启动 Python，taskkill 停止 |
| 状态监控 | Timer 每隔 5 秒检查后端和前端是否运行 |
| 端口配置 | 用户可修改端口（默认 15789） |
| 防火墙规则 | 自动添加 Windows 防火墙放行规则 |
| 用户管理 | 内置用户 CRUD（增删改查） |
| 局域网 IP 检测 | Socket 连接 DNS 获取本机 IP |

关键代码片段：

```csharp
// 获取局域网 IP（经典实现）
static string GetLanIp() {
    using (var s = new Socket(AddressFamily.InterNetwork,
                              SocketType.Dgram, ProtocolType.Udp)) {
        s.Connect("114.114.114.114", 80);  // 不真正发送数据
        return (s.LocalEndPoint as IPEndPoint).Address.ToString();
    }
}

// 健康检查
static bool TestBackend() {
    using (var c = new TcpClient()) {
        var ar = c.BeginConnect("127.0.0.1", Port, null, null);
        return ar.AsyncWaitHandle.WaitOne(350);  // 350ms 超时
    }
}
```

### 8.5 启动器密码保护

```csharp
static bool CheckPassword() {
    // 内置密码验证（XOR 编码防止明文）
    var pwd = "";
    foreach (int x in new int[] { 0x3d, 0x3f, 0x3f, 0x36 })
        pwd += (char)(x ^ 0x55);  // 解码后 = "hjjc"
}
```

---

## 9. 用户认证与权限管理

### 9.1 密码存储

```python
import hashlib, base64, os

def _new_salt():
    """生成 16 字节随机盐"""
    return base64.b64encode(os.urandom(16)).decode()

def _hash_password(password, salt):
    """SHA256(salt + password)"""
    return base64.b64encode(
        hashlib.sha256((salt + password).encode()).digest()
    ).decode()
```

**为什么加盐**？
- 不加盐：相同密码产生相同哈希 → 彩虹表攻击
- 加盐：每个用户盐值不同 → 即使密码相同哈希值也不同

### 9.2 用户数据格式

```json
{
  "users": [
    {
      "username": "admin",
      "password_hash": "DuFVlINbDXCIeCDWZDhI+GojeT+0vGUaK1J3CNsVwKs=",
      "salt": "TnMpOFGYcteAkJ73uY7Lkg==",
      "role": "admin",
      "created_at": "2026-04-25 18:29:03"
    }
  ]
}
```

### 9.3 两角色权限

| 角色 | 可操作 |
|------|--------|
| **管理员** | 裁剪图片 + 管理用户（增删改） |
| **普通用户** | 仅裁剪图片 |
---

## 10. 学习系统（偏差累积）

### 10.1 设计思路

这是项目的特色功能——让算法从人工修正中"学习"。

```
用户手动调整角点 → 保存修正记录 → 计算偏差均值 → 后续检测自动补偿偏差
```

### 10.2 偏差计算

```python
def _update_learned_bias():
    for c in corrections:
        auto   = np.array(c['auto'])    # 算法检测的角点
        manual = np.array(c['manual'])  # 人工修正后的角点

        delta = manual - auto           # 四边偏差

        # 每条边取平均（像素级偏差 / 图像尺寸 → 比例偏差）
        top_l.append(  ((delta[0][1] + delta[1][1]) / 2) / H )
        bot_l.append(  ((delta[2][1] + delta[3][1]) / 2) / H )
        left_l.append( ((delta[0][0] + delta[3][0]) / 2) / W )
        right_l.append(((delta[1][0] + delta[2][0]) / 2) / W )

    # 取所有偏差的均值（转换为比例）
    _learned_bias = {
        'top': float(np.mean(top_l)),     # 上边偏差比例
        'bot': float(np.mean(bot_l)),     # 下边偏差比例
        'left': float(np.mean(left_l)),   # 左边偏差比例
        'right': float(np.mean(right_l)), # 右边偏差比例
        'n': len(corr)                    # 样本数
    }
```

### 10.3 偏差应用

```python
def _apply_learned_bias(pts, W, H):
    """将学习偏差叠加到检测角点，至少 3 条记录才生效"""
    if bias['n'] < 3:
        return pts  # 样本不够，不启用

    pts = pts.copy()
    # 上边：TL.y += bias.top * H, TR.y += bias.top * H
    pts[0][1] += bias['top']   * H
    pts[1][1] += bias['top']   * H
    # 下边：BR.y += bias.bot * H, BL.y += bias.bot * H
    pts[2][1] += bias['bot']   * H
    pts[3][1] += bias['bot']   * H
    # 左边：TL.x += bias.left * W, BL.x += bias.left * W
    pts[0][0] += bias['left']  * W
    pts[3][0] += bias['left']  * W
    # 右边：TR.x += bias.right * W, BR.x += bias.right * W
    pts[1][0] += bias['right'] * W
    pts[2][0] += bias['right'] * W

    return pts
```

### 10.4 偏差分析

```python
def _compute_analysis(corrections):
    """分析所有手动修正，计算建议的 pad 值"""
    outward_projs, pad_corrections = [], []
    for c in corrections:
        delta = manual - auto
        # 计算各边"外扩"趋势
        centroid = auto.mean(axis=0)
        dirs = auto - centroid
        outward = (delta * dirs).sum(axis=1).mean()
        pad_corrections.append(outward / H)

    suggested_pad = current_pad + mean_pad_corr
    # 输出：建议调整 pad 值
```

**教学要点**：
- 偏差以**比例**而非像素存储 → 适配不同分辨率的图片
- 3 条记录作为最小生效阈值 → 避免偶然偏差
- 四边独立计算 → 更精细的补偿

---

## 11. 无人机拍摄模式

### 11.1 问题定义

无人机拍摄的 EL 照片通常包含 3 块并排的太阳能面板，需要：
1. 检测面板行（垂直位置）
2. 检测面板间分隔缝 → 分割为独立面板
3. 逐个裁剪并统一尺寸输出

![无人机模式示意图](/blog/el-crop-v1/diagram_drone_mode.png)

*图：无人机模式的核心流程 — 从一张包含多块面板的照片中，自适应检测面板间暗缝，将各面板分割并独立裁剪输出。*

### 11.2 实际运行效果

无人机模式可将一张照片中自动检测到的面板逐一裁剪输出。下面是实际裁剪的一个面板结果：

![无人机裁剪结果](/blog/el-crop-v1/drone_crop_result.jpg)

*图：无人机模式自动裁剪输出的单个面板结果（5107×1469 像素），已经过透视变换矫正为标准矩形。*

### 11.3 面板区域检测

```python
def _drone_find_panel_region(gray):
    """在图中找到主导面板行的垂直范围"""

    # 1. Otsu 分割找到整体亮区
    _, mask = cv2.threshold(blur, otsu_val * 0.5, 255, cv2.THRESH_BINARY)

    # 2. 在中间列做行亮度投影
    strip = gray[:, x_mid_s:x_mid_e]
    row_mean = strip.mean(axis=1)          # 每行平均亮度
    row_smooth = GaussianBlur(row_mean)    # 平滑

    # 3. 找所有亮带（连续亮度 > 阈值）
    # 4. 合并"薄而浅"的内部分隔（半片电池分隔线）
    # 5. 取最高的亮带作为面板行
```

### 11.4 面板数量自适应检测

```python
def _drone_detect_n_panels(gray, region, max_panels=3):
    """自适应检测实际面板数量（1~3块）"""

    # 1. 在面板行水平范围内做列投影
    col_smooth = GaussianBlur(col_mean)

    # 2. 找所有波谷（面板间暗缝）
    # 3. 按深度排序，去重（近距离保留最深）
    # 4. 用波谷位置分割出候选面板区域

    # 5. 验证和过滤
    # - 宽度 < 8% 总宽的段丢弃
    # - 平均亮度低于阈值丢弃
    # - 贴画幅边缘且宽度不足 75% 中位宽度的丢弃（被截断的半面板）
```

### 11.5 面板完整性判断

```python
def _panel_is_complete(pts_full, W, H, margin_frac=0.02):
    """判断面板是否完整（未被画幅裁切）"""
    margin_x = W * margin_frac
    margin_y = H * margin_frac
    for x, y in pts_full:
        if x < margin_x or x > W - margin_x:
            return False   # 左右被截断
        if y < margin_y or y > H - margin_y:
            return False   # 上下被截断
    return True
```

这个函数的逻辑：如果角点贴边（距图像边缘 < 2%），说明面板超出了画面范围，不完整的面板跳过裁剪。

---

## 12. 项目亮点与可借鉴设计

### 12.1 工程亮点

| 亮点 | 说明 |
|------|------|
| **零依赖部署** | 嵌入式 Python + 自动装依赖，用户无需搭建环境 |
| **双算法容错** | Hough 主算法失败时自动降级为亮度法 |
| **学习系统** | 人工修正自动累积为偏差补偿 |
| **会话持久化** | 关闭浏览器后恢复进度 |
| **GPU 加速** | 自动检测 OpenCL，启用 GPU 加速 |
| **局域网访问** | 自动获取 IP，局域网内任意设备可访问 |

### 12.2 从教学角度的可学知识点

**Python / Flask**：
- `@app.before_request` 全局钩子实现认证
- `ThreadPoolExecutor` 多线程批量处理
- Session 管理用户状态
- 大文件上传的 `MAX_CONTENT_LENGTH` 配置

**OpenCV / 计算机视觉**：
- `cv2.HoughLinesP` — 概率 Hough 直线检测
- `cv2.Canny` — 边缘检测
- `cv2.fitLine` — 亚像素直线拟合
- `cv2.getPerspectiveTransform` + `warpPerspective` — 透视变换
- `cv2.connectedComponentsWithStats` — 连通区域分析
- `cv2.convexHull` — 凸包计算

**C# / WinForms**：
- `Process` 类管理子进程
- `System.Windows.Forms.Timer` 周期状态检查
- `SHA256` 密码哈希
- `ListView` 展示用户列表

**工程实践**：
- 三步批处理部署策略
- 嵌入式 Python 环境
- 自动加防火墙规则
- 多重下载机制保证安装成功率

### 12.3 可改进方向

| 方向 | 建议 |
|------|------|
| 安全性 | 使用 JWT 替代 Flask session（适合无状态 API） |
| 部署 | 打包为 Docker 镜像 |
| 前端 | 迁移到 Vue/React 框架 |
| 算法 | 引入深度学习（如 YOLO 角点检测）替代 Hough |
| 性能 | 使用 Redis 缓存会话，替代文件系统 |

---

> 本教程基于 **EL裁剪工具** 项目源码编写。
> 这是一个将计算机视觉、Web 服务、桌面应用三者结合的完整工业案例。
> 
> 截图和示意图位于项目根目录的 [`/blog/el-crop-v1/`](https://github.com/AChengLinus/EL_cropped) 文件夹下。
