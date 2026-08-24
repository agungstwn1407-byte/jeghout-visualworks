import os
import asyncio
from pathlib import Path
from datetime import datetime, timezone

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from vercel_blob import put


# ============================================================
# JEGHOUT VISUALWORKS
# MIGRASI LOCAL UPLOADS -> VERCEL BLOB
# ============================================================


# ============================================================
# CONFIG
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)


MONGO_URL = os.getenv("MONGO_URL")
BLOB_READ_WRITE_TOKEN = os.getenv("BLOB_READ_WRITE_TOKEN")
DB_NAME = os.getenv("DB_NAME", "jeghout")


UPLOAD_DIR = Path(
    os.getenv(
        "UPLOAD_DIR",
        str(BASE_DIR / "uploads")
    )
).resolve()


# ============================================================
# VALIDATION
# ============================================================

if not MONGO_URL:
    raise RuntimeError(
        f"MONGO_URL belum tersedia di:\n{ENV_FILE}"
    )

if not BLOB_READ_WRITE_TOKEN:
    raise RuntimeError(
        f"BLOB_READ_WRITE_TOKEN belum tersedia di:\n{ENV_FILE}"
    )


# ============================================================
# DATABASE
# ============================================================

client = AsyncIOMotorClient(MONGO_URL)

db = client[DB_NAME]

projects = db.projects


# ============================================================
# HELPER
# ============================================================

def is_blob_url(value):
    """
    Mengecek apakah URL sudah merupakan Vercel Blob.
    """

    if not isinstance(value, str):
        return False

    return (
        value.startswith("https://")
        and (
            ".public.blob.vercel-storage.com"
            in value
            or ".blob.vercel-storage.com"
            in value
        )
    )


def is_local_upload(value):
    """
    Mengecek URL local upload.
    """

    if not isinstance(value, str):
        return False

    return value.startswith("/api/uploads/")


def local_path_from_url(url):
    """
    Mengubah:

        /api/uploads/example.webp

    menjadi:

        backend/uploads/example.webp
    """

    filename = url.replace(
        "/api/uploads/",
        "",
        1
    )

    # Security:
    # hanya ambil nama file
    filename = Path(filename).name

    return UPLOAD_DIR / filename


def format_size(size):
    """
    Format ukuran file.
    """

    if size < 1024:
        return f"{size} B"

    if size < 1024 * 1024:
        return f"{size / 1024:.1f} KB"

    return f"{size / (1024 * 1024):.2f} MB"


# ============================================================
# UPLOAD FILE
# ============================================================

async def upload_file(local_path):
    """
    Upload file lokal ke Vercel Blob.

    PENTING:
    Store Vercel Blob harus PUBLIC.

    Jika store masih PRIVATE,
    Vercel akan mengembalikan:

    Cannot use public access on a private store.
    """

    # --------------------------------------------------------
    # CHECK FILE
    # --------------------------------------------------------

    if not local_path.exists():

        raise FileNotFoundError(
            f"File tidak ditemukan:\n{local_path}"
        )

    if not local_path.is_file():

        raise FileNotFoundError(
            f"Bukan file:\n{local_path}"
        )


    # --------------------------------------------------------
    # FILE INFO
    # --------------------------------------------------------

    file_size = local_path.stat().st_size

    print(
        f"        Ukuran : {format_size(file_size)}"
    )


    # --------------------------------------------------------
    # READ FILE
    # --------------------------------------------------------

    data = local_path.read_bytes()


    # --------------------------------------------------------
    # BLOB PATH
    # --------------------------------------------------------

    blob_path = (
        f"projects/{local_path.name}"
    )


    # --------------------------------------------------------
    # UPLOAD
    # --------------------------------------------------------

    try:

        result = put(
            blob_path,
            data,
            {
                "access": "public",
                "token": BLOB_READ_WRITE_TOKEN,
                "addRandomSuffix": True,
            }
        )

    except Exception as error:

        error_text = str(error)

        # ----------------------------------------------------
        # PRIVATE STORE ERROR
        # ----------------------------------------------------

        if (
            "Cannot use public access on a private store"
            in error_text
        ):

            raise RuntimeError(
                "\n\n"
                "VERCEL BLOB STORE MASIH PRIVATE.\n"
                "\n"
                "Kode migrasi meminta access='public', "
                "tetapi store Vercel Blob kamu "
                "dikonfigurasi PRIVATE.\n"
                "\n"
                "Solusi:\n"
                "1. Buka Vercel Dashboard.\n"
                "2. Buka Storage.\n"
                "3. Pilih Blob Store yang digunakan.\n"
                "4. Pastikan store mendukung PUBLIC access.\n"
                "5. Gunakan BLOB_READ_WRITE_TOKEN "
                "dari store tersebut.\n"
                "\n"
                "Jangan mengubah MongoDB terlebih dahulu.\n"
                "File lokal tetap aman.\n"
            ) from error

        raise


    # --------------------------------------------------------
    # GET URL
    # --------------------------------------------------------

    if isinstance(result, dict):

        blob_url = result.get("url")

    else:

        blob_url = getattr(
            result,
            "url",
            None
        )


    # --------------------------------------------------------
    # VALIDATE URL
    # --------------------------------------------------------

    if not blob_url:

        raise RuntimeError(
            "Vercel Blob tidak mengembalikan URL "
            f"untuk:\n{local_path.name}"
        )


    return blob_url


