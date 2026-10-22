# Contributing / 参与贡献

## English

Open an issue with the preset, browser/OS, reproduction steps, and a share link
from the editor where possible. Audio reports should identify microphone or
file input and whether the issue happens during playback, pause, stop, or a
state change. Do not attach private recordings; use a reproducible test tone
or describe the input instead.

### Before opening a pull request

Use Node.js 22 and pnpm 11, then run:

```sh
pnpm install --frozen-lockfile
pnpm build
```

The build checks all preset/state export snapshots, audio mappings, TypeScript,
and the Vite production bundle. On macOS, also verify the generated native code:

```sh
node scripts/verify-audio.mjs
xcrun swift output/audio-qa/native-check.swift
xcrun swiftc -typecheck output/audio-qa/LiquidOrb.swift
```

The verification workflow runs the Web build on Linux and native audio parity
and Swift typechecking on macOS for pull requests and pushes to `main`.
These checks do not replace browser WebGPU testing or a native rendering check.
Describe your runtime checks and any untested platform in the pull request.
The Pages workflow deploys only from `main`; opening a PR does not deploy it.

### Changes to renderers or audio

- Keep WGSL and Metal behavior aligned and route parameter changes through
  `src/orb-uniforms.ts` rather than separate mappings at each consumer.
- Apply audio after transition sampling. Do not write audio modulation into
  saved presets, colors, or share-link state.
- Keep unsupported audio presets unchanged. Include silence, stop, and invalid
  input cases when changing the audio mapping.
- Add a regression case for the reported behavior and document API changes
  in both English and Chinese. Generated QA files belong in ignored `output/`.

## 中文

提交 Issue 时，请提供预设、浏览器／系统、复现步骤，尽量附上编辑器生成的分享链接。
声音问题还应注明麦克风或文件输入，以及发生在播放、暂停、关闭还是状态切换阶段。
请勿附带私人录音，优先使用可复现的测试音或描述输入。

### 提交 PR 前

使用 Node.js 22、pnpm 11，运行上面的安装和构建命令。构建会检查全部预设／状态的
导出参数、声音映射、TypeScript 和生产打包。macOS 上还请运行上面的 Swift 对照
和导出代码类型检查命令。

自动检查在 PR 和 `main` 推送时运行：Linux 验证 Web 构建，macOS 验证 Swift
声音映射和导出类型。它们不能代替浏览器 WebGPU 或原生渲染检查，请在 PR 中说明
实际运行验证和未测试的平台。Pages 仅从 `main` 部署，创建 PR 不会发布网站。

### 修改渲染器或声音响应

- 保持 WGSL 与 Metal 行为一致，参数通过 `src/orb-uniforms.ts` 统一映射。
- 声音调制放在状态采样之后，不写回预设、颜色或分享链接状态。
- 不支持声音响应的预设保持原样；修改映射时覆盖静音、关闭和不合法输入。
- 为问题增加回归验证，API 文档保持中英文一致；生成的 QA 文件放在忽略的 `output/`。
