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
// TYPES
// ============================================================

type DashboardStats = {
  user_id: number;
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_likes: number;
  total_comments: number;
  followers: number;
  following: number;
};


type TopPost = {
  post_id: number;
  title: string;
  like_count: number;
};


type RecentComment = {
  comment_id: number;
  content: string;
  comment_owner_id: number;
  post_id: number;
  post_title: string;
};


type ViewStats = {
  daily_views: number;
  weekly_views: number;
  monthly_views: number;
  total_views: number;
};


type TopViewedPost = {
  post_id: number;
  title: string;
  view_count: number;
};


type PostPerformance = {
  post_id: number;
  title: string;
  status: string;
  view_count: number;
  like_count: number;
  comment_count: number;
};


// ============================================================
// DASHBOARD PAGE
// ============================================================

export default function DashboardPage() {

  const router =
    useRouter();


  // ==========================================================
  // STATES
  // ==========================================================

  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [topPosts, setTopPosts] =
    useState<TopPost[]>([]);

  const [recentComments, setRecentComments] =
    useState<RecentComment[]>([]);

  const [viewStats, setViewStats] =
    useState<ViewStats | null>(null);

  const [topViewedPosts, setTopViewedPosts] =
    useState<TopViewedPost[]>([]);

  const [performance, setPerformance] =
    useState<PostPerformance[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================================
  // GET DASHBOARD STATS
  // ==========================================================

  const getStats = async () => {

    const response =
      await apiFetch(
        "/dashboard/stats",
        {
          method: "GET",
        }
      );

    if (!response.ok) {

      throw new Error(
        "Dashboard statistics could not be loaded."
      );

    }

    const data:
      DashboardStats =
      await response.json();

    setStats(
      data
    );

  };


  // ==========================================================
  // GET TOP POSTS
  // ==========================================================

  const getTopPosts = async () => {

    const response =
      await apiFetch(
        "/dashboard/top-posts?limit=5",
        {
          method: "GET",
        }
      );

    if (!response.ok) {
      return;
    }

    const data =
      await response.json();

    setTopPosts(
      Array.isArray(data)
        ? data
        : []
    );

  };


  // ==========================================================
  // GET RECENT COMMENTS
  // ==========================================================

  const getRecentComments = async () => {

    const response =
      await apiFetch(
        "/dashboard/recent-comments?limit=5",
        {
          method: "GET",
        }
      );

    if (!response.ok) {
      return;
    }

    const data =
      await response.json();

    setRecentComments(
      Array.isArray(data)
        ? data
        : []
    );

  };


  // ==========================================================
  // GET VIEW STATS
  // ==========================================================

  const getViewStats = async () => {

    const response =
      await apiFetch(
        "/dashboard/views",
        {
          method: "GET",
        }
      );

    if (!response.ok) {
      return;
    }

    const data:
      ViewStats =
      await response.json();

    setViewStats(
      data
    );

  };


  // ==========================================================
  // GET TOP VIEWED POSTS
  // ==========================================================

  const getTopViewedPosts = async () => {

    const response =
      await apiFetch(
        "/dashboard/top-viewed-posts?limit=5",
        {
          method: "GET",
        }
      );

    if (!response.ok) {
      return;
    }

    const data =
      await response.json();

    setTopViewedPosts(
      Array.isArray(data)
        ? data
        : []
    );

  };


  // ==========================================================
  // GET POST PERFORMANCE
  // ==========================================================

  const getPerformance = async () => {

    const response =
      await apiFetch(
        "/dashboard/post-performance",
        {
          method: "GET",
        }
      );

    if (!response.ok) {
      return;
    }

    const data =
      await response.json();

    setPerformance(
      Array.isArray(data)
        ? data
        : []
    );

  };


  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  const loadDashboard = async () => {

    try {

      setLoading(
        true
      );

      setError(
        ""
      );


      await Promise.all([
        getStats(),
        getTopPosts(),
        getRecentComments(),
        getViewStats(),
        getTopViewedPosts(),
        getPerformance(),
      ]);

    } catch (error) {

      console.error(
        "Dashboard error:",
        error
      );

      setError(
        "Could not load dashboard."
      );

    } finally {

      setLoading(
        false
      );

    }

  };


  useEffect(() => {

    loadDashboard();

  }, []);


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

        Loading dashboard...

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
          text-center
        ">

          <p className="
            text-red-600
          ">

            {error}

          </p>


          <button
            type="button"
            onClick={
              loadDashboard
            }
            className="
              mt-6
              rounded-full
              bg-black
              px-6
              py-3
              text-sm
              text-white
            "
          >

            Try again

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

      <section className="
        mx-auto
        max-w-6xl
      ">


        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            router.back()
          }
          className="
            text-sm
            text-black/50
            transition
            hover:text-black
          "
        >

          ← Back

        </button>


        {/* HEADER */}

        <div className="
          mt-12
          border-b
          border-black
          pb-10
        ">

          <p className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-black/40
          ">

            Mindscape Analytics

          </p>


          <h1 className="
            mt-5
            text-5xl
            font-semibold
            tracking-[-0.05em]
            md:text-7xl
          ">

            Dashboard

          </h1>


          <p className="
            mt-5
            max-w-2xl
            text-base
            leading-relaxed
            text-black/55
          ">

            Track your stories,
            engagement and audience
            performance.

          </p>

        </div>


        {/* ====================================================
            MAIN STATS
        ==================================================== */}

        {
          stats
          &&
          <section className="
            mt-12
          ">

            <p className="
              text-xs
              uppercase
              tracking-[0.25em]
              text-black/40
            ">

              Overview

            </p>


            <div className="
              mt-6
              grid
              gap-px
              overflow-hidden
              rounded-2xl
              border
              border-black/15
              bg-black/15
              sm:grid-cols-2
              lg:grid-cols-4
            ">

              {
                [
                  {
                    label:
                      "Total Stories",
                    value:
                      stats.total_posts,
                  },
                  {
                    label:
                      "Published",
                    value:
                      stats.published_posts,
                  },
                  {
                    label:
                      "Drafts",
                    value:
                      stats.draft_posts,
                  },
                  {
                    label:
                      "Likes",
                    value:
                      stats.total_likes,
                  },
                  {
                    label:
                      "Comments",
                    value:
                      stats.total_comments,
                  },
                  {
                    label:
                      "Followers",
                    value:
                      stats.followers,
                  },
                  {
                    label:
                      "Following",
                    value:
                      stats.following,
                  },
                  {
                    label:
                      "User ID",
                    value:
                      stats.user_id,
                  },
                ].map(
                  item => (

                    <div
                      key={
                        item.label
                      }
                      className="
                        bg-[#f5f1e8]
                        p-7
                      "
                    >

                      <p className="
                        text-xs
                        uppercase
                        tracking-[0.18em]
                        text-black/40
                      ">

                        {item.label}

                      </p>


                      <p className="
                        mt-4
                        text-4xl
                        font-semibold
                        tracking-[-0.04em]
                      ">

                        {item.value}

                      </p>

                    </div>

                  )
                )
              }

            </div>

          </section>
        }


        {/* ====================================================
            VIEW STATS
        ==================================================== */}

        {
          viewStats
          &&
          <section className="
            mt-16
          ">

            <p className="
              text-xs
              uppercase
              tracking-[0.25em]
              text-black/40
            ">

              Views

            </p>


            <h2 className="
              mt-3
              text-3xl
              font-semibold
            ">

              Story views

            </h2>


            <div className="
              mt-6
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            ">

              {
                [
                  {
                    label:
                      "Today",
                    value:
                      viewStats.daily_views,
                  },
                  {
                    label:
                      "This Week",
                    value:
                      viewStats.weekly_views,
                  },
                  {
                    label:
                      "This Month",
                    value:
                      viewStats.monthly_views,
                  },
                  {
                    label:
                      "All Time",
                    value:
                      viewStats.total_views,
                  },
                ].map(
                  item => (

                    <div
                      key={
                        item.label
                      }
                      className="
                        rounded-2xl
                        border
                        border-black/15
                        p-6
                      "
                    >

                      <p className="
                        text-sm
                        text-black/45
                      ">

                        {item.label}

                      </p>


                      <p className="
                        mt-3
                        text-4xl
                        font-semibold
                      ">

                        {item.value}

                      </p>

                    </div>

                  )
                )
              }

            </div>

          </section>
        }


        {/* ====================================================
            TOP POSTS
        ==================================================== */}

        <section className="
          mt-16
          grid
          gap-12
          lg:grid-cols-2
        ">


          {/* TOP LIKED */}

          <div>

            <p className="
              text-xs
              uppercase
              tracking-[0.25em]
              text-black/40
            ">

              Engagement

            </p>


            <h2 className="
              mt-3
              text-3xl
              font-semibold
            ">

              Most liked stories

            </h2>


            <div className="
              mt-6
              border-t
              border-black
            ">

              {
                topPosts.map(
                  (
                    post,
                    index
                  ) => (

                    <button
                      key={
                        post.post_id
                      }
                      type="button"
                      onClick={() =>
                        router.push(
                          `/posts/${post.post_id}`
                        )
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                        gap-5
                        border-b
                        border-black/15
                        py-5
                        text-left
                      "
                    >

                      <div>

                        <p className="
                          text-xs
                          text-black/35
                        ">

                          #{index + 1}

                        </p>


                        <p className="
                          mt-2
                          font-medium
                        ">

                          {post.title}

                        </p>

                      </div>


                      <span className="
                        text-sm
                        text-black/45
                      ">

                        ♥ {post.like_count}

                      </span>

                    </button>

                  )
                )
              }

            </div>

          </div>


          {/* TOP VIEWED */}

          <div>

            <p className="
              text-xs
              uppercase
              tracking-[0.25em]
              text-black/40
            ">

              Reach

            </p>


            <h2 className="
              mt-3
              text-3xl
              font-semibold
            ">

              Most viewed stories

            </h2>


            <div className="
              mt-6
              border-t
              border-black
            ">

              {
                topViewedPosts.map(
                  (
                    post,
                    index
                  ) => (

                    <button
                      key={
                        post.post_id
                      }
                      type="button"
                      onClick={() =>
                        router.push(
                          `/posts/${post.post_id}`
                        )
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                        gap-5
                        border-b
                        border-black/15
                        py-5
                        text-left
                      "
                    >

                      <div>

                        <p className="
                          text-xs
                          text-black/35
                        ">

                          #{index + 1}

                        </p>


                        <p className="
                          mt-2
                          font-medium
                        ">

                          {post.title}

                        </p>

                      </div>


                      <span className="
                        text-sm
                        text-black/45
                      ">

                        {post.view_count}
                        {" "}
                        views

                      </span>

                    </button>

                  )
                )
              }

            </div>

          </div>

        </section>


        {/* ====================================================
            RECENT COMMENTS
        ==================================================== */}

        <section className="
          mt-16
        ">

          <p className="
            text-xs
            uppercase
            tracking-[0.25em]
            text-black/40
          ">

            Discussion

          </p>


          <h2 className="
            mt-3
            text-3xl
            font-semibold
          ">

            Recent comments

          </h2>


          <div className="
            mt-6
            border-t
            border-black
          ">

            {
              recentComments.map(
                comment => (

                  <article
                    key={
                      comment.comment_id
                    }
                    className="
                      border-b
                      border-black/15
                      py-6
                    "
                  >

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/posts/${comment.post_id}`
                        )
                      }
                      className="
                        block
                        w-full
                        text-left
                      "
                    >

                      <div className="
                        flex
                        flex-wrap
                        gap-4
                        text-xs
                        uppercase
                        tracking-[0.15em]
                        text-black/35
                      ">

                        <span>

                          Comment #{comment.comment_id}

                        </span>


                        <span>

                          User #{comment.comment_owner_id}

                        </span>

                      </div>


                      <p className="
                        mt-3
                        font-medium
                      ">

                        {comment.post_title}

                      </p>


                      <p className="
                        mt-3
                        text-sm
                        leading-relaxed
                        text-black/60
                      ">

                        {comment.content}

                      </p>

                    </button>

                  </article>

                )
              )
            }

          </div>

        </section>


        {/* ====================================================
            POST PERFORMANCE
        ==================================================== */}

        <section className="
          mt-16
          pb-20
        ">

          <p className="
            text-xs
            uppercase
            tracking-[0.25em]
            text-black/40
          ">

            Performance

          </p>


          <h2 className="
            mt-3
            text-3xl
            font-semibold
          ">

            Story performance

          </h2>


          <div className="
            mt-6
            overflow-x-auto
          ">

            <table className="
              w-full
              min-w-[700px]
              border-collapse
            ">

              <thead>

                <tr className="
                  border-b
                  border-black
                  text-left
                  text-xs
                  uppercase
                  tracking-[0.14em]
                  text-black/40
                ">

                  <th className="
                    py-4
                    pr-6
                  ">

                    Story

                  </th>


                  <th className="
                    py-4
                    pr-6
                  ">

                    Status

                  </th>


                  <th className="
                    py-4
                    pr-6
                  ">

                    Views

                  </th>


                  <th className="
                    py-4
                    pr-6
                  ">

                    Likes

                  </th>


                  <th className="
                    py-4
                  ">

                    Comments

                  </th>

                </tr>

              </thead>


              <tbody>

                {
                  performance.map(
                    post => (

                      <tr
                        key={
                          post.post_id
                        }
                        className="
                          border-b
                          border-black/15
                        "
                      >

                        <td className="
                          py-5
                          pr-6
                        ">

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/posts/${post.post_id}`
                              )
                            }
                            className="
                              text-left
                              font-medium
                              hover:underline
                            "
                          >

                            {post.title}

                          </button>

                        </td>


                        <td className="
                          py-5
                          pr-6
                          text-sm
                          capitalize
                          text-black/55
                        ">

                          {post.status}

                        </td>


                        <td className="
                          py-5
                          pr-6
                        ">

                          {post.view_count}

                        </td>


                        <td className="
                          py-5
                          pr-6
                        ">

                          {post.like_count}

                        </td>


                        <td className="
                          py-5
                        ">

                          {post.comment_count}

                        </td>

                      </tr>

                    )
                  )
                }

              </tbody>

            </table>

          </div>

        </section>

      </section>

    </main>

  );

}