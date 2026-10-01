"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

// ============================================================
// TYPES
// ============================================================

type WriterStory = {
  category: string;
  title: string;
  readTime: string;
  preview: string;
  background: string;
  slug: string;
};

type Writer = {
  slug: string;
  name: string;
  role: string;
  initials: string;
  followers: string;
  bio: string;
  location: string;
  joined: string;
  specialties: string[];
  stories: WriterStory[];
};

// ============================================================
// WRITERS DATA
// ============================================================

const writers: Writer[] = [
  {
    slug: "tugce-gok",
    name: "Tuğçe Gök",
    role: "Backend Developer & Writer",
    initials: "TG",
    followers: "3.4K followers",
    bio:
      "Writing about backend engineering, artificial intelligence and software development. Interested in building clean, scalable systems and exploring how technology changes the way we create.",
    location: "Türkiye",
    joined: "2026",
    specialties: [
      "Backend Engineering",
      "FastAPI",
      "Artificial Intelligence",
      "Software Development",
    ],
    stories: [
      {
        category: "Artificial Intelligence",
        title: "The Future of Artificial Intelligence",
        readTime: "8 min read",
        preview: "AI",
        background: "#c9d8b6",
        slug: "the-future-of-artificial-intelligence",
      },
      {
        category: "Backend Engineering",
        title: "Building Better APIs with FastAPI",
        readTime: "6 min read",
        preview: "API",
        background: "#c7d2fe",
        slug: "building-better-apis-with-fastapi",
      },
      {
        category: "Artificial Intelligence",
        title: "How AI Is Changing the Way We Create",
        readTime: "12 min read",
        preview: "ML",
        background: "#fde68a",
        slug: "how-ai-is-changing-the-way-we-create",
      },
    ],
  },

  {
    slug: "elif-demir",
    name: "Elif Demir",
    role: "Product Designer",
    initials: "ED",
    followers: "2.1K followers",
    bio:
      "Exploring digital design, user experience and the systems behind thoughtful interfaces. Writing about how simple design decisions can create more intuitive digital products.",
    location: "Türkiye",
    joined: "2026",
    specialties: [
      "Product Design",
      "User Experience",
      "Interface Design",
      "Design Systems",
    ],
    stories: [
      {
        category: "Design",
        title: "Designing Digital Experiences That Feel Human",
        readTime: "7 min read",
        preview: "UX",
        background: "#ffb4a2",
        slug: "designing-digital-experiences-that-feel-human",
      },
      {
        category: "Design",
        title: "Designing Interfaces That Feel Invisible",
        readTime: "7 min read",
        preview: "UI",
        background: "#fecdd3",
        slug: "designing-interfaces-that-feel-invisible",
      },
      {
        category: "Design",
        title: "Why the Best Interfaces Almost Disappear",
        readTime: "6 min read",
        preview: "UX",
        background: "#ddd6fe",
        slug: "why-the-best-interfaces-almost-disappear",
      },
    ],
  },

  {
    slug: "deniz-kaya",
    name: "Deniz Kaya",
    role: "Software Engineer",
    initials: "DK",
    followers: "1.8K followers",
    bio:
      "Writing about scalable systems, APIs and software architecture. Interested in creating reliable developer experiences and designing software that remains maintainable as products grow.",
    location: "Türkiye",
    joined: "2026",
    specialties: [
      "Software Engineering",
      "API Architecture",
      "Scalable Systems",
      "Backend Development",
    ],
    stories: [
      {
        category: "Engineering",
        title: "Why Good Backend Architecture Matters",
        readTime: "9 min read",
        preview: "API",
        background: "#fde68a",
        slug: "why-good-backend-architecture-matters",
      },
      {
        category: "Engineering",
        title: "Building APIs That Developers Actually Enjoy Using",
        readTime: "8 min read",
        preview: "DEV",
        background: "#bfdbfe",
        slug: "building-apis-that-developers-actually-enjoy-using",
      },
    ],
  },
];

// ============================================================
// PAGE
// ============================================================

