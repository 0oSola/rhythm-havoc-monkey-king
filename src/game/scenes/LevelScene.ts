import Phaser from "phaser";
import { AB_CHORD_WINDOW_MS, GOOD_WINDOW_MS } from "../../shared/constants";
import { AnimationController } from "../animation/AnimationController";
import {
  actionLeadInMsForAsset,
  findLevel1SpriteAsset
} from "../animation/Level1SpriteAssets";
import { AudioClock } from "../audio/AudioClock";
import { createSceneAudioClock } from "../audio/SceneAudioClock";
import { feedbackForResult } from "../feedback/FeedbackSystem";
import { createScoreSummary } from "../feedback/ScoreSystem";
import { normalizeRawInputs } from "../input/InputSystem";
import type { RawInput, RawInputKey } from "../input/InputTypes";
import { createExamTimeline, type ExamTimelineEvent } from "../level/LevelExamTimeline";
import { advanceLevelFlow, createLevelFlowState, type LevelFlowState } from "../level/LevelFlow";
import { parseLevelDefinition } from "../level/LevelLoader";
import { createLevelResultPayload } from "../level/LevelResult";
import gateLevelData from "../level/levels/gate_01.json";
import type {
  FreeTrainingPhaseDefinition,
  LevelActionId,
  LevelActor,
  LevelDefinition,
  OpeningPhaseDefinition,
  PracticePhaseDefinition
} from "../level/LevelTypes";
import { judgeInput } from "../rhythm/JudgeSystem";
import type { InputType, JudgementResult } from "../rhythm/RhythmTypes";
import { BeatHUD } from "../ui/BeatHUD";
import { wrapDialogueText } from "./DialogueTextWrap";
import {
  DEFAULT_DIALOGUE_BUBBLE_STYLE,
  DIALOGUE_BUBBLE_STYLE_STORAGE_KEY,
  mergeDialogueBubbleStyle,
  type DialogueBubbleStyle
} from "./DialogueBubbleStyle";
import { pointerEventForState } from "./LevelSceneInputRouting";
import { ACTOR_LAYOUT, BUBBLE_LAYOUT, STAGE_SHADOWS } from "./LevelSceneLayout";
import {
  bubbleActorForState,
  phaseAudioKeyForState,
  phaseBackgroundKeyForState
} from "./LevelScenePresentation";

export class LevelScene extends Phaser.Scene {
  private readonly animationController = new AnimationController();
  private readonly level: LevelDefinition = parseLevelDefinition(gateLevelData);
  private readonly pendingRawInputs: RawInput[] = [];

  private flowState: LevelFlowState = createLevelFlowState(this.level);
  private hud?: BeatHUD;
  private background?: Phaser.GameObjects.Image;
  private dialogueBubble?: Phaser.GameObjects.Container;
  private activeDialogue?: { actor: LevelActor; text: string };
  private bubbleStyle: DialogueBubbleStyle = DEFAULT_DIALOGUE_BUBBLE_STYLE;
  private bubbleDebugPanel?: HTMLDivElement;
  private bubbleDebugToggle?: HTMLButtonElement;
  private bubbleDebugHint?: HTMLDivElement;
  private devSequenceBuffer = "";
  private readonly handleDevSequenceKeyDown = (event: KeyboardEvent) => {
    this.onDevSequenceKeyDown(event);
  };
  private wukong?: Phaser.GameObjects.Sprite;
  private guard?: Phaser.GameObjects.Sprite;
  private clock?: AudioClock;
  private phaseSound?: Phaser.Sound.BaseSound;
  private phaseSoundKey?: string;
  private phaseSoundLoop?: boolean;

  private practiceLoopIndex = 0;
  private practiceDemoIndex = 0;
  private practicePlayerIndex = 0;
  private practiceLoopJudgements: JudgementResult[] = [];

  private examNpcEvents: readonly ExamTimelineEvent[] = [];
  private examPlayerEvents: readonly ExamTimelineEvent[] = [];
  private examNpcIndex = 0;
  private examPlayerIndex = 0;
  private examJudgements: JudgementResult[] = [];
  private examCombo = 0;

  constructor() {
    super("LevelScene");
  }

