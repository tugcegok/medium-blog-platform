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



// =====================================================
// TYPE
// =====================================================

type Post = {

  id:number;

  title:string;

  content:string;

  owner_id:number;

  status:string;

};




// =====================================================
// ADMIN POST DETAIL PAGE
// =====================================================

export default function AdminPostDetailPage(){


  const params =
    useParams();


  const router =
    useRouter();



  const postId =
    params.id as string;




  const [post,setPost] =
    useState<Post | null>(null);



  const [loading,setLoading] =
    useState(true);



  const [error,setError] =
    useState("");



  const [deleting,setDeleting] =
    useState(false);






// ===================================================
// GET POST DETAIL
// ===================================================


const getPost = async()=>{


  try{


    setLoading(true);

    setError("");



    const response =
      await apiFetch(
        `/admin/posts/${postId}`,
        {
          method:"GET",
        }
      );



    const data =
      await response.json();




    if(!response.ok){


      setError(
        data.detail ||
        "Post not found."
      );


      return;

    }



    setPost(
      data
    );


  }
  catch(error){


    console.error(
      "Admin post detail error:",
      error
    );


    setError(
      "Something went wrong."
    );


  }
  finally{


    setLoading(false);


  }


};






useEffect(()=>{


  if(postId){

    getPost();

  }


},[postId]);






// ===================================================
// DELETE POST
// ===================================================


const handleDeletePost = async()=>{


  const confirmDelete =
    window.confirm(
      "Are you sure you want to delete this post?"
    );



  if(!confirmDelete){

    return;

  }




  try{


    setDeleting(true);



    const response =
      await apiFetch(
        `/admin/posts/${postId}`,
        {
          method:"DELETE",
        }
      );




    if(!response.ok){


      const data =
        await response.json();


      setError(
        data.detail ||
        "Post could not be deleted."
      );


      return;

    }



    alert(
      "Post deleted successfully."
    );



    router.push(
      "/admin/posts"
    );



  }
  catch(error){


    console.error(
      error
    );


    setError(
      "Delete failed."
    );


  }
  finally{


    setDeleting(false);


  }


};

// ===================================================
// LOADING
// ===================================================

if(loading){

  return (

    <main className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-[#f5f1e8]
      text-black
    ">

      Loading post...

    </main>

  );

}






// ===================================================
// ERROR
// ===================================================

if(error && !post){

  return (

    <main className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-[#f5f1e8]
      text-red-600
    ">

      {error}

    </main>

  );

}






if(!post){

  return null;

}







// ===================================================
// PAGE
// ===================================================

return(


  <main className="
    min-h-screen
    bg-[#f5f1e8]
    px-6
    py-20
    text-black
  ">


    <section className="
      mx-auto
      max-w-4xl
    ">



      <button

        onClick={
          () =>
            router.back()
        }

        className="
          text-sm
          text-black/50
        "

      >

        ← Back

      </button>






      <h1 className="
        mt-10
        text-5xl
        font-semibold
      ">

        Post Detail

      </h1>







      <div className="
        mt-10
        rounded-2xl
        border
        border-black/10
        p-8
      ">



        <div className="
          space-y-6
        ">



          <div>

            <p className="
              text-sm
              text-black/40
            ">

              ID

            </p>


            <p className="
              mt-1
              text-lg
            ">

              {post.id}

            </p>


          </div>







          <div>

            <p className="
              text-sm
              text-black/40
            ">

              Title

            </p>


            <p className="
              mt-1
              text-xl
              font-medium
            ">

              {post.title}

            </p>


          </div>








          <div>

            <p className="
              text-sm
              text-black/40
            ">

              Owner ID

            </p>


            <p className="
              mt-1
            ">

              {post.owner_id}

            </p>


          </div>








          <div>

            <p className="
              text-sm
              text-black/40
            ">

              Status

            </p>



            <span className="
              mt-2
              inline-block
              rounded-full
              bg-black
              px-5
              py-2
              text-sm
              text-white
            ">

              {post.status}

            </span>


          </div>








          <div>

            <p className="
              text-sm
              text-black/40
              mb-2
            ">

              Content

            </p>



            <div className="
              rounded-xl
              border
              border-black/10
              p-5
              whitespace-pre-wrap
            ">

              {post.content}

            </div>


          </div>





        </div>







        <button

          onClick={
            handleDeletePost
          }

          disabled={
            deleting
          }

          className="
            mt-10
            rounded-full
            bg-red-600
            px-7
            py-3
            text-white
            disabled:opacity-40
          "

        >


          {
            deleting
            ?
            "Deleting..."
            :
            "Delete Post"
          }


        </button>





      </div>





    </section>





  </main>


);


}