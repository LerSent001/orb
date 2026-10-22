# Voice-agent integration / 语音交互接入

## English

Run `pnpm install` and `pnpm dev` from the repository root, then open
`http://127.0.0.1:5173/examples/voice-agent/`. For a production preview, run
`pnpm build` and `pnpm preview`, then use the same path on the preview server.

This example uses the actual standalone Web export, displayed in a same-origin
iframe, and connects its public API to the editor's local `OrbAudioInput`.
It requires a WebGPU browser. Microphone capture requires localhost or HTTPS
and an explicit click on **Listen**. There is no API key, AI backend, speech
recognition, or speech synthesis in this example. **Audio file** plays a file
chosen by the user; it is not a generated assistant response. Nothing is uploaded.

| Host state | Exported visual profile | Audio source |
| --- | --- | --- |
| Idle | `idle` | None |
| Listening | `idle` | Microphone, after permission |
| Thinking | `thinking` | None |
| Speaking | `thinking` | Local audio file |
| Muted | `idle` | None; acquisition and playback stop |

The exporter supports two visual profiles, `idle` and `thinking`. Five logical
voice-agent states are mapped by [bridge.ts](./bridge.ts); they are not new
exporter states. [main.ts](./main.ts) handles user gestures, input ownership,
playback completion, permission errors, and cancellation. Paused audio eases
back to silence; finished playback returns to Idle. Mode changes stop the
previous source and clear its audio bands before the next frame.

When integrating your own agent, connect its lifecycle events to the bridge:

```ts
import { createVoiceAgentBridge } from "./bridge";

const bridge = createVoiceAgentBridge(orbWindow.liquidOrb);
bridge.setState("listening");
bridge.setAudioBands({ low: 0.4, mid: 0.2, high: 0.1, all: 0.3 });
bridge.setState("thinking"); // Clears the listening input's bands.
bridge.setState("speaking");
// Feed analysed output audio here, not the microphone input.
bridge.setAudioBands({ low: 0.2, mid: 0.6, high: 0.3, all: 0.5 });
bridge.setState("muted");
```

Supply smoothed, sensitivity-adjusted bands in the range 0–1. Stop your host's
capture/playback resources when changing modes; the bridge only controls the
orb's visual state and bands. The runnable example demonstrates that cleanup.
Keep service credentials on your backend. Choose one of the six audio-capable
presets described in the root README when replacing the Siri preset.

Run `pnpm verify:voice-agent` to check these mappings against the actual
generated Web runtime, including stale-audio clearing and state interruptions.

## 中文

在仓库根目录运行 `pnpm install`、`pnpm dev`，打开
`http://127.0.0.1:5173/examples/voice-agent/`。生产预览运行 `pnpm build`、
`pnpm preview`，在预览服务的相同路径访问。

示例将真实的独立 Web 导出放进同源 iframe，通过公开接口连接编辑器的
`OrbAudioInput`。需要支持 WebGPU 的浏览器。麦克风需要 localhost 或 HTTPS，
仅在点击「聆听」后请求权限。示例不包含 API Key、AI 后端、语音识别或语音合成；
「音频文件」播放用户选择的本地文件，并非自动生成的助手回复。音频不会上传。

| 接入应用状态 | 导出的视觉配置 | 声音来源 |
| --- | --- | --- |
| 空闲 | `idle` | 无 |
| 聆听 | `idle` | 用户授权后的麦克风 |
| 思考 | `thinking` | 无 |
| 说话 | `thinking` | 本地音频文件 |
| 静音 | `idle` | 无；停止采集和播放 |

导出器支持 `idle` 和 `thinking` 两种视觉配置。[bridge.ts](./bridge.ts) 将五个
应用状态映射到这两种配置，没有增加导出状态。[main.ts](./main.ts) 演示用户操作、
声音来源管理、播放结束、权限错误和取消。暂停播放时逐渐回落到静音，播放结束后回到
空闲。切换状态时停止旧来源，并在下一帧前清零旧的声音参数。

接入自己的 Agent 时，将生命周期事件传给 `bridge.setState()`，将平滑且已乘响应
强度的 0–1 频段值传给 `bridge.setAudioBands()`。说话时传入输出声音的频段，
不要继续传入麦克风输入。Bridge 只管理视觉状态和声音参数，声音采集与播放资源由
接入应用负责关闭，示例包含相应清理。服务密钥保留在后端。替换默认 Siri 预设时，
选择根目录 README 中列出的六种支持声音响应的预设之一。

运行 `pnpm verify:voice-agent` 可针对真实生成的 Web 运行时代码检查状态映射、
旧声音清零和中断切换。
