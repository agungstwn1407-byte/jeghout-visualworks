from pathlib import Path
from datetime import datetime, timezone
import os
import uuid
import logging

import bcrypt


logger = logging.getLogger(__name__)


# =========================================================
# HELPERS
# =========================================================

def utc_now():
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


# =========================================================
# DEFAULT SETTINGS
# =========================================================

DEFAULT_SETTINGS = {
    "id": "site",

    "brand_name": "Jeghout Visualworks",

    "tagline": (
        "Creative Designer, Photographer & Video Editor"
    ),

    "email": "hello@visualworks.id",

    "instagram": (
        "https://instagram.com/Jeghout.visualworks"
    ),

    "behance": (
        "https://behance.net/Jeghout"
    ),

    "linkedin": (
        "https://linkedin.com/in/Jeghout"
    ),

    "location": "Jakarta, Indonesia",

    "portrait": "",

    "about_bio": (
        "Graphic Designer, Photographer & Video Editor "
        "creating bold, meaningful and visually engaging "
        "experiences."
    ),

    "updated_at": utc_now(),
}


# =========================================================
# DEFAULT CATEGORIES
# =========================================================

DEFAULT_CATEGORIES = [
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
    {
        "name": "Live Streaming",
        "slug": "live-streaming",
    },
]


# =========================================================
# DEFAULT PROJECTS
# =========================================================

DEFAULT_PROJECTS = [
    {
        "title": "Brand Identity",
        "slug": "brand-identity",
        "category": "branding",
        "year": "",
        "client": "",
        "role": "Graphic Designer",
        "description": (
            "Selected branding and visual identity work."
        ),
        "cover": "",
        "gallery": [],
        "video_url": "",
        "tools": [
            "Adobe Illustrator",
            "Adobe Photoshop",
        ],
        "featured": False,
        "published": False,
        "order": 0,
        "seo_title": "Brand Identity — Jeghout Visualworks",
        "seo_description": (
            "Brand identity project by Jeghout Visualworks."
        ),
    },
]


# =========================================================
# ADMIN SEED
# =========================================================

async def seed_admin(database):
    """
    Membuat admin pertama kali.

    Penting:
    - Tidak menghapus admin lama.
    - Tidak mengganti password admin lama.
    - Email/password dapat diatur melalui environment variable.
    """

    admin_email = os.environ.get(
        "ADMIN_EMAIL",
        "admin@jeghout.com"
    ).strip().lower()

    admin_password = os.environ.get(
        "ADMIN_PASSWORD",
        ""
    ).strip()

    admin_name = os.environ.get(
        "ADMIN_NAME",
        "Jeghout Admin"
    ).strip()

    if not admin_password:
        logger.warning(
            "ADMIN_PASSWORD belum tersedia. "
            "Admin seed dilewati."
        )
        return

    existing = await database.admin_users.find_one(
        {
            "email": admin_email
        }
    )

    if existing:
        logger.info(
            "Admin sudah tersedia: %s",
            admin_email
        )
        return

    user = {
        "id": uuid.uuid4().hex,
        "email": admin_email,
        "name": admin_name,
        "password_hash": hash_password(
            admin_password
        ),
        "created_at": utc_now(),
    }

    await database.admin_users.insert_one(user)

    logger.info(
        "Admin berhasil dibuat: %s",
        admin_email
    )


# =========================================================
# CATEGORY SEED
# =========================================================

async def seed_categories(database):
    for category in DEFAULT_CATEGORIES:

        existing = await database.categories.find_one(
            {
                "slug": category["slug"]
            }
        )

        if existing:
            continue

        document = {
            "id": uuid.uuid4().hex,
            "name": category["name"],
            "slug": category["slug"],
            "created_at": utc_now(),
        }

        await database.categories.insert_one(
            document
        )

        logger.info(
            "Category created: %s",
            category["name"]
        )


# =========================================================
# SETTINGS SEED
# =========================================================

async def seed_settings(database):
    existing = await database.site_settings.find_one(
        {
            "id": "site"
        }
    )

    if existing:
        logger.info(
            "Site settings sudah tersedia."
        )
        return

    await database.site_settings.insert_one(
        DEFAULT_SETTINGS.copy()
    )

    logger.info(
        "Default site settings berhasil dibuat."
    )


# =========================================================
# PROJECT SEED
# =========================================================

async def seed_projects(database):
    """
    Membuat project contoh hanya jika database
    belum mempunyai project sama sekali.

    Project contoh dibuat unpublished supaya
    tidak muncul di portfolio publik.
    """

    count = await database.projects.count_documents({})

    if count > 0:
        logger.info(
            "Projects sudah tersedia. "
            "Project seed dilewati."
        )
        return

    for project in DEFAULT_PROJECTS:

        document = {
            **project,
            "id": uuid.uuid4().hex,
            "created_at": utc_now(),
        }

        await database.projects.insert_one(
            document
        )

        logger.info(
            "Seed project created: %s",
            project["title"]
        )


# =========================================================
# MAIN SEED
# =========================================================

async def seed_all(
    database,
    root_dir: Path | None = None
):
    """
    Main database seeder.

    Aman dijalankan berulang kali.
    Tidak menghapus data existing.
    """

    if database is None:
        logger.warning(
            "Database tidak tersedia. Seed dilewati."
        )
        return

    logger.info(
        "Starting database seed..."
    )

    await seed_admin(database)

    await seed_categories(database)

    await seed_settings(database)

    await seed_projects(database)

    logger.info(
        "Database seed selesai."
    )