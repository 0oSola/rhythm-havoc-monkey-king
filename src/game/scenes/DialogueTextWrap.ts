export function wrapDialogueText(
  text: string,
  maxWidth: number,
  measureTextWidth: (value: string) => number
): string {
  const paragraphs = text.split("\n");

  return paragraphs
    .map((paragraph) => wrapParagraph(paragraph, maxWidth, measureTextWidth))
    .join("\n");
}

function wrapParagraph(
  paragraph: string,
  maxWidth: number,
  measureTextWidth: (value: string) => number
): string {
  if (paragraph.length === 0) {
    return "";
  }

  const lines: string[] = [];
  let currentLine = "";

  for (const char of paragraph) {
    const nextLine = `${currentLine}${char}`;

    if (currentLine.length > 0 && measureTextWidth(nextLine) > maxWidth) {
      lines.push(currentLine);
      currentLine = char;
      continue;
    }

    currentLine = nextLine;
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines.join("\n");
}
