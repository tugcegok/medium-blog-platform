"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

// ============================================================
// VERIFY EMAIL PAGE
// ============================================================

export default function VerifyEmailPage() {
  const router = useRouter();

  // ============================================================
  // STATE
  // ============================================================

  const [isLoading, setIsLoading] =
    useState(true);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  // ============================================================
  // VERIFY EMAIL
  // ============================================================

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setIsLoading(true);
        setError("");
        setSuccess("");

        // ------------------------------------------------------
        // URL'DEN TOKEN AL
        //
        // Örnek:
        // /verify-email?token=abc123
        // ------------------------------------------------------

        const params =
          new URLSearchParams(
            window.location.search
          );

        const token =
          params.get("token");

        // ------------------------------------------------------
        // TOKEN YOKSA
        // ------------------------------------------------------

        if (!token) {
          setError(
            "Verification token is missing."
          );

          return;
        }

        // ------------------------------------------------------
        // BACKEND'E EMAIL VERIFY İSTEĞİ
        // ------------------------------------------------------

        const response =
          await fetch(
            `http://127.0.0.1:8000/users/verify-email?token=${encodeURIComponent(
              token
            )}`,
            {
              method: "GET",
            }
          );

        // ------------------------------------------------------
        // RESPONSE BODY
        // ------------------------------------------------------

        let data: unknown = null;

        try {
          data =
            await response.json();
        } catch {
          data = null;
        }

        // ------------------------------------------------------
        // HATA
        // ------------------------------------------------------

        if (!response.ok) {
          console.error(
            "Email verification error:",
            data
          );

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
            "Email verification failed."
          );

          return;
        }

        // ------------------------------------------------------
        // BAŞARILI
        //
        // Backend response schema "string".
        // String geldiyse direkt gösterebiliriz.
        // ------------------------------------------------------

        if (
          typeof data ===
          "string"
        ) {
          setSuccess(data);
        } else {
          setSuccess(
            "Email verified successfully."
          );
        }
      } catch (error) {
        console.error(
          "Email verification connection error:",
          error
        );

        setError(
          "Could not connect to the server."
        );
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, []);

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8] px-6 text-black">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-black/20 border-t-black" />

          <p className="mt-5 text-sm text-black/50">
            Verifying your email...
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

      <nav className="border-b border-black/10">

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
                "/login"
              )
            }
            className="text-sm text-black/50 transition-colors hover:text-black"
          >
            Sign in
          </button>

        </div>

      </nav>

      {/* ========================================================
          VERIFY AREA
      ======================================================== */}

      <section className="mx-auto flex min-h-[calc(100vh-68px)] w-full max-w-[1400px] items-center px-5 py-16 sm:px-8 md:min-h-[calc(100vh-76px)] md:px-10 lg:px-14">

        <div className="grid w-full gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">

          {/* ====================================================
              LEFT
          ==================================================== */}

          <div className="flex flex-col justify-between">

            <div>

              <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                Account Verification
              </p>

              <h1 className="mt-5 text-5xl font-semibold leading-[0.9] tracking-[-0.055em] sm:text-6xl md:text-7xl">
                VERIFY
                <br />
                YOUR
                <br />
                EMAIL.
              </h1>

              <p className="mt-8 max-w-md text-base leading-relaxed text-black/55">
                Email verification helps us confirm
                your account and keep your Mindscape
                profile secure.
              </p>

            </div>

          </div>

          {/* ====================================================
              RESULT CARD
          ==================================================== */}

          <div className="flex items-center">

            <div className="w-full border-t border-black pt-10">

              {/* SUCCESS */}

              {success && (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl text-[#f5f1e8]">
                    ✓
                  </div>

                  <p className="mt-8 text-xs uppercase tracking-[0.28em] text-black/40">
                    Verification Complete
                  </p>

                  <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
                    Email verified.
                  </h2>

                  <p className="mt-5 max-w-lg text-base leading-relaxed text-black/55">
                    {success}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/login"
                      )
                    }
                    className="mt-10 flex w-full items-center justify-between bg-black px-6 py-4 text-sm text-[#f5f1e8] transition-opacity hover:opacity-80"
                  >
                    <span>
                      Continue to sign in
                    </span>

                    <span className="text-xl">
                      →
                    </span>
                  </button>
                </>
              )}

              {/* ERROR */}

              {error && (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/5 text-2xl text-red-700">
                    ×
                  </div>

                  <p className="mt-8 text-xs uppercase tracking-[0.28em] text-black/40">
                    Verification Failed
                  </p>

                  <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
                    We could not verify your email.
                  </h2>

                  <p className="mt-5 max-w-lg text-base leading-relaxed text-red-700">
                    {error}
                  </p>

                  <div className="mt-10 flex flex-col gap-3 sm:flex-row">

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/login"
                        )
                      }
                      className="flex-1 border border-black px-6 py-4 text-sm transition-all hover:bg-black hover:text-[#f5f1e8]"
                    >
                      Go to sign in
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push("/")
                      }
                      className="flex-1 bg-black px-6 py-4 text-sm text-[#f5f1e8] transition-opacity hover:opacity-80"
                    >
                      Back to Mindscape
                    </button>

                  </div>
                </>
              )}

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}