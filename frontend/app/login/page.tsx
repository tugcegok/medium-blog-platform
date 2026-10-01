"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

// ============================================================
// LOGIN PAGE
// ============================================================

export default function LoginPage() {
  const router = useRouter();

  // ============================================================
  // STATE
  // ============================================================

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    // Formun sayfayı yenilemesini engelliyoruz.
    event.preventDefault();

    // Önce eski mesajları temizliyoruz.
    setError("");
    setSuccess("");

    // ==========================================================
    // 1. BOŞ ALAN KONTROLÜ
    // ==========================================================

    if (
      !username.trim() ||
      !password
    ) {
      setError(
        "Please enter your username and password."
      );

      return;
    }

    // ==========================================================
    // 2. LOGIN REQUEST
    // ==========================================================

    try {
      setIsLoading(true);

      /*
        Backend login endpoint'imiz
        OAuth2PasswordRequestForm kullanıyorsa
        application/json göndermiyoruz.

        Bunun yerine:

        username=tugce2&password=123456

        formatında form-urlencoded veri gönderiyoruz.
      */

      const formData =
        new URLSearchParams();

      formData.append(
        "username",
        username.trim()
      );

      formData.append(
        "password",
        password
      );

      // ========================================================
      // BACKEND REQUEST
      // ========================================================

      const response = await fetch(
        "http://127.0.0.1:8000/users/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body: formData.toString(),
        }
      );

      // ========================================================
      // BACKEND RESPONSE
      // ========================================================

      let data;

      try {
        data =
          await response.json();
      } catch {
        data = null;
      }

      // ========================================================
      // 3. LOGIN BAŞARISIZSA
      // ========================================================

      if (!response.ok) {
        console.error(
          "Login failed:",
          response.status,
          data
        );

        if (
          data &&
          typeof data.detail ===
            "string"
        ) {
          setError(data.detail);
        } else if (
          data &&
          Array.isArray(
            data.detail
          )
        ) {
          const message =
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
              .join(", ");

          setError(message);
        } else {
          setError(
            "Login failed. Please check your username and password."
          );
        }

        return;
      }

      // ========================================================
      // 4. ACCESS TOKEN KONTROLÜ
      // ========================================================

      if (
        !data ||
        !data.access_token
      ) {
        console.error(
          "Access token missing:",
          data
        );

        setError(
          "Login succeeded, but the server did not return an access token."
        );

        return;
      }

      // ========================================================
      // 5. JWT ACCESS TOKEN KAYDET
      // ========================================================

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      // ========================================================
      // 6. REFRESH TOKEN VARSA KAYDET
      // ========================================================

      if (
        data.refresh_token
      ) {
        localStorage.setItem(
          "refresh_token",
          data.refresh_token
        );
      }

      // ========================================================
      // 7. TOKEN TYPE VARSA KAYDET
      // ========================================================

      if (data.token_type) {
        localStorage.setItem(
          "token_type",
          data.token_type
        );
      }

      // ========================================================
      // 8. LOGIN BAŞARILI
      // ========================================================

      console.log(
        "Login successful:",
        data
      );

      setSuccess(
        "Signed in successfully."
      );

      // ========================================================
      // 9. ANA SAYFAYA GİT
      // ========================================================

      window.setTimeout(
        () => {
          router.replace("/");
          router.refresh();
        },
        500
      );
    } catch (error) {
      // ========================================================
      // BACKEND'E HİÇ BAĞLANAMADIYSA
      // ========================================================

      console.error(
        "Backend connection error:",
        error
      );

      setError(
        "Could not connect to the server."
      );
    } finally {
      setIsLoading(false);
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

      <nav className="flex items-center justify-between border-b border-black/10 px-8 py-5">

        <a
          href="/"
          className="text-2xl font-semibold tracking-tight"
        >
          MINDSCAPE
        </a>

        <a
          href="/register"
          className="text-sm transition-opacity hover:opacity-50"
        >
          Create account
        </a>

      </nav>

      {/* ========================================================
          LOGIN AREA
      ======================================================== */}

      <section className="grid min-h-[calc(100vh-73px)] lg:grid-cols-2">

        {/* ======================================================
            LEFT SIDE
        ====================================================== */}

        <div className="flex flex-col justify-between border-r border-black/10 p-8 lg:p-12">

          <p className="text-xs uppercase tracking-[0.3em] text-black/50">
            Welcome Back
          </p>

          <div>

            <h1 className="text-6xl font-semibold leading-[0.9] tracking-[-0.05em] md:text-7xl lg:text-8xl">
              SIGN
              <br />
              IN.
            </h1>

            <p className="mt-8 max-w-md text-base leading-relaxed text-black/60">
              Continue exploring
              thoughtful stories,
              curious minds and ideas
              worth sharing.
            </p>

          </div>

          <p className="text-xs text-black/40">
            © 2026 Mindscape
          </p>

        </div>

        {/* ======================================================
            RIGHT SIDE
        ====================================================== */}

        <div className="flex items-center justify-center p-8 lg:p-12">

          <div className="w-full max-w-md">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-12">

              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-black/40">
                Account
              </p>

              <h2 className="text-4xl font-medium tracking-tight">
                Welcome back.
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-black/50">
                Enter your details to
                continue to Mindscape.
              </p>

            </div>

            {/* ==================================================
                LOGIN FORM
            ================================================== */}

            <form
              onSubmit={
                handleLogin
              }
              className="space-y-8"
            >

              {/* ================================================
                  USERNAME
              ================================================ */}

              <div>

                <label
                  htmlFor="username"
                  className="mb-3 block text-xs uppercase tracking-[0.2em] text-black/50"
                >
                  Username
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={
                    username
                  }
                  onChange={(
                    event
                  ) =>
                    setUsername(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="tugce2"
                  autoComplete="username"
                  required
                  disabled={
                    isLoading
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
                    placeholder:text-black/30
                    focus:border-black/50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                />

              </div>

              {/* ================================================
                  PASSWORD
              ================================================ */}

              <div>

                <div className="mb-3 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-xs uppercase tracking-[0.2em] text-black/50"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs text-black/50 underline underline-offset-4 transition-opacity hover:opacity-50"
                  >
                    Forgot password?
                  </button>

                </div>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={
                    password
                  }
                  onChange={(
                    event
                  ) =>
                    setPassword(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={
                    isLoading
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
                    placeholder:text-black/30
                    focus:border-black/50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                />

              </div>

              {/* ================================================
                  ERROR MESSAGE
              ================================================ */}

              {error && (
                <div className="border border-red-500/30 bg-red-500/5 px-4 py-3">

                  <p className="text-sm leading-relaxed text-red-700">
                    {error}
                  </p>

                </div>
              )}

              {/* ================================================
                  SUCCESS MESSAGE
              ================================================ */}

              {success && (
                <div className="border border-green-700/30 bg-green-700/5 px-4 py-3">

                  <p className="text-sm leading-relaxed text-green-800">
                    {success}
                  </p>

                </div>
              )}

              {/* ================================================
                  SIGN IN BUTTON
              ================================================ */}

              <button
                type="submit"
                disabled={
                  isLoading
                }
                className="
                  mt-4
                  flex
                  w-full
                  items-center
                  justify-between
                  bg-black
                  px-6
                  py-4
                  text-sm
                  text-[#f5f1e8]
                  transition-all
                  duration-300
                  hover:opacity-80
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                <span>
                  {isLoading
                    ? "Signing in..."
                    : "Sign in"}
                </span>

                <span className="text-xl">
                  →
                </span>

              </button>

            </form>

            {/* ==================================================
                REGISTER LINK
            ================================================== */}

            <p className="mt-8 text-sm text-black/50">

              New to Mindscape?{" "}

              <a
                href="/register"
                className="text-black underline underline-offset-4"
              >
                Create an account
              </a>

            </p>

          </div>

        </div>

      </section>

    </main>
  );
}