import os
import sys
import math
import subprocess
import tempfile
import json
import shutil
import hashlib
import wave
import struct
import argparse
import base64

WIDTH = 1080
HEIGHT = 1920
FPS = 30
TOTAL_DURATION = 25.0
TOTAL_FRAMES = int(TOTAL_DURATION * FPS) # 750 frames

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_DIR = os.path.join(ROOT_DIR, "public", "exports")
os.makedirs(OUT_DIR, exist_ok=True)

# Load canonical brand assets as base64 for embedding in SVGs
BRAND_DIR = os.path.join(ROOT_DIR, "public", "brand")
CANONICAL_LOGO_PATH = os.path.join(BRAND_DIR, "jodoco_logo_canonical.png")
CANONICAL_MARK_PATH = os.path.join(BRAND_DIR, "jodoco_logo_mark.png")

CANONICAL_LOGO_B64 = ""
if os.path.exists(CANONICAL_LOGO_PATH):
    with open(CANONICAL_LOGO_PATH, "rb") as f:
        CANONICAL_LOGO_B64 = base64.b64encode(f.read()).decode("ascii")

CANONICAL_MARK_B64 = ""
if os.path.exists(CANONICAL_MARK_PATH):
    with open(CANONICAL_MARK_PATH, "rb") as f:
        CANONICAL_MARK_B64 = base64.b64encode(f.read()).decode("ascii")

def ease_out_cubic(t):
    t = max(0.0, min(1.0, t))
    return 1.0 - (1.0 - t) ** 3

def ease_in_out(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3.0 - 2.0 * t)

def clamp(val, min_v=0.0, max_v=1.0):
    return max(min_v, min(max_v, val))

# Centralized Spec Fallback Loader
DEFAULT_SPEC_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "data", "defaultReelSpec.json"))

def load_default_spec():
    if os.path.exists(DEFAULT_SPEC_PATH):
        try:
            with open(DEFAULT_SPEC_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return None

# ->->->->->-- SVG Frame Generator (1:1 Match with ReelPlayer & React Scenes) ->->->->->--
def generate_svg_frame(frame_idx, project_config=None, scene_video_frame_map=None):
    t = frame_idx / FPS # current time in seconds
    
    # Load from centralized specification
    spec = project_config or load_default_spec() or {}
    
    # Default scene configs fallback
    default_scenes = [
        {"id": 1, "startTime": 0.0, "endTime": 3.0, "name": "The Hook", "onScreenText": ["INFLUENCER", "MARKETING?", "explained in 20 seconds"], "voiceover": "Okay, so… what's influencer marketing?"},
        {"id": 2, "startTime": 3.0, "endTime": 6.0, "name": "The Brand", "onScreenText": ["A brand wants people to notice its product."], "voiceover": "A brand wants people to notice its product."},
        {"id": 3, "startTime": 6.0, "endTime": 10.0, "name": "The Creator", "onScreenText": ["Instead of traditional cold ads:", "Partner with a creator who already has the right audience."], "voiceover": "So they partner with the right creator. Someone their audience already trusts."},
        {"id": 4, "startTime": 10.0, "endTime": 14.0, "name": "The Content", "onScreenText": ["Creator creates.", "Audience watches.", "Brand gets noticed."], "voiceover": "The creator makes content. People see it. The brand gets noticed."},
        {"id": 5, "startTime": 14.0, "endTime": 18.0, "name": "Both Sides Win", "onScreenText": ["Reach & Trust for Brands", "Paid Collabs for Creators", "Both sides benefit when the partnership is right."], "voiceover": "The brand gets reach. The creator gets paid."},
        {"id": 6, "startTime": 18.0, "endTime": 22.0, "name": "The Problem / Fit", "onScreenText": ["RIGHT CREATOR.", "RIGHT AUDIENCE.", "RIGHT PARTNERSHIP.", "That's where JodoCo comes in."], "voiceover": "But it works best when they're the right fit."},
        {"id": 7, "startTime": 22.0, "endTime": 25.0, "name": "The Solution / CTA", "onScreenText": ["JodoCo", "CONNECT • CREATE • GROW", "Brands × Creators", "Let's Jodo."], "voiceover": "And that is JodoCo."}
    ]

    scenes = spec.get("scenes", default_scenes)
    branding = {
        "companyName": "JodoCo",
        "brandName": "JodoCo",
        "slogan": "CONNECT • CREATE • GROW",
        "subSlogan": "Brands × Creators",
        "ctaText": "Let's Jodo.",
        "ctaSubtext": "The Creator Marketing Bridge",
        "websiteUrl": "jodoco.agency"
    }

    if "branding" in spec:
        branding.update(spec["branding"])


    # Find active scene
    active_scene = scenes[-1]
    active_scene_id = active_scene.get("id", 7)
    st = 0.0 # progress in scene (0 to 1)
    
    for s in scenes:
        s_start = float(s.get("startTime", 0.0))
        s_end = float(s.get("endTime", 3.0))
        if s_start <= t < s_end:
            active_scene = s
            active_scene_id = int(s.get("id", 1))
            st = clamp((t - s_start) / max(0.01, (s_end - s_start)))
            break
        elif t >= float(scenes[-1].get("startTime", 22.0)):
            active_scene = scenes[-1]
            active_scene_id = int(scenes[-1].get("id", 7))
            st = clamp((t - float(active_scene.get("startTime", 22.0))) / 3.0)

    # Ambient floating pastel background auras (matching React motion.div blobs)
    blob1_x = 180 + math.sin(t * 0.8) * 35
    blob1_y = 320 + math.cos(t * 0.9) * 30
    blob2_x = 880 + math.cos(t * 0.7) * 40
    blob2_y = 780 + math.sin(t * 0.85) * 35
    blob3_x = 540 + math.sin(t * 0.6) * 45
    blob3_y = 1480 + math.cos(t * 0.75) * 40

    # Top Instagram Progress Bar (Calculated exactly per scene)
    prog_segments_svg = []
    seg_start_x = 60
    total_bar_w = WIDTH - 120 # 960px
    gap = 8
    num_segs = len(scenes)
    seg_w = (total_bar_w - (num_segs - 1) * gap) / num_segs

    for idx, s in enumerate(scenes):
        s_start = float(s.get("startTime", 0.0))
        s_end = float(s.get("endTime", 3.0))
        sx = seg_start_x + idx * (seg_w + gap)
        if t >= s_end:
            fill_pct = 1.0
        elif t >= s_start:
            fill_pct = clamp((t - s_start) / max(0.01, (s_end - s_start)))
        else:
            fill_pct = 0.0
        
        fill_w = seg_w * fill_pct
        prog_segments_svg.append(f"""
        <rect x="{sx}" y="60" width="{seg_w}" height="8" rx="4" fill="rgba(26, 43, 72, 0.15)"/>
        <rect x="{sx}" y="60" width="{fill_w}" height="8" rx="4" fill="#FFB3A7"/>
        """)
    
    prog_bars_rendered = "".join(prog_segments_svg)

    # Persistent Bottom-Right Corner JodoCo Watermark (Scenes 1 to 6)
    watermark_svg = ""
    if active_scene_id < 7:
        watermark_svg = f"""
    <!-- Corner Watermark Badge with Canonical JodoCo Logo -->
    <g transform="translate({WIDTH - 250}, {HEIGHT - 120})">
      <rect x="0" y="0" width="190" height="54" rx="27" fill="#FFFFFF" stroke="#EAE6DF" stroke-width="2" filter="url(#cardShadow)"/>
      <image href="data:image/png;base64,{CANONICAL_LOGO_B64}" x="15" y="6" width="160" height="42" preserveAspectRatio="xMidYMid meet"/>
    </g>
    """

    # Check for attached AI Visual Video Frame for active scene
    bg_video_layer = ""
    if scene_video_frame_map and frame_idx in scene_video_frame_map:
        bg_frame_path = scene_video_frame_map[frame_idx]
        if os.path.exists(bg_frame_path):
            bg_video_layer = f"""
  <!-- Scene AI Visual Video Background Layer -->
  <image href="{bg_frame_path}" x="0" y="0" width="{WIDTH}" height="{HEIGHT}" preserveAspectRatio="xMidYMid slice" opacity="0.95"/>
  <rect width="{WIDTH}" height="{HEIGHT}" fill="rgba(19, 27, 46, 0.40)"/>
"""

    # Assemble Base Canvas Frame
    svg_header = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}">
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FAF7F2"/>
      <stop offset="100%" stop-color="#F4EFE6"/>
    </linearGradient>
    <linearGradient id="coralMintGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FF8C73"/>
      <stop offset="50%" stop-color="#B8A7EA"/>
      <stop offset="100%" stop-color="#8FE3C0"/>
    </linearGradient>
    <linearGradient id="brandFullGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FFAAA0"/>
      <stop offset="25%" stop-color="#FFD0BF"/>
      <stop offset="50%" stop-color="#DDD4FC"/>
      <stop offset="75%" stop-color="#C7B7F3"/>
      <stop offset="100%" stop-color="#9FE8D4"/>
    </linearGradient>
    <linearGradient id="bottleGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FF8C73"/>
      <stop offset="100%" stop-color="#FF6B4A"/>
    </linearGradient>
    <filter id="cardShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#1A2B48" flood-opacity="0.08"/>
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#1A2B48" flood-opacity="0.04"/>
    </filter>
    <filter id="pillShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#1A2B48" flood-opacity="0.06"/>
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect width="{WIDTH}" height="{HEIGHT}" fill="url(#bgGrad)"/>
  {bg_video_layer}

  <!-- Subtle Radial Dot Matrix Grid Pattern -->
  <pattern id="dotGrid" width="48" height="48" patternUnits="userSpaceOnUse">
    <circle cx="24" cy="24" r="1.8" fill="#1A2B48" opacity="0.06"/>
  </pattern>
  <rect width="{WIDTH}" height="{HEIGHT}" fill="url(#dotGrid)"/>

  <!-- Ambient Pastel Atmosphere Spheres -->
  <circle cx="{blob1_x}" cy="{blob1_y}" r="340" fill="#FF8C73" opacity="0.14"/>
  <circle cx="{blob2_x}" cy="{blob2_y}" r="360" fill="#B8A7EA" opacity="0.15"/>
  <circle cx="{blob3_x}" cy="{blob3_y}" r="380" fill="#8FE3C0" opacity="0.16"/>

  <!-- Top 7-Segment Progress Track -->
  {prog_bars_rendered}
