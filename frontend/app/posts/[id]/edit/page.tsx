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

type Post = {
  id: number;
  title: string;
  content: string;
  owner_id: number;
  reading_time: number;
  status: string;
  category_id: number | null;
  tags: {
    id: number;
    name: string;
    slug: string;
  }[];
};


// ============================================================
// EDIT PAGE
// ============================================================

export default function EditPostPage() {


  const router = useRouter();

  const params = useParams();


  const postId =
    params.id as string;



  // ==========================================================
  // STATES
  // ==========================================================

  const [title, setTitle] =
    useState("");


  const [content, setContent] =
    useState("");


  const [categoryId, setCategoryId] =
    useState("");


  const [tagIds, setTagIds] =
    useState("");



  const [loading, setLoading] =
    useState(true);



  const [saving, setSaving] =
    useState(false);



  const [error, setError] =
    useState("");



  const [success, setSuccess] =
    useState("");



  const [autosaveStatus, setAutosaveStatus] =
    useState("");
  const [postStatus, setPostStatus] =
    useState("");


  // İlk yükleme kontrolü
  const [isInitialLoad, setIsInitialLoad] =
    useState(true);





  // ==========================================================
  // GET CURRENT POST
  // ==========================================================

  useEffect(() => {


    const getPost = async () => {


      try {


        const response =
          await apiFetch(
            `/posts/${postId}`,
            {
              method:"GET",
            }
          );



        if(!response.ok){

          throw new Error(
            "Post not found."
          );

        }



        const data:Post =
          await response.json();




        setTitle(
          data.title
        );
         
        setPostStatus(
          data.status
        );



        setContent(
          data.content
        );



        setCategoryId(
          data.category_id
            ? String(data.category_id)
            : ""
        );



        setTagIds(
          data.tags
            .map(
              tag =>
                tag.id
            )
            .join(",")
        );



        setTimeout(() => {

          setIsInitialLoad(false);

        },500);



      }catch(error){


        console.error(
          error
        );


        setError(
          "Could not load post."
        );



      }finally{


        setLoading(false);


      }


    };



    if(postId){

      getPost();

    }


  },[postId]);





  // ==========================================================
  // AUTOSAVE
  // ==========================================================

  const handleAutosave = async () => {


    try {


      setAutosaveStatus(
        "Saving..."
      );



      let parsedTags:number[] = [];




      if(tagIds.trim()){


        parsedTags =
          tagIds
            .split(",")
            .map(
              item =>
                Number(
                  item.trim()
                )
            );


      }
            const response =
        await apiFetch(
          `/posts/${postId}/autosave`,
          {

            method:"PUT",

            headers:{
              "Content-Type":
                "application/json",
            },


            body:
              JSON.stringify({

                title,

                content,


                category_id:
                  categoryId
                    ? Number(categoryId)
                    : null,


                tag_ids:
                  parsedTags,

              })

          }
        );


     if(!response.ok){

  const errorData =
    await response.json();


  console.error(
    "Autosave error:",
    errorData
  );


  throw new Error(
    errorData.detail ||
    "Autosave failed."
  );

}



      setAutosaveStatus(
        "Saved ✓"
      );



    }catch(error){


      console.error(
        error
      );


      setAutosaveStatus(
        "Autosave failed"
      );


    }


  };





  // ==========================================================
  // AUTOSAVE TIMER
  // ==========================================================

  useEffect(() => {


    if(
  loading ||
  isInitialLoad ||
  (
    postStatus !== "draft" &&
    postStatus !== "scheduled"
  )
){

  return;

}

    const timer =
      setTimeout(() => {


        handleAutosave();


      },5000);



    return () => {


      clearTimeout(timer);


    };


  },[
    title,
    content,
    categoryId,
    tagIds,
    loading,
    isInitialLoad
  ]);





  // ==========================================================
  // UPDATE POST
  // ==========================================================

  const handleUpdate =
    async(
      event:
        React.FormEvent<HTMLFormElement>
    ) => {


    event.preventDefault();



    try {


      setSaving(true);

      setError("");

      setSuccess("");



      let parsedTags:number[] = [];



      if(tagIds.trim()){


        parsedTags =
          tagIds
            .split(",")
            .map(
              item =>
                Number(
                  item.trim()
                )
            );


      }



      const response =
        await apiFetch(
          `/posts/${postId}`,
          {

            method:"PUT",

            headers:{
              "Content-Type":
                "application/json",
            },


            body:
              JSON.stringify({

                title,

                content,


                category_id:
                  categoryId
                    ? Number(categoryId)
                    : null,


                tag_ids:
                  parsedTags,

              })

          }
        );



      const data =
        await response.json();




      if(!response.ok){


        setError(
          data.detail ||
          "Update failed."
        );


        return;


      }



      setSuccess(
        "Post updated successfully."
      );



      setTimeout(() => {


        router.push(
          `/posts/${postId}`
        );


      },1000);



    }catch(error){


      console.error(
        error
      );


      setError(
        "Server connection failed."
      );


    }finally{


      setSaving(false);


    }


  };





  // ==========================================================
  // LOADING
  // ==========================================================

  if(loading){

    return (

      <main className="flex min-h-screen items-center justify-center">

        Loading...

      </main>

    );

  }





  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <main className="min-h-screen bg-[#f5f1e8] px-6 py-20 text-black">


      <div className="mx-auto max-w-4xl">


        <h1 className="text-6xl font-semibold">

          Edit Story

        </h1>





        <form
          onSubmit={handleUpdate}
          className="mt-12 space-y-8"
        >


          <input

            value={title}

            onChange={
              e =>
                setTitle(
                  e.target.value
                )
            }

            className="
            w-full
            border-b
            border-black
            bg-transparent
            py-4
            text-3xl
            outline-none
            "

          />




          <textarea

            value={content}

            onChange={
              e =>
                setContent(
                  e.target.value
                )
            }

            rows={12}

            className="
            w-full
            border
            border-black/20
            bg-transparent
            p-5
            leading-relaxed
            outline-none
            "

          />




          <input

            value={categoryId}

            onChange={
              e =>
                setCategoryId(
                  e.target.value
                )
            }

            placeholder="Category ID"

            className="
            w-full
            border-b
            border-black
            bg-transparent
            py-3
            "

          />




          <input

            value={tagIds}

            onChange={
              e =>
                setTagIds(
                  e.target.value
                )
            }

            placeholder="Tag IDs: 1,2,3"

            className="
            w-full
            border-b
            border-black
            bg-transparent
            py-3
            "

          />




          {
            autosaveStatus && (

              <p className="text-sm text-black/50">

                {autosaveStatus}

              </p>

            )
          }





          {error && (

            <p className="text-red-600">

              {error}

            </p>

          )}





          {success && (

            <p className="text-green-700">

              {success}

            </p>

          )}





          <button

            disabled={saving}

            className="
            rounded-full
            bg-black
            px-8
            py-3
            text-[#f5f1e8]
            "

          >

            {
              saving
                ? "Saving..."
                : "Save changes"
            }


          </button>



        </form>



      </div>


    </main>

  );

}