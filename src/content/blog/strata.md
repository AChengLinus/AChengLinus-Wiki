---
title: "Strata：在自己的电脑上跑千亿级模型"
description: "36.9k star 的开源本地推理引擎，一键装完就能在消费级显卡上跑 Qwen3.8-Flash-Next 和 DeepSeek V4.1 Flash，还自带 OpenAI / Anthropic 兼容 API，直接接进 Claude Code、Codex CLI 这些现有工具。"
pubDate: "2026-11-01"
badge: "工具"
tags: ["AI", "本地部署", "开源工具"]
heroImage: "/blog/strata/cover.png"
---

> 项目地址：[Niko1221/Strata](https://github.com/Niko1221/Strata) ｜ MIT ｜ 36.9k star ｜ C++ 42.7% · Python 29% · CUDA 11.4%

## 一句话说明白

**把"千亿参数级"的模型塞进你自己的机器跑，并且对上层工具完全透明。**

它不是又一个聊天客户端 —— 聊天界面只是顺手送的。真正的东西在下面：一个用 C++ / CUDA 写的推理引擎，把模型权重、KV cache、显存调度、SSD 卸载这些脏活全包了，然后对外暴露 OpenAI 兼容和 Anthropic 兼容两个 API。

意思是：Claude Code、Codex CLI、OpenCode 这些工具，不用改一行代码，只要把 `base_url` 指向 `localhost`，它们就以为自己在跟云端 API 说话，实际上背后跑的是你显卡上的模型。

## 能跑什么

README 里主推三个：

| 模型 | 说明 |
|---|---|
| **Qwen3.8-Flash-Next** | 主推。推荐 ISTA-DASLab 的量化（Q2_0 / IQ2_XS / IQ3_XXS / IQ3_S），写代码用 Coder 的 IQ1_M |
| **Qwen3.6-35B-A3B** | 中等规模，Unsloth 的 UD-Q4_K_XL 等 |
| **DeepSeekV4.1-Flash-1017** | 最激进的一个，239~274 GB 权重，装不下的部分从 SSD 读 |

那个 DeepSeek 值得单独说 —— 它默认就假设你**放不下**整套权重，所以设计成"内存装一部分、剩下的按需从固态硬盘读"。代价是 245~280 GB 的可用磁盘空间，但换来的是 12 GB 显存的消费级显卡也能把它跑起来（慢，但确实能跑）。

## 硬件覆盖比想象中宽

绝大多数本地推理项目只伺候 NVIDIA，Strata 这张表列得挺全：

- NVIDIA GeForce RTX 20 / 30 / 40 / 50 系
- AMD Radeon RX 7700 / 7800 / 7900、RX 9060 / 9070、AI PRO R9700
- AMD Radeon RX 6800 / 6900（实验性）
- Intel Arc（仅 Linux）
- Apple Silicon M1 及以上
- AMD Ryzen AI Max（Strix Halo）
- NVIDIA DGX Spark

## 速度：先把丑话说前面

拿 DeepSeekV4.1-Flash 2.00bpw 这套权重实测（数据来自项目 README）：

| 硬件 | 输出速度 | 读输入速度 |
|---|---:|---:|
| RTX 5070 12 GB + 64 GB 内存 | 4 ~ 6 tok/s | ~110 tok/s (4K) |
| RTX 3060 12 GB + 46 GB 内存 | 9 ~ 11 tok/s | ~155 tok/s (4K) |
| 1× Radeon AI PRO R9700 + 251 GB 内存 | 21 ~ 25 tok/s | 320 ~ 360 tok/s |
| 4× Radeon AI PRO R9700 | 74 ~ 77 tok/s | 400 ~ 450 tok/s |
| Ryzen AI Max+ 395（128 GB 统一内存） | 19 ~ 21 tok/s（代码）/ 11（聊天） | 87 tok/s (4K) |

**4 到 6 tok/s 是什么体感**：比你自己读字略慢，比等云端 API 超时好。写代码这种需要长输出的场景，会明显难受；问一个问题、让它解释一段报错，是完全可用的。

所以别被"千亿模型"冲昏头 —— **12 GB 显卡跑得动，不等于跑得舒服**。真想要生产力，那一行 4 张 R9700 的 74 tok/s 才是像样的数字。

## 怎么装

**桌面应用**（Windows / Linux / macOS）：去 [Releases](https://github.com/Niko1221/Strata/releases/latest) 下对应的安装包，装完选模型就能聊。首次启动会自动下载适配你显卡的引擎。

**终端**，一行：

```sh
# Linux / macOS
curl -fsSL https://github.com/Niko1221/Strata/releases/latest/download/install.sh -o install.sh && sh install.sh

# Windows PowerShell
irm https://github.com/Niko1221/Strata/releases/latest/download/install.ps1 | iex
```

装完 `strata launch`，跟着提示下模型、起服务。想接自己的工具就跑 `strata connect`，它会打印各个编辑器的配置方法。

也支持从源码构建和 Docker。

## 桌面版长什么样

![Strata 桌面应用：左边对话、中间文件、右边实时预览](/blog/strata/app-chat.png)

这截图挺能说明定位的：不是一个"聊天窗口"，是一个**带工作区的编程环境**。左边是任务和 workspace，中间是对话 + 文件编辑（能看到它跑了 2 条命令、读了 1 个文件、改了 3 个文件、还自己做了语法检查），右边是生成结果的实时预览。左下角显示当前跑的是 `Qwen3.8-Flash-Next / Gyro-S · GPU 1`。

![终端模式下可以实时看模型活动、速度、内存占用](/blog/strata/terminal-monitor.png)

终端模式也不是裸的 `stdin/stdout`，有实时监控面板：速度、内存、最近的请求。

## 我的判断

**值得折腾的情况：**

- 你手上有 12 GB 以上显存的显卡，又刚好想试试本地模型 —— 这套安装体验比 llama.cpp 那套自己编译、自己找 GGUF 友好太多
- 你在意数据不出本机（代码、日志、内部文档）
- 你想给 Claude Code / Codex 这类工具做一个"断网也能用的备用通道"

**不太值得的情况：**

- 只有核显或者 8 GB 以下显存 —— 能跑的都是小模型，不如直接用云端
- 追求速度 —— 本地这条路线的瓶颈在显存带宽，短期内不会变
- 想拿来当主力生产力 —— 4~6 tok/s 的 DeepSeek，写代码会让人抓狂

它最聪明的地方其实是**接口层**：不跟云端 API 抢用户，而是把自己伪装成云端 API。用户工具链完全不用动，想切回云端就是把 base_url 改回去。这种"零迁移成本"的设计，比模型本身跑多快更值得学。

## 参考

- 项目主页：<https://github.com/Niko1221/Strata>
- 模型选择指南：`docs/MODELS.md`
- 安装文档：`docs/INSTALL.md`
- 原理说明：`docs/HOW_IT_WORKS.md`
