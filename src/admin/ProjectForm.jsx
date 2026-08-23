import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  ExternalLink,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { api, imgUrl, formatApiError } from "@/lib/api";


// =========================================================
// TOOLS
// =========================================================

const ALL_TOOLS = [
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Adobe Premiere Pro",
  "Adobe After Effects",
  "Adobe Lightroom",
  "CorelDraw",
  "CapCut",
];


// =========================================================
// INPUT STYLE
// =========================================================

const inp =
  "w-full bg-[#08080B] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-[#9A9A9F]/50 focus:outline-none focus:border-[#8B35FF] transition-colors";

const lbl =
  "block text-[10px] tracking-[0.25em] uppercase text-[#9A9A9F] mb-2";


// =========================================================
// DEFAULT FORM
// =========================================================

const EMPTY = {
  title: "",
  slug: "",
  category: "graphic-design",
  year: "",
  client: "",
  role: "",
  description: "",
  cover: "",
  gallery: [],
  video_url: "",
  tools: [],
  featured: false,
  published: true,
  order: 0,
  seo_title: "",
  seo_description: "",
};


// =========================================================
// VIDEO EMBED URL
// =========================================================

function getVideoEmbedUrl(url) {
  if (!url) return null;

  const value = url.trim();

  try {
    const parsed = new URL(value);

    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;


    // =====================================================
    // YOUTUBE
    // =====================================================

    if (hostname.includes("youtube.com")) {

      // YouTube normal
      // https://www.youtube.com/watch?v=VIDEO_ID

      if (pathname === "/watch") {

        const videoId = parsed.searchParams.get("v");

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }


      // YouTube Live
      // https://www.youtube.com/live/VIDEO_ID

      if (pathname.startsWith("/live/")) {

        const videoId = pathname
          .replace("/live/", "")
          .split("/")[0];

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }


      // YouTube Shorts
      // https://www.youtube.com/shorts/VIDEO_ID

      if (pathname.startsWith("/shorts/")) {

        const videoId = pathname
          .replace("/shorts/", "")
          .split("/")[0];

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }


      // Already embed URL
      // https://www.youtube.com/embed/VIDEO_ID

      if (pathname.startsWith("/embed/")) {
        return value;
      }
    }


    // =====================================================
    // YOUTUBE SHORT URL
    // =====================================================

    // https://youtu.be/VIDEO_ID

    if (hostname === "youtu.be") {

      const videoId = pathname
        .replace("/", "")
        .split("/")[0];

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }


    // =====================================================
    // VIMEO
    // =====================================================

    if (hostname.includes("vimeo.com")) {

      const parts = pathname
        .split("/")
        .filter(Boolean);

      const videoId = parts[parts.length - 1];

      if (
        videoId &&
        /^\d+$/.test(videoId)
      ) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }


    // =====================================================
    // GOOGLE DRIVE
    // =====================================================

    // Example:
    // https://drive.google.com/file/d/FILE_ID/view

    if (hostname.includes("drive.google.com")) {

      const match = value.match(
        /\/file\/d\/([^/]+)/
      );

      if (match?.[1]) {

        const fileId = match[1];

        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }

  } catch (error) {

    console.error(
      "Invalid video URL:",
      error
    );

  }

  return null;
}


// =========================================================
// DROPZONE
// =========================================================

function Dropzone({
  onFiles,
  label,
  multiple = true,
  tid,
}) {

  const ref = useRef(null);

  const [drag, setDrag] = useState(false);

  const [busy, setBusy] = useState(false);


  const handle = async (files) => {

    if (!files?.length) return;

    setBusy(true);


    const fd = new FormData();

    [...files].forEach((file) => {
      fd.append("files", file);
    });


    try {

      const { data } = await api.post(
        "/admin/upload",
        fd
      );

      onFiles(data.urls);

    } catch (error) {

      toast.error(
        formatApiError(error)
      );

    } finally {

      setBusy(false);

    }
  };


  return (

    <div
      data-testid={tid}
      onClick={() =>
        ref.current?.click()
      }
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() =>
        setDrag(false)
      }
      onDrop={(e) => {

        e.preventDefault();

        setDrag(false);

        handle(
          e.dataTransfer.files
        );

      }}
      className={`cursor-pointer border border-dashed px-6 py-10 text-center transition-colors ${
        drag
          ? "border-[#8B35FF] bg-[#6C19D9]/10"
          : "border-white/15 hover:border-white/30 bg-[#08080B]"
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {

        if (e.key === "Enter") {
          ref.current?.click();
        }

      }}
    >

      <Upload
        size={20}
        className="mx-auto text-[#A970FF] mb-3"
      />


      <p className="text-sm text-[#C8C8CC]">
        {busy
          ? "Uploading..."
          : label}
      </p>


      <p className="text-xs text-[#9A9A9F] mt-1">
        Drag & drop or click — auto-optimized to WebP
      </p>


      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {

          handle(e.target.files);

          e.target.value = "";

        }}
      />

    </div>

  );
}


// =========================================================
// PROJECT FORM
// =========================================================

export default function ProjectForm() {

  const { id } = useParams();

  const navigate = useNavigate();

  const isNew = !id;


  const [form, setForm] =
    useState(EMPTY);


  const [cats, setCats] =
    useState([]);


  const [loading, setLoading] =
    useState(!isNew);


  const [saving, setSaving] =
    useState(false);


  // =======================================================
  // LOAD DATA
  // =======================================================

  useEffect(() => {

    api
      .get("/categories")
      .then((response) => {

        setCats(response.data);

      })
      .catch(() => {});


    if (!isNew) {

      api
        .get(`/admin/projects/${id}`)
        .then((response) => {

          setForm({
            ...EMPTY,
            ...response.data,
          });

        })
        .catch((error) => {

          toast.error(
            formatApiError(error)
          );

        })
        .finally(() => {

          setLoading(false);

        });

    }

  }, [id, isNew]);


  // =======================================================
  // SET FORM VALUE
  // =======================================================

  const set = (key, value) => {

    setForm((current) => ({
      ...current,
      [key]: value,
    }));

  };


  // =======================================================
  // TOGGLE TOOL
  // =======================================================

  const toggleTool = (tool) => {

    set(
      "tools",
      form.tools.includes(tool)
        ? form.tools.filter(
            (item) => item !== tool
          )
        : [
            ...form.tools,
            tool,
          ]
    );

  };


  // =======================================================
  // MOVE GALLERY
  // =======================================================

  const moveImg = (
    index,
    direction
  ) => {

    const gallery = [
      ...form.gallery,
    ];

    const newIndex =
      index + direction;


    if (
      newIndex < 0 ||
      newIndex >= gallery.length
    ) {
      return;
    }


    [
      gallery[index],
      gallery[newIndex],
    ] = [
      gallery[newIndex],
      gallery[index],
    ];


    set(
      "gallery",
      gallery
    );

  };


  // =======================================================
  // SAVE
  // =======================================================

  const save = async (e) => {

    e.preventDefault();


    if (!form.cover) {

      toast.error(
        "Please upload a cover image"
      );

      return;
    }


    setSaving(true);


    try {

      if (isNew) {

        const {
          data,
        } = await api.post(
          "/admin/projects",
          form
        );


        toast.success(
          "Project created"
        );


        navigate(
          `/admin/projects/${data.id}`
        );

      } else {

        await api.put(
          `/admin/projects/${id}`,
          form
        );


        toast.success(
          "Project saved"
        );


        navigate(
          "/admin/projects"
        );

      }

    } catch (error) {

      toast.error(
        formatApiError(error)
      );

    } finally {

      setSaving(false);

    }

  };


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (

      <div
        className="h-64 bg-[#111116] animate-pulse"
        data-testid="project-form-loading"
      />

    );

  }


  // =======================================================
  // VIDEO PREVIEW
  // =======================================================

  const videoPreview =
    getVideoEmbedUrl(
      form.video_url
    );


  // =======================================================
  // RETURN
  // =======================================================

  return (

    <div data-testid="project-form">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">

        <div className="flex items-center gap-4">

          <Link
            to="/admin/projects"
            className="p-2 text-[#9A9A9F] hover:text-white transition-colors"
            aria-label="Back to projects"
          >

            <ArrowLeft size={18} />

          </Link>


          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">

            {isNew
              ? "Add New Project"
              : "Edit Project"}

          </h1>

        </div>


        {!isNew &&
          form.published && (

            <a
              href={`/work/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              data-testid="preview-project"
              className="inline-flex items-center gap-2 text-sm text-[#A970FF] hover:text-white border border-white/15 px-4 py-2 transition-colors"
            >

              <ExternalLink
                size={14}
              />

              Preview

            </a>

          )}

      </div>


      {/* ===================================================
          FORM
      =================================================== */}

      <form
        onSubmit={save}
        className="grid grid-cols-1 xl:grid-cols-3 gap-8"
      >


        {/* =================================================
            MAIN COLUMN
        ================================================= */}

        <div className="xl:col-span-2 space-y-6">


          {/* =================================================
              PROJECT INFORMATION
          ================================================= */}

          <div className="bg-[#111116] border border-white/10 p-6 space-y-5">


            {/* TITLE */}

            <div>

              <label
                className={lbl}
                htmlFor="p-title"
              >
                Project Title *
              </label>


              <input
                id="p-title"
                data-testid="project-title-input"
                required
                className={inp}
                value={form.title}
                onChange={(e) =>
                  set(
                    "title",
                    e.target.value
                  )
                }
                placeholder="e.g. Senja Coffee — Brand Identity"
              />

            </div>


            {/* SLUG + CATEGORY */}

            <div className="grid grid-cols-2 gap-5">


              {/* SLUG */}

              <div>

                <label
                  className={lbl}
                  htmlFor="p-slug"
                >
                  Slug
                </label>


                <input
                  id="p-slug"
                  data-testid="project-slug-input"
                  className={inp}
                  value={form.slug}
                  onChange={(e) =>
                    set(
                      "slug",
                      e.target.value
                    )
                  }
                  placeholder="auto-generated from title"
                />

              </div>


              {/* CATEGORY */}

              <div>

                <label
                  className={lbl}
                  htmlFor="p-cat"
                >
                  Category
                </label>


                <select
                  id="p-cat"
                  data-testid="project-category-select"
                  className={`${inp} jw-select`}
                  value={form.category}
                  onChange={(e) =>
                    set(
                      "category",
                      e.target.value
                    )
                  }
                >

                  {cats.map((category) => (

                    <option
                      key={category.slug}
                      value={category.slug}
                    >
                      {category.name}
                    </option>

                  ))}


                  {/* LIVE STREAMING */}

                  {!cats.some(
                    (category) =>
                      category.slug ===
                      "live-streaming"
                  ) && (

                    <option value="live-streaming">
                      Live Streaming
                    </option>

                  )}

                </select>

              </div>


              {/* YEAR */}

              <div>

                <label
                  className={lbl}
                  htmlFor="p-year"
                >
                  Year
                </label>


                <input
                  id="p-year"
                  data-testid="project-year-input"
                  className={inp}
                  value={form.year}
                  onChange={(e) =>
                    set(
                      "year",
                      e.target.value
                    )
                  }
                  placeholder="2026"
                />

              </div>


              {/* CLIENT */}

              <div>

                <label
                  className={lbl}
                  htmlFor="p-client"
                >
                  Client
                </label>


                <input
                  id="p-client"
                  data-testid="project-client-input"
                  className={inp}
                  value={form.client}
                  onChange={(e) =>
                    set(
                      "client",
                      e.target.value
                    )
                  }
                  placeholder="Client name"
                />

              </div>

            </div>


            {/* ROLE */}

            <div>

              <label
                className={lbl}
                htmlFor="p-role"
              >
                My Role
              </label>


              <input
                id="p-role"
                className={inp}
                value={form.role}
                onChange={(e) =>
                  set(
                    "role",
                    e.target.value
                  )
                }
                placeholder="e.g. Videographer & Photographer"
              />

            </div>


            {/* DESCRIPTION */}

            <div>

              <label
                className={lbl}
                htmlFor="p-desc"
              >
                Description
              </label>


              <textarea
                id="p-desc"
                data-testid="project-description-input"
                rows={5}
                className={`${inp} resize-none`}
                value={form.description}
                onChange={(e) =>
                  set(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Project overview, creative direction..."
              />

            </div>


            {/* =================================================
                VIDEO URL
            ================================================= */}

            <div>

              <label
                className={lbl}
                htmlFor="p-video"
              >
                Video URL
              </label>


              <input
                id="p-video"
                data-testid="project-video-input"
                type="url"
                className={inp}
                value={
                  form.video_url || ""
                }
                onChange={(e) =>
                  set(
                    "video_url",
                    e.target.value
                  )
                }
                placeholder="YouTube, YouTube Live, Vimeo, atau Google Drive"
              />


              {/* HELP */}

              <div className="mt-3 text-[11px] text-[#9A9A9F] leading-relaxed">

                <p className="mb-1">
                  Supported video links:
                </p>

                <p>
                  YouTube:
                  {" "}
                  https://www.youtube.com/watch?v=...
                </p>

                <p>
                  YouTube Live:
                  {" "}
                  https://www.youtube.com/live/...
                </p>

                <p>
                  YouTube Shorts:
                  {" "}
                  https://www.youtube.com/shorts/...
                </p>

                <p>
                  Vimeo:
                  {" "}
                  https://vimeo.com/...
                </p>

                <p>
                  Google Drive:
                  {" "}
                  https://drive.google.com/file/d/.../view
                </p>

              </div>


              {/* =================================================
                  VIDEO PREVIEW
              ================================================= */}

              {videoPreview && (

                <div className="mt-5">


                  <div className="flex items-center gap-2 mb-3">

                    <Play
                      size={14}
                      className="text-[#A970FF]"
                    />

                    <span className="text-[10px] tracking-[0.25em] uppercase text-[#9A9A9F]">
                      Video Preview
                    </span>

                  </div>


                  <div className="aspect-video w-full bg-[#08080B] border border-white/10 overflow-hidden">

                    <iframe
                      src={videoPreview}
                      title="Video Preview"
                      className="w-full h-full"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                    />

                  </div>

                </div>

              )}

            </div>


            {/* =================================================
                TOOLS
            ================================================= */}

            <div>

              <span className={lbl}>
                Tools Used
              </span>


              <div className="flex flex-wrap gap-x-5 gap-y-3 pt-1">

                {ALL_TOOLS.map(
                  (tool) => (

                    <label
                      key={tool}
                      className="flex items-center gap-2.5 text-sm text-[#C8C8CC] cursor-pointer"
                    >

                      <input
                        type="checkbox"
                        className="jw-check"
                        checked={form.tools.includes(
                          tool
                        )}
                        onChange={() =>
                          toggleTool(
                            tool
                          )
                        }
                        data-testid={`tool-${tool
                          .replace(
                            /\s/g,
                            "-"
                          )
                          .toLowerCase()}`}
                      />


                      {tool}

                    </label>

                  )
                )}

              </div>

            </div>

          </div>


          {/* =================================================
              GALLERY
          ================================================= */}

          <div className="bg-[#111116] border border-white/10 p-6">

            <span className={lbl}>
              Gallery Images
            </span>


            <Dropzone
              tid="gallery-dropzone"
              label="Upload gallery images"
              onFiles={(urls) =>
                set(
                  "gallery",
                  [
                    ...form.gallery,
                    ...urls,
                  ]
                )
              }
            />


            {form.gallery.length >
              0 && (

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">

                {form.gallery.map(
                  (image, index) => (

                    <div
                      key={`${image}-${index}`}
                      className="group relative bg-[#08080B] border border-white/10"
                      data-testid={`gallery-item-${index}`}
                    >

                      <img
                        src={imgUrl(image)}
                        alt={`Gallery ${
                          index + 1
                        }`}
                        className="w-full aspect-[4/3] object-cover"
                      />


                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">


                        {/* UP */}

                        <button
                          type="button"
                          onClick={() =>
                            moveImg(
                              index,
                              -1
                            )
                          }
                          aria-label="Move image up"
                          className="p-1.5 text-white/70 hover:text-white"
                        >
                          <ArrowUp
                            size={14}
                          />
                        </button>


                        {/* DOWN */}

                        <button
                          type="button"
                          onClick={() =>
                            moveImg(
                              index,
                              1
                            )
                          }
                          aria-label="Move image down"
                          className="p-1.5 text-white/70 hover:text-white"
                        >
                          <ArrowDown
                            size={14}
                          />
                        </button>


                        {/* COVER */}

                        <button
                          type="button"
                          onClick={() =>
                            set(
                              "cover",
                              image
                            )
                          }
                          aria-label="Set as cover"
                          className="p-1.5 text-white/70 hover:text-[#A970FF]"
                        >
                          <Star
                            size={14}
                          />
                        </button>


                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            set(
                              "gallery",
                              form.gallery.filter(
                                (_, x) =>
                                  x !==
                                  index
                              )
                            )
                          }
                          data-testid={`gallery-delete-${index}`}
                          aria-label="Delete image"
                          className="p-1.5 text-white/70 hover:text-red-400"
                        >
                          <Trash2
                            size={14}
                          />
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>


          {/* =================================================
              SEO
          ================================================= */}

          <div className="bg-[#111116] border border-white/10 p-6 space-y-5">

            <h3 className="text-sm font-semibold text-[#C8C8CC]">
              SEO
            </h3>


            <div>

              <label
                className={lbl}
                htmlFor="p-seo-title"
              >
                SEO Title
              </label>


              <input
                id="p-seo-title"
                data-testid="project-seo-title"
                className={inp}
                value={
                  form.seo_title
                }
                onChange={(e) =>
                  set(
                    "seo_title",
                    e.target.value
                  )
                }
              />

            </div>


            <div>

              <label
                className={lbl}
                htmlFor="p-seo-desc"
              >
                Meta Description
              </label>


              <textarea
                id="p-seo-desc"
                rows={2}
                className={`${inp} resize-none`}
                value={
                  form.seo_description
                }
                onChange={(e) =>
                  set(
                    "seo_description",
                    e.target.value
                  )
                }
              />

            </div>

          </div>

        </div>


        {/* ===================================================
            SIDE COLUMN
        =================================================== */}

        <div className="space-y-6">


          {/* =================================================
              COVER
          ================================================= */}

          <div className="bg-[#111116] border border-white/10 p-6">

            <span className={lbl}>
              Cover Image *
            </span>


            {form.cover ? (

              <div
                className="relative group"
                data-testid="cover-preview"
              >

                <img
                  src={imgUrl(form.cover)}
                  alt="Project cover"
                  className="w-full aspect-[4/3] object-cover border border-white/10"
                />


                <button
                  type="button"
                  onClick={() =>
                    set(
                      "cover",
                      ""
                    )
                  }
                  data-testid="cover-remove"
                  className="absolute top-2 right-2 p-2 bg-black/70 text-white/80 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove cover"
                >

                  <Trash2
                    size={14}
                  />

                </button>

              </div>

            ) : (

              <Dropzone
                tid="cover-dropzone"
                label="Upload cover image"
                multiple={false}
                onFiles={(urls) =>
                  set(
                    "cover",
                    urls[0]
                  )
                }
              />

            )}

          </div>


          {/* =================================================
              SETTINGS
          ================================================= */}

          <div className="bg-[#111116] border border-white/10 p-6 space-y-4">


            {/* PUBLISHED */}

            <label className="flex items-center justify-between cursor-pointer">

              <span className="text-sm text-[#C8C8CC]">
                Published
              </span>


              <input
                type="checkbox"
                className="jw-check"
                data-testid="project-published-toggle"
                checked={
                  form.published
                }
                onChange={(e) =>
                  set(
                    "published",
                    e.target.checked
                  )
                }
              />

            </label>


            {/* FEATURED */}

            <label className="flex items-center justify-between cursor-pointer">

              <span className="text-sm text-[#C8C8CC]">
                Featured (Selected Work)
              </span>


              <input
                type="checkbox"
                className="jw-check"
                data-testid="project-featured-toggle"
                checked={
                  form.featured
                }
                onChange={(e) =>
                  set(
                    "featured",
                    e.target.checked
                  )
                }
              />

            </label>


            {/* SORT ORDER */}

            <div>

              <label
                className={lbl}
                htmlFor="p-order"
              >
                Sort Order
              </label>


              <input
                id="p-order"
                type="number"
                className={inp}
                value={
                  form.order
                }
                onChange={(e) =>
                  set(
                    "order",
                    Number(
                      e.target.value
                    )
                  )
                }
              />

            </div>

          </div>


          {/* =================================================
              SAVE BUTTON
          ================================================= */}

          <button
            type="submit"
            disabled={saving}
            data-testid="project-save-button"
            className="w-full bg-[#6C19D9] hover:bg-[#8B35FF] disabled:opacity-50 text-white font-medium py-3.5 transition-colors duration-300"
          >

            {saving
              ? "Saving..."
              : isNew
                ? "Publish Project"
                : "Save Changes"}

          </button>

        </div>

      </form>

    </div>

  );
}