---
title: "TwinDesk：把电脑和手机拼成一张办公桌"
description: "2.8k star 的开源跨设备协同工具：Mac、Windows、Linux、Android 之间共用一套鼠标键盘，互开应用窗口、把旧电脑或平板当副屏、同步剪贴板与文件，还能在电脑上接打电话、收发短信。不需要账号，也不经过云端；另有简体中文汉化分支，Windows 界面已全中文。"
pubDate: "2026-11-02"
badge: "工具"
tags: ["跨设备", "开源工具", "效率"]
heroImage: "/images/notes/twindesk/cover.png"
---

> 项目地址：[InukaAsith/TwinDesk](https://github.com/InukaAsith/TwinDesk) ｜ GPL-3.0 ｜ 2.8k star ｜ JavaScript 72.7% · Kotlin 9.0% · C# 4.7% · CSS 4.2% · C 3.8%
>
> 简体中文版：[AChengLinus/TwinDesk-chinese](https://github.com/AChengLinus/TwinDesk-chinese) ｜ Windows 10/11 界面全中文，可随时切回 English
>
> 原作者：InukaAsith ｜ 原文语言：英文 ｜ 本文整理自汉化分支的 README（v2.4，2026-11-02），不是逐句翻译

## 一句话说明白

**把所有电脑和手机连成一张桌子，共用一套键鼠、一块剪贴板和一堆窗口。**

它做的事和 Synergy、KDE Connect、微软的「手机连接」有重叠，但走得更远：不只是共享键鼠和剪贴板，而是能把另一台电脑（或安卓手机）的**单个应用**开成自己桌面上的独立窗口，能把旧笔记本、平板变成真正的副屏，还能在电脑上直接接电话、回短信、用手机当摄像头。

免费、开源，没有账号，没有云中转。原版只有英文界面；想要中文，用下文的简体中文版。

## 能做什么

| 方向 | 主要能力 |
|---|---|
| **电脑 ↔ 电脑** | 一套鼠标键盘跨屏使用；扩展屏 / 远程屏；把对方的应用开成独立窗口；跨设备拖拽文件；共享文件夹；共享剪贴板（含图片）；通知与声音互转；`ssh twindesk` 免密终端；网络唤醒 |
| **电脑 ↔ 安卓手机 / 平板** | 接打电话、收发短信；浏览手机相册与全部文件；手机摄像头当摄像头；手机当遥控器 / 手柄；手机屏幕与单个 App 开在电脑窗口；平板当第二块屏幕；剪贴板、通知、文件双向同步 |
| **多设备 Mesh**（测试版） | 三台以上设备同时互联：一只鼠标走过所有屏幕、一个剪贴板、一个通知池；新设备配对一次就自动入网 |

几处细节挺实用：跨设备复制粘贴支持 10MB 以内的图片（电脑上截个图，直接粘到另一台机器）；从 macOS 的分享菜单或 Windows 的「发送到」就能把文件扔过去；复制的密码管理器条目会被自动跳过；<kbd>Ctrl+Alt+V</kbd> / <kbd>⌃⌥V</kbd> 能把文件直接粘进聊天窗口这类前台应用，而不只是文件夹。

## 🇨🇳 简体中文版（汉化分支）

原版界面只有英文。汉化分支把界面文案抽进了词典层（`shared/i18n.js`），**默认中文，可随时切回英文**。

- **切换**：设置 › 通用 › 应用 › 语言（中文 / English）。选完整个窗口会重载一次，所有窗口和托盘菜单一起换。
- **记录位置**：`settings.json` 里的 `ui.lang`（`"zh"` / `"en"`），下次启动沿用。Windows 是 `%APPDATA%\MacShare\settings.json`，macOS 是 `~/Library/Application Support/MacShare/settings.json`，Linux 是 `~/.config/MacShare/settings.json`。
- **当前进度**：Windows 版的界面、托盘菜单、通知与 HUD 已整体汉化（1000+ 条词条、270+ 条动态句式），摄像头、远程、ReZume 等页面已逐条覆盖。**macOS 与 Linux 的窗口页面（`mac/control.html`、`linux/app.html`）和 Android App 还没接入词典层，仍是英文。**
- **安装包**：上游官方安装包是英文的；要中文界面，得用汉化分支的源码自己构建（Windows 见 `windows/`，安装包脚本在 `build/`）。

做法挺巧：代码里继续写英文，显示之前查一次词典；英文模式下 `T()` 原样返回，一个词条都不用撤。

- 渲染原语 `UI.el` / `UI.row` / `UI.card` / `UI.note` 会自动对 `text`、`label`、`hint`、子字符串以及 `title` / `aria-label` / `placeholder` / `alt` 调 `T()`，所以改文案通常只要加词条。
- 名字、数字拼出来的句子用 `I.pattern`——pattern 先注册先匹配，越具体越靠前；返回 `null` 表示「这条不算」，继续试后面的。
- 词条按用途分文件：`zh.core.js`（通用）、`zh.media.js`（屏幕、摄像头、遥控、ReZume）、`zh.comms.js`（通话、短信、手机中枢）、`zh.io.js`（文件、挂载、终端、剪贴板）、`zh.devices.js`（手机、平板、ADB、镜像）、`zh.settings.js`（设置、关于、更新、多设备）、`zh.pages.js`（一对一界面）；`shared/i18n-dom.js` 负责填 `app.html` 里 `data-t` / `data-ta` 的静态文案。
- 主进程（托盘、通知、HUD、状态行、显示器名）用 `I18n.T()`——这些文件里常有 `const T = P.T`（协议消息类型），别用裸 `T`。

不翻译的：设备名、`TwinDesk`、`ADB`、`Wi-Fi`、快捷键名、路径与文件名、另一端传回来的数据串；Mac 的 `Dock` / `Menu bar` 保留英文（Windows 的 Taskbar / Tray 译作「任务栏」「托盘」）。中文全角标点，中英文之间留一个空格。

**自己构建 Windows 中文版**（Node.js 18+）：

```bat
cd windows
npm install
npm run build:helper   :: 用 Windows 自带的 .NET Framework C# 编译器
npm start
npm run dist           :: 安装包在 windows\dist\
```

macOS / Linux / Android 的构建命令见仓库 README 的「构建与运行」一节。

## 连接方式

不用手动选，它会自己挑：有同一局域网就用局域网，插上 USB 线就走线，Wi-Fi 没戏就退回蓝牙。

| 能力 | 同一 Wi-Fi | USB 线 | 蓝牙 | 蓝牙 + Wi-Fi Direct / 热点 |
|---|:-:|:-:|:-:|:-:|
| 会话、剪贴板文字、通知 | ✅ | ✅ | ✅ | ✅ |
| 鼠标键盘、遥控 | ✅ | ✅ | ✅ | ✅ |
| 来电与短信 | ✅ | ✅ | ✅ | ✅ |
| 屏幕、应用、摄像头、文件、照片、剪贴板图片 | ✅ | ✅ | 自动切到 Wi-Fi Direct | ✅ |
| 电脑之间的终端（`ssh twindesk`） | ✅ | — | Wi-Fi Direct | ✅ |

蓝牙只用来维持连接，一旦要传屏幕或大文件，它会临时拉起一条 Wi-Fi Direct 链路，用完再收回去。界面上方一直显示当前链路和延迟，比如「38 ms · Bluetooth」。

谁能通过蓝牙出现由你决定：「与手机的蓝牙」默认开，「与电脑的蓝牙」默认关，在概览和通用里都能改。

## 支持平台

- **macOS 13 Ventura 及以上**（Apple Silicon 与 Intel 都有安装包）
- **Windows 10 / 11**（x64 与 ARM64）
- **Linux**（X11 与 Wayland，x86_64；提供 .deb、AppImage、Arch 包，NixOS 可直接 `nix run`）
- **Android 10 及以上**（手机和平板；走无线调试的完整功能需要 Android 11+）

**没有 iOS 客户端**：只支持 Android，iPhone 用不上这套协同，这是它和苹果生态方案最大的差别。

## 怎么装

到 [Releases](https://github.com/InukaAsith/TwinDesk/releases/latest) 下载对应平台的包（当前版本 2.4.0），每台设备都装一份即可。官方安装包只有英文界面，中文界面见上一节。

macOS 用 Homebrew 最省事：

```sh
brew install --cask inukaasith/twindesk/twindesk
```

**第一次打开会被系统拦一下**，因为项目没钱买苹果开发者证书和 Windows 代码签名：

- macOS：拖进 Applications 后打开，提示「无法验证」时点**完成**，再去「系统设置 › 隐私与安全性」点**仍要打开**；如果提示「已损坏」，执行 `xattr -dr com.apple.quarantine /Applications/TwinDesk.app` 再打开。
- Windows：SmartScreen 提示时点「更多信息 › 仍要运行」。注意 Windows 11 开了 **Smart App Control** 的话没有「仍要运行」按钮，只能关掉它，而且很多 Win11 版本不重装系统就打不开了。
- Android：允许「安装未知应用」，Play Protect 拦截时选「仍要安装」。

装完两边打开，比对一次性配对码即可。手机端的屏幕、应用窗口、触控和键鼠需要开一次**无线调试**（开发者选项里配对，输 6 位码）；文件、剪贴板、通知不需要。小米、红米、POCO 还额外要求打开「USB 调试（安全设置）」（需要 Mi 账号），否则能看到画面但触控无效。

**Android 完整版**（通知、短信、媒体控制、无障碍键鼠）：下载版会被 Play Protect 限制这些权限，最简单的办法是让电脑通过无线调试装一次（手机页面 › 来自手机的通知），设置和配对都会保留。手动装可能被拦；Android 13 及以上还要在「设置 › 应用 › TwinDesk › ⋮ › Allow restricted settings」里放开受限设置，才能打开通知访问和无障碍。

无线调试配对一次之后，TwinDesk 会在需要时自己开启它：跟随端口变化、避免 Android 在闲置 7 天后忘记配对；MIUI、HyperOS 这类锁屏就关掉无线调试的手机，会在解锁后自动重开。前提是手机的 **USB 调试**也开着——TwinDesk 会把两个都打开。

Mac 上还能让手机像服务器一样出现在 Finder 里（挂载页签 › 挂载）；允许 USB 调试时走线缆，否则走无线调试，`.DS_Store` 和 `._` 文件不会写到手机上。

## 2.3 的新功能（当前版本 2.4）

| 新增 | 说明 |
|---|---|
| 📷 **摄像头** | 手机摄像头，或另一台电脑的摄像头：显示在窗口里，或作为网络摄像头供 Zoom、Teams、Meet 使用 |
| 🎮 **遥控器与手柄** | 手机变触控板和键盘；也能当手柄：Windows 上是 Xbox 360 手柄、Linux 上是游戏手柄；Bluetooth 手柄连 Mac 也行，那台电脑不用装 TwinDesk |
| 🖼 **剪贴板图片** | 10MB 以内，PC 上截图直接粘到 Mac 或手机 |
| 🔒 **光标锁定** | Scroll Lock（Mac 上是 F14）让光标留在它所在的电脑上 |
| 🎵 **媒体控制** | 手机在放什么，电脑上能暂停、上一首、下一首、拖进度 |
| 🪶 **更轻量** | 默认所有功能关闭，托盘内存约减半（Windows PC 约 240MB → 125MB） |

其他：<kbd>Ctrl+Alt+V</kbd> / <kbd>⌃⌥V</kbd> 直接粘到前台应用；Windows 和 Linux 现在能选接收文件的保存位置（通用 › 接收的文件）；手机窗口里在 WhatsApp、Instagram、Telegram 按 Enter 发送；能把手机自己的屏幕显示在电脑上；触控板模式；锁屏的手机不再自己亮起；无线调试可以在电脑不在时自行关闭（通用 › 在手机上允许）；手机上的光标也会显示在通知栏和设置界面。

<sub>更早的版本：2.2 带来了 TwinDesk Mesh，2.1 带来了 Bluetooth 和 Wi-Fi Direct，以及手机的通话、短信、照片和文件。</sub>

## 它是怎么做的

每个平台都是一个 Electron 外壳，旁边跑一个用各平台原生语言写的小助手：macOS 用 Swift（虚拟屏、事件注入、音频、SMB），Windows 用 C#（钩子、SendInput、窗口捕获、原生拖拽），Linux 用 C（X11 的 XInput2 / XTest、Wayland 的 evdev / uinput），手机端是 Kotlin + Jetpack Compose，电脑通过 adb 和 scrcpy 的服务端操控手机。

设备之间的连接始终是一条 TLS 会话，底层可以是局域网、USB（adb）、蓝牙 LE，或者按需拉起的 Wi-Fi Direct；局域网内走 TCP 47800（控制与文件）和 UDP 47801（发现）。文件传输走同端口的 HTTPS，最多四路并行，所以大文件不会把鼠标键盘卡住。

虚拟摄像头和游戏手柄也有各自的原生实现：Windows 11 上是一个需要一次管理员授权的摄像头，Linux 上是 v4l2loopback 和 uinput（首次开启要输一次密码），Mac 上则装进 OBS Virtual Camera。

## 几个要知道的坑

- **中文界面目前只覆盖 Windows**：macOS 与 Linux 的窗口页、Android App 还没接词典层，仍是英文。
- **Mesh 还是测试版**：手机上同一时间只能连一台电脑；Linux 加入 Mesh 只能走同一 Wi-Fi；摄像头、剪贴板图片、拖文件到多台设备这些还没迁过去。
- **Linux 的限制比较实在**：在 Wayland 下把文件拖出到别的设备需要 Xorg 会话；「把本机应用开到对方屏幕上」也要求 Xorg；NVIDIA 闭源驱动不支持用多余输出做扩展屏，得走虚拟显示器方案。共享文件夹靠 Samba（第一次会让你输密码装上），虚拟摄像头 / 游戏手柄首次开启也要密码，防火墙修复会放行 mDNS（5353/udp）。
- **它很新**：仓库 2026 年 10 月 14 日才创建，三周冲到 2.8k star，版本号已经到 2.4，更新很快，但也意味着边角问题不会少。
- **未签名安装是常态**：这不是恶意软件的特征，但每次大版本更新后仍可能被系统再拦一次；Windows 11 开了 Smart App Control 基本就装不了。
- **隐私上没什么可担心的**：所有数据只在配对设备之间直连，唯一的互联网请求是 GitHub 更新检查，而且可以关。

## 我的判断

**值得试试的情况：**

- 手边有两台以上电脑（比如 Mac + Windows），想用一套键鼠、一个剪贴板，懒得来回插拔
- 有一台安卓手机或平板，想把它变成副屏、摄像头、遥控器，甚至把手机 App 直接开在电脑桌面上
- 用 Windows 又想要中文界面：现在只有汉化分支能做到，其他平台还得等它把词典层接完
- 在意隐私：所有数据只在设备之间直连，没有账号、没有遥测、没有云中转

**不太适合的情况：**

- 用 iPhone：没有 iOS 客户端，手机相关功能基本享受不到
- 只需要最基础的键鼠共享：Synergy 这类更成熟，配置也更简单
- 要求企业级稳定与技术支持：这是一个个人主导的新项目，GPL-3.0，出问题主要靠 issue 和社区

它最聪明的地方和 Strata 有点像：不改变你已有的工具链，只是在系统层面把设备缝在一起。装完之后该怎么用电脑还是怎么用，只是鼠标会悄悄滑到隔壁那台机器上。

![Mac 与 Windows 电脑相连后，PC 上的应用直接列在 Mac 窗口里](/images/notes/twindesk/computers.jpg)

![安卓平板的主屏和单个 App 分别开在 Mac 的窗口里](/images/notes/twindesk/phone.jpg)

![把平板当成 Mac 的扩展屏](/images/notes/twindesk/second-screen.jpg)

![同一 Wi-Fi、USB、蓝牙、Wi-Fi Direct 和热点，几种连接方式](/images/notes/twindesk/connections.jpg)

## 参考

- 项目主页：<https://github.com/InukaAsith/TwinDesk>
- 简体中文版（汉化分支）：<https://github.com/AChengLinus/TwinDesk-chinese>
- 官网：<https://twin-desk.vercel.app>
- 下载与更新日志：<https://github.com/InukaAsith/TwinDesk/releases>
- Linux 与 Wayland 说明：`docs/nixos.md`、仓库 README 的 Linux 章节
- 架构、构建与汉化实现：仓库 README 的「How it works」「Build and run」「中文界面」
