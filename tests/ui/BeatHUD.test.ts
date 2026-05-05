import { describe, expect, it, vi } from "vitest";
import { BeatHUD } from "../../src/game/ui/BeatHUD";

type MockText = {
  setOrigin: ReturnType<typeof vi.fn>;
  setDepth: ReturnType<typeof vi.fn>;
  setText: ReturnType<typeof vi.fn>;
  setColor: ReturnType<typeof vi.fn>;
  setVisible: ReturnType<typeof vi.fn>;
};

function createMockText(): MockText {
  return {
    setOrigin: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis()
  };
}

describe("BeatHUD", () => {
  it("only creates the central feedback text and bottom prompt text", () => {
    const firstText = createMockText();
    const secondText = createMockText();
    const text = vi.fn().mockReturnValueOnce(firstText).mockReturnValueOnce(secondText);
    const scene = {
      add: { text }
    };

    new BeatHUD(scene as never, "南天门 · 混进天庭");

    expect(text).toHaveBeenCalledTimes(2);
  });

  it("keeps feedback and prompt updates working without title or score labels", () => {
    const feedbackText = createMockText();
    const promptText = createMockText();
    const scene = {
      add: {
        text: vi.fn().mockReturnValueOnce(feedbackText).mockReturnValueOnce(promptText)
      }
    };

    const hud = new BeatHUD(scene as never, "南天门 · 混进天庭");
    hud.setFeedback("正式检查开始", "#ffd166");
    hud.setPrompt("A 立正 / A+S 敬礼");
    hud.setScore(3, 300);
    hud.setTitle("第一关");

    expect(feedbackText.setText).toHaveBeenCalledWith("正式检查开始");
    expect(feedbackText.setColor).toHaveBeenCalledWith("#ffd166");
    expect(promptText.setText).toHaveBeenCalledWith("A 立正 / A+S 敬礼");
  });
});
