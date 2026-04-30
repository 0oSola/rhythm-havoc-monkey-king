import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  create(): void {
    this.createPlaceholderFrames();
    this.createAnimations();
    this.scene.start("MenuScene");
  }

  private createPlaceholderFrames(): void {
    this.createCharacterFrame("wukong_idle_right_0001", 0xd84f2a, 0xffd166, 0);
    this.createCharacterFrame("wukong_idle_right_0002", 0xd84f2a, 0xffd166, 4);
    this.createCharacterFrame("wukong_stand_right_0001", 0xd84f2a, 0xf7efe0, -2);
    this.createCharacterFrame("wukong_stand_right_0002", 0xd84f2a, 0xf7efe0, 2);
    this.createCharacterFrame("wukong_salute_right_0001", 0xd84f2a, 0x7bdff2, 0);
    this.createCharacterFrame("wukong_salute_right_0002", 0xd84f2a, 0x7bdff2, 8);
    this.createCharacterFrame("wukong_fail_right_0001", 0xd84f2a, 0xff6b6b, -10);
    this.createCharacterFrame("wukong_fail_right_0002", 0xd84f2a, 0xff6b6b, 12);
    this.createCharacterFrame("guard_idle_left_0001", 0x3d6f8e, 0xf7efe0, 0);
    this.createCharacterFrame("guard_stand_left_0001", 0x3d6f8e, 0xf7efe0, -2);
    this.createCharacterFrame("guard_stand_left_0002", 0x3d6f8e, 0xf7efe0, 2);
    this.createCharacterFrame("guard_salute_left_0001", 0x3d6f8e, 0x7bdff2, 0);
    this.createCharacterFrame("guard_salute_left_0002", 0x3d6f8e, 0x7bdff2, -8);
  }

  private createCharacterFrame(key: string, bodyColor: number, accentColor: number, offsetX: number): void {
    const graphics = this.add.graphics().setVisible(false);
    graphics.fillStyle(0x000000, 0);
    graphics.fillRect(0, 0, 160, 180);
    graphics.fillStyle(bodyColor, 1);
    graphics.fillCircle(80 + offsetX, 48, 26);
    graphics.fillRoundedRect(46 + offsetX, 78, 68, 76, 14);
    graphics.fillStyle(accentColor, 1);
    graphics.fillRect(65 + offsetX, 28, 30, 10);
    graphics.fillRect(58 + offsetX, 108, 44, 12);
    graphics.generateTexture(key, 160, 180);
    graphics.destroy();
  }

  private createAnimations(): void {
    this.createFrameAnimation("wukong_idle_right", ["wukong_idle_right_0001", "wukong_idle_right_0002"], 4, -1);
    this.createFrameAnimation("wukong_stand_right", ["wukong_stand_right_0001", "wukong_stand_right_0002"], 8, 0);
    this.createFrameAnimation("wukong_salute_right", ["wukong_salute_right_0001", "wukong_salute_right_0002"], 8, 0);
    this.createFrameAnimation("wukong_fail_right", ["wukong_fail_right_0001", "wukong_fail_right_0002"], 8, 0);
    this.createFrameAnimation("guard_idle_left", ["guard_idle_left_0001"], 1, -1);
    this.createFrameAnimation("guard_stand_left", ["guard_stand_left_0001", "guard_stand_left_0002"], 8, 0);
    this.createFrameAnimation("guard_salute_left", ["guard_salute_left_0001", "guard_salute_left_0002"], 8, 0);
  }

  private createFrameAnimation(key: string, frameKeys: string[], frameRate: number, repeat: number): void {
    if (this.anims.exists(key)) {
      return;
    }

    this.anims.create({
      key,
      frames: frameKeys.map((frameKey) => ({ key: frameKey })),
      frameRate,
      repeat
    });
  }
}
