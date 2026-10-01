"use client";

import {
  useState,
} from "react";

import type {
  FormEvent,
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

type SearchPost = {
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

  tags: {
    id: number;
    name: string;
    slug: string;
  }[];
};


type SearchMode =
  | "stories"
  | "authors"
  | "tags"
  | "categories"
  | "advanced";


type SortOption =
  | "newest"
  | "oldest";


// ============================================================
// SEARCH PAGE
// ============================================================

export default function SearchPage() {

  const router =
    useRouter();


  // ==========================================================
  // GENERAL STATES
  // ==========================================================

  const [searchMode, setSearchMode] =
    useState<SearchMode>(
      "stories"
    );


  const [query, setQuery] =
    useState("");


  const [results, setResults] =
    useState<SearchPost[]>([]);


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState("");


  const [searched, setSearched] =
    useState(false);


  // ==========================================================
  // ADVANCED SEARCH STATES
  // ==========================================================

  const [advancedQuery, setAdvancedQuery] =
    useState("");


  const [categoryId, setCategoryId] =
    useState("");


  const [tagId, setTagId] =
    useState("");


  const [authorId, setAuthorId] =
    useState("");


  const [sort, setSort] =
    useState<SortOption>(
      "newest"
    );


  // ==========================================================
  // RESET ADVANCED FORM
  // ==========================================================

  const resetAdvancedForm = () => {

    setAdvancedQuery(
      ""
    );

    setCategoryId(
      ""
    );

    setTagId(
      ""
    );

    setAuthorId(
      ""
    );

    setSort(
      "newest"
    );

  };


  // ==========================================================
  // CHANGE SEARCH MODE
  // ==========================================================

  const handleChangeMode = (
    mode: SearchMode
  ) => {

    setSearchMode(
      mode
    );

    setQuery(
      ""
    );

    setResults(
      []
    );

    setError(
      ""
    );

    setSearched(
      false
    );

    resetAdvancedForm();

  };


  // ==========================================================
  // NORMAL SEARCH
  // ==========================================================

  const handleSearch = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();


    const cleanQuery =
      query.trim();


    if (!cleanQuery) {

      if (
        searchMode === "stories"
      ) {

        setError(
          "Please enter a search term."
        );

      } else if (
        searchMode === "authors"
      ) {

        setError(
          "Please enter an author username."
        );

      } else if (
        searchMode === "tags"
      ) {

        setError(
          "Please enter a tag name."
        );

      } else if (
        searchMode === "categories"
      ) {

        setError(
          "Please enter a category name."
        );

      }


      setResults(
        []
      );

      setSearched(
        false
      );

      return;

    }


    try {

      setLoading(
        true
      );

      setError(
        ""
      );

      setSearched(
        true
      );


      let endpoint = "";


      if (
        searchMode === "stories"
      ) {

        endpoint =
          `/search/posts?q=${encodeURIComponent(
            cleanQuery
          )}`;

      } else if (
        searchMode === "authors"
      ) {

        endpoint =
          `/search/authors?username=${encodeURIComponent(
            cleanQuery
          )}`;

      } else if (
        searchMode === "tags"
      ) {

        endpoint =
          `/search/tags?tag=${encodeURIComponent(
            cleanQuery
          )}`;

      } else if (
        searchMode === "categories"
      ) {

        endpoint =
          `/search/categories?category=${encodeURIComponent(
            cleanQuery
          )}`;

      } else {

        return;

      }


      const response =
        await apiFetch(
          endpoint,
          {
            method: "GET",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        const errorMessage =
          Array.isArray(
            data.detail
          )
            ? data.detail
                .map(
                  (
                    item: {
                      msg?: string;
                    }
                  ) =>
                    item.msg ||
                    "Validation error."
                )
                .join(", ")
            : data.detail ||
              "Search failed.";


        setError(
          errorMessage
        );

        setResults(
          []
        );

        return;

      }


      setResults(
        Array.isArray(data)
          ? data
          : []
      );


    } catch (error) {

      console.error(
        "Search error:",
        error
      );

      setError(
        "Could not search posts."
      );

      setResults(
        []
      );


    } finally {

      setLoading(
        false
      );

    }

  };


  // ==========================================================
  // ADVANCED SEARCH
  // ==========================================================

  const handleAdvancedSearch = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();


    try {

      setLoading(
        true
      );

      setError(
        ""
      );

      setSearched(
        true
      );


      const params =
        new URLSearchParams();


      if (
        advancedQuery.trim()
      ) {

        params.set(
          "q",
          advancedQuery.trim()
        );

      }


      if (
        categoryId.trim()
      ) {

        params.set(
          "category_id",
          categoryId.trim()
        );

      }


      if (
        tagId.trim()
      ) {

        params.set(
          "tag_id",
          tagId.trim()
        );

      }


      if (
        authorId.trim()
      ) {

        params.set(
          "author_id",
          authorId.trim()
        );

      }


      params.set(
        "sort",
        sort
      );


      const response =
        await apiFetch(
          `/search/advanced?${params.toString()}`,
          {
            method: "GET",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        const errorMessage =
          Array.isArray(
            data.detail
          )
            ? data.detail
                .map(
                  (
                    item: {
                      msg?: string;
                    }
                  ) =>
                    item.msg ||
                    "Validation error."
                )
                .join(", ")
            : data.detail ||
              "Advanced search failed.";


        setError(
          errorMessage
        );

        setResults(
          []
        );

        return;

      }


      setResults(
        Array.isArray(data)
          ? data
          : []
      );


    } catch (error) {

      console.error(
        "Advanced search error:",
        error
      );

      setError(
        "Could not perform advanced search."
      );

      setResults(
        []
      );


    } finally {

      setLoading(
        false
      );

    }

  };


  // ==========================================================
  // DESCRIPTION
  // ==========================================================

  const getDescription = () => {

    switch (
      searchMode
    ) {

      case "stories":

        return (
          "Search through story titles and content."
        );


      case "authors":

        return (
          "Find stories written by a specific author."
        );


      case "tags":

        return (
          "Discover stories connected to a specific tag."
        );


      case "categories":

        return (
          "Browse stories belonging to a specific category."
        );


      case "advanced":

        return (
          "Combine multiple filters to find exactly the stories you want."
        );


      default:

        return "";

    }

  };


  // ==========================================================
  // PLACEHOLDER
  // ==========================================================

  const getPlaceholder = () => {

    switch (
      searchMode
    ) {

      case "stories":

        return (
          "Search stories..."
        );


      case "authors":

        return (
          "Search by username..."
        );


      case "tags":

        return (
          "Search by tag..."
        );


      case "categories":

        return (
          "Search by category..."
        );


      default:

        return "";

    }

  };


  // ==========================================================
  // RESULTS TITLE
  // ==========================================================

  const getResultsTitle = () => {

    switch (
      searchMode
    ) {

      case "stories":

        return (
          "Search results"
        );


      case "authors":

        return (
          "Stories by author"
        );


      case "tags":

        return (
          "Stories by tag"
        );


      case "categories":

        return (
          "Stories by category"
        );


      case "advanced":

        return (
          "Advanced search results"
        );


      default:

        return (
          "Search results"
        );

    }

  };


  // ==========================================================
  // SEARCH DESCRIPTION
  // ==========================================================

  const getSearchDescription = () => {

    const cleanQuery =
      query.trim();


    if (
      searchMode === "stories"
    ) {

      return (
        `Searching for "${cleanQuery}"`
      );

    }


    if (
      searchMode === "authors"
    ) {

      return (
        `Author: @${cleanQuery}`
      );

    }


    if (
      searchMode === "tags"
    ) {

      return (
        `Tag: #${cleanQuery}`
      );

    }


    if (
      searchMode === "categories"
    ) {

      return (
        `Category: ${cleanQuery}`
      );

    }


    const filters: string[] =
      [];


    if (
      advancedQuery.trim()
    ) {

      filters.push(
        `Keyword: "${advancedQuery.trim()}"`
      );

    }


    if (
      categoryId.trim()
    ) {

      filters.push(
        `Category #${categoryId.trim()}`
      );

    }


    if (
      tagId.trim()
    ) {

      filters.push(
        `Tag #${tagId.trim()}`
      );

    }


    if (
      authorId.trim()
    ) {

      filters.push(
        `Author #${authorId.trim()}`
      );

    }


    filters.push(
      sort === "newest"
        ? "Newest first"
        : "Oldest first"
    );


    return (
      filters.join(" · ")
    );

  };


  // ==========================================================
  // EMPTY MESSAGE
  // ==========================================================

  const getEmptyMessage = () => {

    switch (
      searchMode
    ) {

      case "stories":

        return (
          "No stories found."
        );


      case "authors":

        return (
          "No stories found for this author."
        );


      case "tags":

        return (
          "No stories found for this tag."
        );


      case "categories":

        return (
          "No stories found for this category."
        );


      case "advanced":

        return (
          "No stories matched these filters."
        );


      default:

        return (
          "No stories found."
        );

    }

  };


  // ==========================================================
  // SEARCH MODES
  // ==========================================================

  const searchModes: {
    mode: SearchMode;
    label: string;
  }[] = [

    {
      mode: "stories",
      label: "Stories",
    },

    {
      mode: "authors",
      label: "Authors",
    },

    {
      mode: "tags",
      label: "Tags",
    },

    {
      mode: "categories",
      label: "Categories",
    },

    {
      mode: "advanced",
      label: "Advanced",
    },

  ];


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
        max-w-5xl
      ">


        {/* ====================================================
            BACK
        ==================================================== */}

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


        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="
          mt-12
        ">

          <p className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-black/40
          ">

            Mindscape Search

          </p>


          <h1 className="
            mt-5
            text-5xl
            font-semibold
            tracking-[-0.05em]
            md:text-7xl
          ">

            Find stories.

          </h1>


          <p className="
            mt-5
            max-w-2xl
            text-base
            leading-relaxed
            text-black/55
          ">

            {getDescription()}

          </p>

        </div>


        {/* ====================================================
            SEARCH MODES
        ==================================================== */}

        <div className="
          mt-10
          flex
          flex-wrap
          gap-3
        ">

          {
            searchModes.map(
              item => (

                <button
                  key={
                    item.mode
                  }
                  type="button"
                  onClick={() =>
                    handleChangeMode(
                      item.mode
                    )
                  }
                  className={`
                    rounded-full
                    px-5
                    py-2
                    text-sm
                    transition

                    ${
                      searchMode === item.mode
                        ? "bg-black text-white"
                        : "border border-black/20 text-black/60 hover:border-black hover:text-black"
                    }
                  `}
                >

                  {item.label}

                </button>

              )
            )
          }

        </div>


        {/* ====================================================
            NORMAL SEARCH FORM
        ==================================================== */}

        {
          searchMode !== "advanced"
          &&
          <form
            onSubmit={
              handleSearch
            }
            className="
              mt-8
            "
          >

            <div className="
              flex
              flex-col
              gap-4
              sm:flex-row
            ">

              <input
                type="text"
                value={
                  query
                }
                onChange={
                  event => {

                    setQuery(
                      event.target.value
                    );

                    setError(
                      ""
                    );

                  }
                }
                placeholder={
                  getPlaceholder()
                }
                className="
                  flex-1
                  rounded-full
                  border
                  border-black/20
                  bg-transparent
                  px-6
                  py-4
                  text-base
                  outline-none
                  transition
                  placeholder:text-black/30
                  focus:border-black
                "
              />


              <button
                type="submit"
                disabled={
                  loading ||
                  !query.trim()
                }
                className="
                  rounded-full
                  bg-black
                  px-8
                  py-4
                  text-sm
                  text-white
                  transition
                  hover:bg-black/80
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >

                {
                  loading
                    ? "Searching..."
                    : "Search"
                }

              </button>

            </div>

          </form>
        }


        {/* ====================================================
            ADVANCED SEARCH FORM
        ==================================================== */}

        {
          searchMode === "advanced"
          &&
          <form
            onSubmit={
              handleAdvancedSearch
            }
            className="
              mt-8
              rounded-3xl
              border
              border-black/15
              p-6
              md:p-8
            "
          >

            <div className="
              grid
              gap-6
              md:grid-cols-2
            ">


              {/* =================================================
                  KEYWORD
              ================================================= */}

              <div>

                <label
                  htmlFor="advanced-query"
                  className="
                    text-xs
                    uppercase
                    tracking-[0.2em]
                    text-black/40
                  "
                >

                  Keyword

                </label>


                <input
                  id="advanced-query"
                  type="text"
                  value={
                    advancedQuery
                  }
                  onChange={
                    event => {

                      setAdvancedQuery(
                        event.target.value
                      );

                      setError(
                        ""
                      );

                    }
                  }
                  placeholder="Title or content..."
                  className="
                    mt-3
                    w-full
                    rounded-xl
                    border
                    border-black/20
                    bg-transparent
                    px-4
                    py-3
                    outline-none
                    focus:border-black
                  "
                />

              </div>


              {/* =================================================
                  AUTHOR ID
              ================================================= */}

              <div>

                <label
                  htmlFor="author-id"
                  className="
                    text-xs
                    uppercase
                    tracking-[0.2em]
                    text-black/40
                  "
                >

                  Author ID

                </label>


                <input
                  id="author-id"
                  type="number"
                  min="1"
                  value={
                    authorId
                  }
                  onChange={
                    event => {

                      setAuthorId(
                        event.target.value
                      );

                      setError(
                        ""
                      );

                    }
                  }
                  placeholder="Example: 12"
                  className="
                    mt-3
                    w-full
                    rounded-xl
                    border
                    border-black/20
                    bg-transparent
                    px-4
                    py-3
                    outline-none
                    focus:border-black
                  "
                />

              </div>


              {/* =================================================
                  CATEGORY ID
              ================================================= */}

              <div>

                <label
                  htmlFor="category-id"
                  className="
                    text-xs
                    uppercase
                    tracking-[0.2em]
                    text-black/40
                  "
                >

                  Category ID

                </label>


                <input
                  id="category-id"
                  type="number"
                  min="1"
                  value={
                    categoryId
                  }
                  onChange={
                    event => {

                      setCategoryId(
                        event.target.value
                      );

                      setError(
                        ""
                      );

                    }
                  }
                  placeholder="Example: 1"
                  className="
                    mt-3
                    w-full
                    rounded-xl
                    border
                    border-black/20
                    bg-transparent
                    px-4
                    py-3
                    outline-none
                    focus:border-black
                  "
                />

              </div>


              {/* =================================================
                  TAG ID
              ================================================= */}

              <div>

                <label
                  htmlFor="tag-id"
                  className="
                    text-xs
                    uppercase
                    tracking-[0.2em]
                    text-black/40
                  "
                >

                  Tag ID

                </label>


                <input
                  id="tag-id"
                  type="number"
                  min="1"
                  value={
                    tagId
                  }
                  onChange={
                    event => {

                      setTagId(
                        event.target.value
                      );

                      setError(
                        ""
                      );

                    }
                  }
                  placeholder="Example: 1"
                  className="
                    mt-3
                    w-full
                    rounded-xl
                    border
                    border-black/20
                    bg-transparent
                    px-4
                    py-3
                    outline-none
                    focus:border-black
                  "
                />

              </div>


              {/* =================================================
                  SORT
              ================================================= */}

              <div className="
                md:col-span-2
              ">

                <label
                  htmlFor="sort"
                  className="
                    text-xs
                    uppercase
                    tracking-[0.2em]
                    text-black/40
                  "
                >

                  Sort

                </label>


                <select
                  id="sort"
                  value={
                    sort
                  }
                  onChange={
                    event => {

                      const selectedValue =
                        event.target.value;


                      if (
                        selectedValue === "oldest"
                      ) {

                        setSort(
                          "oldest"
                        );

                      } else {

                        setSort(
                          "newest"
                        );

                      }

                    }
                  }
                  className="
                    mt-3
                    w-full
                    rounded-xl
                    border
                    border-black/20
                    bg-transparent
                    px-4
                    py-3
                    outline-none
                    focus:border-black
                  "
                >

                  <option
                    value="newest"
                  >

                    Newest first

                  </option>


                  <option
                    value="oldest"
                  >

                    Oldest first

                  </option>

                </select>

              </div>

            </div>


            {/* =================================================
                ADVANCED BUTTONS
            ================================================= */}

            <div className="
              mt-8
              flex
              flex-wrap
              justify-end
              gap-3
            ">

              <button
                type="button"
                onClick={() => {

                  resetAdvancedForm();

                  setResults(
                    []
                  );

                  setSearched(
                    false
                  );

                  setError(
                    ""
                  );

                }}
                disabled={
                  loading
                }
                className="
                  rounded-full
                  border
                  border-black/25
                  px-6
                  py-3
                  text-sm
                  transition
                  hover:bg-black
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >

                Clear

              </button>


              <button
                type="submit"
                disabled={
                  loading
                }
                className="
                  rounded-full
                  bg-black
                  px-7
                  py-3
                  text-sm
                  text-white
                  transition
                  hover:bg-black/80
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >

                {
                  loading
                    ? "Searching..."
                    : "Advanced Search"
                }

              </button>

            </div>

          </form>
        }


        {/* ====================================================
            ERROR
        ==================================================== */}

        {
          error
          &&
          <p className="
            mt-6
            text-sm
            text-red-600
          ">

            {error}

          </p>
        }


        {/* ====================================================
            RESULTS HEADER
        ==================================================== */}

        {
          searched &&
          !loading &&
          !error
          &&
          <div className="
            mt-14
            flex
            flex-col
            gap-4
            border-b
            border-black
            pb-5
            sm:flex-row
            sm:items-end
            sm:justify-between
          ">

            <div>

              <p className="
                text-xs
                uppercase
                tracking-[0.25em]
                text-black/40
              ">

                Results

              </p>


              <h2 className="
                mt-3
                text-3xl
                font-semibold
                tracking-[-0.03em]
              ">

                {getResultsTitle()}

              </h2>


              <p className="
                mt-2
                text-sm
                text-black/45
              ">

                {getSearchDescription()}

              </p>

            </div>


            <span className="
              text-sm
              text-black/45
            ">

              {results.length}
              {" "}
              {
                results.length === 1
                  ? "story"
                  : "stories"
              }

            </span>

          </div>
        }


        {/* ====================================================
            NO RESULTS
        ==================================================== */}

        {
          searched &&
          !loading &&
          !error &&
          results.length === 0
          &&
          <div className="
            py-16
          ">

            <p className="
              text-black/50
            ">

              {getEmptyMessage()}

            </p>

          </div>
        }


        {/* ====================================================
            RESULTS
        ==================================================== */}

        {
          results.length > 0
          &&
          <div className="
            border-b
            border-black/10
          ">

            {
              results.map(
                post => (

                  <article
                    key={
                      post.id
                    }
                    className="
                      border-b
                      border-black/15
                      py-10
                    "
                  >

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/posts/${post.id}`
                        )
                      }
                      className="
                        block
                        w-full
                        text-left
                      "
                    >

                      {/* META */}

                      <div className="
                        flex
                        flex-wrap
                        items-center
                        gap-4
                        text-xs
                        uppercase
                        tracking-[0.16em]
                        text-black/35
                      ">

                        <span>

                          Story #{post.id}

                        </span>


                        <span>

                          {post.status}

                        </span>


                        <span>

                          {post.reading_time}
                          {" "}
                          min read

                        </span>


                        <span>

                          Author #{post.owner_id}

                        </span>


                        {
                          post.category_id !== null
                          &&
                          <span>

                            Category #{post.category_id}

                          </span>
                        }

                      </div>


                      {/* TITLE */}

                      <h3 className="
                        mt-5
                        text-3xl
                        font-semibold
                        tracking-[-0.04em]
                        transition
                        hover:text-black/60
                      ">

                        {post.title}

                      </h3>


                      {/* CONTENT PREVIEW */}

                      <p className="
                        mt-4
                        max-w-3xl
                        text-base
                        leading-[1.8]
                        text-black/60
                      ">

                        {
                          post.content.length > 220
                            ? `${post.content.slice(
                                0,
                                220
                              )}...`
                            : post.content
                        }

                      </p>


                      {/* TAGS */}

                      {
                        post.tags.length > 0
                        &&
                        <div className="
                          mt-5
                          flex
                          flex-wrap
                          gap-2
                        ">

                          {
                            post.tags.map(
                              tag => (

                                <span
                                  key={
                                    tag.id
                                  }
                                  className="
                                    rounded-full
                                    border
                                    border-black/15
                                    px-3
                                    py-1
                                    text-xs
                                    text-black/50
                                  "
                                >

                                  #{tag.name}

                                </span>

                              )
                            )
                          }

                        </div>
                      }


                      {/* READ */}

                      <p className="
                        mt-6
                        text-sm
                        font-medium
                      ">

                        Read story →

                      </p>

                    </button>

                  </article>

                )
              )
            }

          </div>
        }


      </section>

    </main>

  );

}