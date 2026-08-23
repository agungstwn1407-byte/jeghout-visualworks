import io
import os
import uuid
import asyncio
import logging
from datetime import datetime, timezone
from pathlib import Path

import bcrypt
import requests
from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger(__name__)

UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"}

CATEGORIES = [
    {"name": "Graphic Design", "slug": "graphic-design"},
    {"name": "Photography", "slug": "photography"},
    {"name": "Video", "slug": "video"},
    {"name": "Branding", "slug": "branding"},
    {"name": "Social Media", "slug": "social-media"},
]

U = "https://images.unsplash.com/photo-{}?w=1400&q=80&auto=format&fit=crop"

PROJECTS = [
    {
        "title": "Senja Coffee — Brand Identity", "category": "branding", "year": "2026",
        "client": "Senja Coffee Roasters", "role": "Brand Designer & Art Director",
        "description": "Complete brand identity for a specialty coffee roastery — logo system, packaging, menu boards and environmental graphics. The identity pairs deep charcoal tones with a warm accent palette to evoke dusk: the quiet hour when the city slows down and coffee becomes ritual.",
        "tools": ["Adobe Illustrator", "Adobe Photoshop", "Adobe InDesign"],
        "featured": True, "video_url": "",
        "images": ["1511920170033-f8396924c348", "1509042239860-f550ce710b93", "1495474472287-4d71bcdd2085", "1447933601403-0c6688de566e"],
    },
    {
        "title": "Nusa Fest — Social Media Campaign", "category": "social-media", "year": "2026",
        "client": "Nusa Festival", "role": "Creative Designer",
        "description": "A 30-day social media campaign system for a music & culture festival: feed templates, story motion frames, countdown series and artist announcement cards built on a bold typographic grid with a strict dark-purple visual code.",
        "tools": ["Adobe Photoshop", "Adobe Illustrator", "Adobe After Effects"],
        "featured": True, "video_url": "",
        "images": ["1611926653458-09294b3142bf", "1563986768609-322da13575f3", "1432888622747-4eb9a8efeb07"],
    },
    {
        "title": "Ruang Rasa — Restaurant Menu Design", "category": "graphic-design", "year": "2025",
        "client": "Ruang Rasa Dining", "role": "Graphic Designer",
        "description": "Editorial-style menu design for a modern Indonesian restaurant. A spacious typographic system, tactile paper selection and quiet photography direction turn the menu into a piece of the dining experience itself.",
        "tools": ["Adobe InDesign", "Adobe Photoshop"],
        "featured": False, "video_url": "",
        "images": ["1414235077428-338989a2e8c0", "1517248135467-4c7edcad34c4", "1504674900247-0877df9cc836"],
    },
    {
        "title": "Malam Purnama — Event Poster Series", "category": "graphic-design", "year": "2026",
        "client": "Purnama Live", "role": "Graphic Designer",
        "description": "A poster series for a night market & live music event. High-contrast typography, grain textures and deep violet light leaks create a cinematic nocturnal mood across print and digital formats.",
        "tools": ["Adobe Photoshop", "Adobe Illustrator"],
        "featured": True, "video_url": "",
        "images": ["1470229722913-7c0e2dbbafd3", "1514525253161-7a46d19cd819", "1493225457124-a3eb161ffa5f"],
    },
    {
        "title": "Lume — Product Photography", "category": "photography", "year": "2026",
        "client": "Lume Objects", "role": "Photographer & Retoucher",
        "description": "Studio product photography for a design objects brand. Hard spotlight, clipped shadows and precise composition — every frame treated like a still-life painting. Includes full retouching and color grading.",
        "tools": ["Adobe Lightroom", "Adobe Photoshop"],
        "featured": True, "video_url": "",
        "images": ["1523275335684-37898b6baf30", "1585386959984-a4155224a1ad", "1542291026-7eec264c27ff"],
    },
    {
        "title": "Wajah — Portrait Photography", "category": "photography", "year": "2025",
        "client": "Personal Series", "role": "Photographer",
        "description": "An ongoing portrait series exploring quiet expressions under directional light. Shot on location with minimal setup, graded in deep neutral tones with subtle violet shadow tinting.",
        "tools": ["Adobe Lightroom", "Adobe Photoshop"],
        "featured": False, "video_url": "",
        "images": ["1531746020798-e6953c6e8e04", "1506794778202-cad84cf45f1d", "1524504388940-b1c1722653e1"],
    },
    {
        "title": "Arunika — Video Campaign", "category": "video", "year": "2026",
        "client": "Arunika Studio", "role": "Video Editor & Colorist",
        "description": "A 60-second launch film plus 15-second vertical cutdowns. Rhythm-driven editing, seamless match cuts and a cinematic purple-teal grade. Delivered for YouTube, Instagram Reels and in-store screens.",
        "tools": ["Adobe Premiere Pro", "Adobe After Effects"],
        "featured": True, "video_url": "https://www.youtube.com/embed/aqz-KE-bpKQ",
        "images": ["1492691527719-9d1e07e534b4", "1485846234645-a62644f84728", "1574717024653-61fd2cf4d44d"],
    },
    {
        "title": "Kirana — Fashion Editorial", "category": "photography", "year": "2025",
        "client": "Kirana Apparel", "role": "Photographer & Art Director",
        "description": "Fashion editorial for a local apparel label — lookbook and campaign imagery shot against raw concrete and night exteriors. Direction focused on silhouette, movement and negative space.",
        "tools": ["Adobe Lightroom", "Adobe Photoshop"],
        "featured": False, "video_url": "",
        "images": ["1509631179647-0177331693ae", "1529139574466-a303027c1d8b", "1558769132-cb1aea458c5e"],
    },
    {
        "title": "Gema — Creative Poster Exploration", "category": "graphic-design", "year": "2026",
        "client": "Self-initiated", "role": "Graphic Designer",
        "description": "A self-initiated poster exploration around sound and resonance. Experimental typography, distortion and layered grain push the boundaries of the studio's dark visual language.",
        "tools": ["Adobe Photoshop", "Adobe Illustrator"],
        "featured": False, "video_url": "",
        "images": ["1558655146-9f40138edfeb", "1561070791-2526d30994b5", "1626785774573-4b799315345d"],
    },
    {
        "title": "Berkah — Ramadan Campaign", "category": "social-media", "year": "2026",
        "client": "Berkah Mart", "role": "Creative Designer",
        "description": "Ramadan campaign key visuals and social media kit — elegant deep-purple night gradients, crescent geometry and refined gold-free typography for a modern take on the holy month.",
        "tools": ["Adobe Photoshop", "Adobe Illustrator", "Adobe After Effects"],
        "featured": False, "video_url": "",
        "images": ["1618005182384-a83a8bd57fbe", "1620641788421-7a1c342ea42e", "1557682250-33bd709cbe85"],
    },
    {
        "title": "Distorsi — Music Event Visuals", "category": "video", "year": "2025",
        "client": "Distorsi Collective", "role": "Video Editor & VJ Visual Designer",
        "description": "Stage screen visuals and aftermovie for an electronic music night. Glitch-controlled motion graphics synced to BPM, edited with heavy contrast and strobing violet accents.",
        "tools": ["Adobe After Effects", "Adobe Premiere Pro"],
        "featured": False, "video_url": "https://www.youtube.com/embed/aqz-KE-bpKQ",
        "images": ["1470225620780-dba8ba36b745", "1516450360452-9312f5e86fc7", "1501281668745-f7f57925c3b4"],
    },
    {
        "title": "Wangi — Packaging Design", "category": "branding", "year": "2026",
        "client": "Wangi Botanicals", "role": "Packaging Designer",
        "description": "Packaging system for a botanical home-fragrance brand. Matte black substrates, soft-touch finish and a single violet foil line — restraint as luxury across box, label and unboxing collateral.",
        "tools": ["Adobe Illustrator", "Adobe Photoshop", "Adobe InDesign"],
        "featured": True, "video_url": "",
        "images": ["1586953208448-b95a79798f07", "1601924994987-69e26d50dc26", "1558655146-9f40138edfeb"],
    },
]

