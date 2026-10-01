"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  apiFetch,
  clearAuthTokens,
} from "../../lib/api";

// ============================================================
// TYPES
// ============================================================

type CreatedPost = {
  id: number;
  title: string;
  content: string;
  owner_id: number;
  reading_time: number;
  status: string;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  category_id: number | null;
  tags: unknown[];
};

// ============================================================
// WRITE PAGE
// ============================================================

export default function WritePage() {
  const router = useRouter();

  // ============================================================
  // STATE
  // ============================================================

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [tagIds, setTagIds] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [createdPost, setCreatedPost] =
    useState<CreatedPost | null>(null);

  // ============================================================
  // CREATE POST
  // ============================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setCreatedPost(null);

    // ----------------------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------------------

    if (!title.trim()) {
      setError(
        "Please enter a title."
      );

      return;
    }

    if (!content.trim()) {
      setError(
        "Please enter content."
      );

      return;
    }

    // ----------------------------------------------------------
    // TOKEN CONTROL
    // ----------------------------------------------------------

    const accessToken =
      localStorage.getItem(
        "access_token"
      );

    const refreshToken =
      localStorage.getItem(
        "refresh_token"
      );

    if (
      !accessToken &&
      !refreshToken
    ) {
      router.replace(
        "/login"
      );

      return;
    }

    // ----------------------------------------------------------
    // CATEGORY ID
    // ----------------------------------------------------------

    const parsedCategoryId =
      categoryId.trim()
        ? Number(
            categoryId.trim()
          )
        : 0;

    if (
      Number.isNaN(
        parsedCategoryId
      )
    ) {
      setError(
        "Category ID must be a number."
      );

      return;
    }

    // ----------------------------------------------------------
    // TAG IDS
    //
    // Kullanıcı:
    // 1,2,3
    // yazarsa:
    // [1,2,3]
    // gönderiyoruz.
    // ----------------------------------------------------------

    let parsedTagIds: number[] =
      [];

    if (tagIds.trim()) {
      parsedTagIds =
        tagIds
          .split(",")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean)
          .map((item) =>
            Number(item)
          );

      const hasInvalidTag =
        parsedTagIds.some(
          (item) =>
            Number.isNaN(item)
        );

      if (hasInvalidTag) {
        setError(
          "Tag IDs must contain only numbers separated by commas."
        );

        return;
      }
    }

    // ==========================================================
    // REQUEST
    // ==========================================================

    try {
      setIsSaving(true);

      const response =
        await apiFetch(
          "/posts",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              title:
                title.trim(),

              content:
                content.trim(),

              category_id:
                parsedCategoryId,

              tag_ids:
                parsedTagIds,
            }),
          }
        );

      // ========================================================
      // RESPONSE BODY
      // ========================================================

      let data: unknown = null;

      try {
        data =
          await response.json();
      } catch {
        data = null;
      }

      // ========================================================
      // ERROR
      // ========================================================

      if (!response.ok) {
        console.error(
          "Create post error:",
          data
        );

        if (
          response.status === 401
        ) {
          clearAuthTokens();

          router.replace(
            "/login"
          );

          return;
        }

        if (
          data &&
          typeof data === "object" &&
          "detail" in data
        ) {
          const detail = (
            data as {
              detail?: unknown;
            }
          ).detail;

          if (
            typeof detail ===
            "string"
          ) {
            setError(detail);

            return;
          }

          if (
            Array.isArray(detail)
          ) {
            const validationMessage =
              detail
                .map(
                  (
                    item: {
                      msg?: string;
                    }
                  ) =>
                    item.msg ??
                    "Validation error"
                )
                .join(", ");

            setError(
              validationMessage
            );

            return;
          }
        }

        setError(
          "Could not create the post."
        );

        return;
      }

      // ========================================================
      // SUCCESS
      // ========================================================

      const post =
        data as CreatedPost;

      setCreatedPost(post);

      setSuccess(
        "Post created successfully."
      );

      console.log(
        "Created post:",
        post
      );

      // Formu temizlemek istemiyoruz.
      // Kullanıcı oluşturduğu taslağı
      // görmeye devam edebilsin.
    } catch (error) {
      console.error(
        "Create post connection error:",
        error
      );

      setError(
        "Could not connect to the server."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <main className="min-h-screen bg-[#f5f1e8] text-black">

      {/* ========================================================
          NAVBAR
      ======================================================== */}

      <nav className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f1e8]/95 backdrop-blur-xl">

        <div className="mx-auto flex h-[68px] w-full max-w-[1500px] items-center justify-between px-5 sm:px-8 md:h-[76px] md:px-10 lg:px-14">

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            className="group flex items-center gap-3 text-lg font-semibold tracking-[-0.04em] sm:text-xl md:text-2xl"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#7957ff] transition-transform duration-500 group-hover:scale-[1.7]" />

            MINDSCAPE
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/profile"
              )
            }
            className="text-sm text-black/50 transition-colors hover:text-black"
          >
            Profile
          </button>

        </div>

      </nav>

      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <section className="mx-auto w-full max-w-[1500px] px-5 pb-10 pt-10 sm:px-8 md:px-10 md:pb-14 md:pt-16 lg:px-14">

        <p className="text-xs uppercase tracking-[0.3em] text-black/40">
          Story Editor
        </p>

        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.055em] sm:text-6xl md:text-7xl">
          Write a story.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-black/55">
          Create a new Mindscape story.
          The post will be sent directly
          to your FastAPI backend.
        </p>

      </section>

      {/* ========================================================
          FORM
      ======================================================== */}

      <section className="mx-auto w-full max-w-[1500px] px-5 pb-24 sm:px-8 md:px-10 lg:px-14">

        <form
          onSubmit={
            handleSubmit
          }
          className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20"
        >

          {/* ====================================================
              LEFT
          ==================================================== */}

          <div>

            <p className="text-xs uppercase tracking-[0.28em] text-black/40">
              New Story
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              Start writing.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-black/50">
              For now, category and tag
              values use backend IDs.
              We will connect their real
              frontend selectors later.
            </p>

          </div>

          {/* ====================================================
              RIGHT
          ==================================================== */}

          <div className="space-y-10">

            {/* TITLE */}

            <div>

              <label
                htmlFor="title"
                className="mb-3 block text-xs uppercase tracking-[0.2em] text-black/45"
              >
                Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="Your story title"
                className="
                  w-full
                  border-b
                  border-black
                  bg-transparent
                  px-0
                  py-3
                  text-2xl
                  font-medium
                  outline-none
                  placeholder:text-black/25
                "
              />

            </div>

            {/* CONTENT */}

            <div>

              <label
                htmlFor="content"
                className="mb-3 block text-xs uppercase tracking-[0.2em] text-black/45"
              >
                Content
              </label>

              <textarea
                id="content"
                value={content}
                onChange={(event) =>
                  setContent(
                    event.target.value
                  )
                }
                placeholder="Tell your story..."
                rows={14}
                className="
                  w-full
                  resize-y
                  border
                  border-black/20
                  bg-transparent
                  px-5
                  py-5
                  text-base
                  leading-[1.8]
                  outline-none
                  transition-colors
                  placeholder:text-black/25
                  focus:border-black
                "
              />

            </div>

            {/* CATEGORY */}

            <div>

              <label
                htmlFor="category-id"
                className="mb-3 block text-xs uppercase tracking-[0.2em] text-black/45"
              >
                Category ID
              </label>

              <input
                id="category-id"
                type="number"
                min="0"
                value={
                  categoryId
                }
                onChange={(event) =>
                  setCategoryId(
                    event.target.value
                  )
                }
                placeholder="0"
                className="
                  w-full
                  border-b
                  border-black
                  bg-transparent
                  px-0
                  py-3
                  text-base
                  outline-none
                  placeholder:text-black/25
                "
              />

            </div>

            {/* TAG IDS */}

            <div>

              <label
                htmlFor="tag-ids"
                className="mb-3 block text-xs uppercase tracking-[0.2em] text-black/45"
              >
                Tag IDs
              </label>

              <input
                id="tag-ids"
                type="text"
                value={
                  tagIds
                }
                onChange={(event) =>
                  setTagIds(
                    event.target.value
                  )
                }
                placeholder="1, 2, 3"
                className="
                  w-full
                  border-b
                  border-black
                  bg-transparent
                  px-0
                  py-3
                  text-base
                  outline-none
                  placeholder:text-black/25
                "
              />

              <p className="mt-2 text-xs text-black/40">
                Separate multiple tag IDs
                with commas.
              </p>

            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="border border-red-500/30 bg-red-500/5 px-4 py-3">

                <p className="text-sm leading-relaxed text-red-700">
                  {error}
                </p>

              </div>
            )}

            {/* ==================================================
                SUCCESS
            ================================================== */}

            {success && (
              <div className="border border-green-700/30 bg-green-700/5 px-4 py-3">

                <p className="text-sm leading-relaxed text-green-800">
                  {success}
                </p>

              </div>
            )}

            {/* ==================================================
                CREATED POST INFO
            ================================================== */}

            {createdPost && (
              <div className="border-t border-black pt-8">

                <p className="text-xs uppercase tracking-[0.25em] text-black/40">
                  Created Post
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                  <Info
                    label="Post ID"
                    value={String(
                      createdPost.id
                    )}
                  />

                  <Info
                    label="Status"
                    value={
                      createdPost.status
                    }
                  />

                  <Info
                    label="Reading Time"
                    value={`${createdPost.reading_time} min`}
                  />

                  <Info
                    label="Owner ID"
                    value={String(
                      createdPost.owner_id
                    )}
                  />

                </div>

              </div>
            )}

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-black/15 pt-8 sm:flex-row sm:items-center sm:justify-between">

              <button
                type="button"
                onClick={() =>
                  router.push("/")
                }
                disabled={
                  isSaving
                }
                className="rounded-full border border-black/20 px-7 py-3 text-sm transition-all hover:border-black disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isSaving
                }
                className="
                  rounded-full
                  bg-black
                  px-8
                  py-3
                  text-sm
                  text-[#f5f1e8]
                  transition-all
                  hover:bg-black/80
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {isSaving
                  ? "Creating..."
                  : "Create post"}
              </button>

            </div>

          </div>

        </form>

      </section>

    </main>
  );
}

// ============================================================
// INFO COMPONENT
// ============================================================

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-black/10 pb-4">

      <p className="text-[10px] uppercase tracking-[0.2em] text-black/35">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium">
        {value}
      </p>

    </div>
  );
}