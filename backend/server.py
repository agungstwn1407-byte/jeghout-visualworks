from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
load_dotenv(ROOT_DIR / ".env")

import os
import re
import io
import uuid
import logging
import smtplib
import ssl
import requests

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr

from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt

from PIL import Image

from fastapi import (
    FastAPI,
    APIRouter,
    HTTPException,
    Depends,
    UploadFile,
    File,
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
)

from fastapi.staticfiles import StaticFiles

from starlette.middleware.cors import CORSMiddleware

from motor.motor_asyncio import AsyncIOMotorClient

from pydantic import BaseModel


# =========================================================
# LOGGING
# =========================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


# =========================================================
# ENVIRONMENT
# =========================================================

MONGO_URL = os.environ.get("MONGO_URL", "").strip()

JWT_SECRET = os.environ.get(
    "JWT_SECRET",
    "change-this-secret-in-production",
).strip()

JWT_ALGORITHM = "HS256"

DB_NAME = os.environ.get(
    "DB_NAME",
    "jeghout",
).strip().lower()

BLOB_READ_WRITE_TOKEN = os.environ.get(
    "BLOB_READ_WRITE_TOKEN",
    "",
).strip()

CORS_ORIGINS_RAW = os.environ.get(
    "CORS_ORIGINS",
    "*",
).strip()


# =========================================================
# GMAIL SMTP
# =========================================================

SMTP_HOST = os.environ.get(
    "SMTP_HOST",
    "smtp.gmail.com",
).strip()

try:
    SMTP_PORT = int(
        os.environ.get(
            "SMTP_PORT",
            "587",
        ).strip()
    )
except ValueError:
    SMTP_PORT = 587

SMTP_USERNAME = os.environ.get(
    "SMTP_USERNAME",
    "",
).strip()

SMTP_PASSWORD = os.environ.get(
    "SMTP_PASSWORD",
    "",
).strip()

NOTIFICATION_EMAIL = os.environ.get(
    "NOTIFICATION_EMAIL",
    SMTP_USERNAME,
).strip()


# =========================================================
# WARNINGS
# =========================================================

if not MONGO_URL:
    logger.warning("MONGO_URL belum tersedia.")

if JWT_SECRET == "change-this-secret-in-production":
    logger.warning("JWT_SECRET masih menggunakan default.")

if not BLOB_READ_WRITE_TOKEN:
    logger.warning(
        "BLOB_READ_WRITE_TOKEN belum tersedia. "
        "Upload Vercel Blob tidak akan bekerja."
    )

if not SMTP_USERNAME or not SMTP_PASSWORD:
    logger.warning(
        "SMTP_USERNAME / SMTP_PASSWORD belum tersedia. "
        "Email Gmail SMTP tidak akan dikirim."
    )


# =========================================================
# MONGODB
# =========================================================

client = None
db = None

if MONGO_URL:
    client = AsyncIOMotorClient(
        MONGO_URL,
        serverSelectionTimeoutMS=10000,
        connectTimeoutMS=10000,
        socketTimeoutMS=10000,
    )

    db = client[DB_NAME]


# =========================================================
# LOCAL UPLOAD DIRECTORY
# =========================================================

UPLOAD_DIR = Path("/tmp/uploads")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="Jeghout Visualworks API",
    version="1.0.0",
)

api = APIRouter(
    prefix="/api",
)

security = HTTPBearer(
    auto_error=False,
)


# =========================================================
# DATABASE HELPER
# =========================================================

def require_db():
    if db is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Database belum terhubung. "
                "Pastikan MONGO_URL sudah tersedia."
            ),
        )

    return db


# =========================================================
# PASSWORD
# =========================================================

def hash_password(
    password: str,
) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")


def verify_password(
    plain: str,
    hashed: str,
) -> bool:
    try:
        return bcrypt.checkpw(
            plain.encode("utf-8"),
            hashed.encode("utf-8"),
        )
    except Exception:
        return False


# =========================================================
# JWT
# =========================================================