"""

    scene_body = ""

    # ->->->->->->->->->->->->->->->->->->->->-
    # SCENE 1: THE HOOK (0–3s)
    # ->->->->->->->->->->->->->->->->->->->->-
    if active_scene_id == 1:
        entry_anim = ease_out_cubic(clamp(st * 2.0))
        y_off = (1.0 - entry_anim) * 60
        scale = 0.95 + entry_anim * 0.05
        wave_len = clamp(st * 2.5) * 280

        scene_body = f"""
  <!-- SCENE 1: THE HOOK -->
  <g transform="translate(540, {860 + y_off}) scale({scale}) translate(-540, -860)">
    
    <!-- Top Tag: CREATOR ECONOMY 101 -->
    <g transform="translate(540, 240)">
      <rect x="-190" y="-28" width="380" height="56" rx="28" fill="#FFFFFF" stroke="#E5DEC9" stroke-width="2" filter="url(#pillShadow)"/>
      <text x="0" y="8" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="bold" fill="#0F172A" letter-spacing="2">✨ CREATOR ECONOMY 101</text>
    </g>

    <!-- Animated Connector Gradient Wave Bar -->
    <rect x="{540 - wave_len/2}" y="420" width="{wave_len}" height="10" rx="5" fill="url(#coralMintGrad)"/>

    <!-- WHAT IS -->
    <text x="540" y="520" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="32" font-weight="bold" fill="#64748B" letter-spacing="6">WHAT IS</text>

    <!-- INFLUENCER MARKETING? with Underline -->
    <text x="540" y="650" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="80" font-weight="900" fill="#0F172A" letter-spacing="-1">INFLUENCER</text>
    <text x="540" y="760" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="80" font-weight="900" fill="#0F172A" letter-spacing="-1">MARKETING?</text>
    
    <!-- Coral Underline Path -->
    <path d="M 280 790 Q 540 820, 800 785" fill="none" stroke="#FF8C73" stroke-width="8" stroke-linecap="round"/>

    <!-- 20s Explainer Pill -->
    <g transform="translate(540, 920)">
      <rect x="-240" y="-35" width="480" height="70" rx="35" fill="#131B2E" filter="url(#cardShadow)"/>
      <circle cx="-180" cy="0" r="14" fill="#8FE3C0"/>
      <text x="-180" y="6" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="16" font-weight="bold" fill="#131B2E">⚡</text>
      <text x="0" y="8" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF">explained in 20 seconds</text>
      <text x="180" y="9" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="28" font-weight="bold" fill="#FF8C73">→</text>
    </g>

    <!-- D2C Product Peek Doodle [Brand] -> [Creator] -->
    <g transform="translate(540, 1140)">
      <!-- Brand Card -->
      <g transform="translate(-240, 0)">
        <rect x="-100" y="-40" width="200" height="80" rx="24" fill="#FFFFFF" stroke="#E8E0D2" stroke-width="2" filter="url(#pillShadow)"/>
        <rect x="-80" y="-24" width="48" height="48" rx="14" fill="#FFE8E2"/>
        <text x="-56" y="8" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="24">📦</text>
        <text x="20" y="8" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="24" font-weight="bold" fill="#334155">Brand</text>
      </g>

      <!-- Pulsing Lavender Dots Connector -->
      <circle cx="-90" cy="0" r="{6 + math.sin(t*10)*2}" fill="#B8A7EA"/>
      <circle cx="0" cy="0" r="7" fill="#B8A7EA"/>
      <circle cx="90" cy="0" r="{6 - math.sin(t*10)*2}" fill="#B8A7EA"/>

      <!-- Creator Card -->
      <g transform="translate(240, 0)">
        <rect x="-100" y="-40" width="200" height="80" rx="24" fill="#FFFFFF" stroke="#E8E0D2" stroke-width="2" filter="url(#pillShadow)"/>
        <rect x="-80" y="-24" width="48" height="48" rx="14" fill="#E5FAF2"/>
        <text x="-56" y="8" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="24">✨</text>
        <text x="20" y="8" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="24" font-weight="bold" fill="#334155">Creator</text>
      </g>
    </g>

  </g>
