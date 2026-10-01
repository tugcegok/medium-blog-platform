"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  apiFetch,
  clearAuthTokens,
} from "../lib/api";

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// CURRENT USER TYPE
// ============================================================

type CurrentUser = {
  id: number;
  username: string;
  email: string;
  bio?: string | null;
  profile_image?: string | null;
  cover_image?: string | null;
  website?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  is_active: boolean;
  is_email_verified: boolean;
  role?: string;
};

export default function Home() {
  const router = useRouter();

  // ============================================================
  // FEATURED STORIES
  // ============================================================

  const stories = [
    {
      category: "Artificial Intelligence",
      title: "The Future of Artificial Intelligence",
      author: "Tuğçe Gök",
      readTime: "8 min read",
      description:
        "Exploring how artificial intelligence is changing the way we build, learn and create.",
      cover: "ai",
      slug: "the-future-of-artificial-intelligence",
    },
    {
      category: "Backend Engineering",
      title: "Building Better APIs with FastAPI",
      author: "Tuğçe Gök",
      readTime: "6 min read",
      description:
        "A practical look at building clean, secure and scalable backend systems with FastAPI.",
      cover: "backend",
      slug: "building-better-apis-with-fastapi",
    },
    {
      category: "Design",
      title: "Designing Digital Experiences That Feel Human",
      author: "Elif Demir",
      readTime: "7 min read",
      description:
        "How thoughtful design choices can make digital products feel more natural and intuitive.",
      cover: "design",
      slug: "designing-digital-experiences-that-feel-human",
    },
  ];

  // ============================================================
  // TRENDING STORIES
  // ============================================================

  const trendingStories = [
    {
      category: "Artificial Intelligence",
      title: "How AI Is Changing the Way We Create",
      author: "Tuğçe Gök",
      readTime: "12 min read",
      preview: "AI",
      slug: "how-ai-is-changing-the-way-we-create",
    },
    {
      category: "Engineering",
      title: "Why Good Backend Architecture Matters",
      author: "Deniz Kaya",
      readTime: "9 min read",
      preview: "API",
      slug: "why-good-backend-architecture-matters",
    },
    {
      category: "Design",
      title: "Designing Interfaces That Feel Invisible",
      author: "Elif Demir",
      readTime: "7 min read",
      preview: "UX",
      slug: "designing-interfaces-that-feel-invisible",
    },
  ];

  // ============================================================
  // TOPICS
  // ============================================================

  const topics = [
    {
      number: "01",
      name: "Technology",
      description:
        "Ideas shaping the tools, systems and technologies of tomorrow.",
    },
    {
      number: "02",
      name: "Design",
      description:
        "Thinking beyond aesthetics to create meaningful experiences.",
    },
    {
      number: "03",
      name: "Culture",
      description:
        "Stories exploring how we live, think and connect.",
    },
    {
      number: "04",
      name: "Science",
      description:
        "Understanding discoveries that are changing our world.",
    },
  ];

  // ============================================================
  // LATEST STORIES
  // ============================================================

  const latestStories = [
    {
      category: "Artificial Intelligence",
      title: "What Happens When Machines Learn to Create?",
      author: "Tuğçe Gök",
      readTime: "10 min read",
      preview: "AI",
      background: "#c7d2fe",
      slug: "what-happens-when-machines-learn-to-create",
    },
    {
      category: "Engineering",
      title: "Building APIs That Developers Actually Enjoy Using",
      author: "Deniz Kaya",
      readTime: "8 min read",
      preview: "API",
      background: "#fde68a",
      slug: "building-apis-that-developers-actually-enjoy-using",
    },
    {
      category: "Design",
      title: "Why the Best Interfaces Almost Disappear",
      author: "Elif Demir",
      readTime: "6 min read",
      preview: "UX",
      background: "#fecdd3",
      slug: "why-the-best-interfaces-almost-disappear",
    },
  ];

  // ============================================================
  // FEATURED WRITERS
  // ============================================================

  const writers = [
    {
      name: "Tuğçe Gök",
      slug: "tugce-gok",
      role: "Backend Developer & Writer",
      bio:
        "Writing about backend engineering, artificial intelligence and software development.",
      followers: "3.4K followers",
      initials: "TG",
    },
    {
      name: "Elif Demir",
      slug: "elif-demir",
      role: "Product Designer",
      bio:
        "Exploring digital design, user experience and the systems behind thoughtful interfaces.",
      followers: "2.1K followers",
      initials: "ED",
    },
    {
      name: "Deniz Kaya",
      slug: "deniz-kaya",
      role: "Software Engineer",
      bio:
        "Writing about scalable systems, APIs and software architecture.",
      followers: "1.8K followers",
      initials: "DK",
    },
  ];

  // ============================================================
  // STATE
  // ============================================================

  const [activeStory, setActiveStory] =
    useState(0);

  const [activeTrending, setActiveTrending] =
    useState(0);

  const [isCoverOpen, setIsCoverOpen] =
    useState(false);

  const [isSearchOpen, setIsSearchOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  ] = useState(false);

  const [isScrolled, setIsScrolled] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState("hero");

  const [
    followedWriters,
    setFollowedWriters,
  ] = useState<string[]>([]);

  // ============================================================
  // AUTH STATE
  // ============================================================

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [isUserLoading, setIsUserLoading] =
    useState(true);

  // ============================================================
  // REFS
  // ============================================================

  const heroRef =
    useRef<HTMLDivElement | null>(null);

  const featuredRef =
    useRef<HTMLDivElement | null>(null);

  const storiesSectionRef =
    useRef<HTMLElement | null>(null);

  const storyItemsRef =
    useRef<HTMLDivElement | null>(null);

  const trendingSectionRef =
    useRef<HTMLElement | null>(null);

  const trendingPreviewRef =
    useRef<HTMLDivElement | null>(null);

  const searchInputRef =
    useRef<HTMLInputElement | null>(null);

  // ============================================================
  // CURRENT USER
  // ============================================================

  useEffect(() => {
    const getCurrentUser = async () => {
      const accessToken =
        localStorage.getItem(
          "access_token"
        );

      const refreshToken =
        localStorage.getItem(
          "refresh_token"
        );

      // Kullanıcı hiç giriş yapmamışsa
      if (
        !accessToken &&
        !refreshToken
      ) {
        setCurrentUser(null);
        setIsUserLoading(false);
        return;
      }

      try {
        setIsUserLoading(true);

        // Normal fetch yerine apiFetch.
        //
        // Access token geçerliyse:
        // GET /users/me direkt çalışır.
        //
        // Access token geçersizse:
        // refresh_token ile yeni access token alınır
        // ve GET /users/me tekrar gönderilir.
        const response =
          await apiFetch(
            "/users/me",
            {
              method: "GET",
            }
          );

        if (!response.ok) {
          clearAuthTokens();

          setCurrentUser(null);

          return;
        }

        const data: CurrentUser =
          await response.json();

        console.log(
          "Current user:",
          data
        );

        setCurrentUser(data);
      } catch (error) {
        console.error(
          "Current user error:",
          error
        );

        setCurrentUser(null);
      } finally {
        setIsUserLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    clearAuthTokens();

    setCurrentUser(null);

    router.push("/login");
  };

  // ============================================================
  // OPEN STORY
  // ============================================================

  const openStory = (slug: string) => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setSearchQuery("");

    router.push(`/stories/${slug}`);
  };

  // ============================================================
  // OPEN WRITER PROFILE
  // ============================================================

  const openWriterProfile = (
    slug: string
  ) => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);

    router.push(`/writers/${slug}`);
  };

  // ============================================================
  // SEARCH DATA
  // ============================================================

  const searchableStories =
    useMemo(() => {
      const combined = [
        ...stories.map((story) => ({
          ...story,
          section: "Featured",
        })),

        ...trendingStories.map(
          (story) => ({
            ...story,
            section: "Trending",
          })
        ),

        ...latestStories.map(
          (story) => ({
            ...story,
            section: "Latest",
          })
        ),
      ];

      return combined.filter(
        (story, index, array) =>
          array.findIndex(
            (item) =>
              item.slug ===
              story.slug
          ) === index
      );

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  const filteredStories =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLocaleLowerCase(
            "tr-TR"
          );

      if (!query) {
        return searchableStories;
      }

      return searchableStories.filter(
        (story) => {
          const searchableText = `
            ${story.title}
            ${story.category}
            ${story.author}
            ${story.section}
          `.toLocaleLowerCase(
            "tr-TR"
          );

          return searchableText.includes(
            query
          );
        }
      );
    }, [
      searchQuery,
      searchableStories,
    ]);

  // ============================================================
  // SEARCH KEYBOARD
  // ============================================================

  useEffect(() => {
    const handleKeyboard = (
      event: KeyboardEvent
    ) => {
      const isSearchShortcut =
        (event.metaKey ||
          event.ctrlKey) &&
        event.key.toLowerCase() ===
          "k";

      if (isSearchShortcut) {
        event.preventDefault();

        setIsSearchOpen(
          (current) =>
            !current
        );
      }

      if (
        event.key === "Escape" &&
        isSearchOpen
      ) {
        setIsSearchOpen(false);
      }

      if (
        event.key === "Escape" &&
        isMobileMenuOpen
      ) {
        setIsMobileMenuOpen(
          false
        );
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  }, [
    isSearchOpen,
    isMobileMenuOpen,
  ]);

  // ============================================================
  // SEARCH MODAL
  // ============================================================

  useEffect(() => {
    if (!isSearchOpen) {
      document.body.style.overflow =
        "";
      return;
    }

    document.body.style.overflow =
      "hidden";

    const timer =
      window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 120);

    return () => {
      document.body.style.overflow =
        "";

      window.clearTimeout(timer);
    };
  }, [isSearchOpen]);

  // ============================================================
  // NAVBAR SCROLL
  // ============================================================

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(
        window.scrollY > 30
      );
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  // ============================================================
  // ACTIVE NAVBAR SECTION
  // ============================================================

  useEffect(() => {
    const ids = [
      "hero",
      "stories",
      "trending",
      "topics",
      "writers",
    ];

    const sections = ids
      .map((id) =>
        document.getElementById(
          id
        )
      )
      .filter(
        Boolean
      ) as HTMLElement[];

    const observer =
      new IntersectionObserver(
        (entries) => {
          const visibleEntry =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              )[0];

          if (visibleEntry) {
            setActiveSection(
              visibleEntry.target.id
            );
          }
        },
        {
          rootMargin:
            "-25% 0px -55% 0px",
          threshold: [
            0.1,
            0.25,
            0.5,
          ],
        }
      );

    sections.forEach(
      (section) => {
        observer.observe(section);
      }
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  // ============================================================
  // FEATURED STORY CHANGE
  // ============================================================

  useEffect(() => {
    if (!featuredRef.current)
      return;

    setIsCoverOpen(false);

    const shell =
      featuredRef.current.querySelector(
        ".story-cover-shell"
      );

    const info =
      featuredRef.current.querySelector(
        ".story-info"
      );

    if (!shell || !info) return;

    const timeline =
      gsap.timeline();

    timeline.fromTo(
      shell,
      {
        x: 70,
        y: 35,
        rotate: 4,
        scale: 0.95,
        opacity: 0,
      },
      {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
        duration: 0.9,
        ease: "power4.out",
      }
    );

    timeline.fromTo(
      info,
      {
        x: 35,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.65,
        ease: "power3.out",
      },
      "-=0.55"
    );

    return () => {
      timeline.kill();
    };
  }, [activeStory]);

  // ============================================================
  // HERO ANIMATION
  // ============================================================

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(
      () => {
        const lines =
          heroRef.current?.querySelectorAll(
            ".hero-line"
          );

        if (!lines) return;

        gsap.fromTo(
          lines,
          {
            yPercent: 110,
            rotate: 2,
          },
          {
            yPercent: 0,
            rotate: 0,
            duration: 1.15,
            stagger: 0.12,
            ease: "power4.out",
          }
        );

        gsap.to(lines, {
          y: -45,

          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      },
      heroRef
    );

    return () => ctx.revert();
  }, []);

  // ============================================================
  // FEATURED SECTION ANIMATION
  // ============================================================

  useEffect(() => {
    if (
      !storiesSectionRef.current
    ) {
      return;
    }

    const ctx = gsap.context(
      () => {
        gsap.fromTo(
          storiesSectionRef.current,
          {
            opacity: 0,
            y: 70,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",

            scrollTrigger: {
              trigger:
                storiesSectionRef.current,
              start: "top 82%",
            },
          }
        );
      },
      storiesSectionRef
    );

    return () => ctx.revert();
  }, []);

  // ============================================================
  // FEATURED STORY ROWS
  // ============================================================

  useEffect(() => {
    if (!storyItemsRef.current)
      return;

    const ctx = gsap.context(
      () => {
        const items =
          storyItemsRef.current?.querySelectorAll(
            ".story-item"
          );

        if (!items) return;

        gsap.fromTo(
          items,
          {
            y: 50,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.16,
            ease: "power3.out",

            scrollTrigger: {
              trigger:
                storyItemsRef.current,
              start: "top 82%",
            },
          }
        );
      },
      storyItemsRef
    );

    return () => ctx.revert();
  }, []);

  // ============================================================
  // TRENDING SECTION ANIMATION
  // ============================================================

  useEffect(() => {
    if (
      !trendingSectionRef.current
    ) {
      return;
    }

    const ctx = gsap.context(
      () => {
        gsap.fromTo(
          trendingSectionRef.current,
          {
            opacity: 0,
            y: 60,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",

            scrollTrigger: {
              trigger:
                trendingSectionRef.current,
              start: "top 85%",
            },
          }
        );
      },
      trendingSectionRef
    );

    return () => ctx.revert();
  }, []);

  // ============================================================
  // TRENDING PREVIEW ANIMATION
  // ============================================================

  useEffect(() => {
    if (
      !trendingPreviewRef.current
    ) {
      return;
    }

    const ctx = gsap.context(
      () => {
        const elements =
          trendingPreviewRef.current?.querySelectorAll(
            ".trending-animate"
          );

        const symbol =
          trendingPreviewRef.current?.querySelector(
            ".trending-symbol"
          );

        if (elements) {
          gsap.fromTo(
            elements,
            {
              y: 28,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.07,
              ease: "power4.out",
            }
          );
        }

        if (symbol) {
          gsap.fromTo(
            symbol,
            {
              scale: 0.86,
              rotate: -3,
              opacity: 0,
            },
            {
              scale: 1,
              rotate: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power4.out",
            }
          );
        }
      },
      trendingPreviewRef
    );

    return () => ctx.revert();
  }, [activeTrending]);

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f1e8] text-black">

      {/* ========================================================
          NAVBAR
      ======================================================== */}

      <nav
        className={`
          sticky top-0 z-50
          border-b
          transition-all
          duration-500

          ${
            isScrolled
              ? "border-black/10 bg-[#f5f1e8]/95 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl"
              : "border-black/10 bg-[#f5f1e8]/90 backdrop-blur-xl"
          }
        `}
      >
        <div
          className={`
            mx-auto
            flex
            w-full
            max-w-[1600px]
            items-center
            justify-between
            px-5
            transition-all
            duration-500
            sm:px-8
            md:px-10
            lg:px-14

            ${
              isScrolled
                ? "h-[60px] md:h-[64px]"
                : "h-[68px] md:h-[76px]"
            }
          `}
        >
          <a
            href="/"
            className="group flex items-center gap-3 text-lg font-semibold tracking-[-0.04em] sm:text-xl md:text-2xl"
          >
            <span
              className={`
                rounded-full
                bg-[#7957ff]
                transition-all
                duration-500
                group-hover:scale-[1.7]

                ${
                  isScrolled
                    ? "h-2 w-2"
                    : "h-2.5 w-2.5"
                }
              `}
            />

            MINDSCAPE
          </a>

          <div className="hidden items-center gap-8 lg:flex">

            {[
              ["Explore", "stories"],
              ["Trending", "trending"],
              ["Topics", "topics"],
              ["Writers", "writers"],
            ].map(
              ([label, section]) => {
                const isActive =
                  activeSection ===
                  section;

                return (
                  <a
                    key={label}
                    href={`#${section}`}
                    className={`
                      group
                      relative
                      py-2
                      text-sm
                      transition-colors
                      duration-300

                      ${
                        isActive
                          ? "text-black"
                          : "text-black/50 hover:text-black"
                      }
                    `}
                  >
                    {label}

                    <span
                      className={`
                        absolute
                        bottom-0
                        left-0
                        h-px
                        bg-black
                        transition-all
                        duration-300

                        ${
                          isActive
                            ? "w-full"
                            : "w-0 group-hover:w-full"
                        }
                      `}
                    />
                  </a>
                );
              }
            )}

            <button
              type="button"
              onClick={() =>
                setIsSearchOpen(true)
              }
              className="group flex items-center gap-2 text-sm text-black/50 transition-colors hover:text-black"
            >
              Search

              <span className="rounded-md border border-black/15 px-2 py-1 text-[10px] text-black/40 transition-colors group-hover:border-black/30">
                ⌘K
              </span>
            </button>

          </div>

          <div className="flex items-center gap-3 md:gap-4">

            <a
              href="/write"
              className="hidden text-sm text-black/70 transition-opacity hover:opacity-50 sm:block"
            >
              Write
            </a>

            {!isUserLoading &&
              (currentUser ? (
                <div className="hidden items-center gap-3 sm:flex">

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/profile"
                      )
                    }
                    className="flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm transition-colors hover:border-black"
                  >

                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-[10px] uppercase text-[#f5f1e8]">
                      {currentUser.username
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>

                    <span>
                      {currentUser.username}
                    </span>

                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full border border-black px-5 py-2 text-sm transition-all duration-300 hover:bg-black hover:text-[#f5f1e8]"
                  >
                    Logout
                  </button>

                </div>
              ) : (
                <a
                  href="/login"
                  className="hidden rounded-full border border-black px-5 py-2 text-sm transition-all duration-300 hover:bg-black hover:text-[#f5f1e8] sm:block"
                >
                  Sign in
                </a>
              ))}

            <button
              type="button"
              onClick={() =>
                setIsSearchOpen(true)
              }
              aria-label="Search stories"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-lg transition-all hover:border-black/30 lg:hidden"
            >
              ⌕
            </button>

            <button
              type="button"
              onClick={() =>
                setIsMobileMenuOpen(
                  (current) =>
                    !current
                )
              }
              aria-label="Open navigation menu"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 lg:hidden"
            >
              <div className="relative h-4 w-5">

                <span
                  className={`
                    absolute
                    left-0
                    h-px
                    w-5
                    bg-black
                    transition-all
                    duration-300

                    ${
                      isMobileMenuOpen
                        ? "top-[7px] rotate-45"
                        : "top-[3px]"
                    }
                  `}
                />

                <span
                  className={`
                    absolute
                    left-0
                    h-px
                    w-5
                    bg-black
                    transition-all
                    duration-300

                    ${
                      isMobileMenuOpen
                        ? "top-[7px] -rotate-45"
                        : "top-[10px]"
                    }
                  `}
                />

              </div>
            </button>

          </div>

        </div>

        {/* MOBILE MENU */}

        <div
          className={`
            overflow-hidden
            bg-[#f5f1e8]
            transition-all
            duration-500
            lg:hidden

            ${
              isMobileMenuOpen
                ? "max-h-[620px] border-t border-black/10 opacity-100"
                : "max-h-0 border-t border-transparent opacity-0"
            }
          `}
        >
          <div className="px-5 py-7 sm:px-8">

            {[
              ["Explore", "stories"],
              ["Trending", "trending"],
              ["Topics", "topics"],
              ["Writers", "writers"],
            ].map(
              (
                [label, section],
                index
              ) => (
                <a
                  key={label}
                  href={`#${section}`}
                  onClick={() =>
                    setIsMobileMenuOpen(
                      false
                    )
                  }
                  className="group flex items-center justify-between border-b border-black/10 py-5"
                >
                  <div className="flex items-center gap-5">

                    <span className="text-xs text-black/30">
                      0{index + 1}
                    </span>

                    <span className="text-2xl font-medium tracking-[-0.03em]">
                      {label}
                    </span>

                  </div>

                  <span className="text-xl transition-transform duration-300 group-hover:translate-x-1">
                    ↗
                  </span>
                </a>
              )
            )}

            <div className="mt-8 grid grid-cols-2 gap-3">

              <a
                href="/write"
                className="flex h-12 items-center justify-center rounded-full border border-black text-sm transition-colors hover:bg-black hover:text-white"
              >
                Write
              </a>

              {currentUser ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-12 items-center justify-center rounded-full bg-black text-sm text-[#f5f1e8] transition-opacity hover:opacity-80"
                >
                  Logout
                </button>
              ) : (
                <a
                  href="/login"
                  className="flex h-12 items-center justify-center rounded-full bg-black text-sm text-[#f5f1e8] transition-opacity hover:opacity-80"
                >
                  Sign in
                </a>
              )}

            </div>

            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(
                    false
                  );

                  router.push(
                    "/profile"
                  );
                }}
                className="mt-5 w-full rounded-[18px] border border-black/10 p-4 text-left transition-colors hover:border-black/30"
              >

                <p className="text-[10px] uppercase tracking-[0.2em] text-black/35">
                  Signed in as
                </p>

                <p className="mt-2 text-sm font-medium">
                  {currentUser.username}
                </p>

                <p className="mt-1 text-xs text-black/45">
                  {currentUser.email}
                </p>

              </button>
            )}

          </div>
        </div>

      </nav>

      {/* ========================================================
          SEARCH MODAL
      ======================================================== */}

      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/35 px-4 pt-[9vh] backdrop-blur-md sm:px-6"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setIsSearchOpen(false);
            }
          }}
        >
          <div className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-black/10 bg-[#fffdf7] shadow-[0_40px_120px_rgba(0,0,0,0.25)]">

            <div className="flex items-center gap-4 border-b border-black/10 px-5 py-5 sm:px-7">

              <span className="text-xl text-black/35">
                ⌕
              </span>

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search stories, topics or writers..."
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-black/30 sm:text-lg"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery("")
                  }
                  className="hidden text-xs text-black/40 hover:text-black sm:block"
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setIsSearchOpen(false)
                }
                aria-label="Close search"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 transition-all hover:border-black hover:bg-black hover:text-white"
              >
                ×
              </button>

            </div>

            <div className="flex items-center justify-between border-b border-black/10 px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-black/35 sm:px-7">

              <span>
                {searchQuery
                  ? `${filteredStories.length} results`
                  : "Explore Mindscape"}
              </span>

              <span>
                ESC to close
              </span>

            </div>

            <div className="max-h-[62vh] overflow-y-auto">

              {filteredStories.length >
              0 ? (
                filteredStories.map(
                  (story, index) => (
                    <button
                      key={story.slug}
                      type="button"
                      onClick={() =>
                        openStory(
                          story.slug
                        )
                      }
                      className="group grid w-full grid-cols-[36px_minmax(0,1fr)_auto] gap-4 border-b border-black/10 px-5 py-5 text-left transition-colors last:border-b-0 hover:bg-black/[0.035] sm:grid-cols-[46px_minmax(0,1fr)_auto] sm:px-7 sm:py-6"
                    >
                      <span className="pt-1 text-xs text-black/30">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <div className="min-w-0">

                        <div className="mb-2 flex flex-wrap items-center gap-2">

                          <span className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                            {story.category}
                          </span>

                          <span className="h-1 w-1 rounded-full bg-black/20" />

                          <span className="text-[10px] uppercase tracking-[0.2em] text-[#7957ff]">
                            {story.section}
                          </span>

                        </div>

                        <h3 className="text-lg font-medium leading-tight tracking-[-0.02em] transition-transform duration-300 group-hover:translate-x-1 sm:text-xl">
                          {story.title}
                        </h3>

                        <p className="mt-2 text-xs text-black/45">
                          {story.author} ·{" "}
                          {story.readTime}
                        </p>

                      </div>

                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 transition-all group-hover:border-black group-hover:bg-black group-hover:text-white">
                        ↗
                      </span>

                    </button>
                  )
                )
              ) : (
                <div className="px-6 py-16 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-black/10 text-xl text-black/30">
                    ⌕
                  </div>

                  <h3 className="mt-6 text-xl font-medium">
                    No stories found.
                  </h3>

                  <p className="mt-2 text-sm text-black/45">
                    Try another title,
                    category or writer.
                  </p>

                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          HERO
      ======================================================== */}

      <section
        id="hero"
        className="relative min-h-[calc(100vh-68px)] overflow-hidden md:min-h-[calc(100vh-76px)]"
      >
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-68px)] w-full max-w-[1600px] flex-col justify-between px-5 py-8 sm:px-8 md:min-h-[calc(100vh-76px)] md:px-10 md:py-10 lg:px-14">

          <div className="flex items-start justify-between border-b border-black/15 pb-5">

            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#7957ff]" />

              <p className="text-[10px] uppercase tracking-[0.28em] sm:text-xs">
                Independent Publishing
              </p>
            </div>

            <div className="hidden items-center gap-8 md:flex">

              <p className="text-xs uppercase tracking-[0.22em] text-black/40">
                Stories · Ideas · Perspectives
              </p>

              <p className="text-xs uppercase tracking-[0.22em] text-black/40">
                2026 / 08
              </p>

            </div>

          </div>

          <div
            ref={heroRef}
            className="relative py-10 md:py-14"
          >

            <div className="overflow-hidden">
              <div className="hero-line">

                <h1 className="whitespace-nowrap text-[18vw] font-semibold leading-[0.76] tracking-[-0.08em] sm:text-[15.5vw] md:text-[12vw] xl:text-[11rem]">
                  IDEAS
                </h1>

              </div>
            </div>

            <div className="overflow-hidden">

              <div className="hero-line flex items-center">

                <h1 className="whitespace-nowrap text-[18vw] font-semibold leading-[0.76] tracking-[-0.08em] sm:text-[15.5vw] md:text-[12vw] xl:text-[11rem]">
                  WORTH
                </h1>

                <div className="ml-8 hidden h-px flex-1 bg-black/20 lg:block" />

              </div>

            </div>

            <div className="overflow-hidden">

              <div className="hero-line flex min-w-0 items-end">

                <h1 className="whitespace-nowrap text-[17vw] font-semibold leading-[0.76] tracking-[-0.08em] sm:text-[15vw] md:text-[11.5vw] xl:text-[10.5rem]">
                  SHARING
                </h1>

                <span className="ml-2 shrink-0 text-[13vw] leading-[0.65] text-[#7957ff] md:ml-4 md:text-[8vw] xl:text-[7rem]">
                  .
                </span>

              </div>

            </div>

            <div className="absolute right-[5%] top-[8%] hidden xl:block">

              <div className="flex h-28 w-28 rotate-6 items-center justify-center rounded-full border border-black/20 text-center text-[10px] uppercase leading-[1.8] tracking-[0.22em] text-black/50">
                Read
                <br />
                Think
                <br />
                Share
              </div>

            </div>

          </div>

          <div className="grid gap-8 border-t border-black/15 pt-6 md:grid-cols-[1fr_auto_1fr] md:items-end">

            <div>

              <p className="max-w-xl text-base leading-relaxed text-black/65 sm:text-lg md:text-xl">
                A publishing space for people who still believe
                ideas deserve time, context and thoughtful writing.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-black/40 sm:text-xs">

                <span className="h-px w-8 bg-black/30" />

                Technology · Design · Culture · Science

              </div>

            </div>

            <a
              href="#stories"
              aria-label="Explore stories"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-xl text-[#f5f1e8] transition-all duration-500 hover:rotate-45 hover:scale-105 md:h-[72px] md:w-[72px]"
            >
              ↓
            </a>

            <div className="hidden justify-self-end text-right md:block">

              <p className="text-xs uppercase tracking-[0.25em] text-black/40">
                Current Edition
              </p>

              <p className="mt-3 text-sm">
                Issue No. 08
              </p>

              <p className="mt-1 text-sm text-black/50">
                August 2026
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          FEATURED STORIES
      ======================================================== */}

      <section
        ref={storiesSectionRef}
        id="stories"
        className="border-t border-black/20 py-20 md:py-28"
      >
        <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 md:px-10 lg:px-14">

          <div className="mb-14 flex flex-col gap-7 md:mb-20 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="mb-3 text-sm uppercase tracking-[0.3em]">
                Featured
              </p>

              <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl md:text-6xl">
                Stories worth your time.
              </h2>

            </div>

            <p className="max-w-sm text-sm leading-relaxed text-black/55 md:text-right">
              Thoughtful writing from curious minds across
              technology, design and culture.
            </p>

          </div>

          <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">

            <div
              ref={storyItemsRef}
              className="flex min-w-0 flex-col"
            >

              {stories.map(
                (story, index) => (
                  <article
                    key={story.slug}
                    onMouseEnter={() =>
                      setActiveStory(index)
                    }
                    onClick={() =>
                      openStory(
                        story.slug
                      )
                    }
                    className={`
                      story-item
                      group
                      cursor-pointer
                      border-t
                      border-black
                      py-8
                      transition-all
                      duration-300
                      md:py-10

                      ${
                        index ===
                        activeStory
                          ? "opacity-100"
                          : "opacity-45 hover:opacity-100"
                      }

                      ${
                        index ===
                        stories.length -
                          1
                          ? "border-b"
                          : ""
                      }
                    `}
                  >
                    <div className="flex gap-5 sm:gap-8">

                      <span className="shrink-0 pt-1 text-sm text-black/40">
                        0{index + 1}
                      </span>

                      <div className="min-w-0 flex-1">

                        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-black/45">
                          {story.category}
                        </p>

                        <h3 className="text-2xl font-medium leading-[1.08] tracking-[-0.025em] transition-transform duration-300 group-hover:translate-x-2 sm:text-3xl md:text-[2.35rem]">
                          {story.title}
                        </h3>

                        <p className="mt-5 text-sm text-black/55">
                          {story.author} ·{" "}
                          {story.readTime}
                        </p>

                      </div>

                    </div>

                  </article>
                )
              )}

            </div>

            <div className="h-fit min-w-0 lg:sticky lg:top-28">

              <div
                ref={featuredRef}
                className="relative min-h-[560px] md:min-h-[680px]"
                style={{
                  perspective:
                    "1600px",
                }}
                onMouseEnter={() =>
                  setIsCoverOpen(true)
                }
                onMouseLeave={() =>
                  setIsCoverOpen(false)
                }
              >

                <div className="absolute left-[8%] top-7 h-[calc(100%-56px)] w-[76%] rotate-[5deg] rounded-[28px] bg-[#7957ff] opacity-35 shadow-[0_25px_60px_rgba(0,0,0,0.10)]" />

                <div className="absolute left-[4%] top-4 h-[calc(100%-32px)] w-[79%] rotate-[2.5deg] rounded-[28px] bg-[#ffb4a2] opacity-60 shadow-[0_25px_60px_rgba(0,0,0,0.12)]" />

                <div
                  className="story-info absolute inset-y-8 right-0 w-[88%] overflow-hidden rounded-[28px] border border-black/10 bg-[#fffdf7] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.12)] md:w-[82%] md:p-10"
                  style={{
                    transform:
                      isCoverOpen
                        ? "translateX(18px) scale(1)"
                        : "translateX(0px) scale(0.985)",

                    transition:
                      "transform 700ms cubic-bezier(0.22,1,0.36,1)",
                  }}
                >

                  <div className="flex h-full flex-col justify-between">

                    <div className="pl-[24%] md:pl-[28%]">

                      <p className="text-xs uppercase tracking-[0.25em] text-black/40">
                        About this story
                      </p>

                      <h3 className="mt-6 break-words text-2xl font-semibold leading-tight md:text-3xl">
                        {
                          stories[
                            activeStory
                          ].title
                        }
                      </h3>

                      <p className="mt-6 text-sm leading-relaxed text-black/60">
                        {
                          stories[
                            activeStory
                          ].description
                        }
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          openStory(
                            stories[
                              activeStory
                            ].slug
                          )
                        }
                        className="group mt-8 flex items-center gap-3 text-sm font-medium"
                      >
                        Read story

                        <span className="transition-transform duration-300 group-hover:translate-x-2">
                          →
                        </span>

                      </button>

                    </div>

                    <div className="ml-[24%] grid grid-cols-1 gap-5 border-t border-black/10 pt-6 sm:grid-cols-2 md:ml-[28%]">

                      <div>

                        <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                          Author
                        </p>

                        <p className="mt-2 text-sm font-medium">
                          {
                            stories[
                              activeStory
                            ].author
                          }
                        </p>

                      </div>

                      <div>

                        <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                          Reading time
                        </p>

                        <p className="mt-2 text-sm font-medium">
                          {
                            stories[
                              activeStory
                            ].readTime
                          }
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                <div
                  key={activeStory}
                  className="story-cover-shell relative z-10 w-[82%]"
                >

                  <div
                    onClick={() =>
                      openStory(
                        stories[
                          activeStory
                        ].slug
                      )
                    }
                    className="relative min-h-[560px] origin-left cursor-pointer overflow-hidden rounded-[28px] md:min-h-[680px]"
                    style={{
                      transformStyle:
                        "preserve-3d",

                      transform:
                        isCoverOpen
                          ? "perspective(1600px) rotateY(-27deg) translateX(-22px)"
                          : "perspective(1600px) rotateY(0deg) translateX(0px)",

                      transition:
                        "transform 750ms cubic-bezier(0.22,1,0.36,1)",

                      boxShadow:
                        isCoverOpen
                          ? "0 45px 110px rgba(0,0,0,0.27)"
                          : "0 35px 90px rgba(0,0,0,0.18)",
                    }}
                  >

                    {stories[
                      activeStory
                    ].cover ===
                      "ai" && (
                      <div className="absolute inset-0 bg-[#c9d8b6] p-8 text-black">

                        <div className="flex items-center justify-between gap-4">

                          <span className="text-xs uppercase tracking-[0.25em]">
                            Artificial Intelligence
                          </span>

                          <span className="text-xs">
                            01
                          </span>

                        </div>

                        <span className="absolute left-8 top-[24%] text-[7rem] font-semibold leading-none tracking-[-0.08em] text-black/10 md:text-[10rem]">
                          AI
                        </span>

                        <div className="absolute bottom-8 left-8 right-8">

                          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-black/50">
                            Featured Story
                          </p>

                          <h3 className="break-words text-4xl font-semibold leading-[0.92] tracking-[-0.04em] md:text-6xl">
                            {
                              stories[
                                activeStory
                              ].title
                            }
                          </h3>

                        </div>

                      </div>
                    )}

                    {stories[
                      activeStory
                    ].cover ===
                      "backend" && (
                      <div className="absolute inset-0 bg-[#0f172a] p-8 text-white">

                        <div className="flex items-center justify-between gap-4">

                          <span className="text-xs uppercase tracking-[0.25em] text-white/60">
                            Backend Engineering
                          </span>

                          <span className="text-xs text-white/60">
                            02
                          </span>

                        </div>

                        <div className="absolute left-8 top-[22%] max-w-[70%] font-mono text-[11px] leading-7 text-cyan-300/60 md:text-sm">

                          <p>
                            POST /api/posts
                          </p>

                          <p>
                            Authorization:
                            Bearer token
                          </p>

                          <p>
                            200 OK
                          </p>

                          <p>
                            FastAPI
                          </p>

                          <p>
                            SQLAlchemy
                          </p>

                          <p>
                            JWT Authentication
                          </p>

                        </div>

                        <span className="absolute bottom-[22%] right-5 text-[7rem] font-semibold leading-none text-white/10 md:text-[9rem]">
                          API
                        </span>

                        <div className="absolute bottom-8 left-8 right-8">

                          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-white/50">
                            Featured Story
                          </p>

                          <h3 className="break-words text-4xl font-semibold leading-[0.92] tracking-[-0.04em] md:text-6xl">
                            {
                              stories[
                                activeStory
                              ].title
                            }
                          </h3>

                        </div>

                      </div>
                    )}

                    {stories[
                      activeStory
                    ].cover ===
                      "design" && (
                      <div className="absolute inset-0 bg-[#ffb4a2] p-8 text-black">

                        <div className="flex items-center justify-between">

                          <span className="text-xs uppercase tracking-[0.25em]">
                            Design
                          </span>

                          <span className="text-xs">
                            03
                          </span>

                        </div>

                        <span className="absolute left-8 top-[24%] text-[7rem] font-semibold leading-none tracking-[-0.08em] text-[#7957ff] md:text-[9rem]">
                          UX
                        </span>

                        <div className="absolute bottom-8 left-8 right-8">

                          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-black/50">
                            Featured Story
                          </p>

                          <h3 className="break-words text-4xl font-semibold leading-[0.92] tracking-[-0.04em] md:text-6xl">
                            {
                              stories[
                                activeStory
                              ].title
                            }
                          </h3>

                        </div>

                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          TRENDING
      ======================================================== */}

      <section
        ref={trendingSectionRef}
        id="trending"
        className="border-t border-black/20 py-20 md:py-28"
      >
        <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 md:px-10 lg:px-14">

          <div className="mb-14 flex flex-col gap-7 md:mb-16 md:flex-row md:items-end md:justify-between">

            <div>

              <div className="mb-4 flex items-center gap-3">

                <span className="h-2 w-2 rounded-full bg-[#ff623d]" />

                <p className="text-sm uppercase tracking-[0.3em]">
                  Trending
                </p>

              </div>

              <h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl md:text-6xl">
                What people are reading.
              </h2>

            </div>

            <p className="max-w-sm text-sm leading-relaxed text-black/55 md:text-right">
              A selection of stories getting attention across
              the community right now.
            </p>

          </div>

          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">

            <div className="min-w-0 border-t border-black">

              {trendingStories.map(
                (story, index) => {
                  const isActive =
                    activeTrending ===
                    index;

                  return (
                    <article
                      key={story.slug}
                      onMouseEnter={() =>
                        setActiveTrending(
                          index
                        )
                      }
                      onClick={() =>
                        setActiveTrending(
                          index
                        )
                      }
                      className={`
                        group
                        relative
                        cursor-pointer
                        overflow-hidden
                        border-b
                        border-black
                        py-8
                        transition-all
                        duration-500
                        md:py-10

                        ${
                          isActive
                            ? "opacity-100"
                            : "opacity-45 hover:opacity-100"
                        }
                      `}
                    >

                      <div
                        className={`
                          pointer-events-none
                          absolute
                          inset-0
                          origin-left
                          bg-black/[0.045]
                          transition-transform
                          duration-500
                          ease-[cubic-bezier(0.22,1,0.36,1)]

                          ${
                            isActive
                              ? "scale-x-100"
                              : "scale-x-0 group-hover:scale-x-100"
                          }
                        `}
                      />

                      <div className="relative z-10 grid min-w-0 gap-5 pr-0 sm:grid-cols-[54px_minmax(0,1fr)_auto] sm:items-center sm:gap-6 xl:pr-16">

                        <div className="flex items-center gap-3">

                          <span
                            className={`
                              text-sm
                              transition-colors
                              duration-300

                              ${
                                isActive
                                  ? "text-black"
                                  : "text-black/35"
                              }
                            `}
                          >
                            0{index + 1}
                          </span>

                          <span
                            className={`
                              h-px
                              bg-black
                              transition-all
                              duration-500

                              ${
                                isActive
                                  ? "w-6"
                                  : "w-0 group-hover:w-6"
                              }
                            `}
                          />

                        </div>

                        <div className="min-w-0">

                          <p
                            className={`
                              mb-2
                              break-words
                              text-[10px]
                              uppercase
                              tracking-[0.25em]
                              transition-colors
                              duration-300
                              sm:text-xs

                              ${
                                isActive
                                  ? "text-black/55"
                                  : "text-black/40 group-hover:text-black/55"
                              }
                            `}
                          >
                            {story.category}
                          </p>

                          <h3
                            className={`
                              max-w-xl
                              break-words
                              text-2xl
                              font-medium
                              leading-[1.08]
                              tracking-[-0.025em]
                              transition-transform
                              duration-500
                              md:text-3xl

                              ${
                                isActive
                                  ? "translate-x-2"
                                  : "translate-x-0 group-hover:translate-x-2"
                              }
                            `}
                          >
                            {story.title}
                          </h3>

                        </div>

                        <div className="pl-[54px] sm:pl-0 sm:text-right">

                          <p
                            className={`
                              text-sm
                              transition-colors
                              duration-300

                              ${
                                isActive
                                  ? "text-black"
                                  : "text-black/55 group-hover:text-black"
                              }
                            `}
                          >
                            {story.author}
                          </p>

                          <p className="mt-1 text-xs text-black/45">
                            {story.readTime}
                          </p>

                        </div>

                      </div>

                      <div
                        className={`
                          pointer-events-none
                          absolute
                          right-5
                          top-1/2
                          hidden
                          -translate-y-1/2
                          transition-all
                          duration-500
                          xl:block

                          ${
                            isActive
                              ? "translate-x-0 opacity-100"
                              : "translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                          }
                        `}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-sm">
                          ↗
                        </span>
                      </div>

                    </article>
                  );
                }
              )}

              <div className="flex items-center justify-between pt-5 text-[10px] uppercase tracking-[0.2em] text-black/40">

                <span>
                  Updated daily
                </span>

                <span>
                  {trendingStories.length}{" "}
                  stories
                </span>

              </div>

            </div>

            <div className="h-fit min-w-0 lg:sticky lg:top-28">

              <div
                ref={trendingPreviewRef}
                className="relative min-h-[560px] overflow-hidden rounded-[28px] bg-[#151515] text-[#f5f1e8] shadow-[0_35px_100px_rgba(0,0,0,0.14)]"
              >

                <span className="absolute -right-5 -top-12 select-none text-[12rem] font-semibold leading-none tracking-[-0.08em] text-white/[0.035] md:text-[16rem]">
                  0{activeTrending + 1}
                </span>

                <div
                  className="absolute left-0 top-0 h-[3px] bg-[#c9d8b6] transition-all duration-700"
                  style={{
                    width: `${
                      ((activeTrending +
                        1) /
                        trendingStories.length) *
                      100
                    }%`,
                  }}
                />

                <div className="relative z-10 flex min-h-[560px] flex-col justify-between p-8 md:p-11">

                  <div className="trending-animate flex items-start justify-between gap-5">

                    <div>

                      <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                        Trending now
                      </p>

                      <p className="mt-2 text-xs text-white/30">
                        Editor&apos;s selection
                      </p>

                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-xs text-white/60">
                      0{activeTrending + 1}
                    </div>

                  </div>

                  <div>

                    <p className="trending-symbol select-none text-[7rem] font-semibold leading-[0.8] tracking-[-0.08em] text-white/[0.08] md:text-[10rem]">
                      {
                        trendingStories[
                          activeTrending
                        ].preview
                      }
                    </p>

                    <div className="trending-animate mt-8">

                      <div className="mb-5 flex items-center gap-3">

                        <span className="h-2 w-2 rounded-full bg-[#c9d8b6]" />

                        <p className="text-[10px] uppercase tracking-[0.28em] text-white/50 sm:text-xs">
                          {
                            trendingStories[
                              activeTrending
                            ].category
                          }
                        </p>

                      </div>

                      <h3 className="break-words text-3xl font-medium leading-[1.02] tracking-[-0.035em] sm:text-4xl md:text-5xl">
                        {
                          trendingStories[
                            activeTrending
                          ].title
                        }
                      </h3>

                    </div>

                  </div>

                  <div className="trending-animate">

                    <div className="mb-7 h-px w-full bg-white/15" />

                    <div className="flex items-end justify-between gap-6">

                      <div>

                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                          Written by
                        </p>

                        <p className="mt-2 text-sm">
                          {
                            trendingStories[
                              activeTrending
                            ].author
                          }
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          {
                            trendingStories[
                              activeTrending
                            ].readTime
                          }
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openStory(
                            trendingStories[
                              activeTrending
                            ].slug
                          )
                        }
                        aria-label="Read trending story"
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/30 text-xl transition-all duration-500 hover:rotate-45 hover:border-[#c9d8b6] hover:bg-[#c9d8b6] hover:text-black md:h-16 md:w-16"
                      >
                        ↗
                      </button>

                    </div>

                  </div>

                </div>

              </div>

              <div className="mt-4 flex items-center justify-between gap-6 text-[10px] uppercase tracking-[0.2em] text-black/40">

                <span>
                  Hover stories to explore
                </span>

                <span>
                  0{activeTrending + 1} / 0
                  {trendingStories.length}
                </span>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          TOPICS
      ======================================================== */}

      <section
        id="topics"
        className="border-t border-black/20 py-20 md:py-28"
      >
        <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 md:px-10 lg:px-14">

          <div className="mb-14 flex flex-col gap-7 md:mb-16 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="mb-3 text-sm uppercase tracking-[0.3em]">
                Explore Topics
              </p>

              <h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl md:text-6xl">
                Discover something new.
              </h2>

            </div>

            <p className="max-w-sm text-sm leading-relaxed text-black/55 md:text-right">
              Follow your curiosity through technology,
              design, culture and science.
            </p>

          </div>

          <div className="grid overflow-hidden rounded-[28px] border-l border-t border-black md:grid-cols-2">

            {topics.map(
              (topic) => (
                <article
                  key={topic.number}
                  className="group relative min-h-[320px] cursor-pointer overflow-hidden border-b border-r border-black p-8 md:p-10"
                >

                  <div className="absolute inset-0 translate-y-full bg-black transition-transform duration-500 ease-out group-hover:translate-y-0" />

                  <div className="relative z-10 flex h-full flex-col justify-between">

                    <span className="text-sm text-black/40 transition-colors duration-500 group-hover:text-white/50">
                      {topic.number}
                    </span>

                    <div>

                      <h3 className="text-4xl font-semibold tracking-[-0.035em] transition-colors duration-500 group-hover:text-white md:text-5xl">
                        {topic.name}
                      </h3>

                      <div className="mt-7 flex items-end justify-between gap-6">

                        <p className="max-w-sm text-sm leading-relaxed text-black/60 transition-colors duration-500 group-hover:text-white/60">
                          {
                            topic.description
                          }
                        </p>

                        <span className="shrink-0 text-2xl transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white">
                          ↗
                        </span>

                      </div>

                    </div>

                  </div>

                </article>
              )
            )}

          </div>

        </div>
      </section>

      {/* ========================================================
          LATEST STORIES
      ======================================================== */}

      <section
        id="latest"
        className="border-t border-black/20 py-20 md:py-28"
      >
        <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 md:px-10 lg:px-14">

          <div className="mb-14 flex flex-col gap-7 md:mb-16 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="mb-3 text-sm uppercase tracking-[0.3em]">
                Latest Stories
              </p>

              <h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl md:text-6xl">
                Fresh ideas, just published.
              </h2>

            </div>

            <a
              href="#stories"
              className="text-sm underline underline-offset-4"
            >
              View all stories
            </a>

          </div>

          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">

            {latestStories.map(
              (story) => (
                <article
                  key={story.slug}
                  onClick={() =>
                    openStory(
                      story.slug
                    )
                  }
                  className="group min-w-0 cursor-pointer"
                >

                  <div
                    className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[24px]"
                    style={{
                      backgroundColor:
                        story.background,
                    }}
                  >

                    <span className="text-7xl font-semibold text-black/20 transition-transform duration-700 group-hover:scale-110">
                      {story.preview}
                    </span>

                    <div className="absolute right-5 top-5 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-black text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      ↗
                    </div>

                  </div>

                  <p className="mt-6 text-xs uppercase tracking-[0.25em] text-black/50">
                    {story.category}
                  </p>

                  <h3 className="mt-3 break-words text-2xl font-medium leading-tight md:text-3xl">
                    {story.title}
                  </h3>

                  <div className="mt-6 flex items-center justify-between gap-4 text-sm">

                    <span>
                      {story.author}
                    </span>

                    <span className="text-black/50">
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
          WRITERS
      ======================================================== */}

      <section
        id="writers"
        className="border-t border-black/20 py-20 md:py-28"
      >
        <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 md:px-10 lg:px-14">

          <div className="mb-14 flex flex-col gap-7 md:mb-16 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="mb-3 text-sm uppercase tracking-[0.3em]">
                Featured Writers
              </p>

              <h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl md:text-6xl">
                People worth following.
              </h2>

            </div>

            <p className="max-w-sm text-sm leading-relaxed text-black/55 md:text-right">
              Discover writers sharing thoughtful perspectives
              across technology, design and culture.
            </p>

          </div>

          <div className="border-t border-black">

            {writers.map(
              (writer, index) => (
                <article
                  key={writer.slug}
                  className="
                    group
                    relative
                    grid
                    gap-7
                    overflow-hidden
                    border-b
                    border-black
                    py-10
                    transition-all
                    duration-500
                    lg:grid-cols-[60px_minmax(0,1fr)_minmax(0,1fr)_auto]
                    lg:items-center
                  "
                >

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      origin-left
                      scale-x-0
                      bg-black/[0.035]
                      transition-transform
                      duration-500
                      ease-[cubic-bezier(0.22,1,0.36,1)]
                      group-hover:scale-x-100
                    "
                  />

                  <span className="relative z-10 text-sm text-black/40">
                    0{index + 1}
                  </span>

                  <div className="relative z-10 flex min-w-0 items-center gap-5">

                    <button
                      type="button"
                      onClick={() =>
                        openWriterProfile(
                          writer.slug
                        )
                      }
                      aria-label={`View ${writer.name} profile`}
                      className="
                        flex
                        h-16
                        w-16
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-black
                        text-sm
                        font-medium
                        transition-all
                        duration-500
                        group-hover:-translate-y-1
                        group-hover:scale-105
                        group-hover:bg-black
                        group-hover:text-[#f5f1e8]
                      "
                    >
                      {writer.initials}
                    </button>

                    <div className="min-w-0">

                      <button
                        type="button"
                        onClick={() =>
                          openWriterProfile(
                            writer.slug
                          )
                        }
                        className="text-left"
                      >
                        <h3 className="text-2xl font-medium transition-transform duration-500 group-hover:translate-x-1">
                          {writer.name}
                        </h3>
                      </button>

                      <p className="mt-1 text-sm text-black/50">
                        {writer.role}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          openWriterProfile(
                            writer.slug
                          )
                        }
                        className="
                          mt-3
                          flex
                          items-center
                          gap-2
                          text-xs
                          text-black/45
                          transition-colors
                          duration-300
                          hover:text-black
                        "
                      >
                        View profile

                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          ↗
                        </span>

                      </button>

                    </div>

                  </div>

                  <p className="relative z-10 max-w-lg text-sm leading-relaxed text-black/60">
                    {writer.bio}
                  </p>

                  <div className="relative z-10 flex flex-wrap items-center gap-6">

                    <span className="text-sm text-black/50">
                      {writer.followers}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setFollowedWriters(
                          (current) => {
                            const isFollowing =
                              current.includes(
                                writer.name
                              );

                            if (
                              isFollowing
                            ) {
                              return current.filter(
                                (name) =>
                                  name !==
                                  writer.name
                              );
                            }

                            return [
                              ...current,
                              writer.name,
                            ];
                          }
                        );
                      }}
                      className={`
                        rounded-full
                        border
                        px-5
                        py-2
                        text-sm
                        transition-all
                        duration-300

                        ${
                          followedWriters.includes(
                            writer.name
                          )
                            ? "border-black bg-black text-[#f5f1e8] hover:bg-black/80"
                            : "border-black bg-transparent text-black hover:bg-black hover:text-[#f5f1e8]"
                        }
                      `}
                    >
                      {followedWriters.includes(
                        writer.name
                      )
                        ? "Following"
                        : "Follow"}
                    </button>

                  </div>

                </article>
              )
            )}

          </div>

        </div>
      </section>

      {/* ========================================================
          CTA
      ======================================================== */}

      <section className="border-t border-black bg-[#7957ff] py-20 text-white md:py-28">

        <div className="mx-auto grid w-full max-w-[1600px] gap-12 px-5 sm:px-8 md:px-10 lg:grid-cols-[1fr_auto] lg:items-end lg:px-14">

          <div>

            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-white/60">
              Publish on Mindscape
            </p>

            <h2 className="max-w-5xl text-[12vw] font-semibold leading-[0.82] tracking-[-0.07em] sm:text-[9vw] md:text-[6.5vw] xl:text-[6.5rem]">
              WRITE SOMETHING
              <br />
              WORTH READING.
            </h2>

          </div>

          <a
            href="/write"
            className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl text-black transition-all duration-500 hover:rotate-45 hover:scale-105 md:h-24 md:w-24"
          >
            ↗
          </a>

        </div>

      </section>

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <footer className="bg-black py-16 text-[#f5f1e8]">

        <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 md:px-10 lg:px-14">

          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">

            <div className="md:col-span-2 lg:col-span-1">

              <h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
                MINDSCAPE
              </h2>

              <p className="mt-6 max-w-md text-sm leading-relaxed text-white/60">
                A publishing platform for thoughtful
                stories, curious minds and ideas worth
                sharing.
              </p>

            </div>

            <div>

              <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/40">
                Explore
              </p>

              <div className="flex flex-col gap-3 text-sm">

                <a
                  href="#stories"
                  className="transition-opacity hover:opacity-50"
                >
                  Featured Stories
                </a>

                <a
                  href="#trending"
                  className="transition-opacity hover:opacity-50"
                >
                  Trending
                </a>

                <a
                  href="#topics"
                  className="transition-opacity hover:opacity-50"
                >
                  Topics
                </a>

                <a
                  href="#writers"
                  className="transition-opacity hover:opacity-50"
                >
                  Writers
                </a>

              </div>

            </div>

            <div>

              <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/40">
                Platform
              </p>

              <div className="flex flex-col gap-3 text-sm">

                <a
                  href="/write"
                  className="transition-opacity hover:opacity-50"
                >
                  Write
                </a>

                {currentUser ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/profile"
                        )
                      }
                      className="w-fit text-left transition-opacity hover:opacity-50"
                    >
                      Profile
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-fit text-left transition-opacity hover:opacity-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="/login"
                      className="transition-opacity hover:opacity-50"
                    >
                      Sign in
                    </a>

                    <a
                      href="/register"
                      className="transition-opacity hover:opacity-50"
                    >
                      Create account
                    </a>
                  </>
                )}

              </div>

            </div>

          </div>

          <div className="mt-20 flex flex-col gap-3 border-t border-white/20 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">

            <span>
              © 2026 Mindscape
            </span>

            <span>
              Stories worth sharing.
            </span>

          </div>

        </div>

      </footer>

    </main>
  );
}