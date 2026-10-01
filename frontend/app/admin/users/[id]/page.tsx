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

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
};


// =====================================================
// USER DETAIL PAGE
// =====================================================

export default function AdminUserDetailPage() {


  const params =
    useParams();


  const router =
    useRouter();


  const userId =
    params.id as string;



  const [user, setUser] =
    useState<User | null>(null);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");



  const [deleting, setDeleting] =
    useState(false);



  const [selectedRole, setSelectedRole] =
    useState("");



  const [updatingRole, setUpdatingRole] =
    useState(false);



  const [roleMessage, setRoleMessage] =
    useState("");




// ===================================================
// GET USER DETAIL
// ===================================================

const getUser = async () => {


  try {


    setLoading(true);

    setError("");



    const response =
      await apiFetch(
        `/admin/users/${userId}`,
        {
          method:"GET",
        }
      );



    const data =
      await response.json();



    if(!response.ok){


      setError(
        data.detail ||
        "User could not be found."
      );


      return;

    }



    setUser(
      data
    );


    setSelectedRole(
      data.role
    );



  }
  catch(error){


    console.error(
      "User detail error:",
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





// ===================================================
// LOAD USER
// ===================================================

useEffect(() => {


  if(userId){

    getUser();

  }


}, [userId]);





// ===================================================
// UPDATE ROLE
// ===================================================

const handleUpdateRole = async () => {


  try {


    setUpdatingRole(true);

    setRoleMessage("");



    const response =
      await apiFetch(
        `/admin/users/${userId}/role`,
        {
          method:"PUT",

          headers:{
            "Content-Type":
              "application/json",
          },


          body:
            JSON.stringify({
              role:selectedRole,
            }),

        }
      );



    const data =
      await response.json();




    if(!response.ok){


      setRoleMessage(
        data.detail ||
        "Role could not be updated."
      );


      return;

    }



    setUser(
      {
        ...user!,
        role:selectedRole,
      }
    );



    setRoleMessage(
      "Role updated successfully."
    );



  }
  catch(error){


    console.error(
      "Update role error:",
      error
    );


    setRoleMessage(
      "Something went wrong."
    );


  }
  finally{


    setUpdatingRole(false);


  }


};





// ===================================================
// DELETE USER
// ===================================================

const handleDeleteUser = async () => {


  const confirmDelete =
    window.confirm(
      "Are you sure you want to delete this user?"
    );



  if(!confirmDelete){

    return;

  }



  try {


    setDeleting(true);



    const response =
      await apiFetch(
        `/admin/users/${userId}`,
        {
          method:"DELETE",
        }
      );



    if(!response.ok){


      const data =
        await response.json();


      setError(
        data.detail ||
        "User could not be deleted."
      );


      return;

    }



    alert(
      "User deleted successfully."
    );



    router.push(
      "/admin"
    );



  }
  catch(error){


    console.error(
      "Delete error:",
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

      Loading user...

    </main>

  );

}





// ===================================================
// ERROR
// ===================================================

if(error && !user){

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





if(!user){

  return null;

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
      max-w-3xl
    ">



      <button
        onClick={() =>
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

        User Detail

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

              {user.id}

            </p>

          </div>





          <div>

            <p className="
              text-sm
              text-black/40
            ">

              Username

            </p>


            <p className="
              mt-1
              text-lg
            ">

              {user.username}

            </p>

          </div>





          <div>

            <p className="
              text-sm
              text-black/40
            ">

              Email

            </p>


            <p className="
              mt-1
              text-lg
            ">

              {user.email}

            </p>

          </div>





          <div>

            <p className="
              mb-3
              text-sm
              text-black/40
            ">

              Role

            </p>



            <div className="
              flex
              items-center
              gap-4
            ">


              <select
                value={
                  selectedRole
                }
                onChange={
                  e =>
                    setSelectedRole(
                      e.target.value
                    )
                }
                className="
                  rounded-lg
                  border
                  border-black/20
                  bg-transparent
                  px-4
                  py-2
                "
              >

                <option value="user">

                  user

                </option>


                <option value="admin">

                  admin

                </option>


              </select>




              <button
                onClick={
                  handleUpdateRole
                }
                disabled={
                  updatingRole
                }
                className="
                  rounded-full
                  bg-black
                  px-5
                  py-2
                  text-sm
                  text-white
                  disabled:opacity-40
                "
              >

                {
                  updatingRole
                  ?
                  "Updating..."
                  :
                  "Update Role"
                }

              </button>


            </div>




            {
              roleMessage
              &&
              <p className="
                mt-4
                text-sm
                text-green-700
              ">

                {roleMessage}

              </p>
            }


          </div>




        </div>





        <button
          onClick={
            handleDeleteUser
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
            "Delete User"
          }


        </button>




      </div>




    </section>




  </main>

);
}