from __future__ import annotations

from math import cos, radians, sin
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

SIZE = 1024
PRIMARY = (99, 102, 241, 255)
PRIMARY_SOFT = (165, 180, 252, 255)
SUCCESS = (34, 197, 94, 255)
SUCCESS_SOFT = (134, 239, 172, 255)
SLATE_950 = (15, 23, 42, 255)


def lerp(a: int, b: int, t: float) -> int:
    return round(a + (b - a) * t)


def lerp_color(start: tuple[int, int, int, int], end: tuple[int, int, int, int], t: float) -> tuple[int, int, int, int]:
    return tuple(lerp(start[i], end[i], t) for i in range(4))


def vertical_gradient(size: int, top: tuple[int, int, int, int], bottom: tuple[int, int, int, int]) -> Image.Image:
    band = Image.new("RGBA", (1, size))
    pixels = band.load()
    for y in range(size):
        pixels[0, y] = lerp_color(top, bottom, y / (size - 1))
    return band.resize((size, size))


def radial_glow(size: int, center: tuple[int, int], radius: int, color: tuple[int, int, int, int], blur: int) -> Image.Image:
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    x, y = center
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)
    return glow.filter(ImageFilter.GaussianBlur(blur))


def scale_layer(layer: Image.Image, scale: float, y_shift: int = 0) -> tuple[Image.Image, tuple[int, int]]:
    scaled_size = round(layer.width * scale)
    resized = layer.resize((scaled_size, scaled_size), Image.Resampling.LANCZOS)
    x = (layer.width - scaled_size) // 2
    y = (layer.height - scaled_size) // 2 + y_shift
    return resized, (x, y)


def rotate_points(points: list[tuple[float, float]], center: tuple[float, float], angle_deg: float) -> list[tuple[float, float]]:
    angle = radians(angle_deg)
    cx, cy = center
    rotated: list[tuple[float, float]] = []
    for px, py in points:
        dx = px - cx
        dy = py - cy
        rx = cx + dx * cos(angle) - dy * sin(angle)
        ry = cy + dx * sin(angle) + dy * cos(angle)
        rotated.append((rx, ry))
    return rotated


def leaf_polygon(center: tuple[float, float], width: float, height: float, angle_deg: float) -> list[tuple[float, float]]:
    cx, cy = center
    half_w = width / 2
    half_h = height / 2
    samples = 8
    right_edge: list[tuple[float, float]] = []
    left_edge: list[tuple[float, float]] = []

    for i in range(samples + 1):
        t = i / samples
        y = cy - half_h + height * t
        fullness = sin(3.1415926535 * t) ** 0.9
        taper = 0.82 - 0.2 * t
        x_offset = half_w * fullness * taper
        sway = half_w * 0.08 * (1 - t)
        right_edge.append((cx + x_offset + sway, y))
        left_edge.append((cx - x_offset + sway, y))

    points = [*right_edge, *reversed(left_edge)]
    return rotate_points(points, center, angle_deg)


def draw_leaf(layer: Image.Image, center: tuple[float, float], width: float, height: float, angle_deg: float) -> None:
    draw = ImageDraw.Draw(layer)
    polygon = leaf_polygon(center, width, height, angle_deg)
    vein = rotate_points(
        [(center[0], center[1] + height * 0.35), (center[0], center[1] - height * 0.38)],
        center,
        angle_deg,
    )
    highlight = leaf_polygon((center[0] - width * 0.09, center[1] - height * 0.1), width * 0.48, height * 0.5, angle_deg)
    draw.polygon(polygon, fill=SUCCESS, outline=(173, 255, 206, 235), width=10)
    draw.polygon(highlight, fill=(219, 255, 233, 68))
    draw.line(vein, fill=(223, 255, 235, 172), width=8)