export default function WriterPage() {
  const params = useParams();
  const router = useRouter();

  // ============================================================
  // SLUG
  // ============================================================

  const rawSlug = params.slug;

  const slug = Array.isArray(rawSlug)
    ? rawSlug[0]
    : rawSlug;

  // ============================================================
  // FIND WRITER
  // ============================================================

  const writer = writers.find(
    (item) => item.slug === slug
  );

  // ============================================================
  // FOLLOW STATE
  // ============================================================

  const [isFollowing, setIsFollowing] =
    useState(false);

  // ============================================================
  // WRITER NOT FOUND
  // ============================================================

  if (!writer) {
    return (
      <main className="min-h-screen bg-[#f5f1e8] text-black">

        {/* NAVBAR */}

        <nav className="border-b border-black/10">
          <div className="mx-auto flex h-[76px] w-full max-w-[1400px] items-center justify-between px-5 sm:px-8 md:px-10 lg:px-14">

            <button
              type="button"
              onClick={() => router.push("/")}
              className="group flex items-center gap-3 text-xl font-semibold tracking-[-0.04em]"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#7957ff]" />

              MINDSCAPE
            </button>

          </div>
        </nav>

        <section className="mx-auto w-full max-w-[1400px] px-5 py-24 sm:px-8 md:px-10 lg:px-14">

          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            404 · Writer
          </p>

          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl md:text-7xl">
            Writer not found.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-black/55">
            The writer profile you are looking for does not
            exist or may have been removed.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/#writers")
            }
            className="group mt-10 flex items-center gap-3 rounded-full bg-black px-6 py-3 text-sm text-[#f5f1e8] transition-all duration-300 hover:scale-[1.03]"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>

            Back to writers
          </button>

        </section>

      </main>
    );
  }

  // ============================================================
  // OPEN STORY
  // ============================================================

  const openStory = (storySlug: string) => {
    router.push(`/stories/${storySlug}`);
  };

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f1e8] text-black">

      {/* ========================================================
          NAVBAR
      ======================================================== */}

      <nav className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f1e8]/90 backdrop-blur-xl">

        <div className="mx-auto flex h-[68px] w-full max-w-[1400px] items-center justify-between px-5 sm:px-8 md:h-[76px] md:px-10 lg:px-14">

          {/* LOGO */}

          <button
            type="button"
            onClick={() => router.push("/")}
            className="group flex items-center gap-3 text-lg font-semibold tracking-[-0.04em] sm:text-xl md:text-2xl"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#7957ff] transition-transform duration-500 group-hover:scale-[1.7]" />

            MINDSCAPE
          </button>

          {/* ACTIONS */}

          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() =>
                router.push("/#writers")
              }
              className="hidden text-sm text-black/50 transition-colors hover:text-black sm:block"
            >
              Writers
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/write")
              }
              className="rounded-full border border-black px-5 py-2 text-sm transition-all duration-300 hover:bg-black hover:text-[#f5f1e8]"
            >
              Write
            </button>

          </div>

        </div>

      </nav>

      {/* ========================================================
          PROFILE HERO
      ======================================================== */}

      <section className="mx-auto w-full max-w-[1400px] px-5 pb-20 pt-8 sm:px-8 md:px-10 md:pb-28 md:pt-12 lg:px-14">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            router.push("/#writers")
          }
          className="group flex items-center gap-2 text-sm text-black/45 transition-colors hover:text-black"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>

          Back to writers
        </button>

        {/* PROFILE */}

        <div className="mt-12 border-t border-black pt-10 md:mt-16 md:pt-14">

          <div className="grid gap-12 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-20">

            {/* LEFT */}

            <div>

              <div className="group relative">

                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-full bg-[#7957ff]/20 transition-transform duration-500 group-hover:translate-x-5 group-hover:translate-y-5" />

                <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-black text-5xl font-medium tracking-[-0.05em] text-[#f5f1e8] transition-transform duration-500 group-hover:-translate-y-1 sm:h-52 sm:w-52">
                  {writer.initials}
                </div>

              </div>

              <div className="mt-8">

                <p className="text-[10px] uppercase tracking-[0.25em] text-black/35">
                  Based in
                </p>

                <p className="mt-2 text-sm">
                  {writer.location}
                </p>

              </div>

            </div>

            {/* RIGHT */}

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-3">

                <span className="h-2 w-2 rounded-full bg-[#7957ff]" />

                <p className="text-xs uppercase tracking-[0.28em] text-black/45">
                  Featured Writer
                </p>

              </div>

              <h1 className="mt-6 break-words text-5xl font-semibold leading-[0.9] tracking-[-0.055em] sm:text-6xl md:text-7xl lg:text-[6rem]">
                {writer.name}
              </h1>

              <p className="mt-6 text-lg text-black/55 md:text-xl">
                {writer.role}
              </p>

              <p className="mt-10 max-w-3xl text-base leading-[1.8] text-black/65 sm:text-lg">
                {writer.bio}
              </p>

              {/* SPECIALTIES */}

              <div className="mt-9 flex flex-wrap gap-2">

                {writer.specialties.map(
                  (specialty) => (
                    <span
                      key={specialty}
                      className="rounded-full border border-black/15 px-4 py-2 text-xs text-black/55"
                    >
                      {specialty}
                    </span>
                  )
                )}

              </div>

              {/* FOLLOW */}

              <div className="mt-10 flex flex-wrap items-center gap-5">

                <button
                  type="button"
                  onClick={() =>
                    setIsFollowing(
                      (current) => !current
                    )
                  }
                  className={`
                    min-w-[116px]
                    rounded-full
                    border
                    px-7
                    py-3
                    text-sm
                    transition-all
                    duration-300

                    ${
                      isFollowing
                        ? "border-black bg-black text-[#f5f1e8] hover:bg-black/80"
                        : "border-black bg-transparent text-black hover:bg-black hover:text-[#f5f1e8]"
                    }
                  `}
                >
                  {isFollowing
                    ? "Following"
                    : "Follow"}
                </button>

                <span className="text-sm text-black/45">
                  {writer.followers}
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================
          STATS
      ======================================================== */}

      <section className="border-y border-black/15">

        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-2 px-5 sm:px-8 md:grid-cols-4 md:px-10 lg:px-14">

          {/* FOLLOWERS */}

          <div className="border-b border-r border-black/15 py-8 pr-5 md:border-b-0 md:py-10">

            <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">
              Followers
            </p>

            <p className="mt-3 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
              {writer.followers.replace(
                " followers",
                ""
              )}
            </p>

          </div>

          {/* STORIES */}

          <div className="border-b border-black/15 py-8 pl-5 md:border-b-0 md:border-r md:px-8 md:py-10">

            <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">
              Stories
            </p>

            <p className="mt-3 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
              {writer.stories.length}
            </p>

          </div>

          {/* TOPICS */}

          <div className="border-r border-black/15 py-8 pr-5 md:px-8 md:py-10">

            <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">
              Topics
            </p>

            <p className="mt-3 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
              {writer.specialties.length}
            </p>

          </div>

          {/* MEMBER SINCE */}

          <div className="py-8 pl-5 md:pl-8 md:py-10">

            <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">
              Member since
            </p>

            <p className="mt-3 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
              {writer.joined}
            </p>

          </div>

        </div>

      </section>

      {/* ========================================================
          WRITER STORIES
      ======================================================== */}

      <section className="py-20 md:py-28">

        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 md:px-10 lg:px-14">

          {/* HEADER */}

          <div className="mb-14 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="mb-3 text-sm uppercase tracking-[0.3em]">
                Published Stories
              </p>

              <h2 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl md:text-6xl">
                Writing by {writer.name}.
              </h2>

            </div>

            <p className="max-w-sm text-sm leading-relaxed text-black/50 md:text-right">
              Ideas, perspectives and stories published
              on Mindscape.
            </p>

          </div>

          {/* STORIES GRID */}

          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">

            {writer.stories.map(
              (story, index) => (
                <article
                  key={story.slug}
                  onClick={() =>
                    openStory(story.slug)
                  }
                  className="group cursor-pointer"
                >

                  {/* COVER */}

                  <div
                    className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[26px]"
                    style={{
                      backgroundColor:
                        story.background,
                    }}
                  >

                    <span className="select-none text-6xl font-semibold tracking-[-0.07em] text-black/15 transition-all duration-700 group-hover:scale-110 group-hover:text-black/25 sm:text-7xl">
                      {story.preview}
                    </span>

                    <div className="absolute left-5 top-5">

                      <span className="text-[10px] uppercase tracking-[0.22em] text-black/45">
                        0{index + 1}
                      </span>

                    </div>

                    <div className="absolute right-5 top-5 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-black text-sm text-[#f5f1e8] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      ↗
                    </div>

                  </div>

                  {/* CONTENT */}

                  <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-black/45 sm:text-xs">
                    {story.category}
                  </p>

                  <h3 className="mt-3 text-2xl font-medium leading-[1.08] tracking-[-0.025em] transition-transform duration-300 group-hover:translate-x-1 md:text-3xl">
                    {story.title}
                  </h3>

                  <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4">

                    <span className="text-sm">
                      {writer.name}
                    </span>

                    <span className="text-xs text-black/45">
                      {story.readTime}
                    </span>

                  </div>

                </article>
              )
            )}

          </div>

        </div>

      </section>

      {/* ========================================================
          WRITER CTA
      ======================================================== */}

      <section className="border-t border-black bg-[#7957ff] py-16 text-white md:py-20">

        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-5 sm:px-8 md:px-10 lg:flex-row lg:items-end lg:justify-between lg:px-14">

          <div>

            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Keep exploring
            </p>

            <h2 className="mt-5 max-w-4xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-5xl md:text-6xl">
              Discover more ideas
              <br />
              worth reading.
            </h2>

          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/#stories")
            }
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-2xl text-black transition-all duration-500 hover:rotate-45 hover:scale-105"
            aria-label="Explore stories"
          >
            ↗
          </button>

        </div>

      </section>

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <footer className="bg-black py-12 text-[#f5f1e8]">

        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-center md:justify-between md:px-10 lg:px-14">

          <button
            type="button"
            onClick={() => router.push("/")}
            className="group flex items-center gap-3 text-xl font-semibold tracking-[-0.04em]"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#7957ff] transition-transform duration-500 group-hover:scale-[1.6]" />

            MINDSCAPE
          </button>

          <div className="flex flex-wrap gap-6 text-xs text-white/40">

            <button
              type="button"
              onClick={() =>
                router.push("/#stories")
              }
              className="transition-colors hover:text-white"
            >
              Stories
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/#writers")
              }
              className="transition-colors hover:text-white"
            >
              Writers
            </button>

            <span>
              © 2026 Mindscape
            </span>

          </div>

        </div>

      </footer>

    </main>
  );
}