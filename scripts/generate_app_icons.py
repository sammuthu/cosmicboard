#!/usr/bin/env python3
"""
CosmicBoard App Icon Generator
Creates high-quality app icons for iOS and Android that represent:
- Productivity and organization (orbital structure)
- Cosmic theme (gradients and space-like aesthetics)
- Goal alignment (centered focus with orbiting elements)
"""

from PIL import Image, ImageDraw, ImageFilter
import math
import os

def create_gradient_background(size, colors):
    """Create a radial gradient background"""
    image = Image.new('RGB', (size, size))
    draw = ImageDraw.Draw(image)

    center_x, center_y = size // 2, size // 2
    max_radius = size * 0.7

    for i in range(int(max_radius)):
        # Interpolate between colors
        ratio = i / max_radius

        if ratio < 0.5:
            # First half: interpolate between color 0 and 1
            local_ratio = ratio * 2
            r = int(colors[0][0] + (colors[1][0] - colors[0][0]) * local_ratio)
            g = int(colors[0][1] + (colors[1][1] - colors[0][1]) * local_ratio)
            b = int(colors[0][2] + (colors[1][2] - colors[0][2]) * local_ratio)
        else:
            # Second half: interpolate between color 1 and 2
            local_ratio = (ratio - 0.5) * 2
            r = int(colors[1][0] + (colors[2][0] - colors[1][0]) * local_ratio)
            g = int(colors[1][1] + (colors[2][1] - colors[1][1]) * local_ratio)
            b = int(colors[1][2] + (colors[2][2] - colors[1][2]) * local_ratio)

        color = (r, g, b)
        draw.ellipse([center_x - i, center_y - i, center_x + i, center_y + i],
                     fill=color)

    return image

def add_glow(image, glow_color, intensity=30):
    """Add a subtle glow effect"""
    glow = Image.new('RGBA', image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)

    center = image.size[0] // 2
    radius = image.size[0] // 3

    draw.ellipse([center - radius, center - radius,
                  center + radius, center + radius],
                 fill=(*glow_color, intensity))

    glow = glow.filter(ImageFilter.GaussianBlur(radius=40))
    image = Image.alpha_composite(image.convert('RGBA'), glow)

    return image

def create_cosmicboard_icon_v1(size=1024):
    """
    Version 1: Orbital Alignment Icon
    - Central glowing core (user's primary goal)
    - Three orbital rings (projects at different priorities)
    - Four orbital nodes (active tasks/projects)
    - Clean, modern, scales perfectly
    """

    # Color scheme: Deep space purple to vibrant pink/cyan
    bg_colors = [
        (30, 20, 60),      # Deep purple (outer)
        (80, 40, 120),     # Medium purple (middle)
        (140, 60, 180)     # Brighter purple (center)
    ]

    # Create background
    img = create_gradient_background(size, bg_colors)
    img = img.convert('RGBA')

    # Add subtle glow
    img = add_glow(img, (180, 100, 255), intensity=20)

    draw = ImageDraw.Draw(img)
    center = size // 2

    # Draw three orbital rings (representing project layers)
    ring_radii = [size * 0.38, size * 0.28, size * 0.18]
    ring_widths = [int(size * 0.015), int(size * 0.018), int(size * 0.020)]
    ring_colors = [
        (255, 255, 255, 40),   # Outer ring (subtle)
        (200, 150, 255, 60),   # Middle ring
        (255, 200, 255, 80)    # Inner ring (brightest)
    ]

    for radius, width, color in zip(ring_radii, ring_widths, ring_colors):
        draw.ellipse([center - radius, center - radius,
                      center + radius, center + radius],
                     outline=color, width=width)

    # Draw orbital nodes (4 points representing active tasks)
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
        (255, 180, 100),  # Orange (Supernova)
        (150, 200, 255),  # Blue (Stellar)
        (255, 150, 200),  # Pink
        (180, 255, 200)   # Cyan
    ]

    node_radius = size * 0.035

    for (x, y), color in zip(node_positions, node_colors):
        # Draw node with gradient
        for i in range(int(node_radius), 0, -1):
            alpha = int(255 * (i / node_radius))
            draw.ellipse([x - i, y - i, x + i, y + i],
                        fill=(*color, alpha))

    # Draw central core (the user's primary focus)
    core_radius = size * 0.08

    # Outer glow
    for i in range(int(core_radius * 1.8), int(core_radius), -1):
        alpha = int(60 * ((core_radius * 1.8 - i) / (core_radius * 0.8)))
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

    # Add sparkle effect (small stars)
    sparkle_positions = [
        (size * 0.2, size * 0.15),
        (size * 0.8, size * 0.2),
        (size * 0.15, size * 0.75),
        (size * 0.85, size * 0.8),
        (size * 0.5, size * 0.08),
        (size * 0.92, size * 0.5)
    ]

    for x, y in sparkle_positions:
        sparkle_size = size * 0.008
        draw.ellipse([x - sparkle_size, y - sparkle_size,
                     x + sparkle_size, y + sparkle_size],
                    fill=(255, 255, 255, 180))

    return img