def build_icon() -> Image.Image:
    icon = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))

    tile_shadow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    tile_shadow_draw = ImageDraw.Draw(tile_shadow)
    tile_shadow_draw.ellipse((188, 804, 836, 1016), fill=(4, 6, 15, 84))
    icon.alpha_composite(tile_shadow.filter(ImageFilter.GaussianBlur(42)))

    back_tile = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    back_tile_draw = ImageDraw.Draw(back_tile)
    back_tile_draw.rounded_rectangle((92, 96, 932, 928), radius=200, fill=(14, 17, 36, 255))
    icon.alpha_composite(back_tile)

    front_mask = Image.new("L", (SIZE, SIZE), 0)
    front_mask_draw = ImageDraw.Draw(front_mask)
    front_mask_draw.rounded_rectangle((92, 76, 932, 908), radius=196, fill=255)

    front_fill = vertical_gradient(SIZE, (53, 61, 121, 255), (23, 28, 56, 255))
    front_fill.putalpha(front_mask)
    icon.alpha_composite(front_fill)

    tile_lights = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    tile_lights.alpha_composite(radial_glow(SIZE, (220, 160), 280, (99, 102, 241, 120), 150))
    tile_lights.alpha_composite(radial_glow(SIZE, (806, 188), 220, (99, 102, 241, 74), 130))
    tile_lights.alpha_composite(radial_glow(SIZE, (540, 820), 260, (34, 197, 94, 54), 170))
    tile_lights.putalpha(ImageChops.multiply(front_mask, tile_lights.getchannel("A")))
    icon.alpha_composite(tile_lights)

    sheen = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    sheen_draw = ImageDraw.Draw(sheen)
    sheen_draw.polygon(
        [(-120, 90), (520, -80), (1180, -80), (1180, 180), (160, 360)],
        fill=(255, 255, 255, 22),
    )
    sheen.putalpha(ImageChops.multiply(front_mask, sheen.getchannel("A")))
    icon.alpha_composite(sheen.filter(ImageFilter.GaussianBlur(30)))

    top_gloss = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    top_gloss_draw = ImageDraw.Draw(top_gloss)
    top_gloss_draw.ellipse((130, 64, 892, 450), fill=(255, 255, 255, 36))
    top_gloss.putalpha(ImageChops.multiply(front_mask, top_gloss.getchannel("A")))
    icon.alpha_composite(top_gloss.filter(ImageFilter.GaussianBlur(50)))

    lower_vignette = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    lower_vignette_draw = ImageDraw.Draw(lower_vignette)
    lower_vignette_draw.ellipse((134, 450, 890, 1040), fill=(6, 8, 20, 86))
    lower_vignette.putalpha(ImageChops.multiply(front_mask, lower_vignette.getchannel("A")))
    icon.alpha_composite(lower_vignette.filter(ImageFilter.GaussianBlur(46)))

    art = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    cloud_mask = Image.new("L", (SIZE, SIZE), 0)
    cloud_draw = ImageDraw.Draw(cloud_mask)
    cloud_draw.ellipse((120, 380, 410, 675), fill=255)
    cloud_draw.ellipse((300, 230, 610, 600), fill=255)
    cloud_draw.ellipse((505, 300, 890, 685), fill=255)
    cloud_draw.rounded_rectangle((210, 430, 825, 705), radius=180, fill=255)

    cloud_fill = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    cloud_fill.paste((118, 132, 255, 72), mask=cloud_mask)
    art.alpha_composite(cloud_fill)

    cloud_highlight = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    highlight_draw = ImageDraw.Draw(cloud_highlight)
    highlight_draw.ellipse((230, 290, 820, 660), fill=(196, 205, 255, 40))
    cloud_highlight.putalpha(ImageChops.multiply(cloud_mask, cloud_highlight.getchannel("A")))
    art.alpha_composite(cloud_highlight)

    outline_mask = ImageChops.subtract(cloud_mask.filter(ImageFilter.MaxFilter(29)), cloud_mask)
    outline = Image.new("RGBA", (SIZE, SIZE), PRIMARY_SOFT)
    outline.putalpha(outline_mask)
    art.alpha_composite(outline)

    brain = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    brain_draw = ImageDraw.Draw(brain)
    brain_draw.line([(395, 505), (455, 468), (505, 455)], fill=(221, 230, 255, 150), width=18, joint="curve")
    brain_draw.line([(585, 410), (640, 445), (700, 450)], fill=(221, 230, 255, 150), width=18, joint="curve")

    nodes = [(280, 470), (365, 360), (520, 330), (695, 372), (745, 520), (620, 590), (415, 585), (315, 520)]
    edges = [(0, 1), (0, 7), (1, 2), (1, 7), (2, 3), (2, 6), (3, 4), (3, 5), (4, 5), (5, 6), (6, 7)]
    for start, end in edges:
        brain_draw.line([nodes[start], nodes[end]], fill=(156, 173, 255, 68), width=8)
    for x, y in nodes:
        r = 12
        brain_draw.ellipse((x - r, y - r, x + r, y + r), fill=(214, 224, 255, 185))
    art.alpha_composite(brain.filter(ImageFilter.GaussianBlur(0.3)))

    sprout_glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    sprout_glow_draw = ImageDraw.Draw(sprout_glow)
    sprout_glow_draw.line([(512, 770), (518, 675), (507, 582), (522, 492), (545, 364)], fill=(85, 255, 153, 110), width=74, joint="curve")
    art.alpha_composite(sprout_glow.filter(ImageFilter.GaussianBlur(32)))

    stem = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    stem_draw = ImageDraw.Draw(stem)
    stem_draw.line([(512, 775), (518, 685), (507, 595), (522, 505), (545, 372)], fill=SUCCESS, width=38, joint="curve")
    stem_draw.line([(516, 622), (560, 615), (600, 592)], fill=SUCCESS, width=22, joint="curve")
    stem_draw.line([(510, 650), (472, 638), (428, 612)], fill=SUCCESS, width=22, joint="curve")
    stem_draw.line([(522, 520), (553, 500), (592, 468)], fill=SUCCESS, width=20, joint="curve")
    stem_draw.line([(516, 552), (494, 534), (460, 506)], fill=SUCCESS, width=18, joint="curve")
    stem_draw.line([(518, 770), (540, 630)], fill=(201, 255, 223, 124), width=10)
    art.alpha_composite(stem)

    leaves = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw_leaf(leaves, (402, 607), 178, 228, 29)
    draw_leaf(leaves, (627, 579), 164, 212, -34)
    draw_leaf(leaves, (443, 500), 126, 164, 22)
    draw_leaf(leaves, (610, 452), 132, 172, -27)
    draw_leaf(leaves, (552, 302), 118, 214, 7)
    art.alpha_composite(leaves)

    art_shadow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    shadow_alpha = art.getchannel("A").filter(ImageFilter.GaussianBlur(34))
    art_shadow.paste((4, 9, 22, 88), (0, 0), shadow_alpha)

    scaled_shadow, shadow_pos = scale_layer(art_shadow, 0.78, 54)
    scaled_art, art_pos = scale_layer(art, 0.78, 40)
    clipped_art = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    clipped_art.alpha_composite(scaled_shadow, shadow_pos)
    clipped_art.alpha_composite(scaled_art, art_pos)
    clipped_art.putalpha(ImageChops.multiply(front_mask, clipped_art.getchannel("A")))
    icon.alpha_composite(clipped_art)

    rim = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    rim_draw = ImageDraw.Draw(rim)
    rim_draw.rounded_rectangle((92, 76, 932, 908), radius=196, outline=(255, 255, 255, 54), width=8)
    rim_draw.rounded_rectangle((104, 88, 920, 896), radius=184, outline=(180, 194, 255, 20), width=3)
    icon.alpha_composite(rim)

    clean = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    clean.paste(icon, (0, 0), icon)
    return clean


def main() -> None:
    output = Path(__file__).resolve().parents[1] / "app-icon.png"
    image = build_icon()
    image.save(output, format="PNG", optimize=True)
    print(f"Generated {output}")


if __name__ == "__main__":
    main()