  create(): void {
    this.loadBubbleStyle();
    this.createStage();
    this.createBubbleDebugPanel();
    this.hud = new BeatHUD(this, this.level.name);
    this.hud.setScore(0, 0);
    this.hud.setFeedback("按 A 或点击继续", "#ffd166");

    this.input.keyboard?.on("keydown-A", () => this.handleKeyPress("A"));
    this.input.keyboard?.on("keydown-S", () => this.handleKeyPress("S"));
    this.input.once("gameout", () => {
      this.pendingRawInputs.length = 0;
    });
    this.input.on("pointerdown", () => {
      const pointerEvent = pointerEventForState(this.level, this.flowState);

      if (!pointerEvent) {
        return;
      }

      if (pointerEvent.type === "confirm") {
        this.handleConfirm();
        return;
      }

      this.pendingRawInputs.push({
        key: pointerEvent.inputType,
        timeMs: this.time.now
      });
    });

    this.enterPhase(this.flowState);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.destroyBubbleDebugPanel();
    });
  }

  update(): void {
    switch (this.flowState.phaseType) {
      case "free":
        this.flushFreeInputs();
        break;
      case "practice":
        this.updatePracticePhase();
        break;
      case "exam":
        this.updateExamPhase();
        break;
      default:
        break;
    }
  }

  private createStage(): void {
    this.background = this.add.image(480, 270, "level1-opening-bg").setDisplaySize(960, 540);
    this.add.rectangle(480, 270, 960, 540, 0xffffff, 0.04);
    this.add.ellipse(
      STAGE_SHADOWS.guard.x,
      STAGE_SHADOWS.guard.y,
      STAGE_SHADOWS.guard.width,
      STAGE_SHADOWS.guard.height,
      0x6f8ea1,
      0.18
    );
    this.add.ellipse(
      STAGE_SHADOWS.wukong.x,
      STAGE_SHADOWS.wukong.y,
      STAGE_SHADOWS.wukong.width,
      STAGE_SHADOWS.wukong.height,
      0x6f8ea1,
      0.18
    );

    this.guard = this.add
      .sprite(ACTOR_LAYOUT.guard.x, ACTOR_LAYOUT.guard.y, "guard_idle_left_0001")
      .setScale(ACTOR_LAYOUT.guard.scale)
      .setFlipX(ACTOR_LAYOUT.guard.flipX);
    this.guard.play("guard_idle_left");
    this.wukong = this.add
      .sprite(ACTOR_LAYOUT.wukong.x, ACTOR_LAYOUT.wukong.y, "wukong_idle_right_0001")
      .setScale(ACTOR_LAYOUT.wukong.scale)
      .setFlipX(ACTOR_LAYOUT.wukong.flipX);
    this.wukong.play("wukong_idle_right");
  }

  private handleKeyPress(key: RawInputKey): void {
    if (this.flowState.phaseType === "opening" && key === "A") {
      this.handleConfirm();
      return;
    }

    const timeMs =
      this.flowState.phaseType === "practice" || this.flowState.phaseType === "exam"
        ? this.clock?.elapsedMs ?? 0
        : this.time.now;

    this.pendingRawInputs.push({
      key,
      timeMs
    });
  }

  private handleConfirm(): void {
    const nextState = advanceLevelFlow(this.level, this.flowState, { type: "confirm" });
    this.applyFlowState(nextState);
  }

  private enterPhase(state: LevelFlowState): void {
    this.pendingRawInputs.length = 0;
    this.syncPhaseAudioForState(state);
    if (state.phaseType !== "practice" && state.phaseType !== "exam") {
      this.clock = undefined;
    }
    this.syncBackgroundForState(state);

    switch (state.phaseType) {
      case "opening":
        this.enterOpeningPhase(state);
        break;
      case "free":
        this.enterFreePhase(state);
        break;
      case "practice":
        void this.enterPracticePhase(state);
        break;
      case "exam":
        void this.enterExamPhase(state);
        break;
      case "result":
        this.activeDialogue = undefined;
        this.dialogueBubble?.destroy();
        this.scene.start(
          "ResultScene",
          createLevelResultPayload(this.level, createScoreSummary(this.examJudgements))
        );
        break;
    }
  }

  private enterOpeningPhase(state: Extract<LevelFlowState, { phaseType: "opening" }>): void {
    const phase = this.phaseById(state.currentPhaseId) as OpeningPhaseDefinition;
    const dialogue = phase.dialogues[state.dialogueIndex];
    this.showDialogueBubble(dialogue.speaker, dialogue.text);
    this.hud?.setPrompt("按 A 或点击继续");
    this.hud?.setFeedback("门卫拦住了你", "#ffd166");
    this.guard?.play("guard_idle_left", true);
    this.wukong?.play("wukong_idle_right", true);
  }

  private enterFreePhase(state: Extract<LevelFlowState, { phaseType: "free" }>): void {
    const phase = this.phaseById(state.currentPhaseId) as FreeTrainingPhaseDefinition;
    const speaker = bubbleActorForState(this.level, state) ?? "guard";
    this.showDialogueBubble(speaker, phase.prompt);
    this.hud?.setPrompt(this.freePromptForPhase(phase));
    this.hud?.setFeedback("自由练习中", "#7bdff2");
    this.guard?.play("guard_idle_left", true);
    this.wukong?.play("wukong_idle_right", true);
  }

  private async enterPracticePhase(state: Extract<LevelFlowState, { phaseType: "practice" }>): Promise<void> {
    const phase = this.phaseById(state.currentPhaseId) as PracticePhaseDefinition;
    this.practiceLoopIndex = 0;
    this.practiceDemoIndex = 0;
    this.practicePlayerIndex = 0;
    this.practiceLoopJudgements = [];
    this.clock = createSceneAudioClock(this.sound);
    await this.clock.start();
    this.showDialogueBubble("guard", this.practicePromptForPhase(phase, state.passCount));
    this.hud?.setPrompt(this.practicePromptForPhase(phase, state.passCount));
    this.hud?.setFeedback("听示范，下一小节轮到你", "#ffd166");
    this.guard?.play("guard_idle_left", true);
    this.wukong?.play("wukong_idle_right", true);
  }

  private async enterExamPhase(_state: Extract<LevelFlowState, { phaseType: "exam" }>): Promise<void> {
    const timeline = createExamTimeline(this.level);
    this.examNpcEvents = timeline.npcEvents;
    this.examPlayerEvents = timeline.playerEvents;
    this.examNpcIndex = 0;
    this.examPlayerIndex = 0;
    this.examJudgements = [];
    this.examCombo = 0;
    this.clock = createSceneAudioClock(this.sound);
    await this.clock.start();
    this.showDialogueBubble("guard", "正式考核开始。先听，再跟。");
    this.hud?.setPrompt("A 立正 / A+S 敬礼");
    this.hud?.setFeedback("正式检查开始", "#ffd166");
    this.hud?.setScore(0, 0);
    this.guard?.play("guard_idle_left", true);
    this.wukong?.play("wukong_idle_right", true);
  }

  private flushFreeInputs(): void {
    this.flushPendingInputs(this.time.now, (input) => {
      const phase = this.phaseById(this.flowState.currentPhaseId) as FreeTrainingPhaseDefinition;
      const previousCount = this.flowState.phaseType === "free" ? this.flowState.progressCount : 0;

      if (this.level.actions[phase.actionId]?.inputType !== input.type) {
        return;
      }

      this.playReactiveActorAction("wukong", phase.actionId);
      const nextState = advanceLevelFlow(this.level, this.flowState, {
        type: "free-input",
        inputType: input.type
      });

      if (nextState.phaseType === "free") {
        const nextCount = nextState.progressCount;
        const milestone = phase.milestones.find((entry) => entry.count === nextCount);
        if (milestone) {
          this.showDialogueBubble("guard", milestone.text);
        }

        this.hud?.setFeedback(`练习 ${nextCount}/${phase.requiredCount}`, "#7bdff2");
        this.hud?.setPrompt(this.freePromptForPhase(phase));
      }

      if (
        nextState.phaseType !== this.flowState.phaseType ||
        nextState.currentPhaseId !== this.flowState.currentPhaseId
      ) {
        this.applyFlowState(nextState);
        return;
      }

      if (nextState.phaseType === "free" && nextState.progressCount === previousCount) {
        this.hud?.setFeedback("输入无效", "#ff6b6b");
      } else {
        this.flowState = nextState;
      }
    });
  }

  private updatePracticePhase(): void {
    if (!this.clock || this.flowState.phaseType !== "practice") {
      return;
    }

    const phase = this.phaseById(this.flowState.currentPhaseId) as PracticePhaseDefinition;
    const elapsedMs = this.clock.elapsedMs;

    this.playDuePracticeDemoEvents(phase, elapsedMs);
    this.flushPendingInputs(elapsedMs, (input) =>
      this.applyPracticeInput(phase, input.type, input.timeMs)
    );
    this.expirePracticeEvents(phase, elapsedMs);

    const currentLoopEndMs = (this.practiceLoopIndex + 1) * phase.loopDurationMs;
    if (elapsedMs >= currentLoopEndMs) {
      this.completePracticeLoop(phase);
    }
  }

  private playDuePracticeDemoEvents(phase: PracticePhaseDefinition, elapsedMs: number): void {
    while (this.practiceDemoIndex < phase.npcEvents.length) {
      const event = phase.npcEvents[this.practiceDemoIndex];
      const eventTimeMs =
        this.practiceLoopIndex * phase.loopDurationMs +
        event.timeMs -
        this.leadInMsForAction("guard", event.actionId);

      if (elapsedMs < eventTimeMs) {
        break;
      }

      this.practiceDemoIndex += 1;
      this.playTelegraphedActorAction("guard", event.actionId);
      this.playSfxForAction("guard", event.actionId);
    }
  }

  private applyPracticeInput(
    phase: PracticePhaseDefinition,
    inputType: InputType,
    inputTimeMs: number
  ): void {
    const event = phase.playerEvents[this.practicePlayerIndex];
    if (!event) {
      return;
    }

    const targetTimeMs = this.practiceLoopIndex * phase.loopDurationMs + event.timeMs;
    if (inputTimeMs < targetTimeMs - GOOD_WINDOW_MS) {
      return;
    }

    const expectedType = this.level.actions[event.actionId].inputType;
    const judgement = judgeInput({
      inputTimeMs,
      targetTimeMs,
      inputType,
      expectedType
    });

    this.practicePlayerIndex += 1;
    this.practiceLoopJudgements.push(judgement.result);
    this.hud?.setFeedback(
      `${feedbackForResult(judgement.result).label} ${judgement.deltaMs}ms`,
      feedbackForResult(judgement.result).color
    );
    this.playPlayerJudgement(event.actionId, judgement.result);
  }

  private expirePracticeEvents(phase: PracticePhaseDefinition, elapsedMs: number): void {
    while (this.practicePlayerIndex < phase.playerEvents.length) {
      const event = phase.playerEvents[this.practicePlayerIndex];
      const targetTimeMs = this.practiceLoopIndex * phase.loopDurationMs + event.timeMs;
      if (elapsedMs <= targetTimeMs + GOOD_WINDOW_MS) {
        break;
      }

      this.practicePlayerIndex += 1;
      this.practiceLoopJudgements.push("MISS");
      this.hud?.setFeedback("MISS", "#ff6b6b");
      this.playPlayerJudgement(event.actionId, "MISS");
    }
  }

  private completePracticeLoop(phase: PracticePhaseDefinition): void {
    while (this.practicePlayerIndex < phase.playerEvents.length) {
      this.practicePlayerIndex += 1;
      this.practiceLoopJudgements.push("MISS");
    }

    const nextState = advanceLevelFlow(this.level, this.flowState, {
      type: "practice-loop-completed",
      judgements: this.practiceLoopJudgements
    });

    if (
      nextState.currentPhaseId !== this.flowState.currentPhaseId ||
      nextState.phaseType !== this.flowState.phaseType
    ) {
      this.applyFlowState(nextState);
      return;
    }

    const loopPassed = this.practiceLoopJudgements.every((result) => result !== "MISS");
    this.flowState = nextState;
    this.practiceLoopIndex += 1;
    this.practiceDemoIndex = 0;
    this.practicePlayerIndex = 0;
    this.practiceLoopJudgements = [];
    const remaining =
      phase.requiredPassCount - (nextState.phaseType === "practice" ? nextState.passCount : 0);
    this.showDialogueBubble(
      "guard",
      loopPassed ? "不错，继续。" : "没跟上，再来一遍。"
    );
    this.hud?.setPrompt(phase.promptTemplate.replace("{n}", String(remaining)));
    this.hud?.setFeedback(loopPassed ? "通过一轮" : "本轮失败", loopPassed ? "#caffbf" : "#ff6b6b");
    this.guard?.play("guard_idle_left", true);
    this.wukong?.play("wukong_idle_right", true);
  }

  private updateExamPhase(): void {
    if (!this.clock || this.flowState.phaseType !== "exam") {
      return;
    }

    const elapsedMs = this.clock.elapsedMs;
    this.playDueExamNpcEvents(elapsedMs);
    this.flushPendingInputs(elapsedMs, (input) => this.applyExamInput(input.type, input.timeMs));
    this.expireExamEvents(elapsedMs);

    if (this.examPlayerIndex >= this.examPlayerEvents.length && this.examPlayerEvents.length > 0) {
      const lastTargetTimeMs = this.examPlayerEvents[this.examPlayerEvents.length - 1].timeMs;
      if (elapsedMs > lastTargetTimeMs + GOOD_WINDOW_MS) {
        this.applyFlowState({
          phaseType: "result",
          currentPhaseId: "result"
        });
      }
    }
  }

  private playDueExamNpcEvents(elapsedMs: number): void {
    while (this.examNpcIndex < this.examNpcEvents.length) {
      const event = this.examNpcEvents[this.examNpcIndex];
      const triggerTimeMs = event.timeMs - this.leadInMsForAction("guard", event.actionId);
      if (elapsedMs < triggerTimeMs) {
        break;
      }

      this.examNpcIndex += 1;
      this.playTelegraphedActorAction("guard", event.actionId);
      this.playSfxForAction("guard", event.actionId);
      this.hud?.setFeedback(`示范：${this.level.actions[event.actionId].name}`, "#7bdff2");
    }
  }

  private applyExamInput(inputType: InputType, inputTimeMs: number): void {
    const event = this.examPlayerEvents[this.examPlayerIndex];
    if (!event) {
      return;
    }

    if (inputTimeMs < event.timeMs - GOOD_WINDOW_MS) {
      return;
    }

    const judgement = judgeInput({
      inputTimeMs,
      targetTimeMs: event.timeMs,
      inputType,
      expectedType: event.inputType
    });

    this.examPlayerIndex += 1;
    this.examJudgements.push(judgement.result);
    this.examCombo = judgement.result === "MISS" ? 0 : this.examCombo + 1;
    this.playPlayerJudgement(event.actionId, judgement.result);
    this.hud?.setFeedback(
      `${feedbackForResult(judgement.result).label} ${judgement.deltaMs}ms`,
      feedbackForResult(judgement.result).color
    );
    this.hud?.setScore(this.examCombo, createScoreSummary(this.examJudgements).score);
  }

  private expireExamEvents(elapsedMs: number): void {
    while (this.examPlayerIndex < this.examPlayerEvents.length) {
      const event = this.examPlayerEvents[this.examPlayerIndex];
      if (elapsedMs <= event.timeMs + GOOD_WINDOW_MS) {
        break;
      }

      this.examPlayerIndex += 1;
      this.examJudgements.push("MISS");
      this.examCombo = 0;
      this.playPlayerJudgement(event.actionId, "MISS");
      this.hud?.setFeedback("MISS", "#ff6b6b");
      this.hud?.setScore(this.examCombo, createScoreSummary(this.examJudgements).score);
    }
  }

  private playTelegraphedActorAction(actor: LevelActor, actionId: LevelActionId): void {
    const sprite = actor === "guard" ? this.guard : this.wukong;
    if (!sprite) {
      return;
    }

    sprite.setFlipX(ACTOR_LAYOUT[actor].flipX);
    const action = actionNameForActionId(actionId);
    const direction = actor === "guard" ? "left" : "right";
    this.animationController.playTelegraphedAction(sprite, actor, action, direction);
  }

  private playReactiveActorAction(actor: LevelActor, actionId: LevelActionId): void {
    const sprite = actor === "guard" ? this.guard : this.wukong;
    if (!sprite) {
      return;
    }

    sprite.setFlipX(ACTOR_LAYOUT[actor].flipX);
    const action = actionNameForActionId(actionId);
    const direction = actor === "guard" ? "left" : "right";
    this.animationController.playReactiveAction(sprite, actor, action, direction);
  }

  private playPlayerJudgement(actionId: LevelActionId, judgement: JudgementResult): void {
    if (!this.wukong) {
      return;
    }

    this.wukong.setFlipX(ACTOR_LAYOUT.wukong.flipX);
    const action = actionNameForActionId(actionId);
    this.animationController.playJudgement(this.wukong, "wukong", action, "right", judgement);
    if (judgement !== "MISS") {
      this.playSfxForAction("wukong", actionId);
      return;
    }

    this.sound.play("PLAYER-failed.wav", { volume: 0.8 });
  }

  private playSfxForAction(actor: LevelActor, actionId: LevelActionId): void {
    const action = this.level.actions[actionId];
    const key = actor === "guard" ? action.npcSfxKey : action.playerSfxKey;

    if (!key) {
      return;
    }

    this.sound.play(key, { volume: 0.7 });
  }

  private leadInMsForAction(actor: LevelActor, actionId: LevelActionId): number {
    const action = actionNameForActionId(actionId);
    const direction = actor === "guard" ? "left" : "right";
    const asset = findLevel1SpriteAsset(actor, action, direction);

    return asset ? actionLeadInMsForAsset(asset) : 0;
  }

  private stopPhaseAudio(): void {
    if (!this.phaseSound) {
      return;
    }

    this.phaseSound.stop();
    this.phaseSound.destroy();
    this.phaseSound = undefined;
    this.phaseSoundKey = undefined;
    this.phaseSoundLoop = undefined;
  }

  private syncPhaseAudioForState(state: LevelFlowState): void {
    const audioKey = phaseAudioKeyForState(this.level, state);
    const shouldLoop = state.phaseType !== "exam";
    const volume = state.phaseType === "practice" ? 0.7 : state.phaseType === "exam" ? 0.85 : 0.55;

    if (!audioKey) {
      this.stopPhaseAudio();
      return;
    }

    if (this.phaseSound && this.phaseSoundKey === audioKey && this.phaseSoundLoop === shouldLoop) {
      return;
    }

    this.stopPhaseAudio();
    this.phaseSound = this.sound.add(audioKey, { loop: shouldLoop, volume });
    this.phaseSoundKey = audioKey;
    this.phaseSoundLoop = shouldLoop;
    this.phaseSound.play();
  }

  private applyFlowState(nextState: LevelFlowState): void {
    this.flowState = nextState;
    this.enterPhase(this.flowState);
  }

  private flushPendingInputs(
    currentTimeMs: number,
    handler: (input: { type: InputType; timeMs: number }) => void
  ): void {
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
        normalizeRawInputs([first, chord]).forEach(handler);
        processed = true;
        continue;
      }

      if (currentTimeMs - first.timeMs > AB_CHORD_WINDOW_MS) {
        this.pendingRawInputs.shift();
        normalizeRawInputs([first]).forEach(handler);
        processed = true;
      }
    }
  }

  private phaseById(phaseId: string) {
    const phase = this.level.phases.find((entry) => entry.id === phaseId);
    if (!phase) {
      throw new Error(`Unknown phase id: ${phaseId}`);
    }

    return phase;
  }

  private freePromptForPhase(phase: FreeTrainingPhaseDefinition): string {
    return `${phase.prompt} (${inputLabelForType(this.level.actions[phase.actionId].inputType)})`;
  }

  private practicePromptForPhase(phase: PracticePhaseDefinition, passCount: number): string {
    const remaining = phase.requiredPassCount - passCount;
    return phase.promptTemplate.replace("{n}", String(remaining));
  }

  private syncBackgroundForState(state: LevelFlowState): void {
    if (!this.background) {
      return;
    }

    const backgroundKey = phaseBackgroundKeyForState(this.level, state);
    if (this.background.texture.key !== backgroundKey) {
      this.background.setTexture(backgroundKey);
    }
  }

  private showDialogueBubble(actor: LevelActor, text: string): void {
    this.dialogueBubble?.destroy();
    this.activeDialogue = { actor, text };

    const layout = BUBBLE_LAYOUT[actor];
    const anchor = actor === "guard" ? this.guard : this.wukong;
    const baseX = anchor?.x ?? 0;
    const baseY = anchor?.y ?? 0;
    const bubbleStyle = this.bubbleStyle;
    const maxWidth = Math.min(
      bubbleStyle.maxTextWidth,
      this.maxBubbleTextWidthForActor(actor, baseX)
    );
    const wrappedText = wrapDialogueText(
      text,
      maxWidth,
      (value) => this.measureDialogueTextWidth(value, bubbleStyle)
    );
    const bubbleText = this.add
      .text(0, 0, wrappedText, {
        color: bubbleStyle.textColor,
        fontSize: `${bubbleStyle.fontSize}px`,
        align: "left",
        padding: {
          top: bubbleStyle.textPaddingTop,
          bottom: bubbleStyle.textPaddingBottom,
          left: bubbleStyle.textPaddingLeft,
          right: bubbleStyle.textPaddingRight
        }
      })
      .setLineSpacing(bubbleStyle.lineSpacing)
      .setOrigin(0, 0);
    const textBounds = bubbleText.getBounds();

    const nameText = this.add
      .text(0, -70, speakerLabel(actor), {
        color: "#fff7e8",
        fontSize: "16px",
        fontStyle: "bold",
        backgroundColor: "#5a3d2b",
        padding: { left: 10, right: 10, top: 4, bottom: 4 }
      })
      .setOrigin(0.5);

    const measuredTextHeight = this.measureBubbleHeight(wrappedText, bubbleStyle);
    const bubbleWidth = Math.max(
      bubbleStyle.minBubbleWidth,
      Math.min(maxWidth + bubbleStyle.paddingX * 2, textBounds.width + bubbleStyle.paddingX * 2)
    );
    const bubbleHeight =
      measuredTextHeight +
      bubbleStyle.paddingTop +
      bubbleStyle.paddingBottom +
      bubbleStyle.textOffsetY;
    const bubbleShape = this.add.graphics();
    const tailPoints = createBubbleTailPoints(layout.tailDirection, bubbleWidth, bubbleHeight);
    bubbleText.setPosition(
      -bubbleWidth / 2 + bubbleStyle.paddingX,
      -bubbleHeight / 2 + bubbleStyle.paddingTop + bubbleStyle.textOffsetY
    );

    bubbleShape.fillStyle(0xfffbf2, 0.96);
    bubbleShape.lineStyle(3, 0x68472f, 1);
    bubbleShape.fillRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 20);
    bubbleShape.strokeRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 20);
    bubbleShape.fillTriangle(
      tailPoints.baseA.x,
      tailPoints.baseA.y,
      tailPoints.tip.x,
      tailPoints.tip.y,
      tailPoints.baseB.x,
      tailPoints.baseB.y
    );
    bubbleShape.lineBetween(
      tailPoints.baseA.x,
      tailPoints.baseA.y,
      tailPoints.tip.x,
      tailPoints.tip.y
    );
    bubbleShape.lineBetween(
      tailPoints.tip.x,
      tailPoints.tip.y,
      tailPoints.baseB.x,
      tailPoints.baseB.y
    );

    const bubbleX = Phaser.Math.Clamp(
      baseX + layout.offsetX,
      bubbleWidth / 2 + 32,
      this.scale.width - bubbleWidth / 2 - 32
    );
    const bubbleY = Phaser.Math.Clamp(
      baseY + layout.offsetY,
      bubbleHeight / 2 + 24,
      this.scale.height - bubbleHeight / 2 - 24
    );

    this.dialogueBubble = this.add.container(bubbleX, bubbleY, [
      bubbleShape,
      bubbleText,
      nameText
    ]);
  }

  private maxBubbleTextWidthForActor(actor: LevelActor, actorX: number): number {
    const edgePadding = 28;
    const actorPadding = 36;
    const availableWidth =
      actor === "guard"
        ? actorX - edgePadding - actorPadding
        : this.scale.width - actorX - edgePadding - actorPadding;

    return Phaser.Math.Clamp(availableWidth - 24, 180, 320);
  }

  private measureDialogueTextWidth(value: string, bubbleStyle: DialogueBubbleStyle): number {
    const probe = this.add.text(-9999, -9999, value, {
      fontSize: `${bubbleStyle.fontSize}px`,
      padding: {
        top: bubbleStyle.textPaddingTop,
        bottom: bubbleStyle.textPaddingBottom,
        left: bubbleStyle.textPaddingLeft,
        right: bubbleStyle.textPaddingRight
      }
    });
    probe.setLineSpacing(bubbleStyle.lineSpacing);
    const width = probe.getBounds().width;
    probe.destroy();
    return width;
  }

  private measureBubbleHeight(value: string, bubbleStyle: DialogueBubbleStyle): number {
    const probe = this.add.text(-9999, -9999, value, {
      fontSize: `${bubbleStyle.fontSize}px`,
      align: "left",
      padding: {
        top: bubbleStyle.textPaddingTop,
        bottom: bubbleStyle.textPaddingBottom,
        left: bubbleStyle.textPaddingLeft,
        right: bubbleStyle.textPaddingRight
      }
    });
    probe.setLineSpacing(bubbleStyle.lineSpacing);
    const height = probe.getBounds().height;
    probe.destroy();
    return height;
  }

  private loadBubbleStyle(): void {
    if (typeof window === "undefined" || !window.localStorage) {
      this.bubbleStyle = DEFAULT_DIALOGUE_BUBBLE_STYLE;
      return;
    }

    try {
      const rawValue = window.localStorage.getItem(DIALOGUE_BUBBLE_STYLE_STORAGE_KEY);
      if (!rawValue) {
        this.bubbleStyle = DEFAULT_DIALOGUE_BUBBLE_STYLE;
        return;
      }

      const parsed = JSON.parse(rawValue) as Partial<DialogueBubbleStyle>;
      this.bubbleStyle = mergeDialogueBubbleStyle(DEFAULT_DIALOGUE_BUBBLE_STYLE, parsed);
    } catch {
      this.bubbleStyle = DEFAULT_DIALOGUE_BUBBLE_STYLE;
    }
  }

  private persistBubbleStyle(): void {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }

    window.localStorage.setItem(
      DIALOGUE_BUBBLE_STYLE_STORAGE_KEY,
      JSON.stringify(this.bubbleStyle)
    );
  }

  private rerenderActiveDialogueBubble(): void {
    if (!this.activeDialogue) {
      return;
    }

    this.showDialogueBubble(this.activeDialogue.actor, this.activeDialogue.text);
  }

  private createBubbleDebugPanel(): void {
    if (typeof document === "undefined") {
      return;
    }

    const host = document.getElementById("app");
    if (!host) {
      return;
    }

    host.style.position = "relative";

    const panel = document.createElement("div");
    panel.dataset.role = "bubble-debug-panel";
    Object.assign(panel.style, {
      position: "absolute",
      top: "12px",
      right: "12px",
      zIndex: "20",
      width: "220px",
      padding: "12px",
      borderRadius: "12px",
      background: "rgba(24, 19, 15, 0.9)",
      border: "1px solid rgba(247, 239, 224, 0.18)",
      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.28)",
      color: "#f7efe0",
      fontFamily: "\"Microsoft YaHei\", \"PingFang SC\", sans-serif",
      fontSize: "12px",
      display: "none",
      gap: "8px",
      pointerEvents: "auto"
    } satisfies Partial<CSSStyleDeclaration>);

    const header = document.createElement("div");
    Object.assign(header.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px"
    } satisfies Partial<CSSStyleDeclaration>);

    const title = document.createElement("div");
    title.textContent = "Bubble Text Panel";
    Object.assign(title.style, {
      fontSize: "13px",
      fontWeight: "700"
    } satisfies Partial<CSSStyleDeclaration>);

    const minimizeButton = document.createElement("button");
    minimizeButton.type = "button";
    minimizeButton.textContent = "−";
    Object.assign(minimizeButton.style, {
      width: "24px",
      height: "24px",
      borderRadius: "999px",
      border: "none",
      background: "rgba(255, 255, 255, 0.12)",
      color: "#f7efe0",
      cursor: "pointer",
      fontWeight: "700"
    } satisfies Partial<CSSStyleDeclaration>);
    minimizeButton.addEventListener("click", () => {
      this.setBubbleDebugCollapsed(true);
    });

    header.append(title, minimizeButton);
    panel.appendChild(header);

    const controls: Array<{
      key: keyof DialogueBubbleStyle;
      label: string;
      min?: number;
      max?: number;
      step?: number;
      type?: "number" | "color";
    }> = [
      { key: "fontSize", label: "Font", min: 12, max: 40, step: 1 },
      { key: "lineSpacing", label: "Line", min: 0, max: 24, step: 1 },
      { key: "maxTextWidth", label: "Width", min: 140, max: 420, step: 1 },
      { key: "paddingX", label: "Pad X", min: 8, max: 48, step: 1 },
      { key: "paddingTop", label: "Pad Top", min: 8, max: 40, step: 1 },
      { key: "paddingBottom", label: "Pad Bottom", min: 8, max: 48, step: 1 },
      { key: "textOffsetY", label: "Text Y", min: 0, max: 16, step: 1 },
      { key: "textPaddingTop", label: "Text Top", min: 0, max: 16, step: 1 },
      { key: "textPaddingBottom", label: "Text Bot", min: 0, max: 16, step: 1 },
      { key: "textPaddingLeft", label: "Text Left", min: 0, max: 16, step: 1 },
      { key: "textPaddingRight", label: "Text Right", min: 0, max: 16, step: 1 },
      { key: "minBubbleWidth", label: "Min W", min: 120, max: 320, step: 1 },
      { key: "textColor", label: "Color", type: "color" }
    ];

    controls.forEach((control) => {
      const row = document.createElement("label");
      Object.assign(row.style, {
        display: "grid",
        gridTemplateColumns: "68px 1fr",
        gap: "8px",
        alignItems: "center"
      } satisfies Partial<CSSStyleDeclaration>);

      const textLabel = document.createElement("span");
      textLabel.textContent = control.label;

      const input = document.createElement("input");
      input.type = control.type ?? "number";
      input.value = String(this.bubbleStyle[control.key]);
      Object.assign(input.style, {
        width: "100%",
        boxSizing: "border-box",
        borderRadius: "8px",
        border: "1px solid rgba(247, 239, 224, 0.22)",
        background: "rgba(255, 255, 255, 0.06)",
        color: "#f7efe0",
        padding: control.type === "color" ? "2px" : "6px 8px"
      } satisfies Partial<CSSStyleDeclaration>);

      if (control.type !== "color") {
        if (control.min !== undefined) {
          input.min = String(control.min);
        }
        if (control.max !== undefined) {
          input.max = String(control.max);
        }
        if (control.step !== undefined) {
          input.step = String(control.step);
        }
      }

      input.addEventListener("input", () => {
        const nextValue =
          control.type === "color" ? input.value : Number.parseInt(input.value, 10);
        this.bubbleStyle = mergeDialogueBubbleStyle(this.bubbleStyle, {
          [control.key]: nextValue
        } as Partial<DialogueBubbleStyle>);
        input.value = String(this.bubbleStyle[control.key]);
        this.persistBubbleStyle();
        this.rerenderActiveDialogueBubble();
      });

      row.append(textLabel, input);
      panel.appendChild(row);
    });

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.textContent = "Reset";
    Object.assign(resetButton.style, {
      marginTop: "4px",
      border: "none",
      borderRadius: "8px",
      background: "#f6bd60",
      color: "#2f241c",
      fontWeight: "700",
      padding: "8px 10px",
      cursor: "pointer"
    } satisfies Partial<CSSStyleDeclaration>);
    resetButton.addEventListener("click", () => {
      this.bubbleStyle = DEFAULT_DIALOGUE_BUBBLE_STYLE;
      this.persistBubbleStyle();
      this.destroyBubbleDebugPanel();
      this.createBubbleDebugPanel();
      this.rerenderActiveDialogueBubble();
    });
    panel.appendChild(resetButton);

    host.appendChild(panel);
    this.bubbleDebugPanel = panel;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.textContent = "DEV";
    Object.assign(toggle.style, {
      position: "absolute",
      top: "12px",
      right: "12px",
      zIndex: "21",
      width: "48px",
      height: "48px",
      borderRadius: "999px",
      border: "1px solid rgba(247, 239, 224, 0.18)",
      background: "rgba(24, 19, 15, 0.92)",
      color: "#f7efe0",
      boxShadow: "0 10px 24px rgba(0, 0, 0, 0.24)",
      cursor: "pointer",
      display: "none",
      fontWeight: "700"
    } satisfies Partial<CSSStyleDeclaration>);
    toggle.addEventListener("click", () => {
      this.setBubbleDebugCollapsed(false);
    });
    host.appendChild(toggle);
    this.bubbleDebugToggle = toggle;

    const hint = document.createElement("div");
    hint.textContent = "输入 dev 打开调试面板";
    Object.assign(hint.style, {
      position: "absolute",
      top: "12px",
      right: "12px",
      zIndex: "19",
      padding: "8px 10px",
      borderRadius: "10px",
      background: "rgba(24, 19, 15, 0.82)",
      border: "1px solid rgba(247, 239, 224, 0.14)",
      color: "#f7efe0",
      fontFamily: "\"Microsoft YaHei\", \"PingFang SC\", sans-serif",
      fontSize: "12px",
      pointerEvents: "none"
    } satisfies Partial<CSSStyleDeclaration>);
    host.appendChild(hint);
    this.bubbleDebugHint = hint;

    window.addEventListener("keydown", this.handleDevSequenceKeyDown);
  }

  private destroyBubbleDebugPanel(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", this.handleDevSequenceKeyDown);
    }

    this.bubbleDebugPanel?.remove();
    this.bubbleDebugPanel = undefined;
    this.bubbleDebugToggle?.remove();
    this.bubbleDebugToggle = undefined;
    this.bubbleDebugHint?.remove();
    this.bubbleDebugHint = undefined;
  }

  private onDevSequenceKeyDown(event: KeyboardEvent): void {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const key = event.key.toLowerCase();
    if (!/^[a-z]$/.test(key)) {
      this.devSequenceBuffer = "";
      return;
    }

    this.devSequenceBuffer = `${this.devSequenceBuffer}${key}`.slice(-3);
    if (this.devSequenceBuffer !== "dev") {
      return;
    }

    this.devSequenceBuffer = "";
    this.setBubbleDebugCollapsed(false);
  }

  private setBubbleDebugCollapsed(collapsed: boolean): void {
    if (this.bubbleDebugPanel) {
      this.bubbleDebugPanel.style.display = collapsed ? "none" : "grid";
    }

    if (this.bubbleDebugToggle) {
      this.bubbleDebugToggle.style.display = collapsed ? "inline-flex" : "none";
      this.bubbleDebugToggle.style.alignItems = "center";
      this.bubbleDebugToggle.style.justifyContent = "center";
    }

    if (this.bubbleDebugHint) {
      this.bubbleDebugHint.style.display =
        collapsed || this.bubbleDebugPanel?.style.display === "grid" ? "none" : "block";
    }
  }
}