"""

    # ->->->->->->->->->->->->->->->->->->->->-
    # SCENE 2: THE BRAND (3–6s)
    # ->->->->->->->->->->->->->->->->->->->->-
    elif active_scene_id == 2:
        entry_anim = ease_out_cubic(clamp(st * 2.0))
        scale = 0.94 + entry_anim * 0.06
        pulse = 1.0 + math.sin(t * 8) * 0.03

        scene_body = f"""
  <!-- SCENE 2: THE BRAND &amp; PRODUCT -->
  <g transform="translate(540, 860) scale({scale}) translate(-540, -860)">
    
    <!-- Top Step Tag: STEP 1: THE BRAND CHALLENGE -->
    <g transform="translate(540, 240)">
      <rect x="-220" y="-28" width="440" height="56" rx="28" fill="#FFFFFF" stroke="#EAE3D6" stroke-width="2" filter="url(#pillShadow)"/>
      <circle cx="-180" cy="0" r="8" fill="#FF8C73"/>
      <text x="10" y="8" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="bold" fill="#0F172A" letter-spacing="2">STEP 1: THE BRAND CHALLENGE</text>
    </g>

    <!-- The Product Pill Tag -->
    <g transform="translate(180, 360)">
      <rect x="0" y="0" width="180" height="44" rx="12" fill="#FFE8E2"/>
      <text x="90" y="28" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#D95338">📦 THE PRODUCT</text>
    </g>

    <!-- Main Headline -->
    <g transform="translate(180, 470)">
      <text x="0" y="0" font-family="Liberation Sans, sans-serif" font-size="44" font-weight="900" fill="#0F172A">A brand wants people to</text>
      <rect x="0" y="20" width="180" height="60" rx="16" fill="#FFE8E2"/>
      <text x="90" y="64" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="46" font-weight="900" fill="#0F172A">notice</text>
      <rect x="0" y="74" width="180" height="6" rx="3" fill="#FF8C73"/>
      <text x="210" y="64" font-family="Liberation Sans, sans-serif" font-size="44" font-weight="900" fill="#0F172A">its product.</text>
    </g>

    <!-- D2C Product Card Visual -->
    <g transform="translate(180, 620)">
      <rect x="0" y="0" width="560" height="520" rx="36" fill="#FFFFFF" stroke="#FFE8E2" stroke-width="4" filter="url(#cardShadow)"/>
      
      <!-- Inner Bottle Showcase Container -->
      <rect x="30" y="30" width="500" height="340" rx="24" fill="#FFF5F2" stroke="#F5EAD9" stroke-width="2"/>
      
      <!-- Star Rating Badge -->
      <rect x="360" y="50" width="150" height="42" rx="21" fill="#FFFFFF" stroke="#FBEAE6" stroke-width="2"/>
      <text x="435" y="78" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#E66E53">★ 4.9 D2C</text>

      <!-- Bottle Illustration -->
      <g transform="translate(250, 190) scale(1.4)">
        <rect x="-18" y="-70" width="36" height="18" rx="4" fill="#131B2E"/>
        <rect x="-12" y="-52" width="24" height="12" fill="#E2D8C9"/>
        <rect x="-44" y="-40" width="88" height="110" rx="20" fill="url(#bottleGrad)" filter="url(#pillShadow)"/>
        <rect x="-24" y="-20" width="48" height="48" rx="12" fill="rgba(255,255,255,0.25)"/>
        <text x="0" y="10" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="24">✨</text>
        <text x="0" y="52" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" letter-spacing="2">AURA</text>
      </g>

      <!-- Seeking Reach Tag -->
      <rect x="50" y="300" width="170" height="44" rx="12" fill="rgba(255,255,255,0.92)" stroke="#EBE3D7" stroke-width="1.5"/>
      <text x="135" y="328" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="16" font-weight="bold" fill="#64748B">👁 Seeking Reach</text>

      <!-- Product Details Footer -->
      <text x="40" y="425" font-family="Liberation Sans, sans-serif" font-size="28" font-weight="900" fill="#0F172A">Aura Botanical Serum</text>
      <text x="40" y="465" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="bold" fill="#64748B">Modern D2C Brand</text>
      <rect x="420" y="410" width="100" height="54" rx="18" fill="#FAF7F2" stroke="#E5DEC9" stroke-width="2"/>
      <text x="470" y="445" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="24" font-weight="900" fill="#0F172A">$38</text>
    </g>

    <!-- Animated Coral Connector Ray to the Right -->
    <g transform="translate(760, 880)">
      <path d="M 0 0 Q 80 -40, 160 0 T 240 0" fill="none" stroke="#FF8C73" stroke-width="6" stroke-dasharray="12 12"/>
      <circle cx="{120 + math.sin(t*12)*40}" cy="0" r="16" fill="#FF8C73"/>
      <circle cx="{120 + math.sin(t*12)*40}" cy="0" r="8" fill="#FFFFFF"/>
    </g>

    <!-- Bottom Question Subtext -->
    <text x="540" y="1220" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="22" font-weight="bold" fill="#64748B">• How does a brand cut through traditional ad fatigue?</text>
  </g>
