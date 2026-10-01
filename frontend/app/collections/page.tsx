"use client";

import {
  FormEvent,
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

type Collection = {
  id: number;
  user_id: number;
  name: string;
  description: string;
  created_at: string;
};


// ============================================================
// COLLECTIONS PAGE
// ============================================================

export default function CollectionsPage() {

  const router =
    useRouter();


  // ==========================================================
  // COLLECTION STATES
  // ==========================================================

  const [collections, setCollections] =
    useState<Collection[]>([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  const [success, setSuccess] =
    useState("");


  // ==========================================================
  // CREATE STATES
  // ==========================================================

  const [name, setName] =
    useState("");


  const [description, setDescription] =
    useState("");


  const [creating, setCreating] =
    useState(false);


  // ==========================================================
  // EDIT STATES
  // ==========================================================

  const [editingCollectionId, setEditingCollectionId] =
    useState<number | null>(null);


  const [editingName, setEditingName] =
    useState("");


  const [editingDescription, setEditingDescription] =
    useState("");


  const [updating, setUpdating] =
    useState(false);


  // ==========================================================
  // DELETE STATE
  // ==========================================================

  const [deletingCollectionId, setDeletingCollectionId] =
    useState<number | null>(null);


  // ==========================================================
  // GET COLLECTIONS
  // ==========================================================

  const getCollections = async () => {

    try {

      setLoading(
        true
      );


      setError(
        ""
      );


      const response =
        await apiFetch(
          "/collections",
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
              "Collections could not be loaded.";


        setError(
          errorMessage
        );


        setCollections(
          []
        );


        return;

      }


      setCollections(
        Array.isArray(data)
          ? data
          : []
      );


    } catch (error) {

      console.error(
        "Collections error:",
        error
      );


      setError(
        "Could not load collections."
      );


      setCollections(
        []
      );


    } finally {

      setLoading(
        false
      );

    }

  };


  // ==========================================================
  // LOAD COLLECTIONS
  // ==========================================================

  useEffect(() => {

    getCollections();

  }, []);


  // ==========================================================
  // CREATE COLLECTION
  // ==========================================================

  const handleCreateCollection = async (
    event:
      FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();


    const cleanName =
      name.trim();


    const cleanDescription =
      description.trim();


    if (!cleanName) {

      setError(
        "Please enter a collection name."
      );


      return;

    }


    try {

      setCreating(
        true
      );


      setError(
        ""
      );


      setSuccess(
        ""
      );


      const response =
        await apiFetch(
          "/collections",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                name:
                  cleanName,

                description:
                  cleanDescription,
              }),
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
              "Collection could not be created.";


        setError(
          errorMessage
        );


        return;

      }


      setName(
        ""
      );


      setDescription(
        ""
      );


      setSuccess(
        "Collection created successfully."
      );


      await getCollections();


    } catch (error) {

      console.error(
        "Create collection error:",
        error
      );


      setError(
        "Could not create collection."
      );


    } finally {

      setCreating(
        false
      );

    }

  };


  // ==========================================================
  // START EDIT
  // ==========================================================

  const handleStartEdit = (
    collection: Collection
  ) => {

    setEditingCollectionId(
      collection.id
    );


    setEditingName(
      collection.name
    );


    setEditingDescription(
      collection.description
    );


    setError(
      ""
    );


    setSuccess(
      ""
    );

  };


  // ==========================================================
  // CANCEL EDIT
  // ==========================================================

  const handleCancelEdit = () => {

    setEditingCollectionId(
      null
    );


    setEditingName(
      ""
    );


    setEditingDescription(
      ""
    );

  };


  // ==========================================================
  // UPDATE COLLECTION
  // ==========================================================

  const handleUpdateCollection = async (
    collectionId: number
  ) => {

    const cleanName =
      editingName.trim();


    const cleanDescription =
      editingDescription.trim();


    if (!cleanName) {

      setError(
        "Collection name cannot be empty."
      );


      return;

    }


    try {

      setUpdating(
        true
      );


      setError(
        ""
      );


      setSuccess(
        ""
      );


      const response =
        await apiFetch(
          `/collections/${collectionId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                name:
                  cleanName,

                description:
                  cleanDescription,
              }),
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
              "Collection could not be updated.";


        setError(
          errorMessage
        );


        return;

      }


      setEditingCollectionId(
        null
      );


      setEditingName(
        ""
      );


      setEditingDescription(
        ""
      );


      setSuccess(
        "Collection updated successfully."
      );


      await getCollections();


    } catch (error) {

      console.error(
        "Update collection error:",
        error
      );


      setError(
        "Could not update collection."
      );


    } finally {

      setUpdating(
        false
      );

    }

  };


  // ==========================================================
  // DELETE COLLECTION
  // ==========================================================

  const handleDeleteCollection = async (
    collectionId: number
  ) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this collection?"
      );


    if (!confirmDelete) {

      return;

    }


    try {

      setDeletingCollectionId(
        collectionId
      );


      setError(
        ""
      );


      setSuccess(
        ""
      );


      const response =
        await apiFetch(
          `/collections/${collectionId}`,
          {
            method: "DELETE",
          }
        );


      if (!response.ok) {

        let errorMessage =
          "Collection could not be deleted.";


        try {

          const data =
            await response.json();


          if (
            typeof data.detail === "string"
          ) {

            errorMessage =
              data.detail;

          }


        } catch {

          // Response body boş olabilir.
        }


        setError(
          errorMessage
        );


        return;

      }


      if (
        editingCollectionId ===
        collectionId
      ) {

        handleCancelEdit();

      }


      setSuccess(
        "Collection deleted successfully."
      );


      await getCollections();


    } catch (error) {

      console.error(
        "Delete collection error:",
        error
      );


      setError(
        "Could not delete collection."
      );


    } finally {

      setDeletingCollectionId(
        null
      );

    }

  };


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

            Mindscape Collections

          </p>


          <h1 className="
            mt-5
            text-5xl
            font-semibold
            tracking-[-0.05em]
            md:text-7xl
          ">

            Your collections.

          </h1>


          <p className="
            mt-5
            max-w-2xl
            text-base
            leading-relaxed
            text-black/55
          ">

            Organize stories into your
            own personal reading collections.

          </p>

        </div>


        {/* ====================================================
            CREATE COLLECTION
        ==================================================== */}

        <form
          onSubmit={
            handleCreateCollection
          }
          className="
            mt-12
            rounded-3xl
            border
            border-black/15
            p-6
            md:p-8
          "
        >

          <p className="
            text-xs
            uppercase
            tracking-[0.25em]
            text-black/40
          ">

            New Collection

          </p>


          <h2 className="
            mt-3
            text-3xl
            font-semibold
            tracking-[-0.03em]
          ">

            Create a collection

          </h2>


          <div className="
            mt-8
            grid
            gap-6
            md:grid-cols-2
          ">


            {/* NAME */}

            <div>

              <label
                htmlFor="collection-name"
                className="
                  text-xs
                  uppercase
                  tracking-[0.2em]
                  text-black/40
                "
              >

                Name

              </label>


              <input
                id="collection-name"
                type="text"
                value={
                  name
                }
                onChange={
                  event => {

                    setName(
                      event.target.value
                    );


                    setError(
                      ""
                    );


                    setSuccess(
                      ""
                    );

                  }
                }
                placeholder="Example: FastAPI"
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
                  transition
                  placeholder:text-black/30
                  focus:border-black
                "
              />

            </div>


            {/* DESCRIPTION */}

            <div>

              <label
                htmlFor="collection-description"
                className="
                  text-xs
                  uppercase
                  tracking-[0.2em]
                  text-black/40
                "
              >

                Description

              </label>


              <input
                id="collection-description"
                type="text"
                value={
                  description
                }
                onChange={
                  event => {

                    setDescription(
                      event.target.value
                    );


                    setError(
                      ""
                    );


                    setSuccess(
                      ""
                    );

                  }
                }
                placeholder="What is this collection about?"
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
                  transition
                  placeholder:text-black/30
                  focus:border-black
                "
              />

            </div>

          </div>


          <div className="
            mt-8
            flex
            justify-end
          ">

            <button
              type="submit"
              disabled={
                creating ||
                !name.trim()
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
                creating
                  ? "Creating..."
                  : "Create Collection"
              }

            </button>

          </div>

        </form>


        {/* ====================================================
            MESSAGES
        ==================================================== */}

        {
          error
          &&
          <div className="
            mt-6
            rounded-xl
            border
            border-red-600/20
            bg-red-50
            px-5
            py-4
            text-sm
            text-red-700
          ">

            {error}

          </div>
        }


        {
          success
          &&
          <div className="
            mt-6
            rounded-xl
            border
            border-green-700/20
            bg-green-50
            px-5
            py-4
            text-sm
            text-green-700
          ">

            {success}

          </div>
        }


        {/* ====================================================
            COLLECTION HEADER
        ==================================================== */}

        <div className="
          mt-16
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

              Library

            </p>


            <h2 className="
              mt-3
              text-3xl
              font-semibold
              tracking-[-0.03em]
            ">

              My collections

            </h2>

          </div>


          <span className="
            text-sm
            text-black/45
          ">

            {collections.length}
            {" "}

            {
              collections.length === 1
                ? "collection"
                : "collections"
            }

          </span>

        </div>


        {/* ====================================================
            LOADING
        ==================================================== */}

        {
          loading
          &&
          <p className="
            py-12
            text-sm
            text-black/50
          ">

            Loading collections...

          </p>
        }


        {/* ====================================================
            EMPTY
        ==================================================== */}

        {
          !loading &&
          collections.length === 0
          &&
          <div className="
            py-16
          ">

            <p className="
              text-black/50
            ">

              You do not have any collections yet.

            </p>

          </div>
        }


        {/* ====================================================
            COLLECTIONS
        ==================================================== */}

        {
          !loading &&
          collections.length > 0
          &&
          <div className="
            border-b
            border-black/10
          ">

            {
              collections.map(
                collection => (

                  <article
                    key={
                      collection.id
                    }
                    className="
                      border-b
                      border-black/15
                      py-10
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

                        Collection #{collection.id}

                      </span>


                      <span>

                        Owner #{collection.user_id}

                      </span>


                      <span>

                        {
                          new Date(
                            collection.created_at
                          ).toLocaleDateString()
                        }

                      </span>

                    </div>


                    {/* ==================================================
                        EDIT MODE
                    ================================================== */}

                    {
                      editingCollectionId ===
                      collection.id

                      ?

                      <div className="
                        mt-6
                        rounded-2xl
                        border
                        border-black/15
                        p-6
                      ">

                        <div className="
                          grid
                          gap-5
                          md:grid-cols-2
                        ">


                          {/* EDIT NAME */}

                          <div>

                            <label
                              htmlFor={`edit-name-${collection.id}`}
                              className="
                                text-xs
                                uppercase
                                tracking-[0.2em]
                                text-black/40
                              "
                            >

                              Name

                            </label>


                            <input
                              id={`edit-name-${collection.id}`}
                              type="text"
                              value={
                                editingName
                              }
                              onChange={
                                event => {

                                  setEditingName(
                                    event.target.value
                                  );


                                  setError(
                                    ""
                                  );

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
                            />

                          </div>


                          {/* EDIT DESCRIPTION */}

                          <div>

                            <label
                              htmlFor={`edit-description-${collection.id}`}
                              className="
                                text-xs
                                uppercase
                                tracking-[0.2em]
                                text-black/40
                              "
                            >

                              Description

                            </label>


                            <input
                              id={`edit-description-${collection.id}`}
                              type="text"
                              value={
                                editingDescription
                              }
                              onChange={
                                event => {

                                  setEditingDescription(
                                    event.target.value
                                  );


                                  setError(
                                    ""
                                  );

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
                            />

                          </div>

                        </div>


                        {/* EDIT BUTTONS */}

                        <div className="
                          mt-6
                          flex
                          flex-wrap
                          gap-3
                        ">

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateCollection(
                                collection.id
                              )
                            }
                            disabled={
                              updating ||
                              !editingName.trim()
                            }
                            className="
                              rounded-full
                              bg-black
                              px-5
                              py-2
                              text-sm
                              text-white
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                            "
                          >

                            {
                              updating
                                ? "Saving..."
                                : "Save"
                            }

                          </button>


                          <button
                            type="button"
                            onClick={
                              handleCancelEdit
                            }
                            disabled={
                              updating
                            }
                            className="
                              rounded-full
                              border
                              border-black/30
                              px-5
                              py-2
                              text-sm
                              transition
                              hover:bg-black
                              hover:text-white
                              disabled:opacity-40
                            "
                          >

                            Cancel

                          </button>

                        </div>

                      </div>


                      :


                      /* ==================================================
                          NORMAL MODE
                      ================================================== */

                      <>

                        <h3 className="
                          mt-5
                          text-3xl
                          font-semibold
                          tracking-[-0.04em]
                        ">

                          {collection.name}

                        </h3>


                        <p className="
                          mt-4
                          max-w-3xl
                          text-base
                          leading-[1.8]
                          text-black/60
                        ">

                          {
                            collection.description ||
                            "No description."
                          }

                        </p>


                        {/* ACTIONS */}

                        <div className="
                          mt-6
                          flex
                          flex-wrap
                          gap-3
                        ">

                          <button
                            type="button"
                            onClick={() =>
                              handleStartEdit(
                                collection
                              )
                            }
                            className="
                              rounded-full
                              border
                              border-black/30
                              px-5
                              py-2
                              text-sm
                              transition
                              hover:bg-black
                              hover:text-white
                            "
                          >

                            Edit

                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteCollection(
                                collection.id
                              )
                            }
                            disabled={
                              deletingCollectionId ===
                              collection.id
                            }
                            className="
                              rounded-full
                              border
                              border-red-600/40
                              px-5
                              py-2
                              text-sm
                              text-red-700
                              transition
                              hover:bg-red-600
                              hover:text-white
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                            "
                          >

                            {
                              deletingCollectionId ===
                              collection.id

                                ? "Deleting..."

                                : "Delete"
                            }

                          </button>

                        </div>

                      </>

                    }

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