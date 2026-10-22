import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({ appType: "custom", logLevel: "error", server: { middlewareMode: true, ws: false } });
try {
  const [{ createVoiceAgentBridge, voiceStates }, { createWebExport }, { createPresetOrbStateConfiguration }, { styleNames }] = await Promise.all([
    server.ssrLoadModule("/examples/voice-agent/bridge.ts"),
    server.ssrLoadModule("/src/code-export.ts"),
    server.ssrLoadModule("/src/orb-states.ts"),
    server.ssrLoadModule("/src/presets.ts"),
  ]);
  const zero = { low: 0, mid: 0, high: 0, all: 0 };
  const signal = { low: 0.3, mid: 0.6, high: 0.2, all: 0.5 };
  for (const style of styleNames) {
    const html = createWebExport(createPresetOrbStateConfiguration(style), "thinking");
    const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
    // Execute the real public state/audio API without requesting a GPU.
    const runtime = script.slice(0, script.indexOf("function stopWithError"));
    const window = {};
    const readBands = new Function("window", "document", "performance", `${runtime}; return () => audioBands;`)(
      window, { querySelector: () => ({}) }, { now: () => 1000 },
    );
    const port = window.liquidOrb;
    const bridge = createVoiceAgentBridge(port);
    assert.equal(port.getState(), "idle", `${style}: initial host state`);
    for (const state of voiceStates) {
      bridge.setState(state);
      assert.equal(port.getState(), state === "thinking" || state === "speaking" ? "thinking" : "idle");
      bridge.setAudioBands(signal);
      assert.deepEqual(readBands(), state === "listening" || state === "speaking" ? signal : zero);
    }
    for (const next of voiceStates) {
      bridge.setState("listening");
      bridge.setAudioBands(signal);
      bridge.setState(next);
      assert.deepEqual(readBands(), zero, `${style}: stale audio on listening → ${next}`);
      bridge.setState("speaking");
      bridge.setAudioBands(signal);
      bridge.setState(next);
      assert.deepEqual(readBands(), zero, `${style}: stale audio on speaking → ${next}`);
    }
  }
  console.log(`Voice-agent bridge: ${styleNames.length} presets, all five host states, interrupted transitions and stale audio clearing passed.`);
} finally {
  await server.close();
}
