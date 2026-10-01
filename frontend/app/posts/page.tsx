"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  apiFetch,
} from "../../lib/api";


// ============================================================
// TYPES
// ============================================================

type Post = {
  id: number;
  title: string;
  content: string;
  owner_id: number;
  reading_time: number;
  status: string;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  category_id: number | null;
  tags: unknown[];
};


// ============================================================
// POSTS PAGE
// ============================================================

export default function PostsPage() {

  // ============================================================
  // STATES
  // ============================================================

  const [posts, setPosts] =
    useState<Post[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ============================================================
  // GET POSTS
  // ============================================================

  useEffect(() => {

    const getPosts = async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await apiFetch(
            "/posts",
            {
              method: "GET",
            }
          );


        if (!response.ok) {

          throw new Error(
            "Posts could not be loaded."
          );

        }


        const data: Post[] =
          await response.json();


        setPosts(data);


        console.log(
          "Posts:",
          data
        );


      } catch (error) {

        console.error(
          "Get posts error:",
          error
        );


        setError(
          "Could not load posts."
        );


      } finally {

        setLoading(false);

      }

    };


    getPosts();


  }, []);



  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8]">

        <p className="text-black/50">
          Loading stories...
        </p>

      </main>

    );

  }



  // ============================================================
  // ERROR
  // ============================================================

  if (error) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8]">

        <p className="text-red-600">
          {error}
        </p>

      </main>

    );

  }



  // ============================================================
  // EMPTY
  // ============================================================

  if (posts.length === 0) {

    return (

      <main className="min-h-screen bg-[#f5f1e8] px-6 py-20 text-black">

        <h1 className="text-5xl font-semibold">
          Stories
        </h1>


        <p className="mt-8 text-black/50">
          No published posts yet.
        </p>


      </main>

    );

  }



  // ============================================================
  // POSTS
  // ============================================================

  return (

    <main className="min-h-screen bg-[#f5f1e8] px-6 py-20 text-black">

      <div className="mx-auto max-w-5xl">


        <p className="text-xs uppercase tracking-[0.3em] text-black/40">
          Mindscape
        </p>


        <h1 className="mt-5 text-6xl font-semibold tracking-tight">
          Stories
        </h1>



        <div className="mt-16 space-y-8">


          {posts.map((post) => (

            <article
              key={post.id}
              className="border-b border-black/10 pb-8"
            >


              <h2 className="text-3xl font-semibold">
                {post.title}
              </h2>


              <p className="mt-4 leading-relaxed text-black/60">
                {post.content}
              </p>


              <div className="mt-5 flex gap-5 text-sm text-black/40">

                <span>
                  Reading time:
                  {" "}
                  {post.reading_time}
                  {" "}
                  min
                </span>


                <span>
                  Status:
                  {" "}
                  {post.status}
                </span>


                <span>
                  Owner:
                  {" "}
                  {post.owner_id}
                </span>


              </div>


            </article>

          ))}


        </div>


      </div>


    </main>

  );

}