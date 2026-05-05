# Menu Opening BGM Design

## Goal

Play `/src/assets/audio/level1/开场音乐-BPM108-21bar.wav` as early as possible when the web page opens, keep it looping while the user remains on the menu, and stop it as soon as the user enters the gameplay scene.

## Constraints

- Browser autoplay restrictions may block immediate audio playback before user interaction.
- The app must not attempt to bypass browser autoplay protections.
- Menu music must not overlap with level audio.
- The implementation should fit the current scene structure with minimal changes.

## Chosen Approach

Use a dedicated menu BGM asset key that is preloaded alongside the existing audio catalog. `MenuScene` will attempt playback immediately on `create()`. If the browser blocks autoplay, `MenuScene` will keep one-shot fallback listeners for the first user interaction and retry playback then. Transitioning from `MenuScene` to `LevelScene` will always stop the menu BGM first.

## Runtime Behavior

### Preload

- Add a stable runtime audio key for the opening menu BGM.
- Ensure `PreloadScene` loads the audio file through the existing preload path.

### Menu Scene

- On scene creation, request looping playback for the menu BGM immediately.
- If playback does not start because the sound manager is locked or autoplay is blocked, register lightweight fallback listeners on pointer and keyboard input.
- When the first eligible interaction occurs, retry playback once and remove the fallback listeners after success.
- Reuse a single sound instance instead of stacking duplicates.

### Entering Level Scene

- The menu start action must stop the menu BGM before `LevelScene` starts.
- Stopping should be safe whether playback already started or not.

## Testing

- Add a failing test first that proves the menu scene attempts to start the opening BGM.
- Add a failing test first that proves entering the level stops the opening BGM.
- Keep tests focused on scene audio orchestration rather than Phaser internals.

## Non-Goals

- No global audio manager refactor.
- No changes to level audio sequencing.
- No attempt to override browser autoplay policy beyond retrying on first user interaction.
