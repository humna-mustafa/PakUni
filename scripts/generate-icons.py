"""
Generate PakUni app icon PNGs from SVG source files.
Creates:
  - src/assets/images/pakuni-logo.png (400x520 - full logo with text)
  - src/assets/images/pakuni-icon.png (512x512 - icon only)
  - src/assets/images/pakuni-icon-round.png (512x512 - with circle bg)
  - Android mipmap icons (all densities)
  - store-listing/icon-512.png (Play Store icon)
"""

import cairosvg
import os
from PIL import Image, ImageDraw

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SVG_DIR = os.path.join(BASE_DIR, "src", "assets", "svg")
IMG_DIR = os.path.join(BASE_DIR, "src", "assets", "images")
ANDROID_RES = os.path.join(BASE_DIR, "android", "app", "src", "main", "res")
STORE_DIR = os.path.join(BASE_DIR, "store-listing")

os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(STORE_DIR, exist_ok=True)

# --- 1. Full logo with text (for splash screens, about page, etc.) ---
print("Generating full logo PNG...")
cairosvg.svg2png(
    url=os.path.join(SVG_DIR, "pakuni-logo.svg"),
    write_to=os.path.join(IMG_DIR, "pakuni-logo.png"),
    output_width=400,
    output_height=520,
)
print(f"  -> {os.path.join(IMG_DIR, 'pakuni-logo.png')}")

# --- 2. Icon-only PNG (512x512 for general use) ---
print("Generating icon PNG (512x512)...")
cairosvg.svg2png(
    url=os.path.join(SVG_DIR, "pakuni-icon.svg"),
    write_to=os.path.join(IMG_DIR, "pakuni-icon.png"),
    output_width=512,
    output_height=512,
)
print(f"  -> {os.path.join(IMG_DIR, 'pakuni-icon.png')}")

# --- 3. Round icon with white background (for Android adaptive icon / Play Store) ---
print("Generating round icon with background...")
# First render SVG at high res
cairosvg.svg2png(
    url=os.path.join(SVG_DIR, "pakuni-icon.svg"),
    write_to=os.path.join(IMG_DIR, "_temp_icon.png"),
    output_width=400,
    output_height=400,
)

icon_fg = Image.open(os.path.join(IMG_DIR, "_temp_icon.png")).convert("RGBA")

# Create 512x512 canvas with white background
canvas = Image.new("RGBA", (512, 512), (255, 255, 255, 255))
# Center the icon with padding
offset_x = (512 - 400) // 2
offset_y = (512 - 400) // 2
canvas.paste(icon_fg, (offset_x, offset_y), icon_fg)

# Create circular mask
mask = Image.new("L", (512, 512), 0)
draw = ImageDraw.Draw(mask)
draw.ellipse((0, 0, 512, 512), fill=255)

# Apply circle mask
round_icon = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
round_icon.paste(canvas, mask=mask)
round_icon.save(os.path.join(IMG_DIR, "pakuni-icon-round.png"))
print(f"  -> {os.path.join(IMG_DIR, 'pakuni-icon-round.png')}")

# --- 4. Play Store icon (512x512, must be square with no transparency) ---
print("Generating Play Store icon (512x512)...")
store_icon = Image.new("RGB", (512, 512), (255, 255, 255))
# Paste icon centered with padding
icon_for_store = icon_fg.resize((420, 420), Image.LANCZOS)
store_offset = (512 - 420) // 2
store_icon.paste(icon_for_store, (store_offset, store_offset), icon_for_store)
store_icon.save(os.path.join(STORE_DIR, "icon-512.png"), quality=95)
print(f"  -> {os.path.join(STORE_DIR, 'icon-512.png')}")

# --- 5. Android mipmap launcher icons ---
MIPMAP_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

print("Generating Android mipmap launcher icons...")
for folder, size in MIPMAP_SIZES.items():
    out_dir = os.path.join(ANDROID_RES, folder)
    os.makedirs(out_dir, exist_ok=True)

    # Square icon with white background
    bg = Image.new("RGB", (size, size), (255, 255, 255))
    # Render SVG at icon size with padding
    inner_size = int(size * 0.78)
    cairosvg.svg2png(
        url=os.path.join(SVG_DIR, "pakuni-icon.svg"),
        write_to=os.path.join(IMG_DIR, "_temp_mipmap.png"),
        output_width=inner_size,
        output_height=inner_size,
    )
    fg = Image.open(os.path.join(IMG_DIR, "_temp_mipmap.png")).convert("RGBA")
    offset = (size - inner_size) // 2
    bg.paste(fg, (offset, offset), fg)
    bg.save(os.path.join(out_dir, "ic_launcher.png"))
    print(f"  -> {folder}/ic_launcher.png ({size}x{size})")

    # Round icon
    round_canvas = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    round_canvas.paste(fg, (offset, offset), fg)
    round_mask = Image.new("L", (size, size), 0)
    round_draw = ImageDraw.Draw(round_mask)
    round_draw.ellipse((0, 0, size, size), fill=255)
    round_result = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    round_result.paste(round_canvas, mask=round_mask)
    round_result.save(os.path.join(out_dir, "ic_launcher_round.png"))
    print(f"  -> {folder}/ic_launcher_round.png ({size}x{size})")

# Cleanup temp files
for temp in ["_temp_icon.png", "_temp_mipmap.png"]:
    path = os.path.join(IMG_DIR, temp)
    if os.path.exists(path):
        os.remove(path)

print("\n✅ All PakUni app icons generated successfully!")
print(f"\nGenerated files:")
print(f"  Logo:        src/assets/images/pakuni-logo.png (400x520)")
print(f"  Icon:        src/assets/images/pakuni-icon.png (512x512)")
print(f"  Round icon:  src/assets/images/pakuni-icon-round.png (512x512)")
print(f"  Store icon:  store-listing/icon-512.png (512x512)")
print(f"  Mipmap:      android/app/src/main/res/mipmap-*/ic_launcher.png")
print(f"               android/app/src/main/res/mipmap-*/ic_launcher_round.png")
