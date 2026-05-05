function assertNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} is required.`);
  }

  return value.trim();
}

export function normalizeLevelWorkflowOptions(options) {
  const levelId = assertNonEmptyString(options?.levelId, "levelId");
  const levelName = assertNonEmptyString(options?.levelName, "levelName");

  if (!/^[a-z0-9]+(?:_[a-z0-9]+)*_\d{2}$/.test(levelId)) {
    throw new Error("levelId must use snake_case with a numeric suffix, for example gate_01.");
  }

  const levelNumberMatch = levelId.match(/_(\d{2})$/);
  if (!levelNumberMatch) {
    throw new Error("levelId must end with a two-digit numeric suffix.");
  }

  return {
    levelId,
    levelName,
    levelDir: levelId,
    levelNumber: levelNumberMatch[1],
    audioKey: `${levelId}_bgm`
  };
}

export function buildLevelWorkflowScaffold(rawOptions) {
  const options = normalizeLevelWorkflowOptions(rawOptions);
  const { levelId, levelName, levelDir, levelNumber, audioKey } = options;

  return [
    {
      path: `docs/levels/${levelDir}/spec.md`,
      content: buildSpecContent({ levelId, levelName, levelNumber, audioKey })
    },
    {
      path: `docs/levels/${levelDir}/assets.md`,
      content: buildAssetPlanContent({ levelId, levelName })
    },
    {
      path: `docs/levels/${levelDir}/qa.md`,
      content: buildQaContent({ levelId, levelName })
    },
    {
      path: `src/game/level/levels/${levelId}.json`,
      content: buildLevelJsonContent({ levelId, levelName, audioKey })
    },
    {
      path: `tests/level/${levelId}.test.ts`,
      content: buildLevelTestContent({ levelId, levelName })
    }
  ];
}

function buildSpecContent({ levelId, levelName, levelNumber, audioKey }) {
  return `# ${levelName}

## Metadata

- levelId: \`${levelId}\`
- levelNumber: \`${levelNumber}\`
- audioKey: \`${audioKey}\`
- owner: \`unassigned\`
- status: \`draft\`

## 1. Goal

- Player fantasy:
- Core joke / dramatic beat:
- Must-keep mechanic:
- Out of scope for MVP:

## 2. Input Rules

- Supported inputs:
- Combined input window:
- Hold / mash requirements:
- Fallback input mapping:

## 3. Judgement And Scoring

- Pass threshold:
- Score model:
- Combo behavior:
- Failure condition:
- Result rating gates:

## 4. Phase Flow

1. Opening dialogue:
2. Free training:
3. Rhythm practice:
4. Exam:
5. Result:

## 5. Visual Hard Constraints

- Stage background:
- Actor positions:
- Facing direction:
- Bubble placement:
- No-overlap constraints:
- Camera / framing constraints:

## 6. Audio Plan

- Dialogue / teaching BGM:
- Practice BGM:
- Exam BGM:
- SFX list:
- Audio transition rules:

## 7. Content Data

- Actions:
- Dialogue lines:
- Practice loops:
- Exam bars:
- Result copy:

## 8. Acceptance Criteria

- [ ] Spec is stable enough to start implementation.
- [ ] Every phase has explicit success / exit conditions.
- [ ] Visual constraints are testable, not descriptive only.
- [ ] Audio ownership is clear per phase.
- [ ] JSON data shape can represent the whole level.
`;
}

function buildAssetPlanContent({ levelId, levelName }) {
  return `# ${levelName} Asset Plan

## Metadata

- levelId: \`${levelId}\`
- status: \`draft\`

## 1. Character Animation List

| Actor | Action | Facing | Frames | Loop | Runtime Key | Source Status |
| --- | --- | --- | --- | --- | --- | --- |
| Wukong | idle | left/right | TBD | yes | \`wukong_idle\` | missing |
| Wukong | action-1 | left/right | TBD | no | \`wukong_action_1\` | missing |
| Guard | idle | left/right | TBD | yes | \`guard_idle\` | missing |
| Guard | action-1 | left/right | TBD | no | \`guard_action_1\` | missing |

## 2. Background And Props

| Asset | Runtime Key | Source File | Notes |
| --- | --- | --- | --- |
| Stage background | \`${levelId}-stage-bg\` | TBD | |
| Opening background | \`${levelId}-opening-bg\` | TBD | |
| UI prop | TBD | TBD | |

## 3. Audio Mapping

| Usage | Runtime Key | Source File | Loop | Notes |
| --- | --- | --- | --- | --- |
| Dialogue / teaching | \`${levelId}_speak_bgm\` | TBD | yes | |
| Practice | \`${levelId}_practice_bgm\` | TBD | yes | |
| Exam | \`${levelId}_exam_bgm\` | TBD | no | |
| Action SFX | TBD | TBD | no | |

## 4. Export Rules

- Runtime assets must use safe ASCII paths when copied into live asset folders.
- Animation keys must stay stable even if source filenames change.
- Sequence frames must be numbered consistently for Phaser animation loading.
- Missing source art must be listed before implementation starts.

## 5. Acceptance Criteria

- [ ] Every runtime key has a mapped source file.
- [ ] Missing assets are explicit.
- [ ] Background, actor, and audio assets are separated.
- [ ] Naming is consistent with Phaser preload usage.
`;
}

