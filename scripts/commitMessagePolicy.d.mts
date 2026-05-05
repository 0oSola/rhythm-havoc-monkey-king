export interface CommitMessageValidation {
  valid: boolean;
  errors: string[];
}

export function validateCommitMessage(message: string): CommitMessageValidation;