def create_cosmicboard_icon_v2(size=1024):
    """
    Version 2: Network Constellation Icon
    - Interconnected nodes forming a constellation
    - Represents tasks, projects, and connections
    - More abstract, network-focused design
    """

    # Darker, more saturated background
    bg_colors = [
        (20, 10, 40),      # Very deep purple
        (60, 30, 90),      # Deep purple
        (100, 50, 140)     # Rich purple
    ]

    img = create_gradient_background(size, bg_colors)
    img = img.convert('RGBA')
    img = add_glow(img, (150, 80, 200), intensity=25)

    draw = ImageDraw.Draw(img)
    center = size // 2

    # Create constellation pattern (hexagonal arrangement)
    hex_radius = size * 0.25

    # Central node
    main_nodes = [(center, center)]

    # Six surrounding nodes
    for angle in range(0, 360, 60):
        rad = math.radians(angle)
        x = center + hex_radius * math.cos(rad)
        y = center + hex_radius * math.sin(rad)
        main_nodes.append((x, y))

    # Draw connections between nodes
    connection_pairs = [
        (0, 1), (0, 2), (0, 3), (0, 4), (0, 5), (0, 6),  # Center to all
        (1, 2), (2, 3), (3, 4), (4, 5), (5, 6), (6, 1)   # Outer ring
    ]

    for i, j in connection_pairs:
        x1, y1 = main_nodes[i]
        x2, y2 = main_nodes[j]

        # Draw glowing line
        draw.line([x1, y1, x2, y2],
                 fill=(180, 120, 255, 100), width=int(size * 0.008))

    # Draw nodes
    node_sizes = [size * 0.06] + [size * 0.04] * 6  # Center is bigger
    node_colors = [
        (255, 200, 100),   # Center: warm yellow
        (255, 150, 200),   # Pink
        (150, 200, 255),   # Blue
        (180, 255, 200),   # Cyan
        (255, 180, 150),   # Coral
        (200, 180, 255),   # Lavender
        (255, 220, 150)    # Gold
    ]

    for (x, y), node_size, color in zip(main_nodes, node_sizes, node_colors):
        # Outer glow
        for i in range(int(node_size * 1.5), int(node_size), -1):
            alpha = int(80 * ((node_size * 1.5 - i) / (node_size * 0.5)))
            draw.ellipse([x - i, y - i, x + i, y + i],
                        fill=(*color, alpha))

        # Main node
        for i in range(int(node_size), 0, -1):
            alpha = int(255 * (i / node_size))
            draw.ellipse([x - i, y - i, x + i, y + i],
                        fill=(*color, alpha))

    # Add sparkles
    import random
    random.seed(42)  # Consistent sparkles
    for _ in range(15):
        x = random.randint(int(size * 0.1), int(size * 0.9))
        y = random.randint(int(size * 0.1), int(size * 0.9))
        sparkle_size = random.uniform(size * 0.004, size * 0.01)
        alpha = random.randint(100, 200)
        draw.ellipse([x - sparkle_size, y - sparkle_size,
                     x + sparkle_size, y + sparkle_size],
                    fill=(255, 255, 255, alpha))

    return img