def create_token(
    user_id: str,
    email: str,
) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": (
            datetime.now(timezone.utc)
            + timedelta(hours=12)
        ),
        "type": "access",
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


# =========================================================
# AUTH
# =========================================================

async def get_admin(
    creds: HTTPAuthorizationCredentials = Depends(
        security
    ),
):
    database = require_db()

    if not creds:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    try:
        payload = jwt.decode(
            creds.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )

        if payload.get("type") != "access":
            raise HTTPException(
                status_code=401,
                detail="Invalid token",
            )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token",
            )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token expired",
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    user = await database.admin_users.find_one(
        {"id": user_id},
        {"_id": 0},
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    user.pop(
        "password_hash",
        None,
    )

    return user


# =========================================================
# UTILITIES
# =========================================================

def slugify(
    text: str,
) -> str:
    text = text.strip().lower()

    text = re.sub(
        r"[^a-z0-9]+",
        "-",
        text,
    )

    text = text.strip("-")

    return (
        text
        or uuid.uuid4().hex[:8]
    )


def utc_now():
    return datetime.now(
        timezone.utc
    ).isoformat()


# =========================================================
# PYDANTIC MODELS
# =========================================================

class LoginIn(BaseModel):
    email: str
    password: str


class ProjectIn(BaseModel):
    title: str
    slug: Optional[str] = None
    category: str = "graphic-design"
    year: str = ""
    client: str = ""
    role: str = ""
    description: str = ""
    cover: str = ""
    gallery: List[str] = []
    video_url: str = ""
    tools: List[str] = []
    featured: bool = False
    published: bool = True
    order: int = 0
    seo_title: str = ""
    seo_description: str = ""


class CategoryIn(BaseModel):
    name: str


class MessageIn(BaseModel):
    name: str
    email: str
    company: str = ""
    project_type: str = ""
    budget: str = ""
    message: str


class MessageStatusIn(BaseModel):
    status: str


class SettingsIn(BaseModel):
    brand_name: str = ""
    tagline: str = ""
    email: str = ""
    instagram: str = ""
    behance: str = ""
    linkedin: str = ""
    location: str = ""
    portrait: str = ""
    about_bio: str = ""


# =========================================================
# GMAIL SMTP EMAIL
# =========================================================

def send_message_notification(
    data: MessageIn,
) -> bool:

    if not SMTP_USERNAME or not SMTP_PASSWORD:
        logger.warning(
            "Email tidak dikirim karena "
            "SMTP_USERNAME atau SMTP_PASSWORD kosong."
        )
        return False

    if not NOTIFICATION_EMAIL:
        logger.warning(
            "NOTIFICATION_EMAIL belum tersedia."
        )
        return False

    subject = (
        "Pesan Baru dari Website - "
        f"{data.name}"
    )

    text_body = f"""
Pesan Baru dari Website
Jeghout Visualworks

Nama: {data.name}
Email: {data.email}
Perusahaan: {data.company or "-"}
Project Type: {data.project_type or "-"}
Budget: {data.budget or "-"}

Message:
{data.message}
"""

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Pesan Baru - Jeghout Visualworks</title>
</head>

<body style="
margin:0;
padding:30px;
background:#f5f5f5;
font-family:Arial,Helvetica,sans-serif;
color:#222;
">

<div style="
max-width:680px;
margin:auto;
background:#fff;
border:1px solid #e5e5e5;
border-radius:12px;
overflow:hidden;
">

<div style="
padding:28px;
background:#111;
color:#fff;
">

<h1 style="margin:0;font-size:24px;">
Pesan Baru
</h1>

<p style="margin:8px 0 0;color:#ccc;">
Jeghout Visualworks
</p>

</div>

<div style="padding:28px;">

<p>
Ada pesan baru yang masuk melalui website
<strong>Jeghout Visualworks</strong>.
</p>

<h3>Informasi Pengirim</h3>

<table style="
width:100%;
border-collapse:collapse;
">

<tr>
<td style="
padding:10px 0;
width:160px;
font-weight:bold;
vertical-align:top;
">
Nama
</td>

<td style="padding:10px 0;">
{data.name}
</td>
</tr>

<tr>
<td style="
padding:10px 0;
font-weight:bold;
vertical-align:top;
">
Email
</td>

<td style="padding:10px 0;">
{data.email}
</td>
</tr>

<tr>
<td style="
padding:10px 0;
font-weight:bold;
vertical-align:top;
">
Perusahaan
</td>

<td style="padding:10px 0;">
{data.company or "-"}
</td>
</tr>

<tr>
<td style="
padding:10px 0;
font-weight:bold;
vertical-align:top;
">
Project Type
</td>

<td style="padding:10px 0;">
{data.project_type or "-"}
</td>
</tr>

<tr>
<td style="
padding:10px 0;
font-weight:bold;
vertical-align:top;
">
Budget
</td>

<td style="padding:10px 0;">
{data.budget or "-"}
</td>
</tr>

</table>

<h3 style="
margin-top:28px;
">
Message
</h3>

<div style="
padding:20px;
background:#f7f7f7;
border-radius:8px;
line-height:1.7;
white-space:pre-wrap;
">

{data.message}

</div>

<p style="
margin-top:28px;
padding-top:20px;
border-top:1px solid #eee;
font-size:13px;
color:#777;
">

Email ini dikirim otomatis dari
website Jeghout Visualworks.

<br><br>

Klik Reply untuk membalas langsung kepada:
{data.email}

</p>

</div>

</div>

</body>
</html>
"""

    message = MIMEMultipart(
        "alternative"
    )

    message["Subject"] = subject

    message["From"] = formataddr(
        (
            "Jeghout Visualworks",
            SMTP_USERNAME,
        )
    )

    message["To"] = NOTIFICATION_EMAIL

    message["Reply-To"] = data.email

    message.attach(
        MIMEText(
            text_body,
            "plain",
            "utf-8",
        )
    )

    message.attach(
        MIMEText(
            html_body,
            "html",
            "utf-8",
        )
    )

    try:

        context = ssl.create_default_context()

        with smtplib.SMTP(
            SMTP_HOST,
            SMTP_PORT,
            timeout=20,
        ) as server:

            server.ehlo()

            server.starttls(
                context=context
            )

            server.ehlo()

            server.login(
                SMTP_USERNAME,
                SMTP_PASSWORD,
            )

            server.sendmail(
                SMTP_USERNAME,
                [
                    NOTIFICATION_EMAIL
                ],
                message.as_string(),
            )

        logger.info(
            "Gmail SMTP berhasil mengirim "
            "notifikasi ke %s",
            NOTIFICATION_EMAIL,
        )

        return True

    except smtplib.SMTPAuthenticationError:

        logger.error(
            "Gmail SMTP authentication gagal. "
            "Pastikan SMTP_PASSWORD adalah "
            "Sandi Aplikasi Google 16 digit."
        )

        return False

    except Exception as exc:

        logger.exception(
            "Gagal mengirim email Gmail SMTP: %s",
            exc,
        )

        return False


# =========================================================
# ROOT
# =========================================================

@app.get("/")
async def root():

    return {
        "status": "ok",
        "name": "Jeghout Visualworks API",
        "api": "/api",
        "health": "/api/health",
    }


# =========================================================
# HEALTH
# =========================================================

@api.get("/health")
async def health():

    database_status = "not_configured"

    if db is not None:

        try:

            await db.command("ping")

            database_status = "connected"

        except Exception as exc:

            logger.error(
                "MongoDB health check failed: %s",
                exc,
            )

            database_status = "error"

    return {
        "status": "ok",
        "database": database_status,
        "blob": (
            "configured"
            if BLOB_READ_WRITE_TOKEN
            else "not_configured"
        ),
        "email": (
            "configured"
            if SMTP_USERNAME
            and SMTP_PASSWORD
            else "not_configured"
        ),
        "email_provider": "gmail_smtp",
        "db_name": DB_NAME,
    }


# =========================================================
# AUTH LOGIN
# =========================================================

@api.post("/auth/login")
async def login(
    data: LoginIn,
):

    database = require_db()

    email = (
        data.email
        .lower()
        .strip()
    )

    user = await database.admin_users.find_one(
        {"email": email}
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    password_hash = user.get(
        "password_hash"
    )

    if not password_hash:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(
        data.password,
        password_hash,
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_token(
        user["id"],
        email,
    )

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": email,
            "name": user.get(
                "name",
                "Admin",
            ),
        },
    }


# =========================================================
# AUTH ME
# =========================================================

@api.get("/auth/me")
async def me(
    admin=Depends(get_admin),
):

    return admin


# =========================================================
# PUBLIC SETTINGS
# =========================================================

@api.get("/settings")
async def get_settings():

    database = require_db()

    settings = await database.site_settings.find_one(
        {"id": "site"},
        {"_id": 0},
    )

    return settings or {}


# =========================================================
# PUBLIC CATEGORIES
# =========================================================

@api.get("/categories")
async def list_categories():

    database = require_db()

    return await database.categories.find(
        {},
        {"_id": 0},
    ).sort(
        "name",
        1,
    ).to_list(50)


# =========================================================
# PUBLIC PROJECTS
# =========================================================

@api.get("/projects")
async def list_projects(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = 60,
):

    database = require_db()

    limit = max(
        1,
        min(limit, 100),
    )

    query = {
        "published": True
    }

    if category and category != "all":

        query["category"] = category

    if featured is not None:

        query["featured"] = featured

    return await database.projects.find(
        query,
        {"_id": 0},
    ).sort(
        [
            ("order", 1),
            ("created_at", -1),
        ]
    ).to_list(limit)


# =========================================================
# PUBLIC SINGLE PROJECT
# =========================================================

@api.get("/projects/{slug}")
async def get_project(
    slug: str,
):

    database = require_db()

    project = await database.projects.find_one(
        {
            "slug": slug,
            "published": True,
        },
        {"_id": 0},
    )

    if not project:

        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    related = await database.projects.find(
        {
            "published": True,
            "slug": {
                "$ne": slug
            },
            "category": project["category"],
        },
        {"_id": 0},
    ).sort(
        "order",
        1,
    ).limit(3).to_list(3)

    if len(related) < 3:

        more = await database.projects.find(
            {
                "published": True,
                "slug": {
                    "$ne": slug
                },
                "category": {
                    "$ne": project["category"]
                },
            },
            {"_id": 0},
        ).sort(
            "order",
            1,
        ).limit(
            3 - len(related)
        ).to_list(
            3 - len(related)
        )

        related.extend(
            more
        )

    return {
        **project,
        "related": related,
    }


# =========================================================
# PUBLIC CONTACT MESSAGE
# =========================================================

@api.post("/messages")
async def create_message(
    data: MessageIn,
):

    database = require_db()

    doc = data.model_dump()

    doc.update(
        {
            "id": uuid.uuid4().hex,
            "status": "unread",
            "created_at": utc_now(),
        }
    )

    await database.messages.insert_one(
        doc
    )

    try:

        send_message_notification(
            data
        )

    except Exception as exc:

        logger.exception(
            "Message tersimpan tetapi "
            "email notification gagal: %s",
            exc,
        )

    return {
        "ok": True
    }


# =========================================================
# ADMIN PROJECT LIST
# =========================================================

@api.get("/admin/projects")
async def admin_list_projects(
    admin=Depends(get_admin),
):

    database = require_db()

    return await database.projects.find(
        {},
        {"_id": 0},
    ).sort(
        [
            ("order", 1),
            ("created_at", -1),
        ]
    ).to_list(200)


# =========================================================
# ADMIN PROJECT DETAIL
# =========================================================

@api.get("/admin/projects/{pid}")
async def admin_get_project(
    pid: str,
    admin=Depends(get_admin),
):

    database = require_db()

    project = await database.projects.find_one(
        {"id": pid},
        {"_id": 0},
    )

    if not project:

        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return project


# =========================================================
# ADMIN CREATE PROJECT
# =========================================================

@api.post("/admin/projects")
async def admin_create_project(
    data: ProjectIn,
    admin=Depends(get_admin),
):

    database = require_db()

    doc = data.model_dump()

    base = slugify(
        doc.get("slug")
        or doc["title"]
    )

    slug = base

    number = 1

    while await database.projects.find_one(
        {"slug": slug}
    ):

        number += 1

        slug = (
            f"{base}-{number}"
        )

    doc["slug"] = slug

    doc["id"] = uuid.uuid4().hex

    doc["created_at"] = utc_now()

    await database.projects.insert_one(
        doc
    )

    doc.pop(
        "_id",
        None,
    )

    return doc


# =========================================================
# ADMIN UPDATE PROJECT
# =========================================================

@api.put("/admin/projects/{pid}")
async def admin_update_project(
    pid: str,
    data: ProjectIn,
    admin=Depends(get_admin),
):

    database = require_db()

    existing = await database.projects.find_one(
        {"id": pid}
    )

    if not existing:

        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    doc = data.model_dump()

    base = slugify(
        doc.get("slug")
        or doc["title"]
    )

    slug = base

    number = 1

    while await database.projects.find_one(
        {
            "slug": slug,
            "id": {
                "$ne": pid
            },
        }
    ):

        number += 1

        slug = (
            f"{base}-{number}"
        )

    doc["slug"] = slug

    await database.projects.update_one(
        {"id": pid},
        {"$set": doc},
    )

    return await database.projects.find_one(
        {"id": pid},
        {"_id": 0},
    )


# =========================================================
# ADMIN DELETE PROJECT
# =========================================================

@api.delete("/admin/projects/{pid}")
async def admin_delete_project(
    pid: str,
    admin=Depends(get_admin),
):

    database = require_db()

    result = await database.projects.delete_one(
        {"id": pid}
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return {
        "ok": True
    }


# =========================================================
# ADMIN CREATE CATEGORY
# =========================================================

@api.post("/admin/categories")
async def admin_create_category(
    data: CategoryIn,
    admin=Depends(get_admin),
):

    database = require_db()

    name = data.name.strip()

    if not name:

        raise HTTPException(
            status_code=400,
            detail="Category name is required",
        )

    slug = slugify(name)

    exists = await database.categories.find_one(
        {"slug": slug}
    )

    if exists:

        raise HTTPException(
            status_code=400,
            detail="Category already exists",
        )

    doc = {
        "id": uuid.uuid4().hex,
        "name": name,
        "slug": slug,
        "created_at": utc_now(),
    }

    await database.categories.insert_one(
        doc
    )

    doc.pop(
        "_id",
        None,
    )

    return doc


# =========================================================
# ADMIN DELETE CATEGORY
# =========================================================

@api.delete("/admin/categories/{cid}")
async def admin_delete_category(
    cid: str,
    admin=Depends(get_admin),
):

    database = require_db()

    result = await database.categories.delete_one(
        {"id": cid}
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    return {
        "ok": True
    }


# =========================================================
# ADMIN MESSAGES
# =========================================================

@api.get("/admin/messages")
async def admin_list_messages(
    admin=Depends(get_admin),
):

    database = require_db()

    return await database.messages.find(
        {},
        {"_id": 0},
    ).sort(
        "created_at",
        -1,
    ).to_list(300)


# =========================================================
# ADMIN MESSAGE STATUS
# =========================================================

@api.patch("/admin/messages/{mid}")
async def admin_update_message(
    mid: str,
    data: MessageStatusIn,
    admin=Depends(get_admin),
):

    database = require_db()

    allowed = {
        "unread",
        "read",
        "archived",
    }

    if data.status not in allowed:

        raise HTTPException(
            status_code=400,
            detail="Invalid status",
        )

    result = await database.messages.update_one(
        {"id": mid},
        {
            "$set": {
                "status": data.status
            }
        },
    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Message not found",
        )

    return {
        "ok": True
    }


# =========================================================
# ADMIN DELETE MESSAGE
# =========================================================

@api.delete("/admin/messages/{mid}")
async def admin_delete_message(
    mid: str,
    admin=Depends(get_admin),
):

    database = require_db()

    result = await database.messages.delete_one(
        {"id": mid}
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Message not found",
        )

    return {
        "ok": True
    }


# =========================================================
# ADMIN SETTINGS
# =========================================================

@api.put("/admin/settings")
async def admin_update_settings(
    data: SettingsIn,
    admin=Depends(get_admin),
):

    database = require_db()

    doc = data.model_dump()

    doc["id"] = "site"

    doc["updated_at"] = utc_now()

    await database.site_settings.update_one(
        {"id": "site"},
        {"$set": doc},
        upsert=True,
    )

    return await database.site_settings.find_one(
        {"id": "site"},
        {"_id": 0},
    )


# =========================================================
# ADMIN STATS
# =========================================================

@api.get("/admin/stats")
async def admin_stats(
    admin=Depends(get_admin),
):

    database = require_db()

    total = await database.projects.count_documents({})

    published = await database.projects.count_documents(
        {"published": True}
    )

    featured = await database.projects.count_documents(
        {"featured": True}
    )

    unread = await database.messages.count_documents(
        {"status": "unread"}
    )

    return {
        "projects": total,
        "published": published,
        "featured": featured,
        "unread_messages": unread,
    }


# =========================================================
# UPLOAD CONFIGURATION
# =========================================================

ALLOWED_EXT = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".avif",
}

MAX_UPLOAD_SIZE = 15 * 1024 * 1024


# =========================================================
# IMAGE PROCESSING
# =========================================================

def process_image(
    raw: bytes,
) -> bytes:

    image = Image.open(
        io.BytesIO(raw)
    )

    image.load()

    if image.mode in (
        "RGBA",
        "LA",
        "P",
    ):

        background = Image.new(
            "RGB",
            image.size,
            "white",
        )

        if image.mode != "RGBA":

            image = image.convert(
                "RGBA"
            )

        background.paste(
            image,
            mask=image.getchannel(
                "A"
            ),
        )

        image = background

    else:

        image = image.convert(
            "RGB"
        )

    image.thumbnail(
        (
            1920,
            1920,
        ),
        Image.Resampling.LANCZOS,
    )

    output = io.BytesIO()

    image.save(
        output,
        "WEBP",
        quality=84,
        method=6,
    )

    return output.getvalue()


# =========================================================
# VERCEL BLOB
# =========================================================

def upload_to_vercel_blob(
    data: bytes,
    filename: str,
) -> str:

    if not BLOB_READ_WRITE_TOKEN:

        raise RuntimeError(
            "BLOB_READ_WRITE_TOKEN belum dikonfigurasi."
        )

    pathname = (
        f"jeghout/{filename}"
    )

    url = (
        "https://blob.vercel-storage.com/"
        + pathname
    )

    headers = {
        "Authorization": (
            f"Bearer {BLOB_READ_WRITE_TOKEN}"
        ),
        "x-api-version": "7",
        "x-content-type": "image/webp",
        "x-add-random-suffix": "1",
    }

    response = requests.put(
        url,
        data=data,
        headers=headers,
        timeout=30,
    )

    if response.status_code not in (
        200,
        201,
    ):

        logger.error(
            "Vercel Blob upload failed: "
            f"{response.status_code} "
            f"{response.text[:500]}"
        )

        raise RuntimeError(
            "Vercel Blob upload gagal."
        )

    try:

        result = response.json()

    except Exception:

        raise RuntimeError(
            "Response Vercel Blob tidak valid."
        )

    blob_url = result.get(
        "url"
    )

    if not blob_url:

        raise RuntimeError(
            "URL Vercel Blob tidak ditemukan."
        )

    return blob_url


# =========================================================
# LOCAL FALLBACK
# =========================================================

def save_local_upload(
    data: bytes,
    filename: str,
) -> str:

    destination = (
        UPLOAD_DIR / filename
    )

    destination.write_bytes(
        data
    )

    return (
        f"/api/uploads/{filename}"
    )


# =========================================================
# ADMIN UPLOAD
# =========================================================

@api.post("/admin/upload")
async def admin_upload(
    files: List[UploadFile] = File(...),
    admin=Depends(get_admin),
):

    urls = []

    for uploaded_file in files:

        filename = (
            uploaded_file.filename
            or "image.jpg"
        )

        extension = Path(
            filename
        ).suffix.lower()

        if extension not in ALLOWED_EXT:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Unsupported file type: "
                    f"{extension}"
                ),
            )

        raw = await uploaded_file.read()

        if not raw:

            raise HTTPException(
                status_code=400,
                detail="Empty file",
            )

        if len(raw) > MAX_UPLOAD_SIZE:

            raise HTTPException(
                status_code=413,
                detail=(
                    "File terlalu besar. "
                    "Maksimal 15MB."
                ),
            )

        try:

            webp_data = process_image(
                raw
            )

        except Exception as exc:

            logger.error(
                "Image processing failed: %s",
                exc,
            )

            raise HTTPException(
                status_code=400,
                detail="Invalid image file",
            )

        name = (
            f"{uuid.uuid4().hex}.webp"
        )

        if BLOB_READ_WRITE_TOKEN:

            try:

                blob_url = (
                    upload_to_vercel_blob(
                        webp_data,
                        name,
                    )
                )

                urls.append(
                    blob_url
                )

                continue

            except Exception as exc:

                logger.exception(
                    "Vercel Blob upload failed: %s",
                    exc,
                )

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Upload ke Vercel Blob gagal."
                    ),
                )

        local_url = save_local_upload(
            webp_data,
            name,
        )

        urls.append(
            local_url
        )

    return {
        "urls": urls
    }


# =========================================================
# INCLUDE ROUTER
# =========================================================

app.include_router(
    api
)


# =========================================================
# STATIC LOCAL UPLOADS
# =========================================================

app.mount(
    "/api/uploads",
    StaticFiles(
        directory=str(
            UPLOAD_DIR
        )
    ),
    name="uploads",
)


# =========================================================
# CORS
# =========================================================

cors_origins = [
    origin.strip()
    for origin in CORS_ORIGINS_RAW.split(",")
    if origin.strip()
]

if not cors_origins:
    cors_origins = ["*"]

if "*" in cors_origins:

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

else:

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# =========================================================
# STARTUP
# =========================================================

@app.on_event("startup")
async def startup():

    logger.info(
        "Starting Jeghout Visualworks API..."
    )

    logger.info(
        "Database name: %s",
        DB_NAME,
    )

    logger.info(
        "Vercel Blob: %s",
        (
            "configured"
            if BLOB_READ_WRITE_TOKEN
            else "NOT CONFIGURED"
        ),
    )

    logger.info(
        "Gmail SMTP: %s",
        (
            "configured"
            if SMTP_USERNAME
            and SMTP_PASSWORD
            else "NOT CONFIGURED"
        ),
    )

    if db is None:

        logger.warning(
            "MONGO_URL belum tersedia. "
            "Server tetap berjalan."
        )

        return

    try:

        await db.command(
            "ping"
        )

        logger.info(
            "MongoDB connection successful."
        )

    except Exception as exc:

        logger.error(
            "MongoDB connection failed: %s",
            exc,
        )

        return

    try:

        from .seed import seed_all

        await seed_all(
            db,
            ROOT_DIR,
        )

        logger.info(
            "Database seed completed."
        )

    except Exception as exc:

        logger.exception(
            "Database seed failed: %s",
            exc,
        )


# =========================================================
# SHUTDOWN
# =========================================================

@app.on_event("shutdown")
async def shutdown_db_client():

    global client

    if client is not None:

        client.close()

        logger.info(
            "MongoDB connection closed."
        )