function buildQaContent({ levelId, levelName }) {
  return `# ${levelName} QA Checklist

## Metadata

- levelId: \`${levelId}\`
- status: \`draft\`

## 1. Spec Gate

- [ ] PRD, scene doc, and level spec agree on the same gameplay loop.
- [ ] Input mapping is explicit for keyboard and pointer.
- [ ] Pass threshold and scoring rules are frozen.

## 2. Visual Gate

- [ ] Correct background is used in each phase.
- [ ] Actors stand on the correct side and face the correct direction.
- [ ] Dialogue bubbles follow the actor and stay outside the body silhouette.
- [ ] Bubble text wraps without clipping or overflow.
- [ ] No UI element blocks core acting poses.

## 3. Audio Gate

- [ ] Dialogue / teaching BGM does not restart on each line advance.
- [ ] Practice phase switches to practice rhythm audio.
- [ ] Exam phase switches to exam rhythm audio.
- [ ] Audio timing matches the playable beat.

## 4. Gameplay Gate

- [ ] Free training exits only at the intended count.
- [ ] Practice requires the configured pass threshold.
- [ ] Exam note sequence matches the spec.
- [ ] Score, combo, and rating produce expected results.

## 5. Engineering Gate

- [ ] Relevant automated tests were added first and now pass.
- [ ] Typecheck passes.
- [ ] Build passes.
- [ ] Manual playthrough was completed end to end.
- [ ] Commit message includes a clear reason.
`;
}

function buildLevelJsonContent({ levelId, levelName, audioKey }) {
  return `{
  "levelId": "${levelId}",
  "name": "${levelName}",
  "bpm": 120,
  "type": "teaching",
  "audio": {
    "practiceKey": "${levelId}_practice_bgm",
    "examKey": "${levelId}_exam_bgm"
  },
  "actions": {
    "ACTION_1": {
      "name": "Action 1",
      "inputType": "A",
      "animationKey": "${levelId}_action_1"
    },
    "ACTION_2": {
      "name": "Action 2",
      "inputType": "AB",
      "animationKey": "${levelId}_action_2"
    }
  },
  "phases": [
    {
      "id": "opening",
      "type": "opening",
      "backgroundKey": "${levelId}-opening-bg",
      "dialogues": [
        { "speaker": "guard", "text": "TODO" },
        { "speaker": "wukong", "text": "TODO" }
      ],
      "nextPhaseId": "free_training"
    },
    {
      "id": "free_training",
      "type": "free",
      "backgroundKey": "${levelId}-stage-bg",
      "prompt": "TODO",
      "actionId": "ACTION_1",
      "requiredCount": 3,
      "milestones": [],
      "nextPhaseId": "practice"
    },
    {
      "id": "practice",
      "type": "practice",
      "backgroundKey": "${levelId}-stage-bg",
      "promptTemplate": "TODO {n}",
      "audioKey": "${levelId}_practice_bgm",
      "bpm": 120,
      "timeSignature": [4, 4],
      "beatMs": 500,
      "barMs": 2000,
      "loopBars": 2,
      "loopDurationMs": 4000,
      "requiredPassCount": 3,
      "passThreshold": "GOOD",
      "npcEvents": [],
      "playerEvents": [],
      "nextPhaseId": "exam"
    },
    {
      "id": "exam",
      "type": "exam",
      "backgroundKey": "${levelId}-stage-bg",
      "audioKey": "${levelId}_exam_bgm",
      "bpm": 120,
      "timeSignature": [4, 4],
      "beatMs": 500,
      "barMs": 2000,
      "totalBars": 2,
      "bars": []
    }
  ],
  "resultTexts": {
    "TIAN_ZUN": "TODO",
    "ZHEN_XIAN": "TODO",
    "DAO_TONG": "TODO",
    "FAN_FU": "TODO"
  }
}
`;
}

function buildLevelTestContent({ levelId, levelName }) {
  return `import { describe, expect, it } from "vitest";

describe("${levelId} level scaffold", () => {
  it("tracks the intended level name", () => {
    expect("${levelName}").not.toHaveLength(0);
  });

  it("keeps a placeholder for real level assertions", () => {
    expect("${levelId}").toBe("${levelId}");
  });
});
`;
}
