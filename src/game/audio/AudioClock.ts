export interface AudioClockContext {
  currentTime: number;
  state: AudioContextState;
  resume(): Promise<void>;
}

export class AudioClock {
  readonly context: AudioClockContext;
  private startedAtSeconds = 0;
  private running = false;

  constructor(context: AudioClockContext = new AudioContext()) {
    this.context = context;
  }

  get elapsedMs(): number {
    if (!this.running) {
      return 0;
    }

    return Math.max(0, Math.round((this.context.currentTime - this.startedAtSeconds) * 1000));
  }

  async start(): Promise<void> {
    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    this.startedAtSeconds = this.context.currentTime;
    this.running = true;
  }
}