PORTRAIT_ID = "1507003211169-0a1dd7228f2d"

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def _placeholder(dest: Path, title: str, size=(1200, 1500)):
    w, h = size
    img = Image.new("RGB", size, "#08080B")
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        r = int(8 + 60 * t * 0.9)
        g = int(8 + 14 * t)
        b = int(11 + 120 * t)
        draw.line([(0, y), (w, y)], fill=(min(r, 60), min(g, 22), min(b, 130)))
    try:
        fb = ImageFont.truetype(FONT_BOLD, int(w * 0.09))
        fs = ImageFont.truetype(FONT_REG, int(w * 0.032))
    except Exception:
        fb = fs = ImageFont.load_default()
    draw.text((int(w * 0.08), int(h * 0.72)), title.upper()[:22], font=fb, fill="#F5F5F5")
    draw.text((int(w * 0.08), int(h * 0.72) + int(w * 0.12)), "JIEGHOUT VISUALWORKS", font=fs, fill="#A970FF")
    img.save(dest, "WEBP", quality=84)


def _fetch(img_id: str, dest: Path, title: str):
    try:
        r = requests.get(U.format(img_id), timeout=12, headers=UA)
        if r.status_code == 200 and len(r.content) > 8000:
            img = Image.open(io.BytesIO(r.content))
            if img.mode != "RGB":
                img = img.convert("RGB")
            img.thumbnail((1600, 1600))
            img.save(dest, "WEBP", quality=84)
            return True
    except Exception as e:
        logger.warning(f"image download failed {img_id}: {e}")
    _placeholder(dest, title)
    return False