"""

    # ->->->->->->->->->->->->->->->->->->->->-
    # SCENE 3: THE CREATOR (6–10s)
    # ->->->->->->->->->->->->->->->->->->->->-
    elif active_scene_id == 3:
        entry_anim = ease_out_cubic(clamp(st * 2.0))
        scale = 0.94 + entry_anim * 0.06

        scene_body = f"""
  <!-- SCENE 3: THE CREATOR &amp; SOLUTION -->
  <g transform="translate(540, 860) scale({scale}) translate(-540, -860)">
    
    <!-- Top Step Tag: STEP 2: THE SOLUTION -->
    <g transform="translate(540, 240)">
      <rect x="-200" y="-28" width="400" height="56" rx="28" fill="#FFFFFF" stroke="#EAE3D6" stroke-width="2" filter="url(#pillShadow)"/>
      <circle cx="-160" cy="0" r="8" fill="#8FE3C0"/>
      <text x="10" y="8" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="bold" fill="#0F172A" letter-spacing="2">STEP 2: THE SOLUTION</text>
    </g>

    <!-- BRAND → CREATOR Tag -->
    <g transform="translate(180, 350)">
      <rect x="0" y="0" width="320" height="56" rx="28" fill="#131B2E" filter="url(#pillShadow)"/>
      <text x="50" y="35" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="900" fill="#FF8C73">BRAND</text>
      <text x="145" y="35" font-family="Liberation Sans, sans-serif" font-size="24" font-weight="bold" fill="#B8A7EA">→</text>
      <text x="185" y="35" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="900" fill="#8FE3C0">CREATOR</text>
      <text x="285" y="35" font-family="Liberation Sans, sans-serif" font-size="20">✨</text>
    </g>

    <!-- Main Headline -->
    <g transform="translate(180, 460)">
      <text x="0" y="0" font-family="Liberation Sans, sans-serif" font-size="22" font-weight="bold" fill="#64748B" letter-spacing="2">INSTEAD OF TRADITIONAL COLD ADS:</text>
      <text x="0" y="55" font-family="Liberation Sans, sans-serif" font-size="44" font-weight="900" fill="#0F172A">Partner with a creator who</text>
      <text x="0" y="110" font-family="Liberation Sans, sans-serif" font-size="44" font-weight="900" fill="#0F172A">already has the</text>
      
      <!-- Right Audience Mint Badge -->
      <rect x="330" y="70" width="370" height="60" rx="20" fill="#8FE3C0"/>
      <text x="515" y="112" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="38" font-weight="900" fill="#0F172A">right audience. ✨</text>
    </g>

    <!-- Creator Visual Card -->
    <g transform="translate(180, 640)">
      <rect x="0" y="0" width="720" height="440" rx="36" fill="#FFFFFF" stroke="#DDF6EC" stroke-width="4" filter="url(#cardShadow)"/>
      
      <!-- Left Avatar with Checkmark -->
      <g transform="translate(50, 50)">
        <rect x="0" y="0" width="150" height="150" rx="32" fill="url(#coralMintGrad)" p="4"/>
        <rect x="8" y="8" width="134" height="134" rx="26" fill="#FAF7F2"/>
        <text x="75" y="90" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="70">👩‍🎨</text>
        <circle cx="135" cy="135" r="22" fill="#8FE3C0" stroke="#FFFFFF" stroke-width="4"/>
        <text x="135" y="142" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="bold" fill="#0F172A">✓</text>
      </g>

      <!-- Creator Metrics -->
      <g transform="translate(230, 75)">
        <text x="0" y="0" font-family="Liberation Sans, sans-serif" font-size="32" font-weight="900" fill="#0F172A">Alexa • Lifestyle &amp; D2C</text>
        <text x="0" y="45" font-family="Liberation Sans, sans-serif" font-size="22" font-weight="bold" fill="#64748B">👥 <tspan fill="#0F172A" font-weight="900">240K</tspan> engaged followers</text>
        
        <!-- Badges -->
        <g transform="translate(0, 75)">
          <rect x="0" y="0" width="180" height="44" rx="14" fill="#E8F8F1" stroke="#BCECD8" stroke-width="2"/>
          <text x="90" y="28" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#0D9488">8.4% Eng. Rate</text>

          <rect x="200" y="0" width="160" height="44" rx="14" fill="#F2ECFD" stroke="#DDD0FA" stroke-width="2"/>
          <text x="280" y="28" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#7C3AED">High Trust</text>
        </g>
      </g>

      <!-- Bottom Card Ribbon -->
      <line x1="30" y1="280" x2="690" y2="280" stroke="#F0EBE0" stroke-width="2"/>
      <g transform="translate(50, 340)">
        <text x="0" y="0" font-family="Liberation Sans, sans-serif" font-size="22" font-weight="bold" fill="#334155">📹 Authentic Storytelling</text>
        
        <rect x="420" y="-30" width="220" height="48" rx="24" fill="#E8F8F1"/>
        <text x="530" y="2" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#0D9488">Matched by JodoCo</text>
      </g>
    </g>

  </g>
"""

    # ->->->->->->->->->->->->->->->->->->->->-
    # SCENE 4: THE CONTENT (10–14s)
    # ->->->->->->->->->->->->->->->->->->->->-
    elif active_scene_id == 4:
        entry_anim = ease_out_cubic(clamp(st * 2.0))
        scale = 0.94 + entry_anim * 0.06
        phase = 1 if st < 0.33 else (2 if st < 0.66 else 3)

        scene_body = f"""
  <!-- SCENE 4: THE FLYWHEEL &amp; CONTENT -->
  <g transform="translate(540, 860) scale({scale}) translate(-540, -860)">
    
    <!-- Top Step Tag: STEP 3: THE FLYWHEEL -->
    <g transform="translate(540, 240)">
      <rect x="-200" y="-28" width="400" height="56" rx="28" fill="#FFFFFF" stroke="#EAE3D6" stroke-width="2" filter="url(#pillShadow)"/>
      <circle cx="-160" cy="0" r="8" fill="#B8A7EA"/>
      <text x="10" y="8" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="bold" fill="#0F172A" letter-spacing="2">STEP 3: THE FLYWHEEL</text>
    </g>

    <!-- 3 Step Interactive Progress Stack -->
    <g transform="translate(180, 340)">
      
      <!-- Step 1: Creator creates -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="720" height="80" rx="24" fill="{'#FFFFFF' if phase==1 else 'rgba(255,255,255,0.85)'}" stroke="{'#B8A7EA' if phase==1 else '#E8E0D2'}" stroke-width="3" filter="url(#pillShadow)"/>
        <circle cx="50" cy="40" r="22" fill="#B8A7EA" opacity="0.25"/>
        <text x="50" y="48" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="22" font-weight="900" fill="#6B46C1">1</text>
        <text x="95" y="48" font-family="Liberation Sans, sans-serif" font-size="28" font-weight="900" fill="#0F172A">Creator creates.</text>
        <rect x="490" y="18" width="200" height="44" rx="22" fill="#F2ECFD"/>
        <text x="590" y="46" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#7C3AED">🎬 Filming Reel</text>
      </g>

      <!-- Step 2: Audience watches -->
      <g transform="translate(0, 100)">
        <rect x="0" y="0" width="720" height="80" rx="24" fill="{'#FFFFFF' if phase==2 else 'rgba(255,255,255,0.85)'}" stroke="{'#8FE3C0' if phase==2 else '#E8E0D2'}" stroke-width="3" filter="url(#pillShadow)"/>
        <circle cx="50" cy="40" r="22" fill="#8FE3C0" opacity="0.25"/>
        <text x="50" y="48" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="22" font-weight="900" fill="#0D9488">2</text>
        <text x="95" y="48" font-family="Liberation Sans, sans-serif" font-size="28" font-weight="900" fill="#0F172A">Audience watches.</text>
        <rect x="490" y="18" width="200" height="44" rx="22" fill="#E8F8F1"/>
        <text x="590" y="46" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#0D9488">👀 18.5k Views</text>
      </g>

      <!-- Step 3: Brand gets noticed -->
      <g transform="translate(0, 200)">
        <rect x="0" y="0" width="720" height="80" rx="24" fill="{'#FFFFFF' if phase==3 else 'rgba(255,255,255,0.85)'}" stroke="{'#FF8C73' if phase==3 else '#E8E0D2'}" stroke-width="3" filter="url(#pillShadow)"/>
        <circle cx="50" cy="40" r="22" fill="#FF8C73" opacity="0.25"/>
        <text x="50" y="48" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="22" font-weight="900" fill="#EA580C">3</text>
        <text x="95" y="48" font-family="Liberation Sans, sans-serif" font-size="28" font-weight="900" fill="#0F172A">Brand gets noticed.</text>
        <rect x="470" y="18" width="220" height="44" rx="22" fill="#FFF0ED"/>
        <text x="580" y="46" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#EA580C">📈 Orders +340%</text>
      </g>
    </g>

    <!-- Mini Social Smartphone Frame -->
    <g transform="translate(240, 680)">
      <rect x="0" y="0" width="600" height="460" rx="44" fill="#131B2E" stroke="rgba(255,255,255,0.2)" stroke-width="4" filter="url(#cardShadow)"/>
      
      <!-- Notch -->
      <rect x="230" y="14" width="140" height="18" rx="9" fill="rgba(0,0,0,0.5)"/>

      <!-- Screen Preview Canvas -->
      <g transform="translate(24, 44)">
        <rect x="0" y="0" width="552" height="390" rx="30" fill="#1A243B"/>
        
        <!-- Creator Header -->
        <g transform="translate(30, 40)">
          <circle cx="24" cy="24" r="24" fill="#FF8C73"/>
          <text x="24" y="32" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="26">👩‍🎨</text>
          <text x="64" y="20" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF">@alexa_vlogs</text>
          <text x="64" y="42" font-family="Liberation Sans, sans-serif" font-size="15" font-weight="bold" fill="#8FE3C0">Sponsored by Aura</text>
        </g>

        <!-- Right Reactions Column -->
        <g transform="translate(470, 80)">
          <!-- Heart -->
          <circle cx="28" cy="28" r="28" fill="rgba(255,255,255,0.2)"/>
          <text x="28" y="36" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="24">❤️</text>
          <text x="28" y="75" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="15" font-weight="bold" fill="#FFFFFF">14.2k</text>

          <!-- Comment -->
          <circle cx="28" cy="120" r="28" fill="rgba(255,255,255,0.2)"/>
          <text x="28" y="128" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="24">💬</text>
          <text x="28" y="165" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="15" font-weight="bold" fill="#FFFFFF">840</text>
        </g>

        <!-- Dynamic Comment Bubble Pop -->
        <g transform="translate(30, 260)">
          <rect x="0" y="0" width="400" height="80" rx="20" fill="{'#FF8C73' if phase==3 else 'rgba(0,0,0,0.75)'}"/>
          <text x="20" y="36" font-family="Liberation Sans, sans-serif" font-size="17" font-weight="bold" fill="{'#0F172A' if phase==3 else '#8FE3C0'}">{'🚀 Aura Serum sold out 500 units in 2 hrs!' if phase==3 else '@priya_d: Just bought this! 😍'}</text>
          <text x="20" y="62" font-family="Liberation Sans, sans-serif" font-size="14" font-weight="bold" fill="{'#0F172A' if phase==3 else '#FFFFFF'}">{'Verified Sales Surge' if phase==3 else 'Real organic buyer engagement'}</text>
        </g>
      </g>
    </g>

  </g>
