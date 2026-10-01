"use client";

import {
  useEffect,
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

type CurrentUser = {
  id: number;
  username: string;
  email: string;
  bio: string | null;
  profile_image: string | null;
  cover_image: string | null;
  website: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  is_active: boolean;
  is_email_verified: boolean;
};

// ============================================================
// PROFILE PAGE
// ============================================================

export default function ProfilePage() {
  const router = useRouter();

  // ============================================================
  // STATE
  // ============================================================

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ============================================================
  // DEACTIVATE STATE
  // ============================================================

  const [
    isDeactivateModalOpen,
    setIsDeactivateModalOpen,
  ] = useState(false);

  const [
    isDeactivating,
    setIsDeactivating,
  ] = useState(false);

  const [
    deactivateError,
    setDeactivateError,
  ] = useState("");

  // ============================================================
  // GET CURRENT USER
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

      // Kullanıcı giriş yapmamışsa
      if (
        !accessToken &&
        !refreshToken
      ) {
        router.replace("/login");
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        // apiFetch:
        // access token ile isteği yapar.
        // 401 gelirse refresh token kullanır.
        // Yeni access token alır.
        // İsteği otomatik tekrar gönderir.
        const response =
          await apiFetch(
            "/users/me",
            {
              method: "GET",
            }
          );

        // Refresh işleminden sonra da
        // başarısızsa login'e gönder.
        if (!response.ok) {
          clearAuthTokens();

          router.replace(
            "/login"
          );

          return;
        }

        const data: CurrentUser =
          await response.json();

        setUser(data);

        console.log(
          "Profile user:",
          data
        );
      } catch (error) {
        console.error(
          "Profile error:",
          error
        );

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

        setError(
          "Could not load your profile."
        );
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();
  }, [router]);

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    clearAuthTokens();

    router.replace(
      "/login"
    );
  };

  // ============================================================
  // DEACTIVATE ACCOUNT
  // ============================================================

  const handleDeactivateAccount =
    async () => {
      setDeactivateError("");

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
        clearAuthTokens();

        router.replace(
          "/login"
        );

        return;
      }

      try {
        setIsDeactivating(true);

        // ------------------------------------------------------
        // Backend endpoint:
        //
        // PUT /users/me/deactivate
        //
        // Body istemiyor.
        // Authorization header apiFetch tarafından ekleniyor.
        // ------------------------------------------------------

        const response =
          await apiFetch(
            "/users/me/deactivate",
            {
              method: "PUT",
            }
          );

        let data: unknown = null;

        try {
          data =
            await response.json();
        } catch {
          data = null;
        }

        // ======================================================
        // ERROR
        // ======================================================

        if (!response.ok) {
          console.error(
            "Deactivate account error:",
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
              setDeactivateError(
                detail
              );

              return;
            }
          }

          setDeactivateError(
            "Could not deactivate your account."
          );

          return;
        }

        // ======================================================
        // SUCCESS
        // ======================================================

        console.log(
          "Account deactivated:",
          data
        );

        // Hesap artık aktif değil.
        // Kullanıcının local tokenlarını temizliyoruz.
        clearAuthTokens();

        setIsDeactivateModalOpen(
          false
        );

        // Login ekranına gönder.
        router.replace(
          "/login"
        );
      } catch (error) {
        console.error(
          "Deactivate connection error:",
          error
        );

        setDeactivateError(
          "Could not connect to the server."
        );
      } finally {
        setIsDeactivating(false);
      }
    };

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8] text-black">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-black/20 border-t-black" />

          <p className="mt-5 text-sm text-black/50">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8] px-6 text-black">
        <div className="max-w-lg text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            Profile Error
          </p>

          <h1 className="mt-5 text-4xl font-semibold">
            Something went wrong.
          </h1>

          <p className="mt-5 text-black/55">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            className="mt-8 rounded-full bg-black px-6 py-3 text-sm text-[#f5f1e8]"
          >
            Back to Mindscape
          </button>
        </div>
      </main>
    );
  }

  // ============================================================
  // USER NOT FOUND
  // ============================================================

  if (!user) {
    return null;
  }

  // Kullanıcı adının ilk iki harfi
  const initials =
    user.username
      .slice(0, 2)
      .toUpperCase();

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f1e8] text-black">

      {/* ========================================================
          NAVBAR
      ======================================================== */}

      <nav className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f1e8]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] w-full max-w-[1400px] items-center justify-between px-5 sm:px-8 md:h-[76px] md:px-10 lg:px-14">

          {/* LOGO */}

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

          {/* NAV ACTIONS */}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                router.push("/write")
              }
              className="hidden text-sm text-black/60 transition-colors hover:text-black sm:block"
            >
              Write
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-black px-5 py-2 text-sm transition-all duration-300 hover:bg-black hover:text-[#f5f1e8]"
            >
              Logout
            </button>
          </div>

        </div>
      </nav>

      {/* ========================================================
          COVER
      ======================================================== */}

      <section className="relative">

        {user.cover_image ? (
          <div className="h-[260px] overflow-hidden bg-black/5 md:h-[360px]">
            <img
              src={
                user.cover_image.startsWith(
                  "http"
                )
                  ? user.cover_image
                  : `http://127.0.0.1:8000${user.cover_image}`
              }
              alt="Profile cover"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="relative h-[260px] overflow-hidden bg-[#7957ff] md:h-[360px]">
            <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/20" />

            <div className="absolute right-[20%] top-20 h-44 w-44 rounded-full border border-white/15" />

            <div className="absolute bottom-8 left-8 text-xs uppercase tracking-[0.3em] text-white/60 md:left-14">
              Mindscape Member
            </div>
          </div>
        )}

      </section>

      {/* ========================================================
          PROFILE HEADER
      ======================================================== */}

      <section className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 md:px-10 lg:px-14">
        <div className="relative -mt-20 border-b border-black/15 pb-14 md:-mt-24 md:pb-20">

          {/* PROFILE IMAGE */}

          <div className="relative z-10 w-fit rounded-full bg-[#f5f1e8] p-2">

            {user.profile_image ? (
              <img
                src={
                  user.profile_image.startsWith(
                    "http"
                  )
                    ? user.profile_image
                    : `http://127.0.0.1:8000${user.profile_image}`
                }
                alt={user.username}
                className="h-36 w-36 rounded-full object-cover md:h-44 md:w-44"
              />
            ) : (
              <div className="flex h-36 w-36 items-center justify-center rounded-full bg-black text-4xl font-medium tracking-[-0.05em] text-[#f5f1e8] md:h-44 md:w-44 md:text-5xl">
                {initials}
              </div>
            )}

          </div>

          {/* PROFILE INFO */}

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#7957ff]" />

                <p className="text-xs uppercase tracking-[0.28em] text-black/40">
                  Mindscape Profile
                </p>
              </div>

              <h1 className="mt-5 break-words text-5xl font-semibold leading-[0.9] tracking-[-0.055em] sm:text-6xl md:text-7xl">
                {user.username}
              </h1>

              <p className="mt-5 text-base text-black/50">
                {user.email}
              </p>

              <p className="mt-8 max-w-2xl text-base leading-[1.8] text-black/65 md:text-lg">
                {user.bio
                  ? user.bio
                  : "This writer has not added a bio yet."}
              </p>

            </div>

            {/* ACTIONS */}

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/profile/password"
                  )
                }
                className="w-fit rounded-full border border-black/20 px-7 py-3 text-sm transition-all duration-300 hover:border-black"
              >
                Change password
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/profile/edit"
                  )
                }
                className="w-fit rounded-full border border-black px-7 py-3 text-sm transition-all duration-300 hover:bg-black hover:text-[#f5f1e8]"
              >
                Edit profile
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          ACCOUNT INFORMATION
      ======================================================== */}

      <section className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 md:px-10 md:py-20 lg:px-14">

        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            Account
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
            Profile information.
          </h2>
        </div>

        <div className="grid border-t border-black md:grid-cols-2">

          {/* USERNAME */}

          <div className="border-b border-black/15 py-7 md:border-r md:pr-10">
            <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">
              Username
            </p>

            <p className="mt-3 text-lg font-medium">
              {user.username}
            </p>
          </div>

          {/* EMAIL */}

          <div className="border-b border-black/15 py-7 md:pl-10">
            <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">
              Email
            </p>

            <p className="mt-3 break-all text-lg font-medium">
              {user.email}
            </p>
          </div>

          {/* ACCOUNT STATUS */}

          <div className="border-b border-black/15 py-7 md:border-r md:pr-10">
            <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">
              Account status
            </p>

            <div className="mt-3 flex items-center gap-2">

              <span
                className={`h-2 w-2 rounded-full ${
                  user.is_active
                    ? "bg-green-600"
                    : "bg-red-500"
                }`}
              />

              <p className="text-lg font-medium">
                {user.is_active
                  ? "Active"
                  : "Inactive"}
              </p>

            </div>
          </div>

          {/* EMAIL VERIFIED */}

          <div className="border-b border-black/15 py-7 md:pl-10">
            <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">
              Email verification
            </p>

            <p className="mt-3 text-lg font-medium">
              {user.is_email_verified
                ? "Verified"
                : "Not verified"}
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================
          SOCIAL LINKS
      ======================================================== */}

      <section className="border-t border-black/15">

        <div className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 md:px-10 md:py-20 lg:px-14">

          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                Around the web
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
                Social links.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-relaxed text-black/50">
                Your public links and social profiles connected
                to Mindscape.
              </p>
            </div>

            <div className="border-t border-black">

              <SocialLink
                label="Website"
                value={user.website}
              />

              <SocialLink
                label="Twitter"
                value={user.twitter}
              />

              <SocialLink
                label="Instagram"
                value={user.instagram}
              />

              <SocialLink
                label="LinkedIn"
                value={user.linkedin}
              />

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          DANGER ZONE
      ======================================================== */}

      <section className="border-t border-black/15">

        <div className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 md:px-10 md:py-20 lg:px-14">

          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">

            <div>

              <p className="text-xs uppercase tracking-[0.3em] text-red-700/70">
                Danger Zone
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
                Account access.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-relaxed text-black/50">
                Deactivating your account will prevent
                you from signing in until the account
                is reactivated by the system or an administrator.
              </p>

            </div>

            <div className="border-t border-red-700/30">

              <div className="flex flex-col gap-7 border-b border-red-700/20 py-8 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h3 className="text-lg font-medium">
                    Deactivate account
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-black/50">
                    Your account will be marked as inactive and
                    you will immediately be signed out.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDeactivateError("");

                    setIsDeactivateModalOpen(
                      true
                    );
                  }}
                  className="w-fit shrink-0 rounded-full border border-red-700 px-6 py-3 text-sm text-red-700 transition-all duration-300 hover:bg-red-700 hover:text-white"
                >
                  Deactivate account
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================
          CTA
      ======================================================== */}

      <section className="border-t border-black bg-[#7957ff] py-16 text-white md:py-20">

        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-5 sm:px-8 md:px-10 lg:flex-row lg:items-end lg:justify-between lg:px-14">

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Your stories
            </p>

            <h2 className="mt-5 max-w-4xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-5xl md:text-6xl">
              Share something
              <br />
              worth reading.
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/write")
            }
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-2xl text-black transition-all duration-500 hover:rotate-45 hover:scale-105"
            aria-label="Write a story"
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
            onClick={() =>
              router.push("/")
            }
            className="group flex items-center gap-3 text-xl font-semibold tracking-[-0.04em]"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#7957ff] transition-transform duration-500 group-hover:scale-[1.6]" />

            MINDSCAPE
          </button>

          <div className="flex flex-wrap gap-6 text-xs text-white/40">

            <button
              type="button"
              onClick={() =>
                router.push("/")
              }
              className="transition-colors hover:text-white"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/write")
              }
              className="transition-colors hover:text-white"
            >
              Write
            </button>

            <span>
              © 2026 Mindscape
            </span>

          </div>

        </div>

      </footer>

      {/* ========================================================
          DEACTIVATE CONFIRMATION MODAL
      ======================================================== */}

      {isDeactivateModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-5 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget &&
              !isDeactivating
            ) {
              setIsDeactivateModalOpen(
                false
              );

              setDeactivateError("");
            }
          }}
        >

          <div className="w-full max-w-lg border border-black/10 bg-[#fffdf7] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.25)] sm:p-9">

            <div className="flex items-start justify-between gap-5">

              <div>

                <p className="text-xs uppercase tracking-[0.28em] text-red-700/70">
                  Confirm Deactivation
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
                  Deactivate your account?
                </h2>

              </div>

              <button
                type="button"
                disabled={
                  isDeactivating
                }
                onClick={() => {
                  setIsDeactivateModalOpen(
                    false
                  );

                  setDeactivateError("");
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 text-xl transition-all hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Close"
              >
                ×
              </button>

            </div>

            <p className="mt-6 text-sm leading-relaxed text-black/55">
              This will mark your Mindscape account as inactive.
              You will immediately be signed out and your current
              login tokens will be removed from this browser.
            </p>

            <div className="mt-6 border border-red-700/20 bg-red-700/[0.04] px-4 py-4">

              <p className="text-sm leading-relaxed text-red-800">
                After deactivation, your current account will not
                be able to sign in while it remains inactive.
              </p>

            </div>

            {deactivateError && (
              <div className="mt-5 border border-red-500/30 bg-red-500/5 px-4 py-3">

                <p className="text-sm leading-relaxed text-red-700">
                  {deactivateError}
                </p>

              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                disabled={
                  isDeactivating
                }
                onClick={() => {
                  setIsDeactivateModalOpen(
                    false
                  );

                  setDeactivateError("");
                }}
                className="rounded-full border border-black/20 px-6 py-3 text-sm transition-all hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep account
              </button>

              <button
                type="button"
                onClick={
                  handleDeactivateAccount
                }
                disabled={
                  isDeactivating
                }
                className="rounded-full bg-red-700 px-6 py-3 text-sm text-white transition-all hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeactivating
                  ? "Deactivating..."
                  : "Yes, deactivate"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

// ============================================================
// SOCIAL LINK COMPONENT
// ============================================================

function SocialLink({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="group flex items-center justify-between gap-6 border-b border-black/15 py-6">

      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">
          {label}
        </p>

        <p className="mt-2 break-all text-sm text-black/60">
          {value || "Not added"}
        </p>
      </div>

      {value && (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/15 transition-all duration-300 group-hover:border-black group-hover:bg-black group-hover:text-[#f5f1e8]"
        >
          ↗
        </a>
      )}

    </div>
  );
}