def _seed_images(root_dir: Path):
    upload_dir = root_dir / "uploads"
    upload_dir.mkdir(exist_ok=True)
    mapping = {}
    for p in PROJECTS:
        paths = []
        for i, img_id in enumerate(p["images"]):
            name = f"seed-{uuid.uuid4().hex[:10]}.webp"
            _fetch(img_id, upload_dir / name, p["title"])
            paths.append(f"/api/uploads/{name}")
        mapping[p["title"]] = paths
    pname = f"seed-{uuid.uuid4().hex[:10]}.webp"
    _fetch(PORTRAIT_ID, upload_dir / pname, "Portrait")
    mapping["__portrait__"] = f"/api/uploads/{pname}"
    return mapping


async def seed_all(db, root_dir: Path):
    # admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@visualworks.id").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Visualworks@2026")
    existing = await db.admin_users.find_one({"email": admin_email})
    hashed = bcrypt.hashpw(admin_password.encode(), bcrypt.gensalt()).decode()
    if not existing:
       existing_admin = await db.admin_users.find_one({
    "email": admin_email
})

if not existing_admin:
    await db.admin_users.insert_one({
        "id": uuid.uuid4().hex,
        "email": admin_email,
        "name": "Admin",
        "password_hash": hashed,
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
        })
        logger.info(f"Seeded admin user: {admin_email}")
    elif not bcrypt.checkpw(admin_password.encode(), existing["password_hash"].encode()):
        await db.admin_users.update_one({"email": admin_email}, {"$set": {"password_hash": hashed}})

    # categories
    if await db.categories.count_documents({}) == 0:
        await db.categories.insert_many([
            {"id": uuid.uuid4().hex, **c} for c in CATEGORIES
        ])

    # projects
    if await db.projects.count_documents({}) == 0:
        mapping = await asyncio.to_thread(_seed_images, root_dir)
        docs = []
        for i, p in enumerate(PROJECTS):
            imgs = mapping[p["title"]]
            slug = p["title"].lower().split("—")[0].strip()
            slug = "".join(c if c.isalnum() else "-" for c in slug).strip("-")
            while "--" in slug:
                slug = slug.replace("--", "-")
            docs.append({
                "id": uuid.uuid4().hex,
                "title": p["title"],
                "slug": slug,
                "category": p["category"],
                "year": p["year"],
                "client": p["client"],
                "role": p["role"],
                "description": p["description"],
                "cover": imgs[0],
                "gallery": imgs[1:],
                "video_url": p["video_url"],
                "tools": p["tools"],
                "featured": p["featured"],
                "published": True,
                "order": i,
                "seo_title": f"{p['title']} — Jieghout Visualworks",
                "seo_description": p["description"][:150],
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        await db.projects.insert_many(docs)
        logger.info(f"Seeded {len(docs)} projects")
        portrait = mapping["__portrait__"]
    else:
        s = await db.site_settings.find_one({"id": "site"}, {"_id": 0})
        portrait = (s or {}).get("portrait", "")

    # settings
    if await db.site_settings.count_documents({"id": "site"}) == 0:
        await db.site_settings.insert_one({
            "id": "site",
            "brand_name": "Jeghout Visualworks",
            "tagline": "Creative Designer, Photographer & Video Editor",
            "email": "hello@visualworks.id",
            "instagram": "https://instagram.com/Jeghout.visualworks",
            "behance": "https://behance.net/Jeghout",
            "linkedin": "https://linkedin.com/in/Jeghout",
            "location": "Jakarta, Indonesia",
            "portrait": portrait,
            "about_bio": "",
        })
