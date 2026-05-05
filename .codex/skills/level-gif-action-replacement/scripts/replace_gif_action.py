from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageSequence


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Replace a runtime sprite action sequence from a GIF and normalize it to a target idle canvas."
    )
    parser.add_argument("--source-gif", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--prefix", required=True)
    parser.add_argument("--target-width", required=True, type=int)
    parser.add_argument("--target-height", required=True, type=int)
    parser.add_argument("--bbox-left", required=True, type=int)
    parser.add_argument("--bbox-top", required=True, type=int)
    parser.add_argument("--bbox-right", required=True, type=int)
    parser.add_argument("--bbox-bottom", required=True, type=int)
    parser.add_argument("--white-threshold", default=245, type=int)
    return parser.parse_args()


def clear_near_white_background(frame: Image.Image, threshold: int) -> Image.Image:
    rgba = frame.convert("RGBA")
    result = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    src = rgba.load()
    dst = result.load()
    width, height = rgba.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = src[x, y]
            if a == 0:
                continue
            if r >= threshold and g >= threshold and b >= threshold:
                continue
            dst[x, y] = (r, g, b, a)

    return result


def extract_frames(source_gif: Path, threshold: int) -> list[Image.Image]:
    gif = Image.open(source_gif)
    frames: list[Image.Image] = []

    for raw in ImageSequence.Iterator(gif):
        cleaned = clear_near_white_background(raw, threshold)
        bbox = cleaned.getbbox()
        if bbox is None:
            continue
        frames.append(cleaned.crop(bbox))

    if not frames:
        raise RuntimeError(f"No visible frames extracted from {source_gif}")

    return frames


def replace_frames(
    frames: list[Image.Image],
    output_dir: Path,
    prefix: str,
    target_width: int,
    target_height: int,
    bbox_left: int,
    bbox_top: int,
    bbox_right: int,
    bbox_bottom: int,
) -> None:
    target_bbox_width = bbox_right - bbox_left
    target_bbox_height = bbox_bottom - bbox_top

    output_dir.mkdir(parents=True, exist_ok=True)
    for existing in output_dir.glob(f"{prefix}_*.png"):
        existing.unlink()

    for index, frame in enumerate(frames, start=1):
        scale = min(target_bbox_width / frame.width, target_bbox_height / frame.height)
        scaled_width = max(1, round(frame.width * scale))
        scaled_height = max(1, round(frame.height * scale))
        resized = frame.resize((scaled_width, scaled_height), Image.Resampling.LANCZOS)

        canvas = Image.new("RGBA", (target_width, target_height), (0, 0, 0, 0))
        paste_x = bbox_left + (target_bbox_width - scaled_width) // 2
        paste_y = bbox_bottom - scaled_height
        canvas.paste(resized, (paste_x, paste_y), resized)

        target = output_dir / f"{prefix}_{index:04d}.png"
        canvas.save(target)
        print(target)


def main() -> None:
    args = parse_args()
    frames = extract_frames(args.source_gif, args.white_threshold)
    replace_frames(
        frames=frames,
        output_dir=args.output_dir,
        prefix=args.prefix,
        target_width=args.target_width,
        target_height=args.target_height,
        bbox_left=args.bbox_left,
        bbox_top=args.bbox_top,
        bbox_right=args.bbox_right,
        bbox_bottom=args.bbox_bottom,
    )


if __name__ == "__main__":
    main()
