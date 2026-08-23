import os
import uuid
import logging

from datetime import datetime, timezone

import bcrypt


logger = logging.getLogger(__name__)


# =========================================================
# CATEGORIES
# =========================================================

CATEGORIES = [
    {
        "name": "Graphic Design",
        "slug": "graphic-design",
    },
    {
        "name": "Photography",
        "slug": "photography",
    },
    {
        "name": "Video",
        "slug": "video",
    },
    {
        "name": "Branding",
        "slug": "branding",
    },
    {
        "name": "Social Media",
        "slug": "social-media",
    },
]


# =========================================================
# PROJECTS
# =========================================================

PROJECTS = [
    {
        "title": "Senja Coffee — Brand Identity",
        "category": "branding",
        "year": "2026",
        "client": "Senja Coffee Roasters",
        "role": "Brand Designer & Art Director",
        "description": (
            "Complete brand identity for a specialty "
            "coffee roastery — logo system, packaging, "
            "menu boards and environmental graphics."
        ),
        "tools": [
            "Adobe Illustrator",
            "Adobe Photoshop",
            "Adobe InDesign",
        ],
        "featured": True,
        "video_url": "",
        "images": [
            "1511920170033-f8396924c348",
            "1509042239860-f550ce710b93",
            "1495474472287-4d71bcdd2085",
            "1447933601403-0c6688de566e",
        ],
    },
    {
        "title": "Nusa Fest — Social Media Campaign",
        "category": "social-media",
        "year": "2026",
        "client": "Nusa Festival",
        "role": "Creative Designer",
        "description": (
            "A 30-day social media campaign system "
            "for a music and culture festival."
        ),
        "tools": [
            "Adobe Photoshop",
            "Adobe Illustrator",
            "Adobe After Effects",
        ],
        "featured": True,
        "video_url": "",
        "images": [
            "1611926653458-09294b3142bf",
            "1563986768609-322da13575f3",
            "1432888622747-4eb9a8efeb07",
        ],
    },
    {
        "title": "Ruang Rasa — Restaurant Menu Design",
        "category": "graphic-design",
        "year": "2025",
        "client": "Ruang Rasa Dining",
        "role": "Graphic Designer",
        "description": (
            "Editorial-style menu design for a modern "
            "Indonesian restaurant."
        ),
        "tools": [
            "Adobe InDesign",
            "Adobe Photoshop",
        ],
        "featured": False,
        "video_url": "",
        "images": [
            "1414235077428-338989a2e8c0",
            "1517248135467-4c7edcad34c4",
            "1504674900247-0877df9cc836",
        ],
    },
    {
        "title": "Malam Purnama — Event Poster Series",
        "category": "graphic-design",
        "year": "2026",
        "client": "Purnama Live",
        "role": "Graphic Designer",
        "description": (
            "A poster series for a night market "
            "and live music event."
        ),
        "tools": [
            "Adobe Photoshop",
            "Adobe Illustrator",
        ],
        "featured": True,
        "video_url": "",
        "images": [
            "1470229722913-7c0e2dbbafd3",
            "1514525253161-7a46d19cd819",
            "1493225457124-a3eb161ffa5f",
        ],
    },
    {
        "title": "Lume — Product Photography",
        "category": "photography",
        "year": "2026",
        "client": "Lume Objects",
        "role": "Photographer & Retoucher",
        "description": (
            "Studio product photography for a design "
            "objects brand."
        ),
        "tools": [
            "Adobe Lightroom",
            "Adobe Photoshop",
        ],
        "featured": True,
        "video_url": "",
        "images": [
            "1523275335684-37898b6baf30",
            "1585386959984-a4155224a1ad",
            "1542291026-7eec264c27ff",
        ],
    },
    {
        "title": "Wajah — Portrait Photography",
        "category": "photography",
        "year": "2025",
        "client": "Personal Series",
        "role": "Photographer",
        "description": (
            "An ongoing portrait series exploring "
            "quiet expressions under directional light."
        ),
        "tools": [
            "Adobe Lightroom",
            "Adobe Photoshop",
        ],
        "featured": False,
        "video_url": "",
        "images": [
            "1531746020798-e6953c6e8e04",
            "1506794778202-cad84cf45f1d",
            "1524504388940-b1c1722653e1",
        ],
    },
    {
        "title": "Arunika — Video Campaign",
        "category": "video",
        "year": "2026",
        "client": "Arunika Studio",
        "role": "Video Editor & Colorist",
        "description": (
            "A 60-second launch film plus "
            "15-second vertical cutdowns."
        ),
        "tools": [
            "Adobe Premiere Pro",
            "Adobe After Effects",
        ],
        "featured": True,
        "video_url": (
            "https://www.youtube.com/embed/aqz-KE-bpKQ"
        ),
        "images": [
            "1492691527719-9d1e07e534b4",
            "1485846234645-a62644f84728",
            "1574717024653-61fd2cf4d44d",
        ],
    },
    {
        "title": "Kirana — Fashion Editorial",
        "category": "photography",
        "year": "2025",
        "client": "Kirana Apparel",
        "role": "Photographer & Art Director",
        "description": (
            "Fashion editorial for a local apparel label."
        ),
        "tools": [
            "Adobe Lightroom",
            "Adobe Photoshop",
        ],
        "featured": False,
        "video_url": "",
        "images": [
            "1509631179647-0177331693ae",
            "1529139574466-a303027c1d8b",
            "1558769132-cb1aea458c5e",
        ],
    },
    {
        "title": "Gema — Creative Poster Exploration",
        "category": "graphic-design",
        "year": "2026",
        "client": "Self-initiated",
        "role": "Graphic Designer",
        "description": (
            "A self-initiated poster exploration "
            "around sound and resonance."
        ),
        "tools": [
            "Adobe Photoshop",
            "Adobe Illustrator",
        ],
        "featured": False,
        "video_url": "",
        "images": [
            "1558655146-9f40138edfeb",
            "1561070791-2526d30994b5",
            "1626785774573-4b799315345d",
        ],
    },
    {
        "title": "Berkah — Ramadan Campaign",
        "category": "social-media",
        "year": "2026",
        "client": "Berkah Mart",
        "role": "Creative Designer",
        "description": (
            "Ramadan campaign key visuals and social "
            "media kit."
        ),
        "tools": [
            "Adobe Photoshop",
            "Adobe Illustrator",
            "Adobe After Effects",
        ],
        "featured": False,
        "video_url": "",
        "images": [
            "1618005182384-a83a8bd57fbe",
            "1620641788421-7a1c342ea42e",
            "1557682250-33bd709cbe85",
        ],
    },
    {
        "title": "Distorsi — Music Event Visuals",
        "category": "video",
        "year": "2025",
        "client": "Distorsi Collective",
        "role": "Video Editor & VJ Visual Designer",
        "description": (
            "Stage screen visuals and aftermovie "
            "for an electronic music night."
        ),
        "tools": [
            "Adobe After Effects",
            "Adobe Premiere Pro",
        ],
        "featured": False,
        "video_url": (
            "https://www.youtube.com/embed/aqz-KE-bpKQ"
        ),
        "images": [
            "1470225620780-dba8ba36b745",
            "1516450360452-9312f5e86fc7",
            "1501281668745-f7f57925c3b4",
        ],
    },
    {
        "title": "Wangi — Packaging Design",
        "category": "branding",
        "year": "2026",
        "client": "Wangi Botanicals",
        "role": "Packaging Designer",
        "description": (
            "Packaging system for a botanical "
            "home-fragrance brand."
        ),
        "tools": [
            "Adobe Illustrator",
            "Adobe Photoshop",
            "Adobe InDesign",
        ],
        "featured": True,
        "video_url": "",
        "images": [
            "1586953208448-b95a79798f07",
            "1601924994987-69e26d50dc26",
            "1558655146-9f40138edfeb",
        ],
    },
]


