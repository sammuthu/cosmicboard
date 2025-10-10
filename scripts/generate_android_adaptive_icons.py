#!/usr/bin/env python3
"""
Generate Android Adaptive Icons for CosmicBoard
Creates foreground and background layers for adaptive icon system
"""

from PIL import Image, ImageDraw, ImageFilter
import os

def create_gradient_background(size, colors):
    """Create a radial gradient background"""
    image = Image.new('RGB', (size, size))
    draw = ImageDraw.Draw(image)

    center_x, center_y = size // 2, size // 2
    max_radius = size * 0.7

    for i in range(int(max_radius)):
        ratio = i / max_radius

        if ratio < 0.5:
            local_ratio = ratio * 2
            r = int(colors[0][0] + (colors[1][0] - colors[0][0]) * local_ratio)
            g = int(colors[0][1] + (colors[1][1] - colors[0][1]) * local_ratio)
            b = int(colors[0][2] + (colors[1][2] - colors[0][2]) * local_ratio)
        else:
            local_ratio = (ratio - 0.5) * 2
            r = int(colors[1][0] + (colors[2][0] - colors[1][0]) * local_ratio)
            g = int(colors[1][1] + (colors[2][1] - colors[1][1]) * local_ratio)
            b = int(colors[1][2] + (colors[2][2] - colors[1][2]) * local_ratio)

        color = (r, g, b)
        draw.ellipse([center_x - i, center_y - i, center_x + i, center_y + i],
                     fill=color)

    return image

def create_android_adaptive_foreground(size=1024):
    """
    Create foreground layer for Android adaptive icon
    This will be overlaid on the background and can be masked to any shape
    Safe zone: Center 66% (avoid outer 17% on each side)
    """

    # Create transparent image
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    center = size // 2

    # Scale everything to fit within safe zone (center 66%)
    # Android adaptive icons have a safe zone of 66dp out of 108dp
    # Using 0.80 to fill more space and reduce background visibility
    safe_scale = 0.80

    # Draw three orbital rings (scaled for safe zone)
    ring_radii = [size * 0.28 * safe_scale, size * 0.20 * safe_scale, size * 0.13 * safe_scale]
    ring_widths = [int(size * 0.018), int(size * 0.020), int(size * 0.022)]
    ring_colors = [
        (255, 255, 255, 60),   # Outer ring (more opaque for visibility)
        (220, 180, 255, 90),   # Middle ring
        (255, 220, 255, 110)   # Inner ring (brightest)
    ]

    for radius, width, color in zip(ring_radii, ring_widths, ring_colors):
        draw.ellipse([center - radius, center - radius,
                      center + radius, center + radius],
                     outline=color, width=width)

    # Draw orbital nodes (4 points representing active tasks)
    import math
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

    node_colors = [
        (255, 180, 100),  # Orange
        (150, 200, 255),  # Blue
        (255, 150, 200),  # Pink
        (180, 255, 200)   # Cyan
    ]

    node_radius = size * 0.04 * safe_scale

    for (x, y), color in zip(node_positions, node_colors):
        # Draw node with gradient
        for i in range(int(node_radius), 0, -1):
            alpha = int(255 * (i / node_radius))
            draw.ellipse([x - i, y - i, x + i, y + i],
                        fill=(*color, alpha))

    # Draw central core (the user's primary focus)
    core_radius = size * 0.065 * safe_scale

    # Outer glow
    for i in range(int(core_radius * 1.8), int(core_radius), -1):
        alpha = int(80 * ((core_radius * 1.8 - i) / (core_radius * 0.8)))
        draw.ellipse([center - i, center - i, center + i, center + i],
                    fill=(255, 200, 255, alpha))

    # Main core with gradient
    for i in range(int(core_radius), 0, -1):
        ratio = i / core_radius
        r = int(255 * ratio + 200 * (1 - ratio))
        g = int(150 * ratio + 100 * (1 - ratio))
        b = int(255 * ratio + 255 * (1 - ratio))
        draw.ellipse([center - i, center - i, center + i, center + i],
                    fill=(r, g, b, 255))

    return img

