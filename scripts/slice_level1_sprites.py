from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
STAGING_DIR = ROOT / "src" / "assets" / "sprites" / "level1" / "staging"
OUTPUT_DIR = ROOT / "src" / "assets" / "sprites" / "level1"
THRESHOLD = 18
MERGE_GAP_PX = 3
PADDING_PX = 12


@dataclass(frozen=True)
class AssetSlice:
  asset_id: str
  source_sheet: str
  row_index: int
  frame_count: int
  output_directory: str


ASSETS: tuple[AssetSlice, ...] = (
  AssetSlice("wukong_idle_right", "level1_idle_dual_sheet.png", 0, 4, "wukong/idle"),
  AssetSlice("guard_idle_left", "level1_idle_dual_sheet.png", 1, 4, "guard/idle"),
  AssetSlice("wukong_attention_right", "level1_attention_dual_sheet.png", 0, 4, "wukong/attention"),
  AssetSlice("guard_attention_left", "level1_attention_dual_sheet.png", 1, 4, "guard/attention"),
  AssetSlice("wukong_salute_right", "level1_salute_dual_sheet.png", 0, 7, "wukong/salute"),
  AssetSlice("guard_salute_left", "level1_salute_dual_sheet.png", 1, 7, "guard/salute"),
  AssetSlice("wukong_run_right", "wukong_run_right_sheet.png", 0, 6, "wukong/run"),
  AssetSlice("wukong_fail_right", "wukong_fail_right_sheet.png", 0, 5, "wukong/fail"),
)


def is_foreground(pixel: tuple[int, int, int, int], bg: tuple[int, int, int, int]) -> bool:
  return abs(pixel[0] - bg[0]) + abs(pixel[1] - bg[1]) + abs(pixel[2] - bg[2]) > THRESHOLD


def merge_ranges(ranges: Iterable[tuple[int, int]]) -> list[tuple[int, int]]:
  merged: list[tuple[int, int]] = []
  for start, end in ranges:
    if not merged:
      merged.append((start, end))
      continue
    prev_start, prev_end = merged[-1]
    if start - prev_end <= MERGE_GAP_PX:
      merged[-1] = (prev_start, end)
      continue
    merged.append((start, end))
  return merged


def detect_row_ranges(img: Image.Image, bg: tuple[int, int, int, int]) -> list[tuple[int, int]]:
  w, h = img.size
  rows: list[tuple[int, int]] = []
  in_run = False
  start = 0
  for y in range(h):
    has_fg = any(is_foreground(img.getpixel((x, y)), bg) for x in range(w))
    if has_fg and not in_run:
      start = y
      in_run = True
    elif not has_fg and in_run:
      rows.append((start, y - 1))
      in_run = False
  if in_run:
    rows.append((start, h - 1))
  return rows


def detect_column_ranges(img: Image.Image, bg: tuple[int, int, int, int], y0: int, y1: int) -> list[tuple[int, int]]:
  w, _ = img.size
  cols: list[tuple[int, int]] = []
  in_run = False
  start = 0
  for x in range(w):
    has_fg = any(is_foreground(img.getpixel((x, y)), bg) for y in range(y0, y1 + 1))
    if has_fg and not in_run:
      start = x
      in_run = True
    elif not has_fg and in_run:
      cols.append((start, x - 1))
      in_run = False
  if in_run:
    cols.append((start, w - 1))
  return merge_ranges(cols)


def detect_frame_bbox(
  img: Image.Image, bg: tuple[int, int, int, int], x0: int, x1: int, y0: int, y1: int
) -> tuple[int, int, int, int]:
  min_x, min_y = x1, y1
  max_x, max_y = x0, y0
  for y in range(y0, y1 + 1):
    for x in range(x0, x1 + 1):
      if is_foreground(img.getpixel((x, y)), bg):
        min_x = min(min_x, x)
        min_y = min(min_y, y)
        max_x = max(max_x, x)
        max_y = max(max_y, y)
  return min_x, min_y, max_x, max_y


def clear_background(crop: Image.Image, bg: tuple[int, int, int, int]) -> Image.Image:
  result = crop.copy()
  px = result.load()
  w, h = result.size
  for y in range(h):
    for x in range(w):
      p = px[x, y]
      if not is_foreground(p, bg):
        px[x, y] = (0, 0, 0, 0)
  return result


def slice_asset(asset: AssetSlice) -> None:
  source_path = STAGING_DIR / asset.source_sheet
  img = Image.open(source_path).convert("RGBA")
  bg = img.getpixel((0, 0))

  row_ranges = detect_row_ranges(img, bg)
  if asset.row_index >= len(row_ranges):
    raise ValueError(f"{asset.asset_id}: row_index {asset.row_index} out of range for {asset.source_sheet}")

  y0, y1 = row_ranges[asset.row_index]
  col_ranges = detect_column_ranges(img, bg, y0, y1)
  if len(col_ranges) != asset.frame_count:
    raise ValueError(
      f"{asset.asset_id}: expected {asset.frame_count} frames in {asset.source_sheet} row {asset.row_index}, got {len(col_ranges)}"
    )

  frame_bboxes = [detect_frame_bbox(img, bg, x0, x1, y0, y1) for x0, x1 in col_ranges]
  max_width = max((x1 - x0 + 1) for x0, _, x1, _ in frame_bboxes) + PADDING_PX * 2
  max_height = max((y1b - y0b + 1) for _, y0b, _, y1b in frame_bboxes) + PADDING_PX * 2

  out_dir = OUTPUT_DIR / asset.output_directory
  out_dir.mkdir(parents=True, exist_ok=True)

  for index, (x0, y0b, x1, y1b) in enumerate(frame_bboxes, start=1):
    crop = clear_background(img.crop((x0, y0b, x1 + 1, y1b + 1)), bg)
    canvas = Image.new("RGBA", (max_width, max_height), (0, 0, 0, 0))
    paste_x = (max_width - crop.width) // 2
    paste_y = max_height - crop.height - PADDING_PX
    canvas.paste(crop, (paste_x, paste_y), crop)
    canvas.save(out_dir / f"{asset.asset_id}_{index:04d}.png")


def main() -> None:
  for asset in ASSETS:
    slice_asset(asset)
    print(f"sliced {asset.asset_id}")


if __name__ == "__main__":
  main()
