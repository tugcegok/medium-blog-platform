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


// =====================================================
// TYPES
// =====================================================

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
};


// =====================================================
// ADMIN USERS PAGE
// =====================================================

export default function AdminPage() {


  const router =
    useRouter();



  const [users, setUsers] =
    useState<User[]>([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");



  // ===================================================
  // GET ALL USERS
  // ===================================================

  const getUsers = async () => {

    try {

      setLoading(true);

      setError("");


      const response =
        await apiFetch(
          "/admin/users",
          {
            method: "GET",
          }
        );


      const data =
        await response.json();



      if (!response.ok) {

        setError(
          data.detail ||
          "Users could not be loaded."
        );

        return;

      }


      setUsers(
        data
      );


    } catch (error) {

      console.error(
        "Admin users error:",
        error
      );


      setError(
        "Something went wrong."
      );


    } finally {

      setLoading(false);

    }

  };



  // ===================================================
  // LOAD
  // ===================================================

  useEffect(() => {

    getUsers();

  }, []);




  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (

      <main className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-[#f5f1e8]
        text-black
      ">

        Loading users...

      </main>

    );

  }



  // ===================================================
  // ERROR
  // ===================================================

  if (error) {

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




  // ===================================================
  // PAGE
  // ===================================================

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


        <h1 className="
          text-5xl
          font-semibold
        ">

          Admin Panel

        </h1>


        <p className="
          mt-3
          text-black/50
        ">

          User Management

        </p>




        <div className="
          mt-10
          overflow-hidden
          rounded-2xl
          border
          border-black/10
        ">


          {
            users.map(
              user => (

                <div
                  key={
                    user.id
                  }

                  onClick={() =>
                    router.push(
                      `/admin/users/${user.id}`
                    )
                  }

                  className="
                    flex
                    flex-col
                    gap-2
                    border-b
                    border-black/10
                    p-6
                    cursor-pointer
                    transition
                    hover:bg-black/5
                    md:flex-row
                    md:items-center
                    md:justify-between
                  "
                >


                  <div>

                    <h2 className="
                      text-lg
                      font-medium
                    ">

                      {user.username}

                    </h2>


                    <p className="
                      text-sm
                      text-black/50
                    ">

                      {user.email}

                    </p>


                  </div>



                  <div className="
                    flex
                    gap-4
                    text-sm
                  ">


                    <span>

                      ID:
                      {" "}
                      {user.id}

                    </span>



                    <span className="
                      rounded-full
                      bg-black
                      px-4
                      py-2
                      text-white
                    ">

                      {user.role}

                    </span>


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