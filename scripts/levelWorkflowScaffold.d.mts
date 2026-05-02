export interface LevelWorkflowOptions {
  levelId: string;
  levelName: string;
}

export interface NormalizedLevelWorkflowOptions extends LevelWorkflowOptions {
  levelDir: string;
  levelNumber: string;
  audioKey: string;
}

export interface LevelWorkflowFile {
  path: string;
  content: string;
}

export function normalizeLevelWorkflowOptions(
  options: LevelWorkflowOptions
): NormalizedLevelWorkflowOptions;

export function buildLevelWorkflowScaffold(
  options: LevelWorkflowOptions
): LevelWorkflowFile[];