"""

    # ->->->->->->->->->->->->->->->->->->->->-
    # SCENE 5: BOTH SIDES WIN (14–18s)
    # ->->->->->->->->->->->->->->->->->->->->-
    elif active_scene_id == 5:
        entry_anim = ease_out_cubic(clamp(st * 2.0))
        scale = 0.94 + entry_anim * 0.06

        scene_body = f"""
  <!-- SCENE 5: WIN-WIN ECOSYSTEM -->
  <g transform="translate(540, 860) scale({scale}) translate(-540, -860)">
    
    <!-- Top Step Tag: WIN-WIN ECOSYSTEM -->
    <g transform="translate(540, 240)">
      <rect x="-190" y="-28" width="380" height="56" rx="28" fill="#FFFFFF" stroke="#EAE3D6" stroke-width="2" filter="url(#pillShadow)"/>
      <circle cx="-150" cy="0" r="8" fill="#FF8C73"/>
      <text x="10" y="8" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="bold" fill="#0F172A" letter-spacing="2">WIN-WIN ECOSYSTEM</text>
    </g>

    <!-- Main Headline -->
    <g transform="translate(540, 360)">
      <text x="0" y="0" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="44" font-weight="900" fill="#0F172A">Both sides benefit when the</text>
      <rect x="-240" y="16" width="480" height="60" rx="20" fill="url(#coralMintGrad)" opacity="0.25"/>
      <text x="0" y="60" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="46" font-weight="900" fill="#0F172A">partnership is right.</text>
    </g>

    <!-- Split Screen Bento Cards -->
    <g transform="translate(90, 500)">
      
      <!-- Central Floating Handshake Badge -->
      <g transform="translate(450, 260) scale(1.1)" filter="url(#cardShadow)">
        <circle cx="0" cy="0" r="48" fill="#131B2E" stroke="#FFFFFF" stroke-width="6"/>
        <text x="0" y="16" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="44">🤝</text>
      </g>

      <!-- LEFT CARD: BRAND -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="420" height="520" rx="36" fill="#FFFFFF" stroke="#FFE8E2" stroke-width="4" filter="url(#cardShadow)"/>
        
        <!-- Header -->
        <g transform="translate(40, 50)">
          <rect x="0" y="0" width="56" height="56" rx="18" fill="#FFE8E2"/>
          <text x="28" y="38" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="28">🏢</text>
          <text x="75" y="38" font-family="Liberation Sans, sans-serif" font-size="28" font-weight="900" fill="#FF6B4A">BRAND</text>
        </g>
        <line x1="40" y1="130" x2="380" y2="130" stroke="#FFEBE6" stroke-width="2"/>

        <!-- Bullets -->
        <g transform="translate(40, 180)">
          <circle cx="20" cy="20" r="18" fill="#FFEAE5"/>
          <text x="20" y="27" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#EA580C">✓</text>
          <text x="56" y="18" font-family="Liberation Sans, sans-serif" font-size="26" font-weight="900" fill="#0F172A">Reach</text>
          <text x="56" y="44" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#64748B">Targeted eyes</text>
        </g>

        <g transform="translate(40, 280)">
          <circle cx="20" cy="20" r="18" fill="#FFEAE5"/>
          <text x="20" y="27" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#EA580C">✓</text>
          <text x="56" y="18" font-family="Liberation Sans, sans-serif" font-size="26" font-weight="900" fill="#0F172A">Trust</text>
          <text x="56" y="44" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#64748B">Creator credibility</text>
        </g>

        <g transform="translate(40, 380)">
          <circle cx="20" cy="20" r="18" fill="#FFEAE5"/>
          <text x="20" y="27" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#EA580C">✓</text>
          <text x="56" y="18" font-family="Liberation Sans, sans-serif" font-size="26" font-weight="900" fill="#0F172A">Customers</text>
          <text x="56" y="44" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#64748B">High conversion</text>
        </g>
      </g>

      <!-- RIGHT CARD: CREATOR -->
      <g transform="translate(480, 0)">
        <rect x="0" y="0" width="420" height="520" rx="36" fill="#FFFFFF" stroke="#DDF6EC" stroke-width="4" filter="url(#cardShadow)"/>
        
        <!-- Header -->
        <g transform="translate(40, 50)">
          <rect x="0" y="0" width="56" height="56" rx="18" fill="#E5FAF2"/>
          <text x="28" y="38" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="28">✨</text>
          <text x="75" y="38" font-family="Liberation Sans, sans-serif" font-size="28" font-weight="900" fill="#0D9488">CREATOR</text>
        </g>
        <line x1="40" y1="130" x2="380" y2="130" stroke="#E3F8EE" stroke-width="2"/>

        <!-- Bullets -->
        <g transform="translate(40, 180)">
          <circle cx="20" cy="20" r="18" fill="#E5F8F0"/>
          <text x="20" y="27" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#0D9488">✓</text>
          <text x="56" y="18" font-family="Liberation Sans, sans-serif" font-size="26" font-weight="900" fill="#0F172A">Paid Collabs</text>
          <text x="56" y="44" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#64748B">Monetize content</text>
        </g>

        <g transform="translate(40, 280)">
          <circle cx="20" cy="20" r="18" fill="#E5F8F0"/>
          <text x="20" y="27" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#0D9488">✓</text>
          <text x="56" y="18" font-family="Liberation Sans, sans-serif" font-size="26" font-weight="900" fill="#0F172A">Creative Free</text>
          <text x="56" y="44" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#64748B">Original format</text>
        </g>

        <g transform="translate(40, 380)">
          <circle cx="20" cy="20" r="18" fill="#E5F8F0"/>
          <text x="20" y="27" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#0D9488">✓</text>
          <text x="56" y="18" font-family="Liberation Sans, sans-serif" font-size="26" font-weight="900" fill="#0F172A">Partnership</text>
          <text x="56" y="44" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#64748B">Long term growth</text>
        </g>
      </g>
    </g>

    <!-- Bottom Tag -->
    <text x="540" y="1120" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="22" font-weight="bold" fill="#64748B">Authentic matches create organic virality.</text>
  </g>