def create_android_adaptive_background(size=1024):
    """
    Create background layer for Android adaptive icon
    This provides the cosmic purple gradient filling the entire area
    """

    # Create full-size gradient that fills entire square
    img = Image.new('RGB', (size, size))
    draw = ImageDraw.Draw(img)

    # Fill with radial gradient from center to corners
    center_x, center_y = size // 2, size // 2
    max_radius = int((size ** 2 + size ** 2) ** 0.5)  # Diagonal distance to fill all corners

    # Color scheme: Deep space purple to vibrant purple
    colors = [
        (140, 60, 180),    # Brighter purple (center)
        (90, 45, 130),     # Medium purple
        (50, 25, 80)       # Deep purple (edges)
    ]

    for i in range(max_radius, 0, -1):
        ratio = i / max_radius

        if ratio < 0.33:
            # Inner third
            local_ratio = ratio / 0.33
            r = int(colors[0][0] + (colors[1][0] - colors[0][0]) * local_ratio)
            g = int(colors[0][1] + (colors[1][1] - colors[0][1]) * local_ratio)
            b = int(colors[0][2] + (colors[1][2] - colors[0][2]) * local_ratio)
        elif ratio < 0.66:
            # Middle third
            local_ratio = (ratio - 0.33) / 0.33
            r = int(colors[1][0] + (colors[2][0] - colors[1][0]) * local_ratio)
            g = int(colors[1][1] + (colors[2][1] - colors[1][1]) * local_ratio)
            b = int(colors[1][2] + (colors[2][2] - colors[1][2]) * local_ratio)
        else:
            # Outer third
            local_ratio = (ratio - 0.66) / 0.34
            r = int(colors[2][0] * (1 - local_ratio * 0.3))  # Darken further at edges
            g = int(colors[2][1] * (1 - local_ratio * 0.3))
            b = int(colors[2][2] * (1 - local_ratio * 0.3))

        color = (max(0, r), max(0, g), max(0, b))
        draw.ellipse([center_x - i, center_y - i, center_x + i, center_y + i],
                     fill=color)

    # Convert to RGBA and add subtle sparkles
    img = img.convert('RGBA')
    draw = ImageDraw.Draw(img)

    # Add sparkle effect (small stars) - more subtle
    sparkle_positions = [
        (size * 0.20, size * 0.15),
        (size * 0.80, size * 0.22),
        (size * 0.18, size * 0.78),
        (size * 0.85, size * 0.82),
        (size * 0.50, size * 0.10),
        (size * 0.90, size * 0.50)
    ]

    for x, y in sparkle_positions:
        sparkle_size = size * 0.010
        draw.ellipse([x - sparkle_size, y - sparkle_size,
                     x + sparkle_size, y + sparkle_size],
                    fill=(255, 255, 255, 140))

    return img

def main():
    """Generate Android adaptive icon layers"""

    print("🎨 Generating Android Adaptive Icons...")
    print("=" * 60)

    output_dir = '/Users/sammuthu/Projects/cosmicboard/app-icons/v1-orbital-alignment/android-adaptive'
    os.makedirs(output_dir, exist_ok=True)

    # Generate foreground layer (1024x1024)
    print("\n📱 Creating foreground layer...")
    foreground = create_android_adaptive_foreground(1024)
    foreground_path = os.path.join(output_dir, 'ic_launcher_foreground.png')
    foreground.save(foreground_path, 'PNG')
    print(f"✓ Saved: {foreground_path}")

    # Generate background layer (1024x1024)
    print("\n🌌 Creating background layer...")
    background = create_android_adaptive_background(1024)
    background_path = os.path.join(output_dir, 'ic_launcher_background.png')
    background.save(background_path, 'PNG')
    print(f"✓ Saved: {background_path}")

    # Create preview (composite)
    print("\n🔍 Creating preview...")
    preview = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    preview.paste(background, (0, 0))
    preview = Image.alpha_composite(preview, foreground)

    # Apply circle mask for preview
    mask = Image.new('L', (1024, 1024), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([0, 0, 1023, 1023], fill=255)

    preview_circle = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    preview_circle.paste(preview, (0, 0))
    preview_circle.putalpha(mask)

    preview_path = os.path.join(output_dir, 'preview_circle.png')
    preview_circle.save(preview_path, 'PNG')
    print(f"✓ Saved: {preview_path}")

    print("\n" + "=" * 60)
    print("✨ Android adaptive icon generation complete!")
    print(f"📁 Output: {output_dir}")
    print("\n🎯 Files created:")
    print("   • ic_launcher_foreground.png (transparent layer with rings & nodes)")
    print("   • ic_launcher_background.png (purple gradient)")
    print("   • preview_circle.png (how it looks on Android)")

if __name__ == '__main__':
    main()
