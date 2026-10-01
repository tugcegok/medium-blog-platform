"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  apiFetch,
  clearAuthTokens,
} from "../../../lib/api";

// ============================================================
// CHANGE PASSWORD PAGE
// ============================================================

export default function ChangePasswordPage() {
  const router = useRouter();

  // ============================================================
  // STATE
  // ============================================================

  const [oldPassword, setOldPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmNewPassword,
    setConfirmNewPassword,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ----------------------------------------------------------
    // BOŞ ALAN KONTROLÜ
    // ----------------------------------------------------------

    if (
      !oldPassword ||
      !newPassword ||
      !confirmNewPassword
    ) {
      setError(
        "Please fill in all fields."
      );

      return;
    }

    // ----------------------------------------------------------
    // YENİ ŞİFRELER AYNI MI?
    // ----------------------------------------------------------

    if (
      newPassword !==
      confirmNewPassword
    ) {
      setError(
        "New passwords do not match."
      );

      return;
    }

    // ----------------------------------------------------------
    // ESKİ VE YENİ ŞİFRE AYNI OLMASIN
    // ----------------------------------------------------------

    if (
      oldPassword ===
      newPassword
    ) {
      setError(
        "Your new password must be different from your current password."
      );

      return;
    }

    // ----------------------------------------------------------
    // TOKEN KONTROLÜ
    //
    // Access token süresi dolmuş olabilir.
    // Bu yüzden sadece access token'a bakmıyoruz.
    // Refresh token varsa apiFetch access token'ı yenileyebilir.
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

    // ==========================================================
    // BACKEND REQUEST
    // ==========================================================

    try {
      setIsSaving(true);

      // --------------------------------------------------------
      // NORMAL FETCH YERİNE apiFetch
      //
      // apiFetch:
      //
      // 1. access_token ile isteği gönderir.
      // 2. Access token geçersizse refresh token kullanır.
      // 3. Yeni access token alır.
      // 4. PUT isteğini tekrar gönderir.
      // --------------------------------------------------------

      const response =
        await apiFetch(
          "/users/me/password",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              old_password:
                oldPassword,

              new_password:
                newPassword,
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
      // HATA
      // ========================================================

      if (!response.ok) {
        console.error(
          "Change password error:",
          data
        );

        // ------------------------------------------------------
        // Refresh token da geçersizse
        // ------------------------------------------------------

        if (
          response.status === 401
        ) {
          clearAuthTokens();

          router.replace(
            "/login"
          );

          return;
        }

        // ------------------------------------------------------
        // BACKEND DETAIL HATASINI OKU
        // ------------------------------------------------------

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

          // Backend string detail döndürüyorsa
          if (
            typeof detail ===
            "string"
          ) {
            setError(detail);

            return;
          }

          // FastAPI validation error döndürüyorsa
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

        // ------------------------------------------------------
        // GENEL HATA
        // ------------------------------------------------------

        setError(
          "Could not change your password."
        );

        return;
      }

      // ========================================================
      // BAŞARILI
      // ========================================================

      console.log(
        "Password changed:",
        data
      );

      setSuccess(
        "Password changed successfully."
      );

      // Formu temizle
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      // --------------------------------------------------------
      // ŞİFRE DEĞİŞTİKTEN SONRA PROFİLE DÖN
      // --------------------------------------------------------

      window.setTimeout(
        () => {
          router.push(
            "/profile"
          );
        },
        900
      );
    } catch (error) {
      console.error(
        "Change password connection error:",
        error
      );

      // --------------------------------------------------------
      // apiFetch refresh sırasında tokenları temizlemiş olabilir.
      // --------------------------------------------------------

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
          PAGE
      ======================================================== */}

      <section className="mx-auto w-full max-w-[1400px] px-5 pb-24 pt-10 sm:px-8 md:px-10 md:pt-16 lg:px-14">

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
            Account Security
          </p>

          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl md:text-7xl">
            Change password.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-black/55">
            Update the password used to
            sign in to your Mindscape
            account.
          </p>

        </div>

        {/* ======================================================
            FORM
        ====================================================== */}

        <div className="mt-16 grid gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">

          {/* LEFT */}

          <div>

            <p className="text-xs uppercase tracking-[0.28em] text-black/40">
              Security
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              Protect your account.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-black/50">
              Enter your current password
              and choose a new password for
              your account.
            </p>

          </div>

          {/* FORM */}

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-9"
          >

            {/* OLD PASSWORD */}

            <PasswordField
              label="Current Password"
              value={
                oldPassword
              }
              onChange={
                setOldPassword
              }
              placeholder="Enter your current password"
              autoComplete="current-password"
            />

            {/* NEW PASSWORD */}

            <PasswordField
              label="New Password"
              value={
                newPassword
              }
              onChange={
                setNewPassword
              }
              placeholder="Enter your new password"
              autoComplete="new-password"
            />

            {/* CONFIRM PASSWORD */}

            <PasswordField
              label="Confirm New Password"
              value={
                confirmNewPassword
              }
              onChange={
                setConfirmNewPassword
              }
              placeholder="Repeat your new password"
              autoComplete="new-password"
            />

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
                  ? "Changing..."
                  : "Change password"}
              </button>

            </div>

          </form>

        </div>

      </section>

    </main>
  );
}

// ============================================================
// PASSWORD FIELD
// ============================================================

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder: string;
  autoComplete: string;
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
        type="password"
        value={
          value
        }
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
        autoComplete={
          autoComplete
        }
        required
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