def create_cosmicboard_icon_v3(size=1024):
    """
    Version 3: Minimal Cosmic Compass
    - Clean circular design with directional markers
    - Represents navigation and goal-finding
    - Most minimal and professional
    """

    # Gradient from deep blue-purple to vibrant purple
    bg_colors = [
        (25, 15, 50),
        (70, 35, 110),
        (120, 55, 160)
    ]

    img = create_gradient_background(size, bg_colors)
    img = img.convert('RGBA')
    img = add_glow(img, (160, 90, 220), intensity=22)

    draw = ImageDraw.Draw(img)
    center = size // 2

    # Main compass ring
    compass_radius = size * 0.32
    ring_width = int(size * 0.025)

    # Outer ring with gradient effect
    for i in range(ring_width):
        alpha = int(200 - (i * 50 / ring_width))
        radius = compass_radius + i
        draw.ellipse([center - radius, center - radius,
                     center + radius, center + radius],
                    outline=(220, 180, 255, alpha), width=1)

    # Draw four cardinal markers (N, E, S, W representing priorities/categories)
    marker_length = size * 0.12
    marker_width = int(size * 0.02)

    cardinal_angles = [0, 90, 180, 270]  # Top, Right, Bottom, Left
    marker_colors = [
        (255, 200, 100),  # Gold
        (150, 220, 255),  # Sky blue
        (255, 150, 200),  # Pink
        (180, 255, 180)   # Mint
    ]

    for angle, color in zip(cardinal_angles, marker_colors):
        rad = math.radians(angle - 90)  # -90 to start from top

        # Outer point
        x1 = center + (compass_radius + marker_width) * math.cos(rad)
        y1 = center + (compass_radius + marker_width) * math.sin(rad)

        # Inner point
        x2 = center + (compass_radius + marker_length) * math.cos(rad)
        y2 = center + (compass_radius + marker_length) * math.sin(rad)

        # Draw marker with glow
        for thickness in range(marker_width, 0, -1):
            alpha = int(255 * (thickness / marker_width))
            draw.line([x1, y1, x2, y2], fill=(*color, alpha), width=thickness)

    # Inner rings (concentric circles)
    inner_radii = [size * 0.22, size * 0.12]
    for radius in inner_radii:
        draw.ellipse([center - radius, center - radius,
                     center + radius, center + radius],
                    outline=(200, 160, 255, 120), width=int(size * 0.012))

    # Central core - vibrant and glowing
    core_radius = size * 0.055

    # Multi-layer glow
    for i in range(int(core_radius * 2), int(core_radius), -1):
        alpha = int(50 * ((core_radius * 2 - i) / core_radius))
        draw.ellipse([center - i, center - i, center + i, center + i],
                    fill=(255, 180, 255, alpha))

    # Gradient core
    for i in range(int(core_radius), 0, -1):
        ratio = (core_radius - i) / core_radius
        r = int(255 - ratio * 50)
        g = int(200 - ratio * 100)
        b = int(255 - ratio * 20)
        draw.ellipse([center - i, center - i, center + i, center + i],
                    fill=(r, g, b, 255))

    # Subtle sparkles
    sparkle_positions = [
        (size * 0.15, size * 0.2),
        (size * 0.85, size * 0.25),
        (size * 0.2, size * 0.8),
        (size * 0.8, size * 0.75)
    ]

    for x, y in sparkle_positions:
        draw.ellipse([x - size * 0.006, y - size * 0.006,
                     x + size * 0.006, y + size * 0.006],
                    fill=(255, 255, 255, 150))

    return img

def apply_ios_shape(img, size):
    """Apply iOS squircle shape mask"""
    # Create a mask with rounded corners (iOS style)
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)

    # iOS uses a squircle (superellipse), we'll approximate with rounded rectangle
    corner_radius = int(size * 0.225)  # iOS standard ~22.5%
    draw.rounded_rectangle([0, 0, size - 1, size - 1],
                          radius=corner_radius, fill=255)

    # Apply mask
    output = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    output.paste(img, (0, 0))
    output.putalpha(mask)

    return output

