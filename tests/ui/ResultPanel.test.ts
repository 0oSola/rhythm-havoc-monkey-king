import { describe, expect, it, vi } from "vitest";
import type { LevelResultPayload } from "../../src/game/level/LevelResult";
import { createResultPanel } from "../../src/game/ui/ResultPanel";

type Chainable = Record<string, ReturnType<typeof vi.fn>>;

function createChainable(): Chainable {
  const target: Chainable = {};
  ["setOrigin", "setStrokeStyle", "setAlpha", "setScale", "setDisplaySize"].forEach((method) => {
    target[method] = vi.fn(() => target);
  });
  return target;
}

describe("ResultPanel", () => {
  it("places the rating CG in the result panel before score details", () => {
    const image = createChainable();
    const scene = {
      add: {
        rectangle: vi.fn(() => createChainable()),
        text: vi.fn(() => createChainable()),
        image: vi.fn(() => image),
        container: vi.fn(() => createChainable())
      }
    };
    const payload: LevelResultPayload = {
      levelName: "南天门",
      summary: {
        score: 320,
        maxScore: 400,
        accuracy: 0.8,
        rating: "真仙"
      },
      quote: "不错，像练过的。"
    };

    createResultPanel(scene as never, payload);

    expect(scene.add.image).toHaveBeenCalledWith(480, 238, "level1-result-cg-zhenxian");
    expect(image.setDisplaySize).toHaveBeenCalledWith(420, 180);
  });
});