# ============================================================
# MIGRATE COVER
# ============================================================

async def migrate_cover(project):

    cover = project.get("cover")

    # Tidak ada cover
    if not cover:

        print(
            "[COVER] SKIP - kosong"
        )

        return False, cover


    # Sudah Blob
    if is_blob_url(cover):

        print(
            "[COVER] SKIP - sudah Vercel Blob"
        )

        return False, cover


    # Bukan local upload
    if not is_local_upload(cover):

        print(
            "[COVER] SKIP - bukan /api/uploads/"
        )

        print(
            f"        {cover}"
        )

        return False, cover


    # Local path
    local_path = local_path_from_url(cover)

    print()
    print(
        f"[COVER] {cover}"
    )

    print(
        f"        -> {local_path}"
    )


    try:

        blob_url = await upload_file(
            local_path
        )

        print(
            f"[OK]    {blob_url}"
        )


        # ----------------------------------------------------
        # UPDATE DATABASE
        # ----------------------------------------------------

        await projects.update_one(
            {
                "_id": project["_id"]
            },
            {
                "$set": {
                    "cover": blob_url,
                    "updated_at": datetime.now(
                        timezone.utc
                    )
                }
            }
        )


        return True, blob_url


    except Exception as error:

        print(
            f"[ERROR] Cover gagal:"
        )

        print(
            f"        {error}"
        )

        # JANGAN ubah database
        return False, cover


# ============================================================
# MIGRATE GALLERY
# ============================================================

async def migrate_gallery(project):

    gallery = project.get(
        "gallery"
    ) or []


    if not isinstance(
        gallery,
        list
    ):

        print(
            "[GALLERY] WARN - bukan array"
        )

        return False


    if not gallery:

        print(
            "[GALLERY] SKIP - kosong"
        )

        return False


    new_gallery = []

    changed = False


    # --------------------------------------------------------
    # LOOP GALLERY
    # --------------------------------------------------------

    for index, item in enumerate(
        gallery,
        start=1
    ):

        # ----------------------------------------------------
        # SUDAH BLOB
        # ----------------------------------------------------

        if is_blob_url(item):

            print(
                f"[GALLERY {index}] "
                "SKIP - sudah Blob"
            )

            new_gallery.append(item)

            continue


        # ----------------------------------------------------
        # BUKAN LOCAL
        # ----------------------------------------------------

        if not is_local_upload(item):

            print(
                f"[GALLERY {index}] "
                "SKIP - bukan /api/uploads/"
            )

            new_gallery.append(item)

            continue


        # ----------------------------------------------------
        # LOCAL FILE
        # ----------------------------------------------------

        local_path = local_path_from_url(
            item
        )


        print()

        print(
            f"[GALLERY {index}] {item}"
        )

        print(
            f"             -> {local_path}"
        )


        try:

            blob_url = await upload_file(
                local_path
            )


            print(
                f"[OK]         {blob_url}"
            )


            new_gallery.append(
                blob_url
            )

            changed = True


        except Exception as error:

            print(
                f"[ERROR]      {error}"
            )


            # Upload gagal:
            # URL lama tetap dipertahankan
            new_gallery.append(item)


    # --------------------------------------------------------
    # UPDATE DATABASE
    # --------------------------------------------------------

    if changed:

        await projects.update_one(
            {
                "_id": project["_id"]
            },
            {
                "$set": {
                    "gallery": new_gallery,
                    "updated_at": datetime.now(
                        timezone.utc
                    )
                }
            }
        )


    return changed


# ============================================================
# MIGRATE PROJECT
# ============================================================

async def migrate_project(project):

    project_id = project.get(
        "id",
        "N/A"
    )

    title = project.get(
        "title",
        "Untitled"
    )


    print()
    print("=" * 70)

    print(
        f"PROJECT : {title}"
    )

    print(
        f"ID      : {project_id}"
    )

    print("=" * 70)


    changed = False


    # ========================================================
    # COVER
    # ========================================================

    cover_changed, new_cover = (
        await migrate_cover(project)
    )


    if cover_changed:

        changed = True

        project["cover"] = new_cover


    # ========================================================
    # GALLERY
    # ========================================================

    gallery_changed = (
        await migrate_gallery(project)
    )


    if gallery_changed:

        changed = True


    # ========================================================
    # RESULT
    # ========================================================

    if changed:

        print()
        print(
            "[PROJECT] Database berhasil diperbarui."
        )

    else:

        print()
        print(
            "[PROJECT] Tidak ada perubahan."
        )


    return changed


# ============================================================
# CHECK LOCAL REFERENCES
# ============================================================