def save_icon_set(base_img, output_dir, platform='ios'):
    """Save icons in all required sizes for the platform"""

    if platform == 'ios':
        sizes = {
            '1024': 1024,    # App Store
            '180': 180,      # iPhone 60pt @3x
            '120': 120,      # iPhone 60pt @2x
            '167': 167,      # iPad Pro 83.5pt @2x
            '152': 152,      # iPad 76pt @2x
            '76': 76,        # iPad 76pt @1x
            '80': 80,        # iPhone 40pt @2x (Spotlight)
            '58': 58,        # iPhone 29pt @2x (Settings)
            '40': 40,        # iPhone 20pt @2x (Notification)
        }
    else:  # android
        sizes = {
            '512': 512,      # Play Store
            '192': 192,      # xxxhdpi
            '144': 144,      # xxhdpi
            '96': 96,        # xhdpi
            '72': 72,        # hdpi
            '48': 48,        # mdpi
        }

    os.makedirs(output_dir, exist_ok=True)

    for name, size in sizes.items():
        resized = base_img.resize((size, size), Image.Resampling.LANCZOS)

        if platform == 'ios' and size < 1024:
            # Apply iOS shape to smaller icons
            resized = apply_ios_shape(resized, size)

        filename = f'icon-{name}.png'
        filepath = os.path.join(output_dir, filename)
        resized.save(filepath, 'PNG', quality=100)
        print(f'✓ Saved {filepath}')

def main():
    """Generate all app icon variations"""

    print("🎨 Generating CosmicBoard App Icons...")
    print("=" * 60)

    # Create output directory
    output_base = '/Users/sammuthu/Projects/cosmicboard/app-icons'
    os.makedirs(output_base, exist_ok=True)

    # Generate Version 1: Orbital Alignment
    print("\n📍 Version 1: Orbital Alignment (Recommended)")
    icon_v1 = create_cosmicboard_icon_v1(1024)
    v1_dir = os.path.join(output_base, 'v1-orbital-alignment')
    os.makedirs(v1_dir, exist_ok=True)
    icon_v1.save(os.path.join(v1_dir, 'preview-1024.png'), 'PNG', quality=100)
    save_icon_set(icon_v1, os.path.join(v1_dir, 'ios'), 'ios')
    save_icon_set(icon_v1, os.path.join(v1_dir, 'android'), 'android')

    # Generate Version 2: Network Constellation
    print("\n🌐 Version 2: Network Constellation")
    icon_v2 = create_cosmicboard_icon_v2(1024)
    v2_dir = os.path.join(output_base, 'v2-network-constellation')
    os.makedirs(v2_dir, exist_ok=True)
    icon_v2.save(os.path.join(v2_dir, 'preview-1024.png'), 'PNG', quality=100)
    save_icon_set(icon_v2, os.path.join(v2_dir, 'ios'), 'ios')
    save_icon_set(icon_v2, os.path.join(v2_dir, 'android'), 'android')

    # Generate Version 3: Cosmic Compass
    print("\n🧭 Version 3: Cosmic Compass (Most Minimal)")
    icon_v3 = create_cosmicboard_icon_v3(1024)
    v3_dir = os.path.join(output_base, 'v3-cosmic-compass')
    os.makedirs(v3_dir, exist_ok=True)
    icon_v3.save(os.path.join(v3_dir, 'preview-1024.png'), 'PNG', quality=100)
    save_icon_set(icon_v3, os.path.join(v3_dir, 'ios'), 'ios')
    save_icon_set(icon_v3, os.path.join(v3_dir, 'android'), 'android')

    print("\n" + "=" * 60)
    print("✨ Icon generation complete!")
    print(f"📁 Output directory: {output_base}")
    print("\n🎯 Recommendation: Version 1 (Orbital Alignment)")
    print("   - Best represents 'align your actions with the cosmos'")
    print("   - Clear visual hierarchy")
    print("   - Scales perfectly to all sizes")
    print("   - Professional and unique")

if __name__ == '__main__':
    main()
