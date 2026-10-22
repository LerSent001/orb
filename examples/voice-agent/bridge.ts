import type { AudioBands } from "../../src/orb-audio";
import type { OrbStateName } from "../../src/orb-states";

export const voiceStates = ["idle", "listening", "thinking", "speaking", "muted"] as const;
export type VoiceState = (typeof voiceStates)[number];

export type OrbPort = {
  setState(state: OrbStateName): void;
  setAudioBands(bands?: AudioBands): void;
};

// The exporter has two visual profiles. Voice-agent states belong to the host.
const visualStates: Record<VoiceState, OrbStateName> = {
  idle: "idle",
  listening: "idle",
  thinking: "thinking",
  speaking: "thinking",
  muted: "idle",
};

export function createVoiceAgentBridge(orb: OrbPort) {
  let state: VoiceState = "idle";

  function setState(next: VoiceState): void {
    // Clear the previous source's energy before changing logical state.
    orb.setAudioBands();
    orb.setState(visualStates[next]);
    state = next;
  }

  setState("idle");
  return {
    setState,
    setAudioBands(bands: AudioBands): void {
      if (state === "listening" || state === "speaking") orb.setAudioBands(bands);
      else orb.setAudioBands();
    },
  };
}
