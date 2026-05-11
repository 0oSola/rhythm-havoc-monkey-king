import Phaser from "phaser";
import { AB_CHORD_WINDOW_MS, GOOD_WINDOW_MS } from "../../shared/constants";
import { AnimationController } from "../animation/AnimationController";
import {
  actionLeadInMsForAsset,
  findLevel1SpriteAsset,
  playbackDurationMsForAsset
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
  ExamPhaseDefinition,
  FreeTrainingPhaseDefinition,
  LevelActionId,
  LevelActor,
  LevelDefinition,
  OpeningStepKind,
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
import {
  failedSfxKeyForResolvedInput,
  type ResolvedInputFeedback
} from "./LevelInputFeedback";
import { playerSfxKeyForFreeTrainingInput } from "./LevelFreeTrainingAudio";
import {
  canInterruptCurrentAnimationWithLoop,
  idleAnimationKeyForActor,
  loopAnimationTimeScaleForKey,
  SHARED_IDLE_ANIMATION_TIME_SCALE
} from "./LevelSharedIdle";
import {
  didPracticePassIncrement,
  shouldRestartPracticeLoopAudio
} from "./LevelPracticeLoopState";
import { pointerEventForState } from "./LevelSceneInputRouting";
import {
  ACTOR_LAYOUT,
  BUBBLE_LAYOUT,
  GUARD_PRAISE_IDLE_REPOSITION_DELAY_MS,
  GUARD_PRAISE_OFFSET_X,
  GUARD_PRAISE_OFFSET_Y,
  OPENING_RUN_IN_DURATION_MS,
  openingRunInFlipXForActor,
  STAGE_SHADOWS,
  watchCueFlipXForActor
} from "./LevelSceneLayout";
import {
  bubbleActorForState,
  freeHudPromptForPhase,
  practiceBubblePromptForPhase,
  practiceHudPromptForPhase,
  phaseAudioKeyForState,
  phaseBackgroundKeyForState
} from "./LevelScenePresentation";
import {
  createExamCueWindows,
  dialogueConfirmSfxKeyForState,
  isFullHitBar,
  practiceHandoffCueWindow,
  practicePraiseCueTimeMs,
  type ExamCueWindow
} from "./LevelCueRules";
import {
  consumeLevelDebugSequence,
  debugAnimationPreviewForCommand,
  debugAnimationPreviewIntervalMsForCommand,
  levelFlowStateForDebugCommand
} from "./LevelSceneDebugCommands";
import {
  canConfirmOpeningStep,
  openingAdvanceSfxKeyForStep,
  openingDisplayTextForStep,
  openingShouldForceIdleReset,
  type OpeningStoryAdvanceResult,
  openingRevealSfxKeyForStep,
  OPENING_CONTINUE_PROMPT_COLOR,
  OPENING_CONTINUE_PROMPT_FONT_SIZE_PX,
  OPENING_STORY_FONT_SIZE_PX,
  OPENING_STORY_LINE_SPACING_PX,
  openingContinuePromptForStep,
  openingShouldAutoAdvanceAfterAnimation,
  openingShouldAcceptAdvanceKey,
  openingShouldUseBeatMatchedIdleLoop,
  openingStoryTopY,
  openingStepAutoAdvanceMs,
  shouldPlayOpeningAdvanceSfx,
  shouldHideBackgroundForOpeningStep
} from "./LevelOpeningStory";
import { beginLevelResultTransition } from "./LevelSceneResultTransition";

const LEVEL_SCENE_DEBUG_ENABLED = import.meta.env.DEV;

export class LevelScene extends Phaser.Scene {
  private readonly animationController = new AnimationController();
  private readonly level: LevelDefinition = parseLevelDefinition(gateLevelData);
  private readonly pendingRawInputs: RawInput[] = [];

  private flowState: LevelFlowState = createLevelFlowState(this.level);
  private hud?: BeatHUD;
  private background?: Phaser.GameObjects.Image;
  private guardShadow?: Phaser.GameObjects.Ellipse;
  private wukongShadow?: Phaser.GameObjects.Ellipse;
  private openingMask?: Phaser.GameObjects.Rectangle;
  private entryFadeOverlay?: Phaser.GameObjects.Rectangle;
  private openingTitleText?: Phaser.GameObjects.Text;
  private openingCaptionText?: Phaser.GameObjects.Text;
  private openingStoryText?: Phaser.GameObjects.Text;
  private openingContinueText?: Phaser.GameObjects.Text;
  private openingTypingTimer?: Phaser.Time.TimerEvent;
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
  private openingAdvanceTimer?: Phaser.Time.TimerEvent;
  private openingTypingStepIndex?: number;
  private openingTypingVisibleChars = 0;
  private guardPraiseResetTimer?: Phaser.Time.TimerEvent;
  private debugAnimationPreviewTimer?: Phaser.Time.TimerEvent;

  private practiceLoopIndex = 0;
  private practiceDemoIndex = 0;
  private practicePlayerIndex = 0;
  private practiceLoopJudgements: JudgementResult[] = [];
  private practiceWarmupEndsAtMs?: number;
  private practiceHandoffCueLoop = -1;
  private practicePraiseCueLoop = -1;

  private examNpcEvents: readonly ExamTimelineEvent[] = [];
  private examPlayerEvents: readonly ExamTimelineEvent[] = [];
  private examNpcIndex = 0;
  private examPlayerIndex = 0;
  private examJudgements: JudgementResult[] = [];
  private examCombo = 0;
  private examCueWindows: readonly ExamCueWindow[] = [];
  private examHandoffCueIndex = 0;
  private examPraiseCueIndex = 0;
  private readonly examBarJudgements = new Map<number, JudgementResult[]>();
  private guardCueHoldUntilMs?: number;
  private examAudioComplete = false;

  constructor() {
    super("LevelScene");
  }

  create(): void {
    this.resetState();
    this.loadBubbleStyle();
    this.createStage();
    if (LEVEL_SCENE_DEBUG_ENABLED) {
      this.createBubbleDebugPanel();
    }
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
        this.handleKeyPress("A");
        return;
      }

      if (pointerEvent.type === "confirm") {
        this.playDialogueConfirmSfx();
        this.handleConfirm();
        return;
      }

      this.pendingRawInputs.push({
        key: pointerEvent.inputType,
        timeMs: this.time.now
      });
    });

    this.entryFadeOverlay = this.add
      .rectangle(480, 270, 960, 540, 0x000000, 1)
      .setDepth(50);

    this.time.delayedCall(200, () => {
      this.enterPhase(this.flowState);
      this.tweens.add({
        targets: this.entryFadeOverlay,
        alpha: 0,
        duration: 600,
        ease: "Sine.easeInOut",
        onComplete: () => {
          this.entryFadeOverlay?.destroy();
          this.entryFadeOverlay = undefined;
        }
      });
    });

    if (LEVEL_SCENE_DEBUG_ENABLED) {
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.destroyBubbleDebugPanel();
      });
    }
  }

  update(): void {
    switch (this.flowState.phaseType) {
      case "free":
        this.flushFreeInputs();
        break;
      case "practice":
        if (this.flowState.stage === "warmup") {
          this.updatePracticeWarmupPhase();
        } else {
          this.updatePracticePhase();
        }
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
    this.guardShadow = this.add.ellipse(
      STAGE_SHADOWS.guard.x,
      STAGE_SHADOWS.guard.y,
      STAGE_SHADOWS.guard.width,
      STAGE_SHADOWS.guard.height,
      0x6f8ea1,
      0.18
    );
    this.wukongShadow = this.add.ellipse(
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
    this.playActorIdleLoop("guard");
    this.wukong = this.add
      .sprite(ACTOR_LAYOUT.wukong.x, ACTOR_LAYOUT.wukong.y, "wukong_idle_right_0001")
      .setScale(ACTOR_LAYOUT.wukong.scale)
      .setFlipX(ACTOR_LAYOUT.wukong.flipX);
    this.playActorIdleLoop("wukong");

    this.openingMask = this.add
      .rectangle(480, 270, 960, 540, 0x05070b, 0)
      .setDepth(20)
      .setVisible(false);
    this.openingTitleText = this.add
      .text(480, 226, "南天门", {
        fontSize: "34px",
        color: "#2f241c",
        fontStyle: "bold",
        fontFamily: "\"Microsoft YaHei\", \"PingFang SC\", sans-serif"
      })
      .setOrigin(0.5)
      .setDepth(21)
      .setStroke("#f8f2dc", 8)
      .setShadow(0, 4, "#f8f2dc", 8, false, true)
      .setVisible(false);
    this.openingCaptionText = this.add
      .text(480, 296, "", {
        fontSize: "20px",
        color: "#2f241c",
        fontFamily: "\"Microsoft YaHei\", \"PingFang SC\", sans-serif",
        align: "center"
      })
      .setOrigin(0.5)
      .setDepth(21)
      .setStroke("#fff7e8", 6)
      .setShadow(0, 2, "#fff7e8", 6, false, true)
      .setVisible(false);
    this.openingStoryText = this.add
      .text(190, openingStoryTopY((this.phaseById("opening") as OpeningPhaseDefinition).steps), "", {
        fontSize: `${OPENING_STORY_FONT_SIZE_PX}px`,
        color: "#ffffff",
        fontFamily: "\"Microsoft YaHei\", \"PingFang SC\", sans-serif",
        align: "left",
        lineSpacing: OPENING_STORY_LINE_SPACING_PX,
        wordWrap: {
          width: 580,
          useAdvancedWrap: true
        }
      })
      .setOrigin(0, 0)
      .setDepth(21)
      .setVisible(false);
    this.openingContinueText = this.add
      .text(480, 470, "", {
        fontSize: `${OPENING_CONTINUE_PROMPT_FONT_SIZE_PX}px`,
        color: OPENING_CONTINUE_PROMPT_COLOR,
        fontFamily: "\"Microsoft YaHei\", \"PingFang SC\", sans-serif"
      })
      .setOrigin(0.5)
      .setDepth(21)
      .setVisible(false);
  }

  private handleKeyPress(key: RawInputKey): void {
    if (this.flowState.phaseType === "opening" && key === "A") {
      const advanceResult = this.tryAdvanceOpeningStory();
      if (advanceResult !== "none") {
        if (shouldPlayOpeningAdvanceSfx(advanceResult)) {
          this.playOpeningStoryAdvanceSfx();
        }
        return;
      }
    }

    if (this.flowState.phaseType === "opening" && key === "A" && this.currentOpeningStepAllowsConfirm()) {
      this.playDialogueConfirmSfx();
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
    this.clearDebugAnimationPreview();
    this.syncPhaseAudioForState(state);
    if (state.phaseType !== "practice" && state.phaseType !== "exam") {
      this.clock = undefined;
      this.clearGuardCueHold(true);
    }
    if (state.phaseType !== "practice") {
      this.practiceWarmupEndsAtMs = undefined;
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
        beginLevelResultTransition({
          sound: this.sound,
          add: this.add,
          tweens: this.tweens,
          scene: this.scene,
          payload: createLevelResultPayload(this.level, createScoreSummary(this.examJudgements))
        });
        break;
    }
  }

  private enterOpeningPhase(state: Extract<LevelFlowState, { phaseType: "opening" }>): void {
    this.clearOpeningAdvanceTimer();
    this.clearOpeningTypingTimer();
    const phase = this.phaseById(state.currentPhaseId) as OpeningPhaseDefinition;
    const step = phase.steps[state.stepIndex];
    this.playSharedIdleLoops();
    this.hud?.setPrompt("按 A 或点击继续");
    this.hud?.setPromptVisible(true);
    this.hud?.setFeedbackVisible(true);

    if (!step || step.kind !== "dialogue" || !step.speaker || !step.text) {
      this.activeDialogue = undefined;
      this.dialogueBubble?.destroy();
      this.configureOpeningOverlay(step?.kind ?? null);
      this.scheduleOpeningStoryProgress(phase.steps, state.stepIndex, step);
      return;
    }

    this.configureOpeningOverlay("dialogue");
    this.guard?.setAlpha(1);
    this.wukong?.setAlpha(1);
    this.showDialogueBubble(step.speaker as LevelActor, step.text as string);
    this.hud?.setFeedback("开场对白", "#ffd166");
  }

  private configureOpeningOverlay(
    stepKind:
      | "story-caption"
      | "title-card"
      | "establishing-shot"
      | "wukong-run-in"
      | "guard-reveal"
      | "dialogue"
      | null
  ): void {
    if (
      !this.openingMask ||
      !this.openingTitleText ||
      !this.openingCaptionText ||
      !this.openingStoryText ||
      !this.openingContinueText
    ) {
      return;
    }

    this.openingMask.setVisible(false).setAlpha(0);
    this.openingTitleText.setVisible(false).setAlpha(1);
    this.openingCaptionText.setVisible(false).setAlpha(1);
    this.openingStoryText.setVisible(false).setAlpha(1);
    this.openingContinueText.setVisible(false).setAlpha(1);
    this.background?.setVisible(true);
    this.guardShadow?.setVisible(true);
    this.wukongShadow?.setVisible(true);

    switch (stepKind) {
      case "story-caption": {
        const step = this.currentOpeningStep();
        this.openingMask.setVisible(true).setAlpha(1);
        this.background?.setVisible(false);
        this.guardShadow?.setVisible(false);
        this.wukongShadow?.setVisible(false);
        this.openingStoryText.setText("").setVisible(true);
        this.guard?.setAlpha(0);
        this.wukong?.setAlpha(0);
        this.hud?.setFeedbackVisible(false);
        this.hud?.setPromptVisible(false);
        const continuePrompt = openingContinuePromptForStep(step);
        if (continuePrompt) {
          this.openingContinueText.setText(continuePrompt).setVisible(true);
        }
        return;
      }
      case "title-card":
        this.openingMask.setVisible(true).setAlpha(0.96);
        this.openingTitleText.setText("南天门").setVisible(true);
        this.openingCaptionText.setText("天庭重地，闲猴止步").setVisible(true);
        this.guard?.setAlpha(0);
        this.wukong?.setAlpha(0);
        this.hud?.setFeedback("黑屏字幕：南天门", "#ffd166");
        return;
      case "establishing-shot":
        this.openingMask.setVisible(true).setAlpha(0.22);
        this.openingTitleText.setVisible(false);
        this.openingCaptionText.setText("空镜：南天门外").setVisible(true);
        this.guard?.setAlpha(0);
        this.wukong?.setAlpha(0);
        this.hud?.setFeedback("空镜：南天门外", "#ffd166");
        return;
      case "wukong-run-in":
        this.hud?.setFeedbackVisible(true);
        this.hud?.setPromptVisible(false);
        //this.openingCaptionText.setText("悟空鬼鬼祟祟靠近南天门").setVisible(true);
        this.guard?.setAlpha(0);
        this.wukong?.setAlpha(1);
        this.wukong?.setPosition(796, ACTOR_LAYOUT.wukong.y);
        this.wukong?.setFlipX(openingRunInFlipXForActor("wukong"));
        if (this.wukong?.anims) {
          this.wukong.anims.timeScale = 1;
        }
        this.wukong?.play("wukong_run_right", true);
        if (this.wukong) {
          this.tweens.killTweensOf(this.wukong);
          this.tweens.add({
            targets: this.wukong,
            x: ACTOR_LAYOUT.wukong.x,
            duration: OPENING_RUN_IN_DURATION_MS,
            ease: "Sine.Out",
            onComplete: () => {
              this.advanceOpeningAnimatedStep("wukong-run-in");
            }
          });
        }
        this.hud?.setFeedback("开场对白", "#ffd166");
        return;
      case "guard-reveal": {
        this.hud?.setFeedbackVisible(true);
        this.hud?.setPromptVisible(false);
        //this.openingCaptionText.setText("门卫突然现身").setVisible(true);
        const openingRevealSfxKey = openingRevealSfxKeyForStep(this.currentOpeningStep());
        if (openingRevealSfxKey) {
          this.sound.play(openingRevealSfxKey, { volume: 0.75 });
        }
        this.guard?.setAlpha(0);
        this.guard?.setPosition(ACTOR_LAYOUT.guard.x - 132, ACTOR_LAYOUT.guard.y);
        this.wukong?.setAlpha(1);
        this.applyOpeningBeatMatchedIdleLoop();
        if (this.guard) {
          this.tweens.killTweensOf(this.guard);
          this.tweens.add({
            targets: this.guard,
            x: ACTOR_LAYOUT.guard.x,
            alpha: 1,
            duration: 420,
            ease: "Quad.Out",
            onComplete: () => {
              this.advanceOpeningAnimatedStep("guard-reveal");
            }
          });
        }
        this.hud?.setFeedback("开场对白", "#ffd166");
        return;
      }
      case "dialogue":
        this.hud?.setFeedbackVisible(true);
        this.hud?.setPromptVisible(true);
        this.guard?.setAlpha(1);
        this.wukong?.setAlpha(1);
        this.wukong?.setPosition(ACTOR_LAYOUT.wukong.x, ACTOR_LAYOUT.wukong.y);
        if (openingShouldForceIdleReset(this.currentOpeningStep())) {
          this.playSharedIdleLoops(true);
        } else {
          this.applyOpeningBeatMatchedIdleLoop();
        }
        this.hud?.setFeedback("开场对白", "#ffd166");
        return;
      default:
        this.hud?.setFeedbackVisible(true);
        this.hud?.setPromptVisible(true);
        this.guard?.setAlpha(1);
        this.wukong?.setAlpha(1);
        this.wukong?.setPosition(ACTOR_LAYOUT.wukong.x, ACTOR_LAYOUT.wukong.y);
        return;
    }
  }

  private currentOpeningStep(): OpeningPhaseDefinition["steps"][number] | undefined {
    if (this.flowState.phaseType !== "opening") {
      return undefined;
    }

    const phase = this.phaseById(this.flowState.currentPhaseId);
    if (phase.type !== "opening") {
      return undefined;
    }

    return phase.steps[this.flowState.stepIndex];
  }

  private currentOpeningStepAllowsConfirm(): boolean {
    return canConfirmOpeningStep(this.currentOpeningStep());
  }

  private advanceOpeningAnimatedStep(expectedKind: OpeningStepKind): void {
    if (!openingShouldAutoAdvanceAfterAnimation(this.currentOpeningStep())) {
      return;
    }

    if (this.currentOpeningStep()?.kind !== expectedKind) {
      return;
    }

    this.handleConfirm();
  }

  private applyOpeningBeatMatchedIdleLoop(): void {
    if (!openingShouldUseBeatMatchedIdleLoop(this.currentOpeningStep())) {
      return;
    }

    this.playSharedIdleLoops();
  }

  private playSharedIdleLoops(force = false): void {
    this.playActorIdleLoop("guard", force);
    this.playActorIdleLoop("wukong", force);
  }

  private playActorIdleLoop(actor: LevelActor, force = false): void {
    const sprite = actor === "guard" ? this.guard : this.wukong;
    if (!sprite) {
      return;
    }

    if (
      !force &&
      !canInterruptCurrentAnimationWithLoop(
        sprite.anims.currentAnim?.key,
        sprite.anims.isPlaying
      )
    ) {
      return;
    }

    this.resetActorPosition(actor);
    sprite.play(idleAnimationKeyForActor(actor), true);
    sprite.anims.timeScale = SHARED_IDLE_ANIMATION_TIME_SCALE;
  }

  private prepareActorForAction(actor: LevelActor): void {
    const sprite = actor === "guard" ? this.guard : this.wukong;
    if (!sprite) {
      return;
    }

    this.resetActorPosition(actor);
    if (actor === "guard") {
      this.guardPraiseResetTimer?.remove(false);
      this.guardPraiseResetTimer = undefined;
    }

    const idleKey = idleAnimationKeyForActor(actor);
    const restoreIdleSpeed = (animation: Phaser.Animations.Animation): void => {
      if (animation.key !== idleKey) {
        return;
      }

      sprite.off("animationstart", restoreIdleSpeed);
      sprite.anims.timeScale = SHARED_IDLE_ANIMATION_TIME_SCALE;
    };

    sprite.on("animationstart", restoreIdleSpeed);
    sprite.anims.timeScale = 1;
  }

  private scheduleOpeningAutoAdvance(step: OpeningPhaseDefinition["steps"][number] | undefined): void {
    const delayMs = openingStepAutoAdvanceMs(step);
    if (delayMs === null) {
      return;
    }

    this.openingAdvanceTimer = this.time.delayedCall(delayMs, () => {
      this.openingAdvanceTimer = undefined;
      this.handleConfirm();
    });
  }

  private clearOpeningAdvanceTimer(): void {
    this.openingAdvanceTimer?.remove(false);
    this.openingAdvanceTimer = undefined;
  }

  private scheduleOpeningStoryProgress(
    steps: readonly OpeningPhaseDefinition["steps"][number][],
    stepIndex: number,
    step: OpeningPhaseDefinition["steps"][number] | undefined
  ): void {
    if (!step || step.kind !== "story-caption" || !this.openingStoryText) {
      this.scheduleOpeningAutoAdvance(step);
      return;
    }

    if (shouldHideBackgroundForOpeningStep(step)) {
      this.background?.setVisible(false);
    }

    const fullText = step.text ?? "";
    this.openingTypingStepIndex = stepIndex;
    this.openingTypingVisibleChars = 0;
    const revealNextCharacter = (): void => {
      this.openingTypingVisibleChars += 1;
      this.openingStoryText?.setText(
        openingDisplayTextForStep(steps, stepIndex, this.openingTypingVisibleChars)
      );

      if (this.openingTypingVisibleChars < fullText.length) {
        return;
      }

      this.clearOpeningTypingTimer();
      if (step.requireConfirm) {
        const continuePrompt = openingContinuePromptForStep(step);
        if (continuePrompt) {
          this.openingContinueText?.setText(continuePrompt).setVisible(true);
        }
        return;
      }

      this.scheduleOpeningAutoAdvance(step);
    };

    if (fullText.length === 0) {
      this.scheduleOpeningAutoAdvance(step);
      return;
    }

    this.openingStoryText.setText(openingDisplayTextForStep(steps, stepIndex, 0));
    this.openingTypingTimer = this.time.addEvent({
      delay: 60,
      repeat: fullText.length - 1,
      callback: revealNextCharacter
    });
    revealNextCharacter();
  }

  private clearOpeningTypingTimer(): void {
    this.openingTypingTimer?.remove(false);
    this.openingTypingTimer = undefined;
    this.openingTypingStepIndex = undefined;
    this.openingTypingVisibleChars = 0;
  }

  private tryAdvanceOpeningStory(): OpeningStoryAdvanceResult {
    const step = this.currentOpeningStep();
    if (!openingShouldAcceptAdvanceKey(step) || this.flowState.phaseType !== "opening") {
      return "none";
    }

    const fullText = step?.text ?? "";
    if (this.openingTypingStepIndex === this.flowState.stepIndex && this.openingTypingVisibleChars < fullText.length) {
      this.clearOpeningTypingTimer();
      this.openingTypingStepIndex = this.flowState.stepIndex;
      this.openingTypingVisibleChars = fullText.length;
      const phase = this.phaseById(this.flowState.currentPhaseId);
      if (phase.type === "opening") {
        this.openingStoryText?.setText(
          openingDisplayTextForStep(phase.steps, this.flowState.stepIndex, fullText.length)
        );
      }
      if (step?.requireConfirm) {
        const continuePrompt = openingContinuePromptForStep(step);
        if (continuePrompt) {
          this.openingContinueText?.setText(continuePrompt).setVisible(true);
        }
      } else {
        this.scheduleOpeningAutoAdvance(step);
      }
      return "complete-current-line";
    }

    if (!step?.requireConfirm) {
      this.clearOpeningAdvanceTimer();
      this.handleConfirm();
      return "advance-next-line";
    }

    return "none";
  }

  private enterFreePhase(state: Extract<LevelFlowState, { phaseType: "free" }>): void {
    const phase = this.phaseById(state.currentPhaseId) as FreeTrainingPhaseDefinition;
    const speaker = bubbleActorForState(this.level, state) ?? "guard";
    this.configureOpeningOverlay(null);
    this.showDialogueBubble(speaker, phase.prompt);
    this.hud?.setPrompt(this.freePromptForPhase(phase));
    this.hud?.setFeedback("自由练习中", "#7bdff2");
    this.playSharedIdleLoops();
  }

  private async enterPracticePhase(state: Extract<LevelFlowState, { phaseType: "practice" }>): Promise<void> {
    const phase = this.phaseById(state.currentPhaseId) as PracticePhaseDefinition;
    this.clearGuardCueHold(true);
    this.playSharedIdleLoops();
    this.configureOpeningOverlay(null);

    if (state.stage === "warmup") {
      this.clock = undefined;
      this.practiceWarmupEndsAtMs = this.time.now + phase.warmupDurationMs;
      this.showDialogueBubble("guard", this.practiceBubblePromptForPhase(phase, state.passCount));
      this.hud?.setPrompt(this.practicePromptForPhase(phase, state.passCount));
      this.hud?.setFeedback("预热提示，下一小节开始跟拍", "#ffd166");
      return;
    }

    this.practiceWarmupEndsAtMs = undefined;
    this.practiceLoopIndex = 0;
    this.practiceDemoIndex = 0;
    this.practicePlayerIndex = 0;
    this.practiceLoopJudgements = [];
    this.practiceHandoffCueLoop = -1;
    this.practicePraiseCueLoop = -1;
    this.clock = createSceneAudioClock(this.sound);
    await this.clock.start();
    this.showDialogueBubble("guard", this.practiceBubblePromptForPhase(phase, state.passCount));
    this.hud?.setPrompt(this.practicePromptForPhase(phase, state.passCount));
    this.hud?.setFeedback("听示范，下一小节轮到你", "#ffd166");
    this.playSharedIdleLoops();
  }

  private async enterExamPhase(_state: Extract<LevelFlowState, { phaseType: "exam" }>): Promise<void> {
    void _state;
    const timeline = createExamTimeline(this.level);
    const examPhase = this.phaseById("exam") as ExamPhaseDefinition;
    this.configureOpeningOverlay(null);
    this.examNpcEvents = timeline.npcEvents;
    this.examPlayerEvents = timeline.playerEvents;
    this.examNpcIndex = 0;
    this.examPlayerIndex = 0;
    this.examJudgements = [];
    this.examCombo = 0;
    this.examCueWindows = createExamCueWindows(examPhase);
    this.examHandoffCueIndex = 0;
    this.examPraiseCueIndex = 0;
    this.examBarJudgements.clear();
    this.clearGuardCueHold(true);
    this.examAudioComplete = false;
    this.phaseSound?.once("complete", () => {
      this.examAudioComplete = true;
    });
    this.clock = createSceneAudioClock(this.sound);
    await this.clock.start();
    this.showDialogueBubble("guard", "正式考核开始。先听，再跟。");
    this.hud?.setPrompt("A 立正 / A+S 敬礼");
    this.hud?.setFeedback("正式检查开始", "#ffd166");
    this.hud?.setScore(0, 0);
    this.playSharedIdleLoops();
  }

  private flushFreeInputs(): void {
    this.flushPendingInputs(this.time.now, (input) => {
      const phase = this.phaseById(this.flowState.currentPhaseId) as FreeTrainingPhaseDefinition;
      const previousCount = this.flowState.phaseType === "free" ? this.flowState.progressCount : 0;

      if (this.level.actions[phase.actionId]?.inputType !== input.type) {
        return;
      }

      this.playReactiveActorAction("wukong", phase.actionId);
      const freeTrainingSfxKey = playerSfxKeyForFreeTrainingInput(this.level, phase, input.type);
      if (freeTrainingSfxKey) {
        this.sound.play(freeTrainingSfxKey, { volume: 0.7 });
      }
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

  private updatePracticeWarmupPhase(): void {
    if (this.flowState.phaseType !== "practice" || this.flowState.stage !== "warmup") {
      return;
    }

    if (this.practiceWarmupEndsAtMs !== undefined && this.time.now < this.practiceWarmupEndsAtMs) {
      return;
    }

    this.practiceWarmupEndsAtMs = undefined;
    const nextState = advanceLevelFlow(this.level, this.flowState, {
      type: "practice-warmup-completed"
    });
    this.applyFlowState(nextState);
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
    this.updatePracticeCueState(phase, elapsedMs);
    this.releaseGuardCueIfExpired(elapsedMs);

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
    this.playPlayerJudgement(
      event.actionId,
      judgement.result,
      judgement.result === "MISS"
        ? {
            kind: "wrong-input",
            inputType
          }
        : null
    );
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
      this.playPlayerJudgement(event.actionId, "MISS", { kind: "miss-no-input" });
    }
  }

  private completePracticeLoop(phase: PracticePhaseDefinition): void {
    while (this.practicePlayerIndex < phase.playerEvents.length) {
      this.practicePlayerIndex += 1;
      this.practiceLoopJudgements.push("MISS");
    }

    const previousState = this.flowState;
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

    const loopPassed = didPracticePassIncrement(previousState, nextState);
    this.flowState = nextState;
    this.practiceLoopIndex += 1;
    this.practiceDemoIndex = 0;
    this.practicePlayerIndex = 0;
    this.practiceLoopJudgements = [];
    this.practiceHandoffCueLoop = -1;
    this.practicePraiseCueLoop = -1;
    this.clearGuardCueHold(false);
    if (shouldRestartPracticeLoopAudio(previousState, nextState)) {
      this.restartCurrentPhaseAudio();
    }
    const remaining =
      phase.requiredPassCount - (nextState.phaseType === "practice" ? nextState.passCount : 0);
    this.showDialogueBubble(
      "guard",
      loopPassed ? "不错，继续。" : "没跟上，再来一遍。"
    );
    this.hud?.setPrompt(phase.promptTemplate.replace("{n}", String(remaining)));
    this.hud?.setFeedback(loopPassed ? "通过一轮" : "本轮失败", loopPassed ? "#caffbf" : "#ff6b6b");
    this.playSharedIdleLoops();
  }

  private updatePracticeCueState(phase: PracticePhaseDefinition, elapsedMs: number): void {
    const handoffCue = practiceHandoffCueWindow(phase, this.practiceLoopIndex);
    if (this.practiceHandoffCueLoop !== this.practiceLoopIndex && elapsedMs >= handoffCue.triggerTimeMs) {
      this.practiceHandoffCueLoop = this.practiceLoopIndex;
      this.startGuardWatchCue(handoffCue.sustainUntilMs);
      this.hud?.setFeedback("轮到你了", "#ffd166");
    }

    const praiseCueTimeMs = practicePraiseCueTimeMs(phase, this.practiceLoopIndex);
    if (this.practicePraiseCueLoop !== this.practiceLoopIndex && elapsedMs >= praiseCueTimeMs) {
      this.practicePraiseCueLoop = this.practiceLoopIndex;
      if (
        this.practiceLoopJudgements.length >= phase.playerEvents.length &&
        isFullHitBar(this.practiceLoopJudgements.slice(0, phase.playerEvents.length))
      ) {
        this.playGuardPraiseCue();
      }
    }
  }

  private updateExamPhase(): void {
    if (!this.clock || this.flowState.phaseType !== "exam") {
      return;
    }

    const elapsedMs = this.clock.elapsedMs;
    this.playDueExamNpcEvents(elapsedMs);
    this.flushPendingInputs(elapsedMs, (input) => this.applyExamInput(input.type, input.timeMs));
    this.expireExamEvents(elapsedMs);
    this.updateExamCueState(elapsedMs);
    this.releaseGuardCueIfExpired(elapsedMs);

    if (this.examPlayerIndex >= this.examPlayerEvents.length && this.examPlayerEvents.length > 0) {
      const lastTargetTimeMs = this.examPlayerEvents[this.examPlayerEvents.length - 1].timeMs;
      if (elapsedMs > lastTargetTimeMs + GOOD_WINDOW_MS && this.examAudioComplete) {
        this.applyFlowState({
          phaseType: "result",
          currentPhaseId: "result"
        });
      }
    }
  }

  private updateExamCueState(elapsedMs: number): void {
    while (this.examHandoffCueIndex < this.examCueWindows.length) {
      const cue = this.examCueWindows[this.examHandoffCueIndex];
      if (elapsedMs < cue.handoffTimeMs) {
        break;
      }

      this.examHandoffCueIndex += 1;
      this.startGuardWatchCue(cue.playerBarEndTimeMs);
      this.hud?.setFeedback("轮到你了", "#ffd166");
    }

    while (this.examPraiseCueIndex < this.examCueWindows.length) {
      const cue = this.examCueWindows[this.examPraiseCueIndex];
      if (elapsedMs < cue.praiseTimeMs) {
        break;
      }

      this.examPraiseCueIndex += 1;
      const judgements = this.examBarJudgements.get(cue.playerBar) ?? [];
      const expectedHits = this.examPlayerEvents.filter((event) => event.bar === cue.playerBar).length;
      if (judgements.length >= expectedHits && isFullHitBar(judgements.slice(0, expectedHits))) {
        this.playGuardPraiseCue();
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
    this.pushExamBarJudgement(event.bar, judgement.result);
    this.examCombo = judgement.result === "MISS" ? 0 : this.examCombo + 1;
    this.playPlayerJudgement(
      event.actionId,
      judgement.result,
      judgement.result === "MISS"
        ? {
            kind: "wrong-input",
            inputType
          }
        : null
    );
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
      this.pushExamBarJudgement(event.bar, "MISS");
      this.examCombo = 0;
      this.playPlayerJudgement(event.actionId, "MISS", { kind: "miss-no-input" });
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
    this.prepareActorForAction(actor);
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
    this.prepareActorForAction(actor);
    const action = actionNameForActionId(actionId);
    const direction = actor === "guard" ? "left" : "right";
    this.animationController.playReactiveAction(sprite, actor, action, direction);
  }

  private startGuardWatchCue(sustainUntilMs: number): void {
    if (!this.guard) {
      return;
    }

    this.guardPraiseResetTimer?.remove(false);
    this.guardPraiseResetTimer = undefined;
    this.guardCueHoldUntilMs = sustainUntilMs;

    if (
      !canInterruptCurrentAnimationWithLoop(
        this.guard.anims.currentAnim?.key,
        this.guard.anims.isPlaying
      )
    ) {
      return;
    }

    this.guard.setFlipX(watchCueFlipXForActor("guard"));
    if (this.guard.anims.animationManager.exists("guard_watch_left")) {
      this.guard.anims.timeScale = loopAnimationTimeScaleForKey("guard_watch_left");
      this.guard.play("guard_watch_left", true);
      return;
    }

    this.playActorIdleLoop("guard");
  }

  private releaseGuardCueIfExpired(elapsedMs: number): void {
    if (this.guardCueHoldUntilMs === undefined || elapsedMs < this.guardCueHoldUntilMs) {
      return;
    }

    this.clearGuardCueHold(true);
  }

  private clearGuardCueHold(forceIdle: boolean): void {
    this.guardCueHoldUntilMs = undefined;

    if (forceIdle) {
      this.playActorIdleLoop("guard");
    }
  }

  private playGuardPraiseCue(): void {
    this.clearGuardCueHold(false);
    this.guardPraiseResetTimer?.remove(false);
    this.guardPraiseResetTimer = undefined;
    const praiseAsset = findLevel1SpriteAsset("guard", "praise", "left");
    const praisePlaybackDelayMs = praiseAsset ? playbackDurationMsForAsset(praiseAsset) : 420;

    if (this.guard) {
      this.guard.setFlipX(ACTOR_LAYOUT.guard.flipX);
      this.prepareActorForAction("guard");
      this.guard.setPosition(
        ACTOR_LAYOUT.guard.x + GUARD_PRAISE_OFFSET_X,
        ACTOR_LAYOUT.guard.y + GUARD_PRAISE_OFFSET_Y
      );
      this.animationController.playAction(this.guard, "guard", "praise", "left");
      this.guardPraiseResetTimer = this.time.delayedCall(
        praisePlaybackDelayMs + GUARD_PRAISE_IDLE_REPOSITION_DELAY_MS,
        () => {
          this.guardPraiseResetTimer = undefined;
          this.playActorIdleLoop("guard", true);
        }
      );
    }

    this.sound.play("PLAYER-correct.wav", { volume: 0.8 });
    this.hud?.setFeedback("门卫认可", "#caffbf");
  }

  private playPlayerJudgement(
    actionId: LevelActionId,
    judgement: JudgementResult,
    missFeedback: ResolvedInputFeedback | null = null
  ): void {
    if (!this.wukong) {
      return;
    }

    this.wukong.setFlipX(ACTOR_LAYOUT.wukong.flipX);
    this.prepareActorForAction("wukong");
    const action = actionNameForActionId(actionId);
    this.animationController.playJudgement(this.wukong, "wukong", action, "right", judgement);
    if (judgement !== "MISS") {
      this.playSfxForAction("wukong", actionId);
      return;
    }

    const failedSfxKey = missFeedback ? failedSfxKeyForResolvedInput(missFeedback) : null;
    if (failedSfxKey) {
      this.sound.play(failedSfxKey, { volume: 0.8 });
    }
  }

  private playSfxForAction(actor: LevelActor, actionId: LevelActionId): void {
    const action = this.level.actions[actionId];
    const key = actor === "guard" ? action.npcSfxKey : action.playerSfxKey;

    if (!key) {
      return;
    }

    this.sound.play(key, { volume: 0.7 });
  }

  private playDialogueConfirmSfx(): void {
    const sfxKey = dialogueConfirmSfxKeyForState(this.level, this.flowState);
    if (!sfxKey) {
      return;
    }

    this.sound.play(sfxKey, { volume: 0.75 });
  }

  private playOpeningStoryAdvanceSfx(): void {
    const sfxKey = openingAdvanceSfxKeyForStep(this.currentOpeningStep());
    if (!sfxKey) {
      return;
    }

    this.sound.play(sfxKey, { volume: 0.75 });
  }

  private pushExamBarJudgement(bar: number, judgement: JudgementResult): void {
    const judgements = this.examBarJudgements.get(bar) ?? [];
    judgements.push(judgement);
    this.examBarJudgements.set(bar, judgements);
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

  private restartCurrentPhaseAudio(): void {
    if (!this.phaseSound) {
      return;
    }

    this.phaseSound.stop();
    this.phaseSound.play();
  }

  private syncPhaseAudioForState(state: LevelFlowState): void {
    const audioKey = phaseAudioKeyForState(this.level, state);
    const shouldLoop =
      state.phaseType === "practice" ? state.stage === "loop" : state.phaseType !== "exam";
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

  private resetActorPosition(actor: LevelActor): void {
    const sprite = actor === "guard" ? this.guard : this.wukong;
    if (!sprite) {
      return;
    }

    sprite.setPosition(ACTOR_LAYOUT[actor].x, ACTOR_LAYOUT[actor].y);
  }

  private freePromptForPhase(phase: FreeTrainingPhaseDefinition): string {
    return freeHudPromptForPhase(this.level, phase);
  }

  private practicePromptForPhase(phase: PracticePhaseDefinition, passCount: number): string {
    return practiceHudPromptForPhase(phase, passCount);
  }

  private practiceBubblePromptForPhase(phase: PracticePhaseDefinition, passCount: number): string {
    return practiceBubblePromptForPhase(phase, passCount);
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

    // const nameText = this.add
    //   .text(0, -70, speakerLabel(actor), {
    //     color: "#fff7e8",
    //     fontSize: "16px",
    //     fontStyle: "bold",
    //     backgroundColor: "#5a3d2b",
    //     padding: { left: 10, right: 10, top: 4, bottom: 4 }
    //   })
    //   .setOrigin(0.5);

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
      bubbleText
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
    if (!LEVEL_SCENE_DEBUG_ENABLED) {
      return;
    }

    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const { nextBuffer, command } = consumeLevelDebugSequence(
      this.devSequenceBuffer,
      event.key.toLowerCase()
    );
    this.devSequenceBuffer = nextBuffer;

    if (!command) {
      return;
    }

    if (command === "toggle-debug-panel") {
      this.setBubbleDebugCollapsed(false);
      return;
    }

    this.applyDebugCommand(command);
  }

  private applyDebugCommand(
    command: Exclude<ReturnType<typeof consumeLevelDebugSequence>["command"], undefined | "toggle-debug-panel">
  ): void {
    if (command === "stop-animation-preview") {
      this.clearDebugAnimationPreview();
      this.hud?.setFeedback("DEV: stop-animation-preview", "#9ad1ff");
      return;
    }

    if (this.isAnimationPreviewCommand(command)) {
      this.startDebugAnimationPreview(command);
      this.hud?.setFeedback(`DEV: ${command}`, "#9ad1ff");
      return;
    }

    this.clearOpeningAdvanceTimer();
    this.clearOpeningTypingTimer();
    this.practiceWarmupEndsAtMs = undefined;
    this.pendingRawInputs.length = 0;
    this.clearDebugAnimationPreview();
    this.applyFlowState(levelFlowStateForDebugCommand(this.level, command));
    this.hud?.setFeedback(`DEV: ${command}`, "#9ad1ff");
  }

  private startDebugAnimationPreview(
    command: Extract<
      Exclude<ReturnType<typeof consumeLevelDebugSequence>["command"], undefined>,
      | "preview-guard-attention"
      | "preview-guard-salute"
      | "preview-guard-praise"
      | "preview-wukong-attention"
      | "preview-wukong-salute"
    >
  ): void {
    const preview = debugAnimationPreviewForCommand(command);
    this.clearDebugAnimationPreview();
    this.playDebugAnimationPreview(preview);
    this.debugAnimationPreviewTimer = this.time.addEvent({
      delay: debugAnimationPreviewIntervalMsForCommand(command),
      loop: true,
      callback: () => {
        this.playDebugAnimationPreview(preview);
      }
    });
  }

  private playDebugAnimationPreview(preview: ReturnType<typeof debugAnimationPreviewForCommand>): void {
    const sprite = preview.actor === "guard" ? this.guard : this.wukong;
    if (!sprite) {
      return;
    }

    sprite.setFlipX(ACTOR_LAYOUT[preview.actor].flipX);
    this.prepareActorForAction(preview.actor);

    if (preview.action === "praise") {
      if (preview.actor === "guard") {
        sprite.setPosition(
          ACTOR_LAYOUT.guard.x + GUARD_PRAISE_OFFSET_X,
          ACTOR_LAYOUT.guard.y + GUARD_PRAISE_OFFSET_Y
        );
        const praiseAsset = findLevel1SpriteAsset("guard", "praise", "left");
        const praisePlaybackDelayMs = praiseAsset ? playbackDurationMsForAsset(praiseAsset) : 420;
        this.guardPraiseResetTimer?.remove(false);
        this.guardPraiseResetTimer = this.time.delayedCall(
          praisePlaybackDelayMs + GUARD_PRAISE_IDLE_REPOSITION_DELAY_MS,
          () => {
            this.guardPraiseResetTimer = undefined;
            this.playActorIdleLoop("guard", true);
          }
        );
      }
      this.animationController.playAction(sprite, preview.actor, preview.action, preview.actor === "guard" ? "left" : "right");
      return;
    }

    this.animationController.playReactiveAction(
      sprite,
      preview.actor,
      preview.action,
      preview.actor === "guard" ? "left" : "right"
    );
  }

  private clearDebugAnimationPreview(): void {
    this.debugAnimationPreviewTimer?.remove(false);
    this.debugAnimationPreviewTimer = undefined;
  }

  private isAnimationPreviewCommand(
    command: Exclude<ReturnType<typeof consumeLevelDebugSequence>["command"], undefined | "toggle-debug-panel" | "stop-animation-preview">
  ): command is
    | "preview-guard-attention"
    | "preview-guard-salute"
    | "preview-guard-praise"
    | "preview-wukong-attention"
    | "preview-wukong-salute" {
    return command.startsWith("preview-");
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

  private resetState(): void {
    this.flowState = createLevelFlowState(this.level);
    this.pendingRawInputs.length = 0;
    this.clock = undefined;
    this.phaseSound?.stop();
    this.phaseSound = undefined;
    this.phaseSoundKey = undefined;
    this.phaseSoundLoop = undefined;
    this.practiceLoopIndex = 0;
    this.practiceDemoIndex = 0;
    this.practicePlayerIndex = 0;
    this.practiceLoopJudgements = [];
    this.practiceWarmupEndsAtMs = undefined;
    this.practiceHandoffCueLoop = -1;
    this.practicePraiseCueLoop = -1;
    this.examNpcEvents = [];
    this.examPlayerEvents = [];
    this.examNpcIndex = 0;
    this.examPlayerIndex = 0;
    this.examJudgements = [];
    this.examCombo = 0;
    this.examBarJudgements.clear();
    this.examAudioComplete = false;
    this.examHandoffCueIndex = 0;
    this.examPraiseCueIndex = 0;
    this.examCueWindows = [];
    this.guardCueHoldUntilMs = undefined;
    this.activeDialogue = undefined;
    this.openingTypingStepIndex = undefined;
    this.openingTypingVisibleChars = 0;
    this.devSequenceBuffer = "";
  }
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