"""

    # ->->->->->->->->->->->->->->->->->->->->-
    # SCENE 6: JODOCO (18–22s)
    # ->->->->->->->->->->->->->->->->->->->->-
    elif active_scene_id == 6:
        entry_anim = ease_out_cubic(clamp(st * 2.0))
        scale = 0.94 + entry_anim * 0.06
        phase = 1 if st < 0.25 else (2 if st < 0.5 else (3 if st < 0.75 else 4))

        scene_body = f"""
  <!-- SCENE 6: THE ULTIMATE MATCHMAKER &amp; JODOCO -->
  <g transform="translate(540, 860) scale({scale}) translate(-540, -860)">
    
    <!-- Top Step Tag: THE ULTIMATE MATCHMAKER -->
    <g transform="translate(540, 240)">
      <rect x="-210" y="-28" width="420" height="56" rx="28" fill="#FFFFFF" stroke="#EAE3D6" stroke-width="2" filter="url(#pillShadow)"/>
      <text x="0" y="8" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="bold" fill="#0F172A" letter-spacing="2">✨ THE ULTIMATE MATCHMAKER</text>
    </g>

    <!-- Converging Nodes [Brand] -> [Creator] -->
    <g transform="translate(540, 360)">
      <rect x="-240" y="-40" width="80" height="80" rx="24" fill="#FFFFFF" stroke="#FFE2DC" stroke-width="3" filter="url(#pillShadow)"/>
      <text x="-200" y="12" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="36">🏢</text>

      <circle cx="-90" cy="0" r="8" fill="#FF8C73"/>
      <circle cx="0" cy="0" r="10" fill="#B8A7EA"/>
      <circle cx="90" cy="0" r="8" fill="#8FE3C0"/>

      <rect x="160" y="-40" width="80" height="80" rx="24" fill="#FFFFFF" stroke="#D8F5E9" stroke-width="3" filter="url(#pillShadow)"/>
      <text x="200" y="12" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="36">👩‍🎨</text>
    </g>

    <!-- 3 Kinetic Typographic Stack Cards -->
    <g transform="translate(180, 480)">
      
      <!-- 1. RIGHT CREATOR -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="720" height="90" rx="28" fill="#FFFFFF" stroke="#B8A7EA" stroke-width="3.5" filter="url(#pillShadow)"/>
        <circle cx="50" cy="45" r="20" fill="#F2ECFD"/>
        <text x="50" y="52" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="bold" fill="#7C3AED">✓</text>
        <text x="90" y="55" font-family="Liberation Sans, sans-serif" font-size="32" font-weight="900" fill="#0F172A" letter-spacing="1">RIGHT CREATOR.</text>
        <rect x="460" y="22" width="230" height="46" rx="23" fill="#F2ECFD"/>
        <text x="575" y="52" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#7C3AED">Vetted &amp; Authentic</text>
      </g>

      <!-- 2. RIGHT AUDIENCE -->
      <g transform="translate(0, 120)">
        <rect x="0" y="0" width="720" height="90" rx="28" fill="#FFFFFF" stroke="#8FE3C0" stroke-width="3.5" filter="url(#pillShadow)"/>
        <circle cx="50" cy="45" r="20" fill="#E8F8F1"/>
        <text x="50" y="52" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="bold" fill="#0D9488">✓</text>
        <text x="90" y="55" font-family="Liberation Sans, sans-serif" font-size="32" font-weight="900" fill="#0F172A" letter-spacing="1">RIGHT AUDIENCE.</text>
        <rect x="490" y="22" width="200" height="46" rx="23" fill="#E8F8F1"/>
        <text x="590" y="52" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#0D9488">High Intent</text>
      </g>

      <!-- 3. RIGHT PARTNERSHIP -->
      <g transform="translate(0, 240)">
        <rect x="0" y="0" width="720" height="90" rx="28" fill="#FFFFFF" stroke="#FF8C73" stroke-width="3.5" filter="url(#pillShadow)"/>
        <circle cx="50" cy="45" r="20" fill="#FFF0ED"/>
        <text x="50" y="52" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="bold" fill="#EA580C">✓</text>
        <text x="90" y="55" font-family="Liberation Sans, sans-serif" font-size="32" font-weight="900" fill="#0F172A" letter-spacing="1">RIGHT PARTNERSHIP.</text>
        <rect x="490" y="22" width="200" height="46" rx="23" fill="#FFF0ED"/>
        <text x="590" y="52" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="bold" fill="#EA580C">Win-Win ROI</text>
      </g>
    </g>

    <!-- That's where JodoCo comes in -->
    <g transform="translate(540, 930)">
      <text x="0" y="0" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="30" font-weight="bold" fill="#64748B">That's where</text>
      
      <!-- Canonical JodoCo Badge -->
      <g transform="translate(0, 50)">
        <rect x="-220" y="-45" width="440" height="90" rx="45" fill="#FFFFFF" stroke="#EAE6DF" stroke-width="3" filter="url(#cardShadow)"/>
        <image href="data:image/png;base64,{CANONICAL_LOGO_B64}" x="-190" y="-38" width="380" height="76" preserveAspectRatio="xMidYMid meet"/>
      </g>

      <text x="0" y="140" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="28" font-weight="bold" fill="#FF6B4A">comes in.</text>
    </g>

  </g>
