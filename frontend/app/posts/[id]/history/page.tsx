"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  apiFetch,
} from "../../../../lib/api";


// ============================================================
// TYPE
// ============================================================

type PostHistoryItem = {
  id: number;
  post_id: number;
  title: string;
  content: string;
  status: string;
  created_at: string;
};


// ============================================================
// VERSION HISTORY PAGE
// ============================================================

export default function PostHistoryPage() {

  const router = useRouter();

  const params = useParams();

  const postId =
    params.id as string;


  // ==========================================================
  // STATES
  // ==========================================================

  const [history, setHistory] =
    useState<PostHistoryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================================
  // GET POST HISTORY
  // ==========================================================

  useEffect(() => {

    const getHistory = async () => {

      try {

        setLoading(true);

        setError("");


        const response =
          await apiFetch(
            `/posts/${postId}/history`,
            {
              method: "GET",
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          const errorMessage =
            Array.isArray(data.detail)
              ? data.detail
                  .map(
                    (item: {
                      msg?: string;
                    }) =>
                      item.msg || "Validation error."
                  )
                  .join(", ")
              : data.detail ||
                "Version history could not be loaded.";


          setError(
            errorMessage
          );

          return;
        }


        setHistory(
          data
        );


      } catch (error) {

        console.error(
          "History error:",
          error
        );


        setError(
          "Server connection failed."
        );


      } finally {

        setLoading(false);

      }

    };


    if (postId) {

      getHistory();

    }

  }, [postId]);


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <main className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#f5f1e8]
        text-black
      ">

        <div className="text-center">

          <div className="
            mx-auto
            h-10
            w-10
            animate-spin
            rounded-full
            border-2
            border-black/20
            border-t-black
          " />

          <p className="
            mt-5
            text-sm
            text-black/50
          ">

            Loading version history...

          </p>

        </div>

      </main>

    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (

      <main className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#f5f1e8]
        px-6
        text-black
      ">

        <div className="
          max-w-lg
          text-center
        ">

          <p className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-black/40
          ">

            Version History Error

          </p>


          <h1 className="
            mt-5
            text-4xl
            font-semibold
          ">

            Something went wrong.

          </h1>


          <p className="
            mt-5
            text-red-600
          ">

            {error}

          </p>


          <button
            type="button"
            onClick={() =>
              router.push(
                `/posts/${postId}`
              )
            }
            className="
              mt-8
              rounded-full
              bg-black
              px-6
              py-3
              text-sm
              text-[#f5f1e8]
            "
          >

            Back to story

          </button>

        </div>

      </main>

    );

  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <main className="
      min-h-screen
      bg-[#f5f1e8]
      px-6
      py-20
      text-black
    ">

      <div className="
        mx-auto
        max-w-5xl
      ">


        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            router.push(
              `/posts/${postId}`
            )
          }
          className="
            text-sm
            text-black/50
            transition
            hover:text-black
          "
        >

          ← Back to story

        </button>


        {/* HEADER */}

        <div className="
          mt-12
          border-b
          border-black/15
          pb-12
        ">

          <p className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-black/40
          ">

            Mindscape Editor

          </p>


          <h1 className="
            mt-5
            text-5xl
            font-semibold
            tracking-[-0.05em]
            md:text-7xl
          ">

            Version History

          </h1>


          <p className="
            mt-6
            max-w-2xl
            leading-relaxed
            text-black/55
          ">

            Review previously saved versions of this story.

          </p>

        </div>


        {/* EMPTY STATE */}

        {
          history.length === 0

          ?

          <div className="
            py-20
            text-center
          ">

            <p className="
              text-lg
              text-black/50
            ">

              No version history found for this post.

            </p>

          </div>

          :

          <div className="
            mt-12
            space-y-8
          ">

            {
              history.map(
                (
                  version,
                  index
                ) => (

                  <article
                    key={version.id}
                    className="
                      rounded-2xl
                      border
                      border-black/15
                      bg-white/40
                      p-7
                      md:p-9
                    "
                  >

                    {/* VERSION HEADER */}

                    <div className="
                      flex
                      flex-col
                      gap-4
                      border-b
                      border-black/10
                      pb-6
                      sm:flex-row
                      sm:items-start
                      sm:justify-between
                    ">

                      <div>

                        <p className="
                          text-xs
                          uppercase
                          tracking-[0.25em]
                          text-black/40
                        ">

                          Version {
                            history.length - index
                          }

                        </p>


                        <h2 className="
                          mt-3
                          text-3xl
                          font-semibold
                          tracking-[-0.04em]
                        ">

                          {version.title}

                        </h2>

                      </div>


                      <div className="
                        text-sm
                        text-black/45
                      ">

                        {
                          new Date(
                            version.created_at
                          ).toLocaleString()
                        }

                      </div>

                    </div>


                    {/* VERSION META */}

                    <div className="
                      mt-6
                      flex
                      flex-wrap
                      gap-3
                    ">

                      <span className="
                        rounded-full
                        border
                        border-black/15
                        px-4
                        py-2
                        text-xs
                        uppercase
                        tracking-[0.18em]
                        text-black/50
                      ">

                        Status: {version.status}

                      </span>


                      <span className="
                        rounded-full
                        border
                        border-black/15
                        px-4
                        py-2
                        text-xs
                        uppercase
                        tracking-[0.18em]
                        text-black/50
                      ">

                        Version ID: {version.id}

                      </span>

                    </div>


                    {/* CONTENT */}

                    <div className="
                      mt-8
                      border-t
                      border-black/10
                      pt-7
                    ">

                      <p className="
                        whitespace-pre-line
                        text-base
                        leading-[1.9]
                        text-black/65
                      ">

                        {version.content}

                      </p>

                    </div>

                  </article>

                )
              )
            }

          </div>

        }

      </div>

    </main>

  );

}