# Liquid Orb Editor

[English](#english) | [中文](#中文)

<a id="english"></a>

## English

A real-time liquid glass orb editor built with React, WebGPU/WGSL, and Toolcraft UI.

Live demo: [https://lersent001.github.io/orb/](https://lersent001.github.io/orb/)

### Features

- 13 editable animated orb presets
- Chinese and English interfaces with automatic browser-language detection and manual switching
- Controls for color, speed, shape, glass refraction, and outer glow
- Dedicated orb preview and in-context scene preview
- Shareable configurations stored in the URL hash
- Standalone Web and SwiftUI/Metal code export
- Identical parameter snapshots across Web and SwiftUI exports
- The same orb animation output from both orb and scene preview modes

### Audio response

Use **Audio response** in the right-side control panel to start the microphone or select a local audio file, then adjust the sensitivity. Audio response is available for Siri Wave, Voice Membrane, Aurora Veil, Neural Plasma, Prismatic Field, and Violet Core. Other presets remain unchanged; switching to an unsupported preset stops the active audio input. Audio is analyzed locally in the browser and is never uploaded. Microphone input is not played back.

Low, mid, and high frequency bands plus overall energy drive the contour, internal distortion, highlights, and motion speed. Input is smoothed to prevent jitter. Pausing audio eases the orb back to its base appearance; stopping the input or setting sensitivity to 0 restores the original preset parameters. Audio modulation is applied after state transitions and does not overwrite presets, colors, or URL parameters. This feature modulates the existing procedural animation; it does not embed or reproduce the reference site's fluid solver.

Web and Swift exports use the same audio-to-parameter mapping. The host application supplies audio capture, frequency analysis, smoothing, and sensitivity. Pass smoothed values from 0 to 1 after applying sensitivity, and pass zero values when audio stops. Exported pages do not request microphone access automatically or bundle the currently selected audio file. Audio source and sensitivity are session-only editor settings and are not included in share links.

```js
window.liquidOrb.setAudioBands({ low: 0.5, mid: 0.3, high: 0.1, all: 0.4 });
window.liquidOrb.setAudioBands(); // Stop audio response
```

```swift
LiquidOrbView(
    state: .thinking,
    audio: LiquidOrbAudio(low: 0.5, mid: 0.3, high: 0.1, all: 0.4)
)
```

Run `node scripts/verify-audio.mjs` to verify preset support, silence behavior, invalid input handling, and Web mapping parity. The script writes Swift parity fixtures to `output/audio-qa/`; run `xcrun swift output/audio-qa/native-check.swift` to verify the Swift mapping.

### Voice-agent example

Run `pnpm dev` and open `/examples/voice-agent/` for a working microphone/file
integration with the standalone Web export. It maps listening, thinking,
speaking, idle, and muted host states to the two exported visual profiles,
stops the previous audio source on mode changes, and clears stale audio bands.
See the [integration guide](examples/voice-agent/README.md) for the mapping,
privacy behavior, and verification command. No AI service or API key is required.

### Maintenance status

This project is under active development. Presets, motion models, editor stability, and parity between WebGPU and SwiftUI/Metal output are continuously refined. OpenAI Codex assists with implementation, regression testing, and releases.

### Local development

Requires Node.js 22, pnpm 11, and a browser with WebGPU support.

```bash
pnpm install
pnpm dev
```

Production build and preview:

```bash
pnpm build
pnpm preview
```

### Project structure

- `src/presets.ts`: preset definitions and default parameters
- `src/orb-uniforms.ts`: the single mapping from editor parameters to GPU uniforms
- `src/orb-renderer.ts`: WebGPU renderer
- `src/orb-audio.ts`: local audio analysis and preset-specific response mapping
- `src/code-export.ts`: Web and SwiftUI exporters
- `effect.wgsl`: browser shader
- `effect.metal`: Metal shader used by SwiftUI exports

### License

Project code is licensed under the [MIT License](LICENSE). Toolcraft UI code in `src/toolcraft` retains its original MIT copyright notice; see [TOOLCRAFT_LICENSE.md](TOOLCRAFT_LICENSE.md).

---

<a id="中文"></a>

## 中文

一个使用 React、WebGPU/WGSL 和 Toolcraft UI 构建的实时液态玻璃球编辑器。

在线使用：[https://lersent001.github.io/orb/](https://lersent001.github.io/orb/)

### 功能

- 13 个可编辑的动态球体预设
- 根据浏览器语言自动显示中文或英文界面，并可随时切换
- 颜色、速度、形状、玻璃折射和外发光参数
- 球体预览与实际场景预览
- 参数通过 URL hash 保存，可直接分享当前效果
- 导出独立 Web 页面和 SwiftUI/Metal 代码
- Web 与 SwiftUI 导出使用同一份参数快照
- 场景模式和球体模式导出同一份球体动画代码

### 声音响应

在右侧「声音响应」中开启麦克风或选择本地音频，然后调节响应强度。支持 Siri 波澜、声纹薄膜、极光帷幕、神经电浆、彩色声场和紫焰流核；其余预设保持原样，切换到不支持的预设时会关闭音频输入。音频只在浏览器本地分析，不会上传，麦克风输入也不会回放。

声音按低频、中频、高频和总能量驱动轮廓、内部扭曲、高光及运动速度。输入经过平滑处理以避免画面抖动；暂停音频会让球体逐渐回落到基础效果，关闭输入或将响应强度设为 0 会恢复原始预设参数。声音映射发生在状态过渡之后，不会改写预设、颜色或 URL 参数。该功能用于调制现有的程序动画，不包含或复刻参考站的流体求解器。

Web 和 Swift 导出包含相同的声音参数映射。音频采集、频谱分析、平滑和响应强度由接入应用提供。请传入已经平滑并乘以响应强度的 0–1 数值，声音停止时传入零值。导出页面不会自动申请麦克风权限，也不会附带编辑器中当前选择的音频文件。声音来源和响应强度只在本次编辑会话中使用，不会写入分享链接。

```js
window.liquidOrb.setAudioBands({ low: 0.5, mid: 0.3, high: 0.1, all: 0.4 });
window.liquidOrb.setAudioBands(); // 停止声音响应
```

```swift
LiquidOrbView(
    state: .thinking,
    audio: LiquidOrbAudio(low: 0.5, mid: 0.3, high: 0.1, all: 0.4)
)
```

运行 `node scripts/verify-audio.mjs` 可检查预设支持范围、静音行为、不合法输入和 Web 参数一致性。脚本会在 `output/audio-qa/` 生成 Swift 对照文件；运行 `xcrun swift output/audio-qa/native-check.swift` 可检查 Swift 映射。

### 语音交互示例

运行 `pnpm dev`，打开 `/examples/voice-agent/`，可体验麦克风／本地文件与独立 Web
导出的接入。示例将聆听、思考、说话、空闲和静音状态映射到两种导出视觉配置，
切换状态时停止旧声音来源并清零声音参数。[接入说明](examples/voice-agent/README.md)
包含状态映射、隐私行为和验证命令。无需 AI 服务或 API Key。

### 维护状态

本项目处于持续迭代维护中。作者持续优化预设、运动模型、编辑器稳定性，以及 WebGPU 与 SwiftUI/Metal 的输出一致性，并使用 OpenAI Codex 辅助代码实现、回归验证和发布。

### 本地运行

需要 Node.js 22、pnpm 11，以及支持 WebGPU 的浏览器。

```bash
pnpm install
pnpm dev
```

生产构建与预览：

```bash
pnpm build
pnpm preview
```

### 代码结构

- `src/presets.ts`：预设和参数默认值
- `src/orb-uniforms.ts`：编辑器参数到 GPU uniform 的唯一映射
- `src/orb-renderer.ts`：WebGPU 渲染器
- `src/orb-audio.ts`：本地音频分析和各预设的声音响应映射
- `src/code-export.ts`：Web 与 SwiftUI 导出
- `effect.wgsl`：浏览器着色器
- `effect.metal`：SwiftUI 导出使用的 Metal 着色器

### 许可证

项目代码使用 [MIT License](LICENSE)。`src/toolcraft` 中的 Toolcraft UI 代码保留其原始 MIT 版权声明，详见 [TOOLCRAFT_LICENSE.md](TOOLCRAFT_LICENSE.md)。
