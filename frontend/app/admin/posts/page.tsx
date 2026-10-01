"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  apiFetch,
} from "../../../lib/api";


// =====================================================
// TYPE
// =====================================================

type Post = {
  id: number;
  title: string;
  content: string;
  owner_id: number;
  status: string;
};



// =====================================================
// ADMIN POSTS PAGE
// =====================================================

export default function AdminPostsPage(){


  const [posts,setPosts] =
    useState<Post[]>([]);


  const [loading,setLoading] =
    useState(true);


  const [error,setError] =
    useState("");





  // ===================================================
  // GET ALL POSTS
  // ===================================================

  const getPosts = async()=>{


    try{


      setLoading(true);

      setError("");



      const response =
        await apiFetch(
          "/admin/posts",
          {
            method:"GET",
          }
        );



      const data =
        await response.json();




      if(!response.ok){


        setError(
          data.detail ||
          "Posts could not be loaded."
        );


        return;

      }



      setPosts(
        data
      );


    }
    catch(error){


      console.error(
        "Admin posts error:",
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


    getPosts();


  },[]);






  // ===================================================
  // LOADING
  // ===================================================

  if(loading){


    return(

      <main className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-[#f5f1e8]
      ">

        Loading posts...

      </main>

    );

  }





  // ===================================================
  // ERROR
  // ===================================================

  if(error){


    return(

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
        max-w-5xl
      ">



        <h1 className="
          text-5xl
          font-semibold
        ">

          Admin Posts

        </h1>



        <p className="
          mt-3
          text-black/50
        ">

          Manage all blog posts

        </p>





        <div className="
          mt-10
          space-y-5
        ">


          {
            posts.map(
              post=>(


                <div
                  key={
                    post.id
                  }
                  className="
                    rounded-2xl
                    border
                    border-black/10
                    p-6
                  "
                >



                  <h2 className="
                    text-xl
                    font-medium
                  ">

                    {post.title}

                  </h2>



                  <p className="
                    mt-2
                    text-sm
                    text-black/50
                  ">

                    Owner ID:
                    {" "}
                    {post.owner_id}

                  </p>




                  <span className="
                    mt-4
                    inline-block
                    rounded-full
                    bg-black
                    px-4
                    py-2
                    text-sm
                    text-white
                  ">

                    {post.status}

                  </span>




                  <div className="
                    mt-5
                  ">


                    <Link
                      href={
                        `/admin/posts/${post.id}`
                      }
                      className="
                        text-sm
                        underline
                      "
                    >

                      View Detail

                    </Link>


                  </div>




                </div>


              )
            )
          }



        </div>



      </section>



    </main>


  );


}