function speakerLabel(actor: LevelActor): string {
  return actor === "guard" ? "门卫" : "悟空";
}

function actionNameForActionId(actionId: LevelActionId): string {
  switch (actionId) {
    case "ATTENTION":
      return "attention";
    case "SALUTE":
      return "salute";
    default:
      return actionId.toLowerCase();
  }
}

function inputLabelForType(inputType: InputType): string {
  switch (inputType) {
    case "AB":
      return "A+S";
    default:
      return inputType;
  }
}

function createBubbleTailPoints(
  tailDirection: "left" | "right",
  bubbleWidth: number,
  bubbleHeight: number
): {
  baseA: { x: number; y: number };
  tip: { x: number; y: number };
  baseB: { x: number; y: number };
} {
  const baseY = bubbleHeight / 2 - 2;
  const tipY = bubbleHeight / 2 + 26;

  if (tailDirection === "right") {
    return {
      baseA: {
        x: bubbleWidth / 2 - 126,
        y: baseY
      },
      tip: {
        x: bubbleWidth / 2 - 30,
        y: tipY
      },
      baseB: {
        x: bubbleWidth / 2 - 72,
        y: baseY
      }
    };
  }

  return {
    baseA: {
      x: -bubbleWidth / 2 + 72,
      y: baseY
    },
    tip: {
      x: -bubbleWidth / 2 + 30,
      y: tipY
    },
    baseB: {
      x: -bubbleWidth / 2 + 126,
      y: baseY
    }
  };
}
