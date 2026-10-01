"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useSearchParams,
  useRouter,
} from "next/navigation";


export default function ResetPasswordPage() {

  const router = useRouter();

  const searchParams =
    useSearchParams();


  const token =
    searchParams.get("token");


  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");


  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);



  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    setError("");
    setSuccess("");


    if (!token) {
      setError(
        "Reset token is missing."
      );
      return;
    }


    if (
      !newPassword ||
      !confirmPassword
    ) {
      setError(
        "Please fill all fields."
      );
      return;
    }


    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }


    try {

      setLoading(true);


      const response =
        await fetch(
          "http://127.0.0.1:8000/users/reset-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              token: token,

              new_password:
                newPassword,

            }),
          }
        );


      const data =
        await response.json();



      if (!response.ok) {

        if (
          typeof data.detail ===
          "string"
        ) {

          setError(
            data.detail
          );

        } else {

          setError(
            "Password reset failed."
          );

        }

        return;
      }



      setSuccess(
        "Password changed successfully."
      );


      setNewPassword("");
      setConfirmPassword("");



      setTimeout(() => {

        router.push(
          "/login"
        );

      }, 1500);



    } catch(error) {

      console.error(
        error
      );

      setError(
        "Could not connect to server."
      );


    } finally {

      setLoading(false);

    }

  };



  return (

    <main className="min-h-screen bg-[#f5f1e8] text-black">


      <section className="mx-auto max-w-xl px-6 py-24">


        <p className="text-xs uppercase tracking-[0.3em] text-black/40">
          Account Recovery
        </p>


        <h1 className="mt-5 text-5xl font-semibold">
          Reset password.
        </h1>


        <p className="mt-5 text-black/50">
          Create a new password for your account.
        </p>



        <form
          onSubmit={
            handleSubmit
          }
          className="mt-12 space-y-8"
        >


          <div>

            <label className="mb-3 block text-xs uppercase tracking-[0.2em]">
              New Password
            </label>


            <input

              type="password"

              value={
                newPassword
              }

              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }

              className="w-full border-b border-black bg-transparent py-3 outline-none"

              placeholder="New password"

            />

          </div>



          <div>

            <label className="mb-3 block text-xs uppercase tracking-[0.2em]">
              Confirm Password
            </label>


            <input

              type="password"

              value={
                confirmPassword
              }

              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }

              className="w-full border-b border-black bg-transparent py-3 outline-none"

              placeholder="Repeat password"

            />

          </div>




          {error && (

            <div className="border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-700">

              {error}

            </div>

          )}



          {success && (

            <div className="border border-green-700/30 bg-green-700/5 p-4 text-sm text-green-800">

              {success}

            </div>

          )}




          <button

            type="submit"

            disabled={
              loading
            }

            className="rounded-full bg-black px-8 py-3 text-sm text-[#f5f1e8]"

          >

            {
              loading
                ? "Resetting..."
                : "Reset password"
            }


          </button>



        </form>


      </section>


    </main>

  );

}