# =========================================================
# UNSPLASH
# =========================================================

UNSPLASH_URL = (
    "https://images.unsplash.com/"
    "photo-{}"
    "?w=1400&q=80&auto=format&fit=crop"
)

PORTRAIT_URL = (
    "https://images.unsplash.com/"
    "photo-1507003211169-0a1dd7228f2d"
    "?w=1200&q=80&auto=format&fit=crop"
)


# =========================================================
# SEED DATABASE
# =========================================================

async def seed_all(db, root_dir=None):

    logger.info("Starting database seed...")

    # =====================================================
    # ADMIN
    # =====================================================

    admin_email = os.environ.get(
        "ADMIN_EMAIL",
        "admin@visualworks.id",
    ).lower().strip()

    admin_password = os.environ.get(
        "ADMIN_PASSWORD",
        "Visualworks@2026",
    )

    existing_admin = await db.admin_users.find_one(
        {
            "email": admin_email,
        }
    )

    if not existing_admin:

        hashed = bcrypt.hashpw(
            admin_password.encode("utf-8"),
            bcrypt.gensalt(),
        ).decode("utf-8")

        await db.admin_users.insert_one(
            {
                "id": uuid.uuid4().hex,
                "email": admin_email,
                "name": "Admin",
                "password_hash": hashed,
                "role": "admin",
                "created_at": datetime.now(
                    timezone.utc
                ).isoformat(),
            }
        )

        logger.info(
            f"Admin created: {admin_email}"
        )

    else:

        logger.info(
            f"Admin already exists: {admin_email}"
        )

    # =====================================================
    # CATEGORIES
    # =====================================================

    category_count = await db.categories.count_documents({})

    if category_count == 0:

        category_docs = []

        for category in CATEGORIES:

            category_docs.append(
                {
                    "id": uuid.uuid4().hex,
                    "name": category["name"],
                    "slug": category["slug"],
                }
            )

        if category_docs:

            await db.categories.insert_many(
                category_docs
            )

            logger.info(
                f"Seeded {len(category_docs)} categories"
            )

    # =====================================================
    # PROJECTS
    # =====================================================

    project_count = await db.projects.count_documents({})

    if project_count == 0:

        project_docs = []

        for index, project in enumerate(PROJECTS):

            image_urls = []

            for image_id in project["images"]:

                image_urls.append(
                    UNSPLASH_URL.format(image_id)
                )

            # -------------------------------------------------
            # SLUG
            # -------------------------------------------------

            slug = (
                project["title"]
                .lower()
                .split("—")[0]
                .strip()
            )

            slug = "".join(
                char if char.isalnum() else "-"
                for char in slug
            )

            slug = slug.strip("-")

            while "--" in slug:

                slug = slug.replace(
                    "--",
                    "-"
                )

            # -------------------------------------------------
            # PROJECT DOCUMENT
            # -------------------------------------------------

            project_docs.append(
                {
                    "id": uuid.uuid4().hex,
                    "title": project["title"],
                    "slug": slug,
                    "category": project["category"],
                    "year": project["year"],
                    "client": project["client"],
                    "role": project["role"],
                    "description": project["description"],
                    "cover": image_urls[0],
                    "gallery": image_urls[1:],
                    "video_url": project["video_url"],
                    "tools": project["tools"],
                    "featured": project["featured"],
                    "published": True,
                    "order": index,
                    "seo_title": (
                        project["title"]
                        + " — Jeghout Visualworks"
                    ),
                    "seo_description": (
                        project["description"][:150]
                    ),
                    "created_at": datetime.now(
                        timezone.utc
                    ).isoformat(),
                }
            )

        if project_docs:

            await db.projects.insert_many(
                project_docs
            )

            logger.info(
                f"Seeded {len(project_docs)} projects"
            )

    # =====================================================
    # SITE SETTINGS
    # =====================================================

    existing_settings = await db.site_settings.find_one(
        {
            "id": "site"
        }
    )

    if not existing_settings:

        await db.site_settings.insert_one(
            {
                "id": "site",
                "brand_name": "Jeghout Visualworks",
                "tagline": (
                    "Creative Designer, "
                    "Photographer & Video Editor"
                ),
                "email": "hello@visualworks.id",
                "instagram": (
                    "https://instagram.com/"
                    "Jeghout.visualworks"
                ),
                "behance": (
                    "https://behance.net/"
                    "Jeghout"
                ),
                "linkedin": (
                    "https://linkedin.com/in/"
                    "Jeghout"
                ),
                "location": "Indonesia",
                "portrait": PORTRAIT_URL,
                "about_bio": "",
            }
        )

        logger.info(
            "Site settings created"
        )

    else:

        logger.info(
            "Site settings already exist"
        )

    logger.info(
        "Database seed completed successfully"
    )