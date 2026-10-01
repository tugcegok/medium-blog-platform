"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [isSending, setIsSending] =
    useState(false);


  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError(
        "Please enter your email."
      );
      return;
    }


    try {
      setIsSending(true);

      const response =
        await fetch(
          "http://127.0.0.1:8000/users/forgot-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email:
                email.trim(),
            }),
          }
        );


      let data;

      try {
        data =
          await response.json();
      } catch {
        data = null;
      }


      if (!response.ok) {
        console.error(
          "Forgot password error:",
          data
        );


        if (
          data &&
          typeof data.detail ===
            "string"
        ) {
          setError(
            data.detail
          );
        } else {
          setError(
            "Could not send reset email."
          );
        }

        return;
      }


      setSuccess(
        typeof data === "string"
          ? data
          : "Password reset email sent successfully."
      );


      setEmail("");


    } catch (error) {
      console.error(
        "Connection error:",
        error
      );

      setError(
        "Could not connect to server."
      );

    } finally {
      setIsSending(false);
    }
  };


  return (
    <main className="min-h-screen bg-[#f5f1e8] text-black">

      <nav className="border-b border-black/10 px-6 py-6">
        <button
          onClick={() =>
            router.push("/")
          }
          className="text-2xl font-semibold"
        >
          MINDSCAPE
        </button>
      </nav>


      <section className="mx-auto max-w-xl px-6 py-24">

        <p className="text-xs uppercase tracking-[0.3em] text-black/40">
          Account Recovery
        </p>


        <h1 className="mt-5 text-5xl font-semibold tracking-tight">
          Forgot password.
        </h1>


        <p className="mt-5 text-black/50">
          Enter your email address and
          we will send you a password
          reset link.
        </p>


        <form
          onSubmit={handleSubmit}
          className="mt-12 space-y-8"
        >

          <div>

            <label
              className="mb-3 block text-xs uppercase tracking-[0.2em] text-black/45"
            >
              Email
            </label>


            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="you@example.com"
              className="
                w-full
                border-b
                border-black
                bg-transparent
                py-3
                outline-none
              "
            />

          </div>


          {error && (
            <div className="border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}


          {success && (
            <div className="border border-green-700/30 bg-green-700/5 px-4 py-3 text-sm text-green-800">
              {success}
            </div>
          )}


          <button
            type="submit"
            disabled={isSending}
            className="
              rounded-full
              bg-black
              px-8
              py-3
              text-sm
              text-[#f5f1e8]
              disabled:opacity-50
            "
          >
            {
              isSending
                ? "Sending..."
                : "Send reset email"
            }

          </button>


        </form>

      </section>

    </main>
  );
}