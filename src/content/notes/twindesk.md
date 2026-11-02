---
title: "TwinDesk：把电脑和手机拼成一张办公桌"
description: "2.8k star 的开源跨设备协同工具：Mac、Windows、Linux、Android 之间共用一套鼠标键盘，互开应用窗口、把旧电脑或平板当副屏、同步剪贴板与文件，还能在电脑上接打电话、收发短信。不需要账号，也不经过云端。"
pubDate: "2026-11-02"
badge: "工具"
tags: ["跨设备", "开源工具", "效率"]
heroImage: "/images/notes/twindesk/cover.png"
---

> 项目地址：[InukaAsith/TwinDesk](https://github.com/InukaAsith/TwinDesk) ｜ GPL-3.0 ｜ 2.8k star ｜ JavaScript 72.7% · Kotlin 9.0% · C# 4.7% · CSS 4.2% · C 3.8%
>
> 原作者：InukaAsith ｜ 原文语言：英文 ｜ 本文为中文整理，不是逐句翻译

## 一句话说明白

**把所有电脑和手机连成一张桌子，共用一套键鼠、一块剪贴板和一堆窗口。**

它做的事和 Synergy、KDE Connect、微软的「手机连接」有重叠，但走得更远：不只是共享键鼠和剪贴板，而是能把另一台电脑（或安卓手机）的**单个应用**开成自己桌面上的独立窗口，能把旧笔记本、平板变成真正的副屏，还能在电脑上直接接电话、回短信、用手机当摄像头。

免费、开源，没有账号，没有云中转。

## 能做什么

| 方向 | 主要能力 |
|---|---|
| **电脑 ↔ 电脑** | 一套鼠标键盘跨屏使用；扩展屏 / 远程屏；把对方的应用开成独立窗口；跨设备拖拽文件；共享文件夹；共享剪贴板（含图片）；通知与声音互转；`ssh twindesk` 免密终端；网络唤醒 |
| **电脑 ↔ 安卓手机 / 平板** | 接打电话、收发短信；浏览手机相册与全部文件；手机摄像头当摄像头；手机当遥控器 / 手柄；手机屏幕与单个 App 开在电脑窗口；平板当第二块屏幕；剪贴板、通知、文件双向同步 |
| **多设备 Mesh**（测试版） | 三台以上设备同时互联：一只鼠标走过所有屏幕、一个剪贴板、一个通知池；新设备配对一次就自动入网 |

几处细节挺实用：跨设备复制粘贴支持 10MB 以内的图片（电脑上截个图，直接粘到另一台机器）；从 macOS 的分享菜单或 Windows 的「发送到」就能把文件扔过去；复制的密码管理器条目会被自动跳过。

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

## 支持平台

- **macOS 13 Ventura 及以上**（Apple Silicon 与 Intel 都有安装包）
- **Windows 10 / 11**（x64 与 ARM64）
- **Linux**（X11 与 Wayland，x86_64；提供 .deb、AppImage、Arch 包，NixOS 可直接 `nix run`）
- **Android 10 及以上**（手机和平板；走无线调试的完整功能需要 Android 11+）

**没有 iOS 客户端**。iPhone 用户只能被部分功能照顾到，这是它和苹果生态方案最大的差别。

## 怎么装

到 [Releases](https://github.com/InukaAsith/TwinDesk/releases/latest) 下载对应平台的包（当前版本 2.4.0），每台设备都装一份即可。

macOS 用 Homebrew 最省事：

```sh
brew install --cask inukaasith/twindesk/twindesk
```

**第一次打开会被系统拦一下**，因为项目没钱买苹果开发者证书和 Windows 代码签名：

- macOS：拖进 Applications 后打开，提示「无法验证」时点**完成**，再去「系统设置 › 隐私与安全性」点**仍要打开**；如果提示「已损坏」，执行 `xattr -dr com.apple.quarantine /Applications/TwinDesk.app` 再打开。
- Windows：SmartScreen 提示时点「更多信息 › 仍要运行」。注意 Windows 11 开了 **Smart App Control** 的话没有「仍要运行」按钮，基本装不了。
- Android：允许「安装未知应用」，Play Protect 拦截时选「仍要安装」。

装完两边打开，比对一次性配对码即可。手机端的屏幕、应用窗口、触控和键鼠需要开一次**无线调试**（开发者选项里配对，输 6 位码）；文件、剪贴板、通知不需要。小米、红米、POCO 还额外要求打开「USB 调试（安全设置）」，否则能看到画面但触控无效。

## 它是怎么做的

每个平台都是一个 Electron 外壳，旁边跑一个用各平台原生语言写的小助手：macOS 用 Swift（虚拟屏、事件注入、音频、SMB），Windows 用 C#（钩子、SendInput、窗口捕获、原生拖拽），Linux 用 C（X11 的 XInput2 / XTest、Wayland 的 evdev / uinput），手机端是 Kotlin + Jetpack Compose，电脑通过 adb 和 scrcpy 的服务端操控手机。

设备之间的连接始终是一条 TLS 会话，底层可以是局域网、USB（adb）、蓝牙 LE，或者按需拉起的 Wi-Fi Direct；局域网内走 TCP 47800（控制与文件）和 UDP 47801（发现）。文件传输走同端口的 HTTPS，最多四路并行，所以大文件不会把鼠标键盘卡住。

## 几个要知道的坑

- **Mesh 还是测试版**：手机上同一时间只能连一台电脑；Linux 加入 Mesh 只能走同一 Wi-Fi；摄像头、剪贴板图片、拖文件到多台设备这些还没迁过去。
- **Linux 的限制比较实在**：在 Wayland 下把文件拖出到别的设备需要 Xorg 会话；「把本机应用开到对方屏幕上」也要求 Xorg；NVIDIA 闭源驱动不支持用多余输出做扩展屏，得走虚拟显示器方案。
- **它很新**：仓库 2026 年 10 月 14 日才创建，三周冲到 2.8k star，版本号已经到 2.4，更新很快，但也意味着边角问题不会少。
- **未签名安装是常态**：这不是恶意软件的特征，但每次大版本更新后仍可能被系统再拦一次。

## 我的判断

**值得试试的情况：**

- 手边有两台以上电脑（比如 Mac + Windows），想用一套键鼠、一个剪贴板，懒得来回插拔
- 有一台安卓手机或平板，想把它变成副屏、摄像头、遥控器，甚至把手机 App 直接开在电脑桌面上
- 在意隐私：所有数据只在设备之间直连，没有账号、没有遥测、没有云中转
- 正在用 Synergy / KDE Connect / 微软手机连接，但觉得功能不够全

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
- 官网：<https://twin-desk.vercel.app>
- 下载与更新日志：<https://github.com/InukaAsith/TwinDesk/releases>
- Linux 与 Wayland 说明：`docs/nixos.md`、仓库 README 的 Linux 章节
- 架构与构建细节：仓库 README 的「How it works」「Build and run」
