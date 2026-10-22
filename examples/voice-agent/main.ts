import { OrbAudioInput } from "../../src/orb-audio";
import { createWebExport } from "../../src/code-export";
import { createPresetOrbStateConfiguration } from "../../src/orb-states";
import { createVoiceAgentBridge, voiceStates, type OrbPort, type VoiceState } from "./bridge";

const zh = navigator.language.toLowerCase().startsWith("zh");
const copy = zh ? {
  heading: "语音反馈", privacy: "音频仅在本机处理，未连接 AI 服务。", guide: "接入说明",
  loading: "正在加载…", opening: "正在打开声音…",
  failed: "无法打开声音，请检查麦克风权限或更换音频文件。",
  labels: { idle: "空闲", listening: "聆听", thinking: "思考", speaking: "音频文件", muted: "静音" },
  status: { idle: "空闲", listening: "正在聆听麦克风", thinking: "思考中", speaking: "音频播放", muted: "已静音" },
} : {
  heading: "Voice feedback", privacy: "Audio stays on this device. No AI service is connected.", guide: "Integration guide",
  loading: "Loading orb…", opening: "Opening audio…",
  failed: "Unable to open audio. Check microphone permission or try another file.",
  labels: { idle: "Idle", listening: "Listen", thinking: "Think", speaking: "Audio file", muted: "Mute" },
  status: { idle: "Idle", listening: "Listening to microphone", thinking: "Thinking", speaking: "Audio playback", muted: "Muted" },
};

function element<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing example element: ${id}`);
  return node as T;
}

const frame = element<HTMLIFrameElement>("orb");
const controls = element<HTMLFieldSetElement>("controls");
const status = element("status");
const fileInput = element<HTMLInputElement>("file");
const playerHost = element("player");
const meter = element<HTMLMeterElement>("level");
const input = new OrbAudioInput();
let bridge: ReturnType<typeof createVoiceAgentBridge>;
let request = 0;
let animationFrame = 0;
let lastFrameAt = 0;

document.documentElement.lang = zh ? "zh-CN" : "en";
element("context").textContent = zh ? "语音交互" : "Voice agent";
element("legend").textContent = zh ? "交互状态" : "Agent state";
frame.title = zh ? "声音响应球体" : "Voice-responsive orb";
element("heading").textContent = copy.heading;
element("privacy").textContent = copy.privacy;
element("guide").textContent = copy.guide;
status.textContent = copy.loading;
meter.setAttribute("aria-label", zh ? "输入音量" : "Input level");

function setState(state: VoiceState): void {
  request++;
  input.stop();
  playerHost.replaceChildren();
  meter.value = 0;
  bridge.setState(state);
  status.textContent = copy.status[state];
  for (const button of controls.querySelectorAll<HTMLButtonElement>("button[data-state]")) {
    button.setAttribute("aria-pressed", String(button.dataset.state === state));
  }
}

async function startAudio(file?: File): Promise<void> {
  setState(file ? "speaking" : "listening");
  const id = request;
  status.textContent = copy.opening;
  try {
    const active = file
      ? await input.file(file, playerHost)
      : await input.microphone(() => setState("idle"));
    if (id !== request || !active) return;
    status.textContent = copy.status[file ? "speaking" : "listening"];
    if (file) {
      const player = playerHost.querySelector("audio");
      if (!player) throw new Error("Audio player was not created");
      player.addEventListener("ended", () => { if (id === request) setState("idle"); }, { once: true });
    }
  } catch (error) {
    if (id !== request) return;
    setState("idle");
    status.textContent = copy.failed;
    console.error(error);
  }
}

for (const state of voiceStates) {
  const button = controls.querySelector<HTMLButtonElement>(`[data-state="${state}"]`);
  if (!button) throw new Error(`Missing state control: ${state}`);
  button.textContent = copy.labels[state];
  button.addEventListener("click", () => {
    if (state === "speaking") fileInput.click();
    else if (state === "listening") void startAudio();
    else setState(state);
  });
}
fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  fileInput.value = "";
  if (file) void startAudio(file);
});

function tick(now: number): void {
  bridge.setAudioBands(input.read(Math.min(0.1, (now - lastFrameAt) / 1000)));
  meter.value = input.level;
  lastFrameAt = now;
  animationFrame = requestAnimationFrame(tick);
}

function startMeter(): void {
  cancelAnimationFrame(animationFrame);
  lastFrameAt = performance.now();
  animationFrame = requestAnimationFrame(tick);
}

frame.addEventListener("load", () => {
  const port = (frame.contentWindow as (Window & { liquidOrb?: OrbPort }) | null)?.liquidOrb;
  if (!port) {
    status.textContent = zh ? "球体加载失败，请刷新页面。" : "Orb failed to load. Reload the page.";
    return;
  }
  bridge = createVoiceAgentBridge(port);
  setState("idle");
  controls.disabled = false;
  startMeter();
});

// Start acquisition only after the user presses Listen or chooses a file.
const exportedOrb = createWebExport(createPresetOrbStateConfiguration("siri"), "idle");
frame.srcdoc = exportedOrb;
window.addEventListener("pagehide", () => {
  request++;
  input.stop();
  bridge?.setState("idle");
  cancelAnimationFrame(animationFrame);
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    // The export releases its GPU device on pagehide; recreate it on restore.
    controls.disabled = true;
    status.textContent = copy.loading;
    frame.srcdoc = exportedOrb;
  }
});
