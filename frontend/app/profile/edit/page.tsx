"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  apiFetch,
  clearAuthTokens,
} from "../../../lib/api";

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
// EDIT PROFILE PAGE
// ============================================================

export default function EditProfilePage() {
  const router = useRouter();

  // ============================================================
  // STATE
  // ============================================================

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [profileImage, setProfileImage] =
    useState("");

  const [coverImage, setCoverImage] =
    useState("");

  const [website, setWebsite] =
    useState("");

  const [twitter, setTwitter] =
    useState("");

  const [instagram, setInstagram] =
    useState("");

  const [linkedin, setLinkedin] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ============================================================
  // GET CURRENT USER
  // ============================================================

  useEffect(() => {
    const getCurrentUser = async () => {
      // --------------------------------------------------------
      // ACCESS TOKEN / REFRESH TOKEN KONTROLÜ
      // --------------------------------------------------------

      const accessToken =
        localStorage.getItem(
          "access_token"
        );

      const refreshToken =
        localStorage.getItem(
          "refresh_token"
        );

      // İki token da yoksa kullanıcı giriş yapmamıştır.
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

        // ------------------------------------------------------
        // apiFetch:
        //
        // 1. Access token ile isteği gönderir.
        // 2. Access token geçersiz/süresi dolmuşsa refresh dener.
        // 3. Yeni access token kaydeder.
        // 4. /users/me isteğini tekrar gönderir.
        // ------------------------------------------------------

        const response =
          await apiFetch(
            "/users/me",
            {
              method: "GET",
            }
          );

        // Refresh işleminden sonra bile başarısızsa
        if (!response.ok) {
          clearAuthTokens();

          router.replace(
            "/login"
          );

          return;
        }

        const data: CurrentUser =
          await response.json();

        // ------------------------------------------------------
        // FORM ALANLARINI BACKEND VERİLERİYLE DOLDUR
        // ------------------------------------------------------

        setUsername(
          data.username ?? ""
        );

        setEmail(
          data.email ?? ""
        );

        setBio(
          data.bio ?? ""
        );

        setProfileImage(
          data.profile_image ?? ""
        );

        setCoverImage(
          data.cover_image ?? ""
        );

        setWebsite(
          data.website ?? ""
        );

        setTwitter(
          data.twitter ?? ""
        );

        setInstagram(
          data.instagram ?? ""
        );

        setLinkedin(
          data.linkedin ?? ""
        );

        console.log(
          "Edit profile user:",
          data
        );
      } catch (error) {
        console.error(
          "Profile load error:",
          error
        );

        // Tokenlar refresh sırasında tamamen temizlenmiş olabilir.
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
  // UPDATE PROFILE
  // ============================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ----------------------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------------------

    if (
      !username.trim() ||
      !email.trim()
    ) {
      setError(
        "Username and email are required."
      );

      return;
    }

    // ----------------------------------------------------------
    // TOKEN KONTROLÜ
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
      router.replace("/login");
      return;
    }

    try {
      setIsSaving(true);

      // --------------------------------------------------------
      // PROFİL GÜNCELLEME
      //
      // Normal fetch yerine apiFetch kullanıyoruz.
      // Böylece PUT sırasında access token süresi dolmuşsa
      // refresh token otomatik olarak devreye girer.
      // --------------------------------------------------------

      const response =
        await apiFetch(
          "/users/me",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              username:
                username.trim(),

              email:
                email.trim(),

              bio:
                bio.trim(),

              profile_image:
                profileImage.trim(),

              cover_image:
                coverImage.trim(),

              website:
                website.trim(),

              twitter:
                twitter.trim(),

              instagram:
                instagram.trim(),

              linkedin:
                linkedin.trim(),
            }),
          }
        );

      // --------------------------------------------------------
      // RESPONSE BODY
      // --------------------------------------------------------

      let data: any = null;

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
          "Profile update error:",
          data
        );

        // Yetkilendirme tamamen başarısız olduysa
        if (
          response.status === 401
        ) {
          clearAuthTokens();

          router.replace(
            "/login"
          );

          return;
        }

        // Backend detail string döndürüyorsa
        if (
          data &&
          typeof data.detail ===
            "string"
        ) {
          setError(
            data.detail
          );

          return;
        }

        // FastAPI validation error listesi
        if (
          data &&
          Array.isArray(
            data.detail
          )
        ) {
          setError(
            data.detail
              .map(
                (
                  item: {
                    msg?: string;
                  }
                ) =>
                  item.msg ??
                  "Validation error"
              )
              .join(", ")
          );

          return;
        }

        setError(
          "Could not update your profile."
        );

        return;
      }

      // ========================================================
      // SUCCESS
      // ========================================================

      console.log(
        "Profile updated:",
        data
      );

      setSuccess(
        "Profile updated successfully."
      );

      // Güncellemeden sonra kısa süre başarı mesajını göster.
      window.setTimeout(
        () => {
          router.push(
            "/profile"
          );
        },
        700
      );
    } catch (error) {
      console.error(
        "Profile update connection error:",
        error
      );

      // Refresh başarısız olmuş ve tokenlar temizlenmiş olabilir.
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
        "Could not connect to the server."
      );
    } finally {
      setIsSaving(false);
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
  // RETURN
  // ============================================================

  return (
    <main className="min-h-screen bg-[#f5f1e8] text-black">

      {/* ========================================================
          NAVBAR
      ======================================================== */}

      <nav className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f1e8]/95 backdrop-blur-xl">

        <div className="mx-auto flex h-[68px] w-full max-w-[1400px] items-center justify-between px-5 sm:px-8 md:h-[76px] md:px-10 lg:px-14">

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
            Back to profile
          </button>

        </div>

      </nav>

      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <section className="mx-auto w-full max-w-[1400px] px-5 pb-10 pt-10 sm:px-8 md:px-10 md:pb-14 md:pt-16 lg:px-14">

        <button
          type="button"
          onClick={() =>
            router.push(
              "/profile"
            )
          }
          className="group flex items-center gap-2 text-sm text-black/45 transition-colors hover:text-black"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>

          Back to profile
        </button>

        <div className="mt-12 border-t border-black pt-10">

          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            Account Settings
          </p>

          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl md:text-7xl">
            Edit profile.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-black/55">
            Update your public profile,
            biography and social links.
          </p>

        </div>

      </section>

      {/* ========================================================
          FORM
      ======================================================== */}

      <section className="mx-auto w-full max-w-[1400px] px-5 pb-24 sm:px-8 md:px-10 lg:px-14">

        <form
          onSubmit={
            handleSubmit
          }
          className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20"
        >

          {/* ====================================================
              LEFT INFO
          ==================================================== */}

          <div>

            <p className="text-xs uppercase tracking-[0.28em] text-black/40">
              Profile
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              Public information.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-black/50">
              These details can be shown
              on your public Mindscape
              profile.
            </p>

          </div>

          {/* ====================================================
              FIELDS
          ==================================================== */}

          <div className="space-y-10">

            {/* USERNAME */}

            <Field
              label="Username"
              value={username}
              onChange={
                setUsername
              }
              placeholder="username"
            />

            {/* EMAIL */}

            <Field
              label="Email"
              value={email}
              onChange={
                setEmail
              }
              placeholder="you@example.com"
              type="email"
            />

            {/* ==================================================
                BIO
            ================================================== */}

            <div>

              <label
                htmlFor="bio"
                className="mb-3 block text-xs uppercase tracking-[0.2em] text-black/45"
              >
                Bio
              </label>

              <textarea
                id="bio"
                value={bio}
                onChange={(
                  event
                ) =>
                  setBio(
                    event.target.value
                  )
                }
                placeholder="Tell readers something about yourself..."
                rows={5}
                className="
                  w-full
                  resize-none
                  border
                  border-black/20
                  bg-transparent
                  px-4
                  py-4
                  text-base
                  leading-relaxed
                  outline-none
                  transition-colors
                  placeholder:text-black/25
                  focus:border-black
                "
              />

            </div>

            {/* ==================================================
                IMAGES
            ================================================== */}

            <div className="border-t border-black/15 pt-10">

              <p className="mb-8 text-xs uppercase tracking-[0.28em] text-black/40">
                Images
              </p>

              <div className="space-y-10">

                <Field
                  label="Profile Image URL"
                  value={
                    profileImage
                  }
                  onChange={
                    setProfileImage
                  }
                  placeholder="/uploads/..."
                />

                <Field
                  label="Cover Image URL"
                  value={
                    coverImage
                  }
                  onChange={
                    setCoverImage
                  }
                  placeholder="/uploads/..."
                />

              </div>

            </div>

            {/* ==================================================
                SOCIAL LINKS
            ================================================== */}

            <div className="border-t border-black/15 pt-10">

              <p className="mb-8 text-xs uppercase tracking-[0.28em] text-black/40">
                Social Links
              </p>

              <div className="space-y-10">

                <Field
                  label="Website"
                  value={
                    website
                  }
                  onChange={
                    setWebsite
                  }
                  placeholder="https://..."
                />

                <Field
                  label="Twitter"
                  value={
                    twitter
                  }
                  onChange={
                    setTwitter
                  }
                  placeholder="https://twitter.com/..."
                />

                <Field
                  label="Instagram"
                  value={
                    instagram
                  }
                  onChange={
                    setInstagram
                  }
                  placeholder="https://instagram.com/..."
                />

                <Field
                  label="LinkedIn"
                  value={
                    linkedin
                  }
                  onChange={
                    setLinkedin
                  }
                  placeholder="https://linkedin.com/in/..."
                />

              </div>

            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="border border-red-500/30 bg-red-500/5 px-4 py-3">

                <p className="text-sm text-red-700">
                  {error}
                </p>

              </div>
            )}

            {/* ==================================================
                SUCCESS
            ================================================== */}

            {success && (
              <div className="border border-green-700/30 bg-green-700/5 px-4 py-3">

                <p className="text-sm text-green-800">
                  {success}
                </p>

              </div>
            )}

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-black/15 pt-8 sm:flex-row sm:items-center sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/profile"
                  )
                }
                disabled={
                  isSaving
                }
                className="rounded-full border border-black/20 px-7 py-3 text-sm transition-all duration-300 hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
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
                  duration-300
                  hover:bg-black/80
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {isSaving
                  ? "Saving..."
                  : "Save changes"}
              </button>

            </div>

          </div>

        </form>

      </section>

    </main>
  );
}

// ============================================================
// FIELD COMPONENT
// ============================================================

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder: string;
  type?: string;
}) {
  const id =
    label
      .toLowerCase()
      .replaceAll(" ", "-");

  return (
    <div>

      <label
        htmlFor={id}
        className="mb-3 block text-xs uppercase tracking-[0.2em] text-black/45"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="
          w-full
          border-b
          border-black
          bg-transparent
          px-0
          py-3
          text-base
          outline-none
          transition-colors
          placeholder:text-black/25
          focus:border-black/50
        "
      />

    </div>
  );
}