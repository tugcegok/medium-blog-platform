"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  apiFetch,
} from "../../lib/api";


// ============================================================
// TYPE
// ============================================================

type Draft = {
  id: number;
  title: string;
  content: string;
  owner_id: number;
  reading_time: number;
  status: string;
  category_id: number | null;
  created_at: string;
  updated_at: string;
};


// ============================================================
// DRAFT PAGE
// ============================================================

export default function DraftsPage() {


  const router = useRouter();



  const [drafts, setDrafts] =
    useState<Draft[]>([]);



  const [loading, setLoading] =
    useState(true);



  const [error, setError] =
    useState("");



  const [publishing, setPublishing] =
    useState<number | null>(null);




  // ==========================================================
  // GET MY DRAFTS
  // ==========================================================

  useEffect(() => {


    const getDrafts = async () => {


      try {


        const response =
          await apiFetch(
            "/posts/me/drafts",
            {
              method: "GET",
            }
          );



        if(!response.ok){

          throw new Error(
            "Drafts could not be loaded."
          );

        }



        const data =
          await response.json();



        setDrafts(data);



        console.log(
          "Drafts:",
          data
        );



      } catch(error){


        console.error(
          error
        );


        setError(
          "Could not load drafts."
        );



      } finally {


        setLoading(false);


      }


    };



    getDrafts();



  }, []);





  // ==========================================================
  // PUBLISH DRAFT
  // ==========================================================

  const handlePublish = async (
    postId:number
  ) => {


    const confirmPublish =
      window.confirm(
        "Publish this draft?"
      );



    if(!confirmPublish){

      return;

    }



    try {


      setPublishing(postId);



      const response =
        await apiFetch(
          `/posts/${postId}/publish`,
          {
            method:"POST",
          }
        );



      const data =
        await response.json();



      if(!response.ok){


        throw new Error(
          data.detail ||
          "Publish failed."
        );


      }



      alert(
        "Post published successfully."
      );



      window.location.reload();



    } catch(error){


      console.error(
        error
      );



      alert(
        "Could not publish post."
      );



    } finally {


      setPublishing(null);


    }


  };





  // ==========================================================
  // LOADING
  // ==========================================================

  if(loading){

    return (

      <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8]">

        Loading drafts...

      </main>

    );

  }





  // ==========================================================
  // ERROR
  // ==========================================================

  if(error){

    return (

      <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8]">

        <p className="text-red-600">

          {error}

        </p>

      </main>

    );

  }





  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <main className="min-h-screen bg-[#f5f1e8] px-6 py-20 text-black">


      <div className="mx-auto max-w-5xl">


        <p className="text-xs uppercase tracking-[0.3em] text-black/40">

          Mindscape

        </p>



        <h1 className="mt-5 text-6xl font-semibold">

          My Drafts

        </h1>




        {
          drafts.length === 0

          ?


          <p className="mt-12 text-black/50">

            You don't have any drafts yet.

          </p>


          :


          <div className="mt-14 space-y-8">


            {
              drafts.map(

                (draft) => (

                  <article

                    key={draft.id}

                    className="border-b border-black/10 pb-8"

                  >


                    <h2 className="text-3xl font-semibold">

                      {draft.title}

                    </h2>



                    <p className="mt-4 text-black/60">

                      {draft.content}

                    </p>





                    <div className="mt-6 flex flex-wrap gap-4">


                      {/* EDIT */}

                      <button

                        onClick={() =>
                          router.push(
                            `/posts/${draft.id}/edit`
                          )
                        }

                        className="
                        rounded-full
                        border
                        border-black
                        px-6
                        py-3
                        text-sm
                        "

                      >

                        Edit

                      </button>





                      {/* PREVIEW */}

                      <button

                        onClick={() =>
                          router.push(
                            `/posts/${draft.id}`
                          )
                        }

                        className="
                        rounded-full
                        bg-black
                        px-6
                        py-3
                        text-sm
                        text-white
                        "

                      >

                        Preview

                      </button>





                      {/* PUBLISH */}

                      <button

                        onClick={() =>
                          handlePublish(
                            draft.id
                          )
                        }

                        disabled={
                          publishing === draft.id
                        }

                        className="
                        rounded-full
                        bg-[#7957ff]
                        px-6
                        py-3
                        text-sm
                        text-white
                        disabled:opacity-50
                        "

                      >

                        {
                          publishing === draft.id

                          ? "Publishing..."

                          : "Publish"
                        }


                      </button>




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