"""

    # ->->->->->->->->->->->->->->->->->->->->-
    # SCENE 7: FINAL FRAME &amp; CLIMAX (22–25s)
    # ->->->->->->->->->->->->->->->->->->->->-
    elif active_scene_id == 7:
        entry_anim = ease_out_cubic(clamp(st * 2.0))
        scale = 0.92 + entry_anim * 0.08
        pulse = 1.0 + math.sin(t * 5) * 0.02
        plane_x = math.sin(t * 3) * 15
        plane_y = math.cos(t * 2.5) * 10

        scene_body = f"""
  <!-- SCENE 7: FINAL CLIMAX &amp; JODOCO LOGO -->
  <g transform="translate(540, 860) scale({scale}) translate(-540, -860)">
    
    <!-- Top Safe-Zone Tag: The Creator Marketing Bridge -->
    <g transform="translate(540, 240)">
      <rect x="-230" y="-28" width="460" height="56" rx="28" fill="#FFFFFF" stroke="#EAE6DF" stroke-width="2" filter="url(#pillShadow)"/>
      <text x="0" y="8" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="bold" fill="#1A2B48">✨ The Creator Marketing Bridge</text>
    </g>

    <!-- Flying Paper Plane Doodle &amp; Flight Path -->
    <g transform="translate(540, 420)">
      <!-- Flight Path -->
      <path d="M -160 80 Q -40 -60, 140 20 T 320 -20" fill="none" stroke="#FFAAA0" stroke-width="4" stroke-dasharray="8 8" opacity="0.8"/>
      <!-- Plane -->
      <g transform="translate({280 + plane_x}, {-20 + plane_y}) rotate(18)">
        <circle cx="0" cy="0" r="32" fill="#FFFFFF" stroke="#FFAAA0" stroke-width="2" filter="url(#pillShadow)"/>
        <text x="0" y="10" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="28" fill="#FFAAA0">✈️</text>
      </g>
    </g>

    <!-- HERO AUTHENTIC CANONICAL JODOCO LOGO -->
    <g transform="translate(540, 680)">
      <image href="data:image/png;base64,{CANONICAL_LOGO_B64}" x="-360" y="-170" width="720" height="340" preserveAspectRatio="xMidYMid meet" filter="url(#cardShadow)"/>
    </g>

    <!-- SubSlogan: The Creator Marketing Bridge -->
    <g transform="translate(540, 890)">
      <rect x="-180" y="-24" width="360" height="48" rx="24" fill="#FFFFFF" stroke="#EAE6DF" stroke-width="2" filter="url(#pillShadow)"/>
      <text x="0" y="8" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="900" fill="#1A2B48">The Creator Marketing Bridge</text>
    </g>

    <!-- Pulsing Final CTA: Let's Jodo. ↗ -->
    <g transform="translate(540, 1100) scale({pulse})">
      <rect x="-180" y="-40" width="360" height="80" rx="30" fill="#1A2B48" filter="url(#cardShadow)"/>
      <text x="-20" y="10" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="30" font-weight="900" fill="#FFFFFF" letter-spacing="1">Let's Jodo.</text>
      <text x="110" y="12" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="30" font-weight="900" fill="#9FE8D4">↗</text>
      <text x="0" y="70" text-anchor="middle" font-family="Liberation Sans, sans-serif" font-size="20" font-weight="bold" fill="rgba(26, 43, 72, 0.65)">jodoco.agency</text>
    </g>

  </g>
