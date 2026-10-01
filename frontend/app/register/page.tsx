"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  // ==========================================
  // STATE
  // ==========================================

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Kullanıcıya göstereceğimiz mesajlar
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // İstek devam ederken butonu kilitlemek için
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    // Formun sayfayı yenilemesini engeller.
    event.preventDefault();

    // Önce eski mesajları temizliyoruz.
    setError("");
    setSuccess("");

    // ------------------------------------------
    // 1. BOŞ ALAN KONTROLÜ
    // ------------------------------------------

    if (
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    // ------------------------------------------
    // 2. ŞİFRELER AYNI MI?
    // ------------------------------------------

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // ------------------------------------------
    // 3. BACKEND'E İSTEK
    // ------------------------------------------

    try {
      setIsLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/users/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            password: password,
          }),
        }
      );

      // Backend'in gönderdiği JSON cevabını alıyoruz.
      const data = await response.json();

      // ------------------------------------------
      // 4. BACKEND HATA DÖNDÜRDÜYSE
      // ------------------------------------------

      if (!response.ok) {
        console.error("Register error:", data);

        // FastAPI bazen detail'i string,
        // bazen validation listesi olarak döndürebilir.
        if (typeof data.detail === "string") {
          setError(data.detail);
        } else if (Array.isArray(data.detail)) {
          setError(
            data.detail
              .map(
                (item: { msg?: string }) =>
                  item.msg ?? "Validation error"
              )
              .join(", ")
          );
        } else {
          setError(
            "Registration failed. Please try again."
          );
        }

        return;
      }

      // ------------------------------------------
      // 5. KAYIT BAŞARILI
      // ------------------------------------------

      console.log("Registered user:", data);

      setSuccess(
        "Account created successfully. You can now sign in."
      );

      // Formu temizliyoruz.
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Kısa süre sonra login sayfasına gönderiyoruz.
      window.setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      // Backend kapalıysa veya bağlantı kurulamazsa
      // genellikle buraya düşer.

      console.error(
        "Backend connection error:",
        error
      );

      setError(
        "Could not connect to the server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <main className="min-h-screen bg-[#f5f1e8] text-black">

      {/* ==========================================
          NAVBAR
      ========================================== */}

      <nav className="flex items-center justify-between border-b border-black/10 px-8 py-5">

        <a
          href="/"
          className="text-2xl font-semibold tracking-tight"
        >
          MINDSCAPE
        </a>

        <a
          href="/login"
          className="text-sm transition-opacity hover:opacity-50"
        >
          Sign in
        </a>

      </nav>

      {/* ==========================================
          REGISTER AREA
      ========================================== */}

      <section className="grid min-h-[calc(100vh-73px)] lg:grid-cols-2">

        {/* ========================================
            SOL TARAF
        ======================================== */}

        <div className="flex flex-col justify-between border-r border-black/10 p-8 lg:p-12">

          <p className="text-xs uppercase tracking-[0.3em] text-black/50">
            Join Mindscape
          </p>

          <div>

            <h1 className="text-6xl font-semibold leading-[0.9] tracking-[-0.05em] md:text-7xl lg:text-8xl">
              START
              <br />
              WRITING.
            </h1>

            <p className="mt-8 max-w-md text-base leading-relaxed text-black/60">
              Create your account and join a community
              built around thoughtful stories, curious
              minds and meaningful ideas.
            </p>

          </div>

          <p className="text-xs text-black/40">
            © 2026 Mindscape
          </p>

        </div>

        {/* ========================================
            SAĞ TARAF — FORM
        ======================================== */}

        <div className="flex items-center justify-center p-8 lg:p-12">

          <div className="w-full max-w-md">

            <div className="mb-10">

              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-black/40">
                Create Account
              </p>

              <h2 className="text-4xl font-medium tracking-tight">
                Join the conversation.
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-black/50">
                Create your Mindscape account to write,
                follow and discover.
              </p>

            </div>

            {/* ======================================
                REGISTER FORM
            ====================================== */}

            <form
              onSubmit={handleRegister}
              className="space-y-7"
            >

              {/* USERNAME */}

              <div>

                <label
                  htmlFor="username"
                  className="mb-3 block text-xs uppercase tracking-[0.2em] text-black/50"
                >
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  placeholder="tugcegok"
                  autoComplete="username"
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
                    placeholder:text-black/30
                    focus:border-black/50
                  "
                />

              </div>

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-3 block text-xs uppercase tracking-[0.2em] text-black/50"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
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
                    placeholder:text-black/30
                    focus:border-black/50
                  "
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-3 block text-xs uppercase tracking-[0.2em] text-black/50"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Create a password"
                  autoComplete="new-password"
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
                    placeholder:text-black/30
                    focus:border-black/50
                  "
                />

              </div>

              {/* CONFIRM PASSWORD */}

              <div>

                <label
                  htmlFor="confirmPassword"
                  className="mb-3 block text-xs uppercase tracking-[0.2em] text-black/50"
                >
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Repeat your password"
                  autoComplete="new-password"
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
                    placeholder:text-black/30
                    focus:border-black/50
                  "
                />

              </div>

              {/* ======================================
                  ERROR MESSAGE
              ====================================== */}

              {error && (
                <div className="border border-red-500/30 bg-red-500/5 px-4 py-3">

                  <p className="text-sm text-red-700">
                    {error}
                  </p>

                </div>
              )}

              {/* ======================================
                  SUCCESS MESSAGE
              ====================================== */}

              {success && (
                <div className="border border-green-700/30 bg-green-700/5 px-4 py-3">

                  <p className="text-sm text-green-800">
                    {success}
                  </p>

                </div>
              )}

              {/* CREATE ACCOUNT BUTTON */}

              <button
                type="submit"
                disabled={isLoading}
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
                  transition-opacity
                  hover:opacity-80
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                <span>
                  {isLoading
                    ? "Creating account..."
                    : "Create account"}
                </span>

                <span className="text-xl">
                  →
                </span>

              </button>

            </form>

            {/* LOGIN LINK */}

            <p className="mt-8 text-sm text-black/50">
              Already have an account?{" "}

              <a
                href="/login"
                className="text-black underline underline-offset-4"
              >
                Sign in
              </a>

            </p>

          </div>

        </div>

      </section>

    </main>
  );
}