async def count_local_references():

    local_cover_count = 0

    local_gallery_count = 0


    cursor = projects.find(
        {},
        {
            "_id": 0,
            "cover": 1,
            "gallery": 1
        }
    )


    async for project in cursor:

        # Cover
        cover = project.get(
            "cover"
        )

        if is_local_upload(cover):

            local_cover_count += 1


        # Gallery
        gallery = project.get(
            "gallery"
        ) or []


        if isinstance(
            gallery,
            list
        ):

            local_gallery_count += sum(
                1
                for item in gallery
                if is_local_upload(item)
            )


    return (
        local_cover_count,
        local_gallery_count
    )


# ============================================================
# MAIN
# ============================================================

async def main():

    print()

    print("=" * 70)

    print(
        "JEGHOUT VISUALWORKS"
    )

    print(
        "MIGRASI LOCAL UPLOADS -> VERCEL BLOB"
    )

    print("=" * 70)

    print()


    print(
        f"Environment : {ENV_FILE}"
    )

    print(
        f"Database    : {DB_NAME}"
    )

    print(
        f"Uploads     : {UPLOAD_DIR}"
    )

    print()


    # ========================================================
    # ENV CHECK
    # ========================================================

    print(
        "MONGO_URL             : "
        f"{'OK' if MONGO_URL else 'MISSING'}"
    )

    print(
        "BLOB_READ_WRITE_TOKEN : "
        f"{'OK' if BLOB_READ_WRITE_TOKEN else 'MISSING'}"
    )

    print()


    # ========================================================
    # UPLOAD DIRECTORY
    # ========================================================

    if not UPLOAD_DIR.exists():

        print(
            "[ERROR] Folder uploads "
            "tidak ditemukan."
        )

        print()

        print(
            f"Lokasi yang dicari:\n{UPLOAD_DIR}"
        )

        client.close()

        return


    print(
        "[OK] Folder uploads ditemukan."
    )

    print()


    # ========================================================
    # DATABASE TEST
    # ========================================================

    try:

        await client.admin.command(
            "ping"
        )

        print(
            "[OK] MongoDB connection berhasil."
        )


    except Exception as error:

        print(
            "[ERROR] MongoDB connection gagal:"
        )

        print(
            error
        )

        client.close()

        return


    print()


    # ========================================================
    # PROJECT COUNT
    # ========================================================

    count = await projects.count_documents(
        {}
    )


    print(
        f"Jumlah project di MongoDB: {count}"
    )

    print()


    # ========================================================
    # LOCAL REFERENCES
    # ========================================================

    (
        local_cover_count,
        local_gallery_count
    ) = await count_local_references()


    print(
        f"Cover local   : {local_cover_count}"
    )

    print(
        f"Gallery local : {local_gallery_count}"
    )

    print()


    total_local = (
        local_cover_count
        + local_gallery_count
    )


    # ========================================================
    # NOTHING TO MIGRATE
    # ========================================================

    if total_local == 0:

        print(
            "[INFO] Tidak ada file lokal "
            "yang perlu dimigrasikan."
        )

        client.close()

        return


    # ========================================================
    # CONFIRM
    # ========================================================

    print("=" * 70)

    print(
        "PERINGATAN"
    )

    print("=" * 70)

    print(
        f"Total reference lokal : {total_local}"
    )

    print()

    print(
        "File akan di-upload ke Vercel Blob."
    )

    print(
        "URL MongoDB akan diperbarui "
        "hanya jika upload berhasil."
    )

    print(
        "File lokal TIDAK akan dihapus."
    )

    print()


    answer = input(
        "Ketik MIGRATE untuk mulai migrasi: "
    ).strip()


    if answer != "MIGRATE":

        print()

        print(
            "Migrasi dibatalkan."
        )

        client.close()

        return


    # ========================================================
    # START MIGRATION
    # ========================================================

    print()

    print(
        "Memulai migrasi..."
    )

    print()


    cursor = projects.find({})


    total = 0

    success = 0

    failed = 0


    # ========================================================
    # PROCESS PROJECTS
    # ========================================================

    async for project in cursor:

        total += 1


        try:

            await migrate_project(
                project
            )

            success += 1


        except Exception as error:

            failed += 1


            print()

            print(
                "[FATAL PROJECT ERROR]"
            )

            print(
                f"Project: "
                f"{project.get('title', 'Untitled')}"
            )

            print(
                f"Error: {error}"
            )


    # ========================================================
    # SUMMARY
    # ========================================================

    print()

    print("=" * 70)

    print(
        "MIGRASI SELESAI"
    )

    print("=" * 70)

    print(
        f"Total project : {total}"
    )

    print(
        f"Berhasil      : {success}"
    )

    print(
        f"Gagal         : {failed}"
    )

    print("=" * 70)

    print()


    # ========================================================
    # CLOSE
    # ========================================================

    client.close()

    print(
        "Koneksi MongoDB ditutup."
    )

    print()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    try:

        asyncio.run(
            main()
        )

    except KeyboardInterrupt:

        print()

        print(
            "Migrasi dihentikan oleh pengguna."
        )

    except Exception as error:

        print()

        print(
            "=" * 70
        )

        print(
            "FATAL ERROR"
        )

        print(
            "=" * 70
        )

        print(
            error
        )

        print(
            "=" * 70
        )