"""

    svg_content = svg_header + scene_body + watermark_svg + "</svg>"
    return svg_content

# ->->->->->-- Master Video Renderer Function ->->->->->--
def render_reel_video(output_mp4_path, config_data=None, progress_callback=None):
    os.makedirs(os.path.dirname(os.path.abspath(output_mp4_path)), exist_ok=True)
    temp_dir = tempfile.mkdtemp(prefix="jodoco_render_")
    print(f"Temporary render directory: {temp_dir}")
    
    active_spec = config_data or load_default_spec() or {}
    
    try:
        frames_dir = os.path.join(temp_dir, "frames")
        audio_dir = os.path.join(temp_dir, "audio")
        os.makedirs(frames_dir, exist_ok=True)
        os.makedirs(audio_dir, exist_ok=True)

        # 0. Check and extract frames for scenes with attached AI Visual video assets
        scene_video_frame_map = {}
        scenes = active_spec.get("scenes", [])
        for scene in scenes:
            s_id = scene.get("id")
            video_url = scene.get("videoUrl") or scene.get("videoAssetUrl")
            if not video_url:
                continue

            # Resolve video file path
            v_path = None
            if video_url.startswith("/generated-assets/"):
                v_path = os.path.join(ROOT_DIR, "public", "generated-assets", video_url.replace("/generated-assets/", ""))
            elif video_url.startswith("/exports/"):
                v_path = os.path.join(ROOT_DIR, "public", "exports", video_url.replace("/exports/", ""))
            elif os.path.exists(video_url):
                v_path = video_url
            elif os.path.exists(os.path.join(ROOT_DIR, video_url.lstrip("/"))):
                v_path = os.path.join(ROOT_DIR, video_url.lstrip("/"))

            if v_path and os.path.exists(v_path):
                scene_extract_dir = os.path.join(temp_dir, f"scene_{s_id}_extracted")
                os.makedirs(scene_extract_dir, exist_ok=True)
                extract_cmd = [
                    "ffmpeg", "-y",
                    "-i", v_path,
                    "-vf", f"scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=increase,crop={WIDTH}:{HEIGHT}",
                    "-r", str(FPS),
                    os.path.join(scene_extract_dir, "f_%04d.png")
                ]
                try:
                    subprocess.run(extract_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    extracted_files = sorted([os.path.join(scene_extract_dir, f) for f in os.listdir(scene_extract_dir) if f.endswith(".png")])
                    if extracted_files:
                        s_start = float(scene.get("startTime", 0.0))
                        s_end = float(scene.get("endTime", s_start + 3.0))
                        start_f = int(s_start * FPS)
                        end_f = int(s_end * FPS)
                        n_extracted = len(extracted_files)
                        for f_i in range(start_f, end_f):
                            # map into extracted frame index (looping if shorter)
                            idx_in_scene = (f_i - start_f) % n_extracted
                            scene_video_frame_map[f_i] = extracted_files[idx_in_scene]
                        print(f"   ✓ Extracted {len(extracted_files)} frames for Scene {s_id} AI Visual")
                except Exception as ex:
                    print(f"Warning: could not extract frames for scene {s_id} visual: {ex}")

        # 1. Generate 750 Vector SVG Frames
        print(f"1/4: Generating {TOTAL_FRAMES} SVG frames...")
        for i in range(TOTAL_FRAMES):
            svg_data = generate_svg_frame(i, active_spec, scene_video_frame_map)
            frame_path = os.path.join(frames_dir, f"frame_{i:04d}.svg")
            with open(frame_path, "w", encoding="utf-8") as f:
                f.write(svg_data)
            if i % 150 == 0:
                print(f"   Generated {i}/{TOTAL_FRAMES} frames...")
                if progress_callback:
                    progress_callback(int((i / TOTAL_FRAMES) * 30))
        print("   ✓ All SVG frames generated successfully.")

        # 2. Synthesize Master Audio (Voiceover + Lo-Fi BGM + SFX)
        print("2/4: Synthesizing voiceover, background music & sound effects...")
        SAMPLE_RATE = 44100
        total_samples = int(SAMPLE_RATE * TOTAL_DURATION)
        master_left = [0.0] * total_samples
        master_right = [0.0] * total_samples

        scenes_list = []
        if "scenes" in active_spec and len(active_spec["scenes"]) > 0:
            for s in active_spec["scenes"]:
                scenes_list.append((float(s.get("startTime", 0.0)) + 0.15, str(s.get("voiceover", ""))))
        else:
            scenes_list = [
                (0.2, "Okay, so what is influencer marketing?"),

                (3.2, "A brand wants people to notice its product."),
                (6.2, "So they partner with the right creator. Someone their audience already trusts."),
                (10.2, "The creator makes content. People see it. The brand gets noticed."),
                (14.2, "The brand gets reach. The creator gets paid."),
                (18.2, "But it works best when they are the right fit."),
                (22.2, "And that is JodoCo.")
            ]

        # 2a. Synthesize voiceover tracks
        for idx, (start_sec, script) in enumerate(scenes_list):
            if not script or len(script.strip()) == 0:
                continue
            # sanitize script for flite / ffmpeg
            clean_script = script.replace("'", "").replace('"', "").replace("…", "...").strip()
            vo_path = os.path.join(audio_dir, f"vo_{idx}.wav")
            cmd = ["ffmpeg", "-y", "-f", "lavfi", "-i", f"flite=text='{clean_script}':voice=slt", "-ar", "44100", vo_path]
            try:
                subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                
                with wave.open(vo_path, "rb") as wf:
                    n_frames = wf.getnframes()
                    data = wf.readframes(n_frames)
                    fmt = f"<{n_frames}h"
                    samples = struct.unpack(fmt, data)
                    
                    start_sample = int(start_sec * SAMPLE_RATE)
                    for s_i, samp in enumerate(samples):
                        target_idx = start_sample + s_i
                        if target_idx < total_samples:
                            val = (samp / 32768.0) * 1.85
                            master_left[target_idx] += val
                            master_right[target_idx] += val
            except Exception as e:
                print(f"Warning: Flite voiceover synthesis note: {e}")

        # 2b. Add Lo-Fi Electric Piano Soundtrack (105 BPM)
        chord_prog = [
            (0.0, 6.0, [261.63, 329.63, 392.00, 493.88]), # Cmaj7
            (6.0, 12.0, [220.00, 261.63, 329.63, 392.00]), # Am7
            (12.0, 18.0, [174.61, 261.63, 329.63, 349.23]), # Fmaj7
            (18.0, 22.0, [196.00, 246.94, 293.66, 392.00]), # G7
            (22.0, 25.0, [261.63, 329.63, 392.00, 523.25]), # Cmaj
        ]

        for s_start, s_end, notes in chord_prog:
            start_i = int(s_start * SAMPLE_RATE)
            end_i = min(total_samples, int(s_end * SAMPLE_RATE))
            for i in range(start_i, end_i):
                t_sec = (i - start_i) / SAMPLE_RATE
                decay = math.exp(-0.6 * (t_sec % 1.5))
                sig = 0.0
                for n_idx, freq in enumerate(notes):
                    sig += math.sin(2 * math.pi * freq * (i / SAMPLE_RATE)) * (0.045 / len(notes))
                
                voice_vol = abs(master_left[i])
                duck = 0.4 if voice_vol > 0.1 else 0.85
                bgm_val = sig * decay * duck
                master_left[i] += bgm_val
                master_right[i] += bgm_val * 0.95

        # 2c. Add SFX Cues at Transitions
        sfx_events = [
            (0.05, 880.0, 0.15),
            (3.05, 660.0, 0.20),
            (6.05, 1040.0, 0.25),
            (10.05, 1200.0, 0.20),
            (14.05, 1400.0, 0.30),
            (18.05, 1600.0, 0.35),
            (22.05, 1318.5, 0.45),
        ]

        for evt_time, freq, duration in sfx_events:
            evt_start = int(evt_time * SAMPLE_RATE)
            evt_len = int(duration * SAMPLE_RATE)
            for j in range(evt_len):
                idx = evt_start + j
                if idx < total_samples:
                    tau = j / evt_len
                    envelope = math.sin(math.pi * tau) * math.exp(-3.0 * tau)
                    sfx_val = math.sin(2 * math.pi * freq * (j / SAMPLE_RATE)) * envelope * 0.24
                    master_left[idx] += sfx_val
                    master_right[idx] += sfx_val

        # Master Limiter
        max_peak = max(max(abs(x) for x in master_left), max(abs(x) for x in master_right), 1.0)
        norm_factor = 0.95 / max_peak if max_peak > 0.95 else 1.0

        master_audio_path = os.path.join(audio_dir, "master_audio.wav")
        with wave.open(master_audio_path, "wb") as wf:
            wf.setnchannels(2)
            wf.setsampwidth(2)
            wf.setframerate(SAMPLE_RATE)
            packed_frames = bytearray()
            for i in range(total_samples):
                l_val = int(clamp(master_left[i] * norm_factor, -1.0, 1.0) * 32767)
                r_val = int(clamp(master_right[i] * norm_factor, -1.0, 1.0) * 32767)
                packed_frames.extend(struct.pack("<hh", l_val, r_val))
            wf.writeframes(packed_frames)

        print("   ✓ Master stereo audio track generated.")

        # 3. Encode Master MP4 Video with H.264 / AAC
        print(f"3/4: Encoding 1080x1920 30FPS H.264/AAC MP4 video...")
        if progress_callback:
            progress_callback(50)

        cmd_encode = [
            "ffmpeg", "-y",
            "-framerate", str(FPS),
            "-i", os.path.join(frames_dir, "frame_%04d.svg"),
            "-i", master_audio_path,
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-preset", "fast",
            "-crf", "20",
            "-profile:v", "high",
            "-level", "4.2",
            "-c:a", "aac",
            "-b:a", "192k",
            "-ar", "44100",
            "-ac", "2",
            "-movflags", "+faststart",
            "-t", str(TOTAL_DURATION),
            output_mp4_path
        ]
        
        proc = subprocess.run(cmd_encode, check=True)
        print("   ✓ Video encoding complete.")

        # 4. Verify Output Video with ffprobe
        print("4/4: Verifying final MP4 file metadata...")
        probe_cmd = [
            "ffprobe", "-v", "error",
            "-show_format", "-show_streams",
            "-of", "json",
            output_mp4_path
        ]
        probe_res = subprocess.run(probe_cmd, capture_output=True, text=True, check=True)
        probe_json = json.loads(probe_res.stdout)
        
        streams = probe_json.get("streams", [])
        v_stream = next((s for s in streams if s.get("codec_type") == "video"), None)
        a_stream = next((s for s in streams if s.get("codec_type") == "audio"), None)
        
        file_size = os.path.getsize(output_mp4_path)
        print(f"   ✓ Video stream: {v_stream.get('codec_name')} ({v_stream.get('width')}x{v_stream.get('height')}) @ {v_stream.get('r_frame_rate')} FPS")
        print(f"   ✓ Audio stream: {a_stream.get('codec_name')} {a_stream.get('sample_rate')}Hz ({a_stream.get('channel_layout')})")
        print(f"   ✓ File size: {file_size / (1024*1024):.2f} MB")
        print(f"   ✓ Successfully verified output file: {output_mp4_path}")

        if progress_callback:
            progress_callback(100)

        return {
            "success": True,
            "path": output_mp4_path,
            "size": file_size,
            "width": v_stream.get("width") if v_stream else WIDTH,
            "height": v_stream.get("height") if v_stream else HEIGHT,
            "duration": float(probe_json.get("format", {}).get("duration", TOTAL_DURATION)),
            "v_codec": v_stream.get("codec_name") if v_stream else "h264",
            "a_codec": a_stream.get("codec_name") if a_stream else "aac",
            "fps": FPS,
        }

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

def main():
    parser = argparse.ArgumentParser(description="JodoCo Reel MP4 Master Renderer")
    parser.add_argument("--output", default=os.path.join(OUT_DIR, "JodoCo_Influencer_Marketing_Reel_1080x1920.mp4"), help="Target MP4 file path")
    parser.add_argument("--config", default=None, help="Path to project config JSON")
    args = parser.parse_args()

    config_data = None
    if args.config and os.path.exists(args.config):
        with open(args.config, "r", encoding="utf-8") as f:
            config_data = json.load(f)

    res = render_reel_video(args.output, config_data=config_data)
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    main()
