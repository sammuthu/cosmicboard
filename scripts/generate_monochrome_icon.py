#!/usr/bin/env python3
"""Generate monochrome icon for Android 13+ themed icons"""

from PIL import Image, ImageDraw
import math

def create_monochrome_icon(size=1024):
    """Create white monochrome version for Android themed icons"""

    # Transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    center = size // 2

    # Scale for safe zone
    # Using 0.80 to fill more space and reduce background visibility
    safe_scale = 0.80

    # Draw orbital rings (white only)
    ring_radii = [size * 0.28 * safe_scale, size * 0.20 * safe_scale, size * 0.13 * safe_scale]
    ring_widths = [int(size * 0.018), int(size * 0.020), int(size * 0.022)]

    for radius, width in zip(ring_radii, ring_widths):
        draw.ellipse([center - radius, center - radius,
                      center + radius, center + radius],
                     outline=(255, 255, 255, 255), width=width)

    # Draw orbital nodes
    node_positions = [
        (center + ring_radii[0] * math.cos(math.radians(45)),
         center + ring_radii[0] * math.sin(math.radians(45))),
        (center + ring_radii[0] * math.cos(math.radians(135)),
         center + ring_radii[0] * math.sin(math.radians(135))),
        (center + ring_radii[0] * math.cos(math.radians(225)),
         center + ring_radii[0] * math.sin(math.radians(225))),
        (center + ring_radii[0] * math.cos(math.radians(315)),
         center + ring_radii[0] * math.sin(math.radians(315)))
    ]

    node_radius = size * 0.04 * safe_scale

    for (x, y) in node_positions:
        draw.ellipse([x - node_radius, y - node_radius,
                      x + node_radius, y + node_radius],
                    fill=(255, 255, 255, 255))

    # Draw central core
    core_radius = size * 0.065 * safe_scale
    draw.ellipse([center - core_radius, center - core_radius,
                  center + core_radius, center + core_radius],
                fill=(255, 255, 255, 255))

    return img

# Generate and save
output_path = '/Users/sammuthu/Projects/cosmicboard/app-icons/v1-orbital-alignment/android-adaptive/ic_launcher_monochrome.png'
icon = create_monochrome_icon(1024)
icon.save(output_path, 'PNG')
print(f"✓ Generated monochrome icon: {output_path}")
