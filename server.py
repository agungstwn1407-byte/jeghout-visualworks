from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import re
import io
import uuid
import logging

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

from fastapi.openapi.utils import get_openapi

from starlette.middleware.cors import CORSMiddleware

from motor.motor_asyncio import AsyncIOMotorClient

from pydantic import BaseModel


# ============================================================
# CONFIG
# ============================================================

mongo_url = os.environ["MONGO_URL"]

client = AsyncIOMotorClient(mongo_url)

db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]

JWT_ALGORITHM = "HS256"

UPLOAD_DIR = ROOT_DIR / "uploads"

UPLOAD_DIR.mkdir(exist_ok=True)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="Jeghout Visual Works API",
    version="1.0.0",
)

api = APIRouter(prefix="/api")

security = HTTPBearer(auto_error=False)

logger = logging.getLogger(__name__)


# ============================================================
# AUTH HELPERS
# ============================================================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(
    plain: str,
    hashed: str
) -> bool:

    return bcrypt.checkpw(
        plain.encode("utf-8"),
        hashed.encode("utf-8")
    )


def create_token(
    user_id: str,
    email: str
) -> str:

    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc)
        + timedelta(hours=12),
        "type": "access",
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )


async def get_admin(
    creds: HTTPAuthorizationCredentials = Depends(security)
):

    if not creds:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    try:

        payload = jwt.decode(
            creds.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        if payload.get("type") != "access":
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

    except jwt.ExpiredSignatureError:

        raise HTTPException(
            status_code=401,
            detail="Token expired"
        )

    except jwt.InvalidTokenError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = await db.admin_users.find_one(
        {
            "id": payload["sub"]
        },
        {
            "_id": 0
        }
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    user.pop("password_hash", None)

    return user


# ============================================================
# HELPERS
# ============================================================

def slugify(text: str) -> str:

    s = re.sub(
        r"[^a-z0-9]+",
        "-",
        text.lower()
    ).strip("-")

    return s or uuid.uuid4().hex[:8]


# ============================================================
# MODELS
# ============================================================

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


# ============================================================
# AUTH
# ============================================================

@api.post("/auth/login")
async def login(data: LoginIn):

    email = data.email.lower().strip()

    user = await db.admin_users.find_one(
        {
            "email": email
        }
    )

    if (
        not user
        or not verify_password(
            data.password,
            user["password_hash"]
        )
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_token(
        user["id"],
        email
    )

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": email,
            "name": user.get(
                "name",
                "Admin"
            ),
        },
    }


@api.get("/auth/me")
async def me(
    admin=Depends(get_admin)
):

    return admin


# ============================================================
# PUBLIC
# ============================================================

@api.get("/health")
async def health():

    return {
        "status": "ok"
    }


@api.get("/settings")
async def get_settings():

    settings = await db.site_settings.find_one(
        {
            "id": "site"
        },
        {
            "_id": 0
        }
    )

    return settings or {}


@api.get("/categories")
async def list_categories():

    return await db.categories.find(
        {},
        {
            "_id": 0
        }
    ).sort(
        "name",
        1
    ).to_list(50)


@api.get("/projects")
async def list_projects(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = 60
):

    query = {
        "published": True
    }

    if category and category != "all":

        query["category"] = category

    if featured is not None:

        query["featured"] = featured

    return await db.projects.find(
        query,
        {
            "_id": 0
        }
    ).sort(
        [
            ("order", 1),
            ("created_at", -1)
        ]
    ).to_list(limit)


@api.get("/projects/{slug}")
async def get_project(
    slug: str
):

    project = await db.projects.find_one(
        {
            "slug": slug,
            "published": True
        },
        {
            "_id": 0
        }
    )

    if not project:

        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    related = await db.projects.find(
        {
            "published": True,
            "slug": {
                "$ne": slug
            },
            "category": project["category"]
        },
        {
            "_id": 0
        }
    ).limit(3).to_list(3)

    if len(related) < 3:

        more = await db.projects.find(
            {
                "published": True,
                "slug": {
                    "$ne": slug
                },
                "category": {
                    "$ne": project["category"]
                }
            },
            {
                "_id": 0
            }
        ).limit(
            3 - len(related)
        ).to_list(3)

        related += more

    return {
        **project,
        "related": related
    }


# ============================================================
# PUBLIC MESSAGES
# ============================================================

@api.post("/messages")
async def create_message(
    data: MessageIn
):

    doc = data.model_dump()

    doc.update(
        {
            "id": uuid.uuid4().hex,

            "status": "unread",

            "created_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),
        }
    )

    await db.messages.insert_one(doc)

    doc.pop("_id", None)

    return {
        "ok": True
    }


# ============================================================
# ADMIN PROJECTS
# ============================================================

@api.get("/admin/projects")
async def admin_list_projects(
    admin=Depends(get_admin)
):

    return await db.projects.find(
        {},
        {
            "_id": 0
        }
    ).sort(
        [
            ("order", 1),
            ("created_at", -1)
        ]
    ).to_list(200)


@api.get("/admin/projects/{pid}")
async def admin_get_project(
    pid: str,
    admin=Depends(get_admin)
):

    project = await db.projects.find_one(
        {
            "id": pid
        },
        {
            "_id": 0
        }
    )

    if not project:

        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return project


@api.post("/admin/projects")
async def admin_create_project(
    data: ProjectIn,
    admin=Depends(get_admin)
):

    doc = data.model_dump()

    base = slugify(
        doc.get("slug")
        or doc["title"]
    )

    slug = base

    number = 1

    while await db.projects.find_one(
        {
            "slug": slug
        }
    ):

        number += 1

        slug = f"{base}-{number}"

    doc["slug"] = slug

    doc["id"] = uuid.uuid4().hex

    doc["created_at"] = (
        datetime.now(
            timezone.utc
        ).isoformat()
    )

    await db.projects.insert_one(doc)

    doc.pop("_id", None)

    return doc


@api.put("/admin/projects/{pid}")
async def admin_update_project(
    pid: str,
    data: ProjectIn,
    admin=Depends(get_admin)
):

    existing = await db.projects.find_one(
        {
            "id": pid
        }
    )

    if not existing:

        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    doc = data.model_dump()

    base = slugify(
        doc.get("slug")
        or doc["title"]
    )

    slug = base

    number = 1

    while await db.projects.find_one(
        {
            "slug": slug,
            "id": {
                "$ne": pid
            }
        }
    ):

        number += 1

        slug = f"{base}-{number}"

    doc["slug"] = slug

    await db.projects.update_one(
        {
            "id": pid
        },
        {
            "$set": doc
        }
    )

    return await db.projects.find_one(
        {
            "id": pid
        },
        {
            "_id": 0
        }
    )


@api.delete("/admin/projects/{pid}")
async def admin_delete_project(
    pid: str,
    admin=Depends(get_admin)
):

    result = await db.projects.delete_one(
        {
            "id": pid
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return {
        "ok": True
    }


# ============================================================
# ADMIN CATEGORIES
# ============================================================

@api.post("/admin/categories")
async def admin_create_category(
    data: CategoryIn,
    admin=Depends(get_admin)
):

    slug = slugify(data.name)

    existing = await db.categories.find_one(
        {
            "slug": slug
        }
    )

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )

    doc = {
        "id": uuid.uuid4().hex,
        "name": data.name,
        "slug": slug
    }

    await db.categories.insert_one(doc)

    doc.pop("_id", None)

    return doc


@api.delete("/admin/categories/{cid}")
async def admin_delete_category(
    cid: str,
    admin=Depends(get_admin)
):

    await db.categories.delete_one(
        {
            "id": cid
        }
    )

    return {
        "ok": True
    }


# ============================================================
# ADMIN MESSAGES
# ============================================================

@api.get("/admin/messages")
async def admin_list_messages(
    admin=Depends(get_admin)
):

    return await db.messages.find(
        {},
        {
            "_id": 0
        }
    ).sort(
        "created_at",
        -1
    ).to_list(300)


@api.patch("/admin/messages/{mid}")
async def admin_update_message(
    mid: str,
    data: MessageStatusIn,
    admin=Depends(get_admin)
):

    if data.status not in (
        "unread",
        "read",
        "archived"
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    result = await db.messages.update_one(
        {
            "id": mid
        },
        {
            "$set": {
                "status": data.status
            }
        }
    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )

    return {
        "ok": True
    }


@api.delete("/admin/messages/{mid}")
async def admin_delete_message(
    mid: str,
    admin=Depends(get_admin)
):

    result = await db.messages.delete_one(
        {
            "id": mid
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )

    return {
        "ok": True
    }


# ============================================================
# ADMIN SETTINGS
# ============================================================

@api.put("/admin/settings")
async def admin_update_settings(
    data: SettingsIn,
    admin=Depends(get_admin)
):

    doc = data.model_dump()

    doc["id"] = "site"

    await db.site_settings.update_one(
        {
            "id": "site"
        },
        {
            "$set": doc
        },
        upsert=True
    )

    return await db.site_settings.find_one(
        {
            "id": "site"
        },
        {
            "_id": 0
        }
    )


# ============================================================
# ADMIN STATS
# ============================================================

@api.get("/admin/stats")
async def admin_stats(
    admin=Depends(get_admin)
):

    total = await db.projects.count_documents({})

    published = await db.projects.count_documents(
        {
            "published": True
        }
    )

    featured = await db.projects.count_documents(
        {
            "featured": True
        }
    )

    unread = await db.messages.count_documents(
        {
            "status": "unread"
        }
    )

    return {
        "projects": total,
        "published": published,
        "featured": featured,
        "unread_messages": unread
    }


# ============================================================
# ADMIN UPLOAD
# ============================================================

ALLOWED_EXT = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".avif",
}


@api.post("/admin/upload")
async def admin_upload(
    files: List[UploadFile] = File(...),
    admin=Depends(get_admin)
):

    urls = []

    for file in files:

        extension = Path(
            file.filename or "image.jpg"
        ).suffix.lower()

        if extension not in ALLOWED_EXT:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported file type: "
                    f"{extension}"
                )
            )

        raw = await file.read()

        filename = (
            f"{uuid.uuid4().hex}.webp"
        )

        destination = (
            UPLOAD_DIR / filename
        )

        try:

            image = Image.open(
                io.BytesIO(raw)
            )

            # Handle transparency
            if image.mode in (
                "RGBA",
                "P",
                "LA"
            ):

                image = image.convert("RGB")

            # Resize
            image.thumbnail(
                (1920, 1920)
            )

            # Save as WebP
            image.save(
                destination,
                "WEBP",
                quality=84
            )

        except Exception as error:

            logger.exception(
                "Image processing failed: %s",
                error
            )

            raise HTTPException(
                status_code=400,
                detail="Invalid image file"
            )

        urls.append(
            f"/api/uploads/{filename}"
        )

    return {
        "urls": urls
    }


# ============================================================
# REGISTER ROUTER
# ============================================================

app.include_router(api)


# ============================================================
# STATIC UPLOADS
# ============================================================

app.mount(
    "/api/uploads",
    StaticFiles(
        directory=str(UPLOAD_DIR)
    ),
    name="uploads"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_credentials=True,

    allow_origins=os.environ.get(
        "CORS_ORIGINS",
        "*"
    ).split(","),

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# CUSTOM OPENAPI
#
# Fix Swagger UI "Choose File"
# ============================================================

def custom_openapi():

    if app.openapi_schema:

        return app.openapi_schema

    schema = get_openapi(
        title="Jeghout Visual Works API",
        version="1.0.0",
        description=(
            "Jeghout Visual Works "
            "Portfolio Backend API"
        ),
        routes=app.routes,
    )

    # Use OpenAPI 3.0 for better
    # Swagger UI file-upload compatibility.
    schema["openapi"] = "3.0.3"

    components = (
        schema
        .get("components", {})
        .get("schemas", {})
    )

    for component in components.values():

        properties = component.get(
            "properties",
            {}
        )

        for property_schema in properties.values():

            # ------------------------------------------------
            # Multiple file upload
            # ------------------------------------------------

            if property_schema.get(
                "type"
            ) == "array":

                items = property_schema.get(
                    "items",
                    {}
                )

                if items.get(
                    "contentMediaType"
                ) == "application/octet-stream":

                    items.pop(
                        "contentMediaType",
                        None
                    )

                    items["type"] = "string"

                    items["format"] = "binary"

            # ------------------------------------------------
            # Single file upload
            # ------------------------------------------------

            if (
                property_schema.get(
                    "type"
                ) == "string"
                and property_schema.get(
                    "contentMediaType"
                ) == "application/octet-stream"
            ):

                property_schema.pop(
                    "contentMediaType",
                    None
                )

                property_schema[
                    "format"
                ] = "binary"

    app.openapi_schema = schema

    return app.openapi_schema


app.openapi = custom_openapi


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format=(
        "%(asctime)s - "
        "%(name)s - "
        "%(levelname)s - "
        "%(message)s"
    )
)


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
async def startup():

    from seed import seed_all

    await seed_all(
        db,
        ROOT_DIR
    )


# ============================================================
# SHUTDOWN
# ============================================================

@app.on_event("shutdown")
async def shutdown_db_client():

    client.close()