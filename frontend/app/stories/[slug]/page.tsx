"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// ============================================================
// TYPES
// ============================================================

type Story = {
  slug: string;
  number: string;
  category: string;
  title: string;
  subtitle: string;
  author: string;
  authorRole: string;
  authorInitials: string;
  readTime: string;
  date: string;
  accent: string;
  coverText: string;
  intro: string;
  quote: string;
  sections: {
    heading: string;
    paragraphs: string[];
    code?: string;
  }[];
};

// ============================================================
// TEMPORARY STORY DATA
// Daha sonra FastAPI'den gelecek.
// ============================================================

const stories: Story[] = [
  {
    slug: "building-better-apis-with-fastapi",
    number: "02",
    category: "Backend Engineering",
    title: "Building Better APIs with FastAPI",
    subtitle:
      "A practical exploration of clean architecture, authentication and the small decisions that make APIs easier to build and maintain.",
    author: "Tuğçe Gök",
    authorRole: "Backend Developer & Writer",
    authorInitials: "TG",
    readTime: "6 min read",
    date: "August 2026",
    accent: "#7957ff",
    coverText: "API",
    intro:
      "A good API is more than a collection of endpoints. It is a carefully designed contract between systems, developers and the people ultimately using the product.",
    quote:
      "Good backend architecture should make the next feature easier to build, not harder.",
    sections: [
      {
        heading: "The API is the product",
        paragraphs: [
          "When we begin learning backend development, it is easy to think mostly about making requests work. A POST request creates something, a GET request retrieves it and a DELETE request removes it.",
          "But as an application grows, successful requests are only the beginning. Routes need predictable behavior, authentication needs clear boundaries and the database layer needs to remain understandable months after the first version was written.",
        ],
      },
      {
        heading: "Start with clear responsibilities",
        paragraphs: [
          "FastAPI makes it possible to create endpoints very quickly, but speed can also encourage us to put too much responsibility inside a single route.",
          "A cleaner application separates concerns. Routers describe HTTP behavior, schemas validate data, models represent database entities and authentication utilities handle identity and authorization.",
        ],
        code: `@router.post("/posts")
def create_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_post = Post(
        title=post.title,
        content=post.content,
        owner_id=current_user.id,
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return new_post`,
      },
      {
        heading: "Authentication changes everything",
        paragraphs: [
          "The moment users can create private or personal resources, the backend needs to know who is making each request. This is where authentication becomes part of the architecture rather than an isolated login feature.",
          "JWT access tokens allow the client to prove its identity on protected requests. The server validates the token, determines the current user and can then decide whether that user is allowed to perform an action.",
        ],
      },
      {
        heading: "Design for the next feature",
        paragraphs: [
          "A useful question while building an API is not only whether the current endpoint works, but whether the structure will still make sense when the next ten features arrive.",
          "Features such as comments, follows, bookmarks, notifications and publishing workflows become significantly easier when the foundation already has clear models and ownership rules.",
        ],
      },
    ],
  },

  {
    slug: "the-future-of-artificial-intelligence",
    number: "01",
    category: "Artificial Intelligence",
    title: "The Future of Artificial Intelligence",
    subtitle:
      "What changes when intelligent systems become part of the everyday tools we use to build, learn and create?",
    author: "Tuğçe Gök",
    authorRole: "Backend Developer & Writer",
    authorInitials: "TG",
    readTime: "8 min read",
    date: "August 2026",
    accent: "#b7ff4a",
    coverText: "AI",
    intro:
      "Artificial intelligence is moving from something we occasionally interact with into an invisible layer inside the tools we use every day.",
    quote:
      "The most interesting future for AI may be the one where the technology becomes less visible while its capabilities become more useful.",
    sections: [
      {
        heading: "From tools to collaborators",
        paragraphs: [
          "Software has traditionally waited for explicit instructions. New AI systems are changing that relationship by helping people explore possibilities, organize information and move from an idea toward an outcome.",
          "That shift does not remove the importance of human judgment. In many cases it makes judgment more important because people still need to decide what is useful, accurate and worth creating.",
        ],
      },
      {
        heading: "Software development is changing",
        paragraphs: [
          "Developers can already use intelligent tools to explain unfamiliar code, generate repetitive structures and explore different implementations.",
          "The valuable skill therefore moves beyond simply producing code. Understanding architecture, debugging behavior and evaluating technical decisions becomes increasingly important.",
        ],
      },
      {
        heading: "The human layer",
        paragraphs: [
          "Technology rarely changes society through capability alone. Trust, accessibility, design and responsible use determine how new systems become part of everyday life.",
          "The future of artificial intelligence will therefore be shaped as much by the decisions around the technology as by the models themselves.",
        ],
      },
    ],
  },

  {
    slug: "designing-digital-experiences-that-feel-human",
    number: "03",
    category: "Design",
    title: "Designing Digital Experiences That Feel Human",
    subtitle:
      "Why thoughtful interfaces often feel quiet, obvious and almost invisible.",
    author: "Elif Demir",
    authorRole: "Product Designer",
    authorInitials: "ED",
    readTime: "7 min read",
    date: "August 2026",
    accent: "#ffb4a2",
    coverText: "UX",
    intro:
      "The best digital experiences rarely demand attention for themselves. Instead, they help people understand where they are and what they can do next.",
    quote:
      "Good design reduces the distance between intention and action.",
    sections: [
      {
        heading: "Design begins before pixels",
        paragraphs: [
          "Interfaces are often judged by what they look like, but visual decisions are only one layer of the experience.",
          "Before choosing colors, typography or spacing, designers need to understand what the person using the product is trying to accomplish.",
        ],
      },
      {
        heading: "Clarity creates confidence",
        paragraphs: [
          "Every unclear label and unexpected interaction adds friction. Individually these moments may seem small, but together they shape how trustworthy a product feels.",
          "Clear hierarchy and predictable behavior allow users to spend their attention on their goals instead of trying to understand the interface.",
        ],
      },
      {
        heading: "Invisible does not mean simple",
        paragraphs: [
          "An interface that feels effortless may require significant work behind the scenes. Complexity has not disappeared; it has been organized.",
          "That is one reason thoughtful digital products often feel calm. Their complexity is handled by the system rather than transferred to the user.",
        ],
      },
    ],
  },
];

// ============================================================
// PAGE
// ============================================================

export default function StoryPage() {
  const params = useParams();

  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : (params.slug as string);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [claps, setClaps] = useState(128);
  const [hasClapped, setHasClapped] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  // ============================================================
  // CURRENT STORY
  // ============================================================

  const story = useMemo(() => {
    return (
      stories.find((item) => item.slug === slug) ??
      stories[0]
    );
  }, [slug]);

  // ============================================================
  // RECOMMENDED STORIES
  // ============================================================

  const recommendedStories = useMemo(() => {
    return stories
      .filter((item) => item.slug !== story.slug)
      .slice(0, 2);
  }, [story.slug]);

  // ============================================================
  // READING PROGRESS
  // ============================================================

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;

      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      if (documentHeight <= 0) {
        setScrollProgress(0);
        return;
      }

      const progress =
        (scrollTop / documentHeight) * 100;

      setScrollProgress(
        Math.min(100, Math.max(0, progress))
      );
    };

    updateProgress();

    window.addEventListener("scroll", updateProgress);

    return () => {
      window.removeEventListener(
        "scroll",
        updateProgress
      );
    };
  }, []);

  // ============================================================
  // CLAP
  // ============================================================

  const handleClap = () => {
    if (hasClapped) {
      setClaps((current) => current - 1);
      setHasClapped(false);
      return;
    }

    setClaps((current) => current + 1);
    setHasClapped(true);
  };

  // ============================================================
  // SHARE
  // ============================================================

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: story.title,
          text: story.subtitle,
          url: window.location.href,
        });

        return;
      }

      await navigator.clipboard.writeText(
        window.location.href
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      // Share kapatılırsa hata göstermiyoruz.
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f1e8] text-black">

      {/* ======================================================
          READING PROGRESS
      ====================================================== */}

      <div className="fixed left-0 top-0 z-[100] h-[3px] w-full bg-black/5">
        <div
          className="h-full transition-[width] duration-100"
          style={{
            width: `${scrollProgress}%`,
            backgroundColor: story.accent,
          }}
        />
      </div>

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <nav className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f1e8]/90 backdrop-blur-xl">

        <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between px-5 sm:px-8 md:h-[76px] lg:px-12 xl:px-16">

          <Link
            href="/"
            className="group flex items-center gap-3 text-lg font-semibold tracking-[-0.04em] sm:text-xl"
          >
            <span
              className="h-2.5 w-2.5 rounded-full transition-transform duration-500 group-hover:scale-[1.7]"
              style={{
                backgroundColor: story.accent,
              }}
            />

            MINDSCAPE
          </Link>

          <div className="hidden max-w-[420px] items-center gap-4 lg:flex">

            <span className="h-4 w-px bg-black/20" />

            <p className="truncate text-xs text-black/50">
              {story.title}
            </p>

          </div>

          <div className="flex items-center gap-3">

            <span className="hidden text-xs text-black/40 sm:block">
              {story.readTime}
            </span>

            <button
              type="button"
              onClick={handleShare}
              className="rounded-full border border-black/20 px-4 py-2 text-xs transition-all duration-300 hover:border-black hover:bg-black hover:text-[#f5f1e8]"
            >
              {copied ? "Copied!" : "Share"}
            </button>

            <Link
              href="/"
              className="hidden text-sm text-black/50 transition-colors hover:text-black md:block"
            >
              Close ×
            </Link>

          </div>

        </div>

      </nav>

      {/* ======================================================
          HERO
      ====================================================== */}

      <header className="relative overflow-hidden border-b border-black">

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(to right, black 1px, transparent 1px),
              linear-gradient(to bottom, black 1px, transparent 1px)
            `,
            backgroundSize: "96px 96px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1600px] px-5 py-10 sm:px-8 md:py-14 lg:px-12 xl:px-16">

          {/* TOP META */}

          <div className="flex items-center justify-between border-b border-black/15 pb-5">

            <div className="flex items-center gap-3">

              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: story.accent,
                }}
              />

              <p className="text-[10px] uppercase tracking-[0.24em] sm:text-xs sm:tracking-[0.28em]">
                {story.category}
              </p>

            </div>

            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 sm:text-xs">
              Story / {story.number}
            </p>

          </div>

          {/* TITLE */}

          <div className="grid gap-12 py-12 sm:py-14 md:py-16 lg:grid-cols-[minmax(0,1fr)_250px] lg:items-end">

            <div className="min-w-0">

              <p
                className="mb-6 text-[10px] font-medium uppercase tracking-[0.3em] sm:text-xs"
                style={{
                  color: story.accent,
                }}
              >
                Featured Story
              </p>

              <h1
                className="
                  max-w-[1180px]
                  break-words
                  text-[13vw]
                  font-semibold
                  leading-[0.9]
                  tracking-[-0.06em]

                  sm:text-[10vw]
                  sm:leading-[0.88]

                  md:text-[8vw]

                  lg:text-[6.5vw]
                  lg:leading-[0.86]

                  xl:text-[5.8vw]
                "
              >
                {story.title}
              </h1>

            </div>

            <div className="max-w-[250px] lg:pb-2">

              <p className="text-sm leading-[1.75] text-black/55">
                {story.subtitle}
              </p>

              <div className="mt-8 h-px w-full bg-black/20" />

              <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-black/40">
                Scroll to read ↓
              </p>

            </div>

          </div>

          {/* META GRID */}

          <div className="grid gap-x-8 gap-y-8 border-t border-black/15 pt-7 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                Written by
              </p>

              <p className="mt-2 text-sm font-medium">
                {story.author}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                Published
              </p>

              <p className="mt-2 text-sm">
                {story.date}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                Reading time
              </p>

              <p className="mt-2 text-sm">
                {story.readTime}
              </p>
            </div>

            <div className="overflow-hidden lg:max-w-[180px] lg:text-right">

              <span
                className="
                  block
                  break-words
                  text-5xl
                  font-semibold
                  leading-none
                  tracking-[-0.07em]
                  sm:text-6xl
                  md:text-7xl
                "
                style={{
                  color: story.accent,
                }}
              >
                {story.coverText}
              </span>

            </div>

          </div>

        </div>

      </header>

      {/* ======================================================
          ARTICLE
      ====================================================== */}

      <section className="px-5 py-16 sm:px-8 md:py-24 lg:px-12 xl:px-16">

        <div
          className="
            mx-auto
            grid
            max-w-[1360px]
            gap-12

            lg:grid-cols-[130px_minmax(0,720px)_minmax(180px,1fr)]
            lg:gap-12

            xl:grid-cols-[150px_minmax(0,760px)_220px]
            xl:gap-16
          "
        >

          {/* LEFT ACTIONS */}

          <aside className="hidden lg:block">

            <div className="sticky top-32">

              <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-black/40">
                React
              </p>

              <div className="flex flex-col items-start gap-3">

                <button
                  type="button"
                  onClick={handleClap}
                  className={`flex items-center gap-3 rounded-full border px-4 py-2.5 text-xs transition-all ${
                    hasClapped
                      ? "border-black bg-black text-white"
                      : "border-black/20 hover:border-black"
                  }`}
                >
                  <span>👏</span>
                  {claps}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setBookmarked((current) => !current)
                  }
                  className={`rounded-full border px-4 py-2.5 text-xs transition-all ${
                    bookmarked
                      ? "border-black bg-black text-white"
                      : "border-black/20 hover:border-black"
                  }`}
                >
                  {bookmarked ? "Saved ✓" : "Bookmark"}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="rounded-full border border-black/20 px-4 py-2.5 text-xs transition-all hover:border-black"
                >
                  Share
                </button>

              </div>

            </div>

          </aside>

          {/* MAIN ARTICLE */}

          <article className="min-w-0">

            <p
              className="
                mb-16
                max-w-[700px]
                text-2xl
                font-medium
                leading-[1.5]
                tracking-[-0.02em]

                sm:text-[28px]

                md:text-[32px]
                md:leading-[1.45]
              "
            >
              {story.intro}
            </p>

            <div
              className="mb-16 h-[3px] w-20"
              style={{
                backgroundColor: story.accent,
              }}
            />

            {story.sections.map((section, index) => (
              <div
                key={section.heading}
                className="mb-20 last:mb-8 md:mb-24"
              >

                <div className="mb-9 grid grid-cols-[30px_minmax(0,1fr)] gap-4 sm:grid-cols-[36px_minmax(0,1fr)] sm:gap-5">

                  <span className="pt-2 text-xs text-black/30">
                    0{index + 1}
                  </span>

                  <h2
                    className="
                      max-w-[680px]
                      text-[30px]
                      font-semibold
                      leading-[1.1]
                      tracking-[-0.035em]

                      sm:text-4xl
                      sm:leading-[1.08]
                    "
                  >
                    {section.heading}
                  </h2>

                </div>

                <div className="space-y-8">

                  {section.paragraphs.map(
                    (paragraph, paragraphIndex) => (
                      <p
                        key={paragraphIndex}
                        className="
                          max-w-[700px]
                          text-[17px]
                          leading-[1.9]
                          text-black/70

                          sm:text-[18px]
                          sm:leading-[1.95]
                        "
                      >
                        {paragraph}
                      </p>
                    )
                  )}

                </div>

                {section.code && (
                  <div className="my-12 max-w-[760px] overflow-hidden rounded-[18px] bg-[#111111] text-white shadow-[0_24px_60px_rgba(0,0,0,0.14)]">

                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">

                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-white/25" />
                        <span className="h-2 w-2 rounded-full bg-white/25" />
                        <span className="h-2 w-2 rounded-full bg-white/25" />
                      </div>

                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                        Python · FastAPI
                      </span>

                    </div>

                    <pre className="overflow-x-auto p-6 text-[13px] leading-7 text-[#b7ff4a] sm:p-8 sm:text-sm">
                      <code>{section.code}</code>
                    </pre>

                  </div>
                )}

                {index === 1 && (
                  <blockquote className="my-20 max-w-[720px] border-y border-black py-12 md:my-24 md:py-16">

                    <span
                      className="mb-5 block text-5xl font-semibold"
                      style={{
                        color: story.accent,
                      }}
                    >
                      “
                    </span>

                    <p
                      className="
                        text-[28px]
                        font-medium
                        leading-[1.25]
                        tracking-[-0.03em]

                        sm:text-4xl

                        md:text-[42px]
                        md:leading-[1.2]
                      "
                    >
                      {story.quote}
                    </p>

                  </blockquote>
                )}

              </div>
            ))}

            {/* MOBILE ACTIONS */}

            <div className="mb-16 flex flex-wrap gap-3 border-y border-black/15 py-6 lg:hidden">

              <button
                type="button"
                onClick={handleClap}
                className={`rounded-full border px-4 py-2 text-sm ${
                  hasClapped
                    ? "border-black bg-black text-white"
                    : "border-black/20"
                }`}
              >
                👏 {claps}
              </button>

              <button
                type="button"
                onClick={() =>
                  setBookmarked((current) => !current)
                }
                className={`rounded-full border px-4 py-2 text-sm ${
                  bookmarked
                    ? "border-black bg-black text-white"
                    : "border-black/20"
                }`}
              >
                {bookmarked ? "Saved ✓" : "Bookmark"}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="rounded-full border border-black/20 px-4 py-2 text-sm"
              >
                Share
              </button>

            </div>

            {/* AUTHOR */}

            <div className="max-w-[760px] border-t border-black py-12">

              <p className="mb-8 text-[10px] uppercase tracking-[0.28em] text-black/40">
                About the author
              </p>

              <div className="flex flex-col gap-7 sm:flex-row sm:items-center">

                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-xl font-semibold"
                  style={{
                    backgroundColor: story.accent,
                  }}
                >
                  {story.authorInitials}
                </div>

                <div className="flex-1">

                  <h3 className="text-2xl font-semibold">
                    {story.author}
                  </h3>

                  <p className="mt-1 text-sm text-black/45">
                    {story.authorRole}
                  </p>

                  <p className="mt-4 max-w-xl text-sm leading-[1.75] text-black/60">
                    Writing about technology, software,
                    creativity and the ideas shaping digital
                    products.
                  </p>

                </div>

                <button
                  type="button"
                  className="w-fit rounded-full border border-black px-6 py-2.5 text-sm transition-all duration-300 hover:bg-black hover:text-[#f5f1e8]"
                >
                  Follow
                </button>

              </div>

            </div>

          </article>

          {/* RIGHT COLUMN */}

          <aside className="hidden lg:block">

            <div className="sticky top-32 border-l border-black/15 pl-6 xl:pl-8">

              <p className="text-[10px] uppercase tracking-[0.25em] text-black/40">
                Story
              </p>

              <p className="mt-4 text-sm font-medium leading-relaxed">
                {story.category}
              </p>

              <div className="my-6 h-px bg-black/15" />

              <p className="text-xs leading-[1.7] text-black/45">
                Published on Mindscape
                <br />
                {story.date}
              </p>

              <div className="mt-8 overflow-hidden">

                <p
                  className="break-words text-5xl font-semibold leading-none tracking-[-0.07em] xl:text-6xl"
                  style={{
                    color: story.accent,
                  }}
                >
                  {story.coverText}
                </p>

              </div>

            </div>

          </aside>

        </div>

      </section>

      {/* ======================================================
          MORE STORIES
      ====================================================== */}

      <section className="border-t border-black px-5 py-16 sm:px-8 md:py-24 lg:px-12 xl:px-16">

        <div className="mx-auto max-w-[1500px]">

          <div className="mb-12 flex items-end justify-between">

            <div>

              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-black/45">
                Continue reading
              </p>

              <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl md:text-5xl">
                More from Mindscape.
              </h2>

            </div>

            <Link
              href="/#stories"
              className="hidden text-sm underline underline-offset-4 sm:block"
            >
              All stories
            </Link>

          </div>

          <div className="grid overflow-hidden rounded-[22px] border-l border-t border-black md:grid-cols-2">

            {recommendedStories.map((item) => (
              <Link
                key={item.slug}
                href={`/stories/${item.slug}`}
                className="group relative min-h-[380px] overflow-hidden border-b border-r border-black p-7 sm:p-9 md:min-h-[440px]"
              >

                <div
                  className="absolute inset-0 translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0"
                  style={{
                    backgroundColor: item.accent,
                  }}
                />

                <div className="relative z-10 flex h-full flex-col justify-between">

                  <div className="flex items-start justify-between gap-5">

                    <p className="max-w-[220px] text-xs uppercase tracking-[0.22em] text-black/50 transition-colors group-hover:text-black/60">
                      {item.category}
                    </p>

                    <span className="shrink-0 text-sm">
                      {item.number}
                    </span>

                  </div>

                  <div>

                    <span className="mb-8 block text-6xl font-semibold tracking-[-0.08em] text-black/10 transition-colors group-hover:text-black/20 md:text-8xl">
                      {item.coverText}
                    </span>

                    <h3
                      className="
                        max-w-xl
                        text-[28px]
                        font-semibold
                        leading-[1.08]
                        tracking-[-0.04em]

                        sm:text-4xl
                      "
                    >
                      {item.title}
                    </h3>

                    <div className="mt-7 flex flex-wrap items-center justify-between gap-3 text-sm">

                      <span>
                        {item.author}
                      </span>

                      <span className="text-black/50">
                        {item.readTime}
                      </span>

                    </div>

                  </div>

                </div>

              </Link>
            ))}

          </div>

        </div>

      </section>

      {/* ======================================================
          CTA
      ====================================================== */}

      <section className="border-t border-black bg-black px-5 py-20 text-[#f5f1e8] sm:px-8 md:py-28 lg:px-12 xl:px-16">

        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[1fr_auto] lg:items-end">

          <div>

            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-white/40">
              Have something to say?
            </p>

            <h2
              className="
                max-w-[1100px]
                text-[12vw]
                font-semibold
                leading-[0.84]
                tracking-[-0.065em]

                sm:text-[9vw]

                md:text-[6vw]
              "
            >
              SHARE YOUR
              <br />
              PERSPECTIVE.
            </h2>

          </div>

          <Link
            href="/write"
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl text-black transition-all duration-500 hover:rotate-45 hover:scale-105 md:h-24 md:w-24"
            style={{
              backgroundColor: story.accent,
            }}
          >
            ↗
          </Link>

        </div>

      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-white/10 bg-black px-5 py-10 text-[#f5f1e8] sm:px-8 lg:px-12 xl:px-16">

        <div className="mx-auto flex max-w-[1500px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href="/"
            className="text-xl font-semibold tracking-[-0.04em]"
          >
            MINDSCAPE
          </Link>

          <div className="flex flex-wrap gap-6 text-xs text-white/40">

            <Link
              href="/#stories"
              className="transition-colors hover:text-white"
            >
              Stories
            </Link>

            <Link
              href="/#topics"
              className="transition-colors hover:text-white"
            >
              Topics
            </Link>

            <Link
              href="/#writers"
              className="transition-colors hover:text-white"
            >
              Writers
            </Link>

          </div>

          <p className="text-xs text-white/30">
            © 2026 Mindscape
          </p>

        </div>

      </footer>

    </main>
  );
}