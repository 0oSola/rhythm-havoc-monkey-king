import Phaser from "phaser";
import { AB_CHORD_WINDOW_MS, DEFAULT_BEATS_PER_BAR, GOOD_WINDOW_MS } from "../../shared/constants";
import { AnimationController } from "../animation/AnimationController";
import { AudioClock } from "../audio/AudioClock";
import { feedbackForResult } from "../feedback/FeedbackSystem";
import { createScoreSummary } from "../feedback/ScoreSystem";
import { normalizeRawInputs } from "../input/InputSystem";
import type { RawInput, RawInputKey } from "../input/InputTypes";
import gateLevelData from "../level/levels/gate_01.json";
import { parseLevelDefinition } from "../level/LevelLoader";
import { cueForTimelineNote } from "../level/LevelPlayback";
import type { LevelDefinition } from "../level/LevelTypes";
import { createBeatTimeline } from "../rhythm/BeatTimeline";
import { judgeInput } from "../rhythm/JudgeSystem";
import type { JudgementResult, TimelineNote } from "../rhythm/RhythmTypes";
import { BeatHUD } from "../ui/BeatHUD";
import { createInputHint } from "../ui/InputHint";

export class LevelScene extends Phaser.Scene {
  private readonly animationController = new AnimationController();
  private readonly level: LevelDefinition = parseLevelDefinition(gateLevelData);
  private readonly pendingRawInputs: RawInput[] = [];
  private hud?: BeatHUD;
  private clock?: AudioClock;
  private wukong?: Phaser.GameObjects.Sprite;
  private guard?: Phaser.GameObjects.Sprite;
  private demoNotes: TimelineNote[] = [];
  private playerNotes: TimelineNote[] = [];
  private nextDemoNoteIndex = 0;
  private currentNoteIndex = 0;
  private judgements: JudgementResult[] = [];
  private started = false;
  private finished = false;
  private combo = 0;

  constructor() {
    super("LevelScene");
  }

  create(): void {
    const timelineNotes = createBeatTimeline({
      bpm: this.level.bpm,
      beatsPerBar: DEFAULT_BEATS_PER_BAR,
      units: this.level.units
    });
    this.demoNotes = timelineNotes.filter((note) => note.phase === "demo");
    this.playerNotes = timelineNotes.filter((note) => note.phase === "player");

    this.createStage();
    this.hud = new BeatHUD(this, this.level.name);
    this.hud.setScore(0, 0);
    createInputHint(this, 404, 456, "A");
    createInputHint(this, 484, 456, "S/B");
    createInputHint(this, 580, 456, "A+S");

    this.input.keyboard?.once("keydown-SPACE", () => {
      void this.startLevel();
    });
    this.input.keyboard?.on("keydown-A", () => this.queueInput("A"));
    this.input.keyboard?.on("keydown-S", () => this.queueInput("B"));
    this.input.keyboard?.on("keydown-B", () => this.queueInput("B"));
  }

  update(): void {
    if (!this.started || !this.clock || this.finished) {
      return;
    }

    const elapsedMs = this.clock.elapsedMs;
    this.playDueDemoNotes(elapsedMs);
    this.flushInputs(elapsedMs);
    this.markExpiredNotes(elapsedMs);
    this.updatePrompt(elapsedMs);
  }

  private createStage(): void {
    this.add.rectangle(480, 270, 960, 540, 0x1f1712);
    this.add.rectangle(480, 410, 820, 18, 0x6d4c36);
    this.add.rectangle(480, 214, 760, 160, 0x2b2018, 0.72).setStrokeStyle(2, 0x6d4c36);
    this.add.text(80, 170, "南天门", {
      color: "#ffd166",
      fontSize: "34px",
      fontStyle: "bold"
    });

    this.guard = this.add.sprite(642, 320, "guard_idle_left_0001").setScale(1.08);
    this.guard.play("guard_idle_left");
    this.wukong = this.add.sprite(330, 320, "wukong_idle_right_0001").setScale(1.1);
    this.wukong.play("wukong_idle_right");
  }

  private async startLevel(): Promise<void> {
    if (this.started) {
      return;
    }

    this.clock = new AudioClock();
    await this.clock.start();
    this.started = true;
    this.hud?.setFeedback("听示范，跟着第二小节打", "#ffd166");
    this.hud?.setPrompt("A 立正 / S 辅助键 / A+S 敬礼");
  }

  private playDueDemoNotes(elapsedMs: number): void {
    const note = this.demoNotes[this.nextDemoNoteIndex];

    if (!note || elapsedMs < note.timeMs) {
      return;
    }

    this.nextDemoNoteIndex += 1;
    const cue = cueForTimelineNote(this.level, note);
    const action = this.level.actions[note.expectedType] ?? "idle";

    if (this.guard) {
      this.animationController.playAction(this.guard, cue?.actor ?? "guard", action, "left");
    }

    if (cue) {
      this.hud?.setFeedback(cue.prompt, "#7bdff2");
    }
  }

  private queueInput(key: RawInputKey): void {
    if (!this.started || !this.clock || this.finished) {
      return;
    }

    this.pendingRawInputs.push({
      key,
      timeMs: this.clock.elapsedMs
    });
  }

  private flushInputs(elapsedMs: number): void {
    let processed = true;

    while (processed && this.pendingRawInputs.length > 0) {
      processed = false;
      this.pendingRawInputs.sort((left, right) => left.timeMs - right.timeMs);
      const first = this.pendingRawInputs[0];
      const chordIndex = this.pendingRawInputs.findIndex(
        (input, index) =>
          index > 0 &&
          input.key !== first.key &&
          input.timeMs - first.timeMs <= AB_CHORD_WINDOW_MS
      );

      if (chordIndex >= 0) {
        const chord = this.pendingRawInputs[chordIndex];
        this.pendingRawInputs.splice(chordIndex, 1);
        this.pendingRawInputs.shift();
        normalizeRawInputs([first, chord]).forEach((input) => this.applyInput(input.type, input.timeMs));
        processed = true;
        continue;
      }

      if (elapsedMs - first.timeMs > AB_CHORD_WINDOW_MS) {
        this.pendingRawInputs.shift();
        normalizeRawInputs([first]).forEach((input) => this.applyInput(input.type, input.timeMs));
        processed = true;
      }
    }
  }

  private applyInput(inputType: TimelineNote["expectedType"], inputTimeMs: number): void {
    const note = this.playerNotes[this.currentNoteIndex];
    if (!note) {
      return;
    }

    const output = judgeInput({
      inputTimeMs,
      targetTimeMs: note.timeMs,
      inputType,
      expectedType: note.expectedType
    });

    this.currentNoteIndex += 1;
    this.judgements.push(output.result);
    this.combo = output.result === "MISS" ? 0 : this.combo + 1;

    const feedback = feedbackForResult(output.result);
    this.hud?.setFeedback(`${feedback.label} ${output.deltaMs}ms`, feedback.color);
    this.playAction(inputType, output.result);
    this.updateScore();
    this.finishIfComplete();
  }

  private markExpiredNotes(elapsedMs: number): void {
    const note = this.playerNotes[this.currentNoteIndex];

    if (!note || elapsedMs - note.timeMs <= GOOD_WINDOW_MS) {
      return;
    }

    this.currentNoteIndex += 1;
    this.judgements.push("MISS");
    this.combo = 0;
    this.hud?.setFeedback("MISS", "#ff6b6b");
    this.wukong?.play("wukong_idle_right", true);
    this.updateScore();
    this.finishIfComplete();
  }

  private updatePrompt(elapsedMs: number): void {
    const note = this.playerNotes[this.currentNoteIndex];
    if (!note) {
      return;
    }

    const cue = cueForTimelineNote(this.level, note);
    const action = this.level.actions[note.expectedType] ?? note.expectedType;
    const seconds = Math.max(0, (note.timeMs - elapsedMs) / 1000).toFixed(1);
    this.hud?.setPrompt(`${cue?.prompt ?? `下一拍 ${action}`} / ${note.expectedType} / ${seconds}s`);
  }

  private updateScore(): void {
    const summary = createScoreSummary(this.judgements);
    this.hud?.setScore(this.combo, summary.score);
  }

  private playAction(inputType: TimelineNote["expectedType"], result: JudgementResult): void {
    const action = this.level.actions[inputType] ?? "idle";

    if (result === "MISS") {
      this.wukong?.setTint(0xff6b6b);
      if (this.wukong) {
        this.animationController.playJudgement(this.wukong, "wukong", action, "right", result);
      }
      this.time.delayedCall(110, () => this.wukong?.clearTint());
      return;
    }

    if (this.wukong) {
      this.animationController.playAction(this.wukong, "wukong", action, "right");
    }
  }

  private finishIfComplete(): void {
    if (this.currentNoteIndex < this.playerNotes.length || this.finished) {
      return;
    }

    this.finished = true;
    this.scene.start("ResultScene", createScoreSummary(this.judgements